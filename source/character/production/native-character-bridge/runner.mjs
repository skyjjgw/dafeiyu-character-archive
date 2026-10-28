import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {realpath,mkdir} from 'node:fs/promises';
import {EventEmitter} from 'node:events';
import {fileURLToPath} from 'node:url';
import {PREFIX,MAX_LINE_BYTES,validateCharacter} from './protocol.mjs';
const LAUNCH_CAPABILITY = Symbol('verified-launch');

export const TRUSTED_ENGINE = Object.freeze({
  executable:fileURLToPath(new URL('../../tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64.exe',import.meta.url)),
  sha256:'ab1824f85bfd8e0e4128182c000c4003a3e042245b2967848d089b2a04b22424',
  project:fileURLToPath(new URL('./godot/',import.meta.url)),
});
async function hashFile(path) {
  const hash=createHash('sha256');for await(const chunk of createReadStream(path)) hash.update(chunk);return hash.digest('hex');
}
export async function verifyTrustedEngine() {
  const actual=await realpath(TRUSTED_ENGINE.executable);
  if(actual.toLowerCase()!==TRUSTED_ENGINE.executable.toLowerCase() || await hashFile(actual)!==TRUSTED_ENGINE.sha256) throw new Error('engine_identity_mismatch');
  return actual;
}
export const TRUSTED_PROFILES=Object.freeze({
  'protocol-test':Object.freeze({project:TRUSTED_ENGINE.project,headless:true}),
  'selected-character':Object.freeze({project:fileURLToPath(new URL('../appearance-preserving-runtime/',import.meta.url)),script:fileURLToPath(new URL('./godot/selected_entry.gd',import.meta.url)),headless:false}),
  'selected-character-headless':Object.freeze({project:fileURLToPath(new URL('../appearance-preserving-runtime/',import.meta.url)),script:fileURLToPath(new URL('./godot/selected_entry.gd',import.meta.url)),headless:true}),
  'selected-character-capture':Object.freeze({project:fileURLToPath(new URL('../appearance-preserving-runtime/',import.meta.url)),script:fileURLToPath(new URL('./godot/selected_entry.gd',import.meta.url)),headless:false,capture:true}),
  'selected-current':Object.freeze({project:fileURLToPath(new URL('../appearance-preserving-runtime/',import.meta.url)),script:fileURLToPath(new URL('./godot/selected_entry.gd',import.meta.url)),headless:false,current:true}),
  'selected-current-headless':Object.freeze({project:fileURLToPath(new URL('../appearance-preserving-runtime/',import.meta.url)),script:fileURLToPath(new URL('./godot/selected_entry.gd',import.meta.url)),headless:true,current:true}),
  'selected-current-capture':Object.freeze({project:fileURLToPath(new URL('../appearance-preserving-runtime/',import.meta.url)),script:fileURLToPath(new URL('./godot/selected_entry.gd',import.meta.url)),headless:false,current:true,capture:true}),
  // Historical renderer evidence only. Public startup uses selected-character.
  'character-visible':Object.freeze({project:fileURLToPath(new URL('../native-character-runtime-next/',import.meta.url)),headless:false}),
  'character-visible-capture':Object.freeze({project:fileURLToPath(new URL('../native-character-runtime-next/',import.meta.url)),headless:false}),
});
export function trustedArguments(profile='protocol-test') {
  if(!Object.hasOwn(TRUSTED_PROFILES,profile))throw new Error('unsupported_launch_profile');
  const spec=TRUSTED_PROFILES[profile];
  if(spec.script){const userArgs=[...(spec.current?['--selected-current']:[]),...(spec.capture?['--selected-bridge-capture']:[])];return [...(spec.headless?['--headless']:[]),'--path',spec.project,'--rendering-method','gl_compatibility','--resolution','1100x850','--max-fps','60',...(spec.capture?['--position','-2000,-1500']:[]),'--script',spec.script,...(userArgs.length?['--',...userArgs]:[])];}
  return [...(spec.headless?['--headless']:[]),'--path',spec.project,...(profile!=='protocol-test'?['--','--character-stdio']:[]),...(profile==='character-visible-capture'?['--capture','res://reports/native-bridge-visible.png','--frames','540']:[])];
}
export async function prepareChildEnvironment() {
  const base=fileURLToPath(new URL('./.runtime-user/',import.meta.url));
  const paths=Object.fromEntries(['roaming','local','home','temp'].map(name=>[name,base+name]));
  await Promise.all(Object.values(paths).map(path=>mkdir(path,{recursive:true})));
  const env={};for(const key of ['SystemRoot','WINDIR']) if(process.env[key]) env[key]=process.env[key];
  Object.assign(env,{APPDATA:paths.roaming,LOCALAPPDATA:paths.local,USERPROFILE:paths.home,HOME:paths.home,TEMP:paths.temp,TMP:paths.temp});
  env.PATH=`${process.env.SystemRoot || 'C:\\Windows'}\\System32`;
  return env;
}

