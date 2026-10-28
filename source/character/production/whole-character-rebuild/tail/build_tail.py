"""Native static whale tail in the shared X-front/Y-across/Z-up raw frame."""
import bpy, bmesh, math, json, numpy as np
from pathlib import Path
from mathutils import Vector
from mathutils.geometry import tessellate_polygon

OUT=Path('D:/CodexTaskData/dafeiyu-whole-tail-20261028')
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
tailcol=bpy.data.collections.new('DAFEIYU_TAIL_NATIVE'); bpy.context.scene.collection.children.link(tailcol)
def place(obj):
    for c in list(obj.users_collection): c.objects.unlink(obj)
    tailcol.objects.link(obj)
def smoothstep(a,b,v):
    t=max(0,min(1,(v-a)/(b-a)));return t*t*(3-2*t)
def catmull(points, i, t, closed=False):
    n=len(points)
    get=lambda j: Vector(points[j%n] if closed else points[max(0,min(n-1,j))])
    p0,p1,p2,p3=get(i-1),get(i),get(i+1),get(i+2)
    return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t)

# The fin silhouette is one continuous closed outline. Its bottom valley and
# shallow dorsal fork describe two leaf-shaped flukes rather than separate slabs.
outline=[(.108,-.292),(.143,-.315),(.184,-.337),(.226,-.344),(.254,-.348),
 (.263,-.309),(.280,-.276),(.312,-.251),(.350,-.238),(.389,-.229),
 (.417,-.211),(.429,-.197),(.433,-.225),(.426,-.268),(.410,-.310),
 (.387,-.351),(.360,-.385),(.328,-.409),(.295,-.419),(.270,-.413),
 (.253,-.396),(.237,-.412),(.208,-.423),(.177,-.421),(.148,-.409),
 (.126,-.388),(.111,-.359),(.105,-.328)]
rim=[catmull(outline,i,j/5,True) for i in range(len(outline)) for j in range(5)]
# Triangulation is made conforming before the front/back lens is built. Shared
# edge midpoint caching avoids cracks and nonmatching subdivisions at the rim.
tris=tessellate_polygon([[Vector((p.x,p.y,0)) for p in rim]])
vs=[Vector((p.x,p.y)) for p in rim]
lookup={(round(p.x,9),round(p.y,9)):i for i,p in enumerate(vs)}
faces=[tuple(p if isinstance(p,int) else lookup[(round(p.x,9),round(p.y,9))] for p in tri) for tri in tris]
for depth in range(5):
    cache={}
    def mid(a,b):
        k=tuple(sorted((a,b)))
        if k not in cache: cache[k]=len(vs);vs.append((vs[a]+vs[b])*.5)
        return cache[k]
    new=[]
    for a,b,c in faces:
        ab,bc,ca=mid(a,b),mid(b,c),mid(c,a)
        new.extend([(a,ab,ca),(ab,b,bc),(ca,bc,c),(ab,bc,ca)])
    faces=new
def dist_rim(p):
    d=100
    for i,a in enumerate(rim):
        b=rim[(i+1)%len(rim)];delta=b-a
        t=max(0,min(1,(p-a).dot(delta)/max(delta.length_squared,1e-12)))
        d=min(d,(p-a-delta*t).length)
    return d
distances=[]
rp=np.array([list(p) for p in rim]);aa=rp;dd=np.roll(rp,-1,axis=0)-rp
for chunk in range(0,len(vs),2048):
    pts=np.array([list(p) for p in vs[chunk:chunk+2048]])
    diff=pts[:,None,:]-aa[None,:,:]
    tt=np.clip(np.sum(diff*dd[None,:,:],axis=2)/np.sum(dd*dd,axis=1)[None,:],0,1)
    distances.extend(np.sqrt(np.min(np.sum((diff-tt[:,:,None]*dd[None,:,:])**2,axis=2),axis=1)))
verts=[]
for side in [1,-1]:
    for p,edge in zip(vs,distances):
        y,z=p
        # A domed hydrodynamic cross-section, smoothly disappearing into a rim.
        half=.031*math.sin(min(1,edge/.045)*math.pi/2)**.75
        # Permanent object-space twist gives side/back curvature and tip sweep.
        center=-.112+.036*smoothstep(.21,.43,y)+.014*math.sin((z+.42)*16)
        verts.append((center+side*half,y,z))
