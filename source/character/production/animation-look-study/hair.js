import * as THREE from '../rig3d-prototype/vendor/three.module.js';
import {createVolumetricHairScaffold,scalpFrontSurfaceZ} from './rear-hair.js';

// The original pixels remain in the shared source texture. These paths are
// geometry masks, in that image's pixel coordinates, rather than edited bitmaps.
const SOURCE = Object.freeze({ width:1920, height:1080, origin:[815,583], scale:775, angle:.06 });
const C = Math.cos(SOURCE.angle), S = Math.sin(SOURCE.angle);
const clamp = THREE.MathUtils.clamp;
const scratchEuler = new THREE.Euler(0,0,0,'YXZ');

export function hairSourceToLocal(px,py) {
  const dx=px-SOURCE.origin[0], dy=py-SOURCE.origin[1];
  return [(C*dx-S*dy)/SOURCE.scale,(-S*dx-C*dy)/SOURCE.scale];
}

function path(start, commands) {
  const shape=new THREE.Shape(); shape.moveTo(...start);
  for(const [op,...p] of commands) shape[op==='C'?'bezierCurveTo':op==='Q'?'quadraticCurveTo':'lineTo'](...p);
  shape.closePath(); return shape;
}

// Traced to the dark contour, avoiding skin, green background, subtitle and
// the other character. The three frontal pieces share their source mapping.
const PATCHES = [
  {name:'left-face-framing-hair',type:'hair',rootY:285,tipY:850,depth:.065,
   shape:path([700,0],[
    ['C',550,-2,350,93,277,300],['C',253,370,238,425,240,472],
    ['C',222,596,253,782,335,853],['C',315,820,303,775,300,720],
    ['C',327,814,459,866,579,830],['C',539,829,511,788,496,758],
    ['C',525,770,558,770,581,755],['C',533,754,491,711,474,647],
    ['C',458,605,447,582,454,566],['C',490,518,550,446,580,366],
    ['C',603,326,623,292,633,266],['C',625,188,658,73,700,0]
   ])},
  {name:'right-face-framing-hair',type:'hair',rootY:255,tipY:820,depth:.065,
   shape:path([835,0],[
    ['C',1008,-12,1123,91,1197,251],['C',1242,335,1261,407,1269,500],
    ['C',1297,586,1304,689,1283,761],['C',1278,781,1266,794,1254,805],
    ['C',1264,777,1267,739,1265,718],['C',1222,797,1165,826,1088,811],
    ['C',1120,798,1140,755,1149,703],['C',1130,715,1109,718,1087,712],
    ['C',1114,699,1129,652,1135,602],['C',1143,573,1143,548,1141,535],
    ['C',1121,492,1087,450,1053,400],['C',1018,348,983,300,960,267],
    ['C',943,160,890,52,835,0]
   ])},
  {name:'central-forked-bangs',type:'hair',rootY:170,tipY:575,depth:.044,offset:.004,
   shape:path([687,0],[
    ['C',741,-7,795,-6,851,0],['C',927,68,961,171,963,274],
    ['C',967,352,960,423,937,450],['C',925,485,901,516,894,525],
    ['C',894,538,907,561,919,567],['C',893,576,861,563,840,548],
    ['C',826,563,801,577,778,575],['C',790,562,797,547,795,541],
    ['C',798,533,791,521,778,510],['C',767,495,759,481,755,470],
    ['C',758,497,765,519,779,541],['L',791,549],
    ['C',767,538,741,522,723,500],['C',682,444,647,339,636,275],
    ['C',624,182,652,65,687,0]
   ])},
  {name:'left-whale-fin-ear',type:'ear',rootY:525,tipY:750,depth:.055,offset:-.075,
   shape:path([231,544],[
    ['C',179,595,103,660,24,705],['C',13,713,5,717,0,720],
    ['L',0,735],['C',29,757,65,776,94,781],['C',105,796,131,794,153,782],
    ['C',182,801,212,787,226,771],['C',245,776,262,764,272,748],
    ['C',265,700,252,623,231,544]
   ])},
  {name:'right-whale-fin-ear',type:'ear',rootY:490,tipY:713,depth:.055,offset:-.075,
   shape:path([1269,494],[
    ['C',1313,550,1374,598,1457,620],['C',1477,626,1468,642,1455,650],
    ['C',1444,661,1428,669,1416,672],['C',1413,695,1386,706,1364,704],
    ['C',1354,705,1345,702,1339,697],['C',1319,720,1287,721,1262,704],
    ['C',1273,642,1280,570,1269,494]
   ])},
  {name:'left-blue-ribbon',type:'bow',rootY:440,tipY:598,depth:.03,offset:.034,
   shape:path([196,485],[
    ['C',170,471,139,456,124,473],['C',111,488,117,522,122,543],
    ['C',121,568,127,588,139,593],['C',153,598,184,563,199,549],
    ['C',216,561,246,591,261,586],['C',275,568,278,506,272,467],
    ['C',268,443,250,440,236,455],['C',223,462,210,476,196,485]
   ])},
  {name:'right-blue-ribbon',type:'bow',rootY:390,tipY:513,depth:.03,offset:.032,
   shape:path([1272,412],[
    ['C',1285,397,1303,380,1315,386],['C',1319,394,1325,412,1326,438],
    ['C',1327,453,1318,470,1312,480],['C',1323,497,1319,511,1308,514],
    ['C',1292,516,1278,505,1266,490],['C',1263,466,1264,434,1272,412]
   ])},
  {name:'left-painted-white-frill',type:'frill',rootY:0,tipY:490,depth:.045,offset:-.085,
   shape:path([349,0],[
    ['C',335,10,331,29,339,47],['C',314,43,307,64,300,82],
    ['C',267,73,235,96,217,123],['C',195,154,191,197,210,229],
    ['C',175,242,160,277,178,310],['C',150,325,137,365,154,400],
    ['C',135,416,129,446,143,474],['C',167,480,185,469,204,452],
    ['C',217,454,230,460,240,469],['C',254,342,296,224,382,150],
    ['C',452,89,530,37,617,0]
   ])},
  {name:'right-painted-white-frill',type:'frill',rootY:0,tipY:400,depth:.045,offset:-.085,
   shape:path([897,0],[
    ['L',1105,0],['C',1121,12,1126,41,1118,63],
    ['C',1152,56,1186,83,1200,111],['C',1223,146,1229,185,1210,213],
    ['C',1244,225,1269,256,1276,286],['C',1285,320,1276,347,1258,362],
    ['C',1272,375,1275,393,1264,409],['C',1243,340,1227,291,1197,251],
    ['C',1121,96,1015,-6,897,0]
   ])}
];

