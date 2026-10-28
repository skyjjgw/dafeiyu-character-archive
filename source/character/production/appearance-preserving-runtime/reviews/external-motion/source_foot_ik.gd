extends RefCounted

var source:RefCounted
var actor:CharacterBody3D
var rig:RefCounted
var feet={}
var phase_time=0.0
var blend=0.0
var desired_blend=0.0
var root_speed=0.0
var lower_m=0.0
var stopping=false
var released=false
var stop_age=0.0
var diagnostics={}
var events=[]
var maximum_anchor_error=0.0
var maximum_support_speed=0.0
var maximum_foot_step=0.0
var maximum_cancel_foot_step=0.0
var maximum_cancel_angle_step=0.0
var maximum_length_error=0.0
var minimum_analytic_shoe_y=INF
var maximum_knee_flex=0.0
var clamped_count=0
var ticks=0
var source_rests={}
var previous_q={}
var maximum_source_foot_angle=0.0

func setup(owner_actor:CharacterBody3D,gait_source:RefCounted)->Dictionary:
	actor=owner_actor;rig=actor.rig;source=gait_source
	for side in ["left","right"]:
		var src="r" if side=="left" else "l"
		var length_m=(rig.rest[side+"LowerLeg"].origin.length()+rig.rest[side+"Foot"].origin.length())*rig.unit
		var scale=length_m/source.rest_lengths[src]
		var points=shoe_points(side)
		if points.is_empty():return {"ok":false,"error":"target_shoe_points_empty"}
		var foot:Transform3D=rig.world_bone(side+"Foot")
		var sole:Vector3=rig.feet[side].sole*rig.unit
		feet[side]={"source":src,"scale":scale,"length_m":length_m,"pose":foot,"contact":true,"pivot":"sole","anchor":foot*sole,"points":points,"swing_offset":Vector3.ZERO,"swing_age":0.0,"pole":Vector3.BACK,"previous":foot,"previous_contact":true}
		var source_skeleton:Skeleton3D=source.skeleton
		var foot_rest=source_skeleton.get_bone_global_rest(source_skeleton.find_bone("foot_"+src))
		source_rests[side]=foot_rest*source.sole_points[src].sole
		root_speed+=source.stride.length()/source.duration*scale*.5
	return {"ok":true,"source_side_by_target":{"left":"r","right":"l"},"source_stride_m":source.stride.length(),"source_average_speed_mps":source.stride.length()/source.duration,"target_root_speed_mps":root_speed,"feet":feet.keys(),"scale_left":feet.left.scale,"scale_right":feet.right.scale,"target_foot_geometry_points":{"left":feet.left.points.size(),"right":feet.right.points.size()},"not_original_leg_planner":true}

func shoe_points(side:String)->Array:
	var mesh=rig.model.find_child(side+" traced mary jane shoe",true,false) as MeshInstance3D
	var result=[]
	var foot_inv=rig.world_bone(side+"Foot").affine_inverse()
	var skin:Skin=mesh.skin
	for surface in mesh.mesh.get_surface_count():
		var arrays=mesh.mesh.surface_get_arrays(surface);var vertices:PackedVector3Array=arrays[Mesh.ARRAY_VERTEX];var joints=arrays[Mesh.ARRAY_BONES];var weights=arrays[Mesh.ARRAY_WEIGHTS]
		var influences=weights.size()/vertices.size()
		for i in vertices.size():
			var point=Vector3.ZERO
			for j in influences:
				var weight=float(weights[i*influences+j])
				if weight<=0:continue
				var bind=int(joints[i*influences+j]);var bone=skin.get_bind_bone(bind)
				if bone<0:bone=rig.skeleton.find_bone(str(skin.get_bind_name(bind)))
				point+=rig.skeleton.global_transform*rig.skeleton.get_bone_global_pose(bone)*skin.get_bind_pose(bind)*vertices[i]*weight
			result.append(foot_inv*point)
	return result

func request_walk(value:float)->void:
	desired_blend=clampf(value,0,1)
	if value>0:stopping=false;released=false
func request_stop()->void:
	if stopping or released:return
	stopping=true;stop_age=0.0;desired_blend=0.0
	events.append({"event":"stop_requested","phase":fposmod(phase_time,source.duration),"time":phase_time})

func _basis(data:Dictionary,weight:float)->Basis:
	var forward:Vector3=(data.toe-data.heel).normalized()
	var yaw=atan2(forward.x,forward.z)
	var pitch=clampf(-atan2(forward.y,Vector2(forward.x,forward.z).length()),-.55,.65)
	maximum_source_foot_angle=maxf(maximum_source_foot_angle,absf(pitch))
	# +Z is both source measured forward and target measured heel->toe.
	return actor.global_basis.orthonormalized()*Basis.from_euler(Vector3(pitch*weight,yaw*weight,0),EULER_ORDER_YXZ)

func _lowest(basis:Basis,points:Array)->float:
	var low=INF
	for p in points:low=minf(low,(basis*p).y)
	return low

