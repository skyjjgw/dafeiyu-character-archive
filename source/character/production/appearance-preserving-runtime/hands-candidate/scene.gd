extends "res://motion_scene.gd"

var hand_adapter:RefCounted
var hand_reference:Dictionary={}

func _ready()->void:
	super._ready()
	if actor==null:return
	get_window().title="大肥鱼 · 局部手结构与动作候选"
	# Only this independent scene has the extra finger rig. Keep the unchanged
	# default motion scene's limitations, but describe this candidate accurately.
	for label in find_children("*","Label",true,false):
		if label.text=="手部尚无独立指关节\n发与裙的真实物理待接入":label.text="独立指关节已接入\n抓握、发与裙的物理待接入"
	actor.last_status="就绪 · 独立手指关节已接入，抓握待接入"
	status.text=actor.last_status
	process_physics_priority=20
	var original_rig=actor.rig
	var greeting_rig=load("res://hands-candidate/greeting_rig.gd").new()
	if not greeting_rig.configure(actor,asset.model,asset.contract):push_error("Candidate greeting rig contract mismatch");get_tree().quit(1);return
	greeting_rig.face_kernel_connected=original_rig.face_kernel_connected
	original_rig.dispose();actor.rig=greeting_rig
	hand_adapter=load("res://hands-candidate/hand_adapter.gd").new()
	var result:Dictionary=hand_adapter.setup(actor.holder,actor.rig)
	if not result.ok:push_error("Hand candidate setup: "+str(result));get_tree().quit(1);return
	hand_reference=hand_adapter.reference_check()
	if not hand_reference.pass:push_error("Hand skinning reference mismatch: "+str(hand_reference));get_tree().quit(1);return
	var layer=CanvasLayer.new();add_child(layer)
	var panel=HBoxContainer.new();panel.position=Vector2(24,797);panel.add_theme_constant_override("separation",12);layer.add_child(panel)
	var label=Label.new();label.text="局部手候选 · 弯指";panel.add_child(label)
	var slider=HSlider.new();slider.min_value=0;slider.max_value=.55;slider.step=.01;slider.custom_minimum_size=Vector2(180,24);panel.add_child(slider)
	slider.value_changed.connect(func(value):hand_adapter.set_pose(value,value*.4))
	var original=CheckButton.new();original.text="原手对照";panel.add_child(original);original.toggled.connect(func(value):hand_adapter.set_show_original(value))
	var save=Button.new();save.text="保存手部检查";panel.add_child(save);save.pressed.connect(save_hand_snapshot)
	print("HAND_CANDIDATE_READY ",JSON.stringify({"mapping":hand_adapter.snapshot(),"reference":hand_reference}))

func _physics_process(_delta:float)->void:
	if hand_adapter!=null:hand_adapter.sync_source_pose()

func save_hand_snapshot()->void:
	var file=FileAccess.open("res://hands-candidate/reports/interactive-latest.json",FileAccess.WRITE)
	file.store_string(JSON.stringify({"motion":snapshot(),"hand":hand_adapter.snapshot(),"reference":hand_reference},"\t"))

func _exit_tree()->void:
	if hand_adapter!=null:hand_adapter.dispose()
	super._exit_tree()