function frontZ(x,y,patch) {
  if(patch.type==='frill')return .052+.013*Math.cos(x*8)+.008*Math.sin(y*10);
  const wide=patch.type==='ear' ? .10 : .205;
  const painted=.494-wide*Math.pow(x/.8,2)-.027*Math.pow((y-.12)/.73,2)+(patch.offset||0);
  const t=clamp((y-.35)/.35,0,1),blend=t*t*(3-2*t);
  return THREE.MathUtils.lerp(painted,scalpFrontSurfaceZ(x,y)+.038+(patch.offset||0),blend);
}

function finiteOutline(shape) {
  const points=shape.getPoints(18);
  // Crown contours meet the image crop. Flatten their missing section at the
  // crop edge; never stretch a Bezier into negative source coordinates.
  for(const p of points){p.x=clamp(p.x,0,SOURCE.width-1);p.y=clamp(p.y,0,SOURCE.height-1);}
  if(points.length>1&&points[0].distanceToSquared(points.at(-1))<1e-8)points.pop();
  // Remove zero-length Bezier joins before earcut and subdivision.
  const clean=points.filter((p,i)=>i===0||p.distanceToSquared(points[i-1])>1e-8),dense=[];
  for(let i=0;i<clean.length;i++){
    const a=clean[i],b=clean[(i+1)%clean.length],segments=Math.max(1,Math.ceil(a.distanceTo(b)/18));
    for(let j=0;j<segments;j++)dense.push(a.clone().lerp(b,j/segments));
  }
  return dense;
}

