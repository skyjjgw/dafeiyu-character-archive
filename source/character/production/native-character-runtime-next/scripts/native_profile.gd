extends SceneTree
const PROF=preload("res://scripts/profile_util.gd")
var main: Node3D
var stages: Array=[]

func _initialize() -> void: call_deferred("run")

func measure(label: String,seconds: float,motion: bool=false) -> Dictionary:
	PROF.reset()
	var started:=Time.get_ticks_usec()
	var previous:=started
	var physics_before:=Engine.get_physics_frames()
	var frame_times: Array=[]
	while (Time.get_ticks_usec()-started)/1000000.0<seconds:
		var t: float=(Time.get_ticks_usec()-started)/1000000.0
		if motion:
			main.actor.command_move=true
			main.actor.injected_move=Vector2(0,1) if t<1.2 else Vector2(-1,0) if t>2.2 and t<3.4 else Vector2.ZERO
			if t>=1.2 and t<=2.2: Input.action_press("turn_right")
			else: Input.action_release("turn_right")
		await process_frame
		var now:=Time.get_ticks_usec()
		frame_times.append(float(now-previous)/1000.0)
		previous=now
	var elapsed: float=(Time.get_ticks_usec()-started)/1000000.0
	main.actor.injected_move=Vector2.ZERO
	Input.action_release("turn_right")
	frame_times.sort()
	var steps: int=Engine.get_physics_frames()-physics_before
	var data: Dictionary={"stage":label,"wall_seconds":elapsed,"frames":frame_times.size(),"wall_fps":frame_times.size()/elapsed,"frame_p50_ms":frame_times[int(frame_times.size()*.5)],"frame_p95_ms":frame_times[int(frame_times.size()*.95)],"physics_hz_actual":steps/elapsed,"physics_realtime_factor":steps/float(Engine.physics_ticks_per_second)/elapsed,"cpu":PROF.summary(),"snapshot":main.snapshot()}
	stages.append(data)
	return data

func run() -> void:
	main=load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	var warm_start:=Time.get_ticks_msec()
	while Time.get_ticks_msec()-warm_start<2500: await process_frame
	if main.asset_state!="ready": quit(2); return
	await measure("idle",6.0)
	await measure("move_and_turn",5.0,true)
	main.actor.start_action("wave")
	await measure("wave",3.0)
	var label:="optimized" if OS.get_cmdline_user_args().has("--optimized") else "baseline"
	var file:=FileAccess.open("res://reports/profile-realtime-"+label+".json",FileAccess.WRITE)
	file.store_string(JSON.stringify({"fixed_timestep":false,"paused":paused,"rendering_method":ProjectSettings.get_setting("rendering/renderer/rendering_method"),"scope":"Unpaused wall-clock application frames; offscreen window, not CUA photon latency","engine":Engine.get_version_info(),"stages":stages},"\t"))
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("res://reports/profile-realtime-"+label+".png")
	for stage in stages: print(stage.stage+" real FPS="+str(stage.wall_fps)+" physics realtime="+str(stage.physics_realtime_factor))
	quit()
