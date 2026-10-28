import bpy,json
P='D:/CodexTaskData/dafeiyu-whole-lookdev-20261028'
bpy.ops.wm.open_mainfile(filepath='D:/CodexTaskData/dafeiyu-whole-form-20261028/body/body-head-integration-v1.blend')
s=bpy.context.scene
with bpy.data.libraries.load('D:/CodexTaskData/dafeiyu-whole-tail-20261028/tail-native.blend',link=False) as (src,dst):dst.collections=['DAFEIYU_TAIL_NATIVE']
for c in dst.collections:s.collection.children.link(c)
d={'materials':[],'scene':{'engine':s.render.engine,'res':[s.render.resolution_x,s.render.resolution_y,s.render.resolution_percentage],'camera':list(s.camera.location),'ortho':s.camera.data.ortho_scale},'objects':[]}
for m in bpy.data.materials:
 d['materials'].append({'name':m.name,'diffuse':list(m.diffuse_color),'nodes':[{ 'name':n.name,'type':n.type,'image':n.image.filepath if n.type=='TEX_IMAGE' and n.image else None,'inputs':{i.name:list(i.default_value) if hasattr(i.default_value,'__len__') else i.default_value for i in n.inputs if hasattr(i,'default_value') and i.type in ('RGBA','VALUE','VECTOR') }} for n in m.node_tree.nodes] if m.use_nodes else []})
for o in s.objects:
 if o.type in ('MESH','CURVE','LIGHT'):d['objects'].append({'name':o.name,'type':o.type,'materials':[m.name for m in o.data.materials] if o.type!='LIGHT' else [],'location':list(o.location)})
json.dump(d,open(P+'/materials-inspection.json','w'),indent=2)
