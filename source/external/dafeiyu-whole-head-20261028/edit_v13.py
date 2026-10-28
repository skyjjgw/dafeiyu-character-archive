from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head_v12.py');s=p.read_text('utf-8')
s=s.replace("-.060*max(0,-c)**2","-.070*max(0,-c)**2")
a=s.index(' paths=[');b=s.index(' # Inner shorter corkscrew',a)
s=s[:a]+''' # Three genuinely broad, thin, closed S-locks; each has its own swept volume and curved pointed outline.
 outlines=[
 [(.150,.300),(.138,.225),(.150,.160),(.177,.105),(.178,.057),(.196,.020),(.205,-.020),(.225,-.061),(.265,-.082),(.307,-.066),(.343,-.025),(.343,-.025),(.306,-.044),(.275,-.037),(.271,-.008),(.300,.027),(.302,.068),(.274,.116),(.231,.161),(.198,.232)],
 [(.175,.285),(.153,.210),(.163,.135),(.187,.080),(.193,.026),(.215,-.016),(.211,-.061),(.236,-.106),(.274,-.125),(.314,-.108),(.338,-.077),(.338,-.077),(.302,-.093),(.279,-.081),(.284,-.052),(.310,-.018),(.313,.028),(.285,.082),(.248,.134),(.214,.205)],
 [(.164,.255),(.143,.179),(.152,.110),(.174,.050),(.175,.005),(.191,-.038),(.192,-.084),(.214,-.128),(.247,-.155),(.280,-.151),(.307,-.119),(.307,-.119),(.278,-.134),(.257,-.116),(.267,-.078),(.279,-.034),(.264,.024),(.239,.077),(.208,.128),(.183,.201)]
 ]
 for layer,outline in enumerate(outlines):
  curve=[]
  for j in range(len(outline)):
   p0=Vector(outline[(j-1)%len(outline)]);p1=Vector(outline[j]);p2=Vector(outline[(j+1)%len(outline)]);p3=Vector(outline[(j+2)%len(outline)])
   for kk in range(5):
    u=kk/5;v=.5*(2*p1+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u);curve.append(v)
  pp=list(curve);ed=[(j,(j+1)%len(curve)) for j in range(len(curve))]
  for yy in range(40):
   for zz in range(82):
    pt=Vector((.135+yy*.0055,-.16+zz*.0058))
    if inside(pt,curve):pp.append(pt)
  vv,ee,ff,*_=delaunay_2d_cdt(pp,ed,[],0,1e-7)
  def distseg(p,a,b):
   ab=b-a;t=max(0,min(1,(p-a).dot(ab)/max(1e-10,ab.length_squared)));return (p-a-ab*t).length
  def wavebase(z):return .028-layer*.030+.115*math.exp(-((z-.29)/.10)**2)+.014*math.sin((z+.04)*14)
  ve=[]
  for back in (False,True):
   for p in vv:
    d=min(distseg(p,curve[j],curve[(j+1)%len(curve)]) for j in range(len(curve)));bulge=math.sin(min(1,d/.045)*math.pi/2)**.7
    x=wavebase(p.y)+( .017 if not back else -.023)*bulge
    ve.append((x,y(p.x),p.y))
  fa=[];NN=len(vv)
  for f in ff:
   c=sum((vv[i] for i in f),Vector((0,0)))/len(f)
   if inside(c,curve):fa.append(tuple(f));fa.append(tuple(NN+i for i in reversed(f)))
  ob=meshobj('HAIR__broad_S_lock_%s_%s'%(sign,layer),ve,fa,blue)
  bm=bmesh.new();bm.from_mesh(ob.data);bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=.000002);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(ob.data);bm.free()
''' +s[b:]
a=s.index('# Headband is a continuous');b=s.index('vs=[];fs=[];A=257;B=16',a)
s=s[:b]+'''capbvh=BVHTree.FromPolygons([v.co for v in cap.data.vertices],[p.vertices[:] for p in cap.data.polygons])
def bandpos(a,x,extra=0):
 d=Vector((0,math.sin(a),math.cos(a)));origin=Vector((x,-.06,.25));hit=capbvh.ray_cast(origin+d*.5,-d,1)[0]
 return (hit if hit is not None else origin+d*.22)+d*(.012+extra)
''' +s[b:]
s=s.replace("t=j/(B-1);x=.108-.050*t;y=-.06+.226*math.sin(a);z=.25+.19*math.cos(a)\n  vs.append((x,y,z))","t=j/(B-1);x=.108-.050*t;vs.append(tuple(bandpos(a,x)))")
s=s.replace("t=j/(B-1);r=.226+.027*t+ .010*g*t;x=.061-.018*t+.008*math.sin(32*a)*t;y=-.06+r*math.sin(a);z=.25+(.19+.027*t+.007*g*t)*math.cos(a)\n  vs.append((x,y,z))","t=j/(B-1);x=.061-.018*t+.008*math.sin(32*a)*t;vs.append(tuple(bandpos(a,x,.027*t+.007*g*t)))")
s=s.replace("'native-v12.blend'","'native-v13.blend'").replace("f'head-v12-{ang:03}.png'","f'head-v13-{ang:03}.png'")
p.with_name('build_head_v13.py').write_text(s,'utf-8')
