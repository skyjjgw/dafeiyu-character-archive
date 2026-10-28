# 2026-10-27 静态外观传递冻结

**最新整合入口：**[selected-production/README.md](selected-production/README.md)，
`./selected-production/Run-Current.ps1`。v0.1.5-current 已将真实结构头 v3、连续头饰、
五束静态连续头发、独立手指/较自然招呼和真实 Jolt 蓝尾接到同一 controller，原少女
身份保留；8 组件 / 50 文件 guard，原头/头饰/头发/手可对照，20 项 lifecycle 通过。
最新整人实际 GPU greeting/step/turn/cancel 与原头发切换已捕图并查看，90° 身体/裙/鞋
仍严重平层，最终自然表演/全角度/完整物理均未通过。静态头发不冒充发丝物理；
双层裙 cloth 仍独立诊断，显式材料稳定性失败未晋升。下文旧手/发裙 rest 状态属于
原 `motion.tscn`，不代表 current 尚无动态或独立手指。

**2026-10-28 状态补充：**本文件下文是静态对照的冻结说明，不表示本项目只有静态画面。
独立实时动作与原方程面部内核见 [MOTION.md](MOTION.md)，入口 `Run-Motion.ps1` / `motion.tscn`。
默认静态入口、原始 GLB 和正式 4348 页面没有被候选替换。

当前实时场景保留原 77 Mesh、13 skin、22 身体骨与 Head；招手、中断、迈步、换脚转身和
眼先动后头/躯干跟随均为连续控制。原 C++ face-kernel 每渲染帧更新固定 18 面，动态 iris UV、
眼睑 RGBA 与位置不通过整图切换实现。没有音频时 talk=0。

已只读重核：13 个源文件 SHA 与冻结清单一致，5 个面部运行组件 SHA 与 package manifest
一致；独立 `verify-transfer.mjs` fresh-file parse 通过，GLB SHA 与下文保持。

2026-10-28 fresh `Run-Motion.ps1 -Headless -Checks` 对最后 head collision 组合运行 31.004 秒 / 
7436 physics ticks，七项控制约束通过，stderr 无 ERROR。结果独立写入
`reports/motion-headless-checks.json`，标记 `gpu_rendered=false`；不把 dummy-renderer FPS
当成真实人物渲染帧率，也不覆盖前日真实 GPU capture/check 报告。

前日约 14.44 秒实际 GPU capture 有 source-face-kernel 更新 836 次、每帧 mesh 重建 0，
实际约 59.75 FPS；约 31.28 秒 GPU 控制检查是历史组合（先于最后 head capsule 更新），
不是本次重新跑 GPU 的结果。Root 已通过 CUA 看见当前窗口原人物，图在
`reports/cua-selected-motion-neutral-20261028.png`；原生 UI 的动作按钮未在本轮自动点击通过，
因为检测到用户正在该窗口操作，须尊重用户控制。当前窗口不可为跑测试强行关闭。

**视觉仍未通过。**实际查看 `motion-wave.png`、`motion-step.png` 和 `motion-turn.png`：
前视身份保留，但 90° 头发/头饰、衣服与鞋侧仍有明显薄层/接片。手仍只有腕骨；发与裙
停在源 rest；Jolt root+IK 支撑不等于主动全身平衡或所有表面接触。不能把数值 pass 报成
自然表演、全角度或参考视频质量已完成。新头/手候选均需独立 GPU 验收后才能接入。

局部头饰候选见 `hair-candidate/README.md`：只改推定 Z、补原 arch 端盖；前投影 XY/UV
保留，拓扑数据检查通过，实际侧视视觉失败，研究留存，不写入默认 GLB 或 motion 场景。

独立 `hands-candidate/README.md` 已接局部手 v2 和仅候选内的 world-target 招呼动作修正。
两手真 Skin52 通过源22同步，原少女其余资产不换。默认 motion / source GLB 不改。
真实 GPU `hands-candidate/reports/native-full-greeting.png` 已实际查看：掌朝目标、指向上，
比旧掌横向姿态改善，但腕边/近景材质/完整物理和最终质量仍未通过。
实际 ArrayMesh packed skin 六组参考最大误差 2.5113e-5 原单位（原始 float 理论误差
不能替代它），量化差/最初阈值失败均留证。14秒 headless 动态九项通过，详情在该README。

---

用途：证明换运行层时可以直接保留用户选择的 4348 旧曲面人物。不是新造型，
没有替换网页或产品，没有接 DSH，也没有在这里声称自然动作、全角度或物理已完成。

真实资产 `assets/selected-appearance.glb`：13,635,692 bytes，SHA256
`8cdc482600a30d370ffe39b70a58a1674659756092dd197d19e5562fc87a0078`。
77 Mesh、13 SkinnedMesh、原 22 身体骨和 Head 层级、53 材质、3 张原图。
250 个属性 accessor 共 2,350,739 分量 / 9,134,396 bytes 已独立 fresh-file
解析核对；POSITION、UV、NORMAL、COLOR、JOINTS、WEIGHTS 原数组和图片字节未改。
快照源码哈希复核保持。当前静态 pose 为 manual/full/t=0，各显式输入为零。

Godot 4.7.2 真 GPU 图：
`reports/selected-appearance-godot-linear-float.png`。
640×704，同机位正交，halfY=1.76985；已实际查看，保留原人物身份。
关闭默认导入压缩后，103 surfaces / 238,335 个导入表面顶点，逐一匹配到各自
source primitive 的 POSITION 与 UV，误差为 0，三角 index 数无差异。
这些是结构传递证据，不是自然动作或外观质量验收。

材质诊断有实际记录：RGBA8 黑白 2×2 的 CPU mip1 得到 128；先在线性域平均再
sRGB 编码应约 188。保持原图字节与同 Godot 解码像素，改为数学解码的 RGBA16F
GPU 缓存再生成 mips，服装 SOURCE_043 p95 从 [17,15,10] 降到 [7,6,4]。
双方关闭 mip 的独立图也已比较，服装 p95 为 [9,8,6]，支持过滤顺序是重要原因。
它不是唯一差异来源。原 float COLOR 另经 CUSTOM0 RGBA32F 保留；没有重新染色。
默认无参数运行保留早期 raw 诊断，推荐命令见 README 中 `-LinearTextures -FloatColors`。

推荐图的 opaque 内区 RGB 平均绝对差约 [2.24,1.25,.74]，p95 [6,4,3]；
任何通道大于16约1.13%。alpha IoU 是阈值128的 .9970；不要与其他阈值结果混用。
这些有限像素统计不等于画面完全一致。透明覆盖、采样、法线打包和绘制排序仍会不同。
原画脸 paint 的稳定材质内区 p95 约1；侧背推断和旧接片缺陷尚保留。

真实失败也保留：第一次 Float COLOR cache key 的 JSON float/int 字符串不一致，
以及 CUSTOM float 误用 PackedByteArray 造成失败，已分别定位。最终使用明确整数 key
与 PackedFloat32Array；源 geometry/UV 哈希及 CUSTOM0 构建后字节复核失败会退出，
脚本/引擎 stderr ERROR 不再被捕图 exit0 掩盖。历史失败图/日志作为诊断资料保存。

后续接口：新结构可沿用本 GLB 的 mesh/node/material/accessor 映射和原图片；
不能复用旧 native 新造型。面部动态 UV、眼皮 alpha/拓扑、发束骨链、手指、
全角度结构、连续可中断动作和 Jolt 接触还需要独立实现并真实验证。
