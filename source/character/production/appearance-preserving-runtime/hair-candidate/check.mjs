import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {installSelectedHeadbandCandidate} from './headband-depth.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),production=path.resolve(here,'../..');
const source=path.join(production,'appearance-baseline-20261027/source');
const threeURL=pathToFileURL(path.join(production,'rig3d-prototype/vendor/three.module.js')).href;
const THREE=await import(threeURL),cache=new Map();
function mod(name){
 if(cache.has(name))return cache.get(name);
 const text=fs.readFileSync(path.join(source,name),'utf8').replace(/from\s+(['"])([^'"]+)\1/g,(_,q,spec)=>'from '+JSON.stringify(spec.includes('three.module.js')?threeURL:mod(path.basename(spec))));
 const url='data:text/javascript;base64,'+Buffer.from(text).toString('base64');cache.set(name,url);return url;
}
const sha=a=>crypto.createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
const {createStudyCharacter}=await import(mod('character.js'));
const rig=createStudyCharacter(new THREE.Texture(),{garmentTexture:new THREE.Texture(),turnaroundTexture:new THREE.Texture()});
rig.update(0,0,{mode:'manual',framing:'full',yaw:0,pitch:0,mood:'neutral'});
const sourceGeometry=new Map();rig.root.traverse(n=>{if(n.isMesh)sourceGeometry.set(n.name,n.geometry);});
const candidate=installSelectedHeadbandCandidate(rig.root,THREE,{strength:.55});
const changed=[];let finite=true,maxXY=0,uvUnchanged=true,unrelatedUnchanged=true;
rig.root.traverse(n=>{
 if(!n.isMesh)return;
 const old=sourceGeometry.get(n.name),g=n.geometry;
 if(g===old)return;
 const a=g.attributes.position.array,b=old.attributes.position.array;let maxZ=0;
 for(let i=0;i<Math.min(a.length,b.length);i++){finite&&=Number.isFinite(a[i]);if(i%3<2)maxXY=Math.max(maxXY,Math.abs(a[i]-b[i]));else maxZ=Math.max(maxZ,Math.abs(a[i]-b[i]));}
 if(old.attributes.uv)uvUnchanged&&=sha(old.attributes.uv.array)===sha(g.attributes.uv.array);
 if(!/painted-white-frill:|continuous-rounded-three-dimensional-headband/.test(n.name))unrelatedUnchanged=false;
 changed.push({name:n.name,sourceVertices:b.length/3,candidateVertices:a.length/3,maxZChange:maxZ,sourceUVSha256:old.attributes.uv?sha(old.attributes.uv.array):null});
});
function topology(g){
 const p=g.attributes.position.array,ix=g.index.array,ids=[],unique=new Map(),edges=new Map();
 for(let i=0;i<p.length;i+=3){const key=[p[i],p[i+1],p[i+2]].map(x=>Math.round(x*1e6)).join(',');if(!unique.has(key))unique.set(key,unique.size);ids.push(unique.get(key));}
 let degenerate=0,orientationMismatches=0;
 for(let i=0;i<ix.length;i+=3){const tri=[ids[ix[i]],ids[ix[i+1]],ids[ix[i+2]]];if(new Set(tri).size<3){degenerate++;continue;}for(let j=0;j<3;j++){const a=tri[j],b=tri[(j+1)%3],key=[Math.min(a,b),Math.max(a,b)].join(',');const e=edges.get(key)??{count:0,direction:0};e.count++;e.direction+=a<b?1:-1;edges.set(key,e);}}
 for(const e of edges.values())if(e.count===2&&e.direction!==0)orientationMismatches++;
 return {canonicalVertices:unique.size,triangles:ix.length/3,boundaryEdges:[...edges.values()].filter(e=>e.count===1).length,nonManifoldEdges:[...edges.values()].filter(e=>e.count>2).length,orientationMismatches,degenerateTriangles:degenerate};
}
const arch=rig.root.getObjectByName('continuous-rounded-three-dimensional-headband');
const before=topology(sourceGeometry.get(arch.name)),after=topology(arch.geometry);
const passed=finite&&maxXY===0&&uvUnchanged&&unrelatedUnchanged&&after.boundaryEdges===0&&after.nonManifoldEdges===0&&after.orientationMismatches===0&&after.degenerateTriangles===0;
const record={schema:'dafeiyu.selected-headband-candidate-check.v1',passed,visualPass:false,scope:'Local geometry/data checks only; no GPU or side/front artistic approval',metadata:candidate.metadata(),finite,maxOriginalXYChange:maxXY,UVBytesUnchanged:uvUnchanged,unrelatedMeshesUnchanged:unrelatedUnchanged,changed,arch:{before,after},limits:['Frill adaptive triangle T-junctions and all other original hair layers are not repaired here.','Inferred frill depth must pass actual front pixel and side image review.','No hair/cloth physics or new dynamics were added.']};
fs.mkdirSync(path.join(here,'reports'),{recursive:true});fs.writeFileSync(path.join(here,'reports/geometry-check.json'),JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record,null,2));candidate.dispose();rig.dispose();if(!passed)process.exitCode=1;
