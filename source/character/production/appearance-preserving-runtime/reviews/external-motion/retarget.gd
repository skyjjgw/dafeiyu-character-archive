extends RefCounted

const PATH="E:/zzz/dafeiyu-character-materials-20261025/references/test-assets/motion/quaternius-standard/UAL1_Standard.glb"
const MAP={"hips":"pelvis","spine":"spine_01","chest":"spine_03","leftUpperArm":"upperarm_l","leftForeArm":"lowerarm_l","leftHand":"hand_l","rightUpperArm":"upperarm_r","rightForeArm":"lowerarm_r","rightHand":"hand_r","leftUpperLeg":"thigh_l","leftLowerLeg":"calf_l","leftFoot":"foot_l","rightUpperLeg":"thigh_r","rightLowerLeg":"calf_r","rightFoot":"foot_r"}
const CHILD={"leftUpperArm":"leftForeArm","leftForeArm":"leftHand","rightUpperArm":"rightForeArm","rightForeArm":"rightHand","leftUpperLeg":"leftLowerLeg","leftLowerLeg":"leftFoot","rightUpperLeg":"rightLowerLeg","rightLowerLeg":"rightFoot"}
var model:Node3D
var skeleton:Skeleton3D
var player:AnimationPlayer
var rig:RefCounted
var ids={}
var correction={}
var common=Basis(Vector3.UP,PI)
var active_map=MAP.duplicate()
var mapping=[]
var root_translation_copied=false
var maximum_length_error=0.0
var finite=true
var head_rest:Transform3D

func _skeleton(n:Node)->Skeleton3D:
	if n is Skeleton3D:return n
	for child in n.get_children():
		var found=_skeleton(child)
		if found!=null:return found
	return null
func _player(n:Node)->AnimationPlayer:
	if n is AnimationPlayer:return n
	for child in n.get_children():
		var found=_player(child)
		if found!=null:return found
	return null
func _vec(v:Vector3)->Array:return [v.x,v.y,v.z]
func _basis(b:Basis)->Array:return [_vec(b.x),_vec(b.y),_vec(b.z)]
func _frame(axis:Vector3,forward:Vector3)->Basis:
	var y=axis.normalized();var z=(forward-y*forward.dot(y)).normalized()
	if z.length()<.01:z=(Vector3.RIGHT-y*y.x).normalized()
	return Basis(y.cross(z).normalized(),y,z).orthonormalized()

func setup(parent:Node,target_rig:RefCounted)->Dictionary:
	rig=target_rig;head_rest=rig.head.transform
	var doc=GLTFDocument.new();var state=GLTFState.new()
	var error=doc.append_from_file(PATH,state,GLTFDocument.IMPORT_FLAG_FORCE_DISABLE_MESH_COMPRESSION)
	if error!=OK:return {"ok":false,"error":error}
	model=doc.generate_scene(state);parent.add_child(model);model.visible=false
	skeleton=_skeleton(model);player=_player(model);player.active=false
	for key in active_map:
		ids[key]=skeleton.find_bone(active_map[key])
		if ids[key]<0:return {"ok":false,"missing":active_map[key]}
		var src=skeleton.get_bone_global_rest(ids[key]).basis.orthonormalized()
		var tgt:Basis=rig.neutral_global[key].basis.orthonormalized()
		var method="global-rest-delta"
		var src_axis=Vector3.ZERO;var tgt_axis=Vector3.ZERO
		if CHILD.has(key):
			var next:String=CHILD[key];var source_next=skeleton.find_bone(active_map[next])
			src_axis=skeleton.get_bone_rest(source_next).origin
			tgt_axis=rig.rest[next].origin
			# Anatomical segment frames map the actual child axis, rather than
			# copying T-pose rotation deltas onto already lowered target arms.
			var fs=_frame(src_axis,src.inverse()*common.inverse()*Vector3.BACK)
			var ft=_frame(tgt_axis,tgt.inverse()*Vector3.BACK)
			correction[key]=fs*ft.inverse()
			method="anatomical-segment-frame"
		elif key.ends_with("Hand"):
			var arm=key.replace("Hand","ForeArm")
			var arm_source=skeleton.get_bone_global_rest(ids[arm]).basis.orthonormalized()
			# Keep the hand's source rest offset relative to its mapped forearm.
			var desired_arm=common*arm_source*correction[arm]
			var desired_hand=desired_arm*rig.rest[key].basis.orthonormalized()
			correction[key]=(common*src).inverse()*desired_hand
			method="forearm-calibrated-wrist-rest-delta"
		else:correction[key]=(common*src).inverse()*tgt
		mapping.append({"target":key,"source":active_map[key],"method":method,"source_index":ids[key],"target_index":rig.ids[key],"source_parent":skeleton.get_bone_parent(ids[key]),"target_parent":rig.skeleton.get_bone_parent(rig.ids[key]),"source_rest_global_basis":_basis(src),"target_neutral_global_basis":_basis(tgt),"source_axis":_vec(src_axis),"target_axis":_vec(tgt_axis),"correction":_basis(correction[key]),"target_local_origin":_vec(rig.rest[key].origin)})
	return {"ok":true,"source_bones":skeleton.get_bone_count(),"mapped":mapping.size(),"common_basis":_basis(common),"mapping":mapping,"ignored_target_bones":"four cloth and three Jolt-tail bones retain current system", "head":"existing chest child and all original head attachments preserved; no new face or skull geometry"}

