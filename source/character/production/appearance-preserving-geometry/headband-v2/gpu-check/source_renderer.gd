extends Node3D

var report:Dictionary
var source_textures:Array[ImageTexture]=[]
var seen_materials:Dictionary={}
var imported_meshes:Array=[]
var capture_path="res://reports/selected-appearance-godot.png"
var no_mips=false
var linear_textures=false
var float_colors=false
var color_cache:Dictionary={}
var color_bytes:PackedByteArray=[]
var variant=""
var failed=false
var float_color_checks=0

func fail(message:String)->void:
	failed=true
	push_error(message)
	if is_inside_tree():get_tree().quit(1)

func _ready()->void:
	no_mips="--no-mips" in OS.get_cmdline_user_args()
	linear_textures="--linear-textures" in OS.get_cmdline_user_args()
	float_colors="--float-colors" in OS.get_cmdline_user_args()
	variant="-linear-float" if linear_textures and float_colors else "-linear-mips" if linear_textures else "-float-colors" if float_colors else "-nomips" if no_mips else ""
	capture_path="res://reports/selected-appearance-godot"+variant+".png"
	if not FileAccess.file_exists("E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/assets/selected-appearance.glb"):
		fail("Run node export-baseline.mjs first. No replacement avatar is loaded.")
		return
	report=JSON.parse_string(FileAccess.get_file_as_string("E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/assets/source-rendering.json"))
	if float_colors:
		var colors=JSON.parse_string(FileAccess.get_file_as_string("E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/assets/source-float-colors.json"))
		if colors.glbSha256!=report.glbSha256:
			fail("Float color mapping does not match the selected source GLB")
			return
		color_bytes=FileAccess.get_file_as_bytes("E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/assets/source-float-colors.bin")
		for row in colors.rows:color_cache[str(row.node)+":"+str(int(row.surface))]=row
	get_viewport().transparent_bg=true
	var caches=[]
	if linear_textures:caches=JSON.parse_string(FileAccess.get_file_as_string("E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/assets/linear-textures.json"))
	for index in range(report.images.size()):
		var entry=report.images[index]
		var bytes=FileAccess.get_file_as_bytes("E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/assets/"+str(entry.name))
		var image=Image.new()
		var error=image.load_jpg_from_buffer(bytes) if entry.mimeType=="image/jpeg" else image.load_png_from_buffer(bytes)
		if error!=OK:
			fail("Original image decoding failed: "+str(entry.name))
			return
		if linear_textures:
			var cache=caches[index]
			if cache.sourceSha256!=entry.sha256:
				fail("Linear cache/source hash mismatch")
				return
			image=Image.create_from_data(int(cache.width),int(cache.height),false,Image.FORMAT_RGBAH,FileAccess.get_file_as_bytes("E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/assets/"+str(cache.linearCache)))
		if not no_mips:image.generate_mipmaps()
		source_textures.append(ImageTexture.create_from_image(image))
	var document=GLTFDocument.new()
	var state=GLTFState.new()
	var result=document.append_from_file("E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/assets/selected-appearance.glb",state,GLTFDocument.IMPORT_FLAG_FORCE_DISABLE_MESH_COMPRESSION)
	if result!=OK:
		fail("Direct source GLB import failed: "+str(result))
		return
	var model=document.generate_scene(state)
	if model==null:
		fail("Direct source GLB generated no scene")
		return
	add_child(model)
	apply_source_materials(model)
	if failed:return
	var camera=Camera3D.new()
	add_child(camera)
	camera.projection=Camera3D.PROJECTION_ORTHOGONAL
	camera.size=float(report.camera.halfY)*2.0
	camera.position=Vector3(.195,.565,6)
	camera.look_at(Vector3(.195,.565,0))
	camera.near=.01
	camera.far=30
	camera.current=true
	var environment=WorldEnvironment.new()
	environment.environment=Environment.new()
	environment.environment.background_mode=Environment.BG_CLEAR_COLOR
	environment.environment.tonemap_mode=Environment.TONE_MAPPER_LINEAR
	environment.environment.tonemap_exposure=1.0
	add_child(environment)
	for i in range(8):
		await RenderingServer.frame_post_draw
	var image=get_viewport().get_texture().get_image()
	var capture_error=image.save_png(capture_path)
	var debug_ids:Array=[]
	for index in seen_materials:
		var channels=[(index*73+13)%251,(index*137+47)%251,(index*199+83)%251]
		seen_materials[index].set_shader_parameter("debug_rgb",Vector3(channels[0]/255.0,channels[1]/255.0,channels[2]/255.0))
		debug_ids.append({"index":index,"rgb":channels,"source":report.materials[index]})
	for i in range(3):await RenderingServer.frame_post_draw
	var material_image=get_viewport().get_texture().get_image()
	var suffix=variant
	material_image.save_png("res://reports/material-ids"+suffix+".png")
	var runtime_report={"static_only":true,"capture_error":capture_error,"resolution":[image.get_width(),image.get_height()],"engine":Engine.get_version_info(),"rendering_method":RenderingServer.get_current_rendering_method(),"mesh_instances":imported_meshes,"material_count":seen_materials.size(),"material_debug_ids":debug_ids,"source_glb_sha256":report.glbSha256,"camera":report.camera,"no_animation_or_physics_claim":true,"no_mips":no_mips,"linear_textures":linear_textures,"float_colors":float_colors,"float_color_cpu_roundtrip_checks":float_color_checks,"anisotropy_setting":ProjectSettings.get_setting("rendering/textures/default_filters/anisotropic_filtering_level",-1)}
	var file=FileAccess.open("res://reports/imported-scene"+suffix+".json",FileAccess.WRITE)
	file.store_string(JSON.stringify(runtime_report,"\t"))
	print("APPEARANCE_CAPTURE ",JSON.stringify({"error":capture_error,"meshes":imported_meshes.size(),"materials":seen_materials.size(),"path":capture_path}))
	get_tree().quit(0 if capture_error==OK else 1)

