"""Numeric comparison only; neither input image nor source artwork is edited."""
from pathlib import Path
import json
import hashlib
import argparse
import numpy as np
from PIL import Image,ImageFilter

ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser()
parser.add_argument('--source',type=Path,default=ROOT.parent/'appearance-baseline-20261027/selected-neutral.png')
parser.add_argument('--capture',type=Path,default=ROOT/'reports/selected-appearance-godot.png')
parser.add_argument('--suffix',default='')
parser.add_argument('--output',type=Path,default=ROOT/'reports/source-godot-pixel-comparison.json')
args=parser.parse_args()
source=args.source
capture=args.capture
a=np.asarray(Image.open(source).convert('RGBA')).astype(np.float64)
b=np.asarray(Image.open(capture).convert('RGBA')).astype(np.float64)
assert a.shape==b.shape==(704,640,4)
opaque=(a[:,:,3]>250)&(b[:,:,3]>250)
interior=np.asarray(Image.fromarray((opaque*255).astype('uint8')).filter(ImageFilter.MinFilter(5)))>0
union=(a[:,:,3]>8)|(b[:,:,3]>8)
d=np.abs(a-b)
y,x=np.indices(interior.shape)
regions={'opaqueInterior':interior,'faceApproximateRectangle':interior&(x>=180)&(x<370)&(y>=160)&(y<325),'bodyApproximateRectangle':interior&(y>=325)}
statistics={}
for name,mask in regions.items():
    values=d[:,:,:3][mask]
    statistics[name]={'pixels':int(mask.sum()),'meanAbsRGB':values.mean(axis=0).tolist(),'p95AbsRGB':np.percentile(values,95,axis=0).tolist(),'medianSignedRGB':np.median((b-a)[:,:,:3][mask],axis=0).tolist(),'fractionAnyChannelGreaterThan16':float((values.max(axis=1)>16).mean())}
result={'schema':'dafeiyu.static-pixel-comparison.v1','sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'captureSha256':hashlib.sha256(capture.read_bytes()).hexdigest(),'resolution':[640,704],'alphaIoU128':float(((a[:,:,3]>128)&(b[:,:,3]>128)).sum()/((a[:,:,3]>128)|(b[:,:,3]>128)).sum()),'meanAbsAlphaUnion':float(d[:,:,3][union].mean()),'statistics':statistics,'scope':'Static orthographic/manual/t0 source and Godot comparison. Region rectangles are approximate, not semantic material masks. Exact visual equality, natural motion, physics, and all-angle identity are not asserted.'}
if (ROOT/f'reports/material-ids{args.suffix}.png').exists():
    ids=np.asarray(Image.open(ROOT/f'reports/material-ids{args.suffix}.png').convert('RGBA')).astype(int)
    info=json.loads((ROOT/f'reports/imported-scene{args.suffix}.json').read_text(encoding='utf-8'))
    material_rows=[]
    for material in info.get('material_debug_ids',[]):
        matching=(np.abs(ids[:,:,:3]-np.array(material['rgb'])).max(axis=2)<=1)&(ids[:,:,3]>250)&opaque
        matching=np.asarray(Image.fromarray((matching*255).astype('uint8')).filter(ImageFilter.MinFilter(3)))>0
        if matching.sum()<8:continue
        values=d[:,:,:3][matching]
        spec=material['source']
        material_rows.append({'sourceMaterial':material['index'],'sourceName':spec['sourceName'],'type':spec['type'],'image':spec['image'],'pixels':int(matching.sum()),'meanAbsRGB':values.mean(axis=0).tolist(),'p95AbsRGB':np.percentile(values,95,axis=0).tolist(),'fractionAnyGreaterThan16':float((values.max(axis=1)>16).mean())})
    result['materialRegions']=sorted(material_rows,key=lambda row:max(row['meanAbsRGB']),reverse=True)
    result['materialMaskLimit']='GPU flat-ID diagnostic pass retains source alpha/cutoff. Only exact stable ID interiors are counted; partially blended mixed-ID pixels are excluded.'
args.output.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,indent=2))
