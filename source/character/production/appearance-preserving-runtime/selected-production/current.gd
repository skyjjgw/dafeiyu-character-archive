extends "res://hands-candidate/scene.gd"

var components:RefCounted
var current_ready=false
var tail:Node3D
var replacement_face_model:Node3D
var source_face_group:Node3D
var replacement_face_handle:Variant=null
var headband_handle:RefCounted
var hair_handle:RefCounted

func _ready()->void:
	components=load("res://selected-production/component_registry.gd").new()
	var verification:Dictionary=components.verify()
	if not verification.ok:push_error("Current character component verification failed: "+str(verification));get_tree().quit(1);return
	super._ready()
	if actor==null or hand_adapter==null or not hand_adapter.ready:return
	get_window().title="大肥鱼 · 当前整合版（制作中）"
	for label in find_children("*","Label",true,false):
		if label.text=="大肥鱼 · 动作试作":label.text="大肥鱼 · 当前整合版"
		if label.text=="保留已选形象\n动作与结构仍在完善":label.text="保留已选形象\n当前整合版 · 尚未完成"
		if label.text=="局部手候选 · 弯指":label.text="手指弯曲"
		if label.text=="独立指关节已接入\n抓握、发与裙的物理待接入":label.text="手指与蓝尾动作已接入\n头发/裙摆物理、抓握待完善"
	components.loaded("selected-look-and-body22",{"source_meshes":77,"body_skins":13,"body_bones":22,"identity":"selected original girl"})
	components.loaded("source-face-default",{"dynamic_meshes":18,"talk_without_audio":0,"source_default_depth":true})
	components.loaded("local-hands-v2",hand_adapter.snapshot())
	tail=load("res://selected-production/tail_jolt.gd").new();add_child(tail)
	var tail_result:Dictionary=tail.setup(actor)
	if not tail_result.ok:push_error("Current tail component setup failed: "+str(tail_result));get_tree().quit(1);return
	components.loaded("selected-tail-jolt",tail_result)
	components.loaded("current-scene-host",{"scene":"res://selected-production/current.tscn","same_controller":true,"unsupported_grasp_rejected":true})
	current_ready=components.all_required_loaded()
	if bool(components.manifest.get("startupComponents",{}).get("continuousHeadV3",false)) and not "--source-face" in OS.get_cmdline_user_args():
		var head_result=load_structural_head()
		if not head_result.ok:push_error("Structural head current integration failed: "+str(head_result));current_ready=false;get_tree().quit(1);return
	if bool(components.manifest.get("startupComponents",{}).get("headbandV2",false)):
		var headband_result=load_headband()
		if not headband_result.ok:push_error("Headband current integration failed: "+str(headband_result));current_ready=false;get_tree().quit(1);return
	if bool(components.manifest.get("startupComponents",{}).get("hairV1",false)):
		var hair_result=load_hair()
		if not hair_result.ok:push_error("Hair current integration failed: "+str(hair_result));current_ready=false;get_tree().quit(1);return
	var face_layer=CanvasLayer.new();add_child(face_layer);var original_face=CheckButton.new();original_face.position=Vector2(24,765);original_face.text="原面部对照";face_layer.add_child(original_face)
	original_face.button_pressed=replacement_face_model==null
	original_face.toggled.connect(func(value):
		var result=restore_source_face() if value else load_structural_head()
		if not result.ok:push_error("Face comparison switch failed: "+str(result)))
	var original_headband=CheckButton.new();original_headband.position=Vector2(180,765);original_headband.text="原头饰对照";face_layer.add_child(original_headband);original_headband.button_pressed=headband_handle==null
	original_headband.toggled.connect(func(value):
		var result=restore_headband() if value else load_headband()
		if not result.ok:push_error("Headband comparison switch failed: "+str(result)))
	var original_hair=CheckButton.new();original_hair.position=Vector2(340,765);original_hair.text="原头发对照";face_layer.add_child(original_hair);original_hair.button_pressed=hair_handle==null
	original_hair.toggled.connect(func(value):
		var result=restore_hair() if value else load_hair()
		if not result.ok:push_error("Hair comparison switch failed: "+str(result)))
	actor.last_status="就绪 · 当前整合版，动作与结构继续完善";status.text=actor.last_status
	print("SELECTED_PRODUCTION_READY ",JSON.stringify({"ready":current_ready,"version":components.manifest.version,"capabilities":get_character_capabilities()}))

func is_character_ready()->bool:return current_ready and components!=null and components.all_required_loaded()

func get_character_capabilities()->Dictionary:
	return components.manifest.get("capabilities",{}).duplicate(true) if components!=null else {}

