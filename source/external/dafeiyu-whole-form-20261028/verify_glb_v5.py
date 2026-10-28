import bpy, math
from mathutils import Vector
P='D:/CodexTaskData/dafeiyu-whole-form-20261028'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=P+'/whole-form-v5-vertex-draft.glb')
o=next(o for o in bpy.data.objects if o.type=='MESH');print('GLB',len(o.data.vertices),'color layers',[(a.name,a.domain) for a in o.data.color_attributes])
# Test colors as unlit to match source comparison.
m=o.data.materials[0];m.use_nodes=True;n=m.node_tree.nodes;n.clear();L=m.node_tree.links;out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');col=n.new('ShaderNodeVertexColor');col.layer_name=o.data.color_attributes[0].name;L.new(col.outputs['Color'],em.inputs[0]);L.new(em.outputs[0],out.inputs[0])
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.device='CPU';s.cycles.samples=8;s.render.resolution_x=640;s.render.resolution_y=704;s.render.resolution_percentage=100;s.world=bpy.data.worlds.new('World');s.world.color=(.1,.1,.1);s.view_settings.view_transform='Standard';s.view_settings.look='None'
center=Vector((.063081,-.005865,-.002912));ca=bpy.data.cameras.new('Camera');cam=bpy.data.objects.new('Camera',ca);s.collection.objects.link(cam);s.camera=cam;ca.type='ORTHO';ca.ortho_scale=1.209271;cam.location=center+Vector((4,0,.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=P+'/glb-v5-reimport-front.png';bpy.ops.render.render(write_still=True)


