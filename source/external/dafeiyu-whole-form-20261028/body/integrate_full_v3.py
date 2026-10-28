import bpy,bmesh,math
from mathutils import Vector
from mathutils.bvhtree import BVHTree
P='D:/CodexTaskData/dafeiyu-whole-form-20261028/body';bpy.ops.wm.open_mainfile(filepath=P+'/body-native-v11.blend');s=bpy.context.scene
for file,col in [('D:/CodexTaskData/dafeiyu-whole-head-20261028/head-native-review-v14.blend','DAFEIYU_HEAD_NATIVE'),('D:/CodexTaskData/dafeiyu-whole-tail-20261028/tail-native.blend','DAFEIYU_TAIL_NATIVE')]:
 with bpy.data.libraries.load(file,link=False) as (src,dst):dst.collections=[col]
 for c in dst.collections:s.collection.children.link(c)
neck=bpy.data.objects.get('neck under collar');neck.hide_render=True;neck.hide_set(True)
tail=bpy.data.objects['Whale_Tail_Continuous_Editable'];cut=tail.copy();cut.data=tail.data.copy();s.collection.objects.link(cut);cut.name='Tail_opening_cutter_hidden';bpy.context.view_layer.objects.active=cut;cut.select_set(True)
# Reduce cutter density to retain shape while keeping Boolean evaluation manageable.
mod=cut.modifiers.new('cutter simplification','DECIMATE');mod.ratio=.3;bpy.ops.object.modifier_apply(modifier=mod.name)
cut.data.update()
for v in cut.data.vertices:v.co+=v.normal*.003
cut.data.update()
backup=bpy.data.collections.new('91_Opening_Source_Backups_Hidden');s.collection.children.link(backup)
for name in ('closed flared navy overskirt','continuous gathered ivory petticoat','encircling ivory hem piping -0.262','encircling ivory hem piping -0.271'):
 ob=bpy.data.objects.get(name)
 if not ob:print('MISSING',name);continue
 old=ob.copy();old.data=ob.data.copy();backup.objects.link(old);old.name=name+'_before_opening';old.hide_render=True;old.hide_set(True)
 bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
 for m in list(ob.modifiers):
  if m.type=='SOLIDIFY':bpy.ops.object.modifier_apply(modifier=m.name)
 bo=ob.modifiers.new('Tail exit opening','BOOLEAN');bo.operation='DIFFERENCE';bo.solver='EXACT';bo.object=cut
 try:
  bpy.ops.object.modifier_apply(modifier=bo.name);print('CUT',name,len(ob.data.polygons))
 except Exception as e:print('CUT_ERROR',name,e)
# Editable rounded seam follows the actual Boolean intersection edges.
bpy.context.view_layer.update();bv=BVHTree.FromObject(cut,bpy.context.evaluated_depsgraph_get())
for name,material in [('closed flared navy overskirt','seam navy'),('continuous gathered ivory petticoat','warm ivory fabric')]:
 ob=bpy.data.objects[name];bm=bmesh.new();bm.from_mesh(ob.data);cur=bpy.data.curves.new('tail opening seam '+name,'CURVE');cur.dimensions='3D';cur.bevel_depth=.0015;cur.bevel_resolution=2;n=0
 for e in bm.edges:
  if len(e.link_faces)!=2:continue
  ds=[]
  for face in e.link_faces:
   hit=bv.find_nearest(face.calc_center_median());ds.append(hit[3] if hit else 100)
  if min(ds)<.0015 and max(ds)>.003:
   sp=cur.splines.new('POLY');sp.points.add(1)
   for p,v in zip(sp.points,e.verts):p.co=(*v.co,1)
   n+=1
 bm.free();co=bpy.data.objects.new('Tail exit bound edge '+name,cur);s.collection.objects.link(co);cur.materials.append(bpy.data.materials[material]);print('SEAM',name,n)
# Retain the cutter for editing/revision, hidden from actual views.
cut.hide_render=True;cut.hide_set(True)
cam=s.camera;center=Vector((.063081,-.005865,-.002912));s.cycles.samples=12
clay=bpy.data.materials.new('Neutral clay inspection');clay.diffuse_color=(.6,.6,.6,1);clay.use_nodes=True
for mode in ('color','clay'):
 bpy.context.view_layer.material_override=clay if mode=='clay' else None
 for a in (0,45,90,180):
  t=math.radians(a);cam.location=center+Vector((4*math.cos(t),4*math.sin(t),.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=P+f'/full-v3-{mode}-{a:03}.png';bpy.ops.render.render(write_still=True)
bpy.context.view_layer.material_override=None;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=P+'/whole-character-master-v3.blend')

