"""Compare actual Godot CPU imported arrays with the embedded source accessors.

Godot compacts each primitive's referenced vertices. Match only to vertices used
by that source primitive; identical-position UV seams retain their UV identity.
"""
from pathlib import Path
import hashlib
import json
import re
import struct
import numpy as np

ROOT=Path(__file__).resolve().parent
file=(ROOT/'assets/selected-appearance.glb').read_bytes()
json_length=struct.unpack_from('<I',file,12)[0]
gltf=json.loads(file[20:20+json_length])
binary=file[20+json_length+8:]
source=json.loads((ROOT/'assets/source-rendering.json').read_text(encoding='utf-8'))
imported=json.loads((ROOT/'reports/imported-attributes.json').read_text(encoding='utf-8'))
import_bytes=(ROOT/'reports/imported-attributes.bin').read_bytes()
lookup={re.sub(r'[.:@/"%?\\]','_',m['name']):m for m in source['meshes']}

def accessor(index):
    a=gltf['accessors'][index]
    v=gltf['bufferViews'][a['bufferView']]
    offset=v.get('byteOffset',0)+a.get('byteOffset',0)
    dtype={5126:'<f4',5125:'<u4',5123:'<u2',5121:'u1'}[a['componentType']]
    width={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
    return np.frombuffer(binary,dtype=dtype,count=a['count']*width,offset=offset).reshape(-1,width)

def actual(chunk,width,dtype='<f4'):
    return np.frombuffer(import_bytes[chunk['offset']:chunk['offset']+chunk['length']],dtype=dtype).reshape(-1,width)

rows=[]
color_bytes=bytearray()
color_rows=[]
for mesh in imported['meshes']:
    original=lookup[mesh['node']]
    for surface_index,surface in enumerate(mesh['surfaces']):
        primitive=gltf['meshes'][original['mesh']]['primitives'][surface_index]
        expected_pos=accessor(primitive['attributes']['POSITION'])
        expected_uv=accessor(primitive['attributes']['TEXCOORD_0']) if 'TEXCOORD_0' in primitive['attributes'] else None
        expected_color=accessor(primitive['attributes']['COLOR_0']) if 'COLOR_0' in primitive['attributes'] else None
        actual_pos=actual(surface['positions'],3)
        actual_uv=actual(surface['uv'],2) if surface['uv'] else None
        actual_color=actual(surface['colors'],4) if surface['colors'] else None
        used=accessor(primitive['indices']).ravel()
        positions={}
        for i in np.unique(used):positions.setdefault(expected_pos[i].tobytes(),[]).append(int(i))
        missing=0
        max_uv=0.0
        max_color=0.0
        float_colors=np.ones((len(actual_pos),4),dtype='<f4') if expected_color is not None else None
        for i,p in enumerate(actual_pos):
            choices=positions.get(p.tobytes(),[])
            if not choices:
                missing+=1
                continue
            def identity_error(j):
                uv_error=float(np.abs(expected_uv[j]-actual_uv[i]).max()) if expected_uv is not None and actual_uv is not None else 0.0
                color_error=0.0
                if expected_color is not None and actual_color is not None:
                    color=expected_color[j]
                    if len(color)==3:color=np.append(color,1.0)
                    color_error=float(np.abs(color-actual_color[i]).max())
                return (uv_error,color_error)
            chosen=min(choices,key=identity_error)
            if expected_uv is not None and actual_uv is not None:
                max_uv=max(max_uv,float(np.abs(expected_uv[chosen]-actual_uv[i]).max()))
            if expected_color is not None and actual_color is not None:
                expected=expected_color[chosen]
                if len(expected)==3:expected=np.append(expected,1.0)
                max_color=max(max_color,float(np.abs(expected-actual_color[i]).max()))
                float_colors[i]=expected
        rows.append({'mesh':mesh['node'],'surface':surface_index,'sourceMaterial':surface['material'],'sourcePrimitiveIndices':len(used),'importedIndices':surface['indices']['length']//4,'importedVertices':len(actual_pos),'positionVerticesWithoutExactSourceMatch':missing,'maxUVError':max_uv,'maxColorError':max_color})
        if float_colors is not None:
            raw=float_colors.tobytes()
            color_rows.append({'node':mesh['node'],'surface':surface_index,'vertices':len(actual_pos),'offset':len(color_bytes),'length':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'positionsSha256':hashlib.sha256(actual_pos.tobytes()).hexdigest(),'uvSha256':hashlib.sha256(actual_uv.tobytes()).hexdigest() if actual_uv is not None else None})
            color_bytes.extend(raw)

result={'schema':'dafeiyu.godot-import-precision.v1','glbSha256':hashlib.sha256(file).hexdigest(),'surfaces':len(rows),'importedVertices':sum(r['importedVertices'] for r in rows),'positionVerticesWithoutExactSourceMatch':sum(r['positionVerticesWithoutExactSourceMatch'] for r in rows),'maxUVError':max(r['maxUVError'] for r in rows),'maxColorError':max(r['maxColorError'] for r in rows),'indexCountMismatches':sum(r['sourcePrimitiveIndices']!=r['importedIndices'] for r in rows),'rows':rows,'scope':'Actual Godot 4.7.2 imported CPU arrays with FORCE_DISABLE_MESH_COMPRESSION. This is not GPU skinning or visual equality proof.'}
(ROOT/'reports/imported-precision-comparison.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='rows'},indent=2))
assert result['positionVerticesWithoutExactSourceMatch']==0
assert result['maxUVError']==0
assert result['indexCountMismatches']==0
(ROOT/'assets/source-float-colors.bin').write_bytes(color_bytes)
(ROOT/'assets/source-float-colors.json').write_text(json.dumps({'glbSha256':result['glbSha256'],'format':'CUSTOM0 RGBA32F, original source linear vertex colors before ArrayMesh RGBA8 packing','bytes':len(color_bytes),'rows':color_rows},indent=2)+'\n',encoding='utf-8')
