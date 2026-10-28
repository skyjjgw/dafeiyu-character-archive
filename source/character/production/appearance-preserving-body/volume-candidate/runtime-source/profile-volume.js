/**
 * Optional, uninstalled Z-only face-volume candidate.
 *
 * The video cover remains the authority for X/Y and UV identity. The generated
 * turnaround supplies an inferred side-depth guide only: it is neither a scan
 * nor a calibrated reconstruction. No scene, mesh, image or texture is mutated
 * by this module. Importing it does not change the current character.
 */
const MIN_Y=-.382,MAX_Y=.64,LEGACY_SEAM=.015;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(x)?x:a));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=x=>{const t=clamp(x);return t*t*(3-2*t);};
const gaussian=(x,center,width)=>Math.exp(-Math.pow((x-center)/width,2));

export const PROFILE_SIDE_REFERENCE=Object.freeze({
  path:'production/animation-look-study/turnaround-auxiliary-v2.png',size:[2043,770],
  role:'Generated auxiliary side view used only to estimate hidden depth',
  calibration:{eyeRow:248,chinRow:308,pixelsPerUnit:157,depthReferencePixelX:1156,depthReferenceZ:.420,facing:'left'},
  observations:[
    {name:'forehead',pixel:[1158,210],y:.242,z:.407},
    {name:'upper nose bridge',pixel:[1156,235],y:.083,z:.420},
    {name:'lower nose bridge',pixel:[1152,250],y:-.013,z:.445},
    {name:'nose tip',pixel:[1141,260],y:-.076,z:.515},
    {name:'nose base',pixel:[1143,270],y:-.140,z:.503},
    {name:'lip plane',pixel:[1146,280],y:-.204,z:.484},
    {name:'lower lip / front chin',pixel:[1152,290],y:-.267,z:.445},
    {name:'lower front chin',pixel:[1160,300],y:-.331,z:.394},
    {name:'chin',pixel:[1166,305],y:-.363,z:.356},
    {name:'lowest chin',pixel:[1171,308],y:-.382,z:.324},
  ],
  uncertainty:'Approximate skin-contour observations; hair occludes the forehead and rear jaw. Absolute depth and camera yaw are inferred, not measured.',
});

// PCHIP gives a continuous C1 curve without the overshooting lobes of an
// unconstrained Catmull spline at the nose tip or at the closing chin cap.
function pchip(points) {
  const n=points.length,slopes=new Float64Array(n),h=new Float64Array(n-1),d=new Float64Array(n-1);
  for(let i=0;i<n-1;i++){h[i]=points[i+1][0]-points[i][0];d[i]=(points[i+1][1]-points[i][1])/h[i];}
  slopes[0]=d[0];slopes[n-1]=d[n-2];
  for(let i=1;i<n-1;i++) {
    if(d[i-1]*d[i]<=0)slopes[i]=0;
    else {const w1=2*h[i]+h[i-1],w2=h[i]+2*h[i-1];slopes[i]=(w1+w2)/(w1/d[i-1]+w2/d[i]);}
  }
  return x=>{
    if(x<=points[0][0])return points[0][1];if(x>=points[n-1][0])return points[n-1][1];
    let lo=0,hi=n-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(points[mid][0]<=x)lo=mid;else hi=mid;}
    const t=(x-points[lo][0])/h[lo],t2=t*t,t3=t2*t;
    return (2*t3-3*t2+1)*points[lo][1]+(t3-2*t2+t)*h[lo]*slopes[lo]+(-2*t3+3*t2)*points[hi][1]+(t3-t2)*h[lo]*slopes[hi];
  };
}
const midline=pchip([
  [-.382,.324],[-.363,.356],[-.331,.394],[-.267,.445],[-.204,.484],
  [-.140,.503],[-.108,.510],[-.076,.515],[-.045,.465],[-.013,.445],
  [.083,.420],[.242,.407],[.36,.385],[.50,.280],[.60,.130],[.64,.015],
]);
const baseCenter=pchip([
  [-.382,.324],[-.331,.361],[-.267,.389],[-.204,.413],[-.140,.429],[-.076,.436],
  [0,.441],[.083,.420],[.242,.407],[.36,.385],[.50,.280],[.60,.130],[.64,.015],
]);
const seam=pchip([
  [-.382,.324],[-.363,.304],[-.331,.248],[-.267,.160],[-.204,.090],
  [-.140,.040],[-.076,.018],[.05,.015],[.64,.015],
]);
const rearDepth=pchip([
  [-.382,0],[-.363,.090],[-.331,.150],[-.267,.225],[-.140,.300],
  [0,.330],[.20,.340],[.40,.280],[.60,.120],[.64,0],
]);
const anatomicalAxis=pchip([
  [-.382,.023],[-.267,.033],[-.204,.035],[-.076,.066],[.05,.025],[.20,0],[.64,0],
]);

