"""Render an eight-second native preview without saving or changing the master.

Run with the project's Invoke-Blender.ps1 --background --python-exit-code 1
--python production/character3d/scripts/render_motion_preview.py.
"""
import bpy
import hashlib
import json
import math
import time
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
MASTER = PROJECT / 'dafeiyu-master-v1.blend'
OUTPUT = PROJECT / 'renders' / 'motion-preview.mp4'
MANIFEST = PROJECT / 'renders' / 'motion-preview-manifest.json'
FPS, FRAMES = 24, 192


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def ease(value):
    value = max(0.0, min(1.0, value))
    return value * value * (3 - 2 * value)


def envelope(t, start, end, fade=.25):
    return ease((t - start) / fade) * ease((end - t) / fade)


started = time.perf_counter()
original_hash = sha256(MASTER)
bpy.ops.wm.open_mainfile(filepath=str(MASTER))
scene = bpy.context.scene
assert bpy.app.build_options.codec_ffmpeg, 'This Blender needs FFmpeg support'
armatures = [obj for obj in bpy.data.objects if obj.type == 'ARMATURE']
assert len(armatures) == 1 and len(armatures[0].data.bones) == 40

# Play the actual imported actions through native NLA. Source keys were baked
# at 30fps; strip scaling preserves the original real-time motion at 24fps.
segments = [
    {'clip': 'idle', 'start': 1, 'source_frames': 45, 'seconds': 1.5},
    {'clip': 'wave', 'start': 37, 'source_frames': 75, 'seconds': 2.5},
    {'clip': 'turn', 'start': 97, 'source_frames': 120, 'seconds': 4.0},
]
segments_by_name = {item['clip']: item for item in segments}
configured = []
for obj in bpy.data.objects:
    if not obj.animation_data:
        continue
    obj.animation_data.action = None
    for track in obj.animation_data.nla_tracks:
        segment = segments_by_name.get(track.name.lower())
        track.mute = segment is None
        if segment is None:
            continue
        for strip in track.strips:
            strip.action_frame_start = 0
            strip.action_frame_end = segment['source_frames']
            strip.frame_start = segment['start']
            strip.scale = FPS / 30
            strip.repeat = 1
            strip.frame_end = segment['start'] + segment['seconds'] * FPS
            strip.use_animated_influence = False
            strip.influence = 1
            strip.blend_type = 'REPLACE'
            strip.extrapolation = 'NOTHING'
            strip.use_auto_blend = False
            strip.blend_in = 6 if segment['clip'] == 'wave' else 0
            strip.blend_out = 8 if segment['clip'] == 'wave' else 0
            configured.append({'object': obj.name, 'track': track.name,
                               'action': strip.action.name,
                               'start': strip.frame_start, 'end': strip.frame_end,
                               'source_start': strip.action_frame_start,
                               'source_end': strip.action_frame_end,
                               'scale': strip.scale})
assert {item['track'].lower() for item in configured} == {'idle', 'wave', 'turn'}

# Independent demonstration of the real facial shape keys. No audio source,
# lip-sync inference, portrait image or generated video is involved.
morph_meshes = [obj for obj in bpy.data.objects if obj.type == 'MESH' and obj.data.shape_keys]
assert len(morph_meshes) == 36
for obj in morph_meshes:
    keys = obj.data.shape_keys
    keys.animation_data_clear()
    for name in ('blink', 'aa', 'happy', 'sad'):
        keys.key_blocks[name].value = 0
    for frame in list(range(1, FRAMES + 1, 4)) + [FRAMES]:
        t = (frame - 1) / FPS
        keys.key_blocks['happy'].value = .48 * envelope(t, 1.6, 3.8)
        keys.key_blocks['aa'].value = .28 * envelope(t, 2.0, 3.6) * (.5 + .5 * math.sin(t * 5.2))
        for name in ('happy', 'aa'):
            keys.key_blocks[name].keyframe_insert('value', frame=frame)

scene.camera = next(obj for obj in bpy.data.objects if obj.type == 'CAMERA' and obj.get('view') == 'threequarter')
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.eevee.taa_render_samples = 8
scene.eevee.use_raytracing = False
scene.eevee.use_shadow_jitter_viewport = False
scene.render.resolution_x = scene.render.resolution_y = 512
scene.render.resolution_percentage = 100
scene.render.fps = FPS
scene.render.fps_base = 1
scene.frame_start, scene.frame_end = 1, FRAMES
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.constant_rate_factor = 'MEDIUM'
scene.render.ffmpeg.ffmpeg_preset = 'REALTIME'
scene.render.ffmpeg.audio_codec = 'NONE'
scene.render.filepath = str(OUTPUT)
scene.render.use_file_extension = True
scene.render.film_transparent = False
for obj in bpy.data.objects:
    if obj.get('dafeiyu_viewport_helper') or obj.get('reference_only'):
        obj.hide_render = True
scene.frame_set(1)
bpy.context.view_layer.update()
render_started = time.perf_counter()
bpy.ops.render.render(animation=True)
render_seconds = time.perf_counter() - render_started
assert OUTPUT.is_file() and OUTPUT.stat().st_size > 1000
final_hash = sha256(MASTER)
assert final_hash == original_hash, 'Master file changed during preview render'
manifest = {
    'status': 'native_model_rendered',
    'source_blend': str(MASTER), 'source_blend_sha256_before': original_hash,
    'source_blend_sha256_after': final_hash, 'source_master_unchanged': True,
    'script_sha256': sha256(Path(__file__)),
    'video': str(OUTPUT), 'video_bytes': OUTPUT.stat().st_size,
    'video_sha256': sha256(OUTPUT), 'frames': FRAMES, 'fps': FPS,
    'duration_seconds': FRAMES / FPS, 'resolution': [512, 512],
    'actual_render_wall_seconds': render_seconds,
    'total_wall_seconds': time.perf_counter() - started,
    'blender_version': bpy.app.version_string,
    'renderer': 'Eevee', 'render_samples': 8,
    'camera': scene.camera.name, 'nla_segments': configured,
    'facial_demo': {'mesh_count': len(morph_meshes), 'shape_keys': ['happy', 'aa'],
                    'audio_driven': False, 'audio_present': False},
    'limitations': ['Native clips include baked hair/tail secondary motion, not a live Blender physics solve.',
                    'No walk clip is shown; this video does not demonstrate the Web foot IK/controller.',
                    'Facial morph weights are a scripted demonstration, not speech-driven animation.',
                    'Procedural refinement preview, not final likeness or production-topology approval.'],
}
MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'video': str(OUTPUT), 'manifest': str(MANIFEST),
                  'render_seconds': round(render_seconds, 3), 'master_unchanged': True}))
