# 官方动作数据导入与独立重定向诊断

2026-10-28。交付为独立研究候选，**Raw 步态未验收，不晋升 current**。没有改 current.gd/current.tscn、component_registry、manifest、冻结源模型或角色比例。无购买、登录、API 调用或第三方角色 mesh 替换。

## 数据与真实导入

上级任务取得的 Quaternius Universal Animation Library 免费 Standard，原 README 和 CC0 License 保留在 `references/test-assets/motion/quaternius-standard/`。本任务用官方 Godot 4.7.2 的 `GLTFDocument.append_from_file/generate_scene` 实际导入两个 GLB，不靠文件名猜测动画。

| 文件 | 字节 | SHA256 | 实际骨数/clip |
| --- | ---: | --- | --- |
| UAL1_Standard.glb | 7618436 | 69591853d817488edaa8fd9bf8fc1d821eaeaf789f8627b3cd23b41c4ed67997 | 65 / 43 |
| UAL1_Standard_RM.glb | 7620504 | be684571ed655a1b892c2c07e6e2aeca053b606c442d34004adaf1d944090d01 | 65 / 43 |

`references/test-assets/motion/reports/godot-import.json` 含每根骨的 local/global rest basis、parent 和原 target pose；每个 clip 的轨道数、每条轨道 key 数/时间间隔/位置范围、所有 key 有限性与四元数范数误差。`import-summary.json` 是可复算摘要。所有实际动画向量/四元数有限。

Idle_Loop 2.5 秒/56 轨；Walk_Loop 1.333333 秒/56 轨；Interact 2 秒/56 轨；PickUp_Table 0.833333 秒/56 轨。实际 key 间隔 1/30 秒。RM Walk 多一条 root 位移轨，从 `(0,0,0)` 到 `(0,0,1.3)`；in-place 没有此 root 位移轨。

## 轴、parent frame 与尺度

实际 source root 静态基是 -90° X，pelvis 本地 Z 高度经 root 变为骨架空间 Y 高度；不能把源 local quaternion 原样贴到 target。source 左肢在 +X、面向 -Z，target 左肢在 -X、面向 +Z；共同坐标修正为 `C = rotation_y(PI)`。source parent 基已包含在 Skeleton3D global pose 内。

15 个 target 躯干/四肢骨映射到 source；22 骨中另 4 裙骨和 3 尾骨留给原系统。source spine_02/clavicle/neck/fingers/ball 等没有硬造 target 骨。target chest 从 source spine_03 global pose 得到，跳过的 spine_02 效果自然包含在 source global 基中，再转换到 target 实际 parent 局部基。

躯干/脚使用 global rest delta；上臂、前臂、股、胫采用真实 child-axis 的 anatomical segment frame，避免把 source T 臂的下降角简单叠到已下垂的 target 臂。令 Fs/Ft 为 source/target 由子骨位移轴与正面参考轴建立的正交基，则目标全局基为 `C * source_animated_global * Fs * inverse(Ft)`。再以 **当前 target parent global 基的逆**转为局部 rotation。手腕以该前臂校准基保留原 wrist rest offset。逐骨依据和 correction 数值见 `mapping.json`；实现见 `retarget.gd`。

源/目标不是单一缩放关系。实际左上臂比约 0.402，前臂 0.304，股 0.207，胫 0.199。保留所有 target 骨长和 local origin，**排除 source root/pelvis translation 与 source scale**。hips 的位移只有原 controller 的支撑调整；contact 模式移动也仅由原 CharacterBody/Jolt controller 完成。没有把成人 1.3m 根位移搬到小角色。

Head 是当前胸骨下的独立 attachment，不是 body22 的一根可映射 Head 骨。本候选保留其原 local transform，继承胸部一次；原 headv3/face/hair/headband 的模型、材质和层级未变。没有导入 source 成人头脸。原蓝尾仍由原 Jolt 三刚体系统控制。

## 可运行模式与证据

`Run-External-Motion.ps1` 打开独立场景；`-HeadlessTest` 跑 10 秒仿真诊断；`-UICheck` 跑 1.775 秒有界真实 GPU 状态回归。UI 有外部开关、Idle→Walk 0.5 秒混合、Raw/原腿接触覆盖、前/45/侧视、停止并恢复原控制。每帧真实采样 imported Animation 轨道，无 sin 动作替代。

接入只用原 `pose_callback`：原 controller priority0 → 外部姿态 → 可选原接触腿 IK → final proxies/measure → 原 Jolt tail priority10 → hands/body22 priority20。手 body22 同帧 global matrix 最大误差 `6.776e-7` source units。映射骨 local origin 误差 0；旋转有限。

| 诊断 | Raw | 原腿接触覆盖 |
| --- | ---: | ---: |
| 最大脚参考点对原支撑锚误差 | 104.856 mm | 0.0001223 mm |
| 低脚水平速度/平支撑速度最大值 | 0.458598 m/s | 0.00001431 m/s |
| 真实鞋网格捕获样本最低 Y | -7.164 mm | 支持脚约 -0.00003 mm |

低脚速度 Raw 筛选是 sole 高度 <15mm 的诊断代理，不是假称 source 自带接触标签；原腿模式只测连续 flat 支撑并排除切换/heel-toe 滚动。鞋网格用实际 `bake_mesh_from_current_skeleton_pose()` 后 world transform，1748 顶点/鞋；不是 sole billboard。详见 `retarget-cpu.json`、`retarget-gpu.json` 和 `*-state.json`。

**接触覆盖是 source 上身 + 既有腿 IK，不是完整源步态已重定向。** Raw 在 UI 明确显示约105mm误差。CPU/GPU 都用固定仿真步进方便证据复现，不是运行 FPS 或性能验收。

第一轮 GPU 是 NVIDIA RTX4060/OpenGL，真实捕获 idle/raw-walk/blend-half/contact-walk/original-disabled 各 front/45/side。已逐一真看代表图。保留原脸、头饰、头发结构与蓝尾颜色；Raw 脚部朝向/穿地不合格，成人下垂臂还会把手藏进大袖，未改袖/比例掩盖。侧视仍显出源角色裙/鞋截面外观，不能误称全角度几何通过。

第一轮15图时自动模式 checkbox/slider 尚未随脚本自动更新，**数值 Label 才是当时的真实模式**；它们保留作为原诊断证据。随后修复状态同步，仅再捕获 `ui-raw-front.png` 和 `ui-cancel-original-wave-front.png`；后者外部 checkbox 关闭，Label 为“外部已停 · 现有控制”，真实原招手已动作。`ui-check.json` 的11项断言全部通过：Raw/contact checkbox/slider/Label与实际mode、停止后 scripted=false、原 wave 恢复、pickup 继续拒绝。

PickUp_Table/Interact 只导入测量，没有把播放 clip 视为 hand-object contact、约束或力闭合抓握；原 `character_action("pickup")` 仍明确返回 `character_action_not_available`。

## 后续边界

可复用真实动作数据与本独立测试架。要进入主角色仍需 target 专属袖/手约束、正确落脚接触识别与校准、步幅/腿长与root速度一致性、每个相位脚掌方向与穿地检查、全角度外观验证。此轮没有增加主 hook、没有默认打开外部动作、没有替换主角色。

GPU 进程已正常退出释放，无用户桌面/CUA 操作。所有写入仅在本目录与 motion/reports，未提交/发布。
