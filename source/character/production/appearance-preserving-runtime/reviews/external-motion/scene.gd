extends "res://selected-production/current.gd"

var external:RefCounted
var external_enabled=true
var contact_corrected=false
var blend=.0
var blend_target=.0
var clock=.0
var evidence=[]
var max_slip_raw=0.0
var max_slip_corrected=0.0
var hand_sync_error=0.0
var auto_test=false
var capture_test=false
var done=false
var mapped:Dictionary={}
var summary_label:Label
var capture_marks={}
var native_view=false
var previous_feet={}
var previous_support={}
var raw_low_foot_sliding_max_mps=0.0
var corrected_support_sliding_max_mps=0.0
var raw_low_foot_samples=0
var corrected_support_samples=0
var last_contact_mode=false
var enable_control:CheckButton
var contact_control:CheckButton
var blend_control:HSlider
var restore_test={}

func _ready()->void:
	super._ready()
	if not current_ready:return
	for child in get_children():
		if child is CanvasLayer:child.visible=false
	external=load("res://reviews/external-motion/retarget.gd").new()
	mapped=external.setup(self,actor.rig)
	if not mapped.ok:push_error(str(mapped));get_tree().quit(1);return
	actor.pose_callback=Callable(self,"apply_external")
	FileAccess.open("res://reviews/external-motion/mapping.json",FileAccess.WRITE).store_string(JSON.stringify(mapped,"\t"))
	auto_test="--external-test" in OS.get_cmdline_user_args()
	capture_test="--external-capture" in OS.get_cmdline_user_args()
	get_window().title="大肥鱼 · 官方动作独立重定向对照（未验收）"
	var layer=CanvasLayer.new();add_child(layer)
	var column=VBoxContainer.new();column.position=Vector2(810,24);column.custom_minimum_size=Vector2(266,0);layer.add_child(column)
	var title=Label.new();title.text="官方 CC0 动作独立对照";title.add_theme_font_size_override("font_size",21);column.add_child(title)
	var enabled=CheckButton.new();enabled.text="启用真实外部动作轨道";enabled.button_pressed=true;column.add_child(enabled);enabled.toggled.connect(func(v):external_enabled=v;actor.cancel("external_enabled_changed"))
	var contact=CheckButton.new();contact.text="原接触腿 IK 覆盖";column.add_child(contact);contact.toggled.connect(func(v):contact_corrected=v;actor.cancel("external_mode_switch"))
	enable_control=enabled;contact_control=contact
	var note=Label.new();note.text="上身：外部动作\n腿部：Raw 或现有接触控制";column.add_child(note)
	var row=HBoxContainer.new();column.add_child(row)
	var label=Label.new();label.text="Idle → Walk 混合";row.add_child(label)
	var slider=HSlider.new();slider.min_value=0;slider.max_value=1;slider.step=.01;slider.custom_minimum_size=Vector2(120,24);row.add_child(slider);slider.value_changed.connect(func(v):blend_target=v)
	blend_control=slider
	var buttons=HBoxContainer.new();column.add_child(buttons)
	button(buttons,"Idle",func():slider.value=0)
	button(buttons,"Walk",func():slider.value=1)
	button(column,"停止 / 恢复现有控制",func():external_enabled=false;enabled.button_pressed=false;actor.cancel("external_cancel_return"))
	var views=HBoxContainer.new();column.add_child(views)
	button(views,"前",func():view_yaw=actor.rotation.y)
	button(views,"45°",func():view_yaw=actor.rotation.y+PI/4)
	button(views,"侧",func():view_yaw=actor.rotation.y+PI/2)
	summary_label=Label.new();summary_label.custom_minimum_size=Vector2(260,0);summary_label.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;column.add_child(summary_label)
	var limits=Label.new();limits.custom_minimum_size=Vector2(260,0);limits.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;limits.text="原脸、头饰、尾颜色及身体骨长保留\n不复制成人根位移\nRaw 有约105mm脚锚误差，未验收\nIK模式由原腿控制覆盖，非完整源步态\n此包不提供物理抓握\nWASD原控制需先停外部动作";column.add_child(limits)
	# Keep the original camera framing/appearance; the original motion UI can
	# still be inspected, but this wrapper owns external test blending only.
	print("EXTERNAL_RETARGET_READY ",JSON.stringify({"source_clips":external.player.get_animation_list().size(),"mapping":mapped.mapped,"main_scene_modified":false}))

