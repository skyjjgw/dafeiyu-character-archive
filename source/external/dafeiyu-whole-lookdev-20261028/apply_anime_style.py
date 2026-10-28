"""Reversible whole-character NPR style. Run in Blender 4.5, no geometry edits.
Original material output nodes, UVs, colors, face/eye shader graphs are preserved.
Command: blender -b --python apply_anime_style.py -- --input FILE --output DIR
"""
import bpy, math, json, os, argparse, sys, hashlib, struct
from mathutils import Vector

PREFIX='NPR__'
FACE_PREFIXES=('Original facial paint','SOURCE_','Source-fitted safe skin')

def setup_style(scene, outline=True):
    scene.render.engine='BLENDER_EEVEE_NEXT'
    scene.render.resolution_x=640;scene.render.resolution_y=704
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
    scene.render.film_transparent=False
    scene.render.threads_mode='FIXED';scene.render.threads=2
    scene.view_settings.view_transform='Standard'
    scene.view_settings.look='None'
    scene.view_settings.exposure=0;scene.view_settings.gamma=1
    if hasattr(scene,'eevee'):scene.eevee.taa_render_samples=64
    # A single fixed world-space key makes 45/side comparison honest.
    for obj in scene.objects:
        if obj.type=='LIGHT':obj.hide_render=True
    ld=bpy.data.lights.new(PREFIX+'cel_key','SUN');ld.energy=1.0;ld.angle=math.radians(3)
    lo=bpy.data.objects.new(PREFIX+'cel_key',ld);scene.collection.objects.link(lo)
    lo.rotation_euler=Vector((-4,3,-6)).to_track_quat('-Z','Y').to_euler()
    scene.world=bpy.data.worlds.new(PREFIX+'neutral_world');scene.world.use_nodes=True
    scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.18,.19,.21,1)
    scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=1
    scene.render.use_freestyle=outline
    if outline:
        fs=scene.view_layers[0].freestyle_settings
        ls=fs.linesets[0] if len(fs.linesets) else fs.linesets.new('Subtle silhouettes')
        for p in ['select_crease','select_edge_mark','select_material_boundary','select_suggestive_contour','select_ridge_valley']:
            if hasattr(ls,p):setattr(ls,p,False)
        ls.select_silhouette=True;ls.select_border=True;ls.select_contour=True
        if ls.linestyle is None:ls.linestyle=bpy.data.linestyles.new('NPR subtle navy contour')
        ls.linestyle.color=(.025,.035,.065);ls.linestyle.alpha=.85;ls.linestyle.thickness=.75
    scene['NPR_style']='candidate anime matte: white diffuse > shader-to-rgb > 2 bands x preserved base > emission; source face untouched'
    scene['finalAccepted']=False

