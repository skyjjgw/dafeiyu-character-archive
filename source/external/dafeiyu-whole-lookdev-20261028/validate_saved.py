import bpy,sys,json
sys.path.insert(0,'D:/CodexTaskData/dafeiyu-whole-lookdev-20261028')
from apply_anime_style import geometry_signature
P='D:/CodexTaskData/dafeiyu-whole-lookdev-20261028/v1'
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-form-20261028/body/body-head-integration-v1.blend')
with bpy.data.libraries.load('D:/CodexTaskData/dafeiyu-whole-tail-20261028/tail-native.blend',link=False) as (src,dst):dst.collections=['DAFEIYU_TAIL_NATIVE']
for c in dst.collections:bpy.context.scene.collection.children.link(c)
before=geometry_signature(bpy.context.scene)
bpy.ops.wm.open_mainfile(filepath=P+'/whole-character-npr-candidate.blend')
after=geometry_signature(bpy.context.scene)
d=json.load(open(P+'/metadata.json'));d['native_geometry_unchanged']=before==after;d['native_geometry_and_uv_color_sha256']=after;d['limits'].insert(2,'Freestyle reports degenerate triangles/duplicate edges in this source candidate; script never changes source meshes.')
json.dump(d,open(P+'/metadata.json','w'),indent=2)
print('EXACT_NATIVE_GEOMETRY_UV_COLORS_UNCHANGED',before==after,'MESH_COUNT',len(after))
