import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
import {createFaceProfileVolume} from './profile-volume.js';

// Coordinates were measured on the unmodified 1920 × 1080 reference cover.
// Frontal identity comes from those pixels. Hidden depths are inferred and
// remain under full-view QA; the original iris paint stays attached to the eye.
export const FACE_SOURCE = Object.freeze({
  width:1920, height:1080, origin:[815,583], pixelsPerUnit:775, tilt:.06,
  path:'references/video-covers/BV1g2JX6HEHX.jpg',
  eyes:[
    {name:'left', aperture:[615,588], iris:[634.5,590], irisRadius:[74.5,87], width:.151},
    {name:'right', aperture:[1020,569], iris:[1003.5,569], irisRadius:[63.5,82], width:.139},
  ],
});

const TAU=Math.PI*2, C=Math.cos(.06), S=Math.sin(.06);
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,Number.isFinite(v)?v:0));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const skin='#c8b9a9';
export function sourceToFace(px,py) {
  return [(C*(px-815)-S*(py-583))/775,(-S*(px-815)-C*(py-583))/775];
}
export function faceToSource(x,y) {
  return [815+775*(C*x-S*y),583-775*(S*x+C*y)];
}

// Closed head contour, with the cheek and short chin measured independently of
// the hair volume. The wide upper skull is concealed by the separate hair mesh.
const rightOutline=[];
function bezier(p0,p1,p2,p3,steps=24) {
  for(let i=rightOutline.length?1:0;i<=steps;i++) {
    const t=i/steps,q=1-t;
    rightOutline.push([q*q*q*p0[0]+3*q*q*t*p1[0]+3*q*t*t*p2[0]+t*t*t*p3[0],q*q*q*p0[1]+3*q*q*t*p1[1]+3*q*t*t*p2[1]+t*t*t*p3[1]]);
  }
}
bezier([0,.64],[.39,.64],[.60,.44],[.60,.20]);
bezier([.60,.20],[.60,.04],[.54,-.10],[.41,-.245]);
bezier([.41,-.245],[.30,-.345],[.12,-.382],[.023,-.382]);
const outline=[...rightOutline,...rightOutline.slice(1,-1).reverse().map(([x,y])=>[-x+.046*smooth(clamp((-y-.1)/.282)),y])];
function centerAt(y) {
  // The left outline was authored at the sampled Bezier knots above. Match
  // its straight mesh edges, rather than re-evaluating a slightly different
  // smooth chin shift between those knots on the back half.
  const yy=clamp(y,-.382,.64);let lo=0,hi=rightOutline.length-1;
  while(hi-lo>1){const mid=(lo+hi)>>1;if(rightOutline[mid][1]>=yy)lo=mid;else hi=mid;}
  const ay=rightOutline[lo][1],by=rightOutline[hi][1],k=ay===by?0:(ay-yy)/(ay-by);
  return mix(.023*smooth(clamp((-ay-.1)/.282)),.023*smooth(clamp((-by-.1)/.282)),k);
}
function widthAt(y) {
  const yy=clamp(y,-.382,.64);
  let lo=0,hi=rightOutline.length-1;
  while(hi-lo>1){const mid=(lo+hi)>>1;if(rightOutline[mid][1]>=yy)lo=mid;else hi=mid;}
  const [ax,ay]=rightOutline[lo],[bx,by]=rightOutline[hi];
  return Math.max(.0001,mix(ax,bx,ay===by?0:(ay-yy)/(ay-by))-centerAt(yy));
}
const profileVolume=createFaceProfileVolume({halfWidthAt:widthAt,centerAt,strength:.65,installed:true});
export function faceSurfaceZ(x,y) {
  return profileVolume.frontZ(x,y);
}

