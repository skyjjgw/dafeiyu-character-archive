"""Independent v4 identity sculpt: frontal anatomy and layered ocular light.

Project Blender 4.5:
  blender --background --factory-startup --python-exit-code 1 --python build_face_v4.py -- --context-review
The original cover is a measurement reference, not projected onto this model.
"""
import bpy
import math
import json
import hashlib
import time
import sys
from pathlib import Path
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

ROOT = Path(__file__).resolve().parents[1]
BLEND = ROOT / 'face-v4.blend'
MANIFEST = ROOT / 'face-v4-manifest.json'
RENDERS = ROOT / 'renders' / 'face-v4'
FROZEN_PATHS = [ROOT/'face-v2.blend',ROOT/'face-v3.blend',ROOT/'face-v3-manifest.json',ROOT/'scripts/build_face_v3.py',ROOT/'dafeiyu-native-v4-study.blend']
FROZEN_HASHES = {str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in FROZEN_PATHS if p.is_file()}
START = time.perf_counter()
ZERO = dict(blink=0., aa=0., ee=0., oh=0., smile=0., sad=0., cheek=0., lookUp=0., lookDown=0., squintL=0., squintR=0.)
PRIMARY_KEYS = tuple(ZERO)
MIN_Y, MAX_Y = -.382, .64

def clamp(x, lo=0., hi=1.): return max(lo, min(hi, x))
def mix(a, b, t): return a + (b-a)*t
def smooth(x):
    x = clamp(x)
    return x*x*(3-2*x)
def gauss(x, center, width): return math.exp(-((x-center)/width)**2)
def xyz(x, y, depth): return Vector((x, -depth, y))
def srgb(v): return v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4
def color(hexcode):
    return tuple(srgb(int(hexcode.lstrip('#')[i:i+2],16)/255) for i in (0,2,4))

def pchip(points):
    h=[points[i+1][0]-points[i][0] for i in range(len(points)-1)]
    d=[(points[i+1][1]-points[i][1])/h[i] for i in range(len(h))]
    m=[d[0]]+[0.]*(len(points)-2)+[d[-1]]
    for i in range(1,len(points)-1):
        if d[i-1]*d[i] > 0:
            w1,w2=2*h[i]+h[i-1],h[i]+2*h[i-1]
            m[i]=(w1+w2)/(w1/d[i-1]+w2/d[i])
    def evaluate(x):
        if x<=points[0][0]: return points[0][1]
        if x>=points[-1][0]: return points[-1][1]
        lo,hi=0,len(points)-1
        while hi-lo>1:
            mid=(lo+hi)//2
            if points[mid][0]<=x: lo=mid
            else: hi=mid
        t=(x-points[lo][0])/h[lo]; t2=t*t;t3=t2*t
        return (2*t3-3*t2+1)*points[lo][1]+(t3-2*t2+t)*h[lo]*m[lo]+(-2*t3+3*t2)*points[hi][1]+(t3-t2)*h[lo]*m[hi]
    return evaluate

PROFILE = pchip([(-.382,.300),(-.380,.326),(-.376,.348),(-.370,.363),(-.363,.374),(-.350,.384),(-.331,.392),(-.285,.415),(-.247,.433),(-.218,.446),(-.204,.450),(-.188,.447),(-.168,.445),(-.140,.450),(-.108,.468),(-.090,.481),(-.076,.484),(-.055,.463),(-.025,.445),(-.013,.437),(.083,.416),(.242,.407),(.36,.385),(.50,.280),(.60,.130),(.64,.015)])
BASE = pchip([(-.382,.300),(-.380,.320),(-.376,.339),(-.370,.354),(-.363,.363),(-.331,.370),(-.267,.395),(-.204,.416),(-.140,.429),(-.076,.436),(0,.441),(.083,.420),(.242,.407),(.36,.385),(.50,.280),(.60,.130),(.64,.015)])
SEAM = pchip([(-.382,.300),(-.380,.312),(-.376,.322),(-.370,.327),(-.363,.328),(-.331,.267),(-.267,.165),(-.204,.090),(-.140,.040),(-.076,.018),(.05,.015),(.64,.015)])
REAR = pchip([(-.382,0),(-.363,.090),(-.331,.150),(-.267,.225),(-.140,.300),(0,.330),(.20,.340),(.40,.280),(.60,.120),(.64,0)])
AXIS = pchip([(-.382,.023),(-.267,.033),(-.204,.035),(-.076,.066),(.05,.025),(.20,0),(.64,0)])
OUTLINE=[]
for a,b,c,d in [((0,.64),(.39,.64),(.60,.44),(.60,.20)),((.60,.20),(.615,.035),(.552,-.133),(.405,-.255)),((.405,-.255),(.292,-.348),(.128,-.379),(.023,-.382))]:
    for i in range(0 if not OUTLINE else 1,97):
        t=i/96;q=1-t
        OUTLINE.append((q**3*a[0]+3*q*q*t*b[0]+3*q*t*t*c[0]+t**3*d[0],q**3*a[1]+3*q*q*t*b[1]+3*q*t*t*c[1]+t**3*d[1]))
def center_at(y): return .023*smooth((-y-.1)/.282)
def width_at(y):
    if y<=MIN_Y+1e-9 or y>=MAX_Y-1e-9:return 0.
    lo,hi=0,len(OUTLINE)-1
    while hi-lo>1:
        mid=(lo+hi)//2
        if OUTLINE[mid][1]>=y:lo=mid
        else:hi=mid
    a,b=OUTLINE[lo],OUTLINE[hi]
    return max(0.,mix(a[0],b[0],(a[1]-y)/(a[1]-b[1]))-center_at(y))
def front_depth(x,y):
    y=clamp(y,MIN_Y,MAX_Y);w=width_at(y);cx=center_at(y)
    if w<1e-8:return SEAM(y)
    u=clamp((x-cx)/w,-1,1)
    if abs(u)>.999999:return SEAM(y)
    curve=max(0.,1-u*u)**.25;base=SEAM(y)+(BASE(y)-SEAM(y))*curve
    axis=clamp(AXIS(y),cx-w,cx+w);au=clamp((axis-cx)/w,-1,1)
    at_axis=SEAM(y)+(BASE(y)-SEAM(y))*max(0.,1-au*au)**.25
    fw=mix(.095,.160,smooth((-.105-y)/.145))
    available=(cx+w-axis) if x>=axis else (axis-(cx-w))
    q=(x-axis)/available if available>1e-8 else 0
    kernel=math.exp(-((x-axis)/fw)**4)*math.sqrt(max(0.,1-q*q))
    return base+(PROFILE(y)-at_axis)*kernel
def back_depth(x,y):
    w=width_at(y);u=clamp((x-center_at(y))/w,-1,1) if w>1e-8 else 0
    return SEAM(y)-REAR(y)*math.sqrt(max(0.,1-u*u))

def rounded_cap_y(y):
    t=(y-MIN_Y)/.025
    return y+.025*(math.sqrt(t)-t)*(1-smooth(t)) if 0<t<1 else y

# The final 2.5 cm of the depth profile uses a rounded closing cap rather
# than two finite-slope planes meeting at a pointed lower jaw.
_front_depth,_back_depth=front_depth,back_depth
def front_depth(x,y):
    yy=rounded_cap_y(y)
    if yy==y:return _front_depth(x,y)
    w=width_at(y);cx=center_at(y);u=clamp((x-cx)/w,-1,1) if w>1e-8 else 0
    sample_x=center_at(yy)+width_at(yy)*u
    return _front_depth(sample_x,yy)
def back_depth(x,y):
    yy=rounded_cap_y(y)
    if yy==y:return _back_depth(x,y)
    w=width_at(y);cx=center_at(y);u=clamp((x-cx)/w,-1,1) if w>1e-8 else 0
    return _back_depth(center_at(yy)+width_at(yy)*u,yy)

def source_point(px,py):
    c,s=math.cos(.06),math.sin(.06)
    return ((c*(px-815)-s*(py-583))/775,(-s*(px-815)-c*(py-583))/775)
def sampled_y(points,x):
    for a,b in zip(points,points[1:]):
        if x<=b[0]:return mix(a[1],b[1],clamp((x-a[0])/(b[0]-a[0])))
    return points[-1][1]
