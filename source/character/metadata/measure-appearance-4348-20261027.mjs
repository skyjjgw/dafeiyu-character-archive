// Read-only measurement of the frozen, user-selected appearance. No WebGL,
// browser, model export, changed artwork, or scene window is created.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const baseline=path.join(project,'production/appearance-baseline-20261027');
const manifest=JSON.parse(await fs.readFile(path.join(baseline,'manifest.json'),'utf8'));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const before={};
for(const record of[...manifest.sources,...manifest.assets]){
 const bytes=await fs.readFile(path.join(baseline,record.snapshot));before[record.snapshot]=sha(bytes);
 if(before[record.snapshot]!==record.sha256)throw new Error('Frozen baseline hash mismatch: '+record.snapshot);
}
const vendor=pathToFileURL(path.join(project,'production/rig3d-prototype/vendor/three.module.js')).href;
const THREE=await import(vendor),urls=new Map();
async function sourceURL(name){
 if(urls.has(name))return urls.get(name);
 let source=await fs.readFile(path.join(baseline,'source',name),'utf8');
 const imports=[...source.matchAll(/from\s*['"]([^'"]+)['"]/g)];
 for(const match of imports){const specifier=match[1],target=specifier.includes('three.module.js')?vendor:await sourceURL(path.posix.basename(specifier));source=source.replace(match[0],match[0].replace(specifier,target));}
 const url='data:text/javascript;base64,'+Buffer.from(source).toString('base64');urls.set(name,url);return url;
}
const character=await import(await sourceURL('character.js'));
const faceModule=await import(await sourceURL('face.js'));
const textures=[['BV1g2JX6HEHX.jpg',1920,1080],['neutral-front.png',1144,1375],['turnaround-auxiliary-v2.png',2043,770]].map(([name,width,height])=>{const t=new THREE.Texture();t.name=name;t.image={width,height};t.colorSpace=THREE.SRGBColorSpace;return t;});
const rig=character.createStudyCharacter(textures[0],{garmentTexture:textures[1],turnaroundTexture:textures[2]});
const canonical={mode:'manual',framing:'full',action:'idle',mood:'neutral',yaw:0,pitch:0,gazeX:0,gazeY:0,blink:0,talking:0,happy:0,sad:0};
rig.update(0,0,canonical);rig.root.updateMatrixWorld(true);
const vec=v=>v.toArray(),round=n=>Number(n.toFixed(9));
function bounds(points){const b=new THREE.Box3();for(const p of points)b.expandByPoint(p);return{min:vec(b.min),max:vec(b.max),size:vec(b.getSize(new THREE.Vector3()))};}
function pointsOf(mesh,posed=true){const a=mesh.geometry.attributes.position,out=[];for(let i=0;i<a.count;i++){const p=new THREE.Vector3();if(posed)mesh.getVertexPosition(i,p);else p.fromBufferAttribute(a,i);out.push(p.applyMatrix4(mesh.matrixWorld));}return out;}
function weldAudit(mesh){
 const g=mesh.geometry,p=g.attributes.position,lookup=new Map(),ids=[],points=[];let collapsed=0;const edges=new Map();
 for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i),key=[v.x,v.y,v.z].map(n=>Math.round(n/1e-6)).join(',');if(!lookup.has(key)){lookup.set(key,points.length);points.push(v);}ids.push(lookup.get(key));}
 const indices=g.index?.array||Array.from({length:p.count},(_,i)=>i);
 for(let i=0;i<indices.length;i+=3){const t=[ids[indices[i]],ids[indices[i+1]],ids[indices[i+2]]];if(new Set(t).size<3||new THREE.Vector3().subVectors(points[t[1]],points[t[0]]).cross(new THREE.Vector3().subVectors(points[t[2]],points[t[0]])).lengthSq()<1e-20){collapsed++;continue;}for(let j=0;j<3;j++){const a=t[j],b=t[(j+1)%3],k=a<b?`${a},${b}`:`${b},${a}`;edges.set(k,(edges.get(k)||0)+1);}}
 return{method:'Raw bind geometry position-weld at 1e-6, omit collapsed triangles; no T-junction splitting or self-intersection test',weldedPositions:points.length,collapsedTriangles:collapsed,boundaryEdges:[...edges.values()].filter(n=>n===1).length,nonmanifoldEdges:[...edges.values()].filter(n=>n>2).length};
}
const meshList=[];rig.root.traverse(o=>{if(o.isMesh)meshList.push(o);});
const all=[],meshes=[];
for(const mesh of meshList){
 const g=mesh.geometry,p=g.attributes.position,world=pointsOf(mesh),uv=g.attributes.uv,values=uv?[...uv.array]:[];all.push(...world);
 const materials=(Array.isArray(mesh.material)?mesh.material:[mesh.material]).map(m=>({name:m.name,type:m.type,map:m.map?.name||null,side:m.side,colorSRGB:m.color?.getHexString()||null,colorLinear:m.color?.toArray()||null,toneMapped:m.toneMapped,transparent:m.transparent,alphaTest:m.alphaTest,depthWrite:m.depthWrite,vertexColors:m.vertexColors,opacity:m.opacity}));
 const volume=mesh.userData.volumeStudy?{...mesh.userData.volumeStudy}:null;if(volume)delete volume.sectionRings;
 const record={name:mesh.name,type:mesh.type,parent:mesh.parent?.name,vertices:p.count,triangles:(g.index?.count||p.count)/3,visible:mesh.visible,posedWorldBounds:bounds(world),localRawBounds:bounds(Array.from({length:p.count},(_,i)=>new THREE.Vector3().fromBufferAttribute(p,i))),matrixWorld:mesh.matrixWorld.toArray(),materials,groups:g.groups,positionSHA256:sha(Buffer.from(p.array.buffer,p.array.byteOffset,p.array.byteLength)),uvSHA256:uv?sha(Buffer.from(uv.array.buffer,uv.array.byteOffset,uv.array.byteLength)):null,uvBounds:uv?{min:[Infinity,Infinity],max:[-Infinity,-Infinity]}:null,volumeStudy:volume,structure:mesh.userData.structure||null};
 if(uv)for(let i=0;i<uv.count;i++)for(let c=0;c<2;c++){const x=c===0?uv.getX(i):uv.getY(i);record.uvBounds.min[c]=Math.min(record.uvBounds.min[c],x);record.uvBounds.max[c]=Math.max(record.uvBounds.max[c],x);}
 if(mesh.isSkinnedMesh){record.skin={bones:mesh.skeleton.bones.map(b=>b.name),bindMatrix:mesh.bindMatrix.toArray(),bindMatrixInverse:mesh.bindMatrixInverse.toArray()};record.bindTopologyAudit=weldAudit(mesh);}
 meshes.push(record);
}
const skeleton=meshList.find(m=>m.isSkinnedMesh).skeleton;
const bones=skeleton.bones.map((b,i)=>({index:i,name:b.name,parentIndex:skeleton.bones.indexOf(b.parent),localPositionAtCanonical:vec(b.position),localQuaternionAtCanonical:b.quaternion.toArray(),bindWorld:skeleton.boneInverses[i].clone().invert().toArray(),canonicalWorld:b.matrixWorld.toArray()}));
function localPoint(x,y,offset=0){const local=new THREE.Vector3(x,y,faceModule.faceSurfaceZ(x,y)+offset);return{headLocal:vec(local),canonicalWorld:vec(local.clone().applyMatrix4(rig.head.matrixWorld))};}
const face=rig.metadata.face,landmarks={chin:localPoint(...face.chin),crown:localPoint(...face.crown),mouth:{sourcePixel:[852,741],...localPoint(...faceModule.sourceToFace(852,741))},eyes:[]};
for(const eye of faceModule.FACE_SOURCE.eyes)landmarks.eyes.push({name:eye.name,apertureSourcePixel:eye.aperture,irisSourcePixel:eye.iris,aperture:localPoint(...faceModule.sourceToFace(...eye.aperture)),iris:localPoint(...faceModule.sourceToFace(...eye.iris),.0048),sourceIrisRadiusPixels:eye.irisRadius,irisRadiusLocal:eye.irisRadius.map(r=>r/775)});
const faceSource=await fs.readFile(path.join(baseline,'source/face.js'),'utf8'),bodySource=await fs.readFile(path.join(baseline,'source/body-full.js'),'utf8');
function numericArray(source,name){const match=source.match(new RegExp(`const ${name}=(\\[[\\s\\S]*?\\]);`));return match?JSON.parse(match[1].replace(/,\s*]/g,']')):null;}
landmarks.visibleFacePaintSourceContour=numericArray(faceSource,'visibleSkinPixels');
landmarks.bodySourceContours={torsoRows:numericArray(bodySource,'torsoAnchors'),skirt:numericArray(bodySource,'skirtContour'),leftSleeveRows:numericArray(bodySource,'leftSleeve'),leftHand:numericArray(bodySource,'leftHand'),leftShoe:numericArray(bodySource,'leftShoe')};
const canonicalHead=rig.head.matrixWorld.toArray(),canonicalPose=JSON.parse(JSON.stringify(rig.root.userData.appliedPose));
rig.update(0,0,{...canonical,mode:'idle'});rig.root.updateMatrixWorld(true);const initial4348={headMatrixWorld:rig.head.matrixWorld.toArray(),appliedPose:rig.root.userData.appliedPose,grounding:rig.getGrounding(),bounds:bounds(meshList.flatMap(m=>pointsOf(m)))};
const samples={};
for(const degrees of[-90,-25,0,25,90]){rig.update(0,0,{...canonical,yaw:THREE.MathUtils.degToRad(degrees)});rig.root.updateMatrixWorld(true);samples[degrees]={requestedYawDegrees:degrees,appliedHeadYawDegrees:THREE.MathUtils.radToDeg(rig.root.userData.appliedPose.yaw),headMatrixWorld:rig.head.matrixWorld.toArray(),actualPosedBounds:bounds(meshList.flatMap(m=>pointsOf(m)))};}
const camera={authoritativeSource:'source/character-entry.js, not source/app.js',projection:'orthographic',position:[.195,.565,6],target:[.195,.565,0],up:[0,1,0],near:.01,far:30,halfY:'max(3.42/2,2.82/(2*(width/height)))*1.035',halfX:'halfY*(width/height)',pixelMapping:{x:'width/2 + (worldX-.195)*height/(2*halfY)',y:'height/2 - (worldY-.565)*height/(2*halfY)'},aspectSwitch:2.82/3.42,minHalfY:3.42/2*1.035,pixelRatioCap:1.5,outputColorSpace:'SRGBColorSpace',toneMapping:'NoToneMapping',clearColor:[0,0,0,0],rootTransform:'identity; no replacement normalization/scaling'};
for(const [file,hash]of Object.entries(before))if(sha(await fs.readFile(path.join(baseline,file)))!==hash)throw new Error('Frozen source changed during measurement');
const report={schema:'dafeiyu.appearance-measurements.4348.v1',baselineURL:manifest.chosenURL,baselineFilesUnchanged:before,threeRevision:THREE.REVISION,measurement:'Snapshot module graph instantiated in Node; metadata-only textures, no pixel render, no browser and no new model/art asset.',coordinates:{up:'+Y',front:'+Z',right:'+X',scale:'Uncalibrated local study units; do not silently reinterpret as physical metres.'},camera,canonicalInput:canonical,canonicalAppliedPose:canonicalPose,canonicalHeadMatrixWorld:canonicalHead,canonicalBounds:bounds(all),initial4348IdleAtTime0:initial4348,headYawSamples:samples,faceMetadata:face,faceLandmarks:landmarks,bones,meshCount:meshes.length,vertexCount:meshes.reduce((n,m)=>n+m.vertices,0),triangleCount:meshes.reduce((n,m)=>n+m.triangles,0),meshes,groundingAtCanonical:'Real sole references/two-bone constant-length IK, but no complete travel/contact solver. Constructor neutral is already lowered by .012; inverseBind matrices retain actual original bind.',relatedHairAudit:'metadata/appearance-hair-contract-20261027.json'};
const output=path.join(project,'metadata/appearance-measurements-4348-20261027.json');await fs.writeFile(output,JSON.stringify(report,null,2));rig.dispose();console.log(JSON.stringify({output,meshes:meshes.length,bounds:report.canonicalBounds,landmarks:landmarks.eyes,camera,sourceHashesUnchanged:true},null,2));
