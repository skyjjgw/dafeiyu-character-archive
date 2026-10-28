extends Node

var actor: CharacterBody3D
var asset: Node3D
var body: Skeleton3D
var face: Skeleton3D
var hair: Skeleton3D
var bones: Dictionary = {}
var legs: Dictionary = {}
var hands: Dictionary = {}
var morphs: Array = []
var report: Dictionary = {"skeletons":[],"bound":[],"missing":[],"hand_fingers":{},"foot_contacts":{},"limitations":[]}
var next_step := "L"
var blink_clock := 0.0
var head_yaw := 0.0
var expression: Dictionary={"smile":0.0,"sad":0.0,"cheek":0.0,"aa":0.0,"ee":0.0,"oh":0.0,"jaw":0.0,"gazeX":0.0,"gazeY":0.0}
var manual_blink: float=-1.0

func configure(owner: CharacterBody3D, model: Node3D) -> void:
	actor=owner
	asset=model
	var pending: Array[Node] = [model]
	while not pending.is_empty():
		var node: Node = pending.pop_back()
		pending.append_array(node.get_children())
		if node is Skeleton3D:
			var names: Array = []
			for i in node.get_bone_count(): names.append(node.get_bone_name(i))
			report.skeletons.append({"path":str(model.get_path_to(node)),"bones":names})
			node.modifier_callback_mode_process=Skeleton3D.MODIFIER_CALLBACK_MODE_PROCESS_PHYSICS
			if node.find_bone("DEF-pelvis")>=0: body=node
			if node.find_bone("FaceHead")>=0: face=node
			if node.find_bone("Hair.HeadAnchor")>=0: hair=node
		if node is MeshInstance3D and node.mesh!=null and node.mesh.get_blend_shape_count()>0:
			var map: Dictionary={}
			for i in node.mesh.get_blend_shape_count(): map[str(node.mesh.get_blend_shape_name(i))]=i
			morphs.append({"mesh":node,"names":map})
	if body==null:
		report.missing.append("Skeleton containing DEF-pelvis")
		return
	for i in body.get_bone_count(): bones[body.get_bone_name(i)]={"id":i,"rotation":body.get_bone_pose_rotation(i),"position":body.get_bone_pose_position(i)}
	for side in ["L","R"]:
		bind_leg(side)
		bind_hand(side)

func has_bones(names: Array) -> bool:
	for name in names:
		if not bones.has(name):
			report.missing.append(name)
			return false
	return true

func world_pose(name: String) -> Transform3D:
	if body==null or not bones.has(name): return Transform3D.IDENTITY
	return body.global_transform*body.get_bone_global_pose(bones[name].id)

func target_node(name: String, point: Vector3) -> Node3D:
	var node:=Node3D.new()
	node.name=name
	add_child(node)
	node.global_position=point
	return node

func ik_chain(label: String, names: Array, target: Node3D, pole: Node3D) -> TwoBoneIK3D:
	var modifier:=TwoBoneIK3D.new()
	modifier.name=label
	modifier.active=false
	body.add_child(modifier)
	modifier.setting_count=1
	modifier.set_root_bone_name(0,names[0])
	modifier.set_middle_bone_name(0,names[1])
	modifier.set_end_bone_name(0,names[2])
	modifier.set_target_node(0,modifier.get_path_to(target))
	modifier.set_pole_node(0,modifier.get_path_to(pole))
	modifier.active=true
	report.bound.append({"kind":"TwoBoneIK3D","bones":names})
	return modifier

func bind_leg(side: String) -> void:
	var names: Array=["DEF-thigh."+side,"DEF-shin."+side,"DEF-foot."+side]
	if not has_bones(names): return
	var rest: Transform3D=world_pose(names[2])
	var local: Vector3=actor.to_local(rest.origin)
	var target:=target_node("FootTarget"+side,rest.origin)
	var pole:=target_node("KneePole"+side,actor.to_global(Vector3(local.x,.55,.5)))
	var ik:=ik_chain("FootIK"+side,names,target,pole)
	legs[side]={"name":names[2],"target":target,"pole":pole,"ik":ik,"rest":local,"sole_offset":local.y,"stance":rest.origin,"swing":false,"age":0.0,"start":rest.origin,"end":rest.origin}

