import bpy
from pathlib import Path
P=Path('D:/CodexTaskData/dafeiyu-whole-form-20261028')
bpy.ops.wm.open_mainfile(filepath=str(P/'projection-v5.blend'))
s=bpy.context.scene;o=next(o for o in bpy.data.objects if o.type=='MESH');bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
mesh=o.data;attr=mesh.color_attributes.new(name='baked_identity',type='FLOAT_COLOR',domain='CORNER');mesh.color_attributes.active_color=attr
s.render.engine='CYCLES';s.cycles.device='CPU';s.cycles.samples=1;s.render.bake.target='VERTEX_COLORS';bpy.ops.object.bake(type='EMIT')
mat=bpy.data.materials.new('Draft baked vertex color');mat.use_nodes=True;n=mat.node_tree.nodes;n.clear();L=mat.node_tree.links
out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');c=n.new('ShaderNodeVertexColor');c.layer_name='baked_identity';L.new(c.outputs['Color'],em.inputs['Color']);L.new(em.outputs[0],out.inputs['Surface']);mesh.materials.clear();mesh.materials.append(mat)
bpy.ops.wm.save_as_mainfile(filepath=str(P/'whole-form-v5-vertex-draft.blend'))
bpy.ops.export_scene.gltf(filepath=str(P/'whole-form-v5-vertex-draft.glb'),export_format='GLB',use_selection=True,export_attributes=True)

