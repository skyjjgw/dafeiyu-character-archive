import {CharacterRunner} from './runner.mjs';
const baseline=process.argv.includes('--baseline');
const action=process.argv.slice(2).filter(value=>value!=='--baseline')[0];
if(action&&!['wave','cancel'].includes(action))throw new Error('此版已选人物尚未接入抓握；当前可用 wave / cancel');
const runner=await CharacterRunner.start({profile:baseline?'selected-character':'selected-current'});
const stop=()=>{runner.dispose().catch(()=>{process.exitCode=1;});};
process.once('SIGINT',stop);process.once('SIGTERM',stop);
try{
 await runner.send({schema:'dafeiyu.character.v1',type:'character.state',connected:false,running:false,approvals:0,error:''});
 if(action)await runner.send({schema:'dafeiyu.character.v1',type:'character.behavior',action});
 console.log('原生角色已打开；DSH 未连接。关闭角色窗口会回收子进程。');
 const exit=await runner.exit;if(exit.code!==0)process.exitCode=1;
}finally{process.removeListener('SIGINT',stop);process.removeListener('SIGTERM',stop);await runner.dispose();}
