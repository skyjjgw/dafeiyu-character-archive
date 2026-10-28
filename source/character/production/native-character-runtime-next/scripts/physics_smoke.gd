extends SceneTree

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	var scene = load("res://scripts/physics_scene.gd").new()
	scene.auto_start = false
	root.add_child(scene)
	await process_frame
	await physics_frame
	scene.begin()
	for frame in ceili(4.0*Engine.physics_ticks_per_second):
		await physics_frame
	var report: Dictionary = scene.results()
	var checks: Dictionary = {
		"jolt_selected": report["physics_setting"] == "Jolt Physics",
		"rigid_body_contact": report["drop"]["floor_contacts"] > 0,
		"rigid_body_rest_height": absf(report["drop"]["center_y"] - 0.20) < 0.035,
		"rigid_body_no_floor_tunneling": report["drop"]["minimum_center_y"] > 0.16,
		"hinge_exercised": report["hinge"]["maximum_angle"] > 0.15,
		"hinge_limits_respected": report["hinge"]["maximum_angle"] <= 0.45,
		"soft_body_pins": report["soft_body"]["pin_0"] and report["soft_body"]["pin_6"] and report["soft_body"]["pin_0_drift"] < 0.005 and report["soft_body"]["pin_6_drift"] < 0.005,
		"soft_body_deforms_under_gravity": report["soft_body"]["free_point_drop"] > 0.10,
		"two_bone_ik_reaches_target": report["two_bone_ik"]["samples"] > 0 and report["two_bone_ik"]["end_target_error"] < 0.025,
		"physical_bones_bound": report["physical_bones"]["bone_ids"] == [0, 1],
		"physical_bones_simulate": report["physical_bones"]["simulating"] and report["physical_bones"]["initial_root_y"] - report["physical_bones"]["final_root_y"] > 0.20,
		"physical_bones_drive_skeleton": report["physical_bones"]["final_skeleton_root_y"] > 0.1 and report["physical_bones"]["final_skeleton_root_y"] < 1.5,
		"blend_shape_weight": report["blend_shape"]["count"] == 1 and absf(report["blend_shape"]["weight"] - 0.40) < 0.001,
		"npr_shader_resources_parse": report["shader"]["toon"]["loaded"] and report["shader"]["outline"]["loaded"] and report["shader"]["toon"]["uniforms"].has("base_color") and report["shader"]["outline"]["uniforms"].has("outline_width")
	}
	report["checks"] = checks
	report["passed"] = checks.values().all(func(value): return value)
	report["engine_version"] = Engine.get_version_info()
	report["headless"] = DisplayServer.get_name() == "headless"
	report["scope"] = "Small primitive physics/API fixture, not character-art, animation quality, garment quality or whole-body balance acceptance"
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://reports"))
	var file := FileAccess.open("res://reports/physics-smoke.json", FileAccess.WRITE)
	file.store_string(JSON.stringify(report, "\t"))
	file.close()
	print(JSON.stringify(report))
	quit(0 if report["passed"] else 1)
