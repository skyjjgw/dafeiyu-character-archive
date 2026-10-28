extends Node

var report: Dictionary={"verified":false,"reference_rgb":[201,185,170],"method":"64px independent native shader swatch, same lights, measured GPU center pixel"}

func run(model: Node3D) -> void:
	if DisplayServer.get_name()=="headless":
		report["waiting"]="GPU render is required for color measurement"
		return
	var viewport:=SubViewport.new()
	viewport.size=Vector2i(64,64)
	viewport.own_world_3d=true
	viewport.render_target_update_mode=SubViewport.UPDATE_ALWAYS
	add_child(viewport)
	var scene:=Node3D.new()
	viewport.add_child(scene)
	var environment:=WorldEnvironment.new()
	environment.environment=Environment.new()
	environment.environment.background_mode=Environment.BG_COLOR
	environment.environment.background_color=Color.BLACK
	environment.environment.ambient_light_source=Environment.AMBIENT_SOURCE_COLOR
	environment.environment.ambient_light_color=Color(.72,.79,.88)
	environment.environment.ambient_light_energy=.16
	scene.add_child(environment)
	for item in [[Vector3(-38,-28,0),.85],[Vector3(-20,145,0),.10]]:
		var light:=DirectionalLight3D.new()
		light.rotation_degrees=item[0]
		light.light_energy=item[1]
		scene.add_child(light)
	var camera:=Camera3D.new()
	camera.projection=Camera3D.PROJECTION_ORTHOGONAL
	camera.size=1.1
	camera.position=Vector3(0,0,2)
	scene.add_child(camera)
	camera.current=true
	var surface:=MeshInstance3D.new()
	var quad:=QuadMesh.new()
	quad.size=Vector2.ONE
	surface.mesh=quad
	var material:=ShaderMaterial.new()
	material.shader=load("res://shaders/native_skin.gdshader")
	var target:=Color(201.0/255,185.0/255,170.0/255,1)
	var linear:=target.srgb_to_linear()
	material.set_shader_parameter("base_linear",Vector4(linear.r,linear.g,linear.b,1))
	material.set_shader_parameter("is_skin",true)
	surface.material_override=material
	scene.add_child(surface)
	await RenderingServer.frame_post_draw
	var first: Color=viewport.get_texture().get_image().get_pixel(32,32)
	var gain:=Vector3(clampf(target.r/maxf(.01,first.r),.70,1.30),clampf(target.g/maxf(.01,first.g),.70,1.30),clampf(target.b/maxf(.01,first.b),.70,1.30))
	material.set_shader_parameter("skin_calibration_gain",gain)
	var pending: Array[Node]=[model]
	while not pending.is_empty():
		var node: Node=pending.pop_back()
		pending.append_array(node.get_children())
		if not node is MeshInstance3D or node.mesh==null: continue
		for index in node.mesh.get_surface_count():
			var shader=node.get_active_material(index)
			if shader is ShaderMaterial and shader.get_shader_parameter("is_skin")==true: shader.set_shader_parameter("skin_calibration_gain",gain)
	await RenderingServer.frame_post_draw
	var image:=viewport.get_texture().get_image()
	var final: Color=image.get_pixel(32,32)
	image.save_png("res://reports/skin-calibration-swatch.png")
	report["before_rgb"]=[roundi(first.r*255),roundi(first.g*255),roundi(first.b*255)]
	report["after_rgb"]=[roundi(final.r*255),roundi(final.g*255),roundi(final.b*255)]
	report["gain"]=[gain.x,gain.y,gain.z]
	report["verified"]=maxf(absf(final.r-target.r),maxf(absf(final.g-target.g),absf(final.b-target.b)))<.02
	viewport.queue_free()
