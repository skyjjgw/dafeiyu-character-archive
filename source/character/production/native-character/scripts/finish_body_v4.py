"""Complete the isolated v4 native body and export its actual runtime sources.

Run after build_body_v4.py and build_tail_outlet_v4_study.py --final-v4 --base
body-v4-base.blend. Does not modify any v2/v3 source or the parent assembly.
"""
import bpy,bmesh,json,math,hashlib
from pathlib import Path
from mathutils import Vector,Matrix
from mathutils.bvhtree import BVHTree
ROOT=Path(__file__).resolve().parent.parent;WORK=ROOT/'renders/body-v4';ASSETS=ROOT/'assets';ASSETS.mkdir(exist_ok=True)
FROZEN=[ROOT/name for name in['body-v2.blend','body-v3.blend','scripts/build_body.py','scripts/build_body_v3.py','petticoat-v1.blend','assets/petticoat-support-v1.json']];HASHES={str(p):hashlib.sha256(p.read_bytes()).hexdigest()for p in FROZEN}
topology=json.loads((WORK/'topology-contract-v4.json').read_text(encoding='utf8'));study=json.loads((WORK/'tail-outlet-v4-study-manifest.json').read_text(encoding='utf8'))
bpy.ops.wm.open_mainfile(filepath=str(WORK/'tail-outlet-v4-study.blend'));scene=bpy.context.scene;scene.frame_set(1);rig=next(o for o in scene.objects if o.type=='ARMATURE'and 'Head'in o.data.bones);rig.name='Dafeiyu BodyRig v4'
cage=next(o for o in scene.objects if o.name.startswith('SKIRT_SIM_V4'));petti=bpy.data.objects['V4 petticoat same routed tail outlet'];tail=bpy.data.objects['V4 routed whale tail - full convex shared fork'];outer=topology['outer'];inner=topology['petticoatMidSurface']
def native(p):return Vector((p[0],-p[2],p[1]))
def godot(p):return[p.x,p.z,-p.y]
def activate(obj):
    for o in bpy.context.selected_objects:o.select_set(False)
    obj.select_set(True);bpy.context.view_layer.objects.active=obj
def mesh(name,v,f,material):
    me=bpy.data.meshes.new(name);me.from_pydata(v,[],f);me.update();bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(me);bm.free();obj=bpy.data.objects.new(name,me);scene.collection.objects.link(obj);me.materials.append(material)
    for p in me.polygons:p.use_smooth=True
    return obj
def bind(obj):
    m=obj.modifiers.new('Actually follows simulated outlet cloth','SURFACE_DEFORM');m.target=cage;activate(obj);bpy.context.view_layer.update();bpy.ops.object.surfacedeform_bind(modifier=m.name);assert m.is_bound
def pelvis_skin(obj):
    obj.constraints.clear();g=obj.vertex_groups.get('DEF-pelvis')or obj.vertex_groups.new(name='DEF-pelvis');g.add(list(range(len(obj.data.vertices))),1,'REPLACE');m=obj.modifiers.new('Actual pelvis skin for native and glTF','ARMATURE');m.object=rig;m.use_deform_preserve_volume=True
def loop_points(part,count=96):
    p=[native(part['vertices'][i])for i in part['boundaryTags']['tail_outlet']];d=[0.]
    for a,b in zip(p,p[1:]+p[:1]):d.append(d[-1]+(b-a).length)
    result=[];k=0
    for i in range(count):
        q=i/count*d[-1]
        while k<len(p)-1 and d[k+1]<q:k+=1
        result.append(p[k].lerp(p[(k+1)%len(p)],(q-d[k])/max(1e-12,d[k+1]-d[k])))
    return result
navy=bpy.data.materials['Dafeiyu navy'];cream=bpy.data.materials['Dafeiyu cream']
outside=loop_points(outer);inside=loop_points(inner);options=[]
for reverse in[False,True]:
    p=inside[::-1]if reverse else inside
    for shift in range(len(p)):
        q=p[shift:]+p[:shift];options.append((sum((a-b).length_squared for a,b in zip(outside,q)),q))
