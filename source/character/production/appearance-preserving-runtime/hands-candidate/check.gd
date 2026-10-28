extends SceneTree

func _initialize()->void:call_deferred("run")

func run()->void:
	var scene=load("res://hands-candidate/scene.tscn").instantiate();root.add_child(scene)
	await process_frame
	if scene.hand_adapter==null or not scene.hand_adapter.ready:quit(1);return
	scene.actor.action_check()
	var samples=0;var finite=true;var start=Time.get_ticks_usec()
	var previous={};var max_joint_delta=0.0;var full_wave_min_dot=1.0;var max_wrist_angle=0.0
	while scene.actor.age<14.0:
		await physics_frame
		var amount=clampf(scene.actor.age/.9,0,1)*.55
		scene.hand_adapter.set_pose(amount,amount*.4)
		for bone in range(22,52):finite=finite and scene.hand_adapter.skeleton.get_bone_global_pose(bone).origin.is_finite()
		for key in scene.actor.rig.ids:
			var q=scene.actor.rig.skeleton.get_bone_pose_rotation(scene.actor.rig.ids[key])
			if previous.has(key):max_joint_delta=maxf(max_joint_delta,previous[key].angle_to(q))
			previous[key]=q
		var actual_wrist=scene.actor.rig.skeleton.get_bone_pose_rotation(scene.actor.rig.ids.leftHand)
		var rest_wrist=scene.actor.rig.rest.leftHand.basis.get_rotation_quaternion()
		max_wrist_angle=maxf(max_wrist_angle,actual_wrist.angle_to(rest_wrist))
		if scene.actor.rig.wave>.98 and scene.actor.rig.greeting_diagnostics.has("palm_dot_attention"):full_wave_min_dot=minf(full_wave_min_dot,scene.actor.rig.greeting_diagnostics.palm_dot_attention)
		samples+=1
	var checks={"packed_skin_reference_under_5e_5_source_unit":scene.hand_reference.pass,"source22_mapping_under_2e_6":scene.hand_adapter.max_body_mapping_error<.000002,"finger_transforms_finite":finite,"action_check_completed":not scene.actor.scripted,"joint_increment_under_0_05rad_per_tick":max_joint_delta<.05,"full_wave_palm_dot_target_over_0_95":full_wave_min_dot>.95,"wrist_rest_angle_under_1_101rad":max_wrist_angle<1.101,"bone_length_under_0_02mm":scene.actor.rig.max_bone_length_error<.00002,"support_slip_under_1mm":scene.actor.rig.max_support_slip<.001}
	var report={"schema":"dafeiyu.selected-hand-native-integration-check.v1","headless":DisplayServer.get_name()=="headless","rendered_gpu":DisplayServer.get_name()!="headless","reference":scene.hand_reference,"mapping":scene.hand_adapter.snapshot(),"dynamic":{"seconds":scene.actor.age,"wall_seconds":(Time.get_ticks_usec()-start)/1000000.0,"samples":samples,"action_check_finished":not scene.actor.scripted,"steps":scene.actor.steps,"finger_transforms_finite":finite,"max_joint_increment_rad":max_joint_delta,"min_full_wave_palm_dot_attention":full_wave_min_dot,"max_actual_wrist_rest_angle_rad":max_wrist_angle,"max_bone_length_error_scene_m":scene.actor.rig.max_bone_length_error,"max_support_slip_scene_m":scene.actor.rig.max_support_slip},"checks":checks,"default_asset_changed":false,"visual_pass":false,"grasp_or_physics_pass":false}
	var passed=true;for value in checks.values():passed=passed and value
	report.completed=true;report.pass=passed
	var file=FileAccess.open("res://hands-candidate/reports/native-integration-check.json",FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"))
	print("HAND_INTEGRATION_CHECK ",JSON.stringify({"pass":passed,"reference_error":scene.hand_reference.max_source_unit_error,"body_mapping_error":scene.hand_adapter.max_body_mapping_error}))
	quit(0 if passed else 1)
