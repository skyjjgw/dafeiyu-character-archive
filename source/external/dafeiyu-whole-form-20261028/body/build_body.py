import bpy,math,bmesh
from mathutils import Vector,Matrix
from pathlib import Path
P=Path('D:/CodexTaskData/dafeiyu-whole-form-20261028/body'); bpy.ops.wm.read_factory_settings(use_empty=True);s=bpy.context.scene
# +X front, +Y screen-right, +Z up; all dimensions in raw reconstructed model units.
def collection(name):
 c=bpy.data.collections.new(name);s.collection.children.link(c);return c
C={n:collection(n) for n in ('00_Underbody_Internal','01_Neck_and_Bodice','02_Sleeves_and_Cuffs','03_Skirt_and_Frilly_Petticoat','04_Apron_and_Straps','05_Legs_Socks_Shoes','06_Hands','90_Frozen_Guide')}
def mat(name,c,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*c,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=.73;p.inputs['Metallic'].default_value=metal;return m
navy=mat('dress deep ocean navy',(.018,.035,.105)); mid=mat('seam navy',(.035,.075,.19)); ivory=mat('warm ivory fabric',(.80,.76,.73)); skin=mat('warm skin',(.74,.47,.35)); blue=mat('whale blue',(.03,.28,.55));gold=mat('neck brooch metal',(.43,.25,.07),.4)
def mesh_obj(name,v,f,material,col):
 me=bpy.data.meshes.new(name);me.from_pydata(v,[],f);me.update();o=bpy.data.objects.new(name,me);C[col].objects.link(o);o.data.materials.append(material)
 for p in me.polygons:p.use_smooth=True
 return o
def rings(name,rows,material,col,N=96,fold=0,cap=True,uniform=False):
 # (z,center_x,center_y,x_radius,y_radius), enclosed ellipses.
 v=[];f=[]
 for j,(z,cx,cy,rx,ry) in enumerate(rows):
  for i in range(N):
   t=2*math.pi*i/N;w=1+fold*math.cos(t*16)*(1 if uniform else (j/(len(rows)-1))**2)
   v.append((cx+rx*math.cos(t)*w,cy+ry*math.sin(t)*w,z))
 for j in range(len(rows)-1):
  for i in range(N):f.append((j*N+i,j*N+(i+1)%N,(j+1)*N+(i+1)%N,(j+1)*N+i))
 if cap:f.append(tuple(reversed(range(N))));f.append(tuple((len(rows)-1)*N+i for i in range(N)))
 return mesh_obj(name,v,f,material,col)
def path_sweep(name,points,radii,material,col,N=20):
 # True swept closed volume along an articulated 3D centerline, not flat front plane.
 control=[Vector(p) for p in points];rr=[Vector(r) for r in radii];ps=[];rs=[];steps=8
 def cat(a,b,c,d,t):return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)
 for k in range(len(control)-1):
  for i in range(steps):
   t=i/steps;ps.append(cat(control[max(0,k-1)],control[k],control[k+1],control[min(k+2,len(control)-1)],t));rs.append(cat(rr[max(0,k-1)],rr[k],rr[k+1],rr[min(k+2,len(rr)-1)],t))
 ps.append(control[-1]);rs.append(rr[-1]);v=[];f=[];axis=Vector((1,0,0))
 for j,p in enumerate(ps):
  tangent=(ps[min(j+1,len(ps)-1)]-ps[max(0,j-1)]).normalized();axis=(axis-tangent*axis.dot(tangent)).normalized();side=tangent.cross(axis).normalized()
  for i in range(N):
   a=2*math.pi*i/N;pt=p+axis*(max(.001,rs[j][0])*math.cos(a))+side*(max(.001,rs[j][1])*math.sin(a));v.append(tuple(pt))
 for j in range(len(ps)-1):
  for i in range(N):f.append((j*N+i,j*N+(i+1)%N,(j+1)*N+(i+1)%N,(j+1)*N+i))
 f.append(tuple(reversed(range(N))));f.append(tuple((len(ps)-1)*N+i for i in range(N)))
 return mesh_obj(name,v,f,material,col)
