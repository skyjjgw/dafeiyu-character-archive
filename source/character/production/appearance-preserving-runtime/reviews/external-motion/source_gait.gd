extends RefCounted
const PATH="E:/zzz/dafeiyu-character-materials-20261025/references/test-assets/motion/quaternius-standard/UAL1_Standard_RM.glb"
var model:Node3D
var skeleton:Skeleton3D
var player:AnimationPlayer
var clip:Animation
var duration=0.0
var stride=Vector3.ZERO
var fps=120
var samples=[]
var sole_points={}
var rest_lengths={}
var report={}
var skin_regions={}
var contacts={}
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
func vec(v:Vector3)->Array:return [v.x,v.y,v.z]
func v(a:Array)->Vector3:return Vector3(a[0],a[1],a[2])
func pose(t:float)->void:
	skeleton.reset_bone_poses()
	for track in clip.get_track_count():
		var path=clip.track_get_path(track)
		if path.get_subname_count()<1:continue
		var i=skeleton.find_bone(str(path.get_subname(0)))
		if i<0:continue
		match clip.track_get_type(track):
			Animation.TYPE_ROTATION_3D:skeleton.set_bone_pose_rotation(i,clip.rotation_track_interpolate(track,t))
			Animation.TYPE_POSITION_3D:skeleton.set_bone_pose_position(i,clip.position_track_interpolate(track,t))
			Animation.TYPE_SCALE_3D:skeleton.set_bone_pose_scale(i,clip.scale_track_interpolate(track,t))
