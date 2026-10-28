extends RefCounted
## Static five-lock development component. Never attaches or hides in setup.
const ID="selected-hair-continuous"
var model:Node3D
var parent_head:Node3D
var contract:Dictionary={}
var rendering:Dictionary={}
var import_report:Dictionary={}
var saved_visibility:Array=[]
var owned_materials:Array=[]
var prepared=false
var committed=false
var disposed=false
var directory:String

func sha(bytes:PackedByteArray)->String:
	var hash=HashingContext.new();hash.start(HashingContext.HASH_SHA256);hash.update(bytes);return hash.finish().hex_encode()

func failure(code:String,details:Dictionary={})->Dictionary:
	var result={"ok":false,"id":ID,"code":code};result.merge(details);return result

func abort(code:String,details:Dictionary={})->Dictionary:
	dispose();return failure(code,details)

func meshes(node:Node)->Array:
	var found:Array=[]
	if node is MeshInstance3D:found.append(node)
	for child in node.get_children():found.append_array(meshes(child))
	return found

func matches_original_mesh(instance:MeshInstance3D,wanted:String)->bool:
	if instance.mesh==null:return false
	var name=str(instance.mesh.resource_name)
	return name==wanted or name=="selected-appearance_"+wanted.replace(":","_")

func originals(head:Node3D)->Dictionary:
	var found={};var candidates=meshes(head)
	for wanted in contract.originalMeshesReplaced:
		var matches=[]
		for instance in candidates:
			if matches_original_mesh(instance,str(wanted)):matches.append(instance)
		if matches.size()!=1:return failure("original_hair_mesh_missing_or_ambiguous",{"mesh":wanted,"count":matches.size()})
		found[str(wanted)]=matches[0]
	return {"ok":true,"meshes":found}

func setup(head:Node3D,source_renderer:Node3D)->Dictionary:
	if prepared or disposed:return failure("component_lifecycle_invalid")
	if head==null or not is_instance_valid(head):return failure("original_head_missing")
	directory=get_script().resource_path.get_base_dir()
	var value=JSON.parse_string(FileAccess.get_file_as_string(directory+"/contract.json"))
	if not value is Dictionary or value.get("id","")!=ID:return failure("component_contract_invalid")
	contract=value
	for row in contract.files:
		var path=str(row.path)
		if path.is_absolute_path() or path.contains(".."):return failure("invalid_component_path")
		var data=FileAccess.get_file_as_bytes(directory+"/"+path)
		if data.size()!=int(row.bytes) or sha(data)!=str(row.sha256):return failure("component_file_changed",{"file":path})
	rendering=JSON.parse_string(FileAccess.get_file_as_string(directory+"/rendering.json"))
	if source_renderer==null or not is_instance_valid(source_renderer) or not source_renderer.has_method("source_material"):return failure("source_renderer_missing")
	if source_renderer.report.get("glbSha256","")!=contract.sourceGlbSha256:return failure("selected_source_changed")
	if not source_renderer.linear_textures:return failure("already_linear_source_textures_required")
	if source_renderer.source_textures.size()!=3 or source_renderer.report.get("images",[]).size()!=3:return failure("three_original_textures_required")
	for i in range(3):
		if source_renderer.source_textures[i]==null or source_renderer.report.images[i].get("sha256","")!=rendering.images[i].sha256:return failure("original_texture_order_changed",{"index":i})
	var found=originals(head)
	if not found.ok:return found
	var canonical=canonical_data(FileAccess.get_file_as_bytes(directory+"/hair-v1.glb"))
	if not canonical.ok:return canonical
	var document=GLTFDocument.new();var state=GLTFState.new()
	if document.append_from_file(directory+"/hair-v1.glb",state,GLTFDocument.IMPORT_FLAG_FORCE_DISABLE_MESH_COMPRESSION)!=OK:return failure("hair_import_failed")
	model=document.generate_scene(state)
	if model==null:return failure("hair_scene_missing")
	model.name="SelectedHairContinuousV1Component";model.visible=false
	if not model.transform.is_equal_approx(Transform3D.IDENTITY):return abort("head_local_identity_required")
	var nodes=meshes(model)
	if nodes.size()!=5:return abort("five_hair_meshes_required")
	for spec in rendering.materials:
		# Reuse the host's exact source shader construction. It reads the host's
		# RGBA16F linear caches and performs the sole V flip; no texture copies.
		owned_materials.append(source_renderer.source_material(spec))
	var records=[];var used={}
	for instance in nodes:
		if not instance.transform.is_equal_approx(Transform3D.IDENTITY):return abort("hair_mesh_identity_required")
		var mesh_match=-1
		for i in range(rendering.meshes.size()):
			var wanted=str(rendering.meshes[i].name)
			if str(instance.mesh.resource_name)==wanted or str(instance.mesh.resource_name)=="hair-v1_"+wanted.replace(":","_"):mesh_match=i
		if mesh_match<0 or used.has(mesh_match):return abort("canonical_mesh_missing_or_ambiguous",{"mesh":str(instance.mesh.resource_name)})
		used[mesh_match]=true
		var checked=verify_import(instance,rendering.meshes[mesh_match],canonical.meshes[mesh_match])
		if not checked.ok:return abort(str(checked.code),checked)
		records.append(checked)
	parent_head=head;prepared=true
	import_report={"ok":true,"meshes":records,"linearTextureReused":true,"textureDecodedAgain":false,"textureOrder":["cover0","neutralFront1","turnaround2"],"UVFlipCount":1,"floatColorAttributePresent":false,"canonicalImportChecked":true,"component_sha256":rendering.glbSha256,"dynamicPhysics":false}
	var runtime_contract=contract.duplicate(true)
	for row in runtime_contract.files:row.path=directory+"/"+str(row.path)
	return {"ok":true,"id":ID,"model":model,"adapter":self,"handle":self,"contract":runtime_contract,"files":runtime_contract.files,"respaths":{"factory":get_script().resource_path,"asset":directory+"/hair-v1.glb","rendering":directory+"/rendering.json"},"commit":Callable(self,"commit"),"dispose":Callable(self,"dispose"),"import":import_report.duplicate(true),"headLocal":true,"headTransformAppliedOnce":false,"dynamicPhysics":false,"finalAccepted":false}

