import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {CharacterRunner} from '../runner.mjs';
import {SCHEMA} from '../protocol.mjs';

const capture=process.argv.includes('--capture');
const current=process.argv.includes('--current');
const prefix=current?'selected-current':'selected';
const profile=current?(capture?'selected-current-capture':'selected-current-headless'):(capture?'selected-character-capture':'selected-character-headless');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let runner,timer;
const rows=[];
try{
  runner=await CharacterRunner.start({profile});
  rows.push({test:'selected_scene_ready',ok:true});
  assert.equal((await runner.send({schema:SCHEMA,type:'character.state',connected:false,running:true,approvals:1,error:''})).ok,true);
  assert.equal((await runner.send({schema:SCHEMA,type:'character.behavior',action:'wave'})).ok,true);
  await delay(1400);
  assert.equal((await runner.send({schema:SCHEMA,type:'character.behavior',action:'cancel'})).ok,true);
  for(const action of ['pickup','release'])assert.equal((await runner.send({schema:SCHEMA,type:'character.behavior',action})).ok,false);
  rows.push({test:'real_wave_cancel_and_unsupported_grasp_rejection',ok:true});
  if(capture){
    const ended=await Promise.race([runner.exit,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('selected_capture_timeout')),20000);})]);
    clearTimeout(timer);assert.equal(ended.code,0);
    const snapshot=JSON.parse(await readFile(new URL(`../reports/${current?'selected-current':'selected'}-bridge-visible.json`,import.meta.url),'utf8'));
    assert.equal(snapshot.selected_appearance,true);assert.equal(snapshot.headless,false);
    assert.equal(snapshot.scene.face_kernel_connected,true);
    assert.equal(snapshot.state.connected,false);
    assert.ok(snapshot.scene.actor.events.some(row=>row.event==='wave_requested'));
    assert.ok(snapshot.scene.actor.events.some(row=>row.event==='cancel'&&row.reason===(current?'character_action_cancel':'bridge_cancel')));
    if(current){assert.equal(snapshot.current_integration,true);assert.equal(snapshot.scene.components.all_required_loaded,true);}
    rows.push({test:'actual_selected_renderer_and_controller_evidence',ok:true});
  }else{
    assert.equal((await runner.dispose()).code,0);
  }
  assert.equal(runner.stderr.includes('SCRIPT ERROR'),false,runner.stderr);
  assert.equal(runner.stderr.includes('ERROR:'),false,runner.stderr);
  await writeFile(new URL(`../reports/${prefix}-${capture?'visible':'headless'}-verification.json`,import.meta.url),JSON.stringify({time:new Date().toISOString(),profile,rows,stderr:runner.stderr,scope:capture?'Selected original appearance, actual GPU and controller. Not installed DSH, grasping or final character acceptance.':'Actual selected scene and bounded IPC, headless only. No GPU, appearance or final physics acceptance.'},null,2)+'\n');
  console.log(JSON.stringify({profile,passed:rows.length,rows}));
}finally{clearTimeout(timer);await runner?.dispose();}
