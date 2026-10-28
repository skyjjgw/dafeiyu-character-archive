# 原人物头发：结构诊断与受限候选

本目录不改4348原人物、冻结源、current.tscn、registry或component manifest。
保留蓝长发、原脸眼型、灰白头饰、身体和鲸尾。全部 `finalAccepted=false`，
未自动启动GPU，真实WebGL及原生整合由Root验收。没有新人物或相机billboard。

## 已证实的根因

冻结 `source/hair.js:124` 的 `sampleTriangles` 按每个三角独立递归四分裂。
邻三角不共享边分裂决策，因此会产生T接。`makePatch` 从同一source像素坐标
计算曲面与厚度，但T点与整边端点之间的曲面插值不一致，所以会成真实空间裂缝。
原左右脸侧发和中央刘海分别有237、319、214个未配对边T接 incidence，
rest最大空间错位约.002903、.002649、.001787源单位。

原长卷发更严重：`hair.js:162` 的front还加上 `(depthAt-.010)*.42`，
`depthAt` 是到外轮廓及两孔的距离再开平方。非线性厚度将T接错位放大。
左右长卷发各92个T接 incidence，rest真实最大错位 **.0902593775源单位**。
该结果与Root提供的greeting发尾漏空/锯齿截图相符；问题不只是贴图或面法向。

同时，原发型并非全由平面卡组成。`rear-hair.js:35` 是连续椭圆头壳，
`:67` 是椭圆后发团；脸侧发/刘海/长卷发是独立source投影曲面加Z方向厚度体。
轮廓附近厚度仅.010，独立锁与头壳叠置，侧面会暴露平行画面与无纹理侧壁。
修T接不会自动消除这些发束之间的层状空间关系。

头壳背面和后发团采样 `turnaround-auxiliary-v2.png` 的安全蓝区并拉伸，
长卷发来自 `neutral-front.png` 且右边镜像。未知背部曲率/绘画是推断；
不是原作者提供的完整turnaround。源码原定支持yaw25°，不能据此宣称90°已完成。

已读实图：`selected-production/reports/current-turn-actual-side.png`、
`selected-production/components/headband-v2/reports/headband-v2-current-sha-90.png`、
`selected-production/reports/current-front-greeting.png`，以及source front截图。

## 两个互相独立的候选

1. 本目录 `review.html` / `hair.mjs`：仅左右脸侧发和中央刘海。
   全局共享边共形重网格，前/后/边连接为每锁单个闭合网格；后侧最大厚度
   从约.230增至.418源单位。source XY投影/UV公式保留，原轮廓做每次小于.02像素
   的近共线join清理，以防Float32细屑。三锁各自连续，未与头壳或彼此Boolean融合。
   三锁GLB：`assets/hair-continuity-v1.glb`，779112字节，
   SHA256 `336f73603a38b5c57842446ba825463512e8c4eca2502e2f12a62873b3112857`。
   本版几何在Root要求后冻结保留，长卷发修复没有混入它。

2. `long-curls-conforming/review.html`：只修左右长卷发的共形连接。
   保留原外轮廓、两处真实孔、source曲面方程、深度方程、UV、材质及镜像规则，
   不增厚、不改发型。仅去除数值精度内恰好共线的轮廓采样点。
   原92T接和.090259空间错位均变0。两侧各764顶点/1532三角，
   1连通闭合体、Euler=-2（两孔），边界/非流形/方向冲突/退化0。
   严格非相邻三角横穿0；诊断排除了共顶点、共面和边触，不能当作完整接触证明。
   source方程审计重新执行冻结原splitter以恢复double像素坐标，
   原顶点及候选位置最大误差均6.55e-8；由float32 UV反推会在sqrt边缘放大误差，
   因此没有用这种不精确反推冒充原方程偏差。
   资产：`long-curls-conforming/assets/long-curls-conforming-v1.glb`，897056字节，
   SHA256 `63a64c7da527ee54725b2851aa489360139348e7fca2d2b15edddabd84ed37a9`。

实际页面（沿用既有4334静态服务器）：

- http://127.0.0.1:4334/production/appearance-preserving-geometry/hair-continuity-v1/review.html
- http://127.0.0.1:4334/production/appearance-preserving-geometry/hair-continuity-v1/long-curls-conforming/review.html

各页都可看source/candidate、front/±45/±90/back、隔离、网格、纯色法向，
并实际读取同WebGL renderer的front像素差和导出当前PNG。CPU的XY/UV检查
不是front像素验收；Z改动、遮挡、曲面插值、alpha和侧面材质仍须真实视觉核对。

运行 `node prepare-review.mjs`（校验冻结SHA，仅复制并适配Three路径）、
`node check.mjs`、`node export-component.mjs`；长卷发子目录也分别有check和export。
不应将重网格后的数组套进旧source per-index发丝变形器；当前只交静态rest，
动态绑定、头身碰撞与原生着色需要独立实施和验收。

GLB提供标准fallback与原始material flags。长卷发原front为transparent=true、
alphaTest=.4、depthWrite=true；标准glTF BLEND不能完整表达同时alphaTest，
原生必须读contract/extras使用对应shader，不能以标准查看器差异误判原UV改变。

当前CPU报告：本目录及子目录 `reports/geometry-check.json`。
真实front差异、各视角PNG、全体发束交叉和原生动作验收以Root后续收据为准；
此处没有宣称外观、头发物理或完整角色最终完成。
