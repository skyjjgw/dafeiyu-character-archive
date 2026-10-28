# face-v4 外观与表情转译

冻结资产 SHA-256：`c111bea5a011caf29786bc19c6092b6882197edeb0d004c9e6397bcb3aa0ad54`。

`face-v4-look-spec.json` 来自实际 `.blend` 节点、UV、颜色属性和 driver，同时固定 `build_face_v4.py` 的 SHA。重新提取可运行 `export_face_v4_look_spec.py`；不会保存或改变 blend。

## 先修三个会抹掉身份的差异

1. **逐眼使用 v4 参数，替换 generic iris。** L/R 球半径分别 `.2035/.2025`，iris 半宽/高 `.094/.110` 与 `.092/.108`，Generated 中心 `(0.534398,0.480344)` 与 `(0.465432,0.485185)`。不能继续给两眼同一个 `iris_radius=.205` 的 UV 圆。
2. **先由最终 assembler 规范颜色通道，再让 COLOR 替换 fallback。** 根任务实际检查完整 v7 GLB：HeadSkin 的三个 primitive 都把常量白 U8 放在 COLOR_0，真正 FaceAlbedo 在 COLOR_1(U16)，LipAlbedo 在 COLOR_2(U16)。不能把 raw COLOR_0 当成肤色。最终 assembler 会按 material 将 Face 的 FaceAlbedo accessor、Lips 的 LipAlbedo accessor 分别映射到标准 COLOR_0，BIN 不动，并附实际 audit / `vertexAlbedoRule=replace`。**只有该 normalized artifact 才保证 COLOR_0 语义。** 该颜色已经是完整 linear albedo，不能再乘固定校色肤色。MouthInterior 仍用内口材质。
3. **保留 morph correctives 与真实骨。** blink_sphere_inbetween 是 `4*b*(1-b)`，不是另一个 blink 开关；新增 `squintL/R` 及其 `b*squintL/R` corrective 必须随新资产绑定。

## 球面虹膜的最小实现

实测原生球每眼 6400 个非极点 UV 样本得到：`u_direction=+1, phase≈π, z_cos_sign=-1`，最大重建误差约 `1.2e-6/1.6e-6`。本机 Blender 4.5 导出源码明确翻转 V，因此如果 Godot 保留 glTF TEXCOORD_0：

```glsl
float v_blender = 1.0 - UV.y;
float phi = TAU * UV.x + PI;
float ring = sin(PI * v_blender);
vec3 native_unit = vec3(ring*cos(phi), ring*sin(phi), -cos(PI*v_blender));
vec3 g = 0.5 * (native_unit + vec3(1.0));
```

这里的 `g` 对应 Blender Generated，随真正球眼的骨旋转而转。建议在 vertex 阶段重建并用 varying 插值至 fragment，更接近原生 ORCO 在实际三角形上的插值。不要用 post-skin 世界法线推图案，否则 gaze 会把虹膜留在世界方向。每眼 `cx/cz` 从 spec 读取，物理单位的半径与 offset 均先除以该眼直径。

`spot = 1-smoothstep(soft²,1.04,ellipse_distance_squared)`。按 spec 的顺序叠加：六段 **LINEAR** 深蓝渐变 → limbal 边 → 四层 diffuse 双瓣 → pupil halo → pupil → 每眼七个反光 → 用 front hemisphere 的 iris mask 合到 sclera。底部 light petal 的 soft 接近零，不能换成 flat-top 圆点。所有 hex 只转 linear 一次；spec 已同时提供 linear RGB。

上方两个宽椭圆亮点互相覆盖，下内侧另有小反光；它们是普通球面材质，没有平面卡片。先实看正面确认底蓝白光在下方，再看 3q/gaze，避免 V 翻转造成上下颠倒。

## 皮肤与细线

`FaceAlbedo` 与 `LipAlbedo` 都是同一连续 HeadSkin 上的 POINT / FLOAT_COLOR 属性，各 9073 点。LipAlbedo 是独立属性，负责嘴线中央断开。原生属性名、raw glTF 通道序号和 normalized 最终通道是三件事：Face→原 COLOR_1→最终 Face primitive COLOR_0；Lips→原 COLOR_2→最终 Lips primitive COLOR_0。运行时使用标准 COLOR，无需也不应读取不存在的 COLOR_1 shader API。鼻尖、鼻下小暗点和细腮红斜线是 rest-surface paint；应携带 rest 坐标或对应顶点属性，不能用变形后的世界坐标。

原生皮肤着色为 diffuse-white→ShaderToRGB→EASE 色阶→乘 albedo→emission，实际节点 ramp 也在 spec。Godot 灯光需要实际调色，不应靠把所有 Face 材质写死成一个固定肤色掩盖差异。

Lash/Lid/Brow/LashWing/LashFlick 都是真实体积，宽度和厚度公式在 `ink_geometry`：上睫毛深度厚度 6 mm、下眼线 2 mm、眉 4.5 mm；前者宽度随外眼角与 blink 改变。**这些线条与眼球不要额外加 inverted-hull outline**，否则会出现双线、黑圈和比例膨胀。源 face-v4 本身没有全脸倒壳描边。

## 骨与形状键

spec 中的 `actual_shape_drivers`、`actual_bone_drivers` 和每骨 native rest matrix 是最终依据：

- `aa/ee/oh` morph 分别除以 `max(1,aa+ee+oh)`；`lookUp=max(0,gazeY)`、`lookDown=max(0,-gazeY)`。
- 六个 full-blink corrective 包含 smile/sad/lookUp/lookDown/squintL/squintR，权重均见 spec。
- **实际 Jaw driver 为负号**：局部 X `-0.18*min(1,max(jaw,aa*.75,ee*.25,oh*.65))`。不要根据 bone 名猜世界转轴。
- Eye.L/R 局部 X `.20*gazeY`、局部 Z `.30*gazeX`；Tongue 局部 X `.035*aa`。这些骨即使 `use_deform=false`，仍通过真正 parenting 驱动眼球/舌，导出时不能丢。
- morph 先在 mesh-local 计算，再做标准骨蒙皮；Jaw 只应用一次。不要再额外搬动已经包含 Jaw skinning 的下脸。

native→Godot 坐标变换为 `(x,y,z)→(x,z,-y)`，应统一转换 rest basis，再应用局部旋转。

完成后用真实 v8 GPU 画面检查 front/3q/side、blink 0/.25/.5/.75/1、smile/sad/squint+gaze、真实口型与下颌。节点解析、数值闭合及换了几何，都不能代替新版外观已经实际转译的画面证据。