TRACES=[
    ([[499,607],[516,557],[542,521],[578,496],[618,487],[656,492],[689,514],[709,551],[724,598]],[[499,607],[519,634],[550,659],[591,677],[639,682],[684,666],[713,642],[724,598]]),
    ([[916,573],[926,529],[948,495],[978,474],[1010,470],[1040,481],[1067,507],[1088,541],[1104,592]],[[916,573],[924,597],[940,622],[971,648],[1008,651],[1057,650],[1083,630],[1104,592]])]
EYES=[]
for name,cx,cy,rx,irisx,irisy,offset,trace in [('L',-.258,.009,.2035,.094,.110,.014,TRACES[0]),('R',.263,.006,.2025,.092,.108,-.014,TRACES[1])]:
    # Preserve the source's different left/right apertures, then reduce the
    # domed surprise-eye interpretation. Corners, crest and lower lid are
    # sculpted independently; this is actual socket/skin geometry, not ink.
    raw_upper,raw_lower=([source_point(*p) for p in row] for row in trace)
    target_width=.286 if name=='L' else .277
    target_height=.230 if name=='L' else .225
    crest_scale=.900 if name=='L' else .855
    lower_scale=.975 if name=='L' else .960
    def reshape(points,top):
        result=[]
        x0,y0=raw_upper[0];x1,y1=raw_upper[-1]
        for x,y in points:
            u=clamp((x-x0)/(x1-x0));chord=mix(y0,y1,u)
            # Remove the image's camera foreshortening/roll from anatomy.
            # A small mirrored outer-corner lift remains in frontal rest.
            outer,inner=.002,-.011
            new_chord=mix(outer,inner,u) if name=='L' else mix(inner,outer,u)
            y=new_chord+(y-chord)*(crest_scale if top else lower_scale)
            x=cx+target_width*(u-.5)
            result.append((x,y))
        return result
    upper,lower=reshape(raw_upper,True),reshape(raw_lower,False)
    hi=max(p[1]for p in upper);lo=min(p[1]for p in lower);mid=(hi+lo)/2
    def vertical_normalize(points):return [(x,cy+(y-mid)*target_height/(hi-lo))for x,y in points]
    upper,lower=vertical_normalize(upper),vertical_normalize(lower)
    EYES.append(dict(name=name,cx=cx,cy=cy,radius=rx,depth=.233,upper=upper,lower=lower,upper_curve=pchip(upper),lower_curve=pchip(lower),minx=upper[0][0],maxx=upper[-1][0],irisx=irisx,irisy=irisy,offset=offset,iris_center_y=-.008 if name=='L' else -.006))
def eye_inner(e,theta,state):
    u=math.cos(theta);arc=math.sqrt(max(0.,1-u*u));top=math.sin(theta)>=0
    x=mix(e['minx'],e['maxx'],(u+1)/2)
    y=(e['upper_curve'] if top else e['lower_curve'])(x)
    y+=(-.026 if top else .037)*state['smile']*arc
    if top:
        inner_direction=u if e['name']=='L' else -u
        y+=state['sad']*(-.008+.026*inner_direction)*arc
    chord=mix(e['upper'][0][1],e['upper'][-1][1],(u+1)/2)
    y=mix(y,chord,.48*state['squint'+e['name']])
    # Closed lash is a gentle asymmetric curve, never a horizontal bar.
    closed=chord+(.013+.014*state['smile'])*arc
    y=mix(y,closed,state['blink'])
    y+=(state['lookUp']*.014-state['lookDown']*.010)*(1-state['blink'])*arc
    d=e['depth']+math.sqrt(max(.0004,e['radius']**2-(x-e['cx'])**2-(y-e['cy'])**2))+.006
    return x,y,d

# Start a new asset, never an imported flat facial assemblage.
for obj in list(bpy.data.objects):bpy.data.objects.remove(obj,do_unlink=True)
for coll in list(bpy.data.collections):bpy.data.collections.remove(coll)
scene=bpy.context.scene
bpy.context.preferences.filepaths.save_version=0
asset=bpy.data.collections.new('Face_v4_EDITABLE');scene.collection.children.link(asset)
studio=bpy.data.collections.new('Face_v4_REVIEW_STUDIO');scene.collection.children.link(studio)
def link(obj,collection=asset):collection.objects.link(obj);return obj
headroot=link(bpy.data.objects.new('HeadRoot',None))
headroot['attachment']='Place origin at body Head bone world Z 2.155; X horizontal, -Y forward, Z up.'
rig_data=bpy.data.armatures.new('FaceRig / native deform and ocular controls')
rig=link(bpy.data.objects.new('FaceRig',rig_data));rig.parent=headroot;rig.show_in_front=True
bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
def bone(name,head,tail,parent=None,deform=True):
    b=rig_data.edit_bones.new(name);b.head=head;b.tail=tail;b.use_deform=deform
    if parent:b.parent=rig_data.edit_bones[parent]
    b.align_roll(Vector((0,0,1)));return b
bone('FaceHead',(0,0,0),(0,0,.25))
bone('Jaw',(0,.035,-.115),(0,-.20,-.23),'FaceHead')
for e in EYES:
    p=xyz(e['cx'],e['cy'],e['depth']);bone('Eye.'+e['name'],p,p+Vector((0,-.10,0)),'FaceHead',False)
bone('Tongue',(0,-.30,-.25),(0,-.36,-.25),'Jaw',False)
bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)
for name in ('blink','aa','ee','oh','smile','sad','cheek','jaw','gazeX','gazeY','squintL','squintR'):
    rig[name]=0.;rig.id_properties_ui(name).update(min=-1 if name.startswith('gaze') else 0,max=1,description='Continuous native face control')
def property_driver(owner,path,index,expression,variables):
    f=owner.driver_add(path,index) if index is not None else owner.driver_add(path)
    d=f.driver;d.type='SCRIPTED';d.expression=expression
    for key,prop in variables.items():
        var=d.variables.new();var.name=key;var.type='SINGLE_PROP';var.targets[0].id=rig;var.targets[0].data_path='["'+prop+'"]'
    return f
jaw=rig.pose.bones['Jaw'];jaw.rotation_mode='XYZ'
jaw_x=rig.data.bones['Jaw'].matrix_local.to_quaternion()@Vector((1,0,0))
jaw_sign=1 if jaw_x.x>=0 else -1
property_driver(jaw,'rotation_euler',0,f'{jaw_sign*.18}*min(1,max(jaw,aa*.75,ee*.25,oh*.65))',dict(jaw='jaw',aa='aa',ee='ee',oh='oh'))
for name in ['Jaw','Eye.L','Eye.R']:
    pb=rig.pose.bones[name];pb.rotation_mode='XYZ';c=pb.constraints.new('LIMIT_ROTATION');c.owner_space='LOCAL'
    c.use_limit_x=c.use_limit_y=c.use_limit_z=True
    c.min_x=-.26;c.max_x=.26;c.min_y=c.max_y=0;c.min_z=-.35;c.max_z=.35
    if name=='Jaw':c.min_z=c.max_z=0
for e in EYES:
    pb=rig.pose.bones['Eye.'+e['name']]
    property_driver(pb,'rotation_euler',0,'.20*gy',dict(gy='gazeY'))
    property_driver(pb,'rotation_euler',2,'.30*gx',dict(gx='gazeX'))

def native_toon(name,base,vertex=False,attribute='FaceAlbedo'):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color(base),1);m.use_nodes=True
    n,l=m.node_tree.nodes,m.node_tree.links;n.clear()
    output=n.new('ShaderNodeOutputMaterial');output.location=(700,0)
    rgb=n.new('ShaderNodeRGB');rgb.outputs[0].default_value=(*color(base),1);rgb.location=(-650,100)
    source=rgb.outputs[0]
    if vertex:
        attr=n.new('ShaderNodeVertexColor');attr.layer_name=attribute;attr.location=(-650,100);source=attr.outputs['Color']
    diffuse=n.new('ShaderNodeBsdfDiffuse');diffuse.inputs['Color'].default_value=(1,1,1,1);diffuse.location=(-650,-180)
    shader=n.new('ShaderNodeShaderToRGB');shader.location=(-430,-180);l.new(diffuse.outputs[0],shader.inputs[0])
    ramp=n.new('ShaderNodeValToRGB');ramp.label='Editable gentle cel bands';ramp.location=(-220,-160);ramp.color_ramp.interpolation='EASE'
    ramp.color_ramp.elements[0].position=.16;ramp.color_ramp.elements[0].color=(.72,.75,.80,1)
    ramp.color_ramp.elements[1].position=.72;ramp.color_ramp.elements[1].color=(1,1,1,1)
    l.new(shader.outputs[0],ramp.inputs[0])
    mul=n.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.location=(80,80)
    l.new(source,mul.inputs[1]);l.new(ramp.outputs[0],mul.inputs[2])
    emit=n.new('ShaderNodeEmission');emit.location=(430,0);l.new(mul.outputs[0],emit.inputs['Color']);l.new(emit.outputs[0],output.inputs[0])
    return m
