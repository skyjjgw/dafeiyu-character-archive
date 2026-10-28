import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const own=path.dirname(fileURLToPath(import.meta.url));
const project=path.resolve(own,'../..');
const baseline=path.join(project,'production/appearance-baseline-20261027');
const source=path.join(baseline,'source');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const threeURL=pathToFileURL(path.join(project,'production/rig3d-prototype/vendor/three.module.js')).href;
const THREE=await import(threeURL),cache=new Map(),sourceHashes={};
function moduleURL(name){
 if(cache.has(name))return cache.get(name);
 const bytes=fs.readFileSync(path.join(source,name));sourceHashes[name]=sha(bytes);
 let text=bytes.toString().replace(/from\s+(['"])([^'"]+)\1/g,(_,q,s)=>'from '+JSON.stringify(s.includes('three.module.js')?threeURL:moduleURL(path.basename(s))));
 if(name==='face.js')text+='\nexport const __faceProbe={eyes,mouthCenter,mouthHole,rightOutline,profileVolume,sourceToFace,faceToSource,skinColor,eyeOuter,eyeAperture,lidY,mouthPoint};';
 const url='data:text/javascript;base64,'+Buffer.from(text).toString('base64');cache.set(name,url);return url;
}
const {createPaintedFace,__faceProbe:probe}=await import(moduleURL('face.js'));
const authority=JSON.parse(fs.readFileSync(path.join(baseline,'manifest.json')));
for(const[name,hash]of Object.entries(sourceHashes)){const expected=authority.sources.find(row=>row.snapshot==='source/'+name);if(expected?.sha256!==hash)throw Error('Frozen source digest mismatch '+name);}
const texture=new THREE.Texture(),head=new THREE.Group(),resources=new Set();
const face=createPaintedFace({head,resources,texture,sourceWidth:1920,sourceHeight:1080});
const chunks=[];let cursor=0;
function append(array){const b=Buffer.from(array.buffer,array.byteOffset,array.byteLength);const pad=(4-cursor%4)%4;if(pad){chunks.push(Buffer.alloc(pad));cursor+=pad;}const offset=cursor;chunks.push(Buffer.from(b));cursor+=b.length;return {offset,length:b.length,itemCount:array.length,type:array.constructor.name,sha256:sha(b)};}
function role(mesh){
 const name=mesh.name;const eye=name.startsWith('left ')?0:name.startsWith('right ')?1:null;
 if(eye!==null){for(const[needle,id]of [['deforming skin eyelid','eye_ring'],['exposed sclera','sclera'],['sampled original iris','iris'],['moving upper eyelash','upper_lash'],['pointed outer lashes','wing'],['moving lower eyelash','lower_lash'],['moving eyelid crease','crease']])if(name.includes(needle))return {role:id,eye,...mesh.geometry.userData};}
 for(const[needle,id]of [['continuously deforming skin around mouth','mouth_ring'],['continuously opening mouth cavity','mouth_cavity'],['tongue inside opening','tongue'],['continuous smile contour','lips']])if(name===needle)return {role:id,...mesh.geometry.userData};
 return {role:'static'};
}
function attributes(mesh){const result={};for(const[name,a]of Object.entries(mesh.geometry.attributes))result[name]={...append(a.array),itemSize:a.itemSize,count:a.count};return result;}
function material(m){return {name:m.name,type:m.type,baseLinear:[...m.color.toArray(),m.opacity],vertexColors:m.vertexColors,transparent:m.transparent,depthWrite:m.depthWrite,depthTest:m.depthTest,side:m.side,toneMapped:m.toneMapped,hasSourceTexture:!!m.map,alphaTest:m.alphaTest};}
const meshes=face.root.children.filter(m=>m.isMesh).map((mesh,index)=>({index,name:mesh.name,vertices:mesh.geometry.getAttribute('position').count,semantic:role(mesh),material:material(mesh.material),attributes:attributes(mesh),indexData:mesh.geometry.index?append(mesh.geometry.index.array):null,transform:{position:mesh.position.toArray(),quaternion:mesh.quaternion.toArray(),scale:mesh.scale.toArray()}}));
const config={schema:'dafeiyu.selected-face-equations.v1',sourceHashes,sourceSize:[1920,1080],sourceOrigin:[815,583],pixelsPerUnit:775,tilt:.06,eyes:probe.eyes,mouthCenter:probe.mouthCenter,mouthHole:probe.mouthHole,rightOutline:probe.rightOutline,profile:{resolution:1024,minY:-.382,maxY:.64,fields:['midlineZ','baseCenterZ','seamZ','rearDepth','axisX','featureWidth','width','center','legacyDepth','legacyNose'],parameters:probe.profileVolume.metadata.parameters,table:[]}};
for(let i=0;i<=1024;i++){const row=probe.profileVolume.sample(-.382+(.64+.382)*i/1024);config.profile.table.push(config.profile.fields.map(key=>row[key]));}
const states=[];
for(let i=0;i<=10;i++){
 const t=i/10;
 states.push({label:'blink-'+i,blink:t,talk:0,happy:0,sad:0,gazeX:0,gazeY:0});
 states.push({label:'talk-gaze-'+i,blink:.15*t,talk:t,happy:.20,sad:0,gazeX:Math.sin(t*Math.PI*2)*.6,gazeY:Math.cos(t*Math.PI)*.4});
 states.push({label:'happy-gaze-'+i,blink:t,talk:.35*t,happy:t,sad:0,gazeX:(2*t-1)*.7,gazeY:.3});
 states.push({label:'sad-gaze-'+i,blink:t,talk:.25*(1-t),happy:0,sad:t,gazeX:-(2*t-1)*.7,gazeY:Math.sin(t*Math.PI)*.5});
}
const frames=[];
for(const state of states){
 face.update(1/60,0,state);
 const frame={state,normalized:{...face.root.userData.expression},meshes:[]};
 for(const spec of meshes){const mesh=face.root.children.find(m=>m.name===spec.name);if(spec.semantic.role==='static')continue;const attrs={};for(const key of ['position','uv','color']){const a=mesh.geometry.getAttribute(key);if(a)attrs[key]={...append(a.array),itemSize:a.itemSize,count:a.count};}frame.meshes.push({index:spec.index,visible:mesh.visible,attributes:attrs});}
 frames.push(frame);
}
for(const[name,hash]of Object.entries(sourceHashes))if(sha(fs.readFileSync(path.join(source,name)))!==hash)throw Error('Frozen source modified '+name);
const report={schema:'dafeiyu.selected-face-source-samples.v1',authority:authority.chosenURL,sourceHashes,instrumentation:'Import URLs redirected; extra exports expose closures. Original createPaintedFace/update and all equations unchanged.',sourceTextureSha256:sha(fs.readFileSync(path.join(baseline,'assets/BV1g2JX6HEHX.jpg'))),meshes,frames,bytes:cursor,states:frames.length,dynamicMeshes:meshes.filter(m=>m.semantic.role!=='static').length,staticMeshes:meshes.filter(m=>m.semantic.role==='static').length,sourceUnchanged:true,scope:'Numerical and render comparison authority only; no candidate installed into original page or DSH.'};
fs.writeFileSync(path.join(own,'fixtures/source-equations.json'),JSON.stringify(config)+'\n');
fs.writeFileSync(path.join(own,'fixtures/source-samples.bin'),Buffer.concat(chunks));
fs.writeFileSync(path.join(own,'fixtures/source-samples.json'),JSON.stringify(report,null,2)+'\n');
face.dispose();texture.dispose();console.log(JSON.stringify({states:report.states,meshes:meshes.length,dynamicMeshes:report.dynamicMeshes,staticMeshes:report.staticMeshes,bytes:cursor,sourceUnchanged:true}));
