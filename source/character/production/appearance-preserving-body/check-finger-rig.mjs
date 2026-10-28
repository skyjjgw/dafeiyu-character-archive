import * as THREE from '../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter}from '../animation-look-study/character.js';
import {addSourceFingerRig}from './finger-rig.mjs';
import {createHash}from 'node:crypto';
import {mkdir,writeFile}from 'node:fs/promises';

const base=new URL('./',import.meta.url);await mkdir(new URL('reports/',base),{recursive:true});
const texture=(w,h)=>{const t=new THREE.Texture({width:w,height:h});t.colorSpace=THREE.SRGBColorSpace;return t;};
const model=createStudyCharacter(texture(1920,1080),{garmentTexture:texture(1144,1375),turnaroundTexture:texture(2043,770)});
const meshes=[];model.root.traverse(o=>{if(o.isSkinnedMesh&&o.name.includes('traced open hand'))meshes.push(o);});
const bytes=a=>createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
const signatures=()=>Object.fromEntries(meshes.map(m=>[m.name,Object.fromEntries(['position','uv','normal','color'].map(k=>[k,bytes(m.geometry.attributes[k].array)]))]));
function posed(mesh){model.root.updateMatrixWorld(true);mesh.skeleton.update();const out=[];for(let i=0;i<mesh.geometry.attributes.position.count;i++)out.push(mesh.applyBoneTransform(i,new THREE.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,i)).applyMatrix4(mesh.matrixWorld));return out;}
const frames=[{time:0,action:'idle'},{time:.45,action:'wave'},{time:1.1,action:'wave'},{time:1.4,action:'walk'}];
const originals=[];
for(const frame of frames){model.update(0,frame.time,{mode:'manual',mood:'neutral',framing:'full',action:frame.action});originals.push(meshes.map(posed));}
model.update(0,0,{mode:'manual',mood:'neutral',framing:'full'});
const before=signatures(),fingers=addSourceFingerRig(model);let maximumNeutralError=0;
const neutral=[];
for(let f=0;f<frames.length;f++){
  const frame=frames[f];model.update(0,frame.time,{mode:'manual',mood:'neutral',framing:'full',action:frame.action});
  let maximum=0;for(let h=0;h<meshes.length;h++){const points=posed(meshes[h]);for(let i=0;i<points.length;i++)maximum=Math.max(maximum,points[i].distanceTo(originals[f][h][i]));}
  maximumNeutralError=Math.max(maximumNeutralError,maximum);neutral.push({...frame,maximumWorldPositionDifference:maximum});
}
model.update(0,0,{mode:'manual',mood:'neutral',framing:'full'});
const unchanged=JSON.stringify(before)===JSON.stringify(signatures());let weightError=0;
for(const mesh of meshes){const w=mesh.geometry.attributes.skinWeight;for(let i=0;i<w.count;i++)weightError=Math.max(weightError,Math.abs(w.getX(i)+w.getY(i)+w.getZ(i)+w.getW(i)-1));}
const independent=[];
for(const side of ['left','right'])for(const name of ['thumb','index','middle','ring','little']){
  fingers.setPose(side,{grip:0});const source=posed(fingers.hands[side]);fingers.setPose(side,{[name]:.55,opposition:name==='thumb'?.35:0});const target=posed(fingers.hands[side]);
  const displacement=target.map((p,i)=>p.distanceTo(source[i]));
  independent.push({side,name,maximumDisplacement:Math.max(...displacement),verticesMoved:displacement.filter(d=>d>1e-6).length});fingers.setPose(side,{grip:0});
}
const determinantMinimum=Math.min(...fingers.skeleton.bones.map(b=>b.matrixWorld.determinant()));
const report={...fingers.metadata(),unchangedGeometryAndUVAndColor:unchanged,sourceGeometrySignatures:before,maximumNeutralWorldPositionError:maximumNeutralError,neutralComparisons:neutral,maximumWeightSumError:weightError,minimumBoneDeterminant:determinantMinimum,independentDigits:independent};
report.passed=unchanged&&maximumNeutralError<2e-6&&weightError<2e-6&&determinantMinimum>0&&independent.every(d=>d.maximumDisplacement>1e-4&&d.verticesMoved>6);
await writeFile(new URL('reports/finger-rig-check.json',base),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,bones:report.bodyBones,added:report.addedBones,unchanged,maximumNeutralError,weightError,independent},null,2));
fingers.dispose();model.dispose();
if(!report.passed)process.exitCode=1;
