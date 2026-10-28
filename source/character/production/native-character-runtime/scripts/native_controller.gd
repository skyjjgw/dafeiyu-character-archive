extends CharacterBody3D

var visual: Node3D
var rig: Node
var grasp: Node3D
var cup: RigidBody3D
var ready_asset:=false
var action:="idle"
var action_age:=0.0
var action_side:="R"
var injected_move:=Vector2.ZERO
var command_move:=false
var last_hand_pose:=Transform3D.IDENTITY
var events: Array=[]
var travelled:=0.0
var wearable_shapes: Array[CollisionShape3D]=[]
var blocked_turns:=0

func _ready() -> void:
	name="NativeCharacter"
	collision_layer=4
	collision_mask=1|2
	floor_snap_length=.18
	safe_margin=.001
	var body_shape:=CollisionShape3D.new()
	var capsule:=CapsuleShape3D.new()
	capsule.radius=.245
	capsule.height=1.8
	body_shape.shape=capsule
	body_shape.position.y=.9
	add_child(body_shape)
	var head_shape:=CollisionShape3D.new()
	var sphere:=SphereShape3D.new()
	sphere.radius=.60
	head_shape.shape=sphere
	head_shape.position=Vector3(0,2.25,0)
	add_child(head_shape)
	grasp=load("res://scripts/grasp_constraint.gd").new()
	add_child(grasp)
	configure_input()

func configure_input() -> void:
	var bindings: Dictionary={"move_forward":KEY_W,"move_back":KEY_S,"move_left":KEY_A,"move_right":KEY_D,"turn_left":KEY_Q,"turn_right":KEY_E,"pickup":KEY_F,"release":KEY_G,"cancel_action":KEY_ESCAPE,"wave":KEY_1}
	for command in bindings:
		if not InputMap.has_action(command): InputMap.add_action(command)
		var event:=InputEventKey.new()
		event.physical_keycode=bindings[command]
		InputMap.action_add_event(command,event)

func install(model: Node3D) -> void:
	visual=model
	add_child(model)
	rig=load("res://scripts/native_rig.gd").new()
	add_child(rig)
	rig.configure(self,model)
	ready_asset=rig.body!=null
	events.append({"event":"asset_loaded","body_skeleton_bound":ready_asset})

func start_action(value: String) -> void:
	if not ready_asset: return
	if value=="release" or value=="cancel":
		grasp.release(value)
		rig.clear_hands()
		action="idle"
		events.append({"event":"interrupt","reason":value})
		return
	if is_instance_valid(grasp.held): return
	action=value
	action_age=0.0
	if value=="pickup" and is_instance_valid(cup):
		var nearest:=INF
		for side in rig.hands:
			var distance: float=rig.palm_pose(side).origin.distance_to(cup.grip_world())
			if distance<nearest:
				nearest=distance
				action_side=side
		if nearest>.85:
			action="idle"
			events.append({"event":"reach_rejected","reason":"move closer","distance":nearest})
			return
	elif value=="wave": action_side="R" if rig.hands.has("R") else "L"
	events.append({"event":"action","name":action,"side":action_side})

func _unhandled_key_input(event: InputEvent) -> void:
	if event.is_action_pressed("pickup"): start_action("pickup")
	if event.is_action_pressed("release"): start_action("release")
	if event.is_action_pressed("cancel_action"): start_action("cancel")
	if event.is_action_pressed("wave"): start_action("wave")

func _physics_process(delta: float) -> void:
	if not ready_asset: return
	var input: Vector2=injected_move if command_move else Input.get_vector("move_left","move_right","move_forward","move_back")
	var direction:=global_basis*Vector3(input.x,0,-input.y)
	var desired:=direction*.78
	velocity.x=move_toward(velocity.x,desired.x,delta*2.4)
	velocity.z=move_toward(velocity.z,desired.z,delta*2.4)
	if not is_on_floor(): velocity.y-=9.8*delta
	else: velocity.y=-.05
	var turn:=Input.get_axis("turn_left","turn_right")
	if absf(turn)>.01:
		var next_angle:=rotation.y+turn*delta*1.3
		if can_rotate(next_angle): rotation.y=next_angle
		else: blocked_turns+=1
	var previous:=global_position
	move_and_slide()
	travelled+=global_position.distance_to(previous)
	if action=="wave" and direction.length()>.1: start_action("cancel")
	action_age+=delta
	update_action(delta)
	rig.step(delta,velocity)

func can_rotate(angle: float) -> bool:
	if wearable_shapes.is_empty(): return true
	var proposed:=Transform3D(Basis(Vector3.UP,angle),global_position)
	for collision in wearable_shapes:
		var query:=PhysicsShapeQueryParameters3D.new()
		query.shape=collision.shape
		query.transform=proposed*collision.transform
		query.collision_mask=1|2
		query.exclude=[get_rid()]
		query.margin=.001
		if not get_world_3d().direct_space_state.intersect_shape(query,1).is_empty(): return false
	return true

func update_action(_delta: float) -> void:
	if action=="pickup" and is_instance_valid(cup):
		rig.hand_goal(action_side,cup.grip_world(),0.0)
		if last_hand_pose.origin.distance_to(cup.grip_world())<.006:
			if grasp.attach(cup,cup.grip_world()):
				action="hold"
				action_age=0
		elif action_age>4.0:
			start_action("cancel")
			events.append({"event":"reach_timeout"})
	elif action=="hold":
		var sign_x: float=signf(rig.hands[action_side].rest.x)
		rig.hand_goal(action_side,to_global(Vector3(sign_x*.46,1.68,.45)),.74)
	elif action=="wave" and rig.hands.has(action_side):
		var sign_x: float=signf(rig.hands[action_side].rest.x)
		var start: Vector3=rig.hands[action_side].rest
		var raised:=Vector3(sign_x*.70,1.82,.25)
		var points: Array=[start,raised,raised+Vector3(sign_x*.07,0,0),raised-Vector3(sign_x*.07,0,0),raised+Vector3(sign_x*.07,0,0),raised,start]
		var u: float=clampf(action_age/1.8,0,1)*float(points.size()-1)
		var index: int=mini(int(u),points.size()-2)
		var t: float=u-float(index)
		t=t*t*(3-2*t)
		rig.hand_goal(action_side,to_global(points[index].lerp(points[index+1],t)))
		if action_age>=1.8:
			rig.clear_hands()
			action="idle"

func on_hand_pose(side: String, transform: Transform3D) -> void:
	if side==action_side:
		last_hand_pose=transform
		grasp.move_hand(transform)

func snapshot() -> Dictionary:
	return {"asset_ready":ready_asset,"action":action,"root_position":[global_position.x,global_position.y,global_position.z],"on_floor":is_on_floor(),"travelled":travelled,"rigid_wearable_sweep_shapes":wearable_shapes.size(),"blocked_turn_steps":blocked_turns,"grasp":grasp.snapshot(),"rig":rig.snapshot() if rig else {},"events":events,"limitations":["Kinematic root sweep and IK locomotion; not whole-body active balance","Finger pose drives actual skin; grasp is a spring constraint, not solved force closure"]}
