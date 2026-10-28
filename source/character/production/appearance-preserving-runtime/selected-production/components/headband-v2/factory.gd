extends RefCounted
## Frozen Head-local rigid ribbon component. setup prepares; commit installs.
## No source mesh/visibility changes occur until all validation has succeeded.
const ID="headband-continuous-shell"
var model:Node3D
var parent_head:Node3D
var contract:Dictionary={}
var geometry_contract:Dictionary={}
var import_report:Dictionary={}
var original_visibility:Array=[]
var prepared=false
var committed=false
var disposed=false
var directory:String
var owned_material:ShaderMaterial

func sha(bytes:PackedByteArray)->String:
	var context=HashingContext.new();context.start(HashingContext.HASH_SHA256);context.update(bytes);return context.finish().hex_encode()

func failure(code:String,details:Dictionary={})->Dictionary:
	var result={"ok":false,"code":code,"id":ID};result.merge(details);return result

func setup(head:Node3D,source_renderer:Node3D)->Dictionary:
	if prepared or disposed:return failure("component_lifecycle_invalid")
	if head==null or not is_instance_valid(head):return failure("original_head_missing")
	directory=get_script().resource_path.get_base_dir()
	var value=JSON.parse_string(FileAccess.get_file_as_string(directory+"/contract.json"))
	if not value is Dictionary or value.get("id","")!=ID:return failure("component_contract_invalid")
	contract=value
	for entry in contract.files:
		var path=str(entry.path)
		if path.is_absolute_path() or path.contains(".."):return failure("invalid_component_path")
		var bytes=FileAccess.get_file_as_bytes(directory+"/"+path)
		if bytes.size()!=int(entry.bytes) or sha(bytes)!=str(entry.sha256):return failure("component_file_changed",{"file":path})
	geometry_contract=JSON.parse_string(FileAccess.get_file_as_string(directory+"/geometry-contract.json"))
	if source_renderer==null or not is_instance_valid(source_renderer):return failure("source_renderer_missing")
	if source_renderer.report.get("glbSha256","")!=contract.sourceGlbSha256:return failure("selected_source_changed")
	if source_renderer.source_textures.is_empty() or source_renderer.source_textures[0]==null:return failure("source_texture_missing")
	if source_renderer.report.get("images",[]).is_empty() or source_renderer.report.images[0].get("sha256","")!=geometry_contract.sourceImage.sha256:return failure("source_image_changed")
	# Host caches are RGBA16F linear; never decode them a second time.
	if not source_renderer.linear_textures:return failure("linear_source_texture_required")
	var matches=_original_meshes(head)
	if not matches.ok:return matches
	var raw=FileAccess.get_file_as_bytes(directory+"/headband-v2.glb")
	var canonical=_canonical_attributes(raw)
	if not canonical.ok:return canonical
	var document=GLTFDocument.new();var state=GLTFState.new()
	if document.append_from_file(directory+"/headband-v2.glb",state,GLTFDocument.IMPORT_FLAG_FORCE_DISABLE_MESH_COMPRESSION)!=OK:return failure("headband_import_failed")
	model=document.generate_scene(state)
	if model==null:return failure("headband_scene_missing")
	model.name="SelectedHeadbandV2Component";model.visible=false
	if not model.transform.is_equal_approx(Transform3D.IDENTITY):return _abort("head_local_identity_required")
	var meshes:Array=[];_collect_meshes(model,meshes)
	if meshes.size()!=1:return _abort("component_mesh_count_changed")
	var instance:MeshInstance3D=meshes[0]
	if not instance.transform.is_equal_approx(Transform3D.IDENTITY):return _abort("headband_mesh_transform_changed")
	var rebuilt=_restore_palette(instance,canonical)
	if not rebuilt.ok:dispose();return rebuilt
	owned_material=ShaderMaterial.new();owned_material.shader=load(directory+"/headband-material.gdshader")
	if owned_material.shader==null:return _abort("headband_shader_missing")
	owned_material.set_shader_parameter("source_texture",source_renderer.source_textures[0])
	owned_material.set_shader_parameter("texture_is_linear",true)
	owned_material.set_shader_parameter("exact_float_palette",true)
	instance.material_override=owned_material
	parent_head=head;prepared=true
	import_report=rebuilt.duplicate(true);import_report.component_sha256=sha(raw)
	import_report.source_glb_sha256=contract.sourceGlbSha256
	import_report.linearTextureReused=true;import_report.textureDecodedAgain=false
	var runtime_contract=contract.duplicate(true)
	for entry in runtime_contract.files:entry.path=directory+"/"+str(entry.path)
	return {"ok":true,"id":ID,"model":model,"adapter":self,"handle":self,"contract":runtime_contract,"files":runtime_contract.files,"respaths":{"factory":get_script().resource_path,"asset":directory+"/headband-v2.glb","shader":directory+"/headband-material.gdshader"},"commit":Callable(self,"commit"),"dispose":Callable(self,"dispose"),"import":import_report.duplicate(true),"headLocal":true,"headTransformAppliedOnce":false,"finalAccepted":false}

