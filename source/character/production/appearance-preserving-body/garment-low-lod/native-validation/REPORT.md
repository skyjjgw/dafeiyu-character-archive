# 672 点 LoD 的冻结隐式 kernel / Jolt 有界集成诊断

结论：**质量校准、240 Hz 的 1 秒与 4 秒数值有界诊断、材料 kernel 成本门槛均通过。整件衣裙物理/碰撞/视觉/全帧实时验收均未通过或未进行，不晋升 default，不接入 current。**

## 隔离范围与复用

仅此 `native-validation/` 写入。使用既有 `garment-implicit-kernel/component` 的 `SelectedImplicitClothBending` GDExtension DLL，直接复制，未改源码、未重编译；源/复制 DLL SHA-256 相同，见 `reports/summary.json`。官方 Godot 4.7.2 stable 内置 Jolt，headless CPU 物理。没有 GPU solver。

只读取新 `../assets/component.json/.bin`：外层320点、内层352点，每层48腰 pin（共672点/96 pins）。原高 render、UV、FloatRGBA、22骨和生成器未写入。LoD 开放环面不是实体体积。坐标换算 `.35 * (neutralRoot + (0,1.055,0))` 一次。Godot CW winding 与 first triangle encounter source→engine 映射沿用旧 probe；逐点核验 pins。配置 pointRadius=.0035m 后仅在构造期、pins 前作一次离开/重入 space。此无接触实验未重新测 radius。

四组同时运行：外层 No bending / implicit、内层 No bending / implicit。Jolt 膜刚度.9、阻尼.12、precision8、pressure0；gravity9.8。无碰撞、自碰撞、层间碰撞或 CCD。仅静止腰 pin 固定；没有自由点位置重置、动画目标、力或冲量夹取。

## 有效质量先校准

先复现原4点冲量校准，通过，误差1.4712e-8m。再用**实际两层LoD拓扑**、相同总质量、同CW映射/构造重入/48 pins，关闭膜/阻尼/接触，以匹配 control 去共同重力。对全部576自由点施加 canonical N·s 冲量，每点预期位移.0002m，并逐点测量；96 pins不施冲量且记录control差。

- 外层配置总质量.08kg，kernel/Jolt均为 invMass=4000kg⁻¹，即自由点.00025kg；272自由点测试通过。
- 内层配置总质量.035kg，kernel/Jolt均为 invMass=10057.142857kg⁻¹，即自由点.000099431818kg；304自由点测试通过。
- 最大位移误差3.3193e-8m，反推 inverse-mass 最大相对误差0.0166%，在.05%允差内；pin差最大3.638e-12m。记录在 `reports/lod-mass-calibration.json`，含每个自由点结果。

这验证了 **N/M（计入 pins 后再将 pin invMass 置0）**，没有使用 N_free/M、没有暗用面积质量。上述是配置 total_mass；zero-mass pins 后动态自由点质量之和分别.068kg/.03022727kg，不应将配置总质量误称全部动态质量。

## 结果

预设有限数值门槛：所有点有限；每个 completed tick 每条三角边 rest ratio 在(.85,1.15)；waist误差<1e-5m；所有 implicit PCG 调用成功。它是诊断门槛，绝非衣料品质标准。采样tick0为初始态；1s为240 completed steps/241 metric rows，4s为960 steps/961 rows。每步实际绝对 edge min/max（米）、edge ratio min/max、waist误差、位移，以及每次 CG residual/iterations/kernel time 均在 `lod-jolt-240hz-{1,4}s.json` 的 `per_tick` 中，未用最终帧代替逐步检查。

4秒全程峰值如下（材料均值 ms 为该层单次 kernel，非整帧）：

| 组别 | edge/rest min–max | waist峰值 m | 位移峰值 m | kernel均值 ms | CG最大迭代 | 最大相对residual |
|---|---:|---:|---:|---:|---:|---:|
| outer_no_bending | 0.960244–1.044112 | 4.48e-07 | 0.211744 | 0.000000 | 0 | 0 |
| outer_implicit | 0.967730–1.034758 | 7.16e-07 | 0.263687 | 0.182588 | 9 | 7.97e-09 |
| lining_no_bending | 0.977370–1.024833 | 6.13e-07 | 0.178112 | 0.000000 | 0 | 0 |
| lining_implicit | 0.989998–1.011207 | 2.98e-07 | 0.148707 | 0.249915 | 16 | 1e-08 |

1秒两层材料合计平均.43014ms、p95 .591ms、max .753ms；4秒平均.43250ms、p95 .573ms、max3.236ms，960个双层材料样本全部低于240Hz的4.1667ms预算。原3104点冻结报告的两层材料均值6.36159ms；本机本次观测均值比约14.71倍。旧参考与新LoD点质量、拓扑不同，且旧harness还有额外grid，因此这只是计算成本/数值行为对照，不是受控全帧性能倍数。

整体四组、逐点逐边统计的 wall/sim：1s为1.643636s/1s（1.644），4s为6.532087s/4s（1.633）。该harness没有达到wall≤sim；包含四个body、膜、material、Godot回调及诊断遍历等成本，未剥离分析。**材料成本通过不能推出游戏240Hz实时，更不是全帧FPS。**

## 物理与验收边界

保留旧 uniform hinge k/c 与层总质量：外k=.00005、内k=.00007 J/rad²，c=.0000002 J·s/rad²。旧k没有continuum/网格收敛标定；低LoD改变了hinge数、几何、单点质量与有效响应。**相同k/c/总质量不构成物理材料等效。** 未做面积质量、物理材料重标定、120/480Hz或参数网格扫描。

输入kernel速度仍复用旧probe的 whole-tick `(x_now-x_previous)/dt`，首tick为0，并非Jolt最后子步的精确瞬时速度。边比有限与CG收敛只证明本固定边界/重力/无接触时段没有发生这些数值故障。外层最大位移.264m，本报告不把这一动态形态认作合格裙型。没有角色动画/碰撞、穿透与双层接触、渲染传递变形或真人视觉验收；不支持soft-soft/interlayer/CCD。

## 复现与证据

在本目录执行 `./run.ps1`：先两项质量校准，1秒门槛通过才执行4秒，最后汇总。脚本只调用既有exe/DLL，不构建。`reports/environment.json`记录CPU/引擎；`reports/summary.json`记录汇总/资产与DLL哈希；原始每步JSON及stdout已保留。计时具有系统负载波动，仅本机本次观测。
