import bpy,math
from mathutils import Vector,Matrix
P='D:/CodexTaskData/dafeiyu-whole-form-20261028'
bpy.ops.wm.open_mainfile(filepath=P+'/hair-rebuild-v1.blend');s=bpy.context.scene
for o in list(bpy.data.objects):
 if o.name.startswith('Rebuilt_swept_hair_'):bpy.data.objects.remove(o,do_unlink=True)
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath='E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/selected-production/components/hair-v1/hair-v1.glb')
new=[o for o in bpy.data.objects if o not in before and o.type=='MESH'];img=bpy.data.images.load('E:/zzz/dafeiyu-character-materials-20261025/production/appearance-baseline-20261027/assets/neutral-front.png',check_existing=True)
for o in new:
 if 'auxiliary-source-traced-long-curls' not in o.name:bpy.data.objects.remove(o,do_unlink=True);continue
 # Expanded true front/back dimension; remains a source-derived volumetric mesh.
 T=Matrix(((0,-.63,0,.03),(.315,0,0,-.06),(0,0,.315,.155),(0,0,0,1)));world=o.matrix_world.copy();o.parent=None;o.matrix_world=T@world;o.name='Source_derived_thickened_curl_'+o.name[:5]
 for m in o.data.materials:
  if m.name.split('.')[0] in ('SOURCE_006','SOURCE_008'):
   m.use_nodes=True;n=m.node_tree.nodes;n.clear();L=m.node_tree.links;out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');tex=n.new('ShaderNodeTexImage');tex.image=img;uv=n.new('ShaderNodeUVMap');uv.uv_map=o.data.uv_layers[0].name;L.new(uv.outputs[0],tex.inputs[0]);L.new(tex.outputs['Color'],em.inputs[0]);L.new(em.outputs[0],out.inputs[0])
cam=s.camera;center=Vector((.063081,-.005865,-.002912));s.cycles.samples=8
for angle in (0,45,90,180):
 t=math.radians(angle);cam.location=center+Vector((4*math.cos(t),4*math.sin(t),.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=P+f'/hair-rebuild-v2-{angle:03}.png';bpy.ops.render.render(write_still=True)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=P+'/hair-rebuild-v2.blend')
