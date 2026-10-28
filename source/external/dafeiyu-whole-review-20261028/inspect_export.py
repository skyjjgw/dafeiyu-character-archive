import bpy,json
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-form-20261028/body/whole-character-master-v2.blend')
d=[]
for o in bpy.context.scene.objects:
 if o.type=='MESH' and not o.hide_render:
  if any(k in o.name.lower() for k in ('face','iris','apron','tongue')):
   d.append({'object':o.name,'vertices':len(o.data.vertices),'faces':len(o.data.polygons),'uv':[u.name for u in o.data.uv_layers],'colors':[a.name for a in o.data.color_attributes],'materials':[m.name for m in o.data.materials]})
mats=[]
for m in bpy.data.materials:
 if m.use_nodes and any(k in m.name for k in ('facial','SOURCE_003','apron','Selected original')):
  mats.append({'name':m.name,'links':[(l.from_node.name,l.from_socket.name,l.to_node.name,l.to_socket.name) for l in m.node_tree.links],'images':[(n.name,n.image.name,n.image.size[:]) for n in m.node_tree.nodes if n.type=='TEX_IMAGE']})
json.dump({'objects':d,'materials':mats},open('D:/CodexTaskData/dafeiyu-whole-review-20261028/inspection.json','w'),indent=2)
print([(p.identifier,str(p.default)) for p in bpy.ops.export_scene.gltf.get_rna_type().properties if 'color' in p.identifier or 'material' in p.identifier])
