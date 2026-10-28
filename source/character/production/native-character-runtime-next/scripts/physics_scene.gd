extends Node3D

@export var auto_start := true
var floor_body: StaticBody3D
var drop_body: RigidBody3D
var hinge_body: RigidBody3D
var hinge: HingeJoint3D
var cloth: SoftBody3D
var cloth_initial: Dictionary = {}
var ik_skeleton: Skeleton3D
var ik: TwoBoneIK3D
var ik_target: Node3D
var physical_skeleton: Skeleton3D
var physical_simulator: PhysicalBoneSimulator3D
var physical_bones: Array[PhysicalBone3D] = []
var blend_instance: MeshInstance3D
var running := false
var samples := 0
var floor_contacts := 0
var minimum_drop_y := INF
var maximum_hinge_angle := 0.0
var ik_error := INF
var ik_samples := 0
var physical_initial_y := 0.0
var physical_pose_y := 0.0

func _ready() -> void:
	build_floor()
	build_drop()
	build_hinge()
	build_cloth()
	build_ik()
	build_physical_bones()
	build_blend_shape()
	build_view()
	if auto_start:
		call_deferred("begin")

func collision(owner: CollisionObject3D, shape: Shape3D) -> void:
	var node := CollisionShape3D.new()
	node.shape = shape
	owner.add_child(node)

func visual(owner: Node3D, mesh: Mesh, color: Color) -> void:
	var node := MeshInstance3D.new()
	node.mesh = mesh
	var material := ShaderMaterial.new()
	material.shader = load("res://shaders/toon.gdshader")
	material.set_shader_parameter("base_color", color)
	node.material_override = material
	owner.add_child(node)

func build_floor() -> void:
	floor_body = StaticBody3D.new()
	floor_body.name = "Floor"
	floor_body.position.y = -0.10
	add_child(floor_body)
	var shape := BoxShape3D.new()
	shape.size = Vector3(9.0, 0.20, 8.0)
	collision(floor_body, shape)
	var mesh := BoxMesh.new()
	mesh.size = shape.size
	visual(floor_body, mesh, Color(0.18, 0.22, 0.28))

func build_drop() -> void:
	drop_body = RigidBody3D.new()
	drop_body.name = "DropSphere"
	drop_body.position = Vector3(0.0, 2.4, 0.0)
	drop_body.contact_monitor = true
	drop_body.max_contacts_reported = 8
	drop_body.continuous_cd = true
	var material := PhysicsMaterial.new()
	material.bounce = 0.05
	material.friction = 0.8
	drop_body.physics_material_override = material
	add_child(drop_body)
	var shape := SphereShape3D.new()
	shape.radius = 0.2
	collision(drop_body, shape)
	var mesh := SphereMesh.new()
	mesh.radius = 0.2
	mesh.height = 0.4
	visual(drop_body, mesh, Color(0.18, 0.46, 0.75))
	drop_body.body_entered.connect(func(body):
		if body == floor_body:
			floor_contacts += 1)

func build_hinge() -> void:
	var anchor := StaticBody3D.new()
	anchor.name = "HingeAnchor"
	anchor.position = Vector3(-2.0, 2.6, 0.0)
	anchor.collision_layer = 0
	anchor.collision_mask = 0
	add_child(anchor)
	var anchor_mesh := SphereMesh.new()
	anchor_mesh.radius = 0.08
	anchor_mesh.height = 0.16
	visual(anchor, anchor_mesh, Color(0.8, 0.6, 0.3))
	hinge_body = RigidBody3D.new()
	hinge_body.name = "LimitedPendulum"
	hinge_body.position = Vector3(-2.0, 2.0, 0.0)
	hinge_body.angular_damp = 0.15
	add_child(hinge_body)
	var shape := BoxShape3D.new()
	shape.size = Vector3(0.16, 1.2, 0.16)
	collision(hinge_body, shape)
	var mesh := BoxMesh.new()
	mesh.size = shape.size
	visual(hinge_body, mesh, Color(0.72, 0.38, 0.26))
	hinge = HingeJoint3D.new()
	hinge.name = "LimitedHinge"
	hinge.position = anchor.position
	add_child(hinge)
	hinge.node_a = hinge.get_path_to(anchor)
	hinge.node_b = hinge.get_path_to(hinge_body)
	hinge.set_flag(HingeJoint3D.FLAG_USE_LIMIT, true)
	hinge.set_param(HingeJoint3D.PARAM_LIMIT_LOWER, -0.35)
	hinge.set_param(HingeJoint3D.PARAM_LIMIT_UPPER, 0.35)