const visibleSkinPixels=[
  [476,573],[522,500],[573,422],[632,305],[662,418],[704,494],
  [756,532],[793,559],[780,574],[817,570],[840,551],[866,572],
  [915,568],[892,542],[911,465],[938,363],[953,292],[981,379],
  [1045,426],[1099,462],[1140,510],[1168,581],[1153,661],
  [1127,711],[1084,716],[1107,737],[1145,743],[1115,790],
  [1072,820],[976,855],[912,858],[896,848],[802,848],[783,864],
  [740,867],[623,849],[549,818],
  [521,791],[580,768],[532,758],[499,721],[477,667],[463,608],
];
const visibleSkin=visibleSkinPixels.map(p=>sourceToFace(...p));
const eyeTraces=[
  {upper:[[499,607],[516,557],[542,521],[578,496],[618,487],[656,492],[689,514],[709,551],[724,598]],lower:[[499,607],[519,634],[550,659],[591,677],[639,682],[684,666],[713,642],[724,598]]},
  {upper:[[916,573],[926,529],[948,495],[978,474],[1010,470],[1040,481],[1067,507],[1088,541],[1104,592]],lower:[[916,573],[924,597],[940,622],[971,648],[1008,651],[1057,650],[1083,630],[1104,592]]},
];
const eyes=FACE_SOURCE.eyes.map((eye,index)=>({
  ...eye,index, center:sourceToFace(...eye.aperture),irisCenter:sourceToFace(...eye.iris),
  outerX:index===0?.198:.185,outerTop:.205,outerBottom:.147,
  upper:eyeTraces[index].upper.map(p=>sourceToFace(...p)),
  lower:eyeTraces[index].lower.map(p=>sourceToFace(...p)),
}));
for(const eye of eyes){eye.minX=eye.upper[0][0];eye.maxX=eye.upper.at(-1)[0];}
const mouthCenter=sourceToFace(852,741);
const mouthHole={center:mouthCenter,rx:.108,top:.056,bottom:.078};

function ellipsePoint(cx,cy,rx,top,bottom,t) {
  const s=Math.sin(t);return [cx+rx*Math.cos(t),cy+(s>=0?top:bottom)*s];
}
function eyeOuter(eye,t,expand=0) {
  return ellipsePoint(...eye.center,eye.outerX+expand,eye.outerTop+expand,eye.outerBottom+expand,t);
}
function mouthOuter(t,expand=0) {
  return ellipsePoint(...mouthCenter,mouthHole.rx+expand,mouthHole.top+expand,mouthHole.bottom+expand,t);
}
function insidePolygon(x,y,polygon) {
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const [xi,yi]=polygon[i],[xj,yj]=polygon[j];
    if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi) inside=!inside;
  }
  return inside;
}
function insideHole(x,y,margin=0) {
  for(const e of eyes) {
    const dy=y-e.center[1],ry=dy>=0?e.outerTop:e.outerBottom;
    if(((x-e.center[0])/(e.outerX+margin))**2+(dy/(ry+margin))**2<1) return true;
  }
  const dy=y-mouthCenter[1];
  return ((x-mouthCenter[0])/(mouthHole.rx+margin))**2+(dy/((dy>=0?mouthHole.top:mouthHole.bottom)+margin))**2<1;
}

