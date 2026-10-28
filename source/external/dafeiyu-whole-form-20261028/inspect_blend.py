import bpy
from mathutils import Vector
p='D:/CodexTaskData/dafeiyu-whole-model-reconstruction-20261028/output/canonical-front-v1/whole-character-static.blend'
bpy.ops.wm.open_mainfile(filepath=p)
for o in bpy.data.objects:
 if o.type=='MESH':
  pts=[o.matrix_world@v.co for v in o.data.vertices];print('MESH',o.name,len(pts),[(round(min(p[i] for p in pts),3),round(max(p[i] for p in pts),3)) for i in range(3)], 'transform',o.matrix_world)
