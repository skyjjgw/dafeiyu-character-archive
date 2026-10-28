extends SceneTree
## Fixed selected-appearance scene. No installed DSH profile is loaded.
var scene: Node
var transport: Node
var badge: Label
var bridge_root: String
var capture_mode := false
var current_mode := false
var projected := {"connected":false,"running":false,"approvals":0,"has_error":false}
var received: Array[Dictionary] = []

func _initialize() -> void:
	bridge_root = get_script().resource_path.get_base_dir().get_base_dir()
	capture_mode = "--selected-bridge-capture" in OS.get_cmdline_user_args()
	current_mode = "--selected-current" in OS.get_cmdline_user_args()
	call_deferred("boot")

func boot() -> void:
	scene = load("res://selected-production/current.tscn" if current_mode else "res://motion.tscn").instantiate()
	root.add_child(scene)
	current_scene = scene
	if scene.actor == null or scene.actor.rig == null:
		push_error("Selected appearance scene unavailable")
		quit(1)
		return
	if current_mode and not scene.is_character_ready():push_error("Current selected character is not ready");quit(1);return
	var layer := CanvasLayer.new()
	layer.layer = 20
	root.add_child(layer)
	badge = Label.new()
	badge.position = Vector2(20,24)
	badge.add_theme_font_size_override("font_size",15)
	layer.add_child(badge)
	update_badge()
	await process_frame
	if DisplayServer.get_name() != "headless":
		await RenderingServer.frame_post_draw
	transport = load(bridge_root + "/godot/stdio_transport.gd").new()
	transport.receiver = receive_character_message
	root.add_child(transport)
	if capture_mode:
		capture_and_close()

func update_badge() -> void:
	badge.text = "本地消息联调 · 实际 DSH 尚未接入\n运行信号 %s · 待确认 %d" % [str(projected.running),int(projected.approvals)]
	if projected.has_error:
		badge.text += " · 会话报告错误"

func receive_character_message(payload: Dictionary) -> Dictionary:
	if payload.type == "character.state":
		for key in ["connected","running","approvals"]:
			if payload.has(key): projected[key] = payload[key]
		if payload.has("error"): projected.has_error = not str(payload.error).is_empty()
		update_badge()
		received.append({"type":"character.state","state":projected.duplicate()})
		return {"ok":true}
	if payload.type != "character.behavior": return {"ok":false}
	var action := str(payload.action)
	if current_mode:
		var applied:Dictionary=scene.character_action(action)
		received.append({"type":"character.behavior","action":action,"supported":applied.get("ok",false)})
		if capture_mode and action=="wave" and applied.get("ok",false):capture_wave()
		return applied
	if action not in ["wave","cancel"]:
		received.append({"type":"character.behavior","action":action,"supported":false})
		return {"ok":false}
	if action == "wave":
		scene.actor.cancel("bridge_wave")
		scene.actor.request_wave()
	else:
		scene.actor.cancel("bridge_cancel")
	received.append({"type":"character.behavior","action":action,"supported":true})
	if capture_mode and action == "wave": capture_wave()
	return {"ok":true}

func snapshot() -> Dictionary:
	return {"scope":"Actual selected original appearance and real motion controller; local IPC only, no installed DSH connection or final quality acceptance", "headless":DisplayServer.get_name()=="headless", "selected_appearance":true, "current_integration":current_mode, "state":projected, "received":received, "scene":scene.snapshot(), "supported_behaviors":["wave","cancel"], "unsupported_behaviors":["pickup","release"]}

func capture_wave() -> void:
	await create_timer(1.0).timeout
	if DisplayServer.get_name() != "headless":
		await RenderingServer.frame_post_draw
		root.get_texture().get_image().save_png(bridge_root + ("/reports/selected-current-bridge-wave.png" if current_mode else "/reports/selected-bridge-wave.png"))

func capture_and_close() -> void:
	await create_timer(6.0).timeout
	if DisplayServer.get_name() != "headless":
		await RenderingServer.frame_post_draw
		root.get_texture().get_image().save_png(bridge_root + ("/reports/selected-current-bridge-visible.png" if current_mode else "/reports/selected-bridge-visible.png"))
	var file := FileAccess.open(bridge_root + ("/reports/selected-current-bridge-visible.json" if current_mode else "/reports/selected-bridge-visible.json"),FileAccess.WRITE)
	file.store_string(JSON.stringify(snapshot(),"\t"))
	file.close()
	transport.request_shutdown("selected_capture_done")
