import bpy, math
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
from pathlib import Path
P=Path('D:/CodexTaskData/dafeiyu-whole-form-20261028')
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-model-reconstruction-20261028/output/canonical-front-v1/whole-character-static.blend')
scene=bpy.context.scene; obj=next(o for o in bpy.data.objects if o.type=='MESH'); mesh=obj.data
center=Vector((.063081,-.005865,-.002912));cam=scene.camera;cam.location=center+Vector((4,0,.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();bpy.context.view_layer.update()
# target render px centre, target radius, reference root-front px centre, source scale
regions=[('left eye',260,253,27,29,233,245,1,1),('right eye',332,253,27,29,332,245,1,1),('mouth',286,290,18,10,282,286,1,1),('whale',283,445,37,26,282,459,1,1),('bow',284,362,33,21,282,350,1,1)]
uv=mesh.uv_layers.new(name='identity_projection_object_space')
attr=mesh.color_attributes.new(name='identity_weight',type='FLOAT_COLOR',domain='CORNER')
# Model is static and front mask is precomputed from face normals and reference coordinates.
def smooth(a,b,x):
 t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
for poly in mesh.polygons:
 for li in poly.loop_indices:
  v=mesh.vertices[mesh.loops[li].vertex_index];co=obj.matrix_world@v.co; normal=(obj.matrix_world.to_3x3()@v.normal).normalized()
  p=world_to_camera_view(scene,cam,co);x=p.x*640;y=(1-p.y)*704
  best=(0,None,None)
  for name,cx,cy,rx,ry,sx,sy,kx,ky in regions:
   d=math.sqrt(((x-cx)/rx)**2+((y-cy)/ry)**2)
   w=1-smooth(.72,1,d)
   w*=smooth(.02,.4,normal.x)*smooth(.10,.18,co.x)
   if w>best[0]:best=(w,(sx+(x-cx)*kx)/640,1-(sy+(y-cy)*ky)/704)
  w,u,vv=best
  uv.data[li].uv=(u or 0,vv or 0);attr.data[li].color=(w,w,w,1)
mat=bpy.data.materials.new('Study fixed object-space face and emblem transfer');mat.use_nodes=True;n=mat.node_tree.nodes;n.clear();L=mat.node_tree.links
out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');base=n.new('ShaderNodeVertexColor');base.layer_name=mesh.color_attributes[0].name
mask=n.new('ShaderNodeVertexColor');mask.layer_name='identity_weight';tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load('E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-geometry/hair-continuity-v1/reports/root-front.png',check_existing=True)
uvn=n.new('ShaderNodeUVMap');uvn.uv_map=uv.name;mix=n.new('ShaderNodeMixRGB');mix.blend_type='MIX'
L.new(uvn.outputs['UV'],tex.inputs['Vector']);L.new(mask.outputs['Color'],mix.inputs[0]);L.new(base.outputs['Color'],mix.inputs[1]);L.new(tex.outputs['Color'],mix.inputs[2]);L.new(mix.outputs[0],em.inputs['Color']);L.new(em.outputs[0],out.inputs['Surface']);mesh.materials.clear();mesh.materials.append(mat)
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=8
scene.view_settings.view_transform='Standard';scene.view_settings.look='None'
for angle in (0,45,90,180):
 t=math.radians(angle);cam.location=center+Vector((math.cos(t)*4,math.sin(t)*4,.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(P/f'projection-v1-{angle:03}.png');bpy.ops.render.render(write_still=True)
# Pack genuine source image into editable Blender and export static geometry + UV + materials.
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(P/'projection-v1.blend'))
