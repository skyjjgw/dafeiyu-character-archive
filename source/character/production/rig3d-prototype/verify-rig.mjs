import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as THREE from './vendor/three.module.js';

// Run: node verify-rig.mjs. No renderer, DOM, network, or installed packages.
const directory = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(directory, 'character.js');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sourceHash = hash(sourcePath);
const dependencies = ['face.js', 'hair.js', 'costume.js', 'tuning.js'].map(name => {
  const file = path.join(directory, name);
  return { path: file, sha256: hash(file) };
});
// Capture every art module before loading the character, then check them again
// after the run so the report identifies one unchanged set of source files.
const { createCharacter } = await import('./character.js');
const { defaultTuning } = await import('./tuning.js');
const report = {
  schema_version: 3,
  source: { path: sourcePath, sha256: sourceHash, dependencies },
  runtime: { node: process.version, three: THREE.REVISION },
  scope: 'CPU rest proportions, bone matrices, skinning and sampled face geometry attributes; no rendering or visual likeness judgement.',
  limitations: [
    'A procedural rig and finite continuous transforms do not establish finished character art, anatomical quality, collision avoidance, foot contact, or production topology.',
    'Tests use 60 Hz and scene-unit thresholds; bind-space body shortening and the post-bind default uniform head enlargement are checked separately.',
    'Face attributes are scanned in full at rest and at selected action frames, not on every frame.',
    'No browser, application, camera, or real audio output is exercised.'
  ],
  proportions: {
    rest_space_map: 'y <= 1.90 ? y * 0.74 : y - 0.494',
    expected_pelvis_y: .7622, expected_head_center_y: 1.896,
    expected_neck_to_head_distance: .37,
    expected_default_head_scale: 1.08,
    expected_body_scale_range: [.68, 1],
  },
  checks: [], actions: {},
};
const activeRigs = new Set();
const check = (name, passed, details = {}) => report.checks.push({ name, passed: Boolean(passed), ...details });
const maxDelta = (a, b) => a.reduce((m, v, i) => Math.max(m, Math.abs(v - b[i])), 0);
const finite = values => Array.from(values).every(Number.isFinite);
const xyz = vector => vector.toArray().map(v => Number(v.toPrecision(10)));
const quat = array => new THREE.Quaternion().fromArray(array);
const component = (attribute, i, j) => attribute.array[i * attribute.itemSize + j];
function makeRig(tuning) { const rig = createCharacter(tuning); activeRigs.add(rig); return rig; }
function release(rig) { rig.dispose(); activeRigs.delete(rig); }
function refresh(rig) {
  rig.root.updateMatrixWorld(true);
  const skeletons = new Set();
  rig.root.traverse(object => { if (object.isSkinnedMesh) skeletons.add(object.skeleton); });
  for (const skeleton of skeletons) skeleton.update();
}
function makeSamples(body) {
  const position = body.geometry.attributes.position;
  const skinIndex = body.geometry.attributes.skinIndex;
  const skinWeight = body.geometry.attributes.skinWeight;
  const ids = new Set([0, position.count - 1]);
  for (let i = 0; i < position.count; i += Math.max(1, Math.floor(position.count / 192))) ids.add(i);
  const selectedByBone = new Uint8Array(body.skeleton.bones.length);
  for (let i = 0; i < position.count; i++) for (let j = 0; j < 4; j++) {
    const bone = component(skinIndex, i, j);
    if (component(skinWeight, i, j) > .1 && selectedByBone[bone] < 3) {
      ids.add(i); selectedByBone[bone]++;
    }
  }
  return [...ids];
}
function faceMeshes(rig) {
  const result = [];
  const head = rig.skeleton.bones.find(bone => bone.name === 'Head');
  head?.traverse(object => { if (object.isMesh && !object.isSkinnedMesh) result.push(object); });
  return result;
}
function inspectFaceGeometry(rig) {
  const meshes = faceMeshes(rig), invalid = [];
  let vertices = 0, attributes = 0;
  for (const mesh of meshes) {
    const geometry = mesh.geometry, position = geometry?.getAttribute('position');
    if (!position || position.count === 0 || position.itemSize !== 3) invalid.push(`${mesh.name}: position missing/empty`);
    vertices += position?.count || 0;
    for (const [name, attribute] of Object.entries(geometry?.attributes || {})) {
      attributes++;
      if (!finite(attribute.array)) invalid.push(`${mesh.name}: ${name}`);
    }
    if (geometry?.index && (!finite(geometry.index.array) || Array.from(geometry.index.array).some(i => !Number.isInteger(i) || i < 0 || i >= (position?.count || 0)))) invalid.push(`${mesh.name}: index`);
  }
  return { all_finite: meshes.length > 0 && vertices > 0 && invalid.length === 0, mesh_count: meshes.length, vertex_count: vertices, attributes_checked: attributes, invalid_attributes: invalid.slice(0, 12) };
}
function faceGeometryHash(rig) {
  const digest = crypto.createHash('sha256');
  for (const mesh of faceMeshes(rig)) {
    digest.update(`${mesh.name}:${mesh.visible}`);
    for (const [name, attribute] of Object.entries(mesh.geometry.attributes)) {
      digest.update(name);
      digest.update(Buffer.from(attribute.array.buffer, attribute.array.byteOffset, attribute.array.byteLength));
    }
  }
  return digest.digest('hex');
}
function snapshot(rig, samples) {
  refresh(rig);
  let allFinite = true;
  rig.root.traverse(object => {
    allFinite &&= finite(object.position.toArray()) && finite(object.quaternion.toArray()) && finite(object.scale.toArray()) && finite(object.matrix.elements) && finite(object.matrixWorld.elements);
  });
  const bones = rig.skeleton.bones.map(bone => ({
    name: bone.name, localQuaternion: bone.quaternion.toArray(),
    worldQuaternion: bone.getWorldQuaternion(new THREE.Quaternion()).toArray(),
    worldPosition: bone.getWorldPosition(new THREE.Vector3()).toArray(),
  }));
  allFinite &&= finite(rig.skeleton.boneMatrices) && finite(rig.body.bindMatrix.elements) && finite(rig.body.bindMatrixInverse.elements);
  const local = [], world = [], point = new THREE.Vector3();
  for (const index of samples) {
    rig.body.getVertexPosition(index, point);
    local.push(point.x, point.y, point.z);
    point.applyMatrix4(rig.body.matrixWorld);
    world.push(point.x, point.y, point.z);
  }
  allFinite &&= finite(local) && finite(world);
  return { bones, local, world, rootQuaternion: rig.root.quaternion.toArray(), allFinite };
}
function maxPointDistance(a, b) {
  let result = 0;
  for (let i = 0; i < a.length; i += 3) result = Math.max(result, Math.hypot(a[i] - b[i], a[i + 1] - b[i + 1], a[i + 2] - b[i + 2]));
  return result;
}
function boneDifference(a, b, world = true) {
  let result = 0;
  const field = world ? 'worldQuaternion' : 'localQuaternion';
  for (let i = 0; i < a.bones.length; i++) result = Math.max(result, quat(a.bones[i][field]).angleTo(quat(b.bones[i][field])));
  return result;
}
function selectedPose(rig, time) {
  const position = name => xyz(rig.skeleton.bones.find(bone => bone.name === name).getWorldPosition(new THREE.Vector3()));
  return {
    time_seconds: Number(time.toFixed(6)),
    root_quaternion: rig.root.quaternion.toArray(),
    pelvis: position('Pelvis'), wave_hand_wrist: position('R.Wrist'),
    left_ankle: position('L.Ankle'), right_ankle: position('R.Ankle'),
    tail_tip: position('Tail.4'), action_completed: Boolean(rig.root.userData.actionCompleted),
  };
}

