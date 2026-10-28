"""Author a sewn, stiff petticoat and thin segmented contact approximation.

Does not change the body, its cloth cage, or any outer cloth vertex. All JSON
points are Godot model-rest coordinates. Native geometry uses X/-Y-front/Z-up.
"""
import bpy
import bmesh
import json
import math
import hashlib
from pathlib import Path
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

ROOT=Path(__file__).resolve().parents[1]
CAGE=ROOT/'assets/skirt-physics-cage-v2.json'
OUTPUT=ROOT/'assets/petticoat-support-v1.json'
BLEND=ROOT/'petticoat-v1.blend'
MANIFEST=ROOT/'petticoat-v1-manifest.json'
RENDERS=ROOT/'renders/petticoat-v1'
source_bytes=CAGE.read_bytes();source=json.loads(source_bytes)
ANGULAR=64;HEIGHTS=len(source['vertices'])//ANGULAR
assert len(source['vertices'])==ANGULAR*HEIGHTS and HEIGHTS>=5
THICKNESS=.006;HEM_LIFT=.025;WAIST_HIDE=.004
SECTORS=16;BANDS=4;MESH_ROWS=32
RADIAL_SCALE=.92;MIN_CLEARANCE=.0035
def clamp(x,a=0,b=1):return max(a,min(b,x))
def native(p):return Vector((p[0],-p[2],p[1]))
def godot(p):return [p[0],p[2],-p[1]]
def lerp(a,b,t):return a+(b-a)*t
def interpolate(values,t):
    p=clamp(t)*(len(values)-1);i=min(len(values)-2,int(p));return lerp(values[i],values[i+1],p-i)

rows=[source['vertices'][r*ANGULAR:(r+1)*ANGULAR]for r in range(HEIGHTS)]
rx=[max(abs(p[0])for p in row)for row in rows]
rz=[max(abs(p[2])for p in row)for row in rows]
yy=[sum(p[1]for p in row)/ANGULAR for row in rows]
wave=[2*sum((p[1]-yy[r])*math.cos(16*j/ANGULAR*math.tau)for j,p in enumerate(row))/ANGULAR for r,row in enumerate(rows)]
outer_bvh=BVHTree.FromPolygons([Vector(p)for p in source['vertices']],source['triangles'],all_triangles=True,epsilon=1e-8)
def surface(a,t,scale):
    # Slight bell fullness is still inside the original outer skirt; the
    # per-angle hem wave is retained, so its lift is genuinely 25 mm.
    fullness=1+.012*math.sin(math.pi*t)
    x=interpolate(rx,t)*scale*fullness*math.cos(a)
    z=-interpolate(rz,t)*scale*fullness*math.sin(a)
    y=interpolate(yy,t)+interpolate(wave,t)*math.cos(16*a)+HEM_LIFT*t*t-WAIST_HIDE*(1-t)
    return Vector((x,y,z))
def normal(a,t,scale):
    da=surface(a+.0001,t,scale)-surface(a-.0001,t,scale)
    dt=surface(a,min(1,t+.0001),scale)-surface(a,max(0,t-.0001),scale)
    n=dt.cross(da).normalized();p=surface(a,t,scale)
    if n.dot(Vector((p.x,0,p.z)))<0:n=-n
    return n
def sheet(a,t,side,scale):return surface(a,t,scale)+normal(a,t,scale)*(side*THICKNESS/2)
def clearance(p):
    radial=Vector((p.x,0,p.z));radius=radial.length
    hit=outer_bvh.ray_cast(Vector((0,p.y,0)),radial.normalized(),4)
    if hit[0] is not None:return hit[3]-radius
    # Exact axis-aligned rays can hit the Float32 cage's angular seam. Retry
    # on both sides at a microradian and take the conservative valid distance.
    d=radial.normalized();distances=[]
    for angle in (-1e-6,1e-6):
        q=Vector((d.x*math.cos(angle)-d.z*math.sin(angle),0,d.x*math.sin(angle)+d.z*math.cos(angle)))
        retry=outer_bvh.ray_cast(Vector((0,p.y,0)),q,4)
        if retry[0] is not None:distances.append(retry[3])
    return min(distances)-radius if distances else -100.
def evaluate_clearance(scale):
    return min(clearance(sheet(j/ANGULAR*math.tau,r/MESH_ROWS,1,scale))for r in range(MESH_ROWS+1)for j in range(ANGULAR))
