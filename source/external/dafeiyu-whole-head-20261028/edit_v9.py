from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head_v8.py');s=p.read_text('utf-8')
s=s.replace("w=.90*max(0,min(1,(v.normal.x-.10)/.70));att.data[li].color=(w,w,w,1)","f=lambda a,b,x:max(0,min(1,(x-a)/(b-a)))\n   region=f(155,180,px)*f(405,380,px)*f(95,115,py)*f(185,165,py)\n   w=.90*max(0,min(1,(v.normal.x-.10)/.70))*region;att.data[li].color=(w,w,w,1)")
s=s.replace('low=.040*k','low=.030*k').replace("(-.020,y(.230),-.126),(-.020,y(.256),-.162)","(-.020,y(.253),-.117),(-.020,y(.276),-.145)").replace("[.037,.049,.064,.061,.052,.036,.0003]","[.037,.049,.064,.061,.056,.045,.0003]")
s=s.replace('A=97;B=12','A=257;B=16').replace('math.cos(38*a)','math.cos(32*a)').replace('math.sin(38*a)','math.sin(32*a)').replace('.013*math.sin(32*a)*t','.008*math.sin(32*a)*t').replace('+.010*g*t','+.007*g*t')
s=s.replace("[(.155,y(.216),.248),(.161,y(.23+k*.018),.25+k*.014),(.157,y(.24+k*.024),.25+k*.027)],[.006,.020,.0008],[.008,.012,.0008]","[(.270,y(.226),.252),(.278,y(.226+k*.018),.252+k*.004),(.270,y(.226+k*.034),.252+k*.006)],[.005,.018,.010],[.007,.011,.004]")
s=s.replace("location=(.17,y(.226),.252)","location=(.285,y(.226),.252)").replace("ob.scale=(.014,.014,.018)","ob.scale=(.010,.010,.013)")
s=s.replace("'native-v8.blend'","'native-v9.blend'").replace("f'head-v8-{ang:03}.png'","f'head-v9-{ang:03}.png'")
p.with_name('build_head_v9.py').write_text(s,'utf-8')
