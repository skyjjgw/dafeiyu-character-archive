extends Node3D
const PROF=preload("res://scripts/profile_util.gd")
const INK=preload("res://scripts/outline_policy.gd")

var actor: CharacterBody3D
var rig: Node
var cloth: SoftBody3D
var rest:=PackedVector3Array()
var triangles:=PackedInt32Array()
var current:=PackedVector3Array()
var bindings: Array=[]
var row_heights: Array[float]=[]
var row_radius_x: Array[float]=[]
var row_radius_z: Array[float]=[]
var pins: Array[int]=[]
var initial_pins: Dictionary={}
var pin_offsets: Dictionary={}
var waist_bone:="DEF-pelvis"
var position_texture: ImageTexture
var rest_texture: ImageTexture
var bending_hinges: Array=[]
var previous_physics:=PackedVector3Array()
var metric_clock:=0.0
var petticoat: AnimatableBody3D
var material_elapsed:=0.0
var material_hz:=60.0
var cached_forces:=PackedVector3Array()
var forced_indices: Array[int]=[]
var columns:=64
var report: Dictionary={"solver":"Jolt SoftBody3D","ready":false,"rendered_high_meshes":[],"maximum_displacement":0.0,"maximum_pin_error":0.0,"update_count":0,"limitations":["Low-resolution physical cloth transferred to authored surfaces; no whole-garment self-contact acceptance yet"]}

func configure(owner: CharacterBody3D,binding: Node) -> void:
	actor=owner
	rig=binding
	var path:="res://assets/skirt-physics-cage-v2.json"
	if not FileAccess.file_exists(path) or rig.body==null:
		report["waiting"]="Native cloth cage or body rig missing"
		return
	var source: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(path))
	for p in source.vertices: rest.append(Vector3(p[0],p[1],p[2]))
	for face in source.triangles:
		for index in face: triangles.append(int(index))
	var rows:=int(rest.size()/columns)
	for row in rows:
		var average:=0.0
		var rx:=0.0
		var rz:=0.0
		for col in columns:
			var point: Vector3=rest[row*columns+col]
			average+=point.y
			rx=maxf(rx,absf(point.x))
			rz=maxf(rz,absf(point.z))
		row_heights.append(average/columns)
		row_radius_x.append(rx)
		row_radius_z.append(rz)
	var arrays: Array=[]
	arrays.resize(Mesh.ARRAY_MAX)
	var world:=PackedVector3Array()
	for p in rest: world.append(actor.to_global(p))
	arrays[Mesh.ARRAY_VERTEX]=world
	arrays[Mesh.ARRAY_INDEX]=triangles
	arrays[Mesh.ARRAY_NORMAL]=normals(world,triangles)
	var mesh:=ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays)
	cloth=SoftBody3D.new()
	cloth.name="NativeSkirtSoftBody"
	cloth.mesh=mesh
	cloth.collision_layer=8
	cloth.collision_mask=1|2|16
	cloth.total_mass=.28
	cloth.linear_stiffness=.82
	cloth.damping_coefficient=.16
	cloth.simulation_precision=8
	var material:=StandardMaterial3D.new()
	material.albedo_color=Color(.15,.20,.31)
	material.cull_mode=BaseMaterial3D.CULL_DISABLED
	cloth.material_override=material
	var waist:=BoneAttachment3D.new()
	waist.name="ClothWaistPins"
	waist.bone_name=str(source.anchorBone)
	waist_bone=str(source.anchorBone)
	rig.body.add_child(waist)
	load_petticoat()
	# Wait until BoneAttachment has its real bind transform before calculating
	# per-vertex attachment offsets; the cloth stays outside the physics space.
	await get_tree().physics_frame
	await get_tree().physics_frame
	add_child(cloth)
	for i in source.pinWeights.size():
		if float(source.pinWeights[i])>=.99:
			cloth.set_point_pinned(i,true)
			pins.append(i)
			initial_pins[i]=world[i]
			pin_offsets[i]=rig.world_pose(waist_bone).affine_inverse()*world[i]
	if pins.is_empty():
		report["error"]="Native waist pins are all zero"
		return
	report["vertices"]=rest.size()
	report["triangles"]=triangles.size()/3
	report["full_pin_count"]=pins.size()
	report["nonzero_pin_count"]=source.pinWeights.filter(func(weight):return float(weight)>0.0).size()
	report["partial_pin_policy"]="Full weight >=.99 hard pinned; partial weights remain simulated"
	report["pin_update"]="PhysicsServer3D waist boundary at 120Hz; no render-frame attachment dependency"
	position_texture=ImageTexture.create_from_image(position_image(world))
	rest_texture=ImageTexture.create_from_image(position_image(rest))
	previous_physics=world.duplicate()
	build_bending_hinges(rows)
	cached_forces.resize(rest.size())
	var active: Dictionary={}
	for hinge in bending_hinges:
		for index in hinge.ids:
			if not pin_offsets.has(index): active[index]=true
	for index in active: forced_indices.append(index)
	report["bending_material"]={"method":"Objective signed-dihedral elastic/damping forces; Jolt integrates all free points","hinges":bending_hinges.size(),"stiffness_J_per_rad2":.0006,"damping_Js_per_rad2":.000025,"moment_limit_Nm":.0015,"actor_pose_targets":false,"gradient_test":"300 finite-difference cases, max error 1.14e-10; net force/torque <1e-14"}
	report.bending_material["evaluation_hz"]=material_hz
	report.bending_material["collision_hz"]=Engine.physics_ticks_per_second
	report.bending_material["between_evaluations"]="Zero-order hold of measured physical forces, applied every collision tick; no position overwrite"
	report["render_transfer"]="GPU four-point physical-cage skinning with deformed normal frame; no CPU remeshing"
	bind_render_meshes(source.renderMeshPrefixes)
	cloth.visible=bindings.is_empty()
	report.ready=true

