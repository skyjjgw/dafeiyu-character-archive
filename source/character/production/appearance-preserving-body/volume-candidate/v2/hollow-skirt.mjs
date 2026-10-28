import * as THREE from '../../../rig3d-prototype/vendor/three.module.js';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const SKIRT='continuous flared skirt, painted front apron and encircling ivory hem';
const mix=(a,b,t)=>a+(b-a)*t;

/** Structural candidate only: two independent hollow cloth sheets, not physics. */
export function installHollowSkirt(model,{depthGain=.85,thickness=.0035}={}){
  let mesh;model.root.traverse(o=>{if(o.isMesh&&o.name===SKIRT)mesh=o;});
  if(!mesh)throw Error('Selected original skirt is required');
  const previous=mesh.geometry,previousMaterial=mesh.material,rings=mesh.userData.volumeStudy.sectionRings,N=96,ROWS=29;
  if(rings.length!==ROWS||rings.some(r=>r.length!==N))throw Error('Source skirt rings mismatch');
  const source=previous.attributes.position;
  const frontHem=rings.at(-1).map((id,j)=>({x:source.getX(id),y:source.getY(id),theta:j/N*Math.PI*2})).filter(p=>Math.cos(p.theta)>=-1e-8).sort((a,b)=>a.x-b.x);
  function frontBoundary(x){for(let i=1;i<frontHem.length;i++)if(x<=frontHem[i].x){const a=frontHem[i-1],b=frontHem[i];return mix(a.y,b.y,clamp((x-a.x)/(b.x-a.x||1)));}return frontHem.at(-1).y;}
  const outerPoints=[],innerPoints=[];
  for(let row=0;row<ROWS;row++)for(let col=0;col<N;col++){
    const id=rings[row][col],t=row/(ROWS-1),theta=col/N*Math.PI*2,c=Math.cos(theta),s=Math.sin(theta),back=smooth(-c/.35),hem=source.getY(rings.at(-1)[col]);
    let x=source.getX(id),y=source.getY(id),z=-.015+(source.getZ(id)+.015)*(1+depthGain*smooth((t-.12)/.88));
    // The previously hidden back can gather inward and drape lower, while
    // remaining inside the original forward projection. Do not clone frontY
    // around the entire rear as though it were a measured horizontal hem.
    if(c<0){x*=1-.24*back*smooth((t-.10)/.90);const target=frontBoundary(x)+.045+.025*(-c);y+=(target-hem)*back*t*t;}
    outerPoints.push(new THREE.Vector3(x,y,z));
    const frill=smooth((t-.78)/.22),ripple=.010*Math.cos(theta*18)*frill*frill;
    const rx=mix(.245,.43,t)+ripple,rz=mix(.195,.46,t)+ripple;
    const ix=rx*s,iz=-.015+rz*c;
    const iyHem=frontBoundary(ix)+.029+.022*Math.max(0,-c)+.005*Math.sin(theta*18);
    const iy=mix(source.getY(rings[0][col])-.008,iyHem,t);
    innerPoints.push(new THREE.Vector3(ix,Math.max(iy,frontBoundary(ix)+.020),iz));
  }
  function sheet(points,name,painted){
    const position=[],uv=[],colors=[],skinIndex=[],skinWeight=[],blend=[],hemT=[],index=[];
    const p=previous.attributes,baseCount=points.length;
    for(let row=0;row<ROWS;row++)for(let col=0;col<N;col++){
      const id=rings[row][col],v=points[row*N+col];position.push(...v.toArray());
      uv.push(p.uv.getX(id),p.uv.getY(id));colors.push(p.color.getX(id),p.color.getY(id),p.color.getZ(id));
      for(let k=0;k<4;k++){skinIndex.push(p.skinIndex.array[id*4+k]);skinWeight.push(p.skinWeight.array[id*4+k]);}
      blend.push(painted?smooth((.17-Math.cos(col/N*Math.PI*2))/.42):1);hemT.push(row/(ROWS-1));
    }
    const outerIndex=[];for(let row=0;row<ROWS-1;row++)for(let col=0;col<N;col++){const a=row*N+col,b=(row+1)*N+col,n=(col+1)%N;outerIndex.push(a,b,row*N+n,row*N+n,b,(row+1)*N+n);}
    const surface=new THREE.BufferGeometry();surface.setAttribute('position',new THREE.Float32BufferAttribute(position,3));surface.setIndex(outerIndex);surface.computeVertexNormals();
    // Source winding is outward; preserve it and offset the inside surface
    // along actual local normals rather than closing the whole skirt volume.
    const normal=surface.attributes.normal;
    for(let v=0;v<baseCount;v++){
      const q=points[v].clone().addScaledVector(new THREE.Vector3().fromBufferAttribute(normal,v),-thickness);
      position.push(...q.toArray());uv.push(uv[v*2],uv[v*2+1]);colors.push(colors[v*3],colors[v*3+1],colors[v*3+2]);
      for(let k=0;k<4;k++){skinIndex.push(skinIndex[v*4+k]);skinWeight.push(skinWeight[v*4+k]);}blend.push(blend[v]);hemT.push(hemT[v]);
    }
    index.push(...outerIndex);for(let i=0;i<outerIndex.length;i+=3)index.push(outerIndex[i]+baseCount,outerIndex[i+2]+baseCount,outerIndex[i+1]+baseCount);
    // Only narrow fabric-edge rims. There is no center vertex/disk at waist
    // or hem: the garment openings and central cavity stay physically open.
    for(const row of[0,ROWS-1])for(let col=0;col<N;col++){const a=row*N+col,b=row*N+(col+1)%N,c=a+baseCount,d=b+baseCount;if(row===0)index.push(a,b,c,b,d,c);else index.push(a,c,b,b,c,d);}
    surface.dispose();const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(position,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(skinIndex,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(skinWeight,4));g.setAttribute('sideBlend',new THREE.Float32BufferAttribute(blend,1));g.setAttribute('hemT',new THREE.Float32BufferAttribute(hemT,1));g.setIndex(index);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
    g.userData={hollowCloth:true,baseCount,rows:ROWS,segments:N,thickness,waistLoop:Array.from({length:N},(_,i)=>i),hemLoop:Array.from({length:N},(_,i)=>(ROWS-1)*N+i),noCenterCaps:true};
    const material=new THREE.MeshBasicMaterial({map:painted?previousMaterial[0].map:null,color:0xffffff,vertexColors:painted,side:THREE.DoubleSide,toneMapped:false});
    const navy=previousMaterial[1].color.clone(),cream=previousMaterial[2].color.clone();
    material.onBeforeCompile=shader=>{
      shader.uniforms.sideNavy={value:navy};shader.uniforms.sideCream={value:cream};
      shader.vertexShader='attribute float sideBlend; attribute float hemT; varying float vSideBlend; varying float vHemT;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSideBlend=sideBlend;vHemT=hemT;');
      shader.fragmentShader='uniform vec3 sideNavy; uniform vec3 sideCream; varying float vSideBlend; varying float vHemT;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nvec3 inferredSide=mix(sideNavy,sideCream,smoothstep(0.85,0.88,vHemT));diffuseColor.rgb=mix(diffuseColor.rgb,inferredSide,vSideBlend);');
    };material.customProgramCacheKey=()=>name;material.name=name+' source palette blend, inferred side';
    return{geometry:g,material};
  }
  const outer=sheet(outerPoints,'outer skirt hollow cloth',true),lining=sheet(innerPoints,'independent petticoat hollow cloth',false);
  mesh.geometry=outer.geometry;mesh.material=outer.material;
  const inner=new THREE.SkinnedMesh(lining.geometry,lining.material);inner.name='independent hollow petticoat with folded hem';inner.frustumCulled=false;mesh.parent.add(inner);inner.bind(mesh.skeleton,mesh.bindMatrix);inner.bindMode=mesh.bindMode;
  model.root.updateMatrixWorld(true);
  const metadata={schema:'dafeiyu.selected-hollow-skirt.v2',scope:'Hollow fabric structural candidate, not physical cloth simulation or final clothing fidelity',sourceFrontProjection:'Outer forward vertices retain source XY; original painting kept. Back/inner projection stays inferred and must be checked by actual front render.',depthGain,clothThickness:thickness,layers:2,eachLayer:{rows:ROWS,segments:N,outerVertices:ROWS*N,totalVertices:ROWS*N*2,solidCenterCaps:false,waistOpening:true,hemOpening:true},geometry:'Closed thin cloth sheets with outer/inner faces and narrow edge rims; two independent layers separated in space. No solid skirt-body disk caps.',frontMaterial:'Original texture/UV/color on forward outer cloth; smooth blend over side into original inferred navy/cream palette. No new artwork or angle images.',changes:['Back Y/radius drape inferred inside original front projection instead of copying frontContour around rear','Independent smaller petticoat and actual gathered hem','Source22 skin bones/weights retained for outer and sampled for lining'],limitations:['Baked oblique projection and true-world hem need future consistent full-character camera calibration','Side/back colors remain inferred; smooth blend is not new source painting','No garment/body/inner self-collision solver or physical bending/stretch material','Source high-side hem is retained on forward boundary; this is not a claim every side-fold now meets target','No default/4348 promotion']};
  return{mesh,inner,outer,lining,metadata,previous,previousMaterial,dispose(){mesh.geometry=previous;mesh.material=previousMaterial;inner.removeFromParent();outer.geometry.dispose();outer.material.dispose();lining.geometry.dispose();lining.material.dispose();}};
}
