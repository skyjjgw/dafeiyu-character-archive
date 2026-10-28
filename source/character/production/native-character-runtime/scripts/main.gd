extends Node3D

var actor: CharacterBody3D
var cup: RigidBody3D
var camera: Camera3D
var status: Label
var asset_state:="waiting"
var asset_error:=""
var material_report: Dictionary={}
var secondary: Node3D
var clothing: Node3D
var calibration: Node
var paused:=false
var options: Dictionary={}
var loaded_frames:=0
var capture_busy:=false
var camera_yaw:=.18
var camera_pitch:=.08
var camera_drag:=false
var diagnostics: Label
var detail_clock:=0.0
var dsh_state: Dictionary={"connected":false,"running":false,"approvals":0,"error":""}
var asset_provenance: Dictionary={}

func _ready() -> void:
	process_mode=Node.PROCESS_MODE_ALWAYS
	parse_options()
	build_world()
	build_hud()
	actor=load("res://scripts/native_controller.gd").new()
	actor.process_mode=Node.PROCESS_MODE_PAUSABLE
	add_child(actor)
	actor.cup=cup
	load_character()
	set_camera_view(str(options.get("view","front")))

func parse_options() -> void:
	var args:=OS.get_cmdline_user_args()
	var i:=0
	while i<args.size():
		if args[i].begins_with("--"):
			var key:=args[i].trim_prefix("--")
			options[key]=args[i+1] if i+1<args.size() and not args[i+1].begins_with("--") else true
			i+=1 if options[key] is bool else 2
		else: i+=1

func load_character() -> void:
	var path:="res://assets/character.glb"
	if not FileAccess.file_exists(path):
		status.text="等待完整原生角色 GLB · 运行 Sync-Asset.ps1 后重新打开"
		return
	for file in ["character.glb","runtime-rig-bind.json","skirt-physics-cage-v2.json","petticoat-support-v1.json"]:
		asset_provenance[file]=FileAccess.get_sha256("res://assets/"+file) if FileAccess.file_exists("res://assets/"+file) else "missing"
	var document:=GLTFDocument.new()
	var state:=GLTFState.new()
	var error:=document.append_from_file(ProjectSettings.globalize_path(path),state)
	if error!=OK:
		asset_state="error"
		asset_error=error_string(error)
		status.text="角色资源加载失败 · "+asset_error
		return
	var model:=document.generate_scene(state)
	if not model is Node3D:
		asset_state="error"
		status.text="角色文件没有可运行的三维场景"
		return
	actor.install(model)
	var manifest: Dictionary={}
	if FileAccess.file_exists("res://assets/source-manifest.json"):
		var value=JSON.parse_string(FileAccess.get_file_as_string("res://assets/source-manifest.json"))
		if value is Dictionary: manifest=value
	material_report=load("res://scripts/native_materials.gd").apply(model,manifest)
	secondary=load("res://scripts/native_secondary.gd").new()
	secondary.process_mode=Node.PROCESS_MODE_PAUSABLE
	add_child(secondary)
	secondary.configure(actor,actor.rig)
	clothing=load("res://scripts/native_cloth.gd").new()
	clothing.process_mode=Node.PROCESS_MODE_PAUSABLE
	add_child(clothing)
	clothing.configure(actor,actor.rig)
	calibration=load("res://scripts/skin_calibration.gd").new()
	add_child(calibration)
	calibration.run(model)
	if options.has("expression"):
		var expression: String=str(options.expression)
		actor.rig.manual_blink=.5 if expression=="halfblink" else 1.0 if expression=="closed" else 0.0
		if expression=="combo":
			actor.rig.manual_blink=.5
			actor.rig.expression.merge({"aa":.65,"smile":.7,"gazeX":.4,"gazeY":.3},true)
	asset_state="ready" if actor.ready_asset else "missing_rig"
	status.text="原生角色试作 · 本地表现运行，DSH 未连接"
	write_report("res://reports/native-main-loaded.json")