func normals(positions: PackedVector3Array,indices: PackedInt32Array) -> PackedVector3Array:
	var result:=PackedVector3Array()
	result.resize(positions.size())
	for i in range(0,indices.size(),3):
		var a:=indices[i]
		var b:=indices[i+1]
		var c:=indices[i+2]
		var n: Vector3=(positions[b]-positions[a]).cross(positions[c]-positions[a])
		result[a]+=n
		result[b]+=n
		result[c]+=n
	for i in result.size(): result[i]=result[i].normalized()
	return result

func load_petticoat() -> void:
	var path:="res://assets/petticoat-support-v1.json"
	if not FileAccess.file_exists(path):
		report["petticoat"]={"ready":false,"waiting":"Authored stiff underskirt support metadata"}
		return
	var source=JSON.parse_string(FileAccess.get_file_as_string(path))
	if not source is Dictionary or source.get("schema")!="dafeiyu.petticoat-support.v1" or not source.get("anchorBone","")==waist_bone:
		report["petticoat"]={"ready":false,"error":"Metadata schema or bone anchor mismatch"}
		return
	if source.get("sourceCage",{}).get("sha256","")!=FileAccess.get_sha256("res://assets/skirt-physics-cage-v2.json"):
		report["petticoat"]={"ready":false,"error":"Petticoat and live cloth cage source hashes differ"}
		return
	var inverse: Transform3D=rig.body.get_bone_global_rest(rig.bones[waist_bone].id).affine_inverse()
	petticoat=AnimatableBody3D.new()
	petticoat.name="AuthoredStiffPetticoatSupport"
	petticoat.sync_to_physics=false
	petticoat.collision_layer=16
	petticoat.collision_mask=8
	var contact_material:=PhysicsMaterial.new()
	contact_material.friction=.02
	contact_material.bounce=0
	petticoat.physics_material_override=contact_material
	add_child(petticoat)
	var count:=0
	var broad_points:=PackedVector3Array()
	for panel in source.get("panels",[]):
		var points:=PackedVector3Array()
		for value in panel.modelRestVertices: points.append(inverse*Vector3(value[0],value[1],value[2]))
		broad_points.append_array(points)
		if points.size()<4: continue
		var shape:=ConvexPolygonShape3D.new()
		shape.points=points
		shape.margin=.0015
		var collision:=CollisionShape3D.new()
		collision.shape=shape
		petticoat.add_child(collision)
		# The same rigid sewn support must participate in root/world sweeps.
		# Otherwise a capsule-only root can force the support through a table,
		# trapping the real free cloth between two rigid colliders.
		var sweep:=CollisionShape3D.new()
		sweep.name="PetticoatRootSweep_"+str(count)
		sweep.shape=shape
		actor.add_child(sweep)
		sweep.global_transform=rig.world_pose(waist_bone)
		actor.wearable_shapes.append(sweep)
		count+=1
	petticoat.global_transform=rig.world_pose(waist_bone)
	actor.wearable_broad_shape=ConvexPolygonShape3D.new()
	actor.wearable_broad_shape.points=broad_points
	actor.wearable_broad_shape.margin=.0015
	actor.can_rotate(actor.rotation.y)
	report["petticoat"]={"ready":count>0,"panels":count,"anchor":waist_bone,"source":path,"friction":.02,"support":"Authored sewn stiff underskirt contact approximation; not full multilayer soft tulle","cloth_free_points_hard_targeted":false}

