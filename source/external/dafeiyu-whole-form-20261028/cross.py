import bpy, statistics
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-model-reconstruction-20261028/output/canonical-front-v1/whole-character-static.blend')
o=next(o for o in bpy.data.objects if o.type=='MESH')
for a,b in ((.05,.10),(.10,.15),(.15,.20),(.20,.25),(.25,.30)):
 v=sorted(v.co.x for v in o.data.vertices if a<v.co.z<b and abs(v.co.y)<.12)
 if v:print(a,b,'x',round(v[0],3),round(v[len(v)//2],3),round(v[int(len(v)*.9)],3),round(v[-1],3))