func apply_external(_face:Dictionary,delta:float)->void:
	clock+=delta
	if auto_test or capture_test:
		if clock<2:blend_target=0;contact_corrected=false
		elif clock<4:blend_target=1;contact_corrected=false
		elif clock<5:blend_target=.5;contact_corrected=false
		elif clock<8:blend_target=1;contact_corrected=true
		elif clock<9:blend_target=0;contact_corrected=true
		else:
			if external_enabled:
				external_enabled=false;actor.cancel("external_automatic_cancel_return")
				restore_test={"stopped_at":clock,"cancel":character_action("cancel"),"pickup_rejection":character_action("pickup"),"wave":character_action("wave")}
			if clock>=9.45 and not restore_test.has("wave_seen"):
				restore_test.wave_seen=actor.rig.wave>0.0;restore_test.wave_value=actor.rig.wave;restore_test.external_disabled=not external_enabled;restore_test.scripted_disabled=not actor.scripted
				character_action("cancel")
	blend=move_toward(blend,blend_target,delta*2)
	if external_enabled:
		external.apply(clock,blend,contact_corrected)
		actor.scripted=true;actor.queue.clear();actor.requested_move=Vector2(0,-blend) if contact_corrected else Vector2.ZERO
		actor.last_status="外部真实动作 · %s · Walk %.2f"%["接触 IK 覆盖" if contact_corrected else "原始重定向（未校脚）",blend]
	else:
		actor.scripted=false;actor.requested_move=Vector2.ZERO
	# Source controller invokes this before final proxies and rig.measure().
	# Hand scene runs at physics priority20, afterwards; sample it from our
	# own later-priority physics callback below, never before final body pose.

func _physics_process(delta:float)->void:
	super._physics_process(delta)
	if external==null or done:return
	# Parent hands-candidate callback synchronizes body22 here at priority20.
	var slip=0.0;var lowest=INF
	for side in actor.rig.feet:
		var sole:Vector3=actor.rig.world_bone(side+"Foot")*(actor.rig.feet[side].sole*actor.rig.unit)
		if previous_feet.has(side) and last_contact_mode==contact_corrected and external_enabled:
			var previous:Vector3=previous_feet[side]
			var speed=Vector2(sole.x-previous.x,sole.z-previous.z).length()/delta
			if not contact_corrected and sole.y<.015 and previous.y<.015:
				raw_low_foot_sliding_max_mps=maxf(raw_low_foot_sliding_max_mps,speed);raw_low_foot_samples+=1
			if contact_corrected and actor.rig.feet[side].support and actor.rig.feet[side].pivot=="sole" and previous_support.get(side,false):
				corrected_support_sliding_max_mps=maxf(corrected_support_sliding_max_mps,speed);corrected_support_samples+=1
		previous_feet[side]=sole
		previous_support[side]=actor.rig.feet[side].support and actor.rig.feet[side].pivot=="sole"
		if actor.rig.feet[side].support:
			var ref:Vector3=actor.rig.feet[side][actor.rig.feet[side].pivot]
			var actual:Vector3=actor.rig.world_bone(side+"Foot")*(ref*actor.rig.unit)
			slip=maxf(slip,actual.distance_to(actor.rig.feet[side].anchor))
			lowest=minf(lowest,actual.y)
	if contact_corrected:max_slip_corrected=maxf(max_slip_corrected,slip)
	else:max_slip_raw=maxf(max_slip_raw,slip)
	last_contact_mode=contact_corrected
	var same_frame_error=0.0
	for i in range(22):
		var a=hand_adapter.skeleton.get_bone_global_pose(i);var b=actor.rig.skeleton.get_bone_global_pose(hand_adapter.body_map[i])
		same_frame_error=maxf(same_frame_error,a.origin.distance_to(b.origin))
		for axis in range(3):same_frame_error=maxf(same_frame_error,a.basis[axis].distance_to(b.basis[axis]))
	hand_sync_error=maxf(hand_sync_error,same_frame_error)
	if Engine.get_physics_frames()%24==0:
		evidence.append({"time":clock,"blend":blend,"external":external_enabled,"contact_corrected":contact_corrected,"slip_m":slip,"lowest_support_reference_y":lowest,"hand_same_frame_error":same_frame_error,"finite":external.finite,"root":str(actor.position)})
	if (auto_test or capture_test) and clock>=10.0:
		done=true
		var result={"status":"independent research candidate; not main integration or final acceptance","real_import":true,"source_sha256":FileAccess.get_sha256(external.PATH),"engine":Engine.get_version_info(),"mapped":mapped,"max_raw_support_anchor_error_m":max_slip_raw,"max_corrected_support_anchor_error_m":max_slip_corrected,"max_local_origin_error_source_units":external.maximum_length_error,"max_hand_same_frame_error":hand_sync_error,"finite":external.finite,"source_root_translation_copied":false,"root_motion_used":false,"pose_hook_order":"controller priority0 -> external pose_callback -> optional contact IK -> proxies/measure -> Jolt tail priority10 -> hands/body22 priority20","runtime_headless":DisplayServer.get_name()=="headless","fixed_fps_test_only":true,"sliding":{"raw_low_sole_threshold_m":.015,"raw_low_sole_samples":raw_low_foot_samples,"raw_low_sole_max_horizontal_speed_mps":raw_low_foot_sliding_max_mps,"corrected_flat_support_samples":corrected_support_samples,"corrected_flat_support_max_horizontal_speed_mps":corrected_support_sliding_max_mps,"limits":"Raw low-sole filter is a diagnostic proxy, not source-authored contact labels; transitions/heel-toe rolls excluded from corrected flat support."},"samples":evidence,"notes":["Raw support anchor error is not treated as a successful planted-foot walk","Contact mode is source upper body with existing leg solver override; not a full source gait transfer","PickUp_Table is an animation only; unsupported grasp remains rejected","Target geometry/materials and all body local translations remain current original"]}
		var name="gpu" if capture_test else "cpu"
		result.restore_original_control_test=restore_test
		FileAccess.open("res://reviews/external-motion/retarget-"+name+".json",FileAccess.WRITE).store_string(JSON.stringify(result,"\t"))
		print("EXTERNAL_RETARGET_TEST ",JSON.stringify({"raw_anchor_error_m":max_slip_raw,"corrected_anchor_error_m":max_slip_corrected,"length_origin_error":external.maximum_length_error,"same_frame_hand_error":hand_sync_error,"finite":external.finite}))
		get_tree().quit(0 if external.finite and hand_sync_error<.0001 and external.maximum_length_error<.000001 else 1)