func build_bending_hinges(rows: int) -> void:
	var edges: Dictionary={}
	for row in range(0,rows-2,2):
		for col in range(0,columns,2):
			var a:=row*columns+col
			var b:=row*columns+(col+2)%columns
			var c:=(row+2)*columns+col
			var d:=(row+2)*columns+(col+2)%columns
			for tri in [[a,c,b],[b,c,d]]:
				for index in 3:
					var first: int=mini(tri[index],tri[(index+1)%3])
					var second: int=maxi(tri[index],tri[(index+1)%3])
					var opposite: int=tri[(index+2)%3]
					var key: String=str(first)+":"+str(second)
					if not edges.has(key): edges[key]=opposite
					else:
						var other: int=edges[key]
						var geometry:=hinge_geometry(rest[first],rest[second],rest[other],rest[opposite])
						if not geometry.is_empty(): bending_hinges.append({"ids":[first,second,other,opposite],"angle":geometry[0]})

func hinge_geometry(a: Vector3,b: Vector3,c: Vector3,d: Vector3) -> Array:
	var edge:=b-a
	var length:=edge.length()
	var nc:=edge.cross(c-a)
	var nd:=-edge.cross(d-a)
	var area_c:=nc.length()
	var area_d:=nd.length()
	if minf(length,minf(area_c,area_d))<.0000001: return []
	nc/=area_c
	nd/=area_d
	var angle:=atan2((edge/length).dot(nc.cross(nd)),nc.dot(nd))
	var gc:=-length/area_c*nc
	var gd:=-length/area_d*nd
	var tc:=(c-a).dot(edge)/(length*length)
	var td:=(d-a).dot(edge)/(length*length)
	return [angle,-(1-tc)*gc-(1-td)*gd,-tc*gc-td*gd,gc,gd]

func weights_for(point: Vector3) -> Dictionary:
	var row:=row_heights.size()-2
	for i in row_heights.size()-1:
		if point.y>=row_heights[i+1]:
			row=i
			break
	var v:=clampf((row_heights[row]-point.y)/maxf(.00001,row_heights[row]-row_heights[row+1]),0,1)
	# Cage rings are elliptical. Circular atan2 produces large tangential
	# offsets, which rotate into folds when their physical cell bends.
	var rx:=lerpf(row_radius_x[row],row_radius_x[row+1],v)
	var rz:=lerpf(row_radius_z[row],row_radius_z[row+1],v)
	var angle:=fposmod(atan2(-point.z/maxf(.001,rz),point.x/maxf(.001,rx)),TAU)/TAU*columns
	var col:=int(angle)%columns
	var u:=angle-floorf(angle)
	var ids: Array[int]=[row*columns+col,row*columns+(col+1)%columns,(row+1)*columns+col,(row+1)*columns+(col+1)%columns]
	var values: Array[float]=[(1-u)*(1-v),u*(1-v),(1-u)*v,u*v]
	var center:=Vector3.ZERO
	for i in 4: center+=rest[ids[i]]*values[i]
	return {"ids":ids,"weights":values,"offset":point-center}