skin=native_toon('Face / editable albedo and gentle NPR','#cdc1b1',True)
lip=native_toon('Lips / measured interrupted smile ink','#86675d',True,'LipAlbedo')
oral=native_toon('Mouth / real recessed interior','#59303b')
lashmat=native_toon('Lashes / solid warm navy charcoal','#1d1922')
browmat=native_toon('Brows / fine muted warm ink','#94796c')
lidmat=native_toon('Lids / fine muted lower edge','#756058')
tonguemat=native_toon('Tongue / soft rose','#bd777e')
teethmat=native_toon('Teeth / warm ivory','#eee5d6')
def math_node(nodes,links,op,a,b=None):
    n=nodes.new('ShaderNodeMath');n.operation=op
    for i,v in enumerate([a,b]):
        if v is None:continue
        if isinstance(v,(int,float)):n.inputs[i].default_value=v
        else:links.new(v,n.inputs[i])
    return n.outputs[0]
def soft_range(nodes,links,value,lo,hi,start=0,end=1):
    node=nodes.new('ShaderNodeMapRange');node.interpolation_type='SMOOTHSTEP';node.clamp=True
    links.new(value,node.inputs['Value']);node.inputs['From Min'].default_value=lo;node.inputs['From Max'].default_value=hi
    node.inputs['To Min'].default_value=start;node.inputs['To Max'].default_value=end
    return node.outputs['Result']
def ellipse_distance(nodes,links,x,z,cx,cz,rx,rz):
    xx=math_node(nodes,links,'DIVIDE',math_node(nodes,links,'SUBTRACT',x,cx),rx)
    zz=math_node(nodes,links,'DIVIDE',math_node(nodes,links,'SUBTRACT',z,cz),rz)
    return math_node(nodes,links,'ADD',math_node(nodes,links,'MULTIPLY',xx,xx),math_node(nodes,links,'MULTIPLY',zz,zz))
def paint_mix(nodes,links,source,mask,hexcode,strength=1,label=''):
    node=nodes.new('ShaderNodeMixRGB');node.label=label
    links.new(math_node(nodes,links,'MULTIPLY',mask,strength),node.inputs[0]);links.new(source,node.inputs[1]);node.inputs[2].default_value=(*color(hexcode),1)
    return node.outputs[0]
def layout_nodes(nodes):
    depths={node:0 for node in nodes}
    for _ in range(len(nodes)):
        for node in nodes:
            if any(socket.is_linked for socket in node.inputs):depths[node]=1+max(depths[link.from_node]for socket in node.inputs for link in socket.links)
    rows={}
    for node in nodes:
        depth=depths[node];index=rows.get(depth,0);rows[depth]=index+1;node.location=(depth*195,-index*150)
def iris_material(e):
    m=bpy.data.materials.new('Eye.'+e['name']+' / spherical iris, pupil and painted glints');m.use_nodes=True
    n,l=m.node_tree.nodes,m.node_tree.links;n.clear()
    tc=n.new('ShaderNodeTexCoord');sep=n.new('ShaderNodeSeparateXYZ');l.new(tc.outputs['Generated'],sep.inputs[0])
    def distance(cx,cz,rx,rz):return ellipse_distance(n,l,sep.outputs['X'],sep.outputs['Z'],cx,cz,rx,rz)
    def spot(cx,cz,rx,rz,soft=.85):return soft_range(n,l,distance(cx,cz,rx,rz),soft*soft,1.04,1,0)
    diameter=e['radius']*2;cx=.5+e['offset']/diameter;cz=.5+e['iris_center_y']/diameter
    radius2=distance(cx,cz,e['irisx']/diameter,e['irisy']/diameter)
    radius=math_node(n,l,'SQRT',radius2)
    mask=soft_range(n,l,radius2,.985,1.025,1,0)
    front=math_node(n,l,'LESS_THAN',sep.outputs['Y'],.5);mask=math_node(n,l,'MULTIPLY',mask,front)
    vertical=math_node(n,l,'DIVIDE',math_node(n,l,'SUBTRACT',sep.outputs['Z'],cz-e['irisy']/diameter),2*e['irisy']/diameter)
    ramp=n.new('ShaderNodeValToRGB');ramp.label='Measured deep navy to muted blue layers';l.new(vertical,ramp.inputs[0])
    colors=[(0,'#8eafbc'),(.15,'#6092ae'),(.33,'#315f8c'),(.53,'#193b69'),(.76,'#112449'),(1,'#0b1631')]
    ramp.color_ramp.elements.remove(ramp.color_ramp.elements[1])
    ramp.color_ramp.elements[0].position=colors[0][0];ramp.color_ramp.elements[0].color=(*color(colors[0][1]),1)
    for at,hexcode in colors[1:]:ramp.color_ramp.elements.new(at).color=(*color(hexcode),1)
    source=paint_mix(n,l,ramp.outputs[0],soft_range(n,l,radius,.79,1),'#0b1939',.65,'Soft dark limbal edge')
    # Overlapping, diffuse petals produce the lower blue-white haze. There
    # is no single flat-topped white circle/lamp at the bottom of the iris.
    outer=spot(cx,cz-.075/diameter,.077/diameter,.060/diameter,.10)
    source=paint_mix(n,l,source,outer,'#75a2b8',.48,'Diffuse lower blue atmosphere')
    petal_a=spot(cx-.021/diameter,cz-.086/diameter,.043/diameter,.038/diameter,.03)
    source=paint_mix(n,l,source,petal_a,'#b0cdd2',.44,'Soft lower left light petal')
    petal_b=spot(cx+.023/diameter,cz-.089/diameter,.040/diameter,.034/diameter,.02)
    source=paint_mix(n,l,source,petal_b,'#c3d8d9',.42,'Soft lower right light petal')
    bridge=spot(cx+.001/diameter,cz-.100/diameter,.031/diameter,.022/diameter,0)
    source=paint_mix(n,l,source,bridge,'#cee0df',.24,'Faint joined lower petal light')
    corona=spot(cx,cz-.003/diameter,.045/diameter,.064/diameter,.40)
    source=paint_mix(n,l,source,corona,'#17395d',.25,'Pupil halo')
    pmask=spot(cx,cz-.006/diameter,.025/diameter,.044/diameter,.91)
    source=paint_mix(n,l,source,pmask,'#0c1e36',1,'Deep oval pupil')
    sign=-1 if e['name']=='L' else 1
    glints=[(sign*.022,.061,.031,.022,1,'#fffdf8'),(sign*.010,.072,.016,.011,.88,'#f5fbfb'),(sign*.006,.018,.0048,.0048,.92,'#eef8fb'),(-sign*.035,-.049,.0060,.0041,.84,'#def0f2'),(-sign*.047,.033,.0032,.0041,.65,'#a7cbdd'),(sign*.051,.027,.0025,.0030,.72,'#d6e7ed'),(sign*.050,-.041,.0020,.0023,.65,'#bfd8e1')]
    for i,(x,z,rx,rz,opacity,hexcode)in enumerate(glints):
        source=paint_mix(n,l,source,spot(cx+x/diameter,cz+z/diameter,rx/diameter,rz/diameter,.82),hexcode,opacity,'Source-measured glint '+str(i+1))
    # The source has a restrained cool scleral band below its heavy upper
    # lashes. This remains an ordinary material on the closed globe.
    sclera=n.new('ShaderNodeRGB');sclera.outputs[0].default_value=(*color('#e4ded2'),1)
    shade=soft_range(n,l,sep.outputs['Z'],.61,.80)
    scleral_color=paint_mix(n,l,sclera.outputs[0],shade,'#a3a4ae',.46,'Soft upper scleral tone')
    mixeye=n.new('ShaderNodeMixRGB');l.new(scleral_color,mixeye.inputs[1]);l.new(mask,mixeye.inputs[0]);l.new(source,mixeye.inputs[2])
    emit=n.new('ShaderNodeEmission');l.new(mixeye.outputs[0],emit.inputs['Color']);out=n.new('ShaderNodeOutputMaterial');l.new(emit.outputs[0],out.inputs[0])
    layout_nodes(n)
    return m