function sampleTriangles(outline,holes=[]) {
  const vertices=[],faces=[],lookup=new Map();
  function vertex(p){const k=`${p.x.toFixed(5)},${p.y.toFixed(5)}`;if(lookup.has(k))return lookup.get(k);const i=vertices.length;vertices.push(p);lookup.set(k,i);return i;}
  function split(a,b,c,level){
    const ab=a.distanceToSquared(b),bc=b.distanceToSquared(c),ca=c.distanceToSquared(a);
    if(level<5&&Math.max(ab,bc,ca)>52*52){
      const mAB=a.clone().add(b).multiplyScalar(.5),mBC=b.clone().add(c).multiplyScalar(.5),mCA=c.clone().add(a).multiplyScalar(.5);
      split(a,mAB,mCA,level+1);split(mAB,b,mBC,level+1);split(mCA,mBC,c,level+1);split(mAB,mBC,mCA,level+1);
    }else faces.push(vertex(a),vertex(b),vertex(c));
  }
  const all=outline.concat(...holes);
  for(const [a,b,c]of THREE.ShapeUtils.triangulateShape(outline,holes))split(all[a],all[b],all[c],0);
  return{vertices,faces};
}

function register(resources,value){if(resources?.add)resources.add(value);else if(Array.isArray(resources))resources.push(value);return value;}

