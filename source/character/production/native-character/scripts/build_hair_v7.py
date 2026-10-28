"""Author an editable, volumetric hair component; no image cards or painted planes.

Coordinates: Blender Z up, -Y forward, HeadRoot at the eye-line origin.
This is a modelling/rigging source, not a claim of finished visual fidelity.
"""
import bpy
import bmesh
import json
import math
import argparse
import sys
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--variant',choices=['v7'],default='v7')
OPTIONS=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
VARIANT=OPTIONS.variant
OUT=ROOT/('hair-'+VARIANT+'.blend')
RENDERS=ROOT/'renders'/('hair-'+VARIANT)
ROOT.mkdir(parents=True,exist_ok=True);RENDERS.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene

def color(rgb):
    return tuple(((n/255)/12.92 if n/255<=.04045 else ((n/255+.055)/1.055)**2.4) for n in rgb)+(1,)

def toon(name,dark,base,light):
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=color(base)
    n=m.node_tree.nodes;n.clear();l=m.node_tree.links
    geometry=n.new('ShaderNodeNewGeometry')
    direction=Vector((-.35,-.60,.73)).normalized()
    dot=n.new('ShaderNodeVectorMath');dot.operation='DOT_PRODUCT';dot.inputs[1].default_value=direction;l.new(geometry.outputs['Normal'],dot.inputs[0])
    remap=n.new('ShaderNodeMapRange');remap.clamp=True;remap.inputs['From Min'].default_value=-.35;remap.inputs['From Max'].default_value=.95;l.new(dot.outputs['Value'],remap.inputs['Value'])
    ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.interpolation='CONSTANT'
    ramp.color_ramp.elements[0].position=.0;ramp.color_ramp.elements[0].color=color(dark)
    ramp.color_ramp.elements[1].position=.32;ramp.color_ramp.elements[1].color=color(base)
    e=ramp.color_ramp.elements.new(.80);e.color=color(light);l.new(remap.outputs[0],ramp.inputs[0])
    emission=n.new('ShaderNodeEmission');l.new(ramp.outputs[0],emission.inputs['Color']);emission.inputs['Strength'].default_value=1
    output=n.new('ShaderNodeOutputMaterial');l.new(emission.outputs[0],output.inputs['Surface'])
    m['native_toon']=json.dumps({'kind':'world-normal-cel','keyVectorBlenderWorld':list(direction),'dotRemap':[-.35,.95],'rampStops':[[0,list(color(dark))],[.32,list(color(base))],[.80,list(color(light))]],'castShadowReception':False,'scope':'Art-directed NPR light response on actual deformed surface normals, not a physical BRDF.'})
    return m

blue=toon('Hair / cool indigo / three cel values',(29,42,73),(40,62,105),(61,88,139))
tipblue=toon('Hair ends / restrained blue',(31,46,78),(43,70,117),(65,96,146))
ivory=toon('Maid trim / ivory',(153,152,165),(213,211,211),(242,238,228))
bowmat=toon('Hair bows / ocean blue',(28,56,85),(58,107,153),(104,159,194))
head=bpy.data.objects.new('HeadRoot',None);scene.collection.objects.link(head)
head['role']='Append to the body Head frame at world eye-line Z=2.155.'
parts=[]

def mesh_object(name,vertices,faces,material):
    data=bpy.data.meshes.new(name+' geometry');data.from_pydata(vertices,[],faces);data.update()
    bm=bmesh.new();bm.from_mesh(data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-7);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(data);bm.free();data.update()
    ob=bpy.data.objects.new(name,data);scene.collection.objects.link(ob);ob.parent=head
    data.materials.append(material)
    for face in data.polygons:face.use_smooth=True
    parts.append(ob);return ob

