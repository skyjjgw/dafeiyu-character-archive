extends Node3D

var actor:CharacterBody3D
var asset:RefCounted
var spec:Dictionary
var bytes:PackedByteArray
var cache:Dictionary={}
var layers:Array=[]
var physics_ready=false
var material_clock=0.0
var source_mesh:MeshInstance3D
var old_source_visible=true
var previous_radius=0.01
var proxy_masks:Array=[]
var extension:Resource
var maximum_pin_error=0.0
var maximum_displacement=0.0
var updates=0
var material_times:Array=[]
var point_radius=.0035
var rest_world_correction=Transform3D.IDENTITY
var material_hz=240.0
var material_enabled=true
var collisions_enabled=true
var maximum_material_force=0.0
var initial_proxy_overlaps:Array=[]

func _hash(value:PackedByteArray)->String:
	var h=HashingContext.new();h.start(HashingContext.HASH_SHA256);h.update(value);return h.finish().hex_encode()

func data(name:String)->Variant:
	if cache.has(name):return cache[name]
	var row=spec.arrays[name];var raw=bytes.slice(int(row.offset),int(row.offset)+int(row.bytes))
	if _hash(raw)!=row.sha256:push_error("Garment array hash mismatch: "+name);return null
	var value:Variant
	if row.type=="float32":value=raw.to_float32_array()
	elif row.type=="uint32":value=raw.to_int32_array()
	elif row.type=="uint16":
		value=PackedInt32Array();value.resize(raw.size()/2)
		for i in value.size():value[i]=raw.decode_u16(i*2)
	else:push_error("Unsupported garment array type: "+str(row.type));return null
	cache[name]=value;return value

func vec3(name:String)->PackedVector3Array:
	var raw=data(name);var points=PackedVector3Array();points.resize(raw.size()/3)
	for i in points.size():points[i]=Vector3(raw[i*3],raw[i*3+1],raw[i*3+2])
	return points

func matrix(values:PackedFloat32Array,start:int)->Transform3D:
	return Transform3D(Basis(Vector3(values[start],values[start+1],values[start+2]),Vector3(values[start+4],values[start+5],values[start+6]),Vector3(values[start+8],values[start+9],values[start+10])),Vector3(values[start+12],values[start+13],values[start+14]))

func godot_indices(source:PackedInt32Array)->PackedInt32Array:
	var result=source.duplicate()
	for i in range(0,result.size(),3):var b=result[i+1];result[i+1]=result[i+2];result[i+2]=b
	return result

func point_image(points:PackedVector3Array)->Image:
	var raw=PackedFloat32Array();raw.resize(points.size()*4)
	for i in points.size():raw[i*4]=points[i].x;raw[i*4+1]=points[i].y;raw[i*4+2]=points[i].z;raw[i*4+3]=1
	return Image.create_from_data(points.size(),1,false,Image.FORMAT_RGBAF,raw.to_byte_array())