func load_structural_head()->Dictionary:
	if replacement_face_model!=null:return {"ok":true,"already_structural":true}
	var factory=load("res://selected-production/components/continuous-head-v3/factory.gd").new()
	var built:Dictionary=factory.setup(actor.rig.head,asset.renderer)
	if not built.get("ok",false):factory.dispose();return built
	var committed=replace_source_face(built.adapter,built.model,built.contract,factory)
	if not committed.ok:factory.dispose()
	return committed

func load_headband()->Dictionary:
	if headband_handle!=null:return {"ok":true,"already_installed":true}
	var factory=load("res://selected-production/components/headband-v2/factory.gd").new()
	var built:Dictionary=factory.setup(actor.rig.head,asset.renderer)
	if not built.get("ok",false):factory.dispose();return built
	var installed=replace_headband(factory,built.contract)
	if not installed.ok:factory.dispose()
	return installed

func replace_headband(handle:RefCounted,contract:Dictionary)->Dictionary:
	if not is_character_ready():return {"ok":false,"code":"character_not_ready"}
	if headband_handle!=null:return {"ok":false,"code":"headband_already_installed"}
	if contract.get("id","")!="headband-continuous-shell" or not bool(contract.get("headLocal",false)):return {"ok":false,"code":"headband_component_frame_mismatch"}
	var verification=components.verify_external(contract)
	if not verification.ok:return verification
	for method in ["commit","snapshot","dispose"]:
		if handle==null or not handle.has_method(method):return {"ok":false,"code":"headband_handle_interface_missing","method":method}
	var committed:Dictionary=handle.commit()
	if not committed.get("ok",false):return committed
	headband_handle=handle;components.external_loaded("headband-continuous-shell",handle.snapshot());components.manifest.capabilities.continuousHeadband=true
	return {"ok":true,"component":"headband-continuous-shell","final_accepted":false,"cloth_physics":false}

func restore_headband()->Dictionary:
	if headband_handle==null:return {"ok":true,"already_source":true}
	headband_handle.dispose();headband_handle=null;components.external_disposed("headband-continuous-shell");components.manifest.capabilities.continuousHeadband=false
	return {"ok":true,"source_headband_restored":true}

func load_hair()->Dictionary:
	if hair_handle!=null:return {"ok":true,"already_installed":true}
	var factory=load("res://selected-production/components/hair-v1/factory.gd").new()
	var built:Dictionary=factory.setup(actor.rig.head,asset.renderer)
	if not built.get("ok",false):factory.dispose();return built
	var installed=replace_hair(factory,built.contract)
	if not installed.ok:factory.dispose()
	return installed

func replace_hair(handle:RefCounted,contract:Dictionary)->Dictionary:
	if not is_character_ready():return {"ok":false,"code":"character_not_ready"}
	if hair_handle!=null:return {"ok":false,"code":"hair_already_installed"}
	if contract.get("id","")!="selected-hair-continuous" or not bool(contract.get("headLocal",false)):return {"ok":false,"code":"hair_component_frame_mismatch"}
	var verification=components.verify_external(contract)
	if not verification.ok:return verification
	for method in ["commit","snapshot","dispose"]:
		if handle==null or not handle.has_method(method):return {"ok":false,"code":"hair_handle_interface_missing","method":method}
	var committed:Dictionary=handle.commit()
	if not committed.get("ok",false):return committed
	hair_handle=handle;components.external_loaded("selected-hair-continuous",handle.snapshot());components.manifest.capabilities.continuousHairStructure=true
	return {"ok":true,"component":"selected-hair-continuous","final_accepted":false,"hair_physics":false}

func restore_hair()->Dictionary:
	if hair_handle==null:return {"ok":true,"already_source":true}
	hair_handle.dispose();hair_handle=null;components.external_disposed("selected-hair-continuous");components.manifest.capabilities.continuousHairStructure=false
	return {"ok":true,"source_hair_restored":true}

