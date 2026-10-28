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
  code=replace(code,'#include <vector>','#include <vector>\n#include <unordered_map>\n#include <cstdint>\n#include <atomic>\n#include <thread>\n#include <mutex>\n#include <condition_variable>');
  const extra=fs.readFileSync(path.join(root,'structural-declarations.hpp'),'utf8');
  code=replace(code,' static void put_float',extra+'\n static void put_float');
  code=replace(code,'std::vector<Canonical>vertices;PackedByteArray','std::vector<Canonical>vertices;std::vector<uint8_t>dependencies;State last_state;bool state_ready=false;uint64_t config_generation=0;uint8_t dependencies_mask=0;PackedByteArray');
  code=replace(code,' Dictionary configure(const Dictionary&,const Array&);',' ~SelectedStructuralFaceKernel();\n Dictionary configure(const Dictionary&,const Array&);\n Dictionary configure_structure(const Dictionary&);');
 }else if(file==='face_kernel.cpp'){
  code=replace(code,' Sample v;const Eye&e=',' if(p.role>=20)return sample_structure(p,s);\n Sample v;const Eye&e=');
  code=replace(code,' if(depth_policy.is_empty()',' if(structure_enabled){if(p.role==STATIC||p.role>=20)return v.z;const double x=double(float(v.x)),y=double(float(v.y));const auto depth=depth_v3(x,y);return double(float(v.z))+depth.first-depth.second+(p.role==TONGUE?-.041:0.);}\n if(depth_policy.is_empty()');
  code=replace(code,' configured=false;meshes.clear();',' structure_enabled=false;clear_depth_cache();configured=false;meshes.clear();');
  code=replace(code,'table=source_table;strength=source_strength;depth_policy.clear();','clear_depth_cache();table=source_table;strength=source_strength;depth_policy.clear();');
  code=replace(code,'table=std::move(candidate);strength=candidate_strength;depth_policy=policy.duplicate(true);','clear_depth_cache();table=std::move(candidate);strength=candidate_strength;depth_policy=policy.duplicate(true);');
  const begin=code.indexOf('Dictionary SelectedStructuralFaceKernel::evaluate(const Dictionary &input){'),end=code.indexOf('PackedByteArray SelectedStructuralFaceKernel::pack_attributes(',begin);if(begin<0||end<0)throw Error('Source evaluate anchors changed');
  code=code.slice(0,begin)+`Dictionary SelectedStructuralFaceKernel::evaluate(const Dictionary &input){
 if(!configured)return failure("not_configured");const auto start=std::chrono::steady_clock::now();const State state=state_of(input);std::vector<uint8_t>changed;
 if(structure_enabled){prepare_structure_frame(state);if(!update_structure_buffers(state,changed))return failure("nonfinite_face_position");}
 Array frames;size_t mesh_number=0;
 for(DynamicMesh&m:meshes){
  if(!structure_enabled){uint8_t*p=m.positions.ptrw();uint8_t*uv=m.has_uv?m.uvs.ptrw():nullptr;uint8_t*color=m.has_color?m.colors.ptrw():nullptr;for(int i=0;i<m.count;++i){const auto&canonical=m.vertices[size_t(i)];const auto value=sample(canonical,state);const double z=apply_depth(canonical,state,value);if(!std::isfinite(value.x)||!std::isfinite(value.y)||!std::isfinite(z))return failure("nonfinite_face_position");put_float(p,int64_t(i)*12,value.x);put_float(p,int64_t(i)*12+4,value.y);put_float(p,int64_t(i)*12+8,z);if(value.uv&&uv){put_float(uv,int64_t(i)*8,value.u);put_float(uv,int64_t(i)*8+4,value.v);}if(value.color&&color)for(int n=0;n<4;++n)put_float(color,int64_t(i)*16+n*4,value.rgba[size_t(n)]);}}
  Dictionary f;f["index"]=m.source_index;f["name"]=m.name;f["vertices"]=m.count;f["changed"]=structure_enabled?bool(changed[mesh_number]):true;f["positions"]=m.positions;if(m.has_uv)f["uv"]=m.uvs;if(m.has_color)f["rgba"]=m.colors;f["visible"]=m.role==IRIS?state.blink<.993:m.role==SCLERA?state.blink<.998:m.role==TONGUE?state.talk>.25:true;frames.append(f);++mesh_number;
 }
 Dictionary r;r["ok"]=true;r["meshes"]=frames;r["kernel_ms"]=std::chrono::duration<double,std::milli>(std::chrono::steady_clock::now()-start).count();r["depth_policy"]=depth_policy.get("kind","source-default");r["cpu_worker_count"]=structure_enabled&&!serial_only?1:0;if(structure_enabled)report_structure_profile();return r;
}
`+code.slice(end);
  code=replace(code,'p.role<0||p.role>FRONT_PROFILE','p.role<0||(p.role>FRONT_PROFILE&&(p.role<20||p.role>24))');
  code=replace(code,'void SelectedStructuralFaceKernel::_bind_methods(){','void SelectedStructuralFaceKernel::_bind_methods(){ClassDB::bind_method(D_METHOD("configure_structure","configuration"),&SelectedStructuralFaceKernel::configure_structure);');
 }
 fs.writeFileSync(path.join(root,'src',file),code);
}
fs.writeFileSync(path.join(root,'source-provenance.json'),JSON.stringify({schema:'dafeiyu.structural-face-native.provenance.v1',sourceHashes,className:'SelectedStructuralFaceKernel',scope:'Separate extension; frozen source-default source, DLL and runtime package are unchanged.'},null,2)+'\n');
console.log(JSON.stringify({prepared:true,className:'SelectedStructuralFaceKernel',sourceHashes}));