inside=min(options,key=lambda pair:pair[0])[1];vertices=[];faces=[];N=len(outside)
axis=Vector((.17,.22,-.04)).normalized();normal=Vector((0,1,0)).cross(axis).normalized();depth=axis.cross(normal).normalized();cuff_center=Vector((.25,.24,.90))+axis*.035
ev=tail.evaluated_get(bpy.context.evaluated_depsgraph_get());me=ev.to_mesh();me.calc_loop_triangles();tail_tree=BVHTree.FromPolygons([ev.matrix_world@v.co for v in me.vertices],[tuple(t.vertices)for t in me.loop_triangles],all_triangles=True);ev.to_mesh_clear();cuff=[]
for i in range(N):
    direction=(normal*math.cos(i*math.tau/N)+depth*math.sin(i*math.tau/N)).normalized();hit=tail_tree.ray_cast(cuff_center,direction,.30);assert hit[0]is not None,'Actual tail cross section not found for open elastic cuff';cuff.append(hit[0]+direction*.0016)
options=[]
for reverse in[False,True]:
    p=cuff[::-1]if reverse else cuff
    for shift in range(N):
        q=p[shift:]+p[:shift];options.append((sum((a-b).length_squared for a,b in zip(inside,q)),q))
cuff=min(options,key=lambda pair:pair[0])[1]
for r in range(13):
    t=(r%6)/6 if r<12 else 1.;starts,ends=(outside,inside)if r<6 else(inside,cuff)
    for p,q in zip(starts,ends):
        normal=Vector((p.x,p.y,0)).normalized();vertices.append(p.lerp(q,t)+normal*(.0015*math.sin(math.pi*t)))
for r in range(12):
    for i in range(N):faces.append((r*N+i,r*N+(i+1)%N,(r+1)*N+(i+1)%N,(r+1)*N+i))
lining=mesh('V4 flexible tail portal inner facing',vertices,faces,navy);bind(lining);sub=lining.modifiers.new('Smooth actual facing fabric','SUBSURF');sub.levels=1;sol=lining.modifiers.new('Facing real two sided cloth thickness','SOLIDIFY');sol.thickness=.002;sol.offset=0
lining['construction']='Uncapped annular facing sleeve from the outer aperture through the petticoat opening to an open elastic collar around the actual tail root; follows the physical outer cloth cage, not a static rest overlay.'

# Standard glTF vertex colors carry the continuous dorsal/ventral boundary.
# The clay render independently verifies convex geometry; this only replaces
# the staircase caused by per-triangle material classification on a voxel mesh.
colors=tail.data.color_attributes.get('TailDorsalVentral')or tail.data.color_attributes.new(name='TailDorsalVentral',type='FLOAT_COLOR',domain='POINT')
route=[Vector(p)for p in[(.25,.24,.90),(.42,.46,.86),(.65,.49,.56),(.85,.44,.52),(1.05,.32,.60)]]
def smooth(a,b,v):
    t=max(0,min(1,(v-a)/(b-a)));return t*t*(3-2*t)
for v in tail.data.vertices:
    p=v.co;best=(1e9,None,None)
    for a,b in zip(route,route[1:]):
        d=b-a;t=max(0,min(1,(p-a).dot(d)/d.length_squared));c=a+d*t;distance=(p-c).length
        if distance<best[0]:best=(distance,c,d.normalized())
    _,center,axis=best;n=Vector((0,1,0)).cross(axis).normalized();dep=axis.cross(n).normalized();stem=smooth(-.003,.009,-(p-center).dot(dep));fluke=smooth(.010,.024,.30-p.y);w=stem+(fluke-stem)*smooth(1.0,1.13,p.x);dorsal=Vector((.035,.043,.080));ventral=Vector((.085,.12,.20));color=dorsal.lerp(ventral,w);colors.data[v.index].color=(*color,1)
