# Selected appearance: static engine transfer

The ongoing combined native character is now [selected-production/current.tscn](selected-production/current.tscn),
documented in [selected-production/README.md](selected-production/README.md).
It keeps this selected identity while combining structural head v3, continuous
headband and five static hair locks, body/finger motion and real Jolt tail.
Hair/garment physics and final all-angle appearance are unfinished.
It is explicitly current work, not final visual or
full-physics acceptance. This document below remains the static transfer record.

This document describes the unchanged **static comparison scene**. A separate
live body-control and exact-source facial-kernel candidate now exists in the
same project: see [MOTION.md](MOTION.md) and run `./Run-Motion.ps1`.
It preserves the selected character; it has not passed full-angle, anatomy,
natural acting, hair/cloth dynamics or final-product acceptance. The default
static scene, original 4348 preview and DSH installation remain separate.

This independent experiment imports the **actual character selected at 4348**.
It does not reconstruct a new face, replace the source artwork, connect to DSH,
or change the frozen webpage. It is not an animation or physics delivery.

The exporter reads the frozen JavaScript snapshot into memory without a browser
or WebGL. It writes all 77 real meshes, 13 body skins, the original 22 body
joints, the attached Head hierarchy, 53 materials and three original image byte
streams. The neutral pose is `manual/full/t=0`, yaw/pitch/gaze/blink/talk zero.
The original inverse bind matrices remain distinct from the neutral ground-IK
pose (hips are 0.012 lower); no pose is silently redefined as a new rest.

```powershell
node ./export-baseline.mjs
node ./verify-transfer.mjs
./Run-Comparison.ps1 -Inspect
python ./verify_import_precision.py
./Run-Comparison.ps1 -ColorProbe
python ./build_linear_textures.py
./Run-Comparison.ps1 -LinearTextures -FloatColors
python ./compare_pixels.py --capture reports/selected-appearance-godot-linear-float.png --suffix=-linear-float --output reports/source-godot-linear-float-comparison.json
```

The portable, previously verified official Godot 4.7.2 is used from project
`tools/godot`. Application data is redirected to this directory's
`.runtime-user` only. The capture process is offscreen and exits after rendering.
No software is installed, no PATH is changed, no DSH process is started.

The 640 × 704 camera exactly follows the selected HUD's orthographic camera:
position `(0.195, 0.565, 6)`, target `(0.195, 0.565, 0)`, half-height `1.76985`.
Source textures retain their bytes and original UV accessors. glTF declares the
V sampling conversion through `KHR_texture_transform`. The runtime's custom
source material samples the unchanged UV with **one** explicit V flip; it does
not also apply the imported StandardMaterial texture transform.

Basic materials are exported with `KHR_materials_unlit`. glTF's ordinary material
cannot express Three's simultaneous transparent blend + alpha-test + depth-write
flags, or Three's toon light function. These original flags are recorded in each
material's extras and `assets/source-rendering.json`; the static runtime shader
retains them, including vertex RGBA multiplication and the original three-light
toon calculation. This is a source-renderer transfer, not a new look shader.
Source shader calculations are linear, with source-image sRGB decode and
Compatibility output encode; source images and material colors are unedited.
The recommended `-LinearTextures` path uses a derived RGBA16F GPU cache decoded
from the actual Godot-decoded original pixels. Filtering and mip generation
therefore operate in linear RGB, rather than averaging encoded sRGB first.
The original embedded image bytes remain unchanged. The raw RGBA8 and no-mipmap
paths remain available as diagnostic comparisons, not as new source artwork.

Godot's default mesh attribute compression is disabled using the actual 4.7.2
API flag. The imported CPU ArrayMesh positions and UVs are compared against the
source primitive, accounting for Godot's per-primitive vertex compaction. This
does not certify GPU skinning or identical rasterization. Standard ArrayMesh
vertex colors have its RGBA8 packing precision. The recommended `-FloatColors`
path binds the original float vertex colors to RGBA32F `CUSTOM0`, with GLB,
per-surface position/UV and float-channel byte hashes checked before and after
rebuilding the same ArrayMesh arrays. Positions, UVs, indices and skin stay in
place. This avoids artistic recoloring to compensate for renderer quantization.
Shader derivatives,
texture filtering, JPEG decoding, alpha sorting and multisample coverage can
also differ between renderers. Remaining pixel differences are recorded, not
hidden by repainting the character.

Evidence:

- `assets/selected-appearance.glb`: self-contained static transfer.
- `assets/source-rendering.json`: source hashes, exact accessor hashes, mesh,
  material, image, bone hierarchy, camera and scope statistics.
- `reports/exact-transfer-verification.json`: independent fresh GLB byte parse.
- `reports/imported-precision-comparison.json`: actual Godot imported arrays.
- `reports/selected-appearance-godot-linear-float.png`: recommended actual RTX
  4060 GPU render, using linear texture filtering and original float colors.
- `reports/source-godot-linear-float-comparison.json`: its static differences.
- `reports/rgba8-mipmap-probe.json`: actual black/white CPU mip average.
- Earlier raw-RGBA8, no-mip and linear-mip results remain as diagnostic evidence.

The source's dynamic iris UVs, eyelid alpha, facial deformation, hair deformation,
body animation and secondary-motion controllers are **not live** in this scene.
Existing inferred sides/back, overlaps, thin patches and topology flaws remain.
No 90-degree reconstruction, natural full-body action, Jolt character physics,
or finished visual quality is claimed. These must be developed while retaining
this selected identity, with the original frontend kept as the comparison.

The optional [hair-candidate](hair-candidate/README.md) is a local, unpromoted
headband/frill depth experiment. It does not alter the default transferred asset.
It failed actual side-view review and remains research only. The independent
[hands-candidate](hands-candidate/README.md) integrates the repaired local hand
package and a target-directed greeting correction; its source identity, native
skinning and limited control checks have evidence, while final visual quality,
hand/object physics and whole-character acceptance remain open.
