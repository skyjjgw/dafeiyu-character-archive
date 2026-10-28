"""Audit a saved native candidate without altering it or accepting its appearance."""
import bpy
import bmesh
import hashlib
import json
import sys
from pathlib import Path

args = sys.argv[sys.argv.index('--') + 1:]
source, output = map(Path, args[:2])
bpy.ops.wm.open_mainfile(filepath=str(source))
scene = bpy.context.scene
objects = []
for obj in scene.objects:
    entry = {
        'name': obj.name,
        'type': obj.type,
        'collections': [c.name for c in obj.users_collection],
        'hide_render': bool(obj.hide_render),
        'visible_viewport': bool(obj.visible_get()),
        'transform_determinant': float(obj.matrix_world.determinant()),
    }
    if obj.type == 'MESH':
        mesh = obj.data
        bm = bmesh.new()
        bm.from_mesh(mesh)
        entry.update({
            'vertices_base': len(mesh.vertices),
            'polygons_base': len(mesh.polygons),
            'boundary_edges_base': sum(e.is_boundary for e in bm.edges),
            'loose_edges_base': sum(e.is_wire for e in bm.edges),
            'overconnected_edges_base': sum(len(e.link_faces) > 2 for e in bm.edges),
            'materials': [m.name if m else None for m in mesh.materials],
            'modifiers': [{'name': m.name, 'type': m.type,
                           'render': bool(m.show_render)} for m in obj.modifiers],
            'vertex_groups': len(obj.vertex_groups),
            'shape_keys': [b.name for b in mesh.shape_keys.key_blocks] if mesh.shape_keys else [],
        })
        if not any(e.is_boundary or len(e.link_faces) != 2 for e in bm.edges):
            entry['signed_volume_base'] = float(bm.calc_volume(signed=True))
        bm.free()
    objects.append(entry)

report = {
    'source': str(source),
    'sha256': hashlib.file_digest(source.open('rb'), 'sha256').hexdigest(),
    'blender': bpy.app.version_string,
    'units': scene.unit_settings.system,
    'world_frame': 'X+ front, Y across, Z+ up',
    'objects': objects,
    'counts': {
        'meshes': sum(o['type'] == 'MESH' for o in objects),
        'armatures': sum(o['type'] == 'ARMATURE' for o in objects),
        'render_enabled_meshes': sum(o['type'] == 'MESH' and not o['hide_render'] for o in objects),
    },
    'scope': 'Native source file inventory and base topology only; modifiers, cloth contact, deformation, identity and final visuals require separate inspection.',
    'appearanceAccepted': False,
    'rigAccepted': False,
    'physicsAccepted': False,
    'finalAccepted': False,
}
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'source': str(source), 'report': str(output), 'counts': report['counts']}))