func bind_hand(side: String) -> void:
	var names: Array=["DEF-upper_arm."+side,"DEF-forearm."+side,"DEF-hand."+side]
	if not has_bones(names): return
	var rest: Transform3D=world_pose(names[2])
	var target:=target_node("HandTarget"+side,rest.origin)
	var sign_x:=signf(actor.to_local(rest.origin).x)
	var pole:=target_node("ElbowPole"+side,actor.to_global(Vector3(sign_x*.85,1.35,-.22)))
	var ik:=ik_chain("HandIK"+side,names,target,pole)
	ik.influence=0.0
	var grip_offset:=Vector3.ZERO
	var count:=0
	for digit in ["index","middle","ring","little"]:
		var name: String="DEF-"+digit+".01."+side
		if bones.has(name):
			grip_offset+=rest.affine_inverse()*world_pose(name).origin
			count+=1
	if count: grip_offset/=float(count)
	hands[side]={"name":names[2],"target":target,"pole":pole,"ik":ik,"rest":actor.to_local(rest.origin),"grip_offset":grip_offset,"solved_basis":rest.basis,"active":false,"goal":rest.origin,"grip":0.0,"grip_goal":0.0}
	ik.modification_processed.connect(func():
		var pose: Transform3D=world_pose(names[2])
		hands[side].solved_basis=pose.basis
		pose.origin=pose*grip_offset
		actor.on_hand_pose(side,pose))
	var verified: Array=[]
	for digit in ["thumb","index","middle","ring","little"]:
		for segment in [1,2,3]:
			var name: String="DEF-%s.%02d.%s"%[digit,segment,side]
			if bones.has(name): verified.append(name)
	report.hand_fingers[side]=verified

func ground(point: Vector3, height: float) -> Dictionary:
	var query:=PhysicsRayQueryParameters3D.create(point+Vector3.UP*.55,point+Vector3.DOWN*.9,1,[actor.get_rid()])
	var hit: Dictionary=actor.get_world_3d().direct_space_state.intersect_ray(query)
	if hit.is_empty(): return {"point":point,"hit":false}
	return {"point":Vector3(point.x,hit.position.y+height,point.z),"hit":true,"normal":hit.normal}

func step(delta: float, velocity: Vector3) -> void:
	if body==null: return
	var moving:=Vector2(velocity.x,velocity.z).length()>.03
	for side in legs:
		var leg: Dictionary=legs[side]
		var desired: Vector3=actor.to_global(leg.rest)
		var contact: Dictionary=ground(desired,leg.sole_offset)
		desired=contact.point
		var other: String="R" if side=="L" else "L"
		var other_swing: bool=legs.has(other) and legs[other].swing
		var difference: Vector3=desired-leg.stance
		difference.y=0
		if not leg.swing and not other_swing and difference.length()>(.15 if moving else .055):
			if side==next_step or not moving or not legs.has(other):
				leg.swing=true
				leg.age=0.0
				leg.start=leg.stance
				leg.end=ground(desired+velocity*.12,leg.sole_offset).point
				next_step=other
		if leg.swing:
			leg.age+=delta
			var t: float=clampf(leg.age/.24,0,1)
			var eased: float=t*t*(3-2*t)
			leg.target.global_position=leg.start.lerp(leg.end,eased)+Vector3.UP*(4*t*(1-t)*.10)
			if t>=1:
				leg.stance=leg.end
				leg.swing=false
		else:
			leg.stance=ground(leg.stance,leg.sole_offset).point
			leg.target.global_position=leg.stance
		leg.pole.global_position=actor.to_global(Vector3(leg.rest.x,.55,.5))
		report.foot_contacts[side]={"ray_hit":contact.hit,"swing":leg.swing,"target":[leg.target.global_position.x,leg.target.global_position.y,leg.target.global_position.z]}
	for side in hands:
		var hand: Dictionary=hands[side]
		hand.ik.influence=move_toward(hand.ik.influence,1.0 if hand.active else 0.0,delta*5)
		if hand.active:
			var wrist_goal: Vector3=hand.goal-hand.solved_basis*hand.grip_offset
			hand.target.global_position=hand.target.global_position.move_toward(wrist_goal,delta*(.48 if hand.grip_goal>.1 else 1.3))
		else: hand.target.global_position=world_pose(hand.name).origin
		var sign_x: float=signf(hand.rest.x)
		hand.pole.global_position=actor.to_global(Vector3(sign_x*.85,1.35,-.22))
		hand.grip=move_toward(hand.grip,hand.grip_goal,delta*2.8)
		apply_grip(side,hand.grip)
	blink_clock+=delta
	var phase:=fmod(blink_clock,4.6)
	var blink:=0.0
	if phase<.08: blink=phase/.08
	elif phase<.18: blink=1.0-(phase-.08)/.10
	if manual_blink>=0.0: blink=manual_blink
	apply_face(blink)

