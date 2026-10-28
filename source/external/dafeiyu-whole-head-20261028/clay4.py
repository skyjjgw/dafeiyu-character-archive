import bpy,math
from mathutils import Vector
P='D:/CodexTaskData/dafeiyu-whole-head-20261028'
bpy.ops.wm.open_mainfile(filepath=P+'/native-v4.blend');s=bpy.context.scene
m=bpy.data.materials.new('clay');m.diffuse_color=(.55,.55,.55,1);m.use_nodes=True;m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.55,.55,.55,1)
for o in bpy.data.objects:
 if o.type=='MESH':
  if o.name.startswith('FACE__continuous head skin') or o.name=='SKIN__neck_interface':o.hide_render=False;o.data.materials.clear();o.data.materials.append(m)
  else:o.hide_render=True
center=Vector((.17,-.06,.21));cam=s.camera;cam.data.ortho_scale=.46
for ang in [0,45,90,180]:
 a=math.radians(ang);cam.location=center+Vector((4*math.cos(a),4*math.sin(a),0));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=P+f'/clay-skin-v4-{ang}.png';bpy.ops.render.render(write_still=True)

