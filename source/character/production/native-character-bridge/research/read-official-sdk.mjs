// Read only official packaged SDK modules; never opens profile/config/key data.
import {openSync,readSync,closeSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const path='E:/zzz/dafeiyu-dsh-original/app/resources/app.asar';
const fd=openSync(path,'r'),head=Buffer.alloc(16);readSync(fd,head,0,16,0);
const size=head.readUInt32LE(12);if(size>64*1024*1024)throw Error('invalid_header');
const bytes=Buffer.alloc(size);readSync(fd,bytes,0,size,16);const root=JSON.parse(bytes.toString()),base=8+head.readUInt32LE(4);
function nodeAt(path){let n=root;for(const key of path.split('/'))n=n.files?.[key];if(!n)throw Error('missing_packaged_module');return n;}
function readMember(path){const n=nodeAt(path);if(n.unpacked||!Number.isSafeInteger(n.size)||n.size>16*1024*1024)throw Error('unsupported_member');const b=Buffer.alloc(n.size);readSync(fd,b,0,b.length,base+Number(n.offset));return b;}
const out=fileURLToPath(new URL('./packaged-sdk/',import.meta.url));
const selected=['@deepseek-ai/dsh-typert-protocol','@deepseek-ai/dsh-api-gateway','@deepseek-ai/dsh-api-remotes','@deepseek-ai/cordis'];const manifest=[];
for(const name of selected){for(const member of ['package.json','lib/index.js','lib/client.node.js']){
 const relative='dsh/node_modules/'+name+'/'+member;let b;try{b=readMember(relative);}catch{continue;}
 const dest=resolve(out,name,member);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,b);manifest.push({member:relative,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});
}}
const runtimePackages=['@deepseek-ai/cordis','@deepseek-ai/cosmokit','@deepseek-ai/schemastery','@deepseek-ai/dsh-typert-protocol','@deepseek-ai/dsh-typert-registry','@deepseek-ai/dsh-api-gateway','@deepseek-ai/dsh-api-remote-access','@deepseek-ai/dsh-deque','@deepseek-ai/dsh-timeout','@deepseek-ai/dsh-brand','ws','zod','@standard-schema/spec'];
let runtimeFiles=0;
for(const pkg of runtimePackages){
 const prefix='dsh/node_modules/'+pkg;
 function copy(node,relative=''){
  for(const[name,value]of Object.entries(node.files||{})){
   const next=relative?relative+'/'+name:name;
   if(value.files){copy(value,next);continue;}
   if(value.unpacked)continue;
   const dest=resolve(out,'node_modules',pkg,next),allowed=resolve(out,'node_modules',pkg);
   if(!dest.startsWith(allowed+'/')&&!dest.startsWith(allowed+'\\'))throw Error('invalid_member_path');
   mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,readMember(prefix+'/'+next));runtimeFiles++;
  }
 }
 copy(nodeAt(prefix));
}
closeSync(fd);writeFileSync(resolve(out,'manifest.json'),JSON.stringify({source:path,scope:'Selective read-only packaged public SDK modules, no REA evidence produced.',members:manifest,runtimePackages,runtimeFiles},null,2));
console.log(JSON.stringify({members:manifest,runtimeFiles,runtimePackages}));
