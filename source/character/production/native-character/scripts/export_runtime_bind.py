"""Export actual rest joints/contact geometry for the native physics runtime."""
import bpy
import json
import math
import hashlib
import argparse
import sys
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--variant',default='v2',choices=['v2','v3','v4','v5','v6','v7','v8'])
options=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
variant=options.variant
source_blend=ROOT/('dafeiyu-native-'+variant+'-study.blend')
source_glb=ROOT/'assets'/('dafeiyu-native-'+variant+'-study.glb')
manifest=json.loads((ROOT/('assembled-'+variant+'-manifest.json')).read_text(encoding='utf-8-sig'))
source_cage=Path(manifest['runtime_cloth_cage']) if manifest.get('runtime_cloth_cage') else ROOT/'assets'/('skirt-physics-cage-'+variant+'.json')
def sha256(path):return hashlib.sha256(path.read_bytes()).hexdigest()
source_hashes={str(p.name):sha256(p) for p in [source_blend,source_glb,source_cage]}
bpy.ops.wm.open_mainfile(filepath=str(source_blend))
scene=bpy.context.scene;scene.frame_set(1);bpy.context.view_layer.update()
def point(p):return [float(p.x),float(p.z),float(-p.y)]
def segment_distance(p,a,b):
    axis=b-a;t=max(0,min(1,(p-a).dot(axis)/max(1e-12,axis.length_squared)))
    return (p-(a+axis*t)).length
records={};colliders=[]
for rig in scene.objects:
    if rig.type!='ARMATURE':continue
    attached=[o for o in scene.objects if o.type=='MESH' and not o.get('native_render_only') and any(m.type=='ARMATURE' and m.object==rig for m in o.modifiers)]
    for bone in rig.data.bones:
        head=rig.matrix_world@bone.head_local;tail=rig.matrix_world@bone.tail_local
        radii=[]
        if bone.name.startswith('Hair.') or bone.name.startswith('DEF-tail.'):
            for mesh in attached:
                group=mesh.vertex_groups.get(bone.name)
                if not group:continue
                for vertex in mesh.data.vertices:
                    w=next((g.weight for g in vertex.groups if g.group==group.index),0)
                    if w>=.30:radii.append(segment_distance(mesh.matrix_world@vertex.co,head,tail))
        radii.sort();radius=radii[int((len(radii)-1)*.90)] if radii else None
        records[bone.name]={'armature':rig.name,'parent':bone.parent.name if bone.parent else None,'deform':bone.use_deform,
                            'head':point(head),'tail':point(tail),'length':(tail-head).length,
                            'radiusEstimate':min(.20,max(.018,radius)) if radius is not None else None,
                            'radiusSource':'90th percentile of >=.3 weighted mesh vertices; proxy approximation' if radius is not None else None}
for obj in scene.objects:
    if obj.type!='MESH' or not obj.name.startswith('CONTACT'):continue
    constraint=next((c for c in obj.constraints if c.type=='CHILD_OF' and c.subtarget),None)
    colliders.append({'name':obj.name,'bone':constraint.subtarget if constraint else None,'kind':'convexHull',
                      'modelRestVertices':[point(obj.matrix_world@v.co) for v in obj.data.vertices],
                      'scope':'Actual native contact proxy, not the complete rendered surface'})
report={'schema':'dafeiyu.native-rig-bind.v1','coordinates':'glTF/Godot model space, +Y up, +Z forward, metres',
        'sourceBlend':str(source_blend),'sourceHashes':source_hashes,'bones':records,'colliders':colliders,
        'requiredHairAnchor':'Hair.HeadAnchor','requiredBodyHead':'Head',
        'scope':'Rest endpoints and actual authored contact proxies. Runtime must use its imported skeleton rest basis and construct real joints/collisions.'}
path=ROOT/'assets'/('runtime-rig-bind.json' if variant=='v2' else 'runtime-rig-bind-'+variant+'.json');path.write_text(json.dumps(report,separators=(',',':'))+'\n',encoding='utf8')
print('RUNTIME_BIND',json.dumps({'path':str(path),'bones':len(records),'hairBones':sum(k.startswith('Hair.') for k in records),'tailBones':sum(k.startswith('DEF-tail.') for k in records),'colliders':len(colliders)}))
