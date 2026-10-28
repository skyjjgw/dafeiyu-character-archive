extends SceneTree

func _initialize() -> void: call_deferred("run")

func run() -> void:
	var main: Node3D=load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for i in 6: await physics_frame
	paused=true
	main.clothing.position_texture.update(main.clothing.position_image(main.clothing.rest))
	await RenderingServer.frame_post_draw
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("res://reports/cloth-bind-rest.png")
	for entry in main.clothing.bindings: entry.node.visible=false
	var pending: Array[Node]=[main.actor.visual]
	while not pending.is_empty():
		var node: Node=pending.pop_back()
		pending.append_array(node.get_children())
		if node is MeshInstance3D and not node.visible:
			node.visible=true
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png("res://reports/cloth-source-rest.png")
	print("Diagnostic only: material rest transfer compared to original source skin; physics paused for comparison")
	quit()