func apply_source_materials(node:Node)->void:
	if node is MeshInstance3D:
		var mesh=node as MeshInstance3D
		if float_colors:restore_float_colors(mesh)
		if failed:return
		var record={"name":node.name,"surfaces":[],"skeleton":str(mesh.skeleton),"transform":str(mesh.global_transform)}
		for surface in range(mesh.mesh.get_surface_count()):
			var old=mesh.mesh.surface_get_material(surface)
			var name=old.resource_name
			if not name.begins_with("SOURCE_"):
				fail("Unidentified source material: "+name)
				return
			var index=int(name.trim_prefix("SOURCE_"))
			if not seen_materials.has(index):seen_materials[index]=source_material(report.materials[index])
			mesh.set_surface_override_material(surface,seen_materials[index])
			var arrays=mesh.mesh.surface_get_arrays(surface)
			record.surfaces.append({"source_material":index,"vertices":arrays[Mesh.ARRAY_VERTEX].size(),"indices":arrays[Mesh.ARRAY_INDEX].size()})
		imported_meshes.append(record)
	for child in node.get_children():apply_source_materials(child)

func hash_bytes(bytes:PackedByteArray)->String:
	var context=HashingContext.new()
	context.start(HashingContext.HASH_SHA256)
	context.update(bytes)
	return context.finish().hex_encode()

func restore_float_colors(instance:MeshInstance3D)->void:
	var original=instance.mesh
	var replacement=ArrayMesh.new()
	replacement.resource_name=original.resource_name
	for surface in range(original.get_surface_count()):
		var arrays=original.surface_get_arrays(surface)
		var flags=original.surface_get_format(surface)&Mesh.ARRAY_FLAG_USE_8_BONE_WEIGHTS
		var key=str(instance.name)+":"+str(surface)
		if color_cache.has(key):
			var entry=color_cache[key]
			if hash_bytes(arrays[Mesh.ARRAY_VERTEX].to_byte_array())!=entry.positionsSha256:
				fail("Source float COLOR position mapping mismatch: "+key)
				return
			if arrays[Mesh.ARRAY_TEX_UV]!=null and hash_bytes(arrays[Mesh.ARRAY_TEX_UV].to_byte_array())!=entry.uvSha256:
				fail("Source float COLOR UV mapping mismatch: "+key)
				return
			var exact=color_bytes.slice(int(entry.offset),int(entry.offset)+int(entry.length))
			if hash_bytes(exact)!=entry.sha256:
				fail("Source float COLOR bytes corrupted: "+key)
				return
			arrays[Mesh.ARRAY_CUSTOM0]=exact.to_float32_array()
			flags|=Mesh.ARRAY_CUSTOM_RGBA_FLOAT<<Mesh.ARRAY_FORMAT_CUSTOM0_SHIFT
		replacement.add_surface_from_arrays(original.surface_get_primitive_type(surface),arrays,[],{},flags)
		if replacement.get_surface_count()!=surface+1:
			fail("Source surface/CUSTOM0 construction failed: "+key)
			return
		replacement.surface_set_material(surface,original.surface_get_material(surface))
		if color_cache.has(key):
			var actual=replacement.surface_get_arrays(surface)
			var entry=color_cache[key]
			if hash_bytes(actual[Mesh.ARRAY_CUSTOM0].to_byte_array())!=entry.sha256 or hash_bytes(actual[Mesh.ARRAY_VERTEX].to_byte_array())!=entry.positionsSha256:
				fail("Source Float COLOR or position changed during ArrayMesh construction: "+key)
				return
			if actual[Mesh.ARRAY_TEX_UV]!=null and hash_bytes(actual[Mesh.ARRAY_TEX_UV].to_byte_array())!=entry.uvSha256:
				fail("UV changed during ArrayMesh Float COLOR construction: "+key)
				return
			float_color_checks+=1
	instance.mesh=replacement

