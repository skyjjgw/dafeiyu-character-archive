import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import * as THREE from '../rig3d-prototype/vendor/three.module.js';
import {createPaintedBody,solveBodyTwoBoneIK} from './body-full.js';

// Run: node production/animation-look-study/verify-body.mjs
// Optional: --output metadata/body-grounding-verification.json
// This verifies local kinematics numerically. It does not validate collision,
// Rapier travel, cloth physics, image likeness, or unseen garment surfaces.
const resources=new Set(),parent=new THREE.Group();
const rig=createPaintedBody({parent,resources,garmentTexture:new THREE.Texture()});
const v=()=>new THREE.Vector3();
const max={boneLengthError:0,bonePositionError:0,boneScaleError:0,armBoneLengthError:0,armTargetError:0,footScaleError:0,footLevelError:0,supportSoleError:0,supportXZError:0,shoePenetration:0,targetError:0};
let samples=0,footSamples=0,stanceSamples=0,clampedGaitTargets=0,minimumKneeForward=1,maximumLift=0;
const shoes={};let vertices=0,triangles=0;
const volumeChecks=[];
function boundaryDistance(x,y,points){
  let best=Infinity;
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dy=b[1]-a[1];
    const t=THREE.MathUtils.clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1),0,1);
    best=Math.min(best,Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t));
  }
  return best;
}
function inside(x,y,points){
  let value=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
    const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])value=!value;
  }
  return value;
}
function checkVolume(mesh){
  const study=mesh.userData.volumeStudy;assert(study,'Every body part needs an explicit volume construction');
  const g=mesh.geometry,p=g.attributes.position,uv=g.attributes.uv,index=g.index.array;
  const keys=[],unique=new Map(),edgeCounts=new Map(),edgeDirections=new Map();let degenerateFaces=0,frontVertices=0,maxProjectionError=0,outsideFrontContour=0,signedVolume=0;
  for(let i=0;i<p.count;i++){
    const key=[p.getX(i),p.getY(i),p.getZ(i)].map(x=>Math.round(x*1e6)).join(',');
    if(!unique.has(key))unique.set(key,unique.size);keys.push(unique.get(key));
  }
  for(let i=0;i<index.length;i+=3){
    const ids=[index[i],index[i+1],index[i+2]],a=v().fromBufferAttribute(p,ids[0]),b=v().fromBufferAttribute(p,ids[1]),c=v().fromBufferAttribute(p,ids[2]);
    signedVolume+=a.dot(b.clone().cross(c))/6;
    if(b.sub(a).cross(c.sub(a)).length()<1e-12)degenerateFaces++;
    for(let j=0;j<3;j++){const a=keys[ids[j]],b=keys[ids[(j+1)%3]],key=a<b?`${a}:${b}`:`${b}:${a}`;edgeCounts.set(key,(edgeCounts.get(key)||0)+1);edgeDirections.set(key,(edgeDirections.get(key)||0)+(a<b?1:-1));}
  }
  const boundaryEdges=[...edgeCounts.values()].filter(count=>count===1).length;
  const nonManifoldEdges=[...edgeCounts.values()].filter(count=>count!==2).length;
  const inconsistentEdges=[...edgeDirections.values()].filter(count=>count!==0).length;
  assert.equal(degenerateFaces,0,mesh.name+' has a collapsed face');
  assert.equal(boundaryEdges,0,mesh.name+' is open');assert.equal(nonManifoldEdges,0,mesh.name+' has a non-manifold geometric seam');
  assert.equal(inconsistentEdges,0,mesh.name+' contains reversed adjacent faces');assert(signedVolume>1e-7,mesh.name+' must enclose positive volume');
  const frontIndices=new Set();for(const group of g.groups)if(group.materialIndex===0)for(let i=group.start;i<group.start+group.count;i++)frontIndices.add(index[i]);
  for(const i of frontIndices){
    const px=uv.getX(i)*1144,py=(1-uv.getY(i))*1375;
    const expectedX=(px-580)/260,expectedY=py<=1003?.20+(835-py)/260:.20+(835-1003)/260+(1003-py)/260*1.18;
    maxProjectionError=Math.max(maxProjectionError,Math.hypot(expectedX-p.getX(i),expectedY-p.getY(i)));frontVertices++;
    if(study.frontFitContour&&!inside(px,py,study.frontFitContour)&&boundaryDistance(px,py,study.frontFitContour)>.002)outsideFrontContour++;
  }
  assert(maxProjectionError<1e-6,'Front XY must preserve its source projection');
  assert.equal(outsideFrontContour,0,mesh.name+' front XY left its fitted source contour');
  let minimumSectionDiameter=null,actualLensThickness=null;
  if(study.kind==='360-sections'){
    assert(study.sections>=8&&study.angularSegments>=24,'Continuous volume has too few sections');minimumSectionDiameter=Infinity;
    for(const ring of study.sectionRings){
      assert.equal(ring.length,study.angularSegments,'A section is incomplete');
      const box=new THREE.Box3();for(const i of ring)box.expandByPoint(v().fromBufferAttribute(p,i));
      const extents=box.getSize(v()).toArray().sort((a,b)=>b-a);
      minimumSectionDiameter=Math.min(minimumSectionDiameter,extents[1]);
    }
    assert(minimumSectionDiameter>.005,'A continuous section collapsed into a slice');
  }else{
    assert(study.maximumThickness>study.edgeThickness*5,'A fin/hand does not thicken inward');
    assert(study.edgeThickness>0&&study.edgeThickness<.02,'The lens rim is missing or slab thick');
    const depths=new Map();
    for(let i=0;i<p.count;i++){
      const key=[p.getX(i),p.getY(i)].map(x=>Math.round(x*1e6)).join(','),z=p.getZ(i),range=depths.get(key)||[Infinity,-Infinity];
      range[0]=Math.min(range[0],z);range[1]=Math.max(range[1],z);depths.set(key,range);
    }
    actualLensThickness=Math.max(...[...depths.values()].map(([lo,hi])=>hi-lo));
    assert(actualLensThickness>study.edgeThickness*3,'The sampled fin/palm stayed plate thin');
  }
  if(mesh.material[0].map)assert.equal(mesh.material[0].alphaTest,0,'Physical volume cannot depend on source-alpha cuts');
  volumeChecks.push({name:mesh.name,kind:study.kind,sections:study.sections||null,angularSegments:study.angularSegments||null,
    boundaryEdges,nonManifoldEdges,inconsistentEdges,degenerateFaces,signedVolume,frontVertices,outsideFrontContour,maxProjectionError,minimumSectionDiameter,actualLensThickness,
    edgeThickness:study.edgeThickness||null,maximumThickness:study.maximumThickness||null});
}
rig.root.traverse(mesh=>{
  if(!mesh.isSkinnedMesh)return;
  vertices+=mesh.geometry.attributes.position.count;triangles+=mesh.geometry.index.count/3;
  checkVolume(mesh);
  if(mesh.name.endsWith('traced mary jane shoe'))shoes[mesh.name.startsWith('left')?'left':'right']=mesh;
  for(const value of mesh.geometry.attributes.position.array)assert(Number.isFinite(value),'Non-finite mesh vertex');
  for(const value of mesh.geometry.attributes.normal.array)assert(Number.isFinite(value),'Non-finite surface normal');
  const weights=mesh.geometry.attributes.skinWeight;
  for(let i=0;i<weights.count;i++){
    let sum=0;for(let j=0;j<4;j++)sum+=weights.array[i*4+j];
    assert(Math.abs(sum-1)<1e-6,'Skin weights must sum to one');
  }
});
const expectedLength={};
for(const side of['left','right'])expectedLength[side]=[rig.bones[`${side}LowerLeg`].position.length(),rig.bones[`${side}Foot`].position.length()];
const bindBonePositions=Object.fromEntries(Object.entries(rig.bones).map(([key,bone])=>[key,bone.position.clone()]));
const armLengths=[rig.bones.leftForeArm.position.length(),rig.bones.leftHand.position.length()];
let waveSamples=0,clampedWaveTargets=0;
const snapshots=[];
function inspect(time,state){
  rig.update(1/60,time,state);parent.updateMatrixWorld(true);samples++;
  const report=rig.root.userData.grounding;
  assert.equal(report.enabled,true,'Grounding defaults to enabled');
  const parentInverse=parent.matrixWorld.clone().invert();
  for(const[key,bone]of Object.entries(rig.bones)){
    if(key!=='hips')max.bonePositionError=Math.max(max.bonePositionError,bone.position.distanceTo(bindBonePositions[key]));
    for(const scale of bone.scale.toArray())max.boneScaleError=Math.max(max.boneScaleError,Math.abs(scale-1));
  }
  const shoulder=rig.bones.leftUpperArm.getWorldPosition(v()).applyMatrix4(parentInverse);
  const elbow=rig.bones.leftForeArm.getWorldPosition(v()).applyMatrix4(parentInverse);
  const wrist=rig.bones.leftHand.getWorldPosition(v()).applyMatrix4(parentInverse);
  max.armBoneLengthError=Math.max(max.armBoneLengthError,Math.abs(shoulder.distanceTo(elbow)-armLengths[0]),Math.abs(elbow.distanceTo(wrist)-armLengths[1]));
  const arm=rig.root.userData.waveArm;
  if(arm.enabled){waveSamples++;if(arm.clamped)clampedWaveTargets++;max.armTargetError=Math.max(max.armTargetError,arm.targetError);}
  for(const side of['left','right']){
    footSamples++;
    const row=report.feet[side],upper=rig.bones[`${side}UpperLeg`],lower=rig.bones[`${side}LowerLeg`],foot=rig.bones[`${side}Foot`];
    const hip=upper.getWorldPosition(v()).applyMatrix4(parentInverse),knee=lower.getWorldPosition(v()).applyMatrix4(parentInverse),ankle=foot.getWorldPosition(v()).applyMatrix4(parentInverse);
    const lengths=[hip.distanceTo(knee),knee.distanceTo(ankle)];
    for(let i=0;i<2;i++)max.boneLengthError=Math.max(max.boneLengthError,Math.abs(lengths[i]-expectedLength[side][i]));
    for(const item of[upper,lower,foot])for(const scale of item.scale.toArray())max.footScaleError=Math.max(max.footScaleError,Math.abs(scale-1));
    max.footLevelError=Math.max(max.footLevelError,row.footLevelError);
    minimumKneeForward=Math.min(minimumKneeForward,row.kneePoleForward);maximumLift=Math.max(maximumLift,row.lift);
    if(row.clamped)clampedGaitTargets++;
    const requested=new THREE.Vector3().fromArray(row.requestedSole),actual=new THREE.Vector3().fromArray(row.actualSole);
    max.targetError=Math.max(max.targetError,requested.distanceTo(actual));
    if(row.support){
      stanceSamples++;max.supportSoleError=Math.max(max.supportSoleError,Math.abs(actual.y-report.groundY));
      max.supportXZError=Math.max(max.supportXZError,Math.hypot(actual.x-requested.x,actual.z-requested.z));
    }
    // Verify the entire rendered shoe, independently of the reported sole.
    const shoe=shoes[side],positions=shoe.geometry.attributes.position;
    let minimum=Infinity;
    for(let i=0;i<positions.count;i++){
      const point=v().fromBufferAttribute(positions,i);shoe.applyBoneTransform(i,point);
      point.applyMatrix4(shoe.matrixWorld).applyMatrix4(parentInverse);minimum=Math.min(minimum,point.y);
    }
    max.shoePenetration=Math.max(max.shoePenetration,report.groundY-minimum);
    assert(minimum>=report.groundY-1e-6,'A rendered shoe vertex penetrated the local floor');
  }
  if(snapshots.length<3&&state.walk===1&&state.wave===1&&state.yaw===0)snapshots.push({time,grounding:structuredClone(report)});
}
// Multiple phases include both contacts, each swing, transition weights,
// the full permitted head yaw, and simultaneous upper-body gestures.
for(const yaw of[-Math.PI*25/180,0,Math.PI*25/180])for(const wave of[0,.5,1])for(const walk of[0,.25,1])
  for(let phase=0;phase<=32;phase++)inspect(phase/32*Math.PI*2/5.4,{mode:'idle',yaw,wave,walk});