func _process(delta:float)->void:
	super._process(delta)
	if external==null:return
	enable_control.set_pressed_no_signal(external_enabled);contact_control.set_pressed_no_signal(contact_corrected);blend_control.set_value_no_signal(blend)
	summary_label.text="%s\nWalk %.2f\n脚锚最大误差\nRaw %.1f mm / IK %.2f mm"%[("外部已停 · 现有控制" if not external_enabled else "源上身 + 原接触腿覆盖" if contact_corrected else "Raw（未校脚）"),blend,max_slip_raw*1000,max_slip_corrected*1000]
	if capture_test:
		for mark in [["idle",1.2],["raw-walk",3.6],["blend-half",4.8],["contact-walk",7.0],["original-disabled",9.7]]:
			if clock>=mark[1] and not capture_marks.has(mark[0]):capture_marks[mark[0]]=true;capture_external(mark[0])

func capture_external(label:String)->void:
	var old_paused=get_tree().paused;get_tree().paused=true
	var old_yaw=view_yaw
	for direction in [["front",0.0],["45",PI/4],["side",PI/2]]:
		view_yaw=actor.rotation.y+direction[1];update_camera()
		await RenderingServer.frame_post_draw
		get_viewport().get_texture().get_image().save_png("res://reviews/external-motion/"+label+"-"+direction[0]+".png")
	FileAccess.open("res://reviews/external-motion/"+label+"-state.json",FileAccess.WRITE).store_string(JSON.stringify({"clock":clock,"blend":blend,"contact_corrected":contact_corrected,"external":external_enabled,"feet":actor.rig.bake_foot_contact_evidence(),"current":snapshot()},"\t"))
	view_yaw=old_yaw;update_camera();get_tree().paused=old_paused

func _exit_tree()->void:
	if actor!=null:actor.pose_callback=Callable()
	if external!=null:external.dispose()
	super._exit_tree()
