import bpy
from pathlib import Path
P=Path('D:/CodexTaskData/dafeiyu-whole-form-20261028');bpy.ops.wm.open_mainfile(filepath=str(P/'whole-form-vertex-color-draft.blend'))
o=next(o for o in bpy.data.objects if o.type=='MESH');me=o.data
for a in list(me.color_attributes):
 if a.name!='baked_identity':me.color_attributes.remove(a)
me.color_attributes.active_color=me.color_attributes['baked_identity']
m=bpy.data.materials.new('VertexColorDraft');m.use_nodes=True;n=m.node_tree.nodes;n.clear();L=m.node_tree.links
out=n.new('ShaderNodeOutputMaterial');p=n.new('ShaderNodeBsdfPrincipled');p.inputs['Roughness'].default_value=.85;c=n.new('ShaderNodeVertexColor');c.layer_name='baked_identity';L.new(c.outputs['Color'],p.inputs['Base Color']);L.new(p.outputs[0],out.inputs['Surface']);me.materials.clear();me.materials.append(m)
bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
bpy.ops.export_scene.gltf(filepath=str(P/'whole-form-vertex-color-draft.glb'),export_format='GLB',use_selection=True)
