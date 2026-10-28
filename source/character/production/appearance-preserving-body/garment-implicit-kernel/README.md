# Selected garment implicit material experiment

Status: **bounded research component, not a production solver or physics/visual acceptance**. Original 4348 assets, default runtime, garment adapter/manifest, old native helper, and frozen head source/DLL are untouched. No GPU capture was needed. This directory contains a separate GDExtension and independent headless probes.

## Diagnosis

The old signed-dihedral first derivative has the correct sign. Its translation/rotation null modes and finite differences were checked independently. The failure is consistent with explicit integration at tiny per-point mass, not a reversed gradient.

Godot 4.7 Jolt sets inverse mass to `N/total_mass` for all mesh points, then zeroes the pinned points. For the actual meshes this is `22800 kg^-1` outer / `36571.42857 kg^-1` lining, with free masses **43.86 / 27.34 milligrams** (`4.386e-5 / 2.734e-5 kg`). Their 96 waist pins each have inverse mass zero. Metres are applied once: `.35 * (sourceNeutral + (0,1.055,0))`, followed by an actor rigid transform.

The old `moment_limit=.0003` is an angular generalized moment in N*m. Force equals moment times the angle gradient (1/m); neighboring hinges then accumulate. It never was a nodal force cap. Its reported quadratic elastic energy also did not match a material with the total elastic-plus-damping moment capped.

`reports/stability-audit.json` uses actual neutral geometry, seed 1234, and 250 matrix-free power iterations. The Rayleigh values are **lower bounds**, not certified largest eigenvalues. Even these bounds put `h^2*k*lambda + 2*h*c*lambda` at **38.97 / 51.27**, whereas the linear semi-implicit-spring/explicit-damping necessary condition is `<4`. The original `k=.00005/.00007 J/rad^2`, `c=2e-7 J*s/rad^2`, `h=1/240 s` are sufficient to explain instability without a degenerate mesh. This diagnosis retains actual material values instead of hiding instability by cutting off forces.

## Material step and exact limits

Let `C=wrap(theta-theta_rest)`, `G=dC/dx`, `K=k I`, `D=c I`, and `h=dt`. Both `G` and the angle branch are frozen for a single material solve. The elastic energy is `.5 C^T K C`; dissipation is `q^T D q`, `q=Gv`. The quadratic backward Euler / Gauss-Newton step is

```
H = D + h K
[M + h G_f^T H G_f] delta_v_f = -h G_f^T [K C + H (G_f v_f + G_p u)]
```

Mass-scaled variables make the matrix SPD:

```
W = sqrt(inverse_mass)       # pinned entries are zero
B = G W
[I + h B^T H B] y = -h B^T [K C + H Gv]
delta_v = W y
impulse_free = y / W         # N*s, dt included once
```

The implementation uses deterministic shared-edge hinges, double arithmetic, matrix-free PCG, a diagonal preconditioner, and a true recomputed residual. It returns **no impulses** if CG fails, input is nonfinite, or a current/rest hinge is degenerate. Degenerate thresholds are separately `edge_length<1e-10 m`, `twice_area<1e-14 m^2`. It never quietly drops a bad hinge, writes free positions, targets an animation pose, clips an impulse, or changes material stiffness to make a test pass.

For exact supplied velocities, frozen `G`, and no angle-branch crossing, set `C'=C+h q'`. The linearized energy identity is

```
(T'+E') - (T+E) = W_pin - h q'^T D q'
                  - .5 delta_v_f^T M_f delta_v_f - .5 h^2 q'^T K q'
W_pin = -u^T J_pin
```

Stationary pins do no boundary work. Internal impulses including the recorded pin reactions have zero net linear/angular impulse to rounding. The returned `linear_energy_balance_error_j` checks this **supplied-velocity, frozen-gradient model only**.

