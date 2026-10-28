# 大肥鱼当前整合版（制作中）

入口 `current.tscn`，版本 `0.1.5-current`。这是持续完善的同一个人物运行版本，
**不是最终人物验收通过**。它保留用户选择的 4348 原少女，把已有连续表情、身体动作、
结构头 v3、连续头饰、五束连续头发、独立手指、较合理的招呼与真实 Jolt 蓝尾连接到同一 controller。头发与头饰目前随 Head 刚性连接，尚无头发/布料物理。旧 `motion.tscn` 和 4348
原版仍保留对照，不回退到已被否定的通用 native 新造型。

```powershell
node ./selected-production/build-manifest.mjs
./selected-production/Run-Current.ps1
./selected-production/Run-Current.ps1 -HeadlessCheck
./selected-production/Run-Current.ps1 -TailCheck
./selected-production/Run-Current.ps1 -Capture
```

`component-manifest.json` 启动前校验当前八组件的 50 个文件 SHA/大小。依赖不匹配会失败，
不能偷偷载入旧造型。当前 active：原外观/body22、source-default face18、本地手 v2、
原尾巴 Jolt、current host、结构头 v3、连续头饰、连续五束头发。source-default face18
保留为原面部对照；双层裙布和头发次级物理仍为 reserved，未实际加载到默认 current。
continuous hair 是静态结构改善，不能当 hairPhysics=true。

手指、移动、转身、相机和动作队列/中断沿同一控制器。当前 remote action 接口只有
state / wave / cancel；移动、转身、视角、手指也可在本地操作。pickup/release 明确返回
`character_action_not_available`，没有真实抓握约束就不能 ack 成功。talk 没有音频时为 0。

## 稳定宿主接口

- `is_character_ready()`：全部 required components 已验证且实际加载后才 true。
- `get_character_capabilities()` / `snapshot()`：实际能力与组件状态；final_accepted=false。
- `character_action(action,payload)`：真实状态/动作/中断及明确不支持的动作。
- `replace_source_face(adapter,HeadLocalModel,contract,handle)`：真实结构头组件接入，持有 factory renderer 生命周期。
- `load_headband()` / `restore_headband()`：只隐藏/恢复准确七个原头饰网格。
- `load_hair()` / `restore_hair()`：只隐藏/恢复准确十五个原发束网格。

结构头替换契约：`id=continuous-head-v3`、`headLocal=true`、
`files[{path:'res://...',bytes,sha256}]`，以及可选 `replacesSourceGroupName=painted-face`。
新 adapter 必须先配置完成并有 `update(state)->{ok}`、`snapshot()`、`dispose()`。
宿主先验证文件/局部 identity/首次 update，再 dispose 恢复旧 source 面，隐藏旧 face group，
把新 model 挂 `actor.rig.head` **一次**。继承的唯一 render update 调新 adapter，避免旧新
面部双更新或 Head 变换重复。`restore_source_face()` 可以销毁替换件并回原 source18。
实际 v3 独立 kernel/adapter 已接入，新 roles20–24 与 depth cage 使用对应新方程，
没有把 v3 GLB 直接喂旧 C++。当前独立 DLL SHA 为
`d25ce205577bd9f568808fdb8dc29c406ee1d5cc5375959c718e11f8459728f6`。
卸载先断开唯一面部回调，再 dispose adapter/factory，避免已销毁内核在下一帧继续被调用。
头饰与头发 factory 的 commit 只在文件/identity/接口验证后执行；restore/exit 都幂等释放，
不释放宿主的原图纹理。底部提供原面部、原头饰、原头发和原手对照。

`reports/lifecycle-check.json` 的 20 项检查覆盖实际 state/wave/cancel、拒绝未支持抓取、
头/头饰/头发安装与原版恢复、真实骨映射、pause/resume。暂停时 Jolt bodies 保留在世界中，
次级力更新停止，不因 always-process UI 在后台继续累积；恢复后更新继续。

