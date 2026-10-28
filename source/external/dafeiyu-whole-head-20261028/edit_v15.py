from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head_v14.py');s=p.read_text('utf-8')
a=s.index('# Source shape offsets are recomputed');b=s.index('pts=[];edges=[];outer=[];holes=[]',a)
s=s[:a]+'''# Anatomical eye depth is rebuilt as a closed ellipsoid behind each original neutral aperture.
eye_frames={}
for o in new:
 if 'ocular globe' in o.name:
  side='left' if 'left' in o.name else 'right';vs=[v.co.copy() for v in o.data.vertices];cy=(min(v.y for v in vs)+max(v.y for v in vs))/2;cz=(min(v.z for v in vs)+max(v.z for v in vs))/2;ry=(max(v.y for v in vs)-min(v.y for v in vs))/2;rz=(max(v.z for v in vs)-min(v.z for v in vs))/2;eye_frames[side]=(cy,cz,ry,rz,face_x(cy,cz)-.022,.029)
def eye_front(side,y,z):
 cy,cz,ry,rz,cx,rx=eye_frames[side];q=((y-cy)/ry)**2+((z-cz)/rz)**2;return cx+rx*math.sqrt(max(0,1-q))
for o in new:
 if o==sk:continue
 for v in o.data.vertices:
  if 'ocular globe' in o.name:
   side='left' if 'left' in o.name else 'right';cy,cz,ry,rz,cx,rx=eye_frames[side];q=((v.co.y-cy)/ry)**2+((v.co.z-cz)/rz)**2;v.co.x=cx+(1 if v.co.x>.24 else -1)*rx*math.sqrt(max(0,1-q))
  elif 'iris' in o.name:
   side='left' if 'left' in o.name else 'right';v.co.x=eye_front(side,v.co.y,v.co.z)+.0008
  else:
   off=.0008
   if 'eyelash' in o.name or 'lashes' in o.name or 'eyelid crease' in o.name:off=.003
   if 'tongue' in o.name:off=-.012
   if 'smile contour' in o.name:off=.002
   v.co.x=face_x(v.co.y,v.co.z)+off
 if 'rounded chin contour' in o.name:o.hide_render=True;o.hide_viewport=True
''' +s[b:]
s=s.replace("-.049+.021*math.cos(math.tau*j/64),.109+.0016*math.sin(math.tau*j/64)","-.049+.018*math.cos(math.tau*j/64),.109+.00055*math.sin(math.tau*j/64)")
s=s.replace("w=min(1,dist/.008) if hit is not None and v.x>.136 else 0;w=w*w*(3-2*w);mask.data[li].color=(w,w,w,1)","w=min(1,dist/.008) if hit is not None and v.x>.136 else 0;w=w*w*(3-2*w)\n if ((v.y+.049)/.028)**2+((v.z-.109)/.007)**2<1:\n  w=0;near=skd.find_n((v.y,.124,0),5);ws=[1/(d+.002)**2 for _,i,d in near];cols=[samples[i][1] for _,i,d in near];basecolors.data[li].color=tuple(sum(c[j]*w for c,w in zip(cols,ws))/sum(ws) for j in range(4))\n mask.data[li].color=(w,w,w,1)")
s=s.replace("me.materials.append(mat)\nfor o in new:","me.materials.append(mat)\noral=bpy.data.materials.new('Neutral recessed closed mouth lining');oral.use_nodes=True;on=oral.node_tree.nodes;on.clear();oo=on.new('ShaderNodeOutputMaterial');oe=on.new('ShaderNodeEmission');oe.inputs[0].default_value=(.095,.025,.025,1);oral.node_tree.links.new(oe.outputs[0],oo.inputs[0]);me.materials.append(oral)\nfor p in me.polygons:\n c=sum((me.vertices[i].co for i in p.vertices),Vector())/len(p.vertices)\n if abs(c.y+.049)<.023 and abs(c.z-.109)<.005 and c.x<face_x(c.y,c.z)-.0008:p.material_index=1\nfor o in new:")
s=s.replace("'native-v14.blend'","'native-v15.blend'").replace("f'head-v14-{ang:03}.png'","f'head-v15-{ang:03}.png'")
p.with_name('build_head_v15.py').write_text(s,'utf-8')