This is not a proof of stability for nonlinear dihedral angles coupled to Jolt XPBD membrane and contacts. Godot's exposed SoftBody API has no per-point velocity getter. The experimental host supplies whole-tick position-difference velocities. Jolt's actual velocity comes from its **last internal substep**, with collision velocity corrections. If the velocity estimate differs by `e`, the actual kinetic work differs by `e dot J`, whose sign is unknown. Do not label an estimated energy balance as a Jolt energy certificate.

Uniform `k` per hinge is a defined discrete energy, not a calibrated resolution-independent fabric model. No geometry weighting/material calibration was added in this isolated numerical fix. The actual two independent Godot/Jolt soft bodies do not provide self/soft-soft contact in this version; their masks cannot supply missing layer contacts.

## API and ownership

Load `component/selected_implicit_cloth.gdextension`, instantiate `SelectedImplicitClothBending`.

```gdscript
var material = ClassDB.instantiate("SelectedImplicitClothBending")
var setup = material.configure(rest_world, canonical_ccw_triangles,
    inverse_mass_float64, k_j_per_rad2, c_js_per_rad2, 256, 1e-8)
var step = material.step(current_world, supplied_world_velocity_mps, dt_seconds)
if step.ok:
    for source_id in current_world.size():
        if inverse_mass_float64[source_id] > 0:
            soft_body.apply_impulse(source_to_engine[source_id], step.impulses[source_id])
```

- Every array is source-canonical, in world metres, kg, seconds; original winding is CCW. Host preserves its already verified canonical-to-Jolt map.
- `inverse_mass` equals the backend value, pins exactly zero. Do not replace it by `N_free/M` or a different lumped-area mass while Jolt still uses uniform mass.
- `step` requires caller-supplied velocities. The host must state provenance. Exact backend velocities and whole-tick averages are materially different.
- `impulses`: N*s; **do not multiply dt again** and do not call `apply_force` with it. Pinned entries are zero. `reaction_impulses` are the internal material impulses at pins, for boundary-work accounting; do not apply them to pinned particles.
- Only waist pins may be moved. Do not skin, reset, or project free solver points onto rest/animation geometry. Jolt remains owner of all free positions.
- Step every physics tick with its actual dt. Pause/restart/teleport must reset the host's velocity history; do not interpret a paused interval or teleported rest as velocity. This component contains no hidden position-history state.
- First release is single-threaded; no persistent worker or destructor-thread lifecycle. Configure/step calls must be serialized by the host. It reuses the already built official godot-cpp static library, with no full rebuild/global installation.
- `get_metadata()` states units/solver/unsupported stability. `inspect_geometry()` is a reference-test aid exposing sorted hinge IDs, rest/current angles and gradients.

## Evidence and decision

`reports/summary.json` and `reports/delivery.json` identify the frozen DLL, code and evidence by SHA256.

- `reference-comparison.json`: eight single-hinge/small-grid/actual outer+lining cases, including zero k, zero damping, all free and moving pins. Independent NumPy geometry, dense small solves and sparse SciPy reference agree with native Float32 output within **1.37e-13 N*s**. Finite difference: 100 unrelated seed-1234 geometries, largest error **1.97e-7 /m**. Installed SciPy's declared NumPy-version warning is recorded; no package was installed. Dense small solves additionally validate the sparse operator.
- `impulse-calibration.json`: actual Godot 4.7.2 Jolt, membrane/damping/contact disabled; one known point impulse differs from the matching gravity control by the expected `h * inverse_mass * J`, with **14.7 nm** displacement error. This checks dt and impulse units/map.
- `jolt-240hz-4s.json`: original k/c, two actual full meshes, stationary waist pins, Jolt membrane, gravity, no contacts. All steps converge; outer edge ratio **.961–1.050**, lining **.986–1.022**. No old numerical explosion, but shape is too soft: maximum displacement **.289 / .167 m**. The material step alone averages **6.36 ms per 240 Hz tick**, beyond the **4.17 ms total tick budget**, before the rest of the character/Jolt/render work.
- `jolt-240hz-1s-k10.json`: k multiplied by ten, damping unchanged, no force/impulse cap. Lining displacement drops to **10.3 mm**, showing this is not a force-disabled test. Outer still displaces **190 mm**; material time is about **12.58 ms/tick**. Neither production shape nor runtime budget passes.
- `jolt-120hz-1s.json`: explicit counter-evidence. Edge ranges **.843–1.188 / .846–1.217** fail the coarse bounded-regression interval `.85–1.15`. This coupled scheme is not timestep-independent/unconditionally stable. These are not acceptable garment strain limits.
- `jolt-480hz-1s.json`: smaller timestep improves edge bounds, but is another cost/accuracy tradeoff, not a product solution. The summary measures differences in actual final full-mesh positions, rather than claiming rate convergence from finite numbers alone.
- `boundary-regression.json`: eight create/configure/invalid-dt/degenerate/nonfinite/recovery/reconfigure/dispose cycles pass. No leaked helper process remains.

