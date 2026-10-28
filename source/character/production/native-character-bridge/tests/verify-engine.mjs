import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {CharacterRunner,TRUSTED_ENGINE,verifyTrustedEngine,trustedArguments,prepareChildEnvironment} from '../runner.mjs';
import {PREFIX,SCHEMA} from '../protocol.mjs';
const rows=[];const deadline=(p,ms=5000)=>{let t;return Promise.race([p,new Promise((_,reject)=>{t=setTimeout(()=>reject(new Error('test_timeout')),ms);})]).finally(()=>clearTimeout(t));};
let runner;
try {
 runner=await CharacterRunner.start();
 assert.match(runner.engineVersion,/4\.7\.2/);rows.push({test:'official_engine_ready',ok:true,version:runner.engineVersion});
 const state={schema:SCHEMA,type:'character.state',connected:true,running:true,approvals:2,error:''};
 const ack=await runner.send(state);assert.equal(ack.ok,true);assert.deepEqual(ack.accepted.state,{connected:true,running:true,approvals:2,error:''});rows.push({test:'state_round_trip_and_integer_normalization',ok:true});
 for(const action of ['wave','pickup','release','cancel']){const ack=await runner.send({schema:SCHEMA,type:'character.behavior',action});assert.equal(ack.accepted.action,action);}
 rows.push({test:'four_whitelisted_behavior_round_trips',ok:true});
 assert.throws(()=>runner.send({...state,account:'synthetic'}),/unsupported_field/);rows.push({test:'parent_rejects_unknown_fields',ok:true});
 const exited=await runner.dispose();assert.equal(exited.code,0);await runner.dispose();rows.push({test:'graceful_and_idempotent_dispose',ok:true});
 await assert.rejects(runner.send(state),/engine_closed/);
} finally {await runner?.dispose();}

// Adversarial child-side inputs bypass the Node validator only in this test.
const executable=await verifyTrustedEngine();
const child=spawn(executable,trustedArguments(),{shell:false,windowsHide:true,cwd:TRUSTED_ENGINE.project,stdio:['pipe','pipe','pipe'],env:await prepareChildEnvironment()});
const replies=[];const waiters=[];let text='';let stderr='';
child.stderr.on('data',b=>{stderr=(stderr+b.toString()).slice(-4096);});
child.stdout.on('data',b=>{text+=b.toString();let at;while((at=text.indexOf('\n'))>=0){const line=text.slice(0,at).replace(/\r$/,'');text=text.slice(at+1);if(line.startsWith(PREFIX)){const value=JSON.parse(line.slice(PREFIX.length));replies.push(value);for(const notify of waiters.splice(0))notify();}}});
const exit=new Promise(resolve=>child.once('close',(code,signal)=>resolve({code,signal})));
async function until(predicate){for(;;){const found=replies.find(predicate);if(found)return found;await deadline(new Promise(resolve=>waiters.push(resolve)));}}
function send(id,payload){child.stdin.write(PREFIX+JSON.stringify({id,payload})+'\n');}
try {
 await until(r=>r.event==='ready');
 const invalid=[{schema:SCHEMA,type:'character.state',apiKey:'synthetic'}, {schema:SCHEMA,type:'character.state',running:1},{schema:SCHEMA,type:'character.state',approvals:1.5},{schema:SCHEMA,type:'character.behavior',action:'shell'}];
 for(let i=0;i<invalid.length;i++){send(i+1,invalid[i]);const ack=await until(r=>r.id===i+1);assert.equal(ack.ok,false);}
 rows.push({test:'native_rejects_credential_field_wrong_boolean_fractional_count_and_shell_action',ok:true});
 child.stdin.write('x'.repeat(4200)+'\n');await until(r=>r.event==='rejected'&&r.error==='line_too_long');
 send(9,{schema:SCHEMA,type:'character.state',connected:false});assert.equal((await until(r=>r.id===9)).ok,true);rows.push({test:'overlong_line_dropped_and_next_frame_recovers',ok:true});
 for(let id=100;id<135;id++)send(id,{schema:SCHEMA,type:'character.state',connected:true});
 await until(r=>r.id===134);assert.ok(replies.some(r=>r.error==='rate_limited'));rows.push({test:'native_message_rate_is_bounded',ok:true});
 child.stdin.end(PREFIX+'{"id":999');const ended=await deadline(exit);assert.equal(ended.code,0);assert.ok(replies.some(r=>r.error==='truncated_line'));rows.push({test:'EOF_mid_frame_rejected_thread_joined_and_process_exits',ok:true});
 assert.equal(stderr.includes('SCRIPT ERROR'),false,stderr);assert.equal(stderr.includes('Thread'),false,stderr);
} finally {if(child.exitCode===null)child.kill();await deadline(exit).catch(()=>{});}
await writeFile(new URL('../reports/engine-verification.json',import.meta.url),JSON.stringify({time:new Date().toISOString(),engine:TRUSTED_ENGINE,transport:'parent-child prefixed JSONL stdio, no listening port',rows,scope:'Real official engine and real GDScript transport; probe receiver, not installed DSH or final rendered behavior.'},null,2)+'\n');
console.log(JSON.stringify({passed:rows.length,rows}));