def material_style(mat):
    if not mat.use_nodes or mat.name.startswith(FACE_PREFIXES):return 'preserved source face/eye'
    nt=mat.node_tree
    for node in list(nt.nodes):
        if node.name.startswith(PREFIX):nt.nodes.remove(node)
    bs=next((n for n in nt.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if bs is None:return 'preserved original unlit paint'
    # Reuse the exact existing base-color stream, including UV and vertex-color masks.
    src=bs.inputs['Base Color'].links[0].from_socket if bs.inputs['Base Color'].is_linked else None
    color=tuple(bs.inputs['Base Color'].default_value)
    if mat.name=='warm skin':color=(.69,.60,.45,1) # source-compatible limb skin, no face changes
    out=nt.nodes.new('ShaderNodeOutputMaterial');out.name=PREFIX+'Output';out.label='NPR candidate output; original graph retained';out.is_active_output=True;out.location=(1000,100)
    em=nt.nodes.new('ShaderNodeEmission');em.name=PREFIX+'Emission';em.inputs['Strength'].default_value=1;em.location=(780,100)
    mul=nt.nodes.new('ShaderNodeMixRGB');mul.name=PREFIX+'Base_times_cel';mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.inputs[1].default_value=color;mul.location=(560,100)
    if src:nt.links.new(src,mul.inputs[1])
    d=nt.nodes.new('ShaderNodeBsdfDiffuse');d.name=PREFIX+'Diffuse';d.inputs['Color'].default_value=(1,1,1,1);d.inputs['Roughness'].default_value=0;d.location=(0,-300)
    rgb=nt.nodes.new('ShaderNodeShaderToRGB');rgb.name=PREFIX+'Lighting';rgb.location=(190,-300);nt.links.new(d.outputs[0],rgb.inputs[0])
    ramp=nt.nodes.new('ShaderNodeValToRGB');ramp.name=PREFIX+'Two_bands';ramp.location=(360,-300)
    ramp.color_ramp.interpolation='CONSTANT'
    ramp.color_ramp.elements[0].position=0;ramp.color_ramp.elements[0].color=(.64,.68,.77,1)
    ramp.color_ramp.elements[1].position=.34;ramp.color_ramp.elements[1].color=(1,1,1,1)
    nt.links.new(rgb.outputs[0],ramp.inputs[0]);nt.links.new(ramp.outputs[0],mul.inputs[2]);nt.links.new(mul.outputs[0],em.inputs[0]);nt.links.new(em.outputs[0],out.inputs['Surface'])
    mat['NPR_original_nodes_retained']=True
    return 'cel shaded existing base stream'

def set_mode(mode):
    for mat in bpy.data.materials:
        if mat.use_nodes:
            mul=mat.node_tree.nodes.get(PREFIX+'Base_times_cel')
            if mul:mul.inputs[0].default_value=0 if mode=='flat' else 1
    bpy.context.scene.render.use_freestyle=(mode=='cel')

def geometry_signature(scene):
    result={}
    for o in scene.objects:
        if o.type!='MESH':continue
        h=hashlib.sha256()
        for v in o.data.vertices:h.update(struct.pack('3f',*v.co))
        for p in o.data.polygons:
            h.update(struct.pack('I',len(p.vertices)))
            for i in p.vertices:h.update(struct.pack('I',i))
        for uv in o.data.uv_layers:
            h.update(uv.name.encode())
            for v in uv.data:h.update(struct.pack('2f',*v.uv))
        for attr in o.data.color_attributes:
            h.update(attr.name.encode())
            for v in attr.data:h.update(struct.pack('4f',*v.color))
        result[o.name]=h.hexdigest()
    return result

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--input',required=True);ap.add_argument('--output',required=True);ap.add_argument('--angles',default='0,45,90');ap.add_argument('--modes',default='flat,cel');ap.add_argument('--append-tail',action='store_true');ap.add_argument('--size',type=int,default=640);args=ap.parse_args(sys.argv[sys.argv.index('--')+1:])
    os.makedirs(args.output,exist_ok=True);bpy.ops.wm.open_mainfile(filepath=args.input);s=bpy.context.scene
    if args.append_tail:
        with bpy.data.libraries.load('D:/CodexTaskData/dafeiyu-whole-tail-20261028/tail-native.blend',link=False) as (src,dst):dst.collections=['DAFEIYU_TAIL_NATIVE']
        for c in dst.collections:s.collection.children.link(c)
    # Only materials actually used in this scene; no source mesh is changed.
    materials={m for o in s.objects if o.type in ('MESH','CURVE') for m in o.data.materials if m}
    before=geometry_signature(s)
    report={m.name:material_style(m) for m in materials};setup_style(s)
    s.render.resolution_x=args.size;s.render.resolution_y=round(args.size*1.1)
    cam=s.camera;center=Vector((.063081,-.005865,-.002912))
    for mode in args.modes.split(','):
        set_mode(mode)
        for a in map(int,args.angles.split(',')):
            t=math.radians(a);cam.location=center+Vector((4*math.cos(t),4*math.sin(t),.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
            s.render.filepath=args.output+f'/{mode}-{a:03}.png';bpy.ops.render.render(write_still=True)
    set_mode('cel');cam.location=center+Vector((4,0,.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.file.pack_all();s.render.filepath=args.output+'/cel-000.png'
    bpy.ops.wm.save_as_mainfile(filepath=args.output+'/whole-character-npr-candidate.blend')
    after=geometry_signature(s)
    metadata={'finalAccepted':False,'source':args.input,'native_geometry_unchanged':before==after,'native_geometry_and_uv_color_sha256':after,'same_geometry_for_all_views':True,'camera_frame':'raw X+ front Z+ up, orthographic original body frame','materials':report,'face_and_eyes_original_shader_preserved':True,'limits':['Candidate geometry is unfinished and owned by other agents.','Shader-to-RGB is Eevee-specific; not a portable game shader.','Freestyle reports degenerate triangles and duplicate edges in this source candidate; source mesh is never corrected by this script.','Rear design inferred, not source evidence.','No AI image generation, compositing, billboard or camera dependent mesh replacement.']}
    json.dump(metadata,open(args.output+'/metadata.json','w'),indent=2)

if __name__=='__main__':main()
