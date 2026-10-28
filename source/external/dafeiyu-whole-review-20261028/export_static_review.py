"""Static visible evaluated native mesh review export. No source-file writes.
python export_static_review.py --blend master.blend --out D:/.../independent-version
"""
import argparse,hashlib,json,math,os,struct,sys
from pathlib import Path
TOOL=Path('E:/zzz/dafeiyu-character-materials-20261025/tools/blender')
def args():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--blend',required=True);p.add_argument('--out',required=True)
 return p.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:])
def sha(path):
 h=hashlib.sha256()
 with open(path,'rb') as f:
  for block in iter(lambda:f.read(1048576),b''):h.update(block)
 return h.hexdigest()
def launch(a):
 import subprocess
 out=Path(a.out);out.mkdir(parents=True,exist_ok=True)
 if (out/'actual.glb').exists():raise FileExistsError('Use independent --out; actual.glb already exists')
 env=os.environ.copy()
 for k,v in {'BLENDER_USER_RESOURCES':'','BLENDER_USER_CONFIG':'config','BLENDER_USER_SCRIPTS':'scripts','BLENDER_USER_EXTENSIONS':'extensions','BLENDER_USER_DATAFILES':'datafiles'}.items():env[k]=str(TOOL/'profile'/v)
 cmd=[str(TOOL/'blender-4.5.15-windows-x64/blender.exe'),'--offline-mode','--disable-autoexec','-b','--threads','2','--python-exit-code','1','--python',str(Path(__file__).resolve()),'--','--blend',a.blend,'--out',a.out]
 with open(out/'export.log','w',encoding='utf-8') as log:r=subprocess.run(cmd,env=env,stdout=log,stderr=subprocess.STDOUT)
 print('Export exit:',r.returncode,'Output:',str(out));return r.returncode
def mesh_hash(me):
 h=hashlib.sha256()
 for v in me.vertices:h.update(struct.pack('3f',*v.co))
 for p in me.polygons:
  h.update(struct.pack('I',len(p.vertices)))
  for i in p.vertices:h.update(struct.pack('I',i))
 return h.hexdigest()
def finalize_glb_materials(path):
 """Standard glTF unlit base-color semantics; binary geometry/images remain byte-identical.
 Blender exports Emission as emissive PBR, where COLOR_0 does not tint emission.
 Move that exact export-only base texture to baseColorTexture and use white base
 so the baked original COLOR_0 is respected by every conforming glTF viewer.
 """
 blob=Path(path).read_bytes();length,ctype=struct.unpack_from('<II',blob,12)
 g=json.loads(blob[20:20+length]);tail=blob[20+length:]
 for mat in g.get('materials',[]):
  pbr=mat.setdefault('pbrMetallicRoughness',{});pbr['baseColorFactor']=[1,1,1,1];pbr['metallicFactor']=0;pbr['roughnessFactor']=1
  if 'emissiveTexture' in mat:pbr['baseColorTexture']=mat.pop('emissiveTexture')
  mat.pop('emissiveFactor',None);mat.setdefault('extensions',{})['KHR_materials_unlit']={}
 g.setdefault('extensionsUsed',[])
 if 'KHR_materials_unlit' not in g['extensionsUsed']:g['extensionsUsed'].append('KHR_materials_unlit')
 js=json.dumps(g,separators=(',',':'),ensure_ascii=False).encode();js+=b' '*((-len(js))%4)
 result=struct.pack('<III',0x46546c67,2,12+8+len(js)+len(tail))+struct.pack('<II',len(js),0x4e4f534a)+js+tail
 Path(path).write_bytes(result)
 return {'binary_geometry_and_images_unchanged':hashlib.sha256(tail).hexdigest()==hashlib.sha256(result[20+len(js):]).hexdigest(),'glb_sha256_before_material_compatibility':hashlib.sha256(blob).hexdigest()}
def native_material(m):
 """Export-only copy: route the original base stream to emission for honest baking."""
 import bpy
 if m is None:
  n=bpy.data.materials.new('review missing material gray');n.diffuse_color=(.5,.5,.5,1);m=n
 n=m.copy();n.name='REVIEW_BAKE__'+m.name;n.use_nodes=True;nt=n.node_tree
 bs=next((x for x in nt.nodes if x.type=='BSDF_PRINCIPLED'),None)
 em=next((x for x in nt.nodes if x.type=='EMISSION'),None)
 socket=bs.inputs['Base Color'] if bs else em.inputs['Color'] if em else None
 src=socket.links[0].from_socket if socket and socket.is_linked else None
 base=socket.default_value if socket else m.diffuse_color
 e=nt.nodes.new('ShaderNodeEmission');e.inputs['Color'].default_value=base;e.inputs['Strength'].default_value=1
 if src:nt.links.new(src,e.inputs[0])
 o=nt.nodes.new('ShaderNodeOutputMaterial');o.is_active_output=True;nt.links.new(e.outputs[0],o.inputs['Surface'])
 return n
