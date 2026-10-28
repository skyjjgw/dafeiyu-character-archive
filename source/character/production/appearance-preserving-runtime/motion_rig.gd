extends RefCounted

var actor:CharacterBody3D
var model:Node3D
var skeleton:Skeleton3D
var head:Node3D
var contract:Dictionary
var ids:Dictionary={}
var rest:Dictionary={}
var neutral_global:Dictionary={}
var feet:Dictionary={}
var unit=.35
var wave=0.0
var wave_velocity=0.0
var wrist=0.0
var wrist_velocity=0.0
var head_angles=Vector2.ZERO
var head_velocity=Vector2.ZERO
var gaze=Vector2.ZERO
var gaze_velocity=Vector2.ZERO
var elapsed=0.0
var blink_start=-1.0
var next_blink=3.1
var blink_count=0
var torso_yaw=0.0
var torso_velocity=0.0
var face_kernel_connected=false
var attention_age=0.0
var attention_target=Vector3.ZERO
var attention_active=false
var attention_head_hold=Vector2.ZERO
var attention_torso_hold=0.0
var last_rotations:Dictionary={}
var max_bone_length_error=0.0
var max_angular_speed=0.0
var max_support_slip=0.0
var last_pose:Dictionary={}
var proxies:Array=[]
var leg_diagnostics:Dictionary={}
var pelvis_lowering=0.0
var max_pelvis_lowering=0.0

func configure(owner_body:CharacterBody3D,source_model:Node3D,rig_contract:Dictionary)->bool:
	actor=owner_body;model=source_model;contract=rig_contract;unit=float(contract.metersPerSourceUnit)
	skeleton=find_skeleton(model)
	head=model.find_child("head-control",true,false) as Node3D
	if skeleton==null or head==null:return false
	for key in contract.aliases:
		var index=skeleton.find_bone(contract.aliases[key].godotName)
		if index<0:return false
		ids[key]=index
		rest[key]=skeleton.get_bone_pose(index)
		neutral_global[key]=skeleton.get_bone_global_pose(index)
	for side in ["left","right"]:
		var data=contract.shoes[side]
		var pose=world_bone(side+"Foot")
		feet[side]={"sole":Vector3(data.soleLocal[0],data.soleLocal[1],data.soleLocal[2]),"heel":Vector3(data.heelLocal[0],data.heelLocal[1],data.heelLocal[2]),"toe":Vector3(data.toeLocal[0],data.toeLocal[1],data.toeLocal[2]),"initial":pose,"pose":pose,"anchor":pose*(Vector3(data.soleLocal[0],data.soleLocal[1],data.soleLocal[2])*unit),"support":true,"pivot":"sole"}
	attention_target=actor.global_position+Vector3(0,.78,1.5)
	create_proxies()
	return true

func find_skeleton(node:Node)->Skeleton3D:
	if node is Skeleton3D:return node
	for child in node.get_children():
		var found=find_skeleton(child)
		if found!=null:return found
	return null

func world_bone(key:String)->Transform3D:
	var result=skeleton.global_transform*skeleton.get_bone_global_pose(ids[key])
	result.basis=result.basis.orthonormalized()
	return result

func sole_pose(side:String,point:Vector3,basis:Basis)->Transform3D:
	return Transform3D(basis,point-basis*(feet[side].sole*unit))

func sole_point(side:String)->Vector3:
	return feet[side].pose*(feet[side].sole*unit)

func attend(point:Vector3)->void:
	if attention_active and point.distance_to(attention_target)<.015:
		attention_target=point
		return
	attention_head_hold=head_angles;attention_torso_hold=torso_yaw
	attention_target=point;attention_age=0.0;attention_active=true

func begin_pose(pelvis_shift:Vector2)->void:
	for key in ids:
		skeleton.set_bone_pose_position(ids[key],rest[key].origin)
		skeleton.set_bone_pose_rotation(ids[key],rest[key].basis.get_rotation_quaternion())
		skeleton.set_bone_pose_scale(ids[key],Vector3.ONE)
	var pelvis:Vector3=rest.hips.origin+Vector3(pelvis_shift.x,pelvis_shift.y,0)
	skeleton.set_bone_pose_position(ids.hips,pelvis)