function makeGeometry(positions,indices,uvs,colors) {
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  if(uvs)g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  if(colors)g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  if(indices)g.setIndex(indices);
  g.computeVertexNormals();g.computeBoundingSphere();return g;
}
// Fitted from clean source samples (760,600), (815,620), (870,650),
// (620,720), (700,710), (1000,690), and (1040,740). This continues the
// lighting and blush through the removed baked eye/tear region.
const skinScratch=new THREE.Color();
function skinColor(x,y) {
  const blush=Math.exp(-(((x+.29)/.17)**2)-(((y+.17)/.105)**2))+1.08*Math.exp(-(((x-.32)/.16)**2)-(((y+.17)/.105)**2));
  const shadow=Math.max(x,0)*12;
  return skinScratch.setRGB(
    clamp((205-16*x+10*Math.min(y,0)+4*blush-shadow)/255),
    clamp((193-15*x+7*Math.min(y,0)-25*blush-shadow)/255),
    clamp((177-17*x+6*Math.min(y,0)-29*blush-shadow)/255),
    THREE.SRGBColorSpace,
  );
}
function addSkinColors(g) {
  const p=g.getAttribute('position'),values=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){const c=skinColor(p.getX(i),p.getY(i));values.set([c.r,c.g,c.b],i*3);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(values,3));return g;
}
function frontGeometry() {
  const shape=new THREE.Shape(outline.map(([x,y])=>new THREE.Vector2(x,y)));
  const pointKey=([x,y])=>`${Math.fround(x)},${Math.fround(y)}`;
  const edgeKey=(a,b)=>{const aa=pointKey(a),bb=pointKey(b);return aa<bb?`${aa}|${bb}`:`${bb}|${aa}`;};
  const outsideEdges=new Set(outline.map((p,i)=>edgeKey(p,outline[(i+1)%outline.length])));
  for(const e of eyes) {
    const points=Array.from({length:96},(_,i)=>new THREE.Vector2(...eyeOuter(e,-i/96*TAU)));
    shape.holes.push(new THREE.Path(points));
  }
  shape.holes.push(new THREE.Path(Array.from({length:64},(_,i)=>new THREE.Vector2(...mouthOuter(-i/64*TAU)))));
  const flat=new THREE.ShapeGeometry(shape,24).toNonIndexed();
  const src=flat.getAttribute('position'),p=[];
  // Subdivide the triangulated open surface before projecting it onto a curved
  // volume. Identical edge subdivisions avoid cracks between large triangles.
  const n=8;
  const add=(a,b,c)=>{for(const q of [a,b,c])p.push(q[0],q[1],q[2]?profileVolume.boundaryZ(q[1]):faceSurfaceZ(q[0],q[1]));};
  for(let tri=0;tri<src.count;tri+=3) {
    const a=[src.getX(tri),src.getY(tri)],b=[src.getX(tri+1),src.getY(tri+1)],c=[src.getX(tri+2),src.getY(tri+2)];
    const ab=outsideEdges.has(edgeKey(a,b)),ac=outsideEdges.has(edgeKey(a,c)),bc=outsideEdges.has(edgeKey(b,c));
    const point=(i,j)=>[a[0]+(b[0]-a[0])*i/n+(c[0]-a[0])*j/n,a[1]+(b[1]-a[1])*i/n+(c[1]-a[1])*j/n,(j===0&&ab)||(i===0&&ac)||(i+j===n&&bc)];
    for(let i=0;i<n;i++)for(let j=0;j<n-i;j++) {
      add(point(i,j),point(i+1,j),point(i,j+1));
      if(i+j<n-1)add(point(i+1,j),point(i+1,j+1),point(i,j+1));
    }
  }
  flat.dispose();return addSkinColors(makeGeometry(p));
}
function paintGeometry(sw,sh) {
  const p=[],uv=[];
  const nx=176,ny=136,x0=-.48,x1=.49,y0=-.380,y1=.40;
  const stepX=(x1-x0)/nx,stepY=(y1-y0)/ny;
  const add=triangle=>{
    const mid=triangle.reduce((a,b)=>[a[0]+b[0]/3,a[1]+b[1]/3],[0,0]);
    if(!insidePolygon(...mid,visibleSkin)||insideHole(...mid,.002))return;
    // Reject vertices crossing the painted boundary. Unpainted patches expose
    // the matching skin base, never other people, subtitles, or room pixels.
    if(triangle.some(v=>!insidePolygon(...v,visibleSkin)||insideHole(...v,.001)))return;
    for(const [x,y]of triangle) {
      p.push(x,y,faceSurfaceZ(x,y)+.0012);
      const [px,py]=faceToSource(x,y);uv.push(px/sw,1-py/sh);
    }
  };
  for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++) {
    const x=x0+ix*stepX,y=y0+iy*stepY;
    add([[x,y],[x+stepX,y],[x,y+stepY]]);
    add([[x+stepX,y],[x+stepX,y+stepY],[x,y+stepY]]);
  }
  return makeGeometry(p,null,uv);
}
function backGeometry() {
  const p=[],idx=[],levels=[],columns=32;
  // Use the very same outline intervals and eight edge subdivisions as the
  // front triangulation. Independent uniform rows leave a narrow geometric
  // crack even when both mathematical surfaces agree at their endpoints.
  for(let i=0;i<rightOutline.length-1;i++)for(let j=0;j<8;j++)levels.push(mix(rightOutline[i][1],rightOutline[i+1][1],j/8));
  levels.push(rightOutline.at(-1)[1]);levels.reverse();const rows=levels.length-1;
  for(let iy=0;iy<=rows;iy++) {
    const y=levels[iy],w=iy===0||iy===rows?0:widthAt(y),cx=centerAt(y);
    for(let j=0;j<=columns;j++) {
      const a=j/columns*Math.PI;
      const x=cx+w*Math.cos(a);p.push(x,y,profileVolume.backZ(x,y));
      if(iy<rows&&j<columns){const k=iy*(columns+1)+j;idx.push(k,k+columns+1,k+1,k+1,k+columns+1,k+columns+2);}
    }
  }
  return makeGeometry(p,idx);
}

