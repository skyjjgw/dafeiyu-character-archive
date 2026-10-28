import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter} from '../../animation-look-study/character.js';
import {addSourceFingerRig} from '../finger-rig.mjs';
import {installRetopologizedHands} from './hand.mjs';
import fs from 'node:fs';
const texture=(w,h)=>new THREE.Texture({width:w,height:h});
const model=createStudyCharacter(texture(1920,1080),{garmentTexture:texture(1144,1375),turnaroundTexture:texture(2043,770)});model.update(0,0,{mode:'manual',mood:'neutral',framing:'full'});
const rig=addSourceFingerRig(model),replace=installRetopologizedHands(rig);
function audit(side,grip){
  rig.setPose(side,{grip,opposition:grip*.4});
  const mesh=rig.hands[side],g=mesh.geometry,vertices=Array.from({length:g.attributes.position.count},(_,i)=>mesh.applyBoneTransform(i,new THREE.Vector3().fromBufferAttribute(g.attributes.position,i)));
  const faces=[],grid=new Map(),cell=.012;
  for(let f=0;f<g.index.count/3;f++){
    const ids=[g.index.getX(f*3),g.index.getX(f*3+1),g.index.getX(f*3+2)],points=ids.map(i=>vertices[i]);
    const box=new THREE.Box3().setFromPoints(points);faces.push({ids,points,box});
    for(let x=Math.floor(box.min.x/cell);x<=Math.floor(box.max.x/cell);x++)for(let y=Math.floor(box.min.y/cell);y<=Math.floor(box.max.y/cell);y++)for(let z=Math.floor(box.min.z/cell);z<=Math.floor(box.max.z/cell);z++){
      const key=`${x}:${y}:${z}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(f);
    }
  }
  const pairs=new Set(),hit=new THREE.Vector3(),ray=new THREE.Ray(),bary=new THREE.Vector3(),delta=new THREE.Vector3();
  const crossings=[];let tested=0;
  function crosses(a,b){
    for(let e=0;e<3;e++){
      const origin=a.points[e],end=a.points[(e+1)%3];delta.copy(end).sub(origin);const length=delta.length();if(length<1e-10)continue;
      ray.set(origin,delta.multiplyScalar(1/length));
      if(!ray.intersectTriangle(...b.points,false,hit))continue;
      const distance=hit.distanceTo(origin);if(distance<1e-7||distance>length-1e-7)continue;
      THREE.Triangle.getBarycoord(hit,...b.points,bary);
      if(Math.min(bary.x,bary.y,bary.z)>1e-5)return true;
    }
    return false;
  }
  for(const rows of grid.values())for(let a=0;a<rows.length;a++)for(let b=a+1;b<rows.length;b++){
    const i=Math.min(rows[a],rows[b]),j=Math.max(rows[a],rows[b]),key=i*faces.length+j;if(pairs.has(key))continue;pairs.add(key);
    const A=faces[i],B=faces[j];if(A.ids.some(v=>B.ids.includes(v))||!A.box.intersectsBox(B.box))continue;tested++;
    if(crosses(A,B)||crosses(B,A))crossings.push({faces:[i,j],digits:[A.ids.map(v=>g.attributes.fingerParam.getX(v)),B.ids.map(v=>g.attributes.fingerParam.getX(v))]});
  }
  return {side,grip,opposition:grip*.4,testedCandidatePairs:tested,strictTriangleCrossings:crossings.length,firstCrossings:crossings.slice(0,30)};
}
const quick=process.argv.includes('--quick'),samples=quick?[0,.55,1]:[0,.05,.10,.15,.20,.25,.30,.35,.40,.45,.50,.55,.8,1];
const report={schema:'dafeiyu.hand-strict-crossing-diagnostic.v2',method:'Uniform spatial bins + strict segment/triangle interior intersections; shared-vertex pairs, coplanar and tangential contacts excluded. Diagnostic, not a complete contact or collision proof.',states:(quick?['left']:['left','right']).flatMap(side=>samples.map(grip=>audit(side,grip)))};
report.sampledStrictCrossingPass=report.states.every(s=>s.strictTriangleCrossings===0);
fs.writeFileSync(new URL('./reports/intersection-diagnostic.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));replace.dispose();rig.dispose();model.dispose();
if(!report.sampledStrictCrossingPass)process.exitCode=1;
