# 大肥鱼原生角色本地桥

当前默认入口为 `selected-current`：`npm start` / Host service 加载
`appearance-preserving-runtime/selected-production/current.tscn`，先通过整合组件
完整性/ready 检查，再接有限 stdio 消息。`npm run verify:selected` 是该版本的
headless 控制检查；`npm run verify:visible` 使用同一当前版本实际 GPU。
`npm run start:baseline` 与 `npm run verify:baseline` 保留原样传递人物对照。
当前制作版仍有明确未完成的外观、碰撞与能力项，不能将启动/ack 当成最终验收。
新收据以 `selected-current-*` 命名，不覆盖原对照和旧造型的历史证据。

2026-10-28 当前整合版实际 GPU 联调已通过 ready、招手、中断和未支持抓取拒绝，
收据为 `reports/selected-current-visible-verification.json`，实际画面为
`reports/selected-current-bridge-wave.png`。它使用已选人物、新头部结构、头饰、
独立手指及真实 Jolt 尾部；不表示完整动作、各角度外观或整帧60FPS通过。
当前只支持 `wave` / `cancel`，`pickup` / `release` 会实际拒绝。
本地联调不表示已连接用户安装的 DSH。`godot/selected_entry.gd` 包裹当前场景，
不加载被否定的通用新人物。

下文 `native-character-runtime-next` 可见测试和三 profile 描述是历史记录，
该新造型已被用户否定。旧 `character-visible*` 仅保留复现旧证据，显式入口改为
`npm run verify:legacy-visible`；它不是当前默认人物或质量认可。现有九个固定 profile
继续校验官方 exe SHA，不接受任意项目/脚本路径或额外启动参数。

独立实现父子进程 IPC、DSH 会话事实投影和官方 Host RPC 服务。没有创建 HTTP/WebSocket 监听器，没有读取模型密钥、账号文件或用户 DSH 配置；没有安装或修改现有 DSH 插件。DSH 的实际安装仍未连接到角色。

已经验证的链路要分开理解：

- 当前：官方 Godot 4.7.2 + `selected-production/current.tscn`：当前组件检查、状态投影、真实招手/中断、未支持抓取拒绝、GPU 截图及合作退出。
- 历史：`native-character-runtime-next` 主场景的 controller 与 GPU 研究证据。该人物外观已被否定，不作为当前验收。
- 从本机官方 `app.asar` 只读复制的 SDK：真实 Cordis / Typert Gateway / Registry / RemoteAccess → 本项目 Host service → 官方 Godot 子进程。该测试使用显式的内存测试 PeerScope，没有加载用户的 DSH profile 或真实会话。

## 运行和收据

```powershell
npm test
npm run verify:engine
npm run verify:sdk
# 先与引擎/根任务协调独占 GPU；这项会打开真实窗口并自动截图退出。
npm run verify:visible
# 交互打开，DSH 未连接；可追加一个白名单动作，例如 npm start -- wave。
npm start
```

SDK 测试需要本机研究副本；可通过 `node research/read-official-sdk.mjs` 从固定安装路径的 ASAR 重新只读抽取公开 SDK。它不执行已安装 DSH，也不读取 profile。普通 `npm test` 不启动 GPU。

当前收据：`reports/selected-current-headless-verification.json`、`reports/selected-current-visible-verification.json` 和 `reports/selected-current-bridge-visible.json`。
引擎和SDK收据为 `reports/engine-verification.json`、`reports/sdk-verification.json`。`visible-verification.json` 与 `native-bridge-visible*` 是旧造型的历史记录。

当前截图明确显示“本地消息联调 · 实际 DSH 尚未接入”。收到动作 ack 表示消息校验并交给 controller，不代表复杂动作目标已成功。旧造型测试中的取杯距离和杯子状态不属于当前人物的已实现能力。

## Node 与 Godot 接口

```js
import {CharacterRunner} from './runner.mjs';
const character = await CharacterRunner.start({profile:'selected-current'});
await character.send({schema:'dafeiyu.character.v1',type:'character.state',connected:false,running:false,approvals:0,error:''});
await character.send({schema:'dafeiyu.character.v1',type:'character.behavior',action:'wave'});
await character.dispose();
```

固定启动 profile 共九个：`protocol-test`；当前整合版 `selected-current`、`selected-current-headless`、`selected-current-capture`；原人物传递基准 `selected-character`、`selected-character-headless`、`selected-character-capture`；历史研究 `character-visible`、`character-visible-capture`。不接受 exe、project、shell 或任意参数输入。官方 exe 的路径和 SHA-256 固定并在每次启动前验证，使用 `spawn(...,{shell:false})`。

子进程的 APPDATA、LOCALAPPDATA、USERPROFILE、HOME、TEMP、TMP 都指向项目 `.runtime-user/`；PATH 只保留 Windows System32。没有继承宿主的模型密钥环境变量，没有删除先前的 Godot 日志。这是受限消息边界，不是 Godot 的操作系统沙箱。

