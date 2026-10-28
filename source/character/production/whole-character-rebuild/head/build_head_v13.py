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
# A new constrained continuous facial surface replaces the folded source depth cage.
# Original eye outlines and source UV drawing are retained in projection; the old folded skin is removed.
from mathutils.geometry import delaunay_2d_cdt
from mathutils.kdtree import KDTree
struct=json.loads(Path('E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-face/structural-v3/component/structure.json').read_text())
sk=next(o for o in new if 'head skin sockets' in o.name)
oldcolors={};oldattr=sk.data.color_attributes[0]
for li,l in enumerate(sk.data.loops):oldcolors[l.vertex_index]=tuple(oldattr.data[li].color)
samples=[(v.co.copy(),oldcolors.get(v.index,(.635,.548,.425,1))) for v in sk.data.vertices if v.co.x>.15]
skd=KDTree(len(samples))
for i,(v,c) in enumerate(samples):skd.insert((v.y,v.z,0),i)
skd.balance()
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
  ids.append(len(verts));verts.append((.135-.103*math.sqrt(max(0,1-r**2.5)),-.06+(y+.06)*r,.216+(z-.216)*r))
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
# Remove an underside patch and bridge its actual boundary to an elliptical neck interface.
bm=bmesh.new();bm.from_mesh(me)
remove=[f for f in bm.faces if f.calc_center_median().z<.09 and ((f.calc_center_median().x-.105)/.040)**2+((f.calc_center_median().y+.06)/.043)**2<1]
bmesh.ops.delete(bm,geom=remove,context='FACES')
bound=[v for v in bm.verts if v.is_boundary and v.co.z<.095]
bound.sort(key=lambda v:math.atan2((v.co.y+.06)/.043,(v.co.x-.105)/.040))
prev=bound
for k,z in enumerate([.048,.035,.020]):
 ring=[]
 for v in bound:
  a=math.atan2((v.co.y+.06)/.043,(v.co.x-.105)/.040);rr=1 if k>0 else 1.03
  ring.append(bm.verts.new((.105+.040*rr*math.cos(a),-.06+.043*rr*math.sin(a),z)))
 for j in range(len(prev)):
  try:bm.faces.new((prev[j],prev[(j+1)%len(prev)],ring[(j+1)%len(prev)],ring[j]))
  except ValueError:pass
 prev=ring
bm.faces.new(tuple(reversed(prev)));bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(me);bm.free()
sk.data=me
# Actual source face paint is now on the continuous skin surface, feathered at the old cutout boundary.
from mathutils.bvhtree import BVHTree
import numpy as np
paint=next(o for o in new if 'reference skin, nose' in o.name);uv=paint.data.uv_layers[0]
rows=[];uvs=[]
for poly in paint.data.polygons:
 for li in poly.loop_indices:
  v=paint.data.vertices[paint.data.loops[li].vertex_index].co;rows.append((v.y,v.z,1));uvs.append(tuple(uv.data[li].uv))
coef=np.linalg.lstsq(np.array(rows),np.array(uvs),rcond=None)[0]
projected=[Vector((0,v.co.y,v.co.z)) for v in paint.data.vertices];polys=[tuple(p.vertices) for p in paint.data.polygons]
bvh=BVHTree.FromPolygons(projected,polys,all_triangles=False)
count={}
for f in polys:
 for j in range(len(f)):
  e=tuple(sorted((f[j],f[(j+1)%len(f)])));count[e]=count.get(e,0)+1
