import bpy,json
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-form-20261028/projection-v5.blend')
for o in bpy.data.objects:
 if o.type=='MESH':
  pts=[o.matrix_world@v.co for v in o.data.vertices]
  print('GUIDE',o.name,[(min(p[i] for p in pts),max(p[i] for p in pts)) for i in range(3)])
print('CAM',bpy.context.scene.camera.data.ortho_scale)
bpy.ops.import_scene.gltf(filepath='E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-face/structural-v3/component/head-local.glb')
for m in bpy.data.materials:
 if m.name in ['SOURCE_000','SOURCE_003','SOURCE_009','SOURCE_002']:
  print('MAT',m.name)
  for n in m.node_tree.nodes:print(n.type,n.name, [(i.name,tuple(i.default_value) if hasattr(i.default_value,'__iter__') else i.default_value) for i in n.inputs if hasattr(i,'default_value')],n.image.name if n.type=='TEX_IMAGE' else '')
  print('LINKS',[(l.from_node.name,l.from_socket.name,l.to_node.name,l.to_socket.name) for l in m.node_tree.links])
