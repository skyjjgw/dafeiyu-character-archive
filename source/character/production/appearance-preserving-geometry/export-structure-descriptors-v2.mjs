import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const directory=path.dirname(fileURLToPath(import.meta.url)),assets=path.join(directory,'assets');
const bytes=fs.readFileSync(path.join(assets,'structure-candidate-v2.glb'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const jsonLength=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+jsonLength).toString()),bin=bytes.subarray(20+jsonLength+8);
const map=JSON.parse(fs.readFileSync(path.join(assets,'head-structure-map-v2.json'),'utf8'));
const roles={static:0,'static-edge-split':0,support:20,socket:21,'socket-pole':22,'oral-wall':23,'oral-cap':24};
const anchorIds=new Map(),anchors=[];function anchorID(p){const key=p.join(',');if(!anchorIds.has(key)){anchorIds.set(key,anchors.length);anchors.push(p);}return anchorIds.get(key);}
const canonicalRoles=[],canonicalParams=[];
function readAccessor(id){const a=gltf.accessors[id],view=gltf.bufferViews[a.bufferView],size={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type],constructor={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType],offset=bin.byteOffset+(view.byteOffset||0)+(a.byteOffset||0);return new constructor(bin.buffer,offset,a.count*size);}
const mesh=gltf.meshes.find(m=>m.name===map.physicalMesh),position=readAccessor(mesh.primitives[0].attributes.POSITION);
for(let i=0;i<map.vertexParams.length;i++){
 const p=map.vertexParams[i],role=roles[p.role];if(role===undefined)throw Error('Unknown new vertex role '+p.role);canonicalRoles.push(role);
 if(role===0)canonicalParams.push(position[i*3],position[i*3+1],position[i*3+2],0);
 else if(role===20)canonicalParams.push(p.hole,p.theta,p.k,anchorID(p.anchor));
 else if(role===21||role===23)canonicalParams.push(p.hole,p.theta,p.depthT,0);
 else if(role===22)canonicalParams.push(p.hole,0,0,0);
 else canonicalParams.push(p.hole,p.theta,p.k,0);
}
const primitiveMappings=mesh.primitives.map((p,i)=>({surfaceIndex:i,material:gltf.materials[p.material].name,sourcePositionAccessor:p.attributes.POSITION,sourceColorAccessor:p.attributes.COLOR_0,sourceNormalAccessor:p.attributes.NORMAL,sourceIndexAccessor:p.indices,sourceAccessorVertexCount:position.length/3,usedSourceVertexIDs:[...new Set(readAccessor(p.indices))],importerPolicy:'Do not assume Godot retains accessor ordering. Match the actual imported POSITION/NORMAL/CUSTOM0 source tuple and emit surface vertex -> canonical source accessor vertex ID; reject ambiguous or changed geometry.'}));
const out={schema:'dafeiyu.continuous-head.canonical-descriptors.v2',sourceGLBSha256:sha(bytes),sourceMapSha256:sha(fs.readFileSync(path.join(assets,'head-structure-map-v2.json'))),coordinateSystem:'Source Head local X right Y up +Z front; source Head transform applied once',meshName:map.physicalMesh,sourceAccessorVertexCount:canonicalRoles.length,canonicalRoles,canonicalParams,roles:{0:'static',20:'support [hole,theta,radialK,anchorIndex]',21:'socket [hole,theta,depthT,0]',22:'socket-pole [hole,0,0,0]',23:'oral-wall [hole,theta,depthT,0]',24:'oral-cap [hole,theta,radialK,0]'},depthPolicy:map.depthPolicy,deformationConfig:{...map.deformationConfig,supportAnchors:anchors},primitiveMappings,retainedOriginal:{authority:'appearance-preserving-face/fixtures/source-samples.json',meshNames:map.retainedVisibleMeshes,policy:'Original XY/UV/RGBA source equations. Each original facial vertex receives frontZ_v2(x,y)-frontZ_source(x,y); then tongue Z offset -0.041 inside the oral pouch. Source RGBA/UV/XY and visibility stay unchanged. v2 frontZ uses the same sampled source section fields with depthPolicy.parameters; never feed old source-default C++ output without this Z policy.'},ocularVolumes:map.globes.map(g=>({meshName:g.mesh,static:true,sourceFrontMap:g.sourceMap,sourceMesh:g.frontSourceMesh,policy:'Always physically present. The source iris changes XY/UV as before, and opaque deforming lids occlude this fixed volume. Not a claim of physiological ocular rotation.'})),renderContract:'Keep source materials, raw UV and float linear colors. New head has four glTF primitives; it is one conforming canonical manifold, shared source vertices must evaluate identically on both sides of a material boundary.',acceptance:'Pending actual GPU front/side visual QA. No implicit runtime replacement.'};
fs.writeFileSync(path.join(assets,'structure-canonical-descriptors-v2.json'),JSON.stringify(out)+'\n');console.log(JSON.stringify({vertices:canonicalRoles.length,dynamicVertices:canonicalRoles.filter(x=>x!==0).length,anchors:anchors.length,surfaces:primitiveMappings.length,glbSha256:out.sourceGLBSha256}));