pbm=bmesh.new();pbm.from_mesh(paint.data);bmesh.ops.remove_doubles(pbm,verts=pbm.verts,dist=.000001);boundary=[Vector((0,v.co.y,v.co.z)) for v in pbm.verts if v.is_boundary];pbm.free()
bkd=KDTree(len(boundary))
for i,v in enumerate(boundary):bkd.insert(v,i)
bkd.balance()
texuv=me.uv_layers.new(name='SourceFaceUV');mask=me.color_attributes.new(name='SourcePaintMask',type='FLOAT_COLOR',domain='CORNER')
me.color_attributes.new(name='SourceSkinBase',type='FLOAT_COLOR',domain='CORNER');texuv=me.uv_layers['SourceFaceUV'];mask=me.color_attributes['SourcePaintMask'];basecolors=me.color_attributes['SourceSkinBase']
for li,l in enumerate(me.loops):
 v=me.vertices[l.vertex_index].co
 near=skd.find_n((v.y,v.z,0),5);ws=[1/(d+.002)**2 for _,i,d in near];cols=[samples[i][1] for _,i,d in near];basecolors.data[li].color=tuple(sum(c[j]*w for c,w in zip(cols,ws))/sum(ws) for j in range(4))
 u=np.array((v.y,v.z,1))@coef;texuv.data[li].uv=tuple(u)
 hit=bvh.ray_cast(Vector((1,v.y,v.z)),Vector((-1,0,0)),2)[0]
 dist=bkd.find((0,v.y,v.z))[2] if hit is not None else 0
 w=min(1,dist/.008) if hit is not None and v.x>.136 else 0;w=w*w*(3-2*w);mask.data[li].color=(w,w,w,1)
mat=bpy.data.materials.new('Original facial paint unified smooth skin');mat.use_nodes=True;n=mat.node_tree.nodes;n.clear();L=mat.node_tree.links
out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');mix=n.new('ShaderNodeMixRGB');vc=n.new('ShaderNodeVertexColor');vc.layer_name='SourcePaintMask';tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images['source-cover.jpg'];uvnode=n.new('ShaderNodeUVMap');uvnode.uv_map='SourceFaceUV';mapping=n.new('ShaderNodeMapping');mapping.inputs['Location'].default_value=(0,1,0);mapping.inputs['Scale'].default_value=(1,-1,1)
basenode=n.new('ShaderNodeVertexColor');basenode.layer_name='SourceSkinBase';L.new(basenode.outputs['Color'],mix.inputs[1])
L.new(uvnode.outputs[0],mapping.inputs[0]);L.new(mapping.outputs[0],tex.inputs[0]);L.new(vc.outputs['Color'],mix.inputs[0]);L.new(tex.outputs[0],mix.inputs[2]);L.new(mix.outputs[0],em.inputs[0]);L.new(em.outputs[0],out.inputs[0]);me.materials.append(mat)
for o in new:
 if o==paint or 'deforming skin' in o.name:o.hide_render=True;o.hide_viewport=True
for p in me.polygons:p.use_smooth=True
sk.name='FACE__continuous head skin sockets oral lining and neck'
# Smooth normals follow the actual analytic surface, avoiding triangulation-dependent seam shading.
norm=[]
for li,l in enumerate(me.loops):
 v=me.vertices[l.vertex_index].co;yy=v.y+.06;zz=v.z-.216;q=abs(yy/.189)**2.5+abs(zz/.162)**2.5
 fx=face_x(v.y,v.z);bx=.135-.103*math.sqrt(max(0,1-q));normal=me.corner_normals[li].vector.copy()
 if abs(v.x-fx)<.0001 and v.z>.06:
  if q<.998:
   h=.00001;dy=(face_x(v.y+h,v.z)-face_x(v.y-h,v.z))/(2*h);dz=(face_x(v.y,v.z+h)-face_x(v.y,v.z-h))/(2*h);normal=Vector((1,-dy,-dz)).normalized()
  else:normal=Vector((0,math.copysign(abs(yy)**1.5,yy)/.189**2.5,math.copysign(abs(zz)**1.5,zz)/.162**2.5)).normalized()
 elif abs(v.x-bx)<.0001 and v.z>.06:
  normal=Vector((2*(v.x-.135)/.103**2,2.5*math.copysign(abs(yy)**1.5,yy)/.189**2.5,2.5*math.copysign(abs(zz)**1.5,zz)/.162**2.5)).normalized()
 norm.append(tuple(normal))
me.normals_split_custom_set(norm)
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
def cap_pos(v,phi,inner=0):
 c=math.cos(phi);si=math.sin(phi);f=(c+1)/2;limit=2.94-1.52*f*f;theta=.001+v*(limit-.001);shrink=inner*.008
 p=Vector((.135+(.170-shrink)*math.sin(theta)*c,-.06+(.213-shrink)*math.sin(theta)*si,.235+(.189-shrink)*math.cos(theta)))
 end=Vector((.135+.170*math.sin(limit)*c,-.06+.213*math.sin(limit)*si,.235+.189*math.cos(limit)))
 target=Vector((.09+.215*max(0,c)-.05*max(0,-c),-.06+.205*si,.125+.145*max(0,c)**2-.070*max(0,-c)**2))
 return p+(target-end)*v**4
