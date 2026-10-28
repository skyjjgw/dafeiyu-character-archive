# 大肥鱼原生角色运行底座：Godot 4.7.2 + Jolt

**当前完整人物的启动方式、真实角色级实现、GPU 图与限制见 [RUNTIME.md](RUNTIME.md)。** 本页下文保留初始引擎实验记录，“尚未装入人物”等描述仅对应当时状态。当前已装入完整 GLB，实际窗口验收发现的服装翻折仍在修复；角色检查与失败记录均保留，尚未完成美术、自然动作或视频观感验收。

这套底座适合继续验证完整立体角色、骨骼动画和物理接触。当前交付是小型引擎能力实验，尚未装入最终人物，不代表人物外观、自然表演或视频观感已经验收。DSH 继续承担大脑与任务内核；本工程仅负责未来的角色表现和物理，尚无后端、密钥、模型或 DSH 连接。

2026-10-27 核对 [Godot 官方 Windows 下载页](https://godotengine.org/download/windows/) 与 [官方 4.7.2-stable Release](https://github.com/godotengine/godot/releases/tag/4.7.2-stable)，选择正式稳定版 4.7.2，发布日期 2026-08-18。所有能力文档固定在 `/en/4.7/`，实际 ClassDB 再验证本机可用接口。

## 运行

```powershell
# 默认全程 headless，无图形窗口或 GPU 渲染。
.\Run-Lab.ps1 -Mode Api
.\Run-Lab.ps1 -Mode Physics

# 未来将完整角色放到 assets/character.glb 后：
.\Run-Lab.ps1 -Mode InspectAsset

# 手动查看原始几何实验时才打开编辑器，当前没有运行此项：
.\Run-Lab.ps1 -Mode Editor
```

便携引擎位于 `../../tools/godot/4.7.2-stable`，未系统安装、未改 PATH、未启动 DSH。`Run-Lab.ps1` 只对子进程临时指定项目下的 `APPDATA`/`LOCALAPPDATA`，执行后恢复调用进程环境；运行数据落到 `.runtime-user`。引擎旁的 `._sc_` 负责编辑器便携设置。Godot 官方说明该模式不覆盖导出项目，运行数据因此额外隔离。[路径与便携模式文档](https://docs.godotengine.org/en/4.7/tutorials/io/data_paths.html)

首次 API 探测发现运行时 `user://` 仍指向默认目录，已改由上述包装脚本隔离。初次留下的 `C:/Users/skyjj/AppData/Roaming/Godot/app_userdata/Dafeiyu Native Runtime Lab/logs/godot.log` 为 1,091 字节；清理该日志的操作被自动审批以 `blocked by policy` 拒绝，未另行绕过删除。其后的实测报告已确认运行数据路径在项目内。

## 已实际验证

`reports/api-smoke.json` 记录引擎版本、全部类的实际存在/实例化结果、方法与属性。`reports/physics-smoke.json` 是 120 Hz、480 步真实模拟的测量结果。物理检查在本机 headless 运行约 0.7 秒；这是轻量实验的运行耗时，不能推算完整人物帧率。

| 能力 | 本机证据 | 本轮边界 |
|---|---|---|
| Skeleton3D / PhysicalBoneSimulator3D | 两个 PhysicalBone 绑定骨号 0/1，真实下落，最终骨骼根位置约 0.887 m | 测试被动双骨物理，未做完整角色主动平衡 |
| RigidBody3D 碰撞 | 半径 0.2 m 球从 2.4 m 落下，记录一次地面接触，最终中心 0.19585 m，进入睡眠 | 接触约有 4 mm 数值误差，最终模型仍须校准比例、碰撞代理和 solver |
| 真实关节限位 | Hinge 限制 ±0.35 rad，施加一次扭矩冲量，最大角 0.35034 rad | 只测硬限；Jolt 不支持部分 Godot 关节软参数 |
| SoftBody3D | 49 点网格、两固定点漂移均小于 8×10⁻⁷ m，自由点随重力下落 0.584 m | 未测完整裙装、自碰撞、复杂身体穿插或高密度布料 |
| IK | TwoBoneIK3D 真正修改骨骼，末端误差约 1.33×10⁻⁷ m | 还需带动作的脚底接触、手部抓取与极限姿势测试 |
| BlendShape | ArrayMesh 创建 morph，运行时权重设为 0.4 后读回正确 | 尚无最终眼睑、嘴部拓扑与实际语音驱动 |
| NPR / 描边 | 两个 spatial shader 已加载并解析出 uniforms | 当前 dummy renderer 未进行 GPU 编译或像素验收 |

项目显式设置 `physics/3d/physics_engine="Jolt Physics"`。Jolt 已内置于当前引擎，官方列出的部分关节 bias、softness、relaxation 等参数不受支持；本场景仅修改实际支持的硬上下限。[Jolt 稳定版说明](https://docs.godotengine.org/en/4.7/tutorials/physics/using_jolt_physics.html)

物理骨骼从初始动画姿态切到模拟时，必须明确指定起始速度。本场景从静止开始，因此仅在切换时清零线速度与角速度，随后由物理引擎推进；没有逐帧修改落体位置。实际动作切换需要从动画运动估计合理的继承速度。

ClassDB 实测支持 `TwoBoneIK3D`、`FABRIK3D`、`CCDIK3D`、`SplineIK3D`、`LookAtModifier3D`。本轮实际求解选择 [TwoBoneIK3D](https://docs.godotengine.org/en/4.7/classes/class_twoboneik3d.html)。旧 [SkeletonIK3D 已被标为 deprecated](https://docs.godotengine.org/en/4.7/classes/class_skeletonik3d.html)，保留存在性记录。

`SpringBoneSimulator3D` 与其球/胶囊碰撞类也已实际实例化。它的碰撞独立于 `PhysicsServer3D`，不能据此宣称头发会自动和所有世界刚体交互。需要世界物理接触的部分应设计 PhysicalBone/RigidBody 与碰撞层；轻量次级摆动可另行校准 SpringBone。[官方 SpringBone 说明](https://docs.godotengine.org/en/4.7/classes/class_springbonesimulator3d.html)

## 接入完整 GLB 的下一步

1. 制作同一角色的完整三维网格：头、身体、头发和服装从各角度成立，具有真正的厚度、连续隐藏面及可变形拓扑。此前 painted study 只作画风和比例对照。
2. 在 Blender 内制作统一骨架、蒙皮和表情形态，骨骼缩放保持 1；包含身体动作、闭眼、眉眼和嘴部形态。先独立验收中性姿态和极限变形，再导出 GLB。
3. 将 GLB 放入 `assets/character.glb`，运行 `InspectAsset`。检查器会实际调用 `GLTFDocument`，列出 Skeleton、蒙皮、BlendShape 与动画名；当前没有这个完整资产，导入验收尚未执行。
4. 创建角色运行包装场景：保留导入场景，另外配置 AnimationTree、IK target/pole、身体与地面的碰撞代理、PhysicalBone/关节限制，以及裙摆/头发的物理配置。测试待机、转身、走停、挥手、触碰与受扰动后的恢复。
5. 在完整资产上调 NPR 光照、阴影分区、描边、眼口材质，做同一姿势的前/侧/背及连续动作验收，再测 4060 Laptop 的实际帧率、内存和物理预算。
6. 验收后再设计 DSH 到表现进程的有限状态/动作接口。模型密钥留在 DSH；Godot 只消费经过约束的动作、情绪和真实音频时序，当前不开放网络或执行接口。

Godot 官方推荐 glTF/GLB。Blender 存在 BlendShape 时，官方提醒启用 `Export Deformation Bones Only`；Blender 复杂材质节点也需要转换为运行时 NPR 材质。[稳定版 GLB 工作流](https://docs.godotengine.org/en/4.7/tutorials/assets_pipeline/importing_3d_scenes/available_formats.html) 自定义 spatial 的 fragment/light 处理和 toon 模式由引擎提供。[稳定版 shader 接口](https://docs.godotengine.org/en/4.7/tutorials/shaders/shader_reference/spatial_shader.html)

完整角色的真实体积、权重、美术和动作是下一阶段的核心工作。物理引擎提供求解能力，步态、主动平衡、自然表演和角色识别度仍需资产与控制器共同完成。
