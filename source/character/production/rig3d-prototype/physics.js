import * as THREE from './vendor/three.module.js';

/**
 * Secondary bone dynamics for the ordinary (non-VRM) Dafeiyu skeleton.
 *
 * Call after body animation: physics.update(delta, { hairSway: 1, tailSway: 1 }).
 * The caller must stop the old Hair.* / Tail.* sine rotations. This module owns
 * only those local bone rotations, never the Head, body animation or geometry.
 *
 * World-space damped Verlet tips, elastic rest attraction, gravity, fixed bone
 * lengths, joint-angle caps and sphere/capsule tip collisions. This is not a
 * rigid-body, cloth, strand-mesh or full-body collision solver.
 *
 * Optional colliders (omitted = head sphere + pelvis-to-chest capsule):
 *   {type:'sphere', bone:'Head', offset:[0,.04,0], radius:.48, groups:['hair']}
 *   {type:'sphere', center:[x,y,z], radius:.1} // world-space
 *   {type:'capsule', start:[x,y,z], end:[x,y,z], radius:.1} // world-space
 *   {type:'capsule', startBone:'Pelvis', endBone:'Chest', radius:.24}
 *   {type:'capsule', bone:'Chest', start:[...], end:[...], radius:.1} // local
 * Pass [] to disable collisions. Colliders constrain bone-tip particles, not
 * every rendered triangle. Infeasible collisions are reported, not hidden by
 * stretching bones or overriding the bounded tail bend.
 */
