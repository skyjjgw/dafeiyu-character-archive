extends SceneTree
func _initialize() -> void:
	call_deferred("run")
func run() -> void:
	var base:=ProjectSettings.globalize_path("res://").path_join("../")
	var source: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(base+"fixtures/source-samples.json"))
	var config: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(base+"fixtures/source-equations.json"))
	var bytes:=FileAccess.get_file_as_bytes(base+"fixtures/source-samples.bin")
	var library=load("res://selected_face_kernel.gdextension")
	assert(library!=null)
	var kernel=ClassDB.instantiate("SelectedFaceKernel")
	var setup: Dictionary=kernel.configure(config,source.meshes)
	assert(setup.ok,str(setup))
	var report: Dictionary={"schema":"dafeiyu.selected-face-native-parity.v1","authority":source.authority,"sourceHashes":source.sourceHashes,"engine":Engine.get_version_info(),"states":source.frames.size(),"dynamic_meshes":setup.dynamic_meshes,"components":0,"unequalFloat32Components":0,"unequalFloat32Bits":0,"maxError":0.,"maxULP":0,"visibilityMismatches":0,"byAttribute":{},"byMesh":{},"source_default":true}
	var clocks: Array[float]=[]
	for frame in source.frames:
		var result: Dictionary=kernel.evaluate(frame.state)
		assert(result.ok,str(result))
		clocks.append(result.kernel_ms)
		var actual: Dictionary={}
		for mesh in result.meshes: actual[int(mesh.index)]=mesh
		for expected in frame.meshes:
			var mesh: Dictionary=actual[int(expected.index)]
			if mesh.visible!=expected.visible:report.visibilityMismatches+=1
			for attribute in expected.attributes:
				var view: Dictionary=expected.attributes[attribute]
				var name: String="positions" if attribute=="position" else "rgba" if attribute=="color" else "uv"
				var reference: PackedByteArray=bytes.slice(int(view.offset),int(view.offset+view.length))
				var metrics: Dictionary=kernel.compare_float_bytes(mesh[name],reference)
				assert(metrics.ok,str(metrics))
				report.components+=int(metrics.components)
				report.unequalFloat32Components+=int(metrics.unequal)
				report.unequalFloat32Bits+=int(metrics.bit_unequal)
				report.maxError=maxf(report.maxError,metrics.max_error)
				report.maxULP=maxi(report.maxULP,int(metrics.max_ulp))
				if not report.byAttribute.has(attribute):report.byAttribute[attribute]={"components":0,"unequal":0,"maxError":0.}
				report.byAttribute[attribute].components+=int(metrics.components)
				report.byAttribute[attribute].unequal+=int(metrics.unequal)
				report.byAttribute[attribute].maxError=maxf(report.byAttribute[attribute].maxError,metrics.max_error)
				report.byMesh[mesh.name]=maxf(report.byMesh.get(mesh.name,0.),metrics.max_error)
	var total:=0.0
	for value in clocks:total+=value
	report.kernelMeanMs=total/clocks.size()
	report.kernelWorstMs=clocks.max()
	# Structural depth is explicit and reversible; the baseline report above
	# never claims changed anatomical Z is still source-identical.
	var baseline: Dictionary=kernel.evaluate(source.frames[1].state)
	var override: Dictionary=kernel.set_depth_policy({"kind":"structural-candidate","strength":1.0})
	assert(override.ok)
	var changed: Dictionary=kernel.evaluate(source.frames[1].state)
	assert(changed.depth_policy=="structural-candidate")
	assert(kernel.set_depth_policy({"kind":"source-default"}).ok)
	var restored: Dictionary=kernel.evaluate(source.frames[1].state)
	assert(restored.meshes[0].positions==baseline.meshes[0].positions)
	report.depthOverrideReversible=true
	report.passed=report.maxError<0.0000001 and report.visibilityMismatches==0
	var output:=FileAccess.open(base+"reports/native-source-parity.json",FileAccess.WRITE)
	output.store_string(JSON.stringify(report,"\t"));output.close()
	print("SELECTED_FACE_NATIVE_PARITY "+JSON.stringify(report))
	kernel=null;library=null
	quit(0 if report.passed else 1)
