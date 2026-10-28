extends SceneTree

var trials:Array=[]
var tick=0
var ticks=240
var hz=240.0
var scale_k=1.0
var report_name="jolt-240hz-1s"
var failed=false
var started=0
var loader:RefCounted
var fixture_set="garment"

func _initialize()->void:call_deferred("run")

func run()->void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--hz="):hz=float(arg.trim_prefix("--hz="))
		if arg.begins_with("--duration="):ticks=int(float(arg.trim_prefix("--duration="))*hz)
		if arg.begins_with("--k-scale="):scale_k=float(arg.trim_prefix("--k-scale="))
		if arg.begins_with("--report="):report_name=arg.trim_prefix("--report=")
		if arg.begins_with("--fixture="):fixture_set=arg.trim_prefix("--fixture=")
	Engine.physics_ticks_per_second=int(hz)
	ProjectSettings.set_setting("physics/jolt_physics_3d/simulation/soft_body_point_radius",.0035);ProjectSettings.emit_signal("settings_changed")
	load("res://selected_implicit_cloth.gdextension");loader=load("res://probe_data.gd").new()
	var fixtures=[loader.garment("outer"),loader.garment("lining")]
	for fixture in fixtures:
		trials.append(build(fixture,false));trials.append(build(fixture,true))
	started=Time.get_ticks_usec()
	# physics_frame is emitted immediately before the material callback and
	# subsequent backend step. Sample the completed preceding step consistently.
	physics_frame.connect(on_physics)

func build(fixture:Dictionary,material:bool)->Dictionary:
	var winding:PackedInt32Array=fixture.indices.duplicate()
	for i in range(0,winding.size(),3):var b=winding[i+1];winding[i+1]=winding[i+2];winding[i+2]=b
	var mapping=PackedInt32Array();mapping.resize(fixture.points.size());mapping.fill(-1)
	var engine_to_source=PackedInt32Array();var indices=PackedInt32Array()
	for id in winding:
		if mapping[id]<0:mapping[id]=engine_to_source.size();engine_to_source.append(id)
		indices.append(mapping[id])
	var engine_points=PackedVector3Array()
	for id in engine_to_source:engine_points.append(fixture.points[id])
	var arrays=[];arrays.resize(Mesh.ARRAY_MAX);arrays[Mesh.ARRAY_VERTEX]=engine_points;arrays[Mesh.ARRAY_INDEX]=indices
	var mesh=ArrayMesh.new();mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays)
	var body=SoftBody3D.new();body.mesh=mesh;body.collision_layer=0;body.collision_mask=0;body.total_mass=fixture.mass;body.linear_stiffness=.9;body.damping_coefficient=.12;body.simulation_precision=8;body.pressure_coefficient=0;body.visible=false;root.add_child(body)
	body.disable_mode=SoftBody3D.DISABLE_MODE_KEEP_ACTIVE
	# Construction-only reentry copies configured radius before any pins/steps.
	var initial_space=body.get_world_3d().space;PhysicsServer3D.soft_body_set_space(body.get_physics_rid(),RID());PhysicsServer3D.soft_body_set_space(body.get_physics_rid(),initial_space)
	for id in fixture.pins:body.set_point_pinned(mapping[id],true)
	for id in fixture.points.size():
		if body.is_point_pinned(mapping[id])!=(id in fixture.pins):failed=true;push_error("pin mapping mismatch")
	var inv:PackedFloat64Array=loader.inverse_masses(fixture);var kernel=ClassDB.instantiate("SelectedImplicitClothBending")
	var setup:Dictionary=kernel.configure(fixture.points,fixture.indices,inv,fixture.k*scale_k,fixture.c,256,1e-8)
	if not setup.ok:push_error(str(setup));failed=true
	return {"name":fixture.name+("_implicit" if material else "_no_bending"),"fixture":fixture,"material":material,"body":body,"map":mapping,"kernel":kernel,"setup":setup,"inverse_masses":inv,"previous":fixture.points.duplicate(),"samples":[],"per_tick":[],"times":[],"max_iterations":0,"max_relative_residual":0.0,"max_impulse_ns":0.0,"max_delta_velocity_mps":0.0,"max_linear_balance_error_j":0.0,"peak_estimated_kinetic_j":0.0,"peak_bending_energy_j":0.0,"max_material_angular_momentum_nms":0.0,"min_edge_ratio":1.0,"max_edge_ratio":1.0,"max_pin_error_m":0.0,"max_displacement_m":0.0,"sample_count":0}