The 4x4 grid's first exploratory 1s files pinned only one row: this permits a free rigid rotation around that straight edge, so it is not evidence for bending support. Later 4s/rate tests pin two rows, as in the official cantilever reference. Garment pins/geometry are unchanged across these tests. Earlier reports are retained rather than overwritten.

### Existing official fixture

`project/official-jolt-fixture.json` is a local static-data adaptation of [Jolt SoftBodyBendConstraintTest](https://github.com/jrouwe/JoltPhysics/blob/5d5275c38074c44b14f38b85bc9c73573078c808/Samples/Tests/SoftBody/SoftBodyBendConstraintTest.cpp) and [SoftBodyCreator](https://github.com/jrouwe/JoltPhysics/blob/5d5275c38074c44b14f38b85bc9c73573078c808/Samples/Utils/SoftBodyCreator.cpp), MIT (`LICENSE-JOLT`). It preserves 10x10 vertices, .5 m spacing, seed1234 perturbations, the first two z rows pinned, and free inverse mass1. Its generator uses this machine's MSVC `std::default_random_engine`/distribution and argument-evaluation behavior; those are not guaranteed bit-identical across C++ libraries/compilers. The local fixture hash fixes the exact data used here.

`official-jolt-grid-240hz-4s.json` runs that geometry/boundary in the real Godot backend with **our material versus no external bending**. Trial k=100/c=.01 are explicitly new experiment parameters. Godot's wrapper creates native Jolt constraints with `EBendType::None`, and does not expose the sample's native Distance/Dihedral variants. **The official original solver/test executable was not run.** Its floor, side-by-side offsets, spheres and Cosserat examples are outside this adapted test. We did not port the official sample's renderer into the product or execute downloaded web scripts.

## Recommended next architecture

Do not add this component to `current` as the final skirt solution. Preserve it as an audited mathematical/material baseline. Reuse the existing real neutral cloth meshes and high-shell barycentric renderer, but solve membrane, compliant dihedral bending, body contact, and self/interlayer contact in one mature solver/substep loop. Native Jolt already has a compliant dihedral implementation, but the Godot wrapper disables its construction; an engine/plugin extension still would not automatically add the missing soft-soft collision path. A unified XPBD integration with a proven collision strategy should be compared to the pinned Jolt/PBD/Ten Minute Physics fixtures before another art/runtime promotion.

Official Godot sources checked: [mass and impulse semantics](https://github.com/godotengine/godot/blob/4.7/modules/jolt_physics/objects/jolt_soft_body_3d.cpp), [Jolt internal integration, XPBD velocity update and collision path](https://github.com/godotengine/godot/blob/4.7/thirdparty/jolt_physics/Jolt/Physics/SoftBody/SoftBodyMotionProperties.cpp). These statements are tied to 4.7/official 4.7.2, not assumed for future backends.
