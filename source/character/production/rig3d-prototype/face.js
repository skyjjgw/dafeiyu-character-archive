import * as THREE from './vendor/three.module.js';

// First procedural refinement pass. Every visible feature is exportable geometry;
// there are no portrait planes, textures, custom fragment masks or shader clips.
export function createFace({ head, resources = new Set(), tuning = {} }) {
  if (!head?.isObject3D) throw new TypeError('createFace requires the Head bone');
  const group = new THREE.Group();
  group.name = 'Face / rounded shell, inset eyes and deforming eyelids';
  head.add(group);
  function option(key, min, max) {
    const value = Number(tuning?.[key]);
    return tuning?.[key] != null && Number.isFinite(value) ? THREE.MathUtils.clamp(value, min, max) : 1;
  }
  // Apertures and their surrounding skin are rebuilt together on GUI finish.
  // Scaling only a visible eye would leave a mismatched hole in the face shell.
  const effectiveTuning = {
    eyeWidth: option('eyeWidth', .90, 1.12),
    eyeHeight: option('eyeHeight', .80, 1.08),
    eyeSpacing: option('eyeSpacing', .90, 1.10),
    irisScale: option('irisScale', .85, 1.10)
  };
  const own = value => { resources.add(value); return value; };
  const material = (name, color, vertexColors = false) => {
    const m = own(new THREE.MeshBasicMaterial({ color, vertexColors, side: THREE.DoubleSide, toneMapped:false }));
    m.name = name;
    return m;
  };
  // Controlled anime colours deliberately remain stable under the stage lights.
  const materials = {
    skin: material('Face / warm muted skin with vertex shading', 0xffffff, true),
    sclera: material('Eyes / warm white with lid shading', 0xffffff, true),
    iris: material('Eyes / navy-to-blue iris', 0xffffff, true),
    ink: material('Eyes / soft charcoal upper lash', 0x221c2a),
    pupil: material('Eyes / deep blue pupil', 0x102541),
    highlight: material('Eyes / restrained catchlight', 0xf7f8ef),
    brow: material('Brows / desaturated blue', 0x354569),
    crease: material('Lids / warm skin crease', 0xc99e8b),
    mouth: material('Mouth / recessed cavity', 0x64363f),
    tongue: material('Mouth / soft tongue', 0xd88b91),
    tooth: material('Mouth / small upper tooth edge', 0xe8dfcf),
    lip: material('Mouth / subtle lip line', 0x854b48),
    blush: material('Cheeks / fine low saturation hatch', 0xdca5a0)
  };
  function mesh(geometry, mat, name) {
    own(geometry);
    const object = new THREE.Mesh(geometry, mat);
    object.name = name;
    object.castShadow = false;
    object.receiveShadow = false;
    object.frustumCulled = false;
    group.add(object);
    return object;
  }
  const smooth = t => { t = THREE.MathUtils.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  // Three tangent-aligned Bezier spans: rounded cheeks flow into a short chin.
  // A lookup samples this continuous contour instead of flattening the slope at
  // every hand-authored width knot (which made the first silhouette stair-step).
  const contourCurves = [
    new THREE.CubicBezierCurve(new THREE.Vector2(0, .555), new THREE.Vector2(.40, .555), new THREE.Vector2(.66, .34), new THREE.Vector2(.66, .13)),
    new THREE.CubicBezierCurve(new THREE.Vector2(.66, .13), new THREE.Vector2(.66, -.015), new THREE.Vector2(.61, -.15), new THREE.Vector2(.50, -.225)),
    new THREE.CubicBezierCurve(new THREE.Vector2(.50, -.225), new THREE.Vector2(.38, -.307), new THREE.Vector2(.14, -.36), new THREE.Vector2(0, -.36))
  ];
  const profile = contourCurves.flatMap((curve, i) => curve.getPoints(160).slice(i ? 1 : 0)).reverse();
  function widthAt(y) {
    if (y <= -.36 || y >= .555) return .0001;
    let lo = 0, hi = profile.length - 1;
    while (hi - lo > 1) {
      const mid = (hi + lo) >> 1;
      if (profile[mid].y < y) lo = mid; else hi = mid;
    }
    const a = profile[lo], b = profile[hi];
    return Math.max(.0001, THREE.MathUtils.lerp(a.x, b.x, (y - a.y) / Math.max(.000001, b.y - a.y)));
  }
  function surfaceZ(x, y) {
    const u = THREE.MathUtils.clamp(x / widthAt(y), -.999999, .999999);
    const lower = smooth((-.13 - y) / .23);
    const upper = smooth((y - .31) / .25);
    const depth = .428 - .105 * lower - .11 * upper;
    const poleFalloff = Math.pow(Math.max(0, 1 - Math.pow((y - .0975) / .4575, 2)), .25);
    const noseRelief=.019*Math.exp(-Math.pow(x/.075,2)-Math.pow((y+.080)/.068,2));
    return .035 + depth * poleFalloff * Math.pow(Math.max(0, 1 - u * u), .235)+noseRelief;
  }
  const baseSkin = new THREE.Color(0xf2d3c0);
  const cheekColor = new THREE.Color(0xe7aaa7);
  const scratch = new THREE.Color();
  function skinColor(x, y) {
    const edge = Math.pow(Math.abs(x) / Math.max(.1, widthAt(y)), 3);
    const blush = Math.exp(-Math.pow((Math.abs(x) - .37) / .115, 2) - Math.pow((y + .12) / .056, 2));
    return scratch.copy(baseSkin).multiplyScalar(1 - edge * .080 - smooth((-.30 - y) / .20) * .018).lerp(cheekColor, blush * .27);
  }
  function dynamicGeometry(nx, ny, colors = false) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array((nx + 1) * (ny + 1) * 3), 3));
    if (colors) g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array((nx + 1) * (ny + 1) * 3), 3));
    const ids = [];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const k = j * (nx + 1) + i;
      ids.push(k, k + 1, k + nx + 1, k + 1, k + nx + 2, k + nx + 1);
    }
    g.setIndex(ids);
    return g;
  }
  function fillGrid(g, nx, ny, point) {
    const p = g.attributes.position, c = g.attributes.color;
    let k = 0;
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
      const r = point(i / nx, j / ny);
      p.setXYZ(k, r[0], r[1], r[2]);
      if (c) { const color = r[3]; c.setXYZ(k, color.r, color.g, color.b); }
      k++;
    }
    p.needsUpdate = true;
    if (c) c.needsUpdate = true;
    // Basic materials do not need dynamic normals; keep valid normals for GLB.
    g.computeVertexNormals();
  }
  const eyes = [-1, 1].map(side => ({
    side, x: side * .247 * effectiveTuning.eyeSpacing, y: .025,
    halfWidth: .190 * effectiveTuning.eyeWidth, heightScale: effectiveTuning.eyeHeight
  }));
  function eyeLimit(eye, u, kind, blink, happy, sad) {
    const arch = Math.pow(Math.max(0, 1 - u * u), .72);
    const corner = eye.y + eye.side * u * .022 * eye.heightScale;
    const closed = corner - .015 * eye.heightScale + (happy ? .052 : -.006) * arch * eye.heightScale;
    if (kind === 'upper') {
      const open = corner + .141 * arch * eye.heightScale * (1 - happy * .12 - sad * .10) - sad * eye.side * u * .014 * eye.heightScale;
      return THREE.MathUtils.lerp(open, closed, blink);
    }
    const open = corner - .113 * arch * eye.heightScale + happy * .026 * arch * eye.heightScale;
    return THREE.MathUtils.lerp(open, closed, blink);
  }
  function holeY(eye, u, upper) {
    return eye.y + (eye.side * u * .022 + (upper ? .166 : -.133) * Math.pow(Math.max(0, 1 - u * u), .72)) * eye.heightScale;
  }
  function pathFrom(points) {
    const path = new THREE.Path();
    points.forEach(([x, y], i) => i ? path.lineTo(x, y) : path.moveTo(x, y));
    path.closePath();
    return path;
  }
  const outline = [];
  for (let i = 0; i < 160; i++) {
    const a = i / 160 * Math.PI * 2;
    const y = .0975 + .4575 * Math.sin(a);
    outline.push([Math.sign(Math.cos(a)) * widthAt(y), y]);
  }
  const shape = new THREE.Shape();
  outline.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
  shape.closePath();
  for (const eye of eyes) {
    const boundary = [];
    for (let i = 0; i <= 36; i++) {
      const u = -1 + 2 * i / 36;
      boundary.push([eye.x + eye.halfWidth * u, holeY(eye, u, true)]);
    }
    for (let i = 36; i >= 0; i--) {
      const u = -1 + 2 * i / 36;
      boundary.push([eye.x + eye.halfWidth * u, holeY(eye, u, false)]);
    }
    shape.holes.push(pathFrom(boundary));
  }
  const mouthY = -.19, mouthRX = .125, mouthRY = .103;
  const mouthBoundary = [];
  for (let i = 0; i < 64; i++) {
    const a = -i / 64 * Math.PI * 2;
    mouthBoundary.push([Math.cos(a) * mouthRX, mouthY + Math.sin(a) * mouthRY]);
  }
  shape.holes.push(pathFrom(mouthBoundary));
  const triangulated = new THREE.ShapeGeometry(shape, 32).toNonIndexed();
  const frontPos = [], frontColors = [];
  function triangle(a, b, c, depth) {
    if (depth) {
      const ab = [(a[0] + b[0]) * .5, (a[1] + b[1]) * .5];
      const bc = [(b[0] + c[0]) * .5, (b[1] + c[1]) * .5];
      const ca = [(c[0] + a[0]) * .5, (c[1] + a[1]) * .5];
      triangle(a, ab, ca, depth - 1); triangle(ab, b, bc, depth - 1);
      triangle(ca, bc, c, depth - 1); triangle(ab, bc, ca, depth - 1);
      return;
    }
    for (const [x, y] of [a, b, c]) {
      frontPos.push(x, y, surfaceZ(x, y));
      const col = skinColor(x, y); frontColors.push(col.r, col.g, col.b);
    }
  }
  const flat = triangulated.attributes.position;
  for (let i = 0; i < flat.count; i += 3) triangle([flat.getX(i), flat.getY(i)], [flat.getX(i + 1), flat.getY(i + 1)], [flat.getX(i + 2), flat.getY(i + 2)], 2);
  triangulated.dispose();
  const front = new THREE.BufferGeometry();
  front.setAttribute('position', new THREE.Float32BufferAttribute(frontPos, 3));
  front.setAttribute('color', new THREE.Float32BufferAttribute(frontColors, 3));
  front.computeVertexNormals();
  mesh(front, materials.skin, 'Face / broad cheeks and rounded chin, actual eye and mouth holes');
  // The back half closes the cranium; grouped hair hides its join at the temples.
  const back = dynamicGeometry(48, 40, true);
  fillGrid(back, 48, 40, (u, v) => {
    const y = .0975 + .4575 * Math.cos(v * Math.PI), a = u * Math.PI;
    const x = widthAt(y) * Math.cos(a);
    const z = .035 - .40 * Math.sin(a) * Math.sin(v * Math.PI);
    return [x, y, z, skinColor(x, y)];
  });
  mesh(back, materials.skin, 'Head / curved rear cranium');
  const whiteTop = new THREE.Color(0xd2d0d5), whiteBottom = new THREE.Color(0xf5f0e8);
  const irisTop = new THREE.Color(0x102758), irisBottom = new THREE.Color(0x429bdb), irisGlow = new THREE.Color(0x9ee2ef);
  const colScratch = new THREE.Color();
  function makeEyePatch(eye, name, rx, ry, cx, cy, mat, color) {
    const g = dynamicGeometry(28, 12, Boolean(color));
    const object = mesh(g, mat, name);
    return { g, object, rx, ry, cx, cy, color };
  }
  const irisScale = effectiveTuning.irisScale;
  for (const eye of eyes) {
    eye.white = dynamicGeometry(36, 10, true);
    mesh(eye.white, materials.sclera, `${eye.side}.Eye / inset curved sclera`);
    eye.upperSkin = dynamicGeometry(36, 4, true);
    eye.lowerSkin = dynamicGeometry(36, 4, true);
    mesh(eye.upperSkin, materials.skin, `${eye.side}.Eye / deforming upper eyelid`);
    mesh(eye.lowerSkin, materials.skin, `${eye.side}.Eye / deforming lower eyelid`);
    eye.iris = makeEyePatch(eye, `${eye.side}.Eye / clipped blue iris`, .126 * irisScale, .146 * irisScale, 0, -.011 * irisScale, materials.iris, (u, v) => {
      const r = Math.sqrt(u * u + v * v);
      const down=THREE.MathUtils.clamp((1-v)*.5,0,1);
      const lowerGlow=Math.exp(-Math.pow(u/.54,2)-Math.pow((v+.66)/.24,2));
      const radial=.96+.045*Math.sin(Math.atan2(v,u)*24)*smooth((r-.25)/.4);
      return colScratch.copy(irisTop).lerp(irisBottom,Math.pow(down,1.4)).lerp(irisGlow,lowerGlow*.65).multiplyScalar((1-.34*smooth((r-.81)/.17))*radial);
    });
    eye.pupil = makeEyePatch(eye, `${eye.side}.Eye / stable vertical pupil`, .035 * irisScale, .052 * irisScale, 0, .016 * irisScale, materials.pupil);
    // Both catchlights have the same lighting direction, rather than mirroring.
    eye.light = makeEyePatch(eye, `${eye.side}.Eye / main catchlight`, .023 * irisScale, .026 * irisScale, -.026 * irisScale, .068 * irisScale, materials.highlight);
    eye.light2 = makeEyePatch(eye, `${eye.side}.Eye / small lower catchlight`, .009 * irisScale, .011 * irisScale, .045 * irisScale, -.068 * irisScale, materials.highlight);
    eye.lash = dynamicGeometry(40, 1);
    eye.lowerLine = dynamicGeometry(36, 1);
    eye.wing = dynamicGeometry(12, 1);
    mesh(eye.lash, materials.ink, `${eye.side}.Eye / shaped upper eyelash ribbon`);
    mesh(eye.lowerLine, materials.brow, `${eye.side}.Eye / fine lower lid edge`);
    mesh(eye.wing, materials.ink, `${eye.side}.Eye / tapered outer lashes`);
    eye.brow = dynamicGeometry(24, 1);
    mesh(eye.brow, materials.brow, `${eye.side}.Brow / expressive ribbon`);
  }
  const mouthSkin = dynamicGeometry(64, 5, true);
  mesh(mouthSkin, materials.skin, 'Mouth / lip skin ring around actual opening');
  const oral = dynamicGeometry(64, 8);
  mesh(oral, materials.mouth, 'Mouth / recessed oral cavity');
  const tongue = dynamicGeometry(28, 8);
  const tongueMesh = mesh(tongue, materials.tongue, 'Mouth / recessed tongue');
  const tooth = dynamicGeometry(24, 4);
  const toothMesh = mesh(tooth, materials.tooth, 'Mouth / small upper tooth strip');
  const lip = dynamicGeometry(32, 1);
  mesh(lip, materials.lip, 'Mouth / soft upper lip and closed smile');
  // Subtle 3D nose bridge; the broad face remains calm instead of mask-like.
  const nose = new THREE.SphereGeometry(1, 20, 12);
  nose.scale(.012, .014, .010).translate(0, -.083, surfaceZ(0, -.083) + .003);
  const noseColor = skinColor(0, -.083).clone();
  const noseMat = own(new THREE.MeshBasicMaterial({ color: noseColor, toneMapped:false }));
  mesh(nose, noseMat, 'Nose / small rounded relief');
  // Six faint cheek hatch marks are separate curves following the skin surface.
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
    const g = dynamicGeometry(4, 1);
    fillGrid(g, 4, 1, (u, v) => {
      const x = side * (.337 + i * .027) + (u - .5) * .012 + (v - .5) * .002;
      const y = -.112 - u * .026;
      return [x, y, surfaceZ(x, y) + .0025];
    });
    mesh(g, materials.blush, `Cheek.${side}.${i} / fine blush mark`);
  }
  let talkValue = 0, happyValue = 0, sadValue = 0;
  function update(delta, time, state = {}) {
    if (state.paused) return;
    const dt = THREE.MathUtils.clamp(Number(delta) || 0, 0, .08);
    const t = Number(time) || 0;
    const mood = String(state.mood || 'neutral').toLowerCase();
    const a = dt ? 1 - Math.exp(-dt * 15) : 1;
    happyValue = THREE.MathUtils.lerp(happyValue, ['happy', '开心', '高兴'].includes(mood) ? 1 : 0, a);
    sadValue = THREE.MathUtils.lerp(sadValue, ['sad', '难过', '伤心'].includes(mood) ? 1 : 0, a);
    const happy = happyValue, sad = sadValue;
    const phase = (t + 1.8) % 4.7;
    const automaticBlink = phase < .20 ? Math.pow(Math.sin(phase / .20 * Math.PI), 2) : 0;
    const blink = typeof state.blink === 'number' ? THREE.MathUtils.clamp(state.blink, 0, 1) : automaticBlink;
    const gazeX = Math.sin(t * .54) * .008;
    const gazeY = Math.sin(t * .35) * .004;
    for (const eye of eyes) {
      const upper = u => eyeLimit(eye, u, 'upper', blink, happy, sad);
      const lower = u => eyeLimit(eye, u, 'lower', blink, happy, sad);
      fillGrid(eye.white, 36, 10, (u, v) => {
        const s = u * 2 - 1, x = eye.x + s * eye.halfWidth;
        const y = THREE.MathUtils.lerp(lower(s), upper(s), v);
        return [x, y, surfaceZ(x, y) - .006, colScratch.copy(whiteBottom).lerp(whiteTop, Math.pow(v, 4) * .70)];
      });
      for (const isUpper of [true, false]) fillGrid(isUpper ? eye.upperSkin : eye.lowerSkin, 36, 4, (u, v) => {
        const s = u * 2 - 1, x = eye.x + s * eye.halfWidth;
        const outer = holeY(eye, s, isUpper), inner = isUpper ? upper(s) : lower(s);
        const y = THREE.MathUtils.lerp(inner, outer, v);
        return [x, y, surfaceZ(x, y) + .0007, skinColor(x, y)];
      });
      const layers = [eye.iris, eye.pupil, eye.light, eye.light2];
      layers.forEach((part, layer) => {
        fillGrid(part.g, 28, 12, (u, v) => {
          const s = u * 2 - 1;
          const xx = part.cx + gazeX + s * part.rx;
          const x = eye.x + xx;
          const sEye = THREE.MathUtils.clamp(xx / eye.halfWidth, -1, 1);
          const h = part.ry * Math.sqrt(Math.max(0, 1 - s * s));
          const center = eye.y + part.cy + gazeY;
          const bottom = Math.max(center - h, lower(sEye));
          const top = Math.min(center + h, upper(sEye));
          const y = top >= bottom ? THREE.MathUtils.lerp(bottom, top, v) : THREE.MathUtils.clamp(center, lower(sEye), upper(sEye));
          const yy = (y - center) / part.ry;
          const z = surfaceZ(x, y) - .002 + layer * .0018;
          return [x, y, z, part.color ? part.color(s, yy) : undefined];
        });
        part.object.visible = blink < .998;
      });
      fillGrid(eye.lash, 40, 1, (u, v) => {
        const s = u * 2 - 1, x = eye.x + s * eye.halfWidth;
        const outer = (eye.side * s + 1) * .5;
        const thick = .003 + .014 * Math.pow(Math.max(0, 1 - s * s), .35) + outer * .002;
        const y = upper(s) + v * thick;
        return [x, y, surfaceZ(x, y) + .0045];
      });
      fillGrid(eye.lowerLine, 36, 1, (u, v) => {
        const s = u * 2 - 1, x = eye.x + s * eye.halfWidth;
        const y = lower(s) - v * .0018 * Math.sqrt(Math.max(0, 1 - s * s));
        return [x, y, surfaceZ(x, y) + .003];
      });
      fillGrid(eye.wing, 12, 1, (u, v) => {
        const x = eye.x + eye.side * (eye.halfWidth - .012 + u * .056);
        const y = eye.y + (.022 + u * .034 + v * Math.sin(Math.PI * u) * .012) * eye.heightScale;
        return [x, y, surfaceZ(x, y) + .004];
      });
      fillGrid(eye.brow, 24, 1, (u, v) => {
        const s = u * 2 - 1, x = eye.x + s * .116;
        const y = .278 + .018 * (1 - s * s) - eye.side * s * sad * .047 + happy * .012 + v * .006 * Math.sin(Math.PI * u);
        return [x, y, surfaceZ(x, y) + .003];
      });
    }
    const talking = typeof state.talking === 'number' ? THREE.MathUtils.clamp(state.talking, 0, 1) : state.talking ? .28 + .58 * Math.abs(Math.sin(t * 10.3) * Math.sin(t * 6.4)) : 0;
    talkValue = THREE.MathUtils.lerp(talkValue, talking, dt ? 1 - Math.exp(-dt * 24) : 1);
    const open = talkValue;
    const rx = .062 + open * .041 + happy * .006;
    function smile(u) { return mouthY - .005 + (.015 + happy * .012) * u * u + sad * (.017 - .030 * u * u); }
    function mouthPoint(angle) {
      const u = Math.cos(angle), s = Math.sin(angle);
      return [u * rx, smile(u) + s * open * (s > 0 ? .050 : .087)];
    }
    fillGrid(mouthSkin, 64, 5, (u, v) => {
      const angle = u * Math.PI * 2, inner = mouthPoint(angle);
      const x = THREE.MathUtils.lerp(inner[0], Math.cos(angle) * mouthRX, v);
      const y = THREE.MathUtils.lerp(inner[1], mouthY + Math.sin(angle) * mouthRY, v);
      return [x, y, surfaceZ(x, y) + .0008, skinColor(x, y)];
    });
    fillGrid(oral, 64, 8, (u, v) => {
      const p = mouthPoint(u * Math.PI * 2);
      const x = p[0] * v, y = THREE.MathUtils.lerp(mouthY, p[1], v);
      return [x, y, surfaceZ(x, y) - .003 - .048 * (1 - v * v)];
    });
    fillGrid(tongue, 28, 8, (u, v) => {
      const s = u * 2 - 1, x = s * rx * .70;
      const y = smile(s * .70) - open * .059 + Math.sqrt(Math.max(0, 1 - s * s)) * open * .030 * v;
      return [x, y, surfaceZ(x, y) - .017];
    });
    fillGrid(tooth, 24, 4, (u, v) => {
      const s = u * 2 - 1, x = s * rx * .66;
      const y = smile(s * .66) + open * (.030 - v * .012) * Math.sqrt(Math.max(0, 1 - s * s));
      return [x, y, surfaceZ(x, y) - .010];
    });
    tongueMesh.visible = open > .01;
    toothMesh.visible = open > .16;
    fillGrid(lip, 32, 1, (u, v) => {
      const s = u * 2 - 1, x = s * rx;
      const y = smile(s) + open * .050 * Math.sqrt(Math.max(0, 1 - s * s)) + v * .0036 * Math.sin(Math.PI * u);
      return [x, y, surfaceZ(x, y) + .002];
    });
    group.userData.expression = { blink, talking: open, happy, sad };
  }
  group.userData.design = {
    stage: 'procedural facial refinement / first pass',
    actualGeometry: true, portraitTexture: false,
    tuning: { ...effectiveTuning },
    eyeMechanism: 'fixed curved iris/pupil, clipped by deforming upper/lower eyelid aperture',
    mouthMechanism: 'deforming skin ring and recessed oral mesh',
    export: 'standard mesh geometry and vertex colours; current pose is exportable, animation not baked',
    limitations: 'No sculpted production topology or final likeness approval; procedural cranium/eyelids remain a refinement study.'
  };
  update(0, 0, {});
  return { update, materials, root: group, surfaceZ, tuning: { ...effectiveTuning } };
}
