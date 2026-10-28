# 头部候选 v3：保留原发际关系，修推定体积

独立 `v3.html`，不改 v1/v2 或正式 4348。v2 的实际 WebGL 对照见 `reports/gpu-front-v2-comparison-root-20261028.json`：1430 像素发生大于1通道差异，实际导出图显示刘海/额头遮挡变化，不能仅凭 XY 不变接受。侧面颜色接缝与鼻颏剖面有改善，故 v3 保留其有效部分。

## 固定几何间距

`depth-occlusion-cage-v3.mjs` 从原人物的头部非面部真实三角网格，转换到固定原 Head 局部坐标，构建 55,651 个有投影面积的三角形空间索引。它不读取相机、屏幕、视频帧或图片遮罩；只在固定源几何的前后间距不足时平滑约束脸部 Z 改变量，避免修剖面时跨过原刘海/头发接合关系。

设 `delta=frontZ_target-frontZ_source`，`gap=abs(hairFrontZ-frontZ_source)`，使用 `delta*tanh(max(0,gap-.012)*.55/abs(delta))`。无局部头发三角覆盖则不约束。约束是原 rest 结构的雕塑间距策略，**不是实时碰撞引擎**。约束后 Z 仍是三维网格的一部分，各视角都使用同一几何；没有按相机切层或换图。

后壳以相同局部约束比例混合原深度和候选深度，保持接缝一致。后壳沿用前脸肤色场，v2 消除的垂直色缝没有恢复。全脸 XY/UV/虹膜/绘画原像素保持，绘制层原小 Z offset 保留。头发和身体的侧面问题仍独立待修。

## 验证与边界

`verify-structure-v3.mjs` 16 状态通过：原前脸 77,568 顶点 XY0，后壳 weld XY≤5.96e-8，1 个闭合可定向头壳、0 边界/0 非流形。原 front 源对应点 Z 最大改变约 .09530，rear .11379，单位未标定。

`verify-eyelid-coverage-v3.mjs` 五档眨眼采样通过；它不是全角度无自交证明，也不是眼球生理旋转。

UI 现在分别显示“接缝焊接 Z 修正”约 .003600 和“整体剖面 Z 变化”约 .113787，避免把不同量混淆。

本 agent 未独立运行 GPU；root 已实际 CUA WebGL 中性正面对照并保存 `reports/gpu-front-v3-comparison-root-20261028.json` 与 `cua-head-v3-front-20261028.png`。root 和本 agent 真看图后记录有限结论：原 girl 正面身份保留，v2 的额头/刘海关系变化显著减少。实际 RMSE1.75012、changed301、alpha silhouette0；这不是最终质量通过。45° 组合表情与90°结构实审仍待 root。数值通过不替代外观验收。v3 不要求逐像素0差；合理结构修复允许有意局部变化，但身份/眼型/发际/画法须保持。

## 产物

`assets/structure-candidate-v3.glb` 11,953,076 bytes，SHA256 `08669c36b9e217a8f242c08a0fb573ec4c399900d8a1b68ae375ac53a44f3fae`。

`assets/head-depth-cage-v3.json` 为固定源 Head-local 三角形和间距参数；`assets/head-structure-map-v3.json`、`assets/structure-canonical-descriptors-v3.json`、`assets/structure-candidate-rendering-v3.json` 为动态与导入接口。roles20..24 与 v1/v2 同义，但必须实现 v3 depthPolicy 和真实间距 cage；旧 source-default native face adapter 不兼容。

复现：`node verify-structure-v3.mjs`、`node verify-eyelid-coverage-v3.mjs`、`node export-candidate-v3.mjs`、`node export-structure-descriptors-v3.mjs`。静态 GLB 不代表 native 动态已接入。

## 原生接口补充

`depthPolicy.occlusionCageAsset` 记录 cage 文件名、SHA256 和字节数；先校验再建立同一固定三角空间索引。role20..24 和 retained source cosmetic vertices 都使用同一个 v3 frontZ。只改 profile strength/exponent 而不实现此 cage 会退回 v2 的错误刘海关系。GLB 顶点本身只保存中性状态。

## 本轮有限收口

root 实际查看了 `reports/cua-head-v3-left45-expression-20261028.png`：相机左45°、blink .55、talk .4、gazeX .4 的单一连续组合帧，眼皮/眼型/嘴保留原girl，未见旧明显裸露眼白洞。本 agent 也用 view_image 看过该实际截图。**只限这一帧，不推断所有姿态/所有角度。**

正式本轮复核记录 `reports/visual-review-v3.json` 包含完整 GLB SHA、front XY0、实际 GPU 中性前视 changed301 和组合表情截图；`finalQuality=false`、`nativeIntegration=false`。不为本次数学或局部像素继续增加 v4。下一步应由实际全角度结构/动作问题驱动修改，不能把 v3 作为成品或直接替代 source-default native face adapter。
