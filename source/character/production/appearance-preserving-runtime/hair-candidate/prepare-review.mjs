import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const baseline=path.resolve(here,'../../appearance-baseline-20261027');
const manifest=JSON.parse(fs.readFileSync(path.join(baseline,'manifest.json')));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const visited=new Set(),records=[];
fs.mkdirSync(path.join(here,'runtime-source'),{recursive:true});
fs.mkdirSync(path.join(here,'reports'),{recursive:true});
function copy(name){
 if(visited.has(name))return;visited.add(name);
 const raw=fs.readFileSync(path.join(baseline,'source',name));
 const expected=manifest.sources.find(r=>r.snapshot==='source/'+name);
 if(!expected||sha(raw)!==expected.sha256)throw Error('Frozen source changed: '+name);
 const text=raw.toString().replace(/from\s+(['"])([^'"]+)\1/g,(all,q,spec)=>{
  if(spec.includes('three.module.js'))return 'from '+q+'../../../rig3d-prototype/vendor/three.module.js'+q;
  if(spec.startsWith('./'))copy(path.basename(spec));return all;
 });
 fs.writeFileSync(path.join(here,'runtime-source',name),text);
 records.push({name,sourceSha256:sha(raw),reviewSha256:sha(Buffer.from(text)),change:'Three import path only'});
}
copy('character.js');
fs.writeFileSync(path.join(here,'reports/review-source-hashes.json'),JSON.stringify({records},null,2)+'\n');
console.log(JSON.stringify({modules:records.length,sourceUntouched:true}));
