extends SceneTree
var scene:Node
var component:RefCounted
var directory:String
func _initialize()->void:
	directory=get_script().resource_path.get_base_dir()
	call_deferred("run")
func run()->void:
	scene=load("res://motion.tscn").instantiate();root.add_child(scene);current_scene=scene
	await process_frame
	component=load(directory+"/component/factory.gd").new()
	if component==null:push_error("Component factory script failed");quit(1);return
	var result:Dictionary=component.setup(scene.actor.rig.head,scene.asset.renderer)
	if not result.ok:push_error("Continuous head setup failed: "+str(result));quit(1);return
	var source_face=scene.actor.rig.head.find_child("painted-face",true,false)
	if source_face==null:push_error("Original source face missing");quit(1);return
	scene.face_adapter.dispose();source_face.visible=false;scene.face_adapter=component.adapter;component.model.visible=true
	scene.face_connected=false
	var report={"schema":"dafeiyu.continuous-head-v3.component-import.v1","completed":false,"headless":DisplayServer.get_name()=="headless","setup":result.import,"rootTransform":str(component.model.transform),"sourceFaceHidden":not source_face.visible,"states":[],"gpuRendered":false,"finalQualityPassed":false}
	for state in [{"blink":0.0,"talk":0.0},{"blink":0.5,"talk":0.4,"gazeX":0.4},{"blink":1.0,"talk":0.0},{"blink":0.2,"talk":1.0,"happy":1.0,"gazeY":-0.5}]:
		var updated:Dictionary=component.adapter.update(state)
		if not updated.ok:push_error(str(updated));quit(1);return
		report.states.append({"state":state,"update":updated.duplicate(true)})
		if not report.headless:
			await RenderingServer.frame_post_draw
			var native:Dictionary=component.adapter.kernel.evaluate(state)
			var unequal=0
			for frame in native.meshes:
				var binding:Dictionary=component.adapter.bindings[int(frame.index)]
				var arrays:Array=binding.mesh.surface_get_arrays(binding.surface)
				for attribute in ["positions","uv","rgba"]:
					if not frame.has(attribute):continue
					var actual:PackedByteArray=arrays[Mesh.ARRAY_VERTEX].to_byte_array() if attribute=="positions" else arrays[Mesh.ARRAY_TEX_UV].to_byte_array() if attribute=="uv" else arrays[Mesh.ARRAY_CUSTOM0].to_byte_array()
					var difference:Dictionary=component.adapter.kernel.compare_float_bytes(actual,frame[attribute])
					if not difference.ok:push_error(str(difference));quit(1);return
					unequal+=int(difference.bit_unequal)
			report.states[-1].gpuReadbackUnequalBits=unequal
			if unequal!=0:push_error("Actual GPU buffer differs from submitted structural geometry");quit(1);return
			var name="neutral" if state.blink==0 else "half-blink" if state.blink==0.5 else "closed" if state.blink==1 else "happy-talk"
			root.get_texture().get_image().save_png(directory+"/reports/component-"+name+"-front.png")
	if not report.headless:
		report.gpuRendered=true
		component.adapter.update({"blink":0.0,"talk":0.0})
		for angle in [45,90,180]:
			scene.view_yaw=deg_to_rad(angle);scene.update_camera()
			await RenderingServer.frame_post_draw
			root.get_texture().get_image().save_png(directory+"/reports/component-neutral-view"+str(angle)+".png")
	scene.face_connected=false;scene.face_adapter=null
	component.dispose();component=null;scene.queue_free();await process_frame
	report.completed=true;report.cleanupValidated=true
	var report_name="component-import.json" if report.headless else "component-import-gpu.json"
	var file=FileAccess.open(directory+"/reports/"+report_name,FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"));file.close()
	print("CONTINUOUS_HEAD_COMPONENT ",JSON.stringify({"completed":true,"headless":report.headless,"instances":result.import.instances,"surfaces":result.import.surfaces,"mapped_vertices":result.import.mapped_vertices,"max_position_error":result.import.maximum_import_position_error,"max_uv_error":result.import.maximum_import_uv_error}))
	quit(0)
