import bpy,bmesh,math
from mathutils import Vector
P='D:/CodexTaskData/dafeiyu-whole-form-20261028'
bpy.ops.wm.open_mainfile(filepath=P+'/projection-v4.blend');o=next(o for o in bpy.data.objects if o.type=='MESH')
bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(o.data);bm.free();o.data.update()
s=bpy.context.scene;cam=s.camera;center=Vector((.063081,-.005865,-.002912));s.cycles.samples=8
for angle in (0,45,90,180):
 t=math.radians(angle);cam.location=center+Vector((4*math.cos(t),4*math.sin(t),.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=P+f'/projection-v5-{angle:03}.png';bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=P+'/projection-v5.blend')
