extends SceneTree
## This process only imports its own independent source instance, never user windows.
const DIRECTORY="res://selected-production/components/headband-v2"
var asset:RefCounted
var model:Node3D
var factory:RefCounted
var failures:Array=[]
var checks:Dictionary={}
var report:Dictionary={}
var capture=false

func check(label:String,condition:bool)->void:
	checks[label]=condition
	if not condition:failures.append(label);push_error(label)

func meshes(node:Node)->Array:
	var result:Array=[]
	if node is MeshInstance3D:result.append(node)
	for child in node.get_children():result.append_array(meshes(child))
	return result

func visibility(nodes:Array)->Dictionary:
	var result={}
	for node in nodes:result[node.get_instance_id()]=node.visible
	return result

func _initialize()->void:
	call_deferred("run")

func run()->void:
	capture="--capture" in OS.get_cmdline_user_args()
	var stage=Node3D.new();root.add_child(stage)
	root.transparent_bg=true
	asset=load("res://motion_asset.gd").new();model=asset.load_selected()
	check("selected_source_imported",model!=null)
	if model==null:finish();return
	stage.add_child(model);asset.renderer.apply_source_materials(model)
	check("selected_source_materials",not asset.renderer.failed)
	var head=model.find_child("head-control",true,false) as Node3D
	check("original_head_found",head!=null)
	if head==null:finish();return
	var source_nodes=meshes(model);var baseline=visibility(source_nodes)
	factory=load(DIRECTORY+"/factory.gd").new()
	var built:Dictionary=factory.setup(head,asset.renderer)
	check("setup_ok",built.get("ok",false))
	if not built.get("ok",false):
		report.setup=built;report.headMeshNames=[]
		for node in meshes(head):report.headMeshNames.append({"node":str(node.name),"mesh":str(node.mesh.resource_name)})
		finish();return
	report.component=built.contract.id;report.import=built.import
	check("setup_does_not_hide_source",visibility(source_nodes)==baseline)
	check("setup_prepares_hidden_unparented_identity",not built.model.visible and built.model.get_parent()==null and built.model.transform.is_equal_approx(Transform3D.IDENTITY))
	var original_names=JSON.parse_string(FileAccess.get_file_as_string(DIRECTORY+"/geometry-contract.json")).attach.replaces
	var expected={}
	for node in source_nodes:
		for wanted in original_names:
			if factory.matches_original_mesh(node,str(wanted)):expected[node.get_instance_id()]=true
	check("seven_exact_original_resource_names",expected.size()==7)
	# Missing Head must fail without changing source; no partial install.
	var wrong_head=Node3D.new();stage.add_child(wrong_head)
	var rejected=load(DIRECTORY+"/factory.gd").new();var rejected_result=rejected.setup(wrong_head,asset.renderer)
	check("invalid_parent_rejected",not rejected_result.get("ok",false))
	check("failed_setup_source_unchanged",visibility(source_nodes)==baseline)
	rejected.dispose();wrong_head.free()
	var original_child_count=head.get_child_count()
	var installed:Dictionary=factory.commit()
	check("commit_ok",installed.get("ok",false))
	check("single_head_parent_identity",built.model.get_parent()==head and built.model.transform.is_equal_approx(Transform3D.IDENTITY) and head.get_child_count()==original_child_count+1)
	var changed=[];var untouched=true
	for node in source_nodes:
		if expected.has(node.get_instance_id()):
			if node.visible:untouched=false
			changed.append(str(node.mesh.resource_name))
		elif node.visible!=baseline[node.get_instance_id()]:untouched=false
	check("only_seven_original_meshes_hidden",untouched and changed.size()==7)
	report.original_meshes_hidden=changed
	var again=factory.commit()
	check("commit_idempotent_no_double_parent",again.get("ok",false) and head.get_child_count()==original_child_count+1)
	var original_head_transform=head.transform
	head.rotate_y(0.2)
	check("head_motion_applied_once",built.model.global_transform.is_equal_approx(head.global_transform))
	head.transform=original_head_transform
	if capture:
		var camera=Camera3D.new();stage.add_child(camera);camera.projection=Camera3D.PROJECTION_ORTHOGONAL;camera.size=3.5397;camera.near=.01;camera.far=30;camera.current=true
		var environment=WorldEnvironment.new();environment.environment=Environment.new();environment.environment.background_mode=Environment.BG_CLEAR_COLOR;environment.environment.tonemap_mode=Environment.TONE_MAPPER_LINEAR;stage.add_child(environment)
		for angle in [0,45,90,180]:
			var rad=deg_to_rad(float(angle));camera.position=Vector3(.195+6*sin(rad),.565,6*cos(rad));camera.look_at(Vector3(.195,.565,0))
			for frame in range(5):await RenderingServer.frame_post_draw
			check("gpu_capture_"+str(angle),root.get_texture().get_image().save_png(DIRECTORY+"/reports/headband-v2-current-sha-"+str(angle)+".png")==OK)
		report.capturedAngles=[0,45,90,180];report.renderingMethod=RenderingServer.get_current_rendering_method();report.renderingDevice=RenderingServer.get_video_adapter_name()
	factory.dispose();factory.dispose()
	check("dispose_restores_source_visibility",visibility(source_nodes)==baseline)
	check("dispose_releases_owned_model",factory.model==null and head.get_child_count()==original_child_count)
	check("host_texture_survives_dispose",asset.renderer.source_textures[0]!=null and asset.renderer.source_textures[0].get_width()==1920)
	# Check preservation of a source mesh that was hidden before installation.
	var initially_hidden:MeshInstance3D
	for node in source_nodes:
		if expected.has(node.get_instance_id()):initially_hidden=node;break
	initially_hidden.visible=false
	var second=load(DIRECTORY+"/factory.gd").new();var second_result=second.setup(head,asset.renderer)
	check("second_setup_ok",second_result.get("ok",false))
	if second_result.get("ok",false):check("second_commit_ok",second.commit().get("ok",false))
	second.dispose();check("dispose_preserves_preexisting_hidden_state",not initially_hidden.visible)
	initially_hidden.visible=baseline[initially_hidden.get_instance_id()]
	finish()

func finish()->void:
	report.schema="dafeiyu.headband-v2.component-import-lifecycle.v1"
	report.completed=true;report.pass=failures.is_empty();report.checks=checks;report.failures=failures
	report.engine=Engine.get_version_info();report.gpu=capture;report.clothPhysics=false
	report.scope="Current frozen GLB import, exact attributes and visibility/dispose checks; static GPU angles if requested. Partial improvement, not final visual or physics acceptance."
	report.finalAccepted=false
	var filename="gpu-import-report.json" if capture else "lifecycle-report.json"
	var file=FileAccess.open(DIRECTORY+"/reports/"+filename,FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"));file.close()
	print("HEADBAND_COMPONENT_CHECK ",JSON.stringify(report))
	if factory!=null:factory.dispose();factory=null
	if is_instance_valid(model):model.free();model=null
	if asset!=null:asset.dispose();asset=null
	quit(0 if failures.is_empty() else 1)