func source_material(spec:Dictionary)->ShaderMaterial:
	var shader=Shader.new()
	var modes=["unshaded","cull_disabled" if int(spec.side)==2 else "cull_back"]
	if spec.transparent:modes.append("blend_mix")
	if not spec.depthWrite:modes.append("depth_draw_never")
	elif spec.transparent:modes.append("depth_draw_always")
	shader.code="""shader_type spatial;
render_mode %s;
uniform vec4 source_linear=vec4(1.0);
uniform bool has_texture=false;
uniform bool source_vertex_colors=false;
uniform bool source_toon=false;
uniform bool texture_is_linear=false;
uniform bool source_float_colors=false;
uniform float source_cutoff=0.0;
uniform vec3 debug_rgb=vec3(-1.0);
uniform sampler2D source_texture:source_color,filter_linear_mipmap_anisotropic,repeat_disable;
varying vec3 source_world_normal;
varying vec4 source_custom_color;
vec3 to_linear(vec3 c){return mix(c/12.92,pow((c+0.055)/1.055,vec3(2.4)),step(vec3(0.04045),c));}
vec3 to_display(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(0.0)),vec3(1.0/2.4))-0.055,step(vec3(0.0031308),c));}
void vertex(){source_world_normal=normalize(MODEL_NORMAL_MATRIX*NORMAL);source_custom_color=CUSTOM0;}
float gradient(vec3 n,vec3 direction){float coord=dot(n,normalize(direction))*0.5+0.5;float width=fwidth(coord)*0.5;return mix(0.7,1.0,smoothstep(0.7-width,0.7+width,coord));}
void fragment(){
 vec4 color=source_linear;
 if(source_vertex_colors)color*=source_float_colors?source_custom_color:COLOR;
 if(has_texture){vec4 texel=texture(source_texture,vec2(UV.x,1.0-UV.y));color*=vec4(texture_is_linear?texel.rgb:(OUTPUT_IS_SRGB?to_linear(texel.rgb):texel.rgb),texel.a);}
 if(color.a<source_cutoff)discard;
 if(source_toon){vec3 n=normalize(source_world_normal);if(!FRONT_FACING)n=-n;vec3 irradiance=vec3(0.65)+to_linear(vec3(1.0,247.0/255.0,236.0/255.0))*2.0*gradient(n,vec3(-3.0,6.0,5.0))+to_linear(vec3(215.0/255.0,233.0/255.0,1.0))*0.7*gradient(n,vec3(4.0,3.0,-2.0));color.rgb*=irradiance/3.141592653589793;}
 ALBEDO=OUTPUT_IS_SRGB?to_display(color.rgb):color.rgb;
 if(debug_rgb.x>=0.0)ALBEDO=debug_rgb;
 %s
}
""" % [",".join(modes),"ALPHA=color.a;" if spec.transparent else ""]
	if no_mips:shader.code=shader.code.replace("filter_linear_mipmap_anisotropic","filter_linear")
	var material=ShaderMaterial.new()
	material.shader=shader
	material.resource_name=spec.name
	var c=spec.baseLinear
	material.set_shader_parameter("source_linear",Vector4(c[0],c[1],c[2],c[3]))
	material.set_shader_parameter("source_vertex_colors",spec.vertexColors)
	material.set_shader_parameter("source_toon",spec.type=="MeshToonMaterial")
	material.set_shader_parameter("texture_is_linear",linear_textures)
	material.set_shader_parameter("source_float_colors",float_colors)
	material.set_shader_parameter("source_cutoff",spec.alphaTest)
	material.set_shader_parameter("has_texture",int(spec.image)>=0)
	if int(spec.image)>=0:material.set_shader_parameter("source_texture",source_textures[int(spec.image)])
	return material