for _ in range(15):
    minimum_clearance=evaluate_clearance(RADIAL_SCALE)
    if minimum_clearance>=MIN_CLEARANCE:break
    RADIAL_SCALE-=.002
assert minimum_clearance>=MIN_CLEARANCE,(RADIAL_SCALE,minimum_clearance)

for obj in list(bpy.data.objects):bpy.data.objects.remove(obj,do_unlink=True)
for collection in list(bpy.data.collections):bpy.data.collections.remove(collection)
bpy.context.preferences.filepaths.save_version=0
scene=bpy.context.scene
asset=bpy.data.collections.new('Petticoat_v1_EDITABLE');scene.collection.children.link(asset)
studio=bpy.data.collections.new('Petticoat_v1_REVIEW_ONLY');scene.collection.children.link(studio)
def link(obj,collection=asset):collection.objects.link(obj);return obj

# The component root has a meaningful pelvis-height origin. Geometry below is
# root-relative in Blender, while every exported JSON point remains model-rest.
anchor_origin=Vector((0,0,1.10));anchor_native_matrix=None
body=ROOT/'body-v2.blend'
if body.is_file():
    with bpy.data.libraries.load(str(body),link=False)as(a,b):b.armatures=list(a.armatures)
    for data in b.armatures:
        if data and 'DEF-pelvis' in data.bones:
            anchor_native_matrix=data.bones['DEF-pelvis'].matrix_local.copy();anchor_origin=anchor_native_matrix.translation.copy();break
root=link(bpy.data.objects.new('PetticoatRoot',None));root.location=anchor_origin
root['attachment_bone']='DEF-pelvis';root['model_origin_godot']=godot(anchor_origin)
root['attachment_rule']='Preserve model rest. Follow current pelvis global pose times inverse of its actual imported global rest.'
root['scope']='Sewn stiff petticoat contact approximation, not full multilayer tulle dynamics.'
root['outer_cloth_policy']='Contact only. Never write free outer cloth particle positions to this component.'

def material(name,rgba):
    m=bpy.data.materials.new(name);m.diffuse_color=rgba;m.use_nodes=True
    shader=m.node_tree.nodes.get('Principled BSDF');shader.inputs['Base Color'].default_value=rgba;shader.inputs['Roughness'].default_value=1
    return m
ivory=material('Petticoat / matte sewn ivory',(.70,.66,.58,1))
seam_mat=material('Petticoat / stitched boning',(.47,.44,.38,1))
wire_mat=material('Review / original outer skirt cage',(.10,.36,.27,1))
panel_mat=material('Support / collision panel debug',(.15,.40,.66,1))

global_points=[];quads=[];roles=[]
for side in (1,-1):
    for r in range(MESH_ROWS+1):
        for j in range(ANGULAR):global_points.append(sheet(j/ANGULAR*math.tau,r/MESH_ROWS,side,RADIAL_SCALE))
offset=(MESH_ROWS+1)*ANGULAR
for side_index in (0,1):
    shift=side_index*offset
    for r in range(MESH_ROWS):
        for j in range(ANGULAR):
            a=shift+r*ANGULAR+j;b=shift+(r+1)*ANGULAR+j;c=shift+(r+1)*ANGULAR+(j+1)%ANGULAR;d=shift+r*ANGULAR+(j+1)%ANGULAR
            quads.append((a,b,c,d)if side_index==0 else(d,c,b,a));roles.append('outer'if side_index==0 else'inner')
for row in (0,MESH_ROWS):
    for j in range(ANGULAR):
        a=row*ANGULAR+j;b=row*ANGULAR+(j+1)%ANGULAR
        quads.append((a,b,b+offset,a+offset)if row==0 else(b,a,a+offset,b+offset));roles.append('rim')
data=bpy.data.meshes.new('Petticoat / hollow closed double-wall garment')
data.from_pydata([native(p)-anchor_origin for p in global_points],[],quads);data.update()
bm=bmesh.new();bm.from_mesh(data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);volume=bm.calc_volume(signed=True);bm.to_mesh(data);bm.free()
garment=link(bpy.data.objects.new('Sewn stiff petticoat / true 6mm hollow shell',data));garment.parent=root;data.materials.append(ivory)
for p in data.polygons:p.use_smooth=True
waist=garment.vertex_groups.new(name='Waist_FIXED_DEF-pelvis')
waist.add(list(range(ANGULAR*2))+list(range(offset,offset+ANGULAR*2)),1,'REPLACE')
garment['material_model']='Pelvis-anchored stiff sewn support garment. No full multilayer fabric simulation claim.'
garment['nominal_thickness_m']=THICKNESS

