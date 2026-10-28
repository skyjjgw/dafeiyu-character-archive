"""Native editable body/rig/cloth study. Run with project Blender 4.5.

No source portrait is used as geometry. Native skin is one connected surface;
clothes are independent volumes/mid-surfaces. No full action or cache is baked.
"""
import bpy,bmesh,json,math,hashlib,time,traceback,sys
from pathlib import Path
from mathutils import Vector,Matrix
from mathutils.geometry import interpolate_bezier

OUT=Path(__file__).resolve().parent.parent
MASTER=OUT/'body-v2.blend';REPORT=OUT/'body-v2-manifest.json'
START=time.perf_counter();FAILURES=[]
if REPORT.exists():
 try:FAILURES=list(json.loads(REPORT.read_text(encoding='utf8')).get('failure_records',[]))
 except Exception:pass
NAMES={};REST={};WEIGHTS=[]
BODY_LEVELS=[(.90,.34,.21),(.97,.37,.23),(1.08,.35,.225),(1.22,.29,.20),(1.34,.30,.21),(1.43,.34,.23),(1.49,.365,.225),(1.55,.38,.215),(1.61,.375,.20),(1.67,.32,.17),(1.71,.21,.13),(1.755,.095,.09),(1.82,.09,.085)]
TAIL_PATH=[Vector(p)for p in[(.25,.24,.90),(.45,.26,.68),(.65,.28,.50),(.85,.26,.52),(1.05,.22,.60),(1.16,.20,.67)]]
def lerp(a,b,t):return a+(b-a)*t
def smooth(a,b,x):
 t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
def own_collection(name):
 c=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(c);return c
def move(o,c):
 for old in list(o.users_collection):old.objects.unlink(o)
 c.objects.link(o)
def material(name,color):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 n=m.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');rgb=n.new('ShaderNodeShaderToRGB');diff=n.new('ShaderNodeBsdfDiffuse');ramp=n.new('ShaderNodeValToRGB')
 diff.inputs['Color'].default_value=(.8,.8,.8,1);ramp.color_ramp.elements.remove(ramp.color_ramp.elements[1])
 for i,(position,factor)in enumerate([(0,.62),(.35,.84),(.68,1)]):
  e=ramp.color_ramp.elements[0]if i==0 else ramp.color_ramp.elements.new(position);e.position=position;e.color=(*(v*factor for v in color),1)
 ramp.color_ramp.interpolation='CONSTANT'
 for a,b in[(diff.outputs[0],rgb.inputs[0]),(rgb.outputs[0],ramp.inputs[0]),(ramp.outputs[0],em.inputs[0]),(em.outputs[0],out.inputs[0])]:m.node_tree.links.new(a,b)
 return m
def mesh_object(name,verts,faces,collection,materials=None):
 me=bpy.data.meshes.new(name+' topology');me.from_pydata(verts,[],faces);me.update()
 bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(me);bm.free()
 o=bpy.data.objects.new(name,me);collection.objects.link(o)
 for m in materials or[]:me.materials.append(m)
 for p in me.polygons:p.use_smooth=True
 uv=me.uv_layers.new(name='Native cylindrical layout')
 for p in me.polygons:
  for li in p.loop_indices:
   co=me.vertices[me.loops[li].vertex_index].co;uv.data[li].uv=(math.atan2(co.y,co.x)/(2*math.pi)+.5,co.z/2)
 return o
class Surface:
 def __init__(self):self.v=[];self.f=[];self.w=[];self.tags=[]
 def vertex(self,p,w):self.v.append(tuple(p));self.w.append(w);return len(self.v)-1
 def face(self,ids,tag):self.f.append(tuple(ids));self.tags.append(tag)
 def ring(self,points,weights):return[self.vertex(p,weights(i,p))for i,p in enumerate(points)]
 def bridge(self,a,b,tag):
  # Match the two boundary shapes spatially; no merged overlapping primitives.
  if len(a)==len(b):
   choices=[]
   for rev in[False,True]:
    q=b[::-1]if rev else b
    for off in range(len(q)):
     r=q[off:]+q[:off];cost=sum((Vector(self.v[x])-Vector(self.v[y])).length_squared for x,y in zip(a,r));choices.append((cost,r))
   b=min(choices,key=lambda p:p[0])[1]
  ia=ib=0;na,nb=len(a),len(b)
  while ia<na or ib<nb:
   aa,bb=a[ia%na],b[ib%nb];ta=(ia+1)/na if ia<na else 2;tb=(ib+1)/nb if ib<nb else 2
   if abs(ta-tb)<1e-9:self.face([aa,a[(ia+1)%na],b[(ib+1)%nb],bb],tag);ia+=1;ib+=1
   elif ta<tb:self.face([aa,a[(ia+1)%na],bb],tag);ia+=1
   else:self.face([aa,b[(ib+1)%nb],bb],tag);ib+=1
  return b
 def cap(self,ring,tag,w):
  p=sum((Vector(self.v[i])for i in ring),Vector())/len(ring);c=self.vertex(p,w)
  for i in range(len(ring)):self.face([ring[i],ring[(i+1)%len(ring)],c],tag)
 def compact(self):
  used=sorted({i for face in self.f for i in face});mapping={old:new for new,old in enumerate(used)}
  self.v=[self.v[i]for i in used];self.w=[self.w[i]for i in used];self.f=[tuple(mapping[i]for i in face)for face in self.f]

def blend(a,b,t):return{a:1-t,b:t}
def spine_weights(z):
 if z<1.23:return{'DEF-pelvis':1}
 if z<1.47:return blend('DEF-pelvis','DEF-spine',smooth(1.23,1.47,z))
 if z<1.67:return blend('DEF-spine','DEF-chest',smooth(1.47,1.63,z))
 return blend('DEF-chest','DEF-neck',smooth(1.67,1.78,z))
def arm_weights(side,t):
 if t<.55:return blend('DEF-upper_arm.'+side,'DEF-forearm.'+side,smooth(.37,.68,t))
 return blend('DEF-forearm.'+side,'DEF-hand.'+side,smooth(.82,1,t))
def leg_weights(side,z):
 if z>.51:return blend('DEF-thigh.'+side,'DEF-shin.'+side,1-smooth(.46,.63,z))
 return blend('DEF-shin.'+side,'DEF-foot.'+side,1-smooth(.17,.28,z))
def normalized(w):
 w={n:max(0,x)for n,x in w.items()if x>1e-6};s=sum(w.values())or 1;return{n:x/s for n,x in w.items()}
def skin(o,weights,rig):
 groups={n:o.vertex_groups.new(name=n)for n in sorted({n for w in weights for n in w})}
 for i,w in enumerate(weights):
  for n,value in normalized(w).items():groups[n].add([i],value,'REPLACE')
 mod=o.modifiers.new('Continuous anatomical skin','ARMATURE');mod.object=rig;mod.use_deform_preserve_volume=True
 return mod
def new_bone(name,head,tail,parent=None,deform=True):
 b=RIG.data.edit_bones.new(name);b.head=head;b.tail=tail
 if(b.tail-b.head).length<.001:b.tail=b.head+Vector((0,0,.05))
 b.use_deform=deform
 if parent:b.parent=RIG.data.edit_bones[parent]
 b.align_roll(Vector((0,1,0)));REST[name]=(Vector(head),Vector(tail));return b
def tube(surface,centers,radii,segments,weight_fn,tag,initial=None):
 rings=[]
 for k,(center,r)in enumerate(zip(centers,radii)):
  p=Vector(center);tangent=Vector(centers[min(k+1,len(centers)-1)])-Vector(centers[max(k-1,0)]);tangent.normalize()
  normal=Vector((0,1,0)).cross(tangent).normalized();depth=tangent.cross(normal).normalized()
  ring=surface.ring([p+normal*(r[0]*math.cos(i*2*math.pi/segments))+depth*(r[1]*math.sin(i*2*math.pi/segments))for i in range(segments)],lambda i,p:weight_fn(k/(len(centers)-1),p))
  if rings:surface.bridge(rings[-1],ring,tag)
  elif initial:surface.bridge(initial,ring,tag)
  rings.append(ring)
 return rings[-1]

