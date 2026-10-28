import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const own=path.dirname(fileURLToPath(import.meta.url));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const source=JSON.parse(fs.readFileSync(path.join(own,'fixtures/source-samples.json')));
const kernelReport=JSON.parse(fs.readFileSync(path.join(own,'reports/native-source-parity.json')));
const gpuReport=JSON.parse(fs.readFileSync(path.join(own,'reports/buffer-source-parity-gpu.json')));
if(!kernelReport.passed||!gpuReport.passed||!gpuReport.readback_supported)throw Error('Actual engine parity must pass before packaging');
const directory=path.join(own,'package/face-kernel');
fs.mkdirSync(path.join(directory,'bin'),{recursive:true});
const files=[];
function write(name,bytes){const target=path.join(directory,name);fs.writeFileSync(target,bytes);files.push({path:name,bytes:bytes.length,sha256:sha(bytes)});}
function copy(name,relative){write(name,fs.readFileSync(path.join(own,relative)));}
copy('face_adapter.gd','godot/face_adapter.gd');
copy('bin/selected_face_kernel.windows.release.x86_64.dll','godot/bin/selected_face_kernel.windows.release.x86_64.dll');
copy('source-equations.json','fixtures/source-equations.json');
write('source-descriptors.json',Buffer.from(JSON.stringify({schema:'dafeiyu.selected-face-runtime-descriptors.v1',authority:source.authority,sourceHashes:source.sourceHashes,meshes:source.meshes})+'\n'));
write('selected_face_kernel.gdextension',Buffer.from('[configuration]\nentry_symbol = "selected_face_library_init"\ncompatibility_minimum = "4.7"\nreloadable = false\n[libraries]\nwindows.x86_64 = "res://face-kernel/bin/selected_face_kernel.windows.release.x86_64.dll"\n'));
const manifest={schema:'dafeiyu.selected-face-kernel-component.v1',status:'Independent appearance-preserving candidate; not installed into 4348 or DSH; not user art approval',authority:source.authority,sourceHashes:source.sourceHashes,sourceTextureSha256:source.sourceTextureSha256,engine:kernelReport.engine,platform:'Windows x86_64 official Godot 4.7.2, standard precision',installFolder:'res://face-kernel/',entry:'res://face-kernel/face_adapter.gd',library:'res://face-kernel/selected_face_kernel.gdextension',runtimeFiles:files,stateChannels:{blink:[0,1],talk:[0,1],happy:[0,1],sad:[0,1],gazeX:[-1,1],gazeY:[-1,1]},sourceMeshes:source.meshes.length,dynamicMeshes:source.dynamicMeshes,topology:'Source semantic vertex order, fixed through every update; 18 replacements only during setup; no reconstruction per frame',materials:'Retain original source image, original MeshBasic/paint behavior, original render flags, Float32 RGBA through CUSTOM0; no replacement iris shader',coordinates:'Original Head local: X right, Y up, +Z forward; parent Head motion applied once by scene',proof:{states:44,float32Components:kernelReport.components,nativeUnequalBits:kernelReport.unequalFloat32Bits,gpuReadbackUnequalBits:gpuReport.readback_unequal,meshRebuildsPerUpdate:gpuReport.adapter.mesh_rebuilds_during_updates,disposeRestoresSource:gpuReport.dispose_restores_source,kernelMeanMs:gpuReport.kernel_mean_ms,submitMeanMs:gpuReport.submit_mean_ms,scope:'Actual RTX 4060 Compatibility renderer face-only probe; full-character visual comparison and structural depth review remain separate'},structuralDepth:'source-default is the exact initial authority. Explicit structural-candidate may change Z only using reviewed profile/globe parameters; no claim of source XYZ parity for changed structure.'};
fs.writeFileSync(path.join(own,'component-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({files,sourceUnchanged:true,proof:manifest.proof}));
