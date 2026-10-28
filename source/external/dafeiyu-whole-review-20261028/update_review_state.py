import json
from pathlib import Path

root = Path('E:/zzz/dafeiyu-character-materials-20261025')
review = {
    'date': '2026-10-28',
    'userCorrection': '主要是现在我发现连人物整体模型都没做好',
    'reviewer': 'root',
    'basis': 'Personally inspected actual saved native full-character color and clay renders at 0/45/90/180, compared with frozen selected identity and generated auxiliary turnaround.',
    'candidate': 'D:/CodexTaskData/dafeiyu-whole-form-20261028/body/whole-character-master-v1.blend',
    'nativeAudit': 'D:/CodexTaskData/dafeiyu-whole-review-20261028/master-v1-native-audit.json',
    'issues': [
        {'part': 'neck', 'finding': 'Excess exposed neck and an exposed skin band below rear hair.', 'state': 'fix_in_progress'},
        {'part': 'hair', 'finding': 'Tubular block locks, square root joins and sharp cap fragments around nape; not yet reference S-wave layered hair.', 'state': 'fix_in_progress'},
        {'part': 'head', 'finding': 'Eye opening corners and shallow cheek/neck ridges visible in clay.', 'state': 'fix_in_progress'},
        {'part': 'costume', 'finding': 'Chest bib/bow, hands and shoes remain overly simplified.', 'state': 'fix_in_progress'},
        {'part': 'tail_garment', 'finding': 'Tail intersects closed back skirt/petticoat without a proper fabric opening.', 'state': 'fix_in_progress'},
        {'part': 'topology', 'finding': 'Base closed overskirt and several shoe meshes have inward winding; open fabric must remain intentionally open.', 'state': 'body_owner_correcting'},
        {'part': 'style', 'finding': 'Cel render is a useful candidate, but coarse geometry and fragmented shadows remain visible.', 'state': 'separate_lookdev_candidate'},
    ],
    'requiredNextEvidence': [
        'One coherent updated editable native master with head/body/hands/feet/costume/tail in shared frame.',
        'Actual front/45/side/back and mild pitch color and clay review.',
        'Original face/eyes and identity comparison, not a generic replacement character.',
        'Check real cloth tail opening, external normals and no visible raw guide duplicates.',
    ],
    'oldPreviewPreserved': 'http://127.0.0.1:4348/character-preview.html',
    'motionAndPhysicsExpansion': 'deferred_until_static_character_quality_passes',
    'appearanceAccepted': False,
    'finalAccepted': False,
    'complete': False,
}
p = root/'production/whole-character-rebuild/root-review-v1.json'
p.write_text(json.dumps(review, ensure_ascii=False, indent=2), encoding='utf-8')
p = root/'metadata/character-current-state.json'
state = json.loads(p.read_text(encoding='utf-8-sig'))
state.setdefault('wholeModelRebuild', {})['rootReview'] = 'production/whole-character-rebuild/root-review-v1.json'
state['wholeModelRebuild']['currentNativeCandidate'] = review['candidate']
state['wholeModelRebuild']['staticModelAccepted'] = False
state['wholeModelRebuild']['motionAndPhysicsExpansion'] = review['motionAndPhysicsExpansion']
state['complete'] = False
p.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding='utf-8')
p = root/'metadata/model-routing-policy.json'
policy = json.loads(p.read_text(encoding='utf-8-sig'))
entry = next((x for x in policy['applied'] if x.get('task') == 'whole_model_lookdev'), None)
if entry is None:
    entry = {'task': 'whole_model_lookdev'}
    policy['applied'].append(entry)
entry.update({'model': 'gpt-6.1-sol', 'reasoningEffort': 'high',
              'state': 'reusable_native_render_review_in_progress',
              'reason': '常规Blender二次元材质与固定机位实渲，独立副本不改造型；困难头颅拓扑继续仅由专项强模型处理。'})
p.write_text(json.dumps(policy, ensure_ascii=False, indent=2), encoding='utf-8')
print('Saved root visual findings, native candidate status and model routing; acceptance remains false.')
