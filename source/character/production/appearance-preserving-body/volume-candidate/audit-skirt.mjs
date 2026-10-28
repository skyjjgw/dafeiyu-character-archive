import fs from 'node:fs';
import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter} from './load-baseline.mjs';
import {installSkirtVolume} from './skirt-volume.mjs';
const tex=(w,h)=>new THREE.Texture({width:w,height:h});
const make=()=>createStudyCharacter(tex(1920,1080),{garmentTexture:tex(1144,1375),turnaroundTexture:tex(2043,770)});
const source=make(),candidate=make();for(const m of[source,candidate])m.update(0,0,{mode:'manual',mood:'neutral',framing:'full'});
const installed=installSkirtVolume(candidate);let oldMesh;source.root.traverse(o=>{if(o.name===installed.mesh.name)oldMesh=o;});
function audit(mesh){
  mesh.skeleton.update();const g=mesh.geometry,positions=Array.from({length:g.attributes.position.count},(_,i)=>mesh.applyBoneTransform(i,new THREE.Vector3().fromBufferAttribute(g.attributes.position,i))),faces=[],grid=new Map(),cell=.09;
  for(let f=0;f<g.index.count/3;f++){
    const ids=[g.index.getX(f*3),g.index.getX(f*3+1),g.index.getX(f*3+2)],points=ids.map(id=>positions[id]),box=new THREE.Box3().setFromPoints(points);faces.push({ids,points,box});
    for(let x=Math.floor(box.min.x/cell);x<=Math.floor(box.max.x/cell);x++)for(let y=Math.floor(box.min.y/cell);y<=Math.floor(box.max.y/cell);y++)for(let z=Math.floor(box.min.z/cell);z<=Math.floor(box.max.z/cell);z++){const k=`${x}:${y}:${z}`;if(!grid.has(k))grid.set(k,[]);grid.get(k).push(f);}
  }
  const seen=new Set(),ray=new THREE.Ray(),hit=new THREE.Vector3(),delta=new THREE.Vector3(),bary=new THREE.Vector3();let tested=0,count=0;const first=[];
  function crossing(a,b){for(let i=0;i<3;i++){const origin=a.points[i],end=a.points[(i+1)%3];delta.copy(end).sub(origin);const length=delta.length();if(length<1e-9)continue;ray.set(origin,delta.multiplyScalar(1/length));if(!ray.intersectTriangle(...b.points,false,hit))continue;const d=hit.distanceTo(origin);if(d<1e-7||d>length-1e-7)continue;THREE.Triangle.getBarycoord(hit,...b.points,bary);if(Math.min(bary.x,bary.y,bary.z)>1e-5)return true;}return false;}
  for(const rows of grid.values())for(let a=0;a<rows.length;a++)for(let b=a+1;b<rows.length;b++){const i=Math.min(rows[a],rows[b]),j=Math.max(rows[a],rows[b]),key=i*faces.length+j;if(seen.has(key))continue;seen.add(key);const A=faces[i],B=faces[j];if(A.ids.some(v=>B.ids.includes(v))||!A.box.intersectsBox(B.box))continue;tested++;if(crossing(A,B)||crossing(B,A)){count++;if(first.length<20)first.push([i,j]);}}
  return{testedNonAdjacentPairs:tested,strictTriangleCrossings:count,firstCrossings:first};
}
const states=[];for(const [name,time,state]of[['neutral',0,{mode:'manual',framing:'full'}],['source-walk',1.1,{mode:'manual',framing:'full',action:'walk'}],['source-wave',.8,{mode:'manual',framing:'full',action:'wave'}]]){for(const m of[source,candidate])m.update(0,time,state);states.push({name,time,appliedSourcePose:source.root.userData.appliedPose,appliedCandidatePose:candidate.root.userData.appliedPose,source:audit(oldMesh),candidate:audit(installed.mesh)});}
const report={schema:'dafeiyu.selected-skirt-strict-crossing-diagnostic.v1',method:'Actual skinned geometry; grid pairs and strict segment/triangle interior crossing, shared vertices/coplanar/tangent contact excluded. Only this skirt; no other garments/body, swept collision or physics guarantee.',states,numericalPass:states.every(s=>s.candidate.strictTriangleCrossings<=s.source.strictTriangleCrossings)};
fs.writeFileSync(new URL('./reports/intersection-diagnostic.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));installed.dispose();source.dispose();candidate.dispose();if(!report.numericalPass)process.exitCode=1;
