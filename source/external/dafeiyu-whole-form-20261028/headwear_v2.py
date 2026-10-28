import bpy,math
from mathutils import Vector
P='D:/CodexTaskData/dafeiyu-whole-form-20261028'
bpy.ops.wm.open_mainfile(filepath=P+'/separated-v2.blend');s=bpy.context.scene
for o in list(bpy.data.objects):
 if o.name.startswith('Maid_headdress_3D_rebuilt'):bpy.data.objects.remove(o,do_unlink=True)
old=bpy.data.objects['Old_fused_headband_removed'];attr=old.data.color_attributes['Col']
# keep inferred original while testing geometry
# Closed frilled cloth band following arch on scalp; X front, Y sideways, Z up.
verts=[];faces=[];N=192;K=16
for i in range(N+1):
 a=-math.pi/2+math.pi*i/N
 for j in range(K):
  t=2*math.pi*j/K; r=.020+.007*math.cos(a*12)
  # elliptical section; scalloped edge tangent to head plane
  y=-.06+(.213+r*math.cos(t))*math.sin(a);z=.258+(.185+r*math.cos(t))*math.cos(a)
  x=.29+.035*math.sin(t);verts.append((x,y,z))
for i in range(N):
 for j in range(K):
  k=(j+1)%K;faces.append((i*K+j,i*K+k,(i+1)*K+k,(i+1)*K+j))
faces.append(tuple(reversed(range(K))));faces.append(tuple(N*K+j for j in range(K)))
mesh=bpy.data.meshes.new('ruffled band solid');mesh.from_pydata(verts,[],faces);mesh.update();band=bpy.data.objects.new('Headband_rebuilt_frilled_cloth',mesh);s.collection.objects.link(band)
mat=bpy.data.materials.new('Headband_soft_ivory');mat.diffuse_color=(.83,.8,.81,1);mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.83,.8,.81,1);bs.inputs['Roughness'].default_value=.9;mesh.materials.append(mat)
for f in mesh.polygons:f.use_smooth=True
# Lights for headband; face/material remain unlit.
def area(name,loc,power,size):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
area('softbox',(3,-3,5),180,4)
cam=s.camera;center=Vector((.063081,-.005865,-.002912));s.cycles.samples=8
for angle in (0,45,90,180):
 t=math.radians(angle);cam.location=center+Vector((4*math.cos(t),4*math.sin(t),.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=P+f'/headwear-v2-{angle:03}.png';bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=P+'/headwear-v2.blend')