/** Owns precisely one pinned official Godot child; no shell or public socket. */
export class CharacterRunner extends EventEmitter {
  static async start(options={}) {
    if(!options||Object.keys(options).some(key=>key!=='profile'))throw new Error('unsupported_launch_options');
    const profile=options.profile??'protocol-test';trustedArguments(profile);
    const executable=await verifyTrustedEngine();
    const env=await prepareChildEnvironment();
    const runner=new CharacterRunner(executable,LAUNCH_CAPABILITY,{profile,env});
    try { await runner.ready;return runner; } catch(error) {await runner.dispose();throw error;}
  }
  constructor(executable,capability,{profile,env}={}) {
    super();
    if(capability!==LAUNCH_CAPABILITY||executable!==TRUSTED_ENGINE.executable) throw new Error('untrusted_executable');
    this.pending=new Map();this.sequence=0;this.closed=false;this.closing=false;this.windowStart=performance.now();this.windowCount=0;this.stderr='';this.output=Buffer.allocUnsafe(MAX_LINE_BYTES);this.outputLength=0;this.dropping=false;
    this.ready=new Promise((resolve,reject)=>{this.readyResolve=resolve;this.readyReject=reject;});
    this.readyTimer=setTimeout(()=>{this.readyReject(new Error('engine_ready_timeout'));this.child.kill();},profile==='protocol-test'?10000:30000);
    this.profile=profile;
    this.child=spawn(executable,trustedArguments(profile),{shell:false,windowsHide:true,cwd:TRUSTED_PROFILES[profile].project,stdio:['pipe','pipe','pipe'],env});
    this.exit=new Promise(resolve=>this.exitResolve=resolve);
    this.child.stdout.on('data',chunk=>this.readOutput(chunk));
    this.child.stderr.on('data',chunk=>{this.stderr=(this.stderr+chunk.toString('utf8')).slice(-4096);});
    this.child.stdin.on('error',()=>{ /* exit/timeout rejects requests without leaking payload */ });
    this.child.on('error',()=>{clearTimeout(this.readyTimer);this.readyReject(new Error('engine_spawn_failed'));});
    this.child.on('close',(code,signal)=>{
      this.closed=true;clearTimeout(this.readyTimer);this.readyReject(new Error('engine_closed_before_ready'));
      for(const {reject,timer}of this.pending.values()){clearTimeout(timer);reject(new Error('engine_closed'));}this.pending.clear();
      process.removeListener('exit',this.onParentExit);this.exitResolve({code,signal});this.emit('closed',{code,signal});
    });
    this.onParentExit=()=>{if(!this.closed)this.child.kill();};process.once('exit',this.onParentExit);
  }
  readOutput(chunk) {
    for(const byte of chunk) {
      if(byte===10) {
        if(!this.dropping) this.readLine(this.output.toString('utf8',0,this.outputLength).replace(/\r$/,''));
        this.outputLength=0;this.dropping=false;
      } else if(!this.dropping) {
        if(this.outputLength>=MAX_LINE_BYTES){this.outputLength=0;this.dropping=true;}
        else this.output[this.outputLength++]=byte;
      }
    }
  }
  readLine(line) {
    if(!line.startsWith(PREFIX))return; // Engine banner/logs never become protocol.
    let message;try{message=JSON.parse(line.slice(PREFIX.length));}catch{return;}
    if(!message||typeof message!=='object'||Array.isArray(message))return;
    if(message.event==='ready'&&message.protocol==='dafeiyu.ipc.v1') {
      clearTimeout(this.readyTimer);this.engineVersion=String(message.engine);this.readyResolve(message);this.emit('ready',message);return;
    }
    if(message.event==='closing') {this.closing=true;this.child.stdin.end();return;}
    if(Number.isSafeInteger(message.id)&&typeof message.ok==='boolean') {
      const request=this.pending.get(message.id);if(!request)return;
      this.pending.delete(message.id);clearTimeout(request.timer);request.resolve(message);
    } else if(['rejected','closed','fatal'].includes(message.event)) this.emit('notice',message);
  }
  send(payload) {
    const safe=validateCharacter(payload);
    if(this.closed||this.closing) return Promise.reject(new Error('engine_closed'));
    const now=performance.now();if(now-this.windowStart>=1000){this.windowStart=now;this.windowCount=0;}
    if(++this.windowCount>30)throw new Error('rate_limited');
    return this.write(safe);
  }
  write(payload) {
    if(this.pending.size>=32)throw new Error('too_many_pending');
    const id=++this.sequence;const line=PREFIX+JSON.stringify({id,payload})+'\n';
    if(Buffer.byteLength(line)>MAX_LINE_BYTES)throw new Error('line_too_long');
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('engine_response_timeout'));},this.profile==='protocol-test'?3000:15000);
      this.pending.set(id,{resolve,reject,timer});
      this.child.stdin.write(line,error=>{if(error){this.pending.delete(id);clearTimeout(timer);reject(new Error('engine_stdin_closed'));}});
    });
  }
  async dispose() {
    if(this.closed)return this.exit;
    if(!this.closing){this.closing=true;try{this.child.stdin.end(PREFIX+JSON.stringify({id:++this.sequence,payload:{schema:'dafeiyu.ipc.v1',type:'bridge.close'}})+'\n');}catch{this.child.kill();}}
    let timer;await Promise.race([this.exit,new Promise(resolve=>{timer=setTimeout(()=>{this.child.kill();resolve();},1500);})]);clearTimeout(timer);
    if(!this.closed){let forced;await Promise.race([this.exit,new Promise(resolve=>{forced=setTimeout(resolve,1500);})]);clearTimeout(forced);}
    if(!this.closed)throw new Error('engine_termination_failed');
    return this.exit;
  }
}