def build_skin():
 s=Surface();N=32;levels=BODY_LEVELS
 rings=[]
 for z,rx,ry in levels:rings.append(s.ring([(rx*math.cos(i*2*math.pi/N),ry*math.sin(i*2*math.pi/N),z)for i in range(N)],lambda i,p:spine_weights(z)))
 hole_start,hole_end=5,8
 for row in range(len(rings)-1):
  for col in range(N):
   in_hole=hole_start<=row<hole_end and any((col-center)%N in[N-2,N-1,0,1]for center in[0,16])
   if not in_hole:s.face([rings[row][col],rings[row][(col+1)%N],rings[row+1][(col+1)%N],rings[row+1][col]],'torso'if levels[row][0]<1.71 else'neck')
 s.cap(rings[-1],'neck',{'DEF-neck':1})
 # A continuous crotch bridge forms two openings rather than overlapping legs.
 inner=[s.vertex((0,lerp(.21,-.21,i/8),.90+.025*math.sin(math.pi*i/8)),{'DEF-pelvis':1})for i in range(1,8)]
 for side,sign,center in[('R',1,0),('L',-1,16)]:
  cols=[(center+i)%N for i in range(-2,3)]
  boundary=[rings[hole_start][c]for c in cols]+[rings[r][cols[-1]]for r in range(hole_start+1,hole_end+1)]+[rings[hole_end][c]for c in cols[-2::-1]]+[rings[r][cols[0]]for r in range(hole_end-1,hole_start,-1)]
  centers=[(sign*x,y,z)for x,y,z in[(.39,0,1.54),(.43,0,1.49),(.48,0,1.40),(.535,-.005,1.31),(.552,-.005,1.285),(.57,-.008,1.26),(.61,-.01,1.21),(.65,-.013,1.16),(.69,-.015,1.11)]]
  radii=[(.12,.12),(.125,.12),(.115,.11),(.095,.092),(.093,.09),(.09,.085),(.08,.075),(.064,.06),(.052,.049)]
  wrist=tube(s,centers,radii,len(boundary),lambda t,p:arm_weights(side,t),'arm',boundary)
  build_hand(s,side,sign,wrist)
  outer=[rings[0][(24+i)%N]for i in range(17)]if sign>0 else[rings[0][(8+i)%N]for i in range(17)]
  opening=outer+(inner if sign>0 else inner[::-1])
  zlevels=[.84,.76,.65,.58,.54,.50,.46,.39,.30,.23,.17,.125]
  centers=[(sign*(.235+(.012 if z<.6 else 0)),0,z)for z in zlevels]
  radii=[(.135,.145),(.13,.135),(.12,.12),(.11,.11),(.105,.105),(.103,.10),(.103,.10),(.10,.10),(.09,.09),(.078,.08),(.073,.077),(.07,.075)]
  ankle=tube(s,centers,radii,len(opening),lambda t,p:leg_weights(side,p.z),'leg',opening);s.cap(ankle,'leg',{'DEF-foot.'+side:1})
 return s

def build_hand(s,side,sign,wrist):
 origin=Vector((sign*.69,-.015,1.11));widths=[.053,.064,.074,.080,.082,.082];zrows=[0,-.025,-.05,-.075,-.10,-.12];front=[];back=[]
 for row,(z,width)in enumerate(zip(zrows,widths)):
  front.append([s.vertex(origin+Vector((sign*lerp(-width,width,i/20),-.031,z)),{'DEF-hand.'+side:1})for i in range(21)])
  back.append([s.vertex(origin+Vector((sign*lerp(-width,width,i/20),.030,z)),{'DEF-hand.'+side:1})for i in range(21)])
 for row in range(len(zrows)-1):
  for col in range(20):
   for grid in[front,back]:s.face([grid[row][col],grid[row][col+1],grid[row+1][col+1],grid[row+1][col]],'hand')
  # The thumb opens on the inward palm edge; distal fingers branch below.
  if row not in[1,2,3]:s.face([front[row][0],back[row][0],back[row+1][0],front[row+1][0]],'hand')
  s.face([front[row][-1],back[row][-1],back[row+1][-1],front[row+1][-1]],'hand')
 top=front[0]+back[0][::-1];s.bridge(wrist,top,'hand')
 for digit,label in enumerate(['index','middle','ring','little']):
  opening=front[-1][digit*5:digit*5+6]+back[-1][digit*5:digit*5+6][::-1]
  u=lerp(-widths[-1],widths[-1],(digit+.5)/4);root=origin+Vector((sign*u,0,-.12));length=[.112,.125,.116,.095][digit]
  joints=[root+Vector((0,0,-length*t))for t in[0,.43,.76,1]]
  FINGER_SPECS[(side,label)]=joints
  centers=[root+Vector((0,0,-length*t))for t in[.035,.15,.32,.40,.45,.51,.64,.73,.78,.86,.96,1.02]]
  def weights(t,p,label=label,length=length,root=root):
   q=max(0,min(1,(root.z-p.z)/length));a='DEF-'+label+'.01.'+side;b='DEF-'+label+'.02.'+side;c='DEF-'+label+'.03.'+side
   if q<.12:return blend('DEF-hand.'+side,a,smooth(0,.12,q))
   if q<.58:return blend(a,b,smooth(.34,.52,q))
   return blend(b,c,smooth(.68,.84,q))
  radius=.0178 if digit<3 else .0155;radii=[(radius*(1-.48*i/11),radius*(.86-.37*i/11))for i in range(12)]
  tip=tube(s,centers,radii,len(opening),weights,'finger',opening);s.cap(tip,'finger',{'DEF-'+label+'.03.'+side:1})
 opening=[front[row][0]for row in[1,2,3,4]]+[back[row][0]for row in[4,3,2,1]]
 root=origin+Vector((-sign*.072,0,-.05));joints=[root,root+Vector((-sign*.038,-.004,-.032)),root+Vector((-sign*.060,-.008,-.068)),root+Vector((-sign*.066,-.012,-.103))]
 FINGER_SPECS[(side,'thumb')]=joints
 centers=[]
 for i in range(13):
  t=i/12;part=min(2,int(t*3));fraction=t*3-part;p=joints[part].lerp(joints[part+1],fraction);centers.append(tuple(p))
 def thumb_weights(t,p):
  if t<.45:return blend('DEF-thumb.01.'+side,'DEF-thumb.02.'+side,smooth(.23,.43,t))
  return blend('DEF-thumb.02.'+side,'DEF-thumb.03.'+side,smooth(.56,.77,t))
 tip=tube(s,centers,[(.022*(1-.44*i/12),.020*(1-.43*i/12))for i in range(13)],len(opening),thumb_weights,'finger',opening);s.cap(tip,'finger',{'DEF-thumb.03.'+side:1})

