import bpy,math
from mathutils import Vector
P='D:/CodexTaskData/dafeiyu-whole-form-20261028/body';bpy.ops.wm.open_mainfile(filepath=P+'/body-head-integration-v1.blend');s=bpy.context.scene
with bpy.data.libraries.load('D:/CodexTaskData/dafeiyu-whole-tail-20261028/tail-native.blend',link=False) as (src,dst):dst.collections=['DAFEIYU_TAIL_NATIVE']
for c in dst.collections:s.collection.children.link(c)
cam=s.camera;center=Vector((.063081,-.005865,-.002912));s.cycles.samples=16
clay=bpy.data.materials.new('Neutral clay inspection');clay.diffuse_color=(.6,.6,.6,1);clay.use_nodes=True
for mode in ('color','clay'):
 bpy.context.view_layer.material_override=clay if mode=='clay' else None
 for a in (0,45,90,180):
  t=math.radians(a);cam.location=center+Vector((4*math.cos(t),4*math.sin(t),.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=P+f'/full-v1-{mode}-{a:03}.png';bpy.ops.render.render(write_still=True)
bpy.context.view_layer.material_override=None;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=P+'/whole-character-master-v1.blend')