func build_cloth() -> void:
	cloth = SoftBody3D.new()
	cloth.name = "PinnedCloth"
	cloth.position = Vector3(-0.5, 2.2, -2.0)
	cloth.total_mass = 0.18
	cloth.linear_stiffness = 0.75
	cloth.damping_coefficient = 0.08
	cloth.simulation_precision = 8
	var mesh := PlaneMesh.new()
	mesh.size = Vector2(1.2, 1.2)
	mesh.subdivide_width = 5
	mesh.subdivide_depth = 5
	cloth.mesh = mesh
	var material := StandardMaterial3D.new()
	material.albedo_color = Color(0.62, 0.77, 0.86)
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	cloth.material_override = material
	add_child(cloth)
	cloth.set_point_pinned(0, true)
	cloth.set_point_pinned(6, true)

func setup_skeleton(skeleton: Skeleton3D, names: Array[String], offsets: Array[Vector3]) -> void:
	for i in names.size():
		skeleton.add_bone(names[i])
		if i > 0:
			skeleton.set_bone_parent(i, i - 1)
		skeleton.set_bone_rest(i, Transform3D(Basis.IDENTITY, offsets[i]))
	skeleton.reset_bone_poses()

func build_ik() -> void:
	ik_skeleton = Skeleton3D.new()
	ik_skeleton.name = "IKSkeleton"
	ik_skeleton.position = Vector3(2.0, 0.0, 1.0)
	ik_skeleton.modifier_callback_mode_process = Skeleton3D.MODIFIER_CALLBACK_MODE_PROCESS_PHYSICS
	add_child(ik_skeleton)
	setup_skeleton(ik_skeleton, ["Upper", "Middle", "End"], [Vector3(0, 2, 0), Vector3(0, -0.65, 0), Vector3(0, -0.65, 0)])
	ik_target = Node3D.new()
	ik_target.name = "IKTarget"
	ik_target.position = Vector3(2.55, 0.95, 1.10)
	add_child(ik_target)
	var pole := Node3D.new()
	pole.name = "IKPole"
	pole.position = Vector3(2.0, 1.4, 2.0)
	add_child(pole)
	ik = TwoBoneIK3D.new()
	ik.active = false
	ik_skeleton.add_child(ik)
	ik.setting_count = 1
	ik.set_root_bone_name(0, "Upper")
	ik.set_middle_bone_name(0, "Middle")
	ik.set_end_bone_name(0, "End")
	ik.set_target_node(0, ik.get_path_to(ik_target))
	ik.set_pole_node(0, ik.get_path_to(pole))
	ik.influence = 1.0
	ik.modification_processed.connect(func():
		var point := ik_skeleton.to_global(ik_skeleton.get_bone_global_pose(2).origin)
		ik_error = point.distance_to(ik_target.global_position)
		ik_samples += 1)
	for bone in ["Upper", "Middle", "End"]:
		var attachment := BoneAttachment3D.new()
		attachment.bone_name = bone
		ik_skeleton.add_child(attachment)
		var marker := SphereMesh.new()
		marker.radius = 0.07
		marker.height = 0.14
		visual(attachment, marker, Color(0.55, 0.85, 0.48))

func build_physical_bones() -> void:
	physical_skeleton = Skeleton3D.new()
	physical_skeleton.name = "PhysicalSkeleton"
	physical_skeleton.position = Vector3(3.1, 0.0, -1.0)
	physical_skeleton.modifier_callback_mode_process = Skeleton3D.MODIFIER_CALLBACK_MODE_PROCESS_PHYSICS
	add_child(physical_skeleton)
	setup_skeleton(physical_skeleton, ["Root", "Tail"], [Vector3(0, 2.5, 0), Vector3(0, -0.5, 0)])
	physical_simulator = PhysicalBoneSimulator3D.new()
	physical_simulator.name = "Simulator"
	physical_skeleton.add_child(physical_simulator)
	physical_simulator.modification_processed.connect(func():
		physical_pose_y = physical_skeleton.to_global(physical_skeleton.get_bone_global_pose(0).origin).y)
	for name in ["Root", "Tail"]:
		var bone := PhysicalBone3D.new()
		bone.name = "Physical" + name
		physical_simulator.add_child(bone)
		bone.set("bone_name", name)
		bone.mass = 0.2
		bone.body_offset = Transform3D(Basis.IDENTITY, Vector3(0, -0.2, 0))
		bone.joint_offset = Transform3D(Basis.IDENTITY, Vector3(0, 0.2, 0))
		bone.joint_type = PhysicalBone3D.JOINT_TYPE_NONE if name == "Root" else PhysicalBone3D.JOINT_TYPE_CONE
		var shape := CapsuleShape3D.new()
		shape.radius = 0.10
		shape.height = 0.4
		collision(bone, shape)
		var mesh := CapsuleMesh.new()
		mesh.radius = 0.10
		mesh.height = 0.4
		visual(bone, mesh, Color(0.68, 0.46, 0.76))
		physical_bones.append(bone)

