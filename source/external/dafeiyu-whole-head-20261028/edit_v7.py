from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head_v6.py');s=p.read_text('utf-8')
s=s.replace("for li,l in enumerate(me.loops):\n v=me.vertices", "texuv=me.uv_layers['SourceFaceUV'];mask=me.color_attributes['SourcePaintMask']\nfor li,l in enumerate(me.loops):\n v=me.vertices")
s=s.replace("dep=.035-.045*k","dep=.035-.028*k").replace("[.030,.042,.044,.057,.045,.028,.015,.0003],[.008,.012,.013,.015,.013,.010,.006,.0003]","[.030,.042,.044,.049,.030,.017,.008,.0003],[.010,.015,.017,.018,.014,.009,.004,.0003]")
s=s.replace("'native-v6.blend'","'native-v7.blend'").replace("f'head-v6-{ang:03}.png'","f'head-v7-{ang:03}.png'")
p.with_name('build_head_v7.py').write_text(s,'utf-8')
