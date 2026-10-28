# 已选人物头部深度候选 v2

这是独立候选，不替换 v1、4348 页面、冻结源、软件默认人物或原图。使用 `v2.html` 实审。

## 改变与身份限制

- 仍从冻结 4348 原人物构建，前脸 77,568 个 source 顶点 XY 完全不变；后颅 weld XY 最大误差 5.96e-8。原虹膜、鼻、肤色绘制、UV、颜色和表情方程都保留。
- v2 统一深度策略沿用原 profile-volume 推定剖面，strength .65→1、cheekExponent .25→.5。它让横截面由偏箱形曲率改成椭圆曲率，增进原本混合弱化的鼻/唇/下颌剖面。没有根据默认人脸重画五官。
- 原脸 paint、虹膜、眼睑、睫毛等曲面统一应用 `frontZ_v2(x,y)-frontZ_source(x,y)`，原有微小绘制 Z offset 保留。XY 与 UV 不变不代表侧面外观自动正确，必须实际图审。
- 后颅现在使用与前壳相同的原肤色场和 MeshBasic 顶点色材质，消除旧裸头前后两种颜色造成的垂直缝。原画图片没有编辑。
- 仍用 v1 的连续不透明头壳、眼杯、固定闭合眼体与口腔。它不是完整生理眼球旋转或面部软组织模拟。

源深度最大改变约 .11434 **未标定 source 单位**；不是扫描或原作者三维真实尺寸。头发、头饰与身体的侧面层片没有在本候选解决。脸的绘制层仍是贴合曲面的 decal；没有声称已经重做单一 UV 皮肤图集。它与一张整个人物图片卡片不同，但不能因此宣称所有结构真实。

## 检查

`node verify-structure-v2.mjs`：16 状态的固定拓扑/有限坐标/source XY、UV、RGBA/身体矩阵检查通过。一个头壳 canonical component、boundary0、nonmanifold0；mouth neutral 仍可能存在有意接触/退化三角形，未认证无自交。

`node verify-eyelid-coverage-v2.mjs`：五档眨眼、每眼384个源 neutral 前眼帽点，在 aperture 边界 .002 排除带之外没有意外遮挡或应遮未遮。只沿 +Z 正投影，不是全角度碰撞证明。

**GPU 前面像素比较、±25/45/90°、侧后视、眨眼/视线的实图审仍待 root。未给 visual pass。** 改 Z 可能影响头发与脸的遮挡，不能用 XY 不变代替这项审查。

## 文件和动态接口

- `continuous-head-v2.mjs`、`review-v2.mjs`、`v2.html` 为候选方程与对照页。
- `assets/structure-candidate-v2.glb`：11,953,076 bytes；SHA256 `d51a17fdfb75d9a276fbe8a6ccd00d6c631aaa70224139bfa2f275f41152a97d`。
- `assets/head-structure-map-v2.json`、`assets/structure-candidate-rendering-v2.json`、`assets/structure-canonical-descriptors-v2.json` 为 source accessor / canonical / material 映射。
- canonical 41,730 顶点，其中动态 9,315，roles20..24 与 v1 相同定义；新 depthPolicy 参数必须一并实现。旧 source-default C++ kernel 只提供原 XY/UV/RGBA 与旧 Z，不能直接驱动 v2。
- 原 v1 `structure-candidate.glb` 仍 SHA256 `178f3bf3c11d66049432258795f12ff57f72327af8754ad45f5f6097e9c35dbd`。

独立复现：`node export-candidate-v2.mjs`；`node export-structure-descriptors-v2.mjs`。导入后必须匹配真实 surface 顶点到 canonical，不假设 GPU 保留索引。glTF 仅是中性几何，不等于动态 native 已接入。
