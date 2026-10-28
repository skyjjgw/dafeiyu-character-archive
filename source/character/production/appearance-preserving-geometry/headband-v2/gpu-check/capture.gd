extends Node3D
const RUNTIME="E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/"
const COMPONENT="E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-geometry/headband-v2/"
var source_renderer
var failures:Array=[]
func require_ok(condition:bool,message:String)->void:
 if not condition:failures.append(message);push_error(message)
func sha(bytes:PackedByteArray)->String:
 var h=HashingContext.new();h.start(HashingContext.HASH_SHA256);h.update(bytes);return h.finish().hex_encode()
func floats(bytes:PackedByteArray,gltf:Dictionary,bin_offset:int,accessor:int)->PackedFloat32Array:
 var a=gltf.accessors[accessor];var view=gltf.bufferViews[a.bufferView];var offset=bin_offset+int(view.get("byteOffset",0))+int(a.get("byteOffset",0));var width={"VEC2":2,"VEC3":3,"VEC4":4}[a.type];return bytes.slice(offset,offset+int(a.count)*width*4).to_float32_array()
func mesh_in(node:Node)->MeshInstance3D:
 if node is MeshInstance3D:return node
 for c in node.get_children():
  var found=mesh_in(c)
  if found:return found
 return null
func _ready()->void:
 get_viewport().transparent_bg=true
 source_renderer=load("res://source_renderer.gd").new();source_renderer.report=JSON.parse_string(FileAccess.get_file_as_string(RUNTIME+"assets/source-rendering.json"));source_renderer.linear_textures=true;source_renderer.float_colors=true
 var source_colors=JSON.parse_string(FileAccess.get_file_as_string(RUNTIME+"assets/source-float-colors.json"));source_renderer.color_bytes=FileAccess.get_file_as_bytes(RUNTIME+"assets/source-float-colors.bin")
 for row in source_colors.rows:source_renderer.color_cache[str(row.node)+":"+str(int(row.surface))]=row
 var textures=JSON.parse_string(FileAccess.get_file_as_string(RUNTIME+"assets/linear-textures.json"))
 for entry in textures:
  var im=Image.create_from_data(int(entry.width),int(entry.height),false,Image.FORMAT_RGBAH,FileAccess.get_file_as_bytes(RUNTIME+"assets/"+str(entry.linearCache)));im.generate_mipmaps();source_renderer.source_textures.append(ImageTexture.create_from_image(im))
 var document=GLTFDocument.new();var state=GLTFState.new();require_ok(document.append_from_file(RUNTIME+"assets/selected-appearance.glb",state,GLTFDocument.IMPORT_FLAG_FORCE_DISABLE_MESH_COMPRESSION)==OK,"Selected source import failed")
 var model=document.generate_scene(state);add_child(model);source_renderer.apply_source_materials(model)
 var head=model.find_child("head-control",true,false);require_ok(head!=null,"Original Head local attachment missing")
 var contract=JSON.parse_string(FileAccess.get_file_as_string(COMPONENT+"assets/headband-v2-contract.json"));var raw=FileAccess.get_file_as_bytes(COMPONENT+"assets/headband-v2.glb");require_ok(sha(raw)==contract.asset.sha256,"Component GLB hash mismatch")
 var json_length=raw.decode_u32(12);var gltf=JSON.parse_string(raw.slice(20,20+json_length).get_string_from_utf8());var bin_offset=28+int(json_length);var primitive=gltf.meshes[0].primitives[0]
 var source_pos=floats(raw,gltf,bin_offset,primitive.attributes.POSITION);var source_uv=floats(raw,gltf,bin_offset,primitive.attributes.TEXCOORD_0);var source_uv2=floats(raw,gltf,bin_offset,primitive.attributes.TEXCOORD_1);var source_color=floats(raw,gltf,bin_offset,primitive.attributes.COLOR_0)
 var lookup={};for i in range(source_pos.size()/3):lookup[PackedFloat32Array([source_pos[i*3],source_pos[i*3+1],source_pos[i*3+2]]).to_byte_array()]=i
 var doc=GLTFDocument.new();var st=GLTFState.new();require_ok(doc.append_from_file(COMPONENT+"assets/headband-v2.glb",st,GLTFDocument.IMPORT_FLAG_FORCE_DISABLE_MESH_COMPRESSION)==OK,"Component import failed")
 var node=doc.generate_scene(st);head.add_child(node);var mesh=mesh_in(node);var original=mesh.mesh;var replacement=ArrayMesh.new();var vertices=0;var missing=0;var max_uv_error=0.0;var max_uv2_error=0.0
 for surface in range(original.get_surface_count()):
  var a=original.surface_get_arrays(surface);var palette=PackedFloat32Array();palette.resize(a[Mesh.ARRAY_VERTEX].size()*4)
  for i in range(a[Mesh.ARRAY_VERTEX].size()):
   var p=a[Mesh.ARRAY_VERTEX][i];var key=PackedFloat32Array([p.x,p.y,p.z]).to_byte_array();if not lookup.has(key):missing+=1;continue
   var source_id=int(lookup[key]);var uv=a[Mesh.ARRAY_TEX_UV][i];var uv2=a[Mesh.ARRAY_TEX_UV2][i];max_uv_error=max(max_uv_error,abs(uv.x-source_uv[source_id*2]),abs(uv.y-source_uv[source_id*2+1]));max_uv2_error=max(max_uv2_error,abs(uv2.x-source_uv2[source_id*2]),abs(uv2.y-source_uv2[source_id*2+1]));palette[i*4]=source_color[source_id*3];palette[i*4+1]=source_color[source_id*3+1];palette[i*4+2]=source_color[source_id*3+2];palette[i*4+3]=1.0;vertices+=1
  a[Mesh.ARRAY_CUSTOM0]=palette;replacement.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,a,[],{},Mesh.ARRAY_CUSTOM_RGBA_FLOAT<<Mesh.ARRAY_FORMAT_CUSTOM0_SHIFT)
 mesh.mesh=replacement;require_ok(missing==0&&max_uv_error==0.0&&max_uv2_error==0.0,"Imported headband POSITION/UV/UV2 changed")
 var material=ShaderMaterial.new();material.shader=load(COMPONENT+"headband-material.gdshader");material.set_shader_parameter("source_texture",source_renderer.source_textures[0]);material.set_shader_parameter("texture_is_linear",true);material.set_shader_parameter("exact_float_palette",true);mesh.material_override=material
 var replaced:Array=[];func_hide_old(model,replaced)
 var camera=Camera3D.new();add_child(camera);camera.projection=Camera3D.PROJECTION_ORTHOGONAL;camera.size=3.5397;camera.near=.01;camera.far=30;camera.current=true
 var world=WorldEnvironment.new();world.environment=Environment.new();world.environment.background_mode=Environment.BG_CLEAR_COLOR;world.environment.tonemap_mode=Environment.TONE_MAPPER_LINEAR;add_child(world)
 for angle in [0,45,90,180]:
  var rad=deg_to_rad(float(angle));camera.position=Vector3(.195+6*sin(rad),.565,6*cos(rad));camera.look_at(Vector3(.195,.565,0));for f in range(5):await RenderingServer.frame_post_draw
  var image=get_viewport().get_texture().get_image();var e=image.save_png("res://reports/headband-v2-godot-"+str(angle)+".png");require_ok(e==OK,"GPU save failed")
 var out={"schema":"dafeiyu.headband-v2.actual-gpu-import.v1","engine":Engine.get_version_info(),"component_sha256":sha(raw),"original_meshes_hidden":replaced,"imported_vertices":vertices,"unmatched_positions":missing,"maxUVError":max_uv_error,"maxUV2PaintWeightError":max_uv2_error,"floatPaletteCustom0":true,"capturedAngles":[0,45,90,180],"failures":failures,"scope":"Actual Godot GPU static source girl + new independent component. Not dynamics/performance or final artistic acceptance."};var file=FileAccess.open("res://reports/import-report.json",FileAccess.WRITE);file.store_string(JSON.stringify(out,"\t"));print("HEADBAND_GPU ",JSON.stringify(out));get_tree().quit(0 if failures.is_empty() else 1)
func func_hide_old(node:Node,records:Array)->void:
 if node is MeshInstance3D and (str(node.name).begins_with("left-painted-white-frill") or str(node.name).begins_with("right-painted-white-frill") or str(node.name)=="continuous-rounded-three-dimensional-headband"):
  node.visible=false;records.append(str(node.name))
 for c in node.get_children():func_hide_old(c,records)

func _exit_tree()->void:
 if source_renderer!=null:source_renderer.free();source_renderer=null
