import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter} from '../../animation-look-study/character.js';
import {addSourceFingerRig} from '../finger-rig.mjs';
import {installRetopologizedHands} from './hand.mjs';
import fs from 'node:fs';
const texture=(w,h)=>{const t=new THREE.Texture({width:w,height:h});t.colorSpace=THREE.SRGBColorSpace;return t;};
const model=createStudyCharacter(texture(1920,1080),{garmentTexture:texture(1144,1375),turnaroundTexture:texture(2043,770)});
model.update(0,0,{mode:'manual',mood:'neutral',framing:'full'});
const fingers=addSourceFingerRig(model),replacement=installRetopologizedHands(fingers),chunks=[];let offset=0;
const append=arr=>{const bytes=Buffer.from(arr.buffer,arr.byteOffset,arr.byteLength),view={offset,length:bytes.length};chunks.push(bytes);offset+=bytes.length;return view;};
const report={schema:'dafeiyu.hand-real-render-probe.v1',scope:'Actual live source-skeleton samples for GPU visual review only; not frame-switched runtime animation',hands:[],states:[]};
for(const side of ['left','right']){
  const mesh=fingers.hands[side],g=mesh.geometry;
  const color=new Float32Array(g.attributes.position.count*4);
  for(let i=0;i<g.attributes.color.count;i++){color[i*4]=g.attributes.color.getX(i);color[i*4+1]=g.attributes.color.getY(i);color[i*4+2]=g.attributes.color.getZ(i);color[i*4+3]=1;}
  const indices=Uint32Array.from(g.index.array);
  report.hands.push({side,count:g.attributes.position.count,rgba:append(color),indices:append(indices)});
  for(const grip of [0,.55,1]){
    fingers.setPose(side,{grip,opposition:grip*.4});mesh.skeleton.update();model.root.updateMatrixWorld(true);
    const positions=new Float32Array(g.attributes.position.count*3),box=new THREE.Box3();
    for(let i=0;i<g.attributes.position.count;i++){
      const p=mesh.applyBoneTransform(i,new THREE.Vector3().fromBufferAttribute(g.attributes.position,i)).applyMatrix4(mesh.matrixWorld);p.toArray(positions,i*3);box.expandByPoint(p);
    }
    const neutral=report.states.find(s=>s.side===side&&s.grip===0);
    report.states.push({side,grip,opposition:grip*.4,positions:append(positions),target:neutral?.target||box.getCenter(new THREE.Vector3()).toArray(),views:side==='left'?[0,45,90,180]:[0,45]});
  }
}
fs.mkdirSync(new URL('./godot/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('./godot/hand-review.json',import.meta.url),JSON.stringify(report)+'\n');fs.writeFileSync(new URL('./godot/hand-review.bin',import.meta.url),Buffer.concat(chunks));
console.log(JSON.stringify({states:report.states.length,bytes:offset,scope:report.scope}));replacement.dispose();fingers.dispose();model.dispose();
