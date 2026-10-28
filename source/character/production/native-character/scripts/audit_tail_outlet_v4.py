"""Read-only source audit for an isolated future tailored tail outlet.

No v2/v3 component, rig, cage or collision source is written. Intersections are
actual evaluated native triangle intersections, not a screen-space estimate.
"""
import bpy,json,hashlib,math
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.geometry import intersect_ray_tri
ROOT=Path(__file__).resolve().parent.parent
FILES=[ROOT/'body-v2.blend',ROOT/'body-v3.blend',ROOT/'petticoat-v1.blend',ROOT/'scripts/build_body.py',ROOT/'scripts/build_body_v3.py',ROOT/'scripts/build_petticoat.py']
BEFORE={str(p):hashlib.sha256(p.read_bytes()).hexdigest()for p in FILES}
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'body-v3.blend'));scene=bpy.context.scene;scene.frame_set(1);bpy.context.view_layer.update()
tail=bpy.data.objects['Whale tail unified stem and shared-fork fluke'];cage=next(o for o in scene.objects if o.name.startswith('SKIRT_SIM'))
collection=bpy.data.collections.new('Read only petticoat audit');scene.collection.children.link(collection)
with bpy.data.libraries.load(str(ROOT/'petticoat-v1.blend'),link=False)as(source,target):target.objects=[n for n in source.objects if n=='PetticoatRoot'or n.startswith('Sewn stiff petticoat')]
for obj in target.objects:
    if obj:collection.objects.link(obj)
bpy.context.view_layer.update();petti=next(o for o in scene.objects if o.name.startswith('Sewn stiff petticoat'))
def triangles(obj):
    ev=obj.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=ev.to_mesh();mesh.calc_loop_triangles();v=[ev.matrix_world@p.co for p in mesh.vertices];t=[tuple(p.vertices)for p in mesh.loop_triangles];ev.to_mesh_clear();return v,t
def bbox(points):return[[min(p[i]for p in points)for i in range(3)],[max(p[i]for p in points)for i in range(3)]]if points else None
def intersections(obj):
    tv,tf=triangles(tail);ov,of=triangles(obj);tb=BVHTree.FromPolygons(tv,tf,all_triangles=True);ob=BVHTree.FromPolygons(ov,of,all_triangles=True);pairs=tb.overlap(ob);points={}
    for ai,bi in pairs:
        a=[tv[j]for j in tf[ai]];b=[ov[j]for j in of[bi]]
        for outer,inner in [(a,b),(b,a)]:
            for p,q in zip(outer,outer[1:]+outer[:1]):
                ray=q-p;hit=intersect_ray_tri(*inner,ray,p,True)
                if hit is not None:
                    u=(hit-p).dot(ray)/ray.length_squared
                    if-1e-6<=u<=1+1e-6:points[tuple(round(c,6)for c in hit)]=hit
    out=list(points.values());return{'object':obj.name,'triangle_pairs':len(pairs),'actual_intersection_points':len(out),'intersection_bbox_native':bbox(out),'points_native':[list(p)for p in out]}
PATH=[Vector(p)for p in[(.25,.24,.90),(.45,.26,.68),(.65,.28,.50),(.85,.26,.52),(1.05,.22,.60),(1.16,.20,.67)]]
centerline=[]
for segment in range(4):
    p0=PATH[max(0,segment-1)];p1=PATH[segment];p2=PATH[segment+1];p3=PATH[min(len(PATH)-1,segment+2)]
    for step in range(16):
        t=step/16;centerline.append(.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t))
centerline.append(PATH[4])
def side_classification(obj):
    v,f=triangles(obj);tree=BVHTree.FromPolygons(v,f,all_triangles=True);out=[]
    for p in centerline:
        nearest=tree.find_nearest(p);out.append({'point':list(p),'nearest_surface_distance':nearest[3],'nearest_surface_point':list(nearest[0]),'below_hem':p.z<.558})
    return out
report={'schema':'dafeiyu.tail-outlet.audit.v4','status':'read_only_actual_intersections_measured','coordinates':'native X / forward -Y / up Z','outer':intersections(cage),'petticoat':intersections(petti),'tail_centerline_surface_relation':side_classification(cage),'tail_origin':list(PATH[0]),'frozen_sources_before':BEFORE,'frozen_sources_unchanged':True,'limitations':['Petticoat-v1 is still fitted to v2 cage, not the fuller v3 skirt.','Intersection points establish conflicts only, not a completed tailored opening or garment simulation pass.']}
assert all(hashlib.sha256(Path(p).read_bytes()).hexdigest()==h for p,h in BEFORE.items())
out=ROOT/'tail-outlet-audit-v4.json';out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print('TAIL_OUTLET_AUDIT '+json.dumps({key:report[key]for key in ['outer','petticoat']})[:2200])
