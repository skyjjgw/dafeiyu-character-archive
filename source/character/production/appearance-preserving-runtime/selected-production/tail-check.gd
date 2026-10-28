extends SceneTree

func _initialize()->void:call_deferred("run")

func run()->void:
	var scene=load("res://selected-production/current.tscn").instantiate();root.add_child(scene)
	await process_frame
	if not scene.is_character_ready():quit(1);return
	var initial=scene.tail.rendered_tail_points()
	for name in initial:
		for i in initial[name].size():initial[name][i]=scene.actor.to_local(initial[name][i])
	var initial_tip=scene.tail.bodies[2].global_position
	var body=scene.tail.bodies[2];var first=true;var bounds=AABB()
	for shape in body.find_children("*","CollisionShape3D",true,false):
		for p in shape.shape.points:
			var world=body.global_transform*p
			if first:bounds=AABB(world,Vector3.ZERO);first=false
			else:bounds=bounds.expand(world)
	# A test-only obstacle starts below the actual terminal collider; gravity
	# brings the tail into it. No free body is repositioned to fabricate contact.
	var probe=StaticBody3D.new();probe.name="TailContactProbe";probe.collision_layer=1;probe.collision_mask=64
	var collision=CollisionShape3D.new();var box=BoxShape3D.new();box.size=Vector3(.18,.025,.18);collision.shape=box;probe.add_child(collision)
	probe.position=Vector3(bounds.get_center().x,bounds.position.y-.015-.0125,bounds.get_center().z);scene.add_child(probe)
	var gravity_drop=0.0;var impulse_applied=false;var queue_started=false;var contacts=0;var finite=true;var max_mesh_move=0.0;var min_y=INF
	while scene.actor.age<16:
		await physics_frame
		for rigid in scene.tail.bodies:
			finite=finite and rigid.global_position.is_finite() and rigid.linear_velocity.is_finite() and rigid.angular_velocity.is_finite()
			for hit in rigid.get_colliding_bodies():
				if hit==probe:contacts+=1
		if scene.actor.age<2:gravity_drop=maxf(gravity_drop,initial_tip.y-body.global_position.y)
		if scene.actor.age>=2 and not impulse_applied:scene.tail.apply_test_impulse(Vector3(0,.005,.003));impulse_applied=true
		if scene.actor.age>=3 and not queue_started:scene.actor.action_check();queue_started=true
		min_y=minf(min_y,body.global_position.y)
		if int(scene.actor.age*10)%10==0:
			var points=scene.tail.rendered_tail_points()
			for name in initial:
				for i in initial[name].size():max_mesh_move=maxf(max_mesh_move,scene.actor.to_local(points[name][i]).distance_to(initial[name][i]))
	var tail=scene.tail.snapshot()
	var checks={"actual_jolt_three_bodies":tail.ready and tail.dynamic.size()==3,"finite_dynamic_state":finite,"gravity_has_effect_over_1mm":gravity_drop>.001,"test_probe_real_contacts":contacts>0,"joint_gap_under_1mm":tail.maximum_joint_gap_m<.001,"render_bone_vs_body_gap_under_2mm":tail.maximum_render_vs_body_gap_m<.002,"joint_rotation_under_combined_0_95rad":tail.maximum_angle_from_rest_rad<.95,"actual_skinned_tail_vertices_move_over_5mm":max_mesh_move>.005,"controller_queue_completed":not scene.actor.scripted,"no_sine_or_free_position_targets":not tail.procedural_sine and not tail.free_body_position_targets}
	var passed=true;for value in checks.values():passed=passed and value
	var report={"schema":"dafeiyu.selected-tail-physical-check.v1","completed":true,"pass":passed,"headless":DisplayServer.get_name()=="headless","checks":checks,"gravity_drop_tip_origin_m":gravity_drop,"contact_probe_samples":contacts,"source_skinned_tail_sample_displacement_in_actor_frame_m":max_mesh_move,"mesh_probe_method":"Actual constructed ArrayMesh skin index/weight arrays, Skin inverse binds and solved Skeleton3D matrices in headless; separate GPU capture required for rendering","min_tip_origin_y_m":min_y,"seconds":scene.actor.age,"tail":tail,"current_state":scene.snapshot(),"limits":["Controlled contact probe is test-only, not a production object grasp.","Convex segment proxies are approximate; tail self-contact and skirt contact remain open.","Movement and gravity parameters use a chosen .35m/source-unit scale, not an anatomical measurement.","No GPU visual or final all-angle quality acceptance from this headless test."]}
	var file=FileAccess.open("res://selected-production/reports/tail-check.json",FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"));print("TAIL_PHYSICS_CHECK ",JSON.stringify({"pass":passed,"checks":checks,"gravity_drop":gravity_drop,"contact_probe_samples":contacts,"joint_gap":tail.maximum_joint_gap_m,"render_gap":tail.maximum_render_vs_body_gap_m,"mesh_move":max_mesh_move}))
	quit(0 if passed else 1)
