# 原人物头饰：共享边界连续薄壳候选

本目录独立，不编辑冻结源、4348 页面、默认 native 人物、头部 v3 或旧 hair-candidate。对照页 `review.html` 使用冻结原人物、原图、同源三灯与正交相机。

本轮从原左右 frill 的 source polygon 重新生成 conforming 三角形，而不是继续拉伸已有 T 网格。左右原 inner boundary 的 286 个细分顶点直接成为跨深度布带的前边界，布带后边沿原 arch 的外轮廓与白灰配色拟合。将这一整个共享 top surface 一次性生成有限厚度背面和外缘，因此没有“旧片旁再叠一块板”的接法。原六个 frill mesh 和 arch 仅在候选模式隐藏；切原版恢复。

- 11,736 个 indexed 顶点，23,468 个三角形；一个连接块、0 边界、0 非流形、0方向冲突、0退化三角形。最小面积约 2.31e-10，存在很细长的原曲线三角形，不能视为物理网格质量已经完善。
- 原 frill 正面积轮廓、观测区域 UV 和原白灰像素沿用。修了 source crop 的零面积共线/折返：左32点、右30点；右内轮廓落在图像 y0 的有效终点为 x916.552，而原897→906等点只构成零面积折返。没有重画整个头饰或人物。
- 新布带和厚度背面采用原 arch 的平均白灰 palette；原图 crop 未观测部分用同 palette 连续补色，保持整体不透明，未靠透明洞遮掩结构。
- 布带跨深度走向与厚度 .006 都是未标定 source 单位下的推定。新增背面/边缘局部 XY 有厚度变化，不能声称整件投影或像素0差。
- 材质用源 sRGB 纹理的 unlit surface paint 与原 arch 线性 palette；它是实际薄壳表面绘制，不是人物整图卡片。需要实际 GPU 验证颜色采样、前视白带宽度和头发遮挡。

`check.mjs` 检查的是数据与共享拓扑，不是视觉验收、严格自交认证或布料动态。没有增加摆动脚本、Jolt 接触或所谓真实物理；不能声称全角度人物完成。

## 运行与实审

`node check.mjs` 生成 `reports/geometry-check.json`。浏览器打开 `http://127.0.0.1:4334/production/appearance-preserving-geometry/headband-volume-candidate/review.html`，切原版/候选、正/45/90/背面；“只看头饰”直接检查整件几何，“测量正面像素差异”读回同一 WebGL renderer 的实际 RGBA，并生成原/候选 PNG。root 独占 CUA，本 agent 未独立进行 GPU/网页实审。

当前 `visualPass=false`、`finalQuality=false`、`nativeIntegration=false`。尤其需要实看是否白带过宽、改变原刘海/白边关系，侧面是否消除旧三角灰洞和两条平行板。真实图审发现问题后应按证据局部修，不得用拓扑闭合自证通过。

## 接口

`installContinuousHeadband(character)` 只接受冻结角色对象（原7个mesh名、metadata.hair source outlines），返回 `mesh / metadata / original / dispose`。真实几何位于原 Head local 空间，原其他头发/脸/身体 geometry 不变。`clothColor`、`paintWeight` 与 UV 定义新表面画法；尚未导出为 glTF/PBR/骨骼或 physics adapter，不能直接混入旧 native face kernel。`dispose` 恢复原mesh显隐与原几何对象，原图与源资源仍由原角色管理。

## 2026-10-28 真实失败记录

Root 实际 WebGL 前/侧审查已拒绝首候选。初版 THREE.Color() 默认白色后再累加均色造成 palette>1 截白，且可见 underside 没有原 paint，导致白块与细节丢失；这两项已修复，root 实际图确认灰白原画细节恢复。侧面仍为大直板，并有蓝/深块，不能称人物达标。

新增 audit-intersections.mjs 后发现 4108 对严格非邻接、非共面横穿。该诊断排除共享点和共面接触，仍然已足够否定“物理结构通过”；不是因索引 manifold 就可以忽略。全部 actual 证据和失败范围记录在 reports/visual-review-20261028.json。

对照页“纯色布面诊断”保持相同网格、相机和opaque渲染，只关闭 source paint。用于区分蓝色 source采样污染和实际头发穿入/结构缝；它不是默认外观或掩盖失败的解决方案。当前未给视觉、物理或默认集成通过。

## 本轮最终收口：未通过，未接默认人物

同一 geometry 的纯色 actual 图 `reports/cua-headband-solid-left90-20261028.png`、`cua-headband-solid-isolated-left90-20261028.png` 中蓝/深色“洞”消失，确认该帧主要是邻近头发像素被 source UV 展开到布面。原始图案不是所有像素都可信，不能一概称原画原样。

最后只做布面色短修：高色度、非白灰 cloth 采样平滑补为原 arch 的白灰 palette，未知区域明确作为推定。root 已实际查看非 diagnostic 的 `reports/cua-headband-paintfix-left90-20261028.png`，本 agent 也真看图：蓝色污染明显减少，但深灰不自然块和大竖板仍在。**只记这一帧局部色污染改善，整体 visualPass=false、physicalQualityPassed=false、finalQuality=false、nativeIntegration=false。**

数值检查现将 `topologyDataPassed=true` 与 `passed=false` 分开，几何及 index SHA 绑定到 4108 横穿诊断，避免后续只看 manifold 数字误接。降低厚度到 .001 的独立诊断仍2917横穿，且 top/top 94对不变；仅调薄不能解决错误曲面路径。未继续扩候选版本。

### 留给后续真实曲面重建的接口

入口 `installContinuousHeadband(character,{subdivisions:2,thickness:.006})`；场景坐标是原 Head local，source 单位未标定。source outline 在 `character.metadata.hair.patches`；原 inner contour 的有效点和裁边修复记录于 `metadata.outlineRecords`。当前 band stations 306、跨深度 rows8；对应生成处为 `headband.mjs` 的 `stations / grid / archAt / frillZ`。问题是轨迹/参数映射和厚度方式，**不是继续给现有大板加细分或将 failed shader 当新头饰**。

下次先按真实 scalp 曲率重拟合 band 中性面和与 frill 相接的有限半径过渡，维护原前视白灰边、发型和五官身份；先消除中性面的 top/top 横穿，再建背面/法线厚度并跑同一实际对照。保留 source 原图与原4348，勿把本目录失败候选晋升为当前人物。
