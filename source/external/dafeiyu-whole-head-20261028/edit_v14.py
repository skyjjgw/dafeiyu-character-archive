from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head_v13.py');s=p.read_text('utf-8')
s=s.replace("x=.061-.018*t+.008*math.sin(32*a)*t;vs.append(tuple(bandpos(a,x,.027*t+.007*g*t)))","x=.061-.006*t+.008*math.sin(32*a)*t;vs.append(tuple(bandpos(a,x,(.030+.019*math.cos(a)**2)*t+.007*g*t)))")
# Roll each eye aperture into a small smooth 3D lip, retaining the exact original neutral outline.
a=s.index('for loop in loops[1:]:');b=s.index("me=bpy.data.meshes.new('Smooth skull",a)
s=s[:a]+'''for loop in loops[1:]:
 ids=[kdt.find((y,z,0))[1] for y,z in loop];cy=sum(p[0] for p in loop)/len(loop);cz=sum(p[1] for p in loop)/len(loop);prev=ids
 for sc,depth in [(.989,.0003),(.971,-.0015),(.938,-.007),(.88,-.022)]:
  inner=[]
  for y,z in loop:
   yy=cy+(y-cy)*sc;zz=cz+(z-cz)*sc;inner.append(len(verts));verts.append((face_x(yy,zz)+depth,yy,zz))
  for j in range(len(ids)):faces.append((prev[j],inner[j],inner[(j+1)%len(ids)],prev[(j+1)%len(ids)]))
  prev=inner
 faces.append(tuple(reversed(prev)))
''' +s[b:]
# Mild geometric fairing around the hidden underside/neck root, no identity vertex displacement around eyes or mouth.
s=s.replace("bm.faces.new(tuple(reversed(prev)));bmesh.ops.recalc_face_normals", "bm.faces.new(tuple(reversed(prev)))\nfor fair in range(3):\n target=[v for v in bm.verts if .043<v.co.z<.088 and v.co.x<.17]\n bmesh.ops.smooth_vert(bm,verts=target,factor=.45,use_axis_x=True,use_axis_y=True,use_axis_z=True)\nbmesh.ops.recalc_face_normals")
s=s.replace("'native-v13.blend'","'native-v14.blend'").replace("f'head-v13-{ang:03}.png'","f'head-v14-{ang:03}.png'")
p.with_name('build_head_v14.py').write_text(s,'utf-8')