def tube_ring(name,t,radius=.003):
    curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.resolution_u=1;curve.bevel_depth=radius;curve.bevel_resolution=3
    spline=curve.splines.new('POLY');spline.points.add(ANGULAR-1);spline.use_cyclic_u=True
    for j,point in enumerate(spline.points):
        p=surface(j/ANGULAR*math.tau,t,RADIAL_SCALE)-normal(j/ANGULAR*math.tau,t,RADIAL_SCALE)*.002
        q=native(p)-anchor_origin;point.co=(*q,1)
    ob=link(bpy.data.objects.new(name,curve));ob.parent=root;curve.materials.append(seam_mat)
for t in (0,.35,.68,.98):tube_ring('Sewn encircling support hoop %.2f'%t,t)

panels=[];panel_objects=[];minimum_panel_clearance=float('inf');first_bad_panel_sample=None
for h in range(BANDS):
    for a in range(SECTORS):
        seeds=[]
        for r in (h/BANDS,(h+1)/BANDS):
            for angle in (a/SECTORS*math.tau,(a+.5)/SECTORS*math.tau,(a+1)/SECTORS*math.tau):
                for side in (-1,1):seeds.append(sheet(angle,r,side,RADIAL_SCALE))
        hull=bmesh.new()
        for p in seeds:hull.verts.new(p)
        result=bmesh.ops.convex_hull(hull,input=list(hull.verts),use_existing_faces=False)
        unused=list(set(result.get('geom_interior',[])+result.get('geom_unused',[])))
        if unused:bmesh.ops.delete(hull,geom=unused,context='VERTS')
        bmesh.ops.recalc_face_normals(hull,faces=hull.faces);hull.verts.ensure_lookup_table();hull.verts.index_update()
        points=[v.co.copy()for v in hull.verts];polygons=[list(f.verts)for f in hull.faces]
        faces=[[v.index for v in poly]for poly in polygons]
        panel_volume=hull.calc_volume(signed=True);hull.free()
        center=sum(points,Vector())/len(points);name='PETTI_CONTACT_%02d_%02d'%(a,h)
        mesh=bpy.data.meshes.new(name);mesh.from_pydata([native(p-center)for p in points],[],faces);mesh.update();mesh.materials.append(panel_mat)
        obj=link(bpy.data.objects.new(name,mesh));obj.parent=root;obj.location=native(center)-anchor_origin
        obj.display_type='WIRE';obj.hide_render=True;obj['contact_kind']='thin local convex panel, not a solid skirt cone'
        bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.rigidbody.object_add();obj.select_set(False)
        obj.rigid_body.type='ACTIVE';obj.rigid_body.kinematic=True;obj.rigid_body.collision_shape='CONVEX_HULL';obj.rigid_body.mass=.18/(SECTORS*BANDS)
        obj.rigid_body.friction=.45;obj.rigid_body.restitution=0;obj.rigid_body.use_margin=True;obj.rigid_body.collision_margin=.0015
        obj.modifiers.new('Native outer cloth contact','COLLISION')
        if obj.collision:
            obj.collision.thickness_outer=.0015;obj.collision.thickness_inner=.0015;obj.collision.cloth_friction=5
        triangles=[]
        for face in faces:
            for i in range(1,len(face)-1):triangles.append([face[0],face[i],face[i+1]])
        for triangle in triangles:
            aa,bb,cc=[points[i]for i in triangle]
            for p in (aa,bb,cc,(aa+bb)/2,(bb+cc)/2,(cc+aa)/2,(aa+bb+cc)/3):
                gap=clearance(p);minimum_panel_clearance=min(minimum_panel_clearance,gap)
                if gap<0 and first_bad_panel_sample is None:first_bad_panel_sample={'point':list(p),'panel':name,'gap':gap}
        # Test the local central axis against every convex hull. Its hollow
        # opening must remain free, unlike a single solid cone collider.
        test=Vector((0,center.y,0));inside=True
        for face in faces:
            aa,bb,cc=[points[i]for i in face[:3]];n=(bb-aa).cross(cc-aa).normalized()
            if n.dot(test-aa)>1e-6:inside=False;break
        assert not inside and panel_volume>0
        panels.append({'name':name,'modelRestVertices':[list(p)for p in points],'hullTriangles':triangles,'modelRestCentroid':list(center),
                       'collisionShape':'convex_hull','nominalThickness':THICKNESS,'nativeVolume':panel_volume,'angularSector':a,'heightBand':h})
        panel_objects.append(obj)

