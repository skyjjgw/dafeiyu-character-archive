extends CharacterBody3D

var rig:RefCounted
var asset:RefCounted
var holder:Node3D
var neutral_soles:Dictionary={}
var foot_states:Dictionary={}
var active_side=""
var next_side="left"
var swing_age=0.0
var swing_duration=.48
var swing_start:Transform3D
var swing_flat:Transform3D
var desired_heading=0.0
var angular_velocity=0.0
var acceleration=Vector3.ZERO
var anticipation=0.0
var action="idle"
var action_age=0.0
var requested_move=Vector2.ZERO
var requested_turn=0.0
var queue:Array=[]
var queue_age=0.0
var queue_started=false
var scripted=false
var events:Array=[]
var age=0.0
var steps=0
var floor_contacts=0
var max_acceleration=0.0
var max_jerk=0.0
var pose_callback:Callable
var physics_times:Array=[]
var last_status="就绪 · 原有手部没有独立手指关节"
var pelvis_shift=Vector2.ZERO
var pelvis_shift_velocity=Vector2.ZERO
var root_head_collision:CollisionShape3D

func configure(source_asset:RefCounted)->bool:
	asset=source_asset
	name="SelectedCharacterController"
	collision_layer=4;collision_mask=1|2
	floor_snap_length=.04;safe_margin=.0005
	var collision=CollisionShape3D.new();var shape=CapsuleShape3D.new();shape.radius=.115;shape.height=.66;collision.shape=shape;collision.position.y=.33;add_child(collision)
	root_head_collision=CollisionShape3D.new();var head_shape=SphereShape3D.new();head_shape.radius=.73*.35;root_head_collision.shape=head_shape;root_head_collision.position=Vector3(0,(1.1+.17+1.055)*.35,-.03*.35);add_child(root_head_collision)
	holder=Node3D.new();holder.name="OriginalSourceUnits";holder.scale=Vector3.ONE*float(asset.contract.metersPerSourceUnit);holder.position.y=float(asset.contract.modelLiftSourceUnits)*float(asset.contract.metersPerSourceUnit);add_child(holder)
	holder.add_child(asset.model)
	asset.renderer.apply_source_materials(asset.model)
	if asset.renderer.failed:return false
	rig=load("res://motion_rig.gd").new()
	if not rig.configure(self,asset.model,asset.contract):return false
	for side in rig.feet:
		var point:Vector3=rig.sole_point(side)
		neutral_soles[side]=to_local(point)
		foot_states[side]={"flat":rig.feet[side].pose,"age":1.0,"pitch":0.0}
	configure_inputs()
	return true

func configure_inputs()->void:
	for row in [["walk_forward",KEY_W],["walk_back",KEY_S],["walk_left",KEY_A],["walk_right",KEY_D],["turn_left",KEY_Q],["turn_right",KEY_E],["motion_cancel",KEY_ESCAPE],["motion_wave",KEY_1]]:
		if not InputMap.has_action(row[0]):InputMap.add_action(row[0])
		var event=InputEventKey.new();event.physical_keycode=row[1];InputMap.action_add_event(row[0],event)

func request_wave()->void:
	action="wave";action_age=0
	rig.attend(global_position+global_basis*Vector3(-.38,.8,1.0))
	last_status="看向目标，然后抬手招呼"
	events.append({"event":"wave_requested","time":age})

func cancel(reason="cancel")->void:
	queue.clear();scripted=false;requested_move=Vector2.ZERO;requested_turn=0
	action="idle";desired_heading=rotation.y+angular_velocity*absf(angular_velocity)/(2.0*1.7)
	rig.attention_active=false
	last_status="已中断 · 从当前姿态平滑收回"
	events.append({"event":"cancel","reason":reason,"time":age,"wave":rig.wave,"velocity":velocity})

func action_check()->void:
	cancel("new_check")
	queue=[{"duration":.5,"look":true},{"duration":1.35,"wave":true},{"duration":.85,"cancel":true},{"duration":1.45,"move":Vector2(0,-1)},{"duration":.8},{"duration":3.8,"turn_angle":PI*.5},{"duration":1.1,"move":Vector2(0,1)},{"duration":1.0}]
	queue_age=0;queue_started=false;scripted=true
	last_status="动作检查运行中 · Esc 可随时中断"
	events.append({"event":"check_started","time":age})

func _unhandled_key_input(event:InputEvent)->void:
	if event.is_action_pressed("motion_cancel"):cancel()
	if event.is_action_pressed("motion_wave"):cancel("manual_wave");request_wave()

