import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter} from './load-baseline.mjs';
import {installSkirtVolume} from './skirt-volume.mjs';
const tex=(w,h)=>new THREE.Texture({width:w,height:h}),hash=a=>crypto.createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
const model=createStudyCharacter(tex(1920,1080),{garmentTexture:tex(1144,1375),turnaroundTexture:tex(2043,770)});
model.update(0,0,{mode:'manual',mood:'neutral',framing:'full'});
const originalBones=Object.fromEntries(Object.entries(model.bones).map(([k,b])=>[k,b.matrixWorld.toArray()]));
const originalMeshes=new Map();model.root.traverse(o=>{if(o.isMesh)originalMeshes.set(o,Object.fromEntries(Object.entries(o.geometry.attributes).map(([k,a])=>[k,hash(a.array)])));});
const candidate=installSkirtVolume(model),p=candidate.geometry.attributes.position,q=candidate.previous.attributes.position;
let maxXY=0,maxZ=0,finite=true;
for(let i=0;i<p.count;i++){maxXY=Math.max(maxXY,Math.abs(p.getX(i)-q.getX(i)),Math.abs(p.getY(i)-q.getY(i)));maxZ=Math.max(maxZ,Math.abs(p.getZ(i)-q.getZ(i)));finite=finite&&[p.getX(i),p.getY(i),p.getZ(i)].every(Number.isFinite);}
const unchangedAttributes=Object.fromEntries(Object.entries(candidate.geometry.attributes).filter(([k])=>!['position','normal'].includes(k)).map(([k,a])=>[k,hash(a.array)===hash(candidate.previous.attributes[k].array)]));
let unchangedOtherMeshes=true;for(const[o,attrs]of originalMeshes)if(o!==candidate.mesh)for(const[k,h]of Object.entries(attrs))if(hash(o.geometry.attributes[k].array)!==h)unchangedOtherMeshes=false;
const edgeCounts=new Map(),adj=Array.from({length:p.count},()=>[]),index=candidate.geometry.index;
let volume=0,minArea=Infinity;
for(let i=0;i<index.count;i+=3){const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)],v=ids.map(id=>new THREE.Vector3().fromBufferAttribute(p,id));volume+=v[0].dot(v[1].clone().cross(v[2]))/6;minArea=Math.min(minArea,v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).length()/2);for(let j=0;j<3;j++){const a=ids[j],b=ids[(j+1)%3],key=`${Math.min(a,b)}:${Math.max(a,b)}`;edgeCounts.set(key,(edgeCounts.get(key)||0)+1);adj[a].push(b);adj[b].push(a);}}
const seen=new Set();let components=0;for(let i=0;i<p.count;i++)if(!seen.has(i)){components++;const queue=[i];seen.add(i);while(queue.length){for(const v of adj[queue.pop()])if(!seen.has(v)){seen.add(v);queue.push(v);}}}
const boundaries=[...edgeCounts.values()].filter(v=>v===1).length,nonmanifold=[...edgeCounts.values()].filter(v=>v>2).length;
const report={schema:'dafeiyu.selected-skirt-depth-check.v1',metadata:candidate.metadata,vertices:p.count,triangles:index.count/3,finite,maxXY,maxZ,unchangedAttributes,indexBytesIdentical:hash(index.array)===hash(candidate.previous.index.array),unchangedOtherMeshes,body22WorldMaximumDifference:Math.max(...Object.entries(originalBones).flatMap(([k,a])=>model.bones[k].matrixWorld.toArray().map((v,i)=>Math.abs(v-a[i])))),topology:{components,boundaryEdges:boundaries,nonmanifoldEdges:nonmanifold,signedVolume:volume,minimumTriangleArea:minArea},visualPass:false,physicsPass:false};
report.numericalPass=finite&&maxXY===0&&Object.values(unchangedAttributes).every(Boolean)&&report.indexBytesIdentical&&unchangedOtherMeshes&&report.body22WorldMaximumDifference===0&&components===1&&boundaries===0&&nonmanifold===0&&minArea>0;
fs.mkdirSync(new URL('./reports/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('./reports/geometry-check.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));candidate.dispose();model.dispose();if(!report.numericalPass)process.exitCode=1;
