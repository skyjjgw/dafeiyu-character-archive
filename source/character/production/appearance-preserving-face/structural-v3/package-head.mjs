import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),geometry=path.resolve(root,'../../appearance-preserving-geometry/assets'),out=path.join(root,'component');
fs.mkdirSync(path.join(out,'bin'),{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const source=fs.readFileSync(path.join(geometry,'structure-candidate-v3.glb'));
if(sha(source)!=='08669c36b9e217a8f242c08a0fb573ec4c399900d8a1b68ae375ac53a44f3fae')throw Error('Reviewed head v3 asset changed');
const jsonLength=source.readUInt32LE(12),gltf=JSON.parse(source.subarray(20,20+jsonLength).toString()),sourceBin=source.subarray(28+jsonLength);
const faceId=gltf.nodes.findIndex(n=>n.name==='painted-face');if(faceId<0)throw Error('Original face root not found');
const nodeIDs=[];function visit(i){nodeIDs.push(i);for(const j of gltf.nodes[i].children||[])visit(j);}visit(faceId);
const nodeMap=new Map(nodeIDs.map((id,i)=>[id,i])),meshIDs=[...new Set(nodeIDs.filter(id=>gltf.nodes[id].mesh!==undefined).map(id=>gltf.nodes[id].mesh))],meshMap=new Map(meshIDs.map((id,i)=>[id,i]));
const meshData=meshIDs.map(i=>structuredClone(gltf.meshes[i]));
const accessorIDs=new Set(),viewIDs=new Set();
for(const m of meshData)for(const p of m.primitives){for(const id of Object.values(p.attributes))accessorIDs.add(id);accessorIDs.add(p.indices);}
for(const id of accessorIDs){if(gltf.accessors[id].sparse)throw Error('Sparse accessor not supported by exact component packing');viewIDs.add(gltf.accessors[id].bufferView);}
for(const image of gltf.images)viewIDs.add(image.bufferView);
const chunks=[],views=[],accessors=[],viewMap=new Map(),accessorMap=new Map();let offset=0;
function append(bytes,target){const padding=(4-offset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));offset+=padding;}const index=views.length;views.push({buffer:0,byteOffset:offset,byteLength:bytes.length,...(target?{target}:{})});chunks.push(Buffer.from(bytes));offset+=bytes.length;return index;}
for(const id of viewIDs){const v=gltf.bufferViews[id],i=append(sourceBin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength),v.target);if(v.byteStride)views[i].byteStride=v.byteStride;viewMap.set(id,i);}
for(const id of accessorIDs){const a=structuredClone(gltf.accessors[id]);a.bufferView=viewMap.get(a.bufferView);accessorMap.set(id,accessors.length);accessors.push(a);}
const canonicalTags=new Map();
for(const mesh of meshData)for(const p of mesh.primitives){
 const sourcePosition=p.attributes.POSITION,count=gltf.accessors[sourcePosition].count;
 if(!canonicalTags.has(sourcePosition)){const data=new Float32Array(count*2);for(let i=0;i<count;i++)data[i*2]=i;const accessor=accessors.length;accessors.push({bufferView:append(Buffer.from(data.buffer),34962),componentType:5126,count,type:'VEC2'});canonicalTags.set(sourcePosition,accessor);}
 for(const key of Object.keys(p.attributes))p.attributes[key]=accessorMap.get(p.attributes[key]);
 p.attributes.TEXCOORD_1=canonicalTags.get(sourcePosition);p.indices=accessorMap.get(p.indices);
}
const nodes=nodeIDs.map(id=>{const n=structuredClone(gltf.nodes[id]);if(n.skin!==undefined)throw Error('Face component unexpectedly contains body skin');if(n.children)n.children=n.children.map(i=>nodeMap.get(i));if(n.mesh!==undefined)n.mesh=meshMap.get(n.mesh);return n;});
gltf.nodes=nodes;gltf.meshes=meshData;gltf.skins=[];gltf.scenes=[{name:'Selected Head Local continuous structure',nodes:[0]}];gltf.scene=0;gltf.accessors=accessors;gltf.bufferViews=views;gltf.buffers=[{byteLength:offset}];
for(const image of gltf.images)image.bufferView=viewMap.get(image.bufferView);
gltf.asset.generator='Reviewed selected-head-v3 component; source images and UV0 unchanged; UV1 carries exact source vertex ID during setup only';
const rawJson=Buffer.from(JSON.stringify(gltf)),json=Buffer.concat([rawJson,Buffer.alloc((4-rawJson.length%4)%4,32)]),rawBin=Buffer.concat(chunks),bin=Buffer.concat([rawBin,Buffer.alloc((4-rawBin.length%4)%4)]),header=Buffer.alloc(20),binHeader=Buffer.alloc(8);
header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(20+json.length+8+bin.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);binHeader.writeUInt32LE(bin.length,0);binHeader.writeUInt32LE(0x004e4942,4);
const glb=Buffer.concat([header,json,binHeader,bin]);fs.writeFileSync(path.join(out,'head-local.glb'),glb);
const samples=JSON.parse(fs.readFileSync(path.join(root,'fixtures/samples.json'))),allData=fs.readFileSync(path.join(root,'fixtures/data.bin'));
let descriptorEnd=0;for(const descriptor of samples.descriptors)for(const key of ['canonicalRoles','canonicalParams','neutralPositions','neutralUV','neutralRGBA'])if(descriptor[key])descriptorEnd=Math.max(descriptorEnd,descriptor[key].offset+descriptor[key].length);
const data=allData.subarray(0,descriptorEnd);fs.writeFileSync(path.join(out,'canonical.bin'),data);fs.writeFileSync(path.join(out,'descriptors.json'),JSON.stringify({schema:'dafeiyu.continuous-head-v3.runtime-descriptors.v1',dataSha256:sha(data),meshes:samples.descriptors})+'\n');
for(const name of ['source-equations.json','structure.json'])fs.copyFileSync(path.join(root,'fixtures',name),path.join(out,name));
const rendering=JSON.parse(fs.readFileSync(path.join(geometry,'structure-candidate-rendering-v3.json')));rendering.glbSha256=sha(glb);rendering.scope='Only the selected face subtree, Head-local, with consumed canonical source IDs in UV1. No body/hair replacement.';fs.writeFileSync(path.join(out,'rendering.json'),JSON.stringify(rendering)+'\n');
for(const name of ['face_adapter.gd','factory.gd'])if(fs.existsSync(path.join(root,name)))fs.copyFileSync(path.join(root,name),path.join(out,name));
const dll='selected_structural_face_kernel.windows.release.x86_64.dll';fs.copyFileSync(path.join(root,'godot/bin',dll),path.join(out,'bin',dll));
fs.writeFileSync(path.join(out,'selected_structural_face_kernel.gdextension'),'[configuration]\nentry_symbol="selected_structural_face_library_init"\ncompatibility_minimum="4.7"\nreloadable=false\n[libraries]\nwindows.x86_64="./bin/'+dll+'"\n');
const files=[];for(const name of ['head-local.glb','canonical.bin','descriptors.json','source-equations.json','structure.json','rendering.json','face_adapter.gd','factory.gd','selected_structural_face_kernel.gdextension','bin/'+dll])if(fs.existsSync(path.join(out,name))){const b=fs.readFileSync(path.join(out,name));files.push({path:name,bytes:b.length,sha256:sha(b)});}
const contract={schema:'dafeiyu.continuous-head-v3.component.v1',id:'continuous-head-v3',version:'0.1.0-development',coordinateSystem:'Original Head local +Y up +Z front; attach once to original Head node. Source face root transform retained.',replacesSourceGroupName:'painted-face',sourceReviewedGLBSha256:sha(source),glbSha256:sha(glb),canonicalMapping:'UV1.x is an exact source vertex ID per original mesh accessor. Validate on real imported ArrayMesh; consume once to construct canonical per-surface descriptors. Remove diagnostic UV1 from dynamic buffers; UV0/raw image bytes remain unchanged.',kernelClass:'SelectedStructuralFaceKernel',sourceDefaultLibraryUntouched:true,files,finalQualityPassed:false,nativeVisualPassed:false,scope:'Continuous head skin, fixed closed eye volumes, sockets and oral lining; selected cosmetic drawing and original expression equations retained. Does not solve original hair/body side views or physiological eye rotation.'};
contract.headLocal=true;
fs.writeFileSync(path.join(out,'contract.json'),JSON.stringify(contract,null,2)+'\n');
console.log(JSON.stringify({component:out,meshes:meshData.length,nodes:nodes.length,glbBytes:glb.length,canonicalBytes:data.length,files:files.length,glbSha256:sha(glb)}));