func read_accessor(raw:PackedByteArray,gltf:Dictionary,bin_offset:int,index:int)->Dictionary:
	var a=gltf.accessors[index];var v=gltf.bufferViews[a.bufferView]
	if bool(a.get("normalized",false)) or a.has("sparse") or v.has("byteStride"):return failure("canonical_accessor_layout_changed")
	var widths={"SCALAR":1,"VEC2":2,"VEC3":3,"VEC4":4};var width=int(widths.get(a.type,0));var sizes={5126:4,5125:4,5123:2};var size=int(sizes.get(int(a.componentType),0));var offset=bin_offset+int(v.get("byteOffset",0))+int(a.get("byteOffset",0));var length=int(a.count)*width*size
	if width==0 or size==0 or offset<bin_offset or offset+length>raw.size():return failure("canonical_accessor_range_invalid")
	var bytes=raw.slice(offset,offset+length)
	if int(a.componentType)==5126:return {"ok":true,"bytes":bytes,"values":bytes.to_float32_array()}
	var indices=PackedInt32Array()
	for i in range(int(a.count)):indices.append(int(bytes.decode_u16(i*2) if size==2 else bytes.decode_u32(i*4)))
	return {"ok":true,"bytes":bytes,"values":indices}

func canonical_data(raw:PackedByteArray)->Dictionary:
	if raw.size()<28 or raw.decode_u32(0)!=0x46546c67 or raw.decode_u32(4)!=2 or int(raw.decode_u32(8))!=raw.size():return failure("invalid_glb")
	var length=int(raw.decode_u32(12))
	if raw.decode_u32(16)!=0x4e4f534a or 28+length>raw.size() or raw.decode_u32(24+length)!=0x004e4942:return failure("invalid_glb_chunks")
	var gltf=JSON.parse_string(raw.slice(20,20+length).get_string_from_utf8());var output=[]
	if not gltf is Dictionary or gltf.meshes.size()!=5:return failure("canonical_mesh_count_changed")
	for i in range(5):
		var spec=rendering.meshes[i];var mesh=gltf.meshes[i];var attrs={};var indices=[]
		if mesh.name!=spec.name or mesh.primitives.size()!=spec.surfaces.size():return failure("canonical_mesh_contract_changed")
		for semantic in ["POSITION","NORMAL","TEXCOORD_0"]:
			var a=read_accessor(raw,gltf,28+length,int(spec.attributes[semantic].accessor))
			if not a.ok:return a
			if sha(a.bytes)!=str(spec.attributes[semantic].sha256) or a.values.size()!=int(spec.attributes[semantic].componentCount):return failure("canonical_attribute_changed",{"attribute":semantic})
			attrs[semantic]=a.values
		for surface in range(spec.surfaces.size()):
			var primitive=mesh.primitives[surface];var expected=spec.surfaces[surface]
			if int(primitive.material)!=int(expected.material) or gltf.materials[primitive.material].name!=rendering.materials[expected.material].name:return failure("canonical_material_changed")
			var a=read_accessor(raw,gltf,28+length,int(primitive.indices))
			if not a.ok:return a
			if sha(a.bytes)!=str(expected.indexSha256) or a.values.size()!=int(expected.indexComponentCount):return failure("canonical_indices_changed")
			indices.append(a.values)
		output.append({"attributes":attrs,"indices":indices})
	return {"ok":true,"meshes":output}

