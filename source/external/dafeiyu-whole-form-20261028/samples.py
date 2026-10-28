import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-form-20261028/projection-v5.blend');s=bpy.context.scene;o=next(o for o in bpy.data.objects if o.type=='MESH');c=o.data.color_attributes['Col'];cam=s.camera;center=Vector((.063081,-.005865,-.002912));cam.location=center+Vector((4,0,.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();bpy.context.view_layer.update()
for name,cx,cy in [('headband',180,150),('headband2',400,128),('hair',210,185),('face',290,275),('body',280,365),('curl',170,400)]:
 vals=[]
 for v in o.data.vertices:
  q=world_to_camera_view(s,cam,v.co); x=q.x*640;y=(1-q.y)*704
  if abs(x-cx)<3 and abs(y-cy)<3 and v.co.x>.1: vals.append(tuple(round(x,3) for x in c.data[v.index].color[:3]))
 print(name,vals[:6])
