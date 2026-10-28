extends SceneTree
func _initialize() -> void: call_deferred("run")
func view(bytes:PackedByteArray,spec:Dictionary)->PackedByteArray: return bytes.slice(int(spec.offset),int(spec.offset)+int(spec.length))
func exact(a:Dictionary,b:Dictionary,filter:Callable)->bool:
	for i in range(a.meshes.size()):
		var A: Dictionary=a.meshes[i];var B: Dictionary=b.meshes[i]
		if not filter.call(str(A.name)):continue
		for key in ["positions","uv","rgba"]:
			if A.has(key) and A[key]!=B[key]:return false
		if A.visible!=B.visible:return false
	return true
func changed_names(frame:Dictionary)->Array:
	var names:Array=[];for mesh in frame.meshes:
		if mesh.changed:names.append(str(mesh.name))
	return names
func run()->void:
	var directory:=ProjectSettings.globalize_path("res://../")
	var samples:Dictionary=JSON.parse_string(FileAccess.get_file_as_string(directory+"fixtures/samples.json"));var bytes:=FileAccess.get_file_as_bytes(directory+"fixtures/data.bin")
	var config:Dictionary=JSON.parse_string(FileAccess.get_file_as_string(directory+"fixtures/source-equations.json"));var structure:Dictionary=JSON.parse_string(FileAccess.get_file_as_string(directory+"fixtures/structure.json"))
	var library=load("res://selected_structural_face_kernel.gdextension");var descriptors:Array=[]
	for row in samples.descriptors:
		var d:Dictionary=row.duplicate();d.canonicalRoles=view(bytes,row.canonicalRoles).to_int32_array();d.canonicalParams=view(bytes,row.canonicalParams).to_float64_array()
		for key in ["neutralPositions","neutralUV","neutralRGBA"]:
			if row.has(key):d[key]=view(bytes,row[key])
		descriptors.append(d)
	var rows:Array=[];var passed:=true
	for cycle in range(8):
		var kernel=ClassDB.instantiate("SelectedStructuralFaceKernel");var setup:Dictionary=kernel.configure(config,descriptors);var configured:Dictionary=kernel.configure_structure(structure)
		if not setup.ok or not configured.ok:push_error("Regression setup failed");quit(1);return
		var s:Dictionary={"blink":.3,"talk":.4,"happy":.2,"sad":.1,"gazeX":.1,"gazeY":.2}
		var initial:Dictionary=kernel.evaluate(s);var repeated:Dictionary=kernel.evaluate(s)
		var gaze_state:Dictionary=s.duplicate();gaze_state.gazeX=-.25;gaze_state.gazeY=.35;var gaze:Dictionary=kernel.evaluate(gaze_state)
		var talk_state:Dictionary=gaze_state.duplicate();talk_state.talk=.65;var talk:Dictionary=kernel.evaluate(talk_state)
		var blink_state:Dictionary=talk_state.duplicate();blink_state.blink=.75;var blink:Dictionary=kernel.evaluate(blink_state)
		var reconfigure:Dictionary=kernel.configure(config,descriptors);var restructure:Dictionary=kernel.configure_structure(structure);var reinitial:Dictionary=kernel.evaluate(s)
		var first_all:bool=changed_names(initial).size()==initial.meshes.size();var same_none:=changed_names(repeated).is_empty();var gaze_names:=changed_names(gaze);var gaze_only:=gaze_names.size()==2 and gaze_names.all(func(name):return "iris" in name)
		var same_buffers:=exact(initial,repeated,func(_name):return true)
		var gaze_others:=exact(repeated,gaze,func(name):return not "iris" in name)
		var talk_keeps_eyes:=exact(gaze,talk,func(name):return "left " in name or "right " in name)
		var blink_keeps_mouth:=exact(talk,blink,func(name):return "mouth" in name or "tongue" in name or "smile" in name)
		var reconfigure_exact:bool=reconfigure.ok and restructure.ok and exact(initial,reinitial,func(_name):return true) and changed_names(reinitial).size()==reinitial.meshes.size()
		var ok:bool=first_all and same_none and gaze_only and same_buffers and gaze_others and talk_keeps_eyes and blink_keeps_mouth and reconfigure_exact
		passed=passed and ok;rows.append({"cycle":cycle,"passed":ok,"first_all_changed":first_all,"same_none_changed":same_none,"gaze_only_iris":gaze_only,"gaze_changed":gaze_names,"same_buffers_exact":same_buffers,"gaze_others_exact":gaze_others,"talk_keeps_eye_buffers_exact":talk_keeps_eyes,"blink_keeps_mouth_buffers_exact":blink_keeps_mouth,"reconfigure_exact":reconfigure_exact,"worker_count":initial.cpu_worker_count,"times_ms":{"first":initial.kernel_ms,"same":repeated.kernel_ms,"gaze":gaze.kernel_ms,"talk":talk.kernel_ms,"blink":blink.kernel_ms}})
		kernel=null # Destructor must wake and join persistent worker before buffers die.
	var filename:="cache-worker-regression-serial.json" if OS.has_environment("DFY_FACE_SERIAL") else "cache-worker-regression-parallel.json"
	var report:={"schema":"dafeiyu.structural-face.exact-cache-worker-regression.v1","cycles":8,"passed":passed,"rows":rows,"scope":"Exact state dependency cache, COW buffer invariance, repeated configure and destructor/worker join. Does not replace actual Three 24-case authority comparison or GPU/visual validation."}
	var file:=FileAccess.open(directory+"reports/"+filename,FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"));file.close();print(JSON.stringify(report));quit(0 if passed else 1)