func vertex_key(p:Vector3,uv:Vector2)->PackedByteArray:
	return PackedFloat32Array([p.x,p.y,p.z,uv.x,uv.y]).to_byte_array()

func triangle_key(a:int,b:int,c:int)->String:
	var ids=[a,b,c];ids.sort();return str(ids[0])+","+str(ids[1])+","+str(ids[2])

func verify_import(instance:MeshInstance3D,spec:Dictionary,canonical:Dictionary)->Dictionary:
	var attrs=canonical.attributes;var p:PackedFloat32Array=attrs.POSITION;var uv:PackedFloat32Array=attrs.TEXCOORD_0;var lookup={}
	for i in range(p.size()/3):
		var key=vertex_key(Vector3(p[i*3],p[i*3+1],p[i*3+2]),Vector2(uv[i*2],uv[i*2+1]))
		if lookup.has(key):return failure("canonical_position_uv_ambiguous",{"mesh":spec.name})
		lookup[key]=i
	if instance.mesh.get_surface_count()!=spec.surfaces.size():return failure("import_surface_count_changed")
	var total_vertices=0;var total_triangles=0;var max_normal_error=0.0;var surfaces=[]
	for surface in range(instance.mesh.get_surface_count()):
		var arrays=instance.mesh.surface_get_arrays(surface);var points:PackedVector3Array=arrays[Mesh.ARRAY_VERTEX];var uvs:PackedVector2Array=arrays[Mesh.ARRAY_TEX_UV];var normals:PackedVector3Array=arrays[Mesh.ARRAY_NORMAL];var imported_indices:PackedInt32Array=arrays[Mesh.ARRAY_INDEX]
		if points.size()!=uvs.size() or points.size()!=normals.size():return failure("imported_attribute_count_changed")
		var material=instance.mesh.surface_get_material(surface);var material_id=int(spec.surfaces[surface].material)
		if material==null or str(material.resource_name)!=str(rendering.materials[material_id].name):return failure("imported_material_mapping_changed",{"material":str(material.resource_name) if material else "null"})
		var mapping=PackedInt32Array()
		for i in range(points.size()):
			var key=vertex_key(points[i],uvs[i])
			if not lookup.has(key):return failure("imported_position_uv_changed",{"mesh":spec.name,"surface":surface,"vertex":i})
			var id=int(lookup[key]);mapping.append(id);var n=Vector3(attrs.NORMAL[id*3],attrs.NORMAL[id*3+1],attrs.NORMAL[id*3+2]);max_normal_error=max(max_normal_error,n.distance_to(normals[i]))
		var expected={};var directions={};var reversed_winding=0;var original:PackedInt32Array=canonical.indices[surface]
		for i in range(0,original.size(),3):
			var key=triangle_key(original[i],original[i+1],original[i+2]);expected[key]=int(expected.get(key,0))+1;directions[key]=[original[i],original[i+1],original[i+2]]
		for i in range(0,imported_indices.size(),3):
			var triangle=[mapping[imported_indices[i]],mapping[imported_indices[i+1]],mapping[imported_indices[i+2]]]
			var key=triangle_key(triangle[0],triangle[1],triangle[2])
			if not expected.has(key) or expected[key]<=0:return failure("imported_triangle_mapping_changed",{"mesh":spec.name,"surface":surface})
			var order=directions[key];var offset=order.find(triangle[0])
			# Godot's front faces use clockwise winding; glTF uses CCW. Require
			# every imported triangle to reverse consistently, not merely the set.
			if triangle[1]!=order[(offset+2)%3] or triangle[2]!=order[(offset+1)%3]:return failure("imported_triangle_winding_changed",{"mesh":spec.name,"surface":surface})
			reversed_winding+=1
			expected[key]-=1
		for count in expected.values():
			if int(count)!=0:return failure("imported_triangles_missing")
		instance.set_surface_override_material(surface,owned_materials[material_id])
		total_vertices+=points.size();total_triangles+=imported_indices.size()/3
		surfaces.append({"surface":surface,"sourceMaterial":material_id,"image":rendering.materials[material_id].image,"vertices":points.size(),"triangles":imported_indices.size()/3,"canonicalTriangleMultisetExact":true,"godotClockwiseTriangles":reversed_winding})
	if total_triangles!=int(spec.triangles) or max_normal_error>.001:return failure("imported_normal_or_topology_changed",{"normalError":max_normal_error})
	return {"ok":true,"mesh":spec.name,"verticesAcrossMaterialSurfaces":total_vertices,"triangles":total_triangles,"positionUVExact":true,"indicesMaterialMappingExact":true,"maxNormalError":max_normal_error,"surfaces":surfaces}