n=len(vs)
mf=faces+[(c+n,b+n,a+n) for a,b,c in faces]
mesh=bpy.data.meshes.new('Conforming_Biconvex_Twin_Fluke_Surface');mesh.from_pydata(verts,[],mf);mesh.update()
fin=bpy.data.objects.new('Tail_Fluke_Volume',mesh);tailcol.objects.link(fin)
bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=.000001);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(mesh);bm.free()

# Root is inside the pelvic clothing envelope; the first exposed portion is
# behind the hem.  Parallel transport frames make the stem independent of view.
anchors=[(-.025,-.06,-.16),(-.105,-.057,-.205),(-.165,-.034,-.275),
 (-.173,.027,-.319),(-.153,.091,-.348),(-.124,.157,-.361),(-.103,.214,-.363),(-.105,.249,-.369)]
centers=[catmull(anchors,i,j/10) for i in range(len(anchors)-1) for j in range(10)]+[Vector(anchors[-1])]
verts=[];faces=[];N=48
for j,p in enumerate(centers):
    t=j/(len(centers)-1);tangent=(centers[min(j+1,len(centers)-1)]-centers[max(0,j-1)]).normalized()
    normal=Vector((0,0,1));normal=(normal-tangent*normal.dot(tangent)).normalized();binormal=tangent.cross(normal).normalized()
    rad=.037-.010*t+.003*math.sin(t*math.pi)-.009*smoothstep(.68,1,t)
    for k in range(N):
        theta=2*math.pi*k/N
        q=p+normal*(math.sin(theta)*rad)+binormal*(math.cos(theta)*rad*.94)
        verts.append(q)
for j in range(len(centers)-1):
    for k in range(N):
        a=j*N+k;b=j*N+(k+1)%N;c=(j+1)*N+(k+1)%N;d=(j+1)*N+k;faces.append((a,b,c,d))
faces.extend([tuple(reversed(range(N))),tuple((len(centers)-1)*N+k for k in range(N))])
me=bpy.data.meshes.new('Transported_Rounded_Stem');me.from_pydata(verts,[],faces);me.update()
stem=bpy.data.objects.new('Tail_Rounded_Stem',me);tailcol.objects.link(stem)
# Weld both volumes into one editable skin so the stem/fluke has no T seam.
bpy.ops.object.select_all(action='DESELECT');fin.select_set(True);stem.select_set(True);bpy.context.view_layer.objects.active=fin
bpy.ops.object.join();tail=bpy.context.object;tail.name='Whale_Tail_Continuous_Editable'
rem=tail.modifiers.new('Continuous volume junction','REMESH');rem.mode='VOXEL';rem.voxel_size=.0021;rem.use_smooth_shade=True
bpy.ops.object.modifier_apply(modifier=rem.name)
sm=tail.modifiers.new('Relax hydrodynamic skin','SMOOTH');sm.factor=.75;sm.iterations=12;bpy.ops.object.modifier_apply(modifier=sm.name)
group=tail.vertex_groups.new(name='Stem_to_fluke_fairing')
for v in tail.data.vertices:
    distance=(v.co-Vector((-.113,.202,-.360))).length
    w=1-smoothstep(.025,.085,distance)
    if w>0:group.add([v.index],w,'REPLACE')
sm=tail.modifiers.new('Fair continuous root junction','SMOOTH');sm.factor=.8;sm.iterations=28;sm.vertex_group=group.name;bpy.ops.object.modifier_apply(modifier=sm.name)
for p in tail.data.polygons:p.use_smooth=True
sub=tail.modifiers.new('Silhouette smoothing','SUBSURF');sub.levels=1;sub.render_levels=1