func apply_face(blink: float) -> void:
	var b:=clampf(blink,0,1)
	var aa: float=clampf(expression.aa,0,1)
	var ee: float=clampf(expression.ee,0,1)
	var oh: float=clampf(expression.oh,0,1)
	var denominator:=maxf(1.0,aa+ee+oh)
	var gaze_x: float=clampf(expression.gazeX,-1,1)
	var gaze_y: float=clampf(expression.gazeY,-1,1)
	for name in ["smile","sad","cheek"]: set_expression(name,expression[name])
	set_expression("blink",b)
	set_expression("blink_sphere_inbetween",4*b*(1-b))
	set_expression("aa",aa/denominator)
	set_expression("ee",ee/denominator)
	set_expression("oh",oh/denominator)
	set_expression("lookUp",maxf(0,gaze_y))
	set_expression("lookDown",maxf(0,-gaze_y))
	for name in ["smile","sad"]: set_expression("corrective_blink_"+name,b*expression[name])
	set_expression("corrective_blink_lookUp",b*maxf(0,gaze_y))
	set_expression("corrective_blink_lookDown",b*maxf(0,-gaze_y))
	if bones.has("Jaw"):
		var amount: float=minf(1,maxf(expression.jaw,maxf(aa*.75,maxf(ee*.25,oh*.65))))
		var rest: Quaternion=bones.Jaw.rotation
		var rest_axis: Vector3=body.get_bone_global_rest(bones.Jaw.id).basis.x
		var direction:=1.0 if rest_axis.x>=0 else -1.0
		body.set_bone_pose_rotation(bones.Jaw.id,rest*Quaternion(Vector3.RIGHT,direction*.18*amount))
	for name in ["Eye.L","Eye.R"]:
		if bones.has(name): body.set_bone_pose_rotation(bones[name].id,bones[name].rotation*Quaternion(Vector3.BACK,.30*gaze_x)*Quaternion(Vector3.RIGHT,.20*gaze_y))
	if bones.has("Tongue"): body.set_bone_pose_rotation(bones.Tongue.id,bones.Tongue.rotation*Quaternion(Vector3.RIGHT,.035*aa))
	report["face_controls"]={"blink":b,"halfblink_corrective":4*b*(1-b),"gaze":[gaze_x,gaze_y],"visemes":[aa/denominator,ee/denominator,oh/denominator],"manual_expression_study":manual_blink>=0 or aa+ee+oh>0,"audio_connected":false}

func hand_goal(side: String, point: Vector3, grip: float=0.0) -> void:
	if not hands.has(side): return
	hands[side].active=true
	hands[side].goal=point
	hands[side].grip_goal=clampf(grip,0,1)

func clear_hands() -> void:
	for side in hands:
		hands[side].active=false
		hands[side].grip_goal=0.0

func palm_pose(side: String) -> Transform3D:
	if not hands.has(side): return Transform3D.IDENTITY
	var pose: Transform3D=world_pose(hands[side].name)
	pose.origin=pose*hands[side].grip_offset
	return pose

func apply_grip(side: String, amount: float) -> void:
	for digit in ["thumb","index","middle","ring","little"]:
		for segment in [1,2,3]:
			var name: String="DEF-%s.%02d.%s"%[digit,segment,side]
			if not bones.has(name): continue
			var rotation: Quaternion=bones[name].rotation*Quaternion(Vector3.RIGHT,-amount*[1.0,1.25,1.05][segment-1])
			if digit=="thumb" and segment==1:
				var sign_x: float=signf(hands[side].rest.x)
				rotation=bones[name].rotation*Quaternion(Vector3.BACK,-sign_x*amount*1.15)*Quaternion(Vector3.RIGHT,-amount*[1.0,1.25,1.05][segment-1])
			body.set_bone_pose_rotation(bones[name].id,rotation)

func set_expression(name: String, amount: float) -> void:
	for entry in morphs:
		if entry.names.has(name): entry.mesh.set_blend_shape_value(entry.names[name],clampf(amount,0,1))

func snapshot() -> Dictionary:
	return report.duplicate(true)
