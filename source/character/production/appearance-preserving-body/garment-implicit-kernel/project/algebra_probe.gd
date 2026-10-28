extends SceneTree

func _initialize()->void:call_deferred("run")

func run()->void:
	load("res://selected_implicit_cloth.gdextension")
	var loader=load("res://probe_data.gd").new();var cases=[];var all_ok=true
	var single={"name":"single","points":PackedVector3Array([Vector3(0,0,0),Vector3(.012,0,0),Vector3(.003,.01,0),Vector3(.007,-.009,0)]),"indices":PackedInt32Array([0,1,2,1,0,3]),"pins":PackedInt32Array([0,1]),"mass":.00016,"k":.00005,"c":.0000002}
	var zero_k=loader.grid(4);zero_k.name="grid4_zero_k";zero_k.k=0
	var zero_c=loader.grid(4);zero_c.name="grid4_zero_c";zero_c.c=0
	var all_free=loader.grid(4);all_free.name="grid4_free";all_free.pins=PackedInt32Array()
	var moving=loader.grid(4);moving.name="grid4_moving_pins"
	for fixture in [single,loader.grid(4),zero_k,zero_c,all_free,moving,loader.garment("outer"),loader.garment("lining")]:
		var kernel=ClassDB.instantiate("SelectedImplicitClothBending");var inv:PackedFloat64Array=loader.inverse_masses(fixture)
		var setup:Dictionary=kernel.configure(fixture.points,fixture.indices,inv,fixture.k,fixture.c,256,1e-8)
		if not setup.ok:push_error(str(setup));quit(1);return
		var points:PackedVector3Array=fixture.points.duplicate();var velocity=PackedVector3Array();velocity.resize(points.size())
		for i in points.size():
			if inv[i]>0:
				points[i]+=Vector3(.0004*sin(i*.47),.0006*cos(i*.19),.0007*sin(i*.31))
				velocity[i]=Vector3(.013*cos(i*.23),.017*sin(i*.11),.023*cos(i*.17))
			elif fixture.name=="grid4_moving_pins":velocity[i]=Vector3(.01,.02,.03)
		var start=Time.get_ticks_usec();var answer:Dictionary=kernel.step(points,velocity,1.0/240.0);var elapsed=(Time.get_ticks_usec()-start)/1000.0
		if not answer.ok:push_error(str(answer));quit(1);return
		var geometry:Dictionary=kernel.inspect_geometry(points)
		var output=answer.duplicate();output.erase("impulses");output.erase("reaction_impulses");output.internal_net_impulse_ns=[answer.internal_net_impulse_ns.x,answer.internal_net_impulse_ns.y,answer.internal_net_impulse_ns.z];output.internal_net_angular_impulse_nms=[answer.internal_net_angular_impulse_nms.x,answer.internal_net_angular_impulse_nms.y,answer.internal_net_angular_impulse_nms.z]
		output.impulses=loader.triples(answer.impulses);output.reaction_impulses=loader.triples(answer.reaction_impulses)
		cases.append({"name":fixture.name,"setup":setup,"positions":loader.triples(points),"rest":loader.triples(fixture.points),"velocities":loader.triples(velocity),"inverse_masses":Array(inv),"indices":Array(fixture.indices),"hinge_ids":Array(geometry.ids),"angles":Array(geometry.angles),"rest_angles":Array(geometry.rest_angles),"gradients":Array(geometry.gradients),"k":fixture.k,"c":fixture.c,"dt":1.0/240.0,"output":output,"kernel_ms":elapsed})
		print("ALGEBRA_CASE ",fixture.name," iterations=",answer.iterations," residual=",answer.relative_residual," ms=",elapsed)
		all_ok=all_ok and abs(answer.linear_energy_balance_error_j)<1e-10
	loader.write_report("res://../reports/algebra-native.json",{"completed":true,"pass_energy_identity":all_ok,"velocity_provenance":"Explicit prescribed fixture velocities; exact input to the linearized material model","cases":cases})
	quit(0 if all_ok else 1)
