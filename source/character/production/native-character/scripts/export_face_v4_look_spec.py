"""Read-only extraction of frozen native face-v4 look/rig contract for runtime.
Run Blender with face-v4.blend open. Does not save or change that .blend.
"""
import bpy, json, math, hashlib, ast
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
BLEND=ROOT/'face-v4.blend'
SOURCE=ROOT/'scripts/build_face_v4.py'
MANIFEST=json.loads((ROOT/'face-v4-manifest.json').read_text(encoding='utf-8'))
blend_hash=hashlib.sha256(BLEND.read_bytes()).hexdigest()
script_hash=hashlib.sha256(SOURCE.read_bytes()).hexdigest()
assert blend_hash==MANIFEST['blend_sha256'] and script_hash==MANIFEST['build_script_sha256']
assert Path(bpy.data.filepath).resolve()==BLEND.resolve()

def linear(h):
    values=[int(h.lstrip('#')[i:i+2],16)/255 for i in (0,2,4)]
    return [v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in values]
def color(h):return {'srgb_hex':h,'linear_rgb':linear(h)}
def arr(value):
    try:return [float(x)for x in value]
    except TypeError:return value
def matrix(m):return [[float(x)for x in row]for row in m]

source_text=SOURCE.read_text(encoding='utf-8');tree=ast.parse(source_text)
functions={n.name:{'line':n.lineno,'sha256':hashlib.sha256(ast.get_source_segment(source_text,n).encode()).hexdigest()}for n in tree.body if isinstance(n,ast.FunctionDef)}
rig=bpy.data.objects['FaceRig']
head=next(o for o in bpy.data.objects if o.name.startswith('HeadSkin'))
skin=next(m for m in head.data.materials if m.name.startswith('Face /'))
lip=next(m for m in head.data.materials if m.name.startswith('Lips /'))

def graph(material):
    n=material.node_tree.nodes;l=material.node_tree.links
    ramps=[];mixes=[]
    for node in n:
        if node.type=='VALTORGB':ramps.append({'label':node.label,'interpolation':node.color_ramp.interpolation,'elements':[{'position':float(e.position),'linear_rgba':arr(e.color)}for e in node.color_ramp.elements]})
        if node.type=='MIX_RGB'and node.label:
            strength=None
            if node.inputs[0].is_linked:
                factor=node.inputs[0].links[0].from_node
                if factor.type=='MATH'and factor.operation=='MULTIPLY'and not factor.inputs[1].is_linked:strength=float(factor.inputs[1].default_value)
            mixes.append({'label':node.label,'blend_type':node.blend_type,'target_linear_rgba':arr(node.inputs[2].default_value),'strength':strength})
    return {'material':material.name,'nodes':len(n),'links':len(l),'image_texture_nodes':sum(node.type=='TEX_IMAGE'for node in n),'ramps':ramps,'labelled_mix_layers':mixes}

def uv_fit(obj):
    """Fit the actual native UV sphere loop values, including seam duplicates."""
    me=obj.data;uv=me.uv_layers.active
    minimum=Vector([min(v.co[a]for v in me.vertices)for a in range(3)])
    maximum=Vector([max(v.co[a]for v in me.vertices)for a in range(3)])
    center=(minimum+maximum)*.5;half=(maximum-minimum)*.5
    samples=[]
    for loop in me.loops:
        p=me.vertices[loop.vertex_index].co
        q=Vector([(p[a]-center[a])/half[a]for a in range(3)])
        tex=uv.data[loop.index].uv
        if abs(q.z)<.95:samples.append((float(tex.x),float(tex.y),q))
    fits=[]
    for direction in [-1,1]:
        phases=[math.atan2(q.y,q.x)-direction*math.tau*u for u,v,q in samples]
        phase=math.atan2(sum(math.sin(a)for a in phases),sum(math.cos(a)for a in phases))
        for z_sign in [-1,1]:
            errors=[]
            for u,v,q in samples:
                r=math.sin(math.pi*v);angle=direction*math.tau*u+phase
                actual=Vector((r*math.cos(angle),r*math.sin(angle),z_sign*math.cos(math.pi*v)))
                errors.append((actual-q).length)
            fits.append({'u_direction':direction,'phase_radians':phase,'z_cos_sign':z_sign,'maximum_unit_sphere_error':max(errors),'mean_unit_sphere_error':sum(errors)/len(errors)})
    result=min(fits,key=lambda f:f['mean_unit_sphere_error'])
    result.update({'samples':len(samples),'source_uv_layer':uv.name,'local_aabb_min':arr(minimum),'local_aabb_max':arr(maximum),'mesh_to_headroot_native_rest':matrix(obj.matrix_world)})
    assert result['maximum_unit_sphere_error']<.0001,result
    return result