def export(a):
 import bpy
 from mathutils import Matrix
 src=Path(a.blend).resolve();out=Path(a.out).resolve();out.mkdir(parents=True,exist_ok=True);source_sha=sha(src)
 bpy.ops.wm.open_mainfile(filepath=str(src));original=bpy.context.scene
 allowed=set()
 def walk(lc,hidden=False):
  hidden=hidden or lc.exclude or lc.collection.hide_render
  if not hidden:allowed.update(lc.collection.objects)
  for child in lc.children:walk(child,hidden)
 walk(bpy.context.view_layer.layer_collection)
 for obj in original.objects:
  if obj.type=='ARMATURE':obj.data.pose_position='REST'
 bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get()
 visible=[o for o in original.objects if o.type=='MESH' and not o.hide_render and o in allowed]
 snapshot=[];records=[]
 for o in visible:
  eo=o.evaluated_get(dg);me=bpy.data.meshes.new_from_object(eo,preserve_all_data_layers=True,depsgraph=dg)
  obj=bpy.data.objects.new(o.name,me);obj.matrix_world=o.matrix_world.copy();snapshot.append(obj)
  records.append({'name':o.name,'vertices':len(me.vertices),'polygons':len(me.polygons),'triangles':sum(len(p.vertices)-2 for p in me.polygons),'evaluated_geometry_sha256':mesh_hash(me),'world_matrix':[list(r) for r in obj.matrix_world],'source_uv_layers':[u.name for u in me.uv_layers],'source_color_attributes':[c.name for c in me.color_attributes],'source_materials':[m.name if m else None for m in me.materials]})
 scene=bpy.data.scenes.new('STATIC_NATIVE_REVIEW_ONLY');bpy.context.window.scene=scene
 for obj in snapshot:scene.collection.objects.link(obj)
 scene.render.engine='CYCLES';scene.cycles.samples=1;scene.cycles.use_denoising=False
 scene.render.threads_mode='FIXED';scene.render.threads=2;scene.render.bake.margin=6
 scene.view_settings.view_transform='Standard';scene.view_settings.look='None'
 bpy.ops.object.select_all(action='DESELECT')
 material_copies={}
 for obj in snapshot:
  for slot in obj.material_slots:
   m=slot.material
   if m not in material_copies:material_copies[m]=native_material(m)
   slot.material=material_copies[m]
  if not len(obj.material_slots):obj.data.materials.append(native_material(None))
  attr=obj.data.color_attributes.new(name='ReviewBaseColor',type='FLOAT_COLOR',domain='CORNER')
  for x in attr.data:x.color=(1,1,1,1)
  obj.data.color_attributes.active_color=attr
 # Bake actual base streams, retaining all original UV and color layers on the snapshot.
 for i,obj in enumerate(snapshot):
  bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
  has_image=any(n.type=='TEX_IMAGE' and n.image for m in obj.data.materials for n in m.node_tree.nodes)
  if has_image:
   # Add a separate bake UV. Source named UV maps remain unchanged for original graph evaluation.
   old_active=obj.data.uv_layers.active.name if obj.data.uv_layers.active else None
   uv=obj.data.uv_layers.new(name='ReviewBakeUV');obj.data.uv_layers.active=uv;uv.active_render=True
   bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.012);bpy.ops.object.mode_set(mode='OBJECT')
   size=1024 if any(k in obj.name.lower() for k in ('skin','apron')) else 512
   image=bpy.data.images.new('ReviewBakedBase__'+str(i),width=size,height=size,alpha=False);image.colorspace_settings.name='sRGB'
   for m in obj.data.materials:
    node=m.node_tree.nodes.new('ShaderNodeTexImage');node.image=image;m.node_tree.nodes.active=node
   scene.render.bake.target='IMAGE_TEXTURES';bpy.ops.object.bake(type='EMIT',use_clear=True)
   image.pack()
   m=bpy.data.materials.new('REVIEW_UNLIT_TEXTURE__'+obj.name);m.use_nodes=True;nt=m.node_tree;nt.nodes.clear()
   t=nt.nodes.new('ShaderNodeTexImage');t.image=image
   u=nt.nodes.new('ShaderNodeUVMap');u.uv_map='ReviewBakeUV';nt.links.new(u.outputs['UV'],t.inputs['Vector'])
   e=nt.nodes.new('ShaderNodeEmission');nt.links.new(t.outputs['Color'],e.inputs['Color'])
   output=nt.nodes.new('ShaderNodeOutputMaterial');nt.links.new(e.outputs[0],output.inputs['Surface'])
   records[i]['base_color_conversion']='original shader base stream baked to export-only '+str(size)+'px UV texture; original UV/colors retained'
  else:
   scene.render.bake.target='VERTEX_COLORS';bpy.ops.object.bake(type='EMIT',use_clear=True)
   m=bpy.data.materials.new('REVIEW_UNLIT_COLOR__'+obj.name);m.use_nodes=True;nt=m.node_tree;nt.nodes.clear()
   e=nt.nodes.new('ShaderNodeEmission');e.inputs[0].default_value=(1,1,1,1)
   output=nt.nodes.new('ShaderNodeOutputMaterial');nt.links.new(e.outputs[0],output.inputs['Surface'])
   records[i]['base_color_conversion']='original shader base stream baked to export-only corner ReviewBaseColor; source color layers retained'
  obj.data.materials.clear();obj.data.materials.append(m)
  for p in obj.data.polygons:p.material_index=0
  obj.data.color_attributes.active_color=obj.data.color_attributes['ReviewBaseColor']
  records[i]['snapshot_geometry_unchanged_after_color_conversion']=records[i]['evaluated_geometry_sha256']==mesh_hash(obj.data)
  print('STATIC_REVIEW',i+1,'/',len(snapshot),obj.name,flush=True)
 bpy.ops.object.select_all(action='SELECT')
 bpy.ops.export_scene.gltf(filepath=str(out/'actual.glb'),export_format='GLB',use_selection=True,export_animations=False,export_skins=False,export_morph=False,export_cameras=False,export_lights=False,export_extras=False,export_yup=True,export_apply=False,export_vertex_color='NAME',export_vertex_color_name='ReviewBaseColor',export_all_vertex_colors=True,export_active_vertex_color_when_no_material=False)
 compatibility=finalize_glb_materials(out/'actual.glb')
 file=out/'actual.glb';blob=file.read_bytes();length,ctype=struct.unpack_from('<II',blob,12);gltf=json.loads(blob[20:20+length])
 if gltf.get('animations') or gltf.get('skins') or gltf.get('cameras'):raise RuntimeError('Unexpected animated/rig/camera content')
 summary={'meshes':len(gltf.get('meshes',[])),'nodes':len(gltf.get('nodes',[])),'materials':len(gltf.get('materials',[])),'images':len(gltf.get('images',[])),'animations':len(gltf.get('animations',[])),'skins':len(gltf.get('skins',[])),'cameras':len(gltf.get('cameras',[])),'extensionsUsed':gltf.get('extensionsUsed',[])}
 manifest={'finalAccepted':False,'status':'整体造型建模中，未完成','source_blend':str(src),'source_sha256':source_sha,'source_unchanged':source_sha==sha(src),'source_frame':original.frame_current,'export':'actual.glb','glb_sha256':sha(file),'glb_bytes':file.stat().st_size,'coordinate_conversion':'standard glTF Y-up export: Blender (X,Y,Z) => glTF (X,Z,-Y); native object coordinates/transforms preserved through this rigid basis change','visible_source_meshes':len(snapshot),'excluded':'render-hidden/excluded collections, hidden raw guides, cameras, lights, non-mesh objects, armatures, animation clips','geometry_unchanged_after_material_conversion':all(r['snapshot_geometry_unchanged_after_color_conversion'] for r in records),'objects':records,'glb_structure':summary,'limits':['Static rest-armature evaluated snapshot only. No motion, physics, final model acceptance or runtime readiness.','Original base streams are baked only on export copies for glTF compatibility; Blender shader graphs and NPR lighting are not portable.','Texture base streams are baked at 512/1024px and can differ by texture filtering, UV rasterization and color conversion. Original UV/color layers retained; source files unchanged.','No identity generation, full-character image plane, camera-dependent geometry, hidden-guide export or silhouette repair.','Geometry and material problems remain visible; rear design remains inferred.']}
 manifest['glTF_unlit_base_color_compatibility']=compatibility
 if not manifest['source_unchanged'] or not manifest['geometry_unchanged_after_material_conversion']:raise RuntimeError('Integrity failure')
 (out/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8');print('STATIC_EXPORT_OK',str(file),summary)
if __name__=='__main__':
 a=args()
 try:import bpy
 except ImportError:sys.exit(launch(a))
 export(a)
