extends SceneTree

var scene:Node3D
var checks=[]
func _initialize()->void:call_deferred("run")
func ticks(n:int)->void:
	for i in n:await physics_frame
	await process_frame
func check(name:String,value:bool)->void:
	checks.append({"name":name,"pass":value})
	if not value:push_error("External motion UI check failed: "+name)
func capture(name:String)->void:
	scene.view_yaw=0;scene.update_camera()
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("res://reviews/external-motion/ui-"+name+"-front.png")
func run()->void:
	scene=load("res://reviews/external-motion/scene.tscn").instantiate();root.add_child(scene)
	scene.blend_target=1.0
	await ticks(200)
	check("raw checkbox actual mode",scene.enable_control.button_pressed and scene.external_enabled and not scene.contact_control.button_pressed and not scene.contact_corrected)
	check("raw slider actual blend",absf(scene.blend_control.value-scene.blend)<.011)
	check("raw label actual mode",scene.summary_label.text.contains("Raw（未校脚）"))
	await capture("raw")
	scene.contact_control.button_pressed=true
	await ticks(120)
	check("contact checkbox actual mode",scene.contact_control.button_pressed and scene.contact_corrected and scene.enable_control.button_pressed and scene.external_enabled)
	check("contact label actual mode",scene.summary_label.text.contains("源上身 + 原接触腿覆盖"))
	check("contact slider actual blend",absf(scene.blend_control.value-scene.blend)<.011)
	scene.enable_control.button_pressed=false
	await ticks(4)
	check("cancel checkbox actual mode",not scene.enable_control.button_pressed and not scene.external_enabled)
	check("cancel returned original controller",not scene.actor.scripted and scene.actor.requested_move==Vector2.ZERO)
	check("cancel label actual mode",scene.summary_label.text.contains("外部已停 · 现有控制"))
	var wave=scene.character_action("wave")
	await ticks(100)
	check("original wave works after return",wave.ok and scene.actor.rig.wave>.01)
	var pickup=scene.character_action("pickup")
	check("pickup still explicitly rejected",not pickup.ok and pickup.code=="character_action_not_available")
	await capture("cancel-original-wave")
	scene.character_action("cancel")
	var ok=true
	for row in checks:ok=ok and row.pass
	var report={"ok":ok,"engine":Engine.get_version_info(),"display":DisplayServer.get_name(),"checks":checks,"source_pose_overrides_active":scene.external_enabled,"original_wave_after_cancel":wave,"pickup":pickup,"runtime_seconds":scene.clock,"fixed_fps_test_only":true,"notes":"Separate bounded UI/state regression; source mesh stays hidden, target current files unchanged"}
	FileAccess.open("res://reviews/external-motion/ui-check.json",FileAccess.WRITE).store_string(JSON.stringify(report,"\t"))
	print("EXTERNAL_UI_CHECK ",JSON.stringify(report));quit(0 if ok else 1)
