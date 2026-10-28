import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
const C=Math.cos(.06),S=Math.sin(.06),mix=THREE.MathUtils.lerp,clamp=THREE.MathUtils.clamp;
function sourcePixel(x,y){return[815+775*(C*x-S*y),583-775*(S*x+C*y)];}
function inside(p,poly){let value=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])value=!value;}return value;}
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
export const DEFAULT_PARAMETERS=Object.freeze({uSegments:240,vSegments:32,axisX:.73,axisY:.67,axisZ:.43,backAxisZ:.52,centerY:.17,centerZ:-.03,tilt:.30,betaBack:-.20,betaFront:.25,crownFrontExtra:-.41,bandClearance:.004,frillFraction:.32,frillWidth:.150,scallopAmplitude:.035,pleatAmplitude:.009,lobes:16,thickness:.003});
export function createRibbonGeometry({sourceOutlines=[],sourceArchColors=null,...options}={}){
 const o={...DEFAULT_PARAMETERS,...options};for(const[k,v]of Object.entries(o))if(!Number.isFinite(v))throw Error('Nonfinite ribbon parameter '+k);
 if(o.uSegments<32||o.vSegments<8||o.thickness<0||o.betaBack>=o.betaFront||o.frillFraction<=0||o.frillFraction>=1)throw Error('Invalid single-domain ribbon parameters');
 const U=Math.floor(o.uSegments),V=Math.floor(o.vSegments),points=[],uv=[],uv1=[],colors=[],params=[],normals=[],topFaces=[],indices=[],ct=Math.cos(o.tilt),st=Math.sin(o.tilt);
 const fallback=new THREE.Color(0xddd9de),pale=new THREE.Color();
 const outlinesLocal=sourceOutlines.map(poly=>poly.map(([px,py])=>[(C*(px-815)-S*(py-583))/775,(-S*(px-815)-C*(py-583))/775]));
 function paintAt(u,t,p,inner){
  if(t>o.frillFraction)return{pixel:sourcePixel(p[0],p[1]),weight:0};
  const d=[Math.cos(u),.67/.74*Math.sin(u)-.045*Math.cos(u)],cross=(a,b)=>a[0]*b[1]-a[1]*b[0];let choice=null;
  for(const poly of outlinesLocal){const hits=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],e=[b[0]-a[0],b[1]-a[1]],rel=[a[0],a[1]-.17],den=cross(d,e);if(Math.abs(den)<1e-12)continue;const r=cross(rel,e)/den,k=cross(rel,d)/den;if(r>0&&k>=-1e-8&&k<=1+1e-8)hits.push(r);}hits.sort((a,b)=>a-b);for(let i=0;i<hits.length-1;i++){const a=hits[i],b=hits[i+1];if(b-a<1e-6)continue;const m=(a+b)/2;if(inside([m*d[0],.17+m*d[1]],poly)&&(!choice||b>choice[1]))choice=[a,b];}}
  if(!choice)return{pixel:sourcePixel(p[0],p[1]),weight:0};
  const r=mix(choice[1],choice[0],t/o.frillFraction),pixel=sourcePixel(r*d[0],.17+r*d[1]),weight=pixel[1]>0&&pixel[1]<1080?smooth(pixel[1]/65):0;return{pixel,weight};
 }

 function palette(u,t,inner){if(sourceArchColors){const row=Math.round(u/Math.PI*96),col=Math.round(t*16),i=Math.min(sourceArchColors.count-1,row*17+col);pale.setRGB(sourceArchColors.getX(i),sourceArchColors.getY(i),sourceArchColors.getZ(i));}else pale.copy(fallback);if(inner)pale.multiplyScalar(.94);return pale.toArray();}
 function position(u,t,inner){
  const s=Math.sin(u),c=Math.cos(u),side=1-.88*Math.pow(s,8),end=smooth(u/.12)*smooth((Math.PI-u)/.12),front=o.betaFront+o.crownFrontExtra*Math.pow(s,4),beta=mix(front,o.betaBack,t),cb=Math.cos(beta),sb=Math.sin(beta);
  const q=[c*cb,ct*s*cb-st*sb,st*s*cb+ct*sb],b=[o.axisX*q[0],o.axisY*q[1],(q[2]>=0?o.axisZ:o.backAxisZ)*q[2]],len=Math.hypot(...b),frill=1-smooth(t/o.frillFraction),scallop=.5+.5*Math.cos(o.lobes*u),pleat=Math.cos(o.lobes*u)*Math.sin(Math.PI*clamp(t/o.frillFraction,0,1));
  const radial=o.bandClearance+end*side*frill*(o.frillWidth+o.scallopAmplitude*scallop)+end*side*o.pleatAmplitude*pleat*frill,outer=len+radial-(inner?o.thickness:0),scale=outer/len;
  if(outer<=.1)throw Error('Ribbon radial thickness inversion');return[b[0]*scale,o.centerY+b[1]*scale,o.centerZ+b[2]*scale];
 }
 for(let layer=0;layer<2;layer++)for(let i=0;i<=U;i++)for(let j=0;j<=V;j++){
  const u=i/U*Math.PI,t=j/V,p=position(u,t,layer===1),painting=paintAt(u,t,p,layer===1),pixel=painting.pixel;points.push(...p);uv.push(pixel[0]/1920,1-pixel[1]/1080);
  uv1.push(painting.weight,t);colors.push(...palette(u,t,layer===1));params.push(u,t,layer);
 }
 const topCount=(U+1)*(V+1),id=(i,j)=>i*(V+1)+j;
 for(let i=0;i<U;i++)for(let j=0;j<V;j++){const a=id(i,j),b=id(i+1,j),c=id(i,j+1),d=id(i+1,j+1);topFaces.push([a,c,b],[b,c,d]);}
 // Directly verify outer winding against the actual radial direction.
 let positive=0;for(const f of topFaces){const[a,b,c]=f.map(i=>new THREE.Vector3(...points.slice(i*3,i*3+3))),n=b.clone().sub(a).cross(c.clone().sub(a)),rad=a.clone().sub(new THREE.Vector3(0,o.centerY,o.centerZ));positive+=n.dot(rad);}if(positive<0)for(const f of topFaces)[f[1],f[2]]=[f[2],f[1]];
 for(const f of topFaces)indices.push(...f);for(const[a,b,c]of topFaces)indices.push(a+topCount,c+topCount,b+topCount);
 const boundary=[];for(let i=0;i<U;i++)boundary.push([id(i,0),id(i+1,0)],[id(i+1,V),id(i,V)]);for(let j=0;j<V;j++)boundary.push([id(0,j+1),id(0,j)],[id(U,j),id(U,j+1)]);
 // Derive rim direction from oriented top faces, not guessed tube cap winding.
 const edgeDirection=new Map();for(const f of topFaces)for(let k=0;k<3;k++){const a=f[k],b=f[(k+1)%3],key=a<b?a+','+b:b+','+a;edgeDirection.set(key,[a,b]);}
 for(const edge of boundary){const key=edge[0]<edge[1]?edge.join(','):edge.toReversed().join(','),[a,b]=edgeDirection.get(key);indices.push(a,b+topCount,b,a,a+topCount,b+topCount);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setAttribute('uv1',new THREE.Float32BufferAttribute(uv1,2));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('ribbonParam',new THREE.Float32BufferAttribute(params,3));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const surfaceGeometry=new THREE.BufferGeometry();surfaceGeometry.setAttribute('position',new THREE.Float32BufferAttribute(points.slice(0,topCount*3),3));surfaceGeometry.setIndex(topFaces.flat());surfaceGeometry.computeVertexNormals();
 const metadata={schema:'dafeiyu.scalp-ribbon-headband.v2',parameters:o,coordinateSystem:'Original Head local +Y up +Z front; no scene-scale calibration',domain:{u:[0,Math.PI],v:[0,1],uMonotonic:true,vBetaMonotonic:true,embedding:'Rotated ellipsoid direction followed by a positive radial graph; inner layer uses identical directions and finite radial thickness. No cropped-outline station forcing.',midSurfaceVertices:topCount,midSurfaceTriangles:topFaces.length},sourcePaint:'Original frill white-grey source radial-interval UV remap by u where observed; high-chroma neighbouring hair samples reconstruct from original arch palette. Unknown cloth is inferred, not original-author paint.',thicknessMode:'Finite radial distance, .003 uncalibrated source units by default; no average-normal fold inversion',physicalStatus:'Rest geometry only; not yet cloth dynamics or complete avatar physics'};
 return{geometry,surfaceGeometry,metadata,positions:points,indices,topFaces,topCount};
}
export function createRibbonMaterial(texture){return new THREE.ShaderMaterial({uniforms:{sourceTexture:{value:texture},diagnosticSolid:{value:false},diagnosticRegions:{value:false},frillFraction:{value:DEFAULT_PARAMETERS.frillFraction}},vertexColors:true,side:THREE.FrontSide,toneMapped:false,vertexShader:`attribute vec2 uv1;attribute vec3 ribbonParam;varying vec2 vSourceUv;varying vec3 vCloth;varying float vPaint;varying float vBandT;varying float vLayer;varying vec3 vNormalWorld;void main(){vSourceUv=uv;vCloth=color;vPaint=uv1.x;vBandT=uv1.y;vLayer=ribbonParam.z;vNormalWorld=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`uniform sampler2D sourceTexture;uniform bool diagnosticSolid;uniform bool diagnosticRegions;uniform float frillFraction;varying vec2 vSourceUv;varying vec3 vCloth;varying float vPaint;varying float vBandT;varying float vLayer;varying vec3 vNormalWorld;void main(){vec3 n=normalize(vNormalWorld);float shade=0.86+0.14*max(0.0,dot(n,normalize(vec3(-3.0,6.0,5.0))));vec3 source=texture2D(sourceTexture,vSourceUv).rgb;float high=max(source.r,max(source.g,source.b));float low=min(source.r,min(source.g,source.b));float trust=1.0-smoothstep(0.18,0.42,(high-low)/(high+0.025));gl_FragColor=vec4(mix(vCloth*shade,source,diagnosticSolid?0.0:vPaint*trust),1.0);if(diagnosticRegions)gl_FragColor=vec4(vBandT<frillFraction?(vLayer<.5?vec3(.8,.08,.25):vec3(.95,.28,.025)):vec3(.05,.7,.8),1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>}`});}
export function installScalpRibbonHeadband(character,options={}){
 const original=[];character.head.traverse(o=>{if(o.isMesh&&(/^(left|right)-painted-white-frill:/.test(o.name)||o.name==='continuous-rounded-three-dimensional-headband'))original.push({mesh:o,visible:o.visible});});if(original.length!==7)throw Error('Frozen original headpiece names changed');
 const arch=original.find(e=>e.mesh.name==='continuous-rounded-three-dimensional-headband').mesh,source=original.find(e=>e.mesh.name==='left-painted-white-frill:original-pixel-surface').mesh,sourceOutlines=character.metadata.hair.patches.filter(p=>p.type==='frill').map(p=>p.outline),data=createRibbonGeometry({sourceOutlines,sourceArchColors:arch.geometry.attributes.color,...options}),material=createRibbonMaterial(source.material.map),mesh=new THREE.Mesh(data.geometry,material);mesh.name='selected-maid-headband-scalp-ribbon-v2';character.head.add(mesh);original.forEach(e=>e.mesh.visible=false);
 return{...data,mesh,material,metadata:{...data.metadata,originalMeshesReplaced:original.map(e=>e.mesh.name)},dispose(){mesh.removeFromParent();data.geometry.dispose();data.surfaceGeometry.dispose();material.dispose();original.forEach(e=>e.mesh.visible=e.visible);}};
}
