import bpy,json
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-head-20261028/native-v1.blend')
for o in bpy.data.objects:
 if o.name.startswith('FACE__'):
  print(o.name,[(a.name,a.domain,a.data_type) for a in o.data.color_attributes])
  if o.name.endswith('skin sockets and oral lining'):
   vs=[v.co for v in o.data.vertices];print('extrema',[(min(v[i] for v in vs),max(v[i] for v in vs)) for i in range(3)])
