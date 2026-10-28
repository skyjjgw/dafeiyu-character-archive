extends SceneTree

var trials:Array=[]

func _initialize()->void:call_deferred("run")

func build_grid(width:int, stiffness:float, translated:bool=false)->Dictionary:
	var source=PackedVector3Array();var original=PackedInt32Array()
	for row in width:
		for col in width:source.append(Vector3(float(col)*.2/(width-1)-.1,.65-float(row)*.2/(width-1),.1))
	for row in width-1:
		for col in width-1:
			var a=row*width+col;var b=a+1;var c=a+width;var d=c+1
			original.append_array(PackedInt32Array([a,c,b,b,c,d]))
	var source_to_engine=PackedInt32Array();source_to_engine.resize(source.size());source_to_engine.fill(-1)
	var engine_to_source=PackedInt32Array();var indices=PackedInt32Array()
	for value in original:
		if source_to_engine[value]<0:source_to_engine[value]=engine_to_source.size();engine_to_source.append(value)
		indices.append(source_to_engine[value])
	var points=PackedVector3Array();for value in engine_to_source:points.append(source[value])
	var arrays=[];arrays.resize(Mesh.ARRAY_MAX);arrays[Mesh.ARRAY_VERTEX]=points;arrays[Mesh.ARRAY_INDEX]=indices
	var mesh=ArrayMesh.new();mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays)
	var body=SoftBody3D.new();body.name="Grid_"+str(width)+"_k"+str(stiffness)+("_translated" if translated else "");body.mesh=mesh;body.collision_layer=0;body.collision_mask=0;body.total_mass=.08;body.linear_stiffness=stiffness;body.damping_coefficient=.12;body.simulation_precision=8;body.pressure_coefficient=0;body.visible=false
	if translated:body.position=Vector3(.4,.1,.3)
	root.add_child(body)
	var rest=PackedVector3Array();for value in source:rest.append(body.global_transform*value)
	for i in width:body.set_point_pinned(source_to_engine[i],true)
	var pin_map_ok=true
	for i in source.size():pin_map_ok=pin_map_ok and body.is_point_pinned(source_to_engine[i])==(i<width)
	return {"body":body,"source":source,"rest":rest,"indices":original,"mapping":source_to_engine,"width":width,"stiffness":stiffness,"translated":translated,"pin_map_ok":pin_map_ok,"frames":[]}

func sample(trial:Dictionary,tick:int)->Dictionary:
	var points=PackedVector3Array();var initial_error=0.0;var pin_error=0.0;var minimum=Vector3(INF,INF,INF);var maximum=Vector3(-INF,-INF,-INF);var max_ratio=0.0;var min_ratio=INF
	for i in trial.source.size():
		var p:Vector3=trial.body.get_point_transform(trial.mapping[i]);points.append(p);minimum=minimum.min(p);maximum=maximum.max(p)
		initial_error=maxf(initial_error,p.distance_to(trial.rest[i]));if i<trial.width:pin_error=maxf(pin_error,p.distance_to(trial.rest[i]))
	for i in range(0,trial.indices.size(),3):
		for e in 3:
			var a=trial.indices[i+e];var b=trial.indices[i+(e+1)%3];var ratio=points[a].distance_to(points[b])/trial.rest[a].distance_to(trial.rest[b]);max_ratio=maxf(max_ratio,ratio);min_ratio=minf(min_ratio,ratio)
	var record={"tick":tick,"max_displacement_m":initial_error,"pin_error_m":pin_error,"edge_ratio":[min_ratio,max_ratio],"bounds_min":[minimum.x,minimum.y,minimum.z],"bounds_max":[maximum.x,maximum.y,maximum.z],"first_point":[points[0].x,points[0].y,points[0].z],"last_point":[points[-1].x,points[-1].y,points[-1].z]}
	trial.frames.append(record);return record

func run()->void:
	for width in [2,4]:
		for stiffness in [.0,.9,1.0]:trials.append(build_grid(width,stiffness))
	trials.append(build_grid(4,.9,true))
	for trial in trials:sample(trial,0)
	for tick in range(1,241):
		await physics_frame
		if tick in [1,10,60,240]:
			for trial in trials:sample(trial,tick)
	var records=[];var pass_boundary=true
	for trial in trials:
		var row={"width":trial.width,"vertices":trial.source.size(),"stiffness":trial.stiffness,"translated":trial.translated,"pin_map_ok":trial.pin_map_ok,"mass_kg":trial.body.total_mass,"pressure":trial.body.pressure_coefficient,"precision":trial.body.simulation_precision,"frames":trial.frames};records.append(row);pass_boundary=pass_boundary and trial.pin_map_ok and trial.frames[0].max_displacement_m<1e-6 and trial.frames[-1].pin_error_m<1e-6
	var file=FileAccess.open("res://selected-production/garment/reports/minimal-check.json",FileAccess.WRITE);file.store_string(JSON.stringify({"completed":true,"pass_boundary_only":pass_boundary,"source":"Actual official Godot 4.7.2 Jolt SoftBody3D, no native material kernel, no collisions, no free-point writes","trials":records},"\t"))
	print("GARMENT_MINIMAL_DONE ",pass_boundary)
	for trial in trials:trial.body.queue_free()
	quit(0 if pass_boundary else 1)