def setup_rig():
 global RIG
 data=bpy.data.armatures.new('Native anatomical and control rig');RIG=bpy.data.objects.new('Dafeiyu BodyRig v2',data);COL['rig'].objects.link(RIG)
 bpy.context.view_layer.objects.active=RIG;RIG.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
 for name,h,t,p,deform in[
  ('Root',(0,0,0),(0,0,.18),None,False),('COG',(0,0,1.12),(0,0,1.28),'Root',False),
  ('DEF-pelvis',(0,0,1.10),(0,0,1.255),'COG',True),('DEF-spine',(0,0,1.255),(0,0,1.46),'DEF-pelvis',True),
  ('DEF-chest',(0,0,1.46),(0,0,1.67),'DEF-spine',True),('DEF-neck',(0,0,1.67),(0,0,1.82),'DEF-chest',True),
  ('Head',(0,0,2.155),(0,0,2.32),'DEF-neck',True)]:new_bone(name,h,t,p,deform)
 for side,sign in[('R',1),('L',-1)]:
  arm=[(sign*.365,0,1.55),(sign*.55,-.005,1.29),(sign*.69,-.015,1.11),(sign*.69,-.015,1.04)]
  leg=[(sign*.235,0,.96),(sign*.247,-.025,.52),(sign*.247,0,.16),(sign*.247,-.14,.065)]
  for family,points,names,parent in[('arm',arm,['upper_arm','forearm','hand'],'DEF-chest'),('leg',leg,['thigh','shin','foot'],'DEF-pelvis')]:
   for chain in['DEF','FK','MCH']:
    previous=parent
    for i,name in enumerate(names):
     n=chain+'-'+name+'.'+side;new_bone(n,points[i],points[i+1],previous,chain=='DEF');previous=n
   ik='CTRL-'+('hand'if family=='arm'else'foot')+'_ik.'+side;new_bone(ik,points[2],points[3],'Root',False)
   pole='CTRL-'+('elbow'if family=='arm'else'knee')+'_pole.'+side;ph=(sign*(.72 if family=='arm'else.247),-.42,1.32 if family=='arm'else.52);new_bone(pole,ph,(ph[0],ph[1]-.1,ph[2]),'Root',False)
  new_bone('MCH-heel.'+side,(sign*.247,.075,.025),(sign*.247,-.025,.025),'CTRL-foot_ik.'+side,False)
  new_bone('MCH-toe.'+side,(sign*.247,-.19,.025),(sign*.247,-.29,.025),'MCH-heel.'+side,False)
  new_bone('MCH-ball.'+side,(sign*.247,-.11,.05),(sign*.247,-.21,.05),'MCH-toe.'+side,False)
  new_bone('MCH-foot_target.'+side,leg[2],leg[3],'MCH-ball.'+side,False)
  for label in['thumb','index','middle','ring','little']:
   joints=FINGER_SPECS[(side,label)];previous='DEF-hand.'+side
   for i in range(3):n='DEF-'+label+f'.{i+1:02d}.'+side;new_bone(n,joints[i],joints[i+1],previous,True);previous=n
  new_bone('CTRL-fingers.'+side,(sign*.69,-.11,1.05),(sign*.69,-.11,.96),'DEF-hand.'+side,False)
 # Finite five-link tail, ready for later secondary dynamics.
 for i in range(5):new_bone('DEF-tail.'+str(i),TAIL_PATH[i],TAIL_PATH[i+1],'DEF-pelvis'if i==0 else'DEF-tail.'+str(i-1),True)
 bpy.ops.object.mode_set(mode='POSE')
 for p in RIG.pose.bones:p.rotation_mode='XYZ';p.lock_scale=(True,True,True)
 for side,sign in[('R',1),('L',-1)]:
  for family,names in[('arm',['upper_arm','forearm','hand']),('leg',['thigh','shin','foot'])]:
   control=RIG.pose.bones['CTRL-'+('hand'if family=='arm'else'foot')+'_ik.'+side];control['ik_fk']=1.0;control.id_properties_ui('ik_fk').update(min=0,max=1)
   for name in names:
    d=RIG.pose.bones['DEF-'+name+'.'+side]
    fk=d.constraints.new('COPY_TRANSFORMS');fk.name='FK control source';fk.target=RIG;fk.subtarget='FK-'+name+'.'+side
    ik=d.constraints.new('COPY_TRANSFORMS');ik.name='IK control source';ik.target=RIG;ik.subtarget='MCH-'+name+'.'+side
    drive=ik.driver_add('influence').driver;var=drive.variables.new();var.name='mix';var.type='SINGLE_PROP';var.targets[0].id=RIG;var.targets[0].data_path=control.path_from_id()+'["ik_fk"]';drive.expression='mix'
    fp=RIG.pose.bones['FK-'+name+'.'+side];fp.lock_location=(True,True,True)
    limit=fp.constraints.new('LIMIT_ROTATION');limit.owner_space='LOCAL';limit.use_limit_x=True;limit.min_x=-2.5;limit.max_x=2.5;limit.use_limit_y=True;limit.min_y=-1.6;limit.max_y=1.6;limit.use_limit_z=True;limit.min_z=-2.4;limit.max_z=2.4
   lower=RIG.pose.bones['MCH-'+names[1]+'.'+side];ik=lower.constraints.new('IK');ik.name='Constant length '+family+' IK';ik.target=RIG;ik.subtarget='CTRL-hand_ik.'+side if family=='arm'else'MCH-foot_target.'+side;ik.pole_target=RIG;ik.pole_subtarget='CTRL-'+('elbow'if family=='arm'else'knee')+'_pole.'+side;ik.chain_count=2;ik.use_stretch=False;ik.iterations=128
   ik.pole_angle=-math.pi/2
   for n in names[:2]:
    joint=RIG.pose.bones['MCH-'+n+'.'+side];joint.ik_stretch=0
    for axis in['x','y','z']:setattr(joint,'use_ik_limit_'+axis,True);setattr(joint,'ik_min_'+axis,-2.6 if axis!='y'else-.8);setattr(joint,'ik_max_'+axis,2.6 if axis!='y'else.8)
   hand=RIG.pose.bones['MCH-'+names[2]+'.'+side];c=hand.constraints.new('COPY_ROTATION');c.target=RIG;c.subtarget='CTRL-hand_ik.'+side if family=='arm'else'MCH-foot_target.'+side
  foot=RIG.pose.bones['CTRL-foot_ik.'+side]
  for prop,target,axis in[('heel_roll','MCH-heel.',0),('toe_roll','MCH-toe.',0),('ball_roll','MCH-ball.',0),('bank','MCH-heel.',1)]:
   foot[prop]=0.0;foot.id_properties_ui(prop).update(min=-1.2,max=1.2)
   driver=RIG.pose.bones[target+side].driver_add('rotation_euler',axis).driver;v=driver.variables.new();v.name='angle';v.type='SINGLE_PROP';v.targets[0].id=RIG;v.targets[0].data_path=foot.path_from_id()+f'["{prop}"]';driver.expression='angle'
  f=RIG.pose.bones['CTRL-fingers.'+side];f['grip']=0.;f['thumb_opposition']=0.
  for prop in['grip','thumb_opposition']:f.id_properties_ui(prop).update(min=0,max=1)
  for label in['thumb','index','middle','ring','little']:
   f[label+'_curl']=0.;f.id_properties_ui(label+'_curl').update(min=0,max=1)
   for i in range(3):
    p=RIG.pose.bones['DEF-'+label+f'.{i+1:02d}.'+side];limit=p.constraints.new('LIMIT_ROTATION');limit.owner_space='LOCAL';limit.use_limit_x=True;limit.min_x=-2.2;limit.max_x=.15;limit.use_limit_y=True;limit.min_y=-.15;limit.max_y=.15;limit.use_limit_z=True;limit.min_z=-1.4 if label=='thumb'and i==0 else-.25;limit.max_z=1.4 if label=='thumb'and i==0 else.25
    d=p.driver_add('rotation_euler',0).driver
    for prop,varname in[('grip','g'),(label+'_curl','c')]:v=d.variables.new();v.name=varname;v.type='SINGLE_PROP';v.targets[0].id=RIG;v.targets[0].data_path=f.path_from_id()+f'["{prop}"]'
    d.expression=f'-min(1,max(0,g+c))*{[1.0,1.25,1.05][i]}'
   p=RIG.pose.bones['DEF-thumb.01.'+side];d=p.driver_add('rotation_euler',2).driver;v=d.variables.new();v.name='opp';v.type='SINGLE_PROP';v.targets[0].id=RIG;v.targets[0].data_path=f.path_from_id()+'["thumb_opposition"]';d.expression=str(-sign*1.15)+'*opp'
 bpy.ops.object.mode_set(mode='OBJECT');RIG.show_in_front=True;RIG.data.display_type='OCTAHEDRAL';RIG['scope']='Native complete-body shape/rig study, no completed acting or physics-cache claim';RIG['head_attachment']='Head bone origin world (0,0,2.155), facing -Y'
 # Calibrate arm pole roll against the actual bind matrices. Legs use the
 # forward -Y knee pole at -90 degrees, avoiding an accidental shin twist.
 for side in['R','L']:
  c=next(c for c in RIG.pose.bones['MCH-forearm.'+side].constraints if c.type=='IK');best=(1e9,0)
  for step in range(65):
   angle=-math.pi/2-.65+step/64*1.3;c.pole_angle=angle;RIG.update_tag();bpy.context.view_layer.update()
   score=sum((RIG.data.bones['MCH-'+n+'.'+side].matrix_local.inverted()@RIG.pose.bones['MCH-'+n+'.'+side].matrix).to_quaternion().angle**2 for n in['upper_arm','forearm'])
   if score<best[0]:best=(score,angle)
  c.pole_angle=best[1]
 RIG.update_tag();bpy.context.view_layer.update()
 for b in RIG.data.bones:
  if b.name.startswith('MCH'):b.hide=True
  if b.name.startswith('DEF'):b.color.palette='THEME03'
  elif b.name.startswith('CTRL')or b.name in['Root','COG']:b.color.palette='THEME04'
 return RIG

def garment_from_skin(body,surface):
 selected=[i for i,t in enumerate(surface.tags)if t in['torso','arm']];used=sorted({v for i in selected for v in surface.f[i]});mapping={old:new for new,old in enumerate(used)}
 verts=[body.data.vertices[i].co+body.data.vertices[i].normal*.024 for i in used];faces=[[mapping[v]for v in surface.f[i]]for i in selected]
 o=mesh_object('Maid fitted shirt - full side and back',verts,faces,COL['clothes'],[MAT['navy'],MAT['cream']]);skin(o,[surface.w[i]for i in used],RIG)
 for poly in o.data.polygons:
  center=sum((o.data.vertices[i].co for i in poly.vertices),Vector())/len(poly.vertices)
  if abs(center.x)>.57 and center.z<1.22:poly.material_index=1
 sub=o.modifiers.new('Tailored cloth smoothing','SUBSURF');sub.levels=1
 sol=o.modifiers.new('Actual shirt thickness','SOLIDIFY');sol.thickness=.006;sol.use_even_offset=True
 return o
def bind_surface(source,target):
 mod=source.modifiers.new('Follows simulated continuous cloth','SURFACE_DEFORM');mod.target=target
 bpy.context.view_layer.objects.active=source
 for o in bpy.context.selected_objects:o.select_set(False)
 source.select_set(True);bpy.context.view_layer.update();bpy.ops.object.surfacedeform_bind(modifier=mod.name)
 if not mod.is_bound:raise RuntimeError('SurfaceDeform binding failed: '+source.name)
 return mod
