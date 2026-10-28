import bpy,numpy as np
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-head-20261028/native-v6.blend')
o=next(o for o in bpy.data.objects if 'head skin sockets' in o.name)
for uv in o.data.uv_layers:print(uv.name,[(tuple(uv.data[i].uv)) for i in range(5)])
print('colors',[(a.name,a.domain,a.data_type) for a in o.data.color_attributes])
for a in o.data.color_attributes:print(a.name,[tuple(a.data[i].color) for i in range(5)])
print('points',[(tuple(o.data.vertices[o.data.loops[i].vertex_index].co)) for i in range(5)])
