import bpy
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-form-20261028/projection-v3.blend')
o=next(o for o in bpy.data.objects if o.type=='MESH');a=o.data.color_attributes['identity_weight'];u=o.data.uv_layers['identity_projection_object_space'];
for i,c in enumerate(a.data):
 if c.color[0]>.99:print('val',i,c.color[:],u.data[i].uv[:]);break
for m in o.data.materials:
 for n in m.node_tree.nodes:
  if n.type=='TEX_IMAGE':print('tex',n.image.name,n.image.size[:],n.image.filepath,n.image.packed_file is not None)