palette=[(0,'#8eafbc'),(.15,'#6092ae'),(.33,'#315f8c'),(.53,'#193b69'),(.76,'#112449'),(1,'#0b1631')]
petals=[('Diffuse lower blue atmosphere',[0,-.075],[.077,.060],.10,.48,'#75a2b8'),('Soft lower left light petal',[-.021,-.086],[.043,.038],.03,.44,'#b0cdd2'),('Soft lower right light petal',[.023,-.089],[.040,.034],.02,.42,'#c3d8d9'),('Faint joined lower petal light',[.001,-.100],[.031,.022],0,.24,'#cee0df')]
eyes={}
for side,params in {'L':{'radius':.2035,'depth':.233,'center':[-.258,.009],'iris_radii':[.094,.110],'offset_x':.014,'offset_z':-.008},'R':{'radius':.2025,'depth':.233,'center':[.263,.006],'iris_radii':[.092,.108],'offset_x':-.014,'offset_z':-.006}}.items():
    obj=next(o for o in bpy.data.objects if o.type=='MESH'and o.name.startswith('Eye.'+side+' /'))
    material=obj.data.materials[0];audit=graph(material);diameter=params['radius']*2;sign=-1 if side=='L'else 1
    params.update({'object':obj.name,'material':material.name,'diameter':diameter,'generated_center':[.5+params['offset_x']/diameter,.5+params['offset_z']/diameter], 'uv_to_native_unit_sphere':uv_fit(obj)})
    params['glints']=[{'center_from_iris_xz_m':[x,z],'radii_m':[rx,rz],'soft':.82,'strength':strength,**color(h)}for x,z,rx,rz,strength,h in [(sign*.022,.061,.031,.022,1,'#fffdf8'),(sign*.010,.072,.016,.011,.88,'#f5fbfb'),(sign*.006,.018,.0048,.0048,.92,'#eef8fb'),(-sign*.035,-.049,.006,.0041,.84,'#def0f2'),(-sign*.047,.033,.0032,.0041,.65,'#a7cbdd'),(sign*.051,.027,.0025,.003,.72,'#d6e7ed'),(sign*.050,-.041,.002,.0023,.65,'#bfd8e1')]]
    for glint in params['glints']:
        label='Source-measured glint '+str(params['glints'].index(glint)+1)
        actual=next(m for m in audit['labelled_mix_layers']if m['label']==label)
        assert max(abs(a-b)for a,b in zip(actual['target_linear_rgba'][:3],glint['linear_rgb']))<1e-6
        assert abs(actual['strength']-glint['strength'])<1e-6
    params['actual_node_audit']=audit
    eyes[side]=params

color_attributes={}
for name in ['FaceAlbedo','LipAlbedo']:
    attr=head.data.color_attributes[name]
    values=[list(d.color)for d in attr.data]
    color_attributes[name]={'domain':attr.domain,'storage_type':attr.data_type,'count':len(values),'rgba_min':[min(v[a]for v in values)for a in range(4)],'rgba_max':[max(v[a]for v in values)for a in range(4)]}

def drivers(data):
    animation=data.animation_data
    if not animation:return []
    return [{'data_path':f.data_path,'array_index':f.array_index,'expression':f.driver.expression,'variables':[{'name':v.name,'id':v.targets[0].id.name if v.targets[0].id else None,'path':v.targets[0].data_path}for v in f.driver.variables]}for f in animation.drivers]

shape_data=head.data.shape_keys
bones={name:{'parent':b.parent.name if b.parent else None,'matrix_local_native':matrix(b.matrix_local),'head_local':arr(b.head_local),'tail_local':arr(b.tail_local),'length':b.length,'deform':b.use_deform}for name,b in rig.data.bones.items()}
vg={g.name:{'affected_vertices':sum(any(vg.group==g.index and vg.weight>0 for vg in v.groups)for v in head.data.vertices)}for g in head.vertex_groups if g.name in ['FaceHead','Jaw']}

