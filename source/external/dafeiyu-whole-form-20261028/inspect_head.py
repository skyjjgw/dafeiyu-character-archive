import bpy
from mathutils import Vector
p='E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/selected-production/components/continuous-head-v3/head-local.glb'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=p)
for o in bpy.data.objects:
 if o.type=='MESH':
  pts=[o.matrix_world@v.co for v in o.data.vertices];print('MESH',o.name,len(pts),[(round(min(p[i] for p in pts),3),round(max(p[i] for p in pts),3)) for i in range(3)],'uv',len(o.data.uv_layers),'mats',[m.name for m in o.data.materials])