def sphere(name,location,scale,material,col):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,location=location);o=bpy.context.object;o.name=name;o.scale=scale
 for c in list(o.users_collection):c.objects.unlink(o)
 C[col].objects.link(o);o.data.materials.append(material)
 for p in o.data.polygons:p.use_smooth=True
 return o
# Neck, bodice and waist: skin neck meets head interface (.105,-.06,.045).
rings('neck under collar',[(-.005,.095,-.06,.033,.040),(.045,.105,-.06,.040,.043),(.061,.105,-.06,.037,.039)],skin,'01_Neck_and_Bodice')
rings('tailored closed bodice',[(-.12,.035,-.06,.060,.076),(-.09,.035,-.06,.067,.086),(-.045,.04,-.06,.070,.100),(-.012,.035,-.06,.062,.105),(.008,.04,-.06,.054,.090),(.023,.07,-.06,.045,.048)],navy,'01_Neck_and_Bodice')
# Small inset chest bib, white blouse and collar: smooth solid surfaces.
v=[];f=[]
for j in range(13):
 t=j/12;z=.004-.094*t
 for i in range(17):
  u=2*i/16-1;v.append((.116-.012*u*u,-.06+.047*u,z))
for j in range(12):
 for i in range(16):a=j*17+i;f.append((a,a+1,a+18,a+17))
bib=mesh_obj('white shaped blouse chest bib',v,f,ivory,'01_Neck_and_Bodice');so=bib.modifiers.new('blouse thickness','SOLIDIFY');so.thickness=.002
path_sweep('narrow navy chest placket',[(.120,-.06,-.028),(.120,-.06,-.078)],[(.003,.007),(.003,.007)],navy,'01_Neck_and_Bodice',12)
# Bow fabric loops and pointed white collar, independently editable pieces.
for sign in (-1,1):
 path_sweep('neck bow folded loop '+str(sign),[(.130,-.06+sign*.006,-.019),(.130,-.06+sign*.025,-.007),(.130,-.06+sign*.049,-.010),(.130,-.06+sign*.039,-.032),(.130,-.06+sign*.008,-.023)],[(.004,.006),(.006,.013),(.005,.013),(.006,.012),(.004,.006)],navy,'01_Neck_and_Bodice',16)
 path_sweep('neck bow pointed tail '+str(sign),[(.128,-.06+sign*.008,-.025),(.128,-.06+sign*.020,-.047),(.126,-.06+sign*.031,-.057)],[(.003,.006),(.004,.008),(.003,.010)],navy,'01_Neck_and_Bodice',12)
 vv=[(.106,-.06+sign*.012,.004),(.103,-.06+sign*.050,.001),(.110,-.06+sign*.035,-.020),(.111,-.06+sign*.018,-.015)]
 co=mesh_obj('folded white collar '+str(sign),vv,[(0,1,2,3)],ivory,'01_Neck_and_Bodice');so=co.modifiers.new('collar thickness','SOLIDIFY');so.thickness=.003
sphere('bow brooch gold',(.137,-.06,-.017),(.008,.010,.011),gold,'01_Neck_and_Bodice');sphere('bow blue stone',(.145,-.06,-.017),(.005,.006,.007),blue,'01_Neck_and_Bodice')
for z in (-.046,-.073):sphere('ivory blouse button',(.126,-.06,z),(.003,.004,.004),ivory,'01_Neck_and_Bodice')
# Both puff sleeves have shaped cross sections, capped cuff ring, front aligned with hand.
for side in (-1,1):
 def y(v):return -.06+side*v
 points=[(.034,y(.087),-.006),(.037,y(.105),-.018),(.040,y(.127),-.036),(.050,y(.148),-.067),(.064,y(.167),-.100),(.075,y(.185),-.134),(.084,y(.202),-.164)]
 rad=[(.023,.025),(.042,.045),(.047,.046),(.035,.035),(.040,.040),(.028,.028),(.020,.021)]
 path_sweep('tailored puff sleeve '+str(side),points,rad,navy,'02_Sleeves_and_Cuffs')
 path_sweep('ivory striped cuff '+str(side),[points[-2],points[-1],(.09,y(.208),-.171)],[rad[-2],(.024,.024),(.022,.022)],ivory,'02_Sleeves_and_Cuffs')
 path_sweep('cuff navy fine stripe '+str(side),[(.082,y(.197),-.157),(.086,y(.204),-.166)],[(.025,.025),(.024,.024)],mid,'02_Sleeves_and_Cuffs')
