# 空心分层裙 v2 收口（2026-10-28）

根因、实际结构和限制见 README。原 v1/失败图继续保留，本轮未替换 4348/default/source/retopology。

实际代码 authority：`hollow-skirt.mjs`。原前画与前侧外壳 XY/UV 保留；背侧垂褶为推定，原22身体骨不动。外裙/内衬各有内外表面及窄布边，腰/hem中心腔开放，无实体中心盘。原服饰身份不重做。

通过的有限证据：`reports/structure-check.json`（两层genus1、边界0/非流形0、中心射线无盖、body22矩阵0）；`reports/intersection-diagnostic.json`（neutral和原walk一采样的两层自身/相互strict交叉0）。这些不是连续碰撞或cloth引擎认证。

实际图审范围：Root CUA 与 agent 读图只覆盖完整正面、隔离裙左90°。`reports/visual-review-root-20261028.json` 记录 limited_structural_improvement、frontIdentityRetained=true、final_quality=false、physicsPass=false。右侧、背视和其他动作未通过实际图审。实际前投影有1,355像素RGB差>1、207alpha轮廓差，不能称完全不变。

仍未达到的目标：侧摆自然度、前画/侧背色过渡、原插画俯视投影的全身固定相机一致标定、衣料/身体/头发/尾巴接触与真实布料材料和积分。后续仍以原girl为外观基准，不能为了结构重新换generic造型。

本轮按root指示停止扩新版本，未跑新的GPU helper、未改默认窗口、DSH或其他系统配置。