def sample(points,t):
    n=len(points)-1;q=max(0,min(n-1e-9,t*n));i=int(q);u=q-i
    p=[Vector(points[max(0,min(n,j))][:3]) for j in (i-1,i,i+1,i+2)]
    point=(p[1]*2+(p[2]-p[0])*u+(p[0]*2-p[1]*5+p[2]*4-p[3])*u*u+(-p[0]+p[1]*3-p[2]*3+p[3])*u*u*u)*.5
    width=points[i][3]*(1-u)+points[min(n,i+1)][3]*u
    depth=points[i][4]*(1-u)+points[min(n,i+1)][4]*u
    return point,width,depth

strands=[]
def refined_flow(name,points):
    if VARIANT!='v7':return points
    sign=-1 if name.startswith('L ') else 1
    mirror=lambda values:[(sign*x,y,z,w,d) for x,y,z,w,d in values]
    if 'posterior outer curl' in name:
        return mirror([(.36,.16,.70,.15,.047),(.58,.29,.18,.19,.072),(.65,.30,-.26,.195,.075),(.80,.20,-.59,.17,.065),(.65,.13,-.85,.14,.055),(.75,.07,-.96,.060,.035),(.61,.06,-1.13,.003,.004)])
    if 'posterior inner curl' in name:
        return mirror([(.20,.21,.74,.14,.04),(.35,.44,.31,.21,.072),(.40,.46,-.16,.20,.075),(.56,.35,-.46,.18,.06),(.40,.24,-.73,.14,.055),(.51,.18,-.88,.046,.03),(.40,.15,-.99,.003,.004)])
    if name=='Center posterior overlapping flow':
        return [(0,.14,.76,.09,.028),(0,.42,.47,.22,.057),(0,.54,.04,.255,.074),(.035,.49,-.32,.23,.065),(.10,.39,-.61,.16,.05),(.025,.33,-.80,.095,.037),(-.14,.30,-.81,.003,.004)]
    result=[]
    for x,y,z,w,d in points:
        if any(key in name for key in ['fringe','cheek lock','temple lock']):
            factor=max(0,min(1,(.70-z)/.45));y+=.055*factor;d*=.42
        if name.startswith('Central bangs'):d*=.50
        if 'side outward curl' in name:d*=.48
        if name=='Hook ahoge':z=.83+(z-.83)*.78;w*=.82;d*=.8
        result.append((x,y,z,w,d))
    if name=='Central bangs / broad flow':
        result=[(-.06,-.13,.82,.06,.025),(.015,-.35,.65,.20,.030),(.025,-.415,.36,.17,.030),(.015,-.410,.15,.075,.020),(-.025,-.407,.030,.002,.003)]
    elif name=='Central bangs / fork tip':
        result=[(.075,-.403,.29,.078,.022),(.118,-.408,.15,.055,.021),(.135,-.405,.040,.002,.003)]
    elif 'inner fringe' in name:
        result=mirror([(.18,-.15,.77,.08,.025),(.39,-.305,.60,.16,.027),(.49,-.335,.29,.14,.027),(.53,-.285,-.10,.125,.028),(.39,-.255,-.27,.003,.004)])
    return result

def strand(name,points,material=blue,segments=36,sides=16,physics=True):
    points=refined_flow(name,points)
    vertices=[];faces=[];centers=[];previous_tangent=None;previous_normal=None
    for row in range(segments+1):
        t=row/segments;point,width,depth=sample(points,t);centers.append(point)
        tangent=(sample(points,min(1,t+.0005))[0]-sample(points,max(0,t-.0005))[0]).normalized()
        if previous_tangent is None:normal=Vector((0,-1,0))
        else:normal=previous_tangent.rotation_difference(tangent)@previous_normal
        normal=(normal-tangent*normal.dot(tangent)).normalized()
        wide=tangent.cross(normal).normalized()
        previous_tangent=tangent.copy();previous_normal=normal.copy()
        for col in range(sides):
            a=math.tau*col/sides;s=math.sin(a)
            lens=math.copysign(abs(s)**.32,s)
            vertices.append(point+wide*(math.cos(a)*max(.0015,width))+normal*(lens*max(.002,depth)))
        if row:
            for col in range(sides):
                a=(row-1)*sides+col;b=(row-1)*sides+(col+1)%sides;c=row*sides+(col+1)%sides;d=row*sides+col
                faces.append((a,b,c,d))
    faces.append(tuple(reversed(range(sides))));faces.append(tuple(segments*sides+j for j in range(sides)))
    ob=mesh_object(name,vertices,faces,material)
    sub=ob.modifiers.new('Editable smooth strand surface','SUBSURF');sub.levels=1;sub.render_levels=2
    ob['construction']='Closed quad lens sections along an authored three-dimensional flow; no billboard.'
    if physics:strands.append((ob,points,segments,sides))
    return ob