func _abort(code:String)->Dictionary:
	dispose();return failure(code)

func _collect_meshes(node:Node,out:Array)->void:
	if node is MeshInstance3D:out.append(node)
	for child in node.get_children():_collect_meshes(child,out)

func _original_meshes(head:Node3D)->Dictionary:
	var found={};var nodes:Array=[];_collect_meshes(head,nodes)
	for wanted in geometry_contract.attach.replaces:
		var matches:Array=[]
		for instance in nodes:
			# GLTF Node names sanitize colons; resource_name preserves source ID.
			if instance.mesh!=null and matches_original_mesh(instance,str(wanted)):matches.append(instance)
		if matches.size()!=1:return failure("original_headband_mesh_missing_or_ambiguous",{"mesh":wanted,"count":matches.size()})
		found[str(wanted)]=matches[0]
	return {"ok":true,"meshes":found}

func matches_original_mesh(instance:MeshInstance3D,wanted:String)->bool:
	# Godot 4.7 adds the selected-appearance_ import prefix and sanitizes ':'
	# in both Node and resource names. Only these exact aliases are accepted.
	var resource_name=str(instance.mesh.resource_name)
	return resource_name==wanted or resource_name=="selected-appearance_"+wanted.replace(":","_")

func _canonical_attributes(raw:PackedByteArray)->Dictionary:
	if raw.size()<28 or raw.decode_u32(0)!=0x46546c67 or raw.decode_u32(4)!=2 or int(raw.decode_u32(8))!=raw.size():return failure("invalid_glb")
	var json_length=int(raw.decode_u32(12))
	if raw.decode_u32(16)!=0x4e4f534a or 28+json_length>raw.size():return failure("invalid_glb_json")
	var gltf=JSON.parse_string(raw.slice(20,20+json_length).get_string_from_utf8())
	if not gltf is Dictionary:return failure("invalid_gltf")
	var bin_offset=28+json_length
	if raw.decode_u32(24+json_length)!=0x004e4942:return failure("invalid_glb_bin")
	if gltf.meshes.size()!=1 or gltf.meshes[0].primitives.size()!=1:return failure("canonical_primitive_changed")
	var primitive=gltf.meshes[0].primitives[0];var attrs={}
	for semantic in ["POSITION","NORMAL","TEXCOORD_0","TEXCOORD_1","COLOR_0"]:
		if not primitive.attributes.has(semantic):return failure("canonical_attribute_missing",{"attribute":semantic})
		var index=int(primitive.attributes[semantic]);var accessor=gltf.accessors[index];var view=gltf.bufferViews[accessor.bufferView]
		if int(accessor.componentType)!=5126 or bool(accessor.get("normalized",false)) or accessor.has("sparse") or view.has("byteStride"):return failure("canonical_float_attribute_required",{"attribute":semantic})
		var widths={"VEC2":2,"VEC3":3,"VEC4":4};var width=int(widths.get(accessor.type,0));var offset=bin_offset+int(view.get("byteOffset",0))+int(accessor.get("byteOffset",0));var length=int(accessor.count)*width*4
		if width==0 or offset<bin_offset or offset+length>raw.size():return failure("canonical_attribute_range_invalid")
		var data=raw.slice(offset,offset+length);var spec=geometry_contract.mesh.attributes[semantic]
		if data.size()/4!=int(spec.componentCount) or sha(data)!=str(spec.sha256):return failure("canonical_attribute_changed",{"attribute":semantic})
		attrs[semantic]=data.to_float32_array()
	return {"ok":true,"attributes":attrs}

func _vertex_key(p:Vector3,uv:Vector2,uv2:Vector2)->PackedByteArray:
	return PackedFloat32Array([p.x,p.y,p.z,uv.x,uv.y,uv2.x,uv2.y]).to_byte_array()

