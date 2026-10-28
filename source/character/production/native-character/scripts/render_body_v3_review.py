"""Isolated v3-body review, with unmodified existing head components.

This does not replace the parent assembly, export a runtime, or modify any
component source. It renders actual native meshes, including finger poses.
"""
import bpy,json,hashlib,math
from pathlib import Path
from mathutils import Vector,Matrix

ROOT=Path(__file__).resolve().parent.parent
SOURCE={name:ROOT/file for name,file in [('body','body-v3.blend'),('face','face-v2.blend'),('hair','hair-v3.blend')]}
HASHES={name:hashlib.sha256(path.read_bytes()).hexdigest()for name,path in SOURCE.items()}
OUTPUT=ROOT/'renders'/'body-v3-review';OUTPUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(SOURCE['body']));scene=bpy.context.scene
rig=next(o for o in scene.objects if o.type=='ARMATURE'and 'Head'in o.data.bones)
for label in ['face','hair']:
    collection=bpy.data.collections.new('Unmodified '+label+' review component');scene.collection.children.link(collection)
    with bpy.data.libraries.load(str(SOURCE[label]),link=False)as(source,target):target.objects=list(source.objects)
    roots=[]
    for obj in target.objects:
        if not obj:continue
        if obj.type in ['LIGHT','CAMERA']:
            bpy.data.objects.remove(obj,do_unlink=True);continue
        if obj.type not in ['MESH','ARMATURE','EMPTY']:continue
        collection.objects.link(obj)
        if obj.name.startswith('HeadRoot')and obj.parent is None:roots.append(obj)
    assert len(roots)==1,(label,len(roots))
    frame=roots[0];frame.name=label+' unmodified HeadRoot';frame.location=(0,0,2.155);bpy.context.view_layer.update();world=frame.matrix_world.copy();bone=rig.pose.bones['Head'];parent=rig.matrix_world@bone.matrix@Matrix.Translation((0,bone.length,0))
    frame.parent=rig;frame.parent_type='BONE';frame.parent_bone='Head';frame.matrix_parent_inverse=parent.inverted();frame.matrix_basis=world;bpy.context.view_layer.update();assert(frame.matrix_world.translation-Vector((0,0,2.155))).length<1e-5
for obj in list(scene.objects):
    if obj.type in ['CAMERA','FONT']:bpy.data.objects.remove(obj,do_unlink=True)
scene.render.engine='BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=48
scene.render.resolution_x=896;scene.render.resolution_y=1024;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='Standard';scene.frame_set(1)
data=bpy.data.cameras.new('Body v3 isolated review camera');camera=bpy.data.objects.new(data.name,data);scene.collection.objects.link(camera);scene.camera=camera;data.type='ORTHO'
renders={}
def render(name,target,direction,scale,size=(896,1024)):
    target=Vector(target);camera.location=target+Vector(direction).normalized()*7;camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();data.ortho_scale=scale;scene.render.resolution_x,scene.render.resolution_y=size
    scene.render.filepath=str(OUTPUT/(name+'.png'));bpy.context.view_layer.update();bpy.ops.render.render(write_still=True);renders[name]=scene.render.filepath
for name,direction in [('front',(0,-1,0)),('side',(1,0,0)),('back',(0,1,0)),('threequarter',(.65,-1,.035))]:render(name,(.25,0,1.64),direction,3.85)
render('shoe-side',(.247,-.105,.13),(1,0,.025),.63,(768,640))
render('shoe-threequarter',(.247,-.105,.13),(.65,-1,.20),.63,(768,640))
render('hand-rest',(.69,-.015,1.02),(.35,-1,.08),.44,(768,768))
f=rig.pose.bones['CTRL-fingers.R'];old_grip=f['grip'];old_opposition=f['thumb_opposition'];f['grip']=.70;f['thumb_opposition']=.55;rig.update_tag();scene.frame_set(1);bpy.context.view_layer.update()
render('hand-native-grip',(.69,-.015,1.02),(.35,-1,.08),.44,(768,768))
f['grip']=old_grip;f['thumb_opposition']=old_opposition;rig.update_tag();scene.frame_set(1);bpy.context.view_layer.update()
render('tail-front',(1.10,.20,.68),(0,-1,.03),1.30,(896,768))
render('tail-oblique',(1.10,.20,.68),(.55,-1,.10),1.30,(896,768))
target=Vector((.25,0,1.64));camera.location=target+Vector((0,-7,0));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();data.ortho_scale=3.85;scene.render.resolution_x=896;scene.render.resolution_y=1024
MASTER=ROOT/'body-v3-with-frozen-head-review.blend';bpy.ops.wm.save_as_mainfile(filepath=str(MASTER),check_existing=False)
AFTER={name:hashlib.sha256(path.read_bytes()).hexdigest()for name,path in SOURCE.items()};assert AFTER==HASHES
report={'status':'actual_native_multiview_review_pending_art_acceptance','blend':str(MASTER),'sha256':hashlib.sha256(MASTER.read_bytes()).hexdigest(),'sources':{name:{'path':str(SOURCE[name]),'sha256':HASHES[name]}for name in SOURCE},'sources_unchanged':True,'renders':renders,'hand_grip_render_controls':{'grip':.70,'thumb_opposition':.55},'scope':'Independent body-v3 review only. Existing face/hair attached unchanged for proportion review. No runtime export or parent assembly replacement.','limitations':['Reference likeness is not approved.','V3 finger rest differs from v2; previous object-specific grip needs retuning.','Native cloth exists but full 8-second action was not rebaked on v3.','Tail contact proxy still follows existing five-bone stem, not full-fin collision.','This review does not add hair physics.']}
(ROOT/'body-v3-review-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print('BODY_V3_REVIEW_RESULT '+json.dumps({'blend':str(MASTER),'renders':list(renders),'sources_unchanged':True}))
