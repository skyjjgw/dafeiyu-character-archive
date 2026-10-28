import bpy,bmesh,json
P='D:/CodexTaskData/dafeiyu-whole-head-20261028';bpy.ops.wm.open_mainfile(filepath=P+'/native-v15.blend');rows=[]
for o in bpy.data.objects:
 if o.type!='MESH' or o.hide_render:continue
 if not (o.name.startswith('HAIR__') or 'head skin sockets' in o.name or 'ocular globe' in o.name):continue
 bm=bmesh.new();bm.from_mesh(o.data);r={'name':o.name,'vertices':len(bm.verts),'faces':len(bm.faces),'boundary':sum(e.is_boundary for e in bm.edges),'nonmanifold':sum(not e.is_manifold for e in bm.edges),'loose':sum(not v.link_faces for v in bm.verts)};rows.append(r);bm.free()
print(json.dumps(rows));json.dump(rows,open(P+'/topology-v15.json','w'),indent=2)