paint=navy.copy();paint.name='V4 tail continuous dorsal ventral vertex paint';paint.diffuse_color=(1,1,1,1);nodes=paint.node_tree.nodes;links=paint.node_tree.links;ramp=next(n for n in nodes if n.type=='VALTORGB');ramp.color_ramp.interpolation='LINEAR'
for element,factor in zip(ramp.color_ramp.elements,[.62,.84,1]):element.color=(factor,factor,factor,1)
attribute=nodes.new('ShaderNodeVertexColor');attribute.layer_name=colors.name;mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;links.new(ramp.outputs[0],mix.inputs[1]);links.new(attribute.outputs['Color'],mix.inputs[2]);em=next(n for n in nodes if n.type=='EMISSION');links.new(mix.outputs[0],em.inputs[0]);tail.data.materials.clear();tail.data.materials.append(paint)
for p in tail.data.polygons:p.material_index=0
tail['runtime_vertex_color_required']=True;tail['palette']='Deep indigo dorsal, muted soft blue ventral; physical colors in COLOR_0, linear RGB.'

# The low-resolution physical rim remains compact. Render binding uses actual
# subdivision and thickness and is exported from final GLB primitive order.
for obj in scene.objects:
    if 'aperture folded'in obj.name:
        sub=obj.modifiers.new('High resolution rounded folded binding','SUBSURF');sub.levels=2;sub.render_levels=2;activate(obj)
        while list(obj.modifiers).index(sub)>0 and obj.modifiers[list(obj.modifiers).index(sub)-1].type=='SOLIDIFY':bpy.ops.object.modifier_move_up(modifier=sub.name)
        for p in obj.data.polygons:p.use_smooth=True
        if obj.name.startswith('V4 inner'):pelvis_skin(obj)
petti.data.materials.clear();petti.data.materials.append(cream);pelvis_skin(petti)

# Actual two parallel stitch rows, both embedded on the real cloth cage.
v=[];f=[];center=sum(outside,Vector())/N
for i,p in enumerate(outside):
    tangent=(outside[(i+1)%N]-outside[(i-1)%N]).normalized();normal=Vector((p.x,p.y,0)).normalized();out=(p-center);out-=normal*out.dot(normal);out.normalize()
    for offset in[.0045,.0135]:
        a=p+out*offset+normal*.006;first=len(v)
        for end in[-1,1]:
            for j in range(6):
                angle=j*math.tau/6;v.append(a+tangent*(end*.0018)+normal*(.0006*math.cos(angle))+out*(.0006*math.sin(angle)))
        for j in range(6):f.append((first+j,first+(j+1)%6,first+6+(j+1)%6,first+6+j))
        f.append(tuple(first+j for j in range(5,-1,-1)));f.append(tuple(first+6+j for j in range(6)))
stitches=mesh('V4 tail outlet twin stitch rows',v,f,navy);bind(stitches);stitches['scope']='Visible stitch geometry following cloth; not a claim of a separate simulated thread system.'
reinforcement=cage.vertex_groups.new(name='Tail_Binding_Stiffness')
hole=[native(outer['vertices'][i])for i in outer['boundaryTags']['tail_outlet']]
for vert in cage.data.vertices:
    distance=min((vert.co-p).length for p in hole);w=max(0,1-distance/.045)
    if w:reinforcement.add([vert.index],w,'REPLACE')
cloth=next(m for m in cage.modifiers if m.type=='CLOTH')
if hasattr(cloth.settings,'vertex_group_structural_stiffness'):
    cloth.settings.vertex_group_structural_stiffness=reinforcement.name;cloth.settings.tension_stiffness_max=45;cloth.settings.compression_stiffness_max=45;cloth.settings.shear_stiffness_max=25

def evaluated(obj):
    ev=obj.evaluated_get(bpy.context.evaluated_depsgraph_get());me=ev.to_mesh();me.calc_loop_triangles();v=[ev.matrix_world@p.co for p in me.vertices];f=[tuple(p.vertices)for p in me.loop_triangles];ev.to_mesh_clear();return v,f
