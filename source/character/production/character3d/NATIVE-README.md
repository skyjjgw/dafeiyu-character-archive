# 大肥鱼可编辑 3D 工程 v1

`dafeiyu-master-v1.blend` 是当前程序化模型的 Blender 精修源文件，`assets/dafeiyu-body-rig-v1.glb` 是保留蒙皮、顶点色、表情与动作的中间格式。两者都不是已经完成的 VRM 或生产拓扑。

工程使用项目内 Blender 4.5 LTS；工具链来源、版本和校验值见 `../../tools/toolchain-manifest.json`。运行包装脚本将配置和扩展放在项目内，不修改系统默认 Blender 配置。

## 内容与编辑

- 40 根骨骼及真实身体、衣服、长发和尾部蒙皮。
- 36 个面部网格分别保存 `blink`、`aa`、`happy`、`sad` Shape Keys。它们可在各网格的数据属性中继续修改；尚无统一表情滑杆面板。
- `idle`、`wave`、`walk`、`turn` 四个 30 fps 烘焙动作，包含 `physics.js` 的尾发骨骼动态。Blender 内是可编辑关键帧，不是原生物理约束；`walk` 是原地步行动作。
- 保存时全部 NLA 轨道静音，显示中性姿态。在 NLA 编辑器中只解除需要预览的那个动作轨道的静音。原始导入动作也保留在 Actions 数据块中。
- 原始线性色和顶点色保留，Eevee 使用 Shader to RGB 卡通材质；浏览器后处理描边没有导出成实体模型。
- 三份参考图已打包到工程。选定正面图是主参考，补全侧背图是推定视图，尾巴颜色以用户 v5 参考优先。推定视图不能代替作者原始设定。
- 骨骼显示辅助物位于 `99_Rig_Viewport_Helpers`，不参与渲染。场景、摄像机与参考图分开放置，便于后续人工建模和绑定。

## 重建

在 `E:/zzz/dafeiyu-character-materials-20261025` 目录运行：

```powershell
& 'E:/nodejs/node.exe' './production/character3d/scripts/export-model.mjs'
$taskBuildArguments = @('--background', '--python-exit-code', '1', '--python', 'E:/zzz/dafeiyu-character-materials-20261025/production/character3d/scripts/build_native.py')
& './tools/blender/Invoke-Blender.ps1' -BlenderArguments $taskBuildArguments
$taskVerifyArguments = $taskBuildArguments + @('--', '--verify-only')
& './tools/blender/Invoke-Blender.ps1' -BlenderArguments $taskVerifyArguments
```

`export-model-verification.json` 记录导出源文件 SHA-256、拓扑、颜色、骨骼、形态与动作信息。`native-build-verification.json` 记录独立进程重开后的结果，包括实际骨骼矩阵和蒙皮变化、表情顶点变化，以及四视图文件校验值。若源文件在构建期间或之后变化，报告会明确列出；再次重建即可同步。

`renders/` 的正、侧、背、四分之三视图是实际模型渲染，供多角度检查。程序化三角网格、发束交接、面部雕刻与服装细节仍需继续精修；本工程不代表已经通过最终外观验收。
