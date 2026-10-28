"""Render one existing native master in fixed color/clay review conditions.
Usage (ordinary Python, or Blender --python ... --):
  python run_review.py --blend MASTER.blend --out D:/.../review --angles 0,45,90,180 --pitch 0
Never appends parts, edits meshes, overwrites the input, or saves a changed .blend.
"""
from pathlib import Path
import argparse, hashlib, json, math, os, struct, sys

TOOL_ROOT=Path('E:/zzz/dafeiyu-character-materials-20261025/tools/blender')
PREFIX='REVIEW__'
CENTER=(.063081,-.005865,-.002912)
ORTHO=1.20927095413208
PRESERVE=('Original facial paint','SOURCE_','Source-fitted safe skin')

def arguments():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--blend',required=True);p.add_argument('--out',required=True)
    p.add_argument('--angles',default='0,45,90,180')
    p.add_argument('--pitch',type=int,choices=(0,8),default=0)
    p.add_argument('--size',type=int,default=512)
    av=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:]
    a=p.parse_args(av);a.angles=[int(v) for v in a.angles.split(',')]
    if not a.angles:p.error('at least one angle is required')
    if not 128<=a.size<=2048:p.error('--size must be 128..2048')
    return a

def sha_file(p):
    h=hashlib.sha256()
    with open(p,'rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
    return h.hexdigest()

def launch(a):
    import subprocess
    env=os.environ.copy()
    for k,v in {'BLENDER_USER_RESOURCES':'','BLENDER_USER_CONFIG':'config','BLENDER_USER_SCRIPTS':'scripts','BLENDER_USER_EXTENSIONS':'extensions','BLENDER_USER_DATAFILES':'datafiles'}.items():
        env[k]=str(TOOL_ROOT/'profile'/v)
    cmd=[str(TOOL_ROOT/'blender-4.5.15-windows-x64/blender.exe'),'--offline-mode','--disable-autoexec','--background','--threads','2','--python-exit-code','1','--python',str(Path(__file__).resolve()),'--','--blend',a.blend,'--out',a.out,'--angles',','.join(map(str,a.angles)),'--pitch',str(a.pitch),'--size',str(a.size)]
    out=Path(a.out)
    if out.exists() and any(out.iterdir()):
        raise FileExistsError('Use an empty independent output directory; existing review files will not be overwritten.')
    out.mkdir(parents=True,exist_ok=True)
    with open(out/'render.log','w',encoding='utf-8') as log:r=subprocess.run(cmd,env=env,stdout=log,stderr=subprocess.STDOUT)
    print('Review exit:',r.returncode,'Manifest:',str(out/'manifest.json'),'Log:',str(out/'render.log'))
    return r.returncode

def geom_hash(scene,evaluated=False):
    import bpy
    dg=bpy.context.evaluated_depsgraph_get() if evaluated else None
    result={}
    for o in sorted(scene.objects,key=lambda o:o.name):
        if o.type!='MESH':continue
        eo=o.evaluated_get(dg) if evaluated else o
        me=eo.to_mesh() if evaluated else o.data
        h=hashlib.sha256()
        for row in eo.matrix_world:h.update(struct.pack('4f',*row))
        for v in me.vertices:h.update(struct.pack('3f',*v.co))
        for p in me.polygons:
            h.update(struct.pack('I',len(p.vertices)))
            for i in p.vertices:h.update(struct.pack('I',i))
        if not evaluated:
            for uv in me.uv_layers:
                h.update(uv.name.encode())
                for v in uv.data:h.update(struct.pack('2f',*v.uv))
            for attr in me.color_attributes:
                h.update(attr.name.encode())
                for v in attr.data:h.update(struct.pack('4f',*v.color))
        result[o.name]=h.hexdigest()
        if evaluated:eo.to_mesh_clear()
    total=hashlib.sha256(json.dumps(result,sort_keys=True).encode()).hexdigest()
    return {'aggregate_sha256':total,'mesh_count':len(result),'objects':result}

def color_style(mat):
    if not mat.use_nodes or mat.name.startswith(PRESERVE):return 'unchanged source face/eye'
    nt=mat.node_tree
    bs=next((n for n in nt.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if bs is None:return 'unchanged source unlit print'
    # Original graphs remain in memory; only a new active output is added.
    src=bs.inputs['Base Color'].links[0].from_socket if bs.inputs['Base Color'].is_linked else None
    out=nt.nodes.new('ShaderNodeOutputMaterial');out.name=PREFIX+'Output';out.is_active_output=True
    d=nt.nodes.new('ShaderNodeBsdfDiffuse');d.name=PREFIX+'Diffuse';d.inputs['Color'].default_value=(1,1,1,1)
    rgb=nt.nodes.new('ShaderNodeShaderToRGB');rgb.name=PREFIX+'Light';nt.links.new(d.outputs[0],rgb.inputs[0])
    ramp=nt.nodes.new('ShaderNodeValToRGB');ramp.name=PREFIX+'Soft_low_contrast'
    ramp.color_ramp.interpolation='EASE'
    ramp.color_ramp.elements[0].position=.10;ramp.color_ramp.elements[0].color=(.82,.85,.90,1)
    ramp.color_ramp.elements[1].position=.65;ramp.color_ramp.elements[1].color=(1,1,1,1)
    mul=nt.nodes.new('ShaderNodeMixRGB');mul.name=PREFIX+'Preserved_base';mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1
    mul.inputs[1].default_value=bs.inputs['Base Color'].default_value
    if src:nt.links.new(src,mul.inputs[1])
    nt.links.new(rgb.outputs[0],ramp.inputs[0]);nt.links.new(ramp.outputs[0],mul.inputs[2])
    em=nt.nodes.new('ShaderNodeEmission');em.name=PREFIX+'Matte';em.inputs[1].default_value=1
    nt.links.new(mul.outputs[0],em.inputs[0]);nt.links.new(em.outputs[0],out.inputs['Surface'])
    return 'preserved base stream x broad soft .82..1 light, no specular'

def render_review(a):
    import bpy
    from mathutils import Vector
    source=Path(a.blend).resolve();out=Path(a.out).resolve()
    if not source.is_file():raise FileNotFoundError(source)
    out.mkdir(parents=True,exist_ok=True)
    if any((out/f'{mode}-{angle:03}.png').exists() for mode in ('color','clay') for angle in a.angles):
        raise FileExistsError('Use an independent output directory; review images already exist.')
    file_before=sha_file(source)
    bpy.ops.wm.open_mainfile(filepath=str(source));s=bpy.context.scene
    before=geom_hash(s);base_eval=geom_hash(s,True)
    s.render.engine='BLENDER_EEVEE_NEXT';s.render.threads_mode='FIXED';s.render.threads=2
    s.render.resolution_x=a.size;s.render.resolution_y=round(a.size*1.1);s.render.resolution_percentage=100
    s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.film_transparent=False;s.render.use_freestyle=False
    s.render.use_compositing=False;s.render.use_sequencer=False
    s.view_settings.view_transform='Standard';s.view_settings.look='None';s.view_settings.exposure=0;s.view_settings.gamma=1
    if hasattr(s,'eevee'):s.eevee.taa_render_samples=32
    for o in s.objects:
        if o.type=='LIGHT':o.hide_render=True
    ld=bpy.data.lights.new(PREFIX+'fixed_world_key','SUN');ld.energy=1;ld.angle=math.radians(8);ld.use_shadow=False
    lo=bpy.data.objects.new(PREFIX+'fixed_world_key',ld);s.collection.objects.link(lo)
    lo.rotation_euler=Vector((-4,3,-6)).to_track_quat('-Z','Y').to_euler()
    s.world=bpy.data.worlds.new(PREFIX+'neutral_world');s.world.use_nodes=True
    s.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.18,.19,.21,1)
    s.world.node_tree.nodes['Background'].inputs['Strength'].default_value=1
    cd=bpy.data.cameras.new(PREFIX+'fixed_review');cd.type='ORTHO';cd.ortho_scale=ORTHO
    cam=bpy.data.objects.new(PREFIX+'fixed_review',cd);s.collection.objects.link(cam);s.camera=cam
    mats={m for o in s.objects if o.type in ('MESH','CURVE') for m in o.data.materials if m}
    material_report={m.name:color_style(m) for m in mats}
    # Gray matte clay uses a broad continuous range to expose real forms, no outlines.
    clay=bpy.data.materials.new(PREFIX+'clay');clay.use_nodes=True
    bs=clay.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.48,.48,.48,1)
    bs.inputs['Roughness'].default_value=1;bs.inputs['Specular IOR Level'].default_value=0
    bs.inputs['Emission Color'].default_value=(.15,.15,.15,1);bs.inputs['Emission Strength'].default_value=1
    # Eevee can ignore view-layer material_override for source emission materials.
    # Object-linked slot overrides are explicit, in memory only, and leave mesh data intact.
    slots=[(slot,slot.link,slot.material) for o in s.objects if o.type in ('MESH','CURVE','SURFACE','FONT','META') for slot in o.material_slots]
    center=Vector(CENTER);pitch=math.radians(a.pitch)
    manifest={'finalAccepted':False,'source_blend':str(source),'source_file_sha256':file_before,'script_sha256':sha_file(__file__),'source_frame':s.frame_current,'engine':'BLENDER_EEVEE_NEXT','geometry_before':before,'evaluated_geometry_before':base_eval,'settings':{'center':CENTER,'ortho_scale':ORTHO,'distance':4,'pitch_degrees':a.pitch,'angles_degrees':a.angles,'resolution':[s.render.resolution_x,s.render.resolution_y],'color_space':'Standard / None / exposure0 / gamma1','light':'fixed world-space sun direction (-4,3,-6), energy1, no shadow maps; never follows camera','outline':False,'color_shading':'EASE broad .10..65 illumination remap to .82/.85/.90..1 multiplier; no palette edits, no hard shadow threshold','clay':'neutral matte Principled + constant .15 emission; specular0'},'material_report':material_report,'renders':[],'limits':['Review only; no final acceptance.','Reads supplied master directly; does not reassemble or save a changed blend.','No mesh edits, view-dependent geometry changes, image retouching, motion or physics work.','Soft NPR review excludes cast-shadow maps and outlines; clay exposes shape with continuous diffuse illumination.','Source palette and source face/eye graphs retained; geometry defects remain.']}
    # Check every view before rendering: camera changes must never alter evaluated geometry.
    for angle in a.angles:
        yaw=math.radians(angle);cam.location=center+Vector((4*math.cos(pitch)*math.cos(yaw),4*math.cos(pitch)*math.sin(yaw),4*math.sin(pitch)))
        cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();bpy.context.view_layer.update()
        signature=geom_hash(s,True)
        if signature['aggregate_sha256']!=base_eval['aggregate_sha256']:
            raise RuntimeError('Evaluated geometry changed with camera; review aborted instead of rendering inconsistent views.')
        for mode in ('color','clay'):
            bpy.context.view_layer.material_override=None
            for slot,link,mat in slots:
                if mode=='clay':slot.link='OBJECT';slot.material=clay
                else:
                    slot.link=link
                    if link=='OBJECT':slot.material=mat
            bpy.context.view_layer.update()
            mode_signature=geom_hash(s,True)
            if mode_signature['aggregate_sha256']!=base_eval['aggregate_sha256']:
                raise RuntimeError('Evaluated geometry changed after color/clay material substitution; review aborted.')
            path=out/f'{mode}-{angle:03}.png';s.render.filepath=str(path);bpy.ops.render.render(write_still=True)
            manifest['renders'].append({'mode':mode,'angle_degrees':angle,'camera_location':list(cam.location),'camera_rotation_euler':list(cam.rotation_euler),'evaluated_geometry_sha256':mode_signature['aggregate_sha256'],'path':str(path),'sha256':sha_file(path)})
    bpy.context.view_layer.material_override=None
    for slot,link,mat in slots:
        slot.link=link
        if link=='OBJECT':slot.material=mat
    after=geom_hash(s);manifest['geometry_after']=after
    manifest['native_geometry_uv_colors_transforms_unchanged']=before==after
    manifest['source_file_unchanged']=file_before==sha_file(source)
    manifest['same_evaluated_geometry_all_views']=True
    if not manifest['native_geometry_uv_colors_transforms_unchanged'] or not manifest['source_file_unchanged']:
        raise RuntimeError('Source integrity check failed.')
    (out/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    print('REVIEW_OK',str(out/'manifest.json'))

if __name__=='__main__':
    a=arguments()
    try:import bpy
    except ImportError:sys.exit(launch(a))
    render_review(a)
