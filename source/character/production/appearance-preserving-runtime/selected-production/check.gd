extends SceneTree

func _initialize()->void:call_deferred("run")

func run()->void:
	var scene=load("res://selected-production/current.tscn").instantiate();root.add_child(scene)
	await process_frame
	for i in range(5):await physics_frame
	var state=scene.character_action("state")
	var pickup=scene.character_action("pickup");var release=scene.character_action("release")
	var wave=scene.character_action("wave")
	while scene.actor.age<1.8:await physics_frame
	var wave_amount=scene.actor.rig.wave;var cancel=scene.character_action("cancel")
	while scene.actor.age<3.8:await physics_frame
	var structural_visible=scene.replacement_face_model!=null and scene.replacement_face_model.visible
	var restored=scene.restore_source_face();await process_frame
	var source_visible=scene.replacement_face_model==null and scene.source_face_group.visible and scene.face_connected
	var reinstalled=scene.load_structural_head();await process_frame
	var band_before=scene.headband_handle!=null and scene.headband_handle.snapshot().committed
	var band_restore=scene.restore_headband();var band_source=scene.headband_handle==null
	var band_reinstall=scene.load_headband();await process_frame
	if scene.hair_handle==null:scene.load_hair()
	var hair_before=scene.hair_handle!=null and scene.hair_handle.snapshot().committed
	var hair_restore=scene.restore_hair();var hair_source=scene.hair_handle==null
	var hair_reinstall=scene.load_hair();await process_frame
	var before_pause=scene.tail.bodies.map(func(body):return body.global_transform);var before_updates=scene.tail.updates
	paused=true
	for i in range(12):await process_frame
	var paused_motion=0.0
	for i in scene.tail.bodies.size():paused_motion=maxf(paused_motion,scene.tail.bodies[i].global_position.distance_to(before_pause[i].origin))
	var pause_updates_held=scene.tail.updates==before_updates
	paused=false
	for i in range(3):await physics_frame
	var checks={"required_components_loaded":scene.is_character_ready(),"state_real":state.get("ok",false),"wave_real":wave.get("ok",false) and wave_amount>.9,"cancel_real":cancel.get("ok",false) and scene.actor.rig.wave<.01,"pickup_explicitly_unavailable":not pickup.get("ok",true) and pickup.code=="character_action_not_available","release_explicitly_unavailable":not release.get("ok",true) and release.code=="character_action_not_available","hand_mapping_bound":scene.hand_adapter.max_body_mapping_error<.000002,"structural_head_visible_on_commit":structural_visible,"source_face_restore_real":restored.ok and source_visible,"structural_head_reinstall_real":reinstalled.ok and scene.replacement_face_model.visible and not scene.source_face_group.visible}
	checks.headband_initial_commit=band_before;checks.headband_source_restore=band_restore.ok and band_source;checks.headband_reinstall=band_reinstall.ok and scene.headband_handle.snapshot().hiddenSourceMeshes==7
	checks.hair_initial_commit=hair_before;checks.hair_source_restore=hair_restore.ok and hair_source;checks.hair_reinstall=hair_reinstall.ok and scene.hair_handle.snapshot().hiddenSourceMeshes==15;checks.static_hair_not_physics=not scene.hair_handle.snapshot().dynamicPhysics and not scene.get_character_capabilities().hairPhysics
	checks.pause_holds_physical_tail=paused_motion<.0000001;checks.pause_stops_secondary_force_updates=pause_updates_held;checks.resume_restarts_secondary=scene.tail.updates>before_updates
	var passed=true;for value in checks.values():passed=passed and value
	var report={"schema":"dafeiyu.selected-production.lifecycle-check.v1","completed":true,"pass":passed,"headless":DisplayServer.get_name()=="headless","checks":checks,"state":scene.snapshot(),"unsupported_results":[pickup,release],"final_accepted":false}
	var file=FileAccess.open("res://selected-production/reports/lifecycle-check.json",FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"));print("SELECTED_CURRENT_CHECK ",JSON.stringify({"pass":passed,"checks":checks}))
	quit(0 if passed else 1)
