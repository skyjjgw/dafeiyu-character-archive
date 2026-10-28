# 已选原画人物：连续头部结构候选

外观唯一来源是用户锁定的 4348 页面及 `appearance-baseline-20261027`。本目录独立保存结构候选；没有修改原页面、冻结源、默认运行人物或先前被否定的 native 造型。

`index.html` 用同一冻结角色代码、原图、Three 材质、灯光与正交相机，切换原版和候选。页面可检查正面、±25°、±90°、背面，隔离不透明皮肤结构，连续调节眨眼、开口与视线。它调用真实网格，不是整图切换。像素按钮实际渲染两张 640×704 WebGL 图、读回 RGBA 并计算差异；结果必须结合实际图审，不能用拓扑数字代替人物外观验收。

## 这次实际改变

- 原静态 front skin / rear skull 焊接成单一、可定向的闭合 canonical 网格；原三处眼口边界通过 conforming zipper 接到原方程的 96 个动态结点，没有悬空 T 接。材质分成四个 primitive，但 canonical 边界顶点共享，导入后也必须同值驱动。
- 真实眼眶从连续皮肤开口向后形成固定圆杯；眼睑覆盖区随原眨眼方程连续变形。新增皮肤是不透明结构，不以透明隐藏洞口。
- 左右眼球各用原 neutral sclera 的精确前帽，再补圆润后半体闭合。体积始终存在；原虹膜保留原 XY / UV 视线方程，皮肤眼睑实际遮挡固定眼体。**这还不是生理真实的眼球转动模型。**
- 原嘴部 front fan 改为真实向后 0.075 的口腔内衬与后壁。原舌头绘制表面只向后移动 0.041，XY、颜色与显隐均保留；尚无完整牙齿、舌肌或软组织模型。
- 原脸部绘制、虹膜、睫毛和眉线保留原几何、UV 与画法。原绘制皮肤覆层仍作为贴合表面的化妆绘制层保留，并未在本轮重拓扑成单一 UV 材质表面；侧视应继续实际审查这一层和原头发的层间关系。

原 front source 的 77,568 个顶点投影 XY 最大差 **0**；rear seam 焊接 XY 最大差约 `5.96e-8`。旧 crown/chin 存在同 XY 不同推定 Z 的接缝，本轮以原后颅边界 / profile 修复，最大 Z 差 `0.0022814563`；这不是原作者真实三维深度的证明。头身比例、Head 父级、body22 骨、蒙皮和头发没有改变。

## 产物与接口

- `assets/structure-candidate.glb`：11,953,644 bytes，SHA-256 `178f3bf3c11d66049432258795f12ff57f72327af8754ad45f5f6097e9c35dbd`。
- `assets/structure-candidate-rendering.json`：每个实际 accessor 的字节 SHA、源材质、相机与 source 模块 SHA。
- `assets/head-structure-map.json`：source vertex → canonical vertex，连续皮肤参数、眼口通道、几何限制。
- `assets/structure-canonical-descriptors.json`：41,730 个 canonical 顶点，其中 32,415 静态、9,315 动态；四个 material primitive 的 used source IDs。导入器必须建立实际 surface vertex → canonical ID，不能假设 Godot 保留 accessor 索引。
- `continuous-head.mjs`：新增结构的 JS 方程 authority；原动态脸 authority 仍是冻结 `face.js` 与经过逐位对照的 `appearance-preserving-face/kernel.mjs`。

新增 native 角色预留 20 support、21 socket、22 socket-pole、23 oral-wall、24 oral-cap。当前已交给 face agent 的原 source-default C++ 包**尚不支持这些新增角色**，不能直接接入后假称完整动态候选已工作。GLB 仅保存 canonical neutral 状态，JS 对照页包含本轮连续更新。

原图字节和原 UV 数组保持；glTF 标准采样用 `KHR_texture_transform` 的 `offset(0,1), scale(1,-1)`。Godot 源 shader 采样只翻 V 一次，不叠加 StandardMaterial 的翻转。原 MeshBasic/unlit、Float32 线性颜色、透明混合和 depthWrite 语义需由原样传递层保留，不能换成通用 Toon 材质。

## 已验证与未验证

`reports/structure-verification.json`：16 个 blink/talk/mood/gaze 状态有限坐标、固定顶点/索引数，原可见动态 XY / UV / RGBA 无差、body 骨矩阵无差；单连续头部 component1、边界0、非流形0、正有向体积。两眼球也各自闭合且可定向。

`reports/eyelid-coverage.json`：五档眨眼、每眼 384 个原 neutral 前帽采样点；排除距当前开口边缘 0.002 的数值模糊区后，睁眼区没有新增不透明皮肤遮挡，闭眼区没有裸露固定眼白。仅为正交 +Z 深度采样，**不证明全表面无自交、动态碰撞或所有角度接触正确**。

尚须实际 GPU 原/候选前视像素对照及大角度图审；原头发的分层和原身体侧视问题明确保留，未被这次头部结构宣称解决。中性闭嘴包含有意接触 / 退化三角形，后续软组织方案需处理，不能冒称完全物理资产。

## 复现

在本目录运行：

```powershell
node prepare-review.mjs
node export-candidate.mjs
node export-structure-descriptors.mjs
node verify-structure.mjs
node verify-eyelid-coverage.mjs
```

`prepare-review.mjs` 仅在本目录复制八个原代码模块并适配 Three import 路径，先校验 frozen hash；原模块不被写入。HTTP 服务必须将 `.mjs` 作为 JavaScript MIME 返回。