func queue_input(delta:float)->void:
	if not scripted or queue.is_empty():return
	var command:Dictionary=queue[0]
	if not queue_started:
		queue_started=true
		if command.has("look"):rig.attend(global_position+global_basis*Vector3(-.38,.8,1.0))
		if command.has("look"):last_status="先看向目标"
		if command.has("wave"):request_wave()
		if command.has("cancel"):action="idle";rig.attention_active=false;last_status="从当前姿态平滑收回";events.append({"event":"check_cancel","time":age,"wave":rig.wave})
		if command.has("turn_angle"):desired_heading=rotation.y+float(command.turn_angle);last_status="换脚转身"
		if command.has("move"):last_status="检查起步与停步" if command.move.y<0 else "回退并收步"
		if command.is_empty() or (command.size()==1 and command.has("duration")):last_status="停步并站稳"
	requested_move=command.get("move",Vector2.ZERO)
	requested_turn=0
	queue_age+=delta
	if queue_age>=float(command.duration):
		queue.pop_front();queue_age=0;queue_started=false
		if queue.is_empty():scripted=false;requested_move=Vector2.ZERO;last_status="动作检查结束 · 可查看详情记录";events.append({"event":"check_finished","time":age})

func needs_step(move:Vector2)->bool:
	if move.length()>.02 or Vector2(velocity.x,velocity.z).length()>.012 or absf(angle_difference(rotation.y,desired_heading))>.025:return true
	for side in rig.feet:
		var ideal:Vector3=global_transform*neutral_soles[side]
		var actual:Vector3=rig.sole_point(side)
		if Vector2(ideal.x-actual.x,ideal.z-actual.z).length()>.008:return true
	return false

func begin_step()->void:
	active_side=next_side;next_side="right" if next_side=="left" else "left"
	swing_age=0;swing_start=rig.feet[active_side].pose
	var planned_heading=rotation.y+clampf(angle_difference(rotation.y,desired_heading),-.28,.28)
	var basis=Basis(Vector3.UP,planned_heading)
	var point:Vector3=global_position+basis*neutral_soles[active_side]+Vector3(velocity.x,0,velocity.z)*.20
	var input_world=global_basis*Vector3(requested_move.x,0,-requested_move.y)
	point+=input_world*.027
	point.y=ground_height(point)
	swing_flat=rig.sole_pose(active_side,point,basis)
	rig.feet[active_side].support=false
	steps+=1
	events.append({"event":"step_begin","side":active_side,"time":age,"target":point,"turn":planned_heading})

func ground_height(point:Vector3)->float:
	var query=PhysicsRayQueryParameters3D.create(point+Vector3.UP*.25,point+Vector3.DOWN*.4,1,[get_rid()])
	var hit=get_world_3d().direct_space_state.intersect_ray(query)
	return float(hit.position.y) if not hit.is_empty() else 0.0

func pivot_pose(side:String,flat:Transform3D,pivot:String,pitch:float)->void:
	var local:Vector3=rig.feet[side][pivot]*rig.unit
	var anchor=flat*local
	var basis=flat.basis*Basis(Vector3.RIGHT,pitch)
	rig.feet[side].pose=Transform3D(basis,anchor-basis*local)
	rig.feet[side].pivot=pivot;rig.feet[side].anchor=anchor;rig.feet[side].support=true

func step_feet(delta:float)->void:
	for side in foot_states:foot_states[side].age+=delta
	if active_side!="":
		swing_age+=delta
		var t=clampf(swing_age/swing_duration,0,1);var smooth=rig.smooth(t)
		var landing=Transform3D(swing_flat.basis*Basis(Vector3.RIGHT,-.14),swing_flat.origin)
		var heel:Vector3=rig.feet[active_side].heel*rig.unit
		landing.origin=(swing_flat*heel)-landing.basis*heel
		var pose=swing_start.interpolate_with(landing,smooth)
		pose.origin.y+=.043*16*t*t*(1-t)*(1-t)
		rig.feet[active_side].pose=pose
		if t>=1:
			foot_states[active_side].flat=swing_flat;foot_states[active_side].age=0;foot_states[active_side].pitch=-.14
			pivot_pose(active_side,swing_flat,"heel",-.14)
			events.append({"event":"heel_contact","side":active_side,"time":age})
			active_side=""
	for side in foot_states:
		if side==active_side:continue
		var state:Dictionary=foot_states[side]
		var elapsed=float(state.age)
		var pitch_goal=0.0
		if elapsed<.13:pitch_goal=-.14*(1-rig.smooth(elapsed/.13))
		elif active_side!="" and swing_age/swing_duration>.45:pitch_goal=.20*rig.smooth((swing_age/swing_duration-.45)/.55)
		state.pitch=move_toward(float(state.pitch),pitch_goal,1.9*delta)
		pivot_pose(side,state.flat,"heel" if state.pitch<-.00001 else "toe" if state.pitch>.00001 else "sole",state.pitch)

