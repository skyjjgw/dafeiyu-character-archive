import bpy
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath='E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-body/retopology/assets/selected-hand-v2.glb')
for o in bpy.data.objects:
 if 'traced open hand' in o.name:
  print(o.name,[g.name for g in o.vertex_groups][:60]);print('bone weights sample',[(g.group,round(g.weight,2)) for g in o.data.vertices[2000].groups])
