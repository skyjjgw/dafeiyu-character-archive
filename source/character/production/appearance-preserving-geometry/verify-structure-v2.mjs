import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import * as THREE from '../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter} from './runtime-source/character.js';
import {installContinuousHeadV2 as installContinuousHead} from './continuous-head-v2.mjs';
import {createFaceKernel} from '../appearance-preserving-face/kernel.mjs';
const directory=path.dirname(fileURLToPath(import.meta.url));
const config=JSON.parse(fs.readFileSync(path.resolve(directory,'../appearance-preserving-face/fixtures/source-equations.json'),'utf8'));
const kernel=createFaceKernel(config),textures=Array.from({length:3},()=>{const t=new THREE.Texture();t.colorSpace=THREE.SRGBColorSpace;return t;});
const make=()=>createStudyCharacter(textures[0],{garmentTexture:textures[1],turnaroundTexture:textures[2]});
const source=make(),candidate=make(),base={mode:'manual',framing:'full',action:'idle',mood:'neutral',yaw:0,pitch:0,blink:0,talk:0,gazeX:0,gazeY:0};
source.update(0,0,base);candidate.update(0,0,base);
const structure=installContinuousHead(candidate,{kernel,sourceConfig:config}),record={schema:'dafeiyu.continuous-head-verification.v2',scope:'Numerical structure/projection checks, not visual acceptance or collision certification',sourceProjection:[],retainedVisibleAttributes:[],globeFront:[],states:[],failures:[]};
const fail=message=>record.failures.push(message),maxDiff=(a,b)=>{let n=0;if(a.length!==b.length)return Infinity;for(let i=0;i<a.length;i++)n=Math.max(n,Math.abs(a[i]-b[i]));return n;};
const newPos=structure.headMesh.geometry.attributes.position;
for(const[name,map]of Object.entries(structure.manifest.sourceMaps)){
 const mesh=source.head.getObjectByName(name),p=mesh.geometry.attributes.position;let xy=0,z=0;
 for(let i=0;i<map.length;i++){xy=Math.max(xy,Math.abs(newPos.getX(map[i])-p.getX(i)),Math.abs(newPos.getY(map[i])-p.getY(i)));z=Math.max(z,Math.abs(newPos.getZ(map[i])-p.getZ(i)));}
 record.sourceProjection.push({name,sourceVertices:map.length,maxXY:xy,maxInferredZDifference:z});if(xy>1e-6)fail(name+' projected XY changed');
}
for(const name of structure.manifest.retainedVisibleMeshes){
 const a=source.head.getObjectByName(name),b=candidate.head.getObjectByName(name);if(!a||!b){fail('Missing retained '+name);continue;}
 const item={name,attributes:{}};for(const key of ['position','uv','color']){const x=a.geometry.attributes[key],y=b.geometry.attributes[key];if(!x)continue;let difference=0;if(key==='position'){for(let i=0;i<x.count;i++)difference=Math.max(difference,Math.abs(x.getX(i)-y.getX(i)),Math.abs(x.getY(i)-y.getY(i)));}else difference=maxDiff(x.array,y.array);item.attributes[key]={maxProjectedXYOrAttributeDifference:difference};if(difference!==0)fail('Original visible '+name+' '+key+' projected contract changed');}
 record.retainedVisibleAttributes.push(item);
}
for(const g of structure.manifest.globes){const src=source.head.getObjectByName(g.frontSourceMesh),dst=candidate.head.getObjectByName(g.mesh),a=src.geometry.attributes.position,b=dst.geometry.attributes.position;let max=0;for(let i=0;i<g.sourceMap.length;i++)for(let j=0;j<2;j++)max=Math.max(max,Math.abs(a.array[i*3+j]-b.array[g.sourceMap[i]*3+j]));record.globeFront.push({name:g.mesh,maxNeutralSourceFrontXY:max,topology:g.topology});if(max>1e-6)fail('Globe source front moved');}
const states=[{},...Array.from({length:11},(_,i)=>({blink:i/10})),{talk:.5},{talk:1},{mood:'happy',talk:1,blink:.5,gazeX:1,gazeY:-1},{mood:'sad',talk:.6,blink:.3,gazeX:-1,gazeY:1}];
const index=structure.headMesh.geometry.index.array,neutralCount=newPos.count;
for(const input of states){const state={...base,...input},start=performance.now();candidate.update(0,0,state);source.update(0,0,state);let finite=true,maxMappedDynamicSourceXY=0;for(const v of newPos.array)if(!Number.isFinite(v))finite=false;
 for(const name of structure.manifest.retainedVisibleMeshes){const a=source.head.getObjectByName(name),b=candidate.head.getObjectByName(name),p=a.geometry.attributes.position,q=b.geometry.attributes.position;for(let i=0;i<p.count;i++){maxMappedDynamicSourceXY=Math.max(maxMappedDynamicSourceXY,Math.abs(p.getX(i)-q.getX(i)),Math.abs(p.getY(i)-q.getY(i)));}for(const attr of ['uv','color']){if(a.geometry.attributes[attr]&&maxDiff(a.geometry.attributes[attr].array,b.geometry.attributes[attr].array)!==0)fail('Dynamic original '+name+' '+attr+' changed');}}
 const sourceBone=source.bones,candidateBone=candidate.bones;let bodyMatrixDifference=0;source.root.updateMatrixWorld(true);candidate.root.updateMatrixWorld(true);for(const name of Object.keys(sourceBone)){const a=sourceBone[name],b=candidateBone[name];if(a?.isBone&&b?.isBone)bodyMatrixDifference=Math.max(bodyMatrixDifference,maxDiff(a.matrixWorld.elements,b.matrixWorld.elements));}
 const item={input,finite,indexCount:index.length,vertexCount:newPos.count,retainedXYDifference:maxMappedDynamicSourceXY,bodyBoneMatrixDifference:bodyMatrixDifference,totalSourceAndCandidateUpdateMs:performance.now()-start};record.states.push(item);
 if(!finite||newPos.count!==neutralCount||maxMappedDynamicSourceXY!==0||bodyMatrixDifference!==0)fail('State violated geometry/source contract '+JSON.stringify(input));
}
candidate.update(0,0,base);source.update(0,0,base);
record.headTopology=structure.manifest.topology;record.maxInferredFrontZRepair=structure.manifest.maxInferredFrontZRepair;record.depthPolicy=structure.manifest.depthPolicy;
record.unverified=['Actual GPU front pixel comparison remains required.','Closed orientable topology does not prove absence of all self-intersections.','Mouth is intentionally a contact seam at neutral; open mouth and tongue are not certified dental/tongue anatomy.','No collision or soft-tissue dynamics have been implemented by this head candidate.','Eye volume keeps the old front cap; gaze still follows the selected artwork projection rather than a fully rotating physiological eyeball.'];
record.passed=record.failures.length===0;fs.mkdirSync(path.join(directory,'reports'),{recursive:true});fs.writeFileSync(path.join(directory,'reports/structure-verification-v2.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({passed:record.passed,failures:record.failures,projection:record.sourceProjection,states:record.states.length,topology:record.headTopology}));
source.dispose();candidate.dispose();textures.forEach(t=>t.dispose());if(!record.passed)process.exitCode=1;
