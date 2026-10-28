import bpy
p='D:/CodexTaskData/dafeiyu-whole-form-20261028/body/whole-character-master-v1.blend';bpy.ops.wm.open_mainfile(filepath=p)
for c in bpy.data.collections:
 if 'TAIL' in c.name:
  print('COL',c.name)
  for o in c.all_objects: print('OBJ',o.name,o.type,len(o.data.vertices) if o.type=='MESH' else '',o.matrix_world.translation[:])