func global_basis(key:String,basis:Basis)->void:
	var parent=skeleton.get_bone_parent(ids[key])
	var parent_basis=skeleton.get_bone_global_pose(parent).basis if parent>=0 else Basis.IDENTITY
	skeleton.set_bone_pose_rotation(ids[key],(parent_basis.inverse()*basis).orthonormalized().get_rotation_quaternion())

func aim_basis(key:String,local_axis:Vector3,direction:Vector3)->Basis:
	var original:Basis=neutral_global[key].basis
	var old=(original*local_axis).normalized()
	return Basis(Quaternion(old,direction.normalized()))*original

func solve_chain(upper_key:String,lower_key:String,end_key:String,target:Vector3,pole:Vector3,end_basis:Basis)->Dictionary:
	var hip=skeleton.get_bone_global_pose(ids[upper_key]).origin
	var upper_axis:Vector3=rest[lower_key].origin
	var lower_axis:Vector3=rest[end_key].origin
	var a=upper_axis.length();var b=lower_axis.length()
	var direction=target-hip
	var requested=direction.length()
	direction=direction.normalized() if requested>1e-8 else Vector3.DOWN
	var distance=clampf(requested,absf(a-b)+.000001,a+b-.000001)
	var along=(a*a+distance*distance-b*b)/(2.0*distance)
	var perpendicular=(pole-direction*pole.dot(direction)).normalized()
	if perpendicular.length_squared()<.001:perpendicular=Vector3.RIGHT
	var knee=hip+direction*along+perpendicular*sqrt(maxf(0,a*a-along*along))
	var ankle=hip+direction*distance
	global_basis(upper_key,aim_basis(upper_key,upper_axis,knee-hip))
	global_basis(lower_key,aim_basis(lower_key,lower_axis,ankle-knee))
	global_basis(end_key,end_basis)
	return {"clamped":absf(requested-distance)>.00001,"requested":requested,"reachable":distance}

func solve_legs()->void:
	var inverse=skeleton.global_transform.affine_inverse()
	for side in ["left","right"]:
		var target:Transform3D=inverse*feet[side].pose
		leg_diagnostics[side]=solve_chain(side+"UpperLeg",side+"LowerLeg",side+"Foot",target.origin,Vector3(0,0,1),target.basis.orthonormalized())

func fit_support_height(delta:float,knee_reserve:float)->void:
	var inverse=skeleton.global_transform.affine_inverse()
	var lowering=0.0
	for side in feet:
		var hip:Vector3=skeleton.get_bone_global_pose(ids[side+"UpperLeg"]).origin
		var ankle:Vector3=(inverse*feet[side].pose).origin
		var length=rest[side+"LowerLeg"].origin.length()+rest[side+"Foot"].origin.length()-knee_reserve
		var horizontal=Vector2(hip.x-ankle.x,hip.z-ankle.z).length_squared()
		var max_vertical=sqrt(maxf(0,length*length-horizontal))
		lowering=maxf(lowering,maxf(0,hip.y-ankle.y-max_vertical))
	pelvis_lowering=maxf(clampf(lowering,0,.16),pelvis_lowering-.4*delta)
	max_pelvis_lowering=maxf(max_pelvis_lowering,pelvis_lowering)
	var position=skeleton.get_bone_pose_position(ids.hips)
	position.y-=pelvis_lowering
	skeleton.set_bone_pose_position(ids.hips,position)

