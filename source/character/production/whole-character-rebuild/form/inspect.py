import bpy
from mathutils import Vector
bpy.ops.import_scene.gltf(filepath='E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/assets/selected-appearance.glb')
for o in bpy.context.scene.objects:
 if o.type == 'MESH':
  b=[o.matrix_world @ Vector(p) for p in o.bound_box]
  print('OBJ',o.name,'N',len(o.data.vertices),'B',*[round(v,3) for v in (min(p.x for p in b),max(p.x for p in b),min(p.y for p in b),max(p.y for p in b),min(p.z for p in b),max(p.z for p in b))])
