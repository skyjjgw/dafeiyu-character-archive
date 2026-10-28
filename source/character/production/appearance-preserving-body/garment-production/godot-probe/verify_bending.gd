extends SceneTree
func _initialize() -> void: call_deferred("run")
func run() -> void:
	var library=load("res://native_cloth_bending.gdextension")
	if library==null or not ClassDB.class_exists("NativeClothBending"): push_error("Trusted native material helper missing");quit(1);return
	var component: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://../assets/component.json"))
	var binary:=FileAccess.get_file_as_bytes("res://../assets/component.bin")
	var digest:=HashingContext.new();digest.start(HashingContext.HASH_SHA256);digest.update(binary)
	if digest.finish().hex_encode()!=component.binary.sha256: push_error("Component BIN hash mismatch");quit(1);return
	var records: Array=[];var all_ok:=true
	for layer in component.layers:
		var p: Dictionary=component.arrays[layer.solver.positionsNeutralRoot];var f: Dictionary=component.arrays[layer.solver.triangles]
		var positions:=binary.slice(int(p.offset),int(p.offset)+int(p.bytes)).to_vector3_array();var triangles:=binary.slice(int(f.offset),int(f.offset)+int(f.bytes)).to_int32_array()
		for i in range(positions.size()):positions[i]=(positions[i]+Vector3(0,1.055,0))*.35
		var bending=ClassDB.instantiate("NativeClothBending")
		var setup: Dictionary=bending.configure(positions,triangles,.0006,.000025,.0015)
		if not setup.get("ok",false):records.append({"layer":layer.id,"setup":setup});all_ok=false;continue
		var rest: Dictionary=bending.evaluate(positions,1.0/60.0)
		bending.reset_history()
		var rigid:=positions.duplicate();var rotation:=Basis.from_euler(Vector3(.13,-.27,.07))
		for i in range(rigid.size()):rigid[i]=rotation*rigid[i]+Vector3(2,-.4,1.1)
		var moved: Dictionary=bending.evaluate(rigid,1.0/60.0)
		var outputs: Dictionary={}
		for item in [["rest",positions],["rigid",rigid],["rigid_forces",moved.forces]]:
			var filename: String="material-"+str(layer.id)+"-"+str(item[0])+".bin"
			var output:=FileAccess.open("res://../reports/"+filename,FileAccess.WRITE);var values: PackedVector3Array=item[1];output.store_buffer(values.to_byte_array());output.close();outputs[str(item[0])]=filename
		bending.reset_history()
		var start:=Time.get_ticks_usec();var result: Dictionary
		for i in range(120):result=bending.evaluate(positions,1.0/60.0)
		var average_ms:=(Time.get_ticks_usec()-start)/120000.0
		var ok: bool=rest.get("ok",false) and moved.get("ok",false) and result.get("ok",false) and float(rest.get("max_nodal_force",1))<1e-8
		all_ok=all_ok and ok
		records.append({"layer":layer.id,"passed":ok,"vertices":positions.size(),"triangles":triangles.size()/3,"configure":setup,"rest_max_nodal_force_N":rest.get("max_nodal_force",null),"rigid_max_nodal_force_N":moved.get("max_nodal_force",null),"rigid_force_status":"Exact float32 rest/moved/forces saved for independent quantized-input reference; nonzero force is not silently treated as zero","probe_files":outputs,"hinge_count":result.get("hinge_count",null),"material_eval_120_mean_ms":average_ms})
	var report:={"schema":"dafeiyu.garment-actual-native-material-interface.v1","engine":Engine.get_version_info(),"component_bin_sha256":component.binary.sha256,"material_test_parameters":{"stiffness_J_per_rad2":.0006,"damping_J_s_per_rad2":.000025,"moment_limit_Nm":.0015,"not_measured_fabric_parameters":true},"layers":records,"passed":all_ok,"physicsPass":false,"visualPass":false,"scope":"Real trusted C++ material helper on this selected character canonical cloth. No old native art geometry. Only configure/rest/rigid objectivity/API timing; no Jolt contact/integration or animated cloth validation."}
	var file:=FileAccess.open("res://../reports/native-material-interface.json",FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"));file.close();print(JSON.stringify(report));quit(0 if all_ok else 1)
