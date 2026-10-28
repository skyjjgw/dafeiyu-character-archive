extends SceneTree

func _initialize()->void:call_deferred("run")
func run()->void:
	load("res://selected_implicit_cloth.gdextension");var loader=load("res://probe_data.gd").new();var f=loader.grid(4);var inv=loader.inverse_masses(f);var cases={};var all_ok=true
	for cycle in 8:
		var kernel=ClassDB.instantiate("SelectedImplicitClothBending");var zero=PackedVector3Array();zero.resize(f.points.size())
		cases["configure_"+str(cycle)]=kernel.configure(f.points,f.indices,inv,f.k,f.c,256,1e-8).ok
		cases["invalid_dt_"+str(cycle)]=not kernel.step(f.points,zero,0).ok
		var collapsed=f.points.duplicate();collapsed[1]=collapsed[0];cases["degenerate_"+str(cycle)]=not kernel.step(collapsed,zero,1.0/240).ok
		var nonfinite=f.points.duplicate();nonfinite[5]=Vector3(INF,0,0);cases["nonfinite_"+str(cycle)]=not kernel.step(nonfinite,zero,1.0/240).ok
		var recovery:Dictionary=kernel.step(f.points,zero,1.0/240);cases["recovery_"+str(cycle)]=recovery.ok and recovery.max_impulse_ns==0
		cases["reconfigure_"+str(cycle)]=kernel.configure(f.points,f.indices,inv,f.k,0,256,1e-8).ok
		kernel=null
	for result in cases.values():all_ok=all_ok and result
	loader.write_report("res://../reports/boundary-regression.json",{"completed":true,"pass":all_ok,"cycles":8,"checks":cases,"worker_threads":0,"scope":"Explicit failure/no output on invalid input, valid retry/reconfigure, RefCounted destruction"});print("BOUNDARY_REGRESSION ",all_ok);quit(0 if all_ok else 1)
