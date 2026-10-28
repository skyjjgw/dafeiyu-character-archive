# Whole-character NPR look experiment (candidate)

`finalAccepted=false`. This tests actual native whole-character geometry, and does not mark the unfinished model complete.

- Native candidate: `D:/CodexTaskData/dafeiyu-whole-lookdev-20261028/v1/whole-character-npr-candidate.blend`
- Actual 512px renders: `D:/CodexTaskData/dafeiyu-whole-lookdev-20261028/v1/{flat,cel}-{000,045,090}.png`
- Comparison: `comparison-v1.png` (top flat existing base color, bottom cel and outline; same geometry, camera, frame and fixed light).
- Reusable style: `apply_anime_style.py`; full working directory `D:/CodexTaskData/dafeiyu-whole-lookdev-20261028`.
- Source: body-native-v8 + head-native-review v9 + DAFEIYU_TAIL_NATIVE. Later geometry revisions are not present in this snapshot.

Style: Eevee diffuse-white lighting to ShaderToRGB, constant two-band ramp (shadow RGB multiplier .64/.68/.77, lit 1), multiplied by existing base-color stream, emitted without plastic gloss. Source UV/vertex color streams survive. Face paint, SOURCE iris/eye/contour materials and unlit apron print are left on their existing shader graphs. Source-compatible limb skin is set to linear .69/.60/.45; face pixels are not repainted. Original material nodes remain present and their original output may be reactivated. Subtle Freestyle navy contours use .75px at the 512px review resolution. No geometry is edited.

Validation: SHA-256 comparison of native vertex coordinates, polygon indices, UV data and color attributes agrees exactly for all 110 source mesh objects before/after. All views use the same editable geometry. No billboard, view-dependent geometry, image generation or image retouching is used. The contact sheet only arranges the actual PNG outputs and adds labels.

Limits: source silhouette/proportions/neck/hair/skirt/tail integration remain candidate work. Freestyle warns about degenerate triangles and duplicate edges in the source candidate; this script does not repair source geometry. ShaderToRGB requires Eevee and is not a portable game-engine shader. Rear design is inferred, not original reference evidence. Flat/cel images test style only and do not imply model acceptance, motion readiness or production completion.

Reapply to a later source using the project wrapper with an explicit `-BlenderArguments @(...)` array so PowerShell passes Blender's `--` separator:

```powershell
& 'E:/zzz/dafeiyu-character-materials-20261025/tools/blender/Invoke-Blender.ps1' -BlenderArguments @('--background','--threads','2','--python','D:/CodexTaskData/dafeiyu-whole-lookdev-20261028/apply_anime_style.py','--','--input','PATH/whole-master.blend','--output','D:/CodexTaskData/dafeiyu-whole-lookdev-20261028/next','--size','512')
```

No third-party installs, external keys, motion/physics/DSH, or source geometry ownership changes.