func static_box(label: String,point: Vector3,size: Vector3,color: Color) -> StaticBody3D:
	var body:=StaticBody3D.new()
	body.name=label
	body.position=point
	body.collision_layer=1
	body.collision_mask=2|4|8
	add_child(body)
	var collider:=CollisionShape3D.new()
	var shape:=BoxShape3D.new()
	shape.size=size
	collider.shape=shape
	body.add_child(collider)
	var visible:=MeshInstance3D.new()
	var mesh:=BoxMesh.new()
	mesh.size=size
	visible.mesh=mesh
	var material:=StandardMaterial3D.new()
	material.albedo_color=color
	material.roughness=.9
	visible.material_override=material
	body.add_child(visible)
	return body

func build_world() -> void:
	static_box("Ground",Vector3(0,-.12,0),Vector3(16,.24,16),Color(.24,.29,.31))
	static_box("Tabletop",Vector3(.55,1.25,1.20),Vector3(1.5,.10,.65),Color(.40,.29,.21))
	for x in [-.10,1.20]:
		for z in [.94,1.46]: static_box("TableLeg",Vector3(x,.61,z),Vector3(.075,1.22,.075),Color(.22,.17,.14))
	cup=load("res://scripts/native_cup.gd").new()
	cup.position=Vector3(.50,1.315,.99)
	add_child(cup)
	var environment:=WorldEnvironment.new()
	environment.environment=Environment.new()
	environment.environment.background_mode=Environment.BG_COLOR
	environment.environment.background_color=Color(.12,.16,.19)
	environment.environment.ambient_light_source=Environment.AMBIENT_SOURCE_COLOR
	environment.environment.ambient_light_color=Color(.72,.79,.88)
	environment.environment.ambient_light_energy=.16
	add_child(environment)
	var key:=DirectionalLight3D.new()
	key.rotation_degrees=Vector3(-38,-28,0)
	key.light_energy=.85
	key.shadow_enabled=true
	add_child(key)
	var fill:=DirectionalLight3D.new()
	fill.rotation_degrees=Vector3(-20,145,0)
	fill.light_energy=.10
	add_child(fill)
	camera=Camera3D.new()
	camera.projection=Camera3D.PROJECTION_ORTHOGONAL
	camera.size=4.6
	add_child(camera)
	camera.current=true

func build_hud() -> void:
	var layer:=CanvasLayer.new()
	add_child(layer)
	var heading:=Label.new()
	heading.text="大肥鱼 · 动作试作"
	heading.position=Vector2(24,18)
	heading.add_theme_font_size_override("font_size",22)
	layer.add_child(heading)
	status=Label.new()
	status.position=Vector2(24,51)
	status.add_theme_font_size_override("font_size",14)
	layer.add_child(status)
	var help:=Label.new()
	help.text="WASD 移动 · Q/E 转向 · 1 招手 · F 伸手取杯 · G 放手 · Esc 中断 · 右键拖动视角"
	help.position=Vector2(24,680)
	help.add_theme_font_size_override("font_size",13)
	layer.add_child(help)
	var buttons:=HBoxContainer.new()
	buttons.position=Vector2(24,642)
	layer.add_child(buttons)
	for item in [["招手","wave"],["取杯","pickup"],["放手","release"],["中断","cancel"]]:
		var button:=Button.new()
		button.text=item[0]
		button.pressed.connect(func(): actor.start_action(item[1]))
		buttons.add_child(button)
	var pause_button:=Button.new()
	pause_button.text="暂停 / 继续"
	pause_button.pressed.connect(toggle_pause)
	buttons.add_child(pause_button)
	var details:=VBoxContainer.new()
	details.position=Vector2(690,20)
	layer.add_child(details)
	var toggle:=Button.new()
	toggle.text="试作详情"
	toggle.toggle_mode=true
	details.add_child(toggle)
	diagnostics=Label.new()
	diagnostics.visible=false
	diagnostics.add_theme_font_size_override("font_size",12)
	details.add_child(diagnostics)
	toggle.toggled.connect(func(value): diagnostics.visible=value)
	var save:=Button.new()
	save.text="保存当前状态"
	save.pressed.connect(func(): write_report("res://reports/native-interactive-latest.json"))
	details.add_child(save)
	save.visible=false
	toggle.toggled.connect(func(value): save.visible=value)

func set_camera_view(view: String) -> void:
	camera_yaw=PI/2 if view=="side" else PI if view=="back" else 0.0
	if options.has("portrait"): camera.size=2.0
	update_camera()

