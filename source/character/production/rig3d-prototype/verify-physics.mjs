import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from './vendor/three.module.js';
import { createCharacter } from './character.js';
import { createSecondaryPhysics } from './physics.js';

// Independent CPU checks. No DOM/renderer/network and no report-file writes.
const checks = [], resources = [];
const record = (name, details = {}) => checks.push({ name, passed: true, ...details });
const zeroGravity = { gravity: [0, 0, 0] };
const finite = values => Array.from(values).every(Number.isFinite);
const geometryHash = geometry => {
  const hash = crypto.createHash('sha256');
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    hash.update(name); hash.update(Buffer.from(attribute.array.buffer, attribute.array.byteOffset, attribute.array.byteLength));
  }
  return hash.digest('hex');
};
function make() { const rig = createCharacter(); resources.push(rig); return rig; }
function pose(bone) { return [...bone.position, ...bone.quaternion, ...bone.scale]; }
function kinematicPose(rig) {
  return rig.skeleton.bones.filter(bone => !/^(Hair\.|Tail\.)/.test(bone.name)).map(bone => [bone, pose(bone)]);
}
function assertKinematics(before) { for (const [bone, values] of before) assert.deepEqual(pose(bone), values, `physics changed human bone ${bone.name}`); }
function assertState(physics) {
  const info = physics.debugInfo;
  assert.equal(info.finite, true);
  assert.ok(info.substeps <= info.maxSubsteps);
  assert.ok(info.simulatedSeconds <= .05 + 1e-12);
  assert.ok(info.maxLengthError < 1e-8, `length error ${info.maxLengthError}`);
  for (const chain of info.chains) for (const segment of chain.segments) {
    assert.ok(finite(segment.head) && finite(segment.tip));
    assert.ok(segment.deflectionRadians <= chain.coefficients.maxAngle + 1e-7 || info.lastResetReason === 'nonuniform-ancestor-scale');
  }
}
function assertSkinFinite(rig) {
  rig.root.updateMatrixWorld(true); rig.skeleton.update();
  assert.ok(finite(rig.skeleton.boneMatrices));
  const position = rig.body.geometry.attributes.position, point = new THREE.Vector3();
  for (let i = 0; i < position.count; i += Math.max(1, Math.floor(position.count / 96))) {
    rig.body.getVertexPosition(i, point); assert.ok(finite(point.toArray()));
  }
}
const tips = physics => physics.debugInfo.chains.flatMap(chain => chain.segments.map(segment => segment.tip));
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const maximumTipDistance = (a, b) => Math.max(...a.map((point, i) => distance(point, b[i])));