func _restore_palette(instance:MeshInstance3D,canonical:Dictionary)->Dictionary:
	var attrs=canonical.attributes;var pos:PackedFloat32Array=attrs.POSITION;var uv:PackedFloat32Array=attrs.TEXCOORD_0;var uv2:PackedFloat32Array=attrs.TEXCOORD_1;var colors:PackedFloat32Array=attrs.COLOR_0
	var lookup={}
	for i in range(pos.size()/3):
		var key=_vertex_key(Vector3(pos[i*3],pos[i*3+1],pos[i*3+2]),Vector2(uv[i*2],uv[i*2+1]),Vector2(uv2[i*2],uv2[i*2+1]))
		var color=PackedFloat32Array([colors[i*3],colors[i*3+1],colors[i*3+2],1.0])
		if lookup.has(key) and lookup[key].to_byte_array()!=color.to_byte_array():return failure("ambiguous_canonical_palette")
		lookup[key]=color
	var original=instance.mesh;var replacement=ArrayMesh.new();replacement.resource_name=original.resource_name
	var vertices=0;var triangles=0;var roundtrip_checks=0
	for surface in range(original.get_surface_count()):
		var arrays=original.surface_get_arrays(surface)
		if arrays[Mesh.ARRAY_VERTEX]==null or arrays[Mesh.ARRAY_TEX_UV]==null or arrays[Mesh.ARRAY_TEX_UV2]==null:return failure("imported_attribute_missing")
		var palette=PackedFloat32Array();var count=arrays[Mesh.ARRAY_VERTEX].size()
		if arrays[Mesh.ARRAY_TEX_UV].size()!=count or arrays[Mesh.ARRAY_TEX_UV2].size()!=count:return failure("imported_attribute_count_changed")
		for i in range(count):
			var key=_vertex_key(arrays[Mesh.ARRAY_VERTEX][i],arrays[Mesh.ARRAY_TEX_UV][i],arrays[Mesh.ARRAY_TEX_UV2][i])
			if not lookup.has(key):return failure("imported_position_uv_uv2_changed",{"surface":surface,"vertex":i})
			palette.append_array(lookup[key])
		arrays[Mesh.ARRAY_CUSTOM0]=palette
		var flags=Mesh.ARRAY_CUSTOM_RGBA_FLOAT<<Mesh.ARRAY_FORMAT_CUSTOM0_SHIFT
		replacement.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays,[],{},flags)
		if replacement.get_surface_count()!=surface+1:return failure("float_palette_surface_failed")
		var actual=replacement.surface_get_arrays(surface)
		for attribute in [Mesh.ARRAY_VERTEX,Mesh.ARRAY_TEX_UV,Mesh.ARRAY_TEX_UV2,Mesh.ARRAY_CUSTOM0]:
			if actual[attribute].to_byte_array()!=arrays[attribute].to_byte_array():return failure("arraymesh_roundtrip_changed",{"attribute":attribute})
			roundtrip_checks+=1
		vertices+=count;triangles+=arrays[Mesh.ARRAY_INDEX].size()/3
	if vertices!=int(geometry_contract.mesh.vertices) or triangles!=int(geometry_contract.mesh.triangles):return failure("imported_topology_count_changed",{"vertices":vertices,"triangles":triangles})
	instance.mesh=replacement
	return {"ok":true,"imported_vertices":vertices,"imported_triangles":triangles,"unmatched_positions_uv_uv2":0,"maxUVError":0.0,"maxUV2PaintWeightError":0.0,"floatPaletteCustom0":true,"floatPaletteStorage":"RGBA_FLOAT","arrayMeshExactRoundtrips":roundtrip_checks}

func commit()->Dictionary:
	if disposed or not prepared:return failure("component_not_prepared")
	if committed:return {"ok":true,"id":ID,"alreadyCommitted":true,"headTransformAppliedOnce":true}
	if not is_instance_valid(parent_head) or not is_instance_valid(model):return failure("component_parent_expired")
	if model.get_parent()!=null or not model.transform.is_equal_approx(Transform3D.IDENTITY):return failure("head_local_component_already_parented_or_transformed")
	var matches=_original_meshes(parent_head)
	if not matches.ok:return matches
	for name in geometry_contract.attach.replaces:
		var original:MeshInstance3D=matches.meshes[str(name)]
		original_visibility.append({"node":original,"name":name,"visible":original.visible})
	# This is the single transform application: unchanged local identity under Head.
	parent_head.add_child(model)
	for entry in original_visibility:entry.node.visible=false
	model.visible=true;committed=true
	return {"ok":true,"id":ID,"hiddenMeshes":geometry_contract.attach.replaces.duplicate(),"headTransformAppliedOnce":true,"clothPhysics":false,"finalAccepted":false}

func snapshot()->Dictionary:
	return {"id":ID,"prepared":prepared,"committed":committed,"disposed":disposed,"headLocal":true,"headTransformAppliedOnce":committed,"hiddenSourceMeshes":original_visibility.size() if committed else 0,"import":import_report.duplicate(true),"clothPhysics":false,"status":"partial-improvement","finalAccepted":false}

func dispose()->void:
	if disposed:return
	for entry in original_visibility:
		if is_instance_valid(entry.node):entry.node.visible=bool(entry.visible)
	original_visibility.clear()
	if is_instance_valid(model):
		if model.get_parent()!=null:model.get_parent().remove_child(model)
		model.free()
	model=null;owned_material=null;parent_head=null;prepared=false;committed=false;disposed=true
