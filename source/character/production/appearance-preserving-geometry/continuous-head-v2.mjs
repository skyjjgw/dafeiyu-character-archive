import * as THREE from '../rig3d-prototype/vendor/three.module.js';
import {createFaceProfileVolume} from './runtime-source/profile-volume.js';

const TAU=Math.PI*2,clamp=THREE.MathUtils.clamp,mix=THREE.MathUtils.lerp;
const key=p=>p.map(n=>Math.round(n/1e-6)).join(',');
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};

// This is a structural addition to the frozen drawing, not a replacement face.
// The source visible paint, iris, lashes, expression curves and body stay in
// their original scene. Only its disconnected supporting skull is replaced.
export function installContinuousHeadV2(character,{kernel,sourceConfig}={}){
 // This independent depth policy repairs inferred Z only. The original source
 // module, X/Y coordinates, UVs and artwork pixels are never edited.
 const originalKernel=kernel,outline=sourceConfig.rightOutline;
 const clamp01=x=>Math.min(1,Math.max(0,x)),lerp=(a,b,t)=>a+(b-a)*t;
 const sm=x=>{x=clamp01(x);return x*x*(3-2*x);};
 function interval(y){let lo=0,hi=outline.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(outline[m][1]>=y)lo=m;else hi=m;}return[lo,hi];}
 function centerAt(y){y=Math.max(-.382,Math.min(.64,y));const[a,b]=interval(y),ay=outline[a][1],by=outline[b][1],k=ay===by?0:(ay-y)/(ay-by);return lerp(.023*sm((-.1-ay)/.282),.023*sm((-.1-by)/.282),k);}
 function widthAt(y){y=Math.max(-.382,Math.min(.64,y));const[a,b]=interval(y),[ax,ay]=outline[a],[bx,by]=outline[b];return Math.max(.0001,lerp(ax,bx,ay===by?0:(ay-y)/(ay-by))-centerAt(y));}
 const depthVolume=createFaceProfileVolume({halfWidthAt:widthAt,centerAt,strength:1,cheekExponent:.5,installed:false});
 kernel={...kernel,frontZ:depthVolume.frontZ};
 if(!kernel||!sourceConfig)throw Error('Pass the verified frozen-source face kernel/config');
 const face=character.head.getObjectByName('painted-face');if(!face)throw Error('Frozen painted-face not found');
 const get=name=>{const o=face.getObjectByName(name);if(!o)throw Error('Missing source mesh '+name);return o;};
 const originalFaceMeshes=face.children.filter(o=>o.isMesh);
 const staticNames=new Set(['curved face with genuine eye and mouth openings','closed rounded back of skull','reference skin, nose and cheek paint only','continuous short rounded chin contour']);
 let maxSourceDepthDelta=0;
 function projectDepth(mesh){
  const p=mesh.geometry.attributes.position,isRear=mesh.name==='closed rounded back of skull';
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),old=p.getZ(i),z=isRear?depthVolume.backZ(x,y):old+depthVolume.frontZ(x,y)-originalKernel.frontZ(x,y);
   maxSourceDepthDelta=Math.max(maxSourceDepthDelta,Math.abs(z-old));p.setZ(i,z);
  }
  p.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingSphere();
 }
 originalFaceMeshes.forEach(projectDepth);
 // Back uses the very same continuously sampled linear skin palette as the
 // front; a different flat back tint made a false vertical seam in side view.
 const rear=face.getObjectByName('closed rounded back of skull'),rp=rear.geometry.attributes.position,rc=new Float32Array(rp.count*3);
 for(let i=0;i<rp.count;i++)rc.set(kernel.skinColor(rp.getX(i),rp.getY(i)),i*3);
 rear.geometry.setAttribute('color',new THREE.Float32BufferAttribute(rc,3));
 rear.material=face.getObjectByName('curved face with genuine eye and mouth openings').material;
 function projectDynamicDepth(){for(const mesh of originalFaceMeshes)if(!staticNames.has(mesh.name))projectDepth(mesh);}

 const front=get('curved face with genuine eye and mouth openings'),back=get('closed rounded back of skull');
 const eyeRings=['left','right'].map(n=>get(n+' deforming skin eyelid'));
 const whites=['left','right'].map(n=>get(n+' exposed sclera'));
 const mouthRing=get('continuously deforming skin around mouth'),cavity=get('continuously opening mouth cavity'),tongue=get('tongue inside opening');
 const retained=face.children.filter(o=>o.isMesh&&![front,back,...whites,cavity].includes(o));
 const root=new THREE.Group();root.name='continuous-source-fitted-head-structure';face.add(root);
 const params=[],positions=[],colors=[],triangles=[],lookup=new Map(),sourceMaps={};let maxWeldDelta=0,maxFrontZRepair=0;
 const backContour=new Map(),bp=back.geometry.attributes.position;
 for(let i=0;i<bp.count;i++)if(i%33===0||i%33===32){const p=[bp.getX(i),bp.getY(i),bp.getZ(i)],k=p.slice(0,2).map(n=>Math.floor(n/1e-6)).join(',');if(!backContour.has(k))backContour.set(k,[]);backContour.get(k).push(p);}
 function normalizedFrontZ(x,y){const cell=[Math.floor(x/1e-6),Math.floor(y/1e-6)];for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const p of backContour.get([cell[0]+i,cell[1]+j].join(','))||[])if(Math.hypot(p[0]-x,p[1]-y)<1e-6)return p[2];return kernel.frontZ(x,y);}
 function vertex(p,color=[1,1,1],param={role:'static'},weld=false){
  const cell=p.map(n=>Math.floor(n/1e-6)),k=cell.join(',');
  if(weld)for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)for(const id of lookup.get([cell[0]+x,cell[1]+y,cell[2]+z].join(','))||[]){const d=Math.hypot(...p.map((v,i)=>v-positions[id][i]));if(d<1e-6){maxWeldDelta=Math.max(maxWeldDelta,d);return id;}}
  const id=positions.length;positions.push([...p]);colors.push([...color]);params.push(param);if(weld){if(!lookup.has(k))lookup.set(k,[]);lookup.get(k).push(id);}return id;
 }
 function tri(a,b,c,material,origin=null){if(a!==b&&b!==c&&a!==c)triangles.push({v:[a,b,c],material,origin});}
 function importMesh(o,material){
  const p=o.geometry.attributes.position,c=o.geometry.attributes.color,map=[];
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=o===front?normalizedFrontZ(x,y):p.getZ(i);if(o===front)maxFrontZRepair=Math.max(maxFrontZRepair,Math.abs(z-p.getZ(i)));map.push(vertex([x,y,z],c?[c.getX(i),c.getY(i),c.getZ(i)]:[1,1,1],{role:'static',sourceMesh:o.name,sourceVertex:i},true));}
  const index=o.geometry.index?.array||Uint32Array.from({length:p.count},(_,i)=>i);
  for(let i=0;i<index.length;i+=3)tri(map[index[i]],map[index[i+1]],map[index[i+2]],material,{sourceMesh:o.name,triangle:i/3});sourceMaps[o.name]=map;return map;
 }
 importMesh(front,0);
 function boundaryLoops(){
  const edges=new Map();for(const t of triangles)for(let i=0;i<3;i++){const a=t.v[i],b=t.v[(i+1)%3],k=a<b?`${a},${b}`:`${b},${a}`;if(!edges.has(k))edges.set(k,[]);edges.get(k).push([a,b]);}
  const remaining=new Set(),adj=new Map();for(const [k,e]of edges)if(e.length===1){remaining.add(k);for(const[a,b]of[e[0],e[0].toReversed()]){if(!adj.has(a))adj.set(a,[]);adj.get(a).push(b);}}
  if([...adj.values()].some(v=>v.length!==2))throw Error('Source front boundary is not a degree-two conforming loop '+JSON.stringify({vertices:positions.length,triangles:triangles.length,boundaryEdges:remaining.size,bad:[...adj].filter(([i,v])=>v.length!==2).slice(0,12).map(([i,v])=>({i,p:positions[i],degree:v.length,neighbors:v.map(j=>positions[j])}))}));
  const loops=[];while(remaining.size){const first=[...remaining][0].split(',').map(Number),loop=[first[0]];let previous=first[0],current=first[1];remaining.delete(first.toSorted((a,b)=>a-b).join(','));
   while(current!==loop[0]){loop.push(current);const next=adj.get(current).find(n=>n!==previous);remaining.delete([current,next].toSorted((a,b)=>a-b).join(','));previous=current;current=next;if(loop.length>adj.size+1)throw Error('Boundary traversal failed');}loops.push(loop);}
  return loops;
 }
 const sourceLoops=boundaryLoops(),eyeDefs=sourceConfig.eyes,mc=sourceConfig.mouthCenter,mh=sourceConfig.mouthHole;
 if(sourceLoops.length!==4)throw Error('Expected outer head and three source apertures, got '+sourceLoops.length);
 const holes=[];
 for(const loop of sourceLoops){const center=loop.reduce((s,id)=>s.map((x,j)=>x+positions[id][j]/loop.length),[0,0,0]);
  if(loop.length>1000)continue;
  const options=[...eyeDefs.map((e,i)=>({type:'eye',eye:i,center:e.center,rx:e.outerX,top:e.outerTop,bottom:e.outerBottom,sourceSegments:96})),{type:'mouth',center:mc,rx:mh.rx,top:mh.top,bottom:mh.bottom,sourceSegments:64}];
  const definition=options.toSorted((a,b)=>Math.hypot(center[0]-a.center[0],center[1]-a.center[1])-Math.hypot(center[0]-b.center[0],center[1]-b.center[1]))[0];
  const count=loop.length,byK=new Map();for(const id of loop){const p=positions[id],dy=p[1]-definition.center[1],theta=(Math.atan2(dy/(dy>=0?definition.top:definition.bottom),(p[0]-definition.center[0])/definition.rx)+TAU)%TAU,k=Math.round(theta/TAU*count)%count;if(byK.has(k))throw Error('Ambiguous source aperture parameter');byK.set(k,id);}
  if(byK.size!==count)throw Error('Source aperture parameter mismatch');
  holes.push({...definition,sourceBoundaryCount:count,byK,thetaList:Array.from({length:count},(_,k)=>k/count)});
 }
 // The 512-edge mouth boundary must also contain the 96 old dynamic aperture
 // knots. Split those actual source edges linearly, preserving the old planes.
 for(const hole of holes)if(hole.type==='mouth'){
  for(let j=0;j<96;j++){const u=j/96,count=hole.sourceBoundaryCount,q=u*count,k=Math.floor(q),fraction=q-k;if(fraction<1e-8||1-fraction<1e-8)continue;
   const a=hole.byK.get(k),b=hole.byK.get((k+1)%count),p=positions[a].map((x,c)=>mix(x,positions[b][c],fraction)),color=colors[a].map((x,c)=>mix(x,colors[b][c],fraction));const id=vertex(p,color,{role:'static-edge-split',sourceEdges:[a,b],weights:[1-fraction,fraction]},true);
   const t=triangles.find(t=>t.v.includes(a)&&t.v.includes(b));if(!t)throw Error('Missing source mouth edge');const index=t.v.findIndex((x,i)=>x===a&&t.v[(i+1)%3]===b);let x=a,y=b,c;
   if(index>=0)c=t.v[(index+2)%3];else{x=b;y=a;const k=t.v.findIndex((v,i)=>v===x&&t.v[(i+1)%3]===y);c=t.v[(k+2)%3];}
   t.v=[x,id,c];tri(id,y,c,t.material,t.origin);hole.thetaList.push(u);hole.byK.set('extra:'+u,id);
  }
  hole.thetaList.sort((a,b)=>a-b);
 }
 importMesh(back,1);
 const routes=[],sourceSampler=(mesh,theta,k)=>{
  const d=mesh.geometry.userData,N=d.segments,R=d.rings,q=((theta/TAU)%1+1)%1*N,i=Math.floor(q),fraction=q-i,r=k*R,lo=Math.min(R,Math.floor(r)),hi=Math.min(R,lo+1),rk=r-lo,p=mesh.geometry.attributes.position;
  const result=[];for(let c=0;c<3;c++){const get=index=>p.array[index*3+c],a=mix(get(lo*(N+1)+i),get(lo*(N+1)+i+1),fraction),b=mix(get(hi*(N+1)+i),get(hi*(N+1)+i+1),fraction);result.push(mix(a,b,rk));}return result;
 };
 function distanceToContour(p,contour){let d=Infinity;for(let i=0;i<contour.length;i++){const a=contour[i],b=contour[(i+1)%contour.length],dx=b[0]-a[0],dy=b[1]-a[1],q=clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy),0,1);d=Math.min(d,Math.hypot(p[0]-a[0]-dx*q,p[1]-a[1]-dy*q));}return d;}
 function inside(p,contour){let yes=false;for(let i=0,j=contour.length-1;i<contour.length;j=i++){const a=contour[i],b=contour[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
 for(const hole of holes)if(hole.type==='eye'){
  hole.neutralRim=Array.from({length:96},(_,i)=>sourceSampler(whites[hole.eye],i/96*TAU,0));
  hole.skinTransitionWidth=Math.min(...[...hole.byK.values()].map(i=>distanceToContour(positions[i],hole.neutralRim)))*.65;
  if(!(hole.skinTransitionWidth>0))throw Error('Neutral globe does not fit inside original source eye opening');
 }
 function neutralRimAt(hole,theta){const q=((theta/TAU)%1+1)%1*96,i=Math.floor(q),k=q-i;return hole.neutralRim[i].map((x,c)=>mix(x,hole.neutralRim[(i+1)%96][c],k));}
 function connect(a,b,material){for(let i=0;i<a.length;i++){const j=(i+1)%a.length;tri(a[i],a[j],b[i],material);tri(a[j],b[j],b[i],material);}}
 function connectNested(outer,outerTheta,inner,material){
  // The old static aperture has 8 subdivisions per source segment. Its exact
  // boundary is kept, but the dynamic inner rings need only the 96 original
  // expression knots. Conforming zipper triangles avoid hanging vertices.
  let i=0,j=0;const A=outer.length,B=inner.length,epsilon=1e-10;
  while(i<A||j<B){const na=i<A?(i+1<A?outerTheta[i+1]:1):Infinity,nb=j<B?(j+1)/B:Infinity;
   if(Math.abs(na-nb)<epsilon){tri(outer[i%A],outer[(i+1)%A],inner[j%B],material);tri(outer[(i+1)%A],inner[(j+1)%B],inner[j%B],material);i++;j++;}
   else if(na<nb){tri(outer[i%A],outer[(i+1)%A],inner[j%B],material);i++;}
   else{tri(outer[i%A],inner[(j+1)%B],inner[j%B],material);j++;}
  }
 }
 function evaluate(param,state){
  if(param.role==='static'||param.role==='static-edge-split')return null;
  const hole=holes[param.hole],theta=param.theta,source=hole.type==='eye'?eyeRings[hole.eye]:mouthRing;
  const inner=sourceSampler(source,theta,1),center=hole.center;
  if(param.role==='support'){
   const outer=param.anchor,k=param.k,x=mix(outer[0],inner[0],k),y=mix(outer[1],inner[1],k);
   const amount=hole.type==='eye'?(inside([x,y],hole.neutralRim)?1:smooth(1-distanceToContour([x,y],hole.neutralRim)/hole.skinTransitionWidth)):smooth(k);
   return{position:[x,y,kernel.frontZ(x,y)+.0058*amount],color:kernel.skinColor(x,y)};
  }
  if(param.role==='socket'){
   const t=param.depthT,neutral=neutralRimAt(hole,theta),expanded=[center[0]+(neutral[0]-center[0])*1.18,center[1]+(neutral[1]-center[1])*1.18];let x,y,z;
   if(t<=.4){const u=smooth(t/.4);x=mix(inner[0],expanded[0],u);y=mix(inner[1],expanded[1],u);const outside=inside([x,y],hole.neutralRim)?0:smooth(distanceToContour([x,y],hole.neutralRim)/hole.skinTransitionWidth);z=kernel.frontZ(x,y)+mix(.0058,.0038,u)-.045*outside;}
   else{const u=(t-.4)/.6,scale=u<.7?1:Math.cos((u-.7)/.3*Math.PI/2);x=center[0]+(expanded[0]-center[0])*scale;y=center[1]+(expanded[1]-center[1])*scale;z=mix(kernel.frontZ(...expanded)+.0038-.045,kernel.frontZ(...center)-.235+.0058,smooth(u));}
   return{position:[x,y,z],color:kernel.skinColor(x,y).map(c=>c*(1-.48*t))};
  }
  if(param.role==='socket-pole')return{position:[center[0],center[1],kernel.frontZ(center[0],center[1])-.235+.0058],color:kernel.skinColor(...center).map(c=>c*.5)};
  if(param.role==='oral-wall'){
   const t=param.depthT;return{position:[inner[0],inner[1],kernel.frontZ(inner[0],inner[1])+mix(.0058,-.075,t)],color:[1,1,1]};
  }
  if(param.role==='oral-cap'){
   const p=sourceSampler(cavity,theta,param.k);return{position:[p[0],p[1],p[2]-.078],color:[1,1,1]};
  }
  return null;
 }
 for(const [holeIndex,hole]of holes.entries()){
  const angular=hole.thetaList,outer=angular.map(u=>hole.byK.get(Math.round(u*hole.sourceBoundaryCount)%hole.sourceBoundaryCount)??hole.byK.get('extra:'+u));
  // An extra mouth knot is not a rounded existing knot. Resolve explicitly.
  if(hole.type==='mouth')for(let i=0;i<angular.length;i++)if(hole.byK.has('extra:'+angular[i]))outer[i]=hole.byK.get('extra:'+angular[i]);
  if(outer.some(i=>i===undefined))throw Error('Incomplete conforming aperture');
  const N=96,dynamicTheta=Array.from({length:N},(_,i)=>i/N);let previous=outer;
  for(let row=1;row<=16;row++){
   const k=row/16,ring=dynamicTheta.map(u=>{const i=angular.findIndex(a=>Math.abs(a-u)<1e-10);if(i<0)throw Error('Missing original expression knot in conforming aperture');const param={role:'support',hole:holeIndex,theta:u*TAU,k,anchor:positions[outer[i]].slice()};const result=evaluate(param,{});return vertex(result.position,result.color,param);});if(row===1)connectNested(previous,angular,ring,0);else connect(previous,ring,0);previous=ring;
  }
  const rim=previous.slice();
  if(hole.type==='eye'){
   for(let row=1;row<18;row++){const depthT=row/18,ring=dynamicTheta.map(u=>{const p={role:'socket',hole:holeIndex,theta:u*TAU,depthT},value=evaluate(p,{});return vertex(value.position,value.color,p);});connect(previous,ring,2);previous=ring;}
   const param={role:'socket-pole',hole:holeIndex,theta:0},p=evaluate(param,{}),pole=vertex(p.position,p.color,param);for(let i=0;i<N;i++)tri(previous[i],previous[(i+1)%N],pole,2);
  }else{
   for(let row=1;row<=8;row++){const depthT=row/8,ring=dynamicTheta.map(u=>{const p={role:'oral-wall',hole:holeIndex,theta:u*TAU,depthT},value=evaluate(p,{});return vertex(value.position,value.color,p);});connect(previous,ring,3);previous=ring;}
   for(let row=1;row<8;row++){const k=row/8,ring=dynamicTheta.map(u=>{const p={role:'oral-cap',hole:holeIndex,theta:u*TAU,k},value=evaluate(p,{});return vertex(value.position,value.color,p);});connect(previous,ring,3);previous=ring;}
   const p={role:'oral-cap',hole:holeIndex,theta:0,k:1},value=evaluate(p,{}),pole=vertex(value.position,value.color,p);for(let i=0;i<N;i++)tri(previous[i],previous[(i+1)%N],pole,3);
  }
  routes.push({type:hole.type,eye:hole.eye,sourceBoundaryVertices:hole.sourceBoundaryCount,conformingBoundaryVertices:outer.length,dynamicAngularVertices:N,outerVertexIds:outer,innerVertexIds:rim,theta:angular});
 }
 function orientAndAudit(){
  const edges=new Map();for(let ti=0;ti<triangles.length;ti++)for(let i=0;i<3;i++){const a=triangles[ti].v[i],b=triangles[ti].v[(i+1)%3],k=a<b?`${a},${b}`:`${b},${a}`;if(!edges.has(k))edges.set(k,[]);edges.get(k).push({ti,sign:a<b?1:-1});}
  const open=[...edges.values()].filter(v=>v.length===1).length,nonmanifold=[...edges.values()].filter(v=>v.length>2).length;if(open||nonmanifold)throw Error(`Head topology not closed: ${open} boundary, ${nonmanifold} nonmanifold`);
  const links=Array.from({length:triangles.length},()=>[]);for(const [a,b]of edges.values()){links[a.ti].push([b.ti,a.sign===b.sign?-1:1]);links[b.ti].push([a.ti,a.sign===b.sign?-1:1]);}
  const sign=new Int8Array(triangles.length);let components=0;
  for(let i=0;i<sign.length;i++)if(!sign[i]){components++;sign[i]=1;const stack=[i];while(stack.length){const a=stack.pop();for(const[b,m]of links[a]){const s=sign[a]*m;if(!sign[b]){sign[b]=s;stack.push(b);}else if(sign[b]!==s)throw Error('Non-orientable head connection');}}}
  for(let i=0;i<sign.length;i++)if(sign[i]<0)[triangles[i].v[1],triangles[i].v[2]]=[triangles[i].v[2],triangles[i].v[1]];
  let volume=0;for(const t of triangles){const[a,b,c]=t.v.map(i=>new THREE.Vector3(...positions[i]));volume+=a.dot(b.clone().cross(c))/6;}if(volume<0)for(const t of triangles)[t.v[1],t.v[2]]=[t.v[2],t.v[1]];
  return{components,boundaryEdges:open,nonmanifoldEdges:nonmanifold,orientable:true,signedVolume:Math.abs(volume),note:'Mouth closure can have intentional contact/collapsed triangles in neutral. No self-intersection or dynamic collision certification.'};
 }
 const topology=orientAndAudit(),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions.flat(),3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('color',new THREE.Float32BufferAttribute(colors.flat(),3).setUsage(THREE.DynamicDrawUsage));
 const sorted=triangles.toSorted((a,b)=>a.material-b.material),index=[];for(let material=0;material<4;material++){const start=index.length;for(const t of sorted)if(t.material===material)index.push(...t.v);g.addGroup(start,index.length-start,material);}g.setIndex(index);g.computeVertexNormals();g.computeBoundingSphere();
 const socketMat=front.material.clone();socketMat.name='source skin palette / hidden orbital lining';const headMesh=new THREE.Mesh(g,[front.material,back.material,socketMat,cavity.material]);headMesh.name='continuous head skin sockets and oral lining';root.add(headMesh);
 front.removeFromParent();back.removeFromParent();cavity.removeFromParent();
 function closedGlobe(source,eye){
  const p=source.geometry.attributes.position,N=96,R=source.geometry.userData.rings,coords=[],faces=[],map=[],cache=new Map();
  const add=point=>{const k=key(point);if(cache.has(k))return cache.get(k);const i=coords.length;coords.push(point);cache.set(k,i);return i;};
  for(let i=0;i<p.count;i++)map.push(add([p.getX(i),p.getY(i),p.getZ(i)]));const indices=source.geometry.index.array;
  for(let i=0;i<indices.length;i+=3){const t=[map[indices[i]],map[indices[i+1]],map[indices[i+2]]];if(new Set(t).size===3)faces.push(t);}
  const rim=Array.from({length:N},(_,i)=>map[i]);let last=rim;const center=eyeDefs[eye].center,meanZ=rim.reduce((s,i)=>s+coords[i][2]/N,0),depth=.17;
  for(let row=1;row<20;row++){const phi=row/20*Math.PI/2,ring=rim.map(id=>{const q=coords[id];return add([center[0]+(q[0]-center[0])*Math.cos(phi),center[1]+(q[1]-center[1])*Math.cos(phi),meanZ-depth*Math.sin(phi)+(q[2]-meanZ)*Math.cos(phi)]);});for(let i=0;i<N;i++){const j=(i+1)%N;faces.push([last[i],ring[i],last[j]],[last[j],ring[i],ring[j]]);}last=ring;}
  const pole=add([center[0],center[1],meanZ-depth]);for(let i=0;i<N;i++)faces.push([last[i],pole,last[(i+1)%N]]);
  const edges=new Map();for(let ti=0;ti<faces.length;ti++)for(let k=0;k<3;k++){const a=faces[ti][k],b=faces[ti][(k+1)%3],key=a<b?`${a},${b}`:`${b},${a}`;if(!edges.has(key))edges.set(key,[]);edges.get(key).push([ti,a<b?1:-1]);}
  const boundary=[...edges.values()].filter(e=>e.length===1).length,nonmanifold=[...edges.values()].filter(e=>e.length>2).length;if(boundary||nonmanifold)throw Error('Ocular globe is not a closed surface');
  const links=Array.from({length:faces.length},()=>[]);for(const[a,b]of edges.values()){links[a[0]].push([b[0],a[1]===b[1]?-1:1]);links[b[0]].push([a[0],a[1]===b[1]?-1:1]);}const signs=new Int8Array(faces.length);signs[0]=1;const stack=[0];while(stack.length){const i=stack.pop();for(const[j,m]of links[i])if(!signs[j]){signs[j]=signs[i]*m;stack.push(j);}else if(signs[j]!==signs[i]*m)throw Error('Nonorientable ocular globe');}
  for(let i=0;i<faces.length;i++)if(signs[i]<0)[faces[i][1],faces[i][2]]=[faces[i][2],faces[i][1]];let volume=0;for(const f of faces){const[a,b,c]=f.map(i=>new THREE.Vector3(...coords[i]));volume+=a.dot(b.clone().cross(c))/6;}if(volume<0)for(const f of faces)[f[1],f[2]]=[f[2],f[1]];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(coords.flat(),3));geo.setIndex(faces.flat());geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,source.material);mesh.name=(eye?'right':'left')+' closed source-fitted ocular globe';root.add(mesh);source.removeFromParent();return{mesh,sourceMap:map,frontSourceMesh:source.name,depth,frontApexZ:Math.max(...rim.map(i=>coords[i][2])),frontFaceUnmodified:true,topology:{components:1,boundaryEdges:boundary,nonmanifoldEdges:nonmanifold,signedVolume:Math.abs(volume),orientable:true}};
 }
 const globes=whites.map(closedGlobe);
 function update(state={}){
  const p=g.attributes.position,c=g.attributes.color;
  for(let i=0;i<params.length;i++){const value=evaluate(params[i],state);if(!value)continue;p.setXYZ(i,...value.position);c.setXYZ(i,...value.color);}
  p.needsUpdate=c.needsUpdate=true;g.computeVertexNormals();
  // The original tongue drawing becomes an interior surface. Its exact XY and
  // color are retained; only its inferred depth changes inside the new pouch.
  const t=tongue.geometry.attributes.position;for(let i=0;i<t.count;i++)t.setZ(i,t.getZ(i)-.041);t.needsUpdate=true;
 }
 const originalUpdate=character.update.bind(character);character.update=(dt,time,input={})=>{originalUpdate(dt,time,input);projectDynamicDepth();update(face.userData.expression);};
 const originalDispose=character.dispose.bind(character);let disposed=false;character.dispose=()=>{if(disposed)return;disposed=true;g.dispose();socketMat.dispose();for(const globe of globes)globe.mesh.geometry.dispose();originalDispose();};
 const manifest={depthPolicy:{schema:'dafeiyu.selected-depth-policy.v2',parameters:depthVolume.metadata.parameters,maxSourceDepthDelta,sourceXY:'unchanged',sourceUV:'unchanged',originalDefaultKernelCompatible:false,notes:['All facial drawing surfaces follow the same new frontZ with their original small depth offsets.','Back skin uses the same sampled color field as the front; no new face painting or iris pixels.','The depth guide is inferred, not original-author 3D truth.']},schema:'dafeiyu.continuous-head.candidate.v2',scope:'Static neutral and source-parametric structural candidate, not final avatar or certified dynamics',sourceFaceHash:'bac8255b431d9b958286e1a6b40c8eb84921565882217aff2d6d26a743215cc8',topology,maxSourceWeldPositionDelta:maxWeldDelta,maxInferredFrontZRepair:maxFrontZRepair,physicalMesh:headMesh.name,vertices:positions.length,triangles:triangles.length,sourceMaps,vertexParams:params,deformationConfig:{coordinateSystem:'source Head local: X right, Y up, +Z front',holes:holes.map(h=>({type:h.type,eye:h.eye,center:h.center,neutralRim:h.neutralRim,skinTransitionWidth:h.skinTransitionWidth})),sourceSamplePrecision:'Original 96-knot source positions rounded to Float32 before support interpolation',socketBackDepth:.235,globePosteriorDepth:.17,oralDepth:.075,tongueDepthOffset:-.041},apertures:routes,globes:globes.map(({mesh,...v})=>({...v,mesh:mesh.name})),retainedVisibleMeshes:retained.map(o=>o.name),changes:['Original projected front vertices are retained. A few source crown/chin vertices had conflicting inferred Z at identical XY; they are repaired from the existing rear seam/profile, with the maximum depth difference recorded. Mouth edges receive plane-preserving conforming splits.','Old eye/mouth RGBA rings are retained as original cosmetic paint, not structural closure. New opaque skin annuli connect the original openings continuously.','Eye globes use the exact source neutral sclera front cap and a rounded hidden posterior body; no larger projected round eye is introduced.','The mouth colored fan becomes the back of a real 0.075-deep oral lining; the original tongue moves 0.041 backwards with XY/paint intact.'],limitations:['Closed-mouth seam can have intentional coincident/contact triangles. Open-state and self-intersection tests still required.','Original source scalp/hair/body are unchanged; their side-view deficiencies are not repaired by this head candidate. Cosmetic face paint remains a surface-fitted decal, not a rebuilt unified UV atlas.','New hidden orbital/oral colors are palette-derived hypotheses. Actual front image and side/rear review is required.']};
 character.update(0,0,{mode:'manual',framing:'full',yaw:0,pitch:0,mood:'neutral',blink:0,talk:0,gazeX:0,gazeY:0});
 return{root,manifest,headMesh,globes,retained,update};
}
