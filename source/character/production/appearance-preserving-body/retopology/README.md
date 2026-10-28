# 已选人物：局部手结构 v2 候选

外观基准是用户选中的 4348 原人物。本候选只修原手的星状扇形、指关节和局部皮肤体积；未安装到 4348 正式页面。头部、发型、服装、原图和身体 22 骨均不更换。旧 v1 的源码/失败检查留在 `archive-v1`。

本轮腕口坐标不动，掌稍加宽，四指缩短并收为自然放松扇，拇指在侧。旧 DIGITS 的端点本身是待修结构，不能为保持错误端点继续做蜘蛛手。每手 5,249 顶点、10,494 三角形，共享掌/五指，单连接闭合且可定向。使用安全肤色样本拟合的线性顶点颜色，避免原图指间的蓝色污染；不使用整只手的图片卡。没有把皮肤标成物理材质或宣称肌肉模拟。

`installRetopologizedHands(fingers)` 在 root 的 `addSourceFingerRig(model)` 之后调用。它只把新加的 30 根指骨改到本候选真实掌指 bind/rest；不动身体 22 骨。更短手指不能再套用旧长扇形的关节枢轴。PIP/DIP 的软组织权重过渡扩大，避免原窄区在弯指时内环折叠；掌面以连续边界插值替代 nearest-root 高度跳变。`dispose()` 恢复旧手和原指骨状态。

## 检查与实际图审

- `reports/geometry-check.json`：两手有限坐标/权重/拓扑通过，身体骨世界矩阵最大差 0，其他部位几何 hash 未变。权重和误差约 `2.98e-8`。
- `reports/intersection-diagnostic.json`：双手 28 个采样姿态（grip 0–0.55 每 0.05、另 0.8/1；opposition=0.4×grip）严格三角交叉计数均 0。其中 grip .55 + opposition .22 已明确覆盖。算法排除共享顶点、共面和相切，**不证明任意连续姿态无接触、无自交，更不证明抓握力闭合或物理碰撞**。
- `reports/actual-gpu-captures.json` 和 `hand-*.png`：真实 Godot GPU 18 张前/45°/90°/背面，中性/.55/1，非离线动画替换。作者已实际看关键正/侧/背/弯指图。掌指比例改善，掌/指厚度存在；腕侧仍有轻微折点，unlit 近景层次偏平，尚须继续精修。
- Root CUA 已在整身里观察到掌指比旧蜘蛛扇合理，原人物身份保留。它是有限的局部改善判断，**不是最终人物外观通过**。最新掌厚/连续边界微调后仍应再看浏览器候选。

三类验收分开：数值采样通过；局部外观有改善但精修未完成；抓握/物理/整个人物质量未通过。`reports/visual-review.json` 保持这些限制，不用拓扑数据代替画面验收。

## Native 接口包

`assets/selected-hand-v2.glb`，901,884 bytes，SHA256：

`6ce8324dd001060e6eaf0aa60deda512a1a33d8d39fe534e797a614dfedc7c0f`

它是双手包（2 Mesh、2 Skin、52 joints），不是完整人物。保留原 body22 骨及父级，以供按名称映射；新增 finger30 的 bind/rest/权重在 `assets/selected-hand-v2.json`。原 study 单位尚未标定为米；Y 上、+Z 前，不额外加 .1775 Z 偏移。生产接入仍需实际对照骨骼映射和动态变形。

GLB 14 个属性/IBM accessor 在落盘后重新解析逐字节 hash 校验。`godot/verify_glb.gd` 已真实加载，原生 Skeleton52 / Mesh2 / 每手 Skin52，得到 `reports/hand-glb-left-neutral-view45.png`。**Godot 默认导入 unlit 不启 vertex COLOR，StandardMaterial 的颜色域也不等于源 shader**；smoke 中显式用线性 COLOR 转显示 shader，生产应沿用 appearance-preserving-runtime 的 Float32 CUSTOM0 恢复路径，不能直接默认白材质晋升。

## 复现

```powershell
node check.mjs
node audit-intersections.mjs
node export-glb.mjs
node export-review.mjs
```

`review.html?framing=full` 是真实 WebGL 独立候选；正面/侧面/背面、弯指和对掌可连续调整。已补原版 key/fill/ambient 灯光，整身视图保留原表情显隐，不将隐藏表情一律打开。它未接真实抓握物或物理引擎。

GPU 脚本仅用于候选渲染验证，窗口放到屏外并自行退出，不改变用户前台人物窗口。正式源页面、原图、DSH、账号和配置均未改。
