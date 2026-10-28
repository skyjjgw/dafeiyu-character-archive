import * as THREE from './vendor/three.module.js';
import RAPIER from './vendor/rapier-0.21.0.js';

let initialized;
const ready = () => initialized ||= RAPIER.init();

/**
 * Grounded kinematic locomotion + fixed-length two-bone foot IK.
 * Order: character.update -> locomotion.update -> secondaryPhysics.update.
 * This is a yaw-only capsule controller on a flat floor, not ragdoll, cloth,
 * full-body collision or a general terrain / rotational-sweep controller.
 */
export async function createLocomotion({ root, skeleton, body } = {}) {
  if (!root?.isObject3D || !Array.isArray(skeleton?.bones) || !body?.isSkinnedMesh) throw new TypeError('createLocomotion requires root, skeleton and body');
  await ready();
  const STEP = 1 / 120, MAX_STEPS = 8, MAX_FRAME = STEP * MAX_STEPS;
  const FLOOR = 0, OFFSET = .004, RADIUS = .50, SPEED = .14;
  const UP = new THREE.Vector3(0, 1, 0), FORWARD = new THREE.Vector3(0, 0, 1);
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  const smooth = t => t * t * (3 - 2 * t);
  const boneMap = new Map(skeleton.bones.map(b => [b.name, b]));
  const boneIndex = new Map(skeleton.bones.map((b, i) => [b, i]));
  const pelvis = boneMap.get('Pelvis');
  if (!pelvis) throw new Error('Pelvis bone missing');
  root.updateMatrixWorld(true); skeleton.update();
  const initialPosition = root.getWorldPosition(new THREE.Vector3());
  const initialRotation = root.getWorldQuaternion(new THREE.Quaternion());
  const scaleVector = root.getWorldScale(new THREE.Vector3());
  const scale = Math.abs(scaleVector.x);
  if (scaleVector.x < 1e-6 || Math.max(scaleVector.x, scaleVector.y, scaleVector.z) - Math.min(scaleVector.x, scaleVector.y, scaleVector.z) > 1e-5) throw new Error('Locomotion requires a positive uniform root scale');
  if (root.parent) {
    const parentUp = UP.clone().applyQuaternion(root.parent.getWorldQuaternion(new THREE.Quaternion()));
    if (parentUp.distanceTo(UP) > 1e-5) throw new Error('Locomotion requires an upright parent; yaw rotation is supported');
  }
  const restPose = bone => {
    const i = boneIndex.get(bone), p = boneIndex.get(bone.parent);
    const matrix = new THREE.Matrix4().multiplyMatrices(skeleton.boneInverses[p], skeleton.boneInverses[i].clone().invert());
    const position = new THREE.Vector3(), quaternion = new THREE.Quaternion(), s = new THREE.Vector3();
    matrix.decompose(position, quaternion, s);
    return { position, quaternion, scale: s };
  };
  const legs = [];
  for (const [name, side] of [['R', -1], ['L', 1]]) {
    const hip = boneMap.get(`${name}.Hip`), knee = boneMap.get(`${name}.Knee`), ankle = boneMap.get(`${name}.Ankle`);
    if (!hip || !knee || !ankle || knee.parent !== hip || ankle.parent !== knee) throw new Error(`Invalid ${name} leg chain`);
    const poses = [hip, knee, ankle].map(restPose);
    [hip, knee, ankle].forEach((b, i) => b.quaternion.copy(poses[i].quaternion));
    root.updateMatrixWorld(true);
    const h = hip.getWorldPosition(new THREE.Vector3()), k = knee.getWorldPosition(new THREE.Vector3()), a = ankle.getWorldPosition(new THREE.Vector3());
    const footQ = ankle.getWorldQuaternion(new THREE.Quaternion());
    const attribute = body.geometry.attributes.position, si = body.geometry.attributes.skinIndex, sw = body.geometry.attributes.skinWeight;
    const ankleId = boneIndex.get(ankle), inverse = skeleton.boneInverses[ankleId];
    let minY = Infinity, sum = new THREE.Vector3(), count = 0;
    const candidates = [];
    for (let i = 0; i < attribute.count; i++) {
      let amount = 0;
      for (let j = 0; j < 4; j++) if (si.array[i * 4 + j] === ankleId) amount += sw.array[i * 4 + j];
      if (amount < .98) continue;
      const p = new THREE.Vector3().fromBufferAttribute(attribute, i).applyMatrix4(body.bindMatrix).applyMatrix4(inverse);
      candidates.push(p); minY = Math.min(minY, p.y);
    }
    if (!candidates.length) throw new Error(`No ankle-weighted shoe vertices for ${name}`);
    for (const p of candidates) if (p.y <= minY + 1e-5) { sum.add(p); count++; }
    const soleOffset = sum.multiplyScalar(1 / count);
    const sole = ankle.localToWorld(soleOffset.clone());
    const localSole = root.worldToLocal(sole.clone());
    const relativeFootQ = initialRotation.clone().invert().multiply(footQ);
    legs.push({ name, side, hip, knee, ankle, poses, length1: h.distanceTo(k), length2: k.distanceTo(a), soleOffset, localSole, relativeFootQ,
      anchor: sole.clone(), target: sole.clone(), start: sole.clone(), swing: false, progress: 0, duration: .28, yaw: 0, startYaw: 0, targetYaw: 0,
      lastActual: sole.clone(), actual: sole.clone(), phase: 0, lastSwingCycle: -Infinity, unreachable: 0 });
  }
  const modelSoleY = legs.reduce((s, l) => s + l.localSole.y, 0) / legs.length;
  const halfHeight = .45 * scale, capsuleRadius = .23 * scale, totalHalf = halfHeight + capsuleRadius;
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  world.timestep = STEP;
  const ground = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -.10, 0));
  world.createCollider(RAPIER.ColliderDesc.cuboid(20, .10, 20).setFriction(.9), ground);
  const rb = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(initialPosition.x, initialPosition.y + modelSoleY * scale + totalHalf + OFFSET, initialPosition.z));
  const collider = world.createCollider(RAPIER.ColliderDesc.capsule(halfHeight, capsuleRadius).setFriction(.9), rb);
  const controller = world.createCharacterController(OFFSET);
  controller.enableSnapToGround(.12 * scale);
  controller.setMaxSlopeClimbAngle(Math.PI / 4);
  controller.setMinSlopeSlideAngle(Math.PI / 6);
  controller.setSlideEnabled(true);
  world.step();
  let disposed = false, accumulator = 0, clock = 0, gaitClock = 0, verticalVelocity = 0;
  let mode = 'idle', heading = 0, pathPhase = 0, pathHeading = 0;
  let turnBase = 0, turnAccum = 0, previousTurnRaw = 0, incomingTurnDelta = 0;
  let grounded = false, lastPelvisApplied = NaN, lastPelvisInput = pelvis.position.y;
  const position = initialPosition.clone(), pathOrigin = initialPosition.clone();
  const velocity = new THREE.Vector3(), parentQ = new THREE.Quaternion();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3();
  const axis = new THREE.Vector3(), pole = new THREE.Vector3(), kneeTarget = new THREE.Vector3();
  const parentInverse = new THREE.Matrix4(), desiredLocal = new THREE.Vector3(), baseAxis = new THREE.Vector3();
  const rotation = new THREE.Quaternion(), targetFootQ = new THREE.Quaternion();
  const debugInfo = {
    engine: '@dimforge/rapier3d-compat@0.21.0', method: 'Rapier kinematic capsule + analytic two-bone IK',
    gravity: [0, -9.81, 0], floorY: FLOOR, fixedStep: STEP, maxSubsteps: MAX_STEPS,
    pathRadius: RADIUS, walkingSpeed: SPEED, capsule: { halfHeight, radius: capsuleRadius, offset: OFFSET },
    bodyCount: 2, controllerCount: 1, grounded: false, disposed: false, finite: true,
    substeps: 0, totalSimulatedSeconds: 0, droppedSeconds: 0, heading: 0,
    maxLengthError: 0, maxSolePenetration: 0, maxStanceSlip: 0, maxAnkleTargetError: 0,
    rootPosition: position.toArray(), pelvisCorrection: 0, legs: [],
    limitations: ['Flat fixed ground, constant uniform root scale and yaw-only capsule.', 'Rapier controls translations; a symmetric capsule yaw has no rotational sweep.', 'Foot IK preserves link lengths; unreachable targets are reported rather than stretching.', 'Not a ragdoll, cloth, dynamic balance or full-mesh collision simulation.']
  };
  function rootPose() {
    root.position.copy(position);
    if (root.parent) root.parent.worldToLocal(root.position);
    let parentYaw = 0;
    if (root.parent) {
      root.parent.getWorldQuaternion(parentQ);
      a.copy(FORWARD).applyQuaternion(parentQ);
      parentYaw = Math.atan2(a.x, a.z);
    }
    // Preserve the animation's explicit yaw Euler representation. Writing a
    // quaternion here lets Euler decomposition flip x/z to PI beyond 90deg;
    // the authored turn then overwrites y only and unexpectedly reverses.
    root.rotation.set(0, heading - parentYaw, 0);
    root.updateMatrixWorld(true);
  }
  function restoreLegs() {
    for (const leg of legs) [leg.hip, leg.knee, leg.ankle].forEach((bone, i) => bone.quaternion.copy(leg.poses[i].quaternion));
    root.updateMatrixWorld(true);
  }
  function idealSole(leg, lead = 0, turnLead = 0, output = new THREE.Vector3()) {
    const q = rotation.setFromAxisAngle(UP, heading + turnLead);
    output.copy(leg.localSole).multiplyScalar(scale).applyQuaternion(q).add(position);
    output.addScaledVector(velocity, lead);
    output.y = grounded ? FLOOR : Math.max(FLOOR, position.y + modelSoleY * scale);
    return output;
  }
  function startSwing(leg, turning, angularSpeed) {
    leg.swing = true; leg.progress = 0; leg.duration = turning ? .22 : .29;
    leg.start.copy(leg.anchor); leg.startYaw = leg.yaw;
    idealSole(leg, turning ? 0 : .20, turning ? angularSpeed * .12 : 0, leg.target);
    leg.targetYaw = heading + (turning ? angularSpeed * .12 : 0);
  }
  function feetStep(dt, moving, turning, angularSpeed) {
    const period = turning ? .46 : .90;
    if (moving) gaitClock += dt / period;
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i], cycle = Math.floor(gaitClock + i * .5);
      leg.phase = (gaitClock + i * .5) % 1;
      const wantSwing = moving && leg.phase >= .60 && leg.lastSwingCycle !== cycle;
      const drift = idealSole(leg, 0, 0, a).distanceTo(leg.anchor);
      if (!leg.swing && (wantSwing || moving && drift > .135 * scale) && !legs.some(other => other !== leg && other.swing)) {
        startSwing(leg, turning, angularSpeed); leg.lastSwingCycle = cycle;
      }
      if (leg.swing) {
        leg.progress = Math.min(1, leg.progress + dt / leg.duration);
        const t = smooth(leg.progress);
        leg.anchor.lerpVectors(leg.start, leg.target, t);
        leg.anchor.y += Math.pow(Math.sin(Math.PI * leg.progress), 1.35) * .065 * scale;
        leg.yaw = leg.startYaw + wrap(leg.targetYaw - leg.startYaw) * t;
        if (leg.progress === 1) { leg.swing = false; leg.anchor.copy(leg.target); leg.yaw = leg.targetYaw; }
      } else if (grounded) leg.anchor.y = FLOOR;
    }
  }
  function step(dt, action) {
    const before = position.clone(), oldHeading = heading;
    const walking = action === 'walk';
    if (walking) {
      pathPhase += SPEED / RADIUS * dt;
      const right = a.set(Math.cos(pathHeading), 0, -Math.sin(pathHeading));
      const forward = b.set(Math.sin(pathHeading), 0, Math.cos(pathHeading));
      c.copy(pathOrigin).addScaledVector(right, RADIUS * (1 - Math.cos(pathPhase))).addScaledVector(forward, RADIUS * Math.sin(pathPhase));
      velocity.copy(c).sub(position).multiplyScalar(1 / dt); velocity.y = 0;
      const desired = pathHeading + pathPhase;
      heading += THREE.MathUtils.clamp(wrap(desired - heading), -1.6 * dt, 1.6 * dt);
    } else {
      velocity.set(0, 0, 0);
      if (action === 'turn') heading += incomingTurnDelta;
    }
    verticalVelocity = Math.max(-4, verticalVelocity - 9.81 * dt);
    const desiredMovement = { x: velocity.x * dt, y: verticalVelocity * dt - .0004, z: velocity.z * dt };
    controller.computeColliderMovement(collider, desiredMovement);
    const corrected = controller.computedMovement(), at = rb.translation();
    rb.setNextKinematicTranslation({ x: at.x + corrected.x, y: at.y + corrected.y, z: at.z + corrected.z });
    rb.setNextKinematicRotation({ x: 0, y: Math.sin(heading / 2), z: 0, w: Math.cos(heading / 2) });
    world.step();
    const now = rb.translation();
    position.set(now.x, now.y - totalHalf - OFFSET - modelSoleY * scale, now.z);
    grounded = controller.computedGrounded();
    if (grounded) verticalVelocity = 0;
    velocity.copy(position).sub(before).multiplyScalar(1 / dt); velocity.y = 0;
    const angularSpeed = wrap(heading - oldHeading) / dt;
    const turning = action === 'turn' && Math.abs(angularSpeed) > .015;
    feetStep(dt, walking || turning, turning, angularSpeed);
    clock += dt;
  }
  function desiredAnkle(leg, output) {
    targetFootQ.setFromAxisAngle(UP, leg.yaw).multiply(leg.relativeFootQ);
    return output.copy(leg.soleOffset).multiplyScalar(scale).applyQuaternion(targetFootQ).multiplyScalar(-1).add(leg.anchor);
  }
  function aim(bone, childOffset, restQ, worldTarget) {
    parentInverse.copy(bone.parent.matrixWorld).invert();
    desiredLocal.copy(worldTarget).applyMatrix4(parentInverse).sub(bone.position).normalize();
    baseAxis.copy(childOffset).multiply(bone.scale).applyQuaternion(restQ).normalize();
    rotation.setFromUnitVectors(baseAxis, desiredLocal);
    bone.quaternion.copy(rotation).multiply(restQ).normalize();
    bone.updateMatrixWorld(true);
  }
  function solveIK() {
    rootPose(); restoreLegs();
    const incoming = Math.abs(pelvis.position.y - lastPelvisApplied) < 1e-8 ? lastPelvisInput : pelvis.position.y;
    lastPelvisInput = incoming;
    const crouch = Math.min(.035 * scale, Math.min(...legs.map(l => l.length1 + l.length2)) * .045);
    const parentScale = pelvis.parent.getWorldScale(c).y;
    pelvis.position.y = incoming - crouch / parentScale;
    root.updateMatrixWorld(true);
    let extra = 0;
    for (const leg of legs) {
      const h = leg.hip.getWorldPosition(a), target = desiredAnkle(leg, b);
      const lateral = (h.x - target.x) ** 2 + (h.z - target.z) ** 2;
      const reach = leg.length1 + leg.length2 - .002 * scale;
      const vertical = Math.sqrt(Math.max(.001, reach * reach - lateral));
      extra = Math.max(extra, h.y - target.y - vertical);
    }
    extra = Math.min(.06 * scale, Math.max(0, extra));
    pelvis.position.y -= extra / parentScale;
    lastPelvisApplied = pelvis.position.y;
    debugInfo.pelvisCorrection = crouch + extra;
    root.updateMatrixWorld(true);
    let lengthError = 0, penetration = 0, stanceSlip = 0, targetError = 0;
    const states = [];
    for (const leg of legs) {
      const hip = leg.hip.getWorldPosition(a), target = desiredAnkle(leg, b);
      axis.copy(target).sub(hip);
      const actualDistance = axis.length();
      const distance = THREE.MathUtils.clamp(actualDistance, Math.abs(leg.length1 - leg.length2) + .0001, leg.length1 + leg.length2 - .0001);
      leg.unreachable = Math.max(0, actualDistance - distance);
      if (actualDistance > 1e-9) axis.divideScalar(actualDistance); else axis.set(0, -1, 0);
      const projection = (leg.length1 ** 2 - leg.length2 ** 2 + distance ** 2) / (2 * distance);
      const height = Math.sqrt(Math.max(0, leg.length1 ** 2 - projection ** 2));
      pole.copy(FORWARD).applyAxisAngle(UP, heading).addScaledVector(axis, -FORWARD.clone().applyAxisAngle(UP, heading).dot(axis));
      if (pole.lengthSq() < 1e-8) pole.set(1, 0, 0).addScaledVector(axis, -axis.x);
      pole.normalize();
      kneeTarget.copy(hip).addScaledVector(axis, projection).addScaledVector(pole, height);
      const ankleTarget = d.copy(hip).addScaledVector(axis, distance);
      aim(leg.hip, leg.knee.position, leg.poses[0].quaternion, kneeTarget);
      aim(leg.knee, leg.ankle.position, leg.poses[1].quaternion, ankleTarget);
      targetFootQ.setFromAxisAngle(UP, leg.yaw).multiply(leg.relativeFootQ);
      leg.ankle.parent.getWorldQuaternion(parentQ);
      leg.ankle.quaternion.copy(parentQ.invert()).multiply(targetFootQ).normalize();
      leg.ankle.updateMatrixWorld(true);
      const h = leg.hip.getWorldPosition(a), k = leg.knee.getWorldPosition(b), ankle = leg.ankle.getWorldPosition(c);
      leg.actual.copy(leg.soleOffset).applyMatrix4(leg.ankle.matrixWorld);
      const e1 = Math.abs(h.distanceTo(k) - leg.length1), e2 = Math.abs(k.distanceTo(ankle) - leg.length2);
      lengthError = Math.max(lengthError, e1, e2);
      penetration = Math.max(penetration, FLOOR - leg.actual.y);
      if (!leg.swing) stanceSlip = Math.max(stanceSlip, leg.actual.distanceTo(leg.anchor));
      targetError = Math.max(targetError, leg.actual.distanceTo(leg.anchor));
      states.push({ name: leg.name, swing: leg.swing, phase: leg.phase, progress: leg.progress, anchor: leg.anchor.toArray(), sole: leg.actual.toArray(), ankle: ankle.toArray(), knee: k.toArray(), hip: h.toArray(), length1: leg.length1, length2: leg.length2, lengthError: Math.max(e1, e2), unreachable: leg.unreachable, footYaw: leg.yaw });
      leg.lastActual.copy(leg.actual);
    }
    skeleton.update();
    debugInfo.legs = states;
    debugInfo.maxLengthError = lengthError; debugInfo.maxSolePenetration = Math.max(0, penetration);
    debugInfo.maxStanceSlip = stanceSlip; debugInfo.maxAnkleTargetError = targetError;
    debugInfo.grounded = grounded; debugInfo.rootPosition = position.toArray(); debugInfo.heading = heading;
    debugInfo.finite = states.every(l => [...l.sole, ...l.ankle, ...l.knee, ...l.hip, l.unreachable].every(Number.isFinite)) && position.toArray().every(Number.isFinite);
  }
  function update(delta, state = {}) {
    if (disposed || state.paused) return debugInfo;
    const action = ['idle', 'wave', 'walk', 'turn'].includes(state.action) ? state.action : 'idle';
    const raw = Number.isFinite(delta) ? Math.max(0, delta) : 0;
    const animationForward = FORWARD.clone().applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion()));
    let authoredParentYaw = 0;
    if (root.parent) {
      a.copy(FORWARD).applyQuaternion(root.parent.getWorldQuaternion(parentQ));
      authoredParentYaw = Math.atan2(a.x, a.z);
    }
    const rawYaw = wrap(Math.atan2(animationForward.x, animationForward.z) - authoredParentYaw);
    if (action !== mode) {
      if (action === 'walk') { pathOrigin.copy(position); pathPhase = 0; pathHeading = heading; gaitClock = 0; legs.forEach(l => l.lastSwingCycle = -Infinity); }
      if (action === 'turn') { turnBase = heading; turnAccum = 0; previousTurnRaw = 0; gaitClock = 0; legs.forEach(l => l.lastSwingCycle = -Infinity); }
      mode = action;
    }
    let frameTurn = 0;
    if (action === 'turn') {
      frameTurn = wrap(rawYaw - previousTurnRaw); previousTurnRaw = rawYaw;
      turnAccum += frameTurn;
    }
    accumulator += Math.min(raw, MAX_FRAME);
    const planned = Math.min(MAX_STEPS, Math.floor((accumulator + 1e-12) / STEP));
    incomingTurnDelta = planned ? frameTurn / planned : 0;
    debugInfo.substeps = 0; debugInfo.droppedSeconds = Math.max(0, raw - MAX_FRAME);
    for (let i = 0; i < planned; i++) { step(STEP, action); accumulator = Math.max(0, accumulator - STEP); debugInfo.substeps++; }
    if (action === 'turn' && planned === 0) heading = turnBase + turnAccum;
    debugInfo.totalSimulatedSeconds = clock;
    solveIK();
    return debugInfo;
  }
  function reset() {
    if (disposed) return debugInfo;
    heading = 0; mode = 'idle'; pathPhase = 0; pathHeading = 0; turnAccum = 0; previousTurnRaw = 0;
    accumulator = 0; gaitClock = 0; verticalVelocity = 0;
    position.copy(initialPosition); position.y = FLOOR - modelSoleY * scale;
    pathOrigin.copy(position); velocity.set(0, 0, 0);
    rb.setTranslation({ x: position.x, y: totalHalf + OFFSET, z: position.z }, true);
    rb.setNextKinematicTranslation({ x: position.x, y: totalHalf + OFFSET, z: position.z });
    rb.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    rb.setNextKinematicRotation({ x: 0, y: 0, z: 0, w: 1 });
    world.step(); rootPose(); restoreLegs();
    for (const leg of legs) {
      leg.swing = false; leg.progress = 0; leg.yaw = 0; leg.phase = 0; leg.lastSwingCycle = -Infinity;
      idealSole(leg, 0, 0, leg.anchor); leg.anchor.y = FLOOR;
      leg.target.copy(leg.anchor); leg.start.copy(leg.anchor);
    }
    grounded = true;
    if (Number.isFinite(lastPelvisApplied) && Math.abs(pelvis.position.y - lastPelvisApplied) < 1e-8) pelvis.position.y = lastPelvisInput;
    lastPelvisApplied = NaN;
    solveIK();
    return debugInfo;
  }
  reset();
  return { update, reset, debugInfo, world, controller, dispose() {
    if (disposed) return;
    disposed = true; debugInfo.disposed = true;
    world.removeCharacterController(controller); world.free();
  } };
}
