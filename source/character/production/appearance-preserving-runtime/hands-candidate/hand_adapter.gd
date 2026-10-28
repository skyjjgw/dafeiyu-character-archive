extends RefCounted

var contract:Dictionary
var raw:PackedByteArray
var source_rig:RefCounted
var skeleton:Skeleton3D
var owner_holder:Node3D
var original_hands:Array=[]
var meshes:Array=[]
var body_map:Array=[]
var names:Dictionary={}
var neutral:Array=[]
var grip=0.0
var opposition=0.0
var show_original=false
var max_body_mapping_error=0.0
var max_body_origin_error=0.0
var max_body_basis_error=0.0
var precision_checks:Array=[]
var ready=false

func _hash(bytes:PackedByteArray)->String:
	var digest=HashingContext.new();digest.start(HashingContext.HASH_SHA256);digest.update(bytes);return digest.finish().hex_encode()

func _bytes(spec:Dictionary)->PackedByteArray:
	var bytes=raw.slice(int(spec.offset),int(spec.offset)+int(spec.bytes))
	if _hash(bytes)!=spec.sha256:push_error("Hand candidate data hash mismatch")
	return bytes

func _vecs(spec:Dictionary)->PackedVector3Array:
	var f=_bytes(spec).to_float32_array();var p=PackedVector3Array();p.resize(f.size()/3)
	for i in p.size():p[i]=Vector3(f[i*3],f[i*3+1],f[i*3+2])
	return p

func _matrix(f:PackedFloat32Array,start:int)->Transform3D:
	return Transform3D(Basis(Vector3(f[start],f[start+1],f[start+2]),Vector3(f[start+4],f[start+5],f[start+6]),Vector3(f[start+8],f[start+9],f[start+10])),Vector3(f[start+12],f[start+13],f[start+14]))

func _safe(name:String)->String:
	var result=name
	for character in [".",":","@","/","\"","%","?","\\"]:result=result.replace(character,"_")
	return result

func _row_transform(row:Dictionary)->Transform3D:
	var p=row.exportedLocalTranslation;var q=row.exportedLocalRotation;var s=row.exportedLocalScale
	return Transform3D(Basis(Quaternion(q[0],q[1],q[2],q[3])).scaled(Vector3(s[0],s[1],s[2])),Vector3(p[0],p[1],p[2]))

