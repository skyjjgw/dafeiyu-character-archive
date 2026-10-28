# Repeatable native-master review entry

[run_review.py](D:/CodexTaskData/dafeiyu-whole-lookdev-20261028/run_review.py)

```powershell
python 'D:/CodexTaskData/dafeiyu-whole-lookdev-20261028/run_review.py' --blend 'D:/path/to/new-master.blend' --out 'D:/path/to/independent-review-output' --angles 0,45,90,180 --pitch 0
```

Use `--pitch 8` for an 8-degree elevated camera; pitch 0 is exactly level. Default resolution is 512×563; `--size` adjusts width while preserving 1:1.1 aspect. The orthographic scale is always 1.20927095413208, target (.063081, -.005865, -.002912), raw X+ front / Z+ up. This fixed frame intentionally does not auto-fit geometry or follow angle with the light.

The script launches the existing project Blender 4.5 offline with autoexec disabled, directly reads the supplied master, and produces `color-ANGLE.png`, `clay-ANGLE.png`, `render.log` and `manifest.json`. All generated output stays under the specified D-drive directory. It never assembles parts, edits meshes, or saves a changed blend. It refuses to overwrite existing review images.

Color uses original base-color streams/UVs/vertex colors and preserves face/eye/unlit-print shader graphs. Default shading is a broad EASE low-contrast .82–1 multiplier; no specular, outlines or cast-shadow maps. Gray clay uses explicit temporary object-linked material slots because Eevee can ignore view-layer material overrides on source emission materials. This preserves source mesh data and is never saved.

Manifest records source-file SHA-256, per-mesh native geometry/UV/color/transform hashes, evaluated geometry hashes, settings and camera coordinates. Evaluated geometry is checked before every camera view and the run aborts if it changes with angle. Source-file and native geometry integrity are checked after all renders.

`finalAccepted=false`: this is a repeatable inspection tool, not model acceptance. The existing v1 material experiment remains separately available and unchanged.
