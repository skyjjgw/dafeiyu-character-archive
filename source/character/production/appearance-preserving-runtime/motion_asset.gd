extends RefCounted

var renderer:Node3D
var model:Node3D
var contract:Dictionary
var rendering:Dictionary

func load_selected()->Node3D:
	contract=JSON.parse_string(FileAccess.get_file_as_string("res://assets/motion-rig.json"))
	rendering=JSON.parse_string(FileAccess.get_file_as_string("res://assets/source-rendering.json"))
	if contract.glbSha256!=rendering.glbSha256:return null
	# Use the frozen source-render transfer implementation without adding its
	# capture Node to the SceneTree. Its _ready/auto-exit never runs here.
	renderer=load("res://static_comparison.gd").new()
	renderer.report=rendering
	renderer.linear_textures=true
	renderer.float_colors=true
	var colors=JSON.parse_string(FileAccess.get_file_as_string("res://assets/source-float-colors.json"))
	if colors.glbSha256!=rendering.glbSha256:return null
	renderer.color_bytes=FileAccess.get_file_as_bytes("res://assets/source-float-colors.bin")
	for row in colors.rows:renderer.color_cache[str(row.node)+":"+str(int(row.surface))]=row
	var textures=JSON.parse_string(FileAccess.get_file_as_string("res://assets/linear-textures.json"))
	for entry in textures:
		var image=Image.create_from_data(int(entry.width),int(entry.height),false,Image.FORMAT_RGBAH,FileAccess.get_file_as_bytes("res://assets/"+str(entry.linearCache)))
		image.generate_mipmaps()
		renderer.source_textures.append(ImageTexture.create_from_image(image))
	var document=GLTFDocument.new()
	var state=GLTFState.new()
	if document.append_from_file("res://assets/selected-appearance.glb",state,GLTFDocument.IMPORT_FLAG_FORCE_DISABLE_MESH_COMPRESSION)!=OK:return null
	model=document.generate_scene(state)
	return model

func dispose()->void:
	if renderer!=null:renderer.free();renderer=null
