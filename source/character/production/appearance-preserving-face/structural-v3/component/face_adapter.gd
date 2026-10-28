extends RefCounted
## Import canonical IDs once; native fixed buffers drive every rendered frame.
var kernel:Object
var bindings:Dictionary={}
var originals:Array=[]
var report:Dictionary={}
var library:Resource
var material_originals:Dictionary={}

func view(bytes:PackedByteArray,spec:Dictionary)->PackedByteArray:
	return bytes.slice(int(spec.offset),int(spec.offset+spec.length))

func collect(node:Node,found:Dictionary)->bool:
	if node is MeshInstance3D:
		if found.has(str(node.name)):return false
		found[str(node.name)]=node
	for child in node.get_children():
		if not collect(child,found):return false
	return true

func setup(model:Node,equations:Dictionary,structure:Dictionary,descriptors:Dictionary,bytes:PackedByteArray,library_path:String)->Dictionary:
	dispose()
	library=load(library_path)
	if library==null or not ClassDB.class_exists("SelectedStructuralFaceKernel"):return {"ok":false,"error":"structural_kernel_unavailable"}
	kernel=ClassDB.instantiate("SelectedStructuralFaceKernel")
	var found:Dictionary={}
	if not collect(model,found):return {"ok":false,"error":"duplicate_component_mesh_name"}
	var native_descriptors:Array=[]
	var prepared:Array=[]
	var next_id=0
	var mapped=0
	var maximum_position_error=0.0
	var maximum_uv_error=0.0
	for row in descriptors.meshes:
		if not found.has(row.name):return {"ok":false,"error":"component_mesh_missing","mesh":row.name}
		var instance:MeshInstance3D=found[row.name]
		var original=instance.mesh
		var roles=view(bytes,row.canonicalRoles).to_int32_array()
		var parameters=view(bytes,row.canonicalParams).to_float64_array()
		var neutral=view(bytes,row.neutralPositions).to_float32_array()
		var uv_source=view(bytes,row.neutralUV).to_float32_array() if row.has("neutralUV") else PackedFloat32Array()
		var rgba_source=view(bytes,row.neutralRGBA).to_float32_array() if row.has("neutralRGBA") else PackedFloat32Array()
		var replacement=ArrayMesh.new()
		replacement.resource_name=original.resource_name+" / continuous native v3"
		var surface_rows:Array=[]
		for surface in range(original.get_surface_count()):
			var arrays=original.surface_get_arrays(surface)
			var positions:PackedVector3Array=arrays[Mesh.ARRAY_VERTEX]
			var ids:PackedVector2Array=arrays[Mesh.ARRAY_TEX_UV2]
			var count=positions.size()
			if ids.size()!=count:return {"ok":false,"error":"canonical_id_channel_missing","mesh":row.name}
			var ordered_roles=PackedInt32Array();ordered_roles.resize(count)
			var ordered_params=PackedFloat64Array();ordered_params.resize(count*4)
			var ordered_rgba=PackedFloat32Array();if not rgba_source.is_empty():ordered_rgba.resize(count*4)
			for vertex in range(count):
				var source_id=int(roundf(ids[vertex].x))
				if source_id<0 or source_id>=int(row.vertices) or absf(ids[vertex].x-source_id)>.000001:return {"ok":false,"error":"invalid_canonical_id"}
				var point=Vector3(neutral[source_id*3],neutral[source_id*3+1],neutral[source_id*3+2])
				maximum_position_error=maxf(maximum_position_error,positions[vertex].distance_to(point))
				ordered_roles[vertex]=roles[source_id]
				for field in range(4):
					ordered_params[vertex*4+field]=parameters[source_id*4+field]
					if not rgba_source.is_empty():ordered_rgba[vertex*4+field]=rgba_source[source_id*4+field]
				if not uv_source.is_empty():
					if arrays[Mesh.ARRAY_TEX_UV]==null:return {"ok":false,"error":"source_uv_missing"}
					var actual_uv:Vector2=arrays[Mesh.ARRAY_TEX_UV][vertex]
					maximum_uv_error=maxf(maximum_uv_error,actual_uv.distance_to(Vector2(uv_source[source_id*2],uv_source[source_id*2+1])))
			mapped+=count
			var material=instance.get_active_material(surface)
			var has_rgba=not ordered_rgba.is_empty()
			var has_uv=not uv_source.is_empty()
			if has_rgba and not material is ShaderMaterial:return {"ok":false,"error":"source_float_shader_required"}
			# The UV1 diagnostic ID is consumed after validated ordering. Source
			# UV0 is retained; dynamic attribute buffers contain only UV0/CUSTOM0.
			arrays[Mesh.ARRAY_TEX_UV2]=null
			arrays[Mesh.ARRAY_COLOR]=null
			var flags=Mesh.ARRAY_FLAG_USE_DYNAMIC_UPDATE
			if has_rgba:
				arrays[Mesh.ARRAY_CUSTOM0]=ordered_rgba
				flags|=Mesh.ARRAY_CUSTOM_RGBA_FLOAT<<Mesh.ARRAY_FORMAT_CUSTOM0_SHIFT
			replacement.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays,[],{},flags)
			if replacement.get_surface_count()!=surface+1:return {"ok":false,"error":"dynamic_surface_build_failed"}
			replacement.surface_set_material(surface,original.surface_get_material(surface))
			var format=replacement.surface_get_format(surface)
			var stride=RenderingServer.mesh_surface_get_format_attribute_stride(format,count)
			var vertex_stride=RenderingServer.mesh_surface_get_format_vertex_stride(format,count)
			var uv_offset=RenderingServer.mesh_surface_get_format_offset(format,count,Mesh.ARRAY_TEX_UV) if has_uv else -1
			var color_offset=RenderingServer.mesh_surface_get_format_offset(format,count,Mesh.ARRAY_CUSTOM0) if has_rgba else -1
			if vertex_stride!=12:return {"ok":false,"error":"unexpected_vertex_stride"}
			var descriptor={"index":next_id,"name":str(row.name)+" / surface "+str(surface),"vertices":count,"semantic":row.semantic,"canonicalRoles":ordered_roles,"canonicalParams":ordered_params,"neutralPositions":positions.to_byte_array()}
			if has_uv:descriptor.neutralUV=arrays[Mesh.ARRAY_TEX_UV].to_byte_array()
			if has_rgba:descriptor.neutralRGBA=ordered_rgba.to_byte_array()
			native_descriptors.append(descriptor)
			var binding={"instance":instance,"mesh":replacement,"surface":surface,"count":count,"material":material,"has_rgba":has_rgba,"stride":stride,"uv_offset":uv_offset,"rgba_offset":color_offset}
			bindings[next_id]=binding;surface_rows.append(binding);next_id+=1
		replacement.custom_aabb=AABB(Vector3(-1.1,-.8,-.7),Vector3(2.2,1.9,1.7))
		prepared.append({"instance":instance,"original":original,"replacement":replacement,"surfaces":surface_rows,"visible":instance.visible})
	if maximum_position_error>.0000001 or maximum_uv_error>.0000001:return {"ok":false,"error":"source_canonical_geometry_changed","position_error":maximum_position_error,"uv_error":maximum_uv_error}
	var configured:Dictionary=kernel.configure(equations,native_descriptors)
	if not configured.ok:return configured
	var structural:Dictionary=kernel.configure_structure(structure)
	if not structural.ok:return structural
	for item in prepared:
		item.instance.mesh=item.replacement
		for binding in item.surfaces:
			if binding.has_rgba:
				var id=binding.material.get_instance_id()
				if not material_originals.has(id):material_originals[id]={"material":binding.material,"value":binding.material.get_shader_parameter("source_float_colors")}
				binding.material.set_shader_parameter("source_float_colors",true)
	originals=prepared
	report={"ok":true,"component":"continuous-head-v3","fixed_topology":true,"mesh_rebuilds_during_updates":0,"instances":prepared.size(),"surfaces":next_id,"mapped_vertices":mapped,"maximum_import_position_error":maximum_position_error,"maximum_import_uv_error":maximum_uv_error,"structure":structural,"updates":0,"last_kernel_ms":0.0,"last_submit_ms":0.0}
	return update({"blink":0.0,"talk":0.0,"happy":0.0,"sad":0.0,"gazeX":0.0,"gazeY":0.0})

