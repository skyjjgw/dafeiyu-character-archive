extends SceneTree
func _initialize() -> void:
	var bone:=PhysicalBone3D.new()
	bone.joint_type=PhysicalBone3D.JOINT_TYPE_6DOF
	var properties: Array=[]
	for item in bone.get_property_list():
		if str(item.name).contains("joint_constraints"): properties.append(str(item.name))
	print(JSON.stringify(properties))
	bone.free()
	quit()
