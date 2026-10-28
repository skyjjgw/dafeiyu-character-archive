"""Validate canonical art and describe render-only facial differences; no pixel edits."""
from pathlib import Path
from PIL import Image
import hashlib,json
ROOT=Path(__file__).resolve().parent
manifest=json.loads((ROOT/'correction-v2-manifest.json').read_text(encoding='utf-8'))
canonical=ROOT/manifest['canonical']
source=ROOT.parent/'v1/neutral-front.png'
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert digest(canonical)==digest(source),'Canonical must stay byte-identical'
with Image.open(canonical) as im:
    width,height=im.size
    assert im.mode=='RGBA' and im.getchannel('A').getextrema()==(0,255)
patches=[]
for asset in manifest['assets']:
    path=ROOT/'assets/corrected-v2'/asset['file']
    with Image.open(path) as im:
        assert im.mode=='RGBA' and im.size==(width,height)
        asset.update(width=im.width,height=im.height,alpha_extrema=im.getchannel('A').getextrema())
    asset.update(bytes=path.stat().st_size,sha256=digest(path))
    shift=-4 if asset['id']=='blink' else -1
    roi=[[449,534,113,98],[603,534,112,98]] if asset['id']=='blink' else [[551,630,61,43]]
    patches.append({'id':asset['id'],'file':'assets/corrected-v2/'+asset['file'],'width':width,'height':height,'translate':[shift,0],'regions':roi})
manifest['canonical_sha256']=digest(canonical)
manifest['alignment']={'blink':[-4,0],'mouth-half':[-1,0],'mouth-open':[-1,0],'method':'Local template matching on unchanged nose/chin/collar/cheek; display translation only, no PNG resampling'}
(ROOT/'correction-v2-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
layout={'schema_version':2,'canvas':{'width':width,'height':height},'canonical':manifest['canonical'],'canonical_sha256':digest(canonical),'patches':patches}
tail_path=ROOT/'assets/tail-v3/tail-corrected.png'
if tail_path.exists():
    with Image.open(tail_path) as im:
        assert im.mode=='RGBA' and im.size==(width,height)
        assert im.getchannel('A').getextrema()==(0,255)
    layout['tail']={'file':'assets/tail-v3/tail-corrected.png','width':width,'height':height,'translate':[-2,-1],'replacement_polygon':[[700,930],[815,930],[815,860],[1120,860],[1120,1120],[700,1120]],'sha256':digest(tail_path),'status':'static_shape_correction_not_physics_rig'}
    tail_manifest=json.loads((ROOT/'tail-v3-manifest.json').read_text(encoding='utf-8'))
    tail_manifest.update(sha256=digest(tail_path),bytes=tail_path.stat().st_size,width=width,height=height,render_layout=layout['tail'])
    (ROOT/'tail-v3-manifest.json').write_text(json.dumps(tail_manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
color_path=ROOT/'assets/tail-v4/tail-color-corrected.png'
if color_path.exists():
    with Image.open(color_path) as im:
        assert im.mode=='RGBA' and im.size==(width,height)
        assert im.getchannel('A').getextrema()==(0,255)
    layout['tail']={'file':'assets/tail-v4/tail-color-corrected.png','width':width,'height':height,'translate':[-2,-1],'replacement_polygon':[[700,930],[815,930],[815,860],[1120,860],[1120,1120],[700,1120],[700,1080],[675,1080],[675,992],[700,992]],'sha256':digest(color_path),'status':'static_palette_and_shape_correction_not_physics_rig','revision':4}
    color_manifest=json.loads((ROOT/'tail-v4-manifest.json').read_text(encoding='utf-8'))
    color_manifest.update(sha256=digest(color_path),bytes=color_path.stat().st_size,width=width,height=height,render_layout=layout['tail'])
    (ROOT/'tail-v4-manifest.json').write_text(json.dumps(color_manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
blue_path=ROOT/'assets/tail-v5/tail-blue-reference.png'
if blue_path.exists():
    with Image.open(blue_path) as im:
        assert im.mode=='RGBA' and im.size==(width,height)
        assert im.getchannel('A').getextrema()==(0,255)
    layout['tail']={'file':'assets/tail-v5/tail-blue-reference.png','width':width,'height':height,'matrix':[0.7956183,-0.0003270,0.0003270,0.7956183,114.3206,132.1949],'replacement_polygon':[[700,930],[815,930],[815,860],[1120,860],[1120,1120],[700,1120],[700,1080],[675,1080],[675,992],[700,992]],'sha256':digest(blue_path),'status':'static_blue_palette_and_shape_correction_not_physics_rig','revision':5}
    blue_manifest=json.loads((ROOT/'tail-v5-manifest.json').read_text(encoding='utf-8'))
    blue_manifest.update(sha256=digest(blue_path),bytes=blue_path.stat().st_size,width=width,height=height,render_layout=layout['tail'],alignment={'method':'SIFT unchanged-art anchors and RANSAC similarity; SVG display transform only; PNG not resampled','inliers':248,'matches':367,'canonical_sha256':digest(canonical)})
    (ROOT/'tail-v5-manifest.json').write_text(json.dumps(blue_manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'layers.json').write_text(json.dumps(layout,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'canonical_sha256':digest(canonical),'identity':'unchanged original face','patches':len(patches)},ensure_ascii=False))