func update(state:Dictionary)->Dictionary:
	if kernel==null:return {"ok":false,"error":"not_configured"}
	var evaluated:Dictionary=kernel.evaluate(state)
	if not evaluated.ok:return evaluated
	var started=Time.get_ticks_usec()
	for frame in evaluated.meshes:
		var binding:Dictionary=bindings[int(frame.index)]
		if not is_instance_valid(binding.instance) or binding.instance.mesh!=binding.mesh:return {"ok":false,"error":"component_mesh_lifetime_changed"}
		binding.instance.visible=frame.visible
		if not bool(frame.get("changed",true)):continue
		binding.mesh.surface_update_vertex_region(binding.surface,0,frame.positions)
		if frame.has("uv") or frame.has("rgba"):
			var data:PackedByteArray=kernel.pack_attributes(frame.get("uv",PackedByteArray()),frame.get("rgba",PackedByteArray()),binding.count,binding.stride,binding.uv_offset,binding.rgba_offset)
			if data.size()!=binding.count*binding.stride:return {"ok":false,"error":"attribute_buffer_layout_changed"}
			binding.mesh.surface_update_attribute_region(binding.surface,0,data)
	report.updates+=1;report.last_kernel_ms=evaluated.kernel_ms;report.last_submit_ms=(Time.get_ticks_usec()-started)/1000.0
	return report

func snapshot()->Dictionary:return report.duplicate(true)

func dispose()->void:
	for item in originals:
		if is_instance_valid(item.instance):item.instance.mesh=item.original;item.instance.visible=item.visible
	for saved in material_originals.values():
		if is_instance_valid(saved.material):saved.material.set_shader_parameter("source_float_colors",saved.value)
	material_originals.clear();originals.clear();bindings.clear();kernel=null;library=null;report={}