# Stable horizontal-world skirt section; subtle pleats strengthen toward hem.
rings('closed flared navy overskirt',[(-.115,.025,-.06,.065,.086),(-.15,.025,-.06,.100,.135),(-.19,.025,-.06,.132,.180),(-.235,.025,-.06,.153,.208),(-.276,.025,-.06,.160,.219),(-.288,.025,-.06,.160,.220)],navy,'03_Skirt_and_Frilly_Petticoat',128,.065)
# Hem stripes wrap all sides.
for z in (-.262,-.271):
 # The bands use the exact underlying skirt radii and fold phase at this height.
 t=(abs(z)-.235)/.041;rx=.153+.007*t;ry=.208+.011*t;q=.6+.2*t;v=[];f=[];N=256
 for i in range(N):
  a=2*math.pi*i/N;factor=1+.065*math.cos(a*16)*q*q
  for dz in (-.0012,.0012):v.append((.025+(rx*factor+.0025)*math.cos(a),-.06+(ry*factor+.0025)*math.sin(a),z+dz))
 for i in range(N):
  j=(i+1)%N;f.append((2*i,2*j,2*j+1,2*i+1))
 mesh_obj('encircling ivory hem piping '+str(z),v,f,ivory,'03_Skirt_and_Frilly_Petticoat')
for a in (-.95,-.56,.56,.95):
 sphere('skirt ivory dot',(.025+.163*math.cos(a),-.06+.223*math.sin(a),-.267),(.004,.007,.007),ivory,'03_Skirt_and_Frilly_Petticoat')
# Petticoat built as a thick, radiating folded shell with scalloped lower edge.
v=[];f=[];N=192;R=12
for j in range(R+1):
 t=j/R
 for i in range(N):
  a=2*math.pi*i/N;wave=math.cos(16*a);radius=(1+.045*wave*t);rx=(.150+.025*t)*radius;ry=(.200+.037*t)*radius
  z=-.282-.052*t-.008*t*t*(.5+.5*wave);v.append((.025+rx*math.cos(a),-.06+ry*math.sin(a),z))
for j in range(R):
 for i in range(N):f.append((j*N+i,j*N+(i+1)%N,(j+1)*N+(i+1)%N,(j+1)*N+i))
ruff=mesh_obj('continuous gathered ivory petticoat',v,f,ivory,'03_Skirt_and_Frilly_Petticoat');sol=ruff.modifiers.new('fabric thickness','SOLIDIFY');sol.thickness=.006
rings('waist wrap sash',[(-.125,.026,-.06,.071,.094),(-.097,.026,-.06,.070,.094)],ivory,'04_Apron_and_Straps')
# Full volumetric apron shell, front-facing; projected image only on front surface.
def skirt_front(z,y):
 # Interpolate the actual authored bell sections and their pleating amplitude.
 sections=[(-.288,.160,.220,1),(-.276,.160,.219,.8),(-.235,.153,.208,.6),(-.19,.132,.180,.4),(-.15,.100,.135,.2),(-.115,.065,.086,0)]
 z=max(sections[0][0],min(sections[-1][0],z))
 for lo,hi in zip(sections,sections[1:]):
  if lo[0]<=z<=hi[0]:
   t=(z-lo[0])/(hi[0]-lo[0]);rx=lo[1]+t*(hi[1]-lo[1]);ry=lo[2]+t*(hi[2]-lo[2]);fold=(lo[3]+t*(hi[3]-lo[3]))**2;break
 theta=math.asin(max(-.99,min(.99,(y+.06)/ry)));ripple=1+.065*math.cos(theta*16)*fold
 return .025+rx*ripple*math.sqrt(max(.01,1-((y+.06)/(ry*ripple))**2))
v=[];f=[];nx=40;nz=32
for j in range(nz+1):
 t=j/nz;z=-.125-.115*t; half=.084*(1-.40*t*t)
 for i in range(nx+1):
  u=2*i/nx-1;y=-.06+half*u;rz=z+.024*t*u*u
  x=skirt_front(rz,y)+.005;v.append((x,y,rz))
