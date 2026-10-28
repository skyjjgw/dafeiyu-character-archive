import * as THREE from '../rig3d-prototype/vendor/three.module.js';
// A fixed rest-geometry spacing constraint, evaluated in Head local space.
// It never reads the camera, screen pixels, visibility masks or image frames.
export function createOcclusionDepthPolicy({character,face,originalKernel,originalVolume,targetVolume}){
 const N=48,bounds=[-.65,-.42,.65,.68],cells=Array.from({length:N*N},()=>[]),triangles=[],meshes=[];
 const gx=x=>Math.max(0,Math.min(N-1,Math.floor((x-bounds[0])/(bounds[2]-bounds[0])*N))),gy=y=>Math.max(0,Math.min(N-1,Math.floor((y-bounds[1])/(bounds[3]-bounds[1])*N)));
 character.root.updateMatrixWorld(true);const inv=face.matrixWorld.clone().invert(),v=new THREE.Vector3();
 character.head.traverse(o=>{
  if(!o.isMesh)return;for(let a=o;a;a=a.parent)if(a===face||!a.visible)return;
  const p=o.geometry.attributes.position,idx=o.geometry.index?.array||Uint32Array.from({length:p.count},(_,i)=>i),matrix=inv.clone().multiply(o.matrixWorld),coords=new Float64Array(p.count*3);
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);if(o.isSkinnedMesh)o.applyBoneTransform(i,v);v.applyMatrix4(matrix);coords.set(v.toArray(),i*3);}
  let used=0;for(let i=0;i<idx.length;i+=3){const t=[...coords.subarray(idx[i]*3,idx[i]*3+3),...coords.subarray(idx[i+1]*3,idx[i+1]*3+3),...coords.subarray(idx[i+2]*3,idx[i+2]*3+3)],xs=[t[0],t[3],t[6]],ys=[t[1],t[4],t[7]],minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),det=(t[4]-t[7])*(t[0]-t[6])+(t[6]-t[3])*(t[1]-t[7]);
   if(Math.abs(det)<1e-13||minX>bounds[2]||maxX<bounds[0]||minY>bounds[3]||maxY<bounds[1])continue;
   const id=triangles.length;triangles.push(t);used++;for(let y=gy(minY);y<=gy(maxY);y++)for(let x=gx(minX);x<=gx(maxX);x++)cells[y*N+x].push(id);
  }meshes.push({name:o.name,projectedTriangleCount:used});
 });
 function hairDepth(x,y){let z=-Infinity;for(const id of cells[gy(y)*N+gx(x)]){const t=triangles[id],det=(t[4]-t[7])*(t[0]-t[6])+(t[6]-t[3])*(t[1]-t[7]),u=((t[4]-t[7])*(x-t[6])+(t[6]-t[3])*(y-t[7]))/det,w=((t[7]-t[1])*(x-t[6])+(t[0]-t[6])*(y-t[7]))/det,q=1-u-w;if(u>=-1e-8&&w>=-1e-8&&q>=-1e-8)z=Math.max(z,u*t[2]+w*t[5]+q*t[8]);}return z;}
 const cache=new Map(),padding=.012,safety=.55;let constrainedQueries=0,maxRequestedDelta=0,maxAppliedDelta=0;
 function depth(x,y){const key=x+','+y;if(cache.size>200000)cache.clear();if(cache.has(key))return cache.get(key);const old=originalKernel.frontZ(x,y),target=targetVolume.frontZ(x,y),delta=target-old,hair=hairDepth(x,y);let fraction=1;
  if(Number.isFinite(hair)&&Math.abs(delta)>1e-12){const allowed=Math.max(0,Math.abs(hair-old)-padding)*safety;fraction=Math.tanh(allowed/Math.abs(delta));if(fraction<.999)constrainedQueries++;}
  const applied=delta*fraction;maxRequestedDelta=Math.max(maxRequestedDelta,Math.abs(delta));maxAppliedDelta=Math.max(maxAppliedDelta,Math.abs(applied));const out={front:old+applied,fraction};cache.set(key,out);return out;
 }
 return{frontZ:(x,y)=>depth(x,y).front,backZ:(x,y)=>originalVolume.backZ(x,y)+(targetVolume.backZ(x,y)-originalVolume.backZ(x,y))*depth(x,y).fraction,
  metadata:{parameters:targetVolume.metadata.parameters,occlusionSpacing:{schema:'dafeiyu.head-rest-geometry-spacing.v3',coordinateSystem:'fixed original Head local space',bounds,gridResolution:N,padding,safety,meshes,projectedTriangles:triangles.length,cameraIndependent:true,formula:'delta*(tanh(max(0,abs(hairZ-sourceFrontZ)-padding)*safety/abs(delta)))',note:'Rest geometry spacing preserves contact-side ordering near original hair. It is not a camera mask, collision engine or hard pixel-identical target.'}},
  diagnostics:()=>({constrainedQueries,maxRequestedDelta,maxAppliedDelta,cachedQueries:cache.size}),
  serializeCage:()=>({schema:'dafeiyu.head-rest-depth-cage.v3',coordinateSystem:'original Head local +Z front',bounds,gridResolution:N,padding,safety,meshes,triangles})};
}
