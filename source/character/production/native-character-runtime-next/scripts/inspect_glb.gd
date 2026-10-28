extends SceneTree

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	var arguments := OS.get_cmdline_user_args()
	var path := arguments[0] if not arguments.is_empty() else "res://assets/character.glb"
	var absolute := ProjectSettings.globalize_path(path).simplify_path()
	var asset_root := ProjectSettings.globalize_path("res://assets/").simplify_path().trim_suffix("/") + "/"
	if not absolute.begins_with(asset_root) or absolute.get_extension().to_lower() != "glb":
		push_error("Inspection accepts a local .glb inside this project's assets directory only.")
		quit(2)
		return
	if not FileAccess.file_exists(absolute):
		print("No complete native character supplied yet. Put character.glb in res://assets and run -Mode InspectAsset.")
		quit(2)
		return
	var document := GLTFDocument.new()
	var state := GLTFState.new()
	var error := document.append_from_file(absolute, state)
	if error != OK:
		push_error("GLB parse failed: %s" % error_string(error))
		quit(1)
		return
	var character := document.generate_scene(state)
	if character == null:
		push_error("GLB scene generation failed.")
		quit(1)
		return
	root.add_child(character)
	await process_frame
	var report: Dictionary = {"source": path, "skeletons": [], "meshes": [], "animations": [], "scope": "Import inventory only: topology, all-angle likeness, rig deformation and dynamics need independent validation"}
	var pending: Array[Node] = [character]
	while not pending.is_empty():
		var node: Node = pending.pop_back()
		pending.append_array(node.get_children())
		if node is Skeleton3D:
			var names: Array[String] = []
			for i in node.get_bone_count():
				names.append(node.get_bone_name(i))
			report["skeletons"].append({"node": str(character.get_path_to(node)), "bones": names})
		elif node is MeshInstance3D and node.mesh != null:
			var morphs: Array[String] = []
			for i in node.mesh.get_blend_shape_count():
				morphs.append(node.mesh.get_blend_shape_name(i))
			report["meshes"].append({"node": str(character.get_path_to(node)), "surfaces": node.mesh.get_surface_count(), "has_skin": node.skin != null, "skeleton_path": str(node.skeleton), "blend_shapes": morphs})
		elif node is AnimationPlayer:
			report["animations"].append({"node": str(character.get_path_to(node)), "clips": node.get_animation_list()})
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://reports"))
	var file := FileAccess.open("res://reports/glb-inventory.json", FileAccess.WRITE)
	file.store_string(JSON.stringify(report, "\t"))
	file.close()
	print(JSON.stringify(report))
	quit(0)
