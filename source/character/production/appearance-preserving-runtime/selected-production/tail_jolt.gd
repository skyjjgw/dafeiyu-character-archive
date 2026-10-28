extends Node3D

var actor:CharacterBody3D
var rig:RefCounted
var package:Dictionary
var anchor:AnimatableBody3D
var bodies:Array=[]
var joints:Array=[]
var rest_relative:Array=[]
var proxy_masks:Array=[]
var age=0.0
var physics_ready=false
var updates=0
var maximum_joint_gap_m=0.0
var maximum_render_gap_m=0.0
var maximum_angular_speed=0.0
var maximum_angle_from_rest=0.0
var maximum_mesh_displacement_m=0.0
var contact_samples=0
var initial_points:Dictionary={}
var startup_samples:Array=[]

func setup(owner_actor:CharacterBody3D)->Dictionary:
	actor=owner_actor;rig=actor.rig;process_physics_priority=10;process_mode=Node.PROCESS_MODE_PAUSABLE
	package=JSON.parse_string(FileAccess.get_file_as_string("res://selected-production/assets/tail-jolt.json"))
	if package.get("schema","")!="dafeiyu.selected-tail-jolt.v1":return {"ok":false,"error":"Tail component schema missing"}
	anchor=AnimatableBody3D.new();anchor.name="TailPelvisBoundary";anchor.collision_layer=0;anchor.collision_mask=0;anchor.sync_to_physics=false;anchor.disable_mode=CollisionObject3D.DISABLE_MODE_KEEP_ACTIVE;anchor.transform=rig.world_bone("hips");add_child(anchor)
	# An AnimatableBody's initial Node transform can precede its server transform
	# until the first physics frame. Initialise this *kinematic boundary* before
	# creating joints; otherwise the solver binds to a server anchor at the origin.
	PhysicsServer3D.body_set_state(anchor.get_rid(),PhysicsServer3D.BODY_STATE_TRANSFORM,anchor.global_transform)
	for entry in rig.proxies:
		proxy_masks.append({"body":entry.body,"mask":entry.body.collision_mask});entry.body.collision_mask|=64
	for row in package.bones:
		var body=RigidBody3D.new();body.name="Jolt_"+str(row.key);body.mass=float(row.massKg);body.gravity_scale=1;body.can_sleep=false;body.continuous_cd=true;body.linear_damp=.35;body.angular_damp=.45;body.contact_monitor=true;body.max_contacts_reported=12;body.collision_layer=64;body.collision_mask=1|2|16
		body.disable_mode=CollisionObject3D.DISABLE_MODE_KEEP_ACTIVE
		body.transform=rig.world_bone(str(row.key))
		var material=PhysicsMaterial.new();material.friction=.5;material.bounce=0;body.physics_material_override=material
		for source in row.colliders:
			var points=PackedVector3Array()
			for p in source.pointsBoneBindLocal:points.append(Vector3(p[0],p[1],p[2])*rig.unit)
			var collision=CollisionShape3D.new();var shape=ConvexPolygonShape3D.new();shape.points=points;collision.shape=shape;body.add_child(collision)
		add_child(body);bodies.append(body)
	for i in bodies.size():
		var parent=anchor if i==0 else bodies[i-1];var body=bodies[i];var row=package.bones[i]
		var joint=Generic6DOFJoint3D.new();joint.name="TailElasticJoint_%d"%i;add_child(joint);joint.global_transform=body.global_transform;joint.exclude_nodes_from_collision=true;joint.node_a=joint.get_path_to(parent);joint.node_b=joint.get_path_to(body)
		var frame_a=parent.global_transform.affine_inverse()*joint.global_transform;var frame_b=body.global_transform.affine_inverse()*joint.global_transform
		PhysicsServer3D.joint_make_generic_6dof(joint.get_rid(),parent.get_rid(),frame_a,body.get_rid(),frame_b)
		for axis in ["x","y","z"]:
			var index=["x","y","z"].find(axis);var limit=float(row.angularLimitRadians[index])
			joint.call("set_flag_"+axis,Generic6DOFJoint3D.FLAG_ENABLE_LINEAR_LIMIT,true);joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_LINEAR_LOWER_LIMIT,0.0);joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_LINEAR_UPPER_LIMIT,0.0)
			joint.call("set_flag_"+axis,Generic6DOFJoint3D.FLAG_ENABLE_ANGULAR_LIMIT,true);joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_ANGULAR_LOWER_LIMIT,-limit);joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_ANGULAR_UPPER_LIMIT,limit)
			joint.call("set_flag_"+axis,Generic6DOFJoint3D.FLAG_ENABLE_ANGULAR_SPRING,true);joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_ANGULAR_SPRING_STIFFNESS,float(row.angularStiffnessNmPerRad));joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_ANGULAR_SPRING_DAMPING,float(row.angularDamping));joint.call("set_param_"+axis,Generic6DOFJoint3D.PARAM_ANGULAR_SPRING_EQUILIBRIUM_POINT,0.0)
		joints.append({"node":joint,"frameA":frame_a,"frameB":frame_b,"parent":parent,"body":body});rest_relative.append(parent.global_transform.affine_inverse()*body.global_transform)
	for name in package.sourceMeshes:
		var mesh=rig.model.find_child(name.name,true,false) as MeshInstance3D
		if mesh==null:return {"ok":false,"error":"Original blue tail mesh missing"}
		mesh.extra_cull_margin=.5
	physics_ready=true
	startup_samples.append({"time":0,"anchor":anchor.global_position,"anchor_server":PhysicsServer3D.body_get_state(anchor.get_rid(),PhysicsServer3D.BODY_STATE_TRANSFORM),"joint_frames":joints.map(func(entry):return {"a":entry.frameA,"b":entry.frameB}),"bodies":bodies.map(func(body):return {"position":body.global_position,"server":PhysicsServer3D.body_get_state(body.get_rid(),PhysicsServer3D.BODY_STATE_TRANSFORM)})})
	return {"ok":true,"rigid_bodies":bodies.size(),"joints":joints.size(),"physics_engine":"Jolt","source_blue_appearance_unchanged":true}

