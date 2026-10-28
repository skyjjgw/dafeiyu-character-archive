import bpy,math
from mathutils import Vector
p='D:/CodexTaskData/dafeiyu-whole-form-20261028'
bpy.ops.wm.open_mainfile(filepath=p+'/whole-form-vertex-color-draft.blend')
s=bpy.context.scene;cam=s.camera;center=Vector((.063081,-.005865,-.002912));cam.location=center+Vector((4,0,.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.cycles.samples=8;s.render.filepath=p+'/vertex-draft-000.png';bpy.ops.render.render(write_still=True)

