extends "res://selected-production/garment/minimal-check.gd"

var sphere_center=Vector3(0,.27,.08)
var sphere_radius=.065

func horizontal_grid(contact:bool)->Dictionary:
	var width=5;var source=PackedVector3Array();var source_indices=PackedInt32Array()
	for row in width:
		for col in width:source.append(Vector3(float(col)*.2/(width-1)-.1,.4,float(row)*.2/(width-1)))
	for row in width-1:
		for col in width-1:
			var a=row*width+col;var b=a+1;var c=a+width;source_indices.append_array(PackedInt32Array([a,c,b,b,c,c+1]))
	var mapping=PackedInt32Array();mapping.resize(source.size());mapping.fill(-1);var encounter=PackedInt32Array();var indices=PackedInt32Array()
	for value in source_indices:
		if mapping[value]<0:mapping[value]=encounter.size();encounter.append(value)
		indices.append(mapping[value])
	var points=PackedVector3Array();for i in encounter:points.append(source[i])
	var arrays=[];arrays.resize(Mesh.ARRAY_MAX);arrays[Mesh.ARRAY_VERTEX]=points;arrays[Mesh.ARRAY_INDEX]=indices;var mesh=ArrayMesh.new();mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays)
	var body=SoftBody3D.new();body.name="ContactEnabled" if contact else "NoContactControl";body.mesh=mesh;body.collision_layer=8;body.collision_mask=2 if contact else 0;body.total_mass=.01;body.linear_stiffness=.9;body.damping_coefficient=.12;body.simulation_precision=12;body.pressure_coefficient=0;body.visible=false;root.add_child(body)
	# Godot 4.7 sets Jolt mVertexRadius only while leaving an existing space.
	# Re-enter once before the first simulated tick, before pin assignment;
	# no later free vertex state is reset or posed by this initialization.
	var space=body.get_world_3d().space;PhysicsServer3D.soft_body_set_space(body.get_physics_rid(),RID());PhysicsServer3D.soft_body_set_space(body.get_physics_rid(),space)
	for i in width:body.set_point_pinned(mapping[i],true)
	return {"body":body,"source":source,"rest":source.duplicate(),"indices":source_indices,"mapping":mapping,"width":width,"stiffness":.9,"translated":false,"pin_map_ok":true,"frames":[],"contact":contact,"minimum_sphere_clearance_m":INF,"near_contact_samples":0}

func run()->void:
	var radius_setting="physics/jolt_physics_3d/simulation/soft_body_point_radius";var original=ProjectSettings.get_setting(radius_setting);ProjectSettings.set_setting(radius_setting,.0035);ProjectSettings.emit_signal("settings_changed")
	var sphere=StaticBody3D.new();sphere.name="ActualSphereObstacle";sphere.collision_layer=2;sphere.collision_mask=8;sphere.position=sphere_center;var collision=CollisionShape3D.new();var shape=SphereShape3D.new();shape.radius=sphere_radius;collision.shape=shape;sphere.add_child(collision);root.add_child(sphere)
	trials=[horizontal_grid(true),horizontal_grid(false)]
	for trial in trials:sample(trial,0)
	for tick in range(1,361):
		await physics_frame
		for trial in trials:
			for i in range(trial.width,trial.source.size()):
				var p:Vector3=trial.body.get_point_transform(trial.mapping[i]);var clearance=p.distance_to(sphere_center)-sphere_radius;trial.minimum_sphere_clearance_m=minf(trial.minimum_sphere_clearance_m,clearance)
				if absf(clearance-.0035)<.001:trial.near_contact_samples+=1
		if tick in [1,10,60,240,360]:
			for trial in trials:sample(trial,tick)
	var checks={"enabled_vertices_not_inside_sphere":trials[0].minimum_sphere_clearance_m>-.0001,"disabled_control_crosses_sphere":trials[1].minimum_sphere_clearance_m<-.005,"sphere_contact_observed":trials[0].near_contact_samples>0,"configured_radius_observed_within_10micrometres":absf(trials[0].minimum_sphere_clearance_m-.0035)<.00001,"pins_under_1micrometre":trials[0].frames[-1].pin_error_m<.000001,"edges_under_1percent":trials[0].frames[-1].edge_ratio[1]<1.01};var passed=true;for value in checks.values():passed=passed and value
	var records=[]
	for trial in trials:records.append({"contact":trial.contact,"minimum_sphere_clearance_m":trial.minimum_sphere_clearance_m,"near_configured_radius_samples":trial.near_contact_samples,"frames":trial.frames})
	var file=FileAccess.open("res://selected-production/garment/reports/contact-check.json",FileAccess.WRITE);file.store_string(JSON.stringify({"completed":true,"pass":passed,"checks":checks,"configured_point_radius_m":.0035,"scope":"Actual 25-point Jolt SoftBody versus actual static sphere, compared with collision-disabled control. Only discrete vertex sphere separation, not garment self/cross-layer/continuous triangle proof.","trials":records},"\t"));print("GARMENT_CONTACT_CHECK ",JSON.stringify({"pass":passed,"checks":checks,"clearance_enabled":trials[0].minimum_sphere_clearance_m,"clearance_control":trials[1].minimum_sphere_clearance_m}))
	ProjectSettings.set_setting(radius_setting,original);ProjectSettings.emit_signal("settings_changed")
	for trial in trials:trial.body.queue_free()
	sphere.queue_free();quit(0 if passed else 1)