tail_points,tail_faces=evaluated(tail);tail_bvh=BVHTree.FromPolygons(tail_points,tail_faces,all_triangles=True)
def actual_intersections(obj):
    v,f=evaluated(obj);pairs=tail_bvh.overlap(BVHTree.FromPolygons(v,f,all_triangles=True));return len(pairs)
# BVH overlap is conservative, but zero establishes no remaining triangle
# intersections in this rest state; it does not certify moving contact.
rest_overlap={obj.name:actual_intersections(obj)for obj in[lining,petti]+[o for o in scene.objects if'aperture folded'in o.name]}
assert all(count==0 for count in rest_overlap.values()),rest_overlap

# Explicit clipped inner-support contacts. Far patches are locally grouped;
# the outlet patch uses individual surviving quads, never a hull across a hole.
points=[native(p)for p in inner['vertices']];uv=[Vector(p)for p in inner['restUV']];tris=inner['triangles'];normals=[Vector()for p in points]
for a,b,c in tris:
    n=(points[b]-points[a]).cross(points[c]-points[a])
    for i in[a,b,c]:normals[i]+=n
for i,n in enumerate(normals):
    n.normalize()
    if n.dot(Vector((points[i].x,points[i].y,0)))<0:n.negate()
patch=inner['outletDesign']['patchBoundsGrid'];groups={}
for ti,tri in enumerate(tris):
    q=sum((uv[i]for i in tri),Vector((0,0)))/3;j=q.x*64;r=q.y*18
    close=patch[0]-.25<j<patch[1]+.25 and patch[2]-.25<r<patch[3]+.25;key=('portal',ti)if close else('panel',int(q.x*16)%16,min(3,int(q.y*4)))
    groups.setdefault(key,[]).append(tri)
def hull_for(triangles):
    ids=sorted({i for tri in triangles for i in tri});bm=bmesh.new()
    for i in ids:
        for sign in[-1,1]:bm.verts.new(points[i]+normals[i]*(sign*.003))
    h=bmesh.ops.convex_hull(bm,input=list(bm.verts),use_existing_faces=False);unused=list(set(h.get('geom_interior',[])+h.get('geom_unused',[])))
    if unused:bmesh.ops.delete(bm,geom=unused,context='VERTS')
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.verts.ensure_lookup_table();bm.verts.index_update();v=[p.co.copy()for p in bm.verts];f=[[p.index for p in face.verts]for face in bm.faces];volume=bm.calc_volume(signed=True);bm.free();return v,f,volume
panels=[];queue=list(groups.values());minimum_clearance=100
while queue:
    triangles=queue.pop();v,f,volume=hull_for(triangles);hf=[(face[0],face[i],face[i+1])for face in f for i in range(1,len(face)-1)];overlap=tail_bvh.overlap(BVHTree.FromPolygons(v,hf,all_triangles=True))
    if overlap and len(triangles)>1:queue.extend([[tri]for tri in triangles]);continue
    assert not overlap and volume>0,('portal contact filled tail route',len(overlap),volume)
    center=sum(v,Vector())/len(v);name='PETTI_V2_CONTACT_%03d'%len(panels);obj=mesh(name,[p-center for p in v],f,cream);obj.location=center;obj.hide_render=True;obj.display_type='WIRE';c=obj.constraints.new('CHILD_OF');c.target=rig;c.subtarget='DEF-pelvis';c.inverse_matrix=(rig.matrix_world@rig.pose.bones['DEF-pelvis'].matrix).inverted();activate(obj);bpy.ops.rigidbody.object_add();obj.rigid_body.kinematic=True;obj.rigid_body.collision_shape='CONVEX_HULL';obj.rigid_body.mass=.001;obj.rigid_body.use_margin=True;obj.rigid_body.collision_margin=.0015
    clearance=min(tail_bvh.find_nearest(p)[3]for p in v);minimum_clearance=min(minimum_clearance,clearance);panels.append({'name':name,'modelRestVertices':[godot(p)for p in v],'hullTriangles':hf,'modelRestCentroid':godot(center),'collisionShape':'convex_hull','nominalThickness':.006,'nativeVolume':volume,'tailRestMinimumSampledClearance':clearance})

