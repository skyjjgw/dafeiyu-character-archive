extends Node3D
const PROF=preload("res://scripts/profile_util.gd")

var actor: CharacterBody3D
var rig: Node
var simulator: PhysicalBoneSimulator3D
var dynamic_bones: Array[PhysicalBone3D]=[]
var simulated: Array[StringName]=[]
var proxies: Array=[]
var report: Dictionary={"solver":"Jolt PhysicalBoneSimulator3D / six-DOF angular springs","bound":[],"missing_terminal_lengths":[],"excluded_dynamic_duplicates":[],"collision_layers":{"world":1,"cup":2,"root":4,"cloth":8,"body_proxies":16,"hair":32,"tail":64},"started":false,"maximum_bone_position":0.0}

func configure(owner: CharacterBody3D, binding: Node) -> void:
	actor=owner
	rig=binding
	if rig.body==null: return
	simulator=PhysicalBoneSimulator3D.new()
	simulator.name="NativeJoltSecondary"
	rig.body.add_child(simulator)
	add_anchor("Hair.HeadAnchor",true)
	add_anchor("DEF-pelvis",false)
	var bind: Dictionary={}
	if FileAccess.file_exists("res://assets/runtime-rig-bind.json"):
		var value=JSON.parse_string(FileAccess.get_file_as_string("res://assets/runtime-rig-bind.json"))
		if value is Dictionary: bind=value.get("bones",value)
	for name in rig.bones:
		if not str(name).begins_with("Hair.") and not str(name).begins_with("DEF-tail."): continue
		if name=="Hair.HeadAnchor": continue
		var id: int=rig.bones[name].id
		var length:=0.0
		var children: PackedInt32Array=rig.body.get_bone_children(id)
		if bind.has(name):
			var data: Dictionary=bind[name]
			if data.has("length"): length=float(data.length)
			elif data.has("head") and data.has("tail"): length=vector(data.head).distance_to(vector(data.tail))
		elif not children.is_empty(): length=rig.body.get_bone_global_rest(id).origin.distance_to(rig.body.get_bone_global_rest(children[0]).origin)
		if length<.008:
			report.missing_terminal_lengths.append(name)
			continue
		add_dynamic(name,length,bind.get(name,{}))
	if FileAccess.file_exists("res://assets/runtime-rig-bind.json"):
		var source: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://assets/runtime-rig-bind.json"))
		for collider in source.get("colliders",[]): add_authored_proxy(collider)
	# Final modifier signal sees the same posed bones sent to the skin.
	# Reading them later from an ordinary Node callback sees restored input.
	simulator.modification_processed.connect(update_solved_contacts)
	call_deferred("start")

func vector(data: Array) -> Vector3:
	return Vector3(data[0],data[1],data[2])

func add_anchor(name: String,head: bool) -> void:
	if not rig.bones.has(name): return
	var bone:=PhysicalBone3D.new()
	bone.name="Anchor_"+name.replace(".","_")
	simulator.add_child(bone)
	bone.set("bone_name",name)
	bone.collision_layer=0
	bone.collision_mask=0
	report.bound.append({"name":name,"mode":"kinematic anchor","simulated":false,"contacts":"authored convex proxies"})

func add_dynamic(name: String,length: float,data: Dictionary) -> void:
	var tail:=name.begins_with("DEF-tail")
	var bone:=PhysicalBone3D.new()
	bone.name="Physical_"+name.replace(".","_")
	simulator.add_child(bone)
	bone.set("bone_name",name)
	var local_axis:=Vector3.UP
	if data.has("head") and data.has("tail"):
		local_axis=rig.body.get_bone_global_rest(rig.bones[name].id).basis.inverse()*(vector(data.tail)-vector(data.head)).normalized()
	bone.body_offset=Transform3D(Basis(Quaternion(Vector3.UP,local_axis)),local_axis*length*.5)
	bone.joint_offset=bone.body_offset.affine_inverse()
	bone.mass=.045 if tail else .018
	bone.gravity_scale=.30 if tail else .12
	bone.linear_damp=1.4
	bone.angular_damp=1.7
	bone.can_sleep=false
	bone.collision_layer=64 if tail else 32
	bone.collision_mask=1|2|16
	bone.joint_type=PhysicalBone3D.JOINT_TYPE_6DOF
	var limit:=.45 if tail else .34
	for axis in ["x","y","z"]:
		var path: String="joint_constraints/"+axis+"/"
		bone.set(path+"linear_limit_enabled",true)
		bone.set(path+"linear_limit_lower",0.0)
		bone.set(path+"linear_limit_upper",0.0)
		bone.set(path+"angular_limit_enabled",true)
		bone.set(path+"angular_limit_lower",-limit)
		bone.set(path+"angular_limit_upper",limit)
		bone.set(path+"angular_spring_enabled",true)
		bone.set(path+"angular_spring_stiffness",1.8 if tail else .65)
		bone.set(path+"angular_spring_damping",.9)
		bone.set(path+"angular_equilibrium_point",0.0)
	var collision:=CollisionShape3D.new()
	var capsule:=CapsuleShape3D.new()
	var measured_radius: float=float(data.get("radiusEstimate",.04)) if data.get("radiusEstimate")!=null else .04
	capsule.radius=clampf(measured_radius*.38,.012,.065 if tail else .048)
	capsule.height=maxf(capsule.radius*2,length*.94)
	collision.shape=capsule
	bone.add_child(collision)
	dynamic_bones.append(bone)
	simulated.append(StringName(name))
	report.bound.append({"name":name,"mode":"dynamic","mass":bone.mass,"length":length,"radius":capsule.radius,"measured_mesh_radius":measured_radius,"joint":"6DOF angular spring","limit":limit,"bone_id":bone.get_bone_id()})

