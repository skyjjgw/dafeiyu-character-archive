"""Independent v4 tailoring proof, not a replacement body or runtime asset.

Loads frozen body-v3 read-only, reroutes only the new study's proximal tail,
and creates genuine compact cloth and petticoat surfaces with a small outlet.
The runtime contract is explicit irregular triangles; no old bilinear binding.
"""
import bpy,bmesh,json,hashlib,math,sys
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.geometry import intersect_ray_tri,barycentric_transform,interpolate_bezier

ROOT=Path(__file__).resolve().parent.parent
FINAL='--final-v4'in sys.argv
BASE=Path(sys.argv[sys.argv.index('--base')+1])if'--base'in sys.argv else ROOT/'body-v3.blend'
OUT=ROOT/('renders/body-v4'if FINAL else'tail-outlet-v4-study');OUT.mkdir(parents=True,exist_ok=True)
FROZEN=[ROOT/name for name in ['body-v2.blend','body-v3.blend','petticoat-v1.blend','scripts/build_body.py','scripts/build_body_v3.py','scripts/build_petticoat.py']]
HASHES={str(p):hashlib.sha256(p.read_bytes()).hexdigest()for p in FROZEN}
OLD=[Vector(p)for p in[(.25,.24,.90),(.45,.26,.68),(.65,.28,.50),(.85,.26,.52),(1.05,.22,.60),(1.16,.20,.67)]]
NEW=[Vector(p)for p in[(.25,.24,.90),(.42,.46,.86),(.65,.49,.56),(.85,.44,.52),(1.05,.32,.60),(1.16,.28,.67)]]
N=64;ROWS=19;CLEARANCE=.014;TRIM=.018
bpy.ops.wm.open_mainfile(filepath=str(BASE));scene=bpy.context.scene;scene.frame_set(1)
rig=next(o for o in scene.objects if o.type=='ARMATURE'and 'Head'in o.data.bones)
rig.name='Body V4 tailoring STUDY - not runtime release'
tail=bpy.data.objects['Whale tail unified stem and shared-fork fluke'];cage=next(o for o in scene.objects if o.name.startswith('SKIRT_SIM'))
original_points=[v.co.copy()for v in cage.data.vertices];assert len(original_points)==N*ROWS
original_faces=[tuple(p.vertices)for p in cage.data.polygons]
def bone_records():
    return{name:{'head':list(b.head_local),'tail':list(b.tail_local),'matrix':[v for row in b.matrix_local for v in row]}for name,b in rig.data.bones.items()}
REST_BEFORE=bone_records()
def sample(path,t):
    q=max(0,min(4,t*4));i=min(3,int(q));u=q-i;p0=path[max(0,i-1)];p1=path[i];p2=path[i+1];p3=path[min(len(path)-1,i+2)]
    return .5*((2*p1)+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u)
old_samples=[sample(OLD,i/128)for i in range(129)]
for obj in list(scene.objects):
    if obj.name.startswith('CONTACT DEF-tail.'):
        bpy.data.objects.remove(obj,do_unlink=True)
for obj in bpy.context.selected_objects:obj.select_set(False)
rig.select_set(True);bpy.context.view_layer.objects.active=rig;bpy.ops.object.mode_set(mode='EDIT')
for i in range(5):
    b=rig.data.edit_bones['DEF-tail.'+str(i)];b.head=NEW[i];b.tail=NEW[i+1];b.align_roll(Vector((0,1,0)))
bpy.ops.object.mode_set(mode='OBJECT');rig.update_tag();bpy.context.view_layer.update();REST_AFTER=bone_records();changed=[name for name in REST_BEFORE if REST_BEFORE[name]!=REST_AFTER[name]];assert set(changed)=={'DEF-tail.'+str(i)for i in range(5)},changed

def triangle_data(obj):
    ev=obj.evaluated_get(bpy.context.evaluated_depsgraph_get());me=ev.to_mesh();me.calc_loop_triangles();v=[ev.matrix_world@p.co for p in me.vertices];f=[tuple(p.vertices)for p in me.loop_triangles];ev.to_mesh_clear();return v,f
def tree_data(points,faces):
    faces=[(f[0],f[i],f[i+1])for f in faces for i in range(1,len(f)-1)];return BVHTree.FromPolygons(points,faces,all_triangles=True),faces
