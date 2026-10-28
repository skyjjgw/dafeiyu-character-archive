# Structural v3 CPU 性能交接

冻结 DLL：`godot/bin/selected_structural_face_kernel.windows.release.x86_64.dll`，496,128 bytes，SHA256 `d25ce205577bd9f568808fdb8dc29c406ee1d5cc5375959c718e11f8459728f6`。三实现源码哈希与 `performance-summary.json` 一致；不再修改 Root package/adapter 或源 default。

实际 Three 24 组合 / 12,738,912 个 float 对照通过。position 最大差仍 `2.98023223876953e-8`、unequalBits 3939，与优化前相同；UV/RGBA 均 bits0，未放宽容差、未改造型。

最终同版三轮持续对照的联合随机表情帧（14–23）范围 **4.9933–7.4471ms**；全部24帧三轮最大分别7.818/6.3245/7.4471ms。它只测 CPU kernel，不含GPU上传、Jolt、画面与FPS。新建实例 cold first 另实测 **5.5929–20.6864ms**，不得写成所有初始化都低于8ms；建议在对外ready前完成冷初始化，冷峰原因未进一步扩大调查。

1个持久std worker＋调用线程执行不重叠dirty顶点chunk。Godot ptrw/Variant/Dictionary只在调用线程，两个depth memo lane互相独立，完成barrier后才发布。destructor唤醒并join。精确 state 依赖使 same-state changed全false，gaze-only仅两iris changed，talk不改眼buffer、blink不改口buffer。

并行8轮create/configure/reconfigure/dispose回归通过；最终同版串行fallback（`DFY_FACE_SERIAL=1`）8轮补签通过、worker_count全0、退出码0、stderr空。最终只读进程复核无 structural-v3 Godot 残进程。源 default 两DLL仍为原 `7f30f4bd…`，原CPP未改。

证据：`performance-summary.json`、`native-comparison.json`、`parity-parallel-{1,2,3}.json`、`cache-worker-regression-{parallel,serial}.json`。未跑ThreadSanitizer；并发边界已审查并通过重复原生精度/生命周期检查。最终GPU回读与整人体验由Root继续验证。