消息格式为 `@DAFEIYU/1 {"id":1,"payload":{...}}` 加换行。行长 4096 bytes、每秒 30 条、Node 至多 32 个在途请求、Godot 至多 64 行排队。普通引擎日志不会被识别为协议。支持的角色字段与当前 `character_protocol.gd` 一致：

- state：`connected` / `running` 布尔值，`approvals` 整数 0..10000，`error` 最多 200 字符。
- behavior：`wave` / `pickup` / `release` / `cancel`。

没有文本朗读、speaking、音素、工具参数、账号或密钥通道。`running` 可以表示思考或执行；它不会触发假说话口型。DSH 的原始错误文本会被投影成固定提示。

`godot/stdio_transport.gd` 在工作线程按 1 byte 读取有界 stdin，再用 Mutex 队列将完整行交给主线程。JSON 数字进入 Godot 后为 float；仅精确整数 `approvals` 会归一成 int，再经过原角色白名单校验。receiver 必须在主线程调用。引擎任务已独立把该 transport 接到真实场景的 `main.receive_character_message`，仅在 `--character-stdio` 下启用。

父进程关闭 stdin 后，reader 收到 EOF、主线程 `wait_to_finish()`，再退出。窗口关闭及自带 capture 通过 `closing` 通知父进程关管道，不直接在阻塞线程存活时退出。Node 有超时回收兜底。初次冷 GPU 帧曾超过原 3 秒 ack 界限；visible profile 现在用 15 秒启动阶段响应界限，测试成功，但这不等于冷启动性能问题已经解决。引擎任务正在把 ready 推迟到可响应首帧。

## 已核实的 DSH 接入路径

本机分发包的真实成员：

```text
app/resources/app.asar
  dsh/node_modules/@deepseek-ai/dsh-typert-protocol/lib/index.js
  dsh/node_modules/@deepseek-ai/dsh-api-gateway/lib/index.js
  dsh/node_modules/@deepseek-ai/cordis/lib/index.js
```

版本分别为 `0.2.1-rc.3`、`0.2.1-rc.3`、`4.0.5`。选中成员的哈希在 `research/packaged-sdk/manifest.json`。研究副本没有加载 `home/profiles/desktop`。技能建议的 REA 6.6.0 在当前 npm 返回 ETARGET，所以没有 REA Evidence；本项目记录的是普通只读 ASAR 成员提取、官方同 tag 源码和实际 SDK 执行结果。

`dsh-host.mjs` 使用真正的 `TypertRemoteService` + 官方 `Remote` 标记，注册 Cordis key / RPC namespace `dafeiyuCharacter`，方法为 `start()`、`state(payload)`、`behavior(action)`、`stop()`。JavaScript 显式应用标准 decorator context，避免猜测装饰器私有字段。服务沿用官方 Gateway 与其权限判断，另检查 `ctx.invocation.peer.principal`；实际 non-owner 测试返回 `remote-access/denied`，没有注册任何放行策略。每次 state/behavior 都再次本地校验。

现有 `E:/zzz/dafeiyu-dsh-panel/src/dsh-adapter.cjs` 已公开 `subscribe(listener)`，且快照中确有 `connected`、当前 session `status`、`approvals`、`error`。最小接法是在已有 `src/client.cjs` 创建 adapter 后调用：

```js
const link = await connectDshProjection({adapter, connection:ctx.connection});
// 组件卸载时 await link.dispose(); 当前 apply/effect 需处理异步初始化竞态。
```

`dsh-client.mjs` 只取生命周期事实，150 ms 合并一次，不传 session id、聊天、reasoning、工具输入或模型配置。它调用已有认证 Connection 的真实接口：

```js
ctx.connection.rpc.call('/api','dafeiyuCharacter/state',{args:{payload:projected}})
```

此签名直接来自官方 `dsh-api-gateway/src/client/index.ts` 的 unary 调用实现；Host Gateway 支持新 namespace 的保守 SRC Remote 发现模式，实际本地 SDK 测试已走该路由。没有猜一个不存在的 `ctx.rpc.register`。`host-entry.mjs` 可作为 Host 插件入口，或现有 `src/host.mjs` 的 apply 中注册该 service；原 systemPrompt guidance 应继续保留。

下一次获准接入现有安装时，需要处理插件包对官方 SDK peer dependency 的实际解析、将 client helper 打入现有客户端 factory、注册 Host service，并用真实会话快照验证连接/运行/审批变化。当前尚未执行这些安装步骤；已有 standalone SDK 测试不能代替这项验收。

## 官方依据

- [Godot OS stdin 管道阻塞与 Windows 支持](https://docs.godotengine.org/en/stable/classes/class_os.html#class-os-method-read-buffer-from-stdin)
- [Godot 4.7 Thread 的同步与 join](https://docs.godotengine.org/en/4.7/classes/class_thread.html)
- [Godot 4.7.2 官方版本](https://godotengine.org/download/archive/4.7.2-stable/)
- [DSH Gateway 契约，同 tag](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-rc.3/packages/api/gateway/README.md)
- [DSH 官方 client unary 实现](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-rc.3/packages/api/gateway/src/client/index.ts)
- [DSH Typert Remote 注册实现](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-rc.3/packages/typert/protocol/src/index.ts)