// A reusable radial strip, with fixed topology but continuously movable edges.
function radialGeometry(segments=96,rings=8,withUv=false) {
  const p=new Float32Array((segments+1)*(rings+1)*3),idx=[];
  for(let r=0;r<rings;r++)for(let i=0;i<segments;i++) {
    const k=r*(segments+1)+i;idx.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2);
  }
  const g=makeGeometry(p,idx,withUv?new Float32Array((segments+1)*(rings+1)*2):null);
  g.getAttribute('position').setUsage(THREE.DynamicDrawUsage);
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,.1,.2),1);
  g.userData={segments,rings};return g;
}
function updateRadial(g,outer,inner,zOffset,colored=false) {
  const {segments,rings}=g.userData,p=g.getAttribute('position');let n=0;
  let colors=g.getAttribute('color');
  if(colored&&!colors){colors=new THREE.Float32BufferAttribute(new Float32Array(p.count*4),4).setUsage(THREE.DynamicDrawUsage);g.setAttribute('color',colors);}
  for(let r=0;r<=rings;r++)for(let i=0;i<=segments;i++) {
    const t=i/segments*TAU,a=outer(t),b=inner(t),k=r/rings;
    const x=mix(a[0],b[0],k),y=mix(a[1],b[1],k);
    p.setXYZ(n,x,y,faceSurfaceZ(x,y)+zOffset);
    if(colored){const c=skinColor(x,y),alpha=smooth(clamp(Math.hypot(x-a[0],y-a[1])/.017));colors.setXYZW(n,c.r,c.g,c.b,alpha);}n++;
  }
  if(colored)colors.needsUpdate=true;
  p.needsUpdate=true;
}
function profileY(points,x) {
  for(let i=0;i<points.length-1;i++)if(x<=points[i+1][0]) {
    const t=clamp((x-points[i][0])/(points[i+1][0]-points[i][0]));
    const a=points[Math.max(0,i-1)][1],b=points[i][1],c=points[i+1][1],d=points[Math.min(points.length-1,i+2)][1];
    return .5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
  }
  return points.at(-1)[1];
}
function lidY(eye,u,top,state) {
  const x=mix(eye.minX,eye.maxX,(u+1)/2),arc=Math.pow(Math.max(0,1-u*u),.60);
  const chord=mix(eye.upper[0][1],eye.upper.at(-1)[1],(u+1)/2);
  const closed=chord+(.013+.020*state.happy-.006*state.sad)*arc;
  const open=profileY(top?eye.upper:eye.lower,x)+(top?-.022*state.happy-.018*state.sad:.022*state.happy)*arc;
  return mix(open,closed,state.blink);
}
function eyeAperture(eye,t,state) {
  const u=Math.cos(t),top=Math.sin(t)>=0;
  return [mix(eye.minX,eye.maxX,(u+1)/2),lidY(eye,u,top,state)];
}
function stripGeometry(steps=80) {
  const p=new Float32Array((steps+1)*2*3),idx=[];
  for(let i=0;i<steps;i++){const k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}
  const g=makeGeometry(p,idx);g.getAttribute('position').setUsage(THREE.DynamicDrawUsage);g.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,.1,.2),1);g.userData={steps};return g;
}
function updateStrip(g,path,width,zOffset) {
  const p=g.getAttribute('position'),{steps}=g.userData;
  for(let i=0;i<=steps;i++) {
    const u=i/steps,x0=path(clamp(u-.0005)),x1=path(clamp(u+.0005)),q=path(u);
    const dx=x1[0]-x0[0],dy=x1[1]-x0[1],len=Math.hypot(dx,dy)||1;
    const w=typeof width==='function'?width(u):width;
    for(let j=0;j<2;j++) {
      const sign=j===0?-1:1,x=q[0]-dy/len*w*sign/2,y=q[1]+dx/len*w*sign/2;
      p.setXYZ(i*2+j,x,y,faceSurfaceZ(x,y)+zOffset);
    }
  }
  p.needsUpdate=true;
}
function irisGeometry(rows=38,cols=42) {
  const p=new Float32Array((rows+1)*(cols+1)*3),uv=new Float32Array((rows+1)*(cols+1)*2),idx=[];
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
    const k=j*(cols+1)+i;idx.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1);
  }
  const g=makeGeometry(p,idx,uv);g.getAttribute('position').setUsage(THREE.DynamicDrawUsage);g.getAttribute('uv').setUsage(THREE.DynamicDrawUsage);g.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,.1,.2),1);g.userData={rows,cols};return g;
}
function updateIris(g,eye,state,sw,sh) {
  const {rows,cols}=g.userData,p=g.getAttribute('position'),uv=g.getAttribute('uv');
  const rx=eye.irisRadius[0]/775,ry=eye.irisRadius[1]/775;
  const gx=state.gazeX*.014,gy=state.gazeY*.010;
  const cx=eye.irisCenter[0]+gx,cy=eye.irisCenter[1]+gy;
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++) {
    const u=i/cols*2-1,x=cx+u*rx,extent=ry*Math.sqrt(Math.max(0,1-u*u));
    const ex=clamp((x-eye.minX)/(eye.maxX-eye.minX)*2-1,-1,1);
    const lo=Math.max(cy-extent,lidY(eye,ex,false,state)+.0003),hi=Math.min(cy+extent,lidY(eye,ex,true,state)-.0003);
    const y=mix(lo,Math.max(lo,hi),j/rows),index=j*(cols+1)+i;
    p.setXYZ(index,x,y,faceSurfaceZ(x,y)+.0048);
    const [px,py]=faceToSource(x-gx,y-gy);uv.setXY(index,px/sw,1-py/sh);
  }
  p.needsUpdate=true;uv.needsUpdate=true;
}