func on_physics()->void:
	var dt=1.0/hz
	for trial in trials:
		var f:Dictionary=trial.fixture;var points=PackedVector3Array();var velocity=PackedVector3Array()
		for id in f.points.size():
			var p:Vector3=trial.body.get_point_transform(trial.map[id]);points.append(p);velocity.append((p-trial.previous[id])/dt if tick>0 else Vector3.ZERO)
		if not all_finite(points):failed=true;push_error("nonfinite Jolt positions "+trial.name);finish();return
		var sample_tick=tick in [0,1,3,12,60,120,240,480,720,960] or tick==ticks
		# All edge lengths checked each tick; bounds/shape snapshots are sparse.
		var edge_min=INF;var edge_max=0.0;var edge_length_min=INF;var edge_length_max=0.0;var displacement=0.0;var pin_error=0.0
		for i in range(0,f.indices.size(),3):
			for j in 3:
				var a=f.indices[i+j];var b=f.indices[i+(j+1)%3];var length_m=points[a].distance_to(points[b]);var ratio=length_m/f.points[a].distance_to(f.points[b]);edge_min=minf(edge_min,ratio);edge_max=maxf(edge_max,ratio);edge_length_min=minf(edge_length_min,length_m);edge_length_max=maxf(edge_length_max,length_m)
		for id in f.points.size():displacement=maxf(displacement,points[id].distance_to(f.points[id]))
		for id in f.pins:pin_error=maxf(pin_error,points[id].distance_to(f.points[id]))
		trial.min_edge_ratio=minf(trial.min_edge_ratio,edge_min);trial.max_edge_ratio=maxf(trial.max_edge_ratio,edge_max);trial.max_pin_error_m=maxf(trial.max_pin_error_m,pin_error);trial.max_displacement_m=maxf(trial.max_displacement_m,displacement)
		trial.per_tick.append({"tick":tick,"time_s":tick/hz,"edge_ratio":[edge_min,edge_max],"edge_length_m":[edge_length_min,edge_length_max],"max_displacement_m":displacement,"pin_error_m":pin_error})
		if sample_tick:trial.samples.append({"tick":tick,"time_s":tick/hz,"edge_ratio":[edge_min,edge_max],"edge_length_m":[edge_length_min,edge_length_max],"max_displacement_m":displacement,"pin_error_m":pin_error,"positions":loader.triples(points) if tick==ticks else []})
		if trial.material and tick<ticks:
			var begin=Time.get_ticks_usec();var result:Dictionary=trial.kernel.step(points,velocity,dt);trial.times.append((Time.get_ticks_usec()-begin)/1000.0)
			if not result.ok:failed=true;trial.failure=result;push_error("Implicit step failed "+trial.name+" "+str(result));finish();return
			trial.per_tick[-1].material={"iterations":result.iterations,"relative_residual":result.relative_residual,"kernel_ms":trial.times[-1],"max_impulse_ns":result.max_impulse_ns,"max_delta_velocity_mps":result.max_delta_velocity_mps}
			trial.max_iterations=maxi(trial.max_iterations,result.iterations);trial.max_relative_residual=maxf(trial.max_relative_residual,result.relative_residual);trial.max_impulse_ns=maxf(trial.max_impulse_ns,result.max_impulse_ns);trial.max_delta_velocity_mps=maxf(trial.max_delta_velocity_mps,result.max_delta_velocity_mps);trial.max_linear_balance_error_j=maxf(trial.max_linear_balance_error_j,abs(result.linear_energy_balance_error_j));trial.peak_estimated_kinetic_j=maxf(trial.peak_estimated_kinetic_j,result.kinetic_before_j);trial.peak_bending_energy_j=maxf(trial.peak_bending_energy_j,result.energy_j);trial.max_material_angular_momentum_nms=maxf(trial.max_material_angular_momentum_nms,result.internal_net_angular_impulse_nms.length())
			for id in points.size():
				if trial.inverse_masses[id]>0 and result.impulses[id].length_squared()>0:trial.body.apply_impulse(trial.map[id],result.impulses[id])
		trial.previous=points;trial.sample_count+=1
	tick+=1
	if tick>ticks:finish()

