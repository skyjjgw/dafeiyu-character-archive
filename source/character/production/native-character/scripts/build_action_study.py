"""Eight-second native action/contact QA; component sources are read-only.

Dynamic prop is never parented, made kinematic, or assigned a per-frame
 transform. A recorded compliant spring joint assists the captured grasp. This is an
offline continuous acting test, not a live controller or force-balanced gait.
"""
import bpy,bmesh,json,math,hashlib,time,traceback,sys
from pathlib import Path
from mathutils import Matrix,Vector,Quaternion

ROOT=Path(__file__).resolve().parent.parent
SOURCE=ROOT/'dafeiyu-native-v2-study.blend'
if '--source' in sys.argv:SOURCE=Path(sys.argv[sys.argv.index('--source')+1]).resolve()
MASTER=ROOT/'body-action-study.blend';REPORT=ROOT/'action-study-manifest.json'
FPS=24;FRAMES=192;CAPTURE=120;KEY_FRAMES={1,35,48,60,96,144,192}
PROP_HALF=Vector((.065,.019,.065))
RUN=time.strftime('%Y%m%d-%H%M%S');RENDERS=ROOT/'renders'/'action-study'/RUN
FAILURES=[];SAMPLES=[];OUTPUTS=[];START=time.perf_counter()
CONTACT_REFITS=[]
if REPORT.exists():
 try:FAILURES=list(json.loads(REPORT.read_text(encoding='utf-8-sig')).get('failure_records',[]))
 except Exception:pass
def smooth(a,b,x):
 t=max(0,min(1,(x-a)/(b-a)));return t*t*t*(10+t*(-15+6*t))
def bump(t):return 16*max(0,min(1,t))**2*(1-max(0,min(1,t)))**2
def mat_at(position,rotation):return Matrix.Translation(position)@rotation.to_matrix().to_4x4()
def scene_update():bpy.context.view_layer.update()
def key_pose(p,frame):
 p.keyframe_insert('location',frame=frame,group=p.name);p.keyframe_insert('rotation_quaternion',frame=frame,group=p.name)
def key_object(o,frame):
 o.keyframe_insert('location',frame=frame);o.keyframe_insert('rotation_quaternion',frame=frame)
def actual_matrix(o):return o.evaluated_get(bpy.context.evaluated_depsgraph_get()).matrix_world.copy()
def rigid(name,location,dimensions,kind='ACTIVE',mass=.18,color=(.12,.35,.47),hidden=False):
 bpy.ops.mesh.primitive_cube_add(size=1,location=location);o=bpy.context.object;o.name=name;o.dimensions=dimensions;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 m=bpy.data.materials.new(name+' editable material');m.diffuse_color=(*color,1);m.use_nodes=True;bsdf=m.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=(*color,1);bsdf.inputs['Roughness'].default_value=.58;o.data.materials.append(m)
 bpy.ops.rigidbody.object_add();o.rigid_body.type=kind;o.rigid_body.mass=mass;o.rigid_body.collision_shape='BOX';o.rigid_body.friction=.8;o.rigid_body.restitution=0;o.rigid_body.use_margin=True;o.rigid_body.collision_margin=.001
 o.hide_render=hidden
 return o
def physics_cache(pc,name):
 pc.frame_start=1;pc.frame_end=FRAMES
 # Blender 4.5's RigidBodyWorld disk-cache RNA callback can dereference a
 # missing object owner. Do not toggle it; preserve native baked caches later.
 if hasattr(pc,'name'):pc.name=name
 if hasattr(pc,'compression'):pc.compression='LIGHT'
def action_curve_settings():
 for action in bpy.data.actions:
  # Blender 4.5 layered actions expose fcurves through channel bags.
  curves=[]
  if hasattr(action,'fcurves'):
   try:curves.extend(action.fcurves)
   except Exception:pass
  for layer in getattr(action,'layers',[]):
   for strip in layer.strips:
    for slot in getattr(action,'slots',[]):
     try:
      bag=strip.channelbag(slot)
      if bag:curves.extend(bag.fcurves)
     except Exception:pass
  for curve in curves:
   for key in curve.keyframe_points:key.interpolation='LINEAR'

