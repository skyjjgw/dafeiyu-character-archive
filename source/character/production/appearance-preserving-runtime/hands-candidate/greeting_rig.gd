extends "res://motion_rig.gd"

var package:Dictionary={}
var greeting_diagnostics:Dictionary={}

func update_upper(delta:float,age:float,wave_target:float,walk_offsets:Dictionary)->void:
	# Candidate-only action correction. Default motion_rig.gd remains untouched.
	if package.is_empty():package=JSON.parse_string(FileAccess.get_file_as_string("res://hands-candidate/assets/hand-package.json"))
	elapsed+=delta
	if elapsed>=next_blink:blink_start=elapsed;blink_count+=1;next_blink=elapsed+3.0+.45*(blink_count%3)
	wave_velocity+=(wave_target-wave)*55.0*delta-wave_velocity*14.8*delta
	wave=clampf(wave+wave_velocity*delta,0,1)
	var wrist_target=(.15 if int(age/.34)%2==0 else -.15)*wave
	wrist_velocity+=(wrist_target-wrist)*115.0*delta-wrist_velocity*18.0*delta;wrist+=wrist_velocity*delta
	update_attention(delta)
	for side in ["left","right"]:
		var swing=float(walk_offsets.get(side,0.0));var q:Quaternion=rest[side+"UpperArm"].basis.get_rotation_quaternion()
		skeleton.set_bone_pose_rotation(ids[side+"UpperArm"],q*Quaternion(Vector3.RIGHT,clampf(-swing*.65,-.15,.15)*(1-wave if side=="left" else 1.0)))
	if wave>.00001:
		var upper="leftUpperArm";var lower="leftForeArm";var hand="leftHand";var baseline={}
		for key in [upper,lower,hand]:baseline[key]=skeleton.get_bone_pose_rotation(ids[key])
		var raised=Vector3(-.73,.79,.29)
		solve_chain(upper,lower,hand,raised,Vector3(-.7,-.5,.5),Basis.IDENTITY)
		var wrist_origin=skeleton.get_bone_global_pose(ids[hand]).origin
		var wrist_world=skeleton.global_transform*wrist_origin
		var normal=(skeleton.global_transform.basis.inverse()*(attention_target-wrist_world)).normalized()
		var up=(skeleton.global_transform.basis.inverse()*Vector3.UP).normalized()
		up=(up-normal*up.dot(normal)).normalized()
		var desired_frame=Basis(up.cross(normal).normalized(),up,normal)
		var bind_middle=package.rig.hands.left.digits.middle.bindMatrices[0]
		var source_y=Vector3(bind_middle[4],bind_middle[5],bind_middle[6]).normalized()
		var source_z=Vector3(0,0,1);var source_frame=Basis(source_y.cross(source_z).normalized(),source_y,source_z)
		var ib=contract.aliases.leftHand.inverseBind
		var inverse_bind_basis=Basis(Vector3(ib[0],ib[1],ib[2]),Vector3(ib[4],ib[5],ib[6]),Vector3(ib[8],ib[9],ib[10]))
		var goal=Basis(normal,wrist)*desired_frame*source_frame.inverse()*inverse_bind_basis.inverse()
		# Use forearm pronation about its true long axis before wrist correction;
		# this preserves the solved elbow/wrist endpoints and original bone length.
		var lower_pose=skeleton.get_bone_global_pose(ids[lower])
		var forearm_axis=(wrist_origin-lower_pose.origin).normalized()
		var nominal_palm=(lower_pose.basis*rest[hand].basis*inverse_bind_basis*source_z).normalized()
		var a=(nominal_palm-forearm_axis*nominal_palm.dot(forearm_axis)).normalized()
		var b=(normal-forearm_axis*normal.dot(forearm_axis)).normalized()
		var roll=clampf(atan2(forearm_axis.dot(a.cross(b)),a.dot(b)),-1.25,1.25)
		global_basis(lower,Basis(forearm_axis,roll)*lower_pose.basis)
		global_basis(hand,goal)
		var wrist_goal=skeleton.get_bone_pose_rotation(ids[hand]);var neutral_q=rest[hand].basis.get_rotation_quaternion()
		var wrist_angle=neutral_q.angle_to(wrist_goal)
		if wrist_angle>1.1:skeleton.set_bone_pose_rotation(ids[hand],neutral_q.slerp(wrist_goal,1.1/wrist_angle))
		for key in [upper,lower,hand]:skeleton.set_bone_pose_rotation(ids[key],baseline[key].slerp(skeleton.get_bone_pose_rotation(ids[key]),smooth(wave)))
		var actual_normal=(skeleton.global_transform.basis*skeleton.get_bone_global_pose(ids[hand]).basis*inverse_bind_basis*source_z).normalized()
		greeting_diagnostics={"orientation_target":"world attention target, gravity up; not camera-facing billboard","palm_dot_attention":actual_normal.dot((attention_target-wrist_world).normalized()),"forearm_roll_rad":roll,"wrist_local_angle_rad_before_limit":wrist_angle,"wrist_limit_rad":1.1,"wave_blend":wave}
	last_pose={"wave":wave,"wave_velocity":wave_velocity,"head_angles":head_angles,"eye_lead_age":attention_age,"torso_yaw":torso_yaw,"face_kernel_connected":face_kernel_connected,"gaze":gaze,"greeting":greeting_diagnostics}
