import bpy
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-form-20261028/nonfinal-head-fit-experiment.blend')
for o in bpy.data.objects:
 if 'iris' in o.name or 'sockets' in o.name:
  print(o.name, 'pos',o.matrix_world.translation[:], 'parent',o.parent)