# A continuous hat-like scalp shell with a real face opening and a closed rim.
vertices=[];faces=[];rows=22;cols=96
for inner in (False,True):
    for row in range(rows+1):
        t=row/rows
        for col in range(cols):
            a=math.tau*col/cols;front=max(0,math.cos(a));back=max(0,-math.cos(a))
            edge=.34*front**3-.40*(1-front**3)-.08*back
            latitude=t*math.acos(max(-1,min(1,(edge-.20)/.66)))
            inset=.028 if inner else 0
            rx=.735-inset;ry=(.435 if math.cos(a)>0 else .535)-inset;rz=.66-inset
            vertices.append((rx*math.sin(latitude)*math.sin(a),-.015-ry*math.sin(latitude)*math.cos(a),.20+rz*math.cos(latitude)))
base=(rows+1)*cols
for inner in (False,True):
    offset=base if inner else 0
    for row in range(rows):
        for col in range(cols):
            a=offset+row*cols+col;b=offset+row*cols+(col+1)%cols;c=b+cols;d=a+cols
            faces.append((d,c,b,a) if inner else (a,b,c,d))
for col in range(cols):
    a=rows*cols+col;b=rows*cols+(col+1)%cols;faces.append((a,b,b+base,a+base))
scalp=mesh_object('Continuous scalp / full side and back volume',vertices,faces,blue)
scalp['role']='Complete scalp shell, with face opening; never a posterior half-card.'

# Main forked central bangs and layered cheek-framing locks.
strand('Central bangs / broad flow',[(-.06,-.13,.84,.06,.04),(.02,-.36,.62,.22,.055),(.05,-.43,.28,.20,.055),(.04,-.42,.02,.10,.045),(-.01,-.43,-.06,.012,.015)])
strand('Central bangs / fork tip',[(.06,-.42,.21,.10,.04),(.10,-.43,.06,.10,.04),(.17,-.43,-.055,.012,.012)],segments=20)
for sign,label in [(-1,'L'),(1,'R')]:
    def mirror(p):return[(x*sign,y,z,w,d) for x,y,z,w,d in p]
    strand(label+' inner fringe',mirror([(.18,-.15,.79,.09,.05),(.39,-.34,.58,.18,.065),(.45,-.40,.24,.16,.065),(.52,-.34,-.13,.16,.065),(.35,-.30,-.29,.025,.025)]))
    strand(label+' outer cheek lock',mirror([(.34,-.02,.73,.08,.06),(.59,-.24,.46,.18,.08),(.61,-.29,.10,.17,.08),(.62,-.24,-.23,.16,.075),(.47,-.18,-.40,.014,.015)]))
    strand(label+' temple lock',mirror([(.48,.06,.61,.09,.06),(.69,-.08,.33,.13,.075),(.71,-.11,-.04,.12,.07),(.65,-.06,-.36,.045,.04)]))
    # Back locks have substantial depth and independent flow throughout turns.
    strand(label+' posterior outer curl',mirror([(.44,.20,.53,.12,.11),(.62,.32,.03,.22,.16),(.63,.34,-.48,.23,.17),(.83,.24,-.73,.19,.14),(.63,.14,-.96,.15,.12),(.80,.09,-1.02,.07,.07),(.65,.05,-1.16,.012,.014)]),tipblue,segments=48)
    strand(label+' posterior inner curl',mirror([(.29,.39,.60,.12,.10),(.43,.47,.08,.23,.16),(.43,.46,-.45,.23,.17),(.59,.34,-.70,.19,.14),(.38,.26,-.93,.16,.11),(.53,.20,-1.04,.055,.055),(.39,.17,-1.13,.014,.014)]),tipblue,segments=44)
    strand(label+' side outward curl',mirror([(.58,.04,.12,.10,.08),(.68,.08,-.28,.15,.12),(.86,.03,-.46,.16,.12),(.86,-.02,-.69,.12,.09),(.70,-.05,-.72,.015,.02)]),tipblue,segments=32)