def setup():
 global scene,rig,face,prop,anchor,joint,child,rest,foot_info,hand_rest,full_camera,hand_camera
 if not SOURCE.is_file():raise FileNotFoundError(SOURCE)
 source_hash=hashlib.sha256(SOURCE.read_bytes()).hexdigest();bpy.ops.wm.open_mainfile(filepath=str(SOURCE));scene=bpy.context.scene
 rig=bpy.data.objects['Dafeiyu BodyRig v2'];face=bpy.data.objects.get('FaceRig');scene.frame_start=1;scene.frame_end=FRAMES;scene.render.fps=FPS
 for o in bpy.data.objects:
  if o.type=='FONT':o.hide_render=True
  if o.type=='ARMATURE'and o.animation_data:
   o.animation_data.action=None
   for track in list(o.animation_data.nla_tracks):o.animation_data.nla_tracks.remove(track)
 rest={name:b.matrix_local.copy()for name,b in rig.data.bones.items()}
 for name in['Root','COG','Head','CTRL-hand_ik.R','CTRL-hand_ik.L','CTRL-foot_ik.R','CTRL-foot_ik.L']:
  rig.pose.bones[name].rotation_mode='QUATERNION'
 for side in['R','L']:
  for part in['hand','foot']:rig.pose.bones['CTRL-'+part+'_ik.'+side]['ik_fk']=1.
  for prop_name in['heel_roll','toe_roll','ball_roll','bank']:rig.pose.bones['CTRL-foot_ik.'+side][prop_name]=0.
  for prop_name in['grip','thumb_opposition','thumb_curl','index_curl','middle_curl','ring_curl','little_curl']:rig.pose.bones['CTRL-fingers.'+side][prop_name]=0.
 scene.frame_set(1);scene_update()
 info=json.loads((ROOT/'body-v2-manifest.json').read_text(encoding='utf-8-sig'))['action_interface']['controls'];foot_info={}
 for side in['R','L']:
  ctrl=rig.pose.bones['CTRL-foot_ik.'+side];q=ctrl.matrix.to_quaternion();sole=Vector(info[side]['sole_reference_local_to_foot_control']);world=rig.matrix_world@ctrl.matrix@sole
  foot_info[side]={'offset':sole,'initial':world,'rotation':q,'shoe':bpy.data.objects['Rounded mary-jane shoe.'+side],
   'lengths':(rig.data.bones['DEF-thigh.'+side].length,rig.data.bones['DEF-shin.'+side].length)}
 hand_rest=(rig.matrix_world@rig.pose.bones['CTRL-hand_ik.R'].matrix).copy()
 # Study prop begins 20 mm above the table, demonstrating free gravity before
 # the hand reaches it. No subsequent assignment is made to prop.transform.
 prop=rigid('QA_DYNAMIC grasp box',(.66,-.30,1.245),tuple(v*2 for v in PROP_HALF),mass=.18,color=(.10,.35,.44));prop['scope']='Actual dynamic mass; held later with recorded compliant spring grasp assistance';prop.rotation_mode='QUATERNION';prop.rigid_body.linear_damping=.15;prop.rigid_body.angular_damping=.35
 bevel=prop.modifiers.new('Rounded box edges','BEVEL');bevel.width=.005;bevel.segments=3
 table=rigid('QA_TABLE passive contact',(.66,-.38,1.13),(.40,.30,.06),'PASSIVE',color=(.24,.28,.31))
 # Refit the coarse spherical palm proxy to its actual shallow palm volume.
 palm=bpy.data.objects.get('CONTACT DEF-hand.R')
 if palm:
  for v in palm.data.vertices:v.co.x*=1.08;v.co.y*=.48;v.co.z=v.co.z*.90+.025
  palm.data.update();palm.update_tag(refresh={'DATA'})
  palm['study_refit']='Shallow palm ellipsoid, not the original overlarge contact sphere'
 body=bpy.data.objects['BODY continuous neck torso limbs palms five fingers']
 for o in list(bpy.data.objects):
  if not(o.name.startswith('CONTACT DEF-')and o.name.endswith('.R')and any(x in o.name for x in['thumb','index','middle','ring','little'])):continue
  bone_name=o.name.split('CONTACT ')[-1];group=body.vertex_groups.get(bone_name)
  if not group:continue
  inverse=actual_matrix(o).inverted();points=[inverse@(body.matrix_world@v.co)for v in body.data.vertices if any(g.group==group.index and g.weight>.55 for g in v.groups)]
  if not points:continue
  center=sum(points,Vector())/len(points);rx=min(.025,max(.007,max(abs(p.x-center.x)for p in points)+.001));ry=min(.025,max(.007,max(abs(p.y-center.y)for p in points)+.001));oldx=max(abs(v.co.x)for v in o.data.vertices);oldy=max(abs(v.co.y)for v in o.data.vertices)
  for v in o.data.vertices:v.co.x=v.co.x/oldx*rx+center.x;v.co.y=v.co.y/oldy*ry+center.y
  o.data.update();o.update_tag(refresh={'DATA'})
  CONTACT_REFITS.append({'collider':o.name,'dominant_skin_vertices':len(points),'fitted_radial_extents':[rx,ry],'margin':.001})
 anchor=rigid('QA_KINEMATIC palm grasp anchor',prop.location,(.012,.012,.012),hidden=True);anchor.rigid_body.kinematic=True;anchor.rotation_mode='QUATERNION'
 for i in range(len(anchor.rigid_body.collision_collections)):anchor.rigid_body.collision_collections[i]=(i==19)
 child=anchor.constraints.new('CHILD_OF');child.name='Bone-follow only after capture';child.target=rig;child.subtarget='DEF-hand.R';child.influence=0
 child.keyframe_insert('influence',frame=1)
 bpy.ops.object.empty_add(type='PLAIN_AXES',location=prop.location);joint=bpy.context.object;joint.name='QA_COMPLIANT grasp - explicit spring assistance';bpy.ops.rigidbody.constraint_add();c=joint.rigid_body_constraint;c.type='GENERIC_SPRING';c.object1=anchor;c.object2=prop;c.disable_collisions=True;c.enabled=False
 for axis in['x','y','z']:
  setattr(c,'use_limit_lin_'+axis,True);setattr(c,'limit_lin_'+axis+'_lower',-.025);setattr(c,'limit_lin_'+axis+'_upper',.025);setattr(c,'use_spring_'+axis,True);setattr(c,'spring_stiffness_'+axis,280.);setattr(c,'spring_damping_'+axis,.95)
  setattr(c,'use_limit_ang_'+axis,True);setattr(c,'limit_ang_'+axis+'_lower',-.22);setattr(c,'limit_ang_'+axis+'_upper',.22);setattr(c,'use_spring_ang_'+axis,True);setattr(c,'spring_stiffness_ang_'+axis,6.);setattr(c,'spring_damping_ang_'+axis,.95)
 c.keyframe_insert('enabled',frame=1)
 world=scene.rigidbody_world
 if hasattr(world,'substeps_per_frame'):world.substeps_per_frame=12
 world.solver_iterations=120;physics_cache(world.point_cache,'QA_RigidBody_192')
 for o in bpy.data.objects:
  for m in o.modifiers:
   if m.type=='CLOTH':physics_cache(m.point_cache,'QA_Cloth_192');m.settings.quality=8
 # Decorative embroidery must follow the actual deformed apron layer, rather
 # than independently binding to its coarser underlying skirt shell.
 apron=bpy.data.objects.get('White shaped apron - physical curved cloth')
 if apron:
  target=bpy.data.objects.get('APRON single midsurface simulation follower')
  if target is None:
   target=apron.copy();target.data=apron.data.copy();target.name='QA_APRON single midsurface embroidery target';scene.collection.objects.link(target);target.hide_render=True;target.display_type='WIRE'
   for modifier in list(target.modifiers):
    if modifier.type!='SURFACE_DEFORM':target.modifiers.remove(modifier)
  for o in list(bpy.data.objects):
   if not o.name.startswith('Whale embroidery'):continue
   for m in o.modifiers:
    if m.type=='SURFACE_DEFORM':
     bpy.context.view_layer.objects.active=o
     for selected in bpy.context.selected_objects:selected.select_set(False)
     o.select_set(True)
     if m.is_bound:bpy.ops.object.surfacedeform_bind(modifier=m.name)
     # Filled Bezier caps otherwise contain long triangles whose chords cut
     # through a curved apron. Add interior vertices and reproject them before
     # binding; a thin smooth embroidery surface then follows the whole curve.
     if not o.get('curved_embroidery_cap_refined'):
      def apron_y(x,z):
       t=max(0,min(1,(1.265-z)/.695));rx=.305+(.79-.305)*t+.018;ry=.225+(.475-.225)*t+.023;return-ry*math.sqrt(max(.04,1-(x/rx)**2))
      bm=bmesh.new();bm.from_mesh(o.data);depth=bm.verts.layers.float.new('Curved embroidery normal offset')
      for v in bm.verts:v[depth]=apron_y(v.co.x,v.co.z)-v.co.y
      bmesh.ops.triangulate(bm,faces=list(bm.faces))
      for iteration in range(5):
       edges=[e for e in bm.edges if e.calc_length()>.016]
       if not edges:break
       bmesh.ops.subdivide_edges(bm,edges=edges,cuts=1,use_grid_fill=True)
      for v in bm.verts:v.co.y=apron_y(v.co.x,v.co.z)-v[depth]-.004
      bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(o.data);bm.free();o.data.update();o['curved_embroidery_cap_refined']=True
     m.target=target;bpy.ops.object.surfacedeform_bind(modifier=m.name)
 # Retain real native secondary cloth. Hair is only carried by the head.
 def camera(name,position,target,scale):
  data=bpy.data.cameras.new(name);data.type='ORTHO';data.ortho_scale=scale;o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=position;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
 full_camera=camera('QA full continuous action',(3.8,-7,3.2),(.28,-.08,1.60),3.92)
 hand_camera=camera('QA hand actual contact',(2.1,-3,2.1),(.66,-.28,1.25),.74)
 scene.render.engine='BLENDER_EEVEE_NEXT';scene.render.image_settings.file_format='PNG';scene.render.resolution_percentage=100;scene.camera=full_camera
 RENDERS.mkdir(parents=True,exist_ok=True)
 return source_hash

