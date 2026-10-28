"""Assemble editable native components and export a runtime study.

Never overwrites v1 or the isolated component sources. Native constraints and
cloth stay in .blend; the runtime reconstructs physics instead of claiming
that glTF contains a physics engine.
"""
import bpy
import hashlib
import json
import argparse
import sys
import struct
from pathlib import Path
from mathutils import Vector,Matrix

ROOT=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--variant',choices=['v2','v3','v4','v5','v6','v7','v8'],default='v2')
parser.add_argument('--body-version',default='v2',choices=['v2','v3','v4'])
parser.add_argument('--face-version',default='v2',choices=['v2','v3','v4'])
parser.add_argument('--hair-version',default=None,choices=['v2','v3','v4','v5','v6','v7'])
OPTIONS=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
VARIANT=OPTIONS.variant
SOURCES={name:ROOT/(name+'-v2.blend') for name in ['body','face','hair']}
SOURCES['body']=ROOT/('body-'+OPTIONS.body_version+'.blend')
SOURCES['face']=ROOT/('face-'+OPTIONS.face_version+'.blend')
SOURCES['hair']=ROOT/('hair-'+(OPTIONS.hair_version or VARIANT)+'.blend')
for path in SOURCES.values():
    if not path.is_file():raise RuntimeError('Native component not ready: '+str(path))
hashes={name:hashlib.sha256(path.read_bytes()).hexdigest() for name,path in SOURCES.items()}
RENDERS=ROOT/'renders'/('assembled-'+VARIANT);RENDERS.mkdir(parents=True,exist_ok=True)
ASSETS=ROOT/'assets';ASSETS.mkdir(exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(SOURCES['body']))
scene=bpy.context.scene
rig=next(o for o in scene.objects if o.type=='ARMATURE' and 'Head' in o.data.bones)
asset_objects=set(o for o in scene.objects if o.type=='ARMATURE' or (o.type=='MESH' and not o.hide_render and not o.name.startswith('GROUND')))

def append_component(path,label):
    collection=bpy.data.collections.new('Native '+label+' component');scene.collection.children.link(collection)
    with bpy.data.libraries.load(str(path),link=False) as (source,target):target.objects=list(source.objects)
    objects=[o for o in target.objects if o]
    roots=[]
    for obj in objects:
        if obj.type in ('LIGHT','CAMERA'):
            bpy.data.objects.remove(obj,do_unlink=True);continue
        if obj.type not in ('MESH','ARMATURE','EMPTY'):continue
        collection.objects.link(obj);asset_objects.add(obj)
        if obj.name.startswith('HeadRoot') and obj.parent is None:roots.append(obj)
    if len(roots)!=1:raise RuntimeError(f'{label} requires exactly one HeadRoot, found {len(roots)}')
    frame=roots[0];frame.name=label+' HeadRoot';frame.location=(0,0,2.155)
    scene.view_layers[0].update()
    world=frame.matrix_world.copy();bone=rig.pose.bones['Head']
    parent_matrix=rig.matrix_world@bone.matrix@Matrix.Translation((0,bone.length,0))
    frame.parent=rig;frame.parent_type='BONE';frame.parent_bone='Head';frame.matrix_parent_inverse=parent_matrix.inverted();frame.matrix_basis=world
    scene.view_layers[0].update()
    assert (frame.matrix_world.translation-Vector((0,0,2.155))).length<1e-5,'Head attachment moved'
    return frame,objects

face_frame,face_objects=append_component(SOURCES['face'],'Face')
hair_frame,hair_objects=append_component(SOURCES['hair'],'Hair')
for obj in list(scene.objects):
    if obj.type in ('LIGHT','CAMERA'):bpy.data.objects.remove(obj,do_unlink=True)

# A real closed, bone-following contact volume for head/cloth/hair interaction.
bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,radius=1,location=(0,0,2.30))
head_contact=bpy.context.object;head_contact.name='CONTACT full head ellipsoid';head_contact.scale=(.565,.39,.55)
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
c=head_contact.constraints.new('CHILD_OF');c.target=rig;c.subtarget='Head';c.inverse_matrix=(rig.matrix_world@rig.pose.bones['Head'].matrix).inverted()
bpy.ops.rigidbody.object_add();head_contact.rigid_body.kinematic=True;head_contact.rigid_body.collision_shape='CONVEX_HULL';head_contact.rigid_body.use_margin=True;head_contact.rigid_body.collision_margin=.003
head_contact.modifiers.new('Actual head cloth contact','COLLISION');head_contact.hide_render=True;head_contact.display_type='WIRE'
scene.frame_set(1);bpy.context.view_layer.update()
for obj in asset_objects:
    if obj.type!='MESH':continue
    owner=next((m.object for m in obj.modifiers if m.type=='ARMATURE' and m.object),None)
    if owner and obj.parent!=owner:
        world=obj.matrix_world.copy();obj.parent=owner;obj.matrix_parent_inverse=owner.matrix_world.inverted();obj.matrix_basis=world
bpy.context.view_layer.update()

