extends RefCounted

var manifest:Dictionary={}
var states:Dictionary={}
var errors:Array=[]
var disposed=false

func verify()->Dictionary:
	var value=JSON.parse_string(FileAccess.get_file_as_string("res://selected-production/component-manifest.json"))
	if not value is Dictionary:return {"ok":false,"error":"Component manifest missing or invalid"}
	manifest=value
	if manifest.schema!="dafeiyu.selected-production.components.v1":return {"ok":false,"error":"Unsupported component schema"}
	for component in manifest.components:
		var valid=true
		for file in component.files:
			if not FileAccess.file_exists(file.path):errors.append({"component":component.id,"file":file.path,"error":"missing"});valid=false;continue
			var bytes=FileAccess.get_file_as_bytes(file.path)
			var hash=HashingContext.new();hash.start(HashingContext.HASH_SHA256);hash.update(bytes)
			if bytes.size()!=int(file.bytes) or hash.finish().hex_encode()!=file.sha256:errors.append({"component":component.id,"file":file.path,"error":"hash mismatch"});valid=false
		states[component.id]={"status":"verified" if valid else "failed","loaded":false,"finalAccepted":false}
	return {"ok":errors.is_empty(),"errors":errors,"version":manifest.version}

func loaded(id:String,details:Dictionary={})->void:
	if not states.has(id):errors.append({"component":id,"error":"unregistered component"});return
	if states[id].status!="verified":errors.append({"component":id,"error":"cannot load unverified component"});return
	states[id]={"status":"loaded","loaded":true,"finalAccepted":false,"details":details}

func all_required_loaded()->bool:
	if disposed or not errors.is_empty() or manifest.is_empty():return false
	for component in manifest.components:
		if component.required and not states[component.id].loaded:
			var replacement=str(states[component.id].get("replaced_by",""))
			if replacement.is_empty() or not states.has(replacement) or not states[replacement].loaded:return false
	return true

func verify_external(contract:Dictionary)->Dictionary:
	var id=str(contract.get("id",""));var allowed=false
	for reserved in manifest.get("reservedComponents",[]):
		if reserved.id==id:allowed=true
	for component in manifest.get("components",[]):
		if component.id==id and id in ["continuous-head-v3","headband-continuous-shell","selected-hair-continuous","selected-garment-cloth"]:allowed=true
	if not allowed:return {"ok":false,"code":"component_not_reserved","id":id}
	if contract.get("files",[]).is_empty():return {"ok":false,"code":"component_files_missing"}
	for row in contract.files:
		if not str(row.get("path","")).begins_with("res://") or not FileAccess.file_exists(row.path):return {"ok":false,"code":"component_file_missing","file":row.get("path","")}
		var bytes=FileAccess.get_file_as_bytes(row.path);var digest=HashingContext.new();digest.start(HashingContext.HASH_SHA256);digest.update(bytes)
		if bytes.size()!=int(row.bytes) or digest.finish().hex_encode()!=str(row.sha256):return {"ok":false,"code":"component_hash_mismatch","file":row.path}
	return {"ok":true,"id":id}

func replace_active(old_id:String,new_id:String,details:Dictionary)->void:
	states[old_id]={"status":"replaced","loaded":false,"replaced_by":new_id,"finalAccepted":false}
	states[new_id]={"status":"loaded","loaded":true,"details":details,"finalAccepted":false}

func restore_active(old_id:String,new_id:String,details:Dictionary)->void:
	states[old_id]={"status":"loaded","loaded":true,"details":details,"finalAccepted":false}
	states[new_id]={"status":"disposed","loaded":false,"finalAccepted":false}

func external_loaded(id:String,details:Dictionary)->void:
	states[id]={"status":"loaded","loaded":true,"details":details,"finalAccepted":false}

func external_disposed(id:String)->void:
	states[id]={"status":"disposed","loaded":false,"finalAccepted":false}

func snapshot()->Dictionary:
	var pending=[]
	for row in manifest.get("reservedComponents",[]):
		if not states.has(row.id) or not states[row.id].loaded:pending.append(row)
	return {"version":manifest.get("version",""),"status":manifest.get("status",""),"all_required_loaded":all_required_loaded(),"states":states.duplicate(true),"reserved_not_loaded":pending,"errors":errors.duplicate(true),"disposed":disposed,"final_accepted":false}

func dispose()->void:
	disposed=true
	for id in states:states[id].loaded=false;states[id].status="disposed"