// A complete wave envelope includes preparation, lifting, and wrist motion.
for(const walk of[0,1])for(let frame=0;frame<=64;frame++)inspect(frame/60,{mode:'idle',yaw:.4,wave:frame/64,walk});
// Local-floor constraints must also work under an external travel transform.
parent.position.set(1.7,.6,-2.1);parent.rotation.y=.62;parent.updateMatrixWorld(true);
for(let phase=0;phase<=32;phase++)inspect(phase/32*Math.PI*2/5.4,{mode:'idle',yaw:.3,wave:1,walk:1});
assert(max.boneLengthError<1e-6,'Leg lengths changed');assert(max.footScaleError<1e-10,'Leg or foot scaled');
assert(max.bonePositionError<1e-10,'A non-pelvis bone attachment moved away from bind');
assert(max.boneScaleError<1e-10,'A bone changed scale');
assert(max.armBoneLengthError<1e-6,'An arm segment changed length');
assert(max.armTargetError<1e-6,'A reachable arm target was not reached');assert.equal(clampedWaveTargets,0,'Full wave must remain reachable');
assert(max.footLevelError<1e-6,'A shoe tilted away from the local floor');assert(max.supportSoleError<1e-6,'Support sole failed to stay on the floor');
assert(max.supportXZError<1e-6,'A supporting foot slid in local X/Z');assert(max.shoePenetration<1e-6,'A rendered shoe penetrated the floor');
assert(max.targetError<1e-6,'Reachable gait target was not reached');assert(minimumKneeForward>0,'Knee pole bent away from the front');
assert(maximumLift>.10,'Walk did not lift a foot');assert.equal(clampedGaitTargets,0,'Normal gait must remain reachable');