scene.render.engine='BLENDER_EEVEE_NEXT';scene.render.resolution_x=896;scene.render.resolution_y=1024;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.view_settings.view_transform='Standard'
scene.world=bpy.data.worlds.new('Assembled neutral studio');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.70,.75,.77,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
for name,loc,energy,size in [('Key',(-3,-4,5),500,4),('Fill',(4,-2,3),230,4),('Rim',(1,3,5),350,3)]:
    data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.size=size;obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=loc;obj.rotation_euler=(Vector((0,0,1.6))-obj.location).to_track_quat('-Z','Y').to_euler()
data=bpy.data.cameras.new('Full native character inspection');camera=bpy.data.objects.new(data.name,data);scene.collection.objects.link(camera);scene.camera=camera;data.type='ORTHO';data.ortho_scale=3.85
target=Vector((.18,0,1.64));outputs=[]
for name,direction in {'front':(0,-1,0),'side':(-1,0,0),'back':(0,1,0),'threequarter':(.65,-1,.04)}.items():
    camera.location=target+Vector(direction).normalized()*7;camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(RENDERS/(name+'.png'));bpy.ops.render.render(write_still=True);outputs.append(str(RENDERS/(name+'.png')))
camera.location=target+Vector((0,-7,0));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
MASTER=ROOT/('dafeiyu-native-'+VARIANT+'-study.blend');bpy.ops.wm.save_as_mainfile(filepath=str(MASTER))

# Export editable geometry, real skins and shape keys. Procedural cel/eye nodes
# need native runtime shaders; glTF is deliberately not labelled final look.
bpy.ops.object.select_all(action='DESELECT')
for obj in asset_objects:
    if obj.name in bpy.data.objects and obj.type in ('MESH','ARMATURE','EMPTY') and not obj.get('native_render_only'):obj.hide_set(False);obj.select_set(True)
bpy.context.view_layer.objects.active=rig
GLB=ASSETS/('dafeiyu-native-'+VARIANT+'-study.glb')
bpy.ops.export_scene.gltf(filepath=str(GLB),export_format='GLB',use_selection=True,export_animations=False,export_skins=True,export_morph=True,export_yup=True,export_extras=True,export_apply=False)
vertex_color_audit=[]
if OPTIONS.face_version=='v4':
    # Blender's procedural named attributes are exported as COLOR_1/2 after
    # a generated white COLOR_0. Godot exposes the standard COLOR_0 stream.
    # Canonicalize each material explicitly, preserving every binary byte of
    # geometry, skin weights, UVs and morphs.
    raw=GLB.read_bytes();chunks=[];offset=12
    while offset<len(raw):
        length,kind=struct.unpack_from('<II',raw,offset);chunks.append([kind,raw[offset+8:offset+8+length]]);offset+=8+length
    document=json.loads(next(data for kind,data in chunks if kind==0x4E4F534A))
    binary=next(data for kind,data in chunks if kind==0x004E4942)
    rules={'Face / editable albedo and gentle NPR':('COLOR_1','FaceAlbedo'),'Lips / measured interrupted smile ink':('COLOR_2','LipAlbedo')}
    def color_bounds(index):
        a=document['accessors'][index];view=document['bufferViews'][a['bufferView']]
        formats={5121:('B',1,255),5123:('H',2,65535),5126:('f',4,1)}
        fmt,size,scale=formats[a['componentType']];minimum=[float('inf')]*3;maximum=[-float('inf')]*3
        for i in range(a['count']):
            start=view.get('byteOffset',0)+a.get('byteOffset',0)+i*view.get('byteStride',4*size)
            for c in range(3):
                value=struct.unpack_from('<'+fmt,binary,start+c*size)[0]
                if a.get('normalized'):value/=scale
                minimum[c]=min(minimum[c],value);maximum[c]=max(maximum[c],value)
        return minimum,maximum
    for mesh in document['meshes']:
        for primitive in mesh['primitives']:
            material=document['materials'][primitive['material']];name=material.get('name','')
            if name not in rules:continue
            semantic,attribute=rules[name];attributes=primitive['attributes']
            if semantic not in attributes:raise RuntimeError('Missing actual named face albedo stream '+semantic)
            index=attributes[semantic];minimum,maximum=color_bounds(index)
            if min(minimum)>.99:raise RuntimeError('White fallback cannot stand in for '+attribute)
            attributes['COLOR_0']=index
            material.setdefault('extras',{})['nativeVertexAlbedoRule']='replace'
            material['extras']['nativeVertexAlbedoAttribute']=attribute
            vertex_color_audit.append({'mesh':mesh['name'],'material':name,'sourceAttribute':attribute,'rawSemantic':semantic,'runtimeSemantic':'COLOR_0','rule':'replace','accessor':index,'linearMin':minimum,'linearMax':maximum})
    if len(vertex_color_audit)!=2:raise RuntimeError('Expected exactly the actual face and lip primitives')
    encoded=json.dumps(document,separators=(',',':'),ensure_ascii=False).encode('utf8');encoded+=b' '*((-len(encoded))%4)
    rebuilt=[]
    for kind,data in chunks:
        if kind==0x4E4F534A:data=encoded
        rebuilt.append(struct.pack('<II',len(data),kind)+data)
    payload=b''.join(rebuilt)
    normalized=struct.pack('<III',0x46546C67,2,12+len(payload))+payload
    (ASSETS/('dafeiyu-native-'+VARIANT+'-blender-raw.glb')).write_bytes(raw)
    GLB.write_bytes(normalized)
    audit={'rawSHA256':hashlib.sha256(raw).hexdigest(),'runtimeSHA256':hashlib.sha256(normalized).hexdigest(),
           'binaryChunkSHA256':hashlib.sha256(binary).hexdigest(),'binaryChunkUnchanged':True,'primitives':vertex_color_audit,
           'scope':'Actual named linear albedo mapped to standard runtime COLOR_0. Source geometry/skin/UV/morph binary is unchanged; custom NPR/iris shaders are still required.'}
    (ROOT/('assembled-'+VARIANT+'-vertex-albedo-audit.json')).write_text(json.dumps(audit,indent=2)+'\n',encoding='utf8')
