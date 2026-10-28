extends RefCounted
## One-time source-surface preparation; per-frame updates never rebuild meshes.
## Shader must retain source material flags and use CUSTOM0 for full-float RGBA.
var kernel: Object
var bindings: Dictionary = {}
var report: Dictionary = {}
var _owned_library: Resource

func _collect(node: Node, found: Dictionary) -> void:
	if node is MeshInstance3D: found[str(node.name)] = node
	for child in node.get_children(): _collect(child, found)

func setup(model: Node, config: Dictionary, descriptors: Array, library_path: String = "res://selected_face_kernel.gdextension") -> Dictionary:
	dispose()
	_owned_library = load(library_path)
	if _owned_library == null or not ClassDB.class_exists("SelectedFaceKernel"):
		return {"ok":false,"error":"kernel_library_unavailable"}
	kernel = ClassDB.instantiate("SelectedFaceKernel")
	var configured: Dictionary = kernel.configure(config, descriptors)
	if not configured.ok: return configured
	var initial: Dictionary = kernel.evaluate({"blink":0.0,"talk":0.0,"happy":0.0,"sad":0.0,"gazeX":0.0,"gazeY":0.0})
	if not initial.ok: return initial
	var found: Dictionary = {}
	_collect(model, found)
	var rows: Array = []
	var prepared: Dictionary = {}
	for frame in initial.meshes:
		if not found.has(frame.name): return {"ok":false,"error":"source_mesh_missing","mesh":frame.name}
		var instance: MeshInstance3D = found[frame.name]
		if instance.mesh.get_surface_count() != 1: return {"ok":false,"error":"expected_one_source_surface","mesh":frame.name}
		var arrays: Array = instance.mesh.surface_get_arrays(0)
		var count: int = arrays[Mesh.ARRAY_VERTEX].size()
		if count != int(frame.vertices): return {"ok":false,"error":"source_vertex_map_mismatch","mesh":frame.name}
		var material: Material = instance.get_active_material(0)
		var has_rgba: bool = frame.has("rgba")
		var has_uv: bool = frame.has("uv")
		if has_rgba:
			# Standard COLOR is RGBA8 on the GPU. Preserve the actual old
			# Float32 color and alpha through a custom float attribute instead.
			arrays[Mesh.ARRAY_COLOR] = null
			arrays[Mesh.ARRAY_CUSTOM0] = frame.rgba.to_float32_array()
			if not material is ShaderMaterial: return {"ok":false,"error":"source_float_shader_required","mesh":frame.name}
			var shader: ShaderMaterial = material
			var supported := false
			for parameter in shader.shader.get_shader_uniform_list():
				if parameter.name == "source_float_colors": supported = true
			if not supported: return {"ok":false,"error":"source_custom_color_channel_required","mesh":frame.name}
		var flags: int = Mesh.ARRAY_FLAG_USE_DYNAMIC_UPDATE
		if has_rgba: flags |= Mesh.ARRAY_CUSTOM_RGBA_FLOAT << Mesh.ARRAY_FORMAT_CUSTOM0_SHIFT
		# No mesh compression: source positions and UV must stay Float32.
		var dynamic := ArrayMesh.new()
		dynamic.resource_name = instance.mesh.resource_name + " / fixed dynamic source"
		dynamic.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arrays, [], {}, flags)
		dynamic.surface_set_material(0, material)
		dynamic.custom_aabb = AABB(Vector3(-1.0,-0.7,-0.5), Vector3(2.0,1.6,1.4))
		var format: int = dynamic.surface_get_format(0)
		var vertex_stride: int = RenderingServer.mesh_surface_get_format_vertex_stride(format, count)
		var attribute_stride: int = RenderingServer.mesh_surface_get_format_attribute_stride(format, count)
		var uv_offset: int = RenderingServer.mesh_surface_get_format_offset(format, count, Mesh.ARRAY_TEX_UV) if has_uv else -1
		var rgba_offset: int = RenderingServer.mesh_surface_get_format_offset(format, count, Mesh.ARRAY_CUSTOM0) if has_rgba else -1
		if vertex_stride != 12: return {"ok":false,"error":"unsupported_position_buffer_stride","mesh":frame.name,"stride":vertex_stride}
		if has_uv and (uv_offset<0 or uv_offset+8>attribute_stride): return {"ok":false,"error":"invalid_uv_buffer_layout","mesh":frame.name}
		if has_rgba and (rgba_offset<0 or rgba_offset+16>attribute_stride): return {"ok":false,"error":"invalid_rgba_buffer_layout","mesh":frame.name}
		prepared[int(frame.index)] = {"instance":instance,"mesh":dynamic,"original_mesh":instance.mesh,"original_visible":instance.visible,"material":material,"float_colors":has_rgba,"original_float_colors":material.get_shader_parameter("source_float_colors") if has_rgba else null,"rid":dynamic.get_rid(),"count":count,"attribute_stride":attribute_stride,"uv_offset":uv_offset,"rgba_offset":rgba_offset}
		rows.append({"name":frame.name,"vertices":count,"vertex_stride":vertex_stride,"attribute_stride":attribute_stride,"uv_offset":uv_offset,"rgba_offset":rgba_offset,"format":format})
	# Commit only after every source vertex mapping, material and buffer
	# layout has passed. A failed preflight leaves the input scene intact.
	bindings = prepared
	for binding in bindings.values():
		binding.instance.mesh = binding.mesh
		if binding.float_colors: binding.material.set_shader_parameter("source_float_colors", true)
	report = {"ok":true,"source_meshes":bindings.size(),"fixed_topology":true,"mesh_rebuilds_during_setup":bindings.size(),"mesh_rebuilds_during_updates":0,"updates":0,"layouts":rows,"head_space":"Original head local, no additional head transform","last_kernel_ms":0.0,"last_submit_ms":0.0}
	return update({"blink":0.0,"talk":0.0,"happy":0.0,"sad":0.0,"gazeX":0.0,"gazeY":0.0})