def body_weights(point,hint=None):
    x,depth,y=point.x,-point.y,point.z
    jawweight=smooth((-y-.125)/.235)*smooth((depth+.08)/.20)
    return clamp(hint if hint is not None else jawweight)
def face_deform(x,y,d,state):
    cheek=gauss(abs(x),.30,.16)*gauss(y,-.155,.14)
    y+=.012*state['smile']*cheek-.008*state['aa']*smooth((-y-.16)/.20)
    d+=(.020*state['cheek']+.006*state['smile'])*cheek
    x+=math.copysign(.009*state['cheek']*cheek,x or 1)
    for e in EYES:
        y+=.004*state['blink']*gauss(x,e['cx'],.20)*gauss(y,e['cy']-.13,.085)
    y+=.008*state['sad']*gauss(abs(x),.13,.09)*gauss(y,.20,.12)
    return x,y,d

# A quad front/back cage with actual eye/mouth apertures, continuous eyelid
# rings, and closed internal socket/oral surfaces. Caps alone use pole triangles.
ROWS=sorted(set([MIN_Y]+[round(-.36+i*.02,6) for i in range(51)]+[-.380,-.376,-.370,-.28,-.14,-.12,.14,.628,.634,.638,MAX_Y]))
ROWS=[y for y in ROWS if MIN_Y<=y<=MAX_Y]
NX=64
def row(y):return min(range(len(ROWS)),key=lambda j:abs(ROWS[j]-y))
holes=[dict(kind='eye',e=EYES[0],l=8,r=28,b=row(-.12),t=row(.14),cx=-.258,cy=.009,rx=.205,top=.200,bottom=.165),
       dict(kind='eye',e=EYES[1],l=36,r=56,b=row(-.12),t=row(.14),cx=.265,cy=.002,rx=.193,top=.190,bottom=.160),
       dict(kind='mouth',l=26,r=42,b=row(-.28),t=row(-.14),cx=.035,cy=-.205,rx=.145,top=.074,bottom=.078)]
for h in holes:
    h['u0']=((h['l']+h['r'])/NX)-1;h['hu']=(h['r']-h['l'])/NX
    h['y0']=(ROWS[h['b']]+ROWS[h['t']])/2;h['hy']=(ROWS[h['t']]-ROWS[h['b']])/2
def projected_xy(u,y):return center_at(y)+width_at(y)*u,y
def hole_outer(h,theta):
    return h['cx']+h['rx']*math.cos(theta),h['cy']+(h['top'] if math.sin(theta)>=0 else h['bottom'])*math.sin(theta)
def warped_front(u,y):
    x,yy=projected_xy(u,y);dx=dy=0.
    for h in holes:
        a,b=(u-h['u0'])/h['hu'],(y-h['y0'])/h['hy'];r=max(abs(a),abs(b))
        if r<1-1e-8 or r>1.72:continue
        theta=math.atan2(b,a);desired=hole_outer(h,theta)
        by=h['y0']+(y-h['y0'])/r;bu=h['u0']+(u-h['u0'])/r;bx,_=projected_xy(bu,by)
        if abs(r-1)<1e-7:return desired
        w=1-smooth((r-1)/.72);dx+=(desired[0]-bx)*w;dy+=(desired[1]-by)*w
    return x+dx,yy+dy
def front_point(u,y,state):
    x,yy=warped_front(u,y);d=front_depth(x,yy)
    # A small continuous skin ear root at the lateral seam, hidden by hair in
    # the assembled character. It belongs to this same closed skin cage.
    x+=math.copysign(.030*gauss(abs(u),1,.10)*gauss(y,-.015,.105),u or 1)
    return xyz(*face_deform(x,yy,d,state))
def back_point(u,y,state):
    x,_=projected_xy(u,y);d=back_depth(x,y)
    x+=math.copysign(.030*gauss(abs(u),1,.10)*gauss(y,-.015,.105),u or 1)
    return xyz(*face_deform(x,y,d,state))

verts=[];evals=[];jaw_hints=[];faces=[];mats=[]
def add(fn,hint=None):
    i=len(verts);verts.append(fn(ZERO));evals.append(fn);jaw_hints.append(hint);return i
def quad(indices,mat=0):
    ids=[]
    for i in indices:
        if not ids or ids[-1]!=i:ids.append(i)
    if len(ids)>2 and ids[0]==ids[-1]:ids.pop()
    if len(set(ids))>=3:faces.append(ids);mats.append(mat)
grid={}
for j,y in enumerate(ROWS):
    pole=None
    for i in range(NX+1):
        if any(h['l']<i<h['r'] and h['b']<j<h['t'] for h in holes):continue
        if j in (0,len(ROWS)-1):
            if pole is None:pole=add(lambda s,y=y:front_point(0,y,s))
            grid[i,j]=pole
        else:grid[i,j]=add(lambda s,u=i/NX*2-1,y=y:front_point(u,y,s))
for j in range(len(ROWS)-1):
    for i in range(NX):
        if any(h['l']<=i<h['r'] and h['b']<=j<h['t'] for h in holes):continue
        quad([grid[i,j],grid[i+1,j],grid[i+1,j+1],grid[i,j+1]])
backgrid={}
for j,y in enumerate(ROWS):
    for i in range(NX+1):
        if i in (0,NX) or j in (0,len(ROWS)-1):backgrid[i,j]=grid[i,j]
        else:backgrid[i,j]=add(lambda s,u=i/NX*2-1,y=y:back_point(u,y,s))
for j in range(len(ROWS)-1):
    for i in range(NX):quad([backgrid[i,j],backgrid[i,j+1],backgrid[i+1,j+1],backgrid[i+1,j]])

def mouth_inner(theta,state):
    u=math.cos(theta);a=math.sqrt(max(0.,1-u*u));top=math.sin(theta)>=0
    width=.077+.010*state['aa']+.028*state['ee']-.025*state['oh']+.012*state['smile']
    x=.035+width*u
    center=-.201+(.017+.022*state['smile']-.026*state['sad'])*(u*u-.45)+.004*u
    neutral_gap=.0002*smooth((abs(x-.045)-.014)/.008)
    # A soft smile changes the lip curvature without parting the mouth.
    # Teeth/tongue appear only when a real phoneme/jaw opening is requested.
    opening=(neutral_gap+.014*state['aa']+.005*state['ee']+.026*state['oh']) if top else -(neutral_gap+.073*state['aa']+.027*state['ee']+.063*state['oh'])
    y=center+opening*a
    d=front_depth(x,y)+.003+.016*state['oh']*a
    return x,y,d
