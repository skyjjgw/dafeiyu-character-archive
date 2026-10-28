# 原人物双层裙布接线与失败诊断

这是独立诊断组件，**未加载到默认 current**。当前布型/材料稳定性、层间接触、全角度
外观均未通过，不因“点有限、192 腰 pin 稳定”就晋升。原 GLB、原 4348 与原裙保持可对照。

只读上游 `appearance-preserving-body/garment-production/assets`，本地复制包：

- component.json SHA `c01bed3bd202422e8ef28bb8b2e665e2f8c852ea3aa38f05bce38f42cf39319f`。
- component.bin SHA `c9a08f0e12196337ffac10783036f2d5473eb53d379abf76a9b09044f88cf5a3`，1,908,736 bytes。
- outer 1824 点/3456 三角、lining 1280 点/2368 三角，各 96 个完整腰圈 hard pins。
- 双层高渲染壳合计 11136 顶点，使用 canonical 三角+barycentric+有符号法线偏移绑定；
  原图、Float RGB/UV/sideBlend/hemT 沿包保留。GPU 顶点读取实际低网格点纹理，不逐帧 rebuild mesh。

`neutralRoot` 到世界仅 `.35*(source + Y1.055)` 再 actor 刚体变换一次；该尺度是人为选定，
不是实测角色身高。安装时只做当前骨盆与 neutral 骨盆的刚体对齐。之后仅腰圈 pin 接收
骨盆边界目标，所有自由点由真实 Jolt 积分；不用 rest pose 拉回、不用正弦摆动。

```powershell
node ./selected-production/garment/prepare.mjs
./selected-production/garment/Run-Garment.ps1 -Mode membrane -Duration 1
./selected-production/garment/Run-Garment.ps1 -Mode bending -Duration 1
./selected-production/garment/Run-Garment.ps1 -Mode collision -Duration 1
./selected-production/garment/Run-Garment.ps1 -Mode full -Duration 4
```

这些命令目前为 headless 边界诊断，**没有 Capture 功能或性能/视觉通过承诺**。
所有命令先写 pending；只有完成 receipt、边界检查和无 stderr ERROR 才返回成功。
receipt 的 pass 仅是 wiring scope，visual/contact/布型 gate 分开保留 false。

另外 `./selected-production/garment/Run-Neutral.ps1` 做独立静态 GPU 接线捕图：在安装前
暂停实际物理，四个角度来自真实 RTX4060/Godot 画面，adapter updates=0。已实际查看
`reports/neutral-{0,45,90,180}.png`：正面围裙原图和色彩保留，侧面有围合裙深度，背面为
推定蓝/奶白 palette；侧下沿过渡仍粗，原上身/腿/鞋薄片未改。45° 的测试箱会遮挡局部
下缘，未移除或拿该图冒充无遮挡检查。receipt 为 `neutral-gpu.json`，仅五项 render-wiring
通过，visual/clothPhysics/performance 全 false；这些静态图不会晋升失败的显式动态。

## 真实引擎问题与修复

Godot 4.7 Jolt 按三角首次遇到顶点的顺序建立 physics ID，部分 pin/impulse 检查却把
physics ID 用于 mesh-ID pin 集合。直接按源顶点顺序会把自由点误判为 pin，首次失败
原日志留在 `reports/first-pin-index-failure.stderr.log`。现在先将 glTF CCW 翻为 Godot CW，
再按该三角序重排 solver vertex/index，使 engine mesh ID=physics ID；包的 source canonical
ID 仍独立保留，pin/read/force 都通过显式映射，材料/高壳 barycentric 不被重定义。
实际 3104 点逐一点验 `is_point_pinned`，192 pin 正确；修后无该错误，最大 pin 差约 3.4e-8m。

另一个初始化问题是 configured point radius 未在初次入 space 时应用，球面离散点间隙
实测约 0，旧报告 `contact-before-radius-readd.json` 保留。官方实现只在离开已有 space 时
把该设置复制到 Jolt。组件现在只在首个模拟 tick/pin 前做一次 leave/re-enter，之后不
重建/重置自由点。相同 25 点布片+真实球、禁碰负对照再跑：有碰撞最小间隙
`0.003499967m`，禁碰穿入 `0.059910417m`；6 项接触/边长/pin 检查通过，见 contact-check.json。
这只是离散点球面的实际半径校准，**不是完整层间、自碰撞或连续三角接触证明**。

