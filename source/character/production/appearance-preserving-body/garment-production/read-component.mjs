import fs from 'node:fs';
import crypto from 'node:crypto';
export function readComponent(){
  const component=JSON.parse(fs.readFileSync(new URL('./assets/component.json',import.meta.url),'utf8')),binary=fs.readFileSync(new URL('./assets/'+component.binary.file,import.meta.url)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
  if(sha(binary)!==component.binary.sha256||binary.length!==component.binary.bytes)throw Error('Component binary integrity mismatch');
  const arrays={};for(const[name,row]of Object.entries(component.arrays)){const bytes=binary.subarray(row.offset,row.offset+row.bytes);if(sha(bytes)!==row.sha256)throw Error('Component array mismatch '+name);const Constructor={float32:Float32Array,uint32:Uint32Array,uint16:Uint16Array}[row.type];if(!Constructor)throw Error('Unknown component type');const copy=Uint8Array.from(bytes);arrays[name]=new Constructor(copy.buffer);if(arrays[name].length!==row.count*row.itemSize)throw Error('Component count mismatch '+name);}
  return{component,arrays,get:name=>arrays[name]};
}