func setup(owner_actor:CharacterBody3D,source_asset:RefCounted,options:Dictionary={})->Dictionary:
	actor=owner_actor;asset=source_asset;process_physics_priority=12;process_mode=Node.PROCESS_MODE_PAUSABLE
	material_enabled=bool(options.get("material",true));collisions_enabled=bool(options.get("collisions",true))
	var json_bytes=FileAccess.get_file_as_bytes("res://selected-production/garment/assets/component.json")
	if _hash(json_bytes)!="c01bed3bd202422e8ef28bb8b2e665e2f8c852ea3aa38f05bce38f42cf39319f":return {"ok":false,"error":"Garment JSON revision mismatch"}
	spec=JSON.parse_string(json_bytes.get_string_from_utf8());bytes=FileAccess.get_file_as_bytes("res://selected-production/garment/assets/component.bin")
	if _hash(bytes)!=spec.binary.sha256:return {"ok":false,"error":"Garment binary revision mismatch"}
	extension=load("res://selected-production/garment/kernel/native_cloth_bending.gdextension")
	if not ClassDB.class_exists("NativeClothBending"):return {"ok":false,"error":"Signed bending kernel unavailable"}
	previous_radius=float(ProjectSettings.get_setting("physics/jolt_physics_3d/simulation/soft_body_point_radius"));ProjectSettings.set_setting("physics/jolt_physics_3d/simulation/soft_body_point_radius",point_radius);ProjectSettings.emit_signal("settings_changed")
	if collisions_enabled:
		for entry in actor.rig.proxies:proxy_masks.append({"body":entry.body,"mask":entry.body.collision_mask});entry.body.collision_mask|=8|128
	var neutral_hips=actor.holder.global_transform*matrix(data("source22.neutralWorldMatrices"),0);neutral_hips.basis=neutral_hips.basis.orthonormalized()
	rest_world_correction=actor.rig.world_bone("hips")*neutral_hips.affine_inverse()
	for layer in spec.layers:
		var rest_source=vec3(layer.solver.positionsNeutralRoot);var rest_world=PackedVector3Array()
		for p in rest_source:rest_world.append(rest_world_correction*(actor.holder.global_transform*p))
		initial_proxy_overlaps.append(proxy_overlap_diagnostics(rest_world,str(layer.id)))
		var indices:PackedInt32Array=data(layer.solver.triangles)
		# Jolt builds internal point IDs in first triangle-encounter order. Keep
		# mesh IDs identical to those IDs, avoiding its mesh/physics pin lookup
		# inconsistency while all material/render data remains source canonical.
		var native_winding=godot_indices(indices)
		var source_to_engine=PackedInt32Array();source_to_engine.resize(rest_world.size());source_to_engine.fill(-1)
		var engine_to_source=PackedInt32Array();var engine_indices=PackedInt32Array();engine_indices.resize(indices.size())
		for i in native_winding.size():
			var source_index=native_winding[i]
			if source_to_engine[source_index]<0:source_to_engine[source_index]=engine_to_source.size();engine_to_source.append(source_index)
			engine_indices[i]=source_to_engine[source_index]
		if engine_to_source.size()!=rest_world.size():return {"ok":false,"error":"Unused garment solver vertex"}
		var engine_points=PackedVector3Array();var unique={}
		for index in engine_to_source:
			if unique.has(rest_world[index]):return {"ok":false,"error":"Coincident garment solver vertices need explicit canonical weld mapping"}
			unique[rest_world[index]]=true;engine_points.append(rest_world[index])
		var arrays=[];arrays.resize(Mesh.ARRAY_MAX);arrays[Mesh.ARRAY_VERTEX]=engine_points;arrays[Mesh.ARRAY_INDEX]=engine_indices
		var normals=PackedVector3Array();normals.resize(rest_world.size());arrays[Mesh.ARRAY_NORMAL]=normals
		var mesh=ArrayMesh.new();mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays)
		var body=SoftBody3D.new();body.name="SelectedGarment_"+str(layer.id);body.mesh=mesh;body.collision_layer=8 if layer.id=="outer" else 128;body.collision_mask=(1|16|64|8|128) if collisions_enabled else 0;body.total_mass=.08 if layer.id=="outer" else .035;body.linear_stiffness=.9;body.damping_coefficient=.12;body.simulation_precision=8;body.pressure_coefficient=0;body.visible=false;add_child(body)
		body.disable_mode=SoftBody3D.DISABLE_MODE_KEEP_ACTIVE
		# In Godot 4.7 the backend copies the configured vertex radius only
		# when an existing body leaves its space. Re-enter exactly once here,
		# before any simulated tick or pin/force setup, never during motion.
		var initial_space=body.get_world_3d().space;PhysicsServer3D.soft_body_set_space(body.get_physics_rid(),RID());PhysicsServer3D.soft_body_set_space(body.get_physics_rid(),initial_space)
		var pins:PackedInt32Array=data(layer.solver.waistPins);var offsets={};var previous={};var inverse_hips=actor.rig.world_bone("hips").affine_inverse();var pinned={}
		for index in pins:body.set_point_pinned(source_to_engine[index],true);offsets[index]=inverse_hips*rest_world[index];previous[index]=rest_world[index];pinned[index]=true
		for index in rest_world.size():
			if body.is_point_pinned(source_to_engine[index])!=pinned.has(index):return {"ok":false,"error":"Garment engine pin mapping mismatch","source_index":index}
		# Actual scene-scale tunable cloth parameters, not inherited per-node
		# masses from the rejected art fixture. Small points need a matching
		# material step/damping; all free positions still belong to Jolt.
		var stiffness=.00005 if layer.id=="outer" else .00007
		var kernel=ClassDB.instantiate("NativeClothBending");var configured:Dictionary=kernel.configure(rest_world,indices,stiffness,.0000002,.0003)
		if not configured.ok:return {"ok":false,"error":"Garment bending topology refused","details":configured}
		var texture=ImageTexture.create_from_image(point_image(rest_world));var entry={"id":layer.id,"spec":layer,"body":body,"rest":rest_world,"points":rest_world.duplicate(),"indices":indices,"sourceToEngine":source_to_engine,"pins":pins,"pinned":pinned,"offsets":offsets,"previousPins":previous,"kernel":kernel,"forces":PackedVector3Array(),"texture":texture,"hinges":configured.hinge_count,"energy":0.0}
		entry.forces.resize(rest_world.size());entry.render=build_render(entry,spec.materials[int(layer.render.material)])
		if entry.render==null:return {"ok":false,"error":"Garment high render build failed"}
		layers.append(entry)
	source_mesh=actor.rig.model.find_child("continuous flared skirt, painted front apron and encircling ivory hem",true,false) as MeshInstance3D
	if source_mesh==null:return {"ok":false,"error":"Original selected skirt mesh missing"}
	old_source_visible=source_mesh.visible;source_mesh.visible=false;physics_ready=true
	return {"ok":true,"layers":layers.size(),"solver_points":layers.reduce(func(total,entry):return total+entry.rest.size(),0),"hard_waist_pins":192,"per_vertex_areal_mass":false,"configured_jolt_point_radius_m":point_radius,"backend_radius_initialization":"one pre-step re-entry before pins; minimal sphere calibration 0.003499967m","backend_radius_measured_on_full_garment":false,"current_work_not_physics_acceptance":true}

