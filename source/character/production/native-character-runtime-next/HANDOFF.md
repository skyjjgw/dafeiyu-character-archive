# Native runtime snapshot — 2026-10-27

Current project: `E:/zzz/dafeiyu-character-materials-20261025/production/native-character-runtime`.

```powershell
pwsh -NoProfile -File E:/zzz/dafeiyu-character-materials-20261025/production/native-character-runtime/Run-Lab.ps1 -Mode Main
```

Window title: 大肥鱼 · 动作试作 (official editor binary may append DEBUG). W/S forward/back, A/D strafe, Q/E turn, F pick cup, G release, 1 wave, Esc interrupt, P pause; right drag camera, wheel zoom. F8 and the collapsed-details save button work while paused. Close normally with Alt+F4. No DSH installation or modification occurred.

Complete native model, actual Skeleton / IK / morph / 53 Jolt PhysicalBone joints / 47 authored body contacts / 1216-point SoftBody / 64-panel physical stiff underskirt are bound. The same stiff underskirt participates in root translation sweeps and proposed-turn collision queries, avoiding kinematic cloth crushing against the table. Bone and collider binding uses actual supplied rest data. Supplemental cloth bending applies objective signed-dihedral forces and damping; Jolt still integrates all free points. No image cards, frame switching, per-frame cup teleport, free-cloth hard targets, or sine secondary solver.

Frozen verified assets: GLB `3d09ccde3ea8b70763c00add5cee9517e7d9aa78ab812f8fd28aacadf7d2fd9e` (5,961,816 B), bind `4e294fd56c41d11a7a1856db2624c00925b8a6aa96772e225b59a6faeb911686`, cage `2fdbd1d0a4cf6d4e9800059910d3e063127ea365f281a2a6d128077dc62c7d0f`, petticoat `ca5456100cd3f76db5b330c8cba07273bb6c881274bd3119426dd5d2d87e79f0`. Sync validates GLB/blend/bind/cage hashes before writing and checks the underskirt source cage. Run-Lab preserves snapshots unless missing or explicitly `-RefreshAsset`.

Evidence: Api smoke passes; independent Physics smoke 14 checks passes; native character smoke 17 checks passes; signed-dihedral gradient 300 randomized cases, max error 1.14e-10 and net force/torque below 1e-14. Final real RTX4060 GPU stress covers 44.729 simulated seconds, including 30 s idle, obstacle turn blocking, free 90° turn, pickup / lift / release. All eight saved stages: zero inverted or collapsed cage triangles, max area ratio 1.0645. Latest long-run grasp command gap 7.33 mm, post-solver gap 5.32 mm. Numeric thresholds are failure alarms, not artistic approval.

Review `reports/native-stress-idle-30s.png`, `native-stress-free-turn-90.png`, `native-stress-hold.png`, `native-stress-final-front/side/back.png`; current neutral and halfblink / combined-expression portraits are also regenerated for the exact frozen asset hashes. Latest capture stderr files are empty. Prior actual failures remain under `native-interactive-cloth-failure.png`, `native-stress-before-root-envelope*`, `native-stress-before-signed-bending*`, and the previous support candidate directory.

Remaining limits: art is not reference-video quality; side hair roots have seams; authored clothing needs a physical tail opening; embroidery outlines are too heavy; gait is kinematic root + ground IK rather than natural whole-body active balance; fingers are articulated but not force-closure grasping; garment self-contact and extreme gestures are not approved. The fixed-step GPU stress reported ~37 FPS under Compatibility; actual Main interaction performance should be measured separately. No audio input is connected, default visemes stay zero; expression portraits are manual QA poses.

Main files: `project.godot`, `Run-Lab.ps1`, `Sync-Asset.ps1`, `scenes/main.tscn`; scripts `main`, `native_controller`, `native_rig`, `native_materials`, `native_secondary`, `native_cloth`, `native_cup`, `grasp_constraint`, `character_protocol`, `skin_calibration`, `native_smoke`, `native_stress`, `cloth_transfer_probe`, `verify_bending`; shaders `native_toon`, `native_skin`, `native_iris`, `native_cloth`, `native_cloth_outline`, `cloth_deform` plus shared outline. `RUNTIME.md` contains current scope; README retains the historical engine-lab record.
