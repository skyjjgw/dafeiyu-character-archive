extends SceneTree

class Monitor extends Node:
	var scene:Node3D
	var actor:CharacterBody3D
	var actions:Array=[]
	var previous:Dictionary={}
	var previous_velocity=Vector3.ZERO
	var cancel_until=0.0
	var cancel_max_delta=0.0
	var velocity_jump=0.0
	var floor_min=INF
	var frame_groups:Dictionary={}
	var physics_count=0
	var started_us=0
	var finished=false
	var cancel_worst:Dictionary={}
	var max_delta=0.0
	var all_worst:Dictionary={}
	var images:Dictionary={}
	var headless_run=false
	func _ready()->void:
		process_physics_priority=10
		headless_run=DisplayServer.get_name()=="headless"
		started_us=Time.get_ticks_usec()
		actions=[[.4,"wave"],[.95,"cancel"],[1.6,"wave"],[2.3,"cancel"],[3.0,"wave"],[5.4,"cancel"],[6.0,"check"],[18.0,"check"],[22.0,"cancel"],[24.0,"turn180"],[28.0,"cancel"]]
	func _physics_process(delta:float)->void:
		if finished:return
		physics_count+=1
		if not actions.is_empty() and actor.age>=float(actions[0][0]):
			var command=actions.pop_front()
			if command[1]=="wave":actor.request_wave()
			if command[1]=="check":actor.action_check()
			if command[1]=="turn180":actor.desired_heading=actor.rotation.y+PI
			if command[1]=="cancel":actor.cancel("stress_interrupt");cancel_until=actor.age+.08
		for key in actor.rig.ids:
			var q=actor.rig.skeleton.get_bone_pose_rotation(actor.rig.ids[key])
			if previous.has(key):
				var every_change=previous[key].angle_to(q)
				if every_change>max_delta:max_delta=every_change;all_worst={"bone":key,"time":actor.age,"delta":every_change,"active_swing":actor.active_side,"pose":actor.rig.last_pose.duplicate(true)}
			if actor.age<=cancel_until and previous.has(key):
				var change=previous[key].angle_to(q)
				if change>cancel_max_delta:cancel_max_delta=change;cancel_worst={"bone":key,"time":actor.age,"delta":change,"active_swing":actor.active_side,"pose":actor.rig.last_pose.duplicate(true)}
			previous[key]=q
		velocity_jump=maxf(velocity_jump,Vector2(actor.velocity.x-previous_velocity.x,actor.velocity.z-previous_velocity.z).length())
		previous_velocity=actor.velocity
		floor_min=minf(floor_min,actor.global_position.y)
		if actor.age>31:finish()
	func _process(delta:float)->void:
		if actor.age<1 or finished:return
		if not headless_run:
			for stage in [[3.14,"face-half"],[3.2,"face-closed"],[4.3,"stress-wave"]]:
				if actor.age>=float(stage[0]) and not images.has(stage[1]):images[stage[1]]=true;scene.capture(stage[1])
		var category="turn" if absf(actor.angular_velocity)>.05 else "walk" if Vector2(actor.velocity.x,actor.velocity.z).length()>.02 else "wave" if actor.rig.wave>.1 else "idle"
		if not frame_groups.has(category):frame_groups[category]=[]
		frame_groups[category].append(delta)
	func finish()->void:
		finished=true
		var performance={}
		for group in frame_groups:
			var values:Array=frame_groups[group];var sorted=values.duplicate();sorted.sort();var total=0.0
			for value in values:total+=value
			performance[group]={"frames":values.size(),"wall_fps":values.size()/total,"frame_ms_p95":sorted[int((sorted.size()-1)*.95)]*1000}
		var checks={"bone_length_under_0_02mm":actor.rig.max_bone_length_error<.00002,"support_slip_under_1mm":actor.rig.max_support_slip<.001,"cancel_delta_under_0_05rad_per_tick":cancel_max_delta<.05,"all_pose_delta_under_0_05rad_per_tick":max_delta<.05,"velocity_delta_under_0_005m_s_per_tick":velocity_jump<.005,"root_floor_penetration_under_1mm":floor_min>-.001,"jerk_bounded_3_01m_s3":actor.max_jerk<3.01}
		var okay=true;for value in checks.values():okay=okay and value
		var result={"scope":"Headless real-time rig/physics control checks only; no GPU/render/visual acceptance" if headless_run else "Real-time original-appearance rig control checks; not visual/full-anatomy/dynamic-balance acceptance","headless":headless_run,"gpu_rendered":not headless_run,"fixed_fps_used":false,"wall_seconds":(Time.get_ticks_usec()-started_us)/1000000.0,"simulated_seconds":actor.age,"physics_ticks":physics_count,"performance":performance,"performance_scope":"CPU/dummy-renderer loop; these FPS are not rendered-character FPS" if headless_run else "Actual GPU scene loop with max-FPS cap 60","checks":checks,"pass":okay,"max_cancel_bone_delta_rad":cancel_max_delta,"cancel_worst":cancel_worst,"max_all_bone_delta_rad":max_delta,"all_worst":all_worst,"max_horizontal_velocity_delta_per_tick":velocity_jump,"min_root_y":floor_min,"actor":actor.snapshot()}
		var file=FileAccess.open("res://reports/motion-headless-checks.json" if headless_run else "res://reports/motion-real-time-checks.json",FileAccess.WRITE);file.store_string(JSON.stringify(result,"\t"))
		print("MOTION_CHECKS ",JSON.stringify({"pass":okay,"checks":checks,"performance":performance,"cancel_delta":cancel_max_delta,"support_slip":actor.rig.max_support_slip}))
		get_tree().quit(0 if okay else 1)

func _initialize()->void:
	call_deferred("run")

func run()->void:
	var scene=load("res://motion.tscn").instantiate()
	root.add_child(scene)
	await process_frame
	var monitor=Monitor.new();monitor.scene=scene;monitor.actor=scene.actor;root.add_child(monitor)
