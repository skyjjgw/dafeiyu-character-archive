extends SceneTree

func _initialize()->void:call_deferred("run")

func run()->void:
	var scene=load("res://hands-candidate/scene.tscn").instantiate();root.add_child(scene)
	await process_frame
	if scene.hand_adapter==null or not scene.hand_adapter.ready:quit(1);return
	for i in range(3):await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("res://hands-candidate/reports/native-full-neutral.png")
	scene.actor.request_wave();scene.hand_adapter.set_pose(.08,.032)
	while scene.actor.age<1.6:await process_frame
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("res://hands-candidate/reports/native-full-greeting.png")
	scene.hand_adapter.set_pose(.55,.22)
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("res://hands-candidate/reports/native-full-wave-curl055.png")
	var hand=scene.hand_adapter.meshes[0].instance
	var baked=hand.bake_mesh_from_current_skeleton_pose();var positions:PackedVector3Array=baked.surface_get_arrays(0)[Mesh.ARRAY_VERTEX]
	var bounds=AABB(hand.global_transform*positions[0],Vector3.ZERO)
	for p in positions:bounds=bounds.expand(hand.global_transform*p)
	var target=bounds.get_center();scene.follow_camera=false;scene.set_process(false);paused=true
	# Diagnostic close views isolate the actual skinned hand so source hair/body
	# cannot occlude it. The whole-character captures above retain every other part.
	for mesh in scene.asset.model.find_children("*","MeshInstance3D",true,false):mesh.visible=false
	for entry in scene.hand_adapter.meshes:entry.instance.visible=entry.instance==hand
	scene.camera.projection=Camera3D.PROJECTION_ORTHOGONAL;scene.camera.size=maxf(bounds.size.length()*1.55,.05);scene.camera.h_offset=0
	for angle in [0.0,45.0,90.0]:
		var direction=scene.actor.global_basis*Vector3(sin(deg_to_rad(angle)),0,cos(deg_to_rad(angle)))
		scene.camera.position=target+direction;scene.camera.look_at(target)
		await RenderingServer.frame_post_draw
		root.get_texture().get_image().save_png("res://hands-candidate/reports/native-hand-wave-curl055-view%d.png"%int(angle))
	var report={"schema":"dafeiyu.selected-hand-candidate-gpu-capture.v1","completed":true,"engine":Engine.get_version_info(),"display":DisplayServer.get_name(),"hand":scene.hand_adapter.snapshot(),"reference":scene.hand_reference,"greeting":scene.actor.rig.greeting_diagnostics,"actual_baked_vertex_count":positions.size(),"scope":"Actual whole selected character plus true skinned local hand candidate rendered on GPU; close images explicitly isolate hand. Not final anatomy, collision or grasp acceptance","visual_pass":false}
	var file=FileAccess.open("res://hands-candidate/reports/gpu-capture.json",FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"));print("HAND_GPU_CAPTURE_DONE")
	quit(0)
