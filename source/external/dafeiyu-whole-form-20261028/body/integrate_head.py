import bpy,math
from mathutils import Vector
P='D:/CodexTaskData/dafeiyu-whole-form-20261028/body';bpy.ops.wm.open_mainfile(filepath=P+'/body-native-v8.blend');s=bpy.context.scene
p='D:/CodexTaskData/dafeiyu-whole-head-20261028/head-native-review.blend'
with bpy.data.libraries.load(p,link=False) as (src,dst):dst.collections=['DAFEIYU_HEAD_NATIVE']
for c in dst.collections:s.collection.children.link(c)
# Head collection includes neck continuity; suppress duplicate body neck.
o=bpy.data.objects.get('neck under collar')
if o:o.hide_render=True;o.hide_set(True)
cam=s.camera;center=Vector((.063081,-.005865,-.002912));s.cycles.samples=16
for a in (0,45,90,180):
 t=math.radians(a);cam.location=center+Vector((4*math.cos(t),4*math.sin(t),.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=P+f'/integrated-head-v1-{a:03}.png';bpy.ops.render.render(write_still=True)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=P+'/body-head-integration-v1.blend')
