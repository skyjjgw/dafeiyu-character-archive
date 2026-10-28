import bpy
from pathlib import Path
P=Path('D:/CodexTaskData/dafeiyu-whole-form-20261028')
bpy.ops.wm.open_mainfile(filepath=str(P/'projection-v4.blend'))
scene=bpy.context.scene;o=next(o for o in bpy.data.objects if o.type=='MESH');bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
mesh=o.data;mesh.uv_layers.new(name='export_atlas');mesh.uv_layers.active=mesh.uv_layers['export_atlas'];mesh.uv_layers.active.active_render=True
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(island_margin=.004);bpy.ops.object.mode_set(mode='OBJECT')
image=bpy.data.images.new('WholeCharacter_BakedColor_DRAFT',width=2048,height=2048,alpha=False)
m=mesh.materials[0];n=m.node_tree.nodes; target=n.new('ShaderNodeTexImage');target.image=image
for node in n:node.select=False
target.select=True;n.active=target
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=1;scene.render.bake.margin=5
bpy.ops.object.bake(type='EMIT');image.filepath_raw=str(P/'whole-form-baked-color.png');image.file_format='PNG';image.save();image.pack()
# Switch a copy of the material to the baked UV texture for portable GLB.
mat=bpy.data.materials.new('WholeForm_Draft_Baked');mat.use_nodes=True;n=mat.node_tree.nodes;n.clear();L=mat.node_tree.links
out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');tex=n.new('ShaderNodeTexImage');tex.image=image;tex.interpolation='Linear';uv=n.new('ShaderNodeUVMap');uv.uv_map='export_atlas';L.new(uv.outputs['UV'],tex.inputs['Vector']);L.new(tex.outputs['Color'],em.inputs['Color']);L.new(em.outputs[0],out.inputs['Surface']);mesh.materials.clear();mesh.materials.append(mat)
# Keep material graph and source geometry in the previous blend as a reversible source.
bpy.ops.wm.save_as_mainfile(filepath=str(P/'whole-form-textured-draft.blend'))
bpy.ops.export_scene.gltf(filepath=str(P/'whole-form-textured-draft.glb'),export_format='GLB',use_selection=True)