for j in range(nz):
 for i in range(nx):
  a=j*(nx+1)+i;f.append((a,a+1,a+nx+2,a+nx+1))
ap=mesh_obj('apron curved front cloth',v,f,ivory,'04_Apron_and_Straps');sol=ap.modifiers.new('apron fabric thickness','SOLIDIFY');sol.thickness=.004
# Source image sampled on this curved three-dimensional apron only, with fixed UVs.
uv=ap.data.uv_layers.new(name='front_apron_art');weight=ap.data.color_attributes.new(name='whale_mask',type='FLOAT_COLOR',domain='CORNER');uv=ap.data.uv_layers['front_apron_art'];img=bpy.data.images.load('E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-geometry/hair-continuity-v1/reports/root-front.png',check_existing=True)
for p in ap.data.polygons:
 for li in p.loop_indices:
  vi=ap.data.loops[li].vertex_index;j=vi//(nx+1);i=vi%(nx+1);u=i/nx;t=j/nz
  px=213+138*u;py=407+99*t;uv.data[li].uv=(px/640,1-py/704)
  d=math.sqrt(((px-282)/38)**2+((py-459)/26)**2);w=max(0,min(1,(1-d)/.16));weight.data[li].color=(w,w,w,1)
am=bpy.data.materials.new('apron original whale and cloth print');am.use_nodes=True;n=am.node_tree.nodes;n.clear();L=am.node_tree.links;out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');tex=n.new('ShaderNodeTexImage');tex.image=img;uvn=n.new('ShaderNodeUVMap');uvn.uv_map=uv.name;mask=n.new('ShaderNodeVertexColor');mask.layer_name='whale_mask';mix=n.new('ShaderNodeMixRGB');mix.inputs[1].default_value=(.80,.76,.73,1);L.new(uvn.outputs['UV'],tex.inputs['Vector']);L.new(mask.outputs['Color'],mix.inputs[0]);L.new(tex.outputs['Color'],mix.inputs[2]);L.new(mix.outputs[0],em.inputs[0]);L.new(em.outputs[0],out.inputs[0]);ap.data.materials.clear();ap.data.materials.append(am)
# Gathered single continuous ruffle around apron perimeter with physical thickness.
path=[]
for side in (-1,1):
 seq=range(49) if side==-1 else reversed(range(49))
 for j in seq:
  t=j/48;half=.084*(1-.40*t*t);z=-.125-.115*t+.024*t;y=-.06+side*half;x=skirt_front(z,y)+.006;path.append((x,y,z))
# A fitted broad flounce replaces bead-like trim; bottom return connects both sides.
path=path[:49]+[(skirt_front(-.216-.024*(1-(2*i/48-1)**2),-.06+.0504*(2*i/48-1))+.006,-.06+.0504*(2*i/48-1),-.216-.024*(1-(2*i/48-1)**2)) for i in range(49)]+path[49:]
verts=[];faces=[]
for i,(x,y,z) in enumerate(path):
 wave=.004*(.5+.5*math.cos(i*math.pi/4)); center_y=y+.06;dy=math.copysign(1,center_y) if abs(center_y)>.03 else center_y/.03
 for k in (0,1):verts.append((x+.003,y+dy*(.003+k*(.011+wave)),z-k*(.004+wave)))