func proxy_overlap_diagnostics(points:PackedVector3Array,layer_id:String)->Dictionary:
	var records=[]
	for proxy in actor.rig.proxies:
		var half=maxf(proxy.capsule.height*.5-proxy.capsule.radius,0.0);var axis:Vector3=proxy.body.global_basis.y;var a:Vector3=proxy.body.global_position-axis*half;var b:Vector3=proxy.body.global_position+axis*half;var ab=b-a;var penetrating=0;var deepest=0.0
		for p in points:
			var t=clampf((p-a).dot(ab)/ab.length_squared(),0,1) if ab.length_squared()>1e-12 else 0.0;var penetration=proxy.capsule.radius-p.distance_to(a+ab*t)
			if penetration>0:penetrating+=1;deepest=maxf(deepest,penetration)
		if penetrating>0:records.append({"proxy":proxy.body.name,"points_inside":penetrating,"maximum_initial_penetration_m":deepest,"radius_m":proxy.capsule.radius})
	return {"layer":layer_id,"capsules_with_initial_overlap":records}

func build_render(entry:Dictionary,material_spec:Dictionary)->MeshInstance3D:
	var layer=entry.spec;var render=layer.render;var source_positions=vec3(render.positionsNeutralRoot);var positions=PackedVector3Array()
	for p in source_positions:positions.append(rest_world_correction*(actor.holder.global_transform*p))
	var count=positions.size();var rgb:PackedFloat32Array=data(render.attributes.color);var colors=PackedFloat32Array();colors.resize(count*4)
	var triples:PackedInt32Array=data(render.mapping.solverTriples);var bary:PackedFloat32Array=data(render.mapping.barycentric);var offset:PackedFloat32Array=data(render.mapping.signedNormalOffset);var side:PackedFloat32Array=data(render.attributes.sideBlend);var hem:PackedFloat32Array=data(render.attributes.hemT)
	var mapping1=PackedFloat32Array();mapping1.resize(count*4);var mapping2=PackedFloat32Array();mapping2.resize(count*4);var uv2=PackedVector2Array();uv2.resize(count);var uvraw:PackedFloat32Array=data(render.attributes.uv);var uv=PackedVector2Array();uv.resize(count)
	for i in count:
		for channel in range(3):colors[i*4+channel]=rgb[i*3+channel];mapping1[i*4+channel]=triples[i*3+channel];mapping2[i*4+channel]=bary[i*3+channel]
		colors[i*4+3]=1;mapping1[i*4+3]=offset[i]*actor.rig.unit;mapping2[i*4+3]=side[i];uv2[i]=Vector2(hem[i],0);uv[i]=Vector2(uvraw[i*2],uvraw[i*2+1])
	var arrays=[];arrays.resize(Mesh.ARRAY_MAX);arrays[Mesh.ARRAY_VERTEX]=positions;arrays[Mesh.ARRAY_NORMAL]=vec3(render.normalsBind);arrays[Mesh.ARRAY_TEX_UV]=uv;arrays[Mesh.ARRAY_TEX_UV2]=uv2;arrays[Mesh.ARRAY_CUSTOM0]=colors;arrays[Mesh.ARRAY_CUSTOM1]=mapping1;arrays[Mesh.ARRAY_CUSTOM2]=mapping2;arrays[Mesh.ARRAY_INDEX]=godot_indices(data(render.triangles))
	var flags=(Mesh.ARRAY_CUSTOM_RGBA_FLOAT<<Mesh.ARRAY_FORMAT_CUSTOM0_SHIFT)|(Mesh.ARRAY_CUSTOM_RGBA_FLOAT<<Mesh.ARRAY_FORMAT_CUSTOM1_SHIFT)|(Mesh.ARRAY_CUSTOM_RGBA_FLOAT<<Mesh.ARRAY_FORMAT_CUSTOM2_SHIFT)
	var mesh=ArrayMesh.new();mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays,[],{},flags)
	if mesh.get_surface_count()!=1:return null
	var instance=MeshInstance3D.new();instance.name="SelectedGarmentRender_"+str(layer.id);instance.mesh=mesh;instance.extra_cull_margin=1;add_child(instance)
	var shader=load("res://selected-production/garment/cloth.gdshader");var material=ShaderMaterial.new();material.shader=shader;material.set_shader_parameter("low_positions",entry.texture);material.set_shader_parameter("painted",bool(material_spec.painted));material.set_shader_parameter("source_texture",asset.renderer.source_textures[1]);material.set_shader_parameter("side_navy",Vector3(material_spec.sideNavyLinear[0],material_spec.sideNavyLinear[1],material_spec.sideNavyLinear[2]));material.set_shader_parameter("side_cream",Vector3(material_spec.sideCreamLinear[0],material_spec.sideCreamLinear[1],material_spec.sideCreamLinear[2]));instance.material_override=material
	return instance

