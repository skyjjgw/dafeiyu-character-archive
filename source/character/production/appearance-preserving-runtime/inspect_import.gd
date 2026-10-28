extends SceneTree

var rows:Array=[]
var blob:PackedByteArray=[]
var skeletons:Array=[]

func _initialize()->void:
	call_deferred("inspect")

func append_bytes(bytes:PackedByteArray)->Dictionary:
	var record={"offset":blob.size(),"length":bytes.size()}
	blob.append_array(bytes)
	return record

func inspect()->void:
	var document=GLTFDocument.new()
	var state=GLTFState.new()
	var error=document.append_from_file("res://assets/selected-appearance.glb",state,GLTFDocument.IMPORT_FLAG_FORCE_DISABLE_MESH_COMPRESSION)
	if error!=OK:
		push_error("GLB inspect failed")
		quit(1)
		return
	var scene=document.generate_scene(state)
	root.add_child(scene)
	await process_frame
	walk(scene)
	var data=FileAccess.open("res://reports/imported-attributes.bin",FileAccess.WRITE)
	data.store_buffer(blob)
	var report={"meshes":rows,"skeletons":skeletons,"bytes":blob.size(),"engine":Engine.get_version_info(),"scope":"CPU imported ArrayMesh attributes only. No GPU or visual pass."}
	var file=FileAccess.open("res://reports/imported-attributes.json",FileAccess.WRITE)
	file.store_string(JSON.stringify(report,"\t"))
	print("APPEARANCE_IMPORT_ATTRIBUTES ",rows.size()," ",blob.size())
	quit(0)

func walk(node:Node)->void:
	if node is Skeleton3D:
		var bones:Array=[]
		for i in range(node.get_bone_count()):bones.append({"name":node.get_bone_name(i),"parent":node.get_bone_parent(i),"rest":str(node.get_bone_rest(i)),"pose":str(node.get_bone_pose(i))})
		skeletons.append({"name":node.name,"bones":bones})
	if node is MeshInstance3D:
		var mesh=node.mesh
		var row={"node":node.name,"mesh":mesh.resource_name,"surfaces":[]}
		for i in range(mesh.get_surface_count()):
			var arrays=mesh.surface_get_arrays(i)
			var surface={"format":mesh.surface_get_format(i),"material":mesh.surface_get_material(i).resource_name,"positions":append_bytes(arrays[Mesh.ARRAY_VERTEX].to_byte_array()),"uv":null,"colors":null,"indices":append_bytes(arrays[Mesh.ARRAY_INDEX].to_byte_array())}
			if arrays[Mesh.ARRAY_TEX_UV]!=null:surface.uv=append_bytes(arrays[Mesh.ARRAY_TEX_UV].to_byte_array())
			if arrays[Mesh.ARRAY_COLOR]!=null:surface.colors=append_bytes(arrays[Mesh.ARRAY_COLOR].to_byte_array())
			row.surfaces.append(surface)
		rows.append(row)
	for child in node.get_children():walk(child)
