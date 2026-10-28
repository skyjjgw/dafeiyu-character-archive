import * as THREE from './vendor/three.module.js';

// Volumetric clumps in bind/world coordinates. All surfaces enter the real skin.
// The existing six 3-bone hair chains remain the only animated hair skeleton.
export function buildHair(ctx) {
  const { add, shapeGeometry, rigid, between, head, hairChains } = ctx;
  const headWeight = rigid(head);
  const V = values => new THREE.Vector3(...values);
  const palette = {
    base: new THREE.Color(ctx.hairPalette?.base ?? 0x264778),
    shadow: new THREE.Color(ctx.hairPalette?.shadow ?? 0x1b3159),
    tip: new THREE.Color(ctx.hairPalette?.tip ?? 0x559bc6),
    shine: new THREE.Color(ctx.hairPalette?.shine ?? 0x4068a1),
  };
  const built = { clumps: 0, surfaceParts: 0, triangles: 0 };

  function submit(geometry, material, weight) {
    const count = geometry.index ? geometry.index.count : geometry.attributes.position.count;
    built.triangles += count / 3;
    built.surfaceParts++;
    add(geometry, material, weight);
  }
  function tube(points, radius, material, weight, segments = 32) {
    submit(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, radius, 8, false), material, weight);
  }
  function ellipsoid(center, size, material, weight, segments = 24) {
    const geometry = new THREE.SphereGeometry(1, segments, 16);
    geometry.scale(...size).translate(...center); submit(geometry, material, weight);
  }

  // Counter-clockwise triangles for the outward side of a transported ellipse.
  // Parallel transport prevents flattened locks suddenly twisting at an S-bend.
  function lock(points, width, depth, weight, options = {}) {
    built.clumps++;
    let controls = points.map(p => p.isVector3 ? p.clone() : V(p));
    // Broad flowing locks use an approximating rounded path. Corner cutting
    // removes sharp interpolation knots before sweeping a finite-width curl;
    // it never makes a local ring suddenly thinner to conceal a folded mesh.
    if (options.smoothFlow) for (let pass = 0; pass < 3; pass++) {
      const rounded = [controls[0].clone()];
      for (let i = 0; i < controls.length - 1; i++) {
        rounded.push(controls[i].clone().lerp(controls[i + 1], .25), controls[i].clone().lerp(controls[i + 1], .75));
      }
      rounded.push(controls[controls.length - 1].clone()); controls = rounded;
    }
    const curve = new THREE.CatmullRomCurve3(controls, false, 'centripetal');
    // One consistently oriented sweep. Do not shrink individual rings from a
    // noisy point-curvature estimate or flip isolated faces: both create the
    // accordion creases and triangular silhouette cuts visible in native GLB.
    curve.arcLengthDivisions = 640;
    curve.updateArcLengths();
    const segments = Math.max(64, options.segments || 0), radial = Math.max(24, options.radial || 0);
    const positions = [], triangles = [], centers = [], tangents = [], outwardNormals = [];
    let previousTangent, widthAxis;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments, center = curve.getPointAt(t), tangent = curve.getTangentAt(t).normalize();
      if (!i) {
        widthAxis = new THREE.Vector3(...(options.widthAxis || [1, 0, 0]));
        widthAxis.addScaledVector(tangent, -widthAxis.dot(tangent));
        if (widthAxis.lengthSq() < 1e-8) widthAxis.set(0, 0, 1).addScaledVector(tangent, -tangent.z);
      } else {
        widthAxis.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(previousTangent, tangent));
        widthAxis.addScaledVector(tangent, -widthAxis.dot(tangent));
      }
      widthAxis.normalize();
      const depthAxis = new THREE.Vector3().crossVectors(tangent, widthAxis).normalize();
      previousTangent = tangent.clone();
      centers.push(center); tangents.push(tangent);
      // A broad middle, fuller lower shoulder, and a small rounded point. Never
      // collapse a whole ring to zero: that produces degenerate normal vectors.
      const profile = options.profile || (u => (.52 + .48 * THREE.MathUtils.smoothstep(u, 0, .20)) * (1 - .985 * THREE.MathUtils.smoothstep(u, .56, 1)));
      const radius = Math.max(.015, profile(t));
      const halfWidth = width * radius, halfDepth = depth * radius;
      for (let j = 0; j <= radial; j++) {
        const angle = j / radial * Math.PI * 2;
        // A shallow central ridge gives large anime locks a sculpted surface.
        const ridge = 1;
        const point = center.clone()
          .addScaledVector(widthAxis, Math.cos(angle) * halfWidth)
          .addScaledVector(depthAxis, Math.sin(angle) * halfDepth * ridge);
        positions.push(point.x, point.y, point.z);
        const outward = widthAxis.clone().multiplyScalar(Math.cos(angle) / Math.max(1e-6, halfWidth))
          .addScaledVector(depthAxis, Math.sin(angle) / Math.max(1e-6, halfDepth)).normalize();
        outwardNormals.push(outward);
        if (i < segments && j < radial) {
          const k = i * (radial + 1) + j;
          triangles.push(k, k + 1, k + radial + 1, k + 1, k + radial + 2, k + radial + 1);
        }
      }
    }
    const startCenter = positions.length / 3;
    positions.push(...centers[0].toArray(), ...centers[segments].toArray());
    outwardNormals.push(tangents[0].clone().negate(), tangents[segments].clone());
    for (let j = 0; j < radial; j++) {
      triangles.push(startCenter, j + 1, j);
      const k = segments * (radial + 1) + j;
      triangles.push(startCenter + 1, k, k + 1);
    }
    const complete = new THREE.BufferGeometry();
    complete.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    complete.setIndex(triangles);
    // Native renderers receive normals from the actual smooth surface rather
    // than an ellipse field that ignores the along-path taper and curvature.
    complete.computeVertexNormals();
    // Smooth the duplicated angular seam while retaining a closed solid lock.
    const normals = complete.attributes.normal;
    for (let i = 0; i <= segments; i++) {
      const first = i * (radial + 1), last = first + radial;
      const normal = new THREE.Vector3().fromBufferAttribute(normals, first).add(new THREE.Vector3().fromBufferAttribute(normals, last)).normalize();
      normals.setXYZ(first, normal.x, normal.y, normal.z); normals.setXYZ(last, normal.x, normal.y, normal.z);
    }
    // A single vertex-coloured material removes hard colour boundaries between
    // entire rings. Light blue is restricted to a faint, narrow surface sheen.
    const colors = [];
    for (let id = 0; id < complete.attributes.position.count; id++) {
      const ring = Math.min(segments, Math.floor(id / (radial + 1))), t = ring / segments;
      const angular = id % (radial + 1) / radial * Math.PI * 2;
      const normal = new THREE.Vector3().fromBufferAttribute(normals, id);
      const color = palette.base.clone();
      if (options.material === 'hairShade') color.lerp(palette.shadow, .27);
      // A continuous lower-half gradient belongs to the hair design. It is not
      // constrained by the separate, dark-indigo user reference for the tail.
      const tipAmount = options.lightEnds ? THREE.MathUtils.smoothstep(t, .48, .98) * .68 : 0;
      color.lerp(palette.tip, tipAmount);
      const stripe = Math.exp(-Math.pow((Math.cos(angular) - .12) / .21, 2));
      const begin = options.highlight === 'bang' ? .17 : .15;
      const end = options.highlight === 'bang' ? .82 : .70;
      const lengthWindow = THREE.MathUtils.smoothstep(t, begin, begin + .14) * (1 - THREE.MathUtils.smoothstep(t, end - .14, end));
      const sheen = stripe * lengthWindow * THREE.MathUtils.smoothstep(normal.z, .18, .78) * (options.highlight === 'bang' ? .61 : .38);
      color.lerp(palette.shine, sheen);
      colors.push(color.r, color.g, color.b);
    }
    complete.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const chunks = new Map(), a = new THREE.Vector3();
    for (let i = 0; i < triangles.length; i += 3) {
      const ids = triangles.slice(i, i + 3);
      const material = 'hairGradient';
      if (!chunks.has(material)) chunks.set(material, { p: [], n: [], c: [] });
      const chunk = chunks.get(material);
      for (const id of ids) {
        a.fromBufferAttribute(complete.attributes.position, id); chunk.p.push(a.x, a.y, a.z);
        a.fromBufferAttribute(normals, id); chunk.n.push(a.x, a.y, a.z);
        a.fromBufferAttribute(complete.attributes.color, id); chunk.c.push(a.x, a.y, a.z);
      }
    }
    for (const [material, chunk] of chunks) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(chunk.p, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(chunk.n, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(chunk.c, 3));
      submit(geometry, material, weight);
    }
    complete.dispose();
  }

  // Hairline ends above the eyes. The cap is only a quiet underlayer; the broad
  // overlapping locks, rather than a visible hemispherical rim, form the edge.
  const capVertices = [], capTriangles = [];
  const capRows = 32, capColumns = 96;
  for (let row = 0; row <= capRows; row++) {
    for (let col = 0; col <= capColumns; col++) {
      const phi = col / capColumns * Math.PI * 2;
      const front = Math.max(0, Math.sin(phi));
      const theta = Math.max(.003, row / capRows * (2.12 - .83 * front));
      capVertices.push(.674 * Math.sin(theta) * Math.cos(phi),
        2.43 + .612 * Math.cos(theta), .520 * Math.sin(theta) * Math.sin(phi) - .005);
      if (row < capRows && col < capColumns) {
        const k = row * (capColumns + 1) + col;
        capTriangles.push(k, k + 1, k + capColumns + 1, k + 1, k + capColumns + 2, k + capColumns + 1);
      }
    }
  }
  const cap = new THREE.BufferGeometry();
  cap.setAttribute('position', new THREE.Float32BufferAttribute(capVertices, 3)); cap.setIndex(capTriangles); cap.computeVertexNormals();
  const capColors = [];
  for (let row = 0; row <= capRows; row++) for (let col = 0; col <= capColumns; col++) {
    const phi = col / capColumns * Math.PI * 2, t = row / capRows;
    const shine = Math.pow(Math.max(0, Math.cos(phi - .58)), 38) * Math.sin(Math.PI * t) * .22;
    const color = palette.base.clone().lerp(palette.shine, shine);
    capColors.push(color.r, color.g, color.b);
  }
  cap.setAttribute('color', new THREE.Float32BufferAttribute(capColors, 3));
  submit(cap, 'hairGradient', headWeight);

  // Keep a broad lower curl until its final short rounded taper. Starting the
  // taper halfway down the whole lock made long needle-like terminal strands.
  const flowProfile = t => (.55 + .45 * THREE.MathUtils.smoothstep(t, 0, .19)) * (1 - .94 * THREE.MathUtils.smoothstep(t, .73, 1));

  // Center-back overlap closes the rear silhouette; this prevents six separate
  // ropes with daylight between them. Each half follows its existing back chain.
  for (const side of [-1, 1]) {
    const back = hairChains.find(h => h.side === side && h.lane === 2);
    const weight = p => p.y > back.points[1].y ? between(back.bones[0], back.bones[1])(p) : between(back.bones[1], back.bones[2])(p);
    lock([[side * .18, 2.88, -.25], [side * .24, 2.45, -.49], [side * .23, 1.99, -.54],
      [side * .14, 1.58, -.53], [side * .27, 1.20, -.46], [side * .36, .91, -.36], [side * .52, .96, -.30]],
    .276, .085, weight, { material: 'hairShade', lightEnds: true, profile: flowProfile, smoothFlow: true });
  }

  for (const h of hairChains) {
    const s = h.side;
    const weight = p => p.y > h.points[1].y ? between(h.bones[0], h.bones[1])(p) : between(h.bones[1], h.bones[2])(p);
    const paths = [
      [[s * .47, 2.77, -.015], [s * .62, 2.34, .015], [s * .73, 1.99, .050], [s * .65, 1.65, .090], [s * .85, 1.37, .100], [s * .91, 1.13, .120], [s * 1.01, 1.16, .100]],
      [[s * .43, 2.81, -.22], [s * .61, 2.36, -.24], [s * .73, 1.96, -.21], [s * .64, 1.57, -.16], [s * .84, 1.24, -.10], [s * .84, .93, -.05], [s * 1.00, .98, .010]],
      [[s * .33, 2.84, -.37], [s * .47, 2.38, -.49], [s * .60, 1.97, -.54], [s * .49, 1.58, -.50], [s * .73, 1.22, -.44], [s * .70, .71, -.34], [s * .88, .79, -.26]],
    ];
    // The middle layer is broad along depth, joining the front and back locks
    // in profile. Three X-wide tubes leave long rectangular windows in side view.
    lock(paths[h.lane], [.196, .207, .220][h.lane], [.064, .103, .100][h.lane], weight,
      { lightEnds: true, profile: flowProfile, smoothFlow: true, material: h.lane === 2 ? 'hairShade' : 'hair', widthAxis: h.lane === 1 ? [0, 0, 1] : [1, 0, 0] });
    // A shorter, offset secondary fold branches from the same broad group.
    // Its lower curl and blue face break up a single cylindrical highlight.
    const z = [-.005, -.20, -.46][h.lane], lift = [.20, 0, -.18][h.lane];
    lock([[s * (.57 + h.lane * .015), 2.13 + lift * .25, z], [s * (.70 + h.lane * .015), 1.87 + lift * .5, z + .035],
      [s * (.67 + h.lane * .012), 1.60 + lift, z + .06], [s * (.80 - h.lane * .03), 1.34 + lift, z + .085], [s * (.91 - h.lane * .04), 1.39 + lift, z + .095]],
    .090, .037, weight, { material: 'hairLight', lightEnds: true, profile: flowProfile, smoothFlow: true });
  }

  // Five broad bangs. The center tip is narrow at eye height; the side tips
  // leave the x≈±.235, y≈2.42 eye regions unobstructed in the front view.
  const bangProfile = t => (.65 + .35 * THREE.MathUtils.smoothstep(t, 0, .22)) * (1 - .985 * THREE.MathUtils.smoothstep(t, .43, 1));
  lock([[.005, 3.027, .075], [-.012, 2.950, .310], [-.015, 2.79, .505], [.005, 2.61, .555], [.025, 2.48, .550], [.062, 2.410, .505]],
    .183, .050, headWeight, { highlight: 'bang', profile: bangProfile });
  for (const side of [-1, 1]) {
    // A continuous temple wrap bridges the frontal cheek locks and rear cap.
    // It covers the cranium join from profile instead of letting two nearly
    // coincident scalp/face surfaces reveal a row of skin-coloured triangles.
    lock([[side * .51, 2.87, .070], [side * .625, 2.68, .130], [side * .655, 2.44, .150],
      [side * .615, 2.23, .175], [side * .505, 2.12, .215]],
      .255, .070, headWeight, { widthAxis: [0, 0, 1], profile: t => (.68 + .32 * THREE.MathUtils.smoothstep(t, 0, .20)) * (1 - .985 * THREE.MathUtils.smoothstep(t, .67, 1)) });
    lock([[side * .10, 3.017, .065], [side * .26, 2.91, .315], [side * .395, 2.72, .475], [side * .45, 2.49, .465], [side * .42, 2.30, .430], [side * .365, 2.22, .405]],
      .174, .052, headWeight, { highlight: 'bang', profile: bangProfile });
    lock([[side * .055, 3.022, .070], [side * .15, 2.935, .325], [side * .235, 2.78, .510], [side * .29, 2.645, .540]],
      .105, .031, headWeight, { highlight: 'bang', profile: bangProfile, material: 'hair' });
    // Thick cheek locks turn inward and taper rather than ending in straight rods.
    lock([[side * .46, 2.81, .22], [side * .555, 2.58, .34], [side * .55, 2.34, .39],
      [side * .49, 2.17, .405], [side * .38, 2.12, .41]],
      .158, .055, headWeight, { material: 'hair', profile: t => (.62 + .38 * THREE.MathUtils.smoothstep(t, 0, .18)) * (1 - .985 * THREE.MathUtils.smoothstep(t, .59, 1)) });
    lock([[side * .56, 2.38, .22], [side * .60, 2.20, .28], [side * .55, 2.055, .33], [side * .44, 1.99, .36]],
      .100, .041, headWeight, { lightEnds: true });
    // Only a few shallow parting seams; no dense painted-on spaghetti lines.
    tube([[side * .035, 3.006, -.035], [side * .22, 2.98, -.225], [side * .43, 2.77, -.405], [side * .48, 2.43, -.495]].map(V), .004, 'hairShade', headWeight, 24);
  }

  // Rounded, tapering loop-shaped ahoge, with a genuine curved cross section.
  lock([[.018, 2.995, .025], [.025, 3.100, .025], [-.055, 3.195, .025], [-.19, 3.205, .025], [-.255, 3.13, .025], [-.22, 3.065, .035]],
    .025, .016, headWeight, { profile: t => (.65 + .35 * THREE.MathUtils.smoothstep(t, 0, .25)) * (1 - .985 * THREE.MathUtils.smoothstep(t, .55, 1)), material: 'hair' });

  // One closed pleated ribbon, not a chain of white spheres. The outward edge
  // scallops continuously and the fabric alternates shallow front/back folds.
  function ruffleBand() {
    const positions = [], triangles = [];
    const steps = 108, rings = 4, stride = rings + 1;
    for (const layer of [-1, 1]) for (let i = 0; i <= steps; i++) {
      const a = .055 + i / steps * (Math.PI - .11), fold = Math.cos(a * 18);
      const outward = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
      const base = new THREE.Vector3(.660 * Math.cos(a), 2.43 + .588 * Math.sin(a), -.065);
      for (let j = 0; j <= rings; j++) {
        const u = j / rings;
        const scallop = (.077 + .022 * (.5 + .5 * Math.cos(a * 18))) * u;
        const p = base.clone().addScaledVector(outward, scallop);
        p.z += .030 * Math.sin(a * 18) * Math.sin(u * Math.PI / 2) + layer * .012;
        positions.push(...p.toArray());
      }
    }
    const sheetVertices = (steps + 1) * stride;
    for (let i = 0; i < steps; i++) for (let j = 0; j < rings; j++) {
      const k = i * stride + j, m = k + sheetVertices;
      // Front z-positive and back z-negative surfaces have opposite winding.
      triangles.push(m, m + 1, m + stride, m + 1, m + stride + 1, m + stride);
      triangles.push(k, k + stride, k + 1, k + 1, k + stride, k + stride + 1);
    }
    for (let i = 0; i < steps; i++) for (const edge of [0, rings]) {
      const a = i * stride + edge, b = a + stride, c = a + sheetVertices, d = b + sheetVertices;
      if (edge === 0) triangles.push(a, c, b, c, d, b);
      else triangles.push(a, b, c, c, b, d);
    }
    for (const row of [0, steps]) for (let j = 0; j < rings; j++) {
      const a = row * stride + j, b = a + 1, c = a + sheetVertices, d = b + sheetVertices;
      if (row === 0) triangles.push(a, b, c, b, d, c);
      else triangles.push(a, c, b, b, c, d);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(triangles); geometry.computeVertexNormals();
    submit(geometry, 'white', headWeight);
    const seam = [];
    for (let i = 0; i <= 48; i++) {
      const a = .055 + i / 48 * (Math.PI - .11);
      seam.push(new THREE.Vector3(.658 * Math.cos(a), 2.43 + .586 * Math.sin(a), -.036));
    }
    tube(seam, .010, 'white', headWeight, 48);
    // Tiny pierced-looking scallop loops remain connected to the fabric edge.
    for (let i = 0; i < 15; i++) {
      const a = .14 + i / 14 * (Math.PI - .28), points = [];
      for (let j = 0; j <= 8; j++) {
        const t = j / 8, angle = a + (t - .5) * .078;
        const lift = .065 + .023 * Math.sin(Math.PI * t);
        points.push(new THREE.Vector3((.660 + lift) * Math.cos(angle), 2.43 + (.588 + lift) * Math.sin(angle), -.039));
      }
      tube(points, .0055, 'white', headWeight, 12);
    }
  }
  ruffleBand();

  // Mirroring an extruded mesh changes winding. Reverse each triangle as well
  // so the negative-X fin and ribbon remain outward-facing with FrontSide.
  function mirror(geometry, side) {
    if (side > 0) return geometry;
    geometry.scale(-1, 1, 1);
    if (geometry.index) {
      const a = geometry.index.array;
      for (let i = 0; i < a.length; i += 3) [a[i + 1], a[i + 2]] = [a[i + 2], a[i + 1]];
    } else {
      for (const attribute of Object.values(geometry.attributes)) for (let i = 0; i < attribute.count; i += 3) for (let j = 0; j < attribute.itemSize; j++) {
        const a = (i + 1) * attribute.itemSize + j, b = (i + 2) * attribute.itemSize + j;
        [attribute.array[a], attribute.array[b]] = [attribute.array[b], attribute.array[a]];
      }
    }
    geometry.computeVertexNormals(); return geometry;
  }
  for (const side of [-1, 1]) {
    const fin = new THREE.Shape();
    fin.moveTo(0, .040); fin.bezierCurveTo(.14, .065, .27, -.080, .438, -.090);
    fin.bezierCurveTo(.365, -.205, .18, -.236, .035, -.154); fin.quadraticCurveTo(-.02, -.080, 0, .040);
    const blue = mirror(shapeGeometry(fin, .100), side);
    blue.rotateY(side * -.16).translate(side * .553, 2.425, -.042); submit(blue, 'tail', headWeight);
    const belly = new THREE.Shape();
    belly.moveTo(.027, -.088); belly.quadraticCurveTo(.20, -.145, .405, -.108);
    belly.quadraticCurveTo(.365, -.175, .315, -.160); belly.quadraticCurveTo(.276, -.224, .224, -.188);
    belly.quadraticCurveTo(.155, -.221, .116, -.165); belly.quadraticCurveTo(.049, -.177, .027, -.088);
    const white = mirror(shapeGeometry(belly, .022), side);
    white.rotateY(side * -.16).translate(side * .553, 2.425, .020); submit(white, 'white', headWeight);

    // Two flared, thick ribbon wings plus a central knot; small ribbon tails
    // belong to the same bow instead of reading as a pair of round hair beads.
    for (const wingSide of [-1, 1]) {
      const wing = new THREE.Shape();
      wing.moveTo(0, 0); wing.bezierCurveTo(.055, .035, .110, .115, .145, .075);
      wing.bezierCurveTo(.163, .026, .153, -.058, .128, -.079); wing.bezierCurveTo(.089, -.091, .025, -.012, 0, 0);
      const wingGeometry = mirror(shapeGeometry(wing, .045), wingSide);
      wingGeometry.rotateZ(side * -.08).translate(side * .624, 2.618, .152); submit(wingGeometry, 'hairLight', headWeight);
      const tail = new THREE.Shape();
      tail.moveTo(.015, -.012); tail.lineTo(.078, -.010); tail.quadraticCurveTo(.095, -.095, .070, -.145);
      tail.lineTo(.047, -.122); tail.lineTo(.019, -.145); tail.quadraticCurveTo(.042, -.061, .015, -.012);
      const tailGeometry = mirror(shapeGeometry(tail, .028), wingSide);
      tailGeometry.rotateZ(wingSide * .18).translate(side * .624, 2.602, .130); submit(tailGeometry, 'hair', headWeight);
    }
    ellipsoid([side * .624, 2.618, .185], [.029, .036, .026], 'hairShine', headWeight, 16);
  }
  return { ...built, kind: 'volumetric-grouped-S-locks', animatedHairChains: hairChains.length, animatedHairBones: hairChains.reduce((sum, chain) => sum + chain.bones.length, 0) };
}
