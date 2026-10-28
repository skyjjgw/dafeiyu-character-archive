extends Node3D

var anchor: AnimatableBody3D
var joint: Generic6DOFJoint3D
var held: RigidBody3D
var events: Array = []
var maximum_error := 0.0
var maximum_post_solver_error:=0.0
var local_cup_point := Vector3.ZERO

func _ready() -> void:
	anchor = AnimatableBody3D.new()
	anchor.name = "KinematicHandAnchor"
	anchor.collision_layer = 0
	anchor.collision_mask = 0
	anchor.sync_to_physics = false
	add_child(anchor)

func move_hand(transform: Transform3D) -> void:
	anchor.global_transform = transform
	if is_instance_valid(held):
		maximum_error = maxf(maximum_error,anchor.global_position.distance_to(held.to_global(local_cup_point)))

func attach(body: RigidBody3D, grip_point: Vector3) -> bool:
	if is_instance_valid(held) or anchor.global_position.distance_to(grip_point) > 0.010:
		return false
	held = body
	held.sleeping = false
	local_cup_point = held.to_local(grip_point)
	joint = Generic6DOFJoint3D.new()
	joint.name = "MeasuredGraspSpring"
	add_child(joint)
	joint.global_transform = Transform3D(Basis.IDENTITY,grip_point)
	joint.node_a = joint.get_path_to(anchor)
	joint.node_b = joint.get_path_to(body)
	# Explicit local frames place the actual measured cup grip at the hand
	# origin. Creating a world-frame joint alone preserves its initial gap.
	var cup_frame:=body.global_transform.affine_inverse()*anchor.global_transform
	cup_frame.origin=local_cup_point
	PhysicsServer3D.joint_make_generic_6dof(joint.get_rid(),anchor.get_rid(),Transform3D.IDENTITY,body.get_rid(),cup_frame)
	for axis in ["x","y","z"]:
		joint.call("set_flag_"+axis,Generic6DOFJoint3D.FLAG_ENABLE_LINEAR_LIMIT,true)
		joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_LINEAR_LOWER_LIMIT,-0.003)
		joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_LINEAR_UPPER_LIMIT,0.003)
		joint.call("set_flag_"+axis,Generic6DOFJoint3D.FLAG_ENABLE_LINEAR_SPRING,true)
		joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_LINEAR_SPRING_STIFFNESS,700.0)
		joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_LINEAR_SPRING_DAMPING,1.0)
		joint.call("set_flag_"+axis,Generic6DOFJoint3D.FLAG_ENABLE_ANGULAR_LIMIT,true)
		joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_ANGULAR_LOWER_LIMIT,-0.5)
		joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_ANGULAR_UPPER_LIMIT,0.5)
		joint.call("set_flag_"+axis,Generic6DOFJoint3D.FLAG_ENABLE_ANGULAR_SPRING,true)
		joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_ANGULAR_SPRING_STIFFNESS,5.0)
		joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_ANGULAR_SPRING_DAMPING,0.7)
	events.append({"event":"attach","joint_class":joint.get_class(),"mass":body.mass,"linear_stiffness":700,"damping":1.0,"linear_limit":0.003,"initial_gap":anchor.global_position.distance_to(grip_point),"cup_transform_teleported":false})
	return true

func release(reason: String="user") -> void:
	if is_instance_valid(joint):
		joint.queue_free()
	if is_instance_valid(held):
		held.sleeping = false
		events.append({"event":"release","reason":reason,"velocity":[held.linear_velocity.x,held.linear_velocity.y,held.linear_velocity.z]})
	held = null
	joint = null

func snapshot() -> Dictionary:
	return {"held":is_instance_valid(held),"maximum_grasp_error":maximum_error,"maximum_post_solver_error":maximum_post_solver_error,"events":events,"solver":"Jolt Generic6DOF spring joint; kinematic hand anchor, dynamic cup"}

func _physics_process(_delta: float) -> void:
	if is_instance_valid(held):
		maximum_post_solver_error=maxf(maximum_post_solver_error,anchor.global_position.distance_to(held.to_global(local_cup_point)))