func commit()->Dictionary:
	if disposed or not prepared:return failure("component_not_prepared")
	if committed:return {"ok":true,"id":ID,"alreadyCommitted":true,"headTransformAppliedOnce":true,"dynamicPhysics":false}
	if not is_instance_valid(parent_head) or not is_instance_valid(model):return failure("component_parent_expired")
	if model.get_parent()!=null or not model.transform.is_equal_approx(Transform3D.IDENTITY):return failure("component_already_parented_or_transformed")
	var found=originals(parent_head)
	if not found.ok:return found
	for name in contract.originalMeshesReplaced:
		var node:MeshInstance3D=found.meshes[str(name)];saved_visibility.append({"node":node,"visible":node.visible})
	parent_head.add_child(model)
	for row in saved_visibility:row.node.visible=false
	model.visible=true;committed=true
	return {"ok":true,"id":ID,"hiddenMeshes":contract.originalMeshesReplaced.duplicate(),"headTransformAppliedOnce":true,"dynamicPhysics":false,"finalAccepted":false}

func snapshot()->Dictionary:
	return {"id":ID,"prepared":prepared,"committed":committed,"disposed":disposed,"headLocal":true,"headTransformAppliedOnce":committed,"hiddenSourceMeshes":saved_visibility.size() if committed else 0,"import":import_report.duplicate(true),"dynamicPhysics":false,"status":"development-static-structure","finalAccepted":false}

func dispose()->void:
	if disposed:return
	for row in saved_visibility:
		if is_instance_valid(row.node):row.node.visible=bool(row.visible)
	saved_visibility.clear()
	if is_instance_valid(model):
		if model.get_parent()!=null:model.get_parent().remove_child(model)
		model.free()
	model=null;parent_head=null;owned_materials.clear();prepared=false;committed=false;disposed=true

