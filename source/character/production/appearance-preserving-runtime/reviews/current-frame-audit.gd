extends SceneTree

const DIRECTORY="res://reviews/reports"
var scene:Node3D

func _initialize()->void:call_deferred("run")

func statistics(values:Array)->Dictionary:
	if values.is_empty():return {"samples":0}
	var ordered=values.duplicate();ordered.sort()
	var total=0.0
	for value in values:total+=float(value)
	return {"samples":values.size(),"min":ordered[0],"median":ordered[int((ordered.size()-1)*.5)],"mean":total/values.size(),"p95":ordered[int((ordered.size()-1)*.95)],"p99":ordered[int((ordered.size()-1)*.99)],"max":ordered[-1]}

func run()->void:
	if DisplayServer.get_name()=="headless":push_error("Frame audit requires the actual renderer");quit(1);return
	scene=load("res://selected-production/current.tscn").instantiate();root.add_child(scene);current_scene=scene
	await process_frame
	if not scene.is_character_ready():push_error("Current character not ready");quit(1);return
	# Warm the actual renderer; no screenshot/readback or component reload is
	# performed inside the measured interval.
	for index in range(45):await RenderingServer.frame_post_draw
	var frame_intervals:Array=[];var cpu_process:Array=[];var physics_process:Array=[]
	var samples_by_action:Dictionary={};var actor_start=float(scene.actor.age)
	var physics_start=Engine.get_physics_frames();var draw_start=Engine.get_frames_drawn()
	var begin=Time.get_ticks_usec();var previous=begin;var requested=false
	while Time.get_ticks_usec()-begin<12000000:
		await RenderingServer.frame_post_draw
		var now=Time.get_ticks_usec();var elapsed=float(now-begin)/1000000.0
		var gap=float(now-previous)/1000.0;previous=now
		frame_intervals.append(gap)
		cpu_process.append(Performance.get_monitor(Performance.TIME_PROCESS)*1000.0)
		physics_process.append(Performance.get_monitor(Performance.TIME_PHYSICS_PROCESS)*1000.0)
		var state="idle" if not requested else str(scene.actor.last_status)
		if not samples_by_action.has(state):samples_by_action[state]=[]
		samples_by_action[state].append(gap)
		if elapsed>=1.0 and not requested:requested=true;scene.actor.action_check()
	var end=Time.get_ticks_usec();var wall=float(end-begin)/1000000.0
	var summary={}
	for key in samples_by_action:summary[key]=statistics(samples_by_action[key])
	var interval_stats=statistics(frame_intervals)
	var report={"schema":"dafeiyu.current-rendered-frame-audit.v1","completed":true,"headless":false,"engine":Engine.get_version_info(),"display":DisplayServer.get_name(),"renderingMethod":RenderingServer.get_current_rendering_method(),"renderingDevice":RenderingServer.get_video_adapter_name(),"resolution":[root.size.x,root.size.y],"version":scene.components.manifest.version,"measuredWallSeconds":wall,"renderedSamples":frame_intervals.size(),"drawnFrameDifference":Engine.get_frames_drawn()-draw_start,"measuredFPS":float(frame_intervals.size())/wall,"frameIntervalsMilliseconds":interval_stats,"processMilliseconds":statistics(cpu_process),"physicsProcessMilliseconds":statistics(physics_process),"perActionFrameIntervalsMilliseconds":summary,"physicsTicks":Engine.get_physics_frames()-physics_start,"actorAgeDifference":float(scene.actor.age)-actor_start,"currentSnapshot":scene.snapshot(),"rawFrameIntervalsMilliseconds":frame_intervals,"scope":"Actual frame_post_draw intervals through the existing controller attention/greeting/step/turn/settle sequence; 45 rendered warmup frames; no in-interval screenshot or component reimport. Existing source-study windows may still run in the background; this is an observed development workload, not an isolated machine benchmark.","wholeFrame60FPSAccepted":false,"allPhysicsComplete":false,"finalAccepted":false}
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(DIRECTORY))
	var file=FileAccess.open(DIRECTORY+"/current-frame-audit.json",FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"));file.close()
	root.get_texture().get_image().save_png(DIRECTORY+"/current-frame-audit-end.png")
	print("CURRENT_FRAME_AUDIT ",JSON.stringify({"version":report.version,"wallSeconds":wall,"fps":report.measuredFPS,"frameMilliseconds":interval_stats,"physicsTicks":report.physicsTicks,"finalAccepted":false}))
	scene.queue_free();await process_frame;scene=null
	quit(0)