def root_plan(t):
 amount=smooth(1,3,t);yaw=math.radians(15)*amount;forward=Vector((math.sin(math.radians(15)),-math.cos(math.radians(15)),0));position=forward*(.22*amount)
 return Matrix.Translation(position)@Matrix.Rotation(yaw,4,'Z'),yaw
def foot_plan(side,t):
 start,end=(1,1.9)if side=='R'else(2,2.9);u=max(0,min(1,(t-start)/(end-start)));f=smooth(0,1,u);final_root,yaw=root_plan(3)
 initial=foot_info[side]['initial'];target=final_root@initial;point=initial.lerp(target,f);point.z+=.085*bump(u)
 rotation=Quaternion((0,0,1),math.radians(15)*f)@foot_info[side]['rotation']
 return point,rotation,start<t<end
def wrist_target(object_matrix):
 q=object_matrix.to_quaternion()@hand_rest.to_quaternion();back=q@Vector((0,0,1));grip_offset=q@Vector((0,.130,0));center=object_matrix.translation
 return mat_at(center+back*.053-grip_offset,q)
def holding_target(t,capture_matrix):
 f=smooth((CAPTURE-1)/FPS,7.0,t);point=capture_matrix.translation+Vector((-.025,.045,.115))*f
 q=capture_matrix.to_quaternion()
 return mat_at(point,q)
