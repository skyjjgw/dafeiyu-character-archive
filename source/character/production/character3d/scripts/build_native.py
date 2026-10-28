"""Build/reopen an editable Blender source from the local, verified GLB.

Run through tools/blender/Invoke-Blender.ps1 with --background --python-exit-code 1.
Use a literal '--', '--verify-only' argument pair for independent reopening.
"""
import bpy
import hashlib
import json
import math
import sys
from pathlib import Path
from mathutils import Matrix, Vector

PROJECT = Path(__file__).resolve().parent.parent
LIBRARY = PROJECT.parent.parent
GLB = PROJECT / 'assets/dafeiyu-body-rig-v1.glb'
MASTER = PROJECT / 'dafeiyu-master-v1.blend'
RENDERS = PROJECT / 'renders'
REPORT = PROJECT / 'native-build-verification.json'
CLIPS = ('idle', 'wave', 'walk', 'turn')
MORPHS = ('blink', 'aa', 'happy', 'sad')
VERIFY_ONLY = '--verify-only' in sys.argv

def digest(filename):
    h = hashlib.sha256()
    with Path(filename).open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

def artifact(filename):
    p = Path(filename)
    return {'path': str(p), 'bytes': p.stat().st_size, 'sha256': digest(p)}

def collection(name):
    result = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(result)
    return result

def move(obj, target):
    for old in list(obj.users_collection):
        old.objects.unlink(obj)
    target.objects.link(obj)

def aim(obj, point):
    obj.rotation_euler = (Vector(point) - obj.location).to_track_quat('-Z', 'Y').to_euler()

def color_layer_for(material):
    for obj in bpy.data.objects:
        if obj.type == 'MESH' and any(slot.material == material for slot in obj.material_slots):
            if obj.data.color_attributes:
                return obj.data.color_attributes[0].name
    return ''

def native_toon(material):
    """Keep GLB linear base/vertex colour instead of replacing it with white PBR."""
    original = tuple(material.get('dafeiyu_base_color_linear', material.diffuse_color[:3]))
    use_vertex = bool(material.get('dafeiyu_vertex_colors', False))
    facial = bool(material.get('dafeiyu_flat_facial_color', False))
    material.use_nodes = True
    material.diffuse_color = (*original[:3], 1)
    material.use_backface_culling = False
    nodes, links = material.node_tree.nodes, material.node_tree.links
    nodes.clear()
    output = nodes.new('ShaderNodeOutputMaterial'); output.location = (700, 0)
    base = nodes.new('ShaderNodeRGB'); base.label = 'Original linear base colour'; base.location = (-700, 150)
    base.outputs[0].default_value = (*original[:3], 1)
    source = base.outputs[0]
    if use_vertex:
        vertex = nodes.new('ShaderNodeVertexColor'); vertex.layer_name = color_layer_for(material)
        vertex.label = 'Preserved GLB vertex colours'; vertex.location = (-700, -30)
        multiply = nodes.new('ShaderNodeMixRGB'); multiply.blend_type = 'MULTIPLY'; multiply.inputs[0].default_value = 1
        multiply.location = (-430, 150)
        links.new(base.outputs[0], multiply.inputs[1]); links.new(vertex.outputs['Color'], multiply.inputs[2])
        source = multiply.outputs[0]
    if not facial:
        diffuse = nodes.new('ShaderNodeBsdfDiffuse'); diffuse.inputs['Color'].default_value = (1, 1, 1, 1)
        diffuse.inputs['Roughness'].default_value = 0; diffuse.location = (-650, -280)
        to_rgb = nodes.new('ShaderNodeShaderToRGB'); to_rgb.location = (-420, -280)
        links.new(diffuse.outputs[0], to_rgb.inputs[0])
        ramp = nodes.new('ShaderNodeValToRGB'); ramp.label = 'Native three-step cel shade'; ramp.location = (-210, -210)
        ramp.color_ramp.interpolation = 'CONSTANT'
        ramp.color_ramp.elements[0].position = .18; ramp.color_ramp.elements[0].color = (.58, .61, .68, 1)
        ramp.color_ramp.elements[1].position = .70; ramp.color_ramp.elements[1].color = (1, 1, 1, 1)
        middle = ramp.color_ramp.elements.new(.43); middle.color = (.80, .83, .89, 1)
        links.new(to_rgb.outputs['Color'], ramp.inputs[0])
        shade = nodes.new('ShaderNodeMixRGB'); shade.blend_type = 'MULTIPLY'; shade.inputs[0].default_value = 1
        shade.location = (120, 60); links.new(source, shade.inputs[1]); links.new(ramp.outputs[0], shade.inputs[2])
        source = shade.outputs[0]
    emission = nodes.new('ShaderNodeEmission'); emission.location = (450, 0)
    emission.inputs['Strength'].default_value = 1; links.new(source, emission.inputs['Color'])
    links.new(emission.outputs[0], output.inputs['Surface'])
    material['dafeiyu_native_shader'] = 'stable facial colour' if facial else 'Eevee ShaderToRGB cel shade multiplied by preserved colour'

