extends SceneTree

func _initialize()->void:call_deferred("run")

func run()->void:
	var args=OS.get_cmdline_user_args();var duration=4.0;var report_name="native-check"
	for arg in args:
		if arg.begins_with("--duration="):duration=float(arg.trim_prefix("--duration="))
		if arg.begins_with("--report="):report_name=arg.trim_prefix("--report=")
	var scene=load("res://selected-production/current.tscn").instantiate();root.add_child(scene)
	await process_frame
	if not scene.is_character_ready():quit(1);return
	var garment=load("res://selected-production/garment/adapter.gd").new();scene.add_child(garment)
	var setup:Dictionary=garment.setup(scene.actor,scene.asset,{"material":not "--no-material" in args,"collisions":not "--no-collisions" in args})
	if not setup.ok:push_error("Garment integration failed: "+str(setup));quit(1);return
	var started=Time.get_ticks_usec();var finite=true;var minimum_y=INF;var maximum_y=-INF;var samples=[];var thresholds=[0.0,.01,.05,.25,1.0,2.0,4.0];var install_age=scene.actor.age
	while scene.actor.age-install_age<duration:
		await physics_frame
		for layer in garment.layers:
			for index in layer.points.size():
				var p=layer.body.get_point_transform(layer.sourceToEngine[index]);finite=finite and p.is_finite();minimum_y=minf(minimum_y,p.y);maximum_y=maxf(maximum_y,p.y)
		if not thresholds.is_empty() and scene.actor.age-install_age>=thresholds[0]:
			samples.append(diagnostics(garment,scene.actor.age-install_age));thresholds.pop_front()
	var snapshot=garment.snapshot()
	var checks={"two_real_softbodies":snapshot.layers.size()==2,"all_points_finite":finite,"waist_pins_under_1mm":snapshot.maximum_pin_error_m<.001,"world_bounds_reasonable":minimum_y>-.02 and maximum_y<1.5,"no_free_point_pose_targets":not snapshot.free_points_pose_targets}
	var passed=true;for value in checks.values():passed=passed and value
	var report={"schema":"dafeiyu.selected-garment-native-integration.v1","completed":true,"pass":passed,"scope":"Boundary wiring only, not cloth shape/contact/material acceptance","headless":DisplayServer.get_name()=="headless","checks":checks,"setup":setup,"snapshot":snapshot,"samples":samples,"world_y_bounds":[minimum_y,maximum_y],"wall_seconds":(Time.get_ticks_usec()-started)/1000000.0,"simulated_seconds":scene.actor.age,"visual_pass":false,"contact_or_selfcollision_pass":false}
	var file=FileAccess.open("res://selected-production/garment/reports/"+report_name+".json",FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"));print("GARMENT_NATIVE_CHECK ",JSON.stringify({"pass":passed,"checks":checks,"pin_error":snapshot.maximum_pin_error_m,"displacement":snapshot.maximum_displacement_from_initial_world_m,"bounds":[minimum_y,maximum_y]}))
	garment.dispose();garment.queue_free();quit(0 if passed else 1)

func diagnostics(garment:Node3D,age:float)->Dictionary:
	var records=[]
	for layer in garment.layers:
		var points=PackedVector3Array();var displacement=0.0;var minimum=Vector3(INF,INF,INF);var maximum=Vector3(-INF,-INF,-INF);var min_ratio=INF;var max_ratio=0.0
		for i in layer.rest.size():
			var p:Vector3=layer.body.get_point_transform(layer.sourceToEngine[i]);points.append(p);displacement=maxf(displacement,p.distance_to(layer.rest[i]));minimum=minimum.min(p);maximum=maximum.max(p)
		for i in range(0,layer.indices.size(),3):
			for edge in 3:
				var a=layer.indices[i+edge];var b=layer.indices[i+(edge+1)%3];var ratio=points[a].distance_to(points[b])/layer.rest[a].distance_to(layer.rest[b]);min_ratio=minf(min_ratio,ratio);max_ratio=maxf(max_ratio,ratio)
		records.append({"id":layer.id,"max_displacement_m":displacement,"edge_ratio":[min_ratio,max_ratio],"bounds_min":[minimum.x,minimum.y,minimum.z],"bounds_max":[maximum.x,maximum.y,maximum.z]})
	return {"age":age,"layers":records}