cloth=next((o for o in scene.objects if o.type=='MESH' and o.name.startswith('SKIRT_SIM')),None)
cloth_file=None
if cloth and OPTIONS.body_version=='v4':
    cloth_file=ASSETS/'skirt-physics-cage-v4.json'
    if not cloth_file.is_file():raise RuntimeError('Body v4 requires its compact hole-aware native cage')
    cage=json.loads(cloth_file.read_text(encoding='utf-8-sig'))
    if cage.get('schema')!='dafeiyu.native-cloth-cage.v2':raise RuntimeError('Body v4 cannot use the old regular-grid cage')
    if cage.get('sourceBodySha256') and cage['sourceBodySha256']!=hashes['body']:raise RuntimeError('Body v4/cage source hash differs')
elif cloth:
    pin=cloth.vertex_groups.get('Waist_PIN')
    def pin_weight(vertex):
        if not pin:return 0.
        return next((group.weight for group in vertex.groups if group.group==pin.index),0.)
    def runtime_point(point):return [point.x,point.z,-point.y]
    positions=[runtime_point(cloth.matrix_world@v.co) for v in cloth.data.vertices]
    triangles=[];triangle_materials=[]
    for polygon in cloth.data.polygons:
        ids=list(polygon.vertices)
        for i in range(1,len(ids)-1):triangles.append([ids[0],ids[i],ids[i+1]]);triangle_materials.append(polygon.material_index)
    cloth_file=ASSETS/('skirt-physics-cage-'+VARIANT+'.json')
    cage={'schema':'dafeiyu.native-cloth-cage.v1','coordinateFrame':'glTF/Godot +Y up, +Z forward, model-local metres',
          'vertices':positions,'triangles':triangles,'triangleMaterials':triangle_materials,'pinWeights':[pin_weight(v) for v in cloth.data.vertices],
          'anchorBone':'DEF-pelvis','sourceObject':cloth.name,'sourceBodySha256':hashes['body'],
          'renderMeshPrefixes':['Maid skirt','White shaped apron','Apron continuous','Whale embroidery'],
          'scope':'Actual native low-resolution cloth rest cage; runtime must bind waist and run its own solver, not play fixed mesh frames'}
    cloth_file.write_text(json.dumps(cage,separators=(',',':'))+'\n',encoding='utf8')
materials={m.name:{'baseColor':list(m.diffuse_color),'proceduralNodes':bool(m.use_nodes),
                   'nativeHairSheen':json.loads(m['native_hair_sheen']) if m.get('native_hair_sheen') else None,
                   'nativeToon':json.loads(m['native_toon']) if m.get('native_toon') else None,
                   'vertexAlbedoRule':'replace' if any(r['material']==m.name for r in vertex_color_audit) else None} for m in bpy.data.materials if m.users}
report={'status':'assembled_native_study_pending_visual_and_runtime_review','sources':{n:{'path':str(p),'sha256':hashes[n]} for n,p in SOURCES.items()},
        'blend':str(MASTER),'runtime_glb':str(GLB),'glb_bytes':GLB.stat().st_size,'glb_sha256':hashlib.sha256(GLB.read_bytes()).hexdigest(),
        'renders':outputs,'headOrigin':[0,0,2.155],'runtime_cloth_cage':str(cloth_file) if cloth_file else None,
        'runtime_cloth_cage_sha256':hashlib.sha256(cloth_file.read_bytes()).hexdigest() if cloth_file else None,
        'armatures':{o.name:{'bones':len(o.data.bones),'boneNames':[b.name for b in o.data.bones]} for o in asset_objects if o.type=='ARMATURE'},
        'materials':materials,'limitations':['Current art has not reached the reference quality.','Procedural Blender cel/iris materials require runtime shaders; glTF alone does not preserve their appearance.','Native IK, drivers, collision constraints and cloth do not export as a realtime physics controller.','Continuous acting, grasp and full-angle runtime validation remain required.']}
(ROOT/('assembled-'+VARIANT+'-manifest.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('ASSEMBLED_NATIVE',json.dumps({k:report[k] for k in ['status','blend','runtime_glb','glb_bytes','headOrigin']}))