hole_loops={}
for h in holes:
    coords=[(i,h['b'])for i in range(h['l'],h['r'])]+[(h['r'],j)for j in range(h['b'],h['t'])]+[(i,h['t'])for i in range(h['r'],h['l'],-1)]+[(h['l'],j)for j in range(h['t'],h['b'],-1)]
    angles=[math.atan2((ROWS[j]-h['y0'])/h['hy'],(i/NX*2-1-h['u0'])/h['hu'])for i,j in coords]
    outer=[grid[p]for p in coords];current=outer;count=len(outer)
    fractions=[i/6 for i in range(1,7)] if h['kind']=='eye' else [1/6,2/6,3/6,4/6,5/6,.96,1.]
    for t in fractions:
        next_loop=[]
        for k,theta in enumerate(angles):
            outer_fn=evals[outer[k]]
            def ring_fn(s,t=t,theta=theta,h=h,outer_fn=outer_fn):
                out=outer_fn(s);ox,oy,od=out.x,out.z,-out.y
                inner=eye_inner(h['e'],theta,s) if h['kind']=='eye' else mouth_inner(theta,s)
                x,y=mix(ox,inner[0],t),mix(oy,inner[1],t)
                d=mix(front_depth(x,y),inner[2],smooth(t))
                if h['kind']=='eye':
                    e=h['e'];radial=e['radius']**2-(x-e['cx'])**2-(y-e['cy'])**2
                    if radial>0:d=max(d,e['depth']+math.sqrt(radial)+.007)
                if h['kind']=='mouth':d+=.003*math.sin(t*math.pi)
                return xyz(x,y,d)
            hint=None if h['kind']=='eye' else clamp(.15+.85*max(0.,-math.sin(theta)))
            next_loop.append(add(ring_fn,hint))
        for k in range(count):quad([current[k],current[(k+1)%count],next_loop[(k+1)%count],next_loop[k]],1 if h['kind']=='mouth' and t==1 else 0)
        current=next_loop
    hole_loops[h['kind']+(h.get('e',{}).get('name',''))]=current
    inner_fns=[evals[i]for i in current]
    if h['kind']=='eye':
        e=h['e']
        for r in range(1,9):
            t=r/9;next_loop=[]
            for k,theta in enumerate(angles):
                inn=inner_fns[k]
                def socket(s,t=t,theta=theta,e=e,inn=inn):
                    p=inn(s);dx,dy,dd=p.x-e['cx'],p.z-e['cy'],-p.y-e['depth']
                    phi=math.atan2(math.hypot(dx,dy),dd);angle=mix(phi,math.pi,t)
                    basis=inn(ZERO);bx,by=basis.x-e['cx'],basis.z-e['cy']
                    recover=smooth(t*3)
                    azimuth=math.atan2(mix(dy,by,recover),mix(dx,bx,recover))
                    radius=e['radius']+.001+.003*t
                    return xyz(e['cx']+radius*math.sin(angle)*math.cos(azimuth),e['cy']+radius*math.sin(angle)*math.sin(azimuth),e['depth']+radius*math.cos(angle))
                next_loop.append(add(socket,0))
            for k in range(count):quad([current[k],current[(k+1)%count],next_loop[(k+1)%count],next_loop[k]])
            current=next_loop
        pole=add(lambda s,e=e:xyz(e['cx'],e['cy'],e['depth']-e['radius']-.004),0)
    else:
        for r in range(1,7):
            t=r/7;next_loop=[]
            for k,theta in enumerate(angles):
                inn=inner_fns[k]
                def inside(s,t=t,inn=inn):
                    p=inn(s);a=math.cos(t*math.pi/2)
                    return xyz(.035+(p.x-.035)*a,-.222+(p.z+.222)*a,mix(-p.y,.115,t))
                next_loop.append(add(inside,clamp(.2+.8*max(0.,-math.sin(theta)))))
            for k in range(count):quad([current[k],current[(k+1)%count],next_loop[(k+1)%count],next_loop[k]],2)
            current=next_loop
        pole=add(lambda s:xyz(.035,-.222,.115),.45)
    for k in range(count):quad([current[k],current[(k+1)%count],pole],2 if h['kind']=='mouth' else 0)

def albedo(p):
    x,y,d=p.x,p.z,-p.y
    blush=gauss(abs(x),.30,.16)*gauss(y,-.145,.115)*smooth((d-.12)/.22)
    a=color('#cdc1b1');b=color('#d1a18e')
    return (*[mix(a[i],b[i],blush*.74)for i in range(3)],1)
mesh=bpy.data.meshes.new('HeadSkin / continuous orbital and oral quad flow');mesh.from_pydata(verts,[],faces);mesh.update()
head=link(bpy.data.objects.new('HeadSkin / complete cranium, cheeks, chin, eyelids and oral cavity',mesh));head.parent=headroot
for m in (skin,lip,oral):mesh.materials.append(m)
for poly,index in zip(mesh.polygons,mats):poly.material_index=index;poly.use_smooth=True
attr=mesh.color_attributes.new(name='FaceAlbedo',type='FLOAT_COLOR',domain='POINT')
for datum,p in zip(attr.data,verts):datum.color=albedo(p)
lip_attr=mesh.color_attributes.new(name='LipAlbedo',type='FLOAT_COLOR',domain='POINT')
for datum,p in zip(lip_attr.data,verts):
    ink=smooth((abs(p.x-.045)-.014)/.008);a=albedo(p);b=color('#745448')
    datum.color=(*[mix(a[i],b[i],ink*.90)for i in range(3)],1)

def add_skin_paint(material):
    # Ordinary rest-surface material details. They use Generated coordinates,
    # stick to the deforming skin, and introduce no overlay geometry or photo.
    n,l=material.node_tree.nodes,material.node_tree.links
    multiply=next(node for node in n if node.type=='MIX_RGB' and node.blend_type=='MULTIPLY')
    old=multiply.inputs[1].links[0];source=old.from_socket;l.remove(old)
    tc=n.new('ShaderNodeTexCoord');sep=n.new('ShaderNodeSeparateXYZ');l.new(tc.outputs['Generated'],sep.inputs[0])
    xmin,xmax=min(p.x for p in verts),max(p.x for p in verts)
    zmin,zmax=min(p.z for p in verts),max(p.z for p in verts)
    x=math_node(n,l,'ADD',math_node(n,l,'MULTIPLY',sep.outputs['X'],xmax-xmin),xmin)
    z=math_node(n,l,'ADD',math_node(n,l,'MULTIPLY',sep.outputs['Z'],zmax-zmin),zmin)
    front=math_node(n,l,'LESS_THAN',sep.outputs['Y'],.58)
    nose=soft_range(n,l,ellipse_distance(n,l,x,z,.066,-.068,.0067,.0050),.25,1.2,1,0)
    source=paint_mix(n,l,source,math_node(n,l,'MULTIPLY',nose,front),'#f2e7d8',.82,'Tiny painted nose-tip light on the real nose')
    nostril=soft_range(n,l,ellipse_distance(n,l,x,z,.071,-.084,.0020,.0033),.15,1.15,1,0)
    source=paint_mix(n,l,source,math_node(n,l,'MULTIPLY',nostril,front),'#9e7a69',.48,'Restrained lower nose accent')
    ax=math_node(n,l,'ABSOLUTE',x)
    patch=soft_range(n,l,ellipse_distance(n,l,ax,z,.302,-.190,.100,.033),.50,1.15,1,0)
    slant=math_node(n,l,'ADD',math_node(n,l,'SUBTRACT',x,.30),math_node(n,l,'MULTIPLY',math_node(n,l,'ADD',z,.190),.40))
    stripe=math_node(n,l,'LESS_THAN',math_node(n,l,'FRACT',math_node(n,l,'DIVIDE',slant,.020)),.10)
    hatch=math_node(n,l,'MULTIPLY',math_node(n,l,'MULTIPLY',patch,stripe),front)
    source=paint_mix(n,l,source,hatch,'#aa8073',.18,'Low contrast reference cheek hatching')
    l.new(source,multiply.inputs[1]);layout_nodes(n)
add_skin_paint(skin)
vg_head=head.vertex_groups.new(name='FaceHead');vg_jaw=head.vertex_groups.new(name='Jaw')
for i,(p,hint)in enumerate(zip(verts,jaw_hints)):
    w=body_weights(p,hint)
    if w<1:vg_head.add([i],1-w,'REPLACE')
    if w>0:vg_jaw.add([i],w,'REPLACE')
for key,indices in hole_loops.items():
    group=head.vertex_groups.new(name='EDIT_Rim_'+key);group.add(indices,1,'REPLACE')
head['editable_rim_indices']=json.dumps(hole_loops)
arm=head.modifiers.new('Native FaceRig skin deformation','ARMATURE');arm.object=rig

def add_shapes(obj,functions):
    obj.shape_key_add(name='Basis')
    positions={}
    for name in PRIMARY_KEYS:
        state={**ZERO,name:1.};positions[name]=[fn(state)for fn in functions]
        key=obj.shape_key_add(name=name)
        for v,p in zip(key.data,positions[name]):v.co=p
        if name in ('lookUp','lookDown'):
            expression='max(0,gy)' if name=='lookUp' else 'max(0,-gy)'
            property_driver(key,'value',None,expression,dict(gy='gazeY'))
        elif name in ('aa','ee','oh'):
            property_driver(key,'value',None,f'{name}/max(1,aa+ee+oh)',dict(aa='aa',ee='ee',oh='oh'))
        else:property_driver(key,'value',None,name,{name:name})
    basis=[v.co.copy()for v in obj.data.shape_keys.key_blocks['Basis'].data]
    half=obj.shape_key_add(name='blink_sphere_inbetween')
    for i,(v,fn)in enumerate(zip(half.data,functions)):
        desired=fn({**ZERO,'blink':.5});linear=(basis[i]+positions['blink'][i])*.5
        v.co=basis[i]+desired-linear
    property_driver(half,'value',None,'4*b*(1-b)',dict(b='blink'))
    for other in ('smile','sad','lookUp','lookDown','squintL','squintR'):
        key=obj.shape_key_add(name='corrective_blink_'+other)
        for i,(v,fn)in enumerate(zip(key.data,functions)):
            desired=fn({**ZERO,'blink':1.,other:1.})
            v.co=basis[i]+desired-(positions['blink'][i]+positions[other][i]-basis[i])
        if other in ('lookUp','lookDown'):
            expression='b*max(0,gy)' if other=='lookUp' else 'b*max(0,-gy)'
            property_driver(key,'value',None,expression,dict(b='blink',gy='gazeY'))
        else:property_driver(key,'value',None,'b*m',dict(b='blink',m=other))
    return positions
