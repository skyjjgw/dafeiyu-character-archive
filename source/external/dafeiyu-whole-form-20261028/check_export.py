import bpy
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath='D:/CodexTaskData/dafeiyu-whole-form-20261028/whole-form-vertex-color-draft.glb')
for o in bpy.data.objects:
 if o.type=='MESH': print('ATTR',[(x.name,x.domain) for x in o.data.color_attributes], 'MAT',o.data.materials[0].name)
