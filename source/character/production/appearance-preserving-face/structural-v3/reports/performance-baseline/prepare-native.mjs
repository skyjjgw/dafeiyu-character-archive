import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(path.join(root,'src'),{recursive:true});
fs.mkdirSync(path.join(root,'godot/bin'),{recursive:true});
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
function replace(text,from,to){if(!text.includes(from))throw Error('Source anchor changed: '+from.slice(0,80));return text.replace(from,to);}
const sourceHashes={};
for(const file of ['face_kernel.hpp','face_kernel.cpp','register_types.cpp']){
 const bytes=fs.readFileSync(path.join(root,'../src',file));sourceHashes[file]=crypto.createHash('sha256').update(bytes).digest('hex');
 let code=bytes.toString().replaceAll('SelectedFaceKernel','SelectedStructuralFaceKernel').replaceAll('selected_face_library_init','selected_structural_face_library_init');
 if(file==='face_kernel.hpp'){
  code=replace(code,'#include <vector>','#include <vector>\n#include <unordered_map>\n#include <cstdint>');
  const extra=fs.readFileSync(path.join(root,'structural-declarations.hpp'),'utf8');
  code=replace(code,' static void put_float',extra+'\n static void put_float');
  code=replace(code,' Dictionary configure(const Dictionary&,const Array&);',' Dictionary configure(const Dictionary&,const Array&);\n Dictionary configure_structure(const Dictionary&);');
 }else if(file==='face_kernel.cpp'){
  code=replace(code,' Sample v;const Eye&e=',' if(p.role>=20)return sample_structure(p,s);\n Sample v;const Eye&e=');
  code=replace(code,' if(depth_policy.is_empty()',' if(structure_enabled){if(p.role==STATIC||p.role>=20)return v.z;const double x=double(float(v.x)),y=double(float(v.y));return double(float(v.z))+depth_v3(x,y).first-front_z(x,y)+(p.role==TONGUE?-.041:0.);}\n if(depth_policy.is_empty()');
  code=replace(code,' configured=false;meshes.clear();',' structure_enabled=false;depth_cache.clear();configured=false;meshes.clear();');
  code=replace(code,'const State state=state_of(input);Array frames;','const State state=state_of(input);if(structure_enabled)prepare_structure_frame(state);Array frames;');
  code=replace(code,'p.role<0||p.role>FRONT_PROFILE','p.role<0||(p.role>FRONT_PROFILE&&(p.role<20||p.role>24))');
  code=replace(code,'void SelectedStructuralFaceKernel::_bind_methods(){','void SelectedStructuralFaceKernel::_bind_methods(){ClassDB::bind_method(D_METHOD("configure_structure","configuration"),&SelectedStructuralFaceKernel::configure_structure);');
 }
 fs.writeFileSync(path.join(root,'src',file),code);
}
fs.writeFileSync(path.join(root,'source-provenance.json'),JSON.stringify({schema:'dafeiyu.structural-face-native.provenance.v1',sourceHashes,className:'SelectedStructuralFaceKernel',scope:'Separate extension; frozen source-default source, DLL and runtime package are unchanged.'},null,2)+'\n');
console.log(JSON.stringify({prepared:true,className:'SelectedStructuralFaceKernel',sourceHashes}));
