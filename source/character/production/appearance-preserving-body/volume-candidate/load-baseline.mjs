import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const directory=path.dirname(fileURLToPath(import.meta.url)),baseline=path.resolve(directory,'../../appearance-baseline-20261027');
const manifest=JSON.parse(fs.readFileSync(path.join(baseline,'manifest.json'),'utf8'));
const three=pathToFileURL(path.resolve(directory,'../../rig3d-prototype/vendor/three.module.js')).href;
const cache=new Map();
function moduleURL(name){
  if(cache.has(name))return cache.get(name);
  const file=path.join(baseline,'source',name),bytes=fs.readFileSync(file),expected=manifest.sources.find(r=>path.basename(r.snapshot)===name)?.sha256;
  if(!expected||crypto.createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Frozen source mismatch '+name);
  const js=bytes.toString('utf8').replace(/from\s+(['"])([^'"]+)\1/g,(_,q,s)=>'from '+JSON.stringify(s.includes('three.module.js')?three:moduleURL(path.basename(s))));
  const url='data:text/javascript;base64,'+Buffer.from(js).toString('base64');cache.set(name,url);return url;
}
export const {createStudyCharacter}=await import(moduleURL('character.js'));