func bone(name:String)->Transform3D:return skeleton.get_bone_global_pose(skeleton.find_bone(name))
func setup(parent:Node)->Dictionary:
	var doc=GLTFDocument.new();var state=GLTFState.new()
	if doc.append_from_file(PATH,state,GLTFDocument.IMPORT_FLAG_FORCE_DISABLE_MESH_COMPRESSION)!=OK:return {"ok":false,"error":"source_import"}
	model=doc.generate_scene(state);parent.add_child(model);model.visible=false
	skeleton=_skeleton(model);player=_player(model);player.active=false;clip=player.get_animation("Walk_Loop");duration=clip.length
	var meshes=model.find_children("*","MeshInstance3D",true,false)
	var mesh_report=[]
	# Select actual source shoe-region vertices at rest by original skin joint
	# influence. Heel/sole landmarks are measured from this source mesh region.
	for side in ["l","r"]:
		var points=[]
		var skin_points=[]
		for mesh in meshes:
			var skin:Skin=mesh.skin
			if skin==null:continue
			for surface in mesh.mesh.get_surface_count():
				var arrays=mesh.mesh.surface_get_arrays(surface)
				var vertices:PackedVector3Array=arrays[Mesh.ARRAY_VERTEX];var joints=arrays[Mesh.ARRAY_BONES];var weights=arrays[Mesh.ARRAY_WEIGHTS]
				var influences=weights.size()/vertices.size()
				for i in vertices.size():
					var foot_weight=0.0
					var influence_points=[]
					for j in influences:
						var bind=int(joints[i*influences+j]);var id=skin.get_bind_bone(bind)
						var name=str(skin.get_bind_name(bind))
						if name.is_empty() and id>=0:name=skeleton.get_bone_name(id)
						if id<0:id=skeleton.find_bone(name)
						if weights[i*influences+j]>0:influence_points.append({"bone":id,"point":skin.get_bind_pose(bind)*vertices[i],"weight":weights[i*influences+j]})
						if name in ["foot_"+side,"ball_"+side,"ball_leaf_"+side]:foot_weight+=weights[i*influences+j]
					if foot_weight>.6:
						points.append(skeleton.global_transform.affine_inverse()*(mesh.global_transform*vertices[i]));skin_points.append(influence_points)
		if points.is_empty():return {"ok":false,"error":"source_foot_mesh_region_empty","side":side}
		var low=Vector3(INF,INF,INF);var high=Vector3(-INF,-INF,-INF)
		for p in points:low=low.min(p);high=high.max(p)
		var heel=Vector3.ZERO;var toe=Vector3.ZERO;var hc=0;var tc=0
		var heel_skin=[];var toe_skin=[]
		for index in points.size():
			var p:Vector3=points[index]
			if p.y<low.y+.025:
				if p.z<low.z+(high.z-low.z)*.25:heel+=p;hc+=1;heel_skin.append(skin_points[index])
				if p.z>high.z-(high.z-low.z)*.25:toe+=p;tc+=1;toe_skin.append(skin_points[index])
		if hc==0 or tc==0:return {"ok":false,"error":"source_sole_landmarks_empty"}
		heel/=hc;toe/=tc;heel.y=low.y;toe.y=low.y
		var inv=bone("foot_"+side).affine_inverse()
		sole_points[side]={"heel":inv*heel,"toe":inv*toe,"sole":inv*((heel+toe)*.5)}
		skin_regions[side]={"heel":heel_skin,"toe":toe_skin,"all":skin_points}
		rest_lengths[side]=bone("thigh_"+side).origin.distance_to(bone("calf_"+side).origin)+bone("calf_"+side).origin.distance_to(bone("foot_"+side).origin)
		mesh_report.append({"side":side,"selected_vertices":points.size(),"bounds_min":vec(low),"bounds_max":vec(high),"heel_bone_local":vec(sole_points[side].heel),"toe_bone_local":vec(sole_points[side].toe),"source_leg_m":rest_lengths[side]})
	var count=int(round(duration*fps))
	for i in count+1:
		var t=duration*i/count;pose(t)
		var row={"t":t,"root":vec(bone("root").origin)}
		for side in ["l","r"]:
			var foot=bone("foot_"+side)
			var heel=skin_center(skin_regions[side].heel);var toe=skin_center(skin_regions[side].toe)
			var lowest=INF
			for point in skin_regions[side].all:lowest=minf(lowest,skin_point(point).y)
			row[side]={"hip":vec(bone("thigh_"+side).origin),"knee":vec(bone("calf_"+side).origin),"ankle":vec(foot.origin),"ball":vec(bone("ball_"+side).origin),"heel":vec(heel),"toe":vec(toe),"sole":vec((heel+toe)*.5),"mesh_lowest":lowest}
		samples.append(row)
	stride=v(samples.back().root)-v(samples.front().root)
	for i in samples.size():
		for side in ["l","r"]:
			var a=maxi(0,i-1);var b=mini(samples.size()-1,i+1);var dt=float(samples[b].t)-float(samples[a].t)
			var velocity=(v(samples[b][side].sole)-v(samples[a][side].sole))/dt
			samples[i][side].net_velocity=vec(velocity)
			for point in ["heel","toe","ball"]:samples[i][side][point+"_velocity"]=vec((v(samples[b][side][point])-v(samples[a][side][point]))/dt)
	var phase_report=[]
	for side in ["l","r"]:
		var flags=[]
		for i in count:
			var foot:Dictionary=samples[i][side];var stable=false
			for point in ["heel","toe"]:
				var velocity=v(foot[point+"_velocity"])
				stable=stable or (float(foot[point][1])<.035 and Vector2(velocity.x,velocity.z).length()<.30)
			flags.append(stable)
		# Close short gaps caused by key derivatives at clip seams, not long
		# high/fast swing intervals. Every source point/velocity remains saved.
		var filled=flags.duplicate()
		for i in count:
			if flags[i]:continue
			var before=0;var after=0
			while before<10 and not flags[(i-before+count)%count]:before+=1
			while after<10 and not flags[(i+after)%count]:after+=1
			if before+after<=10:filled[i]=true
		contacts[side]=filled
		var transitions=[]
		for i in count:
			if filled[i]!=filled[(i-1+count)%count]:transitions.append({"t":duration*i/count,"contact":filled[i]})
		phase_report.append({"side":side,"transitions":transitions,"duty":float(filled.count(true))/count})
	var summary={"duration":duration,"sample_hz":fps,"root_stride":vec(stride),"root_average_speed":stride.length()/duration,"actual_source_foot_regions":mesh_report,"source_forward_measured":"foot->ball rest and RM root both +Z; prior YPI assumption rejected for new gait","inferred_contacts":true,"contact_rule":"actual skinned heel or toe region y<35mm and RM world horizontal speed<0.30m/s, circular gaps<=10/120s closed","phase_intervals":phase_report}
	report={"ok":true,"source_sha256":FileAccess.get_sha256(PATH),"summary":summary,"samples":samples}
	return report
func sample(t:float)->Dictionary:
	var phase=fposmod(t,duration);var f=phase/duration*(samples.size()-1);var a=int(f);var b=mini(a+1,samples.size()-1);var alpha=f-a
	var result={"phase":phase,"root":v(samples[a].root).lerp(v(samples[b].root),alpha)}
	for side in ["l","r"]:
		var foot={"contact":contacts[side][a]}
		for key in ["hip","knee","ankle","ball","heel","toe","sole"]:foot[key]=v(samples[a][side][key]).lerp(v(samples[b][side][key]),alpha)
		foot.mesh_lowest=lerpf(float(samples[a][side].mesh_lowest),float(samples[b][side].mesh_lowest),alpha)
		result[side]=foot
	return result
func skin_point(influences:Array)->Vector3:
	var point=Vector3.ZERO
	for item in influences:point+=skeleton.get_bone_global_pose(item.bone)*item.point*item.weight
	return point
func skin_center(points:Array)->Vector3:
	var result=Vector3.ZERO
	for point in points:result+=skin_point(point)
	return result/points.size()
func dispose()->void:
	if is_instance_valid(model):model.queue_free();model=null
