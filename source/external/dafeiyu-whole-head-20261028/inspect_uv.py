import bpy,numpy as np
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-head-20261028/native-v5.blend')
o=next(o for o in bpy.data.objects if 'reference skin, nose' in o.name)
for m in o.data.materials:
 print(m.name,[(n.name,n.uv_map) for n in m.node_tree.nodes if n.type=='UVMAP'])
for uv in o.data.uv_layers:
 rows=[];vals=[]
 for li,l in enumerate(o.data.loops):
  v=o.data.vertices[l.vertex_index].co;rows.append((v.y,v.z,1));vals.append(tuple(uv.data[li].uv))
 c,res,*_=np.linalg.lstsq(rows,vals,rcond=None);print(uv.name,c,res,'bounds',np.min(vals,axis=0),np.max(vals,axis=0))
