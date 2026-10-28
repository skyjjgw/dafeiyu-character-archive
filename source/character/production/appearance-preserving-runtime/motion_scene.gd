extends Node3D

var asset:RefCounted
var actor:CharacterBody3D
var camera:Camera3D
var status:Label
var details:Label
var pause_button:Button
var frame_times:Array=[]
var recent_fps=0.0
var wall_start=0
var capture_mode=false
var automatic=false
var check_started=false
var captures:Dictionary={}
var view_yaw=0.0
var face_adapter:RefCounted
var face_connected=false
var follow_camera=false
var camera_anchor=Vector3.ZERO

func _ready()->void:
	process_mode=Node.PROCESS_MODE_ALWAYS
	get_window().title="大肥鱼 · 动作试作（已选形象）"
	capture_mode="--capture-motion" in OS.get_cmdline_user_args()
	automatic="--auto-check" in OS.get_cmdline_user_args()
	create_floor()
	asset=load("res://motion_asset.gd").new()
	if asset.load_selected()==null:push_error("Selected source asset missing or mismatched");get_tree().quit(1);return
	actor=load("res://motion_controller.gd").new();add_child(actor)
	actor.process_mode=Node.PROCESS_MODE_PAUSABLE
	if not actor.configure(asset):push_error("Original rig contract failed; no generic replacement loaded");get_tree().quit(1);return
	setup_face()
	camera=Camera3D.new();add_child(camera);camera.current=true;camera.projection=Camera3D.PROJECTION_ORTHOGONAL;camera.size=1.42;camera.h_offset=.22;camera.near=.01;camera.far=20
	var environment=WorldEnvironment.new();environment.environment=Environment.new();environment.environment.background_mode=Environment.BG_COLOR;environment.environment.background_color=Color("17242b");environment.environment.tonemap_mode=Environment.TONE_MAPPER_LINEAR;add_child(environment)
	create_ui()
	wall_start=Time.get_ticks_usec()
	update_camera()

func setup_face()->void:
	if not FileAccess.file_exists("res://face-kernel/selected_face_kernel.gdextension"):return
	face_adapter=load("res://face-kernel/face_adapter.gd").new()
	var equations=JSON.parse_string(FileAccess.get_file_as_string("res://face-kernel/source-equations.json"))
	var map=JSON.parse_string(FileAccess.get_file_as_string("res://face-kernel/source-descriptors.json"))
	var result:Dictionary=face_adapter.setup(asset.model,equations,map.meshes,"res://face-kernel/selected_face_kernel.gdextension")
	if not result.ok:push_error("Source face kernel setup failed: "+str(result));get_tree().quit(1);return
	face_connected=true;actor.rig.face_kernel_connected=true

func create_floor()->void:
	var floor=StaticBody3D.new();floor.name="JoltFloor";floor.collision_layer=1;floor.collision_mask=4|16
	var collision=CollisionShape3D.new();var shape=BoxShape3D.new();shape.size=Vector3(5,.04,5);collision.shape=shape;collision.position.y=-.02;floor.add_child(collision)
	var visual=MeshInstance3D.new();var mesh=PlaneMesh.new();mesh.size=Vector2(5,5);visual.mesh=mesh
	var material=StandardMaterial3D.new();material.shading_mode=BaseMaterial3D.SHADING_MODE_UNSHADED;material.albedo_color=Color("243139");visual.material_override=material;floor.add_child(visual);add_child(floor)
	var obstacle=StaticBody3D.new();obstacle.name="JoltBoundaryBlock";obstacle.collision_layer=1;obstacle.collision_mask=4
	var block=CollisionShape3D.new();var box=BoxShape3D.new();box.size=Vector3(.22,.22,.22);block.shape=box;obstacle.add_child(block)
	var block_mesh=MeshInstance3D.new();var cube=BoxMesh.new();cube.size=box.size;block_mesh.mesh=cube;block_mesh.material_override=material;obstacle.add_child(block_mesh);obstacle.position=Vector3(.72,.11,.55);add_child(obstacle)

func create_ui()->void:
	var layer=CanvasLayer.new();add_child(layer)
	var panel=PanelContainer.new();panel.position=Vector2(810,24);panel.custom_minimum_size=Vector2(268,0);layer.add_child(panel)
	var margin=MarginContainer.new();for edge in ["left","top","right","bottom"]:margin.add_theme_constant_override("margin_"+edge,14)
	panel.add_child(margin)
	var column=VBoxContainer.new();column.add_theme_constant_override("separation",9);margin.add_child(column)
	var title=Label.new();title.text="大肥鱼 · 动作试作";title.add_theme_font_size_override("font_size",22);column.add_child(title)
	var intro=Label.new();intro.text="保留已选形象\n动作与结构仍在完善";column.add_child(intro)
	status=Label.new();status.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;status.custom_minimum_size=Vector2(235,70);column.add_child(status)
	button(column,"动作检查（可随时中断）",func():actor.action_check())
	button(column,"招手",func():actor.cancel("ui_wave");actor.request_wave())
	button(column,"停下 / 中断",func():actor.cancel("ui_cancel"))
	button(column,"转身 90°",func():actor.cancel("ui_turn");actor.desired_heading=actor.rotation.y+PI*.5)
	var views=HBoxContainer.new();column.add_child(views)
	button(views,"前视",func():view_yaw=actor.rotation.y)
	button(views,"侧视",func():view_yaw=actor.rotation.y+PI*.5)
	button(views,"背视",func():view_yaw=actor.rotation.y+PI)
	var follow=CheckButton.new();follow.text="镜头跟随";follow.toggled.connect(func(value):follow_camera=value);column.add_child(follow)
	button(column,"镜头居中",func():camera_anchor=actor.global_position)
	pause_button=button(column,"暂停",toggle_pause)
	button(column,"保存当前状态（F8）",dump_snapshot)
	var input_hint=Label.new();input_hint.text="WASD 移动 · Q/E 转身\n1 招手 · Esc 中断\nP 暂停 · F8 保存状态";column.add_child(input_hint)
	var limits=Label.new();limits.text="手部尚无独立指关节\n发与裙的真实物理待接入";limits.add_theme_color_override("font_color",Color("baa78b"));column.add_child(limits)
	var fold=CheckButton.new();fold.text="运行详情";column.add_child(fold)
	details=Label.new();details.visible=false;details.add_theme_font_size_override("font_size",12);column.add_child(details)
	fold.toggled.connect(func(value):details.visible=value)

