"""Actual assembled-head expression/angle review. Source remains unchanged."""
import bpy,json,math,hashlib,argparse,sys
from pathlib import Path
from mathutils import Matrix,Vector

ROOT=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--variant',default='v5',choices=['v5','v6','v7','v8'])
options=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
variant=options.variant
SOURCE=ROOT/('dafeiyu-native-'+variant+'-study.blend');before=hashlib.sha256(SOURCE.read_bytes()).hexdigest()
bpy.ops.wm.open_mainfile(filepath=str(SOURCE));scene=bpy.context.scene
body=next(o for o in scene.objects if o.type=='ARMATURE' and 'Head' in o.data.bones)
face=next(o for o in scene.objects if o.type=='ARMATURE' and 'FaceHead' in o.data.bones)
rest=body.pose.bones['Head'].matrix.copy();camera=scene.camera
camera.data.type='ORTHO';camera.data.ortho_scale=2.65
scene.render.resolution_x=640;scene.render.resolution_y=704
target=Vector((0,0,2.20));camera.location=target+Vector((0,-7,0));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
output=ROOT/'renders'/('look-'+variant);output.mkdir(parents=True,exist_ok=True)
cases=[('attentive',0,{'smile':.25,'cheek':.15,'gazeX':.20,'gazeY':-.05}),
       ('turn-halfblink',.40,{'smile':.30,'aa':.25,'blink':.5,'gazeX':-.25}),
       ('laugh',-.18,{'smile':.7,'aa':.55,'blink':.95,'cheek':.4}),
       ('sad',.15,{'sad':.65,'gazeY':-.2}),
       ('head-turn-70',math.radians(70),{'gazeX':-.25,'smile':.15})]
records=[]
for name,yaw,controls in cases:
    pivot=rest.translation.copy();body.pose.bones['Head'].matrix=Matrix.Translation(pivot)@Matrix.Rotation(yaw,4,'Z')@Matrix.Translation(-pivot)@rest
    for key in ('blink','aa','ee','oh','smile','sad','cheek','jaw','gazeX','gazeY','squintL','squintR'):face[key]=controls.get(key,0)
    face.update_tag();bpy.context.view_layer.update()
    scene.render.filepath=str(output/(name+'.png'));bpy.ops.render.render(write_still=True)
    records.append({'name':name,'headYaw':yaw,'controls':controls,'render':scene.render.filepath})
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==before
report={'source':str(SOURCE),'sourceSHA256':before,'renders':records,'scope':'Actual native assembled geometry and continuous expression control samples. Hair here follows the head rigidly; these static reviews do not demonstrate physical secondary motion, acting continuity or final quality.'}
(ROOT/('look-'+variant+'-review.json')).write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print('LOOK_REVIEW',json.dumps({'variant':variant,'renders':len(records),'sourceUnchanged':True}))
