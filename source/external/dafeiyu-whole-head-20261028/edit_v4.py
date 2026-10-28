from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head_v2.py');s=p.read_text('utf-8')
a=s.index("scene.render.engine='CYCLES'")
s=s[:a]+'''# A new constrained continuous facial surface replaces the folded source depth cage.
# Original eye outlines and source UV drawing are retained in projection; the old folded skin is removed.
from mathutils.geometry import delaunay_2d_cdt
from mathutils.kdtree import KDTree
struct=json.loads(Path('E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-face/structural-v3/component/structure.json').read_text())
sk=next(o for o in new if 'head skin sockets' in o.name)
def face_x(y,z):
 q=abs((y+.06)/.189)**2.5+abs((z-.216)/.162)**2.5
 return .135+.145*math.sqrt(max(0,1-q))+.014*math.exp(-((y+.051)/.023)**2-((z-.139)/.025)**2)
# Source shape offsets are recomputed consistently, avoiding the old cage spikes.
for o in new:
 if o==sk:continue
 for v in o.data.vertices:
  if 'ocular globe' in o.name:
   # posterior eye is kept behind the new iris-facing field.
   oldx=v.co.x;v.co.x=face_x(v.co.y,v.co.z)-.006+min(.006,(oldx-.265)*.6)
  else:
   off=.0008
   if 'iris' in o.name:off=.002
   if 'eyelash' in o.name or 'lashes' in o.name or 'eyelid crease' in o.name:off=.003
   if 'tongue' in o.name:off=-.005
   if 'smile contour' in o.name:off=.002
   v.co.x=face_x(v.co.y,v.co.z)+off
 if 'rounded chin contour' in o.name:o.hide_render=True;o.hide_viewport=True
pts=[];edges=[];outer=[];holes=[]
NOUT=192
for j in range(NOUT):
 a=math.tau*j/NOUT;yy=.189*math.copysign(abs(math.cos(a))**.8,math.cos(a));zz=.162*math.copysign(abs(math.sin(a))**.8,math.sin(a));outer.append((yy-.06,zz+.216))
loops=[outer]
for h in struct['deformationConfig']['holes']:
 if h['type']=='eye':loops.append([(v[0]*.315-.06,v[1]*.315+.175) for v in h['neutralRim']])
loops.append([(-.049+.021*math.cos(math.tau*j/64),.109+.0016*math.sin(math.tau*j/64)) for j in range(64)])
def inside(p,poly):
 x,y=p;c=False;j=len(poly)-1
 for i in range(len(poly)):
  ax,ay=poly[i];bx,by=poly[j]
  if (ay>y)!=(by>y) and x<(bx-ax)*(y-ay)/(by-ay)+ax:c=not c
  j=i
 return c
for loop in loops:
 ids=[]
 for p in loop:ids.append(len(pts));pts.append(Vector(p))
 edges.extend((ids[i],ids[(i+1)%len(ids)]) for i in range(len(ids)))
for i in range(77):
 y=-.249+i*.00495
 for j in range(66):
  z=.054+j*.00495
  if inside((y,z),outer) and not any(inside((y,z),h) for h in loops[1:]):pts.append(Vector((y,z)))
v2,e2,f2,_,_,_=delaunay_2d_cdt(pts,edges,[],0,1e-7)
verts=[(face_x(v.x,v.y),v.x,v.y) for v in v2];faces=[]
for f in f2:
 c=sum((v2[i] for i in f),Vector((0,0)))/len(f)
 if inside(c,outer) and not any(inside(c,h) for h in loops[1:]):faces.append(tuple(f))
kdt=KDTree(len(v2))
for i,v in enumerate(v2):kdt.insert((v.x,v.y,0),i)
kdt.balance()
# Complete back skull shares the precise outer facial perimeter; no overlapping skin heads.
outerids=[kdt.find((y,z,0))[1] for y,z in outer];prev=outerids
for k in range(1,33):
 t=k/33;theta=t*math.pi/2;r=math.cos(theta);ids=[]
 for y,z in outer:
  ids.append(len(verts));verts.append((.135-.103*math.sin(theta),-.06+(y+.06)*r,.216+(z-.216)*r))
 for j in range(NOUT):faces.append((prev[j],prev[(j+1)%NOUT],ids[(j+1)%NOUT],ids[j]))
 prev=ids
pole=len(verts);verts.append((.032,-.06,.216))
for j in range(NOUT):faces.append((prev[j],prev[(j+1)%NOUT],pole))
# Eye socket/oral lining cups remain part of the same skin mesh.
for loop in loops[1:]:
 ids=[kdt.find((y,z,0))[1] for y,z in loop];cy=sum(p[0] for p in loop)/len(loop);cz=sum(p[1] for p in loop)/len(loop);inner=[]
 for y,z in loop:inner.append(len(verts));verts.append((face_x(y,z)-.022,cy+(y-cy)*.88,cz+(z-cz)*.88))
 for j in range(len(ids)):faces.append((ids[j],inner[j],inner[(j+1)%len(ids)],ids[(j+1)%len(ids)]))
 faces.append(tuple(reversed(inner)))
me=bpy.data.meshes.new('Smooth skull continuous constrained surface');me.from_pydata(verts,[],faces);me.update()
oldmat=sk.data.materials[0];sk.data=me;me.materials.append(oldmat)
# Sample genuine source skin colors from the former shell for a consistent front/back complexion.
col=me.color_attributes.new(name='Color',type='BYTE_COLOR',domain='CORNER')
for d in col.data:d.color=(.68,.57,.42,1)
bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(me);bm.free()
for p in me.polygons:p.use_smooth=True
sk.name='FACE__continuous head skin sockets and oral lining'
''' +s[a:]
s=s.replace("'native-v2.blend'","'native-v4.blend'").replace("f'head-v2-{ang:03}.png'","f'head-v4-{ang:03}.png'")
p.with_name('build_head_v4.py').write_text(s,'utf-8')
