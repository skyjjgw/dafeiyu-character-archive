from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/whole-character-rebuild/head/build_head_v16.py');s=p.read_text('utf-8')
s=s.replace("if boundary:bmesh.ops.holes_fill(bm,edges=boundary,sides=12)\n  bmesh.ops.recalc_face_normals", "if boundary:bmesh.ops.holes_fill(bm,edges=boundary,sides=12)\n  # Remove zero-volume terminal triangles attached to an otherwise closed sharp tip.\n  for repair in range(3):\n   flaps=[f for f in bm.faces if any(len(e.link_faces)==1 for e in f.edges) and any(len(e.link_faces)>2 for e in f.edges)]\n   if flaps:bmesh.ops.delete(bm,geom=flaps,context='FACES')\n  loose=[v for v in bm.verts if not v.link_faces]\n  if loose:bmesh.ops.delete(bm,geom=loose,context='VERTS')\n  bmesh.ops.recalc_face_normals")
s=s.replace("'native-v16.blend'","'native-v17.blend'").replace("f'head-v16-{ang:03}.png'","f'head-v17-{ang:03}.png'")
p.with_name('build_head_v17.py').write_text(s,'utf-8')
