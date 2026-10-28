import bpy, math, bmesh,json
from mathutils import Matrix,Vector
from pathlib import Path
P=Path('D:/CodexTaskData/dafeiyu-whole-head-20261028'); P.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-form-20261028/projection-v5.blend')
scene=bpy.context.scene
for o in list(bpy.data.objects):
 if o.type=='MESH':
  o.name='REFERENCE__raw_guide_hidden';o.hide_render=True;o.hide_viewport=True
before=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath='E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-face/structural-v3/component/head-local.glb')
new=[o for o in bpy.data.objects if o not in before and o.type=='MESH']
T=Matrix(((0,-.315,0,.14),(.315,0,0,-.06),(0,0,.315,.175),(0,0,0,1)))
root=bpy.data.objects.new('HEAD_ROOT__raw_coordinate_frame',None);scene.collection.objects.link(root)
for o in new:
 world=o.matrix_world.copy();o.parent=None;o.matrix_world=T@world
 for mod in list(o.modifiers):
  if mod.type=='ARMATURE':o.modifiers.remove(mod)
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);o.select_set(False)
 o.parent=root;o.name='FACE__'+o.name
for o in list(bpy.data.objects):
 if o not in before and o not in new and o!=root:bpy.data.objects.remove(o,do_unlink=True)
# Rebuild depth on a smooth shared skull field, retaining projected identity and original surface offsets.
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
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=8
scene.render.resolution_x=720;scene.render.resolution_y=720;scene.render.resolution_percentage=100
scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.world.color=(.15,.15,.15)
# Original eye / face paint stays in embedded source-cover.jpg and its original UV transform.
def mat(name,col,rough=.65):
 m=bpy.data.materials.new(name);m.diffuse_color=(*col,1);m.use_nodes=True;n=m.node_tree.nodes;p=n.get('Principled BSDF');p.inputs['Base Color'].default_value=(*col,1);p.inputs['Roughness'].default_value=rough;p.inputs['Specular IOR Level'].default_value=.22
 p.inputs['Emission Color'].default_value=(*col,1);p.inputs['Emission Strength'].default_value=.35
 return m
blue=mat('Hair cobalt blue',(0.035,.105,.275));dark=mat('Hair recessed navy',(0.018,.050,.13));white=mat('Maid ivory cloth',(.86,.85,.79));bowblue=mat('Bow ocean blue',(.035,.25,.46));skin=mat('Neck warm ivory',(.69,.53,.37))
def meshobj(name,verts,faces,material):
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new(name,me);scene.collection.objects.link(ob);ob.parent=root;me.materials.append(material)
 bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(me);bm.free()
 for p in me.polygons:p.use_smooth=True
 return ob
# Smooth noncircular closed leaf locks. The cross section is lens-shaped, with separately controlled width and thickness.
def cat(seq,t):
 n=len(seq);f=max(0,min(n-1-1e-7,t*(n-1)));i=int(f);u=f-i
 a=seq[max(0,i-1)];b=seq[i];c=seq[min(n-1,i+1)];d=seq[min(n-1,i+2)]
 return .5*(2*b+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u)
def leaf(name,points,widths,depths,material=blue,sideaxis=(0,1,0),steps=65):
 ps=[Vector(p) for p in points];ws=list(widths);ds=list(depths);vs=[];fs=[];N=20
 for i in range(steps):
  t=i/(steps-1);c=cat(ps,t);tan=(cat(ps,min(1,t+.001))-cat(ps,max(0,t-.001))).normalized();normal=Vector((1,0,0));normal=(normal-tan*normal.dot(tan)).normalized();axis=normal.cross(tan).normalized()
  if sideaxis!=(0,1,0) and name.startswith('HAIR__crown'):
   axis=Vector(sideaxis);axis=(axis-tan*axis.dot(tan)).normalized();normal=tan.cross(axis).normalized()
  w=max(.0002,cat(ws,t));dep=max(.0002,cat(ds,t))
  for j in range(N):
   a=2*math.pi*j/N;q=c+axis*(w*math.cos(a))+normal*(dep*math.sin(a));vs.append(q)
 for i in range(steps-1):
  for j in range(N):fs.append((i*N+j,i*N+(j+1)%N,(i+1)*N+(j+1)%N,(i+1)*N+j))
 fs.extend([tuple(reversed(range(N))),tuple((steps-1)*N+j for j in range(N))])
 return meshobj(name,vs,fs,material)
# Closed cap following full skull; forehead edge is under bangs, rear edge reaches nape.
vs=[];fs=[];N=96;M=40
for inner in (0,1):
 for i in range(M):
  v=i/(M-1)
  for j in range(N):
   phi=2*math.pi*j/N;f=(math.cos(phi)+1)/2;limit=2.75-1.33*f**2;theta=.001+v*(limit-.001)
   shrink=inner*.008
   x=.135+(.170-shrink)*math.sin(theta)*math.cos(phi);y=-.06+(.213-shrink)*math.sin(theta)*math.sin(phi);z=.25+(.174-shrink)*math.cos(theta)
   vs.append((x,y,z))
