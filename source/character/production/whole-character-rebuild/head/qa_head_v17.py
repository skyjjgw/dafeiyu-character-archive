import bpy,math,json,bmesh
from mathutils import Vector
from pathlib import Path
P=Path('D:/CodexTaskData/dafeiyu-whole-head-20261028')
bpy.ops.wm.open_mainfile(filepath=str(P/'head-native-review-v17.blend'));s=bpy.context.scene
s.render.resolution_x=720;s.render.resolution_y=720;s.render.resolution_percentage=100;s.cycles.device='CPU';s.cycles.samples=12
cam=s.camera;center=Vector((.14,-.06,.210));cam.data.ortho_scale=.47
mat=bpy.data.materials.new('QA matte neutral clay');mat.use_nodes=True;p=mat.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(.52,.52,.52,1);p.inputs['Roughness'].default_value=.75;p.inputs['Specular IOR Level'].default_value=.15
for o in bpy.data.objects:
 if o.type!='MESH':continue
 if o.name.startswith('FACE__') and not o.hide_render:
  o.data.materials.clear();o.data.materials.append(mat)
 else:o.hide_render=True
for label,ang,pitch in [('face_000',0,0),('face_045',45,0),('face_090',90,0),('face_045_up20',45,20),('face_045_down20',45,-20)]:
 a=math.radians(ang);p=math.radians(pitch);cam.location=center+Vector((4*math.cos(a)*math.cos(p),4*math.sin(a)*math.cos(p),4*math.sin(p)));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=str(P/f'qa-v17-clay-{label}.png');bpy.ops.render.render(write_still=True)
for o in bpy.data.objects:
 if o.type=='MESH' and o.name.startswith('FACE__') and 'continuous head skin sockets' not in o.name:o.hide_render=True
for label,ang,pitch in [('skin_045',45,0),('skin_090',90,0),('skin_045_up20',45,20)]:
 a=math.radians(ang);p=math.radians(pitch);cam.location=center+Vector((4*math.cos(a)*math.cos(p),4*math.sin(a)*math.cos(p),4*math.sin(p)));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=str(P/f'qa-v17-clay-{label}.png');bpy.ops.render.render(write_still=True)
# Fresh reopen: signed volume audit. This does not substitute for visual approval.
bpy.ops.wm.open_mainfile(filepath=str(P/'head-native-review-v17.blend'));out=[]
for o in bpy.data.collections['DAFEIYU_HEAD_NATIVE'].objects:
 if o.type!='MESH' or not (o.name.startswith('HAIR__') or 'head skin sockets' in o.name or 'ocular globe' in o.name):continue
 bm=bmesh.new();bm.from_mesh(o.data);out.append({'name':o.name,'signed_volume':bm.calc_volume(signed=True),'boundary_edges':sum(e.is_boundary for e in bm.edges),'nonmanifold_edges':sum(not e.is_manifold for e in bm.edges)});bm.free()
json.dump(out,open(P/'volume-audit-v17.json','w'),indent=2)
