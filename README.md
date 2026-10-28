# 大肥鱼形象创作完整归档

这是个人私有恢复仓库，保存截至 2026-10-28 的本地大肥鱼形象创作文件。

## 全量文件在哪里

完整文件存放于本仓库的 **[archive-20261028 Release](https://github.com/skyjjgw/dafeiyu-character-archive/releases/tag/archive-20261028)**。
必须下载 `manifest.json`、`SHA256SUMS.txt` 和全部 `dafeiyu-full-20261028.tar.gz.partNNN` 分卷。
GitHub 自动生成的 Source code ZIP 只包含本仓库内容，**不包含完整创作文件**。

`source/` 是便于浏览的源码与文档副本；全量归档还包括参考图、概念稿、原生 Blender 工程、
GLB/PLY、纹理、历史与未验收版本、实际截图、运行代码、工具链、项目内依赖和已下载权重。
分卷归档没有按 Git 的忽略规则排除文件，逐文件路径、字节数与 SHA-256 在 `manifest.json`。

## 范围

- `character/`：原 `E:/zzz/dafeiyu-character-materials-20261025` 全目录。
- `external/`：七个独立 D 盘 `dafeiyu-whole-*` 创作目录，包括通过 NTFS junction 引用的真实文件。
- `selected-preview/`：原 `dafeiyu-dsh-panel/qa` 中四个 `character-*` 形象预览文件。
- `reference-inputs/`：十张用户提供的参考图片。

其他软件项目、DSH 安装本体、全局 Anaconda/Python、驱动、网站运维文件和凭据不在归档范围。
目录联接保存在 `manifest.json` 的 `links`，目标内容在 `external/` 中只归档一次。
创作过程中不合格及已否决版本照常保留；归档不表示角色质量已经完成或通过验收。

## 恢复

需要 Python 3.11 或以上；恢复工具只使用标准库。详见 [RESTORE.md](RESTORE.md)。
仓库保持私有；第三方模型、工具和参考作品的原许可文件随原文件保存，没有重新授予许可。

## 归档规模

18,855 个原文件，原始总字节数 11,820,070,543；8 个分卷合计 8,392,781,759 字节。全部文件的本地归档恢复哈希已通过，远端下载校验与删除收据另附。
