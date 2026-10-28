import bpy,json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent.parent;bpy.ops.wm.open_mainfile(filepath=str(ROOT/'body-v4.blend'));scene=bpy.context.scene;scene.frame_set(1);source=json.loads((ROOT/'assets/skirt-physics-cage-v4.json').read_text());points=[source['vertices'][i]for i in source['boundaryTags']['tail_outlet']];focus=sum((Vector((p[0],-p[2],p[1]))for p in points),Vector())/len(points)
for prefix,color in [('BODY continuous',(1,0,0,1)),('V4 petticoat',(0,1,0,1)),('V4 flexible tail',(0,0,1,1))]:
    obj=next(o for o in scene.objects if o.name.startswith(prefix));m=bpy.data.materials.new('QA material ID '+prefix);m.use_nodes=True;n=m.node_tree.nodes;n.clear();em=n.new('ShaderNodeEmission');em.inputs[0].default_value=color;out=n.new('ShaderNodeOutputMaterial');m.node_tree.links.new(em.outputs[0],out.inputs[0]);obj.data.materials.clear();obj.data.materials.append(m)
    for poly in obj.data.polygons:poly.material_index=0
cam=scene.camera;cam.location=focus+Vector((.45,1,.25)).normalized()*6;cam.rotation_euler=(focus-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=.62;scene.render.engine='BLENDER_EEVEE_NEXT';scene.eevee.taa_render_samples=32;scene.render.resolution_x=960;scene.render.resolution_y=960;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.filepath=str(ROOT/'renders/body-v4/portal-material-id.png');bpy.ops.render.render(write_still=True)