function mouthPoint(t,state) {
  const u=Math.cos(t),arc=Math.sqrt(Math.max(0,1-u*u)),top=Math.sin(t)>=0;
  const happy=state.happy,sad=state.sad;
  const width=.073+.009*happy+.016*state.talk;
  const smile=(.010+.009*happy-.017*sad)*(u*u-.45);
  const upper=.009*state.talk*arc;
  const lower=-(.053*state.talk+.012*happy)*arc;
  return [mouthCenter[0]+u*width,mouthCenter[1]+smile+(top?upper:lower)];
}

export function createPaintedFace({head,resources,texture,sourceWidth=1920,sourceHeight=1080}={}) {
  if(!head?.add)throw new TypeError('createPaintedFace requires a Three.js head Object3D');
  if(!texture?.isTexture)throw new TypeError('createPaintedFace requires the loaded original reference texture');
  if(!(sourceWidth>0&&sourceHeight>0))throw new RangeError('Invalid source texture dimensions');
  const root=new THREE.Group();root.name='painted-face';head.add(root);
  const owned=new Set();let disposed=false;
  const own=value=>{owned.add(value);if(resources?.add)resources.add(value);return value;};
  const material=(name,properties={})=>{const m=own(new THREE.MeshBasicMaterial({color:skin,side:THREE.DoubleSide,toneMapped:false,...properties}));m.name=name;return m;};
  const mesh=(name,geometry,mat)=>{own(geometry);const m=new THREE.Mesh(geometry,mat);m.name=name;root.add(m);return m;};
  texture.colorSpace=THREE.SRGBColorSpace;
  const volumeMat=material('unpainted skin volume');
  const skinMat=material('source-fitted skin lighting and blush',{color:0xffffff,vertexColors:true});
  const ringMat=material('source-fitted skin with blended exterior',{color:0xffffff,vertexColors:true,transparent:true,depthWrite:false});
  const paintMat=material('original unmodified facial paint',{color:0xffffff,map:texture});
  const irisMat=material('original iris paint including pupil and highlights',{color:0xffffff,map:texture});
  const scleraMat=material('warm eye white',{color:'#dcd9d3'});
  const lashMat=material('navy brown upper eyelashes',{color:'#1c1820'});
  const lowerMat=material('subtle lower eyelashes',{color:'#8e756b'});
  const creaseMat=material('soft independent eyebrows',{color:'#9d8579'});
  const mouthMat=material('recessed mouth interior',{color:'#6d3b40'});
  const tongueMat=material('tongue',{color:'#bd7476'});
  const chinMat=material('soft drawn jaw contour',{color:'#80675e'});
  mesh('closed rounded back of skull',backGeometry(),volumeMat);
  mesh('curved face with genuine eye and mouth openings',frontGeometry(),skinMat);
  mesh('reference skin, nose and cheek paint only',paintGeometry(sourceWidth,sourceHeight),paintMat);
  const chin=mesh('continuous short rounded chin contour',stripGeometry(112),chinMat);
  const lowerRight=rightOutline.filter(p=>p[1]<-.20);
  const chinPath=[...lowerRight.map(([x,y])=>[-x+.046*smooth(clamp((-y-.1)/.282)),y]),...lowerRight.slice(0,-1).reverse()];
  updateStrip(chin.geometry,u=>{const n=u*(chinPath.length-1),i=Math.min(chinPath.length-2,Math.floor(n)),k=n-i;return[mix(chinPath[i][0],chinPath[i+1][0],k),mix(chinPath[i][1],chinPath[i+1][1],k)];},.0022,.0040);
  const eyeMeshes=eyes.map(e=>({
    e,
    ring:mesh(`${e.name} deforming skin eyelid`,radialGeometry(96,16),ringMat),
    white:mesh(`${e.name} exposed sclera`,radialGeometry(96,9),scleraMat),
    iris:mesh(`${e.name} sampled original iris`,irisGeometry(),irisMat),
    upper:mesh(`${e.name} moving upper eyelash`,stripGeometry(),lashMat),
    wing:mesh(`${e.name} pointed outer lashes`,makeGeometry(new Float32Array(9)),lashMat),
    lower:mesh(`${e.name} moving lower eyelash`,stripGeometry(),lowerMat),
    crease:mesh(`${e.name} moving eyelid crease`,stripGeometry(64),creaseMat),
  }));
  const mouthRing=mesh('continuously deforming skin around mouth',radialGeometry(96,14),ringMat);
  const mouth=mesh('continuously opening mouth cavity',radialGeometry(96,8),mouthMat);
  const tongue=mesh('tongue inside opening',radialGeometry(64,4),tongueMat);
  const lips=mesh('continuous smile contour',stripGeometry(96),mouthMat);
  const state={blink:0,talk:0,mood:'neutral',happy:0,sad:0,gazeX:0,gazeY:0};
  function update(...args) {
    if(disposed)return;
    // Accept update(state), update(dt,state), and update(dt,time,state).
    const input=[...args].reverse().find(a=>a&&typeof a==='object')||{};
    state.blink=clamp(Number(input.blink));
    const talk=input.talk??input.talking??0;
    state.talk=clamp(talk===true?1:Number(talk));
    state.mood=['neutral','happy','sad'].includes(input.mood)?input.mood:'neutral';
    state.happy=clamp(Number(input.happy??(state.mood==='happy'?1:0)));
    state.sad=clamp(Number(input.sad??(state.mood==='sad'?1:0)));
    state.gazeX=clamp(Number(input.gazeX),-1,1);state.gazeY=clamp(Number(input.gazeY),-1,1);
    const browState={...state,blink:0};
    for(const m of eyeMeshes) {
      const e=m.e,inner=t=>eyeAperture(e,t,state);
      updateRadial(m.ring.geometry,t=>eyeOuter(e,t,.025),inner,.0060,true);
      updateRadial(m.white.geometry,inner,()=>e.center,.0032);
      updateIris(m.iris.geometry,e,state,sourceWidth,sourceHeight);
      m.iris.visible=state.blink<.993;
      m.white.visible=state.blink<.998;
      const upper=u=>{const x=mix(-1,1,u);return [mix(e.minX,e.maxX,u),lidY(e,x,true,state)];};
      const lower=u=>{const x=mix(-1,1,u);return [mix(e.minX,e.maxX,u),lidY(e,x,false,state)];};
      updateStrip(m.upper.geometry,upper,u=>mix(.006+.028*Math.pow(Math.sin(Math.PI*u),.55),.0025+.0065*Math.pow(Math.sin(Math.PI*u),.65),state.blink),.0080);
      updateStrip(m.lower.geometry,lower,u=>.0015+.0016*Math.sin(Math.PI*u),.0070);
      updateStrip(m.crease.geometry,u=>{
        const f=mix(.22,.88,u),x=mix(e.minX,e.maxX,f);
        return[x,lidY(e,f*2-1,true,browState)+.060+.002*state.blink+state.sad*.016*(e.index===0?u:1-u)];
      },u=>.0040*Math.pow(Math.sin(Math.PI*u),.6),.0072);
      const outer=e.index===0?0:1,sign=e.index===0?-1:1,q=upper(outer),wing=m.wing.geometry.getAttribute('position');
      const wingPoints=[[q[0]+sign*.035,q[1]+.035*(1-state.blink*.5)],[q[0]-sign*.014,q[1]+.051*(1-state.blink*.65)],[q[0]-sign*.018,q[1]-.027*(1-state.blink)]];
      wingPoints.forEach(([x,y],i)=>wing.setXYZ(i,x,y,faceSurfaceZ(x,y)+.0083));wing.needsUpdate=true;m.wing.geometry.computeBoundingSphere();
    }
    const mouthInner=t=>mouthPoint(t,state);
    updateRadial(mouthRing.geometry,t=>mouthOuter(t,.025),mouthInner,.0060,true);
    updateRadial(mouth.geometry,mouthInner,()=>[mouthCenter[0],mouthCenter[1]-.02*state.talk],.0030);
    const tongueOuter=t=>{const q=mouthInner(t);return[mix(mouthCenter[0],q[0],.62),mix(mouthCenter[1]-.036*state.talk,q[1],.33)];};
    updateRadial(tongue.geometry,tongueOuter,()=>[mouthCenter[0],mouthCenter[1]-.035*state.talk],.0040);
    tongue.visible=state.talk>.25;
    updateStrip(lips.geometry,u=>mouthInner(Math.PI+Math.PI*u),u=>{
      const twoArcGap=smooth(clamp((Math.abs(u-.5)-.055)/.030));
      const connected=mix(twoArcGap,1,clamp(state.talk*8+state.happy));
      return (.0027+.0007*Math.sin(Math.PI*u))*connected;
    },.0075);
    root.userData.expression={...state};
  }
  function dispose() {
    if(disposed)return;disposed=true;root.removeFromParent();
    for(const value of owned){value.dispose();resources?.delete?.(value);}owned.clear();
    // The caller owns the original source texture; do not dispose it here.
  }
  const metadata={
    type:'curved-painted-anime-face',source:FACE_SOURCE.path,
    sourceSize:[sourceWidth,sourceHeight],origin:FACE_SOURCE.origin,pixelsPerUnit:775,tilt:.06,
    chin:[.023,-.382],crown:[0,.64],eyes:eyes.map(e=>({name:e.name,center:e.center,irisCenter:e.irisCenter,irisRadius:e.irisRadius.map(v=>v/775)})),
    textureUnmodified:true,independentPupilLayers:false,originalTearsRemoved:true,
    continuousControls:['blink','talk','happy','sad','gazeX','gazeY'],
    profileVolume:profileVolume.metadata,
    scope:'Front identity retained; blended Z profile and closed chin seam are installed for side-view QA, not yet validated at 90 degrees',
  };
  root.userData.metadata=metadata;update({});
  return {root,update,dispose,metadata};
}