# Tail contact volumes are rebuilt for the new rest route, not old inverse binds.
for bone in [b for b in rig.data.bones if b.name.startswith('DEF-tail.')]:
    h,t=bone.head_local,bone.tail_local;center=(h+t)/2;bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,location=center);obj=bpy.context.object;obj.name='CONTACT '+bone.name;obj.scale=(.06,.06,max(.06,(t-h).length/2));obj.rotation_euler=(t-h).to_track_quat('Z','Y').to_euler();bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);c=obj.constraints.new('CHILD_OF');c.target=rig;c.subtarget=bone.name;c.inverse_matrix=(rig.matrix_world@bone.matrix_local).inverted();activate(obj);bpy.ops.rigidbody.object_add();obj.rigid_body.kinematic=True;obj.rigid_body.collision_shape='CONVEX_HULL';obj.hide_render=True;obj.display_type='WIRE';obj.modifiers.new('Actual tail cloth contact','COLLISION')
tail.modifiers.new('Full convex fluke and stem surface cloth contact','COLLISION')

prefixes=['V4 outer skirt','White shaped apron','Apron continuous','Whale embroidery','V4 outer aperture','V4 flexible tail portal','V4 tail outlet twin']
cage_payload={'schema':'dafeiyu.native-cloth-cage.v2','coordinateFrame':'glTF/Godot +Y up +Z forward model-local metres','sourceBodyVariant':'v4','sourceObject':cage.name,'anchorBone':'DEF-pelvis','vertices':outer['vertices'],'triangles':outer['triangles'],'pinWeights':outer['pinWeights'],'restUV':outer['restUV'],'oldGridToCompact':outer['oldGridToCompact'],'boundaryTags':outer['boundaryTags'],'boundaryEdges':outer['boundaryEdges'],'triangleAdjacency':outer['twoTriangleEdges'],'textureSize':outer['textureSize'],'renderMeshPrefixes':prefixes,'scope':'True compact irregular cloth topology with a tailored rear-right tail portal. No virtual grid faces, no orphan Jolt points, no hard free-particle position clamps.'}
CAGE=ASSETS/'skirt-physics-cage-v4.json';CAGE.write_text(json.dumps(cage_payload,separators=(',',':')),encoding='utf8')
pv,pf=evaluated(petti);petti_payload={'schema':'dafeiyu.petticoat-support.v2','coordinateFrame':cage_payload['coordinateFrame'],'anchorBone':'DEF-pelvis','rootModelOrigin':godot(rig.data.bones['DEF-pelvis'].head_local),'kinematic':True,'nominalThickness':.006,'sourceCage':{'path':str(CAGE),'sha256':hashlib.sha256(CAGE.read_bytes()).hexdigest(),'vertices':len(outer['vertices'])},'shape':{'actualRadialScale':.92,'hemLift':.025,'tailOutlet':True},'outerClothPolicy':{'writesFreeOuterParticlePositions':False,'hardPositionTargets':False,'contactOnly':True},'collision':{'layer':16,'mask':8,'margin':.0015,'friction':.45,'restitution':0},'panels':panels,'renderGeometry':{'vertices':[godot(p)for p in pv],'triangles':pf},'midSurface':{'vertices':inner['vertices'],'triangles':inner['triangles'],'boundaryTags':inner['boundaryTags']},'qa':{'actualPortalRestTailTriangleIntersections':0,'allPanelVolumesPositive':True,'allPanelRestTailTriangleIntersections':0,'minimumSampledPanelTailClearance':minimum_clearance},'limitations':['A stiff sewn support approximation following the pelvis; not free multilayer fabric.','Only rest contact geometry is accepted; moving tail and cloth stress tests are still required.']}
PETTI=ASSETS/'petticoat-support-v2.json';PETTI.write_text(json.dumps(petti_payload,separators=(',',':')),encoding='utf8')

