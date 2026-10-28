# 原人物裙侧体积：独立局部候选

本目录只研究用户选中的 4348 人物身体侧视问题，不修改原页面、冻结 source、已完成手部 retopology 或默认原生人物。不是另一套造型。

## 已定位的问题

实际看过 `appearance-preserving-geometry/reports/cua-character-left90.png` 与 `appearance-preserving-runtime/reports/motion-turn.png`。原 body-full.js 的躯干、衣裙、袖子和腿本来就有共享索引的闭合截面，且绑定原 22 身体骨，不能将其误报为“整个身体都是零厚度图片卡”。目前侧面观感差来自几个问题叠加：

1. 衣裙前侧用正面原画，侧背切到推定的纯色材质；它没有作者真实侧背绘画信息。
2. 裙子纵深比横宽明显浅：原下摆横向跨度约 1.5 study units，而前后深度约 0.66（不包含不同骨姿态），呈浅椭圆钟形。
3. 身体、袖子、鞋等分别封口并重叠，尚非连续人体皮肤与独立衣料系统；部分 XY 点被 fitPoint 压到原轮廓，可能产生折面。照片/侧图中其他严重问题还包括头发和头饰层次，这不属于这次裙侧候选解决范围。

本轮选择第 2 项作有限实验，不重画整个身体、不换人偶。

## 本候选实际修改

只复制原裙子的 geometry，逐环改变推定 Z：

```text
gain(rowT) = 1 + depthGain * smoothstep((rowT-.12)/.88)
candidateZ = -.015 + (sourceZ+.015) * gain(rowT)
```

默认 depthGain=.85；腰口沿用原值，下摆深度乘 1.85，逐渐成为更圆润的钟形。原上下盖中心跟随各自真实环的 Z 均值。它仍是同一组 2,786 顶点 / 5,568 三角形、原 29×96 环和同一个闭合组件。**这个参数是推定值，不能冒称原作者真实三维尺寸。**

保留所有原 XY、UV、颜色、索引、材质、图片和骨权重；身体 22 骨不变，只重算法线。原正面宏观轮廓不动，但 Z 改变仍可能影响遮挡，因此必须实际测正面像素，不得仅凭 XY=0 差宣称完全不变。动作时 Z 会参与原骨骼变形，不承诺所有姿态投影相同。

## 对照与检查

`index.html?compare=1` 加载冻结原代码及三张原图，以原版灯光、640×704、halfY=1.76985 正交相机真实渲染。可切原/候选、0/±45/±90/背面，隔离身体或裙子，并连续改深度增量。保存链接是当前真实 WebGL PNG。正面测量按钮分别绘制两组真实网格并读回像素，显示原图/候选/差异；不是换角度图片或动作帧卡。

`reports/geometry-check.json` 已验证：原 XY 最大差 0、UV/color/skinIndex/skinWeight/indices 字节不变、其他部位几何不变、body22 世界矩阵最大差 0、闭合1component/边界0/非流形0；最大 Z 调整约 .31025 study units。单位尚未标定为米。

当前 **visualPass=false、physicsPass=false**，等待实际正面遮挡与多角度画面审核。没有接布料、自碰撞、身体碰撞、厚度材料或真实惯性；现有原裙子骨不能当作布料引擎完成。侧背画面仍只沿用原推定色块，未杜撰新服饰细节。候选不晋升默认。

复现：

```powershell
node prepare-review.mjs
node check.mjs
```

冻结源码逐个 hash 校验后仅复制到本目录 `runtime-source`，只重写 import 路径，原文件不动。

## Root 实际审核与后续 v2

Root 已实际同机位 WebGL 图审：正面 RMSE `.0835077`、24 个像素 RGB 差大于1、alpha 轮廓差0，原 girl 身份保留。侧面确实更圆，但巨大倒 V、中心/材质突变和实心壳仍未通过。结论为 `limited_depth_improved`，`final_quality=false`，记录于 `reports/visual-review-root-20261028.json`。

倒 V 根因是原 `bottomAtX(frontContour)` 的正面投影弧线被直接用作整圈 worldY，可能把原画俯视效果误复制成三维鞍形。新 `v2/` 独立探索空心两层裙布、真正环口和推定背侧垂褶，不覆盖本 v1，也不擅改全人物相机/骨架。详见该目录 README，未最终通过。
