extends RefCounted
const INK=preload("res://scripts/outline_policy.gd")

static func apply(root: Node, manifest: Dictionary) -> Dictionary:
	var palette: Dictionary = manifest.get("materials", {})
	var bound: Array = []
	var pending: Array[Node] = [root]
	while not pending.is_empty():
		var node: Node = pending.pop_back()
		pending.append_array(node.get_children())
		if not node is MeshInstance3D or node.mesh == null:
			continue
		for surface in node.mesh.get_surface_count():
			var original: Material = node.get_active_material(surface)
			var name := original.resource_name if original else ""
			var arrays: Array = node.mesh.surface_get_arrays(surface)
			if name.begins_with("Eye."):
				var material := ShaderMaterial.new()
				material.shader = load("res://shaders/native_iris.gdshader")
				var normals: PackedVector3Array = arrays[Mesh.ARRAY_NORMAL]
				var uv: PackedVector2Array = arrays[Mesh.ARRAY_TEX_UV]
				var best := -INF
				var center := Vector2(0.25,0.5)
				for i in mini(normals.size(), uv.size()):
					var score: float = (node.global_basis * normals[i]).normalized().dot(Vector3(0,0,1))
					if score > best:
						best = score
						center = uv[i]
				material.set_shader_parameter("iris_center", center)
				node.set_surface_override_material(surface, material)
				bound.append({"mesh":str(node.name),"source_material":name,"shader":"native_iris","center_uv":[center.x,center.y]})
				continue
			var data: Array = palette.get(name, {}).get("baseColor", [0.35,0.38,0.45,1.0])
			var color := Color(data[0],data[1],data[2],1)
			var material := ShaderMaterial.new()
			material.resource_name=name
			material.shader = load("res://shaders/native_toon.gdshader")
			var skin:=name.begins_with("Face /") or name.begins_with("Lips /") or name=="Dafeiyu skin"
			if skin: material.shader=load("res://shaders/native_skin.gdshader")
			if skin: color=Color(201.0/255,185.0/255,170.0/255,1).srgb_to_linear()
			var colors = arrays[Mesh.ARRAY_COLOR]
			var vertex_weight := 0.0
			if colors != null and colors.size() > 0:
				vertex_weight = 1.0
			var albedo_rule: String=str(palette.get(name,{}).get("vertexAlbedoRule","multiply"))
			if albedo_rule=="replace" and vertex_weight>0.0:
				color=Color.WHITE
			material.set_shader_parameter("base_linear", Vector4(color.r,color.g,color.b,1.0))
			material.set_shader_parameter("vertex_color_weight", vertex_weight)
			material.set_shader_parameter("is_skin",skin)
			var outline := ShaderMaterial.new()
			outline.shader = load("res://shaders/outline.gdshader")
			var ink_width:=INK.width(str(node.name),name)
			outline.set_shader_parameter("outline_width",ink_width)
			if ink_width>0: material.next_pass=outline
			node.set_surface_override_material(surface,material)
			bound.append({"mesh":str(node.name),"source_material":name,"shader":"native_toon","vertex_color":vertex_weight>0.0,"vertex_albedo_rule":albedo_rule,"outline_width":ink_width})
	return {"surfaces":bound,"image_cards":false,"scope":"Native mesh shaders; visual acceptance pending"}
