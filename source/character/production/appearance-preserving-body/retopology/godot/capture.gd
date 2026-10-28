extends SceneTree
var data: Dictionary
var bytes: PackedByteArray
var actor: MeshInstance3D
func _initialize() -> void: call_deferred("run")
func region(spec: Dictionary) -> PackedByteArray: return bytes.slice(int(spec.offset),int(spec.offset)+int(spec.length))
func run() -> void:
	data=JSON.parse_string(FileAccess.get_file_as_string("res://hand-review.json"))
	bytes=FileAccess.get_file_as_bytes("res://hand-review.bin")
	root.transparent_bg=true
	var space:=Node3D.new();root.add_child(space)
	var camera:=Camera3D.new();space.add_child(camera);camera.projection=Camera3D.PROJECTION_ORTHOGONAL;camera.size=.30;camera.current=true
	var env:=WorldEnvironment.new();env.environment=Environment.new();env.environment.background_mode=Environment.BG_CLEAR_COLOR;env.environment.tonemap_mode=Environment.TONE_MAPPER_LINEAR;space.add_child(env)
	var shader:=Shader.new();shader.code="""shader_type spatial;
render_mode unshaded,cull_back;
varying vec4 hand_vertex_color;
vec3 display(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(0.0)),vec3(1.0/2.4))-0.055,step(vec3(0.0031308),c));}
void vertex(){hand_vertex_color=CUSTOM0;}
void fragment(){ALBEDO=OUTPUT_IS_SRGB?display(hand_vertex_color.rgb):hand_vertex_color.rgb;}
"""
	var material:=ShaderMaterial.new();material.shader=shader
	actor=MeshInstance3D.new();space.add_child(actor)
	var captures: Array=[]
	for state in data.states:
		var hand: Dictionary=data.hands[0 if state.side=="left" else 1]
		var arrays: Array=[];arrays.resize(Mesh.ARRAY_MAX)
		arrays[Mesh.ARRAY_VERTEX]=region(state.positions).to_vector3_array()
		arrays[Mesh.ARRAY_INDEX]=region(hand.indices).to_int32_array()
		arrays[Mesh.ARRAY_CUSTOM0]=region(hand.rgba).to_float32_array()
		var mesh:=ArrayMesh.new();mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays,[],{},Mesh.ARRAY_CUSTOM_RGBA_FLOAT<<Mesh.ARRAY_FORMAT_CUSTOM0_SHIFT);mesh.surface_set_material(0,material);actor.mesh=mesh
		for angle in state.views:
			var target:=Vector3(state.target[0],state.target[1],state.target[2]);var a:=deg_to_rad(float(angle))
			camera.position=target+Vector3(4*sin(a),0,4*cos(a));camera.look_at(target)
			for i in range(3): await RenderingServer.frame_post_draw
			var name: String="hand-"+str(state.side)+"-curl"+str(state.grip)+"-view"+str(angle)+".png"
			var path:=ProjectSettings.globalize_path("res://../reports/"+name)
			var error:=root.get_texture().get_image().save_png(path)
			captures.append({"side":state.side,"grip":state.grip,"angle":angle,"error":error,"path":path})
	var report:={"schema":"dafeiyu.hand-actual-gpu-probe.v1","engine":Engine.get_version_info(),"renderer":RenderingServer.get_current_rendering_method(),"captures":captures,"notVisualApproval":true,"sourceOnlyPalette":true}
	var file:=FileAccess.open("res://../reports/actual-gpu-captures.json",FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"));file.close()
	print("HAND_ACTUAL_GPU "+JSON.stringify(report));quit(0)