def authored_pose(frame,object_matrix,hold=None,keys=True):
 t=(frame-1)/FPS;root_world,yaw=root_plan(t);rig_inv=rig.matrix_world.inverted();pb=rig.pose.bones
 pb['Root'].matrix=root_world@rest['Root'];key_pose(pb['Root'],frame)if keys else None
 r=(t-1)/.9;l=(t-2)/.9;shift=-.055*bump(r)if 1<t<1.9 else .055*bump(l)if 2<t<2.9 else 0
 lower=-.038*(smooth(.85,1.05,t)*(1-smooth(2.9,3.2,t)))
 # Lowering the pelvis creates actual knee bend and reach slack. Limb offsets
 # and scales stay at bind; this is not a stretched support leg.
 desired=[]
 for side in['R','L']:
  sole,q,swing=foot_plan(side,t);ankle=sole-q@foot_info[side]['offset'];desired.append((side,sole,q,swing,ankle))
 for side,sole,q,swing,ankle in desired:
  hip=root_world@Vector((.235 if side=='R'else-.235,0,.96));hip+=Vector((shift,0,lower));horizontal=Vector((hip.x-ankle.x,hip.y-ankle.y,0)).length;maximum=sum(foot_info[side]['lengths'])-.008
  available=math.sqrt(max(.01,maximum*maximum-horizontal*horizontal));lower-=max(0,hip.z-ankle.z-available)
 pb['COG'].matrix=root_world@Matrix.Translation((shift,0,lower))@rest['COG'];key_pose(pb['COG'],frame)if keys else None
 scene_update()
 for side,sole,q,swing,ankle in desired:
  ctrl=pb['CTRL-foot_ik.'+side];ctrl.matrix=rig_inv@mat_at(ankle,q);key_pose(ctrl,frame)if keys else None
 # The eyes/head lead the root; a small down look follows the reaching hand.
 scene_update();head=pb['Head'];base=pb['DEF-neck'].matrix@rest['DEF-neck'].inverted()@rest['Head'];lead=math.radians(25)*smooth(.10,.90,t);lead=lead+(math.radians(15)-lead)*smooth(1,3,t);extra=lead-yaw
 head.matrix=Matrix.Translation(base.translation)@Matrix.Rotation(extra,4,'Z')@Matrix.Rotation(.10*smooth(3,5,t),4,'X')@base.to_quaternion().to_matrix().to_4x4();key_pose(head,frame)if keys else None
 reach=smooth(3,4.72,t);neutral=root_world@hand_rest;target=wrist_target(object_matrix)
 if hold is not None and frame>=CAPTURE:hand=holding_target(t,hold)
 else:hand=mat_at(neutral.translation.lerp(target.translation,reach)+Vector((0,0,.12*bump(reach))),neutral.to_quaternion().slerp(target.to_quaternion(),reach))
 pb['CTRL-hand_ik.R'].matrix=rig_inv@hand;key_pose(pb['CTRL-hand_ik.R'],frame)if keys else None
 fingers=pb['CTRL-fingers.R'];fingers['grip']=.62*smooth(3.70,5.0,t);fingers['thumb_opposition']=.72*smooth(3.60,4.9,t)
 if keys:
  for prop_name in['grip','thumb_opposition']:fingers.keyframe_insert('["'+prop_name+'"]',frame=frame,group='Continuous grasp controls')
 if face:
  face['gazeX']=.50*smooth(0,.55,t)*(1-smooth(.8,2.5,t))+.20*smooth(3,5,t);face['gazeY']=-.50*smooth(3,5,t);face['smile']=.15*smooth(4.5,6.5,t)
  blink=0
  for event in[.95,3.55,6.75]:blink=max(blink,bump((t-event+.10)/.20))if event-.10<t<event+.10 else blink
  face['blink']=blink
  if keys:
   for prop_name in['gazeX','gazeY','smile','blink']:face.keyframe_insert('["'+prop_name+'"]',frame=frame)
 return {'pelvis_lowering':lower,'cog_side_shift':shift,'wrist_matrix':hand,'feet':desired}

