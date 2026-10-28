# Shoe candidate — visual review required

`finalAccepted=false`. Static only. Do not replace the production asset without visual and motion validation.

- `review.html`: baseline/candidate toggle, 0/45/90/180 views, shoe isolation, and front comparison with shoe-only pixel bbox. The page uses the same frozen character source, textures and camera for both; it renders in Three.js and must also be checked in the target Godot runtime.
- `assets/selected-appearance.glb`: frozen baseline with only the two shoe mesh attributes modified. The original 22-bone body skin and foot weights are preserved. Source/candidate SHA-256 and comparisons are in `verification.json`.
- Shoe front silhouette was calibrated to the baseline export's sampled projected bounds. Source and candidate top Y both -0.77718014, sole Y both -1.0452307, height both 0.2680506; widths 0.28818125 and 0.28807694. Geometry bounds do not establish visual fidelity.
- The same source texture and pixel-to-UV mapping are used; new vertex positions change the projection. Side and rear shoe shapes are inferred from the front.
- Original left shoe front material XY projection: 1025 positive, 257 negative, 230 edge-on triangles. Candidate v2: 720 positive, 0 negative, 0 edge-on. Original and candidate indexed shoe surfaces are closed, with no triangles below area 1e-9. No claim is made about leg intersection or deformation quality.
- `body-full.js` and `export-candidate.mjs` reproduce the candidate export. The review page is based on isolated copied source, with only the shoe generator changed.
- GPU rendering has not been run by this task. Review front/45/90/back, front pixel difference, ankle contact, motion and target-runtime rendering before accepting.

The first calibrated candidate failed the 90-degree visual review: its shoe last appeared as a vertical block. It is preserved in `before-profile-v2`. The v2 candidate changes depth along shoe height so the toe extends forward while the ankle sits back; v2 still requires visual review.