## 原蓝尾的真实次级运动

三段原 tailBase / tailMid / tailTip 骨对应三只 Jolt RigidBody3D。Generic6DOF 限平移、
有界角弹簧连到骨盆边界；重力比例 1。自由刚体由引擎积分，不按动画帧硬写位置，不使用
正弦摆尾。原顶点、蒙皮、UV、材质和蓝色保留，渲染只把实际物理朝向传给原骨，原骨长
保持。凸体碰撞代理来自原 tail 三网格的主导权重点；它们是近似，不是精确变形三角碰撞。

16 秒 `tail-check.json` 的十项检查通过：有真实重力响应、施加一次真实 impulse、同一
controller 移动和转身、测试物体接触、有限状态、关节/渲染耦合误差和原网格蒙皮响应。
探针是测试专用，在实际末段 collider 下方放置，没有把自由尾巴移动到接触点。

实际采样：探针接触计数 3412、受探针限制的尾端下落约 5.06 mm，同时间解算端点最大差
.153 mm，渲染/刚体的一 tick 最大差 1.162 mm；原 skin 在 actor 局部采样最大变形约
10.30 cm。人工统一尺度 `.35m/source unit` 并非官方角色身高或材料测量。

数值修复保留在 `reports/tail-initialization-incident.json`：最初锚点 Node 已在骨盆，但
server 在原点，创建 joint 后发生巨大启动冲击。改为锚点 transform 在 enter-tree 前设置，
保证正确物理 frame；没有把坏瞬态略过再报合格。另将关节误差在更新本 tick 边界前测量，
避免拿未来 anchor 与前一解算时刻 body 相比。渲染的一 tick 相差另列，未藏入关节误差。

headless 没有 GPU 注册的 skin，不能使用 `bake_mesh_from_current_skeleton_pose` 冒充渲染。
headless 检查明确用实际 ArrayMesh 索引/权重、Skin IBM 和解算骨矩阵；真 GPU capture
在 `frame_post_draw` 后另取实际 skin bake。

## 实际画面与未完成项

已实际查看 `reports/current-front-greeting.png`、`current-front-step.png` 和
`current-turn-actual-side.png`：原少女身份、蓝尾颜色和较合理的掌朝外招呼保留，尾巴
受重力与动作影响。当前五束连续头发减少原发卷裂隙，但衣服/腿/鞋的 90° 仍严重平层，
头饰侧白条、眼睑边/temple 接缝、推定发束背面与尾茎/鳍衔接也待精修。
不能将 controller 或物理检查的 pass 当作视频参考质量、完整解剖或自然表演已完成。

最新 10.667 秒实际 GPU capture 包含 greeting/step/turn/cancel 和原头发恢复/重装，
`reports/gpu-capture.json` 记录真实切换结果；两套侧视图分别为
`current-original-hair-side.png` / `current-current-hair-side.png`。**没有作帧率或性能验收**。
真实 GPU 图用于结构、材质和绑定检查，截图/热加载时间不应当作干净帧率采样。
此前另一组尾巴 capture 与头饰约 2.7 秒短捕可能重叠，该历史记录仍非性能证明。

尾巴 self-contact、连续变形接触和裙布耦合尚未完成；头发动态与双层裙布继续进行。
`garment/` 独立接线检查修复了 Jolt mesh/physics pin ID 不一致，但当前显式弯曲细网格
出现高节点力/高应变，真实失败保留，未接默认 current。详见该目录 README；不得将
192 腰 pin 稳定或全部点有限当作布料合格。碰撞代理和材料参数均须进一步实际检查。

Godot 4.7 官方资料：[SoftBody3D 设置与物理插值边界](https://docs.godotengine.org/en/4.7/tutorials/physics/soft_body.html)、
[Jolt 运行设置读取](https://raw.githubusercontent.com/godotengine/godot/4.7/modules/jolt_physics/jolt_project_settings.cpp)。