func update(state: Dictionary) -> Dictionary:
	if kernel == null: return {"ok":false,"error":"not_configured"}
	var evaluated: Dictionary = kernel.evaluate(state)
	if not evaluated.ok: return evaluated
	var started: int = Time.get_ticks_usec()
	for frame in evaluated.meshes:
		var binding: Dictionary = bindings[int(frame.index)]
		if not is_instance_valid(binding.instance): return {"ok":false,"error":"source_scene_disposed"}
		var mesh: ArrayMesh = binding.mesh
		if mesh.get_rid() != binding.rid: return {"ok":false,"error":"dynamic_mesh_identity_changed"}
		mesh.surface_update_vertex_region(0, 0, frame.positions)
		if binding.attribute_stride > 0:
			var uv: PackedByteArray = frame.get("uv",PackedByteArray())
			var rgba: PackedByteArray = frame.get("rgba",PackedByteArray())
			var data: PackedByteArray = kernel.pack_attributes(uv,rgba,binding.count,binding.attribute_stride,binding.uv_offset,binding.rgba_offset)
			if data.size() != binding.attribute_stride*binding.count: return {"ok":false,"error":"attribute_buffer_size_mismatch"}
			mesh.surface_update_attribute_region(0, 0, data)
		binding.instance.visible = frame.visible
	report.updates += 1
	report.last_kernel_ms = evaluated.kernel_ms
	report.last_submit_ms = float(Time.get_ticks_usec()-started)/1000.0
	report.depth_policy = evaluated.depth_policy
	return report

func set_depth_policy(policy: Dictionary) -> Dictionary:
	if kernel == null: return {"ok":false,"error":"not_configured"}
	return kernel.set_depth_policy(policy)

func snapshot() -> Dictionary:
	return report.duplicate(true)

func dispose(restore_source: bool = true) -> void:
	if restore_source:
		for binding in bindings.values():
			if is_instance_valid(binding.instance) and binding.instance.mesh == binding.mesh:
				binding.instance.mesh = binding.original_mesh
				binding.instance.visible = binding.original_visible
			if binding.float_colors and is_instance_valid(binding.material):
				binding.material.set_shader_parameter("source_float_colors", binding.original_float_colors)
	bindings.clear()
	kernel = null
	_owned_library = null
	report = {}
