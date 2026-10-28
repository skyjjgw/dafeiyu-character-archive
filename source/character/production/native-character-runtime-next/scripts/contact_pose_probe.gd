extends SceneTree
var main: Node3D
var errors: Dictionary={}
func _initialize() -> void: call_deferred("run")
func record() -> void:
	for entry in main.secondary.proxies:
		if not entry.has("bone"): continue
		var actual: Transform3D=main.actor.rig.world_pose(entry.bone)
		var error: float=actual.origin.distance_to(entry.body.global_position)
		errors[entry.bone]=maxf(errors.get(entry.bone,0.0),error)
func run() -> void:
	main=load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for i in 30: await physics_frame
	main.secondary.simulator.modification_processed.connect(record)
	main.actor.start_action("wave")
	for i in 480: await physics_frame
	var label:="after" if OS.get_cmdline_user_args().has("--after") else "before"
	var file:=FileAccess.open("res://reports/contact-posed-"+label+".json",FileAccess.WRITE)
	file.store_string(JSON.stringify({"max_same_phase_position_error":errors,"scope":"Measured inside final PhysicalBone modifier after arm/leg IK; no GPU or artistic acceptance"},"\t"))
	print(JSON.stringify(errors))
	quit()