vs=[];fs=[];N=96;M=40
for inner in (0,1):
 for i in range(M):
  v=i/(M-1)
  for j in range(N):
   phi=2*math.pi*j/N;vs.append(tuple(cap_pos(v,phi,inner)))
for h in (0,1):
 for i in range(M-1):
  for j in range(N):
   ids=(h*M*N+i*N+j,h*M*N+i*N+(j+1)%N,h*M*N+(i+1)*N+(j+1)%N,h*M*N+(i+1)*N+j);fs.append(ids if h==0 else ids[::-1])
for j in range(N):
 fs.append(((M-1)*N+j,(M-1)*N+(j+1)%N,(2*M-1)*N+(j+1)%N,(2*M-1)*N+j))
 fs.append((j,j+M*N,(j+1)%N+M*N,(j+1)%N))
cap=meshobj('HAIR__closed_scalp_foundation',vs,fs,dark)
# Broad curled central bang and long cheek framing locks.
leaf('HAIR__bang_center',[(.17,-.065,.424),(.257,-.056,.383),(.299,-.045,.313),(.310,-.046,.252),(.305,-.071,.181),(.297,-.089,.195)],[.015,.050,.061,.053,.015,.0003],[.004,.010,.013,.012,.006,.0003])
for sign in (-1,1):
 y=lambda v:-.06+sign*v
 leaf('HAIR__bang_swept_'+str(sign),[(.155,y(.012),.421),(.248,y(.077),.385),(.283,y(.125),.307),(.279,y(.146),.228),(.287,y(.143),.130),(.292,y(.118),.112)],[.013,.041,.044,.037,.014,.0003],[.004,.010,.013,.012,.006,.0003])
 leaf('HAIR__cheek_frame_'+str(sign),[(.117,y(.045),.417),(.195,y(.141),.365),(.226,y(.194),.277),(.222,y(.204),.182),(.278,y(.174),.105),(.287,y(.127),.101)],[.012,.035,.038,.034,.018,.0003],[.004,.010,.013,.013,.008,.0003])
 # Independent broad S waves staggered in depth and termination, rooted into the rear cap.
 # Three genuinely broad, thin, closed S-locks; each has its own swept volume and curved pointed outline.
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
 # Inner shorter corkscrew at side neck, curved as a mass rather than a cylinder.
 leaf('HAIR__inner_curl_'+str(sign),[(.105,y(.16),.23),(.08,y(.19),.14),(.085,y(.175),.07),(.13,y(.14),.034),(.15,y(.165),.05)],[.025,.029,.025,.015,.0003],[.009,.012,.012,.006,.0003])
# Flow color uses fixed object coordinates, with source-like cyan tips and navy roots.
for hairmat in [blue,dark]:
 n=hairmat.node_tree.nodes;L=hairmat.node_tree.links;p=n.get('Principled BSDF')
 geo=n.new('ShaderNodeNewGeometry');sep=n.new('ShaderNodeSeparateXYZ');ramp=n.new('ShaderNodeValToRGB')
 L.new(geo.outputs['Position'],sep.inputs[0]);L.new(sep.outputs['Z'],ramp.inputs[0])
 r=ramp.color_ramp;r.elements.remove(r.elements[1]);r.elements[0].position=0;r.elements[0].color=(.020,.115,.29,1)
 for pos,col in [(.14,(.025,.085,.26,1)),(.30,(.032,.085,.23,1)),(.44,(.035,.12,.30,1))]:r.elements.new(pos).color=col
 if hairmat==dark:
  for e in r.elements:e.color=tuple(v*.65 if i<3 else v for i,v in enumerate(e.color))
 L.new(ramp.outputs[0],p.inputs['Base Color']);L.new(ramp.outputs[0],p.inputs['Emission Color']);p.inputs['Emission Strength'].default_value=.45
