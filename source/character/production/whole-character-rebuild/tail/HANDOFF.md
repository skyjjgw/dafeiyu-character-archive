# Static native whale tail

Actual native file: `D:/CodexTaskData/dafeiyu-whole-tail-20261028/tail-native.blend`.
The `work` junction in this directory points at that output directory.

Append collection `DAFEIYU_TAIL_NATIVE` only. It contains one continuous editable
mesh, `Whale_Tail_Continuous_Editable`, and four interface/frame empties. Do not
append `TAIL_QA_LIGHTS_CAMERAS` into the master. No guide girl or duplicate tail is
included. Object transform is identity in the master raw frame X+ front, Y+ image
right, Z+ up. No camera-facing constraint, armature, animation, physics, or GLB is
present.

Pelvis tail anchor: `(-.025, -.06, -.16)`, agreed with the body agent. The root is
inside the clothing envelope; the swept stem bends behind the hem and toward +Y,
then returns toward the fluke face. `TAIL_FRAME_Xfront_Yacross_Zup` stores the
complete centerline JSON for future skeleton work. The two-fluke outline retains
the identity front's asymmetric short inner lobe / large raised outer lobe, with
navy upper and medium-blue lower bands. Unseen rear shape and 3D twist are inferred.

The fluke front/back use conforming shared subdivisions and a domed, thin-rim
cross-section. A native voxel weld and localized smoothing make the stem and fin
one continuous skin rather than disconnected slabs. A non-destructive subdivision
modifier remains editable. Two-band colors are a native mesh point-color attribute
connected to the material, with no external bitmap dependency.

Re-opened saved file audit: one connected mesh, 62,310 vertices / 62,308 faces;
zero boundary or nonmanifold edges. Bounds approximately X[-.208,-.0093],
Y[-.0946,.4323], Z[-.4223,-.1286]. See `work/native-reopen-audit.json`.

CPU Cycles renders inspected at 0/45/90/180 degrees:
`work/renders/tail-000.png`, `tail-045.png`, `tail-090.png`, `tail-180.png`.
Additional actual geometry context renders with body-native-v7 were inspected:
`work/renders/body-tail-context-000.png`, `045`, `090`, `180`. They establish root
exit/hem masking and fixed side/back volume. The context body is not saved into
the tail-native file. Front preserves original tail envelope without moving girl
proportions. Back shows a smooth 3D curve; side shows genuine fluke thickness.

`finalAccepted=false`: root must inspect the combined master with head/body before
claiming the overall character accepted. This output does not establish rig,
deformation, physics, or runtime acceptance.
