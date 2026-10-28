import bpy
from mathutils import Vector
p='D:/CodexTaskData/dafeiyu-whole-model-reconstruction-20261028/output/canonical-front-v1/character.glb'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=p)
for o in bpy.data.objects:
 if o.type=='MESH':
  pts=[o.matrix_world@v.co for v in o.data.vertices];print('MESH',o.name,'n',len(pts),'bounds',[(round(min(p[i] for p in pts),3),round(max(p[i] for p in pts),3)) for i in range(3)],'materials',len(o.data.materials),'uv',len(o.data.uv_layers),'colors',[(a.name,a.domain,a.data_type) for a in o.data.color_attributes])
  for m in o.data.materials:print('MAT',m.name,[(n.type,n.image.name if n.type=='TEX_IMAGE' and n.image else None) for n in m.node_tree.nodes] if m.use_nodes else '')
