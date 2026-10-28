import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),runtime=path.resolve(here,'..');
const THREE=await import(pathToFileURL(path.resolve(runtime,'../rig3d-prototype/vendor/three.module.js')).href);
const data=fs.readFileSync(path.join(runtime,'assets/selected-appearance.glb')),jl=data.readUInt32LE(12),j=JSON.parse(data.subarray(20,20+jl)),bin=data.subarray(28+jl);
const contract=JSON.parse(fs.readFileSync(path.join(runtime,'assets/motion-rig.json')));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
if(sha(data)!==contract.glbSha256)throw Error('Selected appearance GLB mismatch');
function accessor(id){const a=j.accessors[id],v=j.bufferViews[a.bufferView],offset=(v.byteOffset??0)+(a.byteOffset??0),width={5126:4,5125:4,5123:2}[a.componentType],type={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type];if(v.byteStride)throw Error('Interleaved source accessor unsupported');const bytes=bin.subarray(offset,offset+a.count*type*width);return a.componentType===5123?new Uint16Array(bytes.buffer,bytes.byteOffset,bytes.length/2):a.componentType===5125?new Uint32Array(bytes.buffer,bytes.byteOffset,bytes.length/4):new Float32Array(bytes.buffer,bytes.byteOffset,bytes.length/4);}
const keys=['tailBase','tailMid','tailTip'];
const bones=keys.map((key,index)=>({key,name:contract.aliases[key].name,sourceJoint:contract.aliases[key].skinJointIndex,sourceBindInverse:contract.aliases[key].inverseBind,neutralGlobal:contract.aliases[key].neutralGlobal,massKg:[.045,.035,.025][index],angularStiffnessNmPerRad:[1.5,.8,.4][index],angularDamping:.9,angularLimitRadians:[.35,.40,.55],colliders:[]}));
const tailNames=['continuous rounded whale tail stem','indigo whale left biconvex fluke','indigo whale right biconvex fluke'];
const sourceMeshes=[];
for(const name of tailNames){
 const node=j.nodes.find(n=>n.name===name),primitive=j.meshes[node.mesh].primitives[0],p=accessor(primitive.attributes.POSITION),joints=accessor(primitive.attributes.JOINTS_0),weights=accessor(primitive.attributes.WEIGHTS_0);
 const ibm=accessor(j.skins[node.skin].inverseBindMatrices);sourceMeshes.push({name,vertices:p.length/3,positionSha256:sha(Buffer.from(p.buffer,p.byteOffset,p.byteLength))});
 for(const bone of bones){
  const inverse=new THREE.Matrix4().fromArray(ibm,bone.sourceJoint*16),cloud=[];
  for(let i=0;i<p.length/3;i++){
   let amount=0,dominant=0;for(let k=0;k<4;k++){if(joints[i*4+k]===bone.sourceJoint)amount+=weights[i*4+k];dominant=Math.max(dominant,weights[i*4+k]);}
   if(amount<.35||amount+1e-7<dominant)continue;
   const local=new THREE.Vector3().fromArray(p,i*3).applyMatrix4(inverse);cloud.push(local.toArray());
  }
  if(cloud.length>=4)bone.colliders.push({sourceMesh:name,pointsBoneBindLocal:cloud,sourceVertexCount:cloud.length,shape:'convex approximation of the selected source vertices; broad flukes remain separate shapes'});
 }
}
if(bones.some(b=>!b.colliders.length))throw Error('Tail source collider geometry missing');
const report={schema:'dafeiyu.selected-tail-jolt.v1',sourceGLBSha256:contract.glbSha256,sourceMeshes,bones,coordinateContract:{sourceBindLocal:'Mesh bind points rebased by actual exported Skin inverse bind; each collider is in its own original tail bone local frame',metersPerSourceUnit:contract.metersPerSourceUnit,modelLiftSourceUnits:contract.modelLiftSourceUnits,additionalTailOffset:false},physics:{engine:'Jolt',rigidBodies:3,joints:'Generic6DOF with fixed translations and bounded angular springs',gravityScale:1,proceduralSine:false,freeBodyPositionTargets:false,pelvisBoundaryOnly:true,collisionLayers:{world:1,objects:2,bodyProxies:16,tail:64},renderMapping:'Physical orientation drives original tailBase/tailMid/tailTip bones. Original local translations/skin/UV/colors stay fixed; joint/render positional discrepancies are measured.'},limits:['Source vertices with influence >=.35 form approximate convex segment contact hulls. They are not exact deforming triangle collision surfaces.','Joint stiffness/masses are tunable virtual material parameters, not measured anatomy.','Skirt contact waits for garment component; no claim of complete self-contact or all-angle shape.']};
fs.mkdirSync(path.join(here,'assets'),{recursive:true});fs.writeFileSync(path.join(here,'assets/tail-jolt.json'),JSON.stringify(report)+'\n');
console.log(JSON.stringify({bones:bones.map(b=>({name:b.name,shapes:b.colliders.length,points:b.colliders.reduce((n,s)=>n+s.pointsBoneBindLocal.length,0)})),meshes:sourceMeshes.length,sourceGLBSha256:contract.glbSha256}));
