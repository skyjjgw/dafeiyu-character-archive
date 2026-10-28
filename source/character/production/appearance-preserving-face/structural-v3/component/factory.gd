extends RefCounted
var model:Node3D
var renderer:Node3D
var adapter:RefCounted
var contract:Dictionary={}
var directory:String

func sha(bytes:PackedByteArray)->String:
	var context=HashingContext.new();context.start(HashingContext.HASH_SHA256);context.update(bytes);return context.finish().hex_encode()

func setup(parent:Node3D,source_renderer:Node3D)->Dictionary:
	directory=get_script().resource_path.get_base_dir()
	contract=JSON.parse_string(FileAccess.get_file_as_string(directory+"/contract.json"))
	if contract.get("id","")!="continuous-head-v3":return {"ok":false,"error":"wrong_component_contract"}
	for entry in contract.files:
		var relative=str(entry.path)
		if relative.is_absolute_path() or relative.contains(".."):return {"ok":false,"error":"invalid_component_path"}
		var bytes=FileAccess.get_file_as_bytes(directory+"/"+relative)
		if bytes.size()!=int(entry.bytes) or sha(bytes)!=entry.sha256:return {"ok":false,"error":"component_file_changed","file":relative}
	var document=GLTFDocument.new();var state=GLTFState.new()
	if document.append_from_file(directory+"/head-local.glb",state,GLTFDocument.IMPORT_FLAG_FORCE_DISABLE_MESH_COMPRESSION)!=OK:return {"ok":false,"error":"head_import_failed"}
	model=document.generate_scene(state)
	if model==null:return {"ok":false,"error":"head_scene_missing"}
	model.name="ContinuousHeadV3Component";model.visible=false;parent.add_child(model)
	renderer=source_renderer.get_script().new()
	renderer.report=JSON.parse_string(FileAccess.get_file_as_string(directory+"/rendering.json"))
	renderer.linear_textures=true;renderer.float_colors=false
	renderer.source_textures=source_renderer.source_textures.duplicate()
	renderer.apply_source_materials(model)
	if renderer.failed:dispose();return {"ok":false,"error":"source_material_transfer_failed"}
	adapter=load(directory+"/face_adapter.gd").new()
	var equations=JSON.parse_string(FileAccess.get_file_as_string(directory+"/source-equations.json"))
	var structure=JSON.parse_string(FileAccess.get_file_as_string(directory+"/structure.json"))
	var descriptors=JSON.parse_string(FileAccess.get_file_as_string(directory+"/descriptors.json"))
	var data=FileAccess.get_file_as_bytes(directory+"/canonical.bin")
	if sha(data)!=descriptors.dataSha256:dispose();return {"ok":false,"error":"canonical_bytes_changed"}
	var result:Dictionary=adapter.setup(model,equations,structure,descriptors,data,directory+"/selected_structural_face_kernel.gdextension")
	if not result.ok:dispose();return result
	var runtime_contract=contract.duplicate(true)
	runtime_contract.files=[]
	for entry in contract.files:
		var runtime_entry:Dictionary=entry.duplicate();runtime_entry.path=directory+"/"+str(entry.path);runtime_contract.files.append(runtime_entry)
	return {"ok":true,"id":contract.id,"model":model,"adapter":adapter,"contract":runtime_contract,"import":result}

func dispose()->void:
	if adapter!=null:adapter.dispose();adapter=null
	if is_instance_valid(model):model.free();model=null
	if is_instance_valid(renderer):renderer.free();renderer=null
