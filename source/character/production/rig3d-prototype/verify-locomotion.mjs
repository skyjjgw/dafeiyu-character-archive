import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from './vendor/three.module.js';
import { createCharacter } from './character.js';
import { createLocomotion } from './locomotion.js';
import { defaultTuning } from './tuning.js';

// CPU/WASM integration checks against the actual forty-bone model. These test
// ground/IK numerics, not appearance, physical balance or production animation.
const checks = [], resources = [];
const measured = {
  maxLengthError: 0, maxSolePenetration: 0, maxStanceAnchorError: 0,
  maxUnreachable: 0, maxSoleFrameMovement60Hz: 0, maxShoeVertexPenetration: 0,
  maxRootGroundDeviation: 0, maximumRootTravel: 0, swingHeight: 0,
  stanceSamples: 0, swingSamples: 0, sampledShoeVertices: 0,
};
function check(name, fn) {
  try { fn(); checks.push({ name, pass: true }); }
  catch (error) { checks.push({ name, pass: false, message: error.message }); }
}
const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));
const snapshot = info => JSON.parse(JSON.stringify(info));
const v = new THREE.Vector3();
let elapsed = 0;
const rig = createCharacter({ ...defaultTuning }); resources.push(rig);
const motor = await createLocomotion(rig); resources.push(motor);
const groundRootY = motor.debugInfo.rootPosition[1];
let previousFeet, previousStances;
const shoeSamples = [];
const p = rig.body.geometry.attributes.position;
const ids = rig.body.geometry.attributes.skinIndex, weights = rig.body.geometry.attributes.skinWeight;
const ankleIds = new Set(['R.Ankle', 'L.Ankle'].map(name => rig.skeleton.bones.findIndex(bone => bone.name === name)));
for (let i = 0; i < p.count; i++) {
  let amount = 0;
  for (let j = 0; j < 4; j++) if (ankleIds.has(ids.array[i * 4 + j])) amount += weights.array[i * 4 + j];
  if (amount >= .98) shoeSamples.push(i);
}
function measure({ vertices = false, jumps = true } = {}) {
  const d = motor.debugInfo;
  assert.ok(d.finite, 'All reported positions must be finite');
  measured.maxLengthError = Math.max(measured.maxLengthError, d.maxLengthError);
  measured.maxSolePenetration = Math.max(measured.maxSolePenetration, d.maxSolePenetration);
  measured.maxStanceAnchorError = Math.max(measured.maxStanceAnchorError, d.maxStanceSlip);
  measured.maxUnreachable = Math.max(measured.maxUnreachable, ...d.legs.map(leg => leg.unreachable));
  measured.maximumRootTravel = Math.max(measured.maximumRootTravel, Math.hypot(d.rootPosition[0], d.rootPosition[2]));
  measured.maxRootGroundDeviation = Math.max(measured.maxRootGroundDeviation, Math.abs(d.rootPosition[1] - groundRootY));
  for (let i = 0; i < d.legs.length; i++) {
    const leg = d.legs[i];
    if (leg.swing) { measured.swingSamples++; measured.swingHeight = Math.max(measured.swingHeight, leg.sole[1]); }
    else {
      measured.stanceSamples++;
      // Consecutive stance frames must retain the SAME world anchor. Landing
      // and lift frames are excluded; this is independent of reported IK error.
      if (previousStances?.[i] && !previousFeet?.[i]?.swing) {
        assert.ok(distance(leg.anchor, previousStances[i]) < 1e-7, 'World stance anchor must not slide');
      }
    }
    if (jumps && previousFeet) measured.maxSoleFrameMovement60Hz = Math.max(measured.maxSoleFrameMovement60Hz, distance(leg.sole, previousFeet[i].sole));
  }
  previousStances = d.legs.map(leg => leg.swing ? null : [...leg.anchor]);
  previousFeet = d.legs.map(leg => ({ sole: [...leg.sole], swing: leg.swing }));
  if (vertices) {
    for (const index of shoeSamples) {
      v.fromBufferAttribute(p, index); rig.body.applyBoneTransform(index, v); v.applyMatrix4(rig.body.matrixWorld);
      assert.ok(Number.isFinite(v.y));
      measured.maxShoeVertexPenetration = Math.max(measured.maxShoeVertexPenetration, -v.y);
    }
    measured.sampledShoeVertices += shoeSamples.length;
  }
}
function run(action, frames, dt = 1 / 60, options = {}) {
  rig.setAction(action);
  for (let i = 0; i < frames; i++) {
    elapsed += dt; rig.update(dt, elapsed, { action }); motor.update(dt, { action });
    measure({ vertices: options.vertices && i % 30 === 0, jumps: dt === 1 / 60 });
  }
}
function clearHistory() { previousFeet = undefined; previousStances = undefined; }

