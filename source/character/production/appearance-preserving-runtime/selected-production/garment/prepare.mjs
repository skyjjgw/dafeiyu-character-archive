import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),runtime=path.resolve(here,'../..');
const source=path.resolve(runtime,'../appearance-preserving-body/garment-production/assets');
const kernel=path.resolve(runtime,'../native-character-nativephysics');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const expected={'component.json':'c01bed3bd202422e8ef28bb8b2e665e2f8c852ea3aa38f05bce38f42cf39319f','component.bin':'c9a08f0e12196337ffac10783036f2d5473eb53d379abf76a9b09044f88cf5a3'};
fs.mkdirSync(path.join(here,'assets'),{recursive:true});fs.mkdirSync(path.join(here,'kernel/bin'),{recursive:true});fs.mkdirSync(path.join(here,'reports'),{recursive:true});
for(const [name,sha]of Object.entries(expected)){const b=fs.readFileSync(path.join(source,name));if(hash(b)!==sha)throw Error('Garment component revision mismatch '+name);fs.writeFileSync(path.join(here,'assets',name),b);}
const dll=fs.readFileSync(path.join(kernel,'project/bin/native_cloth_bending.windows.release.x86_64.dll'));
if(hash(dll)!=='c9e850a5ad460636228870f71e87a0670db05503a8e45593864835784b032469')throw Error('Cloth material kernel revision mismatch');
fs.writeFileSync(path.join(here,'kernel/bin/native_cloth_bending.windows.release.x86_64.dll'),dll);
fs.copyFileSync(path.join(kernel,'project/bin/GODOT_CPP_LICENSE.md'),path.join(here,'kernel/bin/GODOT_CPP_LICENSE.md'));
fs.writeFileSync(path.join(here,'kernel/native_cloth_bending.gdextension'),'[configuration]\nentry_symbol = "cloth_bending_library_init"\ncompatibility_minimum = "4.7"\nreloadable = false\n[libraries]\nwindows.x86_64 = "res://selected-production/garment/kernel/bin/native_cloth_bending.windows.release.x86_64.dll"\n');
console.log(JSON.stringify({garment:expected,kernelSha256:hash(dll),sourceUnchanged:true}));
