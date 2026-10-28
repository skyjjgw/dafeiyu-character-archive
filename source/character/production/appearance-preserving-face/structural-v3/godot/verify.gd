extends SceneTree
func _initialize()->void:
	call_deferred("run")
func slice_view(bytes:PackedByteArray,view:Dictionary)->PackedByteArray:
	return bytes.slice(int(view.offset),int(view.offset+view.length))
func run()->void:
	var directory=ProjectSettings.globalize_path("res://").path_join("../")
	var samples:Dictionary=JSON.parse_string(FileAccess.get_file_as_string(directory+"fixtures/samples.json"))
	var bytes=FileAccess.get_file_as_bytes(directory+"fixtures/data.bin")
	var config=JSON.parse_string(FileAccess.get_file_as_string(directory+"fixtures/source-equations.json"))
	var structure=JSON.parse_string(FileAccess.get_file_as_string(directory+"fixtures/structure.json"))
	var library=load("res://selected_structural_face_kernel.gdextension")
	if library==null or not ClassDB.class_exists("SelectedStructuralFaceKernel"):push_error("Structural kernel unavailable");quit(1);return
	var kernel=ClassDB.instantiate("SelectedStructuralFaceKernel")
	var descriptors:Array=[]
	for row in samples.descriptors:
		var descriptor:Dictionary=row.duplicate()
		descriptor.canonicalRoles=slice_view(bytes,row.canonicalRoles).to_int32_array()
		descriptor.canonicalParams=slice_view(bytes,row.canonicalParams).to_float64_array()
		for key in ["neutralPositions","neutralUV","neutralRGBA"]:
			if row.has(key):descriptor[key]=slice_view(bytes,row[key])
		descriptors.append(descriptor)
	var setup:Dictionary=kernel.configure(config,descriptors)
	if not setup.ok:push_error(str(setup));quit(1);return
	var structure_setup:Dictionary=kernel.configure_structure(structure)
	if not structure_setup.ok:push_error(str(structure_setup));quit(1);return
	var report={"schema":"dafeiyu.structural-face-v3.native-comparison.v1","authority":samples.authority,"states":samples.frames.size(),"meshes":descriptors.size(),"headless":true,"gpuRendered":false,"components":0,"maximumError":0.0,"visibilityMismatches":0,"byMesh":{},"byAttribute":{},"kernelMs":[],"passed":false}
	report.structure=structure_setup
	for frame in samples.frames:
		var actual:Dictionary=kernel.evaluate(frame.state)
		if not actual.ok:push_error(str(actual));quit(1);return
		report.kernelMs.append(actual.kernel_ms)
		var found:Dictionary={}
		for mesh in actual.meshes:found[int(mesh.index)]=mesh
		for expected in frame.meshes:
			var result:Dictionary=found[int(expected.index)]
			if result.visible!=expected.visible:report.visibilityMismatches+=1
			for attribute in expected.attributes:
				var key="positions" if attribute=="position" else "rgba" if attribute=="color" else "uv"
				var comparison:Dictionary=kernel.compare_float_bytes(result[key],slice_view(bytes,expected.attributes[attribute]))
				if not comparison.ok:push_error(str(comparison));quit(1);return
				report.components+=int(comparison.components)
				report.maximumError=maxf(report.maximumError,float(comparison.max_error))
				if not report.byMesh.has(expected.name):report.byMesh[expected.name]={"maximumError":0.0,"unequalBits":0}
				report.byMesh[expected.name].maximumError=maxf(report.byMesh[expected.name].maximumError,comparison.max_error)
				report.byMesh[expected.name].unequalBits+=int(comparison.bit_unequal)
				if not report.byAttribute.has(attribute):report.byAttribute[attribute]={"maximumError":0.0,"unequalBits":0}
				report.byAttribute[attribute].maximumError=maxf(report.byAttribute[attribute].maximumError,comparison.max_error)
				report.byAttribute[attribute].unequalBits+=int(comparison.bit_unequal)
	report.passed=report.maximumError<0.000001 and report.visibilityMismatches==0
	var file=FileAccess.open(directory+"reports/native-comparison.json",FileAccess.WRITE)
	file.store_string(JSON.stringify(report,"\t"));file.close()
	print("STRUCTURAL_FACE_COMPARISON ",JSON.stringify(report))
	kernel=null;library=null
	quit(0 if report.passed else 1)
