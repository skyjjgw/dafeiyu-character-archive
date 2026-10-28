import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {createHostPlugin} from '../dsh-host.mjs';
import {CharacterRunner} from '../runner.mjs';
import {SCHEMA} from '../protocol.mjs';
const base=new URL('../research/packaged-sdk/node_modules/',import.meta.url);
const sdk=await import(new URL('@deepseek-ai/dsh-typert-protocol/lib/index.js',base));
const {Context}=await import(new URL('@deepseek-ai/cordis/lib/index.js',base));
const {default:Registry}=await import(new URL('@deepseek-ai/dsh-typert-registry/lib/index.js',base));
const {default:RemoteAccess}=await import(new URL('@deepseek-ai/dsh-api-remote-access/lib/index.js',base));
const {default:Gateway}=await import(new URL('@deepseek-ai/dsh-api-gateway/lib/index.js',base));
const ctx=new Context();const controller=new AbortController();
// Explicit structural PeerScope for this in-process test, matching the exact
// public SDK contract. No browser carrier, credentials, account or port.
const peer={id:'dafeiyu-bridge-sdk-test',ctx,principal:{kind:'owner'},signal:controller.signal,interactions:'none',async dispose(){controller.abort();}};
const rows=[];let runner;
try {
 await ctx.plugin(Registry);await ctx.plugin(RemoteAccess);await ctx.plugin(Gateway,{});
 const Host=createHostPlugin(sdk,{runnerFactory:async()=>{runner=await CharacterRunner.start({profile:'protocol-test'});return runner;}});
 await ctx.plugin(Host);
 const markers=sdk.remoteMethods(ctx.get('dafeiyuCharacter'));assert.deepEqual(markers.map(m=>m.method),['start','state','behavior','stop']);rows.push({test:'official_Remote_markers_and_Cordis_service_registration',ok:true});
 const invoke=(method,args={})=>ctx.typertGateway.invoke({peer,namespace:'dafeiyuCharacter',method,args});
 assert.equal((await invoke('start')).running,true);rows.push({test:'actual_official_Gateway_dispatch_starts_real_pinned_engine',ok:true});
 const result=await invoke('state',{payload:{schema:SCHEMA,type:'character.state',connected:false,running:true,approvals:1,error:'synthetic raw detail'}});
 assert.equal(result.ok,true);assert.equal(result.accepted.state.error,'DSH 会话报告错误');rows.push({test:'real_Gateway_to_host_to_engine_ack_with_error_redaction',ok:true});
 for(const action of ['wave','pickup','release','cancel'])assert.equal((await invoke('behavior',{action})).accepted.action,action);
 rows.push({test:'four_behaviors_through_actual_official_Host_Gateway',ok:true});
 await assert.rejects(invoke('state',{payload:{schema:SCHEMA,type:'character.state',apiKey:'synthetic'}}),/unsupported_field/);
 await assert.rejects(invoke('behavior',{action:'shell'}),/unsupported_behavior/);rows.push({test:'host_validator_rejects_unknown_fields_and_behavior',ok:true});
 const externalPeer={...peer,id:'dafeiyu-non-owner-test',principal:{kind:'external-test'}};
 let refusal;try{await ctx.typertGateway.invoke({peer:externalPeer,namespace:'dafeiyuCharacter',method:'start',args:{}});}catch(error){refusal=error;}
 assert.ok(refusal);rows.push({test:'non_owner_rejected_by_real_Gateway_or_host_owner_fence',ok:true,observedCode:refusal.code??refusal.message});
 assert.equal((await invoke('stop')).running,false);assert.equal((await runner.exit).code,0);rows.push({test:'official_RPC_stop_cleans_real_child',ok:true});
}finally{await runner?.dispose();await peer.dispose();await ctx.fiber.dispose();}
await writeFile(new URL('../reports/sdk-verification.json',import.meta.url),JSON.stringify({time:new Date().toISOString(),sdk:'Isolated read-only copies from official installed app.asar, dsh-v0.2.1-rc.3 / Cordis4.0.5',network:'No HTTP/WebSocket listener created; real Gateway unary in-process dispatch with explicit test PeerScope.',rows,scope:'Actual SDK registration and Gateway→host→real-engine test, not installed DSH plugin or live authenticated user session.'},null,2)+'\n');
console.log(JSON.stringify({passed:rows.length,rows}));