def author_initial_actions():
 initial=prop.matrix_world.copy();capture=None
 for frame in range(1,FRAMES+1):
  pose=authored_pose(frame,initial,capture)
  anchor.matrix_world=initial;key_object(anchor,frame)
 scene_update();child.inverse_matrix=(rig.matrix_world@rig.pose.bones['DEF-hand.R'].matrix).inverted();action_curve_settings();scene.frame_set(1);scene_update()
 bpy.ops.wm.save_as_mainfile(filepath=str(MASTER),check_existing=False)

def contact_metrics(prop_matrix):
 inverse=prop_matrix.inverted();half=PROP_HALF;rows=[]
 for o in bpy.data.objects:
  if not(o.name.startswith('CONTACT DEF-')and o.name.endswith('.R')and any(n in o.name for n in['hand','thumb','index','middle','ring','little'])):continue
  matrix=actual_matrix(o);minimum=1e9
  for vertex in o.data.vertices:
   p=inverse@matrix@vertex.co;q=Vector((abs(p.x)-half.x,abs(p.y)-half.y,abs(p.z)-half.z));outside=Vector((max(q.x,0),max(q.y,0),max(q.z,0))).length;minimum=min(minimum,outside+min(max(q),0))
  part=o.name.split('DEF-')[-1].split('.')[0];rows.append({'collider':o.name,'part':'palm'if part=='hand'else part,'signed_sample_distance':minimum})
 parts=sorted({x['part']for x in rows if x['signed_sample_distance']<.008})
 return {'nearest_signed_sample_distance':min(x['signed_sample_distance']for x in rows),'near_or_intersecting_proxy_count':sum(x['signed_sample_distance']<.008 for x in rows),'distinct_near_parts':parts,'proxy_samples':rows}
def measure(frame,plan):
 t=(frame-1)/FPS;scene_update();prop_world=actual_matrix(prop);foot_rows={};length_error=0;knee_forward=[]
 for side,expected,q,swing,ankle in plan['feet']:
  ctrl=rig.pose.bones['DEF-foot.'+side];point=(rig.matrix_world@ctrl.matrix@rest['DEF-foot.'+side].inverted())@foot_info[side]['initial']
  ev=foot_info[side]['shoe'].evaluated_get(bpy.context.evaluated_depsgraph_get());minimum=min((ev.matrix_world@v.co).z for v in ev.data.vertices)
  hip=rig.pose.bones['DEF-thigh.'+side].head;knee=rig.pose.bones['DEF-shin.'+side].head;ank=rig.pose.bones['DEF-foot.'+side].head;line=hip.lerp(ank,(hip-knee).length/max((hip-ank).length,1e-6));forward=Vector((math.sin(root_plan(t)[1]),-math.cos(root_plan(t)[1]),0));knee_forward.append((knee-line).dot(forward))
  foot_rows[side]={'swing':swing,'expected_sole':list(expected),'actual_sole':list(point),'target_error':(point-expected).length,'stance_slip_xy':0 if swing else Vector((point.x-expected.x,point.y-expected.y,0)).length,'lowest_rendered_shoe_z':minimum}
 for p in rig.pose.bones:
  if p.name.startswith('DEF-'):length_error=max(length_error,abs((p.tail-p.head).length-rig.data.bones[p.name].length))
 fingers=rig.pose.bones['CTRL-fingers.R']
 wrist=rig.matrix_world@rig.pose.bones['DEF-hand.R'].matrix;target=rig.matrix_world@rig.pose.bones['CTRL-hand_ik.R'].matrix
 relative=actual_matrix(anchor).inverted()@prop_world
 return {'frame':frame,'time':t,'root_world_position':list(rig.pose.bones['Root'].head),'prop_position':list(prop_world.translation),'prop_bottom_z':prop_world.translation.z-PROP_HALF.z,'prop_rotation':list(prop_world.to_quaternion()),'anchor_relative_position':list(relative.translation),'anchor_relative_rotation':list(relative.to_quaternion()),'joint_enabled':joint.rigid_body_constraint.enabled,'grip':fingers['grip'],'thumb_opposition':fingers['thumb_opposition'],'feet':foot_rows,'max_bone_length_error':length_error,'knee_forward_offsets':knee_forward,'pelvis_lowering':plan['pelvis_lowering'],'wrist_target_error':(wrist.translation-target.translation).length,'contact':contact_metrics(prop_world)}
