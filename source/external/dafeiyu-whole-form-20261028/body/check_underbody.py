import bpy,bmesh
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-form-20261028/body/body-native-v11.blend');o=bpy.data.objects['UNDERBODY_continuous_skin_guide'];bm=bmesh.new();bm.from_mesh(o.data);un=set(bm.verts);cc=[]
while un:
 q=[un.pop()];n=0
 while q:
  v=q.pop();n+=1
  for e in v.link_edges:
   p=e.other_vert(v)
   if p in un:un.remove(p);q.append(p)
 cc.append(n)
print('COMPONENTS',len(cc),'COUNTS',sorted(cc,reverse=True)[:12],'boundaries',sum(e.is_boundary for e in bm.edges));bm.free()