def cloth_costume():
 verts=[];faces=[];N=64;ROWS=18
 for r in range(ROWS+1):
  t=r/ROWS
  for j in range(N):
   a=j*math.pi*2/N;rx=lerp(.305,.79,t);ry=lerp(.225,.475,t);pleat=(.005+.014*t*t)*math.cos(a*16)
   verts.append(((rx+pleat)*math.cos(a),(ry+pleat*.6)*math.sin(a),lerp(1.265,.57,t)+.012*t**5*math.cos(a*16)))
 for r in range(ROWS):
  for j in range(N):faces.append((r*N+j,r*N+(j+1)%N,(r+1)*N+(j+1)%N,(r+1)*N+j))
 low=mesh_object('SKIRT_SIM - continuous open cloth midsurface',verts,faces,COL['cloth'],[MAT['navy'],MAT['cream']])
 pin=low.vertex_groups.new(name='Waist_PIN');weights=[]
 for i,p in enumerate(verts):
  r=i//N;w=1 if r<=1 else .45 if r==2 else 0
  if w:pin.add([i],w,'REPLACE')
  weights.append({'DEF-pelvis':w}if w else{})
 skin(low,weights,RIG)
 cloth=low.modifiers.new('Real cloth - waist fixed, free hem','CLOTH');cloth.settings.quality=8;cloth.settings.mass=.14;cloth.settings.vertex_group_mass=pin.name;cloth.settings.pin_stiffness=1;cloth.settings.air_damping=5;cloth.settings.tension_stiffness=20;cloth.settings.compression_stiffness=20;cloth.settings.shear_stiffness=12;cloth.settings.bending_stiffness=.7
 cloth.collision_settings.use_collision=True;cloth.collision_settings.distance_min=.008;cloth.collision_settings.use_self_collision=True;cloth.collision_settings.self_distance_min=.006
 low.hide_render=True;low.display_type='WIRE';low['simulation_proxy']='Finite continuous cloth surface; no full animation bake performed'
 high=mesh_object('Maid skirt - 360 pleats and encircling white hem',verts,faces,COL['clothes'],[MAT['navy'],MAT['cream']]);bind_surface(high,low)
 for p in high.data.polygons:
  if p.index//N>=ROWS-3:p.material_index=1
 sub=high.modifiers.new('Render garment subdivision','SUBSURF');sub.levels=1
 sol=high.modifiers.new('Real skirt hem thickness','SOLIDIFY');sol.thickness=.007;sol.use_even_offset=True
 # Independent shaped apron follows the same physical skirt surface.
 av=[];af=[];U,V=96,64
 for r in range(V+1):
  t=r/V;half=.67*math.sqrt(max(.015,1-t**6))
  for c in range(U+1):
   a=-math.pi/2+lerp(-half,half,c/U);z=lerp(1.235,.755,t);k=(1.265-z)/.695
   av.append(((lerp(.305,.79,k)+.018)*math.cos(a),(lerp(.225,.475,k)+.023)*math.sin(a),z))
 for r in range(V):
  for c in range(U):i=r*(U+1)+c;af.append((i,i+1,i+U+2,i+U+1))
 mid=mesh_object('APRON single midsurface simulation follower',av,af,COL['cloth'],[MAT['cream']]);bind_surface(mid,low);mid.hide_render=True;mid.display_type='WIRE';mid['contract']='Single quad apron midsurface; no Subdivision or Solidify on this simulation/ornament target'
 apron=mesh_object('White shaped apron - physical curved cloth',av,af,COL['clothes'],[MAT['cream'],MAT['whale']]);bind_surface(apron,mid)
 sub=apron.modifiers.new('Apron smoothing','SUBSURF');sub.levels=1;sol=apron.modifiers.new('Apron cloth thickness','SOLIDIFY');sol.thickness=.005
 # Sculpted flounces follow the apron edge and simulated curved skirt.
 edge=[Vector(av[r*(U+1)])for r in range(V+1)]+[Vector(av[V*(U+1)+c])for c in range(1,U+1)]+[Vector(av[r*(U+1)+U])for r in range(V-1,-1,-1)]
 rv=[];rf=[]
 for i,p in enumerate(edge):
  tangent=edge[min(i+1,len(edge)-1)]-edge[max(i-1,0)];outward=Vector((tangent.z,0,-tangent.x)).normalized()
  if outward.dot(p-Vector((0,p.y,1.02)))<0:outward=-outward
  for j in range(5):
   t=j/4;q=p+outward*(t*.035);q.y-=.004+(.004+.008*t)*math.cos(i*.65);rv.append(tuple(q))
 for i in range(len(edge)-1):
  for j in range(4):k=i*5+j;rf.append((k,k+1,k+6,k+5))
 frill=mesh_object('Apron continuous wavy flounced border',rv,rf,COL['clothes'],[MAT['cream']]);bind_surface(frill,mid);sub=frill.modifiers.new('Small flounce smoothing','SUBSURF');sub.levels=1;sol=frill.modifiers.new('Real flounce cloth thickness','SOLIDIFY');sol.thickness=.003
 embroidery(mid)
 return low,high,apron

def body_front(x,z):
 for a,b in zip(BODY_LEVELS,BODY_LEVELS[1:]):
  if a[0]<=z<=b[0]:
   t=(z-a[0])/(b[0]-a[0]);rx=lerp(a[1],b[1],t);ry=lerp(a[2],b[2],t);return-ry*math.sqrt(max(.04,1-(x/rx)**2))-.033
 return-.15
def apron_front(x,z):
 t=max(0,min(1,(1.265-z)/.695));rx=lerp(.305,.79,t)+.018;ry=lerp(.225,.475,t)+.023
 return-ry*math.sqrt(max(.04,1-(x/rx)**2))
def embroidery_shape(name,points,mat,low,offset=.006):
 curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='2D';curve.resolution_u=16;curve.fill_mode='BOTH';curve.extrude=.0010;curve.bevel_depth=.0007;curve.bevel_resolution=2
 spline=curve.splines.new('BEZIER');spline.bezier_points.add(len(points)-1)
 for p,co in zip(spline.bezier_points,points):p.co=(co[0],co[1],0);p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 spline.use_cyclic_u=True;o=bpy.data.objects.new(name,curve);COL['clothes'].objects.link(o);bpy.context.view_layer.objects.active=o
 for old in bpy.context.selected_objects:old.select_set(False)
 o.select_set(True);bpy.ops.object.convert(target='MESH')
 # Fill caps need interior samples before curve projection; otherwise their
 # long chords cross the curved apron during deformation and appear hollow.
 bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.triangulate(bm,faces=list(bm.faces))
 for iteration in range(5):
  edges=[e for e in bm.edges if e.calc_length()>.016]
  if not edges:break
  bmesh.ops.subdivide_edges(bm,edges=edges,cuts=1,use_grid_fill=True)
 bm.to_mesh(o.data);bm.free()
 for v in o.data.vertices:
  x,z,thickness=v.co.copy();v.co=(x,apron_front(x,z)-offset-.004-thickness,z)
 o.data.materials.append(mat)
 for p in o.data.polygons:p.use_smooth=True
 bind_surface(o,low);o['curved_embroidery_cap_refined']=True;o['ornament']='Curved cap interior and rim geometry, following the single simulated apron midsurface; no pixel material mask'
 return o
def embroidery(low):
 embroidery_shape('Whale embroidery - smooth body',[(-.16,.96),(-.145,1.01),(-.09,1.035),(-.03,1.025),(.03,.99),(.095,.948),(.11,.93),(.075,.914),(.015,.90),(-.065,.906),(-.13,.93)],MAT['whale'],low)
 embroidery_shape('Whale embroidery - double tail fin',[(.09,.945),(.125,.962),(.154,.990),(.18,1.002),(.188,.985),(.178,.963),(.142,.945),(.17,.928),(.181,.914),(.16,.911),(.12,.925)],MAT['whale'],low,.007)
 embroidery_shape('Whale embroidery - white belly',[(-.12,.937),(-.06,.942),(.01,.927),(.08,.935),(.075,.917),(.01,.908),(-.065,.918)],MAT['cream'],low,.009)
 embroidery_shape('Whale embroidery - eye',[(-.085+.010*math.cos(i*math.pi/4),1.0+.010*math.sin(i*math.pi/4))for i in range(8)],MAT['cream'],low,.010)
 embroidery_shape('Whale embroidery - waterdrop',[(-.045,1.095),(-.058,1.080),(-.049,1.066),(-.026,1.071),(-.026,1.086)],MAT['whale'],low)

