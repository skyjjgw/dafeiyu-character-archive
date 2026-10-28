extends RefCounted

static var enabled: bool=OS.get_cmdline_user_args().has("--profile")
static var samples: Dictionary={}

static func begin() -> int: return Time.get_ticks_usec() if enabled else 0
static func end(label: String,start: int) -> void:
	if start<=0: return
	if not samples.has(label): samples[label]=[]
	samples[label].append(float(Time.get_ticks_usec()-start))
static func reset() -> void: samples.clear()
static func summary() -> Dictionary:
	var result: Dictionary={}
	for label in samples:
		var values: Array=samples[label].duplicate()
		values.sort()
		var total:=0.0
		for value in values: total+=value
		result[label]={"calls":values.size(),"mean_us":total/maxi(1,values.size()),"p95_us":values[mini(values.size()-1,int(values.size()*.95))],"max_us":values.back(),"total_us":total}
	return result