function makePatch(patch,texture,resources,sourceWidth,sourceHeight) {
  const outline=finiteOutline(patch.shape),holes=patch.shape.holes.map(h=>finiteOutline(h)),{vertices,faces}=sampleTriangles(outline,holes);
  const group=new THREE.Group();group.name=patch.name;
  const position=[],uv=[],weights=[],depths=[];
  const rounded=patch.rounded||patch.type==='long-hair'||patch.type==='hair';
  const contours=[outline,...holes],depthCache=new Map();
  function depthAt(p){
    if(!rounded)return patch.depth;
    const key=`${p.x.toFixed(5)},${p.y.toFixed(5)}`;if(depthCache.has(key))return depthCache.get(key);
    let distance=Infinity;
    for(const contour of contours)for(let i=0;i<contour.length;i++){
      const a=contour[i],b=contour[(i+1)%contour.length],dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;
      const t=len?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/len,0,1):0;
      distance=Math.min(distance,(p.x-a.x-dx*t)**2+(p.y-a.y-dy*t)**2);
    }
    const scale=patch.type==='long-hair'?45:patch.type==='ahoge'?16:70;
    const full=patch.type==='long-hair'?.30:patch.type==='ahoge'?.072:.22;
    const value=.010+full*Math.sqrt(clamp(Math.sqrt(distance)/scale,0,1));depthCache.set(key,value);return value;
  }
  const local=(p)=>{
    let point;if(patch.mapPoint)point=patch.mapPoint(p);else{const[x,y]=hairSourceToLocal(p.x,p.y);point=[x,y,frontZ(x,y,patch)];}
    if(rounded&&(patch.type==='long-hair'||patch.type==='ahoge'))point[2]+=(depthAt(p)-.010)*.42;
    return point;
  };
  const weight=(py)=>{
    if(patch.static||patch.type==='frill'||patch.type==='bow')return 0;
    const t=clamp((py-patch.rootY)/(patch.tipY-patch.rootY),0,1);
    return t*t*(3-2*t)*(patch.type==='ear'?.32:1);
  };
  for(const p of vertices){position.push(...local(p));uv.push(p.x/sourceWidth,1-p.y/sourceHeight);weights.push(weight(p.y));depths.push(depthAt(p));}
  const frontGeometry=register(resources,new THREE.BufferGeometry());
  frontGeometry.setAttribute('position',new THREE.Float32BufferAttribute(position,3).setUsage(THREE.DynamicDrawUsage));
  frontGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  // Pixel coordinates have a downward Y axis, so their winding flips in head
  // space. Correct per triangle instead of relying on double-sided cards.
  const index=[];
  for(let i=0;i<faces.length;i+=3){
    const a=faces[i],b=faces[i+1],c=faces[i+2];
    const cross=(position[b*3]-position[a*3])*(position[c*3+1]-position[a*3+1])-(position[b*3+1]-position[a*3+1])*(position[c*3]-position[a*3]);
    index.push(a,cross>0?b:c,cross>0?c:b);
  }
  frontGeometry.setIndex(index);frontGeometry.computeVertexNormals();
  const auxiliary=Boolean(patch.source),frill=patch.type==='frill';
  if(frill){
    const colors=[];
    for(const p of vertices){const t=clamp(p.y/65,0,1);colors.push(1,1,1,t*t*(3-2*t));}
    frontGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));
  }
  const frontMaterial=register(resources,new THREE.MeshBasicMaterial({map:texture,color:patch.color||0xffffff,toneMapped:false,side:THREE.FrontSide,vertexColors:frill,transparent:auxiliary||frill,alphaTest:auxiliary?.4:frill?.025:0}));
  const front=new THREE.Mesh(frontGeometry,frontMaterial);front.name=`${patch.name}:original-pixel-surface`;group.add(front);
  const sides=[],sideWeights=[],sideUV=[],sideColors=[];
  for(const contour of [outline,...holes])for(let i=0;i<contour.length;i++){
    const a=contour[i],b=contour[(i+1)%contour.length],pA=local(a),pB=local(b);
    const aB=[pA[0],pA[1],pA[2]-depthAt(a)],bB=[pB[0],pB[1],pB[2]-depthAt(b)];
    for(const [p,pixel]of[[pA,a],[aB,a],[pB,b],[pB,b],[aB,a],[bB,b]]){
      sides.push(...p);sideWeights.push(weight(pixel.y));sideUV.push(pixel.x/sourceWidth,1-pixel.y/sourceHeight);
      if(frill){const t=clamp(pixel.y/65,0,1);sideColors.push(1,1,1,t*t*(3-2*t));}
    }
  }
  const sideGeometry=register(resources,new THREE.BufferGeometry());
  sideGeometry.setAttribute('position',new THREE.Float32BufferAttribute(sides,3).setUsage(THREE.DynamicDrawUsage));
  if(frill)sideGeometry.setAttribute('color',new THREE.Float32BufferAttribute(sideColors,4));
  sideGeometry.computeVertexNormals();
  const sideMaterial=register(resources,new THREE.MeshToonMaterial({color:frill?0xb8b7c0:0x2d4670,side:THREE.DoubleSide,vertexColors:frill,transparent:frill,alphaTest:frill?.025:0}));
  const side=new THREE.Mesh(sideGeometry,sideMaterial);side.name=`${patch.name}:closed-thickness`;group.add(side);
  const backGeometry=register(resources,frontGeometry.clone());
  const backPosition=backGeometry.attributes.position;
  for(let i=0;i<backPosition.count;i++)backPosition.setZ(i,backPosition.getZ(i)-depths[i]);
  const backIndex=backGeometry.index.array;for(let i=0;i<backIndex.length;i+=3)[backIndex[i+1],backIndex[i+2]]=[backIndex[i+2],backIndex[i+1]];
  backGeometry.computeVertexNormals();
  const back=new THREE.Mesh(backGeometry,sideMaterial);back.name=`${patch.name}:back`;group.add(back);
  const deformers=[
    {geometry:frontGeometry,rest:Float32Array.from(position),weights:Float32Array.from(weights)},
    {geometry:sideGeometry,rest:Float32Array.from(sides),weights:Float32Array.from(sideWeights)},
    {geometry:backGeometry,rest:Float32Array.from(backGeometry.attributes.position.array),weights:Float32Array.from(weights)}
  ];
  const bounds=outline.reduce((b,p)=>({minX:Math.min(b.minX,p.x),maxX:Math.max(b.maxX,p.x),minY:Math.min(b.minY,p.y),maxY:Math.max(b.maxY,p.y)}),{minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity});
  return{group,deformers,patch,bounds,vertexCount:vertices.length,sourceOutline:outline.map(p=>[p.x,p.y]),sourceHoles:holes.map(h=>h.map(p=>[p.x,p.y])),crossSection:{type:rounded?'rounded-lenticular':'thin-volume',minDepth:Math.min(...depths),maxDepth:Math.max(...depths)}};
}


