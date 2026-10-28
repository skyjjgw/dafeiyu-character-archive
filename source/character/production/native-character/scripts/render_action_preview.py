"""Render all 192 cached native frames. No source save, AI, or interpolation."""
import bpy,json,time,hashlib,traceback
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
SOURCE=ROOT/'body-action-study.blend';OUTPUT=ROOT/'action-study-preview.mp4';REPORT=ROOT/'action-study-video-manifest.json'
START=time.perf_counter();HASH=hashlib.sha256(SOURCE.read_bytes()).hexdigest();DONE=[]
ISSUES=[
 'f035: long adult-like fingers and fitted shoulder sleeve; identity refinement remains pending in the isolated v3 branch',
 'f144: thin box occludes part of the finger surfaces; this remains an object-specific spring-assisted contact QA, not generic grasp',
 'f192: v2 shoes have a wedge-like side profile and the skirt is conical; no final art-quality approval',
 'Hair follows the head without independent hair dynamics; native cloth/Bullet caches are real but whole-body balance is kinematic'
]
try:
 bpy.ops.wm.open_mainfile(filepath=str(SOURCE));scene=bpy.context.scene
 assert scene.rigidbody_world.point_cache.is_baked
 assert all(m.point_cache.is_baked for o in bpy.data.objects for m in o.modifiers if m.type=='CLOTH')
 scene.camera=bpy.data.objects['QA full continuous action'];scene.frame_start=1;scene.frame_end=192;scene.render.fps=24;scene.render.fps_base=1
 scene.render.engine='BLENDER_EEVEE_NEXT';scene.render.resolution_x=640;scene.render.resolution_y=800;scene.render.resolution_percentage=100
 if hasattr(scene,'eevee')and hasattr(scene.eevee,'taa_render_samples'):scene.eevee.taa_render_samples=16
 scene.render.image_settings.file_format='FFMPEG';scene.render.ffmpeg.format='MPEG4';scene.render.ffmpeg.codec='H264';scene.render.ffmpeg.constant_rate_factor='MEDIUM';scene.render.ffmpeg.ffmpeg_preset='GOOD';scene.render.ffmpeg.audio_codec='NONE';scene.render.filepath=str(OUTPUT);scene.render.use_file_extension=True
 def post(scene,*args):
  DONE.append(scene.frame_current)
  if scene.frame_current%24==0:print('ACTION_VIDEO_PROGRESS '+str(scene.frame_current)+'/192',flush=True)
 bpy.app.handlers.render_post.append(post)
 bpy.ops.render.render(animation=True)
 bpy.app.handlers.render_post.remove(post)
 assert DONE==list(range(1,193)),DONE
 assert OUTPUT.is_file()and OUTPUT.stat().st_size>1000
 assert HASH==hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'Frozen action source changed'
 clip=bpy.data.movieclips.load(str(OUTPUT),check_existing=False)
 decoded={'frame_duration':getattr(clip,'frame_duration',None),'size':list(clip.size)}
 assert decoded['frame_duration']==192,decoded
 report={'status':'all_192_native_frames_rendered','source':str(SOURCE),'source_sha256_before_and_after':HASH,'source_unchanged':True,
  'video':str(OUTPUT),'video_sha256':hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),'bytes':OUTPUT.stat().st_size,
  'fps':24,'frames':192,'seconds':8,'resolution':[640,800],'rendered_frame_sequence':DONE,'movie_decode':decoded,
  'renderer':'Native Eevee, cached scene geometry/cloth/Bullet, 16 samples','frame_generation':'Every frame rendered by Blender; no interpolation, generated inbetween, or AI video',
  'preflight_actual_visual_findings':ISSUES,'audio':False,'wall_seconds':time.perf_counter()-START,'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
 REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print('ACTION_VIDEO_COMPLETE '+json.dumps(report),flush=True)
except Exception as error:
 REPORT.write_text(json.dumps({'status':'failed','rendered_frames':DONE,'message':str(error),'traceback':traceback.format_exc(),'source':str(SOURCE),'preflight_actual_visual_findings':ISSUES},ensure_ascii=False,indent=2),encoding='utf8');raise