func _physics_process(delta:float)->void:
	if rig==null:return
	var started=Time.get_ticks_usec();age+=delta;action_age+=delta
	var keyboard=Input.get_vector("walk_left","walk_right","walk_forward","walk_back")
	var turn=Input.get_axis("turn_left","turn_right")
	if keyboard.length()>.01 or absf(turn)>.01:
		if scripted:cancel("keyboard_override")
		requested_move=keyboard;requested_turn=turn
		if action!="idle":action="idle"
	elif not scripted:requested_move=Vector2.ZERO;requested_turn=0
	queue_input(delta)
	desired_heading+=requested_turn*.65*delta
	var needed=needs_step(requested_move)
	anticipation=minf(anticipation+delta,.18) if needed else maxf(0,anticipation-delta)
	if active_side=="" and needed and anticipation>=.16:begin_step()
	var target_velocity=global_basis*Vector3(requested_move.x,0,-requested_move.y)*.16
	if anticipation<.16:target_velocity=Vector3.ZERO
	var desired_acceleration=(target_velocity-Vector3(velocity.x,0,velocity.z))*7.0
	desired_acceleration=desired_acceleration.limit_length(.7)
	var old_acceleration=acceleration
	acceleration=acceleration.move_toward(desired_acceleration,delta*3.0)
	velocity.x+=acceleration.x*delta;velocity.z+=acceleration.z*delta
	if not is_on_floor():velocity.y-=9.81*delta
	else:velocity.y=-.02;floor_contacts+=1
	var angular_goal=clampf(angle_difference(rotation.y,desired_heading)*3.0,-.65,.65) if active_side!="" else 0.0
	angular_velocity=move_toward(angular_velocity,angular_goal,1.7*delta)
	rotation.y+=angular_velocity*delta
	move_and_slide()
	step_feet(delta)
	var preparing=active_side if active_side!="" else next_side
	var support_sign=1.0 if preparing=="left" else -1.0
	var shift_goal=Vector2(support_sign*.055,-.025)*rig.smooth(anticipation/.16)
	pelvis_shift_velocity+=(shift_goal-pelvis_shift)*100.0*delta-pelvis_shift_velocity*20.0*delta
	pelvis_shift+=pelvis_shift_velocity*delta
	rig.begin_pose(pelvis_shift)
	rig.fit_support_height(delta,.002+.014*rig.smooth(anticipation/.16))
	rig.solve_legs()
	var offsets={}
	for side in rig.feet:
		var local=to_local(rig.sole_point(side));offsets[side]=(local.z-neutral_soles[side].z)/rig.unit
	rig.update_upper(delta,action_age,1.0 if action=="wave" and action_age>.25 else 0.0,offsets)
	if pose_callback.is_valid():pose_callback.call(rig.face_state(),delta)
	rig.sync_final_proxies()
	var actual_head=rig.skeleton.global_transform*rig.skeleton.get_bone_global_pose(rig.ids.chest)*rig.head.transform
	root_head_collision.global_position=actual_head*Vector3(0,.17,-.03)
	rig.measure(delta)
	max_acceleration=maxf(max_acceleration,acceleration.length());max_jerk=maxf(max_jerk,(acceleration-old_acceleration).length()/delta)
	physics_times.append((Time.get_ticks_usec()-started)/1000.0)
	if physics_times.size()>1200:physics_times.pop_front()

func snapshot()->Dictionary:
	return {"time":age,"position":global_position,"velocity":velocity,"acceleration":acceleration,"max_acceleration":max_acceleration,"max_jerk":max_jerk,"heading":rotation.y,"heading_target":desired_heading,"angular_velocity":angular_velocity,"steps":steps,"active_swing":active_side,"queue_remaining":queue.size(),"status":last_status,"pose":rig.last_pose,"events":events,"physics_ms_samples":physics_times,"limits":["Kinematic Jolt root contact plus IK supports; no active dynamic whole-body balance","Original one-bone hands have no finger grip","Hair and skirt remain source rest until real dynamics are fitted"]}