function createLongHair(texture,resources,sourceWidth,sourceHeight){
  const definitions=[
    {name:'left-painted-long-wave',side:-1,u0:180,u1:330,points:[[-.50,-.13,.015],[-.61,-.40,-.015],[-.70,-.70,.00],[-.64,-.98,.025],[-.76,-1.12,.07]],width:.155},
    {name:'right-painted-long-wave',side:1,u0:220,u1:380,points:[[.50,-.12,-.015],[.63,-.41,-.025],[.70,-.70,-.01],[.61,-.97,.015],[.71,-1.11,.055]],width:.157},
    {name:'left-painted-inner-curl',side:-1,u0:260,u1:380,points:[[-.43,-.20,-.055],[-.47,-.48,-.075],[-.43,-.76,-.055],[-.49,-1.00,-.025],[-.59,-1.055,.02]],width:.105},
    {name:'right-painted-inner-curl',side:1,u0:200,u1:320,points:[[.43,-.19,-.065],[.48,-.48,-.075],[.44,-.77,-.055],[.50,-.98,-.03],[.58,-1.045,.015]],width:.105}
  ];
  return definitions.map(def=>{
    const curve=new THREE.CatmullRomCurve3(def.points.map(p=>new THREE.Vector3(...p)),false,'catmullrom',.45);
    const patch={name:def.name,type:'long-hair',rootY:810,tipY:1040,depth:.045,
      shape:path([def.u0,810],[['L',def.u1,810],['L',def.u1,1040],['L',def.u0,1040]]),
      mapPoint(p){
        const t=clamp((p.y-810)/230,0,1),u=(p.x-(def.u0+def.u1)/2)/((def.u1-def.u0)/2),c=curve.getPoint(t);
        const taper=(.85+.23*Math.sin(t*Math.PI))*(1-Math.pow(t,7))+.002;
        return[c.x+u*def.width*taper,c.y+.018*u*Math.sin(t*Math.PI),c.z+.027*(1-u*u)*Math.sin(t*Math.PI)];
      }
    };
    return makePatch(patch,texture,resources,sourceWidth,sourceHeight);
  });
}

function createAuxiliaryAhoge(texture,resources){
  const patch={name:'auxiliary-painted-hook-ahoge',type:'ahoge',rounded:true,source:'production/v1/neutral-front.png',rootY:351,tipY:244,depth:.027,
    shape:path([563,353],[
      ['C',580,331,588,296,577,273],['C',567,250,540,240,516,244],
      ['C',480,245,449,268,438,292],['C',427,314,433,333,449,338],
      ['C',438,324,448,306,468,295],['C',495,280,523,276,543,289],
      ['C',560,301,568,327,563,353]
    ]),
    mapPoint(p){const x=(p.x-564)/360,t=clamp((353-p.y)/109,0,1),y=.735+(353-p.y)/360;return[x,y,.17-.10*t-.025*(x/.45)**2];}
  };
  return makePatch(patch,texture,resources,1144,1375);
}

