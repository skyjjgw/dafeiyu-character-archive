extends SceneTree
var main: Node3D
var pose_capture:=preload("res://scripts/pose_capture.gd").new()
func _initialize() -> void: call_deferred("run")
func save(label: String) -> void:
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("res://reports/"+label+".png")
	main.write_report("res://reports/"+label+".json")
func run() -> void:
	main=load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for i in 120: await physics_frame
	main.secondary.simulator.modification_processed.connect(func():
		if main.actor.action=="wave" and main.actor.action_age>.97: pose_capture.record(main.actor))
	main.actor.wave_forward=.25
	main.actor.start_action("wave")
	for i in 240: await physics_frame
	paused=true
	main.camera.size=2.4
	main.camera.position=Vector3(.05,2.0,6)
	main.camera.look_at(Vector3(.05,1.9,.2))
	await save("materials-wave-with-ink")
	pose_capture.export_body(main.actor)
	pose_capture.data["asset_provenance"]=main.asset_provenance
	var pose_file:=FileAccess.open("res://reports/pose-wave-legacy.json",FileAccess.WRITE)
	pose_file.store_string(JSON.stringify(pose_capture.data,"\t"))
	var meshes: Array=[]
	var pending: Array[Node]=[main]
	while not pending.is_empty():
		var node: Node=pending.pop_back()
		pending.append_array(node.get_children())
		if node is MeshInstance3D and node.mesh!=null and node.is_visible_in_tree():
			meshes.append(node)
			for surface in node.mesh.get_surface_count():
				var material: Material=node.get_active_material(surface)
				if material: material.next_pass=null
	await save("materials-wave-no-ink")
	for node in meshes:
		for surface in node.mesh.get_surface_count():
			var original: Material=node.get_active_material(surface)
			var diagnostic:=ShaderMaterial.new()
			if original is ShaderMaterial and original.shader.resource_path.ends_with("native_cloth.gdshader"):
				diagnostic.shader=load("res://shaders/debug_cloth_front_back.gdshader")
				for key in ["cage_positions","cage_rest"]: diagnostic.set_shader_parameter(key,original.get_shader_parameter(key))
			else: diagnostic.shader=load("res://shaders/debug_front_back.gdshader")
			node.set_surface_override_material(surface,diagnostic)
	await save("materials-wave-front-back")
	print("Material isolation captures saved; same paused pose, actual base/outline/front-back GPU passes")
	quit()
