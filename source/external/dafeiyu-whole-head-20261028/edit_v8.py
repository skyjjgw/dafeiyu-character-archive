from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head_v7.py');s=p.read_text('utf-8')
s=s.replace("sub=sk.modifiers.new('Continuous skin curvature','SUBSURF');sub.levels=1;sub.render_levels=1",'''# Smooth normals follow the actual analytic surface, avoiding triangulation-dependent seam shading.
norm=[]
for li,l in enumerate(me.loops):
 v=me.vertices[l.vertex_index].co;yy=v.y+.06;zz=v.z-.216;q=abs(yy/.189)**2.5+abs(zz/.162)**2.5
 fx=face_x(v.y,v.z);bx=.135-.103*math.sqrt(max(0,1-q));normal=me.corner_normals[li].vector.copy()
 if abs(v.x-fx)<.0001 and v.z>.06:
  if q<.998:
   h=.00001;dy=(face_x(v.y+h,v.z)-face_x(v.y-h,v.z))/(2*h);dz=(face_x(v.y,v.z+h)-face_x(v.y,v.z-h))/(2*h);normal=Vector((1,-dy,-dz)).normalized()
  else:normal=Vector((0,math.copysign(abs(yy)**1.5,yy)/.189**2.5,math.copysign(abs(zz)**1.5,zz)/.162**2.5)).normalized()
 elif abs(v.x-bx)<.0001 and v.z>.06:
  normal=Vector((2*(v.x-.135)/.103**2,2.5*math.copysign(abs(yy)**1.5,yy)/.189**2.5,2.5*math.copysign(abs(zz)**1.5,zz)/.162**2.5)).normalized()
 norm.append(tuple(normal))
me.normals_split_custom_set(norm)''')
a=s.index(' # Inner shorter corkscrew')
s=s[:a]+''' # Closed backing mass fills hair between the superficial curling leaves; it is hidden only by actual hair.
 leaf('HAIR__continuous_long_mass_'+str(sign),[(-.040,y(.16),.24),(-.050,y(.19),.15),(-.055,y(.235),.065),(-.040,y(.266),-.005),(-.030,y(.257),-.070),(-.020,y(.230),-.126),(-.020,y(.256),-.162)],[.037,.049,.064,.061,.052,.036,.0003],[.022,.030,.033,.034,.030,.023,.0003])
''' +s[a:]
a=s.index('# Headband is a continuous')
s=s[:a]+'''# Original selected hairstyle paint, fixed to mesh UVs, supplements the new volume on forward bangs only.
paintHair=bpy.data.materials.new('Selected original blue hair paint on new volume');paintHair.use_nodes=True;n=paintHair.node_tree.nodes;L=paintHair.node_tree.links;p=n.get('Principled BSDF');p.inputs['Roughness'].default_value=.72;p.inputs['Specular IOR Level'].default_value=.16
tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load('E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-geometry/hair-continuity-v1/reports/root-front.png',check_existing=True)
uvn=n.new('ShaderNodeUVMap');uvn.uv_map='SelectedHairPaint';L.new(uvn.outputs[0],tex.inputs[0]);sep=n.new('ShaderNodeSeparateColor');L.new(tex.outputs[0],sep.inputs[0])
ratio=n.new('ShaderNodeMath');ratio.operation='MULTIPLY';ratio.inputs[1].default_value=1.1;L.new(sep.outputs['Red'],ratio.inputs[0]);isblue=n.new('ShaderNodeMath');isblue.operation='GREATER_THAN';L.new(sep.outputs['Blue'],isblue.inputs[0]);L.new(ratio.outputs[0],isblue.inputs[1]);weight=n.new('ShaderNodeVertexColor');weight.layer_name='SelectedHairWeight';mul=n.new('ShaderNodeMath');mul.operation='MULTIPLY';L.new(isblue.outputs[0],mul.inputs[0]);L.new(weight.outputs['Color'],mul.inputs[1]);mix=n.new('ShaderNodeMixRGB');mix.inputs[1].default_value=(.027,.075,.20,1);L.new(mul.outputs[0],mix.inputs[0]);L.new(tex.outputs[0],mix.inputs[2]);L.new(mix.outputs[0],p.inputs['Base Color']);L.new(mix.outputs[0],p.inputs['Emission Color']);p.inputs['Emission Strength'].default_value=.65
for o in bpy.data.objects:
 if o.type=='MESH' and (o.name.startswith('HAIR__bang') or o.name.startswith('HAIR__cheek')):
  me=o.data;me.uv_layers.new(name='SelectedHairPaint');me.color_attributes.new(name='SelectedHairWeight',type='FLOAT_COLOR',domain='CORNER');uv=me.uv_layers['SelectedHairPaint'];att=me.color_attributes['SelectedHairWeight']
  for li,l in enumerate(me.loops):
   v=me.vertices[l.vertex_index];px=283+(v.co.y+.06)/.00152;py=(.55-v.co.z)/.00152;uv.data[li].uv=(px/640,1-py/704)
   w=.90*max(0,min(1,(v.normal.x-.10)/.70));att.data[li].color=(w,w,w,1)
  me.materials.clear();me.materials.append(paintHair)
''' +s[a:]
s=s.replace("'native-v7.blend'","'native-v8.blend'").replace("f'head-v7-{ang:03}.png'","f'head-v8-{ang:03}.png'")
p.with_name('build_head_v8.py').write_text(s,'utf-8')