// Numerically traced from the auxiliary image's original alpha and blue-pixel
// boundary. These are vector contours, including two genuinely open curls.
const AUXILIARY_LONG_OUTLINE=[[370,626],[369,628],[367,627],[351,635],[337,655],[318,674],[300,689],[291,699],[286,712],[286,722],[289,730],[295,737],[288,742],[280,745],[265,755],[252,768],[246,779],[244,787],[244,793],[246,801],[249,807],[254,814],[262,822],[270,826],[278,833],[281,834],[282,838],[276,844],[270,848],[264,850],[253,850],[248,848],[243,843],[241,839],[241,834],[240,834],[236,843],[236,852],[243,868],[253,877],[262,882],[275,885],[282,885],[283,884],[288,884],[297,880],[298,881],[294,888],[288,893],[282,896],[273,896],[268,892],[269,900],[275,910],[282,916],[297,923],[301,924],[317,924],[329,920],[331,921],[331,927],[334,934],[340,940],[345,942],[346,944],[342,951],[336,956],[330,958],[323,956],[323,958],[331,967],[343,971],[352,971],[361,968],[365,965],[366,966],[366,972],[363,979],[359,983],[355,985],[348,984],[355,993],[361,996],[373,997],[374,998],[375,997],[385,996],[390,993],[392,993],[398,988],[400,996],[404,1004],[413,1013],[424,1018],[433,1018],[428,1011],[428,1003],[430,998],[438,1010],[448,1017],[436,997],[409,978],[376,952],[356,931],[350,923],[360,902],[360,881],[372,858],[390,839],[410,831],[425,806],[429,793],[435,779],[435,744],[437,737],[437,734],[435,732],[439,731],[440,733],[446,733],[447,734],[446,735],[441,735],[449,748],[477,746],[492,726],[490,698],[472,677],[446,673],[432,645]];
const AUXILIARY_LONG_HOLES=[[[312,759],[313,760],[303,772],[296,784],[296,786],[294,789],[293,796],[292,797],[292,804],[293,806],[291,807],[285,801],[281,794],[281,792],[280,791],[281,781],[285,775],[293,767],[302,762]],[[362,662],[363,664],[362,665],[360,673],[355,683],[355,685],[347,700],[340,710],[333,718],[326,723],[322,722],[316,716],[314,711],[313,704],[314,703],[314,698],[316,694],[321,687],[348,673]]];
function createAuxiliaryLongHair(texture,resources){
  return[-1,1].map(side=>{
    const shape=new THREE.Shape();AUXILIARY_LONG_OUTLINE.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
    for(const contour of AUXILIARY_LONG_HOLES){const hole=new THREE.Path();contour.forEach(([x,y],i)=>i?hole.lineTo(x,y):hole.moveTo(x,y));hole.closePath();shape.holes.push(hole);}
    const patch={name:`${side<0?'left':'right'}-auxiliary-source-traced-long-curls`,type:'long-hair',source:'production/v1/neutral-front.png',color:0x9a88b0,rootY:650,tipY:1018,depth:.065,shape,
      mapPoint(p){const x0=(p.x-582)/340,x=side<0?x0:-x0,y=(586-p.y)/340-.02,z=-.045+.055*Math.pow(clamp((p.y-626)/392,0,1),2)-.09*((p.x-350)/150)**2;return[x,y,z];}
    };
    return makePatch(patch,texture,resources,1144,1375);
  });
}

function createRoundedCrown(texture,resources){
  const patch={name:'inferred-rounded-crown-using-original-blue-pixels',type:'crown-inferred',static:true,rootY:0,tipY:55,depth:.065,offset:.006,
    shape:path([620,0],[['L',890,0],['L',890,55],['L',620,55]]),
    mapPoint(p){const[x,baseY]=hairSourceToLocal(p.x,p.y),u=(p.x-620)/270,y=baseY+.065*Math.sin(Math.PI*u)*clamp(1-p.y/55,0,1);return[x,y,frontZ(x,y,patch)];}
  };
  return makePatch(patch,texture,resources,1920,1080);
}


function deformPatch(entry,sway,pitch){
  if(entry.patch.static||entry.patch.type==='frill'||entry.patch.type==='bow')return;
  for(const d of entry.deformers){
    const p=d.geometry.attributes.position;
    for(let i=0;i<p.count;i++){
      const k=i*3,w=d.weights[i],x=d.rest[k],y=d.rest[k+1],z=d.rest[k+2];
      // Root vertices remain fixed. A smooth bending field preserves the
      // attachment while allowing the ends and their thickness to follow.
      p.array[k]=x+sway*w;
      p.array[k+1]=y-Math.abs(sway)*w*.11+pitch*w*.12;
      p.array[k+2]=z+pitch*w+sway*x*w*.20;
    }
    p.needsUpdate=true;d.geometry.computeVertexNormals();d.geometry.computeBoundingSphere();
  }
}