strand('Center posterior overlapping flow',[(0,.43,.58,.15,.10),(0,.52,.12,.28,.16),(0,.51,-.32,.28,.15),(.06,.43,-.66,.24,.14),(-.04,.33,-.94,.17,.10),(.04,.29,-1.07,.02,.02)],tipblue,segments=44)

# Complete three-dimensional scalloped maid band, sitting across the scalp.
vertices=[];faces=[];steps=120;across=8
for back in (False,True):
    for row in range(steps+1):
        a=math.pi*row/steps;scallop=.5+.5*math.cos(a*20)
        for col in range(across+1):
            u=col/across
            radius_x=.735+u*(.105+.015*scallop)
            radius_z=.680+u*(.090+.020*scallop)
            fold=.032*math.cos(a*20)*(u**.65)
            vertices.append((radius_x*math.cos(a),-.045+fold+(.006 if back else 0),.17+radius_z*math.sin(a)))
layer=(steps+1)*(across+1)
for back in (False,True):
    offset=layer if back else 0
    for row in range(steps):
        for col in range(across):
            a0=offset+row*(across+1)+col;b0=a0+across+1
            faces.append((a0,a0+1,b0+1,b0) if not back else (b0,b0+1,a0+1,a0))
boundary=[row*(across+1) for row in range(steps+1)]+[steps*(across+1)+col for col in range(1,across+1)]+[row*(across+1)+across for row in range(steps-1,-1,-1)]+[col for col in range(across-1,0,-1)]
for i,a in enumerate(boundary):b=boundary[(i+1)%len(boundary)];faces.append((a,b,b+layer,a+layer))
band=mesh_object('Scalloped folded-cloth maid headband / closed 6mm layer',vertices,faces,ivory)
band_sub=band.modifiers.new('Soft sewn ruffle folds','SUBSURF');band_sub.levels=1;band_sub.render_levels=1

# Fins and bows are closed solids, with ivory lower fin surfaces.
for sign,label in [(-1,'L'),(1,'R')]:
    outline=[(.65,-.015),(.76,-.055),(.99,-.09),(1.03,-.11),(.98,-.145),(.95,-.19),(.90,-.17),(.87,-.22),(.82,-.18),(.77,-.20),(.72,-.15),(.67,-.14)]
    verts=[]
    for y in (-.08,-.04):
        for x,z in outline:verts.append((sign*x,y,z))
    n=len(outline);verts.extend([(sign*.835,-.105,-.115),(sign*.835,-.04,-.115)])
    faces=[(2*n,(i+1)%n,i) for i in range(n)]+[(2*n+1,n+i,n+(i+1)%n) for i in range(n)]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    fin=mesh_object(label+' fin ear / closed volume',verts,faces,blue);fin.data.materials.append(ivory)
    for polygon in fin.data.polygons:
        if polygon.center.z<-.115:polygon.material_index=1
    bevel=fin.modifiers.new('Soft fin edge','BEVEL');bevel.width=.008;bevel.segments=3
    center=Vector((sign*.70,-.40,.16))
    for side in (-1,1):
        # Pinched, filled fabric lobes rather than circular goggle-like rings.
        contour=[(0,.028),(.055,.068),(.094,.052),(.090,-.053),(.055,-.066),(0,-.028)]
        verts=[]
        for back in (False,True):
            for x,z in contour:verts.append(tuple(center+Vector((sign*side*x,.010 if back else -.006,z))))
        n=len(contour);verts.extend([tuple(center+Vector((sign*side*.051,-.040,0))),tuple(center+Vector((sign*side*.051,.020,0)))])
        faces=[(2*n,i,(i+1)%n) for i in range(n)]+[(2*n+1,n+(i+1)%n,n+i) for i in range(n)]+[(i,n+i,n+(i+1)%n,(i+1)%n) for i in range(n)]
        lobe=mesh_object(label+' folded butterfly bow lobe '+str(side),verts,faces,bowmat)
        bevel=lobe.modifiers.new('Rounded folded fabric edge','BEVEL');bevel.width=.006;bevel.segments=3
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=1,location=center)
    knot=bpy.context.object;knot.name=label+' bow knot';knot.scale=(.028,.027,.045);knot.data.materials.append(bowmat);knot.parent=head;parts.append(knot)

