import assert from 'node:assert/strict';
import * as THREE from '../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter} from './character.js';
import {createPerformanceController} from './performance.js';

function transition(hz) {
  const controller=createPerformanceController();controller.update(0,0,{mode:'manual',mood:'neutral',action:'idle'});
  let pose;
  for(let i=1;i<=hz;i++)pose=controller.update(1/hz,i/hz,{mode:'manual',mood:'happy',action:'wave'});
  return pose;
}
const p30=transition(30),p120=transition(120);
for(const key of['happy','sad','wave','walk'])assert(Math.abs(p30[key]-p120[key])<1e-9,`${key}: time based blend`);
const director=createPerformanceController();director.update(0,0,{action:'idle'});
const first=director.update(1/60,.016,{action:'wave',mood:'happy'});
assert(first.wave>0&&first.wave<.2,'gesture begins with bounded blend');
const reversed=director.update(1/60,.032,{action:'idle',mood:'sad'});
assert(reversed.wave>0&&reversed.wave<first.wave,'interrupted gesture settles rather than resetting');
const texture=new THREE.Texture();texture.image={width:1920,height:1080};
const garment=new THREE.Texture();garment.image={width:1144,height:1375};
const rig=createStudyCharacter(texture,{garmentTexture:garment});
const skinned=[];rig.root.traverse(o=>{if(o.isSkinnedMesh)skinned.push(o);});assert(skinned.length>=10,'complete separated garment and limb meshes');
function finiteGeometry() {
  rig.root.updateMatrixWorld(true);
  rig.root.traverse(o=>{
    assert(o.matrixWorld.elements.every(Number.isFinite),`${o.name} transform finite`);
    if(!o.isMesh)return;
    for(const a of Object.values(o.geometry.attributes))assert(a.array.every(Number.isFinite),`${o.name} geometry finite`);
  });
}
rig.update(0,0,{mode:'manual',yaw:100,pitch:-100,mood:'neutral'});
assert(Math.abs(rig.root.userData.appliedPose.yaw-THREE.MathUtils.degToRad(25))<1e-10,'head world yaw range is enforced');
assert(Math.abs(rig.root.userData.appliedPose.pitch+THREE.MathUtils.degToRad(8))<1e-10,'head world pitch range is enforced');
let previous=rig.root.userData.appliedPose.yaw,maxAngularSpeed=0;
for(let i=1;i<=120;i++) {
  rig.update(1/120,i/120,{mode:'manual',yaw:-.4363,pitch:.1396,blink:i/120,talking:1-i/120,mood:'sad',action:i<60?'wave':'walk',framing:'full'});
  maxAngularSpeed=Math.max(maxAngularSpeed,Math.abs(rig.root.userData.appliedPose.yaw-previous)*120);previous=rig.root.userData.appliedPose.yaw;
  if(i%15===0)finiteGeometry();
}
assert(maxAngularSpeed<=2.00001,'head angular speed is bounded');
const frozen={mode:'manual',yaw:.2,pitch:0,blink:.5,talking:.4,action:'idle',mood:'neutral'};
rig.update(0,3,frozen);const pose=JSON.stringify(rig.root.userData.appliedPose);
for(let i=0;i<6;i++)rig.update(0,3,frozen);
assert.equal(JSON.stringify(rig.root.userData.appliedPose),pose,'paused controls do not drift');
finiteGeometry();
let sourceDisposed=false;texture.addEventListener('dispose',()=>sourceDisposed=true);rig.dispose();rig.dispose();
assert.equal(sourceDisposed,false,'caller owns shared source texture');
console.log(JSON.stringify({passed:true,skinnedMeshes:skinned.length,maxHeadAngularSpeed:maxAngularSpeed,transitionRates:[30,120],note:'Technical continuity and geometry checks; visual likeness is reviewed separately'},null,2));