spec={
 'schema':'dafeiyu.face.look.v1','asset':'face-v4','status':'extracted_native_contract_runtime_translation_pending_actual_GPU_review',
 'source':{'blend':str(BLEND),'blend_sha256':blend_hash,'build_script':str(SOURCE),'build_script_sha256':script_hash,'read_only':True,'no_blend_save':True,'blender':bpy.app.version_string,'source_function_locations':{k:functions[k]for k in ['iris_material','native_toon','albedo','add_skin_paint','add_shapes','eye_inner','mouth_inner','body_weights','tube_object']}},
 'coordinates':{'native':'X right, -Y forward, Z up; HeadRoot origin eye line','godot':'X right, +Y up, +Z forward','native_to_godot_matrix3':[[1,0,0],[0,0,1],[0,-1,0]],'generated':'Per-eye undeformed primitive local AABB normalized 0..1. Do not use world coordinates or post-skin world normals.','uv_reconstruction':'q.xy=sin(pi*v_blender)*[cos(u_direction*2*pi*u+phase),sin(...)]; q.z=z_cos_sign*cos(pi*v_blender); Generated=(q+1)/2','uv_reconstruction_stage':'Prefer vertex-stage reconstruction and interpolate Generated to fragment, matching native ORCO interpolation over the actual sphere triangles.','gltf_uv':'Blender 4.5 exporter writes (u,1-v_blender); reconstruct v_blender=1-UV.y when importer preserves glTF TEXCOORD_0. Confirm once on actual exported eyes.','exporter_uv_evidence':'Blender 4.5 io_scene_gltf2/blender/exp/primitive_extract.py:1421-1422, uvs[:,1]*=-1 then +=1'},
 'eyes':eyes,
 'iris_algorithm':{'output':'Unshaded/emission linear RGB on true closed eye sphere, cull back, no next-pass outline','helpers':{'ellipse_distance_squared':'((g.x-cx)/rx)^2+((g.z-cz)/rz)^2','spot':'1-smoothstep(soft*soft,1.04,ellipse_distance_squared)','paint':'mix(current,linear_color,spot*strength), in listed sequence','soft_range':'Clamped smoothstep map, not a hard disc'},'center_and_units':'cx/cz=eyes[side].generated_center; all per-layer offsets and radii in metres divide by eye diameter before using Generated','iris_r2':'ellipse_distance_squared around generated_center, radii=iris_radii/diameter','mask':'(1-smoothstep(.985,1.025,iris_r2))*float(Generated.y<.5)','vertical_ramp_input':'(Generated.z-(cz-iris_radius_z/diameter))/(2*iris_radius_z/diameter)','palette':[{'position':p,**color(h)}for p,h in palette],'palette_interpolation':eyes['L']['actual_node_audit']['ramps'][0]['interpolation'],'limbal_edge':{'input':'sqrt(iris_r2)','mask':'smoothstep(.79,1,r)','strength':.65,**color('#0b1939')},'lower_petals':[{'label':label,'center_from_iris_xz_m':center,'radii_m':radii,'soft':soft,'strength':strength,**color(h)}for label,center,radii,soft,strength,h in petals],'pupil_halo':{'center_from_iris_xz_m':[0,-.003],'radii_m':[.045,.064],'soft':.40,'strength':.25,**color('#17395d')},'pupil':{'center_from_iris_xz_m':[0,-.006],'radii_m':[.025,.044],'soft':.91,'strength':1.,**color('#0c1e36')},'glint_order':'Use eyes[side].glints after halo/pupil. Upper two broad overlapping ovals, lower-inner tiny reflection, then restrained flecks.','sclera':{'base':color('#e4ded2'),'upper_tone':color('#a3a4ae'),'mask':'smoothstep(.61,.80,Generated.z)','strength':.46},'final_mix':'mix(sclera,iris_painted,iris_mask)','sequence':['vertical palette','limbal_edge','lower_petals in order','pupil_halo','pupil','per-eye glints in order','mix over sclera with front iris mask']},
 'skin':{'material':skin.name,'attributes':color_attributes,'color_space':'Source FLOAT_COLOR .color values are linear. Carry glTF COLOR_0 as linear; convert sRGB hex constants once.','base_rule':'When FaceAlbedo/COLOR_0 is present, it REPLACES the fallback albedo; do not multiply it by fixed calibrated skin RGB.','fallback':color('#cdc1b1'),'vertex_albedo':{'formula':'mix(base,blush,0.74*gauss(abs(x),.30,.16)*gauss(z,-.145,.115)*smoothstep(.12,.34,depth))','gauss':'exp(-((x-center)/width)^2)','base':color('#cdc1b1'),'blush':color('#d1a18e')},'rest_surface_paint':{'coordinate':'Unchanging head rest x,z,depth, not world position after Jaw/gaze. Source Generated head AABB maps back to rest x/z.','front_mask':'Generated.y<.58','nose_tip':{'center_xz':[.066,-.068],'radii':[.0067,.0050],'distance_smoothstep':[.25,1.2],'strength':.82,**color('#f2e7d8')},'nostril':{'center_xz':[.071,-.084],'radii':[.002,.0033],'distance_smoothstep':[.15,1.15],'strength':.48,**color('#9e7a69')},'cheek_hatch':{'patch_center_absx_z':[.302,-.190],'radii':[.100,.033],'distance_smoothstep':[.50,1.15],'stripe':'fract((x-.30+.40*(z+.190))/.020)<.10','strength':.18,**color('#aa8073')}},'shade_rule':'Source NPR is diffuse-white -> ShaderToRGB -> EASE ramp -> MULTIPLY albedo -> emission. Preserve vertex albedo through runtime cel shading; do not overwrite it with generic uniform calibration.','actual_node_audit':graph(skin),'lip_rule':{'material':lip.name,'attribute':'LipAlbedo','formula':'mix(FaceAlbedo,#745448 linear,0.90*smoothstep(.014,.022,abs(rest_x-.045)))','central_gap':'Mask creates two short interrupted mouth strokes.','export_requirement':'LipAlbedo is a separate named attribute on the same continuous mesh. Ensure material-specific COLOR data survives export, or reproduce rest-x ink mask on the native Lips material; do not assume generic COLOR_0 is LipAlbedo.'}},
 'ink_geometry':{'outline_policy':'Source face-v4 has no inverted hull outline. Lashes/lids/brows/lip ink are already real volume/material; disable additional outline on these meshes and eye globes.','upper_lash':{'material':color('#1d1922'),'width_m':'(.0015+sin(pi*u)^.44*(.045-.031*u)+.005*exp(-((u-.16)/.12)^2))*(1-.60*blink)','u':'t for L, 1-t for R','depth_thickness_m':.006,'cross_segments':8},'lower_lid':{'material':color('#756058'),'width_m':'.0007+.001*sin(pi*t)','depth_thickness_m':.002},'brow':{'material':color('#94796c'),'width_m':'.0015+.005*sin(pi*t)^.6','depth_thickness_m':.0045,'path':'x=eye_center_x+mix(-.12,.12,t); z=(.178 L/.188 R)+.015*sin(pi*t)+sad*(.043*(t L/1-t R)-.005)+.010*smile; depth=front_depth(x,z)+.008'},'outer_wing':{'width_m':'.020*(1-t)^1.45+.0003','depth_thickness_m':.006,'path_offset':'sign*.030*t in x; (.031*t+.006*sin(pi*t))*(1-.35*blink) in z; +.004 front'},'upper_outer_flick':{'width_m':'.008*(1-t)+.0004','depth_thickness_m':.0055,'path_offset':'sign*.010*t x; .023*t*(1-.75*blink) z; +.006 front'}},
 'rig':{'root':'HeadRoot','control_object':rig.name,'bones':bones,'actual_bone_drivers':drivers(rig),'head_vertex_groups':vg,'shape_keys':list(shape_data.key_blocks.keys()),'actual_shape_drivers':drivers(shape_data),'evaluation_order':'Morph deltas in native mesh local space, then standard skeleton skinning. Do not double-apply Jaw to already-skinned morph output.','weights':{'blink':'b=clamp(blink,0,1)','blink_sphere_inbetween':'4*b*(1-b); required to follow globe at half blink','phonemes':'aa/ee/oh each divided by max(1,aa+ee+oh)','lookUp':'max(0,gazeY)','lookDown':'max(0,-gazeY)','corrective_blink_smile':'b*smile','corrective_blink_sad':'b*sad','corrective_blink_lookUp':'b*max(0,gazeY)','corrective_blink_lookDown':'b*max(0,-gazeY)','squintL_R':'Independent 0..1 neutral-asymmetry skin controls; do not bake source perspective into rest apertures.','corrective_blink_squintL':'b*squintL','corrective_blink_squintR':'b*squintR'},'ocular_mapping':'Use actual Eye.L/R native rest basis matrices. Native local Euler driver X=.20*gazeY; Z=.30*gazeX, Y locked. Convert basis to Godot once; do not guess global rotation axes.','jaw_mapping':'Use actual driver expression and Jaw rest basis below; angle limits local X ±.26, local Y/Z locked for Jaw. Tongue driver is real bone X=.035*aa.'},
 'runtime_acceptance':['Verify L/R-specific iris parameters on actual v8 eye surfaces, with downward blue-white petals and broad upper catchlights not vertically flipped.','Compare native face-v4 context front/threequarter/side under consistent light; generic v2 iris or uniform skin does not count as v4 look transfer.','Actual GPU readback at blink 0,.25,.5,.75,1 with smile/sad/squint and gaze; preserve all corrective targets.','Test real Jaw/phoneme and upper/lower teeth/tongue skinning; closed soft smile has no automatic white teeth slit.','Check cull/outline separately; no duplicate hull around already-solid lash ink.','Do not treat shader parse success or numeric closure as artistic acceptance.'],
 'frozen_blend_unchanged':hashlib.sha256(BLEND.read_bytes()).hexdigest()==blend_hash
}
spec['skin']['raw_gltf_observation']={'artifact':'Root actual audit of complete v7 GLB, not the frozen native .blend','head_primitives':3,'COLOR_0':{'component_type':'UNSIGNED_BYTE','observed':'constant white; not FaceAlbedo'},'COLOR_1':{'component_type':'UNSIGNED_SHORT normalized','semantic':'native FaceAlbedo'},'COLOR_2':{'component_type':'UNSIGNED_SHORT normalized','semantic':'native LipAlbedo'},'warning':'Named native attributes do not automatically become semantic COLOR_0. Never pretend Godot has a standard COLOR_1 shader input.'}
spec['skin']['normalized_artifact_contract']={'producer':'Final assembler primitive-by-material metadata normalization','Face / material':'COLOR_0 accessor replaced with the native FaceAlbedo accessor (raw v7 COLOR_1)','Lips / material':'COLOR_0 accessor replaced with the native LipAlbedo accessor (raw v7 COLOR_2)','Mouth / material':'Keep oral-interior material; do not apply the skin replacement or generic skin calibration','binary_buffer':'Unmodified; accessor references remapped in glTF metadata','manifest_contract':'vertexAlbedoRule=replace plus actual final artifact audit. Only this normalized final artifact guarantees COLOR_0 semantics.'}
spec['skin']['base_rule']='Only on the final normalized artifact whose manifest declares vertexAlbedoRule=replace: Face COLOR_0 is FaceAlbedo and Lips COLOR_0 is LipAlbedo. They REPLACE fallback albedo, never multiply by fixed skin RGB. Raw v7 COLOR_0 is white and must first be remapped by the assembler.'
spec['skin']['lip_rule']['export_requirement']='Final assembler remaps the native LipAlbedo accessor (raw v7 COLOR_2) to standard COLOR_0 on the Lips primitive, and FaceAlbedo (raw v7 COLOR_1) on the Face primitive. Verify the normalized artifact audit/manifest; do not read nonexistent COLOR_1 shader APIs. Oral interior retains its own material.'
output=ROOT/'face-v4-look-spec.json';output.write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('FACE_V4_LOOK_SPEC '+json.dumps({'path':str(output),'bytes':output.stat().st_size,'blend_sha256':blend_hash,'uv_errors':{s:e['uv_to_native_unit_sphere']['maximum_unit_sphere_error']for s,e in eyes.items()},'blend_unchanged':spec['frozen_blend_unchanged']}))