try {
  const rig = makeRig();
  const boneNodes = [], skinNodes = [];
  rig.root.traverse(object => { if (object.isBone) boneNodes.push(object); if (object.isSkinnedMesh) skinNodes.push(object); });
  check('40 actual bones and one actual SkinnedMesh', boneNodes.length === 40 && skinNodes.length === 1 && rig.skeleton.bones.length === 40 && rig.body === skinNodes[0], { bone_count: boneNodes.length, skinned_mesh_count: skinNodes.length });
  check('unique bones and skeleton hierarchy rooted under body', new Set(boneNodes.map(b => b.name)).size === 40 && rig.body.parent === rig.root && rig.skeleton.bones.every(b => {
    let current = b; while (current && current !== rig.body) current = current.parent; return current === rig.body;
  }));
  // The constructor deliberately poses Head at uniform 1.08 after binding.
  // Bind tests must restore the inverse-bind pose, not mistake that default
  // artistic deformation for a bad inverse or an already-deformed vertex.
  rig.skeleton.pose();
  refresh(rig);
  const geometry = rig.body.geometry;
  const position = geometry.attributes.position, weights = geometry.attributes.skinWeight, indices = geometry.attributes.skinIndex;
  let maxWeightSumError = 0, minWeight = Infinity, maxWeight = -Infinity, invalidIndices = 0, blendedVertices = 0;
  const influenced = new Array(40).fill(0);
  for (let i = 0; i < position.count; i++) {
    let total = 0, positive = 0;
    for (let j = 0; j < 4; j++) {
      const weight = component(weights, i, j), index = component(indices, i, j);
      total += weight; minWeight = Math.min(minWeight, weight); maxWeight = Math.max(maxWeight, weight);
      if (!Number.isInteger(index) || index < 0 || index >= 40) invalidIndices++;
      if (weight > 1e-6) { positive++; influenced[index]++; }
    }
    maxWeightSumError = Math.max(maxWeightSumError, Math.abs(total - 1));
    if (positive > 1) blendedVertices++;
  }
  const geometryAttributeChecks = Object.fromEntries(Object.entries(geometry.attributes).map(([name, attribute]) => [name, finite(attribute.array)]));
  check('all geometry and skin attributes finite and correctly sized', Object.values(geometryAttributeChecks).every(Boolean) && weights.count === position.count && indices.count === position.count && weights.itemSize === 4 && indices.itemSize === 4, { vertex_count: position.count, finite_attributes: geometryAttributeChecks });
  check('valid normalized skin weights with real multi-bone blending', invalidIndices === 0 && minWeight >= 0 && maxWeight <= 1 && maxWeightSumError < 1e-5 && blendedVertices > 0 && influenced.every(n => n > 0), { min_weight: minWeight, max_weight: maxWeight, max_sum_error: maxWeightSumError, invalid_indices: invalidIndices, blended_vertices: blendedVertices, vertex_influences_by_bone: Object.fromEntries(rig.skeleton.bones.map((b, i) => [b.name, influenced[i]])) });
  const identity = new THREE.Matrix4();
  const bindErrors = rig.skeleton.bones.map((bone, i) => maxDelta(new THREE.Matrix4().multiplyMatrices(bone.matrixWorld, rig.skeleton.boneInverses[i]).elements, identity.elements));
  check('bind inverse matches every bone after explicit skeleton.pose', bindErrors.every(error => error < 1e-6), { max_matrix_error: Math.max(...bindErrors) });
  let maxRestError = 0;
  const raw = new THREE.Vector3(), deformed = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    raw.fromBufferAttribute(position, i); rig.body.getVertexPosition(i, deformed);
    maxRestError = Math.max(maxRestError, raw.distanceTo(deformed));
  }
  check('rest skinning preserves all original vertex positions', maxRestError < 1e-5, { max_vertex_error: maxRestError });
  const initialFace = inspectFaceGeometry(rig);
  check('new face meshes have finite vertex attributes at rest', initialFace.all_finite, initialFace);
  // Explicit expected coordinates after the agreed rest-space proportion edit.
  // These are new output coordinates, not values read back from rig metadata.
  const expectedRest = {
    Pelvis: [0, .7622, 0], Spine: [0, 1.0508, 0], Chest: [0, 1.3098, 0],
    Neck: [0, 1.526, 0], Head: [0, 1.896, 0],
  };
  for (const [prefix, side] of [['R', -1], ['L', 1]]) {
    for (const [name, x, y, z] of [
      ['Shoulder', .33, 1.3616, 0], ['Elbow', .49, 1.1322, 0], ['Wrist', .55, .9472, .025],
      ['Hip', .20, .7326, 0], ['Knee', .20, .4218, .025], ['Ankle', .20, .1628, .055],
    ]) expectedRest[`${prefix}.${name}`] = [side * x, y, z];
  }
  const expectedTail = [[0, .7548, -.25], [.28, .5994, -.34], [.58, .5328, -.34], [.86, .5846, -.28], [1.08, .6956, -.18]];
  expectedTail.forEach((point, i) => { expectedRest[`Tail.${i}`] = point; });
  for (const side of [-1, 1]) for (let lane = 0; lane < 3; lane++) {
    expectedRest[`Hair.${side}.${lane}.Root`] = [side * (.42 + lane * .065), [2.196, 2.146, 2.096][lane], -.13 - lane * .07];
    expectedRest[`Hair.${side}.${lane}.Mid`] = [side * (.52 + lane * .065), 1.556, -.19 - lane * .07];
    expectedRest[`Hair.${side}.${lane}.Tip`] = [side * (.50 + lane * .09), [.9842, 1.0175, 1.0508][lane], -.17 - lane * .07];
  }
  const proportionChecks = rig.skeleton.bones.map(bone => {
    const expected = expectedRest[bone.name], actual = bone.getWorldPosition(new THREE.Vector3());
    return { bone: bone.name, expected_world: expected, actual_world: xyz(actual), error: expected ? actual.distanceTo(new THREE.Vector3(...expected)) : null };
  });
  check('all 40 rest bones use the shortened-body coordinates with x/z preserved', proportionChecks.length === 40 && Object.keys(expectedRest).length === 40 && proportionChecks.every(result => result.expected_world && result.error < 1e-9), { bones: proportionChecks });
  const head = rig.skeleton.bones.find(bone => bone.name === 'Head'), neck = rig.skeleton.bones.find(bone => bone.name === 'Neck');
  const headWorld = head.getWorldPosition(new THREE.Vector3()), neckWorld = neck.getWorldPosition(new THREE.Vector3());
  check('bind head center is 1.896 with unit head/body/root scale', Math.abs(headWorld.y - 1.896) < 1e-9 && Math.abs(headWorld.distanceTo(neckWorld) - .37) < 1e-9 && head.scale.distanceTo(new THREE.Vector3(1, 1, 1)) < 1e-9 && rig.body.scale.distanceTo(new THREE.Vector3(1, 1, 1)) < 1e-9 && rig.root.scale.distanceTo(new THREE.Vector3(1, 1, 1)) < 1e-9, { head_center: xyz(headWorld), neck_center: xyz(neckWorld), neck_to_head_distance: headWorld.distanceTo(neckWorld), head_scale: xyz(head.scale), body_scale: xyz(rig.body.scale), root_scale: xyz(rig.root.scale) });
  const pelvis = rig.skeleton.bones.find(b => b.name === 'Pelvis');
  const pelvisWorld = pelvis.getWorldPosition(new THREE.Vector3());
  check('shortened pelvis root position is applied exactly once', pelvis.parent === rig.body && pelvisWorld.distanceTo(new THREE.Vector3(0, .7622, 0)) < 1e-9 && pelvis.position.distanceTo(pelvisWorld) < 1e-9 && rig.body.position.length() < 1e-9 && rig.root.position.length() < 1e-9, { expected_world: [0, .7622, 0], pelvis_local: xyz(pelvis.position), pelvis_world: xyz(pelvisWorld), body_position: xyz(rig.body.position), root_position: xyz(rig.root.position) });
  const tailChecks = expectedTail.map((expected, i) => {
    const bone = rig.skeleton.bones.find(b => b.name === `Tail.${i}`);
    const expectedParent = i ? `Tail.${i - 1}` : 'Pelvis';
    const expectedLocal = new THREE.Vector3(...expected).sub(new THREE.Vector3(...(i ? expectedTail[i - 1] : [0, .7622, 0])));
    const worldPosition = bone.getWorldPosition(new THREE.Vector3());
    return { bone: bone.name, parent: bone.parent.name, expected_parent: expectedParent, expected_local: xyz(expectedLocal), expected_world: expected, local_position: xyz(bone.position), world_position: xyz(worldPosition), local_error: bone.position.distanceTo(expectedLocal), world_error: worldPosition.distanceTo(new THREE.Vector3(...expected)) };
  });
  check('tail parent chain and initial local/world transforms', tailChecks.every(t => t.parent === t.expected_parent && t.local_error < 1e-9 && t.world_error < 1e-9), { tail: tailChecks });
  // Moving the containing group must not apply its transform twice to skinning.
  rig.root.position.set(1.2, .4, -.8);
  rig.root.rotation.y = .7;
  refresh(rig);
  let maxMovedLocalError = 0, maxMovedWorldError = 0;
  const expectedWorld = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    raw.fromBufferAttribute(position, i);
    rig.body.getVertexPosition(i, deformed);
    maxMovedLocalError = Math.max(maxMovedLocalError, raw.distanceTo(deformed));
    expectedWorld.copy(raw).applyMatrix4(rig.root.matrixWorld);
    deformed.applyMatrix4(rig.body.matrixWorld);
    maxMovedWorldError = Math.max(maxMovedWorldError, expectedWorld.distanceTo(deformed));
  }
  check('moving root group preserves skin coordinates and applies world transform once', maxMovedLocalError < 1e-5 && maxMovedWorldError < 1e-5, { max_local_error: maxMovedLocalError, max_world_error: maxMovedWorldError });
  release(rig);

  check('public default tuning explicitly selects body 0.74 and uniform head 1.08', defaultTuning.bodyScale === .74 && defaultTuning.headScale === 1.08 && defaultTuning.headWidth === 1, { body_scale: defaultTuning.bodyScale, head_scale: defaultTuning.headScale, head_width: defaultTuning.headWidth });
  const defaultRig = makeRig();
  refresh(defaultRig);
  const defaultHead = defaultRig.skeleton.bones.find(bone => bone.name === 'Head');
  const defaultPivot = new THREE.Vector3(0, 1.896, 0);
  const belongsToHead = defaultRig.skeleton.bones.map(bone => {
    for (let parent = bone; parent; parent = parent.parent) if (parent === defaultHead) return true;
    return false;
  });
  const defaultGeometry = defaultRig.body.geometry;
  let headVertices = 0, bodyVertices = 0, defaultHeadError = 0, defaultBodyError = 0, defaultHeadMotion = 0;
  const originalVertex = new THREE.Vector3(), posedVertex = new THREE.Vector3(), expectedVertex = new THREE.Vector3();
  for (let i = 0; i < defaultGeometry.attributes.position.count; i++) {
    originalVertex.fromBufferAttribute(defaultGeometry.attributes.position, i);
    defaultRig.body.getVertexPosition(i, posedVertex);
    let headWeight = 0;
    for (let j = 0; j < 4; j++) if (belongsToHead[component(defaultGeometry.attributes.skinIndex, i, j)]) headWeight += component(defaultGeometry.attributes.skinWeight, i, j);
    // Independently expected LBS for a single uniform post-bind enlargement:
    // every head-descendant influence scales about the known bind head pivot,
    // while all remaining influences keep the raw bind vertex unchanged.
    expectedVertex.copy(originalVertex).sub(defaultPivot).multiplyScalar(.08 * headWeight).add(originalVertex);
    const error = posedVertex.distanceTo(expectedVertex);
    if (headWeight > 0) {
      headVertices++; defaultHeadError = Math.max(defaultHeadError, error);
      defaultHeadMotion = Math.max(defaultHeadMotion, posedVertex.distanceTo(originalVertex));
    } else { bodyVertices++; defaultBodyError = Math.max(defaultBodyError, error); }
  }
  check('default posed head is uniform 1.08 at the unchanged bind pivot', defaultHead.scale.distanceTo(new THREE.Vector3(1.08, 1.08, 1.08)) < 1e-9 && defaultHead.getWorldPosition(new THREE.Vector3()).distanceTo(defaultPivot) < 1e-9 && defaultRig.body.scale.distanceTo(new THREE.Vector3(1, 1, 1)) < 1e-9 && defaultRig.root.scale.distanceTo(new THREE.Vector3(1, 1, 1)) < 1e-9, { head_scale: xyz(defaultHead.scale), head_pivot: xyz(defaultHead.getWorldPosition(new THREE.Vector3())) });
  check('default head scale really deforms head vertices without scaling body vertices', headVertices > 0 && bodyVertices > 0 && defaultHeadMotion > .01 && defaultHeadError < 1e-5 && defaultBodyError < 1e-5, { head_vertex_count: headVertices, body_vertex_count: bodyVertices, maximum_head_motion: defaultHeadMotion, max_head_expected_error: defaultHeadError, max_body_unchanged_error: defaultBodyError });
  const defaultSnapshot = snapshot(defaultRig, makeSamples(defaultRig.body)), defaultFace = inspectFaceGeometry(defaultRig);
  check('default enlarged head and all face attributes remain finite', defaultSnapshot.allFinite && defaultFace.all_finite, defaultFace);
  release(defaultRig);

  const minimumRig = makeRig({ bodyScale: .60, headScale: 1 });
  minimumRig.skeleton.pose(); refresh(minimumRig);
  const minimumPelvis = minimumRig.skeleton.bones.find(bone => bone.name === 'Pelvis').getWorldPosition(new THREE.Vector3());
  const minimumHead = minimumRig.skeleton.bones.find(bone => bone.name === 'Head').getWorldPosition(new THREE.Vector3());
  check('body shortening clamps below-range input to the explicit 0.68 minimum', minimumPelvis.distanceTo(new THREE.Vector3(0, .7004, 0)) < 1e-9 && minimumHead.distanceTo(new THREE.Vector3(0, 1.782, 0)) < 1e-9, { requested_body_scale: .60, expected_effective_body_scale: .68, pelvis: xyz(minimumPelvis), head: xyz(minimumHead) });
  release(minimumRig);

  const widthRig = makeRig({ headWidth: 1.07 }), widthSamples = makeSamples(widthRig.body);
  let widthFinite = snapshot(widthRig, widthSamples).allFinite && inspectFaceGeometry(widthRig).all_finite;
  for (let frame = 1; frame <= 30; frame++) {
    widthRig.update(1 / 60, frame / 60, { action: 'walk' });
    widthFinite &&= snapshot(widthRig, widthSamples).allFinite;
  }
  widthFinite &&= inspectFaceGeometry(widthRig).all_finite;
  check('non-unit headWidth 1.07 keeps skinned geometry and face finite during movement', widthFinite && Object.values(widthRig.body.geometry.attributes).every(attribute => finite(attribute.array)), { head_width: 1.07, frames: 30 });
  release(widthRig);

  const dt = 1 / 60;
  for (const action of ['idle', 'wave', 'walk', 'turn']) {
    const actionRig = makeRig(), samples = makeSamples(actionRig.body);
    actionRig.setAction(action);
    const baseline = snapshot(actionRig, samples);
    const neutralFaceHash = faceGeometryHash(actionRig);
    const faceBaseline = inspectFaceGeometry(actionRig);
    let faceFinite = faceBaseline.all_finite;
    const faceFrames = [0];
    const faceFailures = faceFinite ? [] : [{ frame: 0, ...faceBaseline }];
    let previous = baseline, allFinite = baseline.allFinite;
    let maxLocalDeformation = 0, maxWorldDisplacement = 0, maxFrameVertexStep = 0, maxFrameBoneAngle = 0, maxRootAngle = 0;
    const changedBones = new Set(), poses = [selectedPose(actionRig, 0)];
    const localAngleMax = new Map();
    const captureFrames = new Set([15, 30, 60, 120, 180, 240, 300, 360]);
    for (let frame = 1; frame <= 360; frame++) {
      actionRig.update(dt, frame * dt, { action, talking: false, mood: 'neutral' });
      const current = snapshot(actionRig, samples);
      allFinite &&= current.allFinite;
      maxLocalDeformation = Math.max(maxLocalDeformation, maxPointDistance(current.local, baseline.local));
      maxWorldDisplacement = Math.max(maxWorldDisplacement, maxPointDistance(current.world, baseline.world));
      maxFrameVertexStep = Math.max(maxFrameVertexStep, maxPointDistance(current.world, previous.world));
      maxFrameBoneAngle = Math.max(maxFrameBoneAngle, boneDifference(current, previous));
      maxRootAngle = Math.max(maxRootAngle, quat(current.rootQuaternion).angleTo(new THREE.Quaternion()));
      for (let i = 0; i < current.bones.length; i++) {
        const angle = quat(current.bones[i].localQuaternion).angleTo(quat(baseline.bones[i].localQuaternion));
        localAngleMax.set(current.bones[i].name, Math.max(localAngleMax.get(current.bones[i].name) || 0, angle));
        if (angle > 1e-5) changedBones.add(current.bones[i].name);
      }
      if (captureFrames.has(frame)) {
        poses.push(selectedPose(actionRig, frame * dt));
        const faceProbe = inspectFaceGeometry(actionRig);
        faceFinite = faceFinite && faceProbe.all_finite;
        if (!faceProbe.all_finite) faceFailures.push({ frame, ...faceProbe });
        faceFrames.push(frame);
      }
      previous = current;
    }
    const actionResult = {
      frames: 360, duration_seconds: 6, sample_vertex_count: samples.length,
      all_finite: allFinite, changed_bones: [...changedBones],
      max_local_skinned_vertex_deformation: maxLocalDeformation,
      max_world_vertex_displacement: maxWorldDisplacement,
      max_adjacent_frame_world_vertex_step: maxFrameVertexStep,
      max_adjacent_frame_bone_angle_radians: maxFrameBoneAngle,
      max_root_rotation_angle_radians: maxRootAngle,
      face_geometry: { ...faceBaseline, all_finite: faceFinite, sampled_frames: faceFrames, invalid_samples: faceFailures },
      poses,
    };
    report.actions[action] = actionResult;
    check(`${action}: finite bone matrices, sampled skinned vertices and face attributes`, allFinite && faceFinite, { face_mesh_count: faceBaseline.mesh_count, face_vertices_scanned_per_capture: faceBaseline.vertex_count, face_sample_frames: faceFrames });
    check(`${action}: real local skin deformation and changing bones`, maxLocalDeformation > 1e-5 && changedBones.size > 0, { max_local_deformation: maxLocalDeformation, changed_bone_count: changedBones.size });
    check(`${action}: adjacent-frame transform continuity at 60 Hz`, maxFrameVertexStep < .20 && maxFrameBoneAngle < .20, { max_vertex_step: maxFrameVertexStep, max_bone_angle_radians: maxFrameBoneAngle, allowed_vertex_step: .20, allowed_bone_angle_radians: .20 });
    if (action === 'wave') check('wave: right shoulder and wrist actually animate', localAngleMax.get('R.Shoulder') > 1 && localAngleMax.get('R.Wrist') > .1, { shoulder_rotation_radians: localAngleMax.get('R.Shoulder'), wrist_rotation_radians: localAngleMax.get('R.Wrist') });
    if (action === 'walk') check('walk: both hips and knees actually animate', ['L.Hip', 'R.Hip'].every(n => localAngleMax.get(n) > .3) && ['L.Knee', 'R.Knee'].every(n => localAngleMax.get(n) > .3), { rotation_radians: Object.fromEntries(['L.Hip', 'R.Hip', 'L.Knee', 'R.Knee'].map(n => [n, localAngleMax.get(n)])) });
    if (action === 'turn') check('turn: full rotation returns to equivalent neutral orientation', maxRootAngle > 3 && Math.abs(actionRig.root.rotation.y) < 1e-9 && actionRig.root.userData.actionCompleted === true, { completed: actionRig.root.userData.actionCompleted, final_rotation_y: actionRig.root.rotation.y, peak_orientation_angle: maxRootAngle });
    const pausedBefore = snapshot(actionRig, samples), pausedTime = actionRig.root.userData.animationTime, pausedFaceBefore = faceGeometryHash(actionRig);
    for (let i = 0; i < 30; i++) actionRig.update(dt, 6 + i * dt, { action, paused: true, talking: true });
    const pausedAfter = snapshot(actionRig, samples);
    const pausedVertexDelta = maxDelta(pausedBefore.world, pausedAfter.world);
    const pausedBoneDelta = Math.max(...pausedBefore.bones.map((bone, i) => maxDelta(bone.localQuaternion, pausedAfter.bones[i].localQuaternion)));
    const faceUnchanged = pausedFaceBefore === faceGeometryHash(actionRig);
    check(`${action}: paused update freezes animation including face geometry`, pausedVertexDelta < 1e-12 && pausedBoneDelta < 1e-12 && pausedTime === actionRig.root.userData.animationTime && faceUnchanged, { max_vertex_component_delta: pausedVertexDelta, max_local_bone_quaternion_component_delta: pausedBoneDelta, time_unchanged: pausedTime === actionRig.root.userData.animationTime, face_attributes_and_visibility_unchanged: faceUnchanged });
    actionRig.resetPose({ paused: true, talking: false, mood: 'neutral' });
    const reset = snapshot(actionRig, samples), resetFace = inspectFaceGeometry(actionRig);
    const resetVertexError = maxPointDistance(reset.world, baseline.world);
    const resetBoneError = Math.max(...baseline.bones.map((bone, i) => maxDelta(bone.localQuaternion, reset.bones[i].localQuaternion)));
    const resetFaceMatches = neutralFaceHash === faceGeometryHash(actionRig);
    const resetClock = actionRig.root.userData.animationTime;
    actionRig.update(dt, 7, { action: 'idle', paused: true, talking: true });
    const stillPaused = snapshot(actionRig, samples);
    const resetPauseError = maxDelta(reset.world, stillPaused.world);
    actionResult.reset_pose = { max_vertex_error_from_initial_neutral: resetVertexError, max_bone_quaternion_component_error: resetBoneError, face_matches_initial_neutral: resetFaceMatches, animation_time: resetClock, max_subsequent_paused_vertex_error: resetPauseError };
    check(`${action}: resetPose restores finite neutral stance even when paused`, reset.allFinite && resetFace.all_finite && resetVertexError < 1e-5 && resetBoneError < 1e-9 && resetFaceMatches && resetClock === 0 && actionRig.root.userData.currentAction === 'idle' && actionRig.root.userData.actionCompleted === false && resetPauseError < 1e-12 && actionRig.root.userData.animationTime === 0, actionResult.reset_pose);
    release(actionRig);
  }

  const transitionRig = makeRig(), transitionSamples = makeSamples(transitionRig.body);
  let elapsed = 0, previous = snapshot(transitionRig, transitionSamples), transitionStep = 0, transitionAngle = 0, transitionsFinite = true;
  const transitions = [{ action: 'idle', frames: 60 }, { action: 'wave', frames: 90 }, { action: 'walk', frames: 90 }, { action: 'turn', frames: 90 }, { action: 'idle', frames: 90 }];
  for (const segment of transitions) {
    transitionRig.setAction(segment.action);
    for (let frame = 0; frame < segment.frames; frame++) {
      elapsed += dt; transitionRig.update(dt, elapsed, { action: segment.action });
      const current = snapshot(transitionRig, transitionSamples);
      transitionsFinite &&= current.allFinite;
      transitionStep = Math.max(transitionStep, maxPointDistance(current.world, previous.world));
      transitionAngle = Math.max(transitionAngle, boneDifference(current, previous));
      previous = current;
    }
  }
  report.transitions = { sequence: transitions, max_vertex_step: transitionStep, max_bone_angle_radians: transitionAngle, all_finite: transitionsFinite };
  check('action switching including interrupted turn remains continuous', transitionsFinite && transitionStep < .20 && transitionAngle < .20, report.transitions);
  release(transitionRig);
} catch (error) {
  report.error = { message: error.message, stack: error.stack };
  check('verification completes without exception', false);
} finally {
  for (const rig of activeRigs) { try { rig.dispose(); } catch {} }
}