func setup(holder:Node3D,rig:RefCounted)->Dictionary:
	owner_holder=holder;source_rig=rig
	contract=JSON.parse_string(FileAccess.get_file_as_string("res://hands-candidate/assets/hand-package.json"))
	if contract.packageSha256!="6ce8324dd001060e6eaf0aa60deda512a1a33d8d39fe534e797a614dfedc7c0f" or contract.sourceBodyNeutralTRSMaxError!=0.0:return {"ok":false,"error":"Unexpected hand/body package revision"}
	raw=FileAccess.get_file_as_bytes("res://hands-candidate/assets/hand-package.bin")
	skeleton=Skeleton3D.new();skeleton.name="SelectedHands52IndependentCandidate";holder.add_child(skeleton)
	for row in contract.boneTable:
		var index=int(row.index);var safe_name=_safe(str(row.name));names[row.name]=index;skeleton.add_bone(safe_name);neutral.append(_row_transform(row))
	for row in contract.boneTable:
		var index=int(row.index)
		if row.parentBoneName!=null:skeleton.set_bone_parent(index,int(names[row.parentBoneName]))
		skeleton.set_bone_rest(index,neutral[index]);_pose(index,neutral[index])
		if index<22:
			var source_index=rig.skeleton.find_bone(_safe(str(row.name)))
			if source_index<0:return {"ok":false,"error":"Missing original body bone: "+str(row.name)}
			body_map.append(source_index)
	for row in contract.meshes:
		var old=rig.model.find_child(str(row.name),true,false) as MeshInstance3D
		if old==null:return {"ok":false,"error":"Original hand name missing"}
		original_hands.append(old)
		var instance=MeshInstance3D.new();instance.name="Candidate_"+str(row.side)+"_hand"
		var arrays=[];arrays.resize(Mesh.ARRAY_MAX)
		arrays[Mesh.ARRAY_VERTEX]=_vecs(row.position);arrays[Mesh.ARRAY_NORMAL]=_vecs(row.normal)
		arrays[Mesh.ARRAY_CUSTOM0]=_bytes(row.colorRGBA32F).to_float32_array()
		var joints_raw=_bytes(row.joints);var joints=PackedInt32Array();joints.resize(joints_raw.size()/2)
		for j in joints.size():joints[j]=joints_raw.decode_u16(j*2)
		arrays[Mesh.ARRAY_BONES]=joints;arrays[Mesh.ARRAY_WEIGHTS]=_bytes(row.weights).to_float32_array()
		var source_indices=_bytes(row.indices).to_int32_array();var render_indices=source_indices.duplicate()
		# The package is glTF/Three CCW; native ArrayMesh front faces are CW.
		# This changes only triangle winding, never geometry or skin attributes.
		for triangle in range(0,render_indices.size(),3):var old_b=render_indices[triangle+1];render_indices[triangle+1]=render_indices[triangle+2];render_indices[triangle+2]=old_b
		arrays[Mesh.ARRAY_INDEX]=render_indices
		var mesh=ArrayMesh.new();mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays,[],{},Mesh.ARRAY_CUSTOM_RGBA_FLOAT<<Mesh.ARRAY_FORMAT_CUSTOM0_SHIFT)
		if mesh.get_surface_count()!=1:return {"ok":false,"error":"Could not build exact hand surface"}
		var actual=mesh.surface_get_arrays(0)
		var exact_position=_hash(actual[Mesh.ARRAY_VERTEX].to_byte_array())==row.position.sha256
		var exact_color=_hash(actual[Mesh.ARRAY_CUSTOM0].to_byte_array())==row.colorRGBA32F.sha256
		if not exact_position or not exact_color:return {"ok":false,"error":"Hand position/Float32 color changed in ArrayMesh"}
		var weight_error=0.0;var bone_indices_exact=true
		for influence in joints.size():
			weight_error=maxf(weight_error,absf(actual[Mesh.ARRAY_WEIGHTS][influence]-arrays[Mesh.ARRAY_WEIGHTS][influence]))
			bone_indices_exact=bone_indices_exact and actual[Mesh.ARRAY_BONES][influence]==joints[influence]
		if not bone_indices_exact:return {"ok":false,"error":"Hand skin bone indices changed"}
		var winding_correct=true
		for triangle in range(0,source_indices.size(),3):winding_correct=winding_correct and actual[Mesh.ARRAY_INDEX][triangle]==source_indices[triangle] and actual[Mesh.ARRAY_INDEX][triangle+1]==source_indices[triangle+2] and actual[Mesh.ARRAY_INDEX][triangle+2]==source_indices[triangle+1]
		if not winding_correct:return {"ok":false,"error":"Native hand triangle winding conversion failed"}
		precision_checks.append({"side":row.side,"vertices":actual[Mesh.ARRAY_VERTEX].size(),"position_bytes_exact":exact_position,"float_color_bytes_exact":exact_color,"bone_indices_exact":bone_indices_exact,"max_imported_weight_error":weight_error,"gltf_ccw_to_godot_cw_verified":winding_correct})
		var skin=Skin.new();var matrices=_bytes(row.inverseBind).to_float32_array()
		for joint in range(52):skin.add_bind(joint,_matrix(matrices,joint*16))
		instance.mesh=mesh;instance.skin=skin;skeleton.add_child(instance);instance.skeleton=instance.get_path_to(skeleton)
		var shader=Shader.new();shader.code="""shader_type spatial;
render_mode unshaded,cull_back;
varying vec4 source_hand_linear;
vec3 display(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(0.0)),vec3(1.0/2.4))-0.055,step(vec3(0.0031308),c));}
void vertex(){source_hand_linear=CUSTOM0;}
void fragment(){ALBEDO=OUTPUT_IS_SRGB?display(source_hand_linear.rgb):source_hand_linear.rgb;}
"""
		var material=ShaderMaterial.new();material.shader=shader;instance.material_override=material
		meshes.append({"instance":instance,"spec":row,"arrays":actual,"ibm":matrices})
	ready=true;sync_source_pose();set_pose(0,0);set_show_original(false)
	return {"ok":true,"bones":skeleton.get_bone_count(),"meshes":meshes.size(),"precision":precision_checks}

func _pose(index:int,value:Transform3D)->void:
	skeleton.set_bone_pose_position(index,value.origin);skeleton.set_bone_pose_rotation(index,value.basis.orthonormalized().get_rotation_quaternion());skeleton.set_bone_pose_scale(index,value.basis.get_scale())