# Export before rendering so the engine task can import contacts immediately.
triangles=[]
for face in quads:
    triangles.extend([[face[0],face[1],face[2]],[face[0],face[2],face[3]]])
payload={'schema':'dafeiyu.petticoat-support.v1','coordinateFrame':'glTF/Godot +Y up, +Z forward, model-local metres',
 'anchorBone':'DEF-pelvis','rootModelOrigin':godot(anchor_origin),'kinematic':True,'nominalThickness':THICKNESS,
 'scope':'Sewn stiff petticoat contact approximation, not full multilayer tulle dynamics',
 'sourceCage':{'path':str(CAGE),'sha256':hashlib.sha256(source_bytes).hexdigest(),'vertices':len(source['vertices']),'angularSamples':ANGULAR,'heightSamples':HEIGHTS,'sourceBodySha256':source.get('sourceBodySha256')},
 'shape':{'nominalRadialScale':.92,'actualRadialScale':RADIAL_SCALE,'midBellFullnessFactor':.012,'hemLift':HEM_LIFT,'waistHiddenBelowOuterTop':WAIST_HIDE},
 'collision':{'layer':16,'mask':8,'contactsWith':['outer_skirt_softbody'],'excludeOwnCharacterRigidBodies':True,'margin':.0015,'friction':.45,'restitution':0,
              'implementationHint':'A pelvis-following kinematic/AnimatableBody with local convex subshapes. Rebase each modelRestVertex with inverse(actual imported pelvis global rest); body transform follows actual pelvis global pose.'},
 'outerClothPolicy':{'writesFreeOuterParticlePositions':False,'hardPositionTargets':False,'contactOnly':True},
 'panels':panels,'renderGeometry':{'vertices':[list(p)for p in global_points],'triangles':triangles},
 'qa':{'minimumOuterCageRadialClearance':minimum_clearance,'minimumSampledConvexHullRadialClearance':minimum_panel_clearance,'garmentSignedVolume':volume,'centerAxisOutsideEveryPanel':True,'inputsUnmodified':True},
 'convexApproximation':{'angularSectors':SECTORS,'heightBands':BANDS,'sampledAnglesPerPanel':3,'maximumInwardArcChordFillBound':max(rx)*RADIAL_SCALE*(1-math.cos(math.pi/SECTORS)),'trueGarmentThickness':THICKNESS},
 'limitations':['Piecewise convex contact represents sewn stiff boning and an inner skirt, not free multilayer tulle.','Small inward arc-chord filling occurs within each local convex panel; the skirt center is hollow.','Imported actual Skeleton global rest is authoritative for rebasing; do not add pelvis translation twice.','Outer garment bending, damping and collision response remain independent runtime responsibilities.']}
OUTPUT.parent.mkdir(parents=True,exist_ok=True);OUTPUT.write_text(json.dumps(payload,separators=(',',':'))+'\n',encoding='utf-8')
print('PETTICOAT_JSON_READY '+str(OUTPUT),flush=True)

# A native original-cage wire guide, not a copied source image.
reference_mesh=bpy.data.meshes.new('Original outer skirt rest cage / QA only')
reference_mesh.from_pydata([native(p)for p in source['vertices']],[],source['triangles']);reference_mesh.update()
reference=link(bpy.data.objects.new('REFERENCE original outer skirt / no body edits',reference_mesh),studio);reference_mesh.materials.append(wire_mat)
wire=reference.modifiers.new('Outer clearance wire guide','WIREFRAME');wire.thickness=.0014;wire.use_replace=True
reference['reference_only']=True
world=bpy.data.worlds.new('Petticoat review world');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.18,.20,.23,1);world.node_tree.nodes['Background'].inputs[1].default_value=.8;scene.world=world
def aim(obj,target):obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
for name,position,power in [('Key',(-2,-3,4),400),('Fill',(3,0,2),200)]:
    light=bpy.data.lights.new(name,'AREA');light.energy=power;light.size=4;ob=link(bpy.data.objects.new(name,light),studio);ob.location=position;aim(ob,(0,0,.95))
cameras={}
for name,position in [('side',(3,0,1.08)),('threequarter',(2.5,-3,1.85)),('underside',(0,-3,.30))]:
    data=bpy.data.cameras.new(name);data.type='ORTHO';data.ortho_scale=1.90
    camera=link(bpy.data.objects.new('Review '+name,data),studio);camera.location=position;aim(camera,(0,0,.95));cameras[name]=camera