report.source.sha256_after = hash(sourcePath);
for (const dependency of report.source.dependencies) dependency.sha256_after = hash(dependency.path);
check('character and face/hair/costume/tuning sources unchanged during independent verification', sourceHash === report.source.sha256_after && report.source.dependencies.every(source => source.sha256 === source.sha256_after), { files_checked: ['character.js', ...report.source.dependencies.map(source => path.basename(source.path))] });
report.source.source_set_sha256 = crypto.createHash('sha256').update([['character.js', sourceHash], ...dependencies.map(source => [path.basename(source.path), source.sha256])].map(([name, sha256]) => `${name}:${sha256}`).join('\n')).digest('hex');
report.summary = { passed: report.checks.filter(c => c.passed).length, failed: report.checks.filter(c => !c.passed).length };
report.passed = report.summary.failed === 0;
const output = path.join(directory, 'verification.json');
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ passed: report.passed, passed_checks: report.summary.passed, failed_checks: report.summary.failed, source_sha256: sourceHash, dependency_sha256: Object.fromEntries(dependencies.map(source => [path.basename(source.path), source.sha256])), source_set_sha256: report.source.source_set_sha256, output, failures: report.checks.filter(c => !c.passed).map(check => check.name), error: report.error?.message }, null, 2));
if (!report.passed) process.exitCode = 1;
