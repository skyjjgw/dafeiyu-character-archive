import bpy,bmesh,math
from mathutils import Vector,Matrix
P='D:/CodexTaskData/dafeiyu-whole-form-20261028'
bpy.ops.wm.open_mainfile(filepath=P+'/projection-v5.blend');s=bpy.context.scene;source=next(o for o in bpy.data.objects if o.type=='MESH');mesh=source.data;colors=mesh.color_attributes['Col']
# Segmentation is only an editable first pass; guide color boundaries are approximate.
classes=[]
for p in mesh.polygons:
 vs=[mesh.vertices[i] for i in p.vertices];co=sum((v.co for v in vs),Vector())/len(vs); rgb=[sum(colors.data[v.index].color[k] for v in vs)/len(vs) for k in range(3)];r,g,b=rgb
 white=(min(r,g,b)>.28 and abs(r-b)<.18 and co.z>.235 and (abs(co.y)>.10 or co.z>.37))
 hair=(b>r*1.35 and b>g*1.25 and b>.04 and co.z>-.19 and abs(co.y)<.36)
 classes.append(2 if white else 1 if hair else 0)
for classid,name in ((0,'Body_and_face_inferred'),(1,'Hair_inferred_guide'),(2,'Old_fused_headband_removed')):
 newmesh=mesh.copy();o=bpy.data.objects.new(name,newmesh);s.collection.objects.link(o);o.matrix_world=source.matrix_world.copy();bm=bmesh.new();bm.from_mesh(newmesh);bm.faces.ensure_lookup_table();drop=[f for f in bm.faces if classes[f.index]!=classid];bmesh.ops.delete(bm,geom=drop,context='FACES');bm.to_mesh(newmesh);bm.free();newmesh.update();o.hide_render=False;o.hide_viewport=False
bpy.data.objects.remove(source,do_unlink=True)
# Use existing separately authored 3D headdress as editable geometry, positioned in guide's frame.
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath='E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-runtime/selected-production/components/headband-v2/headband-v2.glb')
new=[o for o in bpy.data.objects if o not in before and o.type=='MESH'];scale=.26
T=Matrix(((0,-scale,0,.20),(scale,0,0,0),(0,0,scale,.22),(0,0,0,1)))
for o in new:
 world=o.matrix_world.copy();o.parent=None;o.matrix_world=T@world;o.name='Maid_headdress_3D_rebuilt'
# CPU previews, all same world-space mesh.
cam=s.camera;center=Vector((.063081,-.005865,-.002912));s.cycles.samples=8
for angle in (0,45,90,180):
 t=math.radians(angle);cam.location=center+Vector((4*math.cos(t),4*math.sin(t),.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=P+f'/separated-v2-{angle:03}.png';bpy.ops.render.render(write_still=True)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=P+'/separated-v2.blend')

