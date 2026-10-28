import bpy,bmesh
from mathutils.bvhtree import BVHTree
p='D:/CodexTaskData/dafeiyu-whole-form-20261028/body/whole-character-master-v2.blend';bpy.ops.wm.open_mainfile(filepath=p);cut=bpy.data.objects['Tail_opening_cutter_hidden'];bv=BVHTree.FromObject(cut,bpy.context.evaluated_depsgraph_get())
for name in ('closed flared navy overskirt','continuous gathered ivory petticoat'):
 o=bpy.data.objects[name];bm=bmesh.new();bm.from_mesh(o.data);cnt=0
 for e in bm.edges:
  if len(e.link_faces)!=2:continue
  ds=[]
  for f in e.link_faces:
   x=bv.find_nearest(f.calc_center_median());ds.append(x[3] if x else 100)
  if min(ds)<.0015 and max(ds)>.003:cnt+=1
 print(name,'seam_edges',cnt)
 bm.free()
