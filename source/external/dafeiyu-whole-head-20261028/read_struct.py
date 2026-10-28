import json
from pathlib import Path
p=Path('E:/zzz/dafeiyu-character-materials-20261025/production/appearance-preserving-face/structural-v3/component')
print([f.name for f in p.iterdir() if f.is_file()])
d=json.loads((p/'structure.json').read_text());print(d.keys());c=d['deformationConfig'];print(c.keys());print([(h['type'],h.get('eye'),len(h.get('neutralRim',[])),h.keys()) for h in c['holes']])
