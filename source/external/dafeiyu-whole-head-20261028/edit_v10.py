from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head_v9.py');s=p.read_text('utf-8')
s=s.replace("sk=next(o for o in new if 'head skin sockets' in o.name)",'''sk=next(o for o in new if 'head skin sockets' in o.name)
oldcolors={};oldattr=sk.data.color_attributes[0]
for li,l in enumerate(sk.data.loops):oldcolors[l.vertex_index]=tuple(oldattr.data[li].color)
samples=[(v.co.copy(),oldcolors.get(v.index,(.635,.548,.425,1))) for v in sk.data.vertices if v.co.x>.15]
skd=KDTree(len(samples))
for i,(v,c) in enumerate(samples):skd.insert((v.y,v.z,0),i)
skd.balance()''')
s=s.replace("texuv=me.uv_layers['SourceFaceUV'];mask=me.color_attributes['SourcePaintMask']", "me.color_attributes.new(name='SourceSkinBase',type='FLOAT_COLOR',domain='CORNER');texuv=me.uv_layers['SourceFaceUV'];mask=me.color_attributes['SourcePaintMask'];basecolors=me.color_attributes['SourceSkinBase']")
s=s.replace("v=me.vertices[l.vertex_index].co;u=np.array", "v=me.vertices[l.vertex_index].co\n near=skd.find_n((v.y,v.z,0),5);ws=[1/(d+.002)**2 for _,i,d in near];cols=[samples[i][1] for _,i,d in near];basecolors.data[li].color=tuple(sum(c[j]*w for c,w in zip(cols,ws))/sum(ws) for j in range(4))\n u=np.array")
s=s.replace("mix.inputs[1].default_value=(.635,.548,.425,1)","basenode=n.new('ShaderNodeVertexColor');basenode.layer_name='SourceSkinBase';L.new(basenode.outputs['Color'],mix.inputs[1])")
s=s.replace('limit=2.75-1.33*f**2','limit=2.94-1.52*f**2')
s=s.replace("z=.25+(.174-shrink)*math.cos(theta)","z=.235+(.189-shrink)*math.cos(theta)")
s=s.replace("(.1,.55,1.05,1.55,2.1,2.65)","(.1,.55,1.05,1.55,2.1,2.86)")
s=s.replace(".25+.182*math.cos(th)",".235+.197*math.cos(th)")
a=s.index(' for k in range(3):');b=s.index(' # Closed backing mass',a)
s=s[:a]+''' paths=[
  [( .060,.145,.285),(.025,.190,.190),(.020,.248,.100),(.045,.289,.044),(.060,.282,-.002),(.065,.259,-.038),(.060,.299,-.055),(.055,.343,-.022)],
  [( .020,.145,.270),(-.015,.180,.155),(-.008,.220,.080),(.010,.263,.012),(.025,.283,-.045),(.035,.260,-.080),(.025,.295,-.104),(.020,.326,-.078)],
  [(-.020,.145,.255),(-.045,.170,.143),(-.035,.204,.055),(-.020,.233,-.010),(-.005,.244,-.077),(.005,.251,-.123),(.000,.280,-.142),(-.010,.298,-.117)]
 ]
 for k,path in enumerate(paths):
  pts=[(xx,y(yy),zz) for xx,yy,zz in path]
  leaf('HAIR__long_wave_%s_%s'%(sign,k),pts,[.030,.043,.047,.048,.034,.019,.013,.0003],[.012,.018,.021,.021,.016,.010,.006,.0003])
''' +s[b:]
s=s.replace("[.005,.018,.010],[.007,.011,.004]","[.004,.013,.020],[.006,.009,.001]")
s=s.replace("'native-v9.blend'","'native-v10.blend'").replace("f'head-v9-{ang:03}.png'","f'head-v10-{ang:03}.png'")
p.with_name('build_head_v10.py').write_text(s,'utf-8')
