import fs from 'node:fs';
import * as THREE from '../../../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter} from '../load-baseline.mjs';
import {installHollowSkirt} from './hollow-skirt.mjs';
const tex=(w,h)=>new THREE.Texture({width:w,height:h}),model=createStudyCharacter(tex(1920,1080),{garmentTexture:tex(1144,1375),turnaroundTexture:tex(2043,770)});model.update(0,0,{mode:'manual',framing:'full'});const made=installHollowSkirt(model);
function audit(){
  const faces=[],grid=new Map(),cell=.075;let vertexOffset=0;
  for(const[label,mesh]of[['outer',made.mesh],['lining',made.inner]]){
    mesh.skeleton.update();const g=mesh.geometry,positions=Array.from({length:g.attributes.position.count},(_,i)=>mesh.applyBoneTransform(i,new THREE.Vector3().fromBufferAttribute(g.attributes.position,i)).applyMatrix4(mesh.matrixWorld));
    for(let f=0;f<g.index.count/3;f++){
      const localIds=[g.index.getX(f*3),g.index.getX(f*3+1),g.index.getX(f*3+2)],ids=localIds.map(i=>i+vertexOffset),points=localIds.map(i=>positions[i]),box=new THREE.Box3().setFromPoints(points),index=faces.length;faces.push({label,localFace:f,ids,localIds,points,box});
      for(let x=Math.floor(box.min.x/cell);x<=Math.floor(box.max.x/cell);x++)for(let y=Math.floor(box.min.y/cell);y<=Math.floor(box.max.y/cell);y++)for(let z=Math.floor(box.min.z/cell);z<=Math.floor(box.max.z/cell);z++){const key=`${x}:${y}:${z}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(index);}
    }vertexOffset+=positions.length;
  }
  const seen=new Set(),ray=new THREE.Ray(),hit=new THREE.Vector3(),delta=new THREE.Vector3(),bary=new THREE.Vector3(),byType={outerSelf:0,liningSelf:0,betweenLayers:0},first=[];let tested=0;
  function cross(a,b){for(let k=0;k<3;k++){const origin=a.points[k],end=a.points[(k+1)%3];delta.copy(end).sub(origin);const length=delta.length();if(length<1e-9)continue;ray.set(origin,delta.multiplyScalar(1/length));if(!ray.intersectTriangle(...b.points,false,hit))continue;const d=hit.distanceTo(origin);if(d<1e-7||d>length-1e-7)continue;THREE.Triangle.getBarycoord(hit,...b.points,bary);if(Math.min(bary.x,bary.y,bary.z)>1e-5)return true;}return false;}
  for(const rows of grid.values())for(let a=0;a<rows.length;a++)for(let b=a+1;b<rows.length;b++){const i=Math.min(rows[a],rows[b]),j=Math.max(rows[a],rows[b]),key=i*faces.length+j;if(seen.has(key))continue;seen.add(key);const A=faces[i],B=faces[j];if(A.ids.some(id=>B.ids.includes(id))||!A.box.intersectsBox(B.box))continue;tested++;if(cross(A,B)||cross(B,A)){const type=A.label===B.label?(A.label==='outer'?'outerSelf':'liningSelf'):'betweenLayers';byType[type]++;if(first.length<30)first.push({type,labels:[A.label,B.label],faces:[A.localFace,B.localFace],vertexRows:[A.localIds.map(id=>Math.floor(id%2784/96)),B.localIds.map(id=>Math.floor(id%2784/96))],vertexCols:[A.localIds.map(id=>id%96),B.localIds.map(id=>id%96)]});}}
  return{testedCandidatePairs:tested,strictCrossings:byType,firstCrossings:first};
}
const states=[];for(const[name,t,state]of[['neutral',0,{mode:'manual',framing:'full'}],['source-walk',1.1,{mode:'manual',framing:'full',action:'walk'}]]){model.update(0,t,state);states.push({name,time:t,appliedPose:model.root.userData.appliedPose,...audit()});}
const report={schema:'dafeiyu.hollow-skirt.strict-crossing.v2',method:'Actual skinned sheets, strict non-adjacent segment/triangle interior intersections. Shared vertices, coplanar and tangential contacts excluded. Only these two garments; not body collision, swept collision or a continuous solver.',states,sampledStrictCrossingPass:states.every(s=>Object.values(s.strictCrossings).every(n=>n===0)),physicsPass:false};
fs.writeFileSync(new URL('./reports/intersection-diagnostic.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));made.dispose();model.dispose();if(!report.sampledStrictCrossingPass)process.exitCode=1;