scene.camera=cameras['threequarter'];scene.render.engine='BLENDER_EEVEE_NEXT';scene.render.resolution_x=512;scene.render.resolution_y=512;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.view_settings.view_transform='Standard';scene.view_settings.look='None'
if hasattr(scene,'eevee'):scene.eevee.taa_render_samples=24
scene.frame_set(1);bpy.context.view_layer.update()
RENDERS.mkdir(parents=True,exist_ok=True)
def topology(mesh):
    usage={}
    for p in mesh.polygons:
        for a,b in zip(p.vertices,tuple(p.vertices[1:])+tuple(p.vertices[:1])):
            edge=tuple(sorted((a,b)));usage[edge]=usage.get(edge,0)+1
    return {'vertices':len(mesh.vertices),'faces':len(mesh.polygons),'boundaryEdges':sum(n==1 for n in usage.values()),'nonmanifoldEdges':sum(n!=2 for n in usage.values())}
closed=topology(garment.data)
assert closed['boundaryEdges']==closed['nonmanifoldEdges']==0 and volume>0
assert minimum_panel_clearance>.0015,('Contact hull outer envelope not verified',first_bad_panel_sample)
for ob in panel_objects:assert topology(ob.data)['nonmanifoldEdges']==0
assert CAGE.read_bytes()==source_bytes,'Outer cage changed during support authoring; rerun against the new rest cage'
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND),check_existing=False)
renders=[]
for name,camera in cameras.items():
    scene.camera=camera;filename=RENDERS/(name+'.png');scene.render.filepath=str(filename);bpy.ops.render.render(write_still=True);renders.append(str(filename))
# Actual normals review on the garment, with the outer wire still present.
debug=bpy.data.materials.new('Review / actual surface normals');debug.use_nodes=True;n=debug.node_tree.nodes;l=debug.node_tree.links;n.clear()
geo=n.new('ShaderNodeNewGeometry');scale=n.new('ShaderNodeVectorMath');scale.operation='SCALE';scale.inputs[3].default_value=.5;l.new(geo.outputs['Normal'],scale.inputs[0])
add=n.new('ShaderNodeVectorMath');add.operation='ADD';add.inputs[1].default_value=(.5,.5,.5);l.new(scale.outputs[0],add.inputs[0])
em=n.new('ShaderNodeEmission');l.new(add.outputs[0],em.inputs[0]);out=n.new('ShaderNodeOutputMaterial');l.new(em.outputs[0],out.inputs[0])
garment.data.materials[0]=debug;scene.camera=cameras['threequarter'];filename=RENDERS/'normals-threequarter.png';scene.render.filepath=str(filename);bpy.ops.render.render(write_still=True);renders.append(str(filename));garment.data.materials[0]=ivory
scene.camera=cameras['threequarter'];bpy.ops.wm.save_as_mainfile(filepath=str(BLEND),check_existing=False)
manifest={'schema':'dafeiyu.native-petticoat-manifest.v1','status':'generated_contact_support_pending_actor_stress_review','blend':str(BLEND),'json':str(OUTPUT),
 'blendSha256':hashlib.sha256(BLEND.read_bytes()).hexdigest(),'jsonSha256':hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),'scriptSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
 'collection':asset.name,'root':root.name,'rootOriginNative':list(anchor_origin),'rootOriginGodot':godot(anchor_origin),'attachmentBone':'DEF-pelvis',
 'garmentTopology':closed,'garmentVolume':volume,'minimumOuterCageRadialClearance':minimum_clearance,'actualRadialScale':RADIAL_SCALE,
 'minimumSampledConvexHullRadialClearance':minimum_panel_clearance,
 'panels':len(panels),'nativeKinematicBodies':len(panel_objects),'nativeClothCollisionModifiers':sum(any(m.type=='COLLISION'for m in o.modifiers)for o in panel_objects),
 'normalCheck':'Positive enclosed double-wall volume, manifold garment, consistently oriented closed convex panel hulls, actual normals PNG.',
 'nativeAttachment':'Parent PetticoatRoot to actual body DEF-pelvis preserving its model-rest world transform; then the kinematic panel children and stiff visible garment follow its bone delta.',
 'renders':renders,'scope':payload['scope'],'limitations':payload['limitations']}
MANIFEST.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print('PETTICOAT_NATIVE_READY '+json.dumps({k:manifest[k]for k in ['json','panels','garmentTopology','minimumOuterCageRadialClearance','blend']}),flush=True)