func update_upper(delta:float,age:float,wave_target:float,walk_offsets:Dictionary)->void:
	elapsed+=delta
	if elapsed>=next_blink:blink_start=elapsed;blink_count+=1;next_blink=elapsed+3.0+.45*(blink_count%3)
	# Goal changes retain both value and velocity, including during cancel.
	wave_velocity+=(wave_target-wave)*55.0*delta-wave_velocity*14.8*delta
	wave+=wave_velocity*delta
	wave=clampf(wave,0,1)
	var wrist_target=(.15 if int(age/.34)%2==0 else -.15)*wave
	wrist_velocity+=(wrist_target-wrist)*115.0*delta-wrist_velocity*18.0*delta
	wrist+=wrist_velocity*delta
	update_attention(delta)
	for side in ["left","right"]:
		var swing=float(walk_offsets.get(side,0.0))
		var q:Quaternion=rest[side+"UpperArm"].basis.get_rotation_quaternion()
		skeleton.set_bone_pose_rotation(ids[side+"UpperArm"],q*Quaternion(Vector3.RIGHT,clampf(-swing*.65,-.15,.15)*(1-wave if side=="left" else 1.0)))
	if wave>.00001:
		var upper="leftUpperArm";var lower="leftForeArm";var hand="leftHand"
		var baseline_rotations={}
		for key in [upper,lower,hand]:baseline_rotations[key]=skeleton.get_bone_pose_rotation(ids[key])
		# Source coordinates and original limb lengths; no native rig aliases.
		var raised=Vector3(-.73,.79,.29)
		solve_chain(upper,lower,hand,raised,Vector3(-.7,-.5,.5),Basis(Vector3.FORWARD,-1.55+wrist))
		var hand_goal=skeleton.get_bone_pose_rotation(ids[hand])
		var wrist_angle=baseline_rotations[hand].angle_to(hand_goal)
		if wrist_angle>1.1:skeleton.set_bone_pose_rotation(ids[hand],baseline_rotations[hand].slerp(hand_goal,1.1/wrist_angle))
		# Fade complete joint solutions against the current locomotion pose. This
		# also fades the solver's twist, avoiding an end-of-cancel wrist jump.
		for key in [upper,lower,hand]:skeleton.set_bone_pose_rotation(ids[key],baseline_rotations[key].slerp(skeleton.get_bone_pose_rotation(ids[key]),smooth(wave)))
	last_pose={"wave":wave,"wave_velocity":wave_velocity,"head_angles":head_angles,"eye_lead_age":attention_age,"torso_yaw":torso_yaw,"face_kernel_connected":face_kernel_connected,"gaze":gaze}

func update_attention(delta:float)->void:
	attention_age+=delta
	var eye=world_bone("chest").origin+Vector3(0,.15,0)
	var relative=actor.global_basis.inverse()*(attention_target-eye)
	var yaw=atan2(relative.x,relative.z)
	var pitch=-atan2(relative.y,Vector2(relative.x,relative.z).length())
	var gaze_target=Vector2(clampf(yaw/.55,-1,1),clampf(-pitch/.35,-1,1)) if attention_active else Vector2.ZERO
	gaze_velocity+=(gaze_target-gaze)*650.0*delta-gaze_velocity*51*delta
	gaze+=gaze_velocity*delta
	var target_head=Vector2(clampf(yaw,-.85,.85),clampf(pitch,-.3,.3)) if attention_active and attention_age>.15 else attention_head_hold if attention_active else Vector2.ZERO
	var torso_target=clampf(target_head.x*.18,-.14,.14) if attention_active and attention_age>.34 else attention_torso_hold if attention_active else 0.0
	torso_velocity+=(torso_target-torso_yaw)*42.0*delta-torso_velocity*13.0*delta
	torso_yaw+=torso_velocity*delta
	skeleton.set_bone_pose_rotation(ids.spine,rest.spine.basis.get_rotation_quaternion()*Quaternion(Vector3.UP,torso_yaw))
	head_velocity+=(target_head-head_angles)*75.0*delta-head_velocity*17.3*delta
	head_angles+=head_velocity*delta
	var chest_world=(skeleton.global_transform.basis*skeleton.get_bone_global_pose(ids.chest).basis).orthonormalized()
	var desired=actor.global_basis.orthonormalized()*Basis.from_euler(Vector3(head_angles.y,head_angles.x,0),EULER_ORDER_YXZ)
	head.quaternion=(chest_world.inverse()*desired).get_rotation_quaternion()

func smooth(t:float)->float:
	var x=clampf(t,0,1)
	return x*x*x*(10+x*(-15+6*x))