func _physics_process(delta:float)->void:
	if not physics_ready:return
	updates+=1;material_clock+=delta;var evaluate=material_clock>=1.0/material_hz-.0000001
	var hips=actor.rig.world_bone("hips")
	for layer in layers:
		for index in layer.pins:
			maximum_pin_error=maxf(maximum_pin_error,layer.body.get_point_transform(layer.sourceToEngine[index]).distance_to(layer.previousPins[index]))
			var target:Vector3=hips*layer.offsets[index];PhysicsServer3D.soft_body_move_point(layer.body.get_physics_rid(),layer.sourceToEngine[index],target);layer.previousPins[index]=target
		if evaluate and material_enabled:
			for index in layer.points.size():layer.points[index]=layer.body.get_point_transform(layer.sourceToEngine[index])
			var started=Time.get_ticks_usec();var result:Dictionary=layer.kernel.evaluate(layer.points,material_clock);material_times.append((Time.get_ticks_usec()-started)/1000.0)
			if material_times.size()>240:material_times.pop_front()
			if not result.ok:push_error("Selected cloth bending failed: "+str(result));physics_ready=false;return
			layer.forces=result.forces;layer.energy=result.energy
			for force in layer.forces:maximum_material_force=maxf(maximum_material_force,force.length())
		for index in layer.forces.size():
			if not layer.pinned.has(index) and layer.forces[index].length_squared()>1e-14:layer.body.apply_force(layer.sourceToEngine[index],layer.forces[index])
	if evaluate:material_clock=0

func _process(_delta:float)->void:
	if not physics_ready:return
	for layer in layers:
		for index in layer.points.size():
			layer.points[index]=layer.body.get_point_transform(layer.sourceToEngine[index]);maximum_displacement=maxf(maximum_displacement,layer.points[index].distance_to(layer.rest[index]))
		layer.texture.update(point_image(layer.points));layer.render.custom_aabb=PhysicsServer3D.soft_body_get_bounds(layer.body.get_physics_rid()).grow(.02)

func snapshot()->Dictionary:
	var records=[]
	for layer in layers:records.append({"id":layer.id,"points":layer.points.size(),"triangles":layer.indices.size()/3,"waist_pins":layer.pins.size(),"hinges":layer.hinges,"mass_kg":layer.body.total_mass,"bending_energy_j":layer.energy})
	return {"ready":physics_ready,"solver":"Jolt SoftBody3D + native signed-dihedral material forces","layers":records,"updates":updates,"maximum_pin_error_m":maximum_pin_error,"maximum_displacement_from_initial_world_m":maximum_displacement,"material_ms_samples":material_times,"configured_point_radius_m":point_radius,"backend_radius_measured":false,"material_enabled":material_enabled,"collisions_enabled":collisions_enabled,"maximum_material_force_n":maximum_material_force,"initial_proxy_overlaps":initial_proxy_overlaps,"per_vertex_areal_mass_used":false,"free_points_pose_targets":false,"collision_pass":false,"final_visual_pass":false,"unsupported":spec.get("unsupported",[])}

func dispose()->void:
	physics_ready=false
	for layer in layers:
		if is_instance_valid(layer.body):layer.body.queue_free()
		if is_instance_valid(layer.render):layer.render.queue_free()
	layers.clear();cache.clear();extension=null
	if is_instance_valid(source_mesh):source_mesh.visible=old_source_visible
	for entry in proxy_masks:
		if is_instance_valid(entry.body):entry.body.collision_mask=entry.mask
	if is_equal_approx(float(ProjectSettings.get_setting("physics/jolt_physics_3d/simulation/soft_body_point_radius")),point_radius):ProjectSettings.set_setting("physics/jolt_physics_3d/simulation/soft_body_point_radius",previous_radius);ProjectSettings.emit_signal("settings_changed")
