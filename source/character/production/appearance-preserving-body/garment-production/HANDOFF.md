# 稳定裙布组件交接

数据已冻结交 selected_motion_hair/runtime 接真实 Jolt：`assets/component.json` SHA `c01bed3bd202422e8ef28bb8b2e665e2f8c852ea3aa38f05bce38f42cf39319f`，`component.bin` SHA `c9a08f0e12196337ffac10783036f2d5473eb53d379abf76a9b09044f88cf5a3`。

完整合同、物理边界与复现见 README。3104低solver点→11136薄壳render点，两层腰各96完全固定；自由点不设pose目标。source22保留，bind与neutralRoot严格分开，.35与lift1.055只转一次。实际probe及NumPy reference已过材料接口，不代表Jolt/画面通过。

Root 静态 CUA 审核入口 `/production/appearance-preserving-body/garment-production/?compare=1`。该页数据真实但物理不动；后续由 native 接当前真实solver点。尚无本生产组件的最终视觉批准或连续接触验收，不可把此前 v2 limited improvement 直接升级为本组件已通过。

本轮原girl脸型、发型、比例与maid身份继续锁定；不修改原source/默认4348/手retopology。Native缺失接口应明标unsupported，不可用静态壳或皮肤摆动代替真实cloth。
