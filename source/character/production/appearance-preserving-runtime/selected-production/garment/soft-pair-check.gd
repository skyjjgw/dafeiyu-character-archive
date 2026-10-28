extends SceneTree

var sheets:Array=[]

func _initialize()->void:call_deferred("run")

func sheet(center:Vector3,pinned:bool,layer:int,mask:int)->Dictionary:
	var points=PackedVector3Array();var original=PackedInt32Array()
	for row in 4:
		for col in 4:points.append(center+Vector3(float(col)*.2/3-.1,0,float(row)*.2/3-.1))
	for row in 3:
		for col in 3:
			var a=row*4+col;var c=a+4;original.append_array(PackedInt32Array([a,c,a+1,a+1,c,c+1]))
	var mapping=PackedInt32Array();mapping.resize(points.size());mapping.fill(-1);var encounter=PackedInt32Array();var indices=PackedInt32Array()
	for id in original:
		if mapping[id]<0:mapping[id]=encounter.size();encounter.append(id)
		indices.append(mapping[id])
	var native_points=PackedVector3Array();for id in encounter:native_points.append(points[id])
	var arrays=[];arrays.resize(Mesh.ARRAY_MAX);arrays[Mesh.ARRAY_VERTEX]=native_points;arrays[Mesh.ARRAY_INDEX]=indices;var mesh=ArrayMesh.new();mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays)
	var body=SoftBody3D.new();body.mesh=mesh;body.collision_layer=layer;body.collision_mask=mask;body.total_mass=.01;body.linear_stiffness=.9;body.simulation_precision=8;body.damping_coefficient=.12;body.pressure_coefficient=0;body.visible=false;root.add_child(body)
	var space=body.get_world_3d().space;PhysicsServer3D.soft_body_set_space(body.get_physics_rid(),RID());PhysicsServer3D.soft_body_set_space(body.get_physics_rid(),space)
	if pinned:
		for id in points.size():body.set_point_pinned(mapping[id],true)
	var record={"body":body,"mapping":mapping,"pinned":pinned,"min_y":center.y,"max_y":center.y,"samples":[]};sheets.append(record);return record

func run()->void:
	var key="physics/jolt_physics_3d/simulation/soft_body_point_radius";var previous=ProjectSettings.get_setting(key);ProjectSettings.set_setting(key,.0035);ProjectSettings.emit_signal("settings_changed")
	var soft_support=sheet(Vector3(0,.3,0),true,128,8)
	var soft_drop=sheet(Vector3(0,.6,0),false,8,128)
	var rigid=StaticBody3D.new();rigid.collision_layer=2;rigid.collision_mask=8;rigid.position=Vector3(1,.295,0);var collision=CollisionShape3D.new();var shape=BoxShape3D.new();shape.size=Vector3(.6,.01,.6);collision.shape=shape;rigid.add_child(collision);root.add_child(rigid)
	var rigid_drop=sheet(Vector3(1,.6,0),false,8,2)
	for tick in range(1,241):
		await physics_frame
		for entry in sheets:
			var low=INF;var high=-INF
			for id in entry.mapping.size():
				var p:Vector3=entry.body.get_point_transform(entry.mapping[id]);low=minf(low,p.y);high=maxf(high,p.y)
			entry.min_y=minf(entry.min_y,low);entry.max_y=maxf(entry.max_y,high)
			if tick in [1,10,60,120,240]:entry.samples.append({"tick":tick,"lowest_y":low,"highest_y":high})
	var checks={"pinned_soft_support_remains_at_30cm":soft_support.min_y>.299999 and soft_support.max_y<.300001,"enabled_soft_pair_passes_through":soft_drop.min_y<.2,"rigid_control_blocks_same_soft_sheet":rigid_drop.min_y>.2999};var passed=true;for value in checks.values():passed=passed and value
	var file=FileAccess.open("res://selected-production/garment/reports/soft-pair-check.json",FileAccess.WRITE);file.store_string(JSON.stringify({"completed":true,"unsupported_boundary_proven":passed,"checks":checks,"soft_pair":{"layers_masks_mutually_enabled":true,"drop_minimum_y":soft_drop.min_y,"samples":soft_drop.samples},"rigid_control":{"drop_minimum_y":rigid_drop.min_y,"samples":rigid_drop.samples},"scope":"Actual official Godot4.7.2 Jolt; independent SoftBody pair is not narrowphase supported. Passing this negative test proves a limitation, not garment contact acceptance."},"\t"));print("GARMENT_SOFT_PAIR_LIMIT ",JSON.stringify({"proven":passed,"checks":checks,"soft_drop_min_y":soft_drop.min_y,"rigid_control_min_y":rigid_drop.min_y}))
	ProjectSettings.set_setting(key,previous);ProjectSettings.emit_signal("settings_changed")
	for entry in sheets:entry.body.queue_free()
	rigid.queue_free();quit(0 if passed else 1)