for i in range(len(path)-1):faces.append((2*i,2*i+1,2*i+3,2*i+2))
trim=mesh_obj('continuous gathered apron frill',verts,faces,ivory,'04_Apron_and_Straps');sol=trim.modifiers.new('cloth thickness','SOLIDIFY');sol.thickness=.004
# Strap surfaces, actual 3D band tubes that span shoulders to waist at front and back.
for side in (-1,1):
 def y(v):return -.06+side*v
 path_sweep('front apron shoulder strap '+str(side),[(.075,y(.052),.004),(.092,y(.057),-.04),(.104,y(.06),-.10)],[(.006,.012)]*3,ivory,'04_Apron_and_Straps',12)
 # Thin gathered fabric strip with a rippled outside edge on each shoulder.
 v=[];f=[]
 for i in range(41):
  t=i/40;z=.006-.075*t;x=.087+.016*t;inner=.075+.006*t;outer=inner+.013+.004*(.5+.5*math.cos(t*math.pi*10))
  v.extend([(x,y(inner),z),(x-.002,y(outer),z)])
 for i in range(40):f.append((2*i,2*i+1,2*i+3,2*i+2))
 fr=mesh_obj('shoulder gathered trim '+str(side),v,f,ivory,'04_Apron_and_Straps');so=fr.modifiers.new('ruffle thickness','SOLIDIFY');so.thickness=.003
 path_sweep('back crossed apron strap '+str(side),[(-.018,y(.07),.0),(-.034,y(.005),-.05),(-.040,y(-.055),-.10)],[(.006,.010)]*3,ivory,'04_Apron_and_Straps',12)
 # Individually modelled fabric loop and ribbon tail, with visible folded volume.
 path_sweep('back bow loop '+str(side),[(-.047,y(.005),-.118),(-.049,y(.032),-.105),(-.052,y(.055),-.110),(-.049,y(.043),-.132),(-.047,y(.008),-.123)],[(.005,.008),(.009,.018),(.008,.018),(.009,.018),(.005,.008)],ivory,'04_Apron_and_Straps',16)
 path_sweep('back bow hanging tail '+str(side),[(-.046,y(.012),-.123),(-.048,y(.030),-.150),(-.048,y(.046),-.171)],[(.004,.012),(.004,.015),(.003,.018)],ivory,'04_Apron_and_Straps',12)
sphere('back bow knot',(-.052,-.06,-.12),(.013,.014,.013),ivory,'04_Apron_and_Straps')
# The integrated head revealed an excessive neck gap. Raise only the upper
# bodice/shoulder/collar region smoothly, leaving waist and hand placement fixed.
def upper_lift(z):
 t=max(0,min(1,(z+.10)/.12));return .024*t*t*(3-2*t)
bpy.context.view_layer.update()
for label in ('01_Neck_and_Bodice','02_Sleeves_and_Cuffs','04_Apron_and_Straps'):
 for ob in C[label].objects:
  if ob.type!='MESH':continue
  mw=ob.matrix_world.copy();inv=mw.inverted()
  for vertex in ob.data.vertices:
   p=mw@vertex.co;p.z+=upper_lift(p.z);vertex.co=inv@p
  ob.data.update()
# Chibi legs and fabric socks; toes are rounded closed shapes with sole and strap.
for side in (-1,1):
 cy=-.06+side*.082
 rings('thigh '+str(side),[(-.389,.025,cy,.035,.038),(-.35,.025,cy,.041,.042),(-.31,.025,cy,.041,.043)],skin,'05_Legs_Socks_Shoes',48)
 rings('white sock '+str(side),[(-.455,.025,cy,.034,.036),(-.405,.025,cy,.036,.038),(-.38,.025,cy,.036,.039)],ivory,'05_Legs_Socks_Shoes',48)
 rings('sock cuff '+str(side),[(-.401,.025,cy,.039,.041),(-.386,.025,cy,.039,.041)],ivory,'05_Legs_Socks_Shoes',48)
 # Sock foot and separate shoe construction: outsole, heel, rounded toe, and strap.
 def foot_shell(name,sections,material):
  verts=[];faces=[];N=32
  for x,w,h in sections:
   for i in range(N):
    a=2*math.pi*i/N;verts.append((x,cy+w*math.sin(a),-.495+h*max(0,math.cos(a))))
  for j in range(len(sections)-1):
   for i in range(N):faces.append((j*N+i,j*N+(i+1)%N,(j+1)*N+(j+1)*0+(i+1)%N,(j+1)*N+i))
  faces.extend([tuple(reversed(range(N))),tuple((len(sections)-1)*N+i for i in range(N))]);o=mesh_obj(name,verts,faces,material,'05_Legs_Socks_Shoes');sub=o.modifiers.new('rounded leather','SUBSURF');sub.levels=2;return o
 foot_shell('sock over instep '+str(side),[(-.045,.010,.008),(-.035,.032,.044),(.000,.038,.070),(.035,.039,.064),(.068,.033,.040),(.085,.010,.010)],ivory)
 foot_shell('mary jane heel quarter '+str(side),[(-.050,.008,.006),(-.044,.032,.035),(-.027,.038,.044),(-.010,.039,.036),(.002,.035,.022)],navy)
 foot_shell('rounded mary jane toe cap '+str(side),[(.035,.032,.035),(.050,.041,.045),(.075,.041,.040),(.094,.031,.027),(.105,.012,.010),(.108,.004,.003)],navy)
 # Low outsole shared ground plane, formed as an enclosed flattened ellipse.
 rings('thin shoe outsole '+str(side),[(-.502,.025,cy,.075,.041),(-.495,.025,cy,.075,.041),(-.490,.025,cy,.073,.040)],mid,'05_Legs_Socks_Shoes',64)
 path_sweep('mary jane strap '+str(side),[(.022,cy-.036,-.468),(.024,cy-.025,-.441),(.025,cy,-.420),(.024,cy+.025,-.441),(.022,cy+.036,-.468)],[(.003,.006)]*5,navy,'05_Legs_Socks_Shoes',12)
 sphere('shoe bright button '+str(side),(.098,cy,-.464),(.004,.005,.004),ivory,'05_Legs_Socks_Shoes')