func bind_render_meshes(prefixes: Array) -> void:
	var pending: Array[Node]=[actor.visual]
	while not pending.is_empty():
		var source: Node=pending.pop_back()
		pending.append_array(source.get_children())
		if not source is MeshInstance3D or source.mesh==null: continue
		var matches:=false
		for prefix in prefixes:
			if str(source.name).begins_with(str(prefix)): matches=true
		if not matches: continue
		var visible:=MeshInstance3D.new()
		visible.name="PhysicalCloth_"+str(source.name)
		add_child(visible)
		var mesh:=ArrayMesh.new()
		var maximum_offset:=0.0
		var average_offset:=0.0
		var vertex_count:=0
		for surface in source.mesh.get_surface_count():
			var arrays: Array=source.mesh.surface_get_arrays(surface).duplicate(true)
			var vertices: PackedVector3Array=arrays[Mesh.ARRAY_VERTEX]
			var rest_normals: PackedVector3Array=arrays[Mesh.ARRAY_NORMAL]
			var offsets:=PackedVector3Array()
			var custom_indices:=PackedFloat32Array()
			var custom_weights:=PackedFloat32Array()
			for index in vertices.size():
				var bind:=weights_for(actor.to_local(source.to_global(vertices[index])))
				offsets.append(bind.offset)
				maximum_offset=maxf(maximum_offset,bind.offset.length())
				average_offset+=bind.offset.length()
				vertex_count+=1
				for id in bind.ids: custom_indices.append(float(id))
				for weight in bind.weights: custom_weights.append(weight)
				rest_normals[index]=(actor.global_basis.inverse()*source.global_basis*rest_normals[index]).normalized()
			arrays[Mesh.ARRAY_VERTEX]=offsets
			arrays[Mesh.ARRAY_NORMAL]=rest_normals
			arrays[Mesh.ARRAY_TANGENT]=null
			arrays[Mesh.ARRAY_CUSTOM0]=custom_indices
			arrays[Mesh.ARRAY_CUSTOM1]=custom_weights
			arrays[Mesh.ARRAY_BONES]=null
			arrays[Mesh.ARRAY_WEIGHTS]=null
			var indices: PackedInt32Array=arrays[Mesh.ARRAY_INDEX]
			if indices.is_empty():
				for index in vertices.size(): indices.append(index)
				arrays[Mesh.ARRAY_INDEX]=indices
			var flags:=Mesh.ARRAY_CUSTOM_RGBA_FLOAT<<Mesh.ARRAY_FORMAT_CUSTOM0_SHIFT | Mesh.ARRAY_CUSTOM_RGBA_FLOAT<<Mesh.ARRAY_FORMAT_CUSTOM1_SHIFT
			mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays,[],{},flags)
			var material:=ShaderMaterial.new()
			material.shader=load("res://shaders/native_cloth.gdshader")
			var original=source.get_active_material(surface)
			for parameter in ["base_linear","vertex_color_weight"]:
				material.set_shader_parameter(parameter,original.get_shader_parameter(parameter))
			material.set_shader_parameter("cage_positions",position_texture)
			material.set_shader_parameter("cage_rest",rest_texture)
			var outline:=ShaderMaterial.new()
			outline.shader=load("res://shaders/native_cloth_outline.gdshader")
			outline.set_shader_parameter("cage_positions",position_texture)
			outline.set_shader_parameter("cage_rest",rest_texture)
			var ink_width:=INK.width(str(source.name))
			outline.set_shader_parameter("outline_width",ink_width)
			if ink_width>0: material.next_pass=outline
			mesh.surface_set_material(mesh.get_surface_count()-1,material)
		visible.mesh=mesh
		visible.custom_aabb=AABB(Vector3(-2,-.5,-2),Vector3(4,4,4))
		bindings.append({"node":visible})
		source.visible=false
		report.rendered_high_meshes.append(str(source.name))
		if not report.has("render_binding_offsets"): report["render_binding_offsets"]=[]
		report.render_binding_offsets.append({"mesh":str(source.name),"vertices":vertex_count,"max_offset_m":maximum_offset,"mean_offset_m":average_offset/maxf(1,vertex_count)})

func position_image(positions: PackedVector3Array) -> Image:
	var data:=PackedFloat32Array()
	data.resize(positions.size()*4)
	for i in positions.size():
		data[i*4]=positions[i].x
		data[i*4+1]=positions[i].y
		data[i*4+2]=positions[i].z
		data[i*4+3]=1.0
	return Image.create_from_data(columns,int(positions.size()/columns),false,Image.FORMAT_RGBAF,data.to_byte_array())

func _process(_delta: float) -> void:
	if not report.ready: return
	var prof_start:=PROF.begin()
	current.resize(rest.size())
	for i in rest.size():
		current[i]=cloth.get_point_transform(i)
		report.maximum_displacement=maxf(report.maximum_displacement,current[i].distance_to(actor.to_global(rest[i])))
	var pin_error:=0.0
	var waist_pose: Transform3D=rig.world_pose(waist_bone)
	for index in pins: pin_error=maxf(pin_error,current[index].distance_to(waist_pose*pin_offsets[index]))
	report.maximum_pin_error=maxf(report.maximum_pin_error,pin_error)
	report["current_pin_error"]=pin_error
	position_texture.update(position_image(current))
	metric_clock+=_delta
	if metric_clock>.25:
		metric_clock=0
		measure_geometry()
	report.update_count+=1
	PROF.end("cloth_render_transfer",prof_start)

