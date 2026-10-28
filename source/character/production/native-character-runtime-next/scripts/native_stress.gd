extends SceneTree

var main: Node3D
var observations: Array=[]

func _initialize() -> void: call_deferred("run")
func ticks(count: int) -> void:
	for i in ceili(count*Engine.physics_ticks_per_second/120.0): await physics_frame

func save(label: String) -> void:
	if DisplayServer.get_name()!="headless":
		await RenderingServer.frame_post_draw
		root.get_texture().get_image().save_png("res://reports/"+label+".png")
	main.write_report("res://reports/"+label+".json")
	observations.append({"label":label,"cloth":main.clothing.snapshot(),"grasp":main.actor.grasp.snapshot(),"actor":main.actor.snapshot(),"secondary":main.secondary.snapshot()})

func run() -> void:
	main=load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	await ticks(120)
	if main.asset_state!="ready": quit(2); return
	main.actor.rig.manual_blink=0.0
	await save("native-stress-idle-01s")
	await ticks(3480)
	await save("native-stress-idle-30s")
	main.actor.command_move=true
	main.actor.injected_move=Vector2(0,-1)
	await ticks(190)
	main.actor.injected_move=Vector2.ZERO
	await ticks(50)
	Input.action_press("turn_right")
	await ticks(140)
	Input.action_release("turn_right")
	await ticks(120)
	await save("native-stress-obstacle-turn-attempt")
	for i in 240:
		if main.actor.rotation.y<.006: break
		Input.action_press("turn_left")
		await ticks(1)
	Input.action_release("turn_left")
	main.actor.injected_move=Vector2(0,1)
	await ticks(140)
	main.actor.injected_move=Vector2.ZERO
	await ticks(50)
	Input.action_press("turn_right")
	await ticks(140)
	Input.action_release("turn_right")
	await ticks(120)
	await save("native-stress-free-turn-90")
	Input.action_press("turn_left")
	await ticks(140)
	Input.action_release("turn_left")
	main.actor.injected_move=Vector2(0,-1)
	await ticks(220)
	main.actor.injected_move=Vector2.ZERO
	await ticks(50)
	main.actor.start_action("pickup")
	for i in 520:
		await ticks(1)
		if is_instance_valid(main.actor.grasp.held): break
	await ticks(150)
	await save("native-stress-hold")
	main.actor.start_action("release")
	await ticks(180)
	for view in ["front","side","back"]:
		main.set_camera_view(view)
		await ticks(5)
		await save("native-stress-final-"+view)
	var cloth: Dictionary=main.clothing.snapshot()
	var result: Dictionary={"duration_physics_seconds":float(Engine.get_physics_frames())/Engine.physics_ticks_per_second,"physics_hz":Engine.physics_ticks_per_second,"observations":observations,"cloth_numeric_inversion_alarm_clear":cloth.geometry.inverted_triangles_against_material_rest<=46 and cloth.geometry.collapsed_triangles==0,"visual_acceptance":false,"scope":"Long idle, actual kinematic movement/turn input, actual reach/spring hold/release; numeric 2% threshold is only an alarm and does not establish visual acceptance","engine":Engine.get_version_info()}
	var file:=FileAccess.open("res://reports/native-stress.json",FileAccess.WRITE)
	file.store_string(JSON.stringify(result,"\t"))
	print("Long native GPU study complete. Cloth numeric inversion alarm clear="+str(result.cloth_numeric_inversion_alarm_clear))
	quit(0 if result.cloth_numeric_inversion_alarm_clear else 1)
