from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head.py')
s=p.read_text('utf-8-sig')
s=s.replace("axis=Vector(sideaxis);axis=(axis-tan*axis.dot(tan)).normalized();normal=tan.cross(axis).normalized()\n  if normal.x<0:normal=-normal","normal=Vector((1,0,0));normal=(normal-tan*normal.dot(tan)).normalized();axis=normal.cross(tan).normalized()\n  if sideaxis!=(0,1,0) and name.startswith('HAIR__crown'):\n   axis=Vector(sideaxis);axis=(axis-tan*axis.dot(tan)).normalized();normal=tan.cross(axis).normalized()")
s=s.replace('limit=2.40-.98*f**2','limit=2.75-1.33*f**2')
a=s.index(' # Rear shoulder length waves');b=s.index(' # Inner shorter corkscrew',a)
s=s[:a]+''' # Independent broad S waves staggered in depth and termination, rooted into the rear cap.
 for k in range(3):
  dep=.035-.052*k; low=.036*k
  pts=[(.06-k*.026,y(.145),.295),(-.01-k*.025,y(.185),.19),(dep-.03,y(.21),.10),(dep,y(.263),.025-low*.3),(dep+.018,y(.283),-.040-low*.5),(dep+.028,y(.248),-.075-low),(dep+.035,y(.289),-.090-low),(dep+.025,y(.326),-.060-low)]
  leaf('HAIR__long_wave_%s_%s'%(sign,k),pts,[.032,.045,.043,.053,.052,.037,.022,.0003],[.012,.021,.024,.024,.023,.018,.010,.0003])
''' +s[b:]
s=s.replace("range(5):\n ph=math.pi*.55+j*math.pi*.225","range(7):\n ph=math.pi*.48+j*math.pi*.1733333")
s=s.replace("(.1,.55,1.05,1.55,2.0,2.25)","(.1,.55,1.05,1.55,2.1,2.65)")
s=s.replace("[.012,.036,.051,.056,.044,.0003],[.004,.009,.011,.011,.008,.0003]","[.012,.037,.047,.053,.050,.0003],[.004,.008,.010,.012,.011,.0003]")
s=s.replace("(.152,-.057,.421),(.16,-.006,.466),(.149,-.038,.500),(.14,-.099,.498),(.14,-.125,.47),(.151,-.112,.438)","(.152,-.057,.421),(.16,-.004,.460),(.149,-.027,.495),(.14,-.086,.497),(.14,-.120,.471),(.151,-.112,.442)")
s=s.replace("[.012,.016,.021,.020,.015,.0003],[.004,.008,.008,.007,.005,.0003]","[.010,.014,.018,.018,.014,.0003],[.003,.006,.007,.006,.004,.0003]")
s=s.replace('math.cos(22*a)','math.cos(38*a)').replace('math.sin(22*a)','math.sin(38*a)')
s=s.replace("r=.226+.027*t+ .011*g*t;x=.061-.018*t+.007*math.sin(38*a)*t","r=.226+.027*t+ .010*g*t;x=.061-.018*t+.013*math.sin(38*a)*t")
s=s.replace("'native-v1.blend'","'native-v2.blend'").replace("f'head-v1-{ang:03}.png'","f'head-v2-{ang:03}.png'")
# A shader gradient enhances source blue palette while keeping mesh and lighting legible.
a=s.index('# crown rear groom strips')
s=s[:a]+'''# Flow color uses fixed object coordinates, with source-like cyan tips and navy roots.
for hairmat in [blue,dark]:
 n=hairmat.node_tree.nodes;L=hairmat.node_tree.links;p=n.get('Principled BSDF')
 geo=n.new('ShaderNodeNewGeometry');sep=n.new('ShaderNodeSeparateXYZ');ramp=n.new('ShaderNodeValToRGB')
 L.new(geo.outputs['Position'],sep.inputs[0]);L.new(sep.outputs['Z'],ramp.inputs[0])
 r=ramp.color_ramp;r.elements.remove(r.elements[1]);r.elements[0].position=0;r.elements[0].color=(.025,.18,.40,1)
 for pos,col in [(.14,(.025,.085,.26,1)),(.30,(.032,.085,.23,1)),(.44,(.035,.12,.30,1))]:r.elements.new(pos).color=col
 if hairmat==dark:
  for e in r.elements:e.color=tuple(v*.65 if i<3 else v for i,v in enumerate(e.color))
 L.new(ramp.outputs[0],p.inputs['Base Color']);L.new(ramp.outputs[0],p.inputs['Emission Color']);p.inputs['Emission Strength'].default_value=.45
''' +s[a:]
p.with_name('build_head_v2.py').write_text(s,'utf-8')
