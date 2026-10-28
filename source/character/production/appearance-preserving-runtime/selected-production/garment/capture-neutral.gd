extends SceneTree

func _initialize()->void:call_deferred("run")

func run()->void:
	var scene=load("res://selected-production/current.tscn").instantiate();root.add_child(scene)
	await process_frame
	if not scene.is_character_ready():quit(1);return
	# Pause the actual world before constructing cloth. This capture tests only
	# the source high-shell shader/barycentric mapping, not failed dynamics.
	paused=true
	var garment=load("res://selected-production/garment/adapter.gd").new();scene.add_child(garment)
	var setup:Dictionary=garment.setup(scene.actor,scene.asset,{"material":false,"collisions":false})
	if not setup.ok:push_error("Neutral garment setup failed: "+str(setup));quit(1);return
	var captured=[]
	for angle in [0,45,90,180]:
		scene.view_yaw=deg_to_rad(float(angle));scene.update_camera()
		for frame in 5:await RenderingServer.frame_post_draw
		var error=root.get_texture().get_image().save_png("res://selected-production/garment/reports/neutral-"+str(angle)+".png")
		if error!=OK:push_error("Neutral garment GPU capture failed");quit(1);return
		captured.append(angle)
	var checks={"four_actual_gpu_images":captured.size()==4,"paused_before_install":paused,"physics_updates_zero":garment.updates==0,"two_high_shells":garment.layers.size()==2,"original_skirt_hidden_only_for_candidate":not garment.source_mesh.visible}
	var passed=true;for value in checks.values():passed=passed and value
	var report={"completed":true,"pass_render_wiring_only":passed,"checks":checks,"captured_angles":captured,"setup":setup,"snapshot":garment.snapshot(),"device":RenderingServer.get_video_adapter_name(),"method":RenderingServer.get_current_rendering_method(),"source_image_sha256":garment.spec.materials[0].sourceImageSha256,"scope":"Actual paused-world GPU high-shell material/UV/FloatColor/barycentric mapping capture only. No simulated cloth motion, no contact or material acceptance.","cloth_physics_accepted":false,"visual_accepted":false,"performance_accepted":false}
	var file=FileAccess.open("res://selected-production/garment/reports/neutral-gpu.json",FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"));print("GARMENT_NEUTRAL_GPU_DONE ",passed)
	garment.dispose();garment.queue_free();paused=false;quit(0 if passed else 1)
