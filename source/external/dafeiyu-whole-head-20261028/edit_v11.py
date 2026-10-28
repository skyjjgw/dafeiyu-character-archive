from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head_v10.py');s=p.read_text('utf-8')
s=s.replace("[.005,.018,.024,.023,.010,.0003]","[.004,.010,.013,.012,.006,.0003]")
s=s.replace("[.016,.048,.053,.046,.026,.0003],[.005,.020,.027,.024,.013,.0003]","[.013,.041,.044,.037,.014,.0003],[.004,.010,.013,.012,.006,.0003]")
s=s.replace("[.015,.044,.048,.043,.032,.0003],[.005,.018,.028,.029,.017,.0003]","[.012,.035,.038,.034,.018,.0003],[.004,.010,.013,.013,.008,.0003]")
s=s.replace("[(.152,-.057,.421),(.16,-.004,.460),(.149,-.027,.495),(.14,-.086,.497),(.14,-.120,.471),(.151,-.112,.442)],[.010,.014,.018,.018,.014,.0003],[.003,.006,.007,.006,.004,.0003]","[(.150,-.060,.424),(.160,-.047,.465),(.150,-.076,.495),(.140,-.120,.497),(.145,-.157,.475),(.150,-.168,.450),(.160,-.151,.433)],[.009,.015,.020,.018,.013,.008,.0003],[.004,.007,.008,.007,.006,.004,.0003]")
s=s.replace("[.030,.043,.047,.048,.034,.019,.013,.0003],[.012,.018,.021,.021,.016,.010,.006,.0003]","[.020,.031,.034,.030,.022,.012,.008,.0003],[.006,.008,.010,.010,.008,.005,.003,.0003]")
a=s.index(' # Closed backing mass');b=s.index(' # Inner shorter corkscrew',a)
s=s[:a]+''' # Sculpted, closed S-wave hair fan with a scalloped multi-tip perimeter and genuine front/back depth.
 # Its broad medial mass and fine curling surface locks are independent editable parts.
 outline=[(.16,.30),(.135,.225),(.145,.155),(.165,.105),(.150,.065),(.170,.015),(.162,-.023),(.182,-.064),(.182,-.088),(.209,-.122),(.237,-.145),(.265,-.153),(.294,-.131),(.311,-.105),(.284,-.119),(.276,-.095),(.309,-.090),(.338,-.062),(.348,-.032),(.318,-.061),(.294,-.058),(.298,-.031),(.325,-.003),(.337,.033),(.328,.064),(.302,.101),(.273,.132),(.235,.173),(.205,.235)]
 curve=[]
 for j in range(len(outline)):
  p0=Vector(outline[(j-1)%len(outline)]);p1=Vector(outline[j]);p2=Vector(outline[(j+1)%len(outline)]);p3=Vector(outline[(j+2)%len(outline)])
  for kk in range(4):
   u=kk/4;v=.5*(2*p1+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u);curve.append(v)
 pp=list(curve);ed=[(j,(j+1)%len(curve)) for j in range(len(curve))]
 for yy in range(40):
  for zz in range(82):
   pt=Vector((.135+yy*.0055,-.16+zz*.0058))
   if inside(pt,curve):pp.append(pt)
 vv,ee,ff,*_=delaunay_2d_cdt(pp,ed,[],0,1e-7)
 def distseg(p,a,b):
  ab=b-a;t=max(0,min(1,(p-a).dot(ab)/max(1e-10,ab.length_squared)));return (p-a-ab*t).length
 def wavebase(z):return -.012+.085*math.exp(-((z-.29)/.10)**2)+.025*math.exp(-((z+.10)/.085)**2)
 ve=[]
 for back in (False,True):
  for p in vv:
   d=min(distseg(p,curve[j],curve[(j+1)%len(curve)]) for j in range(len(curve)));bulge=math.sin(min(1,d/.065)*math.pi/2)**.65
   x=wavebase(p.y)+( .026 if not back else -.046)*bulge
   ve.append((x,y(p.x),p.y))
 fa=[];NN=len(vv)
 for f in ff:
  c=sum((vv[i] for i in f),Vector((0,0)))/len(f)
  if inside(c,curve):fa.append(tuple(f));fa.append(tuple(NN+i for i in reversed(f)))
 # Boundary rings share coordinates and are welded, forming a closed lenticular volume.
 ob=meshobj('HAIR__sculpted_wave_fan_'+str(sign),ve,fa,blue)
 bm=bmesh.new();bm.from_mesh(ob.data);bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=.000002);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(ob.data);bm.free()
''' +s[b:]
s=s.replace("'native-v10.blend'","'native-v11.blend'").replace("f'head-v10-{ang:03}.png'","f'head-v11-{ang:03}.png'")
p.with_name('build_head_v11.py').write_text(s,'utf-8')
