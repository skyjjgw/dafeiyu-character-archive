extends SceneTree
func _initialize()->void:
	var extension=load("E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-body/garment-implicit-kernel/component/selected_implicit_cloth.gdextension")
	var ok=extension!=null and ClassDB.class_exists("SelectedImplicitClothBending")
	if ok:
		var kernel=ClassDB.instantiate("SelectedImplicitClothBending");ok=kernel.get_metadata().output_units=="Impulse N*s; dt already integrated once; do not multiply dt again";kernel=null
	load("res://probe_data.gd").write_report("res://../reports/component-load.json",{"completed":true,"pass":ok,"scope":"Exact frozen component descriptor loads its relative-path DLL outside probe project; no product install"});print("COMPONENT_LOAD ",ok);quit(0 if ok else 1)