# Rebuild the softened convex fluke from a real curved boundary. Warping the
# old concave cap was rejected after actual renders showed spikes.
import ast,re
source_script=ROOT/'scripts/build_body_v3.py';source_text=source_script.read_text(encoding='utf8');namespace={'__file__':str(source_script)}
exec(compile(source_text[:source_text.index('try:main()')],str(source_script),'exec'),namespace)
function=next(n for n in ast.parse(source_text).body if isinstance(n,ast.FunctionDef)and n.name=='build_forked_fluke');helper=ast.get_source_segment(source_text,function)
new_outline=[(1.005,.585),(1.045,.760),(1.245,.940),(1.490,1.055),(1.475,.885),(1.375,.755),(1.205,.635),(1.395,.550),(1.510,.430),(1.540,.315),(1.330,.355),(1.140,.440),(1.025,.515)]
helper=re.sub(r' controls=\[.*\]', ' controls='+repr(new_outline),helper,count=1).replace('corners={3,6,9}','corners={6}').replace('.20+sign*depth(p)','.30+sign*depth(p)')
old_depth=' def depth(p):return .004+.035*min(1,min(distance(p,a,b)for a,b in zip(boundary,boundary[1:]+boundary[:1]))/.095)**.65'
new_depth=''' # A torsion/Poisson cap has a smooth interior, unlike minimum-distance
 # thickness which forms a medial ridge and a spurious narrow shadow valley.
 adjacency=[{}for p in xy];area=[0. for p in xy];fixed={i for edge in rim for i in edge}
 for tri in cap:
  a,b,c=tri;cross=abs((xy[b]-xy[a]).cross(xy[c]-xy[a]).z);triangle_area=cross/2
  for i in tri:area[i]+=triangle_area/3
  for i,j,k in[(a,b,c),(b,c,a),(c,a,b)]:
   w=max(.00001,(xy[i]-xy[k]).dot(xy[j]-xy[k])/max(1e-12,cross)/2);adjacency[i][j]=adjacency[i].get(j,0)+w;adjacency[j][i]=adjacency[j].get(i,0)+w
 field=[0. for p in xy]
 for iteration in range(550):
  for i in range(len(xy)):
   if i not in fixed:
    total=sum(adjacency[i].values());target=(area[i]+sum(w*field[j]for j,w in adjacency[i].items()))/max(total,1e-12);field[i]=max(0,field[i]+1.35*(target-field[i]))
 maximum=max(field);lookup={tuple(round(c,7)for c in p):i for i,p in enumerate(xy)}
 def depth(p):return .004+.056*math.sqrt(max(0,field[lookup[tuple(round(c,7)for c in p)]])/maximum)'''
assert old_depth in helper;helper=helper.replace(old_depth,new_depth)
exec(compile(helper,str(source_script)+'[v4-tail-function]','exec'),namespace)
namespace.update({'RIG':rig,'TAIL_PATH':NEW,'COL':{'accessories':scene.collection},'MAT':{'navy':bpy.data.materials['Dafeiyu navy']},'V3_MEASUREMENTS':{}})
surface=namespace['Surface']();centers=[sample(NEW,i/32)for i in range(33)]
def weight(t,p):
 q=t*4;i=min(3,int(q));return namespace['blend']('DEF-tail.'+str(i),'DEF-tail.'+str(i+1),q-i)