func measure(delta:float)->void:
	var length_error=0.0;var angular=0.0;var support_error=0.0
	for key in ids:
		var transform=world_bone(key)
		if last_rotations.has(key):angular=maxf(angular,last_rotations[key].angle_to(transform.basis.orthonormalized().get_rotation_quaternion())/delta)
		last_rotations[key]=transform.basis.orthonormalized().get_rotation_quaternion()
		var parent=skeleton.get_bone_parent(ids[key])
		if parent>=0 and key!="hips":
			var actual=transform.origin.distance_to((skeleton.global_transform*skeleton.get_bone_global_pose(parent)).origin)
			length_error=maxf(length_error,absf(actual-rest[key].origin.length()*unit))
	for side in feet:
		if feet[side].support:
			var reference:Vector3=feet[side][feet[side].pivot]
			var actual=world_bone(side+"Foot")*(reference*unit)
			support_error=maxf(support_error,actual.distance_to(feet[side].anchor))
	max_bone_length_error=maxf(max_bone_length_error,length_error)
	max_angular_speed=maxf(max_angular_speed,angular)
	max_support_slip=maxf(max_support_slip,support_error)
	last_pose.merge({"bone_length_error":length_error,"angular_speed":angular,"support_slip":support_error,"max_bone_length_error":max_bone_length_error,"max_support_slip":max_support_slip,"legs":leg_diagnostics.duplicate(true),"pelvis_lowering_source_units":pelvis_lowering,"max_pelvis_lowering_source_units":max_pelvis_lowering},true)

func create_proxies()->void:
	for pair in [["leftUpperArm","leftForeArm"],["leftForeArm","leftHand"],["rightUpperArm","rightForeArm"],["rightForeArm","rightHand"],["leftUpperLeg","leftLowerLeg"],["leftLowerLeg","leftFoot"],["rightUpperLeg","rightLowerLeg"],["rightLowerLeg","rightFoot"],["hips","chest"]]:
		var body=AnimatableBody3D.new();body.name="FinalPose_"+pair[0];body.collision_layer=16;body.collision_mask=2;body.sync_to_physics=false
		var collision=CollisionShape3D.new();var capsule=CapsuleShape3D.new();capsule.radius=.025 if pair[0]!="hips" else .065;capsule.height=.1;collision.shape=capsule;body.add_child(collision)
		actor.get_parent().add_child(body)
		proxies.append({"body":body,"capsule":capsule,"a":pair[0],"b":pair[1]})

func sync_final_proxies()->void:
	for entry in proxies:
		var a=world_bone(entry.a).origin;var b=world_bone(entry.b).origin
		entry.capsule.height=maxf(a.distance_to(b),entry.capsule.radius*2)
		entry.body.global_transform=Transform3D(Basis(Quaternion(Vector3.UP,(b-a).normalized())),(a+b)*.5)

func face_state()->Dictionary:
	var phase=elapsed-blink_start
	var blink=0.0
	if blink_start>=0 and phase<.08:blink=smooth(phase/.08)
	elif blink_start>=0 and phase<.11:blink=1.0
	elif blink_start>=0 and phase<.24:blink=1-smooth((phase-.11)/.13)
	return {"blink":blink,"talk":0.0,"happy":0.0,"sad":0.0,"gazeX":clampf(gaze.x-head_angles.x/.55,-1,1),"gazeY":clampf(gaze.y+head_angles.y/.35,-1,1)}

func bake_foot_contact_evidence()->Dictionary:
	var result={}
	for side in feet:
		var shoe=model.find_child(side+" traced mary jane shoe",true,false) as MeshInstance3D
		var baked=shoe.bake_mesh_from_current_skeleton_pose()
		var minimum=INF;var lowest=Vector3.ZERO;var count=0
		for surface in range(baked.get_surface_count()):
			var positions:PackedVector3Array=baked.surface_get_arrays(surface)[Mesh.ARRAY_VERTEX]
			for position in positions:
				var world=shoe.global_transform*position
				if world.y<minimum:minimum=world.y;lowest=world
				count+=1
		result[side]={"support":feet[side].support,"pivot":feet[side].pivot,"anchor_y":feet[side].anchor.y,"gpu_skinned_lowest_y":minimum,"lowest_world":[lowest.x,lowest.y,lowest.z],"sample_vertices":count,"method":"Actual MeshInstance3D.bake_mesh_from_current_skeleton_pose, then source mesh world transform. No foot billboard/sole translation."}
	return result

func dispose()->void:
	for entry in proxies:
		if is_instance_valid(entry.body):entry.body.queue_free()
