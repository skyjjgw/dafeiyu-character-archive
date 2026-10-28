from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head_v2.py');s=p.read_text('utf-8')
a=s.index("scene.render.engine='CYCLES'")
s=s[:a]+'''# Rebuild depth on a smooth shared skull field, retaining projected identity and original surface offsets.
from mathutils.kdtree import KDTree
sk=next(o for o in new if 'head skin sockets' in o.name)
front=[v.co.copy() for v in sk.data.vertices if v.co.x>.135]
kd=KDTree(len(front))
for i,v in enumerate(front):kd.insert((v.y,v.z,0),i)
kd.balance()
def smoothfront(y,z):
 q=((y+.06)/.189)**2+((z-.216)/.162)**2
 return .135+.145*math.sqrt(max(0,1-q))+.019*math.exp(-((y+.051)/.025)**2-((z-.139)/.030)**2)
def oldfront(y,z):
 near=kd.find_n((y,z,0),12);return sum(front[i].x/(d+.001)**2 for _,i,d in near)/sum(1/(d+.001)**2 for _,i,d in near)
for o in new:
 if o==sk:
  for v in o.data.vertices:
   q=((v.co.y+.06)/.189)**2+((v.co.z-.216)/.162)**2
   v.co.x=smoothfront(v.co.y,v.co.z) if v.co.x>.135 else .135-.103*math.sqrt(max(0,1-q))
 else:
  for v in o.data.vertices:v.co.x+=smoothfront(v.co.y,v.co.z)-oldfront(v.co.y,v.co.z)
 for poly in o.data.polygons:poly.use_smooth=True
''' +s[a:]
s=s.replace("'native-v2.blend'","'native-v3a.blend'").replace("f'head-v2-{ang:03}.png'","f'head-v3a-{ang:03}.png'")
p.with_name('build_head_v3a.py').write_text(s,'utf-8')