/** Small-yaw painted geometry study; this is not a complete production model. */
export function createPaintedHair({head,resources,texture,garmentTexture,turnaroundTexture,sourceWidth=1920,sourceHeight=1080}){
  if(!head?.isObject3D)throw new TypeError('createPaintedHair requires a THREE.Object3D head');
  if(!texture?.isTexture)throw new TypeError('createPaintedHair requires the unedited source THREE.Texture');
  if(sourceWidth!==SOURCE.width||sourceHeight!==SOURCE.height)throw new RangeError('Hair trace requires the 1920 × 1080 source cover');
  const root=new THREE.Group();root.name='source-painted-hair';head.add(root);
  const scaffold=createVolumetricHairScaffold({resources,turnaroundTexture});root.add(scaffold.root);
  const entries=[...(garmentTexture?.isTexture?createAuxiliaryLongHair(garmentTexture,resources):createLongHair(texture,resources,sourceWidth,sourceHeight)),...PATCHES.map(p=>makePatch(p,texture,resources,sourceWidth,sourceHeight)),createRoundedCrown(texture,resources)];
  if(garmentTexture?.isTexture)entries.push(createAuxiliaryAhoge(garmentTexture,resources));
  for(const entry of entries)root.add(entry.group);
  const currentWorld=new THREE.Quaternion();head.getWorldQuaternion(currentWorld);
  const previous=currentWorld.clone(),delta=new THREE.Quaternion(),inverse=new THREE.Quaternion();
  const motion=entries.map((e,i)=>({x:0,z:0,vx:0,vz:0,frequency:10+(i%3)*1.2,damping:.86+(i%2)*.06}));
  let initialized=false,previousOmegaX=0,previousOmegaY=0;
  function update(dt,time,state={}){
    const step=clamp(Number.isFinite(dt)?dt:0,0,.05),strength=clamp(state.strength??1,0,1);
    head.getWorldQuaternion(currentWorld);
    if(!initialized){previous.copy(currentWorld);initialized=true;}
    inverse.copy(previous).invert();delta.copy(inverse).multiply(currentWorld);scratchEuler.setFromQuaternion(delta,'YXZ');
    const omegaX=step>0?clamp(scratchEuler.x/step,-8,8):0,omegaY=step>0?clamp(scratchEuler.y/step,-8,8):0;
    const accelerationX=step>0?clamp((omegaX-previousOmegaX)/step,-80,80):0,accelerationY=step>0?clamp((omegaY-previousOmegaY)/step,-80,80):0;
    if(step>0){previous.copy(currentWorld);previousOmegaX=omegaX;previousOmegaY=omegaY;}
    const tilt=scratchEuler.setFromQuaternion(currentWorld,'YXZ').z;
    for(let i=0;i<entries.length;i++){
      const entry=entries[i],m=motion[i],f=m.frequency;
      const targetX=clamp(-omegaY*.012-accelerationY*.0007+Math.sin(tilt)*.008,-.045,.045)*strength;
      const targetZ=clamp(omegaX*.010+accelerationX*.0005,-.025,.025)*strength;
      // Semi-implicit small substeps make abrupt slider edits and low FPS safe.
      const substeps=Math.max(1,Math.ceil(step/.008)),h=step/substeps;
      for(let s=0;s<substeps;s++){
        m.vx+=(f*f*(targetX-m.x)-2*m.damping*f*m.vx)*h;m.x+=m.vx*h;
        m.vz+=(f*f*(targetZ-m.z)-2*m.damping*f*m.vz)*h;m.z+=m.vz*h;
      }
      m.x=clamp(m.x,-.055,.055);m.z=clamp(m.z,-.035,.035);
      deformPatch(entry,m.x,m.z);
    }
    scaffold.deform((motion[0]?.x||0)*.55+(motion[1]?.x||0)*.45,(motion[0]?.z||0)*.55+(motion[1]?.z||0)*.45);
  }
  const metadata={
    technique:'Continuous 3D scalp and rounded posterior volume, source-pixel curved locks with lenticular cross-sections and damped tip deformation',
    source:'references/video-covers/BV1g2JX6HEHX.jpg',sourceWidth,sourceHeight,mapping:SOURCE,
    supportedYawDegrees:25,
    limitations:['The cropped crown and hidden scalp are inferred geometry.',garmentTexture?.isTexture?'Long curls and ahoge are traced from the approved auxiliary neutral-front image; left curls are mirrored on the right.':'Long waves use clean source blue-hair pixels on authored curved geometry; their lower silhouette is inferred.','Side/back painting remains a structural study, not a final authored turnaround.'],
    structure:scaffold.metadata,
    patches:entries.map(e=>({name:e.patch.name,type:e.patch.type,source:e.patch.source||'references/video-covers/BV1g2JX6HEHX.jpg',bounds:e.bounds,vertexCount:e.vertexCount,outline:e.sourceOutline,holes:e.sourceHoles,crossSection:e.crossSection})),
    totalFrontVertices:entries.reduce((sum,e)=>sum+e.vertexCount,0),
    checkState:()=>motion.map(m=>({x:m.x,z:m.z,vx:m.vx,vz:m.vz}))
  };
  update(0,0,{});
  return{root,update,metadata};
}
