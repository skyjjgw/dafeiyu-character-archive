# 大肥鱼项目内 Blender 工具链

已固定 Blender **4.5.15 LTS / Windows x64 便携版**与 VRM format **4.10.2** 扩展。精确来源、下载 SHA-256、许可证与实测结果见 `toolchain-manifest.json`。Blender 从官网下载，扩展来自 saturday06 官方 GitHub Release；未使用安装器或修改注册表。

统一通过 `blender/Invoke-Blender.ps1` 运行。该脚本把 Blender 的配置、扩展、脚本和数据目录都指向本项目的 `blender/profile/`，仅修改当前子进程环境，执行后恢复。默认关闭联网与工程自动执行脚本，不读取用户全局 Blender 配置。

```powershell
$taskLauncher = 'E:/zzz/dafeiyu-character-materials-20261025/tools/blender/Invoke-Blender.ps1'
& $taskLauncher -BlenderArguments @('--background', '--version')
& $taskLauncher -BlenderArguments @('--background', '--python-exit-code', '1', '--python', 'E:/path/to/project_script.py')
```

给 Python 脚本传参数时，将分隔符 `--` 作为数组中的字符串保留，避免 PowerShell 将其消费掉：

```powershell
& $taskLauncher -BlenderArguments @('--background', '--python-exit-code', '1', '--python', 'E:/path/to/project_script.py', '--', '--your-option')
```

扩展已启用为 `bl_ext.user_default.vrm`，保存在 `blender/profile/extensions/user_default/vrm/`。VRM 导入与导出操作符已实际注册。原始扩展 ZIP 与所选 MIT 许可、可选 GPL 许可及主许可声明保存在 `vrm-addon/`；主声明为 `MIT OR GPL-3.0-or-later`，本项目按 MIT 选项使用扩展。Blender 自身的许可证和依赖许可证保留在便携包原目录中。

`blender/validate_native.py` 已验证保存空白 `.blend` 并在另一后台进程重新打开；结果位于 `blender/validation/native-validation.json` 和 `reopen-validation.json`。`empty-toolchain-check.blend` 的对象数为零，只是原生工程读写测试，不是人物、骨骼或材质成品。没有修改现有原型代码或人物模型。