func _raw_pose(side:String,row:Dictionary,weight:float)->Transform3D:
	var state:Dictionary=feet[side];var data:Dictionary=row[state.source]
	var local:Vector3=actor.neutral_soles[side]
	var source_relative:Vector3=data.sole-row.root-source_rests[side]
	local+=Vector3(source_relative.x,0,source_relative.z)*state.scale*weight
	var sole_world=actor.global_transform*local
	var basis=_basis(data,weight)
	var origin=sole_world-basis*(rig.feet[side].sole*rig.unit)
	var ground=actor.ground_height(origin)
	origin.y=ground-_lowest(basis,state.points)+maxf(0,data.mesh_lowest)*state.scale*weight
	return Transform3D(basis,origin)

func _swing_fraction(src:String,phase:float)->float:
	var count=source.contacts[src].size();var current=int(phase/source.duration*count)%count
	var before=0;var after=0
	while before<count and not source.contacts[src][(current-before+count)%count]:before+=1
	while after<count and not source.contacts[src][(current+after)%count]:after+=1
	return float(before)/maxf(1,before+after)

func update(delta:float)->void:
	if released:return
	ticks+=1
	blend=move_toward(blend,desired_blend,delta*2.0)
	# Keep phase progression until all swing feet land during cancellation;
	# root speed independently follows the original acceleration/collision API.
	phase_time+=delta if blend>.001 or stopping else 0.0
	if stopping:stop_age+=delta
	var row:Dictionary=source.sample(phase_time)
	actor.scripted=true;actor.queue.clear();actor.requested_move=Vector2(0,-root_speed/.16*blend)
	var inverse=rig.skeleton.global_transform.affine_inverse()
	var both_contact=true
	for side in feet:
		var state:Dictionary=feet[side];var data:Dictionary=row[state.source]
		var contact:bool=data.contact if not stopping or stop_age<.45 else true
		var raw=_raw_pose(side,row,maxf(blend,.05) if stopping else blend)
		# A stationary idle retains its existing anchors and horizontal feet.
		if blend<.001 and not stopping:contact=true
		if contact and not state.contact:
			state.anchor=state.pose*(rig.feet[side].sole*rig.unit);state.pivot="sole"
			state.anchor.y=actor.ground_height(state.anchor)
			events.append({"event":"source_touchdown","target":side,"source":state.source,"phase":row.phase,"time":phase_time})
		if not contact and state.contact:
			state.swing_offset=state.pose.origin-raw.origin;state.swing_age=0.0
			events.append({"event":"source_liftoff","target":side,"source":state.source,"phase":row.phase,"time":phase_time})
		state.contact=contact
		var next_basis=state.pose.basis.get_rotation_quaternion().slerp(raw.basis.get_rotation_quaternion(),1-exp(-delta*28.0))
		if contact:
			var pivot="heel" if data.heel.y+ .005<data.toe.y and blend>.001 and not stopping else "toe" if data.toe.y+.005<data.heel.y and blend>.001 and not stopping else "sole"
			if pivot!=state.pivot:
				state.anchor=state.pose*(rig.feet[side][pivot]*rig.unit);state.pivot=pivot
				# Preserve pivot's current height at switch; ground correction below
				# is continuous through the zero-pitch contact crossing.
			var basis=Basis(next_basis)
			var point:Vector3=rig.feet[side][state.pivot]*rig.unit
			var origin:Vector3=state.anchor-basis*point
			var minimum=origin.y+_lowest(basis,state.points)
			var floor=actor.ground_height(origin)
			origin.y+=maxf(0,floor-minimum)
			state.pose=Transform3D(basis,origin)
		else:
			both_contact=false;state.swing_age+=delta
			var progress=_swing_fraction(state.source,row.phase)
			var origin=raw.origin+state.swing_offset*(1-rig.smooth(progress))
			var basis=Basis(next_basis)
			origin.y=maxf(origin.y,actor.ground_height(origin)-_lowest(basis,state.points))
			state.pose=Transform3D(basis,origin)
		var source_line:Vector3=data.ankle-data.hip
		var source_knee:Vector3=data.knee-data.hip
		var pole=source_knee-source_line*source_knee.dot(source_line)/maxf(.000001,source_line.length_squared())
		if pole.length()<.001:pole=Vector3.BACK
		var desired_pole=actor.global_basis*pole.normalized()
		state.pole=state.pole.lerp(desired_pole,1-exp(-delta*20)).normalized()
	# Retain source pelvis rotation, but fit this target's own two-bone reach.
	# Hips translation is a support adjustment, never a source bone-length copy.
	var hip_origin:Vector3=rig.rest.hips.origin
	rig.skeleton.set_bone_pose_position(rig.ids.hips,hip_origin)
	var needed=0.0
	for side in feet:
		var hip=rig.world_bone(side+"UpperLeg").origin;var ankle:Vector3=feet[side].pose.origin
		var reach=float(feet[side].length_m)*.995
		var horizontal=Vector2(hip.x-ankle.x,hip.z-ankle.z).length_squared()
		var vertical=sqrt(maxf(.000001,reach*reach-horizontal))
		needed=maxf(needed,hip.y-ankle.y-vertical)
	lower_m=move_toward(lower_m,clampf(needed,0,.085),delta*.30)
	rig.skeleton.set_bone_pose_position(rig.ids.hips,hip_origin-Vector3.UP*lower_m/rig.unit)
	diagnostics={}
	for side in feet:
		var state:Dictionary=feet[side];var local:Transform3D=inverse*state.pose
		var pole:Vector3=inverse.basis*state.pole
		var solved:Dictionary=rig.solve_chain(side+"UpperLeg",side+"LowerLeg",side+"Foot",local.origin,pole,local.basis.orthonormalized())
		if solved.clamped:clamped_count+=1
		var actual=rig.world_bone(side+"Foot")
		var low=actual.origin.y+_lowest(actual.basis,state.points);minimum_analytic_shoe_y=minf(minimum_analytic_shoe_y,low)
		var step=actual.origin.distance_to(state.previous.origin);maximum_foot_step=maxf(maximum_foot_step,step)
		if stopping:maximum_cancel_foot_step=maxf(maximum_cancel_foot_step,step)
		var error=actual.origin.distance_to(state.pose.origin)
		if state.contact:
			maximum_anchor_error=maxf(maximum_anchor_error,error)
			if state.previous_contact and state.pivot==state.get("previous_pivot",""):
				var ref:Vector3=rig.feet[side][state.pivot]*rig.unit
				var displacement=actual*ref-state.previous*ref
				maximum_support_speed=maxf(maximum_support_speed,Vector2(displacement.x,displacement.z).length()/delta)
		var h=rig.world_bone(side+"UpperLeg").origin;var k=rig.world_bone(side+"LowerLeg").origin
		var flex=PI-(h-k).angle_to(actual.origin-k);maximum_knee_flex=maxf(maximum_knee_flex,flex)
		for key in [side+"LowerLeg",side+"Foot"]:
			var index:int=rig.ids[key];var parent=rig.skeleton.get_bone_parent(index)
			var a=rig.skeleton.get_bone_global_pose(index).origin;var b=rig.skeleton.get_bone_global_pose(parent).origin
			maximum_length_error=maxf(maximum_length_error,absf(a.distance_to(b)-rig.rest[key].origin.length()))
			var q=rig.skeleton.get_bone_pose_rotation(index)
			if stopping and previous_q.has(key):maximum_cancel_angle_step=maxf(maximum_cancel_angle_step,q.angle_to(previous_q[key]))
			previous_q[key]=q
		state.previous=actual;state.previous_contact=state.contact;state.previous_pivot=state.pivot
		# Diagnostic contact state is the SOURCE phase and SOURCE-generated pose,
		# never the original planner's unrelated feet or leg solution.
		rig.feet[side].pose=state.pose;rig.feet[side].support=state.contact;rig.feet[side].pivot=state.pivot;rig.feet[side].anchor=state.pose*(rig.feet[side][state.pivot]*rig.unit)
		diagnostics[side]={"source":state.source,"contact":state.contact,"pivot":state.pivot,"source_phase":row.phase,"target_error_m":error,"shoe_lowest_analytic_y":low,"knee_flex_radians":flex,"solver":solved}
	if stopping and blend<.001 and both_contact and Vector2(actor.velocity.x,actor.velocity.z).length()<.008 and stop_age>.7:
		_return_original()