# Import and place source five-finger meshes in the exact same world frame.
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath='E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-body/retopology/assets/selected-hand-v2.glb')
T=Matrix(((0,-.315,0,.04),(.315,0,0,-.06),(0,0,.315,-.19),(0,0,0,1)))
for o in [o for o in bpy.data.objects if o not in before]:
 if o.type!='MESH':continue
 if 'traced open hand' not in o.name:bpy.data.objects.remove(o,do_unlink=True);continue
 # Widen palm around its wrist, give finger pads true thickness, and bend
 # each digit in depth by its own base-to-tip parameter; the thumb extends sideways.
 isleft=o.name.startswith('left');sgn=1 if isleft else -1
 defs=[('thumb',398,882,407,889),('index',395,886.5,398,902),('middle',389,888,389.3,905.5),('ring',383,887,380.4,903.5),('little',378,884.5,373.7,898)]
 digitdefs={}
 for name,bx,by,tx,ty in defs:
  if not isleft:bx=1156-bx;tx=1156-tx
  base=Vector(((bx-580)/260,.20+(835-by)/260));tip=Vector(((tx-580)/260,.20+(835-ty)/260));digitdefs[name]=(base,tip)
 groupnames=[g.name for g in o.vertex_groups];wristx=(397-580)/260 if isleft else ((1156-397)-580)/260
 for v in o.data.vertices:
  pos=Vector((v.co.x,v.co.z));weights={}
  for g in v.groups:
   gn=groupnames[g.group]
   for nm in digitdefs:
    if ' '+nm+' joint ' in gn:weights[nm]=weights.get(nm,0)+g.weight
  strength=min(1,sum(weights.values()));nm=max(weights,key=weights.get) if weights else None
  zprogress=max(0,min(1,(.065-v.co.z)/.13));v.co.x=wristx+(v.co.x-wristx)*(1+.14*zprogress)
  if nm:
   base,tip=digitdefs[nm];direction=tip-base;t=max(0,min(1,(pos-base).dot(direction)/direction.length_squared));centre=base+direction*t;perp=pos-centre
   v.co.x+=perp.x*.25*strength;v.co.z+=perp.y*.25*strength+.012*t*t*strength
   v.co.y-=.042*t*t*strength
   if nm=='thumb':v.co.x+=sgn*.006*t*strength
  v.co.y=-.177+(v.co.y+.177)*1.8
 o.data.update()
 world=o.matrix_world.copy();o.parent=None;o.matrix_world=T@world
 for m in list(o.modifiers):
  if m.type=='ARMATURE':o.modifiers.remove(m)
 for c in list(o.users_collection):c.objects.unlink(o)
 C['06_Hands'].objects.link(o)