for h in (0,1):
 for i in range(M-1):
  for j in range(N):
   ids=(h*M*N+i*N+j,h*M*N+i*N+(j+1)%N,h*M*N+(i+1)*N+(j+1)%N,h*M*N+(i+1)*N+j);fs.append(ids if h==0 else ids[::-1])
for j in range(N):
 fs.append(((M-1)*N+j,(M-1)*N+(j+1)%N,(2*M-1)*N+(j+1)%N,(2*M-1)*N+j))
 fs.append((j,j+M*N,(j+1)%N+M*N,(j+1)%N))
cap=meshobj('HAIR__closed_scalp_foundation',vs,fs,dark)
# Broad curled central bang and long cheek framing locks.
leaf('HAIR__bang_center',[(.17,-.065,.424),(.257,-.056,.383),(.299,-.045,.313),(.310,-.046,.252),(.305,-.071,.207),(.297,-.089,.216)],[.015,.050,.061,.053,.015,.0003],[.005,.018,.024,.023,.010,.0003])
for sign in (-1,1):
 y=lambda v:-.06+sign*v
 leaf('HAIR__bang_swept_'+str(sign),[(.155,y(.012),.421),(.248,y(.077),.385),(.283,y(.125),.307),(.279,y(.146),.228),(.274,y(.143),.161),(.277,y(.118),.147)],[.016,.048,.053,.046,.026,.0003],[.005,.020,.027,.024,.013,.0003])
 leaf('HAIR__cheek_frame_'+str(sign),[(.117,y(.045),.417),(.195,y(.141),.365),(.226,y(.194),.277),(.222,y(.204),.182),(.237,y(.182),.111),(.251,y(.133),.105)],[.015,.044,.048,.043,.032,.0003],[.005,.018,.028,.029,.017,.0003])
 # Independent broad S waves staggered in depth and termination, rooted into the rear cap.
 for k in range(3):
  dep=.035-.052*k; low=.036*k
  pts=[(.06-k*.026,y(.145),.295),(-.01-k*.025,y(.185),.19),(dep-.03,y(.21),.10),(dep,y(.263),.025-low*.3),(dep+.018,y(.283),-.040-low*.5),(dep+.028,y(.248),-.075-low),(dep+.035,y(.289),-.090-low),(dep+.025,y(.326),-.060-low)]
  leaf('HAIR__long_wave_%s_%s'%(sign,k),pts,[.032,.045,.043,.053,.052,.037,.022,.0003],[.012,.021,.024,.024,.023,.018,.010,.0003])
 # Inner shorter corkscrew at side neck, curved as a mass rather than a cylinder.
 leaf('HAIR__inner_curl_'+str(sign),[(.105,y(.16),.23),(.08,y(.19),.14),(.085,y(.175),.07),(.13,y(.14),.034),(.15,y(.165),.05)],[.03,.039,.036,.025,.0003],[.018,.021,.024,.016,.0003])
# Flow color uses fixed object coordinates, with source-like cyan tips and navy roots.
for hairmat in [blue,dark]:
 n=hairmat.node_tree.nodes;L=hairmat.node_tree.links;p=n.get('Principled BSDF')
 geo=n.new('ShaderNodeNewGeometry');sep=n.new('ShaderNodeSeparateXYZ');ramp=n.new('ShaderNodeValToRGB')
 L.new(geo.outputs['Position'],sep.inputs[0]);L.new(sep.outputs['Z'],ramp.inputs[0])
 r=ramp.color_ramp;r.elements.remove(r.elements[1]);r.elements[0].position=0;r.elements[0].color=(.025,.18,.40,1)
 for pos,col in [(.14,(.025,.085,.26,1)),(.30,(.032,.085,.23,1)),(.44,(.035,.12,.30,1))]:r.elements.new(pos).color=col
 if hairmat==dark:
  for e in r.elements:e.color=tuple(v*.65 if i<3 else v for i,v in enumerate(e.color))
 L.new(ramp.outputs[0],p.inputs['Base Color']);L.new(ramp.outputs[0],p.inputs['Emission Color']);p.inputs['Emission Strength'].default_value=.45
# crown rear groom strips
for j in range(7):
 ph=math.pi*.48+j*math.pi*.1733333
 pts=[]
 for th in (.1,.55,1.05,1.55,2.1,2.65):
  pts.append((.135+.179*math.sin(th)*math.cos(ph),-.06+.222*math.sin(th)*math.sin(ph),.25+.182*math.cos(th)))
 leaf('HAIR__crown_rear_panel_'+str(j),pts,[.012,.037,.047,.053,.050,.0003],[.004,.008,.010,.012,.011,.0003],blue,sideaxis=(-math.sin(ph),math.cos(ph),0))