func _return_original()->void:
	# Transfer current solved foot transforms into the original controller's
	# contact state. Subsequent original re-centering steps start here.
	for side in feet:
		var foot:Transform3D=rig.world_bone(side+"Foot")
		rig.feet[side].pose=foot;rig.feet[side].support=true;rig.feet[side].pivot="sole";rig.feet[side].anchor=foot*(rig.feet[side].sole*rig.unit)
		actor.foot_states[side].flat=foot;actor.foot_states[side].age=1.0;actor.foot_states[side].pitch=0.0
	actor.active_side="";actor.anticipation=0;actor.requested_move=Vector2.ZERO;actor.scripted=false
	rig.pelvis_lowering=lower_m/rig.unit;released=true
	events.append({"event":"returned_original_controller","time":phase_time,"stop_age":stop_age})

func snapshot()->Dictionary:
	return {"source_foot_target_ik":true,"original_leg_solver_override":false,"target_root_speed_mps":root_speed,"phase_time":phase_time,"blend":blend,"lowering_m":lower_m,"stopping":stopping,"released":released,"source_inferred_contact":true,"maximum_target_ankle_error_m":maximum_anchor_error,"maximum_support_horizontal_speed_mps":maximum_support_speed,"maximum_foot_frame_step_m":maximum_foot_step,"maximum_cancel_foot_frame_step_m":maximum_cancel_foot_step,"maximum_cancel_angle_frame_step_rad":maximum_cancel_angle_step,"minimum_analytic_shoe_y":minimum_analytic_shoe_y,"maximum_bone_length_error_source_units":maximum_length_error,"maximum_knee_flex_rad":maximum_knee_flex,"clamped_count":clamped_count,"ticks":ticks,"feet":diagnostics,"events":events}
