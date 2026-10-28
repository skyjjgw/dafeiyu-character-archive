import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';

const directory=path.dirname(fileURLToPath(import.meta.url));
const project=path.resolve(directory,'../../..');
const baseline=path.join(project,'production/appearance-baseline-20261027');
const source=path.join(baseline,'source');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const threeURL=pathToFileURL(path.join(project,'production/rig3d-prototype/vendor/three.module.js')).href;
const THREE=await import(threeURL),moduleCache=new Map(),sourceHashes={};
function moduleURL(name){
  if(moduleCache.has(name))return moduleCache.get(name);
  const sourceFile=name==='body-full.js'?path.join(directory,name):path.join(source,name);const bytes=fs.readFileSync(sourceFile);sourceHashes[name]=sha(bytes);
  const js=bytes.toString('utf8').replace(/from\s+(['"])([^'"]+)\1/g,(_,q,s)=>'from '+JSON.stringify(s.includes('three.module.js')?threeURL:moduleURL(path.basename(s))));
  const url='data:text/javascript;base64,'+Buffer.from(js).toString('base64');moduleCache.set(name,url);return url;
}
const {createStudyCharacter}=await import(moduleURL('character.js'));
const imageDefinitions=[['BV1g2JX6HEHX.jpg','source-cover.jpg','image/jpeg'],['neutral-front.png','source-garment.png','image/png'],['turnaround-auxiliary-v2.png','source-turnaround.png','image/png']];
const textures=imageDefinitions.map((d,i)=>{const t=new THREE.Texture();t.name=d[1];t.colorSpace=THREE.SRGBColorSpace;return t;});
const character=createStudyCharacter(textures[0],{garmentTexture:textures[1],turnaroundTexture:textures[2]});
character.update(0,0,{mode:'manual',framing:'full',yaw:0,pitch:0,mood:'neutral',blink:0,talk:0,gazeX:0,gazeY:0});
character.root.updateMatrixWorld(true);

const gltf={asset:{version:'2.0',generator:'Frozen-source direct geometry transfer; no character reconstruction'},extensionsUsed:['KHR_materials_unlit','KHR_texture_transform'],scene:0,scenes:[{nodes:[0]}],nodes:[],meshes:[],materials:[],skins:[],accessors:[],bufferViews:[],buffers:[],images:[],textures:[],samplers:[{magFilter:9729,minFilter:9987,wrapS:33071,wrapT:33071}]};
const chunks=[],objects=[],nodeIds=new Map(),materialIds=new Map(),skeletonIds=new Map(),renderMaterials=[],meshAudit=[];let byteLength=0;
function append(bytes,target){
  const buffer=Buffer.from(bytes);const padding=(4-byteLength%4)%4;if(padding){chunks.push(Buffer.alloc(padding));byteLength+=padding;}
  const index=gltf.bufferViews.length;gltf.bufferViews.push({buffer:0,byteOffset:byteLength,byteLength:buffer.length,...(target?{target}:{})});chunks.push(buffer);byteLength+=buffer.length;return index;
}
function accessor(array,itemSize,{target=34962,minMax=false}={}){
  const types=new Map([[Float32Array,5126],[Uint32Array,5125],[Uint16Array,5123],[Uint8Array,5121]]);const componentType=types.get(array.constructor);if(!componentType)throw Error('Unsupported exact attribute type '+array.constructor.name);
  const a={bufferView:append(Buffer.from(array.buffer,array.byteOffset,array.byteLength),target),componentType,count:array.length/itemSize,type:({1:'SCALAR',2:'VEC2',3:'VEC3',4:'VEC4',16:'MAT4'})[itemSize]};
  if(minMax){a.min=Array(itemSize).fill(Infinity);a.max=Array(itemSize).fill(-Infinity);for(let i=0;i<array.length;i++){const j=i%itemSize;a.min[j]=Math.min(a.min[j],array[i]);a.max[j]=Math.max(a.max[j],array[i]);}}
  gltf.accessors.push(a);return gltf.accessors.length-1;
}
for(const [index,[name,copyName,mimeType]]of imageDefinitions.entries()){
  const bytes=fs.readFileSync(path.join(baseline,'assets',name));
  gltf.images.push({name:copyName,mimeType,bufferView:append(bytes)});gltf.textures.push({source:index,sampler:0});
  fs.mkdirSync(path.join(directory,'assets'),{recursive:true});fs.writeFileSync(path.join(directory,'assets',copyName),bytes);
}
function materialId(material){
  if(materialIds.has(material))return materialIds.get(material);
  const index=gltf.materials.length,name='SOURCE_'+String(index).padStart(3,'0');materialIds.set(material,index);
  const image=material.map?textures.indexOf(material.map):-1;
  const factor=[material.color.r,material.color.g,material.color.b,material.opacity];
  const pbr={baseColorFactor:factor,metallicFactor:0,roughnessFactor:1};
  if(image>=0)pbr.baseColorTexture={index:image,extensions:{KHR_texture_transform:{offset:[0,1],scale:[1,-1]}}};
  const flags={name,sourceName:material.name,type:material.type,baseLinear:factor,image,vertexColors:Boolean(material.vertexColors),transparent:material.transparent,alphaTest:material.alphaTest,depthWrite:material.depthWrite,depthTest:material.depthTest,side:material.side,toneMapped:material.toneMapped};
  renderMaterials.push(flags);
  gltf.materials.push({name,pbrMetallicRoughness:pbr,doubleSided:material.side===THREE.DoubleSide,alphaMode:material.transparent?'BLEND':material.alphaTest>0?'MASK':'OPAQUE',...(material.alphaTest>0&&!material.transparent?{alphaCutoff:material.alphaTest}:{}),...(material.isMeshBasicMaterial?{extensions:{KHR_materials_unlit:{}}}:{}),extras:{sourceRendering:flags}});
  return index;
}
character.root.traverse(object=>{nodeIds.set(object,objects.length);objects.push(object);});
for(const object of objects){
  const node={name:object.name||object.type,translation:object.position.toArray(),rotation:object.quaternion.toArray(),scale:object.scale.toArray()};
  const children=object.children.map(o=>nodeIds.get(o));if(children.length)node.children=children;
  gltf.nodes.push(node);
}
const semantics={position:'POSITION',normal:'NORMAL',uv:'TEXCOORD_0',uv1:'TEXCOORD_1',color:'COLOR_0',skinIndex:'JOINTS_0',skinWeight:'WEIGHTS_0'};
for(const object of objects){
  if(!object.isMesh)continue;
  const geometry=object.geometry,attributes={},attributeEvidence={};
  for(const [key,value]of Object.entries(geometry.attributes)){
    if(!semantics[key])throw Error('Unpreserved geometry attribute '+key);
    attributes[semantics[key]]=accessor(value.array,value.itemSize,{minMax:key==='position'});
    attributeEvidence[semantics[key]]={accessor:attributes[semantics[key]],componentCount:value.array.length,sha256:sha(Buffer.from(value.array.buffer,value.array.byteOffset,value.array.byteLength))};
  }
  const sourceIndex=geometry.index?.array||Uint32Array.from({length:geometry.attributes.position.count},(_,i)=>i);
  const materials=Array.isArray(object.material)?object.material:[object.material];
  const groups=geometry.groups.length?geometry.groups:[{start:0,count:sourceIndex.length,materialIndex:0}];
  const primitives=[];
  for(const group of groups){if(!group.count)continue;const indices=sourceIndex.slice(group.start,group.start+group.count);primitives.push({attributes,indices:accessor(indices,1,{target:34963}),material:materialId(materials[group.materialIndex]),mode:4});}
  const meshIndex=gltf.meshes.length;gltf.meshes.push({name:object.name,primitives});gltf.nodes[nodeIds.get(object)].mesh=meshIndex;
  if(object.isSkinnedMesh){
    if(!skeletonIds.has(object.skeleton)){
      const skeleton=object.skeleton,ibm=new Float32Array(skeleton.bones.length*16);
      skeleton.boneInverses.forEach((inverse,i)=>ibm.set(inverse.clone().multiply(object.bindMatrix).toArray(),i*16));
      const skinIndex=gltf.skins.length;skeletonIds.set(skeleton,skinIndex);
      gltf.skins.push({name:'original-body-22-bone-skin',joints:skeleton.bones.map(b=>nodeIds.get(b)),inverseBindMatrices:accessor(ibm,16,{target:null}),skeleton:nodeIds.get(skeleton.bones[0])});
    }
    gltf.nodes[nodeIds.get(object)].skin=skeletonIds.get(object.skeleton);
  }
  meshAudit.push({name:object.name,node:nodeIds.get(object),mesh:meshIndex,vertices:geometry.attributes.position.count,triangles:sourceIndex.length/3,primitives:primitives.length,skinned:Boolean(object.isSkinnedMesh),attributes:attributeEvidence,matrixWorld:object.matrixWorld.toArray(),materialIndices:primitives.map(p=>p.material)});
}
gltf.buffers=[{byteLength}];
const rawBin=Buffer.concat(chunks),binPadding=(4-rawBin.length%4)%4,bin=Buffer.concat([rawBin,Buffer.alloc(binPadding)]);
const rawJSON=Buffer.from(JSON.stringify(gltf)),json=Buffer.concat([rawJSON,Buffer.alloc((4-rawJSON.length%4)%4,32)]);
const header=Buffer.alloc(12),jsonHeader=Buffer.alloc(8),binHeader=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+json.length+8+bin.length,8);jsonHeader.writeUInt32LE(json.length);jsonHeader.writeUInt32LE(0x4e4f534a,4);binHeader.writeUInt32LE(bin.length);binHeader.writeUInt32LE(0x004e4942,4);
const glb=Buffer.concat([header,jsonHeader,json,binHeader,bin]);
// Independently inspect the written accessors, not just the source arrays used above.
let comparedComponents=0;for(const mesh of meshAudit)for(const [semantic,evidence]of Object.entries(mesh.attributes)){
  const a=gltf.accessors[evidence.accessor],view=gltf.bufferViews[a.bufferView],bytes=rawBin.subarray(view.byteOffset,view.byteOffset+view.byteLength);if(sha(bytes)!==evidence.sha256)throw Error(mesh.name+' '+semantic+' changed during export');comparedComponents+=evidence.componentCount;
}
for(const [name,h]of Object.entries(sourceHashes))if(sha(fs.readFileSync(name==='body-full.js'?path.join(directory,name):path.join(source,name)))!==h)throw Error('Frozen source changed during export');
const counts={meshes:meshAudit.length,vertices:meshAudit.reduce((n,m)=>n+m.vertices,0),triangles:meshAudit.reduce((n,m)=>n+m.triangles,0),skinnedMeshes:meshAudit.filter(m=>m.skinned).length,bodyBones:gltf.skins[0].joints.length,headControlBones:1,materials:renderMaterials.length,images:3};
const report={schema:'dafeiyu.appearance-preserving-transfer.v1',source:'appearance-baseline-20261027 with candidate shoe only',sourceHashes,pose:{time:0,delta:0,mode:'manual',framing:'full',yaw:0,pitch:0,mood:'neutral',blink:0,talk:0,gazeX:0,gazeY:0},counts,glbSha256:sha(glb),glbBytes:glb.length,accessorEvidence:{comparedComponents,allPositionUVNormalColorJointWeightBytesIdentical:true},uvContract:{sourceAccessors:'unchanged (px/W, 1-py/H)',embeddedImageBytes:'unchanged',gltfSampling:'KHR_texture_transform offset(0,1), scale(1,-1)',runtimeSampling:'custom source shader applies V flip once to unchanged imported UV; does not reuse StandardMaterial texture transform'},camera:{resolution:[640,704],position:[.195,.565,6],target:[.195,.565,0],projection:'orthographic',halfY:Math.max(3.42/2,2.82/(2*(640/704)))*1.035},materials:renderMaterials,images:imageDefinitions.map(([name,copyName,mimeType])=>({name:copyName,mimeType,sha256:sha(fs.readFileSync(path.join(baseline,'assets',name)))})),meshes:meshAudit,bones:gltf.skins[0].joints.map((n,i)=>({jointIndex:i,node:n,name:gltf.nodes[n].name,parentNode:objects[n].parent?nodeIds.get(objects[n].parent):null})),limitations:['Static transfer only; dynamic UV, eyelid alpha and animation controllers are not exported as working actions.','Source thin/overlap topology and inferred side/back surfaces are retained, not certified as complete anatomy.','glTF alone cannot encode Three toon shading or simultaneous blend+alpha-test+depthWrite. Custom runtime source shader retains these flags; actual GPU comparison remains required.']};
fs.writeFileSync(path.join(directory,'assets/selected-appearance.glb'),glb);
fs.writeFileSync(path.join(directory,'assets/source-rendering.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({counts,glbBytes:glb.length,glbSha256:report.glbSha256,comparedComponents,sourceUnchanged:true},null,2));
character.dispose();textures.forEach(t=>t.dispose());
