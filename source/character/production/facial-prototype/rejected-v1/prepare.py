"""Inspect generated PNGs and package a non-destructive facial prototype."""
from pathlib import Path
from PIL import Image
import hashlib, json, math, struct, wave, zipfile
ROOT=Path(__file__).resolve().parent
manifest=json.loads((ROOT/'generation-manifest.json').read_text(encoding='utf-8'))
targets={'eyes-open':[438,493,308,83],'eyes-closed':[438,545,308,32],'brows':[451,477,282,24],'mouth-closed':[573,628,38,8],'mouth-open':[571,619,42,25]}
for item in manifest['assets']:
    path=ROOT/'assets'/item['file']
    with Image.open(path) as image:
        if image.mode!='RGBA':raise ValueError('Expected real alpha: '+item['id'])
        alpha=image.getchannel('A')
        bbox=alpha.point(lambda x:255 if x>16 else 0).getbbox()
        item.update(width=image.width,height=image.height,alpha_extrema=alpha.getextrema(),visible_bbox=bbox)
        alpha_min,alpha_max=alpha.getextrema()
        if not bbox or alpha_min!=0 or alpha_max<128:raise ValueError('Invalid transparent part: '+item['id'])
    item.update(bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest())
    if item['id']!='base':item['target']=targets[item['id']]
manifest.update(canvas={'width':1144,'height':1375},status='six_independent_png_assets_facial_prototype_only',limitations=['Body, hair, tail and face skin are still combined in the base.','Paired eyes are not separated into sclera, iris and eyelids.','This is a raster facial prototype, not a Cubism model or completed layered PSD.'])
(ROOT/'generation-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
layout={'canvas':manifest['canvas'],'assets':[{k:v for k,v in x.items() if k in ['id','file','width','height','visible_bbox','target']} for x in manifest['assets']]}
(ROOT/'layers.json').write_text(json.dumps(layout,indent=2)+'\n',encoding='utf-8')
with wave.open(str(ROOT/'test-pulses.wav'),'wb') as audio:
    audio.setnchannels(1);audio.setsampwidth(2);audio.setframerate(22050)
    samples=[]
    for n in range(22050*3):
        t=n/22050
        on=(t%0.65)<0.33
        envelope=0.2*min(1,(t%0.65)*30)*min(1,max(0,(0.33-t%0.65)*30)) if on else 0
        samples.append(struct.pack('<h',int(32767*envelope*math.sin(2*math.pi*220*t))))
    audio.writeframes(b''.join(samples))
print(json.dumps({'assets':len(manifest['assets']),'canvas':layout['canvas'],'targets':targets},ensure_ascii=False))