func all_finite(points:PackedVector3Array)->bool:
	for p in points:
		if not p.is_finite():return false
	return true

func finish()->void:
	physics_frame.disconnect(on_physics)
	var reports=[]
	for trial in trials:
		var times:Array=trial.times.duplicate();times.sort();var row=trial.duplicate();row.erase("body");row.erase("kernel");row.erase("previous");row.erase("map");row.erase("inverse_masses");row.erase("times")
		row.fixture={"vertices":trial.fixture.points.size(),"triangles":trial.fixture.indices.size()/3,"pins":trial.fixture.pins.size(),"mass_kg":trial.fixture.mass,"k_j_per_rad2":trial.fixture.k*scale_k,"c_js_per_rad2":trial.fixture.c,"free_point_mass_kg":trial.fixture.mass/trial.fixture.points.size(),"free_inverse_mass_per_kg":trial.fixture.points.size()/trial.fixture.mass,"mass_distribution":"Jolt uniform all points before zeroing pins; independently impulse-calibrated on this LoD"}
		row.material_time_ms={"count":times.size(),"mean":times.reduce(func(a,b):return a+b,0.0)/maxi(times.size(),1),"p95":times[int(.95*(times.size()-1))] if not times.is_empty() else 0,"max":times[-1] if not times.is_empty() else 0}
		row.bounded_diagnostic_pass=not failed and row.min_edge_ratio>.85 and row.max_edge_ratio<1.15 and row.max_pin_error_m<1e-5
		reports.append(row);print("JOLT_TRIAL ",trial.name," edge=",row.min_edge_ratio,",",row.max_edge_ratio," displacement=",row.max_displacement_m," ms=",row.material_time_ms.mean," iterations=",row.max_iterations)
		trial.body.queue_free()
	loader.write_report("res://../reports/"+report_name+".json",{"completed":not failed,"backend":"Godot 4.7.2 official Jolt SoftBody3D","solver":"Global frozen-gradient implicit bending impulse + Jolt XPBD membrane","scope":"672-point LoD bounded no-contact computational/numerical diagnostic; same old uniform hinge k/c and total mass are NOT continuum-calibrated material equivalence", "configured_point_radius_m":.0035,"radius_initialization":"one construction space reentry before pins; contact disabled, radius not measured by this experiment", "physics_step_budget_ms":1000.0/hz,"cpu_only":true,"gpu_enabled":false,"ccd_tested":false,"velocity_provenance":"Whole-tick sampled average (x_now-x_previous)/dt; NOT exact Jolt last-substep velocity; first sample zero","dt_s":1.0/hz,"simulated_seconds":minf(tick-1,ticks)/hz,"wall_seconds":(Time.get_ticks_usec()-started)/1000000.0,"free_positions_written":false,"impulses_capped":false,"self_contact":false,"interlayer_contact":false,"collision_pass":false,"physical_acceptance":false,"visual_acceptance":false,"trials":reports})
	quit(1 if failed else 0)
