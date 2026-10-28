"""Analyze two actual renders without altering either image."""
from pathlib import Path
from PIL import Image
import numpy as np
import hashlib,json

ROOT=Path(__file__).resolve().parent
SOURCE=ROOT/'selected-neutral.png'
TARGET=ROOT.parent/'appearance-preserving-runtime'/'reports'/'selected-appearance-godot.png'
a=np.array(Image.open(SOURCE).convert('RGBA'));b=np.array(Image.open(TARGET).convert('RGBA'))
assert a.shape==b.shape,(a.shape,b.shape)
am=a[:,:,3]>16;bm=b[:,:,3]>16
union=am|bm;both=am&bm
opaque=(a[:,:,3]>250)&(b[:,:,3]>250)
core=opaque.copy()
for dy in range(-2,3):
    for dx in range(-2,3):core&=np.roll(opaque,(dy,dx),(0,1))
delta=np.abs(a[:,:,:3].astype(np.int16)-b[:,:,:3].astype(np.int16))
report={'scope':'Same-view static transfer analysis only. Does not certify identity for other views, natural motion, complete anatomy or physical behavior.',
        'source':str(SOURCE),'target':str(TARGET),'sha256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest()for p in (SOURCE,TARGET)},
        'size':[a.shape[1],a.shape[0]],'foregroundIoU':float(both.sum()/max(1,union.sum())),
        'foregroundPixels':{'source':int(am.sum()),'target':int(bm.sum()),'intersection':int(both.sum()),'union':int(union.sum())},
        'opaqueInteriorPixels':int(core.sum()),'meanAbsoluteRGBError':delta[core].mean(axis=0).tolist(),
        'medianAbsoluteRGBError':np.median(delta[core],axis=0).tolist(),'p95AbsoluteRGBError':np.percentile(delta[core],95,axis=0).tolist(),
        'opaqueInteriorFractionAnyChannelOver8':float((delta[core].max(axis=1)>8).mean()),
        'opaqueInteriorFractionAnyChannelOver16':float((delta[core].max(axis=1)>16).mean()),
        'alphaDifferenceMeanOnUnion':float(np.abs(a[:,:,3].astype(np.int16)-b[:,:,3].astype(np.int16))[union].mean())}
(ROOT/'selected-look-transfer-analysis.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in report.items()if k not in ('source','target','sha256')},indent=2))
