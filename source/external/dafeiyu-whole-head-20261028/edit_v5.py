from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head_v4.py');s=p.read_text('utf-8')
s=s.replace(".135-.103*math.sin(theta)",".135-.103*math.sqrt(max(0,1-r**2.5))")
a=s.index("oldmat=sk.data.materials[0]");b=s.index("scene.render.engine='CYCLES'",a)
s=s[:a]+'''# Remove an underside patch and bridge its actual boundary to an elliptical neck interface.
bm=bmesh.new();bm.from_mesh(me)
remove=[f for f in bm.faces if f.calc_center_median().z<.09 and ((f.calc_center_median().x-.105)/.040)**2+((f.calc_center_median().y+.06)/.043)**2<1]
bmesh.ops.delete(bm,geom=remove,context='FACES')
bound=[v for v in bm.verts if v.is_boundary and v.co.z<.095]
bound.sort(key=lambda v:math.atan2((v.co.y+.06)/.043,(v.co.x-.105)/.040))
prev=bound
for k,z in enumerate([.048,.035,.020]):
 ring=[]
 for v in bound:
  a=math.atan2((v.co.y+.06)/.043,(v.co.x-.105)/.040);rr=1 if k>0 else 1.03
  ring.append(bm.verts.new((.105+.040*rr*math.cos(a),-.06+.043*rr*math.sin(a),z)))
 for j in range(len(prev)):
  try:bm.faces.new((prev[j],prev[(j+1)%len(prev)],ring[(j+1)%len(prev)],ring[j]))
  except ValueError:pass
 prev=ring
bm.faces.new(tuple(reversed(prev)));bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(me);bm.free()
sk.data=me
# Actual source face paint is now on the continuous skin surface, feathered at the old cutout boundary.
from mathutils.bvhtree import BVHTree
import numpy as np
paint=next(o for o in new if 'reference skin, nose' in o.name);uv=paint.data.uv_layers[0]
rows=[];uvs=[]
for poly in paint.data.polygons:
 for li in poly.loop_indices:
  v=paint.data.vertices[paint.data.loops[li].vertex_index].co;rows.append((v.y,v.z,1));uvs.append(tuple(uv.data[li].uv))
coef=np.linalg.lstsq(np.array(rows),np.array(uvs),rcond=None)[0]
projected=[Vector((0,v.co.y,v.co.z)) for v in paint.data.vertices];polys=[tuple(p.vertices) for p in paint.data.polygons]
bvh=BVHTree.FromPolygons(projected,polys,all_triangles=False)
count={}
for f in polys:
 for j in range(len(f)):
  e=tuple(sorted((f[j],f[(j+1)%len(f)])));count[e]=count.get(e,0)+1
edgeids=set(i for e,n in count.items() if n==1 for i in e)
bkd=KDTree(len(edgeids))
for i,idx in enumerate(edgeids):bkd.insert(projected[idx],i)
bkd.balance()
texuv=me.uv_layers.new(name='SourceFaceUV');mask=me.color_attributes.new(name='SourcePaintMask',type='FLOAT_COLOR',domain='CORNER')
for li,l in enumerate(me.loops):
 v=me.vertices[l.vertex_index].co;u=np.array((v.y,v.z,1))@coef;texuv.data[li].uv=tuple(u)
 hit=bvh.ray_cast(Vector((1,v.y,v.z)),Vector((-1,0,0)),2)[0]
 dist=bkd.find((0,v.y,v.z))[2] if hit is not None else 0
 w=min(1,dist/.008) if hit is not None and v.x>.136 else 0;w=w*w*(3-2*w);mask.data[li].color=(w,w,w,1)
mat=bpy.data.materials.new('Original facial paint unified smooth skin');mat.use_nodes=True;n=mat.node_tree.nodes;n.clear();L=mat.node_tree.links
out=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');mix=n.new('ShaderNodeMixRGB');vc=n.new('ShaderNodeVertexColor');vc.layer_name='SourcePaintMask';tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images['source-cover.jpg'];uvnode=n.new('ShaderNodeUVMap');uvnode.uv_map='SourceFaceUV';mapping=n.new('ShaderNodeMapping');mapping.inputs['Location'].default_value=(0,1,0);mapping.inputs['Scale'].default_value=(1,-1,1)
mix.inputs[1].default_value=(.635,.548,.425,1)
L.new(uvnode.outputs[0],mapping.inputs[0]);L.new(mapping.outputs[0],tex.inputs[0]);L.new(vc.outputs['Color'],mix.inputs[0]);L.new(tex.outputs[0],mix.inputs[2]);L.new(mix.outputs[0],em.inputs[0]);L.new(em.outputs[0],out.inputs[0]);me.materials.append(mat)
for o in new:
 if o==paint or 'deforming skin' in o.name:o.hide_render=True;o.hide_viewport=True
for p in me.polygons:p.use_smooth=True
sk.name='FACE__continuous head skin sockets oral lining and neck'
''' +s[b:]
s=s.replace("bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,location=(.105,-.06,.049));ob=bpy.context.object;ob.name='SKIN__neck_interface';ob.scale=(.041,.043,.035);ob.data.materials.append(skin);ob.parent=root","ob=bpy.data.objects.new('INTERFACE__neck_center_0105_m006_0045',None);scene.collection.objects.link(ob);ob.location=(.105,-.06,.045);ob.parent=root;ob['radius_x']=.040;ob['radius_y']=.043")
s=s.replace("'native-v4.blend'","'native-v5.blend'").replace("f'head-v4-{ang:03}.png'","f'head-v5-{ang:03}.png'")
p.with_name('build_head_v5.py').write_text(s,'utf-8')
