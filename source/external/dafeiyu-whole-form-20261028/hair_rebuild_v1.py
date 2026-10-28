import bpy,math,bmesh
from mathutils import Vector
P='D:/CodexTaskData/dafeiyu-whole-form-20261028'
bpy.ops.wm.open_mainfile(filepath=P+'/separated-v2.blend');s=bpy.context.scene
for o in list(bpy.data.objects):
 if o.name.startswith('Maid_headdress_3D_rebuilt'):bpy.data.objects.remove(o,do_unlink=True)
# Isolate side hair field only, retaining a hidden reversible original.
hair=bpy.data.objects['Hair_inferred_guide'];backup=hair.copy();backup.data=hair.data.copy();s.collection.objects.link(backup);backup.name='Hair_original_backup_hidden';backup.hide_render=True;backup.hide_viewport=True
bm=bmesh.new();bm.from_mesh(hair.data);bm.faces.ensure_lookup_table()
removed=[f for f in bm.faces if abs(f.calc_center_median().y+.06)>.155 and f.calc_center_median().z<.065 and f.calc_center_median().x<.07]
bmesh.ops.delete(bm,geom=removed,context='FACES');bm.to_mesh(hair.data);bm.free();hair.data.update()
# Closed, tapering swept locks around the existing crown. Material variations follow depth.
colors=[(.018,.055,.19,1),(.025,.10,.29,1),(.035,.16,.40,1),(.06,.25,.52,1)]
mats=[]
for i,c in enumerate(colors):
 m=bpy.data.materials.new('lock blue '+str(i));m.diffuse_color=c;m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=c;p.inputs['Roughness'].default_value=.65;mats.append(m)
def interp(a,b,t):return a*(1-t)+b*t
def lock(name,points,radii):
 # Catmull-Rom centerline interpolation and elliptical cross sections.
 ps=[Vector(v) for v in points];steps=8;seq=[]
 for k in range(len(ps)-1):
  p0=ps[max(0,k-1)];p1=ps[k];p2=ps[k+1];p3=ps[min(len(ps)-1,k+2)]
  for j in range(steps):
   t=j/steps; v=.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t)
   seq.append((v,interp(radii[k],radii[k+1],t)))
 seq.append((ps[-1],radii[-1]));verts=[];faces=[];N=12
 for i,(p,r) in enumerate(seq):
  tangent=(seq[min(i+1,len(seq)-1)][0]-seq[max(0,i-1)][0]).normalized();front=Vector((1,0,0));front=(front-tangent*front.dot(tangent)).normalized();side=tangent.cross(front).normalized()
  for j in range(N):
   a=2*math.pi*j/N;v=p+front*(r*.70*math.cos(a))+side*(r*math.sin(a));verts.append(tuple(v))
 for i in range(len(seq)-1):
  for j in range(N):faces.append((i*N+j,i*N+(j+1)%N,(i+1)*N+(j+1)%N,(i+1)*N+j))
 faces.extend([tuple(reversed(range(N))),tuple((len(seq)-1)*N+j for j in range(N))]);me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new(name,me);s.collection.objects.link(ob)
 for m in mats:me.materials.append(m)
 for i,p in enumerate(me.polygons):p.use_smooth=True;p.material_index=min(3,int((i//N)/max(1,len(seq)-1)*4))
 return ob
# Each side: multiple smooth wavy masses with tapering swept tips, attached to crown level.
for side in (-1,1):
 for i in range(3):
  q=.19+i*.048; y=lambda d:-.06+side*d
  points=[(-.04,y(q-.02),.11),(-.045,y(q),.02),(-.06,y(q+.035),-.06),(-.07,y(q+.055),-.13),(-.07,y(q+.03),-.18),(-.06,y(q+.065),-.20)]
  radii=[.038,.050,.051,.045,.035,.004]
  lock('Rebuilt_swept_hair_%s_%s'%(side,i),points,radii)
# Soft light affects only new PBR locks.
d=bpy.data.lights.new('hair_softbox','AREA');d.energy=120;d.size=4;light=bpy.data.objects.new('hair_softbox',d);s.collection.objects.link(light);light.location=(3,-3,5);light.rotation_euler=(-light.location).to_track_quat('-Z','Y').to_euler()
cam=s.camera;center=Vector((.063081,-.005865,-.002912));s.cycles.samples=8
for angle in (0,45,90,180):
 t=math.radians(angle);cam.location=center+Vector((4*math.cos(t),4*math.sin(t),.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=P+f'/hair-rebuild-v1-{angle:03}.png';bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=P+'/hair-rebuild-v1.blend');print('removed faces',len(removed))
