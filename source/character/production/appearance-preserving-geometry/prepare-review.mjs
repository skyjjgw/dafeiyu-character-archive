import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const directory=path.dirname(fileURLToPath(import.meta.url));
const baseline=path.resolve(directory,'../appearance-baseline-20261027');
const manifest=JSON.parse(fs.readFileSync(path.join(baseline,'manifest.json'),'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const records=[],visited=new Set();
fs.mkdirSync(path.join(directory,'runtime-source'),{recursive:true});
function copy(name){
 if(visited.has(name))return;visited.add(name);
 const origin=path.join(baseline,'source',name),bytes=fs.readFileSync(origin),record=manifest.sources.find(r=>r.snapshot==='source/'+name);
 if(!record||sha(bytes)!==record.sha256)throw Error('Frozen source hash mismatch '+name);
 let text=bytes.toString('utf8');
 text=text.replace(/from\s+(['"])([^'"]+)\1/g,(all,quote,specifier)=>{
  if(specifier.includes('three.module.js'))return 'from '+quote+'../../rig3d-prototype/vendor/three.module.js'+quote;
  if(specifier.startsWith('./'))copy(path.basename(specifier));return all;
 });
 const output=path.join(directory,'runtime-source',name);fs.writeFileSync(output,text);
 records.push({name,sourceSha256:sha(bytes),reviewSha256:sha(Buffer.from(text)),difference:'Only the Three import path is adapted for the independent review directory; all character equations are untouched.'});
}
copy('character.js');
fs.writeFileSync(path.join(directory,'assets/review-source-hashes.json'),JSON.stringify({schema:'dafeiyu.independent-source-review.v1',records},null,2)+'\n');
console.log(JSON.stringify({modules:records.length,sourceUntouched:true}));