func button(parent:Node,text:String,callback:Callable)->Button:
	var result=Button.new();result.text=text;result.pressed.connect(callback);parent.add_child(result);return result

func toggle_pause()->void:
	get_tree().paused=not get_tree().paused
	pause_button.text="继续" if get_tree().paused else "暂停"

func _input(event:InputEvent)->void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.physical_keycode==KEY_P:toggle_pause()
		if event.physical_keycode==KEY_F8:dump_snapshot()
		if event.physical_keycode==KEY_ESCAPE and actor!=null:actor.cancel("escape")
		if event.physical_keycode in [KEY_ESCAPE,KEY_P,KEY_F8]:get_viewport().set_input_as_handled()

func update_camera()->void:
	if follow_camera:camera_anchor=actor.global_position
	var target=camera_anchor+Vector3(.195,.565+1.055,0)*.35
	camera.position=target+Vector3(sin(view_yaw)*2.1,0,cos(view_yaw)*2.1)
	camera.look_at(target)

func _process(delta:float)->void:
	if actor==null or actor.rig==null:return
	if face_connected and not get_tree().paused:
		var updated:Dictionary=face_adapter.update(actor.rig.face_state())
		if not updated.ok:push_error("Source face buffer update failed: "+str(updated));get_tree().quit(1);return
	update_camera()
	if not get_tree().paused and actor.age>1:
		frame_times.append(delta)
		if frame_times.size()>300:frame_times.pop_front()
		var elapsed=0.0;for value in frame_times:elapsed+=value
		recent_fps=frame_times.size()/elapsed if elapsed>0 else 0
	status.text=("已暂停\n" if get_tree().paused else "")+actor.last_status
	var pose:Dictionary=actor.rig.last_pose
	details.text="实际运行 %.1f FPS\n物理引擎 Jolt / 240 Hz\n步数 %d · 支持脚误差 %.2f mm\n骨长误差 %.5f mm\n眼部动态：%s\n（暂停不计入运行 FPS）"%[recent_fps,actor.steps,float(pose.get("support_slip",0))*1000,float(pose.get("bone_length_error",0))*1000,"已接入" if face_connected else "等待原方程内核"]
	if automatic and not check_started and actor.age>1.0:actor.action_check();check_started=true
	if capture_mode:
		for stage in [["neutral",.6],["wave",2.1],["cancel",3.1],["blink-half",3.14],["blink-closed",3.2],["step",5.0],["turn",8.5],["settle",13.0]]:
			if actor.age>=float(stage[1]) and not captures.has(stage[0]):captures[stage[0]]=true;capture(stage[0])
		if actor.age>=14:
			dump_snapshot("res://reports/motion-automatic-final.json")
			get_tree().quit(0)

func capture(stage:String)->void:
	await RenderingServer.frame_post_draw
	var image=get_viewport().get_texture().get_image()
	image.save_png("res://reports/motion-"+stage+".png")
	var file=FileAccess.open("res://reports/motion-"+stage+".json",FileAccess.WRITE)
	var record=snapshot()
	record.gpu_skinned_feet=actor.rig.bake_foot_contact_evidence()
	file.store_string(JSON.stringify(record,"\t"))

func snapshot()->Dictionary:
	var ordered=frame_times.duplicate();ordered.sort()
	return {"scope":"Selected original character motion candidate; no completed anatomy/cloth/hair claim","engine":Engine.get_version_info(),"paused":get_tree().paused,"wall_seconds":(Time.get_ticks_usec()-wall_start)/1000000.0,"unpaused_actual_fps":recent_fps,"frame_ms_p95":ordered[int((ordered.size()-1)*.95)]*1000 if not ordered.is_empty() else null,"fixed_fps_used":false,"physics_requested_hz":Engine.physics_ticks_per_second,"face_kernel_connected":face_connected,"face_kernel":face_adapter.snapshot() if face_connected else {},"face_state":actor.rig.face_state(),"actor":actor.snapshot()}

func dump_snapshot(path="res://reports/motion-interactive-latest.json")->void:
	var file=FileAccess.open(path,FileAccess.WRITE);file.store_string(JSON.stringify(snapshot(),"\t"));print("MOTION_SNAPSHOT ",path)

func _exit_tree()->void:
	if face_adapter!=null:face_adapter.dispose()
	if actor!=null and actor.rig!=null:actor.rig.dispose()
	if asset!=null:asset.dispose()