# ahoge loop, broad asymmetric arc connected to crown
leaf('HAIR__whale_ahoge',[(.152,-.057,.421),(.16,-.004,.460),(.149,-.027,.495),(.14,-.086,.497),(.14,-.120,.471),(.151,-.112,.442)],[.010,.014,.018,.018,.014,.0003],[.003,.006,.007,.006,.004,.0003],blue)
# Headband is a continuous inset band above scalp, arc left to right, then a gathered skirt at its back edge.
vs=[];fs=[];A=97;B=12
for i in range(A):
 a=-math.pi*.49+math.pi*.98*i/(A-1)
 for j in range(B):
  t=j/(B-1);x=.108-.050*t;y=-.06+.226*math.sin(a);z=.25+.19*math.cos(a)
  vs.append((x,y,z))
for i in range(A-1):
 for j in range(B-1):fs.append((i*B+j,(i+1)*B+j,(i+1)*B+j+1,i*B+j+1))
ob=meshobj('HEADWEAR__continuous_satin_band',vs,fs,white);mod=ob.modifiers.new('fabric thickness','SOLIDIFY');mod.thickness=.004
vs=[];fs=[]
for i in range(A):
 a=-math.pi*.49+math.pi*.98*i/(A-1);g=.5+.5*math.cos(38*a)
 for j in range(B):
  t=j/(B-1);r=.226+.027*t+ .010*g*t;x=.061-.018*t+.013*math.sin(38*a)*t;y=-.06+r*math.sin(a);z=.25+(.19+.027*t+.010*g*t)*math.cos(a)
  vs.append((x,y,z))
for i in range(A-1):
 for j in range(B-1):fs.append((i*B+j,(i+1)*B+j,(i+1)*B+j+1,i*B+j+1))
ob=meshobj('HEADWEAR__gathered_ruffle',vs,fs,white);mod=ob.modifiers.new('folded cloth thickness','SOLIDIFY');mod.thickness=.003
# side bows and flipper ears: broad closed shapes; blue upper and ivory inner fin.
for sg in (-1,1):
 y=lambda a:-.06+sg*a
 for k in (-1,1):
  leaf('HEADWEAR__bow_wing_%s_%s'%(sg,k),[(.155,y(.216),.248),(.161,y(.23+k*.018),.25+k*.014),(.157,y(.24+k*.024),.25+k*.027)],[.006,.020,.0008],[.008,.012,.0008],bowblue,sideaxis=(0,0,1))
 bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,location=(.17,y(.226),.252));ob=bpy.context.object;ob.name='HEADWEAR__bow_knot_'+str(sg);ob.scale=(.014,.014,.018);ob.data.materials.append(bowblue);ob.parent=root
 leaf('ACCESSORY__whale_side_fin_'+str(sg),[(.055,y(.19),.185),(.085,y(.248),.16),(.105,y(.30),.163),(.11,y(.337),.184)],[.018,.030,.024,.0003],[.014,.016,.014,.0003],dark,sideaxis=(0,0,1))
 leaf('ACCESSORY__fin_ivory_inset_'+str(sg),[(.072,y(.205),.173),(.105,y(.25),.149),(.125,y(.298),.158),(.116,y(.327),.179)],[.009,.014,.012,.0003],[.007,.008,.006,.0003],white,sideaxis=(0,0,1))
# Defined neck transition object; body matches lower ring, no duplicated raw head.
bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,location=(.105,-.06,.049));ob=bpy.context.object;ob.name='SKIN__neck_interface';ob.scale=(.041,.043,.035);ob.data.materials.append(skin);ob.parent=root
# one broad softbox gives actual geometry visible light/shadow
for o in list(bpy.data.objects):
 if o.type=='LIGHT':bpy.data.objects.remove(o,do_unlink=True)
for nm,loc,en,size in [('Key',(3,-4,5),180,4),('Fill',(2,4,3),100,4),('Rim',(-3,0,4),120,3)]:
 d=bpy.data.lights.new(nm,'AREA');d.energy=en;d.size=size;o=bpy.data.objects.new(nm,d);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((.1,-.06,.2))-o.location).to_track_quat('-Z','Y').to_euler()
cam=scene.camera;center=Vector((.10,-.06,.20));cam.data.ortho_scale=.82
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(P/'native-v3a.blend'))
for ang in [0,45,90,180]:
 a=math.radians(ang);cam.location=center+Vector((4*math.cos(a),4*math.sin(a),.025));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(P/f'head-v3a-{ang:03}.png');bpy.ops.render.render(write_still=True)