last=namespace['tube'](surface,centers,[(.078-.022*i/32,.064-.014*i/32)for i in range(33)],20,weight,'tail');surface.cap(last,'tail',{'DEF-tail.4':1});surface.cap(list(range(20)),'tail',{'DEF-tail.0':1})
new_tail=namespace['mesh_object']('V4 routed whale tail - full convex shared fork',surface.v,surface.f,scene.collection,[bpy.data.materials['Dafeiyu navy']]);namespace['build_forked_fluke'](new_tail);bpy.data.objects.remove(tail,do_unlink=True);tail=new_tail
# Real volumetric regularization removes Boolean's tiny intersection triangles
# and the distance-cap medial ridge. Rebind the actual remeshed volume after
# smoothing, instead of hiding those artifacts in a material or normal edit.
for modifier in list(tail.modifiers):tail.modifiers.remove(modifier)
bpy.context.view_layer.objects.active=tail
for item in bpy.context.selected_objects:item.select_set(False)
tail.select_set(True);before_remesh=namespace['topology'](tail);remesh=tail.modifiers.new('Actual shared fork volumetric remesh','REMESH');remesh.mode='VOXEL';remesh.voxel_size=.0085;remesh.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=remesh.name)
smooth=tail.modifiers.new('Smooth actual convex volume not shading only','SMOOTH');smooth.factor=.45;smooth.iterations=10;bpy.ops.object.modifier_apply(modifier=smooth.name)
tail.vertex_groups.clear();weights=[]
for v in tail.data.vertices:
 p=v.co;best=(1e9,0.)
 for i,(a,b)in enumerate(zip(NEW[:4],NEW[1:5])):
  axis=b-a;t=max(0,min(1,(p-a).dot(axis)/axis.length_squared));distance=(p-a-axis*t).length
  if distance<best[0]:best=(distance,i+t)
 q=best[1];i=min(3,int(q));weights.append({'DEF-tail.4':1}if p.x>1.075 else namespace['blend']('DEF-tail.'+str(i),'DEF-tail.'+str(i+1),q-i))
namespace['skin'](tail,weights,rig)
for poly in tail.data.polygons:poly.use_smooth=True
after_remesh=namespace['topology'](tail);assert after_remesh['connected_components']==1 and after_remesh['nonmanifold_edges']==0,after_remesh
bm=bmesh.new();bm.from_mesh(tail.data);tail_volume=bm.calc_volume(signed=True);minimum_tail_edge=min(e.calc_length()for e in bm.edges);bm.free();assert tail_volume>0 and minimum_tail_edge>1e-6

def tail_material(name,color):
 m=bpy.data.materials['Dafeiyu navy'].copy();m.name=name;m.diffuse_color=(*color,1)
 for node in m.node_tree.nodes:
  if node.type=='VALTORGB':
   for element,factor in zip(node.color_ramp.elements,[.62,.84,1]):element.color=(*(c*factor for c in color),1)
 return m
tail.data.materials.clear();tail.data.materials.append(tail_material('V4 tail deep indigo dorsal',(.035,.043,.080)));tail.data.materials.append(tail_material('V4 tail muted soft blue ventral',(.085,.12,.20)))
for poly in tail.data.polygons:
 p=sum((tail.data.vertices[i].co for i in poly.vertices),Vector())/len(poly.vertices)
 if p.x>1.075:ventral=p.y<.282
 else:
  k=min(range(len(centers)),key=lambda i:(p-centers[i]).length_squared);tangent=centers[min(k+1,32)]-centers[max(0,k-1)];normal=Vector((0,1,0)).cross(tangent).normalized();depth=tangent.cross(normal).normalized();ventral=(p-centers[k]).dot(depth)<0
 poly.material_index=int(ventral)
sub=tail.modifiers.new('High resolution rounded whale volume','SUBSURF');sub.levels=1;sub.render_levels=1
tail.data.update()

TAIL_V,TAIL_F=triangle_data(tail);TAIL_BVH=BVHTree.FromPolygons(TAIL_V,TAIL_F,all_triangles=True)
def crossing(points,faces):
    tree,tris=tree_data(points,faces);pairs=TAIL_BVH.overlap(tree);hits={}
    for ti,si in pairs:
        a=[TAIL_V[i]for i in TAIL_F[ti]];b=[points[i]for i in tris[si]]
        for outer,inner in [(a,b),(b,a)]:
            for p,q in zip(outer,outer[1:]+outer[:1]):
                d=q-p;hit=intersect_ray_tri(*inner,d,p,True)
                if hit is not None and-1e-6<=(hit-p).dot(d)/d.length_squared<=1+1e-6:hits[tuple(round(x,6)for x in hit)]=(hit,si)
    return list(hits.values()),tree,tris
def mesh(name,points,faces,material):
    me=bpy.data.meshes.new(name);me.from_pydata(points,[],faces);me.update();bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(me);bm.free();o=bpy.data.objects.new(name,me);scene.collection.objects.link(o);me.materials.append(material)
    for p in me.polygons:p.use_smooth=True
    return o