def animation_tracks():
    for obj in bpy.data.objects:
        if not obj.animation_data:
            continue
        for track in obj.animation_data.nla_tracks:
            yield obj, track

def neutral_pose():
    for obj in bpy.data.objects:
        if obj.animation_data:
            obj.animation_data.action = None
        if obj.type == 'ARMATURE':
            obj.data.pose_position = 'POSE'
            for bone in obj.pose.bones:
                # A default node transform can differ from inverse-bind rest:
                # e.g. Head's neutral 1.08 scale. Identity would erase it.
                saved = bone.get('dafeiyu_neutral_basis')
                bone.matrix_basis = Matrix([saved[i:i + 4] for i in range(0, 16, 4)]) if saved is not None else Matrix.Identity(4)
            obj.update_tag(refresh={'OBJECT', 'DATA', 'TIME'})
        if obj.type == 'MESH' and obj.data.shape_keys:
            for key in obj.data.shape_keys.key_blocks:
                key.value = 0
    for _, track in animation_tracks():
        track.mute = True
    bpy.context.scene.frame_set(1)
    bpy.context.view_layer.update()

def reference_image(filename, name, x, size, provenance, target):
    if not filename.is_file():
        raise FileNotFoundError(filename)
    image = bpy.data.images.load(str(filename), check_existing=True)
    image.pack()
    obj = bpy.data.objects.new(name, None); target.objects.link(obj)
    obj.empty_display_type = 'IMAGE'; obj.data = image
    obj.empty_display_size = size; obj.location = (x, 1.1, 1.45)
    obj.rotation_euler = (math.pi / 2, 0, 0)
    obj.empty_image_depth = 'BACK'; obj.color[3] = .82
    obj.show_in_front = False
    obj['reference_file'] = str(filename)
    obj['reference_sha256'] = digest(filename)
    obj['provenance'] = provenance
    obj['reference_only'] = True
    return obj