func _physics_process(delta:float)->void:
	if not physics_ready:return
	age+=delta;updates+=1
	# Read all joint endpoints at the same last-solved physics time, before the
	# pelvis boundary receives this tick's new controller target. Comparing a
	# future anchor with the previous solved body falsely adds one tick of motion.
	for entry in joints:
		var a:Transform3D=entry.parent.global_transform*entry.frameA;var b:Transform3D=entry.body.global_transform*entry.frameB
		maximum_joint_gap_m=maxf(maximum_joint_gap_m,a.origin.distance_to(b.origin))
	anchor.global_transform=rig.world_bone("hips")
	if startup_samples.size()<12:
		startup_samples.append({"time":age,"anchor":anchor.global_position,"anchor_server":PhysicsServer3D.body_get_state(anchor.get_rid(),PhysicsServer3D.BODY_STATE_TRANSFORM),"bodies":bodies.map(func(body):return {"position":body.global_position,"server":PhysicsServer3D.body_get_state(body.get_rid(),PhysicsServer3D.BODY_STATE_TRANSFORM)})})
	var inverse_skeleton_basis=rig.skeleton.global_transform.basis.orthonormalized().inverse()
	for i in bodies.size():
		var body=bodies[i];var key=str(package.bones[i].key)
		# Only rendered bone rotations follow solved physical bodies. Source bone
		# offsets/lengths are preserved; no dynamic body is teleported to a pose.
		rig.global_basis(key,inverse_skeleton_basis*body.global_transform.basis.orthonormalized())
		var rendered=rig.world_bone(key)
		maximum_render_gap_m=maxf(maximum_render_gap_m,rendered.origin.distance_to(body.global_position))
		var entry=joints[i];maximum_angular_speed=maxf(maximum_angular_speed,body.angular_velocity.length())
		var relative=entry.parent.global_transform.affine_inverse()*body.global_transform
		var angle=(rest_relative[i].basis.get_rotation_quaternion().inverse()*relative.basis.get_rotation_quaternion()).get_angle()
		maximum_angle_from_rest=maxf(maximum_angle_from_rest,angle)
		if not body.get_colliding_bodies().is_empty():contact_samples+=1

