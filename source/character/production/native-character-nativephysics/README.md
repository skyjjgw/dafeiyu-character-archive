# NativeClothBending 独立技术组件

这是保留的材料力计算技术资产。用户已否定此前的新 native 角色美术，本组件不表示任何角色外观获认可，也没有接入、修改或晋升角色 renderer / GLB / DSH。

## 已交付

- `src/cloth_bending.hpp/.cpp`、`src/register_types.cpp`：完整 C++ 源码。
- `project/bin/native_cloth_bending.windows.release.x86_64.dll`：用本机现成官方 MSVC 编译，未使用第三方预编译 helper。
- `project/native_cloth_bending.gdextension`：Godot 4.7 Win64 加载描述。
- `reports/native-bending-verification.json`：实际官方 4.7.2 headless ABI、数值对照与尺度 benchmark。
- `generate_reference.py` / `project/verify.gd`：可复验的 NumPy + 有限差分参考与实际引擎测试。

依赖官方 `godotengine/godot-cpp` tag `10.0.0-stable`，commit `507ed9d840c01a3c5b2a39af8bb4000bfac30bf5`。Godot-cpp 10.x 与 Godot 版本独立；本项目 API 由本机官方 **4.7.2** 实际 `--dump-extension-api` 提供，header 声明 single precision。DLL 内部材料计算用 double，Godot Vector3 边界用官方 single。第三方 MIT 许可随 DLL 放在 `project/bin/GODOT_CPP_LICENSE.md`。

## API

```gdscript
var library = load("res://native_cloth_bending.gdextension")
var bending = ClassDB.instantiate("NativeClothBending") # RefCounted
var setup: Dictionary = bending.configure(rest, triangles, 0.0006, 0.000025, 0.0015)
assert(setup.ok)
var result: Dictionary = bending.evaluate(world_positions, sample_dt)
if result.ok:
    cached_forces = result.forces
```

`rest` / `world_positions` 为 PackedVector3Array，`triangles` 为扁平 PackedInt32Array。configure 缓存**实际三角形邻接的所有内边**与有符号 rest dihedral；没有根据规则网格跨尾孔连接，也不做降采样。rest 可以在模型空间、current 在世界空间，因为角度模型对平移/转动客观不变；实际放置或重设采样后可调用 `reset_history()`。

`evaluate(positions,sample_dt)` 返回：

| 字段 | 含义 |
|---|---|
| `ok` / `error` | 校验结果；失败时 forces 为空，调用方应停止施加过期缓存力 |
| `forces` | 每点累加的材料力，单位 N；**从不积分或写入点位置** |
| `energy` | 沿参考实现的未限幅二次弹性能诊断，单位 J；不是限幅力矩的积分势能 |
| `max_force` | 最大单 hinge 力贡献，沿用原 GDScript 的 metric |
| `max_nodal_force` | 累加后的最大点力 |
| `hinge_count` | 缓存的真实有效内边数 |
| `skipped_degenerate_hinges` | 当前样本中退化且未施加力的 hinge 数 |
| `net_force_double` / `net_torque_double` | double 累加后的守恒诊断，经 Vector3 边界返回 |

另有 `get_metadata()` 和 `reset_history()`。材料参数单位为 stiffness J/rad²、damping J·s/rad²、moment_limit N·m。计算采用当前有符号 dihedral 的解析梯度，力矩为 `clamp(k*wrap(theta-theta0)+c*rate,-limit,limit)`，力为 `-moment*gradient`。

首个样本没有历史，阻尼速度设零；第二次起使用 `(current-previous)/sample_dt`。`sample_dt<=0`、非有限参数/点、计数不匹配、非法索引/重复三角顶点/非流形边/相邻面方向错误都会拒绝，失败不推进采样历史。退化当前 hinge 产生零力并报告，不输出 NaN/Inf。极端超出 single 边界的力或诊断也拒绝。

## 调用方接线边界

建议 Jolt 继续 240 Hz 接触/积分，材料约 60 Hz 读取真实物理点并调用 evaluate。在两次材料评估之间零阶保持同一份缓存力，每个物理 tick 调用 `SoftBody3D.apply_force`。完整 waist pins 的力由边界约束承担，调用方可以跳过给 pinned 点施力；不要把返回 forces 当作位移，也不要把 rest 当作自由点硬目标。

本组件没有重力、点积分、碰撞、自碰撞、位置投影或裙摆姿势目标。这些仍属于 Jolt / 宿主。尚未做 renderer 中的长时间实际接触 stress，本地数值/benchmark 不代表整体布料已验收。

## 实际验证

复制已有 `skirt-physics-cage-v4.json` 仅作技术 fixture：schema2，1296 点、2432 三角形、**3567 个真实共享内边**、162 条边界、0 个 rest 退化 hinge。未加载或输出该角色美术。

- 300 个随机物理尺度 hinge，各连续评估两态（含阻尼），对独立 NumPy 参考最大力分量差约 `4.03e-10 N`。
- 独立有限差分能量→力最大差约 `6.08e-13`；double 合力/力矩接近数值零。
- schema2 两个真实全量形变态最大力差约 `2.78e-11 N`。
- 实际官方 Godot headless 跨 GDExtension 的 1000 次全量评估：最终一次均值约 **0.393 ms**，10 批均值约 0.362–0.442 ms。
- 通过真实 ABI 加载、RefCounted 注册、刚性平移/旋转 rest 不变性、输入不改写及无效值拒绝。

Benchmark 只测材料计算及 Godot 数组/字典边界，不包含 Jolt、GPU、读取物理点或逐点 apply_force，也不保证其他机器同样速度。

## 构建与复验

本机已有 VS18 Community MSVC 19.50.35723、Windows SDK 10.0.26100、内置 CMake 4.1.1 / Ninja、Anaconda Python；未安装编译器、未修改系统 PATH。`build.cmd` 只在子进程通过 vcvars64 设置环境。

```powershell
./build.cmd
python generate_reference.py
& '../../tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64_console.exe' --headless --path './project' --script 'res://verify.gd'
```

godot-cpp 仓库保持原官方 commit 未修改；build profile 仅启用 RefCounted 及其构建必需的 OS 包装，调用接口由实际 4.7.2 API 生成。其他 Godot 精度/平台需要重建与复验。

官方依据：[godot-cpp 的独立版本与 custom API](https://github.com/godotengine/godot-cpp)、[Godot 4.7 GDExtension 系统](https://docs.godotengine.org/en/4.7/engine_details/engine_api/gdextension/index.html)。
