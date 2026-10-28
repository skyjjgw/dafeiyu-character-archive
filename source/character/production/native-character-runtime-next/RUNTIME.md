# 大肥鱼 · 原生动作试作

已载入完整原生 GLB，包含真实体积网格、154 骨 Skeleton、面部 morph、Jolt 头发／尾巴关节、裙装 SoftBody 和有质量的杯子。它是可操作的角色运行研究，外观、自然表演和视频观感尚未验收。DSH 保持大脑内核定位，本工程目前没有 DSH、网络、密钥或语音连接。

## 运行

```powershell
# 实际人物场景，窗口标题“大肥鱼 · 动作试作”
.\Run-Lab.ps1 -Mode Main

# 完整角色上的骨骼、表情、接地、抓握和衣物检查
.\Run-Lab.ps1 -Mode NativeSmoke
.\Run-Lab.ps1 -Mode NativeStress

# RTX4060 实际 GPU 截图；不是 headless 占位图片
.\Run-Lab.ps1 -Mode Capture -View front
.\Run-Lab.ps1 -Mode Capture -View side
.\Run-Lab.ps1 -Mode Capture -View back
.\Run-Lab.ps1 -Mode Capture -View front -Expression halfblink -Portrait
.\Run-Lab.ps1 -Mode Capture -View front -Expression combo -Portrait
```

Main / Capture / NativeSmoke / NativeStress 默认保留已同步的资产快照。首次缺少资产或显式指定 `-RefreshAsset` 时执行 Sync-Asset.ps1，不改写原始资产；GLB、blend、bind、cage 的 sourceHashes 必须一致，衬裙的 sourceCage SHA 必须匹配，验证后才更换副本。当前 GLB 5,961,816 字节，SHA-256 `3d09ccde3ea8b70763c00add5cee9517e7d9aa78ab812f8fd28aacadf7d2fd9e`；完整配套核验在 `reports/runtime-asset.json`。

W/S 沿人物朝向前后移动，A/D 侧移，Q/E 转身；1 招手，F 伸手取杯，G 松手，Esc 中断，P 暂停／继续；右键拖动视角，滚轮缩放。真实刚性衬裙也参与根移动与拟转角碰撞检测，因此贴近桌子时可能需要先退后再转身。右上“试作详情”默认收起，F8 或详情中的“保存当前状态”写 `reports/native-interactive-latest.json`，暂停时也可保存。

## 当前实际实现

| 部分 | 完整角色上的实现 | 当前限制 |
|---|---|---|
| 资产与骨架 | GLTFDocument 实际导入；3 个源 Armature 合为 154 骨 Skeleton；Head 转动后 FaceHead 和 Hair.HeadAnchor 相对变换保持 | 骨骼数量不代表美术或变形质量达标 |
| 移动与接地 | CharacterBody3D 真实 sweep、实体地面／桌子；实际腿骨 TwoBoneIK3D、地面射线和交替落脚 | 主躯体 kinematic，非全身主动平衡；尚无完整自然步态片段 |
| 伸手抓杯 | 双臂 IK、30 手指骨／拇指对掌；0.22 kg 中空杯真实 RigidBody 与 compound colliders；Generic6DOF 弹簧抓握，±3 mm 限位，释放移除关节 | 最新长测命令 gap 峰值 7.32 mm，求解后峰值 5.29 mm；尚非指尖力闭合 |
| 头发／尾巴 | 53 个实际 PhysicalBone3D，6DOF 硬限与角弹簧，47 个骨附着 authored convex 接触体；根锚跟随头／骨盆 | 已排除5个会与自身动态尾骨追撞的重复 kinematic hull；侧面发根接缝／穿插待修 |
| 裙装 | 1,216 点／2,304 三角 Jolt SoftBody，128 个全权腰 pin，192 个非零权重；8 个原生裙／围裙／刺绣网格以实际椭圆 cage 四点 GPU 蒙皮；64 片闭合中空刚性衬裙支撑参与真实接触和 Root sweep；832 个有符号材料弯曲 hinge 补充弹力／阻尼 | 衬裙为挺括衣层接触近似，并非完整多层软纱；部分权重暂为自由点；自碰、尾巴出口与自然形态尚未完整验收 |
| 面部 | 实际 morph 映射；blink_sphere_inbetween=4b(1-b)、blink×smile/sad/lookUp/lookDown；Jaw/Eye.L/R/Tongue 真骨联动，AA/EE/OH 归一化 | 无音频，默认 viseme=0，思考不假装说话；复杂组合需逐项像素与变形验收 |
| NPR | 实际 GPU shader，头发／衣物分区光照、倒壳描边；球面 UV 程序虹膜；皮肤用真实法线柔和自控色阶，GPU 色块校准为 RGB201,185,170 | 皮肤专用 shader 为 unshaded 自控色阶，不接收场景投影；整体与参考仍有差距 |

