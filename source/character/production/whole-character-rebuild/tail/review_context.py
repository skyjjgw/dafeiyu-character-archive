import bpy,json,math,bmesh
from pathlib import Path
from mathutils import Vector
P=Path('D:/CodexTaskData/dafeiyu-whole-tail-20261028')
bpy.ops.wm.open_mainfile(filepath=str(P/'tail-native.blend'))
source='D:/CodexTaskData/dafeiyu-whole-form-20261028/body/body-native-v7.blend'
with bpy.data.libraries.load(source,link=False) as (a,b):
    b.collections=[n for n in a.collections if n[:2] in ['01','02','03','04','05','06']]
for c in b.collections:
    if c:bpy.context.scene.collection.children.link(c)
s=bpy.context.scene;s.cycles.samples=24;s.render.resolution_x=700;s.render.resolution_y=780
cam=s.camera;cam.data.ortho_scale=.83;target=Vector((.025,.07,-.21))
for angle in (0,45,90,180):
    a=math.radians(angle);cam.location=target+Vector((2*math.cos(a),2*math.sin(a),.05));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
    s.render.filepath=str(P/'renders'/f'body-tail-context-{angle:03d}.png');bpy.ops.render.render(write_still=True)
# Re-open actual saved native file independently and audit connected topology.
bpy.ops.wm.open_mainfile(filepath=str(P/'tail-native.blend'))
o=bpy.data.objects.get('Whale_Tail_Continuous_Editable');bm=bmesh.new();bm.from_mesh(o.data)
unvisited=set(bm.verts);counts=[]
while unvisited:
    pending=[unvisited.pop()];count=0
    while pending:
        v=pending.pop();count+=1
        for e in v.link_edges:
            q=e.other_vert(v)
            if q in unvisited:unvisited.remove(q);pending.append(q)
    counts.append(count)
bounds=[[min(v.co[k] for v in o.data.vertices) for k in range(3)],[max(v.co[k] for v in o.data.vertices) for k in range(3)]]
result={'native_reopen':True,'mesh_objects_in_tail_collection':sum(o.type=='MESH' for o in bpy.data.collections['DAFEIYU_TAIL_NATIVE'].objects),'components':counts,'boundary_edges':sum(e.is_boundary for e in bm.edges),'nonmanifold_edges':sum(not e.is_manifold for e in bm.edges),'bounds':bounds,'world_transform_identity':all(abs(o.matrix_world[i][j]-(1 if i==j else 0))<1e-8 for i in range(4) for j in range(4)),'rigs':len([o for o in bpy.context.scene.objects if o.type=='ARMATURE']),'finalAccepted':False}
bm.free();(P/'native-reopen-audit.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
m=json.loads((P/'tail-native-manifest.json').read_text());m['geometry']['components']=len(counts);m['nativeReopenAudit']=str(P/'native-reopen-audit.json');m['contextBody']=source;m['contextViews']=[str(P/'renders'/f'body-tail-context-{a:03d}.png') for a in (0,45,90,180)];(P/'tail-native-manifest.json').write_text(json.dumps(m,indent=2))
