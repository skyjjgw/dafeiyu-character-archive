import bpy,bmesh,json,sys,math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent.parent
SOURCE=Path(sys.argv[sys.argv.index('--input')+1])if'--input'in sys.argv else ROOT/'body-v4-base.blend'
bpy.ops.wm.open_mainfile(filepath=str(SOURCE));scene=bpy.context.scene;scene.frame_set(1);rig=next(o for o in scene.objects if o.type=='ARMATURE'and 'Head'in o.data.bones);body=next(o for o in scene.objects if o.name.startswith('BODY continuous'));belly=bpy.data.objects['Whale embroidery - white belly']
def audit(obj,evaluated):
    owner=obj.evaluated_get(bpy.context.evaluated_depsgraph_get())if evaluated else obj;mesh=owner.to_mesh()if evaluated else obj.data;mesh.calc_loop_triangles();normals=mesh.corner_normals;bad=[]
    for tri in mesh.loop_triangles:
        points=[mesh.vertices[i].co for i in tri.vertices];cross=(points[1]-points[0]).cross(points[2]-points[0]);area=cross.length/2
        if area<1e-14:continue
        avg=sum((normals[i].vector for i in tri.loops),Vector()).normalized();dot=cross.normalized().dot(avg)
        if dot<-.05:bad.append({'poly':tri.polygon_index,'vertices':list(tri.vertices),'center':list(sum(points,Vector())/3),'dot':dot,'area':area})
    bm=bmesh.new();bm.from_mesh(mesh);volume=bm.calc_volume(signed=True);bm.free();usage={}
    for poly in mesh.polygons:
        ids=list(poly.vertices)
        for a,b in zip(ids,ids[1:]+ids[:1]):usage.setdefault(tuple(sorted((a,b))),[]).append((a,b))
    report={'vertices':len(mesh.vertices),'triangles':len(mesh.loop_triangles),'badNormalTriangles':len(bad),'bad':bad,'volume':volume,'boundary':sum(len(x)==1 for x in usage.values()),'nonmanifold':sum(len(x)>2 for x in usage.values()),'sharedEdgeSameDirection':sum(len(x)==2 and x[0]==x[1]for x in usage.values())}
    if evaluated:owner.to_mesh_clear()
    return report
reports={'source':str(SOURCE),'raw':audit(body,False),'rest':audit(body,True),'embroideryRest':audit(belly,True)}
palm={}
for side,sign in[('R',1),('L',-1)]:
    front=[];back=[]
    for face in body.data.polygons:
        c=sum((body.data.vertices[i].co for i in face.vertices),Vector())/len(face.vertices)
        if .625<sign*c.x<.755 and 1.025<c.z<1.09:
            if c.y<-.040:front.append(face.normal.y)
            if c.y>.008:back.append(face.normal.y)
    palm[side]={'frontFaceNormalY':front,'backFaceNormalY':back,'expectedFrontNegativeY':True,'frontOutwardCount':sum(y<0 for y in front),'frontInwardCount':sum(y>0 for y in front),'backOutwardCount':sum(y>0 for y in back),'backInwardCount':sum(y<0 for y in back)}
reports['rawPalmOrientation']=palm
ctrl=rig.pose.bones['CTRL-hand_ik.L'];m=ctrl.matrix.copy();m.translation=Vector((-.48,-.26,1.92));ctrl.matrix=m;ctrl['ik_fk']=1.;rig.update_tag();bpy.context.view_layer.update();reports['wave']=audit(body,True);reports['poseDeterminants']={name:rig.pose.bones[name].matrix.to_3x3().determinant()for name in['DEF-hand.L','DEF-hand.R','DEF-forearm.L','DEF-forearm.R']}
OUT=ROOT/('body-v4-geometry-audit-'+SOURCE.stem+'.json');OUT.write_text(json.dumps(reports,ensure_ascii=False,indent=2),encoding='utf8');print('BODY_V4_AUDIT '+json.dumps({k:{x:v[x]for x in['vertices','badNormalTriangles','boundary','nonmanifold','sharedEdgeSameDirection']}for k,v in reports.items()if isinstance(v,dict)and 'badNormalTriangles'in v}))