// Direct solver stress cases exercise both reach limits and degenerate pole
// directions. Clamped targets remain explicitly recorded, never stretched.
const clampCases=[];
for(const target of[[0,-3,0],[0,0,0],[0,0,3],[.2,-.1,.1],[0,.48,0]]){
  const result=solveBodyTwoBoneIK({hip:v(),target:new THREE.Vector3(...target),upperLength:expectedLength.left[0],lowerLength:expectedLength.left[1]});
  const upperError=Math.abs(result.hip.distanceTo(result.knee)-expectedLength.left[0]);
  const lowerError=Math.abs(result.knee.distanceTo(result.ankle)-expectedLength.left[1]);
  assert(upperError<1e-6&&lowerError<1e-6,'Clamped IK changed a segment length');
  assert([...result.knee.toArray(),...result.ankle.toArray()].every(Number.isFinite),'Degenerate IK produced a non-finite point');
  clampCases.push({target,clamped:result.clamped,requestedDistance:result.requestedDistance,reachableDistance:result.distance,upperError,lowerError});
}
assert(clampCases.filter(row=>row.clamped).length>=3,'Reach-clamp cases were not exercised');
rig.update(0,0,{mode:'manual',grounded:false});assert.equal(rig.root.userData.grounding.enabled,false,'Grounding cannot be disabled');
const evidence={schema:'dafeiyu.body-volume-kinematics-verification.v2',createdAt:new Date().toISOString(),passed:true,
  scope:'Closed oriented 360-section/biconvex geometry, fitted front XY/UV, fixed attachments, constant-length wave/leg IK, sole contact and in-place stepping; image likeness and full physics are not certified',
  geometry:{meshes:rig.metadata.meshCount,bones:rig.metadata.boneCount,vertices,triangles,volumeChecks},
  samples,footSamples,stanceSamples,waveSamples,clampedWaveTargets,armLengths,clampedGaitTargets,maximumLift,minimumKneeForward,maxErrors:max,clampCases,snapshots};
const json=JSON.stringify(evidence,null,2)+'\n';
const outputIndex=process.argv.indexOf('--output');
if(outputIndex!==-1){assert(process.argv[outputIndex+1],'--output needs a path');await writeFile(process.argv[outputIndex+1],json,'utf8');}
console.log(json);
for(const resource of resources)resource.dispose();
