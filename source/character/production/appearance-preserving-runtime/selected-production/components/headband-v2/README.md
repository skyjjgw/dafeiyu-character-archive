# Headband v2 runtime component — partial improvement

This is a Head-local rigid component for the selected original girl. It does not
add frill cloth physics and has not received final artistic acceptance. Geometry,
source paint, palette, UVs and thickness are copied from the frozen headband-v2
asset; no source face, hair, body, proportions or skin resources are edited here.

The component ID is `headband-continuous-shell`, matching the current registry's
reserved slot. The directory remains `components/headband-v2`.

```gdscript
var handle = load("res://selected-production/components/headband-v2/factory.gd").new()
var built = handle.setup(actor.rig.head, asset.renderer)
if not built.ok:
    handle.dispose()
    return built
# setup leaves a hidden, unparented, local-identity model and leaves source alone.
# Validate built.contract with component_registry.verify_external before commit.
var verified = components.verify_external(built.contract)
if not verified.ok:
    handle.dispose()
    return verified
var installed = handle.commit()
if not installed.ok:
    handle.dispose()
    return installed
# Keep handle alive until restore or scene exit. Do not add_child(model) again.
# No per-frame update is required: unchanged identity follows Head exactly once.
# Later:
handle.dispose()
```

`setup(head, renderer)` returns `ok`, `id`, `model`, `adapter`, `handle`, `contract`,
`files`, `respaths`, `commit`, `dispose`, `import`, and acceptance flags. Adapter
and handle both reference the factory; `snapshot()` exposes lifecycle/import
state. Commit is idempotent. Dispose is idempotent and restores the seven saved
source visibility flags, including a flag that was already false. The original
source remains unchanged if setup fails or the caller disposes before commit.

The original seven meshes are identified by exact resource-name aliases only:
the author ID or Godot 4.7's `selected-appearance_` prefix with `:` changed to `_`.
Missing or duplicate matches reject installation. No other hair meshes are hidden.

Material transfer uses the host's original cover texture at
`source_textures[0]`. Setup requires `linear_textures=true` and verifies the host
native GLB and image hashes. The host's RGBA16F linear cache is shared and never
sRGB-decoded a second time. The frozen shader reads `CUSTOM0.rgb` as linear float
palette and preserves `UV2.x` as paint weight on both shell sides. It flips UV.y
once, blends source paint in linear space, and encodes once for Compatibility
output. The component is opaque with back-face culling and depth writes.

Godot imports are performed with mesh compression disabled. Canonical float32
POSITION, NORMAL, TEXCOORD_0, TEXCOORD_1 and COLOR_0 byte hashes are verified.
Imported POSITION/UV/UV2 jointly identify each palette entry, avoiding an
ambiguous position-only color lookup. CUSTOM0 uses RGBA_FLOAT, followed by exact
ArrayMesh POSITION/UV/UV2/CUSTOM0 byte roundtrip checks.

Validation command from the runtime project:

```powershell
& '<project>/tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64_console.exe' `
  --headless --path '<project>/production/appearance-preserving-runtime' `
  --script res://selected-production/components/headband-v2/check.gd
```

For an independent offscreen GPU process, pass the same script without
`--headless`, add `--position -2200,-1500 --resolution 640x704`, then `-- --capture`.
`reports/gpu-import-report.json` records the **actual loaded GLB SHA**, engine,
device and four captured angles. These new captures supersede the geometry
candidate's older import report. They establish native import/static rendering;
side/back material quality and full character dynamics remain separate review.

`build-contract.ps1` refreshes local payload hashes after intentional adapter
changes. It never regenerates or modifies the frozen geometry.
