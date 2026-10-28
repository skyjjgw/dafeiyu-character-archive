import assert from 'node:assert/strict';
import {readFile,copyFile,writeFile} from 'node:fs/promises';
import {CharacterRunner,TRUSTED_PROFILES} from '../runner.mjs';
import {SCHEMA} from '../protocol.mjs';
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let runner,timer;const acknowledgements=[];
try{
 runner=await CharacterRunner.start({profile:'character-visible-capture'});
 console.log('VISIBLE_CHILD_READY '+JSON.stringify({pid:runner.child.pid,engine:runner.engineVersion}));
 const state=await runner.send({schema:SCHEMA,type:'character.state',connected:false,running:true,approvals:1,error:''});assert.equal(state.ok,true);acknowledgements.push({type:'state',ok:true});console.log('VISIBLE_STATE_ACK');
 for(const[action,pause]of [['wave',2100],['pickup',2400],['release',500],['cancel',500]]){
  const ack=await runner.send({schema:SCHEMA,type:'character.behavior',action});assert.equal(ack.ok,true);acknowledgements.push({type:'behavior',action,ok:true});console.log('VISIBLE_ACTION_ACK '+action);await delay(pause);
 }
 const idle=await runner.send({schema:SCHEMA,type:'character.state',connected:false,running:false,approvals:0,error:''});assert.equal(idle.ok,true);
 const ended=await Promise.race([runner.exit,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('visible_capture_exit_timeout')),45000);})]);clearTimeout(timer);assert.equal(ended.code,0);
 const project=TRUSTED_PROFILES['character-visible-capture'].project;
 const snapshot=JSON.parse(await readFile(project+'/reports/native-bridge-visible.json','utf8'));
 assert.equal(snapshot.headless,false);assert.equal(snapshot.asset_state,'ready');assert.equal(snapshot.dsh_state.connected,false);
 const events=snapshot.controller.events;
 assert.ok(events.some(e=>e.event==='action'&&e.name==='wave'));
 assert.ok(events.some(e=>e.event==='action'&&e.name==='pickup')||events.some(e=>e.event==='reach_rejected'));
 for(const reason of ['release','cancel'])assert.ok(events.some(e=>e.event==='interrupt'&&e.reason===reason));
 await copyFile(project+'/reports/native-bridge-visible.png',new URL('../reports/native-bridge-visible.png',import.meta.url));
 await copyFile(project+'/reports/native-bridge-visible.json',new URL('../reports/native-bridge-visible-snapshot.json',import.meta.url));
 const report={time:new Date().toISOString(),profile:runner.profile,pid:runner.child.pid,engine:runner.engineVersion,exit:ended,acknowledgements,actual_controller_events:events,performance:snapshot.performance,pickup_grasp_snapshot:snapshot.controller.grasp,stderr:runner.stderr,scope:'Actual visible official engine, real native scene/controller and GPU capture; DSH remains disconnected. Pickup request acknowledgement is not a claim of successful grasp.'};
 await writeFile(new URL('../reports/visible-verification.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 assert.equal(runner.stderr.includes('SCRIPT ERROR'),false,runner.stderr);assert.equal(runner.stderr.includes('Thread'),false,runner.stderr);
 console.log('VISIBLE_VERIFIED '+JSON.stringify({pid:runner.child.pid,exited:true,acknowledgements,events,performance:snapshot.performance}));
}catch(error){console.error('VISIBLE_FAILURE '+JSON.stringify({error:error.message,acknowledgements,stderr:runner?.stderr}));throw error;}finally{clearTimeout(timer);await runner?.dispose();}
