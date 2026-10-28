import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const report=JSON.parse(fs.readFileSync(path.join(root,'assets/source-rendering.json')));
const file=fs.readFileSync(path.join(root,'assets/selected-appearance.glb'));
if(file.readUInt32LE(0)!==0x46546c67||file.readUInt32LE(4)!==2||file.readUInt32LE(8)!==file.length)throw Error('Invalid GLB header');
const jsonLength=file.readUInt32LE(12),gltf=JSON.parse(file.subarray(20,20+jsonLength).toString());
const binOffset=20+jsonLength+8,bin=file.subarray(binOffset);
if(sha(file)!==report.glbSha256)throw Error('GLB/report SHA mismatch');
let attributes=0,components=0,bytes=0;
for(const mesh of report.meshes)for(const [semantic,expected]of Object.entries(mesh.attributes)){
  const accessor=gltf.accessors[expected.accessor],view=gltf.bufferViews[accessor.bufferView];
  const data=bin.subarray((view.byteOffset||0)+(accessor.byteOffset||0),(view.byteOffset||0)+(accessor.byteOffset||0)+view.byteLength);
  if(sha(data)!==expected.sha256)throw Error(mesh.name+' '+semantic+' differs');
  attributes++;components+=expected.componentCount;bytes+=data.length;
}
for(let i=0;i<gltf.images.length;i++){
  const view=gltf.bufferViews[gltf.images[i].bufferView],raw=bin.subarray(view.byteOffset,view.byteOffset+view.byteLength);
  if(sha(raw)!==report.images[i].sha256)throw Error('Embedded image bytes differ: '+i);
  if(sha(fs.readFileSync(path.join(root,'assets',report.images[i].name)))!==report.images[i].sha256)throw Error('Runtime source image bytes differ: '+i);
}
for(const material of gltf.materials){
  const original=material.extras.sourceRendering;
  if(original.type==='MeshBasicMaterial'&&!material.extensions?.KHR_materials_unlit)throw Error('Missing unlit extension');
  if(original.image>=0){const t=material.pbrMetallicRoughness.baseColorTexture.extensions.KHR_texture_transform;if(JSON.stringify(t)!==JSON.stringify({offset:[0,1],scale:[1,-1]}))throw Error('Unexpected UV sampling transform');}
}
for(const [name,hash]of Object.entries(report.sourceHashes))if(sha(fs.readFileSync(path.resolve(root,'../appearance-baseline-20261027/source',name)))!==hash)throw Error('Frozen source changed: '+name);
const result={ok:true,verification:'Fresh file parse, independent of writer buffer construction',glbSha256:sha(file),meshes:gltf.meshes.length,bodySkins:gltf.nodes.filter(n=>n.skin!==undefined).length,joints:gltf.skins[0].joints.length,headControl:gltf.nodes.filter(n=>n.name==='head-control').length,images:gltf.images.length,materials:gltf.materials.length,exactAttributes:attributes,exactComponents:components,exactBytes:bytes,sourceUnchanged:true,scope:'Static source mesh/UV/COLOR/skin attribute and image transfer, not an animation or physics pass'};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});fs.writeFileSync(path.join(root,'reports/exact-transfer-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
