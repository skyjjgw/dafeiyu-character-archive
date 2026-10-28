extends SceneTree
func _initialize() -> void: call_deferred("run")
func run() -> void:
	var document:=GLTFDocument.new();var state:=GLTFState.new()
	var error:=document.append_from_file("res://../assets/selected-hand-v2.glb",state,64)
	if error!=OK: push_error("Hand GLB import failed: "+str(error));quit(1);return
	var actor:=document.generate_scene(state);root.add_child(actor)
	var shader:=Shader.new();shader.code="""shader_type spatial;
render_mode unshaded,cull_back;
varying vec4 hand_linear;
vec3 display(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(0.0)),vec3(1.0/2.4))-0.055,step(vec3(0.0031308),c));}
void vertex(){hand_linear=COLOR;}
void fragment(){ALBEDO=OUTPUT_IS_SRGB?display(hand_linear.rgb):hand_linear.rgb;}
"""
	var source_material:=ShaderMaterial.new();source_material.shader=shader
	var probes: Array=[];var skeletons: Array=[]
	for child in actor.find_children("*","MeshInstance3D",true,false):
		var colors: PackedColorArray=child.mesh.surface_get_arrays(0)[Mesh.ARRAY_COLOR]
		var material: StandardMaterial3D=child.mesh.surface_get_material(0)
		# Godot's generated unlit material leaves this off despite COLOR_0.
		# This smoke adapter enables imported colors explicitly; the production
		# source runtime must still restore Float32 COLOR via CUSTOM0 for fidelity.
		material.vertex_color_use_as_albedo=true;material.vertex_color_is_srgb=false
		child.material_override=source_material
		probes.append({"name":child.name,"surfaces":child.mesh.get_surface_count(),"skin_binds":child.skin.get_bind_count() if child.skin else 0,"colors":colors.size(),"sample":str(colors[0]) if colors.size()>0 else "none","vertex_color_use_as_albedo":material.vertex_color_use_as_albedo})
	for child in actor.find_children("*","Skeleton3D",true,false): skeletons.append(child.get_bone_count())
	root.transparent_bg=true
	var camera:=Camera3D.new();root.add_child(camera);camera.projection=Camera3D.PROJECTION_ORTHOGONAL;camera.size=.30;camera.current=true
	var data: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://hand-review.json"));var t: Array=data.states[0].target
	var target:=Vector3(t[0],t[1],t[2]);camera.position=target+Vector3(2.828427,0,2.828427);camera.look_at(target)
	var env:=WorldEnvironment.new();env.environment=Environment.new();env.environment.background_mode=Environment.BG_CLEAR_COLOR;env.environment.tonemap_mode=Environment.TONE_MAPPER_LINEAR;root.add_child(env)
	for i in range(5): await RenderingServer.frame_post_draw
	var saved:=root.get_texture().get_image().save_png("res://../reports/hand-glb-left-neutral-view45.png")
	var report:={"schema":"dafeiyu.selected-hand-glb-native-smoke.v1","import_error":error,"skeleton_bone_counts":skeletons,"meshes":probes,"screenshot_error":saved,"material_adapter":"Explicit source linear COLOR to display shader; imported COLOR is quantized. Production needs Float32 CUSTOM0 restoration.","visual_pass":false,"not_physics_or_grasp_validation":true}
	var file:=FileAccess.open("res://../reports/glb-native-smoke.json",FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"));file.close()
	print(JSON.stringify(report));quit(0 if saved==OK and probes.size()==2 else 1)
