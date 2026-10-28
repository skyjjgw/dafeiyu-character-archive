extends "res://selected-production/garment/minimal-check.gd"

func build_layer(reader:Node3D,layer:Dictionary,stiffness:float)->Dictionary:
	var source=reader.vec3(layer.solver.positionsNeutralRoot)
	for i in source.size():source[i]=.35*(source[i]+Vector3(0,1.055,0))
	var original:PackedInt32Array=reader.data(layer.solver.triangles)
	var cw=reader.godot_indices(original);var source_to_engine=PackedInt32Array();source_to_engine.resize(source.size());source_to_engine.fill(-1)
	var engine_to_source=PackedInt32Array();var indices=PackedInt32Array()
	for value in cw:
		if source_to_engine[value]<0:source_to_engine[value]=engine_to_source.size();engine_to_source.append(value)
		indices.append(source_to_engine[value])
	var points=PackedVector3Array();for value in engine_to_source:points.append(source[value])
	var arrays=[];arrays.resize(Mesh.ARRAY_MAX);arrays[Mesh.ARRAY_VERTEX]=points;arrays[Mesh.ARRAY_INDEX]=indices
	var mesh=ArrayMesh.new();mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays)
	var body=SoftBody3D.new();body.name="Topology_"+str(layer.id)+"_k"+str(stiffness);body.mesh=mesh;body.collision_layer=0;body.collision_mask=0;body.total_mass=.08 if layer.id=="outer" else .035;body.linear_stiffness=stiffness;body.damping_coefficient=.12;body.simulation_precision=8;body.pressure_coefficient=0;body.visible=false;root.add_child(body)
	var pins:PackedInt32Array=reader.data(layer.solver.waistPins)
	for i in pins:body.set_point_pinned(source_to_engine[i],true)
	var pin_map_ok=true
	for i in source.size():pin_map_ok=pin_map_ok and body.is_point_pinned(source_to_engine[i])==pins.has(i)
	return {"id":layer.id,"body":body,"source":source,"rest":source.duplicate(),"indices":original,"mapping":source_to_engine,"width":pins.size(),"stiffness":stiffness,"translated":false,"pin_map_ok":pin_map_ok,"frames":[]}

func run()->void:
	var reader=load("res://selected-production/garment/adapter.gd").new();reader.spec=JSON.parse_string(FileAccess.get_file_as_string("res://selected-production/garment/assets/component.json"));reader.bytes=FileAccess.get_file_as_bytes("res://selected-production/garment/assets/component.bin")
	for layer in reader.spec.layers:
		for stiffness in [.9,1.0]:trials.append(build_layer(reader,layer,stiffness))
	for trial in trials:sample(trial,0)
	for tick in range(1,241):
		await physics_frame
		if tick in [1,10,60,240]:
			for trial in trials:sample(trial,tick)
	var records=[]
	for trial in trials:records.append({"id":trial.id,"vertices":trial.source.size(),"stiffness":trial.stiffness,"pin_map_ok":trial.pin_map_ok,"mass_kg":trial.body.total_mass,"pressure":trial.body.pressure_coefficient,"precision":trial.body.simulation_precision,"frames":trial.frames})
	var file=FileAccess.open("res://selected-production/garment/reports/topology-check.json",FileAccess.WRITE);file.store_string(JSON.stringify({"completed":true,"source":"Actual official Godot 4.7.2 Jolt SoftBody3D on full frozen garment neutral canonical topology, no native material kernel, no collisions, no free-point writes","trials":records},"\t"));print("GARMENT_TOPOLOGY_DONE")
	reader.free()
	for trial in trials:trial.body.queue_free()
	quit(0)
