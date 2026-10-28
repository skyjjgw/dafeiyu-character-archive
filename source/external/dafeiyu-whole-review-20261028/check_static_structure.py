"""Read-only local HTTP and GLB structure check; no visual acceptance claim."""
import hashlib,json,struct,urllib.request
from pathlib import Path
P=Path('D:/CodexTaskData/dafeiyu-whole-review-20261028/master-v2')
manifest=json.loads((P/'manifest.json').read_text(encoding='utf-8'))
data=(P/'actual.glb').read_bytes();magic,version,total=struct.unpack_from('<III',data)
assert magic==0x46546c67 and version==2 and total==len(data)
jl,jt=struct.unpack_from('<II',data,12);g=json.loads(data[20:20+jl]);off=20+jl;bl,bt=struct.unpack_from('<II',data,off);binary=data[off+8:off+8+bl]
assert jt==0x4e4f534a and bt==0x004e4942
assert not g.get('animations') and not g.get('skins') and not g.get('cameras')
assert 'KHR_lights_punctual' not in g.get('extensionsUsed',[])
assert all('uri' not in x for x in g.get('buffers',[])+g.get('images',[]))
for v in g.get('bufferViews',[]):assert v.get('byteOffset',0)+v['byteLength']<=len(binary)
triangles=0;attributes={};constant_white=0;colored=0
for mesh in g['meshes']:
 for p in mesh['primitives']:
  assert p.get('mode',4)==4 and 'POSITION' in p['attributes']
  triangles+=g['accessors'][p['indices']]['count']//3 if 'indices' in p else g['accessors'][p['attributes']['POSITION']]['count']//3
  for key in p['attributes']:attributes[key]=attributes.get(key,0)+1
  if 'COLOR_0' in p['attributes']:
   a=g['accessors'][p['attributes']['COLOR_0']];v=g['bufferViews'][a['bufferView']]
   if a['componentType'] in (5126,5123,5121):
    code,component_size,scale={5126:('f',4,1),5123:('H',2,65535),5121:('B',1,255)}[a['componentType']]
    pos=v.get('byteOffset',0)+a.get('byteOffset',0);step=v.get('byteStride',component_size*(4 if a['type']=='VEC4' else 3))
    values=[tuple(x/scale for x in struct.unpack_from('<3'+code,binary,pos+i*step)) for i in range(a['count'])]
    if any(abs(x-1)>.001 for rgb in values for x in rgb):colored+=1
    else:constant_white+=1
paths=['production/whole-character-rebuild/','production/whole-character-rebuild/viewer.mjs','production/whole-character-rebuild/review-work/master-v2/actual.glb','production/whole-character-rebuild/review-work/master-v2/manifest.json','production/rig3d-prototype/vendor/three.module.js','production/rig3d-prototype/vendor/three.core.js','production/rig3d-prototype/vendor/package/examples/jsm/controls/OrbitControls.js','production/character3d/ai-shape-study/vendor/loaders/GLTFLoader.js','production/character3d/ai-shape-study/vendor/utils/BufferGeometryUtils.js','production/appearance-preserving-geometry/hair-continuity-v1/reports/root-front.png']
http=[]
for p in paths:
 req=urllib.request.Request('http://127.0.0.1:4334/'+p,method='HEAD')
 with urllib.request.urlopen(req) as r:http.append({'path':p,'status':r.status,'content_type':r.headers.get('Content-Type'),'bytes':r.headers.get('Content-Length')})
assert hashlib.sha256(data).hexdigest()==manifest['glb_sha256']
assert len(g['meshes'])==manifest['visible_source_meshes']
assert manifest['source_unchanged'] and manifest['geometry_unchanged_after_material_conversion']
assert all(not any(x in r['name'].lower() for x in ('frozen guide','raw guide')) for r in manifest['objects'])
report={'finalAccepted':False,'root_browser_visual_review_required':True,'http':http,'glb_bytes':len(data),'glb_sha256':manifest['glb_sha256'],'meshes':len(g['meshes']),'triangles':triangles,'images':len(g.get('images',[])),'attributes_by_primitive':attributes,'colored_vertex_primitives':colored,'white_vertex_primitives_for_texture_or_white_material':constant_white,'no_external_asset_uris':True,'no_animation_skin_camera_lights':True,'buffer_view_bounds_valid':True,'source_file_and_snapshot_geometry_integrity':True}
(P/'structure-http-check.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
