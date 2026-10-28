# 已选人物连续五官内核候选

外观唯一基准是用户选定的 `http://127.0.0.1:4348/character-preview.html`。本目录没有修改该页面、冻结源图、DSH 安装、配置或账号，也没有引入已被否定的 native face-v4 或新虹膜画法。

`kernel.mjs` 与 C++ `SelectedFaceKernel` 直接转译冻结 `face.js` / `profile-volume.js` 的连续方程。眨眼改变上下眼睑、眼周皮肤顶点与透明度；视线改变虹膜顶点并补偿 UV；口型、情绪和睫毛连续变化。使用源图原像素作为纹理，既不按表情换整图，也不每帧重建网格。

## 已完成的实际验证

- `sample-source.mjs` 调用原始 `createPaintedFace.update`，采样 44 个 blink/talk/happy/sad/gaze 组合，源文件哈希前后相同。
- Node 新内核和官方 Godot 4.7.2 C++ 内核分别核对 18 个动态 mesh，共 2,762,276 个 Float32 分量：位置、虹膜 UV、眼周/嘴周 RGBA 全部逐位一致，显隐一致。
- RTX 4060 / OpenGL Compatibility 实际执行 `surface_update_vertex_region` / `surface_update_attribute_region` 后读回 44 态，仍全部逐位一致。18 个 mesh RID 始终不变，每帧重建数为 0。一次性 setup 替换 18 个 mesh，以启用动态 buffer 和 Float32 CUSTOM0；dispose 能恢复源 mesh。
- `reports/buffer-source-parity-gpu.json` 记录本次 kernel 均值约 2.95 ms、提交均值约 0.13 ms，未计入整个人物、物理、GPU 绘制或其他应用。headless dummy renderer 不支持实际 buffer 写回证明，报告明确标识 `readback_supported=false`。
- 已查看 `reports/face-{blink-0,blink-5,blink-10,talk-gaze-10}.png`：源虹膜、半闭眼、闭眼及开口均实际出现。它们是无头发的独立脸部探针，未被发片遮住的源皮肤底图边界仍可见，不能据此宣称整个人物美术通过。

这些证据证明方程与传输忠实，并不证明旧 90° 分层结构或全身表演已经合格。全身合体图、透明度排序及新结构深度仍须独立比较。

## 原生接入

运行 `node package-component.mjs` 后，把 `package/face-kernel` 整个目录复制到独立候选项目的 `res://face-kernel/`。运行时只需其中五个文件（含 DLL），无需约 16 MB 的 golden 样本二进制。按 `component-manifest.json` 校验 SHA-256，使用官方 Godot 4.7.2 Windows x86_64 标准精度版本。

```gdscript
var adapter = load("res://face-kernel/face_adapter.gd").new()
var config = JSON.parse_string(FileAccess.get_file_as_string("res://face-kernel/source-equations.json"))
var map = JSON.parse_string(FileAccess.get_file_as_string("res://face-kernel/source-descriptors.json"))
var result = adapter.setup(model, config, map.meshes, "res://face-kernel/selected_face_kernel.gdextension")
assert(result.ok, str(result))

# 每个真实渲染帧一次，非每个 240 Hz 物理 tick。
var updated = adapter.update({"blink":blink, "talk":0.0,
    "happy":happy, "sad":sad, "gazeX":gaze_x, "gazeY":gaze_y})
# 场景卸载或回退时：
adapter.dispose() # 恢复源 mesh、显隐和 source_float_colors 参数
```

`model` 的 18 个源动态脸 mesh 名称/顶点顺序必须与 descriptor 一致；另 4 个静态源 mesh 保留。setup 先核对 18 个动态 mesh 的名称、顶点数、材质和缓冲布局，再统一应用。源 GLB 的 SHA 和顺序须由宿主的原样传递 manifest 校验；adapter 的顶点数检查不能单独识别保持同顶点数的重排资产。不要在校验后压缩、分面、简化或重排源顶点。

材质继续由候选项目的原样传递模块设置。动态 RGBA 使用 `CUSTOM0` 的 `RGBA_FLOAT`，标准 `COLOR` 在 GPU 上会量化为 RGBA8。Shader 必须提供 `source_float_colors` uniform 并实际把 `CUSTOM0` 传至 fragment 使用；adapter 拒绝为它创建通用替代 shader。源脸是 MeshBasic/unlit，动态更改无需猜测新 Toon 法线。

局部坐标为原 Head local（X 右、Y 上、+Z 前），模型的真实 Head 节点只变换一次。不要加 native-v4 的 Z-up 转换。无实际语音/音频时保持 talk=0；thinking/running 不等于 speaking。state 是有限白名单数值，blink/talk/happy/sad 范围 0..1，gazeX/Y 范围 -1..1；mood 字符串和 talking 仅是原方程兼容回退。

## 给连续头部结构的顶点映射

`SelectedFaceKernel.configure(config, descriptors)` 支持原语义规则，也支持每顶点显式 `canonicalRoles: PackedInt32Array` 与 `canonicalParams: PackedFloat64Array`（每顶点四项）。固定角色如下：

| ID | 角色 | 四个参数 |
|---|---|---|
| 0 | static | x, y, z, 0 |
| 1 / 2 | eye_ring / sclera | eyeIndex, theta, radialK, 0 |
| 3 | iris | eyeIndex, columnU[-1,1], rowV[0,1], 0 |
| 4 / 6 / 7 | upper_lash / lower_lash / crease | eyeIndex, pathU[0,1], edgeSign[-1,+1], 0 |
| 5 | outer wing | eyeIndex, corner[0,1,2], 0, 0 |
| 8 / 9 / 10 | mouth_ring / cavity / tongue | 0, theta, radialK, 0 |
| 11 | lips | 0, pathU[0,1], edgeSign[-1,+1], 0 |
| 12 | front_profile | restX, restY, zOffset, seamBoundary[0/1] |

自定义网格可提供 `neutralPositions` / `neutralUV` / `neutralRGBA` 的 Float32 PackedByteArray。新增眼窝/口腔内壁等应明确记录它们的角色和参数，不能冒用静态源差分证明。原 iris/sclera/tongue 的显隐按整个 primitive 控制；混合新网格时应拆出需要独立显隐的材质 primitive。

源默认深度：`adapter.set_depth_policy({"kind":"source-default"})`。

结构候选允许显式 `kind:"structural-candidate"`，可传 `strength`、1025×10 `profileTable`，以及 `roles`（角色 ID 字符串→`source` / `sphere` / `eye_ring_blend`）和两个眼睛的 `center:[x,y,z]`、`radii:[rx,ry,rz]`。此策略只改 Z；原 XY、UV、颜色/alpha 方程仍为原 authority。`eye_ring_blend` 使用原 radialK 平滑连接头面和椭球前表面。参数非法时整体拒绝，不部分应用。恢复 `source-default` 后可重现原始字节；结构策略必须另标记并实际图审，不能声称与旧 XYZ 仍 0 差。

## 复现命令

```powershell
node sample-source.mjs
node verify-js.mjs
./build.cmd
& '../../tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64_console.exe' --headless --path godot --script res://verify_kernel.gd
& '../../tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64_console.exe' --path godot --script res://verify_adapter.gd --resolution 704x704
node package-component.mjs
```

工具链和官方 godot-cpp 源复用本机已核对的独立物理 helper 目录；未安装新软件、未修改系统 PATH。配置/descriptor 属于校验过的本地可信资产，不是远程输入 API。
