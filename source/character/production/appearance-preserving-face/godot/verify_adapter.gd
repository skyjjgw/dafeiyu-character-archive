extends SceneTree
## Actual-engine fixed-buffer test. GPU mode additionally captures selected states.
var adapter: RefCounted
var source: Dictionary
var bytes: PackedByteArray
var base: String
var output: Dictionary
var shader_nodes: Node3D
var errors: Array = []
var captures: Array = []
var source_texture: ImageTexture

func _initialize() -> void: call_deferred("run")

func fail(message: String) -> void:
	errors.append(message)
	push_error(message)
	quit(1)

func region(spec: Dictionary) -> PackedByteArray:
	return bytes.slice(int(spec.offset),int(spec.offset)+int(spec.length))

func source_material(spec: Dictionary) -> ShaderMaterial:
	var modes := ["unshaded","cull_disabled" if int(spec.side)==2 else "cull_back"]
	if spec.transparent: modes.append("blend_mix")
	if not spec.depthWrite: modes.append("depth_draw_never")
	elif spec.transparent: modes.append("depth_draw_always")
	var shader := Shader.new()
	shader.code = """shader_type spatial;
render_mode %s;
uniform bool source_float_colors=false;
uniform bool source_vertex_colors=false;
uniform bool has_texture=false;
uniform vec4 source_linear=vec4(1.0);
uniform sampler2D source_texture:source_color,filter_linear_mipmap_anisotropic,repeat_disable;
varying vec4 source_custom_color;
vec3 to_linear(vec3 c){return mix(c/12.92,pow((c+0.055)/1.055,vec3(2.4)),step(vec3(0.04045),c));}
vec3 to_display(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(0.0)),vec3(1.0/2.4))-0.055,step(vec3(0.0031308),c));}
void vertex(){source_custom_color=CUSTOM0;}
void fragment(){vec4 color=source_linear;
 if(source_vertex_colors)color*=source_float_colors?source_custom_color:COLOR;
 if(has_texture){vec4 t=texture(source_texture,vec2(UV.x,1.0-UV.y));color*=vec4(OUTPUT_IS_SRGB?to_linear(t.rgb):t.rgb,t.a);}
 ALBEDO=OUTPUT_IS_SRGB?to_display(color.rgb):color.rgb;
 %s
}
""" % [",".join(modes),"ALPHA=color.a;" if spec.transparent else ""]
	var material := ShaderMaterial.new()
	material.shader=shader
	material.set_shader_parameter("source_vertex_colors",spec.vertexColors)
	material.set_shader_parameter("has_texture",spec.hasSourceTexture)
	var c: Array = spec.baseLinear
	material.set_shader_parameter("source_linear",Vector4(c[0],c[1],c[2],c[3]))
	material.set_shader_parameter("source_texture",source_texture)
	return material

func build_source_meshes() -> void:
	shader_nodes=Node3D.new()
	root.add_child(shader_nodes)
	for entry in source.meshes:
		var arrays: Array=[]
		arrays.resize(Mesh.ARRAY_MAX)
		arrays[Mesh.ARRAY_VERTEX]=region(entry.attributes.position).to_vector3_array()
		if entry.attributes.has("normal"): arrays[Mesh.ARRAY_NORMAL]=region(entry.attributes.normal).to_vector3_array()
		if entry.attributes.has("uv"): arrays[Mesh.ARRAY_TEX_UV]=region(entry.attributes.uv).to_vector2_array()
		var flags := 0
		if entry.attributes.has("color"):
			var values:=region(entry.attributes.color).to_float32_array()
			var rgba:=PackedFloat32Array()
			var components:=int(entry.attributes.color.itemSize)
			for index in range(int(entry.vertices)):
				rgba.append(values[index*components]);rgba.append(values[index*components+1]);rgba.append(values[index*components+2])
				rgba.append(values[index*components+3] if components==4 else 1.0)
			arrays[Mesh.ARRAY_CUSTOM0]=rgba
			flags|=Mesh.ARRAY_CUSTOM_RGBA_FLOAT<<Mesh.ARRAY_FORMAT_CUSTOM0_SHIFT
		if entry.indexData!=null:
			var indices:=PackedInt32Array()
			var packed:=region(entry.indexData)
			var stride:=2 if entry.indexData.type=="Uint16Array" else 4
			for index in range(int(entry.indexData.itemCount)):
				indices.append(packed.decode_u16(index*2) if stride==2 else packed.decode_u32(index*4))
			arrays[Mesh.ARRAY_INDEX]=indices
		var mesh:=ArrayMesh.new()
		mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays,[],{},flags)
		var material:=source_material(entry.material)
		material.set_shader_parameter("source_float_colors",entry.attributes.has("color"))
		mesh.surface_set_material(0,material)
		var instance:=MeshInstance3D.new()
		instance.name=entry.name
		instance.mesh=mesh
		shader_nodes.add_child(instance)