# Actual rest/bone/contact differences, including palm-derived thumb roots.
with bpy.data.libraries.load(str(ROOT/'body-v3.blend'),link=False)as(a,b):b.armatures=[a.armatures[0]]
old=b.armatures[0];changes=[]
for bone in rig.data.bones:
    ref=old.bones[bone.name]
    if any(abs(x-y)>1e-7 for row_a,row_b in zip(bone.matrix_local,ref.matrix_local)for x,y in zip(row_a,row_b))or(bone.tail_local-ref.tail_local).length>1e-7:changes.append({'name':bone.name,'previousHead':list(ref.head_local),'newHead':list(bone.head_local),'previousTail':list(ref.tail_local),'newTail':list(bone.tail_local)})
bpy.data.armatures.remove(old)
rest=[{'name':b.name,'parent':b.parent.name if b.parent else None,'matrix':[round(v,7)for row in b.matrix_local for v in row],'head':[round(v,7)for v in b.head_local],'tail':[round(v,7)for v in b.tail_local],'deform':b.use_deform}for b in sorted(rig.data.bones,key=lambda b:b.name)]
for name,value in HASHES.items():assert hashlib.sha256(Path(name).read_bytes()).hexdigest()==value
MASTER=ROOT/'body-v4.blend';scene.frame_set(1);bpy.context.view_layer.update();bpy.ops.wm.save_as_mainfile(filepath=str(MASTER),check_existing=False)
report={'schema':'dafeiyu.native-body.v4','status':'complete_native_asset_pending_art_and_runtime_next_review','file':str(MASTER),'sha256':hashlib.sha256(MASTER.read_bytes()).hexdigest(),'sourceBase':str(ROOT/'body-v4-base.blend'),'rigObject':rig.name,'rigRestSha256':hashlib.sha256(json.dumps(rest,sort_keys=True).encode()).hexdigest(),'boneRestDifferencesFromV3':changes,'sourceV2V3Unchanged':HASHES,'baseValidation':json.loads((ROOT/'body-v4-base-manifest.json').read_text())['validation'],'baseGeometryAudit':json.loads((ROOT/'body-v4-geometry-audit-body-v4-base.json').read_text()),'outlet':{'cageVertices':len(outer['vertices']),'cageTriangles':len(outer['triangles']),'petticoatMidVertices':len(inner['vertices']),'portalBoundary':outer['boundaryTags']['tail_outlet'],'actualRestOverlaps':rest_overlap,'bindingWidth':.018,'facingConstruction':lining['construction'],'stitchRows':2,'stitchesPhysicallyIndependentlySimulated':False},'runtimeSources':{'cage':str(CAGE),'petticoat':str(PETTI),'glb':str(ASSETS/'body-v4-bind.glb'),'renderBinding':str(ASSETS/'cloth-render-bind-v4.json')},'contacts':{'petticoatPanels':len(panels),'source':'actual surviving near-portal triangles, never a convex hull across the opening','minimumPanelTailSampleClearance':minimum_clearance},'wristLocalJointLimitsRadians':{'x':[-1.15,1.15],'y':[-.35,.35],'z':[-.75,.75]},'soleOffsets':json.loads((ROOT/'body-v4-base-manifest.json').read_text())['action_interface']['controls'],'tailShapeAndColor':study['tailShapeAndColor'],'limitations':['Native body has no face/hair; Head contract unchanged at (0,0,2.155).','Rendering and cloth/contact structure are not reference-quality artistic approval.','No old v2/v3 action, grip or foot lock is certified for v4.','Stitches/facing follow real cloth deformation but thread and multilayer fabric are not independently simulated.','Tail and cloth must be stress-tested together in runtime-next; rest clearance is not dynamic contact acceptance.']}
(ROOT/'body-v4-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')

# Export separate actual render topology. Keep native source fully editable.
for bone in rig.pose.bones:
    bone.matrix_basis=Matrix.Identity(4)
    if bone.name.startswith('CTRL-fingers.'):
        for key in ['grip','thumb_opposition','thumb_curl','index_curl','middle_curl','ring_curl','little_curl']:bone[key]=0.