try {
  const rig = make(), originalGeometry = geometryHash(rig.body.geometry);
  const physics = createSecondaryPhysics({ ...rig, colliders: [] }); resources.push(physics);
  assert.equal(physics.debugInfo.chainCount, 7);
  assert.equal(physics.debugInfo.simulatedBoneCount, 23);
  const originalTips = tips(physics).map(point => [...point]);
  const originalHumanPose = kinematicPose(rig);
  for (let i = 0; i < 240; i++) { physics.update(1 / 120, zeroGravity); assertState(physics); }
  assert.ok(maximumTipDistance(tips(physics), originalTips) < 1e-8);
  assertKinematics(originalHumanPose);
  record('7 chains / 23 owned bones; zero-force rest does not invent motion', { maximum_rest_tip_drift: maximumTipDistance(tips(physics), originalTips) });

  let peak = 0;
  for (let i = 1; i <= 180; i++) {
    const time = i / 60;
    rig.root.position.x = .3 * Math.min(time, .5);
    physics.update(1 / 60, zeroGravity); assertState(physics);
    peak = Math.max(peak, physics.debugInfo.maxDeflectionRadians);
    if (i % 20 === 0) assertSkinFinite(rig);
  }
  assert.ok(peak > .005, `missing inertial response: ${peak}`);
  assert.ok(physics.debugInfo.maxDeflectionRadians < peak * .15 + .002, 'motion does not settle after root stops');
  record('root movement produces inertia which damps after the root stops', { peak_deflection_radians: peak, settled_deflection_radians: physics.debugInfo.maxDeflectionRadians });

  const beforeGravity = tips(physics).map(point => [...point]);
  for (let i = 0; i < 120; i++) { physics.update(1 / 120); assertState(physics); }
  const gravityDisplacement = maximumTipDistance(tips(physics), beforeGravity);
  assert.ok(gravityDisplacement > .0001);
  record('gravity has a measurable effect with a stationary root', { maximum_tip_change: gravityDisplacement });

  rig.root.position.set(.2, .1, -.2); rig.root.rotation.set(.12, .4, .06);
  physics.update(0, { ...zeroGravity, hairSway: 0, tailSway: 0 });
  assert.ok(physics.debugInfo.maxDeflectionRadians < 1e-7);
  for (let i = 0; i < 12; i++) physics.update(1 / 60, { ...zeroGravity, hairSway: 0, tailSway: 0 });
  assert.ok(physics.debugInfo.maxDeflectionRadians < 1e-7);
  assertState(physics); assertKinematics(originalHumanPose); assertSkinFinite(rig);
  record('zero strength restores local rest under translated/rotated ancestors');
  physics.dispose();

  // Animation + root turning exercises parent/world conversion while the
  // existing body driver is active. Physics must not touch any human bone.
  rig.root.position.set(0, 0, 0); rig.root.rotation.set(0, 0, 0);
  const animated = createSecondaryPhysics({ ...rig }); resources.push(animated);
  let maximumPenetration = 0, maximumTailDeflection = 0;
  for (let i = 1; i <= 240; i++) {
    const time = i / 60;
    rig.update(1 / 60, time, { action: i < 120 ? 'walk' : 'turn' });
    const before = kinematicPose(rig);
    animated.update(1 / 60, { hairSway: 1.8, tailSway: 1.8 });
    assertKinematics(before); assertState(animated);
    maximumPenetration = Math.max(maximumPenetration, animated.debugInfo.maxPenetration);
    maximumTailDeflection = Math.max(maximumTailDeflection, ...animated.debugInfo.chains.find(chain => chain.kind === 'tail').segments.map(segment => segment.deflectionRadians));
    if (i % 20 === 0) assertSkinFinite(rig);
  }
  assert.ok(maximumTailDeflection <= .126 + 1e-7);
  assert.ok(maximumPenetration < 1e-5, `default collider penetration ${maximumPenetration}`);
  assert.equal(geometryHash(rig.body.geometry), originalGeometry);
  record('walking/turning ancestors keep skin finite, human bones untouched and tail bends bounded', { maximum_tail_deflection_radians: maximumTailDeflection, maximum_default_tip_penetration: maximumPenetration });
  animated.dispose();

  function collisionTest(type) {
    const colliderRig = make();
    colliderRig.root.updateMatrixWorld(true);
    const initial = colliderRig.skeleton.bones.find(bone => bone.name === 'Hair.-1.0.Mid').getWorldPosition(new THREE.Vector3());
    const center = initial.clone().add(new THREE.Vector3(.045, 0, 0));
    const collider = type === 'sphere'
      ? { type, center: center.toArray(), radius: .08, groups: ['hair'] }
      : { type, start: center.clone().add(new THREE.Vector3(0, -.06, 0)).toArray(), end: center.clone().add(new THREE.Vector3(0, .06, 0)).toArray(), radius: .07, groups: ['hair'] };
    const simulation = createSecondaryPhysics({ ...colliderRig, colliders: [collider] }); resources.push(simulation);
    const initialPenetration = simulation.debugInfo.maxPenetration;
    assert.ok(initialPenetration > .03);
    for (let i = 0; i < 90; i++) { simulation.update(1 / 120, zeroGravity); assertState(simulation); }
    assert.ok(simulation.debugInfo.maxPenetration < 1e-5, `${type} penetration ${simulation.debugInfo.maxPenetration}`);
    assertSkinFinite(colliderRig);
    record(`${type} collider resolves a deliberately intersecting hair tip without stretching`, { initial_penetration: initialPenetration, final_penetration: simulation.debugInfo.maxPenetration });
    simulation.dispose();
  }
  collisionTest('sphere'); collisionTest('capsule');

  const blockedRig = make();
  const blockedAnchor = blockedRig.skeleton.bones.find(bone => bone.name === 'Hair.-1.0.Root').getWorldPosition(new THREE.Vector3());
  const blocked = createSecondaryPhysics({ ...blockedRig, colliders: [{ type: 'sphere', center: blockedAnchor.toArray(), radius: 2, groups: ['hair'] }] }); resources.push(blocked);
  blocked.update(1 / 60, zeroGravity); assertState(blocked);
  assert.ok(blocked.debugInfo.maxPenetration > .5, 'infeasible penetration was hidden');
  record('infeasible collision remains visible in diagnostics without stretching or violating angle caps', { residual_tip_penetration: blocked.debugInfo.maxPenetration });
  blocked.dispose();

  function rateTest(rate) {
    const rateRig = make(), simulation = createSecondaryPhysics({ ...rateRig, colliders: [] }); resources.push(simulation);
    for (let i = 1; i <= rate * 2; i++) {
      const time = i / rate;
      rateRig.root.position.x = Math.min(time, .75) * .25;
      rateRig.root.rotation.y = Math.min(time, .75) * .3;
      simulation.update(1 / rate, zeroGravity); assertState(simulation);
    }
    const result = tips(simulation).map(point => [...point]); simulation.dispose(); return result;
  }
  const rateDifference = maximumTipDistance(rateTest(60), rateTest(120));
  assert.ok(rateDifference < .02, `60/120 Hz mismatch ${rateDifference}`);
  record('60/120 Hz delivery stays close with the same fixed simulation step', { maximum_world_tip_difference: rateDifference, tolerance: .02 });

  const spikeRig = make(), spike = createSecondaryPhysics({ ...spikeRig, colliders: [] }); resources.push(spike);
  spike.update(.12); assertState(spike); assert.equal(spike.debugInfo.substeps, 6);
  spike.update(1); assertState(spike); assert.equal(spike.debugInfo.substeps, 0); assert.equal(spike.debugInfo.lastResetReason, 'long-frame-gap');
  spikeRig.root.position.x = 2;
  spike.update(1 / 60); assertState(spike); assert.equal(spike.debugInfo.lastResetReason, 'teleport-distance');
  spikeRig.root.rotation.y = Math.PI;
  spike.update(1 / 60); assertState(spike); assert.equal(spike.debugInfo.lastResetReason, 'teleport-angle');
  for (const delta of [0, -1, NaN, Infinity]) { spike.update(delta); assertState(spike); assertSkinFinite(spikeRig); }
  spikeRig.root.scale.set(1.1, .9, 1);
  spike.update(1 / 60); assertState(spike); assert.equal(spike.debugInfo.lastResetReason, 'nonuniform-ancestor-scale');
  assertSkinFinite(spikeRig);
  spikeRig.root.scale.set(1, 1, 1); spike.reset();
  const firstHair = spikeRig.skeleton.bones.find(bone => bone.name === 'Hair.-1.0.Root');
  const restPosition = firstHair.position.clone(); firstHair.position.x += .2;
  const humanBeforeReset = kinematicPose(spikeRig);
  spike.reset(); assert.ok(firstHair.position.distanceTo(restPosition) < 1e-9); assert.ok(spike.debugInfo.maxDeflectionRadians < 1e-7);
  assertKinematics(humanBeforeReset); assertState(spike);
  spike.dispose(); spike.dispose(); spike.update(1); assert.equal(spike.debugInfo.disposed, true);
  record('long frames, teleports, invalid delta and reset/dispose recover finite rest safely');

  console.log(JSON.stringify({ passed: true, passed_checks: checks.length, physics_sha256: crypto.createHash('sha256').update(fs.readFileSync(new URL('./physics.js', import.meta.url))).digest('hex'), checks }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ passed: false, passed_checks: checks.length, checks, error: { message: error.message, stack: error.stack } }, null, 2));
  process.exitCode = 1;
} finally {
  for (const resource of resources.reverse()) { try { resource.dispose(); } catch {} }
}