def render_frame(frame):
 for view,camera,size in[('full',full_camera,(512,640)),('hand',hand_camera,(640,512))]:
  scene.camera=camera;scene.render.resolution_x=size[0];scene.render.resolution_y=size[1];scene.render.filepath=str(RENDERS/(f'f{frame:03d}-{view}.png'));bpy.ops.render.render(write_still=True);OUTPUTS.append({'frame':frame,'view':view,'path':scene.render.filepath})

def main():
 global CAPTURE
 source_hash=setup();author_initial_actions();capture_hand=None;capture_prop=None;captured=False
 # Adaptive pre-grasp keys are authored one frame ahead from the last actual
 # Bullet state. After capture, future hand targets stop reading the prop.
 for frame in range(1,FRAMES+1):
  previous=actual_matrix(prop)
  plan=authored_pose(frame,previous,capture_hand)
  if not captured:
   anchor.matrix_world=previous;key_object(anchor,frame)
  scene_update();precontact=contact_metrics(previous);wrist=rig.matrix_world@rig.pose.bones['DEF-hand.R'].matrix
  wrist_error=(wrist.translation-plan['wrist_matrix'].translation).length
  capture_now=(not captured and 100<=frame<=128 and len(precontact['distinct_near_parts'])>=2 and precontact['nearest_signed_sample_distance']<.009 and rig.pose.bones['CTRL-fingers.R']['grip']>.2 and wrist_error<.015)
  if capture_now:
   CAPTURE=frame
   scene_update();capture_hand=plan['wrist_matrix'].copy();capture_prop=previous.copy();child.inverse_matrix=(rig.matrix_world@rig.pose.bones['DEF-hand.R'].matrix).inverted();anchor.matrix_world=capture_prop;key_object(anchor,frame)
   child.influence=0;child.keyframe_insert('influence',frame=frame-1);child.influence=1;child.keyframe_insert('influence',frame=frame);child.influence=0
   c=joint.rigid_body_constraint;c.enabled=False;c.keyframe_insert('enabled',frame=frame-1);c.enabled=True;c.keyframe_insert('enabled',frame=frame);c.enabled=False
   # Freeze the anchor's base transform, then let its ChildOf follow the real
   # hand bone. Re-author held targets once, eliminating the feedback loop.
   for future in range(frame+1,FRAMES+1):
    target=holding_target((future-1)/FPS,capture_hand);ctrl=rig.pose.bones['CTRL-hand_ik.R'];ctrl.matrix=rig.matrix_world.inverted()@target;key_pose(ctrl,future);anchor.matrix_world=capture_prop;key_object(anchor,future)
   captured=True
  scene.frame_set(frame);scene_update();sample=measure(frame,plan);SAMPLES.append(sample)
  if frame in KEY_FRAMES:render_frame(frame)
  if frame%24==0:print('ACTION_QA_PROGRESS '+json.dumps({'frame':frame,'prop':sample['prop_position'],'joint':sample['joint_enabled'],'foot_error':max(v['target_error']for v in sample['feet'].values())}),flush=True)
  if not all(math.isfinite(x)for x in sample['prop_position']):raise RuntimeError('Dynamic prop became non-finite')
  if frame==129 and not captured:raise RuntimeError('No reachable multi-contact grasp was observed; joint was not attached')
 # Keep project-local cloth/Bullet disk caches. Do not claim an unobserved bake.
 first_pass_samples=list(SAMPLES);action_curve_settings();scene.camera=full_camera;bpy.ops.wm.save_as_mainfile(filepath=str(MASTER),check_existing=False)
 print('ACTION_QA_BAKING_NATIVE_CACHES',flush=True);bpy.ops.ptcache.bake_all(bake=True)
 SAMPLES.clear();OUTPUTS.clear()
 for frame in range(1,FRAMES+1):
  scene.frame_set(frame);scene_update();feet=[]
  for side in['R','L']:
   sole,q,swing=foot_plan(side,(frame-1)/FPS);feet.append((side,sole,q,swing,sole-q@foot_info[side]['offset']))
  plan={'feet':feet,'pelvis_lowering':first_pass_samples[frame-1]['pelvis_lowering']};SAMPLES.append(measure(frame,plan))
  if frame in KEY_FRAMES:render_frame(frame)
 scene.camera=full_camera;scene.render.resolution_x=512;scene.render.resolution_y=640;scene.frame_set(FRAMES);scene_update();bpy.ops.wm.save_as_mainfile(filepath=str(MASTER),check_existing=False)
 max_slide=max(row['stance_slip_xy']for sample in SAMPLES for row in sample['feet'].values());penetration=max(0,-min(row['lowest_rendered_shoe_z']for sample in SAMPLES for row in sample['feet'].values()));bone_error=max(x['max_bone_length_error']for x in SAMPLES)
 prop_steps=[(Vector(b['prop_position'])-Vector(a['prop_position'])).length for a,b in zip(SAMPLES,SAMPLES[1:])];capture_jump=prop_steps[CAPTURE-2]
 hold_error=max((Vector(x['prop_position'])-actual_matrix(anchor).translation).length for x in SAMPLES[-1:])
 issues=[]
 if max_slide>.008:issues.append('support foot slip exceeded 8 mm')
 if penetration>.006:issues.append('rendered shoe penetrated floor more than 6 mm')
 if bone_error>1e-4:issues.append('a deform bone changed length')
 if capture_jump>.045:issues.append('capture displacement exceeded 45 mm in one frame')
 held=[s for s in SAMPLES if s['frame']>=CAPTURE+8]
 reference=held[0];relative_position_error=max((Vector(x['anchor_relative_position'])-Vector(reference['anchor_relative_position'])).length for x in held);reference_q=Quaternion(reference['anchor_relative_rotation']);relative_rotation_error=max(reference_q.rotation_difference(Quaternion(x['anchor_relative_rotation'])).angle for x in held)
 if relative_position_error>.035:issues.append('Compliant grasp motion exceeded its 35 mm overall seating envelope')
 if relative_rotation_error>.35:issues.append('Compliant grasp motion exceeded its 0.35 radian overall seating envelope')
 if max(s['wrist_target_error']for s in held)>.015:issues.append('held wrist target is outside the constant-length arm reach')
 if min(len(s['contact']['distinct_near_parts'])for s in held)<2:issues.append('held object lacks multiple distinct hand contact parts')
 if min(s['contact']['nearest_signed_sample_distance']for s in held)<-.018:issues.append('hand proxy samples penetrate the held object more than 18 mm')
 stable=[s for s in held if s['time']>=5.4]
 if not all('thumb'in s['contact']['distinct_near_parts']for s in stable):issues.append('thumb does not remain near the held object during the stable hold')
 if min(sum(p in s['contact']['distinct_near_parts']for p in['index','middle','ring','little'])for s in stable)<2:issues.append('fewer than two distinct fingers remain near the held object')
 stopped=[s for s in SAMPLES if s['time']>=7.3];stop_reference=stopped[0];stop_position_range=max((Vector(s['prop_position'])-Vector(stop_reference['prop_position'])).length for s in stopped);stop_rotation_range=max(Quaternion(stop_reference['prop_rotation']).rotation_difference(Quaternion(s['prop_rotation'])).angle for s in stopped)
 if stop_position_range>.004:issues.append('stopped object varied more than 4 mm during final 0.65 seconds')
 if stop_rotation_range>.07:issues.append('stopped object varied more than 0.07 radians during final 0.65 seconds')
 if issues:FAILURES.append({'run':RUN,'type':'action_acceptance','issues':issues,'renders':str(RENDERS)})
 cache_root=ROOT/('blendcache_'+MASTER.stem);cache_files=list(cache_root.glob('**/*'))if cache_root.exists()else[]
 report={'schema':'dafeiyu.native-action-contact-study.v1','status':'qa_completed_with_issues'if issues else'qa_sequence_completed_pending_visual_review','source':{'path':str(SOURCE),'sha256_at_load':source_hash},'scene':str(MASTER),'scene_sha256':hashlib.sha256(MASTER.read_bytes()).hexdigest(),'script':str(Path(__file__).resolve()),'blender_version':bpy.app.version_string,'fps':FPS,'frames':FRAMES,'seconds':time.perf_counter()-START,'run':RUN,
  'sequence':'head/eyes lead -> two world-foot-locked steps and root travel -> reach actual dynamic box -> joint-assisted finger grasp -> decelerate/stop',
  'physical_prop':{'name':prop.name,'mass':prop.rigid_body.mass,'dimensions':[v*2 for v in PROP_HALF],'grip_scope':'object-specific thin-box, joint-assisted; not arbitrary-object grasp','type':prop.rigid_body.type,'kinematic':prop.rigid_body.kinematic,'parent':prop.parent.name if prop.parent else None,'transform_action':prop.animation_data is not None,'gravity':list(scene.gravity),'capture_frame':CAPTURE,'grasp_joint_type':'GENERIC_SPRING','grasp_joint_count':1,'compliance':{'linear_limit_per_axis':.025,'linear_stiffness':280,'angular_limit_per_axis':.22,'angular_stiffness':6,'damping':.95},'anchor':'bone-follow after capture, tracked actual prop before capture','pure_friction_grasp':False,'post_capture_handoff':'wrist target frozen from capture and lifted independently of the dynamic prop','contact_refits_from_actual_skin':CONTACT_REFITS},
  'metrics':{'max_stance_slip_xy':max_slide,'max_rendered_shoe_penetration':penetration,'max_actual_swing_sole_height':max(f['actual_sole'][2]for s in SAMPLES for f in s['feet'].values()),'minimum_forward_knee_offset':min(v for s in SAMPLES for v in s['knee_forward_offsets']),'max_bone_length_error':bone_error,'max_prop_displacement_per_frame':max(prop_steps),'capture_displacement':capture_jump,'final_object_anchor_distance':hold_error,'held_relative_position_drift':relative_position_error,'held_relative_rotation_drift':relative_rotation_error,'stopped_object_position_range':stop_position_range,'stopped_object_rotation_range':stop_rotation_range,'minimum_distinct_held_contact_parts':min(len(x['contact']['distinct_near_parts'])for x in held),'root_total_travel':(Vector(SAMPLES[-1]['root_world_position'])-Vector(SAMPLES[0]['root_world_position'])).length,'root_total_yaw_degrees':math.degrees(math.atan2((rig.pose.bones['Root'].matrix@rest['Root'].inverted())[1][0],(rig.pose.bones['Root'].matrix@rest['Root'].inverted())[0][0]))},
  'cache':{'directory':str(cache_root),'files':sum(p.is_file()for p in cache_files),'bytes':sum(p.stat().st_size for p in cache_files if p.is_file()),'rigid_body_is_baked':scene.rigidbody_world.point_cache.is_baked,'cloth':[{'object':o.name,'is_baked':m.point_cache.is_baked}for o in bpy.data.objects for m in o.modifiers if m.type=='CLOTH'],'method':'Native point-cache bake after adaptive control keys; replayed all 192 cached frames'},'renders':OUTPUTS,'samples':SAMPLES,'failure_records':FAILURES,'issues':issues,
  'limitations':['This is an offline authored contact QA sequence, not an interruptible live controller','Root/COG and limb actuation are kinematic; whole-body dynamic balance is not solved','The object-specific grasp uses an explicit compliant spring joint, not verified friction-only force closure or arbitrary-object grasp','Contact distances sample collision proxy surfaces; native Bullet contact impulses are not exposed by this report','Hair follows the head; no independent hair physics was added','Native cloth was evaluated sequentially; visual contact/cloth stability still requires review','Art has not been certified against the video reference']}
 assert prop.parent is None and prop.rigid_body.type=='ACTIVE'and not prop.rigid_body.kinematic and prop.animation_data is None
 REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print('ACTION_QA_RESULT '+json.dumps({k:report[k]for k in['status','scene','metrics','issues','cache','renders']},ensure_ascii=False),flush=True)
try:main()
except Exception as error:
 FAILURES.append({'run':RUN,'type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc(),'renders':str(RENDERS)})
 REPORT.write_text(json.dumps({'status':'failed','failure_records':FAILURES,'samples':SAMPLES,'renders':OUTPUTS},ensure_ascii=False,indent=2),encoding='utf8')
 try:bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/('body-action-failed-'+RUN+'.blend')),check_existing=False)
 except Exception:pass
 raise