# crown rear groom strips
for j in range(7):
 ph=math.pi*.53+j*math.pi*.1566667
 pts=[]
 for v in (.03,.24,.45,.66,.84,1.0):
  p=cap_pos(v,ph);p+=Vector((math.cos(ph)*.007,math.sin(ph)*.007,.006*(1-v)));pts.append(tuple(p))
 leaf('HAIR__crown_rear_panel_'+str(j),pts,[.012,.037,.047,.053,.050,.0003],[.004,.008,.010,.012,.011,.0003],blue,sideaxis=(-math.sin(ph),math.cos(ph),0))
# ahoge loop, broad asymmetric arc connected to crown
leaf('HAIR__whale_ahoge',[(.150,-.060,.424),(.160,-.047,.465),(.150,-.076,.495),(.140,-.120,.497),(.145,-.157,.475),(.150,-.168,.450),(.160,-.151,.433)],[.009,.015,.020,.018,.013,.008,.0003],[.004,.007,.008,.007,.006,.004,.0003],blue)
# Original selected hairstyle paint, fixed to mesh UVs, supplements the new volume on forward bangs only.
paintHair=bpy.data.materials.new('Selected original blue hair paint on new volume');paintHair.use_nodes=True;n=paintHair.node_tree.nodes;L=paintHair.node_tree.links;p=n.get('Principled BSDF');p.inputs['Roughness'].default_value=.72;p.inputs['Specular IOR Level'].default_value=.16
tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load('E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-geometry/hair-continuity-v1/reports/root-front.png',check_existing=True)
uvn=n.new('ShaderNodeUVMap');uvn.uv_map='SelectedHairPaint';L.new(uvn.outputs[0],tex.inputs[0]);sep=n.new('ShaderNodeSeparateColor');L.new(tex.outputs[0],sep.inputs[0])
ratio=n.new('ShaderNodeMath');ratio.operation='MULTIPLY';ratio.inputs[1].default_value=1.1;L.new(sep.outputs['Red'],ratio.inputs[0]);isblue=n.new('ShaderNodeMath');isblue.operation='GREATER_THAN';L.new(sep.outputs['Blue'],isblue.inputs[0]);L.new(ratio.outputs[0],isblue.inputs[1]);weight=n.new('ShaderNodeVertexColor');weight.layer_name='SelectedHairWeight';mul=n.new('ShaderNodeMath');mul.operation='MULTIPLY';L.new(isblue.outputs[0],mul.inputs[0]);L.new(weight.outputs['Color'],mul.inputs[1]);mix=n.new('ShaderNodeMixRGB');mix.inputs[1].default_value=(.027,.075,.20,1);L.new(mul.outputs[0],mix.inputs[0]);L.new(tex.outputs[0],mix.inputs[2]);L.new(mix.outputs[0],p.inputs['Base Color']);L.new(mix.outputs[0],p.inputs['Emission Color']);p.inputs['Emission Strength'].default_value=.65
for o in bpy.data.objects:
 if o.type=='MESH' and (o.name.startswith('HAIR__bang') or o.name.startswith('HAIR__cheek')):
  me=o.data;me.uv_layers.new(name='SelectedHairPaint');me.color_attributes.new(name='SelectedHairWeight',type='FLOAT_COLOR',domain='CORNER');uv=me.uv_layers['SelectedHairPaint'];att=me.color_attributes['SelectedHairWeight']
  for li,l in enumerate(me.loops):
   v=me.vertices[l.vertex_index];px=283+(v.co.y+.06)/.00152;py=(.55-v.co.z)/.00152;uv.data[li].uv=(px/640,1-py/704)
   f=lambda a,b,x:max(0,min(1,(x-a)/(b-a)))
   region=f(155,180,px)*f(405,380,px)*f(95,115,py)*f(185,165,py)
   w=.90*max(0,min(1,(v.normal.x-.10)/.70))*region;att.data[li].color=(w,w,w,1)
  me.materials.clear();me.materials.append(paintHair)
