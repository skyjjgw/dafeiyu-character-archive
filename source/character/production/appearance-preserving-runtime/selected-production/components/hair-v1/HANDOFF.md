# 开发版原角色头发结构组件

`selected-hair-continuous`，Head local identity，`dynamicPhysics=false`、
`hairPhysics=false`、`finalAccepted=false`。只改善原人物五束头发的静态空间结构。
已获Root实际Three前/45/90/背面图审的开发接入授权，不代表全人物最终通过。

未改current.tscn、registry或component-manifest。由C按Root安排接入。

## 生命周期接口

```gdscript
var component=load("res://selected-production/components/hair-v1/factory.gd").new()
var prepared=component.setup(original_head_control,host_source_renderer)
# prepared.ok: hidden, unparented, identity model; source visibility unchanged.
# Verify/register prepared.contract and files before the following commit.
var installed=component.commit()
# Once-only identity attachment under the existing Head. No second Head transform.
var state=component.snapshot()
component.dispose() # Restores each saved original visible flag. Idempotent.
```

setup先校验runtime文件bytes/SHA、host source GLB SHA、原3纹理SHA及顺序、
15个精确原mesh资源名、实际GLTF导入POSITION/UV/索引/material映射。
失败不改变源显隐。只接收原`mesh.resource_name`或Godot已实测精确别名
`selected-appearance_` + 原名冒号替换下划线；不按hair字符串广泛隐藏。

原15项为左右face-framing、central-forked-bangs、左右auxiliary-source-traced-long-curls
各自的`:original-pixel-surface`、`:closed-thickness`、`:back`。完整名单在contract。
耳鳍、蝴蝶结、头饰、后发团、头壳、呆毛、脸、身体、原骨骼不在替换名单内。

dispose只释放组件持有的model/material/shader资源引用并恢复原显隐；
不释放host renderer或host textures。已有隐藏的源mesh在dispose后仍隐藏。
没有每帧重建，没有旧source顶点索引deform，也没有已实施头发物理的声明。

## 资产与着色

`hair-v1.glb`：3483308字节，SHA256
`8b1a87855163fdd3432910228c8048f925cafc8cd62a1690885f05b9115558a5`。
5mesh、14466 canonical顶点、28928三角、10个`SOURCE_000`至`SOURCE_009`材质。
每mesh的front和side/back分别为2个primitive，Godot导入按材质拆点是正常现象。

`rendering.json`来自实际Three实例采样：type/baseLinear/image/vertexColors/
transparent/alphaTest/depthWrite/depthTest/side/toneMapped，以及原图顺序和SHA。
factory调用host现有`source_material(spec)`构建自己的材质，复用host3个已线性化
RGBA16F缓存：0原cover、1原neutral-front、2原turnaround。贴图不复制、不再次sRGB
解码，host source shader只翻V一次。标准glTF材质仅供资产携带，不能替代该着色路径。

左右长卷发front实际为`SOURCE_006`、`SOURCE_008`：image=1，原0x9a88b0 tint，
transparent=true、alphaTest=.4、depthWrite=true。host shader实际使用blend_mix、
depth_draw_always、`if(color.a<source_cutoff)discard`及ALPHA，不能只用标准BLEND。
本5mesh没有COLOR_0，因此不涉及8bit COLOR量化；不能把此结论推广到原头壳/头饰。

canonical导入验证逐POSITION+UV的float32 bytes匹配，三角精确对应原canonical顶点，
每个三角必须按Godot clockwise约定反转glTF CCW，材质surface必须精确匹配SOURCE_i。
法向因Godot ArrayMesh压缩最大误差约.000129，已报告，不声称法向bytes无变化。

## 检查与收据

`reports/lifecycle-report.json`：Godot4.7.2真实headless导入，21项全部通过，包含
setup不改源/hidden unparented、精确15替换、invalid parent安全拒绝、commit幂等、
Head变换一次、dispose恢复/释放、预隐藏状态保留、3个host纹理存活，及实际shader
纹理引用/cutoff/透明/depthWrite/一次UV翻转校验。无GPU验收声明混入headless收据。

运行headless（30秒内部watchdog，外加quit-after兜底）：

```powershell
& tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64_console.exe --headless --quit-after 300 --path production/appearance-preserving-runtime --script res://selected-production/components/hair-v1/check.gd
```

GPU verifier为同一check.gd，Root/C协调后运行带`-- --capture`的独立隐藏Godot进程。
不使用`--headless`，需兼容renderer和640x704 viewport。它只创建独立原source实例，
不会操控当前用户窗口。输出`reports/hair-v1-0.png`、45/90/180及gpu-import-report。
GPU本任务未擅自启动，报告必须由实际运行生成，不能从headless报告推断。

重建顺序：`node build.mjs`、`node build-contract.mjs`，再headless check。
当前契约SHA覆盖factory、GLB、rendering.json、check.gd；变更任一后重建契约。
两支几何源仍在独立geometry目录，sourceModules记录其冻结SHA，勿偷偷改成generic。

## 已修与尚未完成

左右脸侧+中央刘海：原237/319/214 T接 incidence降至0；单锁共形闭合并增厚后侧。
左右长卷发：各92 T接、最大.090259源单位裂缝降至0，保留原外轮廓、双真孔、
原mapPoint/depthAt曲面方程、UV和材质。详细CPU机理与交叉诊断在geometry候选报告。

目前五束仍分别成体积，与头壳/其他发束未做Boolean融合或完整碰撞；
未知背部绘画仍是原辅助图推断。侧面身体、其他结构、全角色运动和头发次级物理
仍待后续处理。开发接入不能把整个人物或物理状态标成final。
