extends RefCounted
var data: Dictionary={}
var poses: Dictionary={}

func matrix(value: Transform3D) -> Array:
	return [value.basis.x.x,value.basis.x.y,value.basis.x.z,0,value.basis.y.x,value.basis.y.y,value.basis.y.z,0,value.basis.z.x,value.basis.z.y,value.basis.z.z,0,value.origin.x,value.origin.y,value.origin.z,1]
func vector(value: Vector3) -> Array: return [value.x,value.y,value.z]

func record(actor: Node3D) -> void:
	var rig: Node=actor.rig
	var skeleton: Skeleton3D=rig.body
	var to_model:=actor.global_transform.affine_inverse()*skeleton.global_transform
	data={"coordinateFrame":"Godot +Yup/+Zforward model-local; matrices column-major 4x4","action_age":actor.action_age,"wave_forward":actor.wave_forward,"bones":{}}
	poses.clear()
	for i in skeleton.get_bone_count():
		var name: String=skeleton.get_bone_name(i)
		var parent: int=skeleton.get_bone_parent(i)
		var posed: Transform3D=skeleton.get_bone_global_pose(i)
		var rest: Transform3D=skeleton.get_bone_global_rest(i)
		poses[i]=posed
		var posed_relative: Transform3D=skeleton.get_bone_global_pose(parent).affine_inverse()*posed if parent>=0 else posed
		var rest_relative: Transform3D=skeleton.get_bone_global_rest(parent).affine_inverse()*rest if parent>=0 else rest
		var delta: Quaternion=rest_relative.basis.get_rotation_quaternion().inverse()*posed_relative.basis.get_rotation_quaternion()
		data.bones[name]={"id":i,"parent":skeleton.get_bone_name(parent) if parent>=0 else "","rest_global_skeleton":matrix(rest),"posed_global_skeleton":matrix(posed),"rest_global_model":matrix(to_model*rest),"posed_global_model":matrix(to_model*posed),"global_basis_determinant":posed.basis.determinant(),"relative_from_rest_angle_rad":delta.get_angle(),"relative_posed_basis_determinant":posed_relative.basis.determinant(),"relative_pose":matrix(posed_relative)}

func export_body(actor: Node3D) -> void:
	var skeleton: Skeleton3D=actor.rig.body
	data["meshes"]=[]
	var pending: Array[Node]=[actor.visual]
	while not pending.is_empty():
		var node: Node=pending.pop_back()
		pending.append_array(node.get_children())
		if not node is MeshInstance3D or not str(node.name).begins_with("BODY") or node.skin==null: continue
		var baked: ArrayMesh=node.bake_mesh_from_current_skeleton_pose()
		var palette: Array=[]
		var palette_basis: Array[Basis]=[]
		for bind in node.skin.get_bind_count():
			var id: int=node.skin.get_bind_bone(bind)
			if id<0: id=skeleton.find_bone(node.skin.get_bind_name(bind))
			var pose: Transform3D=poses.get(id,Transform3D.IDENTITY)
			var bind_pose: Transform3D=node.skin.get_bind_pose(bind)
			palette_basis.append((pose*bind_pose).basis)
			palette.append({"bind_index":bind,"skeleton_bone_id":id,"bone_name":skeleton.get_bone_name(id) if id>=0 else "missing","bind_pose":matrix(bind_pose),"posed_times_bind":matrix(pose*bind_pose)})
		var mesh_data: Dictionary={"name":str(node.name),"model_transform":matrix(actor.global_transform.affine_inverse()*node.global_transform),"skin_palette":palette,"surfaces":[]}
		for surface in node.mesh.get_surface_count():
			var rest: Array=node.mesh.surface_get_arrays(surface)
			var posed: Array=baked.surface_get_arrays(surface)
			var rp: PackedVector3Array=rest[Mesh.ARRAY_VERTEX]
			var pp: PackedVector3Array=posed[Mesh.ARRAY_VERTEX]
			var rn: PackedVector3Array=rest[Mesh.ARRAY_NORMAL]
			var pn: PackedVector3Array=posed[Mesh.ARRAY_NORMAL]
			var indices: PackedInt32Array=rest[Mesh.ARRAY_INDEX]
			var joints: PackedInt32Array=rest[Mesh.ARRAY_BONES]
			var weights: PackedFloat32Array=rest[Mesh.ARRAY_WEIGHTS]
			var components: int=weights.size()/rp.size()
			var determinants: Array=[]
			for vertex in rp.size():
				var x:=Vector3.ZERO
				var y:=Vector3.ZERO
				var z:=Vector3.ZERO
				for k in components:
					var weight:=weights[vertex*components+k]
					var basis: Basis=palette_basis[joints[vertex*components+k]]
					x+=basis.x*weight
					y+=basis.y*weight
					z+=basis.z*weight
				determinants.append(Basis(x,y,z).determinant())
			var palm: Array=[]
			for i in range(0,indices.size(),3):
				var a:=indices[i]
				var b:=indices[i+1]
				var c:=indices[i+2]
				var center: Vector3=(rp[a]+rp[b]+rp[c])/3
				if center.x<.58 or center.x>.80 or center.y<.78 or center.y>1.16: continue
				var rest_area: Vector3=(rp[b]-rp[a]).cross(rp[c]-rp[a])*.5
				var posed_area: Vector3=(pp[b]-pp[a]).cross(pp[c]-pp[a])*.5
				palm.append({"triangle":i/3,"ids":[a,b,c],"rest_area_vector":vector(rest_area),"posed_area_vector":vector(posed_area),"rest_signed_against_normals":rest_area.dot((rn[a]+rn[b]+rn[c]).normalized()),"posed_signed_against_normals":posed_area.dot((pn[a]+pn[b]+pn[c]).normalized()),"area_ratio":posed_area.length()/maxf(.000000001,rest_area.length()),"weighted_determinants":[determinants[a],determinants[b],determinants[c]]})
			var rest_positions: Array=[]
			var posed_positions: Array=[]
			var posed_normals: Array=[]
			for point in rp: rest_positions.append(vector(point))
			for point in pp: posed_positions.append(vector(point))
			for normal in pn: posed_normals.append(vector(normal))
			mesh_data.surfaces.append({"surface":surface,"vertex_count":rp.size(),"rest_positions_mesh":rest_positions,"gpu_baked_positions_mesh":posed_positions,"gpu_baked_normals_mesh":posed_normals,"indices":Array(indices),"joint_indices":Array(joints),"weights":Array(weights),"weighted_basis_determinants":determinants,"right_hand_area_diagnostics":palm})
		data.meshes.append(mesh_data)
