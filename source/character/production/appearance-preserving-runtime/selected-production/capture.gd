extends SceneTree

func _initialize()->void:call_deferred("run")

func capture(scene:Node3D,name:String)->void:
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("res://selected-production/reports/current-"+name+".png")
	var file=FileAccess.open("res://selected-production/reports/current-"+name+".json",FileAccess.WRITE)
	var record=scene.snapshot();record.actual_baked_tail_points=scene.tail.rendered_tail_points();record.mesh_probe_method="Actual MeshInstance3D GPU-registered skin bake after frame_post_draw; source tail mesh geometry/material unchanged"
	file.store_string(JSON.stringify(record,"\t"))

func run()->void:
	var scene=load("res://selected-production/current.tscn").instantiate();root.add_child(scene)
	await process_frame
	if not scene.is_character_ready():quit(1);return
	var start=Time.get_ticks_usec();var stages={};var hair_toggle={};var cancel_result={}
	while scene.actor.age<10:
		await process_frame
		if scene.actor.age>.4 and not stages.has("check"):stages.check=true;scene.actor.action_check()
		for value in [["front-greeting",1.9],["front-step",4.4],["turn-actual-side",8.2],["settle",9.7]]:
			if scene.actor.age>=float(value[1]) and not stages.has(value[0]):stages[value[0]]=true;await capture(scene,value[0])
		if scene.actor.age>=8.5 and not stages.has("original-hair"):
			stages["original-hair"]=true;hair_toggle.restore=scene.restore_hair();hair_toggle.source_active=scene.hair_handle==null;await capture(scene,"original-hair-side")
		if scene.actor.age>=8.9 and not stages.has("current-hair"):
			stages["current-hair"]=true;hair_toggle.reinstall=scene.load_hair();hair_toggle.current_active=scene.hair_handle!=null and scene.hair_handle.snapshot().hiddenSourceMeshes==15;await capture(scene,"current-hair-side")
		if scene.actor.age>=9.1 and cancel_result.is_empty():cancel_result=scene.character_action("cancel")
	var report={"schema":"dafeiyu.selected-production.gpu-capture.v1","completed":true,"engine":Engine.get_version_info(),"display":DisplayServer.get_name(),"wall_seconds":(Time.get_ticks_usec()-start)/1000000.0,"snapshot":scene.snapshot(),"source_hair_toggle":hair_toggle,"cancel_result":cancel_result,"scope":"Actual selected original girl + structural head v3 + headband + five static continuous hair locks + local finger rig + real Jolt tail. Actual side body geometry remains visibly incomplete, not final all-angle quality; static hair has no physics.","performance_accepted":false,"performance_scope":"Visual/component capture only; no controlled concurrent-load performance benchmark","final_accepted":false}
	var file=FileAccess.open("res://selected-production/reports/gpu-capture.json",FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"));print("SELECTED_CURRENT_GPU_CAPTURE_DONE")
	quit(0)
