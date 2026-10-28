extends SceneTree
var trials:Array=[]
var tick=0
var loader:RefCounted
const DT=1.0/240.0
const TARGET_DX=.0002
func _initialize()->void:call_deferred("run")
func run()->void:
	loader=load("res://probe_data.gd").new()
	ProjectSettings.set_setting("physics/jolt_physics_3d/simulation/soft_body_point_radius",.0035);ProjectSettings.emit_signal("settings_changed")
	for id in ["outer","lining"]:
		var f:Dictionary=loader.garment(id);var bodies=[];var mapping=PackedInt32Array();mapping.resize(f.points.size());mapping.fill(-1)
		var ep=PackedVector3Array();var ei=PackedInt32Array();var winding:PackedInt32Array=f.indices.duplicate()
		for i in range(0,winding.size(),3):var b=winding[i+1];winding[i+1]=winding[i+2];winding[i+2]=b
		for s in winding:
			if mapping[s]<0:mapping[s]=ep.size();ep.append(f.points[s])
			ei.append(mapping[s])
		for active in [false,true]:
			var arrays=[];arrays.resize(Mesh.ARRAY_MAX);arrays[Mesh.ARRAY_VERTEX]=ep;arrays[Mesh.ARRAY_INDEX]=ei;var mesh=ArrayMesh.new();mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays)
			var body=SoftBody3D.new();body.mesh=mesh;body.total_mass=f.mass;body.linear_stiffness=0;body.damping_coefficient=0;body.simulation_precision=8;body.collision_layer=0;body.collision_mask=0;body.visible=false;root.add_child(body)
			body.disable_mode=SoftBody3D.DISABLE_MODE_KEEP_ACTIVE
			var initial_space=body.get_world_3d().space;PhysicsServer3D.soft_body_set_space(body.get_physics_rid(),RID());PhysicsServer3D.soft_body_set_space(body.get_physics_rid(),initial_space)
			for s in f.pins:body.set_point_pinned(mapping[s],true)
			bodies.append(body)
		trials.append({"fixture":f,"map":mapping,"bodies":bodies,"impulse_ns":TARGET_DX/(DT*(f.points.size()/f.mass)),"initial":[]})
	physics_frame.connect(step)
func step()->void:
	if tick==0:
		for trial in trials:
			for body in trial.bodies:
				var ps=PackedVector3Array()
				for s in trial.fixture.points.size():ps.append(body.get_point_transform(trial.map[s]))
				trial.initial.append(ps)
			for s in trial.fixture.points.size():
				if not (s in trial.fixture.pins):trial.bodies[1].apply_impulse(trial.map[s],Vector3(trial.impulse_ns,0,0))
	elif tick==1:
		var reports=[];var all_pass=true
		for trial in trials:
			var f:Dictionary=trial.fixture;var errors=[];var invs=[];var rows=[];var pin_max=0.0
			for s in f.points.size():
				var active:Vector3=trial.bodies[1].get_point_transform(trial.map[s])-trial.initial[1][s];var control:Vector3=trial.bodies[0].get_point_transform(trial.map[s])-trial.initial[0][s];var delta=active-control
				if s in f.pins:pin_max=maxf(pin_max,delta.length());continue
				var err=delta.distance_to(Vector3(TARGET_DX,0,0));var measured_inv=delta.x/(DT*trial.impulse_ns);errors.append(err);invs.append(measured_inv);rows.append({"source_id":s,"delta_m":[delta.x,delta.y,delta.z],"error_m":err,"measured_inverse_mass_per_kg":measured_inv})
			var kernel_inv=f.points.size()/f.mass;var pass_check=errors.max()<1e-7 and pin_max<1e-7;all_pass=all_pass and pass_check
			reports.append({"layer":f.name,"pass":pass_check,"points":f.points.size(),"pins":f.pins.size(),"tested_free_points":errors.size(),"total_mass_kg":f.mass,"expected_free_point_mass_kg":f.mass/f.points.size(),"kernel_inverse_mass_per_kg":kernel_inv,"measured_inverse_mass_minmax_per_kg":[invs.min(),invs.max()],"max_displacement_error_m":errors.max(),"max_relative_inverse_mass_error":maxf(abs(invs.min()/kernel_inv-1),abs(invs.max()/kernel_inv-1)),"pin_control_difference_m":pin_max,"impulse_per_free_point_ns":trial.impulse_ns,"per_point":rows})
			for body in trial.bodies:body.queue_free()
		loader.write_report("res://../reports/lod-mass-calibration.json",{"completed":true,"pass":all_pass,"backend":"Godot 4.7.2 official Jolt","dt_s":DT,"expected_relative_dx_m":TARGET_DX,"scope":"Every free LoD point receives same canonical N*s impulse, matched control removes common gravity; stiffness/damping/contact disabled; pins retained; one construction radius reentry before pins","kernel_mass_matches_jolt_within_relative_tolerance":.0005,"free_positions_written":false,"trials":reports})
		print("LOD_MASS_CALIBRATION ",all_pass);physics_frame.disconnect(step);quit(0 if all_pass else 1)
	tick+=1
