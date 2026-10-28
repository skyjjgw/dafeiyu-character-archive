"""Generate GPU color-space cache, never repaint or alter the original images.

Input pixels are dumped by Godot's actual JPEG/PNG decoder. RGB is mathematically
decoded to linear float16 before filtering/mip generation, matching an sRGB GPU
texture's decode-before-filter semantics. Alpha remains linear.
"""
from pathlib import Path
import json
import hashlib
import numpy as np

ROOT=Path(__file__).resolve().parent
entries=json.loads((ROOT/'reports/decoded-source-images.json').read_text(encoding='utf-8'))
source=json.loads((ROOT/'assets/source-rendering.json').read_text(encoding='utf-8'))
rows=[]
for entry in entries:
    index=entry['index']
    assert entry['sourceSha256']==source['images'][index]['sha256']
    assert hashlib.sha256((ROOT/'assets'/source['images'][index]['name']).read_bytes()).hexdigest()==entry['sourceSha256']
    raw=(ROOT/'reports'/entry['name']).read_bytes()
    rgba=np.frombuffer(raw,dtype=np.uint8).reshape(entry['height'],entry['width'],4).astype(np.float32)/255
    rgb=rgba[:,:,:3]
    rgba[:,:,:3]=np.where(rgb<=0.04045,rgb/12.92,((rgb+0.055)/1.055)**2.4)
    floats=rgba.astype('<f2').tobytes()
    name=f"source-linear-{index}.rgba16f"
    (ROOT/'assets'/name).write_bytes(floats)
    rows.append({**entry,'linearCache':name,'decodedRGBA8Sha256':hashlib.sha256(raw).hexdigest(),'linearCacheSha256':hashlib.sha256(floats).hexdigest(),'bytes':len(floats),'format':'RGBA16F','rgb':'exact standard sRGB inverse transfer then float16 encoding; no artistic color correction','alpha':'original normalized linear alpha'})
(ROOT/'assets/linear-textures.json').write_text(json.dumps(rows,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'textures':len(rows),'bytes':sum(r['bytes'] for r in rows),'sourceImageBytesUnchanged':True},indent=2))
