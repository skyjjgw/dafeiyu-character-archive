extends RefCounted

static func width(mesh_name: String,material_name: String="") -> float:
	var mesh:=mesh_name.to_lower()
	var material:=material_name.to_lower()
	for detail in ["whale embroidery","flounced chest bib","apron continuous","placket","button","bezel","collar","shoulder strap","stitch","inner facing"]:
		if mesh.contains(detail): return 0.0
	for detail in ["lash","lid","brow","lips","mouth"]:
		if material.contains(detail): return 0.0
	# Skin rims/eye holes and the known inverted legacy right palm must not
	# receive a full black hull. This does not mark that source topology fixed.
	if mesh.begins_with("headskin") or mesh.begins_with("body "): return 0.0
	if mesh.contains("skirt"): return .0018
	if mesh.contains("apron"): return .0010
	if mesh.contains("sleeve"): return .0012
	if mesh.contains("cuff"): return .0008
	return .0025