# Connected under-clothing volume for later armature and collision authoring.
# It is an editable continuous guide surface, not a bound rig or a physics body.
mb=bpy.data.metaballs.new('underbody continuous field');mb.resolution=.006;mb.render_resolution=.006;mb.threshold=.62
core=bpy.data.objects.new('UNDERBODY_continuous_skin_guide',mb);C['00_Underbody_Internal'].objects.link(core)
def joint_ball(p,r):
 e=mb.elements.new();e.co=p;e.radius=r;e.stiffness=2
def joint_chain(a,b,ra,rb,n):
 for i in range(n+1):
  t=i/n;joint_ball(tuple((1-t)*a[k]+t*b[k] for k in range(3)),ra*(1-t)+rb*t)
joint_chain((.075,-.06,.045),(.035,-.06,-.09),.045,.067,8)
joint_chain((.035,-.06,-.09),(.02,-.06,-.20),.067,.078,7)
for side in (-1,1):
 cy=lambda d:-.06+side*d
 joint_chain((.035,cy(.05),.005),(.04,cy(.13),-.04),.040,.035,7)
 joint_chain((.04,cy(.13),-.04),(.065,cy(.17),-.105),.035,.028,6)
 joint_chain((.065,cy(.17),-.105),(.085,cy(.21),-.17),.028,.019,6)
 joint_chain((.085,cy(.21),-.17),(.096,cy(.228),-.19),.019,.018,4)
 joint_chain((.02,cy(.055),-.19),(.025,cy(.082),-.31),.055,.038,7)
 joint_chain((.025,cy(.082),-.31),(.025,cy(.082),-.43),.038,.030,7)
 joint_chain((.025,cy(.082),-.43),(.045,cy(.082),-.475),.030,.028,4)
bpy.ops.object.select_all(action='DESELECT');core.select_set(True);bpy.context.view_layer.objects.active=core;bpy.ops.object.convert(target='MESH');core=bpy.context.object;core.name='UNDERBODY_continuous_skin_guide';core.hide_render=True;core.hide_set(True);core['usage']='continuous editable volume; no rig, joints or dynamics have been tested'
# Hidden frozen raw whole body for reference; never render together with replacement body.
before=set(bpy.data.objects);bpy.ops.wm.ply_import(filepath='D:/CodexTaskData/dafeiyu-whole-model-reconstruction-20261028/output/canonical-front-v1/character.ply',forward_axis='Y',up_axis='Z')
for o in [o for o in bpy.data.objects if o not in before and o.type=='MESH']:
 for c in list(o.users_collection):c.objects.unlink(o)
 C['90_Frozen_Guide'].objects.link(o);o.name='RAW_GUIDE_HIDDEN';o.hide_render=True;o.hide_set(True)
# Only closed manifold solids are oriented by signed volume; open cloth is left alone.
for group in C.values():
 if group.name=='90_Frozen_Guide':continue
 for ob in group.objects:
  if ob.type!='MESH':continue
  bm=bmesh.new();bm.from_mesh(ob.data)
  if bm.faces and all(e.is_manifold for e in bm.edges) and bm.calc_volume(signed=True)<0:
   bmesh.ops.reverse_faces(bm,faces=list(bm.faces));bm.to_mesh(ob.data);ob.data.update()
  bm.free()
# Soft key/fill and orthographic whole-character frame.
s.render.engine='CYCLES';s.cycles.device='CPU';s.cycles.samples=16;s.render.resolution_x=640;s.render.resolution_y=704;s.render.resolution_percentage=100;s.world=bpy.data.worlds.new('Studio');s.world.color=(.23,.23,.23);s.view_settings.view_transform='Standard';s.view_settings.look='None'
for name,loc,power,size in [('key',(4,-3,5),250,5),('fill',(-2,4,3),100,5)]:
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.size=size;o=bpy.data.objects.new(name,d);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Camera');cam=bpy.data.objects.new('Camera',d);s.collection.objects.link(cam);s.camera=cam;d.type='ORTHO';d.ortho_scale=1.209271;center=Vector((.063081,-.005865,-.002912))
for angle in (0,45,90,180):
 t=math.radians(angle);cam.location=center+Vector((4*math.cos(t),4*math.sin(t),.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=str(P/f'body-v11-{angle:03}.png');bpy.ops.render.render(write_still=True)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(P/'body-native-v11.blend'))