add_shapes(head,evals)

def parent_bone(obj,name):
    bpy.context.view_layer.update();world=obj.matrix_world.copy();obj.parent=rig;obj.parent_type='BONE';obj.parent_bone=name;obj.matrix_world=world
def take_primitive(obj,name,mat,parent='FaceHead'):
    obj.name=name
    for c in list(obj.users_collection):c.objects.unlink(obj)
    asset.objects.link(obj);obj.data.materials.append(mat)
    for p in obj.data.polygons:p.use_smooth=True
    parent_bone(obj,parent);return obj
for e in EYES:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=32,radius=e['radius'],location=xyz(e['cx'],e['cy'],e['depth']))
    eye=take_primitive(bpy.context.object,'Eye.'+e['name']+' / closed spherical globe',iris_material(e),'Eye.'+e['name'])
    eye['gaze']='True Eye bone rotation; iris is a material on the closed eye surface, not a card.'

def tube_object(name,path_fn,count,width_fn,thickness,material):
    fs=[];fns=[];cross=8
    for i in range(count+1):
        t=i/count
        for j in range(cross):
            phi=j/cross*math.tau
            def fn(s,t=t,phi=phi):
                p=path_fn(t,s);a=path_fn(clamp(t-.001),s);b=path_fn(clamp(t+.001),s)
                tangent=(b-a).normalized();screen=Vector((-tangent.z,0,tangent.x)).normalized()
                width=width_fn(t)*(1-.60*s['blink']) if name.startswith('Lash.') else width_fn(t)
                return p+screen*(width*math.cos(phi)/2)+Vector((0,-thickness*math.sin(phi)/2,0))
            fns.append(fn)
    for i in range(count):
        for j in range(cross):fs.append((i*cross+j,i*cross+(j+1)%cross,(i+1)*cross+(j+1)%cross,(i+1)*cross+j))
    fs.append(tuple(reversed(range(cross))));fs.append(tuple(count*cross+j for j in range(cross)))
    me=bpy.data.meshes.new(name);me.from_pydata([fn(ZERO)for fn in fns],[],fs);me.update()
    ob=link(bpy.data.objects.new(name,me));ob.parent=headroot;me.materials.append(material)
    for p in me.polygons:p.use_smooth=True
    add_shapes(ob,fns);parent_bone(ob,'FaceHead');return ob
for e in EYES:
    def upper(t,s,e=e):
        theta=math.pi*(1-t);p=xyz(*eye_inner(e,theta,s));p.y-=.004;return p
    def lash_width(t,e=e):
        u=t if e['name']=='L' else 1-t
        return .0015+math.sin(math.pi*u)**.44*(.045-.031*u)+.005*gauss(u,.16,.12)
    tube_object('Lash.'+e['name']+' / source-weighted tapered solid upper rim',upper,72,lash_width,.006,lashmat)
    def lower(t,s,e=e):
        p=xyz(*eye_inner(e,math.pi+math.pi*t,s));p.y-=.002;return p
    tube_object('Lid.'+e['name']+' / restrained lower rim',lower,48,lambda t:.0007+.0010*math.sin(math.pi*t),.002,lidmat)
    def brow(t,s,e=e):
        x=e['cx']+mix(-.12,.12,t);y=(.178 if e['name']=='L' else .188)+.015*math.sin(math.pi*t)
        y+=s['sad']*(.043*(t if e['name']=='L' else 1-t)-.005)+s['smile']*.010
        return xyz(*face_deform(x,y,front_depth(x,y)+.008,s))
    tube_object('Brow.'+e['name']+' / tapered solid editable brow',brow,40,lambda t:.0015+.0050*math.sin(math.pi*t)**.6,.0045,browmat)
    # A genuine tapered 3D outer lash wedge, not a single triangle card.
    sign=-1 if e['name']=='L' else 1
    def wing_path(t,s,e=e,sign=sign):
        p=xyz(*eye_inner(e,math.pi if sign<0 else 0,s));p.x+=sign*.030*t;p.z+=(.031*t+.006*math.sin(math.pi*t))*(1-.35*s['blink']);p.y-=.004
        return p
    tube_object('LashWing.'+e['name']+' / solid pointed outer corner',wing_path,16,lambda t:.020*(1-t)**1.45+.0003,.006,lashmat)
    def flick_path(t,s,e=e,sign=sign):
        theta=math.pi*(1-(.17 if e['name']=='L' else .83));p=xyz(*eye_inner(e,theta,s))
        p.x+=sign*.010*t;p.z+=.023*t*(1-.75*s['blink']);p.y-=.006
        return p
    tube_object('LashFlick.'+e['name']+' / upper outer solid lash',flick_path,10,lambda t:.008*(1-t)+.0004,.0055,lashmat)

def ellipsoid(name,location,scale,mat,parent):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,radius=1,location=location)
    obj=bpy.context.object;obj.scale=scale
    return take_primitive(obj,name,mat,parent)
ellipsoid('Tongue / closed volume',xyz(.035,-.251,.350),(.055,.031,.014),tonguemat,'Tongue')
for name,vertical in [('Upper',-.207),('Lower',-.248)]:
    ellipsoid(name+' teeth / closed ivory volume',xyz(.035,vertical,.386),(.059,.014,.011),teethmat,'FaceHead' if name=='Upper' else 'Jaw')
rig.pose.bones['Tongue'].rotation_mode='XYZ'
property_driver(rig.pose.bones['Tongue'],'rotation_euler',0,'.035*aa',dict(aa='aa'))

# Native studio and actual review cameras, outside the character collection.
world=bpy.data.worlds.new('Face review / neutral ambient');world.use_nodes=True
world.node_tree.nodes['Background'].inputs['Color'].default_value=(.55,.59,.65,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value=.7;scene.world=world
def aim(obj,point):obj.rotation_euler=(Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()
for name,position,power,size in [('Key',(-2,-3,4),350,4),('Fill',(3,-1,1),140,3),('Rim',(0,3,3),150,3)]:
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size
    ob=link(bpy.data.objects.new(name,data),studio);ob.location=position;aim(ob,(0,0,.10))
cameras={}
for name,position in [('front',(0,-4,.12)),('side',(4,0,.12)),('threequarter',(2.8,-4,.20)),('back',(0,4,.12))]:
    data=bpy.data.cameras.new('Review '+name);data.type='ORTHO';data.ortho_scale=1.47
    ob=link(bpy.data.objects.new('Review '+name,data),studio);ob.location=position;aim(ob,(0,0,.12));cameras[name]=ob
scene.camera=cameras['front'];scene.render.engine='BLENDER_EEVEE_NEXT';scene.render.resolution_x=512;scene.render.resolution_y=512;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.film_transparent=False
scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=0;scene.view_settings.gamma=1
if hasattr(scene,'eevee'):scene.eevee.taa_render_samples=24
scene.render.fps=30
scene['asset_scope']='Native volumetric facial topology and rig, first actual shape review; not final likeness or completed whole character.'
headroot['local_landmarks']=json.dumps({'chin':-.382,'crown':.64,'eye_line':0,'nose_depth':.484,'lip_depth':.450,'chin_lowest_pole_depth':.300,'chin_front':[-.363,.374]})
readme=bpy.data.texts.new('README_NATIVE_FACE_V4')
readme.write('Native volumetric face v4\nIndependent sculpt; v2/v3 assets and source assembly stay immutable.\nHeadRoot: X horizontal, -Y front, Z up. Single connected skull/cheek/jaw/eyelid/socket/oral skin and genuinely closed spherical eyes. No facial cards or portrait projection.\nNeutral eye apertures are corrected from perspective reference to near-symmetric frontal anatomy. Significant asymmetry is available through native squintL/R skin shape controls, with blink correctives.\nTrue sphere iris material has overlapping diffuse lower light petals, a wide upper glint and a smaller lower-inner reflection. Nose/lip/chin profile is sculpted to avoid a projecting muzzle.\nContinuous eyelid sphere fitting, real Jaw/Tongue/ocular bones and phoneme skin motion are retained. Inferred side/back design is an artistic hypothesis, never original-author ground truth.\nActual multiview renders and numerical integrity checks are evidence for iteration, not final likeness approval.\n')
ROOT.mkdir(parents=True,exist_ok=True);RENDERS.mkdir(parents=True,exist_ok=True)
bpy.context.view_layer.objects.active=head;head.select_set(True);scene.frame_set(1);bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND),check_existing=False)