def maid_identity():
 # A close standing collar, not a white off-shoulder stripe.
 vs=[];fs=[]
 for z,rx,ry in[(1.685,.135,.128),(1.72,.115,.112),(1.765,.108,.103),(1.792,.101,.097)]:
  for j in range(48):a=j*math.pi/24;vs.append((rx*math.cos(a),ry*math.sin(a),z))
 for row in range(3):
  for j in range(48):fs.append((row*48+j,row*48+(j+1)%48,(row+1)*48+(j+1)%48,(row+1)*48+j))
 collar=mesh_object('Close standing ivory collar',vs,fs,COL['clothes'],[MAT['cream']]);skin(collar,[{'DEF-neck':1}for p in vs],RIG);sol=collar.modifiers.new('Standing collar fabric thickness','SOLIDIFY');sol.thickness=.005
 for sign in[-1,1]:
  pts=[(sign*.008,-.12,1.77),(sign*.12,-.125,1.735),(sign*.105,-.205,1.655),(sign*.024,-.22,1.690)]
  leaf=rigid_mesh('Folded pointed collar leaf '+str(sign),pts,[(0,1,2,3)],'DEF-chest',MAT['cream']);sol=leaf.modifiers.new('Folded collar leaf thickness','SOLIDIFY');sol.thickness=.005;bev=leaf.modifiers.new('Soft collar fold edges','BEVEL');bev.width=.003;bev.segments=2
 vs=[];fs=[];ROWS,COLS=22,12
 for row in range(ROWS+1):
  t=row/ROWS;z=lerp(1.32,1.687,t);half=lerp(.16,.145,t)
  for col in range(COLS+1):x=lerp(-half,half,col/COLS);vs.append((x,body_front(x,z),z))
 for row in range(ROWS):
  for col in range(COLS):i=row*(COLS+1)+col;fs.append((i,i+1,i+COLS+2,i+COLS+1))
 bib=mesh_object('Shaped shallow ivory front bib',vs,fs,COL['clothes'],[MAT['cream']]);skin(bib,[spine_weights(p[2])for p in vs],RIG);sub=bib.modifiers.new('Bib soft surface','SUBSURF');sub.levels=1;sol=bib.modifiers.new('Bib cloth thickness','SOLIDIFY');sol.thickness=.004
 for sign in[-1,1]:
  vs=[];fs=[];ROWS=70
  for row in range(ROWS+1):
   t=row/ROWS;z=lerp(1.315,1.69,t)
   for col in range(6):
    u=col/5;x=sign*(.162+.047*u+.005*u*math.sin(t*math.pi*18));y=body_front(x,z)-.005-(.004+.012*u)*math.sin(t*math.pi*18);vs.append((x,y,z))
  for row in range(ROWS):
   for col in range(5):i=row*6+col;fs.append((i,i+1,i+7,i+6))
  frill=mesh_object('Flounced chest bib edge '+str(sign),vs,fs,COL['clothes'],[MAT['cream']]);skin(frill,[spine_weights(p[2])for p in vs],RIG);sub=frill.modifiers.new('Chest ruffle smooth folds','SUBSURF');sub.levels=1;sol=frill.modifiers.new('Chest ruffle thickness','SOLIDIFY');sol.thickness=.003

def rigid_mesh(name,verts,faces,bone,mat,collision=False):
 o=mesh_object(name,verts,faces,COL['accessories'],[mat]);skin(o,[{bone:1}for v in verts],RIG);return o
def ellipsoid(name,center,scale,bone,mat,collection=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,location=center);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 move(o,collection or COL['accessories']);o.data.materials.append(mat)
 # Armature input must use world rest coordinates, with identity object matrix.
 matrix=o.matrix_world.copy()
 for v in o.data.vertices:v.co=matrix@v.co
 o.matrix_world=Matrix.Identity(4);skin(o,[{bone:1}for v in o.data.vertices],RIG)
 for p in o.data.polygons:p.use_smooth=True
 return o