rig.data.pose_position='REST';rig.update_tag();scene.frame_set(1);bpy.context.view_layer.update()
assets=[o for o in scene.objects if o.type=='ARMATURE'or(o.type=='MESH'and not o.hide_render and not o.name.startswith('GROUND'))]
for obj in assets:
    if obj.type!='MESH':continue
    arm=[m for m in obj.modifiers if m.type=='ARMATURE']
    if arm:
        # Vertex groups interpolate when applying true subdivision/thickness.
        for m in arm:m.show_viewport=False
        for m in list(obj.modifiers):
            if m.type in['SUBSURF','SOLIDIFY','BEVEL']:
                activate(obj);bpy.ops.object.modifier_apply(modifier=m.name)
        for m in arm:m.show_viewport=True
    else:
        ev=obj.evaluated_get(bpy.context.evaluated_depsgraph_get());data=bpy.data.meshes.new_from_object(ev,preserve_all_data_layers=True,depsgraph=bpy.context.evaluated_depsgraph_get());obj.modifiers.clear();obj.data=data
    if obj.name.startswith('Whale embroidery'):
        for p in obj.data.polygons:p.use_smooth=False
    world=obj.matrix_world.copy();obj.parent=rig;obj.matrix_parent_inverse=rig.matrix_world.inverted();obj.matrix_world=world
def render_skin_audit():
    body=next(o for o in assets if o.name.startswith('BODY continuous'));ev=body.evaluated_get(bpy.context.evaluated_depsgraph_get());me=ev.to_mesh();me.calc_loop_triangles();bad=[]
    for tri in me.loop_triangles:
        a,b,c=[me.vertices[i].co for i in tri.vertices];n=(b-a).cross(c-a)
        if n.length_squared<1e-24:continue
        avg=sum((me.corner_normals[i].vector for i in tri.loops),Vector()).normalized();dot=n.normalized().dot(avg)
        if dot<-.05:bad.append({'poly':tri.polygon_index,'dot':dot})
    count=len(me.vertices);ev.to_mesh_clear();return{'vertices':count,'badNormalTriangles':len(bad),'bad':bad}
rig.data.pose_position='POSE';rig.update_tag();bpy.context.view_layer.update();prepared_rest=render_skin_audit();control=rig.pose.bones['CTRL-hand_ik.L'];saved_control=control.matrix.copy();m=saved_control.copy();m.translation=Vector((-.48,-.26,1.92));control.matrix=m;rig.update_tag();bpy.context.view_layer.update();prepared_wave=render_skin_audit();control.matrix=saved_control;rig.data.pose_position='REST';rig.update_tag();bpy.context.view_layer.update()
report['preparedRuntimeRenderSkinAudit']={'rest':prepared_rest,'wave':prepared_wave,'scope':'Actual subdivided render vertices and interpolated skin weights that are sent to glTF; native joint limits are enforced.'};assert prepared_rest['badNormalTriangles']==0 and prepared_wave['badNormalTriangles']==0,report['preparedRuntimeRenderSkinAudit']
bpy.ops.object.select_all(action='DESELECT')
for obj in assets:obj.hide_set(False);obj.select_set(True)
bpy.context.view_layer.objects.active=rig;GLB=ASSETS/'body-v4-bind.glb';bpy.ops.export_scene.gltf(filepath=str(GLB),export_format='GLB',use_selection=True,export_animations=False,export_skins=True,export_morph=True,export_yup=True,export_extras=True,export_apply=False)
report['runtimeSources']['glbSha256']=hashlib.sha256(GLB.read_bytes()).hexdigest();report['runtimeSources']['glbBytes']=GLB.stat().st_size;(ROOT/'body-v4-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('BODY_V4_COMPLETED '+json.dumps({'blend':str(MASTER),'sha256':report['sha256'],'glb':str(GLB),'glbBytes':GLB.stat().st_size,'changedRestBones':[c['name']for c in changes],'petticoatPanels':len(panels),'restIntersections':rest_overlap}))
