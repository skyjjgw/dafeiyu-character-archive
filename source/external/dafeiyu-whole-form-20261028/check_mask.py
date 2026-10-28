import bpy
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-form-20261028/projection-v1.blend')
o=next(o for o in bpy.data.objects if o.type=='MESH');a=o.data.color_attributes['identity_weight']; print('nonzero',sum(c.color[0]>.01 for c in a.data),'max',max(c.color[0] for c in a.data));print('attrs',[(a.name,a.domain) for a in o.data.color_attributes]);print('faces at front normal',[(tuple(round(x,3) for x in v.co),tuple(round(x,3) for x in v.normal)) for v in o.data.vertices if .25<v.co.x<.26 and .1<v.co.z<.2][:4])
