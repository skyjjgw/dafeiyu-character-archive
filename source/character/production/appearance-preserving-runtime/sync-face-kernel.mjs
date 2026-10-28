import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const source=path.resolve(root,'../appearance-preserving-face');
const manifest=JSON.parse(fs.readFileSync(path.join(source,'component-manifest.json')));
const expectedDLL='7f30f4bdc0b23f6c15a125880ff876e489bf14e305df1138cca16bf88f68b3ef';
if(manifest.runtimeFiles.find(f=>f.path.endsWith('.dll'))?.sha256!==expectedDLL)throw Error('Unreviewed kernel build: explicit re-review required');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const file of manifest.runtimeFiles){
  if(file.path.includes('..')||path.isAbsolute(file.path))throw Error('Invalid component path');
  const bytes=fs.readFileSync(path.join(source,'package/face-kernel',file.path));
  if(hash(bytes)!==file.sha256)throw Error('Component hash mismatch '+file.path);
  const destination=path.join(root,'face-kernel',file.path);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes);
  if(hash(fs.readFileSync(destination))!==file.sha256)throw Error('Copy hash mismatch');
}
fs.writeFileSync(path.join(root,'face-kernel/component-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({files:manifest.runtimeFiles.length,dllSha256:expectedDLL,sourceDefault:true,onlyIndependentMotionProject:true}));
