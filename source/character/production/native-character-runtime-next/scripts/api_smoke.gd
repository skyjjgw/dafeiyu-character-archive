extends SceneTree

const CLASSES = ["Skeleton3D", "SkeletonModifier3D", "PhysicalBone3D", "PhysicalBoneSimulator3D", "RigidBody3D", "SoftBody3D", "SpringBoneSimulator3D", "SpringBoneCollisionSphere3D", "SpringBoneCollisionCapsule3D", "TwoBoneIK3D", "FABRIK3D", "CCDIK3D", "SplineIK3D", "LookAtModifier3D", "SkeletonIK3D", "AnimationTree", "AnimationMixer", "GLTFDocument", "Shader", "ArrayMesh"]

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	var classes: Dictionary = {}
	for name in CLASSES:
		var exists := ClassDB.class_exists(name)
		var entry: Dictionary = {"exists": exists, "can_instantiate": ClassDB.can_instantiate(name) if exists else false}
		if exists:
			entry["parent"] = ClassDB.get_parent_class(name)
			entry["methods"] = ClassDB.class_get_method_list(name, true).map(func(value): return value["name"])
			entry["properties"] = ClassDB.class_get_property_list(name, true).map(func(value): return value["name"])
			entry["constants"] = ClassDB.class_get_integer_constant_list(name, true)
			if entry["can_instantiate"]:
				var instance = ClassDB.instantiate(name)
				entry["actual_class"] = instance.get_class()
				if instance is Node:
					instance.free()
		classes[name] = entry
	var report: Dictionary = {
		"version": Engine.get_version_info(),
		"physics_project_setting": ProjectSettings.get_setting("physics/3d/physics_engine"),
		"physics_server_class": PhysicsServer3D.get_class(),
		"display_server": DisplayServer.get_name(),
		"rendering_method": RenderingServer.get_current_rendering_method(),
		"user_data_dir": OS.get_user_data_dir(),
		"executable": OS.get_executable_path(),
		"classes": classes,
		"scope": "Runtime API presence and instantiation only; no character-art acceptance"
	}
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://reports"))
	var file := FileAccess.open("res://reports/api-smoke.json", FileAccess.WRITE)
	file.store_string(JSON.stringify(report, "\t"))
	file.close()
	print(JSON.stringify({"version": report["version"]["string"], "physics": report["physics_project_setting"], "server": report["physics_server_class"], "display": report["display_server"], "classes": classes.keys().map(func(name): return {"name": name, "exists": classes[name]["exists"]}), "user_data_dir": report["user_data_dir"]}))
	quit(0)