def accessories():
 for side,sign in[('R',1),('L',-1)]:
  foot='DEF-foot.'+side
  # Rounded shoes with a true broad planar sole, not an image-depth slab.
  verts=[];faces=[];N=32;anchors=[Vector(x)for x in[(.02,.06,.025),(.08,.04,.07),(.13,-.01,.16),(.14,-.10,.15),(.115,-.20,.11),(.035,-.25,.04),(.006,-.27,.013)]];profile=[]
  for segment in range(len(anchors)-1):
   p0=anchors[max(0,segment-1)];p1=anchors[segment];p2=anchors[segment+1];p3=anchors[min(len(anchors)-1,segment+2)]
   for step in range(5):
    t=step/5;p=.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t);profile.append(tuple(p))
  profile.append(tuple(anchors[-1]))
  for rx,y,h in profile:
   for i in range(N):a=i*2*math.pi/N;verts.append((sign*.247+rx*math.sin(a),y,h*max(0,(math.cos(a)+.7)/1.7)))
  for r in range(len(profile)-1):
   for i in range(N):faces.append((r*N+i,r*N+(i+1)%N,(r+1)*N+(i+1)%N,(r+1)*N+i))
  faces.append(tuple(range(N-1,-1,-1)));faces.append(tuple((len(profile)-1)*N+i for i in range(N)))
  # Remove the central upper faces so this is a real shoe opening. A separate
  # socked foot is visible inside, with a curved leather Mary-Jane strap above.
  faces=[face for face in faces if not(-.102<sum(verts[i][1]for i in face)/len(face)<.035 and sum(verts[i][2]for i in face)/len(face)>.115 and abs(sum(verts[i][0]for i in face)/len(face)-sign*.247)<.102)]
  shoe=rigid_mesh('Rounded mary-jane shoe.'+side,verts,faces,foot,MAT['navy']);sol=shoe.modifiers.new('Actual leather shoe upper and opening','SOLIDIFY');sol.thickness=.005;sol.offset=-1;bev=shoe.modifiers.new('Leather edge rounding','BEVEL');bev.width=.005;bev.segments=2
  ellipsoid('Socked foot visible in shoe opening.'+side,(sign*.247,-.045,.122),(.102,.132,.048),foot,MAT['cream'],COL['clothes'])
  vs=[];fs=[]
  for i in range(25):
   x=lerp(-.117,.117,i/24);z=.125+.047*math.sqrt(max(.0,1-(x/.118)**2))
   for y in[-.068,-.035]:vs.append((sign*.247+x,y,z))
  for i in range(24):fs.append((i*2,i*2+1,i*2+3,i*2+2))
  strap=rigid_mesh('Raised Mary-Jane leather strap.'+side,vs,fs,foot,MAT['navy']);sol=strap.modifiers.new('Strap leather thickness','SOLIDIFY');sol.thickness=.006
  ellipsoid('Mary-Jane buckle.'+side,(sign*(.247+.104),-.050,.145),(.012,.018,.009),foot,MAT['gold'])
  # White socks are actual tubular surfaces with thickness over calf skin.
  vs=[];fs=[]
  for z,r in[(.16,.079),(.24,.087),(.34,.103),(.40,.107)]:
   for j in range(32):a=j*math.pi/16;vs.append((sign*.247+r*math.cos(a),r*math.sin(a),z))
  for row in range(3):
   for j in range(32):fs.append((row*32+j,row*32+(j+1)%32,(row+1)*32+(j+1)%32,(row+1)*32+j))
  sock=mesh_object('White sock.'+side,vs,fs,COL['clothes'],[MAT['cream']]);skin(sock,[leg_weights(side,p[2])for p in vs],RIG);sub=sock.modifiers.new('Sock knit smoothing','SUBSURF');sub.levels=1;sol=sock.modifiers.new('Sock knit thickness','SOLIDIFY');sol.thickness=.003
  ellipsoid('Large folded bow lobe.'+side,(sign*.078,-.221,1.689),(.092,.041,.060),'DEF-chest',MAT['navy'])
  # Sewn shoulder straps physically continue around the shoulder to the back.
  vs=[];fs=[];path=[]
  for j in range(14):
   t=j/13;z=lerp(1.28,1.70,t);x=sign*lerp(.205,.175,t);y=-lerp(.236,.117,t);path.append(Vector((x,y,z)))
  for j in range(1,9):
   a=j/8*math.pi;path.append(Vector((sign*.175,-.117*math.cos(a),1.70+.042*math.sin(a))))
  for j in range(1,14):
   t=j/13;path.append(Vector((sign*lerp(.175,.205,t),lerp(.117,.236,t),lerp(1.70,1.28,t))))
  for row,p in enumerate(path):
   for j in range(5):vs.append(tuple(p+Vector((lerp(-.026,.026,j/4),0,0))))
  for row in range(len(path)-1):
   for j in range(4):i=row*5+j;fs.append((i,i+1,i+6,i+5))
  strap=mesh_object('White sewn shoulder strap.'+side,vs,fs,COL['clothes'],[MAT['cream']]);skin(strap,[spine_weights(p[2])for p in vs],RIG);sub=strap.modifiers.new('Strap smoothing','SUBSURF');sub.levels=1;sol=strap.modifiers.new('Strap actual cloth thickness','SOLIDIFY');sol.thickness=.004
 # The waist band continues around the back rather than ending at the apron.
 vs=[];fs=[]
 for z in[1.228,1.25,1.278,1.292]:
  for j in range(64):a=j*math.pi/32;vs.append((.315*math.cos(a),.235*math.sin(a),z))
 for row in range(3):
  for j in range(64):fs.append((row*64+j,row*64+(j+1)%64,(row+1)*64+(j+1)%64,(row+1)*64+j))
 belt=rigid_mesh('Ivory encircling waist band',vs,fs,'DEF-pelvis',MAT['cream']);sol=belt.modifiers.new('Waist band thickness','SOLIDIFY');sol.thickness=.005
 for sign in[-1,1]:ellipsoid('Rear apron tie bow '+str(sign),(sign*.085,.254,1.255),(.09,.035,.045),'DEF-pelvis',MAT['cream'])
 ellipsoid('Oval blue sapphire on bow',(0,-.270,1.690),(.025,.014,.035),'DEF-chest',MAT['whale'])
 curve=bpy.data.curves.new('Sapphire oval gold bezel','CURVE');curve.dimensions='3D';curve.bevel_depth=.0035;curve.bevel_resolution=3;spl=curve.splines.new('POLY');spl.points.add(63)
 for i,p in enumerate(spl.points):a=i*math.pi/32;p.co=(.029*math.cos(a),-.271,1.690+.039*math.sin(a),1)
 spl.use_cyclic_u=True;obj=bpy.data.objects.new('Oval sapphire gold bezel',curve);COL['accessories'].objects.link(obj);bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.convert(target='MESH');obj.data.materials.append(MAT['gold']);skin(obj,[{'DEF-chest':1}for p in obj.data.vertices],RIG)
 for sign in[-1,1]:
  pts=[(sign*.017,-.214,1.67),(sign*.063,-.216,1.66),(sign*.075,-.246,1.595),(sign*.025,-.248,1.61)]
  ribbon=rigid_mesh('Hanging bow ribbon '+str(sign),pts,[(0,1,2,3)],'DEF-chest',MAT['navy']);sol=ribbon.modifiers.new('Folded ribbon thickness','SOLIDIFY');sol.thickness=.005
 vs=[];fs=[]
 for row in range(25):
  z=lerp(1.32,1.59,row/24)
  for x in[-.047,.047]:vs.append((x,body_front(x,z)-.014,z))
 for row in range(24):fs.append((row*2,row*2+1,row*2+3,row*2+2))
 placket=mesh_object('Narrow navy button placket on ivory bib',vs,fs,COL['clothes'],[MAT['navy']]);skin(placket,[spine_weights(p[2])for p in vs],RIG);sol=placket.modifiers.new('Button placket thickness','SOLIDIFY');sol.thickness=.003
 for i in range(3):
  z=1.37+i*.075;ellipsoid('Ivory button '+str(i),(0,body_front(0,z)-.024,z),(.010,.009,.010),'DEF-chest',MAT['cream'])
 # Full-volume tail, distinct from the face component; native bone weights.
 tail=Surface();centers=[]
 for segment in range(4):
  p0=TAIL_PATH[max(0,segment-1)];p1=TAIL_PATH[segment];p2=TAIL_PATH[segment+1];p3=TAIL_PATH[min(len(TAIL_PATH)-1,segment+2)]
  for step in range(8):
   t=step/8;centers.append(tuple(.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t)))
 centers.append(tuple(TAIL_PATH[4]))
 def tw(t,p):q=t*4;i=min(3,int(q));return blend('DEF-tail.'+str(i),'DEF-tail.'+str(i+1),q-i)
 last=tube(tail,centers,[(.078-.022*i/32,.064-.014*i/32)for i in range(33)],20,tw,'tail');tail.cap(last,'tail',{'DEF-tail.4':1})
 # Close the root behind the garment.
 tail.cap(list(range(20)),'tail',{'DEF-tail.0':1})
 o=mesh_object('Whale tail stem',tail.v,tail.f,COL['accessories'],[MAT['navy']]);skin(o,tail.w,RIG)
 for side,sign in[('upper',1),('lower',-1)]:
  verts=[];faces=[];ROWS=28;SEG=24;root=Vector((1.05,.22,.60));end=Vector((1.50,.18,1.10)if sign>0 else(1.25,.18,.35));control=root.lerp(end,.5)+Vector((.035,0,.045 if sign>0 else-.035))
  for r in range(ROWS+1):
   t=r/ROWS;center=(1-t)**2*root+2*(1-t)*t*control+t*t*end;tangent=(2*(1-t)*(control-root)+2*t*(end-control)).normalized();normal=Vector((tangent.z,0,-tangent.x)).normalized();radius=.008+(.160 if sign>0 else .155)*math.sin(math.pi*t)**.75;depth=.004+.033*math.sin(math.pi*t)**.9
   for j in range(SEG):a=j*2*math.pi/SEG;verts.append(tuple(center+normal*(radius*math.cos(a))+Vector((0,depth*math.sin(a),0))))
  for r in range(ROWS):
   for j in range(SEG):faces.append((r*SEG+j,r*SEG+(j+1)%SEG,(r+1)*SEG+(j+1)%SEG,(r+1)*SEG+j))
  faces.append(tuple(range(SEG-1,-1,-1)));faces.append(tuple(ROWS*SEG+j for j in range(SEG)))
  rigid_mesh('Whale '+side+' rounded thin-edge fluke',verts,faces,'DEF-tail.4',MAT['navy']if sign>0 else MAT['belly'])

def colliders(body):
 body.modifiers.new('Actual deforming skin cloth contact','COLLISION')
 body.collision.thickness_outer=.006
 count=0
 for bone in RIG.data.bones:
  if not bone.name.startswith('DEF-'):continue
  if any(x in bone.name for x in['index','middle','ring','little','thumb']):radius=.018
  elif'hand.'in bone.name:radius=.065
  elif any(x in bone.name for x in['forearm','upper_arm']):radius=.085
  elif any(x in bone.name for x in['thigh','shin']):radius=.10
  elif'foot.'in bone.name:radius=.085
  elif bone.name.startswith('DEF-tail'):radius=.067
  elif bone.name=='DEF-neck':radius=.09
  elif bone.name=='DEF-spine':radius=.21
  elif bone.name=='DEF-chest':radius=.25
  else:radius=.23
  head,tail=bone.head_local.copy(),bone.tail_local.copy();center=(head+tail)/2;length=(tail-head).length
  bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=center);o=bpy.context.object;o.name='CONTACT '+bone.name;o.scale=(radius,radius,max(radius,length*.5));o.rotation_euler=(tail-head).to_track_quat('Z','Y').to_euler();bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);move(o,COL['colliders'])
  c=o.constraints.new('CHILD_OF');c.target=RIG;c.subtarget=bone.name;c.inverse_matrix=(RIG.matrix_world@bone.matrix_local).inverted()
  bpy.ops.rigidbody.object_add();o.rigid_body.type='ACTIVE';o.rigid_body.kinematic=True;o.rigid_body.collision_shape='CONVEX_HULL';o.rigid_body.friction=.8;o.rigid_body.use_margin=True;o.rigid_body.collision_margin=.002;o.hide_render=True;o.display_type='WIRE';o.modifiers.new('Volume proxy cloth collision','COLLISION');count+=1
 return count

def topology(o):
 bm=bmesh.new();bm.from_mesh(o.data);remaining=set(bm.verts);parts=0
 while remaining:
  parts+=1;stack=[remaining.pop()]
  while stack:
   for e in stack.pop().link_edges:
    for v in e.verts:
     if v in remaining:remaining.remove(v);stack.append(v)
 result={'vertices':len(bm.verts),'edges':len(bm.edges),'faces':len(bm.faces),'quads':sum(len(f.verts)==4 for f in bm.faces),'connected_components':parts,'boundary_edges':sum(e.is_boundary for e in bm.edges),'nonmanifold_edges':sum(not e.is_manifold for e in bm.edges)};bm.free();return result