func update_camera() -> void:
	var center:=Vector3(0,2.15,.20) if options.has("portrait") else Vector3(0,1.46,.18)
	camera.position=center+Vector3(sin(camera_yaw)*6,1.0+camera_pitch*5,cos(camera_yaw)*6)
	camera.look_at(center)

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.physical_keycode==KEY_P or event.keycode==KEY_P: toggle_pause()
		if event.physical_keycode==KEY_F8 or event.keycode==KEY_F8: write_report("res://reports/native-interactive-latest.json")

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index in [MOUSE_BUTTON_WHEEL_UP,MOUSE_BUTTON_WHEEL_DOWN]:
		camera.size=clampf(camera.size+(-.25 if event.button_index==MOUSE_BUTTON_WHEEL_UP else .25),1.8,7)
	if event is InputEventMouseButton and event.button_index==MOUSE_BUTTON_RIGHT: camera_drag=event.pressed
	if event is InputEventMouseMotion and camera_drag:
		camera_yaw-=event.relative.x*.006
		camera_pitch=clampf(camera_pitch+event.relative.y*.003,-.12,.45)
		update_camera()

func toggle_pause() -> void:
	paused=not paused
	get_tree().paused=paused

func receive_character_message(payload: Dictionary) -> Dictionary:
	var value: Dictionary=load("res://scripts/character_protocol.gd").validate(payload)
	if not value.ok: return value
	if value.type=="character.behavior": actor.start_action(value.action)
	else:
		dsh_state.merge(value.state,true)
		status.text="原生角色试作 · "+("DSH 已连接" if dsh_state.connected else "本地表现运行，DSH 未连接")
	# Model thinking/approval state does not create a fake speech viseme.
	return {"ok":true,"applied":value.type}

func _process(_delta: float) -> void:
	if asset_state!="ready": return
	detail_clock+=_delta
	if diagnostics.visible and detail_clock>.25:
		detail_clock=0
		diagnostics.text="Jolt 实际物理\n骨骼：%s\n头发／尾巴关节：%s\n衣物物理点：%s\n帧率：%s\nF8 保存本次状态\n美术与动作尚未验收"%[actor.rig.body.get_bone_count(),secondary.dynamic_bones.size(),clothing.rest.size(),Engine.get_frames_per_second()]
	loaded_frames+=1
	if options.has("capture") and loaded_frames>=int(options.get("frames",90)) and not capture_busy:
		capture_busy=true
		call_deferred("capture")

func capture() -> void:
	var path: String=str(options.capture)
	if not path.begins_with("res://reports/"):
		push_error("Capture must stay in res://reports")
		get_tree().quit(2)
		return
	if DisplayServer.get_name()=="headless":
		write_report(path.get_basename()+".json")
		get_tree().quit(0)
		return
	await RenderingServer.frame_post_draw
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(path.get_base_dir()))
	var image:=get_viewport().get_texture().get_image()
	var error:=image.save_png(ProjectSettings.globalize_path(path))
	write_report(path.get_basename()+".json")
	print("Native scene capture: "+path+" status="+str(error))
	get_tree().quit(0 if error==OK else 1)

func snapshot() -> Dictionary:
	return {"paused":paused,"asset_state":asset_state,"asset_error":asset_error,"asset_provenance":asset_provenance,"controller":actor.snapshot(),"cup":cup.snapshot(),"materials":material_report,"color_calibration":calibration.report if calibration else {},"secondary":secondary.snapshot() if secondary else {},"cloth":clothing.snapshot() if clothing else {},"dsh_state":dsh_state,"performance":{"fps":Engine.get_frames_per_second(),"process_ms":Performance.get_monitor(Performance.TIME_PROCESS)*1000,"physics_ms":Performance.get_monitor(Performance.TIME_PHYSICS_PROCESS)*1000,"draw_calls":Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)},"engine":Engine.get_version_info(),"headless":DisplayServer.get_name()=="headless","scope":"Actual native GLB scene and interaction study, not artistic acceptance"}

func write_report(path: String) -> void:
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(path.get_base_dir()))
	var file:=FileAccess.open(path,FileAccess.WRITE)
	file.store_string(JSON.stringify(snapshot(),"\t"))
	file.close()