# Headband is a continuous inset band above scalp, arc left to right, then a gathered skirt at its back edge.
capbvh=BVHTree.FromPolygons([v.co for v in cap.data.vertices],[p.vertices[:] for p in cap.data.polygons])
def bandpos(a,x,extra=0):
 d=Vector((0,math.sin(a),math.cos(a)));origin=Vector((x,-.06,.25));hit=capbvh.ray_cast(origin+d*.5,-d,1)[0]
 return (hit if hit is not None else origin+d*.22)+d*(.012+extra)
vs=[];fs=[];A=257;B=16
for i in range(A):
 a=-math.pi*.49+math.pi*.98*i/(A-1)
 for j in range(B):
  t=j/(B-1);x=.108-.050*t;vs.append(tuple(bandpos(a,x)))
for i in range(A-1):
 for j in range(B-1):fs.append((i*B+j,(i+1)*B+j,(i+1)*B+j+1,i*B+j+1))
ob=meshobj('HEADWEAR__continuous_satin_band',vs,fs,white);mod=ob.modifiers.new('fabric thickness','SOLIDIFY');mod.thickness=.004
vs=[];fs=[]
for i in range(A):
 a=-math.pi*.49+math.pi*.98*i/(A-1);g=.5+.5*math.cos(32*a)
 for j in range(B):
  t=j/(B-1);x=.061-.018*t+.008*math.sin(32*a)*t;vs.append(tuple(bandpos(a,x,.027*t+.007*g*t)))
for i in range(A-1):
 for j in range(B-1):fs.append((i*B+j,(i+1)*B+j,(i+1)*B+j+1,i*B+j+1))
ob=meshobj('HEADWEAR__gathered_ruffle',vs,fs,white);mod=ob.modifiers.new('folded cloth thickness','SOLIDIFY');mod.thickness=.003
# side bows and flipper ears: broad closed shapes; blue upper and ivory inner fin.
for sg in (-1,1):
 y=lambda a:-.06+sg*a
 for k in (-1,1):
  leaf('HEADWEAR__bow_wing_%s_%s'%(sg,k),[(.270,y(.226),.252),(.278,y(.226+k*.018),.252+k*.004),(.270,y(.226+k*.034),.252+k*.006)],[.004,.013,.020],[.006,.009,.001],bowblue,sideaxis=(0,0,1))
 bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,location=(.285,y(.226),.252));ob=bpy.context.object;ob.name='HEADWEAR__bow_knot_'+str(sg);ob.scale=(.010,.010,.013);ob.data.materials.append(bowblue);ob.parent=root
 leaf('ACCESSORY__whale_side_fin_'+str(sg),[(.055,y(.19),.185),(.085,y(.248),.16),(.105,y(.30),.163),(.11,y(.337),.184)],[.018,.030,.024,.0003],[.014,.016,.014,.0003],dark,sideaxis=(0,0,1))
 leaf('ACCESSORY__fin_ivory_inset_'+str(sg),[(.072,y(.205),.173),(.105,y(.25),.149),(.125,y(.298),.158),(.116,y(.327),.179)],[.009,.014,.012,.0003],[.007,.008,.006,.0003],white,sideaxis=(0,0,1))
# Defined neck transition object; body matches lower ring, no duplicated raw head.
ob=bpy.data.objects.new('INTERFACE__neck_center_0105_m006_0045',None);scene.collection.objects.link(ob);ob.location=(.105,-.06,.045);ob.parent=root;ob['radius_x']=.040;ob['radius_y']=.043
# one broad softbox gives actual geometry visible light/shadow
for o in list(bpy.data.objects):
 if o.type=='LIGHT':bpy.data.objects.remove(o,do_unlink=True)
for nm,loc,en,size in [('Key',(3,-4,5),180,4),('Fill',(2,4,3),100,4),('Rim',(-3,0,4),120,3)]:
 d=bpy.data.lights.new(nm,'AREA');d.energy=en;d.size=size;o=bpy.data.objects.new(nm,d);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((.1,-.06,.2))-o.location).to_track_quat('-Z','Y').to_euler()
cam=scene.camera;center=Vector((.10,-.06,.20));cam.data.ortho_scale=.82
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(P/'native-v13.blend'))
for ang in [0,45,90,180]:
 a=math.radians(ang);cam.location=center+Vector((4*math.cos(a),4*math.sin(a),.025));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(P/f'head-v13-{ang:03}.png');bpy.ops.render.render(write_still=True)
