import assert from 'node:assert/strict';
import * as THREE from '../rig3d-prototype/vendor/three.module.js';
import {createPaintedHair} from './hair.js';

const resources=new Set(),head=new THREE.Group(),texture=new THREE.Texture(),garmentTexture=new THREE.Texture(),turnaroundTexture=new THREE.Texture();
const hair=createPaintedHair({head,resources,texture,garmentTexture,turnaroundTexture});
let meshes=0,vertices=0,uvs=0;
function inspect(){
  hair.root.traverse(object=>{
    if(!object.isMesh)return;
    meshes++;const geometry=object.geometry,position=geometry.attributes.position;
    vertices+=position.count;
    for(const v of position.array)assert(Number.isFinite(v),`${object.name} has a non-finite position`);
    for(const v of geometry.attributes.normal.array)assert(Number.isFinite(v),`${object.name} has a non-finite normal`);
    const materials=Array.isArray(object.material)?object.material:[object.material];
    if(geometry.attributes.uv&&materials.some(material=>material.map)){
      for(const v of geometry.attributes.uv.array){assert(v>=0&&v<=1,`${object.name} samples outside source`);uvs++;}
    }
    geometry.computeBoundingBox();
    assert(geometry.boundingBox.min.x>-1.5&&geometry.boundingBox.max.x<1.5);
    assert(geometry.boundingBox.min.y>-1.4&&geometry.boundingBox.max.y<1.2);
  });
  for(const m of hair.metadata.checkState()){
    assert(Object.values(m).every(Number.isFinite),'Non-finite spring state');
    assert(Math.abs(m.x)<=.055&&Math.abs(m.z)<=.035,'Spring exceeded hard safety limit');
  }
}
inspect();
const rest=[];hair.root.traverse(o=>{if(o.isMesh)rest.push(Float32Array.from(o.geometry.attributes.position.array));});
for(let i=0;i<360;i++){
  head.rotation.set(.12*Math.sin(i*.07),.44*Math.sin(i*.13),.05*Math.sin(i*.09));
  hair.update(1/60,i/60,{strength:1});
}
let displacement=0,j=0;hair.root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position.array;const initial=rest[j++];for(let k=0;k<p.length;k++)displacement=Math.max(displacement,Math.abs(p[k]-initial[k]));});
assert(displacement>.0001,'Tip bending did not respond to head motion');
inspect();
head.rotation.set(0,0,0);
for(let i=0;i<600;i++)hair.update(1/60,6+i/60,{strength:1});
assert(hair.metadata.checkState().every(m=>Math.abs(m.x)<1e-8&&Math.abs(m.z)<1e-8),'Hair failed to settle at rest');
inspect();
for(const resource of resources)assert(![texture,garmentTexture,turnaroundTexture].includes(resource),'Shared source texture is incorrectly owned');
// This verifies the frozen study's physical coverage, not visual likeness or
// suitability as the final native character requested by the user.
hair.root.updateMatrixWorld(true);
const scalp=hair.root.getObjectByName('continuous-scalp-front-side-back-shell'),posterior=hair.root.getObjectByName('rounded-posterior-waterfall-hair-volume');
assert(scalp&&posterior,'Continuous hair volumes are missing');
assert.equal(posterior.geometry.type,'BufferGeometry');
const scalpPosition=scalp.geometry.attributes.position,{rows,cols}=scalp.userData.structure;
for(const[column,y]of[[0,.34],[cols/4,-.40],[cols/2,-.48]])assert(Math.abs(scalpPosition.getY(rows*(cols+1)+column)-y)<1e-5,'Scalp opening was moved over the face or away from the nape');
const ray=new THREE.Raycaster(),backCoverage=[];
for(const[x,y]of[[0,-.3],[0,0],[0,.3],[0,.6],[-.4,0],[.4,0]]){
  ray.set(new THREE.Vector3(x,y,-2),new THREE.Vector3(0,0,1));
  const hits=ray.intersectObjects([scalp,posterior],false);assert(hits.length&&hits[0].point.z<-.2,'Rear hair coverage leaves the skin exposed');
  backCoverage.push([x,y,hits[0].point.z]);
}
assert.equal(hair.metadata.patches.length,13);
assert(hair.metadata.patches.every(p=>p.type==='long-hair'?(p.source==='production/v1/neutral-front.png'&&p.bounds.minX>=235&&p.bounds.maxX<=492&&p.bounds.minY>=626&&p.bounds.maxY<=1018):p.bounds.maxY<=853.001),'Unsafe source area sampled');
assert(hair.metadata.patches.filter(p=>p.type==='long-hair').every(p=>p.holes.length===2),'Real open curl holes are missing');
assert(hair.metadata.patches.filter(p=>p.type==='long-hair').every(p=>p.crossSection.maxDepth-p.crossSection.minDepth>.12),'Long curls became equal-thickness walls again');
assert.throws(()=>createPaintedHair({head,resources,texture,sourceWidth:100}));
console.log(JSON.stringify({ok:true,meshes:meshes/3,vertices:vertices/3,uvValues:uvs/3,frontVertices:hair.metadata.totalFrontVertices,maximumTipDisplacement:displacement,restSettled:true,backCoverage,scope:'Frozen painted comparison study; not a final native character',limitations:hair.metadata.limitations},null,2));
