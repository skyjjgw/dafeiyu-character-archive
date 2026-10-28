extends RefCounted

# Reserved in-process boundary. No socket, file access, shell, DSH administration,
# provider key, or speech channel is exposed by this character renderer.
static func validate(payload: Dictionary) -> Dictionary:
	if payload.get("schema")!="dafeiyu.character.v1": return {"ok":false,"error":"unsupported_schema"}
	var kind: String=str(payload.get("type",""))
	var allowed: Array=["schema","type","action"] if kind=="character.behavior" else ["schema","type","running","approvals","connected","error"]
	for key in payload:
		if not allowed.has(key): return {"ok":false,"error":"unsupported_field"}
	if kind=="character.behavior":
		if not ["wave","pickup","release","cancel"].has(payload.get("action")): return {"ok":false,"error":"unsupported_behavior"}
		return {"ok":true,"type":kind,"action":payload.action}
	if kind!="character.state": return {"ok":false,"error":"unsupported_type"}
	for key in ["connected","running"]:
		if payload.has(key) and not payload[key] is bool: return {"ok":false,"error":"invalid_state"}
	if payload.has("approvals") and (not payload.approvals is int or payload.approvals<0 or payload.approvals>10000): return {"ok":false,"error":"invalid_approvals"}
	if payload.has("error") and (not payload.error is String or payload.error.length()>200): return {"ok":false,"error":"invalid_error"}
	var state:=payload.duplicate()
	state.erase("schema")
	state.erase("type")
	return {"ok":true,"type":kind,"state":state}
