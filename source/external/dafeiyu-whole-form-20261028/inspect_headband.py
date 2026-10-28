import bpy
from mathutils import Vector
p='E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/selected-production/components/headband-v2/headband-v2.glb'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=p)
for o in bpy.data.objects:
 if o.type=='MESH':
  pts=[o.matrix_world@v.co for v in o.data.vertices];print(o.name,len(pts),[(round(min(p[i] for p in pts),3),round(max(p[i] for p in pts),3)) for i in range(3)], 'materials',[m.name for m in o.data.materials], 'uv',len(o.data.uv_layers))