try {
  check('Real Rapier WASM world: gravity, two rigid bodies, one floor and one capsule', () => {
    assert.equal(motor.world.bodies.len(), 2); assert.equal(motor.world.colliders.len(), 2);
    assert.deepEqual(motor.debugInfo.gravity, [0, -9.81, 0]); assert.ok(motor.controller);
    assert.ok(Math.abs(motor.world.timestep - 1 / 120) < 1e-9);
  });
  check('Bind-derived legs and shoe offsets initialize at floor, with fixed lengths', () => {
    assert.equal(motor.debugInfo.legs.length, 2);
    for (const leg of motor.debugInfo.legs) { assert.ok(leg.length1 > .2 && leg.length2 > .2); assert.ok(Math.abs(leg.sole[1]) < 1e-6); }
    assert.ok(shoeSamples.length > 100);
  });
  const idleStart = [...motor.debugInfo.rootPosition];
  run('idle', 180, 1 / 60, { vertices: true });
  check('Idle remains grounded without horizontal drift', () => {
    assert.ok(motor.debugInfo.grounded); assert.ok(distance(idleStart, motor.debugInfo.rootPosition) < .001);
  });
  const start = [...motor.debugInfo.rootPosition];
  run('walk', 120, 1 / 60, { vertices: true });
  check('Walking actually translates forward and follows a radius .50 path', () => {
    const pos = motor.debugInfo.rootPosition;
    assert.ok(pos[2] - start[2] > .20);
    assert.ok(Math.abs(Math.hypot(pos[0] - (start[0] + .5), pos[2] - start[2]) - .5) < .001);
    assert.ok(Math.abs(motor.debugInfo.heading - .56) < .002);
  });
  run('walk', 1380, 1 / 60, { vertices: true });
  check('Long walk stays on a small circle and exercises both stance and swing', () => {
    const pos = motor.debugInfo.rootPosition;
    assert.ok(Math.abs(Math.hypot(pos[0] - (start[0] + .5), pos[2] - start[2]) - .5) < .001);
    assert.ok(measured.stanceSamples > 1000 && measured.swingSamples > 100);
    assert.ok(measured.swingHeight > .055 && measured.swingHeight < .08);
  });
  const stop = [...motor.debugInfo.rootPosition];
  run('idle', 120, 1 / 60, { vertices: true });
  check('Walk-to-idle finishes the airborne step and holds both soles on floor', () => {
    assert.ok(distance(stop, motor.debugInfo.rootPosition) < .001);
    assert.ok(motor.debugInfo.legs.every(leg => !leg.swing && Math.abs(leg.sole[1]) < 1e-5));
  });
  const turnStart = motor.debugInfo.heading, turnPosition = [...motor.debugInfo.rootPosition];
  run('turn', 300, 1 / 60, { vertices: true });
  check('Authored four-second turn completes a full revolution without Euler branch reversal', () => {
    assert.ok(Math.abs(motor.debugInfo.heading - turnStart - Math.PI * 2) < .003);
    assert.ok(distance(turnPosition, motor.debugInfo.rootPosition) < .001);
    assert.ok(motor.debugInfo.legs.every(leg => !leg.swing && Math.abs(leg.sole[1]) < 1e-5));
  });
  run('wave', 120, 1 / 60, { vertices: true });
  check('Wave retains grounded position and feet', () => {
    assert.ok(motor.debugInfo.grounded); assert.ok(distance(turnPosition, motor.debugInfo.rootPosition) < .001);
  });
  run('turn', 90); const interruptedHeading = motor.debugInfo.heading;
  run('idle', 120, 1 / 60, { vertices: true });
  check('Interrupted turn settles feet without a heading snap or floating stance', () => {
    assert.ok(Math.abs(motor.debugInfo.heading - interruptedHeading) < 1e-7);
    assert.ok(motor.debugInfo.legs.every(leg => !leg.swing && Math.abs(leg.sole[1]) < 1e-5));
  });
  check('Analytic IK preserves both links, rather than stretching unreachable legs', () => assert.ok(measured.maxLengthError < 1e-7));
  check('All sampled stance targets remain reachable', () => assert.ok(measured.maxUnreachable < .001));
  check('Sole points and actual ankle-weighted shoe vertices do not penetrate floor', () => {
    assert.ok(measured.maxSolePenetration < 1e-5); assert.ok(measured.maxShoeVertexPenetration < 1e-5);
  });
  check('Support feet do not slide relative to their locked world anchors', () => assert.ok(measured.maxStanceAnchorError < 1e-5));
  check('Walking and turning have continuous foot trajectories at 60Hz', () => assert.ok(measured.maxSoleFrameMovement60Hz < .04));

  const paused = snapshot(motor.debugInfo), beforeBones = rig.skeleton.bones.map(b => [...b.position.toArray(), ...b.quaternion.toArray()]);
  motor.update(1, { action: 'walk', paused: true });
  check('Pause is a strict no-op', () => {
    assert.deepEqual(motor.debugInfo, paused);
    assert.deepEqual(rig.skeleton.bones.map(b => [...b.position.toArray(), ...b.quaternion.toArray()]), beforeBones);
  });
  clearHistory(); motor.reset();
  check('Reset returns to the original stage center and forward, on floor', () => {
    assert.ok(Math.abs(motor.debugInfo.rootPosition[0]) < 1e-7 && Math.abs(motor.debugInfo.rootPosition[2]) < 1e-7);
    assert.equal(motor.debugInfo.heading, 0); assert.ok(motor.debugInfo.legs.every(l => Math.abs(l.sole[1]) < 1e-6));
  });
  const pelvisY = rig.skeleton.bones.find(b => b.name === 'Pelvis').position.y;
  for (let i = 0; i < 60; i++) motor.update(0, { action: 'idle' });
  check('Zero-substep updates do not accumulate pelvis crouching', () => assert.ok(Math.abs(rig.skeleton.bones.find(b => b.name === 'Pelvis').position.y - pelvisY) < 1e-8));
  const simBefore = motor.debugInfo.totalSimulatedSeconds;
  rig.update(2, elapsed, { action: 'walk' }); motor.update(2, { action: 'walk' });
  check('Long frames are bounded to eight 1/120-second physics steps', () => {
    assert.equal(motor.debugInfo.substeps, 8); assert.ok(motor.debugInfo.droppedSeconds > 1.9);
    assert.ok(motor.debugInfo.totalSimulatedSeconds - simBefore < .067); assert.ok(motor.debugInfo.finite);
  });
  clearHistory(); motor.reset();
  const endpoint = [];
  for (const fps of [30, 60, 120, 240]) {
    clearHistory(); motor.reset(); run('walk', fps * 2, 1 / fps);
    endpoint.push({ fps, position: [...motor.debugInfo.rootPosition], heading: motor.debugInfo.heading });
  }
  check('30/60/120/240Hz walking produces the same path and heading', () => {
    for (const end of endpoint) { assert.ok(distance(end.position, endpoint[0].position) < .001); assert.ok(Math.abs(end.heading - endpoint[0].heading) < 1e-6); }
  });
  clearHistory(); motor.reset(); rig.update(1 / 240, elapsed, { action: 'turn' }); motor.update(1 / 240, { action: 'turn' });
  check('Turn no-substep path still applies finite yaw and grounded IK', () => { assert.equal(motor.debugInfo.substeps, 0); assert.ok(motor.debugInfo.finite); assert.ok(motor.debugInfo.maxSolePenetration < 1e-5); });

  for (const bodyScale of [.68, .74, 1]) {
    const otherRig = createCharacter({ ...defaultTuning, bodyScale }); resources.push(otherRig);
    const other = await createLocomotion(otherRig); resources.push(other);
    for (let i = 0; i < 90; i++) { otherRig.update(1 / 60, i / 60, { action: 'walk' }); other.update(1 / 60, { action: 'walk' }); }
    check(`Bind-derived IK supports bodyScale=${bodyScale}`, () => {
      assert.ok(other.debugInfo.finite && other.debugInfo.grounded); assert.ok(other.debugInfo.maxLengthError < 1e-7);
      assert.ok(other.debugInfo.maxAnkleTargetError < 1e-5 && other.debugInfo.maxSolePenetration < 1e-5);
    });
  }
  const parent = new THREE.Group(); parent.position.set(2, 0, 1); parent.rotation.y = .4; parent.scale.setScalar(1.2);
  const parentRig = createCharacter({ ...defaultTuning }); resources.push(parentRig); parent.add(parentRig.root); parent.updateMatrixWorld(true);
  const parentMotor = await createLocomotion(parentRig); resources.push(parentMotor);
  for (let i = 0; i < 90; i++) { parentRig.update(1 / 60, i / 60, { action: 'walk' }); parentMotor.update(1 / 60, { action: 'walk' }); }
  check('Upright translated/yaw-rotated uniformly-scaled parent has valid world-space IK', () => {
    assert.ok(parentMotor.debugInfo.finite && parentMotor.debugInfo.grounded);
    assert.ok(parentMotor.debugInfo.maxAnkleTargetError < 1e-5 && parentMotor.debugInfo.maxLengthError < 1e-7);
  });
  const parentTurnStart = parentMotor.debugInfo.heading;
  parentRig.setAction('turn');
  for (let i = 0; i < 300; i++) { parentRig.update(1 / 60, i / 60, { action: 'turn' }); parentMotor.update(1 / 60, { action: 'turn' }); }
  check('Authored turns do not include the parent yaw as an extra first-frame rotation', () => {
    assert.ok(Math.abs(parentMotor.debugInfo.heading - parentTurnStart - Math.PI * 2) < .003);
    assert.ok(parentMotor.debugInfo.maxAnkleTargetError < 1e-5);
  });
  motor.dispose(); const afterDispose = snapshot(motor.debugInfo); motor.update(1 / 60, { action: 'walk' }); motor.reset(); motor.dispose();
  check('Dispose frees the Rapier world and subsequent calls are no-ops', () => { assert.equal(motor.debugInfo.disposed, true); assert.deepEqual(motor.debugInfo, afterDispose); });
} finally {
  for (const item of resources.reverse()) item.dispose();
}
const file = new URL('./locomotion.js', import.meta.url);
const report = {
  createdAt: new Date().toISOString(), source: 'locomotion.js', sourceSHA256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
  result: checks.every(c => c.pass) ? 'pass' : 'fail', tuning: defaultTuning, checks, measured,
  scope: 'Actual model + Rapier WASM, CPU numerical checks. Not visual approval or proof of whole-body dynamics.',
};
fs.writeFileSync(new URL('./locomotion-verification.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
for (const c of checks) console.log(`${c.pass ? 'PASS' : 'FAIL'} ${c.name}${c.message ? ': ' + c.message : ''}`);
console.log(`${checks.filter(c => c.pass).length}/${checks.length} passed`, JSON.stringify(measured));
if (report.result !== 'pass') process.exitCode = 1;
