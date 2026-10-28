import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCharacter,projectDshState,SCHEMA} from '../protocol.mjs';
test('projects real lifecycle without text, secrets, raw errors or fake speech',()=>{
 const projected=projectDshState({connected:true,session:{status:'running',messages:[{reasoning:'private'}],error:'not-forwarded'},approvals:[{}],apiKey:'synthetic-not-a-secret'});
 assert.deepEqual(projected,{schema:SCHEMA,type:'character.state',connected:true,running:true,approvals:1,error:'DSH 会话报告错误'});
 assert.equal(JSON.stringify(projected).includes('not-forwarded'),false);
 assert.equal('speaking'in projected,false);
});
test('character field and action vocabulary is closed',()=>{
 for(const field of ['apiKey','account','speech','text','shell','path','sessionId'])assert.throws(()=>validateCharacter({schema:SCHEMA,type:'character.state',[field]:'synthetic'}),/unsupported_field/);
 for(const action of ['wave','pickup','release','cancel'])assert.equal(validateCharacter({schema:SCHEMA,type:'character.behavior',action}).action,action);
 assert.throws(()=>validateCharacter({schema:SCHEMA,type:'character.behavior',action:'shell'}),/unsupported_behavior/);
});
test('strict bounds and JSON types',()=>{
 for(const approvals of [-1,1.25,10001,NaN,Infinity,'1',true])assert.throws(()=>validateCharacter({schema:SCHEMA,type:'character.state',approvals}),/invalid_approvals/);
 assert.throws(()=>validateCharacter({schema:SCHEMA,type:'character.state',error:'x'.repeat(201)}),/invalid_error/);
 assert.throws(()=>validateCharacter({schema:SCHEMA,type:'character.state',running:1}),/invalid_state/);
 assert.throws(()=>validateCharacter([]),/invalid_payload/);
});
