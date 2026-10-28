"""Read-only multi-angle attachment/deformation checks, not visual acceptance."""
import bpy
import hashlib
import json
import math
import argparse
import sys
from pathlib import Path
from mathutils import Matrix,Vector

ROOT=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--variant',default='v2',choices=['v2','v3','v4','v5','v6','v7','v8'])
options=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
SOURCE=ROOT/('dafeiyu-native-'+options.variant+'-study.blend')
before=hashlib.sha256(SOURCE.read_bytes()).hexdigest()
bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
scene=bpy.context.scene;scene.frame_set(1);bpy.context.view_layer.update()
body=next(o for o in scene.objects if o.type=='ARMATURE' and 'Head' in o.data.bones)
face=next(o for o in scene.objects if o.type=='ARMATURE' and 'FaceHead' in o.data.bones)
frames=[bpy.data.objects['Face HeadRoot'],bpy.data.objects['Hair HeadRoot']]
rest_head=body.pose.bones['Head'].matrix.copy();rest_root=body.pose.bones['Root'].matrix.copy()
rest_head_basis=body.pose.bones['Head'].matrix_basis.copy()
frame_rest={o.name:o.matrix_world.copy() for o in frames}
bone_rest={b.name:b.length for b in body.data.bones if b.use_deform}
origin=rest_head.translation.copy();max_attachment_error=0.;max_bone_length_error=0.;poses=[]
for body_yaw,head_yaw,blink,aa in [(0,0,0,0),(0,.45,.5,.4),(0,-.45,1,.3),(0,math.pi/2,0,0),(0,-math.pi/2,.5,.5),(math.pi/2,0,.3,0),(math.pi,0,0,.2)]:
    body.pose.bones['Root'].matrix=Matrix.Rotation(body_yaw,4,'Z')@rest_root
    body.pose.bones['Head'].matrix_basis=rest_head_basis
    bpy.context.view_layer.update()
    parent_changed=body.pose.bones['Head'].matrix.copy()
    pivot=parent_changed.translation.copy()
    body.pose.bones['Head'].matrix=Matrix.Translation(pivot)@Matrix.Rotation(head_yaw,4,'Z')@Matrix.Translation(-pivot)@parent_changed
    for key,value in {'blink':blink,'aa':aa,'smile':.25 if aa else 0,'gazeX':.3 if blink else 0,'gazeY':.1 if blink else 0}.items():face[key]=value
    face.update_tag();bpy.context.view_layer.update()
    change=body.matrix_world@body.pose.bones['Head'].matrix@(body.matrix_world@rest_head).inverted()
    for obj in frames:
        expected=change@frame_rest[obj.name]
        error=max(abs(obj.matrix_world[r][c]-expected[r][c]) for r in range(4) for c in range(4))
        max_attachment_error=max(max_attachment_error,error)
    for bone in body.pose.bones:
        if bone.name in bone_rest:max_bone_length_error=max(max_bone_length_error,abs((bone.tail-bone.head).length-bone_rest[bone.name]))
    depsgraph=bpy.context.evaluated_depsgraph_get();meshes=0;vertices=0
    for obj in scene.objects:
        if obj.type!='MESH' or obj.hide_render or obj.get('native_render_only'):continue
        evaluated=obj.evaluated_get(depsgraph);data=evaluated.to_mesh();meshes+=1;vertices+=len(data.vertices)
        assert all(math.isfinite(n) for vertex in data.vertices for n in vertex.co),obj.name+' has nonfinite evaluated vertices'
        evaluated.to_mesh_clear()
    poses.append({'bodyYaw':body_yaw,'headYaw':head_yaw,'blink':blink,'aa':aa,'evaluatedMeshes':meshes,'evaluatedVertices':vertices})
assert max_attachment_error<1e-4,max_attachment_error
assert max_bone_length_error<1e-4,max_bone_length_error
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==before,'Read-only verifier changed source file'
report={'passed':True,'scope':'Read-only structural multi-angle/deformation checks; no claim of gait physics, contact, artistic likeness or final quality',
        'source':str(SOURCE),'sourceSha256':before,'poses':poses,'maximumHeadAttachmentMatrixError':max_attachment_error,'maximumDeformBoneLengthError':max_bone_length_error}
(ROOT/('assembly-structure-verification.json' if options.variant=='v2' else 'assembly-'+options.variant+'-structure-verification.json')).write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print('ASSEMBLY_STRUCTURE',json.dumps({k:v for k,v in report.items() if k not in ('poses',)}))