export const PROFILE_PARAMETERS=Object.freeze({
  strength:1,
  noseProjection:0,lipProjection:0,chinProjection:0,
  noseCenterX:.066,lipCenterX:.035,noseWidth:.095,lipWidth:.160,
  cheekExponent:.25,
});
const parameterHelp=Object.freeze({
  strength:'0 retains the previous depth; 1 uses this candidate. Start side QA at .65, then compare 1.',
  noseProjection:'Additional nose depth in local units; suggested tuning range -.025 to +.025.',
  lipProjection:'Additional lip depth; suggested tuning range -.020 to +.020.',
  chinProjection:'Advances the entire lower closing jaw and seam together; suggested -.040 to +.040.',
  noseCenterX:'Align the 3D nose with the original painted nose, approximately local X +.066.',
  lipCenterX:'Original painted mouth axis, approximately local X +.035.',
  noseWidth:'Nose deformation falloff width; suggested .075 to .120. Does not widen X/Y geometry.',
  lipWidth:'Lower-face feature falloff width; suggested .130 to .190.',
  cheekExponent:'Lateral cheek curvature; .25 retains the current upper-face cross section.',
});
function parameters(input={}) {
  const o={...PROFILE_PARAMETERS,...input};
  for(const key of Object.keys(PROFILE_PARAMETERS))if(!Number.isFinite(o[key]))throw new TypeError(`Invalid face profile parameter: ${key}`);
  o.strength=clamp(o.strength);o.noseWidth=clamp(o.noseWidth,.03,.25);o.lipWidth=clamp(o.lipWidth,.05,.3);o.cheekExponent=clamp(o.cheekExponent,.1,1);
  return o;
}
function sample(y,o) {
  const yy=clamp(y,MIN_Y,MAX_Y),chin=o.chinProjection*smooth((-.245-yy)/.137);
  const cap=smooth((yy-MIN_Y)/.035)*smooth((MAX_Y-yy)/.04);
  const feature=o.noseProjection*gaussian(yy,-.076,.060)+o.lipProjection*gaussian(yy,-.204,.075);
  const axis=anatomicalAxis(yy)+(o.noseCenterX-.066)*gaussian(yy,-.076,.065)+(o.lipCenterX-.035)*gaussian(yy,-.204,.075);
  const lipBlend=smooth((-.105-yy)/.145);
  return {y:yy,midlineZ:midline(yy)+chin+feature*cap,baseCenterZ:baseCenter(yy)+chin,
    seamZ:seam(yy)+chin,rearDepth:rearDepth(yy),axisX:axis,featureWidth:lerp(o.noseWidth,o.lipWidth,lipBlend)};
}

/** Candidate central anatomical profile. This is not an installed face mesh. */
export function faceDepthProfile(y,options={}) {return sample(y,parameters(options)).midlineZ;}
/** Exact shared Z for the left/right front/back silhouette boundary. */
export function faceProfileBoundaryZ(y,options={}) {return sample(y,parameters(options)).seamZ;}
export function sampleFaceDepthProfile(y,options={}) {return sample(y,parameters(options));}

/**
 * halfWidthAt / centerAt must be the existing frontal silhouette functions.
 * This deliberately does not replace the X/Y outline with a generic oval.
 * All front paint, eye rings, irises, lips and contour strips must call the
 * same returned frontZ function, retaining their existing small Z offsets.
 */
