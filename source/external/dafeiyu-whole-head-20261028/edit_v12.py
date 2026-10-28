from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head_v11.py');s=p.read_text('utf-8')
a=s.index('# Closed cap following');b=s.index('vs=[];fs=[];N=96;M=40',a)
s=s[:b]+'''def cap_pos(v,phi,inner=0):
 c=math.cos(phi);si=math.sin(phi);f=(c+1)/2;limit=2.94-1.52*f*f;theta=.001+v*(limit-.001);shrink=inner*.008
 p=Vector((.135+(.170-shrink)*math.sin(theta)*c,-.06+(.213-shrink)*math.sin(theta)*si,.235+(.189-shrink)*math.cos(theta)))
 end=Vector((.135+.170*math.sin(limit)*c,-.06+.213*math.sin(limit)*si,.235+.189*math.cos(limit)))
 target=Vector((.09+.215*max(0,c)-.05*max(0,-c),-.06+.205*si,.125+.145*max(0,c)**2-.060*max(0,-c)**2))
 return p+(target-end)*v**4
''' +s[b:]
a=s.index('   phi=2*math.pi*j/N;f=');b=s.index('   vs.append((x,y,z))',a)+len('   vs.append((x,y,z))')
s=s[:a]+'''   phi=2*math.pi*j/N;vs.append(tuple(cap_pos(v,phi,inner)))''' +s[b:]
s=s.replace("[.020,.031,.034,.030,.022,.012,.008,.0003]","[.0003,.025,.034,.030,.022,.012,.008,.0003]")
s=s.replace("return -.012+.085*math.exp(-((z-.29)/.10)**2)+.025*math.exp(-((z+.10)/.085)**2)","return -.012+.135*math.exp(-((z-.29)/.10)**2)+.025*math.exp(-((z+.10)/.085)**2)")
s=s.replace("ph=math.pi*.48+j*math.pi*.1733333","ph=math.pi*.53+j*math.pi*.1566667")
a=s.index(' for th in (.1,.55');b=s.index(" leaf('HAIR__crown_rear_panel_",a)
s=s[:a]+''' for v in (.03,.24,.45,.66,.84,1.0):
  p=cap_pos(v,ph);p+=Vector((math.cos(ph)*.007,math.sin(ph)*.007,.006*(1-v)));pts.append(tuple(p))
''' +s[b:]
s=s.replace("'native-v11.blend'","'native-v12.blend'").replace("f'head-v11-{ang:03}.png'","f'head-v12-{ang:03}.png'")
p.with_name('build_head_v12.py').write_text(s,'utf-8')
