from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head_v5.py');s=p.read_text('utf-8')
s=s.replace("edgeids=set(i for e,n in count.items() if n==1 for i in e)\nbkd=KDTree(len(edgeids))\nfor i,idx in enumerate(edgeids):bkd.insert(projected[idx],i)","pbm=bmesh.new();pbm.from_mesh(paint.data);bmesh.ops.remove_doubles(pbm,verts=pbm.verts,dist=.000001);boundary=[Vector((0,v.co.y,v.co.z)) for v in pbm.verts if v.is_boundary];pbm.free()\nbkd=KDTree(len(boundary))\nfor i,v in enumerate(boundary):bkd.insert(v,i)")
s=s.replace("sk.name='FACE__continuous head skin sockets oral lining and neck'","sk.name='FACE__continuous head skin sockets oral lining and neck'\nsub=sk.modifiers.new('Continuous skin curvature','SUBSURF');sub.levels=1;sub.render_levels=1")
s=s.replace("(.305,-.071,.207),(.297,-.089,.216)","(.305,-.071,.181),(.297,-.089,.195)")
s=s.replace("(.274,y(.143),.161),(.277,y(.118),.147)","(.287,y(.143),.130),(.292,y(.118),.112)")
s=s.replace("(.237,y(.182),.111),(.251,y(.133),.105)","(.278,y(.174),.105),(.287,y(.127),.101)")
# Replace curls with broad, individually placed waves and fan tails, staggered across both width and depth.
a=s.index(' for k in range(3):');b=s.index(' # Inner shorter corkscrew',a)
s=s[:a]+''' for k in range(3):
  dep=.035-.045*k;low=.040*k;out=.326-.030*k
  pts=[(.06-k*.026,y(.145),.295),(-.01-k*.025,y(.185),.19),(dep-.03,y(.203),.105),(dep,y(.253),.035-low*.2),(dep+.012,y(.283-.009*k),-.022-low*.5),(dep+.024,y(.251-.008*k),-.067-low),(dep+.030,y(out-.012),-.082-low),(dep+.020,y(out+.018),-.044-low)]
  leaf('HAIR__long_wave_%s_%s'%(sign,k),pts,[.030,.042,.044,.057,.045,.028,.015,.0003],[.008,.012,.013,.015,.013,.010,.006,.0003])
''' +s[b:]
s=s.replace("[.03,.039,.036,.025,.0003],[.018,.021,.024,.016,.0003]","[.025,.029,.025,.015,.0003],[.009,.012,.012,.006,.0003]")
s=s.replace("(.025,.18,.40,1)","(.020,.115,.29,1)")
s=s.replace("'native-v5.blend'","'native-v6.blend'").replace("f'head-v5-{ang:03}.png'","f'head-v6-{ang:03}.png'")
p.with_name('build_head_v6.py').write_text(s,'utf-8')
