独立研究组件已冻结；**不接 current、不替换原 helper，不算裙物理完成**。

- 类：`SelectedImplicitClothBending`；加载 `component/selected_implicit_cloth.gdextension`。DLL 与 API/证据 SHA 见 `reports/delivery.json`。
- 真实能量梯度方向正确，旧爆炸主要来自极小节点质量下的显式刚度/阻尼；中性网格稳定必要条件指标下界38.97/51.27，要求<4。
- 新全局质量感知隐式材料步输出 canonical N*s 冲量，dt 已含一次；无位置写入、姿态目标、力/冲量截断。对 pins invMass0，pin 反力另记。
- 八组数学对照、独立有限差分、真实 Jolt 单冲量单位校准、八次生命周期/失败恢复均通过。
- 完整两层240Hz4秒不再旧式爆炸，但原刚度撑形不足，材料计算6.36ms/步已超4.17ms总预算；k×10可把衬裙位移压到10.3mm但耗时12.58ms/步，外裙仍未过。120Hz边长诊断失败，保留证据。
- 速度来自整 tick 位移平均，非 Jolt 最后子步实际速度。SPD/线性化能量不等于完整引擎能量稳定；无软软/自碰接触。
- 已复用官方Jolt固定seed10×10几何/质量/pins做4秒真实backend对照；未跑官方Dihedral/Distance solver本体，未冒称原样例全过。
- 建议下一条成熟统一XPBD/原生solver路线，把膜、弯曲和自/层间/身体接触放入同一子步。现有原画壳层和低网格provider可保留复用。

所有测试为独立CPU/headless，无GPU；原4348、C adapter/default、头三文件与头DLL保持冻结。详见 README 与 reports/summary.json。