func replace_source_face(next_adapter:RefCounted,next_model:Node3D,contract:Dictionary,component_handle:Variant=null)->Dictionary:
	if not is_character_ready():return {"ok":false,"code":"character_not_ready"}
	if contract.get("id","")!="continuous-head-v3" or not bool(contract.get("headLocal",false)):return {"ok":false,"code":"head_component_frame_mismatch"}
	if replacement_face_model!=null:return {"ok":false,"code":"head_component_already_installed"}
	var verification:Dictionary=components.verify_external(contract)
	if not verification.ok:return verification
	if next_adapter==null or next_model==null or not next_model.transform.is_equal_approx(Transform3D.IDENTITY):return {"ok":false,"code":"head_local_model_required"}
	for method in ["update","snapshot","dispose"]:
		if not next_adapter.has_method(method):return {"ok":false,"code":"head_adapter_interface_missing","method":method}
	if next_model.get_parent()!=null and next_model.get_parent()!=actor.rig.head:return {"ok":false,"code":"head_component_parent_mismatch"}
	var checked=next_adapter.update(actor.rig.face_state())
	if not checked is Dictionary or not checked.get("ok",false):return {"ok":false,"code":"head_adapter_initial_update_failed"}
	source_face_group=actor.rig.head.find_child(str(contract.get("replacesSourceGroupName","painted-face")),true,false) as Node3D
	if source_face_group==null:return {"ok":false,"code":"original_face_group_missing"}
	# Candidate factory must already have configured the new fixed buffers.
	# Stop/restore the old adapter before hiding its group; do not double-update
	# old buffers or multiply Head's motion into an already-parented model.
	face_connected=false
	if face_adapter!=null:face_adapter.dispose()
	source_face_group.visible=false
	if next_model.get_parent()==null:actor.rig.head.add_child(next_model)
	next_model.visible=true
	replacement_face_model=next_model;replacement_face_handle=component_handle;face_adapter=next_adapter;face_connected=true;actor.rig.face_kernel_connected=true
	components.replace_active("source-face-default","continuous-head-v3",{"contract":contract,"adapter":next_adapter.snapshot(),"head_transform_applied_once":true})
	components.manifest.capabilities.continuousHeadStructure=true
	return {"ok":true,"component":"continuous-head-v3","final_accepted":false}

func restore_source_face()->Dictionary:
	if replacement_face_model==null:return {"ok":true,"already_source":true}
	face_connected=false
	if face_adapter!=null:face_adapter.dispose()
	face_adapter=null
	_release_face_handle()
	if is_instance_valid(replacement_face_model):
		if replacement_face_model.get_parent()!=null:replacement_face_model.get_parent().remove_child(replacement_face_model)
		if not replacement_face_model.is_queued_for_deletion():replacement_face_model.queue_free()
	replacement_face_model=null
	source_face_group.visible=true;setup_face()
	if not face_connected:return {"ok":false,"code":"source_face_restore_failed"}
	components.restore_active("source-face-default","continuous-head-v3",{"dynamic_meshes":18,"source_default_depth":true})
	components.manifest.capabilities.continuousHeadStructure=false
	return {"ok":true,"component":"source-face-default"}

func _release_face_handle()->void:
	# A factory may own a renderer outside the SceneTree. Keep it alive for the
	# adapter's entire lifetime, then invoke its explicit idempotent disposer.
	if replacement_face_handle is Dictionary:
		var disposer=replacement_face_handle.get("dispose",null)
		if disposer is Callable and disposer.is_valid():disposer.call()
	elif replacement_face_handle is Object and is_instance_valid(replacement_face_handle) and replacement_face_handle.has_method("dispose"):
		replacement_face_handle.dispose()
	replacement_face_handle=null

func character_action(action:String,_payload:Dictionary={})->Dictionary:
	if not is_character_ready():return {"ok":false,"code":"character_not_ready"}
	match action:
		"state":return {"ok":true,"state":snapshot()}
		"wave":actor.cancel("character_action_wave");actor.request_wave();return {"ok":true,"action":"wave"}
		"cancel":actor.cancel("character_action_cancel");return {"ok":true,"action":"cancel"}
		"pickup","release":return {"ok":false,"code":"character_action_not_available","action":action,"reason":components.manifest.unsupportedActions[action]}
	return {"ok":false,"code":"unsupported_character_action","action":action}

func snapshot()->Dictionary:
	var result=super.snapshot()
	result.character_version=components.manifest.get("version","") if components!=null else ""
	result.production_status="current-in-progress-not-final"
	result.components=components.snapshot() if components!=null else {}
	result.capabilities=get_character_capabilities()
	result.hand=hand_adapter.snapshot() if hand_adapter!=null else {}
	result.tail=tail.snapshot() if tail!=null else {}
	result.headband=headband_handle.snapshot() if headband_handle!=null else {"source_original":true}
	result.hair=hair_handle.snapshot() if hair_handle!=null else {"source_original":true,"hair_physics":false}
	return result

func dump_snapshot(path="res://selected-production/reports/current-state.json")->void:
	var file=FileAccess.open(path,FileAccess.WRITE);file.store_string(JSON.stringify(snapshot(),"\t"));print("CURRENT_CHARACTER_SNAPSHOT ",path)

func _exit_tree()->void:
	current_ready=false
	face_connected=false
	if hair_handle!=null:hair_handle.dispose();hair_handle=null
	if headband_handle!=null:headband_handle.dispose();headband_handle=null
	if replacement_face_handle!=null:
		if face_adapter!=null:face_adapter.dispose()
		face_adapter=null
		_release_face_handle()
	if tail!=null:tail.dispose()
	if components!=null:components.dispose()
	super._exit_tree()