func _physics_process(_delta: float) -> void:
	if not report.ready: return
	var prof_start:=PROF.begin()
	# Pinned boundary motion belongs to the physics tick. Godot's attachment
	# path submission occurs in frame_pre_draw and is absent in headless mode.
	# Free cloth points remain exclusively integrated by Jolt.
	var waist_pose: Transform3D=rig.world_pose(waist_bone)
	if is_instance_valid(petticoat):
		petticoat.global_transform=waist_pose
		for sweep in actor.wearable_shapes: sweep.global_transform=waist_pose
	for index in pins:
		PhysicsServer3D.soft_body_move_point(cloth.get_physics_rid(),index,waist_pose*pin_offsets[index])
	material_elapsed+=_delta
	if material_elapsed>=1.0/material_hz-.00000001:
		evaluate_material(material_elapsed)
		material_elapsed=0.0
	for index in forced_indices:
		if cached_forces[index].length_squared()>.0000000001: cloth.apply_force(index,cached_forces[index])
	PROF.end("cloth_material_physics",prof_start)

func evaluate_material(sample_delta: float) -> void:
	var prof_start:=PROF.begin()
	var points:=PackedVector3Array()
	var forces:=PackedVector3Array()
	forces.resize(rest.size())
	for index in rest.size(): points.append(cloth.get_point_transform(index))
	var velocities:=PackedVector3Array()
	for index in rest.size(): velocities.append((points[index]-previous_physics[index])/sample_delta)
	var energy:=0.0
	var maximum_force:=0.0
	for hinge in bending_hinges:
		var ids: Array=hinge.ids
		var geometry:=hinge_geometry(points[ids[0]],points[ids[1]],points[ids[2]],points[ids[3]])
		if geometry.is_empty(): continue
		var angle: float=wrapf(geometry[0]-hinge.angle,-PI,PI)
		var rate:=0.0
		for i in 4: rate+=geometry[i+1].dot(velocities[ids[i]])
		var moment:=clampf(.0006*angle+.000025*rate,-.0015,.0015)
		for i in 4:
			var force: Vector3=-moment*geometry[i+1]
			forces[ids[i]]+=force
			maximum_force=maxf(maximum_force,force.length())
		energy+=.5*.0006*angle*angle
	cached_forces=forces
	previous_physics=points
	report["bending_energy_J"]=energy
	report["current_maximum_hinge_force_N"]=maximum_force
	report["maximum_bending_energy_J"]=maxf(report.get("maximum_bending_energy_J",0.0),energy)
	PROF.end("cloth_force_evaluation",prof_start)

func measure_geometry() -> void:
	var inverted:=0
	var collapsed:=0
	var minimum_ratio:=INF
	var maximum_ratio:=0.0
	for i in range(0,triangles.size(),3):
		var a:=triangles[i]
		var b:=triangles[i+1]
		var c:=triangles[i+2]
		var rest_normal: Vector3=actor.global_basis*(rest[b]-rest[a]).cross(rest[c]-rest[a])
		var actual_normal: Vector3=(current[b]-current[a]).cross(current[c]-current[a])
		var ratio:=actual_normal.length()/maxf(.00000001,rest_normal.length())
		minimum_ratio=minf(minimum_ratio,ratio)
		maximum_ratio=maxf(maximum_ratio,ratio)
		if ratio<.08: collapsed+=1
		if actual_normal.dot(rest_normal)<0: inverted+=1
	report["geometry"]={"inverted_triangles_against_material_rest":inverted,"collapsed_triangles":collapsed,"min_area_ratio":minimum_ratio,"max_area_ratio":maximum_ratio,"triangles":triangles.size()/3}
	report["maximum_inverted_triangles"]=maxi(report.get("maximum_inverted_triangles",0),inverted)
	report["maximum_collapsed_triangles"]=maxi(report.get("maximum_collapsed_triangles",0),collapsed)

func snapshot() -> Dictionary:
	return report.duplicate(true)
