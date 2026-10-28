import bpy,bmesh
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-head-20261028/native-v16.blend');o=bpy.data.objects['HAIR__broad_S_lock_1_2'];bm=bmesh.new();bm.from_mesh(o.data);bm.verts.index_update();bm.faces.index_update()
for e in bm.edges:
 if not e.is_manifold:print('EDGE',[(v.index,tuple(round(x,8) for x in v.co)) for v in e.verts],'faces',[(f.index,len(f.verts),f.calc_area()) for f in e.link_faces])