def verify(body,low,high):
 report={'body_topology':topology(body),'control_bones':len(RIG.data.bones),'deform_bones':sum(b.use_deform for b in RIG.data.bones),'finger_bones':sum(any(s in b.name for s in['DEF-thumb.','DEF-index.','DEF-middle.','DEF-ring.','DEF-little.'])for b in RIG.data.bones),'constraints':sum(len(p.constraints)for p in RIG.pose.bones),'drivers':len(RIG.animation_data.drivers),'cloth_modifiers':sum(m.type=='CLOTH'for o in bpy.data.objects for m in o.modifiers),'rigid_contacts':sum(o.rigid_body is not None for o in bpy.data.objects),'surface_bindings':[(o.name,m.is_bound)for o in bpy.data.objects for m in o.modifiers if m.type=='SURFACE_DEFORM'],'failure_records':FAILURES}
 assert report['body_topology']['connected_components']==1,report['body_topology']
 assert report['body_topology']['nonmanifold_edges']==0,report['body_topology']
 assert report['finger_bones']==30
 def positions():
  bpy.context.view_layer.update();ev=body.evaluated_get(bpy.context.evaluated_depsgraph_get());return[v.co.copy()for v in ev.data.vertices]
 neutral=positions();f=RIG.pose.bones['CTRL-fingers.R'];f['grip']=.85;f['thumb_opposition']=.75;RIG.update_tag();bpy.context.scene.frame_set(1);changed=positions()
 finger_change=max((a-b).length for a,b in zip(neutral,changed));assert finger_change>.035,finger_change
 f['grip']=0;f['thumb_opposition']=0;RIG.update_tag();bpy.context.scene.frame_set(1)
 # Move the native IK control, evaluate the actual skin and chain, then reset.
 ctrl=RIG.pose.bones['CTRL-hand_ik.R'];old=ctrl.location.copy();ctrl.location+=Vector((.015,-.10,.08));RIG.update_tag();moved=positions();skin_change=max((a-b).length for a,b in zip(neutral,moved));assert skin_change>.025,skin_change
 chain=[]
 for name in['DEF-upper_arm.R','DEF-forearm.R']:
  p=RIG.pose.bones[name];chain.append({'bone':name,'rest_length':RIG.data.bones[name].length,'posed_length':(p.tail-p.head).length,'scale':list(p.scale)})
 assert all(abs(x['rest_length']-x['posed_length'])<1e-5 for x in chain),chain
 ctrl.location=old;RIG.update_tag();bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
 report['deformation']={'finger_grip_max_actual_skin_change':finger_change,'ik_hand_max_actual_skin_change':skin_change,'ik_constant_lengths':chain,'evaluated_skin_finite':all(math.isfinite(c)for p in moved for c in p)}
 # Individually exercise all ten articulated fingers against their actual
 # weighted vertices, not only a bone-tip marker or a single aggregate delta.
 subdivision=body.modifiers.get('Deformation surface smoothing');subdivision.show_viewport=False
 neutral_raw=positions();per_finger=[]
 for side in['R','L']:
  control=RIG.pose.bones['CTRL-fingers.'+side]
  for label in['thumb','index','middle','ring','little']:
   names={'DEF-'+label+f'.{i:02d}.'+side for i in[1,2,3]};group_indices={g.index for g in body.vertex_groups if g.name in names};ids=[v.index for v in body.data.vertices if any(g.group in group_indices and g.weight>.2 for g in v.groups)]
   control[label+'_curl']=.7;RIG.update_tag();bpy.context.scene.frame_set(1);bent=positions();change=max((neutral_raw[i]-bent[i]).length for i in ids);assert change>.01,(side,label,change)
   lengths=[]
   for name in names:
    p=RIG.pose.bones[name];error=abs((p.tail-p.head).length-RIG.data.bones[name].length);assert error<1e-5;lengths.append(error)
   per_finger.append({'side':side,'digit':label,'affected_skin_vertices':len(ids),'max_actual_skin_displacement':change,'max_segment_length_error':max(lengths)})
   control[label+'_curl']=0.;RIG.update_tag();bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
  control['thumb_opposition']=.7;RIG.update_tag();bpy.context.scene.frame_set(1);opposed=positions();opposition=max((a-b).length for a,b in zip(neutral_raw,opposed));assert opposition>.01;control['thumb_opposition']=0.;RIG.update_tag();bpy.context.scene.frame_set(1)
 subdivision.show_viewport=True;bpy.context.view_layer.update();report['deformation']['individual_fingers']=per_finger
 report['deformation']['thumb_opposition_actual_skin_displacement']=opposition
 ctrl=RIG.pose.bones['CTRL-hand_ik.R'];ctrl['ik_fk']=0.;fk=RIG.pose.bones['FK-upper_arm.R'];saved=fk.rotation_euler.copy();fk.rotation_euler.z=.22;RIG.update_tag();bpy.context.scene.frame_set(1);fk_skin=positions();fk_change=max((a-b).length for a,b in zip(neutral,fk_skin));assert fk_change>.02
 fk.rotation_euler=saved;ctrl['ik_fk']=1.;RIG.update_tag();bpy.context.scene.frame_set(1)
 report['deformation']['fk_switch_actual_skin_displacement']=fk_change
 foot=RIG.pose.bones['CTRL-foot_ik.R'];foot['ball_roll']=.24;RIG.update_tag();bpy.context.scene.frame_set(1);rolled=positions();roll_change=max((a-b).length for a,b in zip(neutral,rolled));assert roll_change>.01
 foot['ball_roll']=0.;RIG.update_tag();bpy.context.scene.frame_set(1);report['deformation']['footroll_actual_skin_displacement']=roll_change
 shoe_soles={}
 for o in bpy.data.objects:
  if o.name.startswith('Rounded mary-jane shoe.'):
   ev=o.evaluated_get(bpy.context.evaluated_depsgraph_get());minimum=min((ev.matrix_world@v.co).z for v in ev.data.vertices);shoe_soles[o.name]=minimum;assert abs(minimum)<1e-4,shoe_soles
 report['neutral_shoe_soles_world_z']=shoe_soles
 report['neutral_joint_roll_angles']={}
 for side in['R','L']:
  for label in['forearm','shin']:
   name='DEF-'+label+'.'+side;angle=(RIG.data.bones[name].matrix_local.inverted()@RIG.pose.bones[name].matrix).to_quaternion().angle
   report['neutral_joint_roll_angles'][name]=angle;assert angle<.08,(name,angle)
 # A very short solver observation establishes Cloth evaluation exists; this
 # is intentionally not an acting sequence, baked cache, or collision approval.
 cloth_start=None;cloth_end=None
 for frame in[1,2,3]:
  bpy.context.scene.frame_set(frame);bpy.context.view_layer.update();ev=low.evaluated_get(bpy.context.evaluated_depsgraph_get());points=[v.co.copy()for v in ev.data.vertices]
  assert all(math.isfinite(x)for p in points for x in p)
  if frame==1:cloth_start=points
  if frame==3:cloth_end=points
 report['cloth_three_frame_observation']={'frames':[1,2,3],'evaluated_vertices':len(cloth_end),'max_vertex_change':max((a-b).length for a,b in zip(cloth_start,cloth_end)),'finite':True,'baked':False,'collision_acceptance':False}
 bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
 report['cloth_settings']={'pin_group':low.modifiers.get('Real cloth - waist fixed, free hem').settings.vertex_group_mass,'vertices':len(low.data.vertices),'self_collision':True,'high_solidify':any(m.type=='SOLIDIFY'for m in high.modifiers),'simulation_baked':False}
 return report

def action_interface():
 result={'rig_object':RIG.name,'units':'1 Blender unit = probe 1 unit; Z up, forward -Y, ground Z=0','root_control':'Root','cog_control':'COG','head_attachment_bone':'Head',
  'root_motion_recipe':'Set pose_bones[Root].matrix = Matrix.Translation(world_position) @ Matrix.Rotation(yaw,4,Z) @ data.bones[Root].matrix_local. This avoids treating local Euler Z as world Z.',
  'foot_lock_recipe':'After Root/COG update, assign CTRL-foot_ik matrix = rig.matrix_world.inverted() @ desired world control matrix. Keep the sole point fixed using the listed control-local sole offset. Keep ik_fk=1. Footroll deliberately changes the heel/ball/toe contact pivot.',
  'grasp_recipe':'Target the actual object transform with CTRL-hand_ik; use control-local palm reference below. Close grip/individual curls and thumb_opposition continuously. Native prop interaction/constraint capture is not authored in this asset.',
  'controls':{},'finger_joints_per_digit':3,'face_hair_included':False,'actions_baked':False,'cloth_cache_baked':False,'tail_rest_curve':[list(p)for p in TAIL_PATH]}
 for side,sign in[('R',1),('L',-1)]:
  foot=RIG.pose.bones['CTRL-foot_ik.'+side];inverse=(RIG.matrix_world@foot.matrix).inverted();shoe=bpy.data.objects['Rounded mary-jane shoe.'+side]
  minimum=min(v.co.z for v in shoe.data.vertices);points=[v.co for v in shoe.data.vertices if v.co.z<minimum+1e-6];sole=sum(points,Vector())/len(points)
  hand=RIG.pose.bones['CTRL-hand_ik.'+side];palm=Vector((sign*.69,-.015,1.05));palm_local=(RIG.matrix_world@hand.matrix).inverted()@palm
  result['controls'][side]={'hand_ik':'CTRL-hand_ik.'+side,'elbow_pole':'CTRL-elbow_pole.'+side,'foot_ik':'CTRL-foot_ik.'+side,'knee_pole':'CTRL-knee_pole.'+side,
   'ik_fk_property':'ik_fk; 1=IK, 0=FK, stored on each hand/foot IK control','arm_fk':['FK-'+n+'.'+side for n in['upper_arm','forearm','hand']],'leg_fk':['FK-'+n+'.'+side for n in['thigh','shin','foot']],
   'foot_roll_properties':['heel_roll','toe_roll','ball_roll','bank'],'finger_control':'CTRL-fingers.'+side,'finger_properties':['grip','thumb_opposition','thumb_curl','index_curl','middle_curl','ring_curl','little_curl'],
   'finger_property_range':[0,1],'palm_reference_local_to_hand_control':list(palm_local),'sole_reference_local_to_foot_control':list(inverse@sole),'neutral_sole_world':list(sole)}
 return result