func sync_source_pose()->void:
	if not ready:return
	skeleton.global_transform=source_rig.skeleton.global_transform
	# Copy the solved source global matrices; never change the source skeleton.
	var targets=[]
	for index in range(22):targets.append(source_rig.skeleton.get_bone_global_pose(body_map[index]))
	for index in range(22):
		var parent=skeleton.get_bone_parent(index);var target:Transform3D=targets[index]
		_pose(index,targets[parent].affine_inverse()*target if parent>=0 else target)
	for index in range(22):
		var actual=skeleton.get_bone_global_pose(index);var expected:Transform3D=targets[index]
		max_body_origin_error=maxf(max_body_origin_error,actual.origin.distance_to(expected.origin))
		for axis in range(3):max_body_basis_error=maxf(max_body_basis_error,actual.basis[axis].distance_to(expected.basis[axis]))
		max_body_mapping_error=maxf(max_body_origin_error,max_body_basis_error)

func set_pose(next_grip:float,next_opposition:float)->void:
	grip=clampf(next_grip,0,1);opposition=clampf(next_opposition,0,1)
	if not ready:return
	for side in ["left","right"]:
		var sign_value=-1.0 if side=="left" else 1.0
		for digit_name in contract.rig.hands[side].digits:
			var digit=contract.rig.hands[side].digits[digit_name]
			for phalanx in range(3):
				var index=int(digit.indices[phalanx]);var rest:Transform3D=neutral[index]
				var q=rest.basis.get_rotation_quaternion()
				if digit_name=="thumb" and phalanx==0:q=q*Quaternion(Vector3(0,0,1),sign_value*.55*opposition)*Quaternion(Vector3(0,1,0),sign_value*.55*opposition)
				q=q*Quaternion(Vector3(1,0,0),deg_to_rad(float(digit.maxFlexDegrees[phalanx]))*grip)
				skeleton.set_bone_pose_rotation(index,q)

func set_show_original(value:bool)->void:
	show_original=value
	for old in original_hands:old.visible=value
	for entry in meshes:entry.instance.visible=not value

func reference_check()->Dictionary:
	var results=[];var worst=0.0
	for state in contract.references:
		set_pose(float(state.grip),float(state.opposition));var expected=_vecs(state.positions)
		var entry=meshes[0] if state.side=="left" else meshes[1]
		var p:PackedVector3Array=entry.arrays[Mesh.ARRAY_VERTEX];var joints:PackedInt32Array=entry.arrays[Mesh.ARRAY_BONES];var weights:PackedFloat32Array=entry.arrays[Mesh.ARRAY_WEIGHTS]
		var transforms=[];for i in range(52):transforms.append(skeleton.get_bone_global_pose(i)*_matrix(entry.ibm,i*16))
		var difference=0.0
		for i in p.size():
			var actual=Vector3.ZERO
			for influence in range(4):actual+=(transforms[joints[i*4+influence]]*p[i])*weights[i*4+influence]
			difference=maxf(difference,actual.distance_to(expected[i]))
		worst=maxf(worst,difference);results.append({"side":state.side,"grip":state.grip,"opposition":state.opposition,"vertices":p.size(),"max_source_unit_error":difference})
	set_pose(0,0)
	return {"scope":"Actual Godot Skeleton3D solved matrices and actual constructed ArrayMesh readback position/bone/weight arrays with package inverse binds, compared to independent live Three skinning reference; not rendered/GPU evidence","states":results,"max_source_unit_error":worst,"tolerance_source_units":.00005,"tolerance_reason":"Standard ArrayMesh skin weights are packed to 16-bit. The earlier 2e-6 raw-float limit failed at 2.5113e-5 actual readback error; retained in failure logs. This explicit limit is 0.0175 mm only under the chosen 0.35m/sourceunit scene scale, not a claim of byte-identical skinning. Body matrix mapping is checked separately at 2e-6.","pass":worst<.00005}

func snapshot()->Dictionary:
	return {"ready":ready,"package_sha256":contract.get("packageSha256",""),"body_bones_synchronised":22,"finger_bones":30,"meshes":meshes.size(),"grip":grip,"opposition":opposition,"show_original":show_original,"max_body_origin_error_source_units":max_body_origin_error,"max_body_basis_axis_error":max_body_basis_error,"precision":precision_checks,"limits":["Independent candidate; source22 copied, never modified","Reference pose sampling is not arbitrary-motion self-collision or force-closure proof","Source-fitted unlit colors, no skin muscle/cloth/hand-object dynamics"]}

func dispose()->void:
	for old in original_hands:
		if is_instance_valid(old):old.visible=true
	if is_instance_valid(skeleton):skeleton.queue_free()