def set_controls(values):
    for key in ('blink','aa','ee','oh','smile','sad','cheek','jaw','gazeX','gazeY','squintL','squintR'):rig[key]=float(values.get(key,0))
    rig.update_tag(refresh={'OBJECT','DATA','TIME'});scene.frame_set(scene.frame_current+1);bpy.context.view_layer.update()
review=[('neutral','front',{}),('neutral','side',{}),('neutral','threequarter',{}),('neutral','back',{}),
        ('expressions/blink','front',{'blink':1}),('expressions/blink','side',{'blink':1}),
        ('expressions/aa','front',{'aa':1}),('expressions/aa','side',{'aa':1}),
        ('expressions/halfblink','threequarter',{'blink':.5}),('expressions/smile','threequarter',{'smile':1,'aa':.3}),
        ('expressions/sad','front',{'sad':1}),('expressions/oh','side',{'oh':1}),('expressions/gaze','threequarter',{'gazeX':.7,'gazeY':.3}),
        ('acting/softsmile','front',{'smile':.35,'cheek':.25}),('acting/softsmile','threequarter',{'smile':.35,'cheek':.25}),
        ('acting/softsad','front',{'sad':.65,'gazeY':-.15}),('acting/softsad','side',{'sad':.65,'gazeY':-.15}),
        ('acting/talking','front',{'aa':.45,'ee':.10,'smile':.15,'cheek':.15}),('acting/talking','threequarter',{'aa':.45,'ee':.10,'smile':.15,'cheek':.15}),
        ('acting/gaze-halfblink','front',{'blink':.60,'gazeX':.65,'gazeY':-.30,'smile':.20}),('acting/gaze-halfblink','side',{'blink':.60,'gazeX':.65,'gazeY':-.30,'smile':.20}),
        ('acting/gaze-blink-smile','threequarter',{'blink':1,'gazeX':-.7,'gazeY':.65,'smile':.55}),('acting/asymmetric-squint','front',{'squintL':.65,'smile':.2}),('acting/asymmetric-squint','threequarter',{'squintL':.65,'smile':.2})]
rendered=[]
for folder,view,controls in review:
    set_controls(controls);scene.camera=cameras[view]
    directory=RENDERS/folder;directory.mkdir(parents=True,exist_ok=True);filename=directory/(view+'.png')
    scene.render.filepath=str(filename);bpy.ops.render.render(write_still=True)
    rendered.append({'path':str(filename),'view':view,'controls':controls,'bytes':filename.stat().st_size})

# Actual evaluated skin/rig checks, not just the existence of named shape keys.
def evaluated_skin():
    obj=head.evaluated_get(bpy.context.evaluated_depsgraph_get())
    return [obj.matrix_world@v.co for v in obj.data.vertices]
set_controls({});neutral_skin=evaluated_skin();chin_index=min(range(len(neutral_skin)),key=lambda i:neutral_skin[i].z)
set_controls({'aa':1});open_skin=evaluated_skin()
native_qa={'finite_evaluated_skin':all(math.isfinite(x)for p in open_skin for x in p),
           'neutral_chin':list(neutral_skin[chin_index]),'aa_chin':list(open_skin[chin_index]),
           'aa_chin_drop':neutral_skin[chin_index].z-open_skin[chin_index].z,
           'aa_jaw_euler':list(rig.pose.bones['Jaw'].rotation_euler),'closed_eye_ray_tests':{},'combined_closed_eye_ray_tests':{},'acting_skin_changes':{}}
assert native_qa['finite_evaluated_skin'] and native_qa['aa_chin_drop']>.025
qa_cases=[('blink',{'blink':1}),('blink-smile-gaze-talk',{'blink':1,'smile':.35,'aa':.4,'gazeX':.65,'gazeY':-.45}),('blink-sad-gaze',{'blink':1,'sad':.75,'gazeX':-.7,'gazeY':.60})]
for case,values in qa_cases:
    set_controls(values);bvh=BVHTree.FromObject(head,bpy.context.evaluated_depsgraph_get(),epsilon=1e-7);results={}
    for label,view in [('front',Vector((0,-1,0))),('threequarter',Vector((.6,-.8,0))),('right',Vector((1,0,0))),('left',Vector((-1,0,0)))]:
        tested=uncovered=0
        for e in EYES:
            center=xyz(e['cx'],e['cy'],e['depth'])
            for vertical in [-.75,-.5,-.25,0,.25,.5,.75]:
                radial=math.sqrt(1-vertical*vertical)
                for longitude in range(0,360,20):
                    a=math.radians(longitude);normal=Vector((radial*math.cos(a),radial*math.sin(a),vertical))
                    if normal.dot(view)<=.05:continue
                    eye_surface=center+normal*e['radius'];hit=bvh.ray_cast(eye_surface+view*2,-view,4)
                    tested+=1
                    if hit[0] is None or hit[3]>2.0001:uncovered+=1
        results[label]={'surface_samples':tested,'uncovered_eye_samples':uncovered}
        assert uncovered==0,(case,label,'Closed eye sphere is visible through skin',uncovered)
    if case=='blink':native_qa['closed_eye_ray_tests']=results
    else:native_qa['combined_closed_eye_ray_tests'][case]=results
for case,values in [('softsmile',{'smile':.35,'cheek':.25}),('softsad',{'sad':.65,'gazeY':-.15}),('talking',{'aa':.45,'ee':.1,'smile':.15}),('gaze-halfblink',{'blink':.6,'gazeX':.65,'gazeY':-.3,'smile':.2})]:
    set_controls(values);points=evaluated_skin();delta=[(a-b).length for a,b in zip(points,neutral_skin)]
    native_qa['acting_skin_changes'][case]={'finite':all(math.isfinite(x)for p in points for x in p),'changed_vertices':sum(d>1e-6 for d in delta),'max_delta':max(delta),'chin_drop':neutral_skin[chin_index].z-points[chin_index].z}
    assert native_qa['acting_skin_changes'][case]['finite'] and max(delta)>.001
minimum_margin=1.;worst_margin=None;continuous_cases=0
for step in range(11):
    for mood in [{},{'smile':.6},{'sad':.7},{'squintL':.65,'squintR':.2}]:
        values={'blink':step/10,'gazeX':.45,'gazeY':-.25,**mood}
        set_controls(values);points=evaluated_skin();continuous_cases+=1
        assert all(math.isfinite(c)for p in points for c in p)
        for e in EYES:
            center=xyz(e['cx'],e['cy'],e['depth'])
            for index in hole_loops['eye'+e['name']]:
                margin=(points[index]-center).length-e['radius']
                if margin<minimum_margin:minimum_margin=margin;worst_margin={'controls':values,'eye':e['name'],'vertex':index}
native_qa['continuous_eyelid_globe_check']={'evaluated_cases':continuous_cases,'blink_samples':11,'minimum_boundary_margin':minimum_margin,'worst':worst_margin,'scope':'Evaluated real skin rim versus full globe, with expression and asymmetry controls.'}
assert minimum_margin>0.,('Continuous eyelid enters real globe',minimum_margin,worst_margin)
set_controls({});scene.camera=cameras['front'];scene.frame_set(1);bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND),check_existing=False)

def topology(obj):
    usage={};adj=[set()for _ in obj.data.vertices]
    for p in obj.data.polygons:
        for a,b in zip(p.vertices,tuple(p.vertices[1:])+tuple(p.vertices[:1])):
            edge=tuple(sorted((a,b)));usage[edge]=usage.get(edge,0)+1
            adj[a].add(b);adj[b].add(a)
    seen=set();components=0
    for i in range(len(adj)):
        if i in seen:continue
        components+=1;stack=[i];seen.add(i)
        while stack:
            for j in adj[stack.pop()]:
                if j not in seen:seen.add(j);stack.append(j)
    return {'vertices':len(obj.data.vertices),'faces':len(obj.data.polygons),'quads':sum(len(p.vertices)==4 for p in obj.data.polygons),'triangles':sum(len(p.vertices)==3 for p in obj.data.polygons),'boundary_edges':sum(n==1 for n in usage.values()),'nonmanifold_edges':sum(n!=2 for n in usage.values()),'connected_components':components,'loose_vertices':sum(not neighbors for neighbors in adj)}