质量由真实 Godot 接口决定：每层 uniform total_mass 分别 .08/.035kg，backend 每个自由点
质量为 M/N_total，pin 的 inverse mass 为 0。包的 lumpedArea 不能通过当前 API 逐点设置，
`per_vertex_areal_mass_used=false`，未冒充使用了它。

## 参数对照与尚未解决的失败

**独立 SoftBody 层间接触是当前 backend 的能力缺口。**Godot 4.7 自带 Jolt 的
`DetermineCollidingShapes` 只接受 rigid body；wrapper 存在 soft-pair filter 不等于 narrowphase
已实现。`soft-pair-check.json` 实际将两张 16 点片的相互 mask 开启：全 pin 支持片保持
Y=.3，自由片仍穿到 Y=-4.112m；另一组同样自由片被真实 StaticBox 阻挡到 Y=.303499997m。
该负对照证明缺口，不能标为物理通过。新的 implicit 弯曲只能处理材料稳定性，不能
由此解决层间/自碰撞；需要真实接触约束或统一本体碰撞 solver。

- `minimal-check.json`：4/16 点固定顶边布条，0/1/10/60/240 tick。无碰撞/材料，k=.9/1
  时 1 秒 edge ratio 约 .99997–1.000085；k=0 负对照实际自由落约4.71m。平移 Node case 在
  首物理 tick 前读取尚为 local、之后为 world，故该报告 frame0 总断言 false 明确保留；
  当前整裙 body 以 identity+世界点初始化，不依赖此首帧平移行为。
- `topology-check.json`：完整冻结低拓扑、无材料/无碰撞。边约束有效，1 秒 outer edge
  ratio 约 .974–1.020，但无弯曲支撑时裙型塌落约18cm，不能当自然衣料合格。
- `initial-remap-full-check.json`：修 ID 后早期全配置 4秒，点有限/腰 pin 稳定，但最大自由
  位移 .491m。仅 wiring 五项通过，视觉/接触 gate false。
- `bending-check.json`：仅旧 native signed-dihedral 力、无碰撞，1秒 nodal force 最大39.1N、
  edge ratio 约 .22–1.66，显式步不稳定。旧 configure 第五参数是 **moment_limit (Nm)**，
  不是每点 force cap；细三角梯度可把有限 moment 放大为很大节点力。
- `collision-check.json`：无弯曲、仅碰撞，1秒 edge ratio 约 .978–1.027，没有同样巨大应变，
  但膜仍会塌。初始身体 capsule 点穿入诊断为0，不把问题归咎于未实证的初始躯干穿透。
- `membrane-check.json` 是加入真实3.5mm初始 radius 后的再次膜对照，仍不是布型通过。

旧 native 材料内核被只读复制（SHA `c9e850a5ad460636228870f71e87a0670db05503a8e45593864835784b032469`），
它提供真实 signed hinge force，没有加载历史被拒绝人物。该 force helper 的公式对照通过
不等于与细网格/240Hz/Jolt 组合稳定。新的 implicit/compliant kernel 在独立上游目录研究，
待其明确 impulse/force 单位、dt/质量、稳定与非刚体响应后再接，不通过硬写点位遮掩失败。

官方实现参考：[Godot 4.7 Jolt soft body](https://raw.githubusercontent.com/godotengine/godot/4.7/modules/jolt_physics/objects/jolt_soft_body_3d.cpp)、
[SoftBody3D API](https://docs.godotengine.org/en/4.7/classes/class_softbody3d.html)。
Soft-pair 源码边界：[当前 Godot 自带 Jolt SoftBodyMotionProperties](https://raw.githubusercontent.com/godotengine/godot/4.7/thirdparty/jolt_physics/Jolt/Physics/SoftBody/SoftBodyMotionProperties.cpp)。
