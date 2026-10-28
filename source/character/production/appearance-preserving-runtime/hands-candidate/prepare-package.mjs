import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),runtime=path.resolve(here,'..');
const handRoot=path.resolve(runtime,'../appearance-preserving-body/retopology');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const packageBytes=fs.readFileSync(path.join(handRoot,'assets/selected-hand-v2.glb'));
const packageMeta=JSON.parse(fs.readFileSync(path.join(handRoot,'assets/selected-hand-v2.json')));
if(sha(packageBytes)!=='6ce8324dd001060e6eaf0aa60deda512a1a33d8d39fe534e797a614dfedc7c0f'||sha(packageBytes)!==packageMeta.sha256)throw Error('Unexpected hand package revision');
function parse(bytes){const length=bytes.readUInt32LE(12);return {json:JSON.parse(bytes.subarray(20,20+length)),binary:bytes.subarray(28+length)};}
const hand=parse(packageBytes),source=parse(fs.readFileSync(path.join(runtime,'assets/selected-appearance.glb')));
const motion=JSON.parse(fs.readFileSync(path.join(runtime,'assets/motion-rig.json')));
let maxNeutralTRSError=0;
for(const alias of Object.values(motion.aliases)){
 const a=source.json.nodes.find(n=>n.name===alias.name),b=hand.json.nodes.find(n=>n.name===alias.name);
 if(!a||!b)throw Error('Missing source body bone '+alias.name);
 for(const [key,defaultValue] of [['translation',[0,0,0]],['rotation',[0,0,0,1]],['scale',[1,1,1]]]){
  const av=a[key]??defaultValue,bv=b[key]??defaultValue;
  for(let i=0;i<av.length;i++)maxNeutralTRSError=Math.max(maxNeutralTRSError,Math.abs(av[i]-bv[i]));
 }
}
if(maxNeutralTRSError>1e-12)throw Error('Hand package changes original body neutral nodes');
let size=0;const chunks=[];
function append(bytes){const padding=(4-size%4)%4;if(padding){chunks.push(Buffer.alloc(padding));size+=padding;}const offset=size;chunks.push(bytes);size+=bytes.length;return {offset,bytes:bytes.length,sha256:sha(bytes)};}
function accessor(id){const a=hand.json.accessors[id],v=hand.json.bufferViews[a.bufferView];if(v.byteStride)throw Error('Unexpected interleaved accessor');return hand.binary.subarray((v.byteOffset??0)+(a.byteOffset??0),(v.byteOffset??0)+(a.byteOffset??0)+v.byteLength);}
const meshes=[];
for(const node of hand.json.nodes.filter(n=>n.mesh!==undefined)){
 const primitive=hand.json.meshes[node.mesh].primitives[0],skin=hand.json.skins[node.skin];
 const rawColors=accessor(primitive.attributes.COLOR_0),rgb=new Float32Array(rawColors.buffer,rawColors.byteOffset,rawColors.length/4),rgba=new Float32Array(rgb.length/3*4);
 for(let i=0;i<rgb.length/3;i++){rgba[i*4]=rgb[i*3];rgba[i*4+1]=rgb[i*3+1];rgba[i*4+2]=rgb[i*3+2];rgba[i*4+3]=1;}
 meshes.push({name:node.name,side:node.name.startsWith('left')?'left':'right',vertices:hand.json.accessors[primitive.attributes.POSITION].count,
  position:append(accessor(primitive.attributes.POSITION)),normal:append(accessor(primitive.attributes.NORMAL)),colorRGBA32F:append(Buffer.from(rgba.buffer)),
  joints:append(accessor(primitive.attributes.JOINTS_0)),weights:append(accessor(primitive.attributes.WEIGHTS_0)),indices:append(accessor(primitive.indices)),inverseBind:append(accessor(skin.inverseBindMatrices))});
}
const rawReference=fs.readFileSync(path.join(handRoot,'godot/hand-review.bin'));
const ref=JSON.parse(fs.readFileSync(path.join(handRoot,'godot/hand-review.json')));
const references=ref.states.map(s=>({side:s.side,grip:s.grip,opposition:s.opposition,positions:append(rawReference.subarray(s.positions.offset,s.positions.offset+s.positions.length))}));
const report={schema:'dafeiyu.selected-motion-hands-candidate.v1',packageSha256:packageMeta.sha256,sourceGLBSha256:motion.glbSha256,sourceBodyNeutralTRSMaxError:maxNeutralTRSError,bodyBones:22,fingerBones:30,boneTable:packageMeta.boneTable,driveContract:packageMeta.driveContract,rig:packageMeta.rig,meshes,references,
 source:'Original selected girl plus independently repaired hand v2 only',scale:'Same source units, inherited actor holder .35 metres/sourceunit; no new mesh offset',scope:'Independent integration candidate, not default character, physical grasp or final appearance acceptance'};
fs.mkdirSync(path.join(here,'assets'),{recursive:true});fs.mkdirSync(path.join(here,'reports'),{recursive:true});
fs.writeFileSync(path.join(here,'assets/hand-package.bin'),Buffer.concat(chunks));
fs.writeFileSync(path.join(here,'assets/hand-package.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({meshes:meshes.length,bodyBones:22,fingerBones:30,maxNeutralTRSError,bytes:size,packageSha256:packageMeta.sha256}));