func run() -> void:
	base=ProjectSettings.globalize_path("res://").path_join("../")
	source=JSON.parse_string(FileAccess.get_file_as_string(base+"fixtures/source-samples.json"))
	var config: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(base+"fixtures/source-equations.json"))
	bytes=FileAccess.get_file_as_bytes(base+"fixtures/source-samples.bin")
	var image:=Image.new()
	var image_error:=image.load_jpg_from_buffer(FileAccess.get_file_as_bytes(base+"../appearance-baseline-20261027/assets/BV1g2JX6HEHX.jpg"))
	if image_error!=OK: fail("Original image unavailable");return
	image.generate_mipmaps()
	source_texture=ImageTexture.create_from_image(image)
	build_source_meshes()
	adapter=load("res://face_adapter.gd").new()
	var setup: Dictionary=adapter.setup(shader_nodes,config,source.meshes)
	if not setup.ok: fail(str(setup));return
	var viewport:=root.get_viewport()
	viewport.size=Vector2i(704,704)
	viewport.transparent_bg=true
	var camera:=Camera3D.new()
	shader_nodes.add_child(camera)
	camera.projection=Camera3D.PROJECTION_ORTHOGONAL
	camera.size=1.45
	camera.position=Vector3(0.0,0.08,4.0)
	camera.look_at(Vector3(0.0,0.08,0.0))
	camera.current=true
	var environment:=WorldEnvironment.new()
	environment.environment=Environment.new()
	environment.environment.background_mode=Environment.BG_CLEAR_COLOR
	environment.environment.tonemap_mode=Environment.TONE_MAPPER_LINEAR
	shader_nodes.add_child(environment)
	output={"schema":"dafeiyu.selected-face-buffer-parity.v1","engine":Engine.get_version_info(),"gpu":DisplayServer.get_name()!="headless","renderer":RenderingServer.get_current_rendering_method(),"states":source.frames.size(),"position_components":0,"uv_components":0,"rgba_components":0,"readback_unequal":0,"visibility_mismatches":0,"kernel_mean_ms":0.0,"submit_mean_ms":0.0,"captures":captures,"sourceUnchanged":true,"newFaceArt":false,"sourceSourceOnly":true}
	for frame in source.frames:
		var updated: Dictionary=adapter.update(frame.state)
		if not updated.ok:fail(str(updated));return
		output.kernel_mean_ms+=updated.last_kernel_ms
		output.submit_mean_ms+=updated.last_submit_ms
		if output.gpu: await RenderingServer.frame_post_draw
		for expected in frame.meshes:
			var binding: Dictionary=adapter.bindings[int(expected.index)]
			if binding.instance.visible!=expected.visible:output.visibility_mismatches+=1
			# The headless dummy renderer does not apply GPU region writes.
			# Numerical source parity has its own full headless test; only
			# a real rendering device can prove these submitted buffers.
			if not output.gpu: continue
			var arrays: Array=binding.mesh.surface_get_arrays(0)
			for attribute in expected.attributes:
				var actual: PackedByteArray
				if attribute=="position":actual=arrays[Mesh.ARRAY_VERTEX].to_byte_array();output.position_components+=actual.size()/4
				elif attribute=="uv":actual=arrays[Mesh.ARRAY_TEX_UV].to_byte_array();output.uv_components+=actual.size()/4
				else:actual=arrays[Mesh.ARRAY_CUSTOM0].to_byte_array();output.rgba_components+=actual.size()/4
				var compare: Dictionary=adapter.kernel.compare_float_bytes(actual,region(expected.attributes[attribute]))
				if not compare.ok:fail(str(compare));return
				output.readback_unequal+=int(compare.bit_unequal)
		var label: String=frame.state.label
		if output.gpu and label in ["blink-0","blink-5","blink-10","talk-gaze-10","happy-gaze-5","sad-gaze-5"]:
			var path:=base+"reports/face-"+label+".png"
			var error:=viewport.get_texture().get_image().save_png(path)
			captures.append({"state":frame.state,"path":path,"error":error})
	output.kernel_mean_ms/=source.frames.size()
	output.readback_supported=output.gpu
	output.submit_mean_ms/=source.frames.size()
	output.adapter=adapter.snapshot()
	var originals: Dictionary={}
	for key in adapter.bindings: originals[key]=adapter.bindings[key].original_mesh
	adapter.dispose()
	var restored:=true
	for child in shader_nodes.get_children():
		if not child is MeshInstance3D: continue
		for entry in source.meshes:
			if entry.name==str(child.name) and originals.has(int(entry.index)):
				restored=restored and child.mesh==originals[int(entry.index)]
	output.dispose_restores_source=restored
	output.passed=output.readback_unequal==0 and output.visibility_mismatches==0 and restored
	var path:=base+"reports/buffer-source-parity"+("-gpu" if output.gpu else "-headless")+".json"
	var file:=FileAccess.open(path,FileAccess.WRITE)
	file.store_string(JSON.stringify(output,"\t"));file.close()
	print("SELECTED_FACE_BUFFER_PARITY "+JSON.stringify(output))
	shader_nodes.queue_free();adapter=null
	await process_frame
	quit(0 if output.passed else 1)