func build_blend_shape() -> void:
	var arrays: Array = []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = PackedVector3Array([Vector3(-0.3, 0, 0), Vector3(0.3, 0, 0), Vector3(0, 0.45, 0)])
	arrays[Mesh.ARRAY_NORMAL] = PackedVector3Array([Vector3.FORWARD, Vector3.FORWARD, Vector3.FORWARD])
	var morph := arrays.duplicate(true)
	morph[Mesh.ARRAY_VERTEX] = PackedVector3Array([Vector3(-0.3, 0, 0), Vector3(0.3, 0, 0), Vector3(0, 0.70, 0)])
	var mesh := ArrayMesh.new()
	mesh.blend_shape_mode = Mesh.BLEND_SHAPE_MODE_NORMALIZED
	mesh.add_blend_shape("ExpressionProbe")
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays, [morph])
	blend_instance = MeshInstance3D.new()
	blend_instance.name = "BlendShapeProbe"
	blend_instance.position = Vector3(-3.2, 0.5, 0.0)
	blend_instance.mesh = mesh
	add_child(blend_instance)
	blend_instance.set_blend_shape_value(0, 0.40)

func build_view() -> void:
	var camera := Camera3D.new()
	camera.position = Vector3(5.6, 4.2, 7.4)
	add_child(camera)
	camera.look_at(Vector3(0, 1.2, -0.7))
	camera.current = true
	var light := DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-52, -25, 0)
	light.light_energy = 1.2
	add_child(light)
	var environment := WorldEnvironment.new()
	environment.environment = Environment.new()
	environment.environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.environment.ambient_light_color = Color(0.4, 0.5, 0.65)
	environment.environment.ambient_light_energy = 0.45
	add_child(environment)

func begin() -> void:
	if running:
		return
	for index in [0, 6, 48]:
		cloth_initial[str(index)] = cloth.get_point_transform(index)
	physical_initial_y = physical_bones[0].global_position.y
	physical_simulator.physical_bones_start_simulation()
	# Enter this fixture from rest. Otherwise Jolt can inherit a large velocity
	# from the first kinematic placement of newly created physical bones.
	for bone in physical_bones:
		bone.linear_velocity = Vector3.ZERO
		bone.angular_velocity = Vector3.ZERO
	hinge_body.apply_torque_impulse(Vector3(0, 0, 0.75))
	ik.active = true
	running = true

func _physics_process(_delta: float) -> void:
	if not running:
		return
	samples += 1
	minimum_drop_y = minf(minimum_drop_y, drop_body.global_position.y)
	maximum_hinge_angle = maxf(maximum_hinge_angle, absf(hinge_body.global_rotation.z))

func results() -> Dictionary:
	var pin_a: Vector3 = cloth.get_point_transform(0)
	var pin_b: Vector3 = cloth.get_point_transform(6)
	var free: Vector3 = cloth.get_point_transform(48)
	return {
		"physics_setting": ProjectSettings.get_setting("physics/3d/physics_engine"),
		"samples": samples,
		"drop": {"center_y": drop_body.global_position.y, "minimum_center_y": minimum_drop_y, "floor_contacts": floor_contacts, "sleeping": drop_body.sleeping},
		"hinge": {"limit": 0.35, "maximum_angle": maximum_hinge_angle, "final_angle": hinge_body.global_rotation.z},
		"soft_body": {"point_count": cloth.mesh.surface_get_arrays(0)[Mesh.ARRAY_VERTEX].size(), "pin_0": cloth.is_point_pinned(0), "pin_6": cloth.is_point_pinned(6), "pin_0_drift": pin_a.distance_to(cloth_initial.get("0", pin_a)), "pin_6_drift": pin_b.distance_to(cloth_initial.get("6", pin_b)), "free_point_drop": cloth_initial.get("48", free).y - free.y, "free_point": [free.x, free.y, free.z]},
		"two_bone_ik": {"class": ik.get_class(), "samples": ik_samples, "end_target_error": ik_error},
		"physical_bones": {"simulating": physical_simulator.is_simulating_physics(), "bone_ids": physical_bones.map(func(bone): return bone.get_bone_id()), "initial_root_y": physical_initial_y, "final_root_y": physical_bones[0].global_position.y, "final_skeleton_root_y": physical_pose_y},
		"blend_shape": {"count": blend_instance.mesh.get_blend_shape_count(), "name": blend_instance.mesh.get_blend_shape_name(0), "weight": blend_instance.get_blend_shape_value(0)},
		"shader": {"toon": shader_probe("res://shaders/toon.gdshader"), "outline": shader_probe("res://shaders/outline.gdshader"), "rendered_pixels_verified": false}
	}

func shader_probe(path: String) -> Dictionary:
	var shader: Shader = load(path)
	return {"loaded": shader != null, "mode": shader.get_mode(), "uniforms": shader.get_shader_uniform_list().map(func(value): return value["name"]), "gpu_compile_verified": false}
