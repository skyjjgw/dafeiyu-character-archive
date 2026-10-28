# 已选人物：稳定裙布组件 1.0.0

外观始终来自用户选择的 4348 girl 与 maid 服装。该组件承接 v2 的空心外裙/内衬，提供真实物理可用的中性面与高细节薄壳映射，**不是布料物理或最终画面已通过**。原 source、4348、默认角色、手部冻结组件均未改。

## 数据与坐标

固定接口为 `assets/component.json` + `component.bin`。JSON SHA256 `c01bed3bd202422e8ef28bb8b2e665e2f8c852ea3aa38f05bce38f42cf39319f`；BIN 1,908,736 bytes、SHA256 `c9a08f0e12196337ffac10783036f2d5473eb53d379abf76a9b09044f88cf5a3`。全部属性有独立 SHA、offset/type/itemSize/count；二进制 little-endian。

`positionsBind` 是源 clothing mesh-local bind 坐标；`positionsNeutralRoot` 是真实 source22 蒙皮后 neutral t0 的角色 root-local 坐标，均未加 lift 或转米。Native 的显式 demo 尺度为 `.35 m/sourceunit`，世界转换为 `actorRigid * (.35*(neutralRoot + (0,1.055,0)))`，只应用一次。它是场景标定，不冒称作者给过人物真实身高。若已经用带 holder 的世界骨变换，不得再次缩放/加 lift。

原 22 骨名、父级、mesh bindMatrix、boneInverse、neutralWorldMatrices 都包含。点蒙皮的有效 IBM 是 `boneInverse * meshBindMatrix`，之后按合同恢复 mesh/root frame。

## 可积分结构

- 外裙低中性面：1,824 点、3,456 三角，19×96 环。
- 内衬低中性面：1,280 点、2,368 三角，19 行、内部64段、腰/hem96段，邻环用 conforming zipper 连接。
- 两层都是真正开放腰/hem 的 annulus，无中心实体盖、无重复 seam、无 T 接；每层96个完整腰硬固定点，实际全部为 hips0、weight1。自由点没有 animation pose 目标。source22 weights/IBM 仅供 pins 和初始绑定，不能每帧重置自由点。
- 高 render 每层5,568点（真实外/内薄壳），总11,136点。每点输出 solver 三顶点、三角 ID、重心、signed normal offset。每帧由真实当前 solver 三角与其法线重建，不能再套一次 source 骨架蒙皮。

原 front-only fitPoint 在侧缝前后造成旧尖折，生产中只在隐藏背侧约17°过渡带平滑接回原对应前边界；内衬原独立线性 flare 在中段几乎触外裙，现 depth 跟随实际外裙×.78，保持间隙。均是本组件的中性几何修复，不是对自由物理点施加姿势目标。原前画/脸/头发身份不换；小幅切向拟合和 shell 法线变化有明确误差记录，不能宣称像素零差。

## 误差、间隙与材料边界

落盘后原22 neutral 蒙皮与低面重建最大差 `5.96e-8 sourceunit`。外裙最大 normal offset约 `.571mm`，内衬约`2.612mm`；加半布厚后所需代理覆盖约 `1.18mm / 3.22mm`。这些是几何覆盖下界，不是官方材料参数。渲染布厚 `.0035 sourceunit = 1.225mm`。

低面边长和三角形状已实际统计：外裙最小角约18.52°、最大边比3.14；内衬最小角约14.94°、最大边比3.82。没有为压顶点数保留11mm的大补偿。性能仍须由真实Jolt实测，不承诺此点数自动60fps。

`reports/neutral-intersection.json` 检查落盘低/高数据：两层自身及相互 strict triangle crossings 均0；双向 vertex-to-triangle 最小采样间隙 solver约11.56mm、render约10.38mm。该算法排除相切/共面，不是完整 edge-edge间隙、连续碰撞或身体/尾巴/头发接触证明。

材质包含原 garment image SHA、原UV（Godot只翻V一次）、Float32 RGB COLOR（alpha默认1）、sideBlend/hemT和原navy/cream线性调色规则。默认白材质或普通RGBA8近似不能冒称已原样接入。侧背原画连续性、全身相机标定与最终画面仍未通过。

## 已完成的技术验证

`verify-component.mjs` 实际重新读文件校验全部数组SHA、索引/重心/权重、完整腰pin、bind/neutral重建和刚体客观性，均过。`audit-neutral.mjs` 是前述有限交叉/间隙检查。

真实官方Godot4.7.2 headless已用可信 `NativeClothBending` 接受本组件：外裙5,088 hinges、内衬3,456，rest力0，120次材料计算合计均值约.8ms（不含Jolt/点读取/渲染，不等于FPS）。初始2m刚体平移后float32输入有约`2.3e-5N`微残力；没有简单放宽阈值，而是导出确切single输入，以独立NumPy逐hinge重算，差约`4.51e-13N / 8.31e-13N`。证据 `reports/native-material-reference.json`，旧失败阈值报告保留。测试材料参数不是实测布料标定。

`index.html?compare=1` 使用同一 source girl、实际数据与哈希的静态结构页面。它明确是静态/source骨架回退，**没有假正弦布料**。实际Jolt积分、signed bending force接线与接触由 runtime 独立组件验证；目前 `physicsPass=false`、`visualPass=false`。

复现：`node build-component.mjs`、`node verify-component.mjs`、`node audit-neutral.mjs`。Native材料probe位于 `godot-probe`，仅用本组件几何，没有加载旧被否定的native服装。
