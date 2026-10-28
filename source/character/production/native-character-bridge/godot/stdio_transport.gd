extends Node
## stdin is read exclusively by one bounded worker; scene access stays main-thread.
## Parent MUST close stdin during shutdown. Window close requests ask the runner
## to do this; do not directly free this node while its input pipe is open.
const PREFIX: String = "@DAFEIYU/1 "
const MAX_LINE_BYTES: int = 4096
const MAX_QUEUED: int = 64
const MAX_PER_SECOND: int = 30
const CharacterProtocol = preload("./character_protocol.gd")
var receiver: Callable
var exit_code: int = 0
var _worker: Thread = Thread.new()
var _mutex: Mutex = Mutex.new()
var _lines: Array[String] = []
var _reader_done: bool = false
var _close_requested: bool = false
var _window_ms: int = 0
var _window_count: int = 0
var _overflow: bool = false

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	get_tree().auto_accept_quit = false
	get_tree().root.close_requested.connect(request_shutdown)
	var error: int = _worker.start(_read_stdin)
	if error != OK:
		_emit({"event":"fatal", "error":"stdin_thread_failed"})
		get_tree().quit(2)
		return
	_emit({"event":"ready", "protocol":"dafeiyu.ipc.v1", "engine":Engine.get_version_info().get("string", "unknown")})

func _queue(line: String) -> void:
	_mutex.lock()
	if _lines.size() < MAX_QUEUED: _lines.append(line)
	else: _overflow = true
	_mutex.unlock()

func _read_stdin() -> void:
	var bytes: PackedByteArray = PackedByteArray()
	var dropping: bool = false
	while true:
		# Pipe reads request exactly 1 byte: a 1024-byte read would wait for
		# 1024 bytes and stall small JSONL messages on Windows.
		var chunk: PackedByteArray = OS.read_buffer_from_stdin(1)
		if chunk.is_empty(): break
		var value: int = int(chunk[0])
		if value == 10:
			if dropping: _queue("!line_too_long")
			else: _queue(bytes.get_string_from_utf8().trim_suffix("\r"))
			bytes.clear()
			dropping = false
		elif not dropping:
			if bytes.size() >= MAX_LINE_BYTES:
				dropping = true
				bytes.clear()
			else: bytes.append(value)
	# A partial final line is rejected, never treated as a completed command.
	if not bytes.is_empty() or dropping: _queue("!truncated_line")
	_mutex.lock()
	_reader_done = true
	_mutex.unlock()

func _emit(value: Dictionary) -> void:
	print(PREFIX + JSON.stringify(value))

func _handle(line: String) -> void:
	if line.begins_with("!"):
		_emit({"event":"rejected", "error":line.substr(1)})
		return
	if not line.begins_with(PREFIX):
		_emit({"event":"rejected", "error":"missing_prefix"})
		return
	var json: JSON = JSON.new()
	if json.parse(line.substr(PREFIX.length())) != OK or not json.data is Dictionary:
		_emit({"event":"rejected", "error":"invalid_json"})
		return
	var frame: Dictionary = json.data
	var id_value: Variant = frame.get("id")
	if not (id_value is float or id_value is int) or not is_finite(float(id_value)) or float(id_value) != floor(float(id_value)) or float(id_value) < 1 or float(id_value) > 2147483647:
		_emit({"event":"rejected", "error":"invalid_id"})
		return
	var id: int = int(id_value)
	if frame.size() != 2 or not frame.has("payload") or not frame.payload is Dictionary:
		_emit({"id":id, "ok":false, "error":"invalid_envelope"})
		return
	var payload: Dictionary = frame.payload
	if payload == {"schema":"dafeiyu.ipc.v1", "type":"bridge.close"}:
		_close_requested = true
		_emit({"id":id, "ok":true, "applied":"bridge.close"})
		return
	var now: int = Time.get_ticks_msec()
	if now - _window_ms >= 1000: _window_ms = now; _window_count = 0
	_window_count += 1
	if _window_count > MAX_PER_SECOND:
		_emit({"id":id, "ok":false, "error":"rate_limited"})
		return
	# Godot JSON decodes numbers as float. Preserve the protocol's integer
	# contract by normalizing only exact finite integer approval counts.
	if payload.has("approvals") and payload.approvals is float and is_finite(payload.approvals) and payload.approvals == floor(payload.approvals):
		payload.approvals = int(payload.approvals)
	var result: Dictionary = CharacterProtocol.validate(payload)
	if not result.ok:
		_emit({"id":id, "ok":false, "error":result.error})
		return
	if _close_requested:
		_emit({"id":id, "ok":false, "error":"closing"})
		return
	if receiver.is_valid():
		var applied: Variant = receiver.call(payload)
		if not applied is Dictionary or applied.get("ok") != true:
			_emit({"id":id, "ok":false, "error":"receiver_rejected"})
			return
	_emit({"id":id, "ok":true, "accepted":result})

func _process(_delta: float) -> void:
	_mutex.lock()
	var lines: Array[String] = _lines.duplicate()
	_lines.clear()
	var done: bool = _reader_done
	var overflow: bool = _overflow
	_overflow = false
	_mutex.unlock()
	for line in lines: _handle(line)
	if overflow: _emit({"event":"rejected", "error":"queue_overflow"})
	if done:
		if _worker.is_started(): _worker.wait_to_finish()
		_emit({"event":"closed", "reason":"stdin_eof"})
		get_tree().quit(exit_code)

func request_shutdown(reason: String = "window_close") -> void:
	if not _close_requested:
		_close_requested = true
		_emit({"event":"closing", "reason":reason})

func _exit_tree() -> void:
	# With the controlled runner EOF precedes quit, so this join cannot hang.
	if _worker.is_started() and not _worker.is_alive(): _worker.wait_to_finish()