def material(name,color):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;n=m.node_tree.nodes;n.clear();em=n.new('ShaderNodeEmission');em.inputs[0].default_value=(*color,1);out=n.new('ShaderNodeOutputMaterial');m.node_tree.links.new(em.outputs[0],out.inputs[0]);return m
navy=next(m for m in bpy.data.materials if m.name=='Dafeiyu navy');cream=next(m for m in bpy.data.materials if m.name=='Dafeiyu cream');trim_material=material('Study tail outlet warm ivory binding',(.60,.57,.51));inner_material=material('Study inner stiff garment',(.42,.39,.34));stitch_material=material('Study paired tail opening stitches',(.18,.25,.34))
def surf(points,j,r):
    j=j%N;r=max(0,min(ROWS-1,r));a=int(j);b=min(ROWS-2,int(r));u=j-a;v=r-b
    return points[b*N+a].lerp(points[b*N+(a+1)%N],u).lerp(points[(b+1)*N+a].lerp(points[(b+1)*N+(a+1)%N],u),v)
def tailor(points,label):
    hits,tree,tris=crossing(points,original_faces);assert len(hits)>8,(label,len(hits));uv=[]
    for hit,tri_id in hits:
        ids=tris[tri_id];a,b,c=[points[i]for i in ids];ua,ub,uc=[Vector((i%N,i//N,0))for i in ids];q=barycentric_transform(hit,a,b,c,ua,ub,uc);uv.append(q)
    center=Vector(((min(p.x for p in uv)+max(p.x for p in uv))/2,(min(p.y for p in uv)+max(p.y for p in uv))/2,0));unit_j=(surf(points,center.x+.5,center.y)-surf(points,center.x-.5,center.y)).length;unit_r=(surf(points,center.x,center.y+.5)-surf(points,center.x,center.y-.5)).length
    radius=Vector(((max(p.x for p in uv)-min(p.x for p in uv))/2+CLEARANCE/unit_j,(max(p.y for p in uv)-min(p.y for p in uv))/2+CLEARANCE/unit_r,0));fit=max(math.sqrt(((p.x-center.x)/radius.x)**2+((p.y-center.y)/radius.y)**2)for p in uv);radius*=max(1,fit*1.03)
    j0=math.floor(center.x-radius.x)-2;j1=math.ceil(center.x+radius.x)+2;r0=math.floor(center.y-radius.y)-2;r1=math.ceil(center.y+radius.y)+2;assert 0<r0<r1<ROWS-1 and 0<j0<j1<N-1,(label,center,radius,[j0,j1,r0,r1])
    verts=[p.copy()for p in points];params=[Vector((i%N,i//N,0))for i in range(len(points))];faces=[f for r in range(ROWS-1)for j in range(N)if not(r0<=r<r1 and j0<=j<j1)for f in[(r*N+j,r*N+(j+1)%N,(r+1)*N+(j+1)%N,(r+1)*N+j)]]
    boundary=[r0*N+j for j in range(j0,j1+1)]+[r*N+j1 for r in range(r0+1,r1+1)]+[r1*N+j for j in range(j1-1,j0-1,-1)]+[r*N+j0 for r in range(r1-1,r0,-1)];last=boundary;hole=[]
    for layer in range(1,5):
        ring=[];t=layer/4
        for old in boundary:
            q=params[old];theta=math.atan2((q.y-center.y)/radius.y,(q.x-center.x)/radius.x);inner=center+Vector((radius.x*math.cos(theta),radius.y*math.sin(theta),0));uvp=q.lerp(inner,t);ring.append(len(verts));verts.append(surf(points,uvp.x,uvp.y));params.append(uvp)
        for i in range(len(last)):faces.append((last[i],last[(i+1)%len(last)],ring[(i+1)%len(ring)],ring[i]))
        last=ring
    hole=last;used=sorted({i for f in faces for i in f});remap={old:new for new,old in enumerate(used)};v=[verts[i]for i in used];f=[tuple(remap[i]for i in face)for face in faces];p=[params[i]for i in used];loop=[remap[i]for i in hole]
    orientation=sum((v[face[1]]-v[face[0]]).cross(v[face[2]]-v[face[0]]).dot(Vector((sum(v[i].x for i in face),sum(v[i].y for i in face),0)))for face in f)
    if orientation<0:f=[tuple(reversed(face))for face in f]
    remaining,_,_=crossing(v,f);assert not remaining,(label,len(remaining))
    return{'vertices':v,'faces':f,'uv':p,'hole':loop,'oldToNew':{str(i):remap.get(i,-1)for i in range(len(points))},'center':center,'radius':radius,'patch':[j0,j1,r0,r1],'intersection_points_before':len(hits),'intersection_points_after':len(remaining),'metric_j':unit_j,'metric_r':unit_r,'source_points':points}

outer=tailor(original_points,'outer skirt')
inner_points=[]
for i,p in enumerate(original_points):
    t=(i//N)/(ROWS-1);inner_points.append(Vector((p.x*.92,p.y*.92,p.z+.025*t*t-.004*(1-t))))
inner=tailor(inner_points,'petticoat')

# Remove old render skirt only in this isolated in-memory scene. The apron is
# rebound to the new real cage; its single-midsurface decoration chain remains.
for obj in list(scene.objects):
    if obj.name.startswith('Maid skirt -'):bpy.data.objects.remove(obj,do_unlink=True)
mid=next(o for o in scene.objects if o.name.startswith('APRON single'))
mod=next(m for m in mid.modifiers if m.type=='SURFACE_DEFORM');bpy.context.view_layer.objects.active=mid
for obj in bpy.context.selected_objects:obj.select_set(False)
mid.select_set(True);bpy.ops.object.surfacedeform_bind(modifier=mod.name)
new_mesh=bpy.data.meshes.new('V4 compact actual outlet cloth topology');new_mesh.from_pydata(outer['vertices'],[],outer['faces']);new_mesh.update();cage.data=new_mesh;cage.vertex_groups.clear();cage.name='SKIRT_SIM_V4 genuine tail opening compact cage'
pin=cage.vertex_groups.new(name='Waist_PIN');pelvis=cage.vertex_groups.new(name='DEF-pelvis')
for i,uv in enumerate(outer['uv']):
    w=1 if uv.y<=1 else .45 if uv.y<=2 else 0
    if w:pin.add([i],w,'REPLACE');pelvis.add([i],w,'REPLACE')
mod.target=cage;bpy.context.view_layer.update();bpy.ops.object.surfacedeform_bind(modifier=mod.name);assert mod.is_bound
def follower(obj,target):
    m=obj.modifiers.new('Follows real tailored cloth cage','SURFACE_DEFORM');m.target=target;bpy.context.view_layer.objects.active=obj
    for item in bpy.context.selected_objects:item.select_set(False)
    obj.select_set(True);bpy.context.view_layer.update();bpy.ops.object.surfacedeform_bind(modifier=m.name);assert m.is_bound
    return m
garment=mesh('V4 outer skirt true outlet - no phantom faces',outer['vertices'],outer['faces'],navy);garment.data.materials.append(cream)
for poly in garment.data.polygons:
    if sum(outer['uv'][i].y for i in poly.vertices)/len(poly.vertices)>=ROWS-4:poly.material_index=1
follower(garment,cage);sub=garment.modifiers.new('Tailored render smoothing','SUBSURF');sub.levels=1;sol=garment.modifiers.new('Actual cloth thickness','SOLIDIFY');sol.thickness=.007

petti=mesh('V4 petticoat same routed tail outlet',inner['vertices'],inner['faces'],inner_material);sol=petti.modifiers.new('6 mm true shell and aperture edge wall','SOLIDIFY');sol.thickness=.006;sol.offset=0;sol.use_even_offset=True
bpy.context.view_layer.objects.active=petti;bpy.ops.object.modifier_apply(modifier=sol.name);petti.modifiers.new('Actual petticoat cloth contact including open portal','COLLISION')
c=petti.constraints.new('CHILD_OF');c.target=rig;c.subtarget='DEF-pelvis';c.inverse_matrix=(rig.matrix_world@rig.pose.bones['DEF-pelvis'].matrix).inverted()

def binding(part,label,target=None):
    verts=[];faces=[];center,radius=part['center'],part['radius'];points=part['source_points'];angles=[]
    for i in part['hole']:
        q=part['uv'][i];angles.append(math.atan2((q.y-center.y)/radius.y,(q.x-center.x)/radius.x))
    for theta in angles:
        for radial in [0,.5,1]:
            q=center+Vector(((radius.x+TRIM*radial/part['metric_j'])*math.cos(theta),(radius.y+TRIM*radial/part['metric_r'])*math.sin(theta),0));p=surf(points,q.x,q.y);normal=Vector((p.x,p.y,0)).normalized();verts.append(p+normal*.004)
    for i in range(len(angles)):
        for j in range(2):faces.append((3*i+j,3*((i+1)%len(angles))+j,3*((i+1)%len(angles))+j+1,3*i+j+1))
    obj=mesh(label,verts,faces,trim_material)
    if target:follower(obj,target)
    sol=obj.modifiers.new('Folded real binding thickness','SOLIDIFY');sol.thickness=.004;sol.offset=0
    return obj
outer_binding=binding(outer,'V4 outer aperture folded two sided binding',cage);inner_binding=binding(inner,'V4 inner aperture folded binding')
inner_binding.constraints.new('CHILD_OF');c=inner_binding.constraints[-1];c.target=rig;c.subtarget='DEF-pelvis';c.inverse_matrix=(rig.matrix_world@rig.pose.bones['DEF-pelvis'].matrix).inverted()

def export_topology(part):
    v,f=part['vertices'],part['faces'];triangles=[(face[0],face[i],face[i+1])for face in f for i in range(1,len(face)-1)];usage={}
    for ti,t in enumerate(triangles):
        for a,b in zip(t,t[1:]+t[:1]):usage.setdefault(tuple(sorted((a,b))),[]).append(ti)
    assert all(len(ts)in[1,2]for ts in usage.values())
    used={i for t in triangles for i in t};assert len(used)==len(v)
    boundary=[list(edge)for edge,t in usage.items()if len(t)==1]
    return{'vertices':[[p.x,p.z,-p.y]for p in v],'triangles':triangles,'pinWeights':[1 if uv.y<=1 else .45 if uv.y<=2 else 0 for uv in part['uv']],'restUV':[[q.x/N,q.y/(ROWS-1)]for q in part['uv']],'oldGridToCompact':part['oldToNew'],'activeVertexIDs':list(range(len(v))),'boundaryEdges':boundary,'boundaryTags':{'tail_outlet':part['hole']},'twoTriangleEdges':[{'edge':list(edge),'triangles':ts}for edge,ts in usage.items()if len(ts)==2],'textureSize':[64,math.ceil(len(v)/64)],'outletDesign':{'centerGrid':list(part['center'][:2]),'ellipseRadiiGrid':list(part['radius'][:2]),'patchBoundsGrid':part['patch'],'nominalExtraRadialClearance':CLEARANCE,'trimWidth':TRIM,'beforeIntersectionPoints':part['intersection_points_before'],'afterIntersectionPoints':part['intersection_points_after']}}
payload={'schema':'dafeiyu.tail-outlet-topology.study.v4','status':'design_branch_not_runtime_release','coordinateFrame':'Godot +Y up +Z front model rest','sourceBodyV3Sha256':HASHES[str(ROOT/'body-v3.blend')],'outer':export_topology(outer),'petticoatMidSurface':export_topology(inner),'routing':{'previousNative':[list(p)for p in OLD],'proposedNative':[list(p)for p in NEW],'changedRestBones':changed,'reason':'Current route exits only near hem; new study exits backward through a local right rear aperture before descending.'},'runtimeContract':['compact real referenced vertices only; unused old grid IDs map to -1','Jolt receives explicit surviving triangles','bending hinges derive only from edges with exactly two adjacent actual triangles','render meshes must be genuinely cut and projected only to existing triangles; bind [a,b,c,c]/[w0,w1,w2,0] in existing attributes','position texture width 64 and height ceil(N/64); no fixed 1216 requirement','petticoat contact hulls near portal must split along actual surviving triangles and never convex-fill the portal'],'scope':['Tail outlet is in the right rear quadrant determined by real tail intersections, not rear center.','Existing waist pinning only; aperture edge is not rigidly pinned to the tail.','Visible inner garment is a stiff pelvis-following shell, no full multilayer cloth claim.','No runtime or parent assembly modification.','No action bake or dynamic contact stress acceptance.','A concealed right rear dressing closure is a further garment-construction task; this study models the closed small reinforced aperture only.']}
fin_vertices=[v.co for v in tail.data.vertices if v.co.x>1.15];payload['tailShapeAndColor']={'v3_defect':'Unified v3 fork used only one navy material; a ventral surface was not assigned.','v4_change':'Both lobe tips softened through newly sampled curved boundary, shared base retained, increased biconvex volume; true voxel regularization and mesh smoothing remove Boolean slivers and cap ridges.','dorsalLinearColor':[.035,.043,.080],'ventralLinearColor':[.085,.12,.20],'materialFaceCounts':{'dorsal':sum(p.material_index==0 for p in tail.data.polygons),'ventral':sum(p.material_index==1 for p in tail.data.polygons)},'flukeDepthY':max(v.y for v in fin_vertices)-min(v.y for v in fin_vertices),'beforeRemesh':before_remesh,'afterRemesh':after_remesh,'positiveVolume':tail_volume,'minimumActualMeshEdge':minimum_tail_edge,'reference':'references/user/tail-color-reference-v5.png used for palette only, not new costume or anatomy identity'}
(OUT/'topology-contract-v4.json').write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':')),encoding='utf8')

# Genuine native geometry QA: rest holes remain unfilled after shell thickness.
bpy.context.view_layer.update();outer_eval_v,outer_eval_f=triangle_data(garment);inner_eval_v,inner_eval_f=triangle_data(petti);actual_outer=crossing(outer_eval_v,outer_eval_f)[0];actual_inner=crossing(inner_eval_v,inner_eval_f)[0]
payload['restShellIntersectionCounts']={'outerAfterSubdivisionAndSolidify':len(actual_outer),'petticoatAfterSolidify':len(actual_inner)}
assert not actual_outer and not actual_inner,payload['restShellIntersectionCounts']
for obj in list(scene.objects):
    if obj.type=='FONT':bpy.data.objects.remove(obj,do_unlink=True)
scene.render.engine='BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=48;scene.render.resolution_x=896;scene.render.resolution_y=896;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='Standard'
camera=scene.camera;camera.data.type='ORTHO';renders={}
def render(name,point,direction,scale):
    point=Vector(point);camera.location=point+Vector(direction).normalized()*6;camera.rotation_euler=(point-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=scale;scene.render.filepath=str(OUT/(name+'.png'));bpy.context.view_layer.update();bpy.ops.render.render(write_still=True);renders[name]=scene.render.filepath
render('back-full',(.30,.10,.95),(0,1,.05),2.8);render('right-rear-full',(.30,.10,.95),(1,1,.10),2.8)
focus=surf(original_points,outer['center'].x,outer['center'].y)
render('outlet-close',focus,(.45,1,.28),.65)
render('ventral-tail-shape',(1.05,.30,.65),(0,-1,.05),1.40)
garment.hide_render=True;outer_binding.hide_render=True
for obj in scene.objects:
    if obj.name.startswith(('APRON single','White shaped apron','Apron continuous','Whale embroidery')):obj.hide_render=True
render('inner-outlet-close',focus,(.45,1,.28),.65)
ground=next((o for o in scene.objects if o.name.startswith('GROUND')),None)
if ground:ground.hide_render=True
skin=next(o for o in scene.objects if o.name.startswith('BODY continuous'));skin.hide_render=True
render('inner-topology-underside',(.25,.10,.90),(.3,1,-.12),1.45)
skin.hide_render=False
if ground:ground.hide_render=False
garment.hide_render=False;outer_binding.hide_render=False
for obj in scene.objects:
    if obj.name.startswith(('White shaped apron','Apron continuous','Whale embroidery')):obj.hide_render=False
point=Vector((.30,.10,.95));camera.location=point+Vector((1,1,.10)).normalized()*6;camera.rotation_euler=(point-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=2.8
for name,value in HASHES.items():assert hashlib.sha256(Path(name).read_bytes()).hexdigest()==value
MASTER=OUT/'tail-outlet-v4-study.blend';bpy.ops.wm.save_as_mainfile(filepath=str(MASTER),check_existing=False)
payload['blend']=str(MASTER);payload['blendSha256']=hashlib.sha256(MASTER.read_bytes()).hexdigest();payload['renders']=renders;payload['sourceHashesUnchanged']=HASHES;payload['scriptSha256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
(OUT/'tail-outlet-v4-study-manifest.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf8');print('TAIL_OUTLET_V4_STUDY '+json.dumps({'blend':str(MASTER),'outerVertices':len(outer['vertices']),'innerVertices':len(inner['vertices']),'changedRestBones':changed,'intersections':payload['restShellIntersectionCounts'],'renders':renders}))