def build():
    RENDERS.mkdir(exist_ok=True)
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for old in list(bpy.data.collections):
        bpy.data.collections.remove(old)
    scene = bpy.context.scene
    scene.render.fps = 30
    supported = bpy.ops.import_scene.gltf.get_rna_type().properties.keys()
    options = {'filepath': str(GLB)}
    for name, value in {'import_pack_images': True, 'merge_vertices': False, 'import_shading': 'NORMALS'}.items():
        if name in supported:
            options[name] = value
    bpy.ops.import_scene.gltf(**options)
    bpy.context.view_layer.update()
    for obj in bpy.data.objects:
        if obj.type == 'ARMATURE':
            for bone in obj.pose.bones:
                bone['dafeiyu_neutral_basis'] = [value for row in bone.matrix_basis for value in row]
    groups = {name: collection(name) for name in ('00_Character_Body', '01_Face_Morphs', '02_Rig_40_Bones', '03_Reference_Boards', '04_Studio', '05_Orthographic_Cameras', '99_Rig_Viewport_Helpers')}
    groups['03_Reference_Boards'].hide_render = True
    groups['99_Rig_Viewport_Helpers'].hide_render = True
    helpers = {bone.custom_shape for obj in bpy.data.objects if obj.type == 'ARMATURE' for bone in obj.pose.bones if bone.custom_shape}
    for obj in list(bpy.data.objects):
        if obj in helpers:
            move(obj, groups['99_Rig_Viewport_Helpers']); obj.hide_render = True; obj.hide_set(True)
            obj['dafeiyu_viewport_helper'] = True
        elif obj.type == 'ARMATURE':
            move(obj, groups['02_Rig_40_Bones']); obj.show_in_front = True; obj.data.display_type = 'STICK'
        elif obj.type == 'MESH' and obj.data.shape_keys:
            move(obj, groups['01_Face_Morphs'])
        else:
            move(obj, groups['00_Character_Body'])
    # glTF stashes imported actions with zero strip influence. Keep presentation
    # muted, but make an unmuted track immediately playable by the artist.
    for _, track in animation_tracks():
        for strip in track.strips:
            strip.use_animated_influence = False
            strip.influence = 1
            strip.blend_type = 'REPLACE'
            strip.extrapolation = 'NOTHING'
    neutral_pose()
    for material in list(bpy.data.materials):
        native_toon(material)
    character_meshes = [o for o in bpy.data.objects if o.type == 'MESH' and not o.get('dafeiyu_viewport_helper')]
    points = [obj.matrix_world @ Vector(corner) for obj in character_meshes for corner in obj.bound_box]
    lo = Vector(tuple(min(p[i] for p in points) for i in range(3)))
    hi = Vector(tuple(max(p[i] for p in points) for i in range(3)))
    center = (lo + hi) / 2
    scale = max(hi.z - lo.z, hi.x - lo.x) * 1.18
    source = json.loads((PROJECT / 'export-model-verification.json').read_text(encoding='utf-8'))
    scene['dafeiyu_source_hashes'] = json.dumps(source['source_hashes_before'], ensure_ascii=False)
    scene['dafeiyu_default_tuning'] = json.dumps(source['tuning'], ensure_ascii=False)
    scene['dafeiyu_animation_clips'] = json.dumps(list(CLIPS))
    scene['dafeiyu_status'] = 'Editable procedural refinement master; not finished VRM or production topology'
    scene['dafeiyu_reference_policy'] = 'Canonical front is selected reference; inferred side/back sheet is supplementary, not author truth; tail v5 colour has priority.'
    reference_image(LIBRARY / 'production/v1/neutral-front.png', 'REF_01_Canonical_Selected_Front', 4.5, 3.2, 'Selected canonical image, unchanged pixels', groups['03_Reference_Boards'])
    reference_image(PROJECT / 'references/turnaround-inferred-v1.png', 'REF_02_INFERRED_Side_Back_Not_Author_Truth', 9.7, 6.8, 'AI-inferred structural turnaround; side/back are hypotheses, not original-author views; tail colour subordinate to v5', groups['03_Reference_Boards'])
    reference_image(LIBRARY / 'references/user/tail-color-reference-v5.png', 'REF_03_Tail_Colour_v5_Priority', 15.0, 3.1, 'User tail v5 colour reference has priority; no outfit transfer', groups['03_Reference_Boards'])
    # Ground and studio lighting are separate editable objects, never source art.
    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, lo.z - .012))
    floor = bpy.context.object; floor.name = 'Studio / neutral matte floor'; move(floor, groups['04_Studio'])
    material = bpy.data.materials.new('Studio / neutral warm grey'); material.diffuse_color = (.67, .70, .74, 1)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get('Principled BSDF'); bsdf.inputs['Base Color'].default_value = (.67, .70, .74, 1); bsdf.inputs['Roughness'].default_value = .9
    floor.data.materials.append(material)
    scene.world = bpy.data.worlds.new('Studio / neutral ambient')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (.73, .77, .83, 1)
    scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .55
    for name, location, power, size in [('Key', (-3.5, -4.5, 6.5), 500, 5), ('Fill', (4, -2, 4), 170, 4), ('Rim', (0, 4, 5), 180, 4)]:
        light = bpy.data.lights.new('Studio / ' + name, 'AREA'); light.energy = power; light.shape = 'DISK'; light.size = size
        obj = bpy.data.objects.new(light.name, light); groups['04_Studio'].objects.link(obj); obj.location = location; aim(obj, center)
    offsets = {'front': (0, -8, .01), 'left': (8, 0, .01), 'back': (0, 8, .01), 'threequarter': (5, -8, 1.4)}
    cameras = {}
    for name, offset in offsets.items():
        camera = bpy.data.cameras.new('Ortho / ' + name); camera.type = 'ORTHO'; camera.ortho_scale = scale
        obj = bpy.data.objects.new(camera.name, camera); groups['05_Orthographic_Cameras'].objects.link(obj)
        obj.location = center + Vector(offset); aim(obj, center); camera.lens = 50; camera.clip_end = 300
        obj['view'] = name; obj['projection'] = 'true orthographic'; cameras[name] = obj
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 1024; scene.render.resolution_y = 1024; scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'; scene.render.image_settings.color_mode = 'RGBA'
    scene.render.film_transparent = False
    scene.view_settings.view_transform = 'Standard'; scene.view_settings.look = 'Medium High Contrast' if 'Medium High Contrast' in [i.identifier for i in scene.view_settings.bl_rna.properties['look'].enum_items] else 'None'
    scene.view_settings.exposure = 0; scene.view_settings.gamma = 1
    scene.frame_start = 1; scene.frame_end = 141
    scene.camera = cameras['front']
    for obj in bpy.context.selected_objects:
        obj.select_set(False)
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == 'VIEW_3D':
                area.spaces.active.region_3d.view_location = center
                area.spaces.active.region_3d.view_distance = scale * 1.2
                area.spaces.active.region_3d.view_rotation = cameras['front'].rotation_euler.to_quaternion()
                area.spaces.active.region_3d.view_perspective = 'ORTHO'
                area.spaces.active.shading.type = 'MATERIAL'
    notes = bpy.data.texts.new('README_DAFEIYU_EDITABLE_MASTER')
    notes.write('Dafeiyu editable procedural refinement master v1\n\n40-bone source rig, body vertex colours, and 36 facial meshes with blink/aa/happy/sad shape keys.\nActions idle/wave/walk/turn are baked from the local procedural controller at 30 fps, including physics.js hair/tail bone dynamics. These are animation keys, not native editable physics constraints. Walk is in place; no foot IK/contact claim.\nNLA tracks are muted in the saved neutral presentation. Unmute the desired clip track to preview it.\nReferences are packed and kept in their own hidden-from-render collection. Side/back turnaround is INFERRED, not original-author truth. Tail v5 colour reference has priority.\nNative shaders preserve the source base/vertex colours: stable facial emission plus Eevee cel-shaded costume/hair. Browser postprocess outlines are not source geometry.\nNot a finished VRM, production topology, final likeness approval, or complete physics authoring.\n')
    for image in bpy.data.images:
        if image.source == 'FILE' and not image.packed_file:
            image.pack()
    bpy.ops.wm.save_as_mainfile(filepath=str(MASTER), check_existing=False)
    for name in ('front', 'left', 'back', 'threequarter'):
        scene.camera = cameras[name]; scene.render.filepath = str(RENDERS / (name + '.png'))
        bpy.ops.render.render(write_still=True)
    scene.camera = cameras['front']; scene.render.filepath = str(RENDERS / 'front.png')
    neutral_pose()
    bpy.ops.wm.save_as_mainfile(filepath=str(MASTER), check_existing=False)

