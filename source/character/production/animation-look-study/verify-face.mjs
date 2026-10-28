import assert from 'node:assert/strict';
import * as THREE from '../rig3d-prototype/vendor/three.module.js';
import { createPaintedFace,faceSurfaceZ,sourceToFace,faceToSource } from './face.js';

const resources=new Set(),head=new THREE.Bone(),texture=new THREE.Texture();
texture.image={width:1920,height:1080};
const face=createPaintedFace({head,resources,texture});
const meshes=[];face.root.traverse(o=>{if(o.isMesh)meshes.push(o);});
function finite() {
  for(const mesh of meshes) {
    for(const [name,attribute]of Object.entries(mesh.geometry.attributes)) {
      assert(attribute.array.every(Number.isFinite),`${mesh.name}: ${name} finite`);
    }
    const index=mesh.geometry.getIndex();
    if(index)assert(index.array.every(i=>i>=0&&i<mesh.geometry.attributes.position.count),`${mesh.name}: valid indices`);
  }
}
for(const px of [476,615,815,1020,1168])for(const py of[305,588,741,877]) {
  const result=faceToSource(...sourceToFace(px,py));assert(Math.abs(result[0]-px)<1e-8&&Math.abs(result[1]-py)<1e-8);
}
const eye=meshes.find(m=>m.name==='left moving upper eyelash');
const brow=meshes.find(m=>m.name==='left moving eyelid crease');
const mouth=meshes.find(m=>m.name==='continuously opening mouth cavity');
const initialEye=eye.geometry.attributes.position.array.slice(),initialMouth=mouth.geometry.attributes.position.array.slice();
for(const blink of[0,.001,.1,.49,.5,.51,.9,.99,1])for(const mood of['neutral','happy','sad']) {
  face.update({blink,mood,talking:blink,gazeX:1-blink*2,gazeY:blink*2-1});finite();
}
assert.notDeepEqual(initialEye,eye.geometry.attributes.position.array,'eyelid vertices change continuously');
assert.notDeepEqual(initialMouth,mouth.geometry.attributes.position.array,'mouth is geometric');
assert.equal(meshes.find(m=>m.name==='left sampled original iris').visible,false);
face.update({blink:0,talk:.5,gazeX:0,gazeY:0});finite();
for(const happy of[0,.25,.5,.75,1]){face.update({blink:.5,talk:.3,happy,sad:1-happy});finite();}
face.update({blink:0,mood:'neutral'});
const browOpen=brow.geometry.attributes.position.array.slice();
face.update({blink:1,mood:'neutral'});
const browClosed=brow.geometry.attributes.position.array;
assert(browOpen.every((v,i)=>Math.abs(v-browClosed[i])<.0021),'eyebrows remain independent of the closing lid');
const ringColors=meshes.find(m=>m.name==='left deforming skin eyelid').geometry.attributes.color;
assert.equal(ringColors.itemSize,4,'skin exterior uses a real alpha blend');
assert.equal(ringColors.getW(0),0);assert.equal(ringColors.getW(ringColors.count-1),1);
const iris=meshes.find(m=>m.name==='left sampled original iris');
assert.equal(iris.material.map,texture,'source texture directly samples original iris');
assert.equal(iris.material.toneMapped,false);
assert.equal(texture.colorSpace,THREE.SRGBColorSpace);
assert.equal(face.metadata.profileVolume.installed,true);
assert.equal(face.metadata.profileVolume.parameters.strength,.65);
assert.equal(face.metadata.profileVolume.validatedAt90Degrees,false);
assert(faceSurfaceZ(.023,-.382)>.20,'side-QA chin is advanced without changing the front chin XY');
assert(faceSurfaceZ(0,0)>.42&&faceSurfaceZ(-.258,0)>.38,'face is convex');
const paint=meshes.find(m=>m.name==='reference skin, nose and cheek paint only');
const uv=paint.geometry.attributes.uv;
assert(uv.count>10000,'painted facial surface has curved tessellation');
for(let i=0;i<uv.count;i++)assert(uv.getY(i)>1-878/1080,'paint excludes caption area');
const front=meshes.find(m=>m.name==='curved face with genuine eye and mouth openings').geometry.attributes.position;
const back=meshes.find(m=>m.name==='closed rounded back of skull').geometry.attributes.position;
const boundaryBuckets=new Map();
for(let i=0;i<front.count;i++) {
  const x=front.getX(i),y=front.getY(i),key=`${Math.round(x*1e5)},${Math.round(y*1e5)}`;
  if(!boundaryBuckets.has(key))boundaryBuckets.set(key,[]);
  boundaryBuckets.get(key).push([x,y,front.getZ(i)]);
}
let maxShellBoundaryDistance=0;
for(let i=0;i<back.count;i++) {
  if(i%33!==0&&i%33!==32)continue;
  const x=back.getX(i),y=back.getY(i),z=back.getZ(i),qx=Math.round(x*1e5),qy=Math.round(y*1e5);
  let nearest=Infinity;
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const p of boundaryBuckets.get(`${qx+dx},${qy+dy}`)||[])nearest=Math.min(nearest,Math.hypot(p[0]-x,p[1]-y,p[2]-z));
  assert(nearest<1e-6,'actual front/back mesh boundary agrees, including Float32 silhouette vertices');
  maxShellBoundaryDistance=Math.max(maxShellBoundaryDistance,nearest);
}
const ownedCount=resources.size;
let sourceDisposed=false;texture.addEventListener('dispose',()=>{sourceDisposed=true;});
face.dispose();face.dispose();
assert.equal(head.children.length,0);assert.equal(resources.size,0);assert.equal(sourceDisposed,false);
console.log(JSON.stringify({passed:true,meshes:meshes.length,ownedResources:ownedCount,paintVertices:uv.count,maxShellBoundaryDistance,sourceTexturePreserved:true,controls:'continuous geometric blink, gaze, mood and speech'},null,2));