func add_authored_proxy(data: Dictionary) -> void:
	var name: String=data.get("bone","")
	if not rig.bones.has(name): return
	if name.begins_with("DEF-tail."):
		# These source contact hulls describe the same already-dynamic tail.
		# A second kinematic copy would chase/collide with its own simulated bone.
		report.excluded_dynamic_duplicates.append(name)
		return
	var rest: Transform3D=rig.body.get_bone_global_rest(rig.bones[name].id)
	var points:=PackedVector3Array()
	for point in data.get("modelRestVertices",[]): points.append(rest.affine_inverse()*vector(point))
	if points.size()<4: return
	var proxy:=AnimatableBody3D.new()
	proxy.name="AuthoredContact_"+name.replace(".","_")
	proxy.sync_to_physics=false
	proxy.collision_layer=16
	proxy.collision_mask=2|8|32|64
	add_child(proxy)
	var shape:=ConvexPolygonShape3D.new()
	shape.points=points
	var collision:=CollisionShape3D.new()
	collision.shape=shape
	proxy.add_child(collision)
	proxies.append({"body":proxy,"bone":name})
	for physical in dynamic_bones:
		if name=="Head" and str(physical.get("bone_name")).ends_with(".0"): physical.add_collision_exception_with(proxy)
		# The anchored first tail segment intersects its own pelvis socket at
		# rest. Keep distal chain/body contact, exclude only this adjacent pair.
		if name=="DEF-pelvis" and str(physical.get("bone_name"))=="DEF-tail.0": physical.add_collision_exception_with(proxy)

func add_proxy(start_name: String,end_name: String,radius: float) -> void:
	if not rig.bones.has(start_name) or not rig.bones.has(end_name): return
	var proxy:=AnimatableBody3D.new()
	proxy.name="BodyContact_"+start_name.replace(".","_")
	proxy.sync_to_physics=false
	proxy.collision_layer=16
	proxy.collision_mask=2|8|32|64
	add_child(proxy)
	var collision:=CollisionShape3D.new()
	var capsule:=CapsuleShape3D.new()
	capsule.radius=radius
	capsule.height=maxf(2*radius,rig.world_pose(start_name).origin.distance_to(rig.world_pose(end_name).origin)+radius)
	collision.shape=capsule
	proxy.add_child(collision)
	proxies.append({"body":proxy,"start":start_name,"end":end_name})

func start() -> void:
	await get_tree().physics_frame
	await get_tree().physics_frame
	if not is_instance_valid(simulator): return
	simulator.physical_bones_start_simulation(simulated)
	for bone in dynamic_bones:
		bone.linear_velocity=Vector3.ZERO
		bone.angular_velocity=Vector3.ZERO
	report.started=true

func _physics_process(_delta: float) -> void:
	if rig==null: return
	for bone in dynamic_bones:
		report.maximum_bone_position=maxf(report.maximum_bone_position,bone.global_position.length())

func update_solved_contacts() -> void:
	var prof_start:=PROF.begin()
	for entry in proxies:
		if entry.has("bone"):
			entry.body.global_transform=rig.world_pose(entry.bone)
			continue
		var a: Vector3=rig.world_pose(entry.start).origin
		var b: Vector3=rig.world_pose(entry.end).origin
		var axis: Vector3=(b-a).normalized()
		entry.body.global_transform=Transform3D(Basis(Quaternion(Vector3.UP,axis)),(a+b)*.5)
	PROF.end("secondary_proxies",prof_start)

func snapshot() -> Dictionary:
	var result:=report.duplicate(true)
	result["simulating"]=simulator.is_simulating_physics() if simulator else false
	result["dynamic_count"]=dynamic_bones.size()
	result["body_contact_count"]=proxies.size()
	var measured: Array=[]
	var physical_by_id: Dictionary={}
	for bone in dynamic_bones: physical_by_id[bone.get_bone_id()]=bone
	for bone in dynamic_bones:
		var id:=bone.get_bone_id()
		var parent_id: int=rig.body.get_bone_parent(id)
		var parent_pose: Transform3D=rig.body.global_transform*rig.body.get_bone_global_pose(parent_id)
		if physical_by_id.has(parent_id):
			var parent: PhysicalBone3D=physical_by_id[parent_id]
			parent_pose=parent.global_transform*parent.body_offset.affine_inverse()
		var actual: Transform3D=bone.global_transform*bone.body_offset.affine_inverse()
		var rest_relative: Transform3D=rig.body.get_bone_global_rest(parent_id).affine_inverse()*rig.body.get_bone_global_rest(id)
		var relative: Transform3D=parent_pose.affine_inverse()*actual
		var delta: Quaternion=rest_relative.basis.get_rotation_quaternion().inverse()*relative.basis.get_rotation_quaternion()
		measured.append({"name":bone.get("bone_name"),"angle_from_rest":delta.get_angle(),"linear_joint_error":relative.origin.distance_to(rest_relative.origin),"speed":bone.linear_velocity.length(),"relative_origin":[relative.origin.x,relative.origin.y,relative.origin.z],"rest_relative_origin":[rest_relative.origin.x,rest_relative.origin.y,rest_relative.origin.z]})
	result["measured_joints"]=measured
	result["anchors"]=[]
	for bone in simulator.get_children():
		if bone is PhysicalBone3D and not bone.is_simulating_physics():
			var name: String=str(bone.get("bone_name"))
			result.anchors.append({"name":name,"position":[bone.global_position.x,bone.global_position.y,bone.global_position.z],"target_position":[rig.world_pose(name).origin.x,rig.world_pose(name).origin.y,rig.world_pose(name).origin.z]})
	return result
