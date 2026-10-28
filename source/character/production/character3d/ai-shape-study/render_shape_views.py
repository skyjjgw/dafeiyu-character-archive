"""Render actual unrigged geometry from four cameras, without editing a master."""
import bpy
import json
import math
from mathutils import Vector
from pathlib import Path

STUDY=Path(__file__).resolve().parent
RUN=STUDY/'runs'/'20261027-001654-618950'
SOURCE=RUN/'shape-grid256-seed12345.glb'
OUTPUT=RUN/'renders'
OUTPUT.mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(SOURCE))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
points=[o.matrix_world@Vector(corner) for o in meshes for corner in o.bound_box]
lo=Vector(tuple(min(p[i] for p in points) for i in range(3)))
hi=Vector(tuple(max(p[i] for p in points) for i in range(3)))
offset=Vector((-(lo.x+hi.x)/2,-(lo.y+hi.y)/2,-lo.z))
for obj in meshes:
    obj.location+=offset
    for polygon in obj.data.polygons:polygon.use_smooth=True
height=hi.z-lo.z
target=Vector((0,0,height*.5))
scene=bpy.context.scene
scene.render.engine='BLENDER_WORKBENCH'
scene.render.resolution_x=640
scene.render.resolution_y=640
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.display.shading.light='STUDIO'
scene.display.shading.color_type='SINGLE'
scene.display.shading.single_color=(.58,.65,.69)
scene.display.shading.background_type='VIEWPORT'
scene.display.shading.background_color=(.80,.84,.85)
scene.display.shading.show_shadows=True
scene.display.shading.show_cavity=True
scene.display.shading.cavity_type='BOTH'
scene.display.shading.show_object_outline=True
scene.view_settings.view_transform='Standard'
camera_data=bpy.data.cameras.new('Geometry inspection')
camera=bpy.data.objects.new('Geometry inspection',camera_data)
scene.collection.objects.link(camera);scene.camera=camera
camera_data.type='ORTHO';camera_data.ortho_scale=height*1.17
directions={'front':(0,-1,0),'side':(-1,0,0),'back':(0,1,0),'threequarter':(.65,-1,.08)}
outputs=[]
for name,direction in directions.items():
    camera.location=target+Vector(direction).normalized()*height*2
    camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(OUTPUT/f'{name}.png')
    bpy.ops.render.render(write_still=True)
    outputs.append(str(OUTPUT/f'{name}.png'))
report={'source':str(SOURCE),'purpose':'Actual unrigged shape hypothesis, not an animation-ready character',
        'sourceBoundsBlender':[list(lo),list(hi)],'renderedViews':outputs,
        'meshes':len(meshes),'bones':sum(len(o.data.bones) for o in scene.objects if o.type=='ARMATURE')}
(OUTPUT/'manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('SHAPE_VIEWS',json.dumps(report,ensure_ascii=False))
