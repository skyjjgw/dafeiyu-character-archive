import bpy, math
from mathutils import Matrix,Vector
from pathlib import Path
P=Path('D:/CodexTaskData/dafeiyu-whole-form-20261028')
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-model-reconstruction-20261028/output/canonical-front-v1/whole-character-static.blend')
before=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath='E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/selected-production/components/continuous-head-v3/head-local.glb')
new=[o for o in bpy.data.objects if o not in before and o.type=='MESH']
s=.315
T=Matrix(((0,-s,0,.14),(s,0,0,0),(0,0,s,.155),(0,0,0,1)))
for o in new:
 world=o.matrix_world.copy();o.parent=None;o.matrix_world=T@world
 for mod in list(o.modifiers):
  if mod.type=='ARMATURE':o.modifiers.remove(mod)
# Runtime applies the original face image through custom shader. Here make an editable approximation.
img=bpy.data.images.load('E:/zzz/dafeiyu-character-materials-20261025/production/appearance-baseline-20261027/assets/BV1g2JX6HEHX.jpg',check_existing=True)
for m in bpy.data.materials:
 if m.name in ('SOURCE_000','SOURCE_003'):
  m.use_nodes=True; ns=m.node_tree.nodes;ns.clear();out=ns.new('ShaderNodeOutputMaterial');em=ns.new('ShaderNodeEmission');tex=ns.new('ShaderNodeTexImage');tex.image=img
  m.node_tree.links.new(tex.outputs['Color'],em.inputs['Color']);m.node_tree.links.new(em.outputs[0],out.inputs[0])
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=8
scene.view_settings.view_transform='Standard';scene.view_settings.look='None'
center=Vector((.063081,-.005865,-.002912));cam=scene.camera
for angle in (0,45,90,180):
 theta=math.radians(angle);cam.location=center+Vector((math.cos(theta)*4,math.sin(theta)*4,.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
 scene.render.filepath=str(P/f'overlay-{angle:03}.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(P/'nonfinal-head-fit-experiment.blend'))
