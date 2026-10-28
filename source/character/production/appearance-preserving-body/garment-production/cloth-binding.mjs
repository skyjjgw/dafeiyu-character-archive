import * as THREE from '../../rig3d-prototype/vendor/three.module.js';

export function reconstructBoundRender(solverPositions,triangles,bindings){
  const output=new Float32Array(bindings.length/5*3),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3();
  for(let v=0;v<bindings.length/5;v++){
    const i=v*5,face=bindings[i]|0,offset=face*3;
    a.fromArray(solverPositions,triangles[offset]*3);b.fromArray(solverPositions,triangles[offset+1]*3);c.fromArray(solverPositions,triangles[offset+2]*3);
    n.copy(b).sub(a).cross(c.clone().sub(a));const length=n.length();if(length<1e-12)throw Error('Degenerate live cloth triangle '+face);n.multiplyScalar(1/length);
    const q=a.multiplyScalar(bindings[i+1]).addScaledVector(b,bindings[i+2]).addScaledVector(c,bindings[i+3]).addScaledVector(n,bindings[i+4]);q.toArray(output,v*3);
  }
  return output;
}

/** Closest triangle projection; explicitly reports unrepresentable tangent residual. */
export function bindToSolver(points,solverPositions,triangles){
  const records=[],projected=new Float32Array(points.length),tri=new THREE.Triangle(),closest=new THREE.Vector3(),delta=new THREE.Vector3(),normal=new THREE.Vector3(),bary=new THREE.Vector3();
  const facets=[];for(let f=0;f<triangles.length/3;f++){const t=new THREE.Triangle(...[0,1,2].map(k=>new THREE.Vector3().fromArray(solverPositions,triangles[f*3+k]*3)));facets.push({tri:t,box:new THREE.Box3().setFromPoints([t.a,t.b,t.c]),normal:t.getNormal(new THREE.Vector3())});}
  const residuals=[],normalOffsets=[],outliers=[];let maxTangent=0,maxDistance=0,minBary=1;
  for(let v=0;v<points.length/3;v++){
    const p=new THREE.Vector3().fromArray(points,v*3);let distance=Infinity,best=-1;
    for(let f=0;f<facets.length;f++){
      const item=facets[f];if(item.box.distanceToPoint(p)>distance)continue;
      item.tri.closestPointToPoint(p,closest);const d=closest.distanceTo(p);if(d<distance){distance=d;best=f;}
    }
    const face=facets[best];face.tri.closestPointToPoint(p,closest);face.tri.getBarycoord(closest,bary);normal.copy(face.normal);delta.copy(p).sub(closest);const signed=delta.dot(normal),q=closest.clone().addScaledVector(normal,signed),tangentError=q.distanceTo(p);
    minBary=Math.min(minBary,bary.x,bary.y,bary.z);maxTangent=Math.max(maxTangent,tangentError);maxDistance=Math.max(maxDistance,distance);residuals.push(tangentError);normalOffsets.push(Math.abs(signed));q.toArray(projected,v*3);
    // Internal packed 5 floats; export uses explicitly typed separate arrays.
    records.push(best,bary.x,bary.y,bary.z,signed);
    outliers.push({vertex:v,face:best,signedNormalOffset:signed,tangentAdjustment:tangentError});
  }
  const percentile=(list,q)=>[...list].sort((a,b)=>a-b)[Math.floor((list.length-1)*q)];
  return{bindings:new Float32Array(records),projected,statistics:{maximumTangentAdjustment:maxTangent,p95TangentAdjustment:percentile(residuals,.95),maximumDistanceToLowSurface:maxDistance,p95NormalOffset:percentile(normalOffsets,.95),maxNormalOffset:Math.max(...normalOffsets),minimumBarycentric:minBary,largestOffsets:outliers.sort((a,b)=>Math.abs(b.signedNormalOffset)-Math.abs(a.signedNormalOffset)).slice(0,12)}};
}

export function meshQuality(position,index){
  const edges=new Map(),direction=new Map(),lengths=[],aspects=[],angles=[],adj=Array.from({length:position.length/3},()=>[]);let minimumArea=Infinity,totalArea=0,orientationConflicts=0;
  for(let f=0;f<index.length/3;f++){
    const ids=[index[f*3],index[f*3+1],index[f*3+2]],p=ids.map(i=>new THREE.Vector3().fromArray(position,i*3)),side=[p[0].distanceTo(p[1]),p[1].distanceTo(p[2]),p[2].distanceTo(p[0])];
    const area=p[1].clone().sub(p[0]).cross(p[2].clone().sub(p[0])).length()/2;minimumArea=Math.min(minimumArea,area);totalArea+=area;aspects.push(Math.max(...side)/Math.min(...side));
    for(let k=0;k<3;k++){const a=side[k],b=side[(k+1)%3],c=side[(k+2)%3];angles.push(Math.acos(Math.max(-1,Math.min(1,(a*a+b*b-c*c)/(2*a*b))))*180/Math.PI);const x=ids[k],y=ids[(k+1)%3],key=`${Math.min(x,y)}:${Math.max(x,y)}`;if(!edges.has(key)){edges.set(key,[]);lengths.push(p[k].distanceTo(p[(k+1)%3]));}edges.get(key).push(f);const sign=x<y?1:-1;if(direction.has(key)&&direction.get(key)===sign)orientationConflicts++;direction.set(key,sign);adj[x].push(y);adj[y].push(x);}
  }
  const seen=new Set();let components=0;for(let i=0;i<adj.length;i++)if(!seen.has(i)){components++;const stack=[i];seen.add(i);while(stack.length)for(const j of adj[stack.pop()])if(!seen.has(j)){seen.add(j);stack.push(j);}}
  const quantile=(a,q)=>[...a].sort((x,y)=>x-y)[Math.floor((a.length-1)*q)];
  return{vertices:position.length/3,triangles:index.length/3,finite:position.every(Number.isFinite),indicesInRange:index.every(i=>Number.isInteger(i)&&i>=0&&i<position.length/3),components,boundaryEdges:[...edges.values()].filter(a=>a.length===1).length,nonmanifoldEdges:[...edges.values()].filter(a=>a.length>2).length,orientationConflicts,euler:position.length/3-edges.size+index.length/3,minimumTriangleArea:minimumArea,totalArea,edgeLength:{min:Math.min(...lengths),p10:quantile(lengths,.1),median:quantile(lengths,.5),p90:quantile(lengths,.9),max:Math.max(...lengths)},edgeAspect:{median:quantile(aspects,.5),p95:quantile(aspects,.95),max:Math.max(...aspects)},minimumAngleDegrees:Math.min(...angles)};
}
