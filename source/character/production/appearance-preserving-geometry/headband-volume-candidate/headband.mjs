import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
const C=Math.cos(.06),S=Math.sin(.06),TAU=Math.PI*2,clamp=THREE.MathUtils.clamp,mix=THREE.MathUtils.lerp;
const local=([px,py])=>[(C*(px-815)-S*(py-583))/775,(-S*(px-815)-C*(py-583))/775];
const pixel=([x,y])=>[815+775*(C*x-S*y),583-775*(S*x+C*y)];
const sourceZ=(x,y)=>.052+.013*Math.cos(x*8)+.008*Math.sin(y*10);
const frillZ=(x,y)=>mix(sourceZ(x,y),.015+.50*Math.sqrt(Math.max(0,1-(x/.86)**2-((y-.17)/.78)**2)),.55);
const thetaOf=([x,y])=>clamp(Math.atan2(Math.max(0,(y-.17+.045*x)/.67),x/.74),0,Math.PI);
function archAt(theta){const radial=.072+.009*Math.cos(theta*28)*.45,x=(.74+radial)*Math.cos(theta);return[x,.17+(.67+radial)*Math.sin(theta)-.045*x,-.015];}
export function installContinuousHeadband(character,{subdivisions=2,thickness=.006}={}){
 const original=[];character.head.traverse(o=>{if(o.isMesh&&(/^(left|right)-painted-white-frill:/.test(o.name)||o.name==='continuous-rounded-three-dimensional-headband'))original.push({mesh:o,visible:o.visible});});
 if(original.length!==7)throw Error('Frozen original headband/frill mesh names changed');
 const sourceArch=original.find(e=>e.mesh.name==='continuous-rounded-three-dimensional-headband').mesh;
 const sourceFront=original.find(e=>e.mesh.name==='left-painted-white-frill:original-pixel-surface').mesh;
 const palette=sourceArch.geometry.attributes.color,light=new THREE.Color(0,0,0),shade=new THREE.Color(0,0,0);
 for(let i=0;i<palette.count;i++){light.r+=palette.getX(i)/palette.count;light.g+=palette.getY(i)/palette.count;light.b+=palette.getZ(i)/palette.count;}shade.copy(light).multiplyScalar(.9);
 const points=[],uv=[],paint=[],cloth=[],faces=[],chains=[];let sourceOutlineVertices=0;
 function add(x,y,z,paintWeight=0,color=light){const i=points.length;points.push([x,y,z]);const p=pixel([x,y]);uv.push([p[0]/1920,1-p[1]/1080]);paint.push(paintWeight);cloth.push(color.toArray());return i;}
 function frillVertex(p){const[x,y]=local(p),fade=clamp(p[1]/65,0,1);return add(x,y,frillZ(x,y),fade*fade*(3-2*fade));}
 const outlineRecords=[];
 for(const side of['right','left']){
  const patch=character.metadata.hair.patches.find(p=>p.name===side+'-painted-white-frill');if(!patch)throw Error('Source frill outline missing');
  let sourceOutline=patch.outline.map(p=>p.slice()),removedCropDegenerates=0;let cleanup=true;while(cleanup){cleanup=false;for(let i=0;i<sourceOutline.length;i++){const a=sourceOutline[(i+sourceOutline.length-1)%sourceOutline.length],b=sourceOutline[i],c=sourceOutline[(i+1)%sourceOutline.length],cross=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);if(Math.abs(cross)<1e-8){sourceOutline.splice(i,1);removedCropDegenerates++;cleanup=true;break;}}}
  const outline=sourceOutline.map(p=>new THREE.Vector2(...p)),ids=sourceOutline.map(frillVertex);sourceOutlineVertices+=patch.outline.length;
  const tris=THREE.ShapeUtils.triangulateShape(outline,[]).map(t=>t.map(i=>ids[i]));
  // Earcut removes collinear points along the source crop. Insert every such
  // original boundary point into the actual indexed edge before subdivision.
  const usedBase=new Set(tris.flat());for(const id of ids)if(!usedBase.has(id)){
   const q=points[id];let inserted=false;
   for(let ti=0;ti<tris.length&&!inserted;ti++)for(let j=0;j<3&&!inserted;j++){const a=tris[ti][j],b=tris[ti][(j+1)%3],c=tris[ti][(j+2)%3],p=points[a],r=points[b],dx=r[0]-p[0],dy=r[1]-p[1],len2=dx*dx+dy*dy,t=((q[0]-p[0])*dx+(q[1]-p[1])*dy)/len2,cross=(q[0]-p[0])*dy-(q[1]-p[1])*dx;
    if(t>1e-8&&t<1-1e-8&&Math.abs(cross)<1e-10*Math.sqrt(len2)){tris[ti]=[a,id,c];tris.push([id,b,c]);inserted=true;usedBase.add(id);}
   }if(!inserted)throw Error('Could not insert source collinear frill boundary point '+side+' '+id);
  }let localFaces=tris;
  const nearest=p=>{let best=0,d=Infinity;for(let i=0;i<sourceOutline.length;i++){const q=sourceOutline[i],r=(q[0]-p[0])**2+(q[1]-p[1])**2;if(r<d){best=i;d=r;}}return best;};
  const a=nearest(side==='left'?[240,469]:[1264,409]),b=nearest(side==='left'?[617,0]:[897,0]);
  let chain=[];for(let i=a;;i=(i+1)%ids.length){chain.push(ids[i]);if(i===b)break;if(chain.length>ids.length)throw Error('Source inner contour traversal failed');}
  const allBoundary=ids.slice();
  for(let level=0;level<subdivisions;level++){
   const mids=new Map(),mid=(a,b)=>{const key=a<b?a+','+b:b+','+a;if(mids.has(key))return mids.get(key);const p=points[a],q=points[b],x=(p[0]+q[0])/2,y=(p[1]+q[1])/2,px=pixel([x,y]);const id=frillVertex(px);mids.set(key,id);return id;};
   const next=[];for(const[a,b,c]of localFaces){const ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);next.push([a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]);}localFaces=next;
   const refined=[];for(let i=0;i<chain.length-1;i++)refined.push(chain[i],mid(chain[i],chain[i+1]));refined.push(chain.at(-1));chain=refined;
  }
  const attachmentEdges=new Map();for(const f of localFaces)for(let i=0;i<3;i++){const a=f[i],b=f[(i+1)%3],key=a<b?a+','+b:b+','+a;attachmentEdges.set(key,(attachmentEdges.get(key)||0)+1);}for(let i=0;i<chain.length-1;i++){const a=chain[i],b=chain[i+1],key=a<b?a+','+b:b+','+a;if(attachmentEdges.get(key)!==1)throw Error('Attachment edge is not an exact conforming frill boundary '+side+' '+key);}
  if(side==='left')chain.reverse();
  const lengths=[0];for(let i=1;i<chain.length;i++)lengths.push(lengths.at(-1)+Math.hypot(points[chain[i]][0]-points[chain[i-1]][0],points[chain[i]][1]-points[chain[i-1]][1]));
  const beginTheta=thetaOf(points[chain[0]]),endTheta=thetaOf(points[chain.at(-1)]),thetaMap=new Map(chain.map((id,i)=>[id,mix(beginTheta,endTheta,lengths[i]/lengths.at(-1))]));
  if(endTheta<=beginTheta)throw Error('Source inner contour endpoints do not follow the arch '+JSON.stringify({side,beginTheta,endTheta,a:points[chain[0]],b:points[chain.at(-1)],pixelsA:pixel(points[chain[0]]),pixelsB:pixel(points[chain.at(-1)])}));
  chains.push({side,ids:chain,thetaMap});faces.push(...localFaces);outlineRecords.push({side,originalBoundaryPoints:patch.outline.length,conformingBoundaryPoints:ids.length,removedZeroAreaCropPoints:removedCropDegenerates,sharedAttachmentVertices:chain.length,sourceInnerStart:sourceOutline[a],sourceInnerEnd:sourceOutline[b]});
 }
 const right=chains.find(c=>c.side==='right').ids,left=chains.find(c=>c.side==='left').ids,stations=[],stationTheta=id=>chains.find(c=>c.thetaMap.has(id))?.thetaMap.get(id)??thetaOf(points[id]);
 const push=(theta,id)=>stations.push({theta,id});
 function gap(thetaA,idA,thetaB,idB,includeA=true){const count=Math.max(1,Math.ceil((thetaB-thetaA)/(Math.PI/96)));for(let i=includeA?0:1;i<count;i++){const t=i/count,theta=mix(thetaA,thetaB,t),a=points[idA],b=points[idB],x=mix(a[0],b[0],t),y=mix(a[1],b[1],t);push(theta,i===0?idA:add(x,y,frillZ(x,y),0));}}
 if(stationTheta(right[0])>1e-6){const begin=add(.74,.17-.045*.74,.055);gap(0,begin,stationTheta(right[0]),right[0]);}for(const id of right)push(stationTheta(id),id);
 gap(stationTheta(right.at(-1)),right.at(-1),stationTheta(left[0]),left[0],false);for(const id of left)push(stationTheta(id),id);
 if(stationTheta(left.at(-1))<Math.PI-1e-6){const end=add(-.74,.17+.045*.74,.055);gap(stationTheta(left.at(-1)),left.at(-1),Math.PI,end,false);push(Math.PI,end);}
 const columns=8,grid=[stations.map(s=>s.id)];
 for(let row=1;row<=columns;row++){const t=row/columns,ids=[];for(const station of stations){const front=points[station.id],back=archAt(station.theta),x=mix(front[0],back[0],t),y=mix(front[1],back[1],t),z=mix(front[2],back[2],t)+.009*Math.sin(Math.PI*t)*Math.cos(station.theta*28);ids.push(add(x,y,z,0));}grid.push(ids);}
 for(let row=0;row<columns;row++)for(let i=0;i<stations.length-1;i++){const a=grid[row][i],b=grid[row][i+1],c=grid[row+1][i],d=grid[row+1][i+1];faces.push([a,b,c],[b,d,c]);}
 // Drop source earcut's unused collinear crop vertices, rather than carrying
 // unreferenced zero-normal copies into the underside. No visible XY moves.
 const used=[...new Set(faces.flat())].sort((a,b)=>a-b),remap=new Map(used.map((id,i)=>[id,i]));
 const pp=used.map(i=>points[i]),uu=used.map(i=>uv[i]),ww=used.map(i=>paint[i]),cc=used.map(i=>cloth[i]);points.splice(0,points.length,...pp);uv.splice(0,uv.length,...uu);paint.splice(0,paint.length,...ww);cloth.splice(0,cloth.length,...cc);for(const f of faces)for(let i=0;i<3;i++)f[i]=remap.get(f[i]);
 // Orient the connected top surface from shared indexed edges before generating
 // a single underside and outer rim. The attachment is not duplicated geometry.
 const topEdges=new Map();for(let ti=0;ti<faces.length;ti++)for(let i=0;i<3;i++){const a=faces[ti][i],b=faces[ti][(i+1)%3],k=a<b?a+','+b:b+','+a;if(!topEdges.has(k))topEdges.set(k,[]);topEdges.get(k).push({ti,a,b,sign:a<b?1:-1});}
 if([...topEdges.values()].some(e=>e.length>2))throw Error('Top surface attachment is nonmanifold');
 const links=Array.from({length:faces.length},()=>[]);for(const e of topEdges.values())if(e.length===2){const[a,b]=e;links[a.ti].push([b.ti,a.sign===b.sign?-1:1]);links[b.ti].push([a.ti,a.sign===b.sign?-1:1]);}
 const signs=new Int8Array(faces.length);let components=0;for(let i=0;i<faces.length;i++)if(!signs[i]){components++;signs[i]=1;const stack=[i];while(stack.length){const a=stack.pop();for(const[b,m]of links[a])if(!signs[b]){signs[b]=signs[a]*m;stack.push(b);}else if(signs[b]!==signs[a]*m)throw Error('Nonorientable band/frill union');}}
 if(components!==1)throw Error('Frill and band are not one shared surface: '+components);
 for(let i=0;i<faces.length;i++)if(signs[i]<0)[faces[i][1],faces[i][2]]=[faces[i][2],faces[i][1]];
 let nz=0;const normals=points.map(()=>new THREE.Vector3());for(const[a,b,c]of faces){const n=new THREE.Vector3().subVectors(new THREE.Vector3(...points[b]),new THREE.Vector3(...points[a])).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...points[c]),new THREE.Vector3(...points[a])));nz+=n.z;for(const id of[a,b,c])normals[id].add(n);}
 if(nz<0){for(const f of faces)[f[1],f[2]]=[f[2],f[1]];normals.forEach(n=>n.negate());}
 const topCount=points.length,topFaceCount=faces.length;
 for(let i=0;i<topCount;i++){const n=normals[i].normalize(),p=points[i];points.push([p[0]-thickness*n.x,p[1]-thickness*n.y,p[2]-thickness*n.z]);uv.push(uv[i].slice());paint.push(paint[i]);cloth.push(shade.toArray());}
 const sourceFaces=faces.slice();for(const[a,b,c]of sourceFaces)faces.push([a+topCount,c+topCount,b+topCount]);
 const boundary=[];for(const e of topEdges.values())if(e.length===1){let{a,b,ti}=e[0];if(signs[ti]<0)[a,b]=[b,a];if(nz<0)[a,b]=[b,a];boundary.push([a,b]);faces.push([a,b+topCount,b],[a,a+topCount,b+topCount]);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv.flat(),2));geometry.setAttribute('clothColor',new THREE.Float32BufferAttribute(cloth.flat(),3));geometry.setAttribute('paintWeight',new THREE.Float32BufferAttribute(paint,1));geometry.setIndex(faces.flat());geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const material=new THREE.ShaderMaterial({uniforms:{sourceTexture:{value:sourceFront.material.map},diagnosticSolid:{value:false}},side:THREE.FrontSide,toneMapped:false,vertexShader:`attribute vec3 clothColor;attribute float paintWeight;varying vec2 vUv;varying vec3 vClothColor;varying float vPaint;void main(){vUv=uv;vClothColor=clothColor;vPaint=paintWeight;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`uniform sampler2D sourceTexture;uniform bool diagnosticSolid;varying vec2 vUv;varying vec3 vClothColor;varying float vPaint;void main(){vec3 source=texture2D(sourceTexture,vUv).rgb;float high=max(source.r,max(source.g,source.b));float low=min(source.r,min(source.g,source.b));float chroma=(high-low)/(high+0.025);float clothTrust=1.0-smoothstep(0.18,0.42,chroma);gl_FragColor=vec4(mix(vClothColor,source,diagnosticSolid?0.0:clamp(vPaint,0.0,1.0)*clothTrust),1.0);\n#include <tonemapping_fragment>
#include <colorspace_fragment>}`});
 const mesh=new THREE.Mesh(geometry,material);mesh.name='continuous-selected-frill-and-headband-thin-shell';character.head.add(mesh);for(const e of original)e.mesh.visible=false;
 const metadata={schema:'dafeiyu.selected-continuous-headband.candidate.v1',revision:'palette-and-both-sides-fixed-safe-cloth-color-reconstruction',source:'frozen original frill outlines / white-grey pixels / arch palette and arch outer silhouette',scope:'Independent complete band/frill topological union; not final all-angle art or cloth dynamics',originalMeshesReplaced:original.map(e=>e.mesh.name),sourceOutlineVertices,outlineRecords,uniformRefinementRounds:subdivisions,topVertices:topCount,topTriangles:topFaceCount,closedVertices:points.length,closedTriangles:faces.length,sharedAttachmentVertices:chains.reduce((n,c)=>n+c.ids.length,0),bandStations:stations.length,crossDepthColumns:columns,thickness,coordinateUnits:'uncalibrated source units',frontXY:'Original frill polygon and UV retained. New arch/ribbon interpolated in depth; underside thickness changes projected XY locally.',paint:'Original white-grey source pixels retained on observed frill; cropped top smoothly uses original arch palette, opaque full cloth. No source image edits.',paintRepair:'Source UV contains neighbouring blue hair pixels. High-chroma non-cloth samples smoothly reconstruct from original arch white-grey palette. These inferred cloth regions are not claimed to be original-author paint. Same-geometry solid diagnostic confirmed texture contamination in the reviewed 90-degree frame.',physicalStatus:'Conforming indexed topology only; strict crossing diagnostic FAILED with 4108 pairs. No cloth solver, physical quality pass or native integration.'};
 return{mesh,metadata,original,dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();for(const e of original)e.mesh.visible=e.visible;}};
}
