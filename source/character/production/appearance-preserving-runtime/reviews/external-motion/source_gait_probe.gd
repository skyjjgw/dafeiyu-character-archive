extends SceneTree
func _initialize()->void:call_deferred("run")
func run()->void:
	var source=load("res://reviews/external-motion/source_gait.gd").new()
	var result:Dictionary=source.setup(root)
	FileAccess.open("res://reviews/external-motion/source-gait.json",FileAccess.WRITE).store_string(JSON.stringify(result,"\t"))
	print("SOURCE_GAIT_PROBE ",JSON.stringify(result.get("summary",{})))
	source.dispose();quit(0 if result.get("ok",false) else 1)
