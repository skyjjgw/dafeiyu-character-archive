import bpy,math
from mathutils import Vector
P='D:/CodexTaskData/dafeiyu-whole-form-20261028'
bpy.ops.wm.open_mainfile(filepath=P+'/separated-v2.blend');s=bpy.context.scene
for o in list(bpy.data.objects):
 if o.name.startswith('Maid_headdress_3D_rebuilt'):bpy.data.objects.remove(o,do_unlink=True)
band=bpy.data.objects['Old_fused_headband_removed'];band.name='Headwear_surface_retopology_guide';me=band.data;col=me.color_attributes['Col'];count=0
# Reshape original cloth region, softly vanishing at its color-class boundary.
for v in me.vertices:
 c=col.data[v.index].color; bright=min(c[0],c[1],c[2]);w=max(0,min(1,(bright-.28)/.15))
 y=v.co.y+.06;z=v.co.z-.25;angle=math.atan2(y,z);d=.008*w*(1+math.cos(angle*16));v.co.y+=d*math.sin(angle);v.co.z+=d*math.cos(angle);count+=w>0
me.update();band['note']='Editable extracted guide, not closed topology. Colors are approximate segmentation; requires manual seam cleanup.'
cam=s.camera;center=Vector((.063081,-.005865,-.002912));s.cycles.samples=8
for angle in (0,45,90,180):
 t=math.radians(angle);cam.location=center+Vector((4*math.cos(t),4*math.sin(t),.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=P+f'/headwear-v3-{angle:03}.png';bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=P+'/headwear-v3.blend');print('moved',count)
