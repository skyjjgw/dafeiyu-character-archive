"""Read-only checks of the actual hair mesh, weights and posed deformation."""
import argparse,hashlib,json,math,sys
from pathlib import Path
import bpy,bmesh

ROOT=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--variant',default='v5')
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
source=ROOT/('hair-'+args.variant+'.blend');source_hash=hashlib.sha256(source.read_bytes()).hexdigest()
bpy.ops.wm.open_mainfile(filepath=str(source))
rig=bpy.data.objects['HairRig'];meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and not o.get('native_render_only')]
def evaluated(obj):
    deps=bpy.context.evaluated_depsgraph_get();result=obj.evaluated_get(deps);mesh=result.to_mesh()
    points=[tuple(v.co) for v in mesh.vertices];result.to_mesh_clear();return points
records=[];failures=[]
for obj in meshes:
    bm=bmesh.new();bm.from_mesh(obj.data)
    boundary=sum(e.is_boundary for e in bm.edges);nonmanifold=sum(not e.is_manifold for e in bm.edges)
    volume=abs(bm.calc_volume(signed=True));bm.free()
    arm=next((m for m in obj.modifiers if m.type=='ARMATURE'),None)
    weight_error=max((abs(sum(g.weight for g in v.groups)-1) for v in obj.data.vertices),default=0) if arm else 0
    if boundary or nonmanifold:failures.append(obj.name+': open or nonmanifold')
    if volume<1e-10:failures.append(obj.name+': no enclosed volume')
    if weight_error>1e-5:failures.append(obj.name+': unnormalised weights')
    before=evaluated(obj);motion=0
    if arm:
        affected=[g.name for g in obj.vertex_groups if g.name in rig.pose.bones]
        for name in affected:
            bone=rig.pose.bones[name];bone.rotation_mode='XYZ';bone.rotation_euler.x=.10
        rig.update_tag();bpy.context.view_layer.update();after=evaluated(obj)
        motion=max((sum((a-b)**2 for a,b in zip(p,q))**.5 for p,q in zip(before,after)),default=0)
        if motion<1e-6:failures.append(obj.name+': bones do not deform skin')
        for name in affected:rig.pose.bones[name].rotation_euler=(0,0,0)
        rig.update_tag();bpy.context.view_layer.update()
    finite=all(math.isfinite(v) for p in before for v in p)
    if not finite:failures.append(obj.name+': invalid evaluated vertices')
    records.append({'mesh':obj.name,'vertices':len(obj.data.vertices),'closed':not boundary and not nonmanifold,'enclosedVolume':volume,'maxWeightSumError':weight_error,'rigged':bool(arm),'posedMaxDisplacement':motion,'customNormals':obj.data.has_custom_normals,'finite':finite})
report={'source':str(source),'sha256':source_hash,'status':'structural_checks_passed_not_art_or_physics_acceptance' if not failures else 'failed','meshes':records,'failures':failures,'imageMaterials':sum(n.bl_idname=='ShaderNodeTexImage' for m in bpy.data.materials if m.use_nodes for n in m.node_tree.nodes),'scope':'Closed actual volumes, actual normalized skinning after subdivision and actual posed displacement. These checks do not certify silhouette fidelity, collision stability, or acting quality.'}
path=ROOT/('hair-'+args.variant+'-audit.json');path.write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
assert hashlib.sha256(source.read_bytes()).hexdigest()==source_hash
print('HAIR_AUDIT',json.dumps({'meshes':len(records),'rigged':sum(r['rigged'] for r in records),'failures':failures}))
if failures:raise RuntimeError('; '.join(failures))