strand('Hook ahoge',[(0,-.03,.81,.035,.025),(.035,-.04,1.02,.064,.035),(-.10,-.025,1.16,.066,.036),(-.33,-.015,1.10,.058,.03),(-.40,-.03,.97,.035,.024),(-.34,-.05,.94,.008,.01)],segments=44,sides=14)

# Every deforming lock has a true bone chain; no permanent time-sine drivers.
arm=bpy.data.armatures.new('Hair deformation skeleton');rig=bpy.data.objects.new('HairRig',arm);scene.collection.objects.link(rig);rig.parent=head
bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
anchor=arm.edit_bones.new('Hair.HeadAnchor');anchor.head=(0,0,0);anchor.tail=(0,0,.12)
specs=[]
for index,(ob,points,segments,sides) in enumerate(strands):
    chain=[]
    for j,(start,end) in enumerate([(0,.34),(.34,.68),(.68,1)]):
        bone=arm.edit_bones.new(f'Hair.{index:02d}.{j}');bone.head=sample(points,start)[0];bone.tail=sample(points,end)[0]
        if (bone.tail-bone.head).length<.015:bone.tail.z-=.03
        bone.parent=chain[-1] if chain else anchor;bone.use_connect=bool(chain);chain.append(bone)
    specs.append((ob,points,segments,sides,[b.name for b in chain]))
bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)
for ob,points,segments,sides,names in specs:
    groups=[ob.vertex_groups.new(name=name) for name in names]
    for row in range(segments+1):
        t=row/segments;weights=[]
        for j,c in enumerate([.15,.50,.84]):weights.append(max(0,1-abs(t-c)/.35))
        total=sum(weights) or 1
        for j,w in enumerate(weights):
            if w:groups[j].add([row*sides+k for k in range(sides)],w/total,'REPLACE')
    modifier=ob.modifiers.new('Deform from actual hair bones','ARMATURE');modifier.object=rig
    bpy.context.view_layer.objects.active=ob;bpy.ops.object.modifier_move_up(modifier=modifier.name)
    for name in names:
        bone=rig.pose.bones[name];limit=bone.constraints.new('LIMIT_ROTATION');limit.owner_space='LOCAL'
        limit.use_limit_x=limit.use_limit_y=limit.use_limit_z=True;limit.min_x=limit.min_y=-.45;limit.max_x=limit.max_y=.45;limit.min_z=-.25;limit.max_z=.25

# Real surface coordinates carry the pigment with the skinned hair. These are
# ordinary UV attributes on closed volumes, not an image or a camera card.
for ob in parts:
    if ob.type!='MESH':continue
    uv_xz=ob.data.uv_layers.new(name='HairHeadXZ')
    uv_y=ob.data.uv_layers.new(name='HairHeadDepth')
    to_head=head.matrix_world.inverted()@ob.matrix_world
    for loop in ob.data.loops:
        p=to_head@ob.data.vertices[loop.vertex_index].co
        uv_xz.data[loop.index].uv=(p.x,p.z)
        uv_y.data[loop.index].uv=(p.y,0)
    ob['native_hair_uv']='TEXCOORD_0=(HeadRoot rest X,Z); TEXCOORD_1=(HeadRoot rest Y,0), metres, Blender frame.'