def scene_setup():
 scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE_NEXT';scene.render.fps=30;scene.frame_start=1;scene.frame_end=240;scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
 scene.render.resolution_x=960;scene.render.resolution_y=960;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='Standard'
 scene.world=bpy.data.worlds.new('Neutral native study world');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.65,.70,.74,1);scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.6
 for name,loc,energy,size in[('Key',(-3,-4,6),500,4),('Fill',(4,-1,4),220,4),('Rim',(0,3,5),300,3)]:
  data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.size=size;o=bpy.data.objects.new(name,data);COL['studio'].objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,1.1))-o.location).to_track_quat('-Z','Y').to_euler()
 for name,pos in[('front',(0,-7,1.05)),('side',(7,0,1.05)),('back',(0,7,1.05))]:
  data=bpy.data.cameras.new('Body shape study '+name);data.type='ORTHO';data.ortho_scale=3.0;o=bpy.data.objects.new(data.name,data);COL['studio'].objects.link(o);o.location=pos;o.rotation_euler=(Vector((.28,0,.95))-o.location).to_track_quat('-Z','Y').to_euler();NAMES[name]=o
 scene.camera=NAMES['front']
 font=bpy.data.curves.new('QA label','FONT');font.body='NATIVE BODY / SHAPE STUDY\nFace component not included';font.size=.045;font.space_line=1.25;label=bpy.data.objects.new('Shape study label - not a likeness approval',font);COL['studio'].objects.link(label);label.parent=scene.camera;label.location=(-1.32,1.29,-3);NAMES['label']=label
 m=bpy.data.materials.new('QA label ink');m.use_nodes=True;m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.035,.06,.08,1);font.materials.append(m)
 bpy.ops.mesh.primitive_plane_add(size=20,location=(0,0,0));ground=bpy.context.object;ground.name='GROUND z=0';move(ground,COL['studio']);ground.data.materials.append(MAT['floor']);bpy.ops.rigidbody.object_add();ground.rigid_body.type='PASSIVE';ground.rigid_body.friction=.8;ground.modifiers.new('Ground cloth collision','COLLISION')
 text=bpy.data.texts.new('README_NATIVE_BODY_V2');text.write('Native complete-body shape and control study. Facing -Y, Z up, ground 0. Head attachment Head at (0,0,2.155). No face is included.\nSkin is a single connected topology including 30 independently articulated finger bones. Full IK/FK controls use non-stretch chains. Footroll and thumb opposition are driver controls.\nLow skirt is actual pinned Cloth. Render skirt/apron follow it via bound SurfaceDeform and have Solidify thickness. Collision objects cover physical torso/limbs/palms/digits; they are not a proof of stable whole-body dynamics.\nNo large action, cloth bake or full acting sequence is included. Side/back designs are authored hypotheses. This is a shape/rig study, not visual approval or completed full-body physics.\n')
 return scene

def main():
 global COL,MAT,FINGER_SPECS
 OUT.mkdir(parents=True,exist_ok=True)
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for c in list(bpy.data.collections):bpy.data.collections.remove(c)
 COL={k:own_collection(n)for k,n in{'skin':'01_Connected_Skin','rig':'02_Native_Control_Rig','clothes':'03_Full_Costume','cloth':'04_Cloth_Simulation','accessories':'05_Accessories_Tail','colliders':'06_Volume_Contacts','studio':'07_Study_Studio'}.items()}
 MAT={k:material('Dafeiyu '+k,color)for k,color in{'skin':(.65,.49,.39),'navy':(.025,.037,.072),'cream':(.81,.79,.75),'whale':(.075,.29,.48),'belly':(.07,.13,.23),'gold':(.47,.30,.10),'floor':(.55,.59,.61)}.items()}
 FINGER_SPECS={};surface=build_skin();surface.compact();setup_rig();body=mesh_object('BODY continuous neck torso limbs palms five fingers',surface.v,surface.f,COL['skin'],[MAT['skin']]);skin(body,surface.w,RIG)
 body['anatomical_topology']='One connected manifold skin, with shared shoulder/axilla/crotch/palm branch boundaries and joint loop sections'
 sub=body.modifiers.new('Deformation surface smoothing','SUBSURF');sub.levels=1;sub.render_levels=1
 shirt=garment_from_skin(body,surface);maid_identity();low,high,apron=cloth_costume();accessories();count=colliders(body);scene=scene_setup()
 scene.frame_set(1);bpy.context.view_layer.update();validation=verify(body,low,high)
 # Save actual editable artifact before optional QA renders. No simulation bake.
 bpy.ops.wm.save_as_mainfile(filepath=str(MASTER),check_existing=False)
 renders={}
 if '--render-qa' in sys.argv:
  for name in['front','side','back']:
   scene.camera=NAMES[name];NAMES['label'].parent=scene.camera;NAMES['label'].location=(-1.32,1.29,-3);scene.render.filepath=str(OUT/('body-v2-shape-study-'+name+'.png'));bpy.ops.render.render(write_still=True);renders[name]=scene.render.filepath
 scene.camera=NAMES['front'];NAMES['label'].parent=scene.camera;NAMES['label'].location=(-1.32,1.29,-3);bpy.ops.wm.save_as_mainfile(filepath=str(MASTER),check_existing=False)
 manifest={'schema':'dafeiyu.native-body.v2','status':'native_shape_and_rig_study_built','blender_version':bpy.app.version_string,'file':str(MASTER),'sha256':hashlib.sha256(MASTER.read_bytes()).hexdigest(),'script':str(Path(__file__).resolve()),'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'seconds':time.perf_counter()-START,'execution':{'background':True,'completed_python':True,'argv':sys.argv,'invocation':'tools/blender/Invoke-Blender.ps1 -BlenderArguments @('+','.join(repr(x)for x in ['--background','--factory-startup','--python-exit-code','1','--python','production/native-character/scripts/build_body.py','--','--render-qa'])+')'},'coordinates':{'up':'Z','forward':'-Y','ground':0,'head_bone_origin':[0,0,2.155],'collar':1.755,'waist':1.255,'skirt_hem':.57},'validation':validation,'renders':renders,'limitations':['No face component included; Head bone is the attachment contract','Native authored side/back shape is a hypothesis, not reference-author ground truth','Shape and deformation tests are not artistic approval','No continuous acting sequence, large cloth cache, balance controller or grasp has been authored','Contact proxies approximate visible volumes; physical interaction still needs scene acceptance testing'],'failure_records':FAILURES}
 manifest['action_interface']=action_interface();manifest['costume_geometry']={'standing_collar':True,'shaped_bib_with_flounced_edges':True,'sapphire_oval_bezel':True,'apron_border':'continuous curved flounce following cloth','whale_emblem':'five smooth thin embroidery meshes with subdivided curved cap interiors; single apron midsurface target, then render-only subdivision/solidify','decoration_deformation_chain':'Cloth cage -> single apron midsurface -> apron render/frill/embroidery; Solidify stays after surface deformation on render objects','mary_jane':'actual upper opening, socked foot, curved leather strap and buckle','tail':'S-curve rest chain, continuous skin weights, large upper/lower biconvex flukes'}
 rest_data=[{'name':b.name,'parent':b.parent.name if b.parent else None,'matrix':[round(v,7)for row in b.matrix_local for v in row],'head':[round(v,7)for v in b.head_local],'tail':[round(v,7)for v in b.tail_local],'deform':b.use_deform}for b in sorted(RIG.data.bones,key=lambda b:b.name)];manifest['rig_rest_sha256']=hashlib.sha256(json.dumps(rest_data,sort_keys=True).encode()).hexdigest()
 REPORT.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8');print('NATIVE_BODY_V2_RESULT '+json.dumps(manifest,ensure_ascii=False))
try:main()
except Exception as error:
 OUT.mkdir(parents=True,exist_ok=True);FAILURES.append({'type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc()});REPORT.write_text(json.dumps({'status':'failed','failure_records':FAILURES},ensure_ascii=False,indent=2),encoding='utf8');raise