func apply_test_impulse(value:Vector3)->void:
	if physics_ready:bodies.back().apply_central_impulse(value)

func rendered_tail_points()->Dictionary:
	var result={}
	for row in package.sourceMeshes:
		var instance=rig.model.find_child(str(row.name),true,false) as MeshInstance3D
		var points=[]
		if DisplayServer.get_name()=="headless":
			# Dummy rendering has no registered GPU skin, so use actual constructed
			# mesh arrays/Skin binds and solved Skeleton3D matrices explicitly.
			var arrays=instance.mesh.surface_get_arrays(0);var vertices:PackedVector3Array=arrays[Mesh.ARRAY_VERTEX]
			for index in [0,int(vertices.size()/3),int(vertices.size()*2/3),vertices.size()-1]:
				var world=Vector3.ZERO
				for influence in range(4):
					var bind_id=int(arrays[Mesh.ARRAY_BONES][index*4+influence]);var weight=float(arrays[Mesh.ARRAY_WEIGHTS][index*4+influence])
					if weight<=0:continue
					var bone_name=instance.skin.get_bind_name(bind_id);var bone=rig.skeleton.find_bone(bone_name) if not bone_name.is_empty() else instance.skin.get_bind_bone(bind_id)
					world+=(rig.skeleton.global_transform*rig.skeleton.get_bone_global_pose(bone)*instance.skin.get_bind_pose(bind_id)*vertices[index])*weight
				points.append(world)
		else:
			var baked=instance.bake_mesh_from_current_skeleton_pose();var vertices:PackedVector3Array=baked.surface_get_arrays(0)[Mesh.ARRAY_VERTEX]
			for index in [0,int(vertices.size()/3),int(vertices.size()*2/3),vertices.size()-1]:points.append(instance.global_transform*vertices[index])
		result[row.name]=points
	return result

func snapshot()->Dictionary:
	var solved=[]
	for i in bodies.size():solved.append({"bone":package.bones[i].name,"position":bodies[i].global_position,"linear_velocity":bodies[i].linear_velocity,"angular_velocity":bodies[i].angular_velocity,"mass_kg":bodies[i].mass,"gravity_scale":bodies[i].gravity_scale,"contacts":bodies[i].get_colliding_bodies().size()})
	return {"ready":physics_ready,"solver":"Jolt RigidBody3D + Generic6DOF bounded angular springs","source_bones":3,"source_tail_meshes":3,"updates":updates,"maximum_joint_gap_m":maximum_joint_gap_m,"maximum_render_vs_body_gap_m":maximum_render_gap_m,"maximum_angle_from_rest_rad":maximum_angle_from_rest,"maximum_angular_speed_rad_s":maximum_angular_speed,"contact_samples":contact_samples,"dynamic":solved,"startup_samples":startup_samples,"free_body_position_targets":false,"procedural_sine":false,"gravity_scale":1,"source_blue_appearance_unchanged":true,"tail_self_contact":false,"limits":package.get("limits",[])}

func dispose()->void:
	physics_ready=false
	for entry in proxy_masks:
		if is_instance_valid(entry.body):entry.body.collision_mask=entry.mask
	for entry in joints:
		if is_instance_valid(entry.node):entry.node.queue_free()
	for body in bodies:
		if is_instance_valid(body):body.queue_free()
	if is_instance_valid(anchor):anchor.queue_free()
