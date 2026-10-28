extends RefCounted

const SOURCE="E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-body/garment-production/assets/"
var spec:Dictionary
var bytes:PackedByteArray

func _init()->void:
	spec=JSON.parse_string(FileAccess.get_file_as_string(SOURCE+"component.json"))
	bytes=FileAccess.get_file_as_bytes(SOURCE+"component.bin")

func data(name:String)->Variant:
	var a=spec.arrays[name];var raw=bytes.slice(int(a.offset),int(a.offset)+int(a.bytes))
	if a.type=="float32":return raw.to_float32_array()
	if a.type=="uint32":return raw.to_int32_array()
	return null

func garment(id:String)->Dictionary:
	var layer:Dictionary
	for candidate in spec.layers:
		if candidate.id==id:layer=candidate
	var raw:PackedFloat32Array=data(layer.solver.positionsNeutralRoot);var points=PackedVector3Array()
	for i in raw.size()/3:points.append(.35*(Vector3(raw[i*3],raw[i*3+1],raw[i*3+2])+Vector3(0,1.055,0)))
	return {"name":id,"points":points,"indices":data(layer.solver.triangles),"pins":data(layer.solver.waistPins),"mass":.08 if id=="outer" else .035,"k":.00005 if id=="outer" else .00007,"c":.0000002}

func grid(width:int)->Dictionary:
	var points=PackedVector3Array();var indices=PackedInt32Array();var pins=PackedInt32Array()
	for row in width:
		for col in width:points.append(Vector3(-.1+.2*col/(width-1),.8,.2*row/(width-1)))
	# Two fixed rows, matching the official Jolt cantilever boundary; a single
	# straight pinned edge admits a free rigid rotation and cannot test support.
	for col in width*2:pins.append(col)
	for row in width-1:
		for col in width-1:
			var a=row*width+col;var b=a+1;var c=a+width;var d=c+1;indices.append_array(PackedInt32Array([a,b,c,b,d,c]))
	return {"name":"grid"+str(width),"points":points,"indices":indices,"pins":pins,"mass":.008,"k":.0005,"c":.0000002}

func inverse_masses(fixture:Dictionary)->PackedFloat64Array:
	var result=PackedFloat64Array();result.resize(fixture.points.size());result.fill(fixture.points.size()/fixture.mass)
	for id in fixture.pins:result[id]=0
	return result

func official_grid()->Dictionary:
	var raw:Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://official-jolt-fixture.json"));var points=PackedVector3Array()
	for row in raw.points:points.append(Vector3(row[0],row[1],row[2]))
	raw.points=points;raw.indices=PackedInt32Array(raw.indices);raw.pins=PackedInt32Array(raw.pins);return raw

static func triples(points:PackedVector3Array)->Array:
	var result=[]
	for p in points:result.append([p.x,p.y,p.z])
	return result

static func write_report(path:String,report:Dictionary)->void:
	var file=FileAccess.open(path,FileAccess.WRITE);file.store_string(JSON.stringify(report,"\t"))
