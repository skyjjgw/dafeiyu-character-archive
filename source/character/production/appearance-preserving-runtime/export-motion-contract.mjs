import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(root,'../..');
const source=path.join(project,'production/appearance-baseline-20261027/source');
const threeURL=pathToFileURL(path.join(project,'production/rig3d-prototype/vendor/three.module.js')).href;
const THREE=await import(threeURL),cache=new Map();
function mod(n){if(cache.has(n))return cache.get(n);const js=fs.readFileSync(path.join(source,n),'utf8').replace(/from\s+(['"])([^'"]+)\1/g,(_,q,s)=>'from '+JSON.stringify(s.includes('three.module.js')?threeURL:mod(path.basename(s))));const url='data:text/javascript;base64,'+Buffer.from(js).toString('base64');cache.set(n,url);return url;}
const {createStudyCharacter}=await import(mod('character.js'));
const c=createStudyCharacter(new THREE.Texture(),{garmentTexture:new THREE.Texture(),turnaroundTexture:new THREE.Texture()});
c.update(0,0,{mode:'manual',framing:'full',yaw:0,pitch:0,mood:'neutral'});c.root.updateMatrixWorld(true);
let skeleton;c.root.traverse(n=>{if(n.isSkinnedMesh)skeleton=n.skeleton;});
const aliases=Object.fromEntries(Object.entries(c.bones).map(([k,b])=>[k,{name:b.name,godotName:b.name.replace(/[.:@/"%?\\]/g,'_'),skinJointIndex:skeleton.bones.indexOf(b),localPosition:b.position.toArray(),neutralLocalQuaternion:b.quaternion.toArray(),neutralGlobal:b.matrixWorld.toArray(),inverseBind:skeleton.boneInverses[skeleton.bones.indexOf(b)].toArray()}]));
const shoes={};
for(const side of ['left','right']){
  const shoe=c.root.getObjectByName(side+' traced mary jane shoe'),bone=c.bones[side+'Foot'];
  const inverse=skeleton.boneInverses[skeleton.bones.indexOf(bone)],p=shoe.geometry.attributes.position,points=[];
  for(let i=0;i<p.count;i++)points.push(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(shoe.bindMatrix).applyMatrix4(inverse));
  const low=Math.min(...points.map(v=>v.y)),band=points.filter(v=>v.y<=low+1e-5),zs=band.map(v=>v.z).sort((a,b)=>a-b);
  const average=group=>group.reduce((v,p)=>v.add(p),new THREE.Vector3()).multiplyScalar(1/group.length).toArray();
  const heel=average(band.filter(v=>v.z<=zs[0]+1e-6));
  const toe=average(band.filter(v=>v.z>=zs.at(-1)-1e-6));
  shoes[side]={name:shoe.name,soleLocal:shoe.userData.soleLocal,heelLocal:heel,toeLocal:toe,soleMinimumY:low,sampleCount:band.length};
}
const out={schema:'dafeiyu.selected-motion-rig.v1',glbSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets/selected-appearance.glb'))).digest('hex'),source:'Frozen original selected character, not native art',metersPerSourceUnit:.35,modelLiftSourceUnits:1.055,aliases,shoes,head:{name:'head-control',localPosition:c.head.position.toArray(),neutralLocalQuaternion:c.head.quaternion.toArray(),neutralGlobal:c.head.matrixWorld.toArray()},limits:['22 body bones plus Head node; hands have one wrist bone each, no finger grip rig','Three original tail bones remain static until real dynamics are fitted','Existing skirt bones are not full cloth and remain static, no sine physics substitute']};
fs.writeFileSync(path.join(root,'assets/motion-rig.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({aliases:Object.keys(aliases),shoes,scale:out.metersPerSourceUnit},null,2));c.dispose();