def linear(c):return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
def rgb(h):return [linear(int(h[i:i+2],16)/255) for i in (0,2,4)]
navy=rgb('142e53');blue=rgb('245582');slate=rgb('45617f')
colors=tail.data.color_attributes.new(name='Tail_Indigo_Two_Bands',type='FLOAT_COLOR',domain='POINT')
for v,c in zip(tail.data.vertices,colors.data):
    x,y,z=v.co
    bandline=-.365+.12*max(0,y-.24)
    belly=1-smoothstep(bandline-.010,bandline+.006,z)
    # Upper surfaces remain navy, with an understated slate transition stripe.
    stripe=math.exp(-((z-(bandline+.011))/.013)**2)*.43*(1-smoothstep(.235,.285,y))
    col=[navy[i]*(1-belly)+blue[i]*belly for i in range(3)]
    col=[col[i]*(1-stripe)+slate[i]*stripe for i in range(3)]
    c.color=(*col,1)
mat=bpy.data.materials.new('Tail • deep navy / medium blue');mat.use_nodes=True
bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Roughness'].default_value=.64;bs.inputs['Specular IOR Level'].default_value=.17
attr=mat.node_tree.nodes.new('ShaderNodeVertexColor');attr.layer_name=colors.name
mat.node_tree.links.new(attr.outputs['Color'],bs.inputs['Base Color']);tail.data.materials.append(mat)
tail['part']='Whale tail, continuous static volume';tail['camera_facing']=False;tail['source_front_outline']='Identity front, asymmetric two-fluke tail'
tail['back_surface']='Inferred volume and two-blue palette; reference has no verified orthographic back'
tail['root_coordinate']=list(anchors[0]);tail['static_only']=True

def empty(name,location):
    ob=bpy.data.objects.new(name,None);tailcol.objects.link(ob);ob.location=location;ob.empty_display_size=.015;ob.hide_render=True;return ob
empty('TAIL_ROOT_pelvis',anchors[0]);empty('TAIL_STEM_bend',anchors[3]);empty('TAIL_FLUKE_center',anchors[-1])
guide=empty('TAIL_FRAME_Xfront_Yacross_Zup',(0,0,0));guide['centerline_xyz']=json.dumps(anchors)

scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=24
scene.render.resolution_x=800;scene.render.resolution_y=650;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.world.color=(.18,.18,.18);scene.view_settings.view_transform='Standard';scene.view_settings.look='None'
qa=bpy.data.collections.new('TAIL_QA_LIGHTS_CAMERAS');scene.collection.children.link(qa)
def area(name,loc,power,size):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size
    o=bpy.data.objects.new(name,d);qa.objects.link(o);o.location=loc;o.rotation_euler=(Vector((-.09,.15,-.30))-o.location).to_track_quat('-Z','Y').to_euler()
area('Tail_Key',(1.1,-.9,1.3),65,1.4);area('Tail_Fill',(-.8,.9,.5),45,1.0)
data=bpy.data.cameras.new('Tail_Review_Camera');cam=bpy.data.objects.new('Tail_Review_Camera',data);qa.objects.link(cam);scene.camera=cam;data.type='ORTHO';data.ortho_scale=.63
target=Vector((-.085,.16,-.285))
views=[]
for angle in (0,45,90,180):
    a=math.radians(angle);cam.location=target+Vector((2*math.cos(a),2*math.sin(a),.08));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(OUT/'renders'/f'tail-{angle:03d}.png');bpy.ops.render.render(write_still=True);views.append(scene.render.filepath)
cam.location=target+Vector((2,0,.06));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.select_all(action='DESELECT');tail.select_set(True);bpy.context.view_layer.objects.active=tail
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'tail-native.blend'))
bm=bmesh.new();bm.from_mesh(tail.data)
audit={'vertices':len(tail.data.vertices),'faces':len(tail.data.polygons),'boundary_edges':sum(e.is_boundary for e in bm.edges),'nonmanifold_edges':sum(not e.is_manifold for e in bm.edges),'components':None}
bm.free()
manifest={'part':'tail','collection':'DAFEIYU_TAIL_NATIVE','file':str(OUT/'tail-native.blend'),'rawFrame':'X+front / Y+screen-right / Z+up','root':anchors[0],'centerline':anchors,'geometry':audit,'views':views,'static':True,'rigged':False,'physics':False,'cameraFacing':False,'finalAccepted':False,'frontBasis':'Original identity silhouette and two blue bands; asymmetric flukes retained','inferred':'Unseen back thickness, surface roundness, stem spatial bend'}
(OUT/'tail-native-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
print(json.dumps(manifest,indent=2))
