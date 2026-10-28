import * as THREE from './vendor/three.module.js';
import { createFace } from './face.js?v=refine5';
import { buildHair } from './hair.js?v=refine5';
import { buildCostume } from './costume.js?v=refine5';
import { MToonMaterial } from './vendor/three-vrm-3.5.5.module.js';

// First visual refinement of the procedural rig, guided by the selected character references.
// All positions are metres-like scene units: sole y=0, face toward +Z.
export function createCharacter(tuning = {}) {
  const root = new THREE.Group();
  root.name = 'Dafeiyu / refined 3D study v2';
  const resources = new Set();
  const colors = {
    skin: 0xffdeca, navy: 0x172743, dress: 0x293b60, white: 0xfff8ed,
    hair: 0x344f8d, hairLight: 0x5695c9, hairShade: 0x24375f, hairShine: 0x708fc0, hairGradient: 0xffffff, tail: tuning.tailColor||0x304c7b, tailLight: tuning.tailLightColor||0x5e78a5,
    ink: 0x111b32, iris: 0x397ec2, irisLight: 0x82c9eb, blush: 0xe7a4a0,
    gold: 0xc3a66a, mouth: 0x6e343e, tongue: 0xf19b9e
  };
  const mats = {};
  const matList = [];
  const matIndex = {};
  for (const [name, color] of Object.entries(colors)) {
    const base=new THREE.Color(name==='dress'&&tuning.dressColor?tuning.dressColor:color);
    const m = new MToonMaterial({color:base,shadeColorFactor:base.clone().multiplyScalar(.74),shadingToonyFactor:tuning.shadingToony??.82,shadingShiftFactor:tuning.shadingShift??.06,giEqualizationFactor:.85,ignoreVertexColor:name!=='hairGradient',vertexColors:name==='hairGradient'});
    m.name=name;
    mats[name] = m;
    matIndex[name] = matList.length;
    matList.push(m);
    resources.add(m);
  }
  mats.white.side = THREE.DoubleSide;
  const bones = [], boneIds = new Map(), bindPositions = new Map();
  function bone(name, parent, xyz) {
    const b = new THREE.Bone();
    b.name = name;
    const world = new THREE.Vector3(...xyz);
    b.position.copy(world);
    if (parent) {
      b.position.sub(bindPositions.get(parent));
      parent.add(b);
    }
    boneIds.set(b, bones.length);
    bones.push(b);
    bindPositions.set(b, world);
    return b;
  }
  const pelvis = bone('Pelvis', null, [0, 1.03, 0]);
  const spine = bone('Spine', pelvis, [0, 1.42, 0]);
  const chest = bone('Chest', spine, [0, 1.77, 0]);
  const neck = bone('Neck', chest, [0, 2.02, 0]);
  const head = bone('Head', neck, [0, 2.39, 0]);
  const limbs = [];
  for (const side of [-1, 1]) {
    const n = side < 0 ? 'R' : 'L';
    const shoulder = bone(`${n}.Shoulder`, chest, [side * .33, 1.84, 0]);
    const elbow = bone(`${n}.Elbow`, shoulder, [side * .49, 1.53, 0]);
    const wrist = bone(`${n}.Wrist`, elbow, [side * .55, 1.28, .025]);
    const hip = bone(`${n}.Hip`, pelvis, [side * .20, .99, 0]);
    const knee = bone(`${n}.Knee`, hip, [side * .20, .57, .025]);
    const ankle = bone(`${n}.Ankle`, knee, [side * .20, .22, .055]);
    limbs.push({ side, shoulder, elbow, wrist, hip, knee, ankle });
  }
  const tailPoints = [
    [0, 1.02, -.25], [.28, .81, -.34], [.58, .72, -.34],
    [.86, .79, -.28], [1.08, .94, -.18]
  ].map(p => new THREE.Vector3(...p));
  const tailBones = tailPoints.map((p, i) => bone(`Tail.${i}`, i ? null : pelvis, p.toArray()));
  // The chain is built after allocating all bones so IDs remain stable.
  for (let i = 1; i < tailBones.length; i++) {
    tailBones[i].position.copy(tailPoints[i]).sub(tailPoints[i - 1]);
    tailBones[i - 1].add(tailBones[i]);
  }
  const hairChains = [];
  for (const side of [-1, 1]) {
    for (let lane = 0; lane < 3; lane++) {
      const p = [
        new THREE.Vector3(side * (.42 + lane * .065), 2.69 - lane * .05, -.13 - lane * .07),
        new THREE.Vector3(side * (.52 + lane * .065), 2.05, -.19 - lane * .07),
        new THREE.Vector3(side * (.50 + lane * .09), 1.33 + lane * .045, -.17 - lane * .07)
      ];
      const a = bone(`Hair.${side}.${lane}.Root`, head, p[0].toArray());
      const b = bone(`Hair.${side}.${lane}.Mid`, a, p[1].toArray());
      const c = bone(`Hair.${side}.${lane}.Tip`, b, p[2].toArray());
      hairChains.push({ side, lane, points: p, bones: [a, b, c] });
    }
  }
  const pos = [], normal = [], indices = [], weights = [], groups = [],vertexColors=[];
  const v = new THREE.Vector3();
  const rigid = b => () => [boneIds.get(b), boneIds.get(b), 1, 0];
  const between = (a, b, coordinate = 'y') => p => {
    const from = bindPositions.get(a)[coordinate], to = bindPositions.get(b)[coordinate];
    const t = THREE.MathUtils.clamp((p[coordinate] - from) / (to - from || 1), 0, 1);
    return [boneIds.get(a), boneIds.get(b), 1 - t, t];
  };
  function add(geometry, material, weighting) {
    const g = geometry.index ? geometry.toNonIndexed() : geometry;
    const p = g.getAttribute('position'), n = g.getAttribute('normal'),col=g.getAttribute('color');
    const start = pos.length / 3;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const w = weighting(v);
      pos.push(v.x, v.y, v.z);
      normal.push(n.getX(i), n.getY(i), n.getZ(i));
      vertexColors.push(col?col.getX(i):1,col?col.getY(i):1,col?col.getZ(i):1);
      indices.push(w[0], w[1], 0, 0);
      weights.push(w[2], w[3], 0, 0);
    }
    groups.push({ start, count: p.count, material: matIndex[material] });
    if (g !== geometry) g.dispose();
    geometry.dispose();
  }
  function ellipsoid(center, size, material, weighting, segments = 24) {
    const g = new THREE.SphereGeometry(1, segments, 16);
    g.scale(...size).translate(...center);
    add(g, material, weighting);
  }
  function segment(a, b, r1, r2, material, weighting) {
    const delta = b.clone().sub(a);
    const g = new THREE.CylinderGeometry(r2, r1, delta.length(), 20, 9);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize()));
    g.translate(...a.clone().add(b).multiplyScalar(.5).toArray());
    add(g, material, weighting);
  }
  function shapeGeometry(shape, depth = .04) {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: .012, bevelSize: .012, bevelSegments: 2, steps: 1, curveSegments: 12 });
    g.translate(0, 0, -depth / 2);
    return g;
  }
  function tube(points, radius, material, weighting, tubular = 32) {
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), tubular, radius, 8, false), material, weighting);
  }
  buildCostume({add,ellipsoid,segment,shapeGeometry,tube,rigid,between,pelvis,spine,chest,neck,limbs,boneIds,bindPositions});
  buildHair({add,ellipsoid,segment,shapeGeometry,tube,rigid,between,head,neck,chest,boneIds,bindPositions,hairChains});
  // Five weighted tail segments; both flukes share the last animated bone.
  const tailCurve = new THREE.CatmullRomCurve3(tailPoints);
  const tailGeometry = new THREE.TubeGeometry(tailCurve, 48, .13, 16, false);
  const tp = tailGeometry.getAttribute('position');
  const tailWeights = [];
  for (let i = 0; i < tp.count; i++) {
    const ring = Math.floor(i / 17), t = ring / 48;
    const c = tailCurve.getPointAt(t), radius = THREE.MathUtils.lerp(1.1, .48, t);
    v.fromBufferAttribute(tp, i).sub(c).multiplyScalar(radius);v.z*=.82;v.y*=1.05;v.add(c);
    tp.setXYZ(i, v.x, v.y, v.z);
    const q = Math.min(3.99999, t * 4), a = Math.floor(q);
    tailWeights[i] = [boneIds.get(tailBones[a]), boneIds.get(tailBones[a + 1]), 1 - (q - a), q - a];
  }
  // Split the same tube into dorsal / ventral groups without changing topology.
  tailGeometry.computeVertexNormals();
  const tubeIndex = tailGeometry.index.array;
  const split = { tail: [], tailLight: [] };
  for (let i = 0; i < tubeIndex.length; i += 3) {
    const ids = [tubeIndex[i], tubeIndex[i + 1], tubeIndex[i + 2]];
    const ny = ids.reduce((s, id) => s + tailGeometry.attributes.normal.getY(id), 0) / 3;
    split[ny < -.22 ? 'tailLight' : 'tail'].push(...ids);
  }
  for (const material of ['tail', 'tailLight']) {
    const p = [], n = [], ws = [];
    for (const id of split[material]) {
      p.push(tp.getX(id), tp.getY(id), tp.getZ(id));
      n.push(tailGeometry.attributes.normal.getX(id), tailGeometry.attributes.normal.getY(id), tailGeometry.attributes.normal.getZ(id));
      ws.push(tailWeights[id]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
    let k = 0; add(g, material, () => ws[k++]);
  }
  tailGeometry.dispose();
  const fluke = new THREE.Shape();
  fluke.moveTo(0, -.075);
  fluke.bezierCurveTo(-.18, -.045, -.34, .015, -.405, .19);
  fluke.bezierCurveTo(-.26, .185, -.13, .19, 0, .055);
  fluke.bezierCurveTo(.13, .19, .26, .185, .405, .19);
  fluke.bezierCurveTo(.34, .015, .18, -.045, 0, -.075); fluke.closePath();
  const end = tailPoints[4];
  const fg = new THREE.ExtrudeGeometry(fluke,{depth:.15,bevelEnabled:true,bevelThickness:.025,bevelSize:.014,bevelSegments:4,curveSegments:24,steps:1});
  const fp=fg.getAttribute('position');
  for(let i=0;i<fp.count;i++){const x=fp.getX(i),y=fp.getY(i),t=Math.min(1,Math.abs(x)/.42);fp.setXYZ(i,x,y+.020*Math.sin(x/.42*Math.PI),(fp.getZ(i)-.075)*(.9-.55*t)+.075*t*t);}
  fg.rotateX(-.55).translate(...end.toArray());fg.computeVertexNormals();
  const fn=fg.getAttribute('normal'),surfaces={tail:{p:[],n:[]},tailLight:{p:[],n:[]}};
  for(let i=0;i<fp.count;i+=3){const ny=(fn.getY(i)+fn.getY(i+1)+fn.getY(i+2))/3,part=surfaces[ny<-.25?'tailLight':'tail'];for(let j=0;j<3;j++){part.p.push(fp.getX(i+j),fp.getY(i+j),fp.getZ(i+j));part.n.push(fn.getX(i+j),fn.getY(i+j),fn.getZ(i+j));}}
  for(const [material,surface]of Object.entries(surfaces)){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(surface.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(surface.n,3));add(g,material,rigid(tailBones[4]));}fg.dispose();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(vertexColors, 3));
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
  // Preserve every vertex/weight while drawing each opaque material once.
  // Each decorative part used to create its own draw call (and outline call).
  const drawIndices=[];
  for(let material=0;material<matList.length;material++){
    const start=drawIndices.length;
    for(const part of groups)if(part.material===material)for(let i=part.start;i<part.start+part.count;i++)drawIndices.push(i);
    if(drawIndices.length>start)geometry.addGroup(start,drawIndices.length-start,material);
  }
  geometry.setIndex(drawIndices);
  // Compress the body below the neck while keeping the head's size. Apply the
  // same rest-space map to geometry and bones before calculating inverse binds.
  const bodyScale=THREE.MathUtils.clamp(tuning.bodyScale??.74,.68,1);
  const proportionY=y=>y<=1.90?y*bodyScale:1.90*bodyScale+y-1.90;
  const gp=geometry.getAttribute('position'),gn=geometry.getAttribute('normal');
  for(let i=0;i<gp.count;i++){
    const y=gp.getY(i),sy=y<=1.90?bodyScale:1;
    gp.setY(i,proportionY(y));v.fromBufferAttribute(gn,i);v.y/=sy;v.normalize();gn.setXYZ(i,v.x,v.y,v.z);
  }
  const headWidth=THREE.MathUtils.clamp(tuning.headWidth??1,.9,1.12);
  const headBones=new Set(bones.filter(b=>{let p=b;while(p){if(p===head)return true;p=p.parent;}return false;}));
  for(let i=0;i<gp.count;i++){const j=indices[i*4],k=indices[i*4+1];if(headBones.has(bones[j])&&headBones.has(bones[k])){gp.setX(i,gp.getX(i)*headWidth);v.fromBufferAttribute(gn,i);v.x/=headWidth;v.normalize();gn.setXYZ(i,v.x,v.y,v.z);}}
  for(const b of bones)if(b!==head&&headBones.has(b))b.position.x*=headWidth;
  for(const b of bones){const parent=b.parent?.isBone?b.parent:null;const y=bindPositions.get(b).y;b.position.y=proportionY(y)-(parent?proportionY(bindPositions.get(parent).y):0);}
  const body = new THREE.SkinnedMesh(geometry, matList);
  body.name = 'Body + costume + hair + tail / weighted geometry';
  // Keep the floor shadow, but do not stamp the hair/eye shadow map onto the face.
  body.castShadow = true; body.receiveShadow = false;
  body.add(pelvis);
  root.add(body);
  root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  body.bind(skeleton);
  body.normalizeSkinWeights();
  body.frustumCulled = false;
  resources.add(geometry);
  const face = createFace({head,resources,tuning});face.root.scale.x=headWidth;
  const bindQ = new Map(bones.map(b => [b, b.quaternion.clone()]));
  const q = new THREE.Quaternion(), homeRotation = new THREE.Quaternion(), euler = new THREE.Euler();
  let requested = 'idle', actionTime = 0, clock = 0, mouthValue = 0;
  let disposed = false;
  const blend = { wave: 0, walk: 0, turn: 0 };
  function setAction(action) {
    requested = ['idle', 'wave', 'walk', 'turn'].includes(action) ? action : 'idle';
    actionTime = 0;
    root.userData.currentAction = requested;
    root.userData.actionCompleted = false;
  }
  function rotate(b, x = 0, y = 0, z = 0, alpha = 1) {
    euler.set(x, y, z); q.setFromEuler(euler).premultiply(bindQ.get(b));
    b.quaternion.slerp(q, alpha);
  }
  function update(delta, elapsed, state = {}) {
    if (disposed) return;
    if (state.action && state.action !== requested) setAction(state.action);
    if (state.paused) return;
    const dt = THREE.MathUtils.clamp(Number(delta) || 0, 0, .05);
    clock += dt; actionTime += dt;
    const a = 1 - Math.exp(-dt * 9);
    for (const name of Object.keys(blend)) blend[name] = THREE.MathUtils.lerp(blend[name], requested === name ? 1 : 0, a);
    const walking = blend.walk, waving = blend.wave;
    const gait = clock * 6.2, breath = Math.sin(clock * 1.9);
    pelvis.position.y = proportionY(1.03) + bodyScale*(.008 * breath + Math.abs(Math.sin(gait)) * .022 * walking);
    rotate(pelvis, 0, Math.sin(gait) * .035 * walking, Math.sin(gait) * .035 * walking, a);
    rotate(spine, .017 * breath, Math.sin(clock * .7) * .035, Math.sin(clock * .9) * .016, a);
    rotate(chest, 0, -.035 * Math.sin(gait) * walking, -.025 * waving, a);
    rotate(neck, 0, Math.sin(clock * .55) * .045, .018 * Math.sin(clock * .7), a);
    rotate(head, Math.sin(clock * .8) * .018, .018 * Math.sin(clock * .6), -.045 * waving, a);
    for (const l of limbs) {
      const stride = Math.sin(gait + (l.side > 0 ? 0 : Math.PI));
      const isWaveHand = l.side < 0;
      rotate(l.hip, stride * .47 * walking, 0, l.side * .018, a);
      rotate(l.knee, Math.max(0, -stride) * .65 * walking, 0, 0, a);
      rotate(l.ankle, Math.max(0, stride) * -.16 * walking, 0, 0, a);
      rotate(l.shoulder, -stride * .28 * walking + (isWaveHand ? .85 * waving : 0), isWaveHand ? -.12 * waving : 0, l.side * .045 + (isWaveHand ? -1.35 * waving : .045 * waving), a);
      rotate(l.elbow, -.08 - .16 * walking, 0, isWaveHand ? (-.72 + Math.sin(clock * 7) * .24) * waving : .025, a);
      rotate(l.wrist, isWaveHand ? Math.sin(clock * 7) * .16 * waving : 0, 0, isWaveHand ? Math.sin(clock * 7) * .20 * waving : 0, a);
    }
    // Hair and tail are owned by the fixed-step secondary physics solver.
    if (requested === 'turn') {
      const t = THREE.MathUtils.clamp(actionTime / 4, 0, 1);
      const eased = t * t * (3 - 2 * t);
      root.rotation.y = eased * Math.PI * 2;
      if (t === 1) { root.rotation.y = 0; root.userData.actionCompleted = true; }
    } else {
      // Bounded angular velocity avoids a large first-frame snap if interrupted.
      root.quaternion.rotateTowards(homeRotation, dt * 2.1);
    }
    face.update(dt,clock,state);
    const hs=tuning.headScale??1.08;head.scale.set(hs,hs,hs);
    for(const material of matList)material.update(dt);
    root.userData.animationTime = clock;
    root.updateMatrixWorld(true);
  }
  root.userData.rigInfo = {
    kind: 'refined-procedural-3d-study-v2', boneCount: bones.length,
    skinnedMeshCount: 1, skinnedVertexCount: pos.length / 3,
    drawBatching:{before:groups.length,after:geometry.groups.length,method:'material-sorted indices; vertex attributes and weights unchanged'},
    skinBoundParts: ['torso', 'head', 'upper arms', 'forearms', 'hands', 'thighs', 'shins', 'shoes', 'costume', 'tail: 5 bones', 'hair: 6 chains / 18 bones'],
    face: 'sculpted face shell with recessed eye/mouth openings and continuous eyelid geometry',
    limitations: 'Procedural geometry factory: production topology, corrective blendshapes and authored motion capture remain unfinished. Foot IK and secondary collisions are provided by separate runtime modules, not this factory. Final likeness is not approved.'
  };
  root.userData.proportions={bodyScaleY:bodyScale,neckThreshold:1.90,headHeight:proportionY(2.39),pelvisHeight:proportionY(1.03),kind:'short-body chibi; head size preserved'};
  setAction('idle');
  update(0, 0, {});
  function resetPose(state={}){
    setAction('idle');clock=0;
    for(const name of Object.keys(blend))blend[name]=0;
    for(const b of bones)b.quaternion.copy(bindQ.get(b));
    root.quaternion.copy(homeRotation);
    face.update(0,0,{...state,paused:false});
    update(0,0,{...state,action:'idle',paused:false});
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    skeleton.dispose();
    for (const resource of resources) resource.dispose();
    root.removeFromParent();
  }
  return { root, update, setAction, resetPose, dispose, skeleton, body, face };
}
