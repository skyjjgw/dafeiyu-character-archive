extends Node
var state: Dictionary = {}
var behavior: String = "idle"
func _ready() -> void:
	var transport = load("res://stdio_transport.gd").new()
	transport.receiver = receive_character_message
	add_child(transport)
func receive_character_message(payload: Dictionary) -> Dictionary:
	if payload.type == "character.state":
		state.merge(payload, true)
	else:
		behavior = str(payload.action)
	return {"ok":true, "applied":payload.type}
