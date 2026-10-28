# 原人物的局部手部与招呼动作候选

这是独立场景，不改默认 `motion.tscn` / `motion_rig.gd`、原 GLB、4348 网页或 DSH。
人物仍是用户选择的原少女。仅隐藏原两只旧手，接入经过局部修形的 v2 真手网格；
脸、眼型、头发、原画、衣服和身体比例沿原资产。尚无最终人物质量、手物抓握或物理通过。

```powershell
node ./hands-candidate/prepare-package.mjs
./hands-candidate/Run-Hands.ps1
./hands-candidate/Run-Hands.ps1 -HeadlessCheck
./hands-candidate/Run-Hands.ps1 -Capture
```

交互窗口 **大肥鱼 · 局部手结构与动作候选**。原动作检查/中断/前侧背仍可用，底部新增
弯指 0–0.55 和原手对照。交互默认弯指 0；GPU 招呼图用轻微 0.08 弯指，0.55 图只作关节
诊断，不表示打招呼应该握拳。没有连接模型、麦克风、API Key 或 DSH。

## 绑定方法与数据

上游手包 `appearance-preserving-body/retopology/assets/selected-hand-v2.glb`，SHA256
`6ce8324dd001060e6eaf0aa60deda512a1a33d8d39fe534e797a614dfedc7c0f`，2 Mesh / 52 joints。
`prepare-package.mjs` 只读该包和 bind/驱动表，并校验原包 SHA。

- 原 22 身体节点的 neutral TRS 与原 selected GLB 比较差为 0。原 bind 的骨盆 Y=0.2、
  neutral node Y=0.188 的区别保留；不把 neutral 当成新的 inverse-bind rest。
- 新建一个独立 52 骨 Skeleton3D，原 22 骨按名字从已解出的源骨全局矩阵同步；30 指骨按
  包内新的掌指枢轴和 rest 驱动。原 body skeleton 不因手绑定而被修改或追加骨。
- 新手继承原 actor holder 的 `.35 m / source unit` 统一场景尺度，无第二次 Z=.1775
  偏移。该尺度是人为选择，不能当官方身高或实测物理尺寸。
- 原手包顶点/法线/骨索引/权重和 IBM 被直接构建为真 ArrayMesh + Skin；原 Float32
  线性皮肤颜色通过 CUSTOM0 传给 source-unlit 显示 shader，未用默认白材质替代。
- 每手 5249 个实际 ArrayMesh 顶点位置字节、CUSTOM0 色字节和骨索引精确保持。
  **实际蒙皮不逐位一致**：Godot 标准 skin 权重打包成 16 位，单权重最大误差约
  `1.5199e-5`。这与骨骼映射错误分别检查，不能混为“完全相同”。

glTF/Three 的前面 CCW 与 Godot ArrayMesh 的 CW 不同。早期直接构建沿用了 CCW，
封闭 unlit 手部近景实际显示了错误的前后遮挡；修前代码、图和 receipt 留在
`reports/before-cw-fix/`。目前只交换每个绘制三角的第二/第三索引，实际 ArrayMesh
readback 逐三角验证，位置/法线/UV/CUSTOM0/skin 数据均不因此改写。修后九项 CPU
回归通过，作者重新实际查看 `native-hand-wave-curl055-view45.png` 与整人 greeting：
前后剔除方向已修，近景仍 unlit 平、指缝/腕部形状待精修，不把此修复当抓握完成。

实际构建后 ArrayMesh 的 position/bone/weight readback 与真实 Skeleton3D 解算矩阵、
包 IBM 组成 CPU 蒙皮，逐一对照上游独立 Three 实际蒙皮采样：双手 grip 0/.55/1、
opposition=.4×grip，共六组每手 5249 点，最大差 `2.5113306e-5` 原单位。
最初 `2e-6` 阈值因此失败，失败日志保存在 `packed-skin-first-threshold-failure.*.log`。
限额显式改为 `5e-5` 原单位（仅当前 .35 场景尺度下为 .0175 mm），不是消除量化误差，
也不宣称 GPU 逐位一致。早期用原始 float 权重得到约 `2.13e-7` 的只是理论矩阵核对，
不能用来代替实际 ArrayMesh packed 权重结果。

## 仅候选内的招呼方向修正

默认旧 wave 将指轴横向，像掌朝下伸手。`greeting_rig.gd` 只在本场景替代动作 rig：
保持原 IK 手目标和骨长，掌面朝世界注视目标，指轴趋向重力上方；前臂沿真实长轴旋转
最多 ±1.25 rad，再保持腕部 1.1 rad 限额。相机没有参与朝向计算，不是总朝相机的手片。
中断仍混合整条原关节解，眼先动、头和躯干延后仍沿原实时控制。

真实 GPU 招呼帧：`reports/native-full-greeting.png`。作者已实际查看整身与隔离手的
45/90° 图：原少女身份和衣服保持，手掌朝外/指向上已改善，真掌指厚度存在；unlit 近景
仍平，腕边有轻微折点，原身体/头发侧片、袖口变形与整体自然表演仍未达标。

Root 已实际查看上述整身招呼图与 45/90° 手部诊断图，判断为有限的姿态改善：
比旧下垂手合理，整身原人物身份保持。近景 unlit 平和腕边局部折点仍存在，
`limited_pose_improvement=true / final_quality=false`，不作为最终材质精修或抓握通过。
候选 UI 已单独改为“独立指关节已接入；抓握、发与裙的物理待接入”，避免沿用默认
旧场景“尚无独立指关节”的文字；默认场景文案和控制器均未改。

近景 `native-hand-wave-curl055-view*.png` 明确暂隐藏其他 mesh，只检查真实蒙皮手，
不拿被源头发/袖子遮挡的图冒充完整侧视通过。整身图保留其他部位，检查真实衔接。
所有 GPU capture 为独立屏外进程并自行退出，保留用户原窗口，不抢原生 UI 控制。

## 最新检查及边界

`reports/native-integration-check.json` 为 2026-10-28 真时间 headless 检查：
14.004 秒 / 3359 采样、15 步，九项全部通过。原 22 骨同步的最大位置差约 `3.04e-7`
原单位，basis 轴差约 `5.77e-7`；两者单位分开记录。

逐 tick 关节最大增量 .04428 rad，实际腕相对 rest 最大 1.10000002 rad，完全抬手段掌面
与世界注视方向点积最小 .98362；骨长最大误差约 .00217 mm、支撑参考点滑动最大约
.03368 mm（均为人为定义的当前米制场景）。这是控制/同步数据，不是自然表演验收。

`reports/gpu-capture.json` 记录 RTX 4060 / Compatibility 真渲染和实际当前骨架烘焙顶点。
只证明新手确实进入原人物实时场景并被显示，不证明任意动作全局无自交、真实触碰、
力闭合抓握、肌肉/皮肤物理或最终视频参考质量。上游的 28 个三角交叉采样也有同样边界。

`Run-Hands.ps1` 开始检查/捕图先写 pending receipt，只有收到完成凭据才算成功；
`--quit-after` 超时即使进程返回 0 也不能伪装检查通过。日志 ERROR 同样令启动检查失败。