def verify():
    arms = [o for o in bpy.data.objects if o.type == 'ARMATURE']
    assert len(arms) == 1 and len(arms[0].data.bones) == 40, [(o.name, len(o.data.bones)) for o in arms]
    armature = arms[0]
    morph_meshes = [o for o in bpy.data.objects if o.type == 'MESH' and o.data.shape_keys]
    assert len(morph_meshes) == 36, len(morph_meshes)
    assert all(all(name in o.data.shape_keys.key_blocks for name in MORPHS) for o in morph_meshes)
    morph_changes = {}
    for name in MORPHS:
        maximum = max((a.co - b.co).length for obj in morph_meshes for a, b in zip(obj.data.shape_keys.key_blocks[name].data, obj.data.shape_keys.key_blocks['Basis'].data))
        assert math.isfinite(maximum) and maximum > 1e-5, ('No geometric shape-key change', name, maximum)
        morph_changes[name] = maximum
    meshes = [o for o in bpy.data.objects if o.type == 'MESH' and o.name != 'Studio / neutral matte floor' and not o.get('dafeiyu_viewport_helper')]
    skinned = [o for o in meshes if any(m.type == 'ARMATURE' and m.object == armature for m in o.modifiers)]
    assert skinned, 'No native Armature modifier remains'
    colour_meshes = [o for o in meshes if o.data.color_attributes]
    assert colour_meshes, 'Native vertex colours were lost'
    action_names = [a.name for a in bpy.data.actions]
    matched = {clip: [name for name in action_names if clip in name.lower()] for clip in CLIPS}
    assert all(matched.values()), matched
    neutral_pose()
    tuning = json.loads(bpy.context.scene['dafeiyu_default_tuning'])
    expected_head_scale = tuning['headScale']
    neutral_head_scale = list(armature.pose.bones['Head'].matrix.to_scale())
    assert all(abs(value - expected_head_scale) < 1e-5 for value in neutral_head_scale), ('Neutral Head scale was lost', neutral_head_scale, expected_head_scale)
    pose_checks = {}
    identity = [tuple(v for row in bone.matrix for v in row) for bone in armature.pose.bones]
    skin_object = skinned[0]
    vertex_ids = list(range(0, len(skin_object.data.vertices), max(1, len(skin_object.data.vertices) // 128)))
    def skin_snapshot():
        evaluated_mesh = skin_object.evaluated_get(bpy.context.evaluated_depsgraph_get())
        return [evaluated_mesh.matrix_world @ evaluated_mesh.data.vertices[i].co for i in vertex_ids]
    neutral_skin = skin_snapshot()
    for clip in CLIPS:
        found = 0
        for _, track in animation_tracks():
            belongs = clip in track.name.lower() or any(clip in strip.action.name.lower() for strip in track.strips if strip.action)
            track.mute = not belongs
            found += int(belongs)
        assert found, 'No NLA track for ' + clip
        armature.update_tag(refresh={'OBJECT', 'DATA', 'TIME'})
        bpy.context.scene.frame_set(65 if clip == 'turn' else 35)
        # frame_set evaluates animated RNA first. Tag the pose afterwards too,
        # because Python-side NLA muting does not always invalidate its cache.
        armature.update_tag(refresh={'OBJECT', 'DATA', 'TIME'})
        bpy.context.view_layer.update()
        evaluated = armature.evaluated_get(bpy.context.evaluated_depsgraph_get())
        current = [tuple(v for row in bone.matrix for v in row) for bone in evaluated.pose.bones]
        assert all(math.isfinite(v) for matrix in current for v in matrix)
        difference = max(abs(a - b) for old, new in zip(identity, current) for a, b in zip(old, new))
        assert difference > 1e-5, (clip, difference)
        moved_skin = skin_snapshot()
        skin_difference = max((a - b).length for a, b in zip(neutral_skin, moved_skin))
        assert skin_difference > 1e-5, ('skin', clip, skin_difference)
        pose_checks[clip] = {'nla_tracks': found, 'sample_frame': bpy.context.scene.frame_current, 'max_bone_matrix_component_change': difference, 'max_sampled_skin_vertex_change': skin_difference, 'skin_samples': len(vertex_ids), 'finite': True}
    neutral_pose()
    references = [o for o in bpy.data.objects if o.get('reference_only')]
    assert len(references) == 3 and all(o.data.packed_file for o in references)
    helpers = [o for o in bpy.data.objects if o.get('dafeiyu_viewport_helper')]
    assert helpers and all(o.hide_render and all(c.hide_render for c in o.users_collection) for o in helpers), 'Rig display helper must never render'
    cameras = {o.get('view'): o for o in bpy.data.objects if o.type == 'CAMERA'}
    assert all(name in cameras and cameras[name].data.type == 'ORTHO' for name in ('front', 'left', 'back', 'threequarter'))
    for name in ('front', 'left', 'back', 'threequarter'):
        assert (RENDERS / (name + '.png')).stat().st_size > 1000
    original_hashes = json.loads(bpy.context.scene['dafeiyu_source_hashes'])
    current_hashes = {name: digest(LIBRARY / 'production/rig3d-prototype' / name) for name in original_hashes}
    changed = [name for name in original_hashes if original_hashes[name] != current_hashes[name]]
    result = {
        'schema_version': 1, 'status': 'verified_reopened_native' if VERIFY_ONLY else 'built_verified_pending_independent_reopen',
        'independent_process_reopen': VERIFY_ONLY, 'blender_version': bpy.app.version_string,
        'native': artifact(MASTER), 'glb': artifact(GLB), 'build_script_sha256': digest(__file__),
        'armature': {'name': armature.name, 'bones': len(armature.data.bones), 'bone_names': [b.name for b in armature.data.bones]},
        'native_skinned_meshes': len(skinned), 'native_vertex_colour_meshes': len(colour_meshes),
        'facial_morph_meshes': len(morph_meshes), 'morph_names': list(MORPHS), 'morph_max_vertex_changes': morph_changes,
        'neutral_proportions': {'body_scale': tuning['bodyScale'], 'expected_head_scale': expected_head_scale, 'actual_head_matrix_scale': neutral_head_scale, 'applied_without_animation': True},
        'rig_viewport_helpers': {'count': len(helpers), 'all_excluded_from_render': True},
        'actions': matched, 'action_pose_checks': pose_checks,
        'references': [{'name': o.name, 'packed': bool(o.data.packed_file), 'file': o['reference_file'], 'provenance': o['provenance']} for o in references],
        'renders': {name: artifact(RENDERS / (name + '.png')) for name in ('front', 'left', 'back', 'threequarter')},
        'source_hashes_used': original_hashes, 'source_hashes_at_verification': current_hashes, 'changed_source_files': changed,
        'shader': 'Eevee native ShaderToRGB cel shade with original base and vertex colours; facial original colours preserved with emission',
        'limitations': ['Procedural triangulated refinement source, not production topology or final likeness approval.', 'Not a completed VRM or physics setup.', 'Side/back reference is inferred, not original-author ground truth.', 'Walk clip is in place; no foot IK/contact or motion-capture claim.'],
    }
    REPORT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'status': result['status'], 'armature_bones': 40, 'morph_meshes': len(morph_meshes), 'actions': matched, 'changed_sources': changed, 'report': str(REPORT)}, ensure_ascii=False, indent=2))

if VERIFY_ONLY:
    bpy.ops.wm.open_mainfile(filepath=str(MASTER))
else:
    build()
verify()
