import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter} from '../../animation-look-study/character.js';
import {addSourceFingerRig} from '../finger-rig.mjs';
import {installRetopologizedHands} from './hand.mjs';

const texture=(width,height)=>new THREE.Texture({width,height});
const model=createStudyCharacter(texture(1920,1080),{garmentTexture:texture(1144,1375),turnaroundTexture:texture(2043,770)});
model.update(0,0,{mode:'manual',mood:'neutral',framing:'full'});
const rig=addSourceFingerRig(model),replacement=installRetopologizedHands(rig);
model.root.updateMatrixWorld(true);rig.skeleton.update();
const hands=Object.values(rig.hands),objects=[];
model.root.traverse(o=>{if(!o.isMesh||hands.includes(o))objects.push(o);});
const nodeIds=new Map(objects.map((o,i)=>[o,i]));
const gltf={asset:{version:'2.0',generator:'Selected appearance local hand v2; original body bones retained'},extensionsUsed:['KHR_materials_unlit'],scene:0,scenes:[{nodes:[0]}],nodes:[],meshes:[],materials:[{name:'Source-fitted safe skin vertex COLOR',pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],metallicFactor:0,roughnessFactor:1},extensions:{KHR_materials_unlit:{}}}],skins:[],accessors:[],bufferViews:[],buffers:[]};
let size=0;const chunks=[],evidence=[];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function accessor(array,itemSize,{target=34962,bounds=false}={}){
  const padding=(4-size%4)%4;if(padding){chunks.push(Buffer.alloc(padding));size+=padding;}
  const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength),view=gltf.bufferViews.length;
  gltf.bufferViews.push({buffer:0,byteOffset:size,byteLength:bytes.length,...(target?{target}:{})});chunks.push(bytes);size+=bytes.length;
  const id=gltf.accessors.length,a={bufferView:view,componentType:new Map([[Float32Array,5126],[Uint32Array,5125],[Uint16Array,5123]]).get(array.constructor),count:array.length/itemSize,type:({1:'SCALAR',2:'VEC2',3:'VEC3',4:'VEC4',16:'MAT4'})[itemSize]};
  if(!a.componentType)throw Error('Unexpected array type');
  if(bounds){a.min=Array(itemSize).fill(Infinity);a.max=Array(itemSize).fill(-Infinity);for(let i=0;i<array.length;i++){a.min[i%itemSize]=Math.min(a.min[i%itemSize],array[i]);a.max[i%itemSize]=Math.max(a.max[i%itemSize],array[i]);}}
  gltf.accessors.push(a);evidence.push({accessor:id,bytes:bytes.length,sha256:hash(bytes)});return id;
}
for(const o of objects){const children=o.children.filter(c=>nodeIds.has(c)).map(c=>nodeIds.get(c));gltf.nodes.push({name:o.name||o.type,translation:o.position.toArray(),rotation:o.quaternion.toArray(),scale:o.scale.toArray(),...(children.length?{children}:{})});}
const semantics={position:'POSITION',normal:'NORMAL',color:'COLOR_0',skinIndex:'JOINTS_0',skinWeight:'WEIGHTS_0'};
for(const mesh of hands){
  const geometry=mesh.geometry,attributes={};
  for(const[key,semantic]of Object.entries(semantics)){const a=geometry.attributes[key];attributes[semantic]=accessor(a.array,a.itemSize,{bounds:key==='position'});}
  const indices=accessor(Uint32Array.from(geometry.index.array),1,{target:34963});
  const node=gltf.nodes[nodeIds.get(mesh)];node.mesh=gltf.meshes.length;node.skin=gltf.skins.length;
  gltf.meshes.push({name:mesh.name,primitives:[{attributes,indices,material:0,mode:4}]});
  const ibm=new Float32Array(rig.skeleton.bones.length*16);
  rig.skeleton.boneInverses.forEach((m,i)=>ibm.set(m.clone().multiply(mesh.bindMatrix).toArray(),i*16));
  gltf.skins.push({name:'selected-body-22-plus-local-fingers-30',joints:rig.skeleton.bones.map(b=>nodeIds.get(b)),skeleton:nodeIds.get(rig.skeleton.bones[0]),inverseBindMatrices:accessor(ibm,16,{target:null})});
}
gltf.buffers=[{byteLength:size}];
const rawBin=Buffer.concat(chunks),bin=Buffer.concat([rawBin,Buffer.alloc((4-rawBin.length%4)%4)]);
const rawJson=Buffer.from(JSON.stringify(gltf)),json=Buffer.concat([rawJson,Buffer.alloc((4-rawJson.length%4)%4,32)]);
const header=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);
header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+bin.length,8);
jh.writeUInt32LE(json.length);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);
const glb=Buffer.concat([header,jh,json,bh,bin]);
fs.mkdirSync(new URL('./assets/',import.meta.url),{recursive:true});
const output=new URL('./assets/selected-hand-v2.glb',import.meta.url);fs.writeFileSync(output,glb);
// Independently read the actual written GLB slices, checking all bytes.
const written=fs.readFileSync(output),jl=written.readUInt32LE(12),parsed=JSON.parse(written.subarray(20,20+jl).toString()),binary=written.subarray(28+jl);
for(const row of evidence){const a=parsed.accessors[row.accessor],v=parsed.bufferViews[a.bufferView];if(hash(binary.subarray(v.byteOffset,v.byteOffset+v.byteLength))!==row.sha256)throw Error('Written GLB accessor mismatch '+row.accessor);}
const report={schema:'dafeiyu.selected-hand-package.v2',bytes:glb.length,sha256:hash(glb),nodes:objects.length,meshes:2,skins:2,bodyBones:22,addedFingerBones:30,skinJoints:52,accessors:evidence,handMetadata:replacement.metadata(),rig:rig.metadata(),sourceCoordinateContract:'Uncalibrated study units. Y up, +Z front. Same source bind/local frame; no metre conversion.',materialContract:'Unlit Float32 linear vertex COLOR, FrontSide. No image map/UV is needed for repaired hands. Godot defaults may quantize COLOR; use source runtime CUSTOM0 float path.',integration:'Hand-only package, not whole avatar. Remap original body joints by name onto source body22; add 30 finger bones with supplied revised bind/rest and weight indices. Do not apply a second .1775Z offset. Preserve original hand mesh matrix/bind frame.',approval:{numerical:'Separate geometry/intersection reports',localVisual:'Root reported macro proportions improved; complete quality not approved',grasp:false,physics:false,installedInto4348:false}};
report.boneTable=rig.skeleton.bones.map((b,index)=>({index,name:b.name,parentBoneName:b.parent?.isBone?b.parent.name:null,node:nodeIds.get(b),exportedLocalTranslation:b.position.toArray(),exportedLocalRotation:b.quaternion.toArray(),exportedLocalScale:b.scale.toArray(),exportedNeutralWorldMatrix:b.matrixWorld.toArray(),sourceBindInverse:rig.skeleton.boneInverses[index].toArray(),role:index<22?'unchanged source body bone':'revised local hand bone'}));
report.driveContract={neutral:{grip:0,opposition:0,individualDigits:0},curl:'Each digit uses clamp(individual[name] ?? grip ?? 0,0,1). No smoothing or hidden clipping beyond range; UI adds its individual slider to global grip before this function.',deltaOrder:'local restQuaternion * (thumb MCP Rz(sign*.55*opposition)*Ry(sign*.55*opposition) if thumb MCP) * Rx(maxFlexDegrees[k]*curl)',oppositionSign:{left:-1,right:1},bodyPoseRule:'Existing body22 motion untouched. Treat delta above as pose relative to each new finger bone actual bind/rest; do not multiply rest twice in a Godot pose delta API.',limits:'Per-digit maxFlexDegrees in rig.hands. No force or collision response and no arbitrary-pose guarantee.'};
fs.writeFileSync(new URL('./assets/selected-hand-v2.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({bytes:report.bytes,sha256:report.sha256,nodes:report.nodes,skinJoints:52,accessors:evidence.length}));
replacement.dispose();rig.dispose();model.dispose();
