import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
import {scalpFrontSurfaceZ} from './runtime-source/rear-hair.js';
const clamp=THREE.MathUtils.clamp,C=Math.cos(.06),S=Math.sin(.06);
export const LOCKS=['left-face-framing-hair','right-face-framing-hair','central-forked-bangs'];
const edgeKey=(a,b)=>a<b?`${a},${b}`:`${b},${a}`;
// Edge decisions are global. Every triangle incident to a split edge receives
// the same midpoint, including triangles whose other edges are already short.
export function conformingTriangulation(outline,maxEdge=36){
 // The frozen densely sampled boundary contains near-collinear joins. Remove
 // only sub-.02px deviations before triangulation, avoiding float32 slivers.
 outline=outline.map(p=>p.slice());let changed=true;while(changed){changed=false;for(let i=0;i<outline.length&&outline.length>3;i++){const a=outline[(i+outline.length-1)%outline.length],p=outline[i],b=outline[(i+1)%outline.length],dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy,t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(l2||1),d=Math.abs((p[0]-a[0])*dy-(p[1]-a[1])*dx)/Math.sqrt(l2||1);if(t>0&&t<1&&d<.02){outline.splice(i,1);changed=true;i--;}}}
 const vertices=outline.map(p=>p.slice()),faces=THREE.ShapeUtils.triangulateShape(outline.map(p=>new THREE.Vector2(...p)),[]);
 let triangles=faces.map(f=>f.slice()),rounds=0;
 for(;rounds<16;rounds++){
  const split=new Map();
  for(const f of triangles)for(let k=0;k<3;k++){const a=f[k],b=f[(k+1)%3],p=vertices[a],q=vertices[b],key=edgeKey(a,b);if(Math.hypot(q[0]-p[0],q[1]-p[1])>maxEdge+1e-7&&!split.has(key)){split.set(key,vertices.length);vertices.push([(p[0]+q[0])/2,(p[1]+q[1])/2]);}}
  if(!split.size)break;
  const next=[];
  for(const f of triangles){
   const[a,b,c]=f,ab=split.get(edgeKey(a,b)),bc=split.get(edgeKey(b,c)),ca=split.get(edgeKey(c,a)),mask=+(ab!==undefined)+2*(bc!==undefined)+4*(ca!==undefined);
   if(mask===0)next.push(f);
   if(mask===1)next.push([a,ab,c],[ab,b,c]);
   if(mask===2)next.push([b,bc,a],[bc,c,a]);
   if(mask===4)next.push([c,ca,b],[ca,a,b]);
   if(mask===3)next.push([b,bc,ab],[a,ab,c],[ab,bc,c]);
   if(mask===6)next.push([c,ca,bc],[b,bc,a],[bc,ca,a]);
   if(mask===5)next.push([a,ab,ca],[c,ca,b],[ca,ab,b]);
   if(mask===7)next.push([a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]);
  }
  triangles=next;
 }
 if(rounds===16)throw Error('Conforming remesh failed to converge');
 const used=[...new Set(triangles.flat())],remap=new Map(used.map((v,i)=>[v,i]));
 return{vertices:used.map(i=>vertices[i]),faces:triangles.map(f=>f.map(i=>remap.get(i))),rounds};
}
function local(p,offset=0){const dx=p[0]-815,dy=p[1]-583,x=(C*dx-S*dy)/775,y=(-S*dx-C*dy)/775,paint=.494-.205*(x/.8)**2-.027*((y-.12)/.73)**2+offset,t=clamp((y-.35)/.35,0,1),blend=t*t*(3-2*t);return[x,y,THREE.MathUtils.lerp(paint,scalpFrontSurfaceZ(x,y)+.038+offset,blend)];}
function boundaryDistance(p,outline){let distance=Infinity;for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length],dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1),0,1);distance=Math.min(distance,Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy));}return distance;}
export function createLockGeometry(patch,{maxEdge=36,fullDepth=.40}={}){
 const data=conformingTriangulation(patch.outline,maxEdge),n=data.vertices.length,positions=[],uv=[],front=[],back=[],rim=[],depths=[],offset=patch.name==='central-forked-bangs'?.004:0;
 for(const p of data.vertices){positions.push(...local(p,offset));uv.push(p[0]/1920,1-p[1]/1080);depths.push(.018+fullDepth*Math.sqrt(clamp(boundaryDistance(p,patch.outline)/80,0,1)));}
 for(let i=0;i<n;i++){const p=positions.slice(i*3,i*3+3);p[2]-=depths[i];positions.push(...p);uv.push(...uv.slice(i*2,i*2+2));}
 for(const f of data.faces){const[a,b,c]=f.map(i=>data.vertices[i]),cross=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);front.push(...(cross<0?f:[f[0],f[2],f[1]]));}
 const edges=new Map();for(let i=0;i<front.length;i+=3)for(let j=0;j<3;j++){const a=front[i+j],b=front[i+(j+1)%3],key=edgeKey(a,b);if(!edges.has(key))edges.set(key,[]);edges.get(key).push([a,b]);}
 for(let i=0;i<front.length;i+=3)back.push(front[i]+n,front[i+2]+n,front[i+1]+n);
 for(const entries of edges.values())if(entries.length===1){const[a,b]=entries[0];rim.push(a,b+n,b,a,a+n,b+n);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex([...front,...back,...rim]);geometry.addGroup(0,front.length,0);geometry.addGroup(front.length,back.length+rim.length,1);geometry.computeVertexNormals();geometry.computeBoundingBox();
 return{geometry,front,frontCount:n,sourcePixels:data.vertices,metadata:{name:patch.name,sharedEdgeRefinementRounds:data.rounds,fullDepth,maxEdge,depthRange:[Math.min(...depths),Math.max(...depths)],shape:'Closed connected front/back radial-depth lens with conforming shared front edges; posterior curvature enlarged behind the original projected front',backSurface:'Inferred depth only; original blue side material, no claim of authored side/back painting'}};
}
export function installHairContinuity(character,options={}){
 const original=[],items=[],meshes=[];
 for(const name of LOCKS){const patch=character.metadata.hair.patches.find(p=>p.name===name),parts=[];character.head.traverse(o=>{if(o.isMesh&&o.name.startsWith(name+':'))parts.push(o);});if(parts.length!==3||!patch)throw Error('Original lock contract changed: '+name);
  parts.forEach(mesh=>{original.push({mesh,visible:mesh.visible});mesh.visible=false;});const source=parts.find(m=>m.name.endsWith(':original-pixel-surface')),side=parts.find(m=>m.name.endsWith(':closed-thickness')),data=createLockGeometry(patch,options),materials=[source.material.clone(),side.material.clone()];materials[1].side=THREE.FrontSide;const mesh=new THREE.Mesh(data.geometry,materials);mesh.name=name+':conforming-continuous-volume-v1';source.parent.add(mesh);items.push({...data,mesh,source,originalParts:parts});meshes.push(mesh);
 }
 return{items,meshes,metadata:{schema:'dafeiyu.hair-continuity.v1',finalAccepted:false,staticOnly:true,dynamicsImplemented:false,replaced:LOCKS,locks:items.map(i=>i.metadata),limitations:['Three separate locks; not a Boolean union with the scalp or each other.','Long curls and their original T junctions remain unchanged.','Unknown back shape is inferred.','Front orthographic XY and source mapping retained, but altered rear occlusion requires actual GPU review.']},dispose(){for(const{mesh}of items){mesh.removeFromParent();mesh.geometry.dispose();mesh.material.forEach(m=>m.dispose());}original.forEach(e=>e.mesh.visible=e.visible);}};
}
