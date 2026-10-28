import bpy,json,hashlib,math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent.parent;SOURCE=ROOT/'body-v4.blend';BEFORE=hashlib.sha256(SOURCE.read_bytes()).hexdigest();OUT=ROOT/'renders/body-v4';OUT.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(SOURCE));scene=bpy.context.scene;rig=next(o for o in scene.objects if o.type=='ARMATURE'and 'Head'in o.data.bones);camera=scene.camera;camera.data.type='ORTHO';scene.render.engine='BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=64;scene.render.resolution_x=960;scene.render.resolution_y=960;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='Standard';scene.frame_set(1);renders={}
def render(name,target,direction,scale):
    target=Vector(target);camera.location=target+Vector(direction).normalized()*6;camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=scale;scene.render.filepath=str(OUT/(name+'.png'));bpy.context.view_layer.update();bpy.ops.render.render(write_still=True);renders[name]=scene.render.filepath
for name,direction in [('front',(0,-1,.01)),('side',(1,0,.02)),('back',(0,1,.02)),('threequarter',(.65,-1,.04))]:render('final-'+name,(.28,0,.95),direction,2.9)
cage=json.loads((ROOT/'assets/skirt-physics-cage-v4.json').read_text());ids=cage['boundaryTags']['tail_outlet'];points=[Vector((cage['vertices'][i][0],-cage['vertices'][i][2],cage['vertices'][i][1]))for i in ids];focus=sum(points,Vector())/len(points)
render('final-outlet-close',focus,(.45,1,.25),.62)
tail=bpy.data.objects['V4 routed whale tail - full convex shared fork'];saved=list(tail.data.materials);saved_ids=[p.material_index for p in tail.data.polygons];gray=bpy.data.materials.new('QA only neutral clay geometry');gray.use_nodes=True;shader=gray.node_tree.nodes.get('Principled BSDF');shader.inputs['Base Color'].default_value=(.5,.5,.5,1);shader.inputs['Roughness'].default_value=.7;tail.data.materials.clear();tail.data.materials.append(gray)
for p in tail.data.polygons:p.material_index=0
render('final-tail-clay-geometry',(1.05,.30,.65),(0,-1,.10),1.4)
tail.data.materials.clear()
for m in saved:tail.data.materials.append(m)
# Restore the actual material regions from the source mesh, without writing it.
for p,index in zip(tail.data.polygons,saved_ids):p.material_index=index
render('final-tail-palette',(1.05,.30,.65),(0,-1,.10),1.4)
ctrl=rig.pose.bones['CTRL-hand_ik.L'];m=ctrl.matrix.copy();m.translation=Vector((-.48,-.26,1.92));ctrl.matrix=m;ctrl['ik_fk']=1;rig.update_tag();bpy.context.view_layer.update();hand=rig.pose.bones['DEF-hand.L'];focus=(rig.matrix_world@hand.head)+Vector((0,0,-.045));render('final-wave-wrist',focus,(.25,-1,.10),.62)
rest_lengths={b.name:b.length for b in rig.data.bones};errors={name:abs((rig.pose.bones[name].tail-rig.pose.bones[name].head).length-length)for name,length in rest_lengths.items()if name.startswith('DEF-')};assert max(errors.values())<1e-5
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==BEFORE
report={'status':'native_actual_render_review_pending_art_acceptance','source':str(SOURCE),'sourceSha256':BEFORE,'sourceUnchanged':True,'renders':renders,'waveIKTargetNative':[-.48,-.26,1.92],'posedBoneLengthMaxError':max(errors.values()),'wristLocalEuler':list(rig.pose.bones['MCH-hand.L'].rotation_euler),'limits':'MCH-hand local anatomical constraint, not global orientation forced beyond the wrist range','scope':'Body only. No new face/hair or parent assembly change. Clay view tests actual tail geometry independently of toon material bands.'};(ROOT/'body-v4-render-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print('BODY_V4_QA '+json.dumps({'renders':len(renders),'sourceUnchanged':True,'maxLengthError':max(errors.values())}))