# Authored shading normals keep a continuous crown instead of a sequence of
# inflated tubes.  These affect light only; the closed rigged surface remains
# unchanged and is still the contact/shape source.  Normal editing is baked
# after subdivision so the runtime receives the same vectors.
for ob in parts:
    if ob.type!='MESH':continue
    sub=next((m for m in ob.modifiers if m.type=='SUBSURF'),None)
    if sub:
        bpy.context.view_layer.objects.active=ob
        bpy.ops.object.modifier_apply(modifier=sub.name)
    if not any(key in ob.name for key in ('scalp','fringe','Central bangs','cheek lock','temple lock','posterior')):continue
    ob.data.update()
    authored=[]
    for corner in ob.data.loops:
        p=ob.data.vertices[corner.vertex_index].co
        n=Vector(ob.data.corner_normals[corner.index].vector)
        ry=.435 if p.y<0 else .535
        scalp_normal=Vector((p.x/(.735**2),(p.y+.015)/(ry**2),(p.z-.20)/(.66**2))).normalized()
        crown=max(0,min(1,(p.z-.20)/.45))
        frontal=any(key in ob.name for key in ('fringe','Central bangs','cheek lock','temple lock'))
        amount=(.55+.22*crown) if frontal else .80*crown
        # Never point a back face through its own geometry; blend only the
        # outward-facing shading fan, preserving true backs and silhouettes.
        if n.dot(scalp_normal)>.10:n=(n*(1-amount)+scalp_normal*amount).normalized()
        authored.append(tuple(n))
    ob.data.normals_split_custom_set(authored)
    ob['shading_normals']='Edited crown/face flow; no geometry flattening or billboard.'

# Subtle, rooted pigment sheen. Coordinates follow HeadRoot and the actual
# deformed material, rather than a screen-aligned image or a rotating card.
for material in (blue,tipblue):
    n=material.node_tree.nodes;l=material.node_tree.links
    emission=next(item for item in n if item.bl_idname=='ShaderNodeEmission')
    original=emission.inputs['Color'].links[0].from_socket
    coord=n.new('ShaderNodeUVMap');coord.uv_map='HairHeadXZ'
    xyz=n.new('ShaderNodeSeparateXYZ');l.new(coord.outputs['UV'],xyz.inputs[0])
    depth=n.new('ShaderNodeUVMap');depth.uv_map='HairHeadDepth'
    depth_xyz=n.new('ShaderNodeSeparateXYZ');l.new(depth.outputs['UV'],depth_xyz.inputs[0])
    def math_node(op,a=None,b=None):
        item=n.new('ShaderNodeMath');item.operation=op
        for index,value in enumerate((a,b)):
            if value is None:continue
            if isinstance(value,(int,float)):item.inputs[index].default_value=value
            else:l.new(value,item.inputs[index])
        return item.outputs[0]
    glints=[(-.52,.43,.075,.031),(-.36,.49,.032,.025),(-.21,.515,.020,.030),(-.045,.50,.085,.043),(.095,.50,.021,.027),(.24,.47,.024,.030),(.43,.425,.056,.025),(.56,.39,.021,.021)]
    cluster=0.0
    for cx,cz,rx,rz in glints:
        dx=math_node('DIVIDE',math_node('SUBTRACT',xyz.outputs['X'],cx),rx)
        dz=math_node('DIVIDE',math_node('SUBTRACT',xyz.outputs['Y'],cz),rz)
        distance=math_node('ADD',math_node('MULTIPLY',dx,dx),math_node('MULTIPLY',dz,dz))
        patch=n.new('ShaderNodeMapRange');patch.clamp=True;patch.interpolation_type='SMOOTHERSTEP'
        l.new(distance,patch.inputs['Value']);patch.inputs['From Min'].default_value=.70;patch.inputs['From Max'].default_value=1.15;patch.inputs['To Min'].default_value=.40;patch.inputs['To Max'].default_value=0
        cluster=math_node('MAXIMUM',cluster,patch.outputs[0])
    front=math_node('LESS_THAN',depth_xyz.outputs['X'],-.24)
    weight=math_node('MULTIPLY',cluster,front)
    mix=n.new('ShaderNodeMixRGB');mix.blend_type='MIX';l.new(weight,mix.inputs[0]);l.new(original,mix.inputs[1]);mix.inputs[2].default_value=color((78,107,157))
    l.new(mix.outputs[0],emission.inputs['Color'])
    material['native_hair_sheen']=json.dumps({'coordinates':'HeadRoot rest XYZ Blender Z up, metres','uv0':'Head rest X,Z','uv1':'Head rest Y,0','ellipses':glints,'innerSquaredRadius':.70,'outerSquaredRadius':1.15,'strength':.40,'frontYMax':-.24,'colorSRGB':[78,107,157]})

