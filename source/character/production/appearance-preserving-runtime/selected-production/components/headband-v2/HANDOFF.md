# 头饰 v2 原生组件接入交接

状态：**可合入 current 制作版的局部改善；finalAccepted=false；无 cloth physics**。

- 接口：`factory.gd` 的 `setup(parentHead, hostSourceRenderer)` 准备隐藏且未挂树的 identity model；外部 registry 验证返回 contract 后调用 `handle.commit()`；只由 commit 挂 Head 一次；保留 handle 强引用，退出或恢复时 `handle.dispose()`。
- 注册 ID：`headband-continuous-shell`；目录：`components/headband-v2`。已与 `/root/selected_motion_hair` 协调，他负责 current/registry/manifest 接线，本目录未改其文件。
- 冻结几何：GLB SHA-256 `c46ab19cb79e8b6768b2b0a86ddc0f09b3681957932a47c4b9ed0b0083014ebb`，1223644 bytes，15906 vertices / 31808 triangles；生成器 SHA `72769501a9c7258d864c4581b7a0b90128c37dba7b9e0988af53e807f8a3cfb7`；未建模或改动几何。
- 该 native runtime 的选中原人物 GLB 实际 SHA 为 `8cdc482600a30d370ffe39b70a58a1674659756092dd197d19e5562fc87a0078`，与 motion-rig/source-rendering 一致。它是原 girl 的 native transfer；未替换 face/hair/body 或改比例。
- 材质：复用宿主 cover 的线性 RGBA16F 纹理，`texture_is_linear=true`，不再次 sRGB decode。COLOR_0 原始 float RGB 转 CUSTOM0 RGBA_FLOAT；UV2.x 真实 paintWeight 完整保留。shader 与冻结几何 candidate 相同。
- 只按原 7 个头饰 resource_name 精确别名替换，支持 Godot 的 `selected-appearance_` 前缀和 `:`→`_`；不做 hair/frill 前缀宽匹配。setup 失败不变 source，dispose 恢复每个原 visibility，保留原先 hidden 状态，不释放宿主共享纹理。

实测：`reports/lifecycle-report.json` 的20项通过；`reports/gpu-import-report.json` 的24项通过，Godot 4.7.2 / RTX 4060 / Compatibility，stderr 空。POSITION/UV/UV2 关联无未匹配项，ArrayMesh POSITION/UV/UV2/CUSTOM0 四项字节 roundtrip 误差0。

GPU 证据均为本次当前 c46ab…GLB 新生成，不沿用旧 candidate import report：

- `reports/headband-v2-current-sha-0.png`
- `reports/headband-v2-current-sha-45.png`
- `reports/headband-v2-current-sha-90.png`
- `reports/headband-v2-current-sha-180.png`

四张均已实际 view，并对照 Root 的 JS `cua-doublepaint-front/left45/left90-20261028.png`。灰白褶边恢复、无 green halo，双面 paint 未丢，色彩与 JS 接近。完整视觉审阅和各照片 SHA 在 `reports/visual-review.json`。

未过项：头饰侧后白布/灰褶对比仍待美术验收；原侧视头发/身体平片破碎仍存在；未验证布料动态/碰撞/整人物完整物理，不能宣称全角度或最终通过。
