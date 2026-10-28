extends SceneTree

const SOURCE="E:/zzz/dafeiyu-character-materials-20261025/references/test-assets/motion/"
const OUTPUT=SOURCE+"reports/godot-import.json"

func vec(v:Vector3)->Array:return [v.x,v.y,v.z]
func transform(t:Transform3D)->Dictionary:return {"origin":vec(t.origin),"basis":[vec(t.basis.x),vec(t.basis.y),vec(t.basis.z)]}
func skeleton_in(n:Node)->Skeleton3D:
	if n is Skeleton3D:return n
	for child in n.get_children():
		var found=skeleton_in(child)
		if found!=null:return found
	return null
func player_in(n:Node)->AnimationPlayer:
	if n is AnimationPlayer:return n
	for child in n.get_children():
		var found=player_in(child)
		if found!=null:return found
	return null
func _initialize()->void:call_deferred("run")
func run()->void:
	var report={"engine":Engine.get_version_info(),"importer":"actual GLTFDocument.append_from_file/generate_scene","files":[],"target":[]}
	for name in ["UAL1_Standard.glb","UAL1_Standard_RM.glb"]:
		var path=SOURCE+"quaternius-standard/"+name
		var state=GLTFState.new();var document=GLTFDocument.new()
		var error=document.append_from_file(path,state,GLTFDocument.IMPORT_FLAG_FORCE_DISABLE_MESH_COMPRESSION)
		if error!=OK:push_error(str(error));quit(1);return
		var scene=document.generate_scene(state);root.add_child(scene)
		var skeleton=skeleton_in(scene);var player=player_in(scene)
		var row={"file":name,"bytes":FileAccess.get_file_as_bytes(path).size(),"sha256":FileAccess.get_sha256(path),"bones":[],"animations":[],"skeleton_path":str(skeleton.get_path()),"player_root":str(player.root_node),"finite":true}
		for i in skeleton.get_bone_count():row.bones.append({"index":i,"name":skeleton.get_bone_name(i),"parent":skeleton.get_bone_parent(i),"local_rest":transform(skeleton.get_bone_rest(i)),"global_rest":transform(skeleton.get_bone_global_rest(i))})
		for clip in player.get_animation_list():
			var animation=player.get_animation(clip);var tracks=[];var max_q_error=0.0;var finite=true
			for t in animation.get_track_count():
				var first=null;var last=null;var minimum=Vector3(INF,INF,INF);var maximum=Vector3(-INF,-INF,-INF)
				var unique_times=[]
				for k in animation.track_get_key_count(t):
					var value=animation.track_get_key_value(t,k);unique_times.append(animation.track_get_key_time(t,k))
					if value is Quaternion:
						finite=finite and value.is_finite();max_q_error=maxf(max_q_error,absf(value.length()-1.0))
					elif value is Vector3:
						finite=finite and value.is_finite();minimum=minimum.min(value);maximum=maximum.max(value)
					if k==0:first=str(value)
					last=str(value)
				var intervals=[]
				for k in range(1,unique_times.size()):intervals.append(unique_times[k]-unique_times[k-1])
				intervals.sort()
				tracks.append({"path":str(animation.track_get_path(t)),"type":animation.track_get_type(t),"keys":animation.track_get_key_count(t),"median_key_interval":intervals[intervals.size()/2] if not intervals.is_empty() else null,"first":first,"last":last,"translation_bounds":{ "min":vec(minimum),"max":vec(maximum)} if minimum.is_finite() else null})
			row.animations.append({"name":str(clip),"seconds":animation.length,"step":animation.step,"tracks":tracks,"track_count":tracks.size(),"quaternion_norm_max_error":max_q_error,"finite":finite})
			row.finite=row.finite and finite
		report.files.append(row);scene.free()
	var state=GLTFState.new();var doc=GLTFDocument.new();doc.append_from_file("res://assets/selected-appearance.glb",state,GLTFDocument.IMPORT_FLAG_FORCE_DISABLE_MESH_COMPRESSION)
	var model=doc.generate_scene(state);root.add_child(model);var target=skeleton_in(model)
	for i in target.get_bone_count():report.target.append({"index":i,"name":target.get_bone_name(i),"parent":target.get_bone_parent(i),"local_rest":transform(target.get_bone_rest(i)),"local_pose":transform(target.get_bone_pose(i)),"global_rest":transform(target.get_bone_global_rest(i)),"global_pose":transform(target.get_bone_global_pose(i))})
	FileAccess.open(OUTPUT,FileAccess.WRITE).store_string(JSON.stringify(report,"\t"));print("EXTERNAL_MOTION_IMPORT_OK ",OUTPUT);model.free();quit(0)
