# 下载、校验和恢复

## 下载完整归档

登录有权限的 GitHub 账号，用 GitHub CLI 下载到一个新目录：

```powershell
gh release download archive-20261028 --repo skyjjgw/dafeiyu-character-archive --dir downloads
```

下载的文件中应同时有 `manifest.json`、`SHA256SUMS.txt` 和所有连续编号的分卷。
每份分卷小于 GitHub 的 2 GiB 单附件限制；它们合起来是一条 gzip 压缩的 PAX tar 数据流。
不需要付费 Git LFS，不要只克隆本仓库就认为已恢复大文件。

## 先完整校验，再解包

仅校验全部分卷 SHA-256、压缩流 CRC 和每一个原文件 SHA-256：

```powershell
python restore_archive.py --manifest downloads/manifest.json --parts downloads --report verification.json
```

解包到新的空目录，并再次逐文件校验：

```powershell
python restore_archive.py --manifest downloads/manifest.json --parts downloads --extract-to restored --report restore-verification.json
```

脚本不会覆盖已有文件，拒绝绝对路径、向上跳转、符号链接和重复条目。

## 原目录映射

`manifest.json` 中的 `roots` 和每个文件的 `source` 记录原位置。
先在新目录检查内容，再按需要恢复到原路径；不要覆盖之后新创建的工作。
`selected-preview` 和 `reference-inputs` 只恢复清单内文件，不覆盖其原父目录中的其他项目文件。

四个 NTFS junction 的原路径和目标保存在 `links`。目标文件已经收进 `external/`；
恢复目标目录后，可按清单用 PowerShell `New-Item -ItemType Junction` 重建联接。

## 环境边界

项目目录里实际存在的工具、依赖、权重和配置均按字节保存。
部分 venv 的 `pyvenv.cfg` 引用了电脑原有 `D:/anaconda3/envs/t1`，
全局 Anaconda 与显卡驱动属于外部环境，未归档或删除。
换电脑恢复时需按项目内环境/工具清单重建这些外部依赖；不能保证直接搬动 venv 后无需调整即可运行。

## 本地删除前的证据

`local-verification.json` 记录归档流的逐文件恢复检查。
`remote-verification.json` 记录实际从私有 Release 重新下载每份分卷后的 SHA-256。
`cleanup-receipt.json` 在用户要求的本地清理完成后追加，记录实际删除范围与空间变化。

## 上传期间的新进度补充包

同一 Release 还包含 supplement-001.zip、manifest-supplement-001.json 和 restore_supplement.py。
它保存主对话在上传期间新增或更新的五项内容。完成基础恢复后执行：

```powershell
python restore_supplement.py --manifest downloads/manifest-supplement-001.json --zip downloads/supplement-001.zip --extract-to restored
```

补充恢复在覆盖基础快照文件前检查其原 SHA-256，拒绝覆盖后来编辑的文件。
`post-snapshot/` 提供该补充包的浏览副本。

本地已清理 18,849 个旧快照文件、约 11 GiB；正在使用的现成角色预览、最新状态及被服务占用的小日志保留，避免破坏主对话的新进度。
原始快照中的全部 18,855 个文件均已上传并逐文件回下载验证。
