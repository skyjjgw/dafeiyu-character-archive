import fs from 'node:fs';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter} from '../runtime-source/character.js';
import {installContinuousHeadband} from './headband.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const textures=Array.from({length:3},()=>new THREE.Texture()),rig=createStudyCharacter(textures[0],{garmentTexture:textures[1],turnaroundTexture:textures[2]});rig.update(0,0,{mode:'manual',framing:'full',yaw:0,pitch:0,mood:'neutral'});
const old=new Map();rig.root.traverse(o=>{if(o.isMesh)old.set(o.name,{geometry:o.geometry,visible:o.visible});});
const candidate=installContinuousHeadband(rig),g=candidate.mesh.geometry,p=g.attributes.position,idx=g.index.array,edges=new Map(),links=Array.from({length:p.count},()=>new Set());let finite=true,degenerate=0,volume=0,minArea=Infinity;
for(const x of p.array)finite&&=Number.isFinite(x);
for(let i=0;i<idx.length;i+=3){const ids=Array.from(idx.slice(i,i+3)),[a,b,c]=ids.map(id=>new THREE.Vector3().fromBufferAttribute(p,id)),cross=b.clone().sub(a).cross(c.clone().sub(a)),area=cross.length()/2;minArea=Math.min(minArea,area);if(area<1e-12)degenerate++;volume+=a.dot(b.clone().cross(c))/6;for(let j=0;j<3;j++){const a=ids[j],b=ids[(j+1)%3],k=a<b?a+','+b:b+','+a;if(!edges.has(k))edges.set(k,[]);edges.get(k).push(a<b?1:-1);links[a].add(b);links[b].add(a);}}
let components=0;const visited=new Set();for(let i=0;i<p.count;i++)if(!visited.has(i)){components++;const stack=[i];visited.add(i);while(stack.length)for(const j of links[stack.pop()])if(!visited.has(j)){visited.add(j);stack.push(j);}}
const topology={indexedVertices:p.count,triangles:idx.length/3,components,boundaryEdges:[...edges.values()].filter(e=>e.length===1).length,nonmanifoldEdges:[...edges.values()].filter(e=>e.length>2).length,orientationConflicts:[...edges.values()].filter(e=>e.length===2&&e[0]===e[1]).length,degenerate,minTriangleArea:minArea,signedVolume:volume};
let unchanged=true;rig.root.traverse(o=>{if(o.isMesh&&old.has(o.name)&&old.get(o.name).geometry!==o.geometry)unchanged=false;});
const sha=a=>crypto.createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex'),positionSha256=sha(p.array),indexSha256=sha(idx),strictPath=path.join(here,'reports/strict-crossing-diagnostic.json'),strict=fs.existsSync(strictPath)?JSON.parse(fs.readFileSync(strictPath,'utf8')):null,strictMatches=Boolean(strict&&strict.positionSha256===positionSha256&&strict.indexSha256===indexSha256);
const report={positionSha256,indexSha256,strictDiagnosticMatchesGeometry:strictMatches,strictNonAdjacentCrossingPairs:strictMatches?strict.strictNonAdjacentCrossingPairs:null,physicalQualityPassed:false,schema:'dafeiyu.continuous-headband.geometry-check.v1',finite,originalGeometryObjectsUnchanged:unchanged,sourceImagesEdited:false,metadata:candidate.metadata,topology,topologyDataPassed:finite&&unchanged&&components===1&&topology.boundaryEdges===0&&topology.nonmanifoldEdges===0&&topology.orientationConflicts===0&&degenerate===0&&volume>0,passed:false,visualPass:false,finalQuality:false,nativeIntegration:false,unverified:['Actual source/candidate front and all-angle GPU review','Strict all-triangle self-intersection and source hair contact','Material/cloth physics dynamics','Artistic white-band width and scalp/frill fit']};
fs.mkdirSync(path.join(here,'reports'),{recursive:true});fs.writeFileSync(path.join(here,'reports/geometry-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));candidate.dispose();rig.dispose();textures.forEach(t=>t.dispose());if(!report.passed)process.exitCode=1;
