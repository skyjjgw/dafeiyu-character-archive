# 原girl的头饰组件：单参数域 scalp ribbon v2

## 当前资产快照（2026-10-28）

- `headband.mjs` SHA256：`72769501a9c7258d864c4581b7a0b90128c37dba7b9e0988af53e807f8a3cfb7`
- `assets/headband-v2.glb`：1,223,644 B，SHA256：`c46ab19cb79e8b6768b2b0a86ddc0f09b3681957932a47c4b9ed0b0083014ebb`
- 当前GLB两面paintWeight修正尚未通过对应当前SHA的actual GPU导入/视觉复核。后文出现的旧GLB SHA、旧导入报告和截图属于历史迭代，不代表当前资产的GPU验证或视觉通过。

本组件以用户选择的4348人物为身份/画风基准，保留原girl、白灰maid褶边与头带风格。不是将原错误 source XY 当永久约束；仅头饰中性曲面重新拟合，其他头发/脸/身体仍原版。

## 真实结构

旧版把非单调 source crop inner contour 强扭成 stations，frill 与回折带面交叉，有限法线厚度又把极细三角背面翻入正面，实际有4108对横穿。仅修颜色或降低厚度不能解决。

v2 只有一个可注入参数域：u沿scalp半弧0..π单调；v跨前后带宽0..1，β在每个u处单调。单位球方向作固定倾斜旋转，再以真实 scalp 的椭球轴拟合；褶边和静态褶皱是这个方向域上的正径向图。内层和外层沿相同方向保有限正径向厚度，避免平均法线在凹/细片的翻入。所有方向/顶点/面都有单一稳定 u/v/layer，不从裁边轮廓硬找对应。

当前参数为 `headband.mjs/DEFAULT_PARAMETERS`，通过 `installScalpRibbonHeadband(character,options)` 注入。局部XY/深度是合理重建，未知原作者的真实三维值不冒称测量。

## 已有检查

- 7953点/15360tri 无厚中性面：严格非邻接横穿0。
- 15906点/31808tri 有限厚体：严格非邻接横穿0，1连接块、0边界、0非流形、0方向冲突、0退化，最小面积约1.27e-5。
- thickness .005未标定source单位，配对距离约 .00499993–.00500006，法线投影最小 .00165048 仍正。
- 将所有实际三角按前/后 source scalp 的椭球隐式面拆分，归一化后精确求每个triangle离原点最近点，最小 implicit1.09650>1，整件中性三角在原scalp实心之外。未认证与所有其他原发片的接触或动态碰撞。
- strict诊断排除共享点/共面接触，不能取代所有类型相交和真正cloth solver。

复现 `node audit-intersections.mjs --surface`、`node audit-intersections.mjs`、`node check.mjs`、`node check-clearance.mjs`。报告绑定实际POSITION/index SHA，不能只凭旧报告接新几何。没有加假正弦摆动或宣称物理动画已完成。

## 实图与原生导入

WebGL原/候选对照：`review.html`，同冻结girl/原三灯/正交机位，可前/25/45/90/背面、隔离头饰、纯色布面诊断，读取真实RGBA差异与导出PNG。root独占CUA。

独立 `gpu-check` 使用实际 Godot4.7.2 RTX4060加载原selected girl和组件GLB、原线性纹理缓存、具体shader，恢复CUSTOM0 exact FloatCOLOR并验证真实进口POSITION/UV/UV2。首轮actual四角capture成功、15906点0miss/UV0差/UV2.paintWeight0差；但首轮frill被原前发遮住，前视只剩简单白arch，maid褶边身份不足，不能接受。首轮图在 `gpu-check/reports`，首轮GLB SHA d2cfbfd...f054 仅证明导入路径，不能冒充当前候选或最终质量。

已在同一参数域调β前伸和径向frill宽，并保crown taper；新几何严格与scalp检查仍过。**当前新参数尚待root实际多角度图审，不因数字通过晋升。**

## 可接生产的契约

`node export-component.mjs` 输出 `assets/headband-v2.glb`（当前1,223,640B，SHA256 `1ccad6c1afadf67d632d8806cd0768f4e92d179de7a6c3ead6dd7b9d14743156`）、`headband-v2-contract.json`、`headband-v2-domain.json`。

GLB只含一件Head-local头饰，不含/改全身girl。附着原Head-control一次；隐藏原左右frill6mesh和arch1mesh，不能两套重叠。外部 importer 需校验完整hash，将实际导入POSITION+UV+UV2匹配回canonical，不能假设Godot保留accessor顺序。

- `UV`: sourcePx/1920,1-sourcePy/1080；原sourcecover image0嵌入，SHA13fe2f29954e60e5b9f2bb39e1a52bcae687513d43031b64be1b29848f76f7e4，未编辑。Godot采样只翻V一次。
- `UV2.x`: source白灰paint权重；观测区域使用原白灰像素，邻近蓝发高色度污染平滑补为原arch palette；未知布面明确推定。
- `COLOR_0`: 原arch线性白灰palette，native请恢复exact Float32到CUSTOM0，勿默默依赖RGBA8截断。
- `headband-material.gdshader` 是具体可复用 native材质；完整字段/色域/alpha/culling见contract。标准glTF fallback故意只显示安全白灰palette，完整sourcepaint必须custom材质。
- `domain.json`: 每个canonical vertex的u/v/layer与控制参数，供后续cloth绑定。当前仅rigid Head attach，没有宣称softbody物理。

`visualPass=false`、`finalQuality=false`、`nativeIntegrated=false`，待实际审查后再由生产任务接入同一current scene。此目录不会只给一张图，而提供可导入几何、材质、source溯源和固定参数规范；它也不等同最终全人物已经完成。

## 当前贴合修正（尚待新实际图审）

Root真实WebGL已证实前次放大椭球版本不通过：顶部露绿色背景缝，像悬空外圈，maid白灰scallops丢失，90°过宽纸板。失败图为 `reports/cua-v2-front-20261028.png` 和 `cua-v2-left90-20261028.png`。旧native四角只证明导入路径；不得当当前资产的外观通过。

当前同一v2的主带已改为实际scalp不对称轴 `.73/.67/front.43/back.52`、真实中心`(0,.17,-.03)`；outer radial clearance `.004`，thickness `.003`，inner clearance约`.001`。β后=-.20、前侧=.25、crown前=-.16；缩窄主带跨度，使冠顶可贴发/被hair遮住。褶边仍同一域，不用非单调source crop点强扭顶点。

不仅检查analytic：`check-mesh-contact.mjs` 对冻结scalp真实外层9120三角精确BVH最近点，5302个主带outer点距 `.003947–.004733`，inner `.000997–.001747`；free frill独立列出，有意离头站起，不应与主带悬空混淆。所有实际三角对scalp analytic implicit最小1.0026457，且中性面/厚体strict横穿仍0。头发前片的真实接触与遮挡仍需actual前/45/90检查，最近头壳不代表所有发片物理已过。

观察区域白灰paint现在按u与原frill polygon的有效径向区间作语义UV映射；只是材质投射使用原crop，不把crop几何强塞到空间。未知区保原arch palette，高色度蓝发采样继续合理重建为白灰。原图未编辑，未声称逐顶点UV未变。

**当前资产** `assets/headband-v2.glb` 1,223,644B，SHA256 `d161534692fd935fa26c7acc19af970a7629eb028620c84d32a85d3ff05615a6`，以本段及contract当前hash为准。旧d2cf/1cc/1aec均为历史迭代，不能误接默认。当前视觉门和当前hash原生GPU门尚待重验；`visualPass=false`、`nativeIntegrated=false`，不因贴合数字晋升。