keys={}
base=head.data.shape_keys.key_blocks['Basis']
for key in head.data.shape_keys.key_blocks[1:]:
    delta=[(a.co-b.co).length for a,b in zip(key.data,base.data)]
    keys[key.name]={'changed_skin_vertices':sum(v>1e-6 for v in delta),'max_delta':max(delta,default=0)}
objects=[o for o in asset.objects if o.type=='MESH']
report={'version':4,'revision':1,'status':'independent_native_face_v4_pending_actual_visual_review','blend':str(BLEND),'blend_bytes':BLEND.stat().st_size,'blend_sha256':hashlib.sha256(BLEND.read_bytes()).hexdigest(),
        'build_script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'blender':bpy.app.version_string,'head_root_origin':list(headroot.location),'coordinate_frame':'X horizontal, -Y forward, Z up; eye line Z=0','head_attachment_world_z':2.155,
        'assembly':{'collection':asset.name,'attachment_root':headroot.name,'controls':rig.name,'skin_object':head.name,'append_review_studio':False},
        'skin_topology':topology(head),'mesh_count':len(objects),'meshes':{o.name:topology(o)for o in objects},'rig_bones':[b.name for b in rig_data.bones],
        'constraints':{b.name:[c.type for c in b.constraints]for b in rig.pose.bones},'shape_keys':keys,
        'drivers':sum(len(o.data.shape_keys.animation_data.drivers)for o in objects if o.data.shape_keys and o.data.shape_keys.animation_data)+(len(rig.animation_data.drivers)if rig.animation_data else 0),
        'reference_policy':'Video cover supplies proportion measurements only; generated side guide supplies inferred depth. No source photo is projected or used as a character output.',
        'target_depth_landmarks':{'nose':[-.076,.484],'lip':[-.204,.450],'chin_front':[-.363,.374],'chin_lowest_pole':[-.382,.300]},'actual_geometry_qa':native_qa,'renders':rendered,
        'reference_images_used_as_character_texture':False,
        'eye_landmarks':{e['name']:{'center':[e['cx'],e['cy']],'globe_radius':e['radius'],'globe_depth':e['depth'],'upper_trace':e['upper'],'lower_trace':e['lower'],'aperture_width':e['maxx']-e['minx'],'aperture_height':max(p[1] for p in e['upper'])-min(p[1] for p in e['lower']),'iris_center_y':e['iris_center_y']} for e in EYES},
        'art_refinement':['Correct perspective-derived screen asymmetry into frontal eye anatomy: width .286/.277, height .230/.225, gently mirrored lifted outer corners.','Significant eyelid asymmetry is an independent native squintL/R skin control with blink correctives.','Smaller rounded nose projection .484; calm lip depth .450; 2.5 cm closing chin cap rolls from front depth .374 to a rear-set lowest pole .300, with full skull seam updates.','Real spherical irises: multiple softly overlapping lower blue-white petals instead of a flat bright circular lamp, wide upper glints and tiny lower-inner reflections.','Actual upper/lower eyelids follow genuine rotating sphere surfaces; solid tapered lashes, continuous real Jaw/phonemes and oral cavity retained.'],
        'frozen_sources':FROZEN_HASHES,'frozen_sources_unchanged':all(hashlib.sha256(Path(p).read_bytes()).hexdigest()==h for p,h in FROZEN_HASHES.items()),
        'limitations':['First native topology/rig shape review, not final likeness approval.','Side/back depth and skin ear roots are inferred.','Head/body/neck integration and final shared normals require assembled-character QA.','Extreme combined controls still require render-based corrective tuning.','Procedural iris and NPR shaders require baking or runtime shader translation for GLB/VRM export.'],
        'elapsed_seconds':time.perf_counter()-START}
assert report['skin_topology']['connected_components']==1
assert report['skin_topology']['boundary_edges']==report['skin_topology']['nonmanifold_edges']==0
MANIFEST.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert report['frozen_sources_unchanged']
print('NATIVE_FACE_V4_RESULT '+json.dumps({'blend':str(BLEND),'skin':report['skin_topology'],'rig_bones':report['rig_bones'],'renders':len(rendered),'manifest':str(MANIFEST)},ensure_ascii=False))

def render_context_review():
    """Read the assembled project, replace face in memory, save PNGs only."""
    assembled=ROOT/'dafeiyu-native-v4-study.blend'
    if not assembled.is_file():return
    assembly_hash=hashlib.sha256(assembled.read_bytes()).hexdigest()
    bpy.ops.wm.open_mainfile(filepath=str(assembled))
    context_scene=bpy.context.scene
    old_collection=bpy.data.collections.get('Native Face component')
    if not old_collection:raise RuntimeError('Cannot identify old assembled face collection for context review')
    old_root=next(o for o in old_collection.objects if 'HeadRoot' in o.name)
    attachment={'parent':old_root.parent,'parent_type':old_root.parent_type,'parent_bone':old_root.parent_bone,'inverse':old_root.matrix_parent_inverse.copy(),'basis':old_root.matrix_basis.copy()}
    for obj in list(old_collection.objects):bpy.data.objects.remove(obj,do_unlink=True)
    with bpy.data.libraries.load(str(BLEND),link=False)as(source,target):target.collections=['Face_v4_EDITABLE']
    context_collection=target.collections[0];context_scene.collection.children.link(context_collection)
    frame=next(o for o in context_collection.objects if o.name.startswith('HeadRoot') and o.parent is None)
    frame.parent=attachment['parent'];frame.parent_type=attachment['parent_type'];frame.parent_bone=attachment['parent_bone'];frame.matrix_parent_inverse=attachment['inverse'];frame.matrix_basis=attachment['basis']
    context_rig=next(o for o in context_collection.objects if o.type=='ARMATURE')
    for obj in context_scene.objects:
        if obj!=context_rig and obj.animation_data:obj.animation_data.action=None
    context_scene.render.resolution_x=640;context_scene.render.resolution_y=640;context_scene.render.resolution_percentage=100
    if hasattr(context_scene,'eevee'):context_scene.eevee.taa_render_samples=24
    camera=context_scene.camera;camera.data.type='ORTHO';camera.data.ortho_scale=1.90
    target_point=Vector((0,0,2.26));outputs=[]
    cases=[('front-neutral',(0,-1,0),{}),('threequarter-neutral',(.65,-1,.025),{}),('side-neutral',(1,0,0),{}),('threequarter-softsmile',(.65,-1,.025),{'smile':.35,'cheek':.25}),('side-talking',(-1,0,0),{'aa':.45,'ee':.1,'smile':.15}),('front-gaze-blink',(0,-1,0),{'blink':1,'smile':.35,'gazeX':.65,'gazeY':-.45}),('threequarter-halfblink-talk',(.65,-1,.025),{'blink':.5,'aa':.45,'smile':.30,'gazeX':.35,'gazeY':-.1})]
    for name,direction,values in cases:
        for key in ('blink','aa','ee','oh','smile','sad','cheek','jaw','gazeX','gazeY','squintL','squintR'):context_rig[key]=float(values.get(key,0))
        context_rig.update_tag(refresh={'OBJECT','DATA','TIME'});context_scene.frame_set(context_scene.frame_current+1);bpy.context.view_layer.update()
        camera.location=target_point+Vector(direction).normalized()*5;camera.rotation_euler=(target_point-camera.location).to_track_quat('-Z','Y').to_euler()
        filename=RENDERS/'context'/(name+'.png');filename.parent.mkdir(parents=True,exist_ok=True)
        context_scene.render.filepath=str(filename);bpy.ops.render.render(write_still=True)
        outputs.append({'path':str(filename),'controls':values,'direction':direction})
    report['context_review']={'source_assembly':str(assembled),'assembly_sha256':assembly_hash,'assembly_file_modified':False,'face_replaced_in_memory_only':True,'renders':outputs,'scope':'Face identity/acting inspection with the saved body/hair. Hair remains owned and revised by the assembly task.'}
    assert all(hashlib.sha256(Path(p).read_bytes()).hexdigest()==h for p,h in FROZEN_HASHES.items())
    MANIFEST.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('FACE_CONTEXT_REVIEW '+json.dumps({'renders':len(outputs),'assembly_file_modified':False}))

if '--context-review' in sys.argv:render_context_review()