export function createSecondaryPhysics({ root, skeleton, body, colliders } = {}) {
  if (!root?.isObject3D || !Array.isArray(skeleton?.bones) || !body?.isSkinnedMesh) {
    throw new TypeError('createSecondaryPhysics requires root, skeleton and a SkinnedMesh body');
  }
  const STEP = 1 / 120, MAX_SUBSTEPS = 6, MAX_FRAME = STEP * MAX_SUBSTEPS;
  const LONG_GAP = .25, TELEPORT_DISTANCE = .65, TELEPORT_ANGLE = Math.PI * .60;
  const EPS = 1e-10, UP = new THREE.Vector3(0, 1, 0), ONE = new THREE.Vector3(1, 1, 1);
  const bones = new Map(skeleton.bones.map(bone => [bone.name, bone]));
  const indices = new Map(skeleton.bones.map((bone, i) => [bone, i]));
  const finiteVector = value => Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z);
  const finiteQuaternion = value => finiteVector(value) && Number.isFinite(value.w);
  const finiteMatrix = matrix => matrix.elements.every(Number.isFinite);
  const vec = (value, fallback = [0, 0, 0]) => {
    const result = value?.isVector3 ? value.clone() : new THREE.Vector3(...(Array.isArray(value) ? value : fallback));
    return finiteVector(result) ? result : new THREE.Vector3(...fallback);
  };
  const bounded = (value, fallback, min, max) => Number.isFinite(value) ? THREE.MathUtils.clamp(value, min, max) : fallback;
  const rest = new Map();
  root.updateMatrixWorld(true);
  function restPose(bone) {
    if (rest.has(bone)) return rest.get(bone);
    let position = bone.position.clone(), quaternion = bone.quaternion.clone(), scale = bone.scale.clone();
    const index = indices.get(bone), parentIndex = indices.get(bone.parent);
    const inverse = skeleton.boneInverses[index], parentInverse = skeleton.boneInverses[parentIndex];
    // Bone inverses retain the bind pose even if physics is created after an
    // animation frame. All owned roots have a parent in this same skeleton.
    if (inverse && parentInverse && finiteMatrix(inverse) && finiteMatrix(parentInverse)) {
      new THREE.Matrix4().multiplyMatrices(parentInverse, inverse.clone().invert()).decompose(position, quaternion, scale);
    }
    if (!finiteVector(position) || !finiteQuaternion(quaternion) || !finiteVector(scale)) throw new Error(`Invalid bind pose: ${bone.name}`);
    const value = { position, quaternion: quaternion.normalize(), scale };
    rest.set(bone, value);
    return value;
  }
  const chainSpecs = [];
  for (const bone of skeleton.bones) {
    const match = /^Hair\.(.+)\.Root$/.exec(bone.name);
    if (!match) continue;
    const chain = [bone, bones.get(`Hair.${match[1]}.Mid`), bones.get(`Hair.${match[1]}.Tip`)];
    if (chain.some(value => !value) || chain[1].parent !== chain[0] || chain[2].parent !== chain[1]) throw new Error(`Invalid hair hierarchy: ${bone.name}`);
    chainSpecs.push({ name: `Hair.${match[1]}`, kind: 'hair', bones: chain });
  }
  const tail = [0, 1, 2, 3, 4].map(i => bones.get(`Tail.${i}`));
  if (tail.some(Boolean)) {
    if (tail.some(value => !value) || tail.slice(1).some((bone, i) => bone.parent !== tail[i])) throw new Error('Invalid Tail.0..4 hierarchy');
    chainSpecs.push({ name: 'Tail', kind: 'tail', bones: tail });
  }
  if (!chainSpecs.length) throw new Error('No Hair.* or Tail.* secondary chains found');
  const chains = chainSpecs.map(spec => ({ ...spec, joints: spec.bones.map((bone, i) => {
    const pose = restPose(bone);
    let axis;
    if (i + 1 < spec.bones.length) axis = restPose(spec.bones[i + 1]).position.clone();
    else {
      // A short virtual terminal preserves inertia/rotation on the final bone
      // without adding a bone, changing its position or enlarging the flukes.
      axis = pose.position.clone().applyQuaternion(pose.quaternion.clone().invert()).normalize();
      axis.multiplyScalar(THREE.MathUtils.clamp(pose.position.length() * .4, .07, spec.kind === 'tail' ? .14 : .22));
    }
    if (!finiteVector(axis) || axis.lengthSq() < EPS) throw new Error(`Zero-length secondary segment: ${bone.name}`);
    return { bone, pose, axis, current: new THREE.Vector3(), previous: new THREE.Vector3(), solved: pose.quaternion.clone(), length: axis.clone().multiply(pose.scale).length() };
  }) }));
  const owned = chains.flatMap(chain => chain.joints);
  const colliderSpecs = colliders ?? [
    { name: 'head', type: 'sphere', bone: 'Head', offset: [0, .04, 0], radius: .48 },
    { name: 'torso', type: 'capsule', startBone: 'Pelvis', endBone: 'Chest', radius: .24 },
  ];
  if (!Array.isArray(colliderSpecs)) throw new TypeError('colliders must be an array');
  let accumulator = 0, disposed = false, enabled = true;
  const lastRootPosition = new THREE.Vector3(), lastRootQuaternion = new THREE.Quaternion(), lastRootScale = new THREE.Vector3();
  const rootPosition = new THREE.Vector3(), rootQuaternion = new THREE.Quaternion(), rootScale = new THREE.Vector3();
  const anchor = new THREE.Vector3(), restTip = new THREE.Vector3(), restDirection = new THREE.Vector3();
  const predicted = new THREE.Vector3(), velocity = new THREE.Vector3(), acceleration = new THREE.Vector3();
  const direction = new THREE.Vector3(), closest = new THREE.Vector3(), axis = new THREE.Vector3(), tangent = new THREE.Vector3();
  const localTarget = new THREE.Vector3(), restParentAxis = new THREE.Vector3(), actualTip = new THREE.Vector3();
  const inverseParent = new THREE.Matrix4(), rotation = new THREE.Quaternion(), limitedRotation = new THREE.Quaternion();
  const debugInfo = {
    kind: 'secondary-bone-dynamics', method: 'fixed-step damped Verlet with elastic rest attraction',
    scope: 'Hair/Tail local rotations and bone-tip sphere/capsule collisions; not rigid bodies or cloth',
    fixedStep: STEP, maxSubsteps: MAX_SUBSTEPS, maxFrameDelta: MAX_FRAME,
    longGapResetSeconds: LONG_GAP, teleportDistance: TELEPORT_DISTANCE, teleportAngleRadians: TELEPORT_ANGLE,
    chainCount: chains.length, simulatedBoneCount: owned.length, resetCount: 0, lastResetReason: 'initial',
    disposed: false, enabled: true, substeps: 0, simulatedSeconds: 0, totalSimulatedSeconds: 0, droppedSeconds: 0,
    finite: true, maxLengthError: 0, maxPenetration: 0, maxDeflectionRadians: 0,
    limitations: ['Collisions constrain bone tips, not rendered triangles.', 'Bone lengths and joint-angle limits win if a collider makes all allowed directions infeasible.', 'Nonuniform ancestor scales suspend dynamics until a uniform frame is restored.'],
    chains: [], colliders: [],
  };
  function restorePose() {
    for (const joint of owned) {
      joint.bone.position.copy(joint.pose.position);
      joint.bone.quaternion.copy(joint.pose.quaternion);
      joint.bone.scale.copy(joint.pose.scale);
    }
    root.updateMatrixWorld(true);
  }
  function parentRestTip(joint, output) {
    output.copy(joint.axis).multiply(joint.pose.scale).applyQuaternion(joint.pose.quaternion).add(joint.bone.position);
    return joint.bone.parent.localToWorld(output);
  }
  function readRoot() { root.matrixWorld.decompose(rootPosition, rootQuaternion, rootScale); }
  function rememberRoot() {
    lastRootPosition.copy(rootPosition); lastRootQuaternion.copy(rootQuaternion); lastRootScale.copy(rootScale);
  }
  function syncParticles(reason) {
    restorePose();
    for (const joint of owned) {
      parentRestTip(joint, joint.current);
      joint.previous.copy(joint.current); joint.solved.copy(joint.pose.quaternion);
    }
    accumulator = 0; readRoot(); rememberRoot();
    debugInfo.lastResetReason = reason;
    if (reason !== 'initial') debugInfo.resetCount++;
  }
  function getBone(value) { return typeof value === 'string' ? bones.get(value) : value?.isObject3D ? value : null; }
  function transformedPoint(value, boneValue) {
    const point = vec(value), bone = getBone(boneValue);
    return bone ? bone.localToWorld(point) : point;
  }
  function captureColliders() {
    return colliderSpecs.map((spec, i) => {
      const source = getBone(spec.bone) || getBone(spec.startBone);
      const scale = source ? source.getWorldScale(new THREE.Vector3()) : ONE;
      const radius = bounded(spec.radius, .1, .0001, 10) * Math.max(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z));
      const common = { name: spec.name || `collider-${i}`, radius, groups: spec.groups };
      if (spec.type === 'capsule') {
        const start = transformedPoint(spec.startOffset || spec.start, spec.startBone || spec.bone);
        const end = transformedPoint(spec.endOffset || spec.end, spec.endBone || spec.bone);
        return { ...common, type: 'capsule', start, end };
      }
      return { ...common, type: 'sphere', center: transformedPoint(spec.offset || spec.center, spec.bone) };
    });
  }
  function closestPoint(collider, point, output) {
    if (collider.type === 'sphere') return output.copy(collider.center);
    axis.copy(collider.end).sub(collider.start);
    const t = axis.lengthSq() < EPS ? 0 : THREE.MathUtils.clamp(tangent.copy(point).sub(collider.start).dot(axis) / axis.lengthSq(), 0, 1);
    return output.copy(collider.start).addScaledVector(axis, t);
  }
  function applicable(collider, kind) { return !collider.groups || collider.groups.includes(kind); }
  function setLengthAndCone(point, length, maximumAngle) {
    direction.copy(point).sub(anchor);
    if (!finiteVector(direction) || direction.lengthSq() < EPS) direction.copy(restDirection);
    else direction.normalize();
    const angle = Math.acos(THREE.MathUtils.clamp(direction.dot(restDirection), -1, 1));
    if (angle > maximumAngle) {
      rotation.setFromUnitVectors(restDirection, direction);
      limitedRotation.identity().slerp(rotation, maximumAngle / angle);
      direction.copy(restDirection).applyQuaternion(limitedRotation).normalize();
    }
    return point.copy(anchor).addScaledVector(direction, length);
  }
  function avoidCollision(point, length, collider, radius) {
    closestPoint(collider, point, closest);
    const combined = collider.radius + radius;
    if (point.distanceToSquared(closest) >= combined * combined - 1e-12) return;
    // Project on the intersection of the bone-length sphere and the collider
    // exclusion sphere, instead of pushing a particle out and stretching it.
    const toward = axis.copy(closest).sub(anchor), distance = toward.length();
    if (distance < EPS) return; // no feasible direction if its sphere contains this entire link
    toward.divideScalar(distance);
    const cosine = (distance * distance + length * length - combined * combined) / (2 * distance * length);
    if (cosine < -1 || cosine >= 1) return;
    direction.copy(point).sub(anchor).normalize();
    const dot = direction.dot(toward);
    tangent.copy(direction).addScaledVector(toward, -dot);
    if (tangent.lengthSq() < EPS) tangent.copy(restDirection).addScaledVector(toward, -restDirection.dot(toward));
    if (tangent.lengthSq() < EPS) tangent.crossVectors(toward, Math.abs(toward.y) < .9 ? UP : new THREE.Vector3(1, 0, 0));
    tangent.normalize();
    direction.copy(toward).multiplyScalar(cosine).addScaledVector(tangent, Math.sqrt(Math.max(0, 1 - cosine * cosine))).normalize();
    point.copy(anchor).addScaledVector(direction, length);
  }
  function coefficients(kind, strength) {
    const complianceScale = .35 + strength * .65;
    const stiffness = (kind === 'hair' ? 110 : 240) / complianceScale;
    return {
      strength, complianceScale, compliance: 1 / stiffness, stiffness,
      damping: kind === 'hair' ? 7 : 10,
      gravityScale: (kind === 'hair' ? .12 : .035) * strength,
      maxAngle: (kind === 'hair' ? .35 : .07) * strength,
      radius: kind === 'hair' ? .035 : .055,
    };
  }
  function orientJoint(joint, point) {
    // child.position is the actual (arbitrary) bone axis, not an assumed +Y.
    inverseParent.copy(joint.bone.parent.matrixWorld).invert();
    localTarget.copy(point).applyMatrix4(inverseParent).sub(joint.bone.position).normalize();
    restParentAxis.copy(joint.axis).multiply(joint.pose.scale).applyQuaternion(joint.pose.quaternion).normalize();
    rotation.setFromUnitVectors(restParentAxis, localTarget);
    joint.bone.quaternion.copy(rotation).multiply(joint.pose.quaternion).normalize();
    joint.solved.copy(joint.bone.quaternion);
    joint.bone.updateMatrixWorld(true);
    actualTip.copy(joint.axis).applyMatrix4(joint.bone.matrixWorld);
    joint.current.copy(actualTip);
  }
  function step(worldColliders, gravity, params) {
    for (const chain of chains) {
      const values = params[chain.kind];
      for (const joint of chain.joints) {
        joint.bone.getWorldPosition(anchor);
        parentRestTip(joint, restTip);
        restDirection.copy(restTip).sub(anchor);
        const length = restDirection.length();
        if (!Number.isFinite(length) || length < EPS) throw new Error(`Invalid animated segment length: ${joint.bone.name}`);
        restDirection.divideScalar(length);
        if (values.strength === 0) {
          joint.bone.quaternion.copy(joint.pose.quaternion); joint.solved.copy(joint.pose.quaternion);
          joint.bone.updateMatrixWorld(true);
          joint.current.copy(restTip); joint.previous.copy(restTip);
          continue;
        }
        velocity.copy(joint.current).sub(joint.previous).multiplyScalar(Math.exp(-values.damping * STEP));
        // Limit a single inherited impulse; teleport/long-gap frames also reset.
        velocity.clampLength(0, Math.min(length * .35, STEP * 5));
        acceleration.copy(restTip).sub(joint.current).multiplyScalar(values.stiffness).addScaledVector(gravity, values.gravityScale);
        predicted.copy(joint.current).add(velocity).addScaledVector(acceleration, STEP * STEP);
        const worldScale = joint.bone.getWorldScale(new THREE.Vector3());
        const radius = values.radius * Math.max(Math.abs(worldScale.x), Math.abs(worldScale.y), Math.abs(worldScale.z));
        for (let iteration = 0; iteration < 8; iteration++) {
          setLengthAndCone(predicted, length, values.maxAngle);
          for (const collider of worldColliders) if (applicable(collider, chain.kind)) avoidCollision(predicted, length, collider, radius);
        }
        setLengthAndCone(predicted, length, values.maxAngle);
        joint.previous.copy(joint.current);
        orientJoint(joint, predicted);
      }
    }
  }
  function measure(worldColliders, params) {
    let maxLengthError = 0, maxPenetration = 0, maxDeflection = 0, allFinite = true;
    const states = [];
    for (const chain of chains) {
      const segments = [];
      for (const joint of chain.joints) {
        joint.bone.getWorldPosition(anchor); parentRestTip(joint, restTip);
        actualTip.copy(joint.axis).applyMatrix4(joint.bone.matrixWorld);
        const length = restTip.distanceTo(anchor), actualLength = actualTip.distanceTo(anchor);
        maxLengthError = Math.max(maxLengthError, Math.abs(actualLength - length));
        const deflection = joint.pose.quaternion.angleTo(joint.bone.quaternion);
        maxDeflection = Math.max(maxDeflection, deflection);
        const scale = joint.bone.getWorldScale(new THREE.Vector3());
        const radius = params[chain.kind].radius * Math.max(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z));
        let penetration = 0;
        for (const collider of worldColliders) if (applicable(collider, chain.kind)) penetration = Math.max(penetration, collider.radius + radius - actualTip.distanceTo(closestPoint(collider, actualTip, closest)));
        maxPenetration = Math.max(maxPenetration, penetration);
        allFinite &&= finiteVector(actualTip) && finiteVector(joint.current) && finiteVector(joint.previous) && finiteQuaternion(joint.bone.quaternion);
        segments.push({ bone: joint.bone.name, restLocalLength: joint.length, worldLength: length, actualLength, head: anchor.toArray(), tip: actualTip.toArray(), deflectionRadians: deflection, penetration: Math.max(0, penetration) });
      }
      states.push({ name: chain.name, kind: chain.kind, coefficients: { ...params[chain.kind] }, segments });
    }
    debugInfo.finite = allFinite; debugInfo.maxLengthError = maxLengthError;
    debugInfo.maxPenetration = Math.max(0, maxPenetration); debugInfo.maxDeflectionRadians = maxDeflection;
    debugInfo.chains = states;
    debugInfo.colliders = worldColliders.map(collider => ({ ...collider, center: collider.center?.toArray(), start: collider.start?.toArray(), end: collider.end?.toArray() }));
  }
  function uniformAncestors() {
    // A rotation under anisotropic scale changes world bone lengths. Preserve
    // the user's scale and rest pose rather than pretending the solver handles it.
    return chains.every(chain => {
      const scale = chain.bones[0].parent.getWorldScale(new THREE.Vector3());
      const maximum = Math.max(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z));
      return finiteVector(scale) && maximum > EPS && maximum - Math.min(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z)) < 1e-5;
    });
  }
  function update(delta, options = {}) {
    if (disposed) return debugInfo;
    const rawDelta = Number.isFinite(delta) ? Math.max(0, delta) : 0;
    const params = {
      hair: coefficients('hair', bounded(options.hairSway, 1, 0, 1.8)),
      tail: coefficients('tail', bounded(options.tailSway, 1, 0, 1.8)),
    };
    const gravity = vec(options.gravity, [0, -9.81, 0]).clampLength(0, 50);
    // Capture the current animated anchors only after removing our own last
    // secondary rotations. In particular, never recycle a solved pose as rest.
    restorePose(); readRoot();
    // A zero-strength change takes effect even on a zero-delta render frame.
    for (const chain of chains) if (params[chain.kind].strength === 0) for (const joint of chain.joints) {
      parentRestTip(joint, joint.current); joint.previous.copy(joint.current); joint.solved.copy(joint.pose.quaternion);
    }
    if (!finiteVector(rootPosition) || !finiteQuaternion(rootQuaternion) || !finiteVector(rootScale)) {
      debugInfo.finite = false; debugInfo.lastResetReason = 'invalid-root-transform'; return debugInfo;
    }
    let reason = options.reset ? 'requested' : null;
    if (rawDelta > LONG_GAP) reason = 'long-frame-gap';
    else if (rootPosition.distanceTo(lastRootPosition) > TELEPORT_DISTANCE) reason = 'teleport-distance';
    else if (rootQuaternion.angleTo(lastRootQuaternion) > TELEPORT_ANGLE) reason = 'teleport-angle';
    else if (['x', 'y', 'z'].some(key => Math.abs(rootScale[key] / (lastRootScale[key] || 1) - 1) > .25)) reason = 'scale-change';
    const nextEnabled = options.enabled !== false;
    if (nextEnabled !== enabled) reason = nextEnabled ? 'enabled' : 'disabled';
    enabled = nextEnabled; debugInfo.enabled = enabled;
    if (!uniformAncestors()) reason = 'nonuniform-ancestor-scale';
    debugInfo.substeps = 0; debugInfo.simulatedSeconds = 0;
    debugInfo.droppedSeconds = Math.max(0, rawDelta - MAX_FRAME);
    if (reason || !enabled) {
      debugInfo.droppedSeconds = rawDelta;
      syncParticles(reason || 'disabled');
    } else {
      accumulator += Math.min(rawDelta, MAX_FRAME);
      const worldColliders = captureColliders();
      while (accumulator + 1e-12 >= STEP && debugInfo.substeps < MAX_SUBSTEPS) {
        step(worldColliders, gravity, params);
        accumulator = Math.max(0, accumulator - STEP); debugInfo.substeps++;
      }
      if (debugInfo.substeps === 0) {
        for (const joint of owned) joint.bone.quaternion.copy(joint.solved);
        root.updateMatrixWorld(true);
      }
      debugInfo.simulatedSeconds = debugInfo.substeps * STEP;
      debugInfo.totalSimulatedSeconds += debugInfo.simulatedSeconds;
      rememberRoot();
    }
    root.updateMatrixWorld(true); skeleton.update();
    measure(captureColliders(), params);
    if (!debugInfo.finite) {
      syncParticles('nonfinite-simulation-recovery'); root.updateMatrixWorld(true); skeleton.update();
      measure(captureColliders(), params);
    }
    return debugInfo;
  }
  function reset() {
    if (disposed) return debugInfo;
    syncParticles('manual'); root.updateMatrixWorld(true); skeleton.update();
    measure(captureColliders(), { hair: coefficients('hair', 1), tail: coefficients('tail', 1) });
    return debugInfo;
  }
  syncParticles('initial');
  measure(captureColliders(), { hair: coefficients('hair', 1), tail: coefficients('tail', 1) });
  return { update, reset, debugInfo, dispose() { if (!disposed) { reset(); disposed = true; debugInfo.disposed = true; } } };
}