`reports/native-smoke.json` 当前 17 项数值检查通过，覆盖实际骨骼／morph、脚 IK、抓杯／释放、关节误差、暂停保存和衣物报警。数值通过不代表艺术质量通过。最终支撑 SHA-256 `ca5456100cd3f76db5b330c8cba07273bb6c881274bd3119426dd5d2d87e79f0` 的 `reports/native-stress.json` 是 RTX4060 真 GPU 44.729 秒物理时长：30 秒待机、近桌转身受阻、退后空地约 90° 转身、回桌抓杯／释放和前侧背截图；所有保存阶段为 0 倒面／0 面积塌缩，面积比最大 1.0645，最大材料弯曲能约 .011 J、最大布点位移 5.62 cm。逐图检查未再见先前的大块衣面破裂；仍需实际交互与角色美术验收。每张新截图相邻 JSON 包含该帧的四文件 asset_provenance SHA，避免混用版本。

初始失败都保留：`native-interactive-cloth-failure.png`、`native-stress-before-root-envelope*`、`native-stress-before-signed-bending*`。根因包含缺少衬裙支撑、圆形参数错误用于椭圆 cage（高裙绑定切向偏移最大 17.7 cm）、Root 胶囊无视刚性衣层导致其挤进桌子，以及无有符号弯曲约束导致扭后翻里外。现高裙绑定偏移最大 1.42 cm／平均 1.27 mm；自由布点未被硬写位置来掩盖问题。2% 倒面阈值只作失败报警，不能替代视觉验收。

初始 headless 腰 pin 跟随失败已修：官方附着提交发生于 frame_pre_draw，因此固定腰边界改为物理 tick 更新，自由点仍由 Jolt 积分。[官方稳定源代码](https://github.com/godotengine/godot/blob/4.7.2-stable/scene/3d/physics/soft_body_3d.cpp) 当前全场景 240 Hz，减少薄衣层离散接触步长。Godot 内置 Jolt 的 SoftBody 使用 EBendType::None；补充材料采用不变 rest-angle 的有符号二面角弹力／角阻尼，调用 apply_force，没有 actor pose 目标。解析梯度经 300 个随机铰链有限差分校验，最大误差 1.14×10⁻¹⁰，合力／合力矩误差 <10⁻¹⁴，见 `reports/bending-gradient.json`。[官方 Jolt 实现](https://github.com/godotengine/godot/blob/4.7.2-stable/modules/jolt_physics/objects/jolt_soft_body_3d.cpp)

`reports/native-main-*.png` 为 NVIDIA RTX4060 Laptop / OpenGL3.3 实际渲染。相邻 JSON 包含 controller/rig/grasp、secondary、cloth、color_calibration、performance、dsh_state。固定帧率截图 FPS 不作为交互性能结论；Main 下用 F8 记录。GPU 服装形变读取物理点 texture，不逐帧重建高模网格。

## DSH 边界

`character_protocol.gd` 仅预留进程内 `dafeiyu.character.v1` 白名单：`character.behavior` 的 wave/pickup/release/cancel，以及 `character.state` 的 connected/running/approvals/error。未知字段、管理命令和凭据字段拒绝。`main.receive_character_message(Dictionary)` 为未来受控入口，目前没有 socket 或后端。DSH 安装、原版切换、账号、密钥均未改动；真实思考状态不会自动驱动语音口型。

便携引擎来源、签名、官方 SHA256／SHA512、初始 API 能力与数据目录隔离见 README。最新角色检查不替代前／侧／背与连续动作人工验收，也不表示视频级角色完成。
