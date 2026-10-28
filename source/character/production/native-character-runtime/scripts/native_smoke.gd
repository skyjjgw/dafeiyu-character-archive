extends SceneTree

var checks: Array=[]
var main: Node3D
var observations: Dictionary={}

func _initialize() -> void:
	call_deferred("run")

func ticks(count: int) -> void:
	for i in ceili(count*Engine.physics_ticks_per_second/120.0): await physics_frame

func check(label: String,passed: bool,evidence: Variant) -> void:
	checks.append({"name":label,"passed":passed,"evidence":evidence.duplicate(true) if evidence is Dictionary or evidence is Array else evidence})
	print(("PASS " if passed else "FAIL ")+label)

func xyz(point: Vector3) -> Array:
	return [point.x,point.y,point.z]

func expression_values(rig: Node,key: String) -> Array:
	var values: Array=[]
	for entry in rig.morphs:
		if entry.names.has(key): values.append(entry.mesh.get_blend_shape_value(entry.names[key]))
	return values

func run() -> void:
	main=load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	await ticks(90)
	var actor: CharacterBody3D=main.actor
	var rig: Node=actor.rig
	check("complete native GLB loaded",main.asset_state=="ready",{"state":main.asset_state,"surfaces":main.material_report.get("surfaces",[]).size(),"bones":rig.body.get_bone_count() if rig.body else 0})
	if main.asset_state!="ready": finish(); return
	check("actual arm and leg TwoBoneIK bindings",rig.report.missing.is_empty() and rig.legs.size()==2 and rig.hands.size()==2,rig.report.bound)
	var names: Array=["FaceHead","Hair.HeadAnchor"]
	var before: Dictionary={}
	var head_before: Transform3D=rig.world_pose("Head")
	for name in names: before[name]={"local":head_before.affine_inverse()*rig.world_pose(name),"world":rig.world_pose(name)}
	var head_id: int=rig.bones.Head.id
	var head_rest: Quaternion=rig.body.get_bone_pose_rotation(head_id)
	rig.body.set_bone_pose_rotation(head_id,head_rest*Quaternion(Vector3.UP,.22))
	await ticks(8)
	var head_after: Transform3D=rig.world_pose("Head")
	var follow: Dictionary={}
	var follows:=true
	for name in names:
		var actual: Transform3D=rig.world_pose(name)
		var local: Transform3D=head_after.affine_inverse()*actual
		var position_error: float=local.origin.distance_to(before[name].local.origin)
		var rotation_error: float=local.basis.get_rotation_quaternion().angle_to(before[name].local.basis.get_rotation_quaternion())
		var world_turn: float=actual.basis.get_rotation_quaternion().angle_to(before[name].world.basis.get_rotation_quaternion())
		follow[name]={"local_position_error":position_error,"local_rotation_error":rotation_error,"world_rotation_change":world_turn}
		follows=follows and position_error<.001 and rotation_error<.001 and world_turn>.10
	check("Head carries face and hair once",follows,follow)
	rig.body.set_bone_pose_rotation(head_id,head_rest)
	rig.manual_blink=.5
	rig.expression.merge({"aa":.65,"smile":.7,"gazeX":.4,"gazeY":.3},true)
	await ticks(8)
	var controls: Dictionary={}
	var correct:=true
	for key in {"blink":.5,"blink_sphere_inbetween":1.0,"corrective_blink_smile":.35,"corrective_blink_lookUp":.15,"aa":.65}:
		var values:=expression_values(rig,key)
		controls[key]=values
		correct=correct and not values.is_empty()
		for value in values: correct=correct and absf(value-{"blink":.5,"blink_sphere_inbetween":1.0,"corrective_blink_smile":.35,"corrective_blink_lookUp":.15,"aa":.65}[key])<.0001
	controls["eye_rotation"]=rig.body.get_bone_pose_rotation(rig.bones["Eye.L"].id).get_angle()
	check("native halfblink and combined morph correctives",correct,controls)
	rig.manual_blink=0
	rig.expression.merge({"aa":0.0,"smile":0.0,"gazeX":0.0,"gazeY":0.0},true)
	actor.command_move=true
	actor.injected_move=Vector2(0,-1)
	await ticks(190)
	actor.injected_move=Vector2.ZERO
	await ticks(60)
	var feet: Dictionary={}
	var feet_valid:=true
	for side in rig.legs:
		var leg: Dictionary=rig.legs[side]
		var error: float=rig.world_pose(leg.name).origin.distance_to(leg.target.global_position)
		feet[side]={"end_error":error,"ground_hit":rig.report.foot_contacts[side].ray_hit,"target":xyz(leg.target.global_position)}
		feet_valid=feet_valid and error<.035 and rig.report.foot_contacts[side].ray_hit
	check("root sweep meets table without crossing",actor.global_position.z>.25 and actor.global_position.z<.70 and actor.is_on_floor(),{"position":xyz(actor.global_position),"travelled":actor.travelled,"floor":actor.is_on_floor()})
	check("actual native feet IK and floor rays",feet_valid,feet)
	var cup_start: Vector3=main.cup.global_position
	actor.start_action("pickup")
	var minimum_hand_distance:=INF
	for i in 520:
		await ticks(1)
		minimum_hand_distance=minf(minimum_hand_distance,actor.last_hand_pose.origin.distance_to(main.cup.grip_world()))
		if is_instance_valid(actor.grasp.held): break
	var attached:=is_instance_valid(actor.grasp.held)
	var hand_evidence: Dictionary={}
	for side in rig.hands: hand_evidence[side]={"palm":xyz(rig.palm_pose(side).origin),"target":xyz(rig.hands[side].target.global_position),"goal":xyz(rig.hands[side].goal)}
	check("native hand reaches dynamic cup through spring joint",attached,{"minimum_hand_distance":minimum_hand_distance,"action":actor.action,"hands":hand_evidence,"events":actor.events,"grasp":actor.grasp.snapshot(),"cup":main.cup.snapshot()})
	if attached:
		await ticks(150)
		check("held cup remains dynamic and tracks grasp",not main.cup.freeze and main.cup.global_position.y>cup_start.y+.15 and actor.grasp.maximum_error<.015 and actor.grasp.maximum_post_solver_error<.008,{"start":xyz(cup_start),"held_position":xyz(main.cup.global_position),"mass":main.cup.mass,"grasp":actor.grasp.snapshot()})
		actor.start_action("release")
		await ticks(130)
		check("release removes joint and cup resumes contacts",not is_instance_valid(actor.grasp.held) and not is_instance_valid(actor.grasp.joint),main.cup.snapshot())
	actor.start_action("wave")
	await ticks(35)
	actor.start_action("cancel")
	await ticks(8)
	check("authored action is interruptible",actor.action=="idle" and not rig.hands[actor.action_side].active,actor.events)
	var secondary: Dictionary=main.secondary.snapshot()
	var all_simulating:=true
	var finite:=true
	var live_speed:=0.0
	for bone in main.secondary.dynamic_bones:
		all_simulating=all_simulating and bone.is_simulating_physics()
		finite=finite and bone.global_position.is_finite() and bone.global_position.length()<10
		live_speed=maxf(live_speed,bone.linear_velocity.length())
	check("native hair and tail use actual Jolt rigid joints",secondary.dynamic_count==53 and secondary.body_contact_count==47 and secondary.excluded_dynamic_duplicates.size()==5 and all_simulating and finite,{"dynamic":secondary.dynamic_count,"contacts":secondary.body_contact_count,"excluded_duplicate_tail_hulls":secondary.excluded_dynamic_duplicates,"live_max_speed":live_speed,"maximum_position":secondary.maximum_bone_position,"terminal_bind_errors":secondary.missing_terminal_lengths})
	var maximum_joint_error:=0.0
	var maximum_joint_angle:=0.0
	for joint in secondary.measured_joints:
		maximum_joint_error=maxf(maximum_joint_error,joint.linear_joint_error)
		maximum_joint_angle=maxf(maximum_joint_angle,joint.angle_from_rest)
	check("actual secondary joints remain connected and angle bounded",maximum_joint_error<.012 and maximum_joint_angle<sqrt(3.0)*.45+.02,{"max_linear_error":maximum_joint_error,"max_angle_from_rest":maximum_joint_angle,"scope":"Measured after movement, reach, release and action interrupt"})
	var cloth: Dictionary=main.clothing.snapshot()
	check("native SoftBody integrates and transfers actual points",cloth.get("ready",false) and cloth.full_pin_count==128 and cloth.rendered_high_meshes.size()==8 and cloth.maximum_displacement>.01 and cloth.current_pin_error<.005,cloth)
	check("garment numeric inversion alarm below 2 percent",cloth.geometry.inverted_triangles_against_material_rest<=46 and cloth.geometry.collapsed_triangles==0,cloth.geometry)
	var previous: Vector3=actor.global_position
	main.toggle_pause()
	await ticks(12)
	var stopped:=previous.distance_to(actor.global_position)<.00001
	var dump_key:=InputEventKey.new()
	dump_key.keycode=KEY_F8
	dump_key.pressed=true
	root.push_input(dump_key,true)
	await process_frame
	await process_frame
	var paused_dump=JSON.parse_string(FileAccess.get_file_as_string("res://reports/native-interactive-latest.json")) if FileAccess.file_exists("res://reports/native-interactive-latest.json") else null
	check("snapshot key works while paused",paused_dump is Dictionary and paused_dump.get("paused",false),{"saved":paused_dump is Dictionary})
	main.toggle_pause()
	await ticks(5)
	check("pause freezes actor and can resume",stopped and not paused,{"position_drift":previous.distance_to(actor.global_position),"resumed":not paused})
	var rejects: Array=[]
	for payload in [{"schema":"dafeiyu.character.v1","type":"character.behavior","action":"shell"},{"schema":"dafeiyu.character.v1","type":"character.state","apiKey":"not-a-key"},{"schema":"dafeiyu.character.v1","type":"character.state","approvals":-1}]:
		rejects.append(main.receive_character_message(payload))
	check("reserved character boundary rejects management and credentials",rejects.all(func(value):return not value.ok) and not main.dsh_state.connected,rejects)
	observations["final"]=main.snapshot()
	finish()

func finish() -> void:
	var failed:=checks.filter(func(item): return not item.passed).size()
	var report: Dictionary={"engine":Engine.get_version_info(),"checks":checks,"passed":checks.size()-failed,"failed":failed,"observations":observations,"limitations":["Kinematic locomotion with real sweep/IK is not whole-body active balance","Spring-joint grasp is not fingertip force closure","Garment self-contact and visual motion quality still require GPU/manual acceptance","Headless tests do not establish artistic or video quality"]}
	var file:=FileAccess.open("res://reports/native-smoke.json",FileAccess.WRITE)
	file.store_string(JSON.stringify(report,"\t"))
	print("Native character checks: "+str(checks.size()-failed)+" passed, "+str(failed)+" failed")
	quit(0 if failed==0 else 1)