export function createFaceProfileVolume({halfWidthAt,centerAt=()=>0,installed=false,...options}={}) {
  if(typeof halfWidthAt!=='function'||typeof centerAt!=='function')throw new TypeError('Pass the existing halfWidthAt(y) and centerAt(y) silhouette functions');
  const o=parameters(options);
  const section=y=>{
    const s=sample(y,o),width=Number(halfWidthAt(s.y)),center=Number(centerAt(s.y));
    if(!Number.isFinite(width)||!Number.isFinite(center)||width<0)throw new RangeError('Invalid existing frontal silhouette section');
    const v=(s.y-.129)/.511,depth=.43-.07*smooth((-.10-s.y)/.282)-.045*smooth((s.y-.30)/.34);
    return {...s,width,center,legacyDepth:depth*Math.pow(Math.max(0,1-v*v),.20),legacyNose:.019*gaussian(s.y,-.08,.068)};
  };
  const resolution=1024,fields=['midlineZ','baseCenterZ','seamZ','rearDepth','axisX','featureWidth','width','center','legacyDepth','legacyNose'];
  const tables=Object.fromEntries(fields.map(key=>[key,new Float64Array(resolution+1)]));
  for(let i=0;i<=resolution;i++){const s=section(lerp(MIN_Y,MAX_Y,i/resolution));for(const key of fields)tables[key][i]=s[key];}
  const scratch={y:0};
  function lookup(y) {
    const yy=clamp(y,MIN_Y,MAX_Y),p=(yy-MIN_Y)/(MAX_Y-MIN_Y)*resolution,i=Math.min(resolution-1,Math.floor(p)),k=p-i;
    scratch.y=yy;for(const key of fields)scratch[key]=lerp(tables[key][i],tables[key][i+1],k);
    if(scratch.width<.05){scratch.width=halfWidthAt(yy);scratch.center=centerAt(yy);}
    return scratch;
  }
  function lateral(s,x) {
    if(s.width<1e-8)return 0;
    let u=(x-s.center)/s.width;
    // Quarter-power cheek curves amplify a tiny width interpolation error at
    // the silhouette. Evaluate only those boundary samples on the exact old
    // outline and snap Float32-rounded contour vertices onto the shared seam.
    if(Math.abs(u)>.96){const w=halfWidthAt(s.y);u=w>1e-8?(x-centerAt(s.y))/w:0;}
    u=clamp(u,-1,1);return Math.abs(u)>1-1e-6?Math.sign(u):u;
  }
  function legacyFront(x,s,u,curve) {
    const bulge=s.legacyDepth*(curve??Math.pow(Math.max(0,1-u*u),.25));
    return LEGACY_SEAM+bulge+s.legacyNose*gaussian(x,.02,.075);
  }
  function frontZ(x,y) {
    const s=lookup(y),u=lateral(s,x);
    if(Math.abs(u)===1)return lerp(LEGACY_SEAM,s.seamZ,o.strength);
    if(o.strength===0)return legacyFront(x,s,u);
    const curve=Math.pow(Math.max(0,1-u*u),o.cheekExponent);
    const base=s.seamZ+(s.baseCenterZ-s.seamZ)*curve;
    const axis=clamp(s.axisX,s.center-s.width,s.center+s.width),axisU=lateral(s,axis);
    const baseAtAxis=s.seamZ+(s.baseCenterZ-s.seamZ)*Math.pow(Math.max(0,1-axisU*axisU),o.cheekExponent);
    const available=x>=axis?s.center+s.width-axis:axis-(s.center-s.width);
    const q=available>1e-8?(x-axis)/available:0;
    const kernel=Math.exp(-Math.pow((x-axis)/s.featureWidth,4))*Math.sqrt(Math.max(0,1-q*q));
    const candidate=base+(s.midlineZ-baseAtAxis)*kernel;
    return o.strength===1?candidate:lerp(legacyFront(x,s,u,o.cheekExponent===.25?curve:undefined),candidate,o.strength);
  }
  function backZ(x,y) {
    const s=lookup(y),u=lateral(s,x),curve=Math.sqrt(Math.max(0,1-u*u));
    const legacy=LEGACY_SEAM-.33*Math.sqrt(Math.max(0,1-Math.pow((s.y-.129)/.511,2)))*curve;
    return lerp(legacy,s.seamZ-s.rearDepth*curve,o.strength);
  }
  function boundaryZ(y) {return lerp(LEGACY_SEAM,lookup(y).seamZ,o.strength);}
  const metadata={
    type:'optional-anime-profile-volume',installed:Boolean(installed),validatedAt90Degrees:false,
    reference:PROFILE_SIDE_REFERENCE,parameters:{...o},parameterHelp,
    frontalInvariants:['Existing vertex X/Y coordinates','Original UV coordinates and reference pixels','Existing eye/mouth apertures and dynamic topology'],
    integration:['Create this volume with the original widthAt/centerAt functions.','Use frontZ for every existing face layer; keep current per-layer Z offsets and alpha seam blend.','Use backZ in backGeometry, retaining its existing X/Y rows. Both edges use boundaryZ.','Recompute changed geometry bounds/normals. Keep scalp geometry independently volumetric.'],
    limitations:['Auxiliary side depth is inferred and has not passed rendered 90° QA.','Perspective projection can change apparent frontal size after Z edits even though geometric X/Y and UV are unchanged.','This only closes the face shell. It does not fix scalp, hair, ear or body side topology.'],
    closure:{minY:MIN_Y,maxY:MAX_Y,sharedSeam:true,chinZ:boundaryZ(MIN_Y),crownZ:boundaryZ(MAX_Y)},
    implementation:{sectionSamples:resolution+1,interpolation:'linear precomputed sections; exact silhouette evaluation near boundary'},
  };
  return {frontZ,backZ,boundaryZ,faceDepthProfile:y=>sample(y,o).midlineZ,sample:section,metadata};
}
