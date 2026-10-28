import * as THREE from './vendor/three.module.js';

// Procedural rigging study, not a reconstruction of the approved illustration.
// All positions are metres-like scene units: sole y=0, face toward +Z.
export function createCharacter() {
  const root = new THREE.Group();
  root.name = 'Dafeiyu / procedural 3D rig study';
  const resources = new Set();
  const ramp = new THREE.DataTexture(new Uint8Array([94, 155, 214, 255]), 4, 1, THREE.RedFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  resources.add(ramp);
  const colors = {
    skin: 0xffdeca, navy: 0x172743, dress: 0x243d67, white: 0xfff8ed,
    hair: 0x275494, hairLight: 0x448ac4, tail: 0x304e83, tailLight: 0x6586b5,
    ink: 0x111b32, iris: 0x397ec2, irisLight: 0x82c9eb, blush: 0xe7a4a0,
    gold: 0xc3a66a, mouth: 0x6e343e, tongue: 0xf19b9e
  };
  const mats = {};
  const matList = [];
  const matIndex = {};
  for (const [name, color] of Object.entries(colors)) {
    const m = new THREE.MeshToonMaterial({ color, gradientMap: ramp });
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
  const pos = [], normal = [], indices = [], weights = [], groups = [];
  const v = new THREE.Vector3();
  const rigid = b => () => [boneIds.get(b), boneIds.get(b), 1, 0];
  const between = (a, b, coordinate = 'y') => p => {
    const from = bindPositions.get(a)[coordinate], to = bindPositions.get(b)[coordinate];
    const t = THREE.MathUtils.clamp((p[coordinate] - from) / (to - from || 1), 0, 1);
    return [boneIds.get(a), boneIds.get(b), 1 - t, t];
  };
  function add(geometry, material, weighting) {
    const g = geometry.index ? geometry.toNonIndexed() : geometry;
    const p = g.getAttribute('position'), n = g.getAttribute('normal');
    const start = pos.length / 3;
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const w = weighting(v);
      pos.push(v.x, v.y, v.z);
      normal.push(n.getX(i), n.getY(i), n.getZ(i));
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
  function leafLock(points, width, thickness, weighting, material = 'hair') {
    const curve = new THREE.CatmullRomCurve3(points);
    const frames = curve.computeFrenetFrames(24, false);
    const vertices = [], tris = [];
    const q = new THREE.Vector3();
    for (let i = 0; i <= 24; i++) {
      const t = i / 24, p = curve.getPointAt(t);
      const taper = .035 + Math.pow(Math.sin(Math.PI * (.12 + t * .88)), .65);
      for (let j = 0; j <= 10; j++) {
        const a = j / 10 * Math.PI * 2;
        q.copy(p).addScaledVector(frames.normals[i], Math.cos(a) * width * taper).addScaledVector(frames.binormals[i], Math.sin(a) * thickness * taper);
        vertices.push(...q.toArray());
        if (i < 24 && j < 10) {
          const k = i * 11 + j;
          tris.push(k, k + 1, k + 11, k + 1, k + 12, k + 11);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    g.setIndex(tris);
    g.computeVertexNormals();
    add(g, material, weighting);
  }
  // The torso, limbs and head really share the skinned body geometry.
  const torsoWeight = p => p.y > 1.77 ? between(chest, neck)(p) : between(pelvis, chest)(p);
  ellipsoid([0, 1.55, -.015], [.34, .42, .25], 'dress', torsoWeight);
  segment(new THREE.Vector3(0, 1.83, 0), new THREE.Vector3(0, 2.09, 0), .11, .105, 'skin', between(chest, neck));
  ellipsoid([0, 2.41, 0], [.62, .55, .47], 'skin', rigid(head), 40);
  for (const l of limbs) {
    const shoulderP = bindPositions.get(l.shoulder), elbowP = bindPositions.get(l.elbow), wristP = bindPositions.get(l.wrist);
    ellipsoid(shoulderP.toArray(), [.15, .18, .15], 'dress', rigid(l.shoulder));
    segment(shoulderP, elbowP, .14, .108, 'dress', between(l.shoulder, l.elbow));
    ellipsoid(elbowP.toArray(), [.108, .115, .11], 'dress', rigid(l.elbow));
    segment(elbowP, wristP, .108, .079, 'dress', between(l.elbow, l.wrist));
    ellipsoid(wristP.toArray(), [.085, .045, .09], 'white', rigid(l.wrist));
    const hand = wristP.clone().add(new THREE.Vector3(l.side * .015, -.09, .025));
    ellipsoid(hand.toArray(), [.078, .095, .053], 'skin', rigid(l.wrist));
    for (let finger = 0; finger < 4; finger++) {
      ellipsoid([hand.x + (finger - 1.5) * .029, hand.y - .064, hand.z], [.018, .040 - Math.abs(finger - 1.5) * .004, .020], 'skin', rigid(l.wrist), 12);
    }
    ellipsoid([hand.x - l.side * .073, hand.y + .005, hand.z + .018], [.031, .049, .025], 'skin', rigid(l.wrist), 12);
    segment(bindPositions.get(l.hip), bindPositions.get(l.knee), .12, .105, 'skin', between(l.hip, l.knee));
    segment(bindPositions.get(l.knee), bindPositions.get(l.ankle), .107, .084, 'white', between(l.knee, l.ankle));
    ellipsoid([l.side * .20, .125, .14], [.145, .125, .225], 'navy', rigid(l.ankle));
    ellipsoid([l.side * .20, .213, .168], [.102, .025, .135], 'white', rigid(l.ankle));
    ellipsoid([l.side * .20, .21, .232], [.125, .032, .035], 'navy', rigid(l.ankle));
  }
  // A continuous flared skirt with a scalloped, volumetric hem.
  const skirt = new THREE.CylinderGeometry(.285, .565, .58, 48, 12, true);
  skirt.translate(0, 1.09, 0);
  add(skirt, 'dress', p => {
    const t = THREE.MathUtils.smoothstep(p.y, .8, 1.38);
    return [boneIds.get(pelvis), boneIds.get(spine), 1 - t * .25, t * .25];
  });
  const hem = new THREE.TorusGeometry(.545, .035, 8, 48);
  hem.rotateX(Math.PI / 2).translate(0, .805, 0);
  add(hem, 'white', rigid(pelvis));
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2;
    ellipsoid([Math.cos(a) * .54, .785 + Math.cos(a * 2) * .01, Math.sin(a) * .54], [.073, .059, .07], 'white', rigid(pelvis), 12);
  }
  ellipsoid([0, 1.57, .245], [.23, .285, .052], 'white', torsoWeight);
  ellipsoid([0, 1.13, .424], [.34, .265, .055], 'white', rigid(pelvis));
  for (const side of [-1, 1]) {
    segment(new THREE.Vector3(side * .225, 1.81, .20), new THREE.Vector3(side * .235, 1.33, .29), .035, .035, 'white', torsoWeight);
    ellipsoid([side * .09, 1.85, .252], [.115, .068, .045], 'navy', rigid(chest));
  }
  ellipsoid([0, 1.85, .30], [.036, .044, .025], 'gold', rigid(chest));
  ellipsoid([0, 1.85, .32], [.024, .031, .013], 'iris', rigid(chest));
  for (let i = 0; i < 3; i++) ellipsoid([0, 1.71 - .12 * i, .305], [.018, .018, .01], 'gold', torsoWeight, 12);
  ellipsoid([-.025, 1.15, .485], [.12, .061, .014], 'iris', rigid(pelvis));
  const whaleTail = new THREE.Shape();
  whaleTail.moveTo(.07, 0); whaleTail.quadraticCurveTo(.12, .02, .15, .075);
  whaleTail.quadraticCurveTo(.085, .075, .07, .04); whaleTail.quadraticCurveTo(.045, .08, .02, .075); whaleTail.quadraticCurveTo(.02, .025, .07, 0);
  const emblem = shapeGeometry(whaleTail, .012); emblem.translate(.025, 1.14, .484); add(emblem, 'iris', rigid(pelvis));
  ellipsoid([-.095, 1.16, .50], [.009, .009, .004], 'white', rigid(pelvis), 10);
  // Hair cap: the front ends at the hairline; the face is not inside a blue ball.
  const capPositions = [], capIndices = [];
  for (let j = 0; j <= 20; j++) {
    for (let i = 0; i <= 48; i++) {
      const phi = i / 48 * Math.PI * 2;
      const front = Math.max(0, Math.sin(phi));
      const theta = j / 20 * (2.18 - .93 * front);
      capPositions.push(.655 * Math.sin(theta) * Math.cos(phi), 2.43 + .575 * Math.cos(theta), .505 * Math.sin(theta) * Math.sin(phi));
      if (j < 20 && i < 48) { const k = j * 49 + i; capIndices.push(k, k + 1, k + 49, k + 1, k + 50, k + 49); }
    }
  }
  const cap = new THREE.BufferGeometry();
  cap.setAttribute('position', new THREE.Float32BufferAttribute(capPositions, 3));
  cap.setIndex(capIndices); cap.computeVertexNormals(); add(cap, 'hair', rigid(head));
  leafLock([[-.02, 2.94, .24], [.03, 2.71, .48], [.025, 2.45, .515]].map(p => new THREE.Vector3(...p)), .13, .047, rigid(head));
  for (const side of [-1, 1]) {
    leafLock([[side * .26, 2.90, .23], [side * .34, 2.73, .42], [side * .40, 2.54, .46]].map(p => new THREE.Vector3(...p)), .13, .044, rigid(head));
    leafLock([[side * .51, 2.74, .16], [side * .58, 2.48, .24], [side * .49, 2.17, .33]].map(p => new THREE.Vector3(...p)), .13, .060, rigid(head));
  }
  for (const h of hairChains) {
    const p = h.points;
    const control = [p[0], p[1], p[2], p[2].clone().add(new THREE.Vector3(-h.side * .09, -.15, .12))];
    const hairWeight = v => v.y > p[1].y ? between(h.bones[0], h.bones[1])(v) : between(h.bones[1], h.bones[2])(v);
    leafLock(control, .14 - h.lane * .014, .075, hairWeight);
    leafLock([p[1].clone().add(new THREE.Vector3(0, -.22, .035)), p[2].clone().add(new THREE.Vector3(0, .08, .04)), control[3]], .075, .035, hairWeight, 'hairLight');
  }
  tube([[0, 2.99, 0], [.09, 3.15, 0], [-.04, 3.20, .01], [-.13, 3.13, .025]].map(p => new THREE.Vector3(...p)), .036, 'hair', rigid(head), 20);
  for (let i = 0; i <= 12; i++) {
    const a = i / 12 * Math.PI;
    ellipsoid([.65 * Math.cos(a), 2.43 + .59 * Math.sin(a), -.045], [.077, .096, .055], 'white', rigid(head), 16);
  }
  for (const side of [-1, 1]) {
    const fin = new THREE.Shape();
    fin.moveTo(0, 0); fin.bezierCurveTo(.13, .04, .27, -.09, .37, -.12); fin.bezierCurveTo(.24, -.25, .10, -.22, 0, -.11); fin.closePath();
    const g = shapeGeometry(fin, .075); g.scale(side, 1, 1).translate(side * .57, 2.45, -.025); add(g, 'tail', rigid(head));
    const underside = new THREE.Shape();
    underside.moveTo(.03, -.10); underside.quadraticCurveTo(.22, -.17, .33, -.13); underside.quadraticCurveTo(.22, -.25, .03, -.17); underside.closePath();
    const u = shapeGeometry(underside, .012); u.scale(side, 1, 1).translate(side * .57, 2.45, .025); add(u, 'white', rigid(head));
    for (const s of [-1, 1]) ellipsoid([side * .615 + s * .045, 2.63 + s * .015, .13], [.066, .05, .035], 'hairLight', rigid(head), 16);
    ellipsoid([side * .615, 2.63, .163], [.029, .030, .020], 'hairLight', rigid(head), 12);
  }
  // Five weighted tail segments; both flukes share the last animated bone.
  const tailCurve = new THREE.CatmullRomCurve3(tailPoints);
  const tailGeometry = new THREE.TubeGeometry(tailCurve, 40, .105, 12, false);
  const tp = tailGeometry.getAttribute('position');
  const tailWeights = [];
  for (let i = 0; i < tp.count; i++) {
    const ring = Math.floor(i / 13), t = ring / 40;
    const c = tailCurve.getPointAt(t), radius = THREE.MathUtils.lerp(1.1, .48, t);
    v.fromBufferAttribute(tp, i).sub(c).multiplyScalar(radius).add(c);
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
  const fg = shapeGeometry(fluke, .065); fg.rotateX(-.55).translate(...end.toArray()); add(fg, 'tail', rigid(tailBones[4]));
  const flukeLight = shapeGeometry(fluke, .012); flukeLight.scale(.93, .55, 1).rotateX(-.55).translate(end.x, end.y - .02, end.z + .043); add(flukeLight, 'tailLight', rigid(tailBones[4]));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
  for (const g of groups) geometry.addGroup(g.start, g.count, g.material);
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
  // Facial features are small real meshes attached to the Head bone, never PNGs.
  function mesh(g, material, parent = head) {
    const m = new THREE.Mesh(g, material);
    m.castShadow = false;
    m.receiveShadow = false;
    parent.add(m); resources.add(g); return m;
  }
  function faceSphere(parent, xyz, scale, material) {
    const m = mesh(new THREE.SphereGeometry(1, 24, 16), material, parent);
    m.position.set(...xyz); m.scale.set(...scale); return m;
  }
  function faceLine(parent, points, radius, material) {
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 20, radius, 6, false), material, parent);
  }
  const eyes = [], brows = [];
  for (const side of [-1, 1]) {
    const eye = new THREE.Group(); eye.position.set(side * .235, .035, .436); head.add(eye);
    // A shallow corneal surface with an upper eyelid, rather than a white ball
    // surrounded by a thick black oval. All layers still have actual 3D depth.
    faceSphere(eye, [0, -.006, .006], [.146, .174, .017], mats.white);
    const iris = faceSphere(eye, [side * -.008, -.011, .023], [.114, .143, .011], mats.iris);
    faceSphere(eye, [side * -.008, -.060, .032], [.091, .073, .007], mats.irisLight);
    faceSphere(eye, [side * -.008, .003, .038], [.035, .068, .007], mats.ink);
    faceSphere(eye, [-.026, .075, .046], [.029, .034, .006], mats.white);
    faceSphere(eye, [.041, -.064, .044], [.011, .014, .005], mats.white);
    faceLine(eye, [[-.144, .027, .015], [-.112, .130, .025], [0, .167, .020], [.125, .107, .015]], .014, mats.ink);
    faceLine(eye, [[-.119, -.101, .014], [0, -.168, .016], [.116, -.103, .014]], .0035, mats.hair);
    faceLine(eye, [[side * .130, .083, .019], [side * .161, .102, .019], [side * .175, .124, .015]], .009, mats.ink);
    eyes.push({ group: eye, iris });
    const brow = new THREE.Group(); brow.position.set(side * .235, .29, .379); head.add(brow);
    faceLine(brow, [[-.12, 0, 0], [0, .026, .018], [.11, .006, 0]], .009, mats.hair);
    brows.push({ group: brow, side });
    faceSphere(head, [side * .33, -.135, .414], [.070, .030, .012], mats.blush);
  }
  faceSphere(head, [0, -.09, .474], [.021, .025, .021], mats.skin);
  const mouth = new THREE.Group(); mouth.position.set(0, -.228, .428); head.add(mouth);
  const mouthInside = faceSphere(mouth, [0, 0, 0], [.088, .010, .028], mats.mouth);
  const tongue = faceSphere(mouth, [0, -.002, .024], [.057, .004, .008], mats.tongue);
  const smileMaterial = mats.mouth.clone(); smileMaterial.transparent = true; resources.add(smileMaterial);
  faceLine(mouth, [[-.071, .004, .018], [0, -.011, .028], [.071, .004, .018]], .006, smileMaterial);
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
    pelvis.position.y = 1.03 + .008 * breath + Math.abs(Math.sin(gait)) * .022 * walking;
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
      rotate(l.shoulder, -stride * .28 * walking - (isWaveHand ? .38 * waving : 0), isWaveHand ? -.12 * waving : 0, l.side * .045 + (isWaveHand ? -1.35 * waving : .045 * waving), a);
      rotate(l.elbow, -.08 - .16 * walking, 0, isWaveHand ? (-.72 + Math.sin(clock * 7) * .24) * waving : .025, a);
      rotate(l.wrist, isWaveHand ? Math.sin(clock * 7) * .16 * waving : 0, 0, isWaveHand ? Math.sin(clock * 7) * .20 * waving : 0, a);
    }
    for (let i = 0; i < tailBones.length; i++) {
      const phase = clock * 2.2 - i * .48;
      rotate(tailBones[i], Math.sin(phase) * .045, Math.sin(phase) * (.055 + walking * .065), Math.sin(phase) * .055, a);
    }
    for (const h of hairChains) {
      h.bones.forEach((b, i) => {
        const phase = clock * 2 - h.lane * .5 - i * .45;
        rotate(b, Math.sin(phase) * (.023 + walking * .045), Math.sin(phase) * .018, h.side * Math.sin(phase) * (.019 + walking * .035), a);
      });
    }
    if (requested === 'turn') {
      const t = THREE.MathUtils.clamp(actionTime / 4, 0, 1);
      const eased = t * t * (3 - 2 * t);
      root.rotation.y = eased * Math.PI * 2;
      if (t === 1) { root.rotation.y = 0; root.userData.actionCompleted = true; }
    } else {
      // Bounded angular velocity avoids a large first-frame snap if interrupted.
      root.quaternion.rotateTowards(homeRotation, dt * 2.1);
    }
    const blinkPhase = clock % 4.3;
    const blink = blinkPhase < .18 ? Math.pow(Math.sin(blinkPhase / .18 * Math.PI), 2) : 0;
    const happy = state.mood === 'happy' || state.mood === '开心';
    const sad = state.mood === 'sad' || state.mood === '难过';
    for (const eye of eyes) {
      eye.group.scale.y = Math.max(.035, (1 - blink * .965) * (happy ? .87 : 1));
      eye.iris.position.x = Math.sin(clock * .53) * .010;
    }
    for (const b of brows) b.group.rotation.z = (sad ? -.15 : happy ? .07 : 0) * b.side;
    const talk = typeof state.talking === 'number' ? THREE.MathUtils.clamp(state.talking, 0, 1) : state.talking ? .25 + .55 * Math.abs(Math.sin(clock * 10) * Math.sin(clock * 6.7)) : 0;
    mouthValue = THREE.MathUtils.lerp(mouthValue, talk, 1 - Math.exp(-dt * 22));
    mouthInside.scale.y = .006 + mouthValue * .078;
    mouthInside.scale.x = .065 + mouthValue * .035;
    tongue.scale.y = .002 + mouthValue * .023;
    tongue.position.y = -mouthValue * .035;
    smileMaterial.opacity = 1 - mouthValue;
    root.userData.animationTime = clock;
    root.updateMatrixWorld(true);
  }
  root.userData.rigInfo = {
    kind: 'procedural-skinned-3d-study', boneCount: bones.length,
    skinnedMeshCount: 1, skinnedVertexCount: pos.length / 3,
    skinBoundParts: ['torso', 'head', 'upper arms', 'forearms', 'hands', 'thighs', 'shins', 'shoes', 'costume', 'tail: 5 bones', 'hair: 6 chains / 18 bones'],
    face: 'volumetric facial meshes parented to Head bone; continuous scale / transforms',
    limitations: 'Procedural technical study: no production topology, corrective blendshapes, IK, collision or authored motion capture; not approved final art.'
  };
  setAction('idle');
  update(0, 0, {});
  function dispose() {
    if (disposed) return;
    disposed = true;
    skeleton.dispose();
    for (const resource of resources) resource.dispose();
    root.removeFromParent();
  }
  return { root, update, setAction, dispose, skeleton, body };
}
