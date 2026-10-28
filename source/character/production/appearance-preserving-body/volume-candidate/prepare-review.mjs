import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url)),baseline=path.resolve(dir,'../../appearance-baseline-20261027'),manifest=JSON.parse(fs.readFileSync(path.join(baseline,'manifest.json'))),seen=new Set();
fs.mkdirSync(path.join(dir,'runtime-source'),{recursive:true});
function copy(name){if(seen.has(name))return;seen.add(name);const bytes=fs.readFileSync(path.join(baseline,'source',name)),expected=manifest.sources.find(r=>path.basename(r.snapshot)===name)?.sha256;if(crypto.createHash('sha256').update(bytes).digest('hex')!==expected)throw Error('Frozen source mismatch '+name);const js=bytes.toString('utf8').replace(/from\s+(['"])([^'"]+)\1/g,(_,q,s)=>{if(s.includes('three.module.js'))return "from '../../../rig3d-prototype/vendor/three.module.js'";copy(path.basename(s));return 'from '+JSON.stringify('./'+path.basename(s));});fs.writeFileSync(path.join(dir,'runtime-source',name),js);}
copy('character.js');console.log(JSON.stringify({frozenModules:[...seen],sourceUntouched:true}));