func _sample(clip:String,time:float)->Dictionary:
	# Directly sample real imported Animation tracks. No procedural substitute.
	skeleton.reset_bone_poses()
	var anim=player.get_animation(clip)
	var sample_time=fposmod(time,anim.length)
	for track in anim.get_track_count():
		var path=anim.track_get_path(track)
		if path.get_subname_count()<1:continue
		var i=skeleton.find_bone(str(path.get_subname(0)))
		if i<0:continue
		match anim.track_get_type(track):
			Animation.TYPE_ROTATION_3D:skeleton.set_bone_pose_rotation(i,anim.rotation_track_interpolate(track,sample_time))
			Animation.TYPE_POSITION_3D:skeleton.set_bone_pose_position(i,anim.position_track_interpolate(track,sample_time))
			Animation.TYPE_SCALE_3D:skeleton.set_bone_pose_scale(i,anim.scale_track_interpolate(track,sample_time))
	var result={}
	for key in active_map:
		result[key]=(common*skeleton.get_bone_global_pose(ids[key]).basis.orthonormalized()*correction[key]).orthonormalized().get_rotation_quaternion()
	return result

func apply(time:float,walk_weight:float,contact_corrected:bool)->void:
	var idle=_sample("Idle_Loop",time);var walk=_sample("Walk_Loop",time)
	# Every origin stays the selected target's original local origin. The
	# adult source root/pelvis translations and source scales are excluded.
	for key in active_map:
		var index:int=rig.ids[key]
		if key!="hips":rig.skeleton.set_bone_pose_position(index,rig.rest[key].origin)
		var desired=Basis(idle[key].slerp(walk[key],clampf(walk_weight,0,1)))
		rig.global_basis(key,desired)
		var q=rig.skeleton.get_bone_pose_rotation(index)
		finite=finite and q.is_finite() and absf(q.length()-1)<.0001
	# No Head bone exists in body22; keep the original head attachment local
	# transform so the chest motion is inherited once, without adult face data.
	rig.head.transform=head_rest
	if contact_corrected:
		# The existing CharacterBody/Jolt controller owns contact planning and
		# movement. Its final leg IK is an explicit override of source legs.
		rig.fit_support_height(1.0/240,.002)
		rig.solve_legs()
	for key in active_map:
		if key!="hips":maximum_length_error=maxf(maximum_length_error,rig.skeleton.get_bone_pose_position(rig.ids[key]).distance_to(rig.rest[key].origin))

func dispose()->void:
	if is_instance_valid(model):model.queue_free();model=null
