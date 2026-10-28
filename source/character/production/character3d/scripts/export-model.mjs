import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const library = path.resolve(project, '../..');
const prototype = path.join(library, 'production/rig3d-prototype');
const assets = path.join(project, 'assets');
fs.mkdirSync(assets, { recursive: true });
const hash = filename => crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
const sourceFiles = ['character.js', 'face.js', 'hair.js', 'costume.js', 'tuning.js', 'physics.js'];
const sourcesBefore = Object.fromEntries(sourceFiles.map(name => [name, hash(path.join(prototype, name))]));
const THREE = await import(pathToFileURL(path.join(prototype, 'vendor/three.module.js')));
const { createCharacter } = await import(pathToFileURL(path.join(prototype, 'character.js')));
const { defaultTuning } = await import(pathToFileURL(path.join(prototype, 'tuning.js')));
const { createSecondaryPhysics } = await import(pathToFileURL(path.join(prototype, 'physics.js')));
const { GLTFExporter } = await import(pathToFileURL(path.join(prototype, 'vendor/package/examples/jsm/exporters/GLTFExporter.js')));

// Official GLTFExporter uses browser FileReader only to consume Blob buffers.
// Node's Blob already implements arrayBuffer; callbacks remain asynchronous.
globalThis.FileReader ??= class FileReader {
  result = null; error = null;
  readAsArrayBuffer(blob) { this.#read(blob, false); }
  readAsDataURL(blob) { this.#read(blob, true); }
  #read(blob, dataURL) {
    blob.arrayBuffer().then(buffer => {
      this.result = dataURL ? `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(buffer).toString('base64')}` : buffer;
      this.onload?.({ target: this }); this.onloadend?.({ target: this });
    }).catch(error => { this.error = error; this.onerror?.({ target: this }); this.onloadend?.({ target: this }); });
  }
};

const tuning = { ...defaultTuning };
const rig = createCharacter(tuning);
const morphNames = ['blink', 'aa', 'happy', 'sad'];
const neutral = { blink: 0, talking: 0, mood: 'neutral' };
const faceMeshes = [];
rig.face.root.traverse(object => { if (object.isMesh) faceMeshes.push(object); });
if (rig.skeleton.bones.length !== 40 || !faceMeshes.length) throw new Error('Expected 40 bones and exposed facial geometry');
const report = {
  schema_version: 1, status: 'building', source_hashes_before: sourcesBefore,
  tuning_source: 'defaultTuning exported by the public local tuning.js module; no browser storage read',
  tuning, bones: rig.skeleton.bones.map(b => b.name), facial_mesh_count: faceMeshes.length,
  face_morphs: [], animations: [],
  scope: 'Editable procedural character source with baked geometry, skin, colours, morphs and actions; not finished VRM or production topology.',
};
const headBone = rig.skeleton.bones.find(bone => bone.name === 'Head');
const expectedHeadScale = tuning.headScale ?? 1;
if (headBone.scale.toArray().some(value => Math.abs(value - expectedHeadScale) > 1e-8)) throw new Error('Default neutral Head scale does not match tuning');
report.neutral_proportions = { body_scale: tuning.bodyScale, head_local_scale: headBone.scale.toArray(), head_world_scale: headBone.getWorldScale(new THREE.Vector3()).toArray(), head_scale_applies_before_any_action: true };
const assertFinite = (array, label) => { if (!Array.from(array).every(Number.isFinite)) throw new Error(`Non-finite values: ${label}`); };
function captureFace() {
  return faceMeshes.map(mesh => {
    const g = mesh.geometry;
    assertFinite(g.attributes.position.array, mesh.name);
    return { position: g.attributes.position.clone(), normal: g.attributes.normal?.clone(), count: g.attributes.position.count, index: g.index ? hashBytes(g.index.array) : null, visible: mesh.visible };
  });
}
function hashBytes(array) { return crypto.createHash('sha256').update(Buffer.from(array.buffer, array.byteOffset, array.byteLength)).digest('hex'); }

// Fixed time prevents gaze or the automatic blink from contaminating a target.
rig.face.update(0, 0, neutral);
const basis = captureFace();
const targets = {};
for (const name of morphNames) {
  const state = { ...neutral };
  if (name === 'blink') state.blink = 1;
  if (name === 'aa') state.talking = 1;
  if (name === 'happy' || name === 'sad') state.mood = name;
  rig.face.update(0, 0, state);
  targets[name] = captureFace();
  for (let i = 0; i < faceMeshes.length; i++) if (targets[name][i].count !== basis[i].count || targets[name][i].index !== basis[i].index) throw new Error(`Topology changed for ${faceMeshes[i].name}/${name}`);
}
rig.face.update(0, 0, neutral);
for (let i = 0; i < faceMeshes.length; i++) {
  const mesh = faceMeshes[i], geometry = mesh.geometry;
  geometry.setAttribute('position', basis[i].position.clone());
  if (basis[i].normal) geometry.setAttribute('normal', basis[i].normal.clone());
  geometry.morphTargetsRelative = false;
  geometry.morphAttributes.position = morphNames.map(name => { const attribute = targets[name][i].position.clone(); attribute.name = name; return attribute; });
  if (basis[i].normal) geometry.morphAttributes.normal = morphNames.map(name => { const attribute = targets[name][i].normal.clone(); attribute.name = name; return attribute; });
  mesh.updateMorphTargets(); mesh.morphTargetInfluences.fill(0);
  // All nodes are exported. Neutral tongue/teeth and closed irises already
  // collapse geometrically in createFace; visibility is not the only mechanism.
  mesh.userData.dafeiyu_neutral_visible = basis[i].visible;
  mesh.userData.dafeiyu_morph_topology_verified = true;
  mesh.visible = true;
  const deltas = {};
  for (const name of morphNames) {
    let maximum = 0;
    const target = targets[name][i].position.array, base = basis[i].position.array;
    for (let k = 0; k < base.length; k++) maximum = Math.max(maximum, Math.abs(target[k] - base[k]));
    deltas[name] = maximum;
  }
  report.face_morphs.push({ name: mesh.name, vertices: basis[i].count, targets: morphNames, max_position_component_deltas: deltas, neutral_visible: basis[i].visible });
}

const rest = rig.skeleton.bones.map(b => ({ position: b.position.clone(), quaternion: b.quaternion.clone(), scale: b.scale.clone() }));
const rootRest = { position: rig.root.position.clone(), quaternion: rig.root.quaternion.clone(), scale: rig.root.scale.clone() };
const clips = [];
for (const [action, duration] of [['idle', 4.7], ['wave', 4], ['walk', 4], ['turn', 4]]) {
  const actor = createCharacter(tuning);
  const secondary = createSecondaryPhysics(actor);
  actor.setAction(action);
  const fps = 30, frames = Math.round(duration * fps), times = [], rotations = actor.skeleton.bones.map(() => []), pelvisPositions = [];
  const previous = actor.skeleton.bones.map(() => new THREE.Quaternion());
  let maxPhysicsLengthError = 0, maxPhysicsPenetration = 0;
  for (let frame = 0; frame <= frames; frame++) {
    const time = frame / fps;
    if (frame) {
      actor.update(1 / fps, time, { ...neutral, action });
      const physical = secondary.update(1 / fps, { hairSway: tuning.hairSway, tailSway: tuning.tailSway });
      if (!physical.finite) throw new Error(`Non-finite secondary physics in ${action}/${frame}`);
      maxPhysicsLengthError = Math.max(maxPhysicsLengthError, physical.maxLengthError);
      maxPhysicsPenetration = Math.max(maxPhysicsPenetration, physical.maxPenetration);
    }
    times.push(time);
    for (let i = 0; i < actor.skeleton.bones.length; i++) {
      const bone = actor.skeleton.bones[i], quaternion = bone.quaternion.clone();
      // Rotation about the vertical axis through the pelvis equals root yaw:
      // both axes share x=z=0, so one armature action stores the full turn.
      if (bone.name === 'Pelvis') quaternion.premultiply(actor.root.quaternion);
      if (frame && quaternion.dot(previous[i]) < 0) quaternion.set(-quaternion.x, -quaternion.y, -quaternion.z, -quaternion.w);
      previous[i].copy(quaternion); rotations[i].push(...quaternion.toArray());
    }
    pelvisPositions.push(...actor.skeleton.bones.find(b => b.name === 'Pelvis').position.toArray());
  }
  const tracks = rig.skeleton.bones.map((bone, i) => new THREE.QuaternionKeyframeTrack(`${bone.uuid}.quaternion`, times, rotations[i]));
  const pelvis = rig.skeleton.bones.find(b => b.name === 'Pelvis');
  tracks.push(new THREE.VectorKeyframeTrack(`${pelvis.uuid}.position`, times, pelvisPositions));
  for (const track of tracks) { assertFinite(track.values, track.name); assertFinite(track.times, track.name); }
  clips.push(new THREE.AnimationClip(action, duration, tracks));
  report.animations.push({ name: action, duration_seconds: duration, fps, frames: frames + 1, tracks: tracks.length, root_yaw_baked_into_pelvis: true, walk_is_in_place: action === 'walk', secondary_physics: { baked: true, source: 'physics.js world-space fixed-step Verlet bone dynamics; not editable native physics constraints', chains: secondary.debugInfo.chainCount, simulated_bones: secondary.debugInfo.simulatedBoneCount, finite: secondary.debugInfo.finite, max_length_error: maxPhysicsLengthError, max_tip_collider_penetration: maxPhysicsPenetration } });
  secondary.dispose();
  actor.dispose();
}

// Export in neutral rest pose after baking. Never bake an accidental animation
// frame into inverse bind matrices or facial basis geometry.
rig.skeleton.bones.forEach((bone, i) => { bone.position.copy(rest[i].position); bone.quaternion.copy(rest[i].quaternion); bone.scale.copy(rest[i].scale); });
rig.root.position.copy(rootRest.position); rig.root.quaternion.copy(rootRest.quaternion); rig.root.scale.copy(rootRest.scale);
rig.face.update(0, 0, neutral);
for (const mesh of faceMeshes) { mesh.visible = true; mesh.morphTargetInfluences.fill(0); }
rig.root.updateMatrixWorld(true); rig.skeleton.update();

const materialCopies = new Map();
function standardMaterial(source) {
  if (materialCopies.has(source)) return materialCopies.get(source);
  const color = source.color?.clone() || new THREE.Color(0xffffff);
  const material = new THREE.MeshStandardMaterial({
    color, roughness: 1, metalness: 0, side: source.side ?? THREE.FrontSide,
    vertexColors: Boolean(source.vertexColors), transparent: source.transparent,
    opacity: source.opacity ?? 1, depthWrite: source.depthWrite ?? true,
  });
  material.name = source.name || source.type;
  material.userData = {
    dafeiyu_source_type: source.type,
    dafeiyu_base_color_linear: color.toArray(),
    dafeiyu_vertex_colors: Boolean(source.vertexColors),
    dafeiyu_flat_facial_color: Boolean(source.isMeshBasicMaterial),
    dafeiyu_native_shader_intent: 'Restore native toon/emission shading while preserving original base and vertex colours.',
  };
  materialCopies.set(source, material); return material;
}
rig.root.traverse(mesh => {
  if (!mesh.isMesh) return;
  mesh.material = Array.isArray(mesh.material) ? mesh.material.map(standardMaterial) : standardMaterial(mesh.material);
  for (const [name, attribute] of Object.entries(mesh.geometry.attributes)) assertFinite(attribute.array, `${mesh.name}/${name}`);
});
rig.root.userData.dafeiyu_native_source = { defaultTuning: tuning, expressions: morphNames, clips: clips.map(c => c.name), source_hashes: sourcesBefore, generated_avatar: false, status: 'editable_procedural_refinement_source' };
const exporter = new GLTFExporter();
const glb = await exporter.parseAsync(rig.root, { binary: true, onlyVisible: false, animations: clips, trs: true, includeCustomExtensions: false });
const output = path.join(assets, 'dafeiyu-body-rig-v1.glb');
fs.writeFileSync(output, Buffer.from(glb));

const data = Buffer.from(glb), jsonLength = data.readUInt32LE(12);
const gltf = JSON.parse(data.subarray(20, 20 + jsonLength).toString('utf8'));
const skins = gltf.skins || [];
const primitives = (gltf.meshes || []).flatMap(mesh => mesh.primitives);
if (!skins.some(s => s.joints.length === 40)) throw new Error('GLB lost the 40-joint skin');
const exportedHead = gltf.nodes.find(node => node.name === 'Head');
if (!exportedHead || (exportedHead.scale ?? [1, 1, 1]).some(value => Math.abs(value - expectedHeadScale) > 1e-7)) throw new Error('GLB default Head node lost the neutral head scale');
if (!primitives.some(p => p.attributes.JOINTS_0 != null && p.attributes.WEIGHTS_0 != null && p.attributes.COLOR_0 != null)) throw new Error('GLB lost skin or vertex colours');
for (const name of ['idle', 'wave', 'walk', 'turn']) if (!(gltf.animations || []).some(a => a.name === name)) throw new Error(`Missing animation ${name}`);
const facialTargetMeshes = gltf.meshes.filter(mesh => morphNames.every(name => mesh.extras?.targetNames?.includes(name)));
if (facialTargetMeshes.length !== faceMeshes.length) throw new Error(`Morph mesh count mismatch: ${facialTargetMeshes.length}/${faceMeshes.length}`);
report.gltf = { meshes: gltf.meshes.length, facial_target_meshes: facialTargetMeshes.length, skins: skins.map(s => ({ joints: s.joints.length })), animation_names: gltf.animations.map(a => a.name), color_primitives: primitives.filter(p => p.attributes.COLOR_0 != null).length, skin_primitives: primitives.filter(p => p.attributes.JOINTS_0 != null).length, default_head_node_scale: exportedHead.scale ?? [1, 1, 1] };
report.source_hashes_after = Object.fromEntries(sourceFiles.map(name => [name, hash(path.join(prototype, name))]));
report.changed_sources = sourceFiles.filter(name => sourcesBefore[name] !== report.source_hashes_after[name]);
report.status = report.changed_sources.length ? 'exported_source_changed_during_build' : 'exported_verified';
report.output = { path: output, bytes: fs.statSync(output).size, sha256: hash(output) };
report.exporter_script_sha256 = hash(fileURLToPath(import.meta.url));
fs.writeFileSync(path.join(project, 'export-model-verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, output: report.output, gltf: report.gltf, changed_sources: report.changed_sources }, null, 2));
for (const material of materialCopies.values()) material.dispose();
rig.dispose();
