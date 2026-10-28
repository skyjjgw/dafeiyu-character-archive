extends SceneTree
func packed(values: Array) -> PackedVector3Array:
	var result:=PackedVector3Array()
	for p in values: result.append(Vector3(p[0],p[1],p[2]))
	return result
func compare(result: Dictionary,expected: Dictionary) -> Dictionary:
	assert(result.get("ok")==true,str(result))
	var error:=0.0
	for i in result.forces.size():
		var actual: Vector3=result.forces[i]
		for j in 3: error=maxf(error,absf(actual[j]-float(expected.forces[i][j])))
	assert(error<.000002,str(error))
	assert(absf(result.energy-float(expected.energy))<1e-9)
	assert(absf(result.max_force-float(expected.max_force))<1e-7)
	return {"max_force_component_error":error,"net_force_double":result.net_force_double.length(),"net_torque_double":result.net_torque_double.length()}
func _initialize() -> void:
	call_deferred("run")
func run() -> void:
	var library=load("res://native_cloth_bending.gdextension")
	assert(library!=null)
	assert(ClassDB.class_exists("NativeClothBending"))
	var helper=ClassDB.instantiate("NativeClothBending")
	assert(helper is RefCounted)
	var fixture: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://fixtures/reference.json"))
	var indices:=PackedInt32Array([0,1,2,1,0,3])
	var largest:=0.0
	var largest_net:=0.0
	var largest_torque:=0.0
	for item in fixture.single_hinges:
		var rest:=packed(item.rest)
		var original:=rest.duplicate()
		var setup: Dictionary=helper.configure(rest,indices)
		assert(setup.ok and setup.hinge_count==1 and setup.boundary_edges==4,str(setup))
		for pair in [[item.pose,item.first],[item.next_pose,item.second]]:
			var result: Dictionary=helper.evaluate(packed(pair[0]),1.0/60)
			var metrics:=compare(result,pair[1])
			largest=maxf(largest,metrics.max_force_component_error)
			largest_net=maxf(largest_net,metrics.net_force_double)
			largest_torque=maxf(largest_torque,metrics.net_torque_double)
		assert(rest==original)
	# Reject invalid topology/time and recover by reconfiguration.
	var small:=packed(fixture.single_hinges[0].rest)
	assert(not helper.configure(small,PackedInt32Array([0,1,99])).ok)
	assert(not helper.configure(small,PackedInt32Array([0,1,2,0,1,3])).ok)
	assert(helper.configure(small,indices).ok)
	assert(not helper.evaluate(small,0).ok)
	assert(not helper.evaluate(small,INF).ok)
	var nonfinite:=small.duplicate()
	nonfinite[0]=Vector3(INF,0,0)
	assert(not helper.evaluate(nonfinite,1.0/60).ok)
	assert(not helper.evaluate(PackedVector3Array(),1.0/60).ok)
	var collapsed:=PackedVector3Array([Vector3.ZERO,Vector3.ZERO,Vector3.ZERO,Vector3.ZERO])
	var degenerate: Dictionary=helper.evaluate(collapsed,1.0/60)
	assert(degenerate.ok and degenerate.skipped_degenerate_hinges==1)
	# Objective rest pose: exact axis rotation/translation creates no bending.
	var flat:=PackedVector3Array([Vector3.ZERO,Vector3(.125,0,0),Vector3(.0625,.125,0),Vector3(.0625,-.125,0)])
	assert(helper.configure(flat,indices).ok)
	var rigid:=PackedVector3Array()
	for p in flat: rigid.append(Vector3(-p.y,p.x,p.z)+Vector3(1,2,3))
	var rigid_result: Dictionary=helper.evaluate(rigid,1.0/60)
	assert(rigid_result.energy<1e-18 and rigid_result.max_force<1e-12)
	var source: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://fixtures/skirt-cage-schema2.json"))
	var rest:=packed(source.vertices)
	var triangles:=PackedInt32Array()
	for triangle in source.triangles:
		for index in triangle: triangles.append(int(index))
	var setup: Dictionary=helper.configure(rest,triangles)
	assert(setup.ok and setup.hinge_count==int(fixture.schema2.actual_shared_edges),str(setup))
	assert(setup.rest_degenerate_hinges==0)
	var poses: Array[PackedVector3Array]=[]
	for value in fixture.schema2.poses: poses.append(packed(value))
	var first: Dictionary=helper.evaluate(poses[0],1.0/60)
	var full_first:=compare(first,fixture.schema2.first)
	var second: Dictionary=helper.evaluate(poses[1],1.0/60)
	var full_second:=compare(second,fixture.schema2.second)
	for i in 100: helper.evaluate(poses[i%poses.size()],1.0/60)
	var timings: Array[float]=[]
	for batch in 10:
		var start:=Time.get_ticks_usec()
		for i in 100: helper.evaluate(poses[i%poses.size()],1.0/60)
		timings.append(float(Time.get_ticks_usec()-start)/100.0/1000.0)
	var average:=0.0
	for value in timings: average+=value/timings.size()
	var report: Dictionary={"engine":Engine.get_version_info(),"headless":DisplayServer.get_name()=="headless","extension_class":"NativeClothBending","ABI_load":true,"single_hinge_states":600,"maximum_force_component_difference_N":largest,"maximum_net_force_double":largest_net,"maximum_net_torque_double":largest_torque,"reference_gradient":fixture.reference_gradient,"schema2":setup,"schema2_first":full_first,"schema2_second":full_second,"benchmark":{"evaluations":1000,"batch_mean_ms":timings,"overall_mean_ms":average,"material_hz":60,"note":"Force evaluation and Godot array/dictionary boundary only; no Jolt integration or GPU measured"},"invalid_inputs_rejected":true,"rigid_rest_invariance":true,"rest_input_unmodified":true,"scope":"Standalone technical component; no renderer/character art accepted or installed"}
	var out=FileAccess.open("res://reports/native-bending-verification.json",FileAccess.WRITE)
	out.store_string(JSON.stringify(report,"\t"));out.close()
	print("NATIVE_BENDING_VERIFIED "+JSON.stringify(report))
	helper=null;library=null
	quit(0)