# A render-only inverted hull supplies drawn contours. It is not a physical
# collision surface and is replaced by an outline pass in the native runtime.
ink=bpy.data.materials.new('Hair drawn contour / native render only');ink.use_nodes=True;ink.use_backface_culling=True
ink.diffuse_color=color((14,23,42));nodes=ink.node_tree.nodes;nodes.clear();em=nodes.new('ShaderNodeEmission');em.inputs['Color'].default_value=color((14,23,42));out=nodes.new('ShaderNodeOutputMaterial');ink.node_tree.links.new(em.outputs[0],out.inputs[0])
for original in list(parts):
    if original.type!='MESH':continue
    outline=original.copy();outline.data=original.data.copy();scene.collection.objects.link(outline);outline.name='INK / '+original.name
    outline.data.materials.clear();outline.data.materials.append(ink)
    bm=bmesh.new();bm.from_mesh(outline.data);bmesh.ops.reverse_faces(bm,faces=list(bm.faces));bm.to_mesh(outline.data);bm.free()
    for polygon in outline.data.polygons:polygon.material_index=0
    displacement=outline.modifiers.new('Render contour width','DISPLACE');displacement.direction='NORMAL';displacement.strength=-.0018;displacement.mid_level=0
    outline['native_render_only']=True

scene.render.engine='BLENDER_EEVEE_NEXT';scene.render.resolution_x=640;scene.render.resolution_y=640;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True
scene.world=bpy.data.worlds.new('Neutral studio world');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.3,.33,.38,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.35
for name,location,power,size in [('Key',(-3,-4,5),450,4),('Fill',(4,-2,2),220,3),('Rim',(1,3,4),300,3)]:
    light=bpy.data.lights.new(name,'AREA');light.energy=power;light.shape='DISK';light.size=size;obj=bpy.data.objects.new(name,light);scene.collection.objects.link(obj);obj.location=location;obj.rotation_euler=(Vector((0,0,0))-obj.location).to_track_quat('-Z','Y').to_euler()
camera_data=bpy.data.cameras.new('Hair inspection');camera=bpy.data.objects.new('Hair inspection',camera_data);scene.collection.objects.link(camera);scene.camera=camera;camera_data.type='ORTHO';camera_data.ortho_scale=2.65
target=Vector((0,0,-.02))
outputs=[]
for name,direction in {'front':(0,-1,0),'side':(-1,0,0),'back':(0,1,0),'threequarter':(.65,-1,.10)}.items():
    camera.location=target+Vector(direction).normalized()*5;camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(RENDERS/(name+'.png'));bpy.ops.render.render(write_still=True);outputs.append(str(RENDERS/(name+'.png')))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT))
report={'asset':str(OUT),'coordinates':{'up':'+Z','front':'-Y','HeadRoot':[0,0,0]},'meshes':len(parts),'vertices':sum(len(o.data.vertices) for o in parts),'hairBones':len(arm.bones),'deformingLocks':len(strands),'imageCards':0,'imageTextures':0,'rigged':True,'physicsStatus':'Native constraint-ready bone chains; dynamic rigid-body/soft-body simulation is assembled and verified separately','renders':outputs,'visualStatus':'Needs actual multi-angle likeness review; not finished reference quality'}
report['variant']=VARIANT
(ROOT/('hair-'+VARIANT+'-manifest.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('NATIVE_HAIR',json.dumps(report,ensure_ascii=False))
