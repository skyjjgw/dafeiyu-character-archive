import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter} from '../../animation-look-study/character.js';
import {addSourceFingerRig,DIGITS} from '../finger-rig.mjs';
import {installRetopologizedHands} from './hand.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
const hash=a=>crypto.createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
const texture=(w,h)=>{const t=new THREE.Texture({width:w,height:h});t.colorSpace=THREE.SRGBColorSpace;return t;};
const model=createStudyCharacter(texture(1920,1080),{garmentTexture:texture(1144,1375),turnaroundTexture:texture(2043,770)});
model.update(0,0,{mode:'manual',mood:'neutral',framing:'full'});
const untouched=()=>{const rows=[];model.root.traverse(o=>{if(o.isMesh&&!o.name.includes('traced open hand and fingers'))rows.push({name:o.name,geometry:Object.fromEntries(Object.entries(o.geometry.attributes).map(([k,a])=>[k,hash(a.array)]))});});return JSON.stringify(rows);};
const original=untouched(),bodyBefore=Object.fromEntries(Object.entries(model.bones).map(([name,b])=>[name,b.matrixWorld.toArray()])),fingers=addSourceFingerRig(model),replace=installRetopologizedHands(fingers);
model.root.updateMatrixWorld(true);
const bodyBoneMatrixMaximumDifference=Math.max(...Object.entries(bodyBefore).flatMap(([name,a])=>model.bones[name].matrixWorld.toArray().map((v,i)=>Math.abs(v-a[i]))));
let finite=true,weightError=0,minArea=Infinity;
for(const s of ['left','right']){
  const g=fingers.hands[s].geometry,w=g.attributes.skinWeight,p=g.attributes.position;
  for(let i=0;i<w.count;i++)weightError=Math.max(weightError,Math.abs(w.getX(i)+w.getY(i)+w.getZ(i)+w.getW(i)-1));
  for(let i=0;i<g.index.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(p,g.index.getX(i)),b=new THREE.Vector3().fromBufferAttribute(p,g.index.getX(i+1)),c=new THREE.Vector3().fromBufferAttribute(p,g.index.getX(i+2));minArea=Math.min(minArea,b.sub(a).cross(c.sub(a)).length()/2);}
}
const poses=[];
for(const side of ['left','right'])for(const grip of [0,.25,.55,.8,1]){
  fingers.setPose(side,{grip,opposition:grip*.4});const mesh=fingers.hands[side],box=new THREE.Box3();let maximum=0;
  for(let i=0;i<mesh.geometry.attributes.position.count;i++){
    const p=mesh.applyBoneTransform(i,new THREE.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,i));finite=finite&&[p.x,p.y,p.z].every(Number.isFinite);box.expandByPoint(p);maximum=Math.max(maximum,p.length());
  }
  poses.push({side,grip,minimum:box.min.toArray(),maximum:box.max.toArray(),maximumDistanceFromOrigin:maximum});
}
const changedParts=original===untouched()?['left hand','right hand']:['ERROR: additional source part mutated'];
const report={schema:'dafeiyu.selected-hand-retopology-check.v2',candidates:replace.metadata(),finite,weightError,minimumTriangleArea:minArea,unchangedOtherParts:original===untouched(),bodyBoneMatrixMaximumDifference,changedParts,poses,numericalPass:finite&&weightError<1e-6&&minArea>1e-12&&bodyBoneMatrixMaximumDifference<1e-9&&original===untouched()&&replace.metadata().every(m=>m.topology.components===1&&m.topology.boundaryEdges===0&&m.topology.nonmanifoldEdges===0&&m.topology.orientationContradictions===0),visualPass:false,visualStatus:'See separate visual review: local proportions improved, full quality and force-closure remain unapproved. Intersection diagnostic is separate and not a collision proof.'};
fs.mkdirSync(new URL('./reports/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('./reports/geometry-check.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));replace.dispose();fingers.dispose();model.dispose();if(!report.numericalPass)process.exitCode=1;
