import {projectDshState} from './protocol.mjs';

/** Attach to createDshAdapter(...).subscribe from the existing panel. The
 * existing authenticated Connection RPC is reused; no token enters this code. */
export async function connectDshProjection({adapter,connection,onError=()=>{}}) {
  if(typeof adapter?.subscribe!=='function'||typeof connection?.rpc?.call!=='function')throw new Error('missing_official_dsh_services');
  const call=async(method,args)=>{
    const result=await connection.rpc.call('/api','dafeiyuCharacter/'+method,{args});
    if(!result||result.ok!==true)throw new Error('character_rpc_failed');
    return result.value;
  };
  await call('start',{});
  let latest,lastSent='',timer=null,inFlight=false,disposed=false;
  const schedule=()=>{if(!timer&&!disposed)timer=setTimeout(flush,150);};
  async function flush(){
    timer=null;if(disposed||inFlight||!latest)return;
    const signature=JSON.stringify(latest);if(signature===lastSent)return;
    inFlight=true;
    try{await call('state',{payload:latest});lastSent=signature;}catch{if(!disposed)onError('character_state_unavailable');}
    finally{inFlight=false;if(!disposed&&JSON.stringify(latest)!==lastSent)schedule();}
  }
  const unsubscribe=adapter.subscribe(snapshot=>{latest=projectDshState(snapshot);schedule();});
  return {
    async behavior(action){if(disposed)throw new Error('character_projection_disposed');if(!['wave','pickup','release','cancel'].includes(action))throw new Error('unsupported_behavior');return call('behavior',{action});},
    async dispose(){if(disposed)return;disposed=true;clearTimeout(timer);unsubscribe();await call('stop',{});},
  };
}
