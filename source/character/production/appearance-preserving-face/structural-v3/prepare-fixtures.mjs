import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter} from '../../appearance-preserving-geometry/runtime-source/character.js';
import {installContinuousHeadV3} from '../../appearance-preserving-geometry/continuous-head-v3.mjs';
import {createFaceKernel} from '../kernel.mjs';
const directory=path.dirname(fileURLToPath(import.meta.url)),geometry=path.resolve(directory,'../../appearance-preserving-geometry');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const config=read(path.resolve(directory,'../fixtures/source-equations.json'));
const original=read(path.resolve(directory,'../fixtures/source-samples.json'));
const canonical=read(path.join(geometry,'assets/structure-canonical-descriptors-v3.json'));
const cage=read(path.join(geometry,'assets/head-depth-cage-v3.json'));
const roleNames=['static','eye_ring','sclera','iris','upper_lash','wing','lower_lash','crease','mouth_ring','mouth_cavity','tongue','lips','front_profile'];
const textures=Array.from({length:3},()=>{const t=new THREE.Texture();t.colorSpace=THREE.SRGBColorSpace;return t;});
const character=createStudyCharacter(textures[0],{garmentTexture:textures[1],turnaroundTexture:textures[2]});
const base={mode:'manual',framing:'full',action:'idle',mood:'neutral',yaw:0,pitch:0,blink:0,talk:0,gazeX:0,gazeY:0};
character.update(0,0,base);
const structure=installContinuousHeadV3(character,{kernel:createFaceKernel(config),sourceConfig:config});
const meshes=[structure.headMesh,...structure.retained,...structure.globes.map(g=>g.mesh)];
const chunks=[];let offset=0;
function binary(array){const b=Buffer.from(array.buffer,array.byteOffset,array.byteLength),padding=(8-offset%8)%8;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}const view={offset,length:b.length};chunks.push(Buffer.from(b));offset+=b.length;return view;}
function rgba(geometry){const c=geometry.attributes.color;if(!c)return null;const a=new Float32Array(c.count*4);for(let i=0;i<c.count;i++){a[i*4]=c.getX(i);a[i*4+1]=c.getY(i);a[i*4+2]=c.getZ(i);a[i*4+3]=c.itemSize===4?c.getW(i):1;}return a;}
const descriptors=[];
for(let index=0;index<meshes.length;index++){
 const mesh=meshes[index],g=mesh.geometry,count=g.attributes.position.count,source=original.meshes.find(e=>e.name===mesh.name),sem=source?.semantic||{role:'static'};
 let roles,params;
 if(mesh===structure.headMesh){roles=new Int32Array(canonical.canonicalRoles);params=new Float64Array(canonical.canonicalParams);}
 else{
  roles=new Int32Array(count).fill(roleNames.indexOf(sem.role));params=new Float64Array(count*4);
  for(let i=0;i<count;i++){
   if(sem.role==='static'){params.set([...g.attributes.position.array.subarray(i*3,i*3+3),0],i*4);continue;}
   const p=[sem.eye||0,0,0,0];
   if(sem.role==='iris'){p[1]=(i%(sem.cols+1))/sem.cols*2-1;p[2]=Math.floor(i/(sem.cols+1))/sem.rows;}
   else if(sem.role==='wing')p[1]=i;
   else if(sem.steps){p[1]=Math.floor(i/2)/sem.steps;p[2]=i%2===0?-1:1;}
   else{p[1]=(i%(sem.segments+1))/sem.segments*Math.PI*2;p[2]=Math.floor(i/(sem.segments+1))/sem.rings;}
   params.set(p,i*4);
  }
 }
 const colors=rgba(g),spec={index,name:mesh.name,vertices:count,semantic:sem,canonicalRoles:binary(roles),canonicalParams:binary(params),neutralPositions:binary(g.attributes.position.array)};
 if(g.attributes.uv)spec.neutralUV=binary(g.attributes.uv.array);
 if(colors)spec.neutralRGBA=binary(colors);
 descriptors.push(spec);
}
const states=[{},...[.1,.25,.5,.75,.95,1].map(blink=>({blink})),...[.2,.6,1].map(talk=>({talk})),{mood:'happy',talk:.8,blink:.45,gazeX:.7,gazeY:-.5},{mood:'sad',talk:.6,blink:.25,gazeX:-.8,gazeY:.7},{gazeX:1,gazeY:1},{gazeX:-1,gazeY:-1}];
let seed=47371;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(let i=0;i<10;i++)states.push({blink:random(),talk:random(),gazeX:random()*2-1,gazeY:random()*2-1,mood:i%3===0?'happy':i%3===1?'sad':'neutral'});
const frames=[];
for(const state of states){character.update(0,0,{...base,...state});const actual={...character.head.getObjectByName('painted-face').userData.expression};const frame={state:actual,input:state,meshes:[]};for(let index=0;index<meshes.length;index++){const mesh=meshes[index],g=mesh.geometry,attributes={position:binary(g.attributes.position.array)};if(g.attributes.uv)attributes.uv=binary(g.attributes.uv.array);const colors=rgba(g);if(colors)attributes.color=binary(colors);frame.meshes.push({index,name:mesh.name,visible:mesh.visible,attributes});}frames.push(frame);}
const bytes=Buffer.concat(chunks),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
fs.mkdirSync(path.join(directory,'fixtures'),{recursive:true});
fs.writeFileSync(path.join(directory,'fixtures/data.bin'),bytes);
fs.writeFileSync(path.join(directory,'fixtures/samples.json'),JSON.stringify({schema:'dafeiyu.structural-face-v3.samples.v1',authority:'Actual frozen-source Three factory + reviewed continuous-head-v3, not a mirrored native implementation',dataSha256:sha(bytes),descriptors,frames})+'\n');
fs.writeFileSync(path.join(directory,'fixtures/source-equations.json'),JSON.stringify(config)+'\n');
fs.writeFileSync(path.join(directory,'fixtures/structure.json'),JSON.stringify({deformationConfig:canonical.deformationConfig,depthPolicy:canonical.depthPolicy,cage,nativeGridResolution:128})+'\n');
console.log(JSON.stringify({meshes:descriptors.length,states:frames.length,bytes:bytes.length,sha256:sha(bytes)}));
character.dispose();textures.forEach(t=>t.dispose());
