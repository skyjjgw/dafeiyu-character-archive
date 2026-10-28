import * as THREE from '../../../rig3d-prototype/vendor/three.module.js';

const clamp=THREE.MathUtils.clamp;
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
const own=(resources,value)=>(resources?.add?.(value),value);
export const SCALP_SHAPE=Object.freeze({top:.84,centerY:.17,height:.67,width:.73,centerZ:-.03,frontDepth:.43,backDepth:.52});

export function scalpLowerBoundary(theta){
  const c=Math.cos(theta);
  return c>=0?.34-.74*Math.pow(Math.abs(Math.sin(theta)),1.6):-.40-.08*Math.pow(-c,1.5);
}

export function scalpFrontSurfaceZ(x,y){
  const s=SCALP_SHAPE,ellipse=1-((y-s.centerY)/s.height)**2-(x/s.width)**2;
  return s.centerZ+s.frontDepth*Math.sqrt(Math.max(0,ellipse));
}

// Rear auxiliary coordinates stop before the white clothing bow at y≈380.
// Only this continuous blue region is sampled; no clothing follows the head.
const BLUE_ROWS=[[96,43],[120,73],[150,94],[180,102],[220,108],[260,108],[300,106],[340,100],[370,76]];
function blueUV(theta,sourceY){
  const py=clamp(sourceY,100,370);let half=BLUE_ROWS.at(-1)[1];
  for(let i=0;i<BLUE_ROWS.length-1;i++)if(py>=BLUE_ROWS[i][0]&&py<=BLUE_ROWS[i+1][0]){
    const a=BLUE_ROWS[i],b=BLUE_ROWS[i+1];half=THREE.MathUtils.lerp(a[1],b[1],(py-a[0])/(b[0]-a[0]));break;
  }
  return[(1818-half*Math.sin(theta))/2043,1-py/770];
}

function makeMaterials(resources,turnaroundTexture){
  const blue=own(resources,new THREE.MeshToonMaterial({color:0x304b74,vertexColors:true,side:THREE.FrontSide}));
  const rear=turnaroundTexture?.isTexture?own(resources,new THREE.MeshBasicMaterial({map:turnaroundTexture,color:0xfff0cf,toneMapped:false,side:THREE.FrontSide})):blue;
  return[blue,rear];
}

function createScalp(resources,turnaroundTexture){
  const s=SCALP_SHAPE,rows=48,cols=96,positions=[],uv=[],colors=[],frontIndices=[],rearIndices=[];
  const dark=new THREE.Color(0x8394ab),light=new THREE.Color(0xb5c6dc),temp=new THREE.Color();
  function layer(inner){
    const start=positions.length/3;
    for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){
      const theta=2*Math.PI*col/cols,bottom=scalpLowerBoundary(theta),height=s.height-(inner?.025:0),top=s.top-(inner?.022:0);
      const cy=top-height,limit=Math.acos(clamp((bottom+(inner?.018:0)-cy)/height,-1,1)),phi=limit*row/rows;
      const radius=Math.sin(phi),y=cy+height*Math.cos(phi),depth=(Math.cos(theta)>=0?s.frontDepth:s.backDepth)-(inner?.027:0);
      positions.push((s.width-(inner?.027:0))*radius*Math.sin(theta),y,s.centerZ+depth*radius*Math.cos(theta));
      uv.push(...blueUV(theta,100+(.84-y)/1.32*270));
      temp.copy(dark).lerp(light,.46+.24*Math.cos(phi));colors.push(temp.r,temp.g,temp.b);
    }
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const a=start+row*(cols+1)+col,b=a+cols+1,indices=!inner&&Math.cos(2*Math.PI*(col+.5)/cols)<0?rearIndices:frontIndices;
      if(inner)indices.push(a,a+1,b,b,a+1,b+1);else indices.push(a,b,a+1,b,b+1,a+1);
    }
    return start;
  }
  const outer=layer(false),inner=layer(true);
  // Seal the opening's rim: a real hair shell, rather than an open half sphere.
  for(let col=0;col<cols;col++){
    const a=outer+rows*(cols+1)+col,b=inner+rows*(cols+1)+col;
    frontIndices.push(a,a+1,b,b,a+1,b+1);
  }
  const geometry=own(resources,new THREE.BufferGeometry());
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.setIndex([...frontIndices,...rearIndices]);geometry.addGroup(0,frontIndices.length,0);geometry.addGroup(frontIndices.length,rearIndices.length,1);geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,makeMaterials(resources,turnaroundTexture));mesh.name='continuous-scalp-front-side-back-shell';
  mesh.userData.structure={type:'continuous-scalp-shell',rows,cols,outerCount:(rows+1)*(cols+1),shape:s};return mesh;
}

function createPosterior(resources,turnaroundTexture){
  const rows=64,cols=96,positions=[],uv=[],colors=[],weights=[],frontIndices=[],rearIndices=[];
  const color=new THREE.Color();
  for(let row=0;row<=rows;row++){
    const t=row/rows,close=Math.sqrt(Math.max(0,1-smooth(.29,1,t)**2)),width=.73*(1-.14*smooth(0,1,t))*close;
    const cy=.18-1.17*t,cz=-.03-.22*smooth(0,.85,t),frontDepth=(.10+.33*(1-smooth(0,.30,t)))*close,backDepth=.52*(1-.54*t)*close;
    for(let col=0;col<=cols;col++){
      const theta=2*Math.PI*col/cols,c=Math.cos(theta),ripple=1+.025*Math.cos(theta*6+t*.9)*Math.sin(Math.PI*t);
      positions.push(width*Math.sin(theta)*ripple,cy,cz+(c>=0?frontDepth:backDepth)*c*ripple);
      uv.push(...blueUV(theta,235+135*t));
      color.setHex(0x91a2ba).multiplyScalar(.86+.12*(1-t));colors.push(color.r,color.g,color.b);weights.push(t*t*t*.65);
      if(row<rows&&col<cols){const a=row*(cols+1)+col,b=a+cols+1,indices=Math.cos(2*Math.PI*(col+.5)/cols)<0?rearIndices:frontIndices;indices.push(a,b,a+1,b,b+1,a+1);}
    }
  }
  // Close the top. It lies inside the scalp, so neither a sheet nor a neck gap
  // can be seen when the camera turns to the side or the rear.
  const center=positions.length/3;positions.push(0,.18,-.03);uv.push(...blueUV(Math.PI,235));colors.push(1,1,1);weights.push(0);
  for(let col=0;col<cols;col++)frontIndices.push(center,col+1,col);
  const geometry=own(resources,new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.setIndex([...frontIndices,...rearIndices]);geometry.addGroup(0,frontIndices.length,0);geometry.addGroup(frontIndices.length,rearIndices.length,1);geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,makeMaterials(resources,turnaroundTexture));mesh.name='rounded-posterior-waterfall-hair-volume';
  mesh.userData.structure={type:'closed-elliptical-waterfall',rows,cols};
  return{mesh,geometry,rest:Float32Array.from(positions),weights:Float32Array.from(weights)};
}

function createHeadband(resources){
  const segments=96,cols=16,positions=[],colors=[],indices=[],shade=new THREE.Color(0xbbb9c5),light=new THREE.Color(0xebe8e9),color=new THREE.Color();
  for(let i=0;i<=segments;i++){
    const a=Math.PI*i/segments,c=Math.cos(a),s=Math.sin(a),pleat=.009*Math.cos(a*28);
    for(let j=0;j<=cols;j++){
      const phi=2*Math.PI*j/cols,radial=.036+.036*Math.cos(phi)+pleat*.45;
      const x=(.74+radial)*c,y=.17+(.67+radial)*s,z=-.015+.070*Math.sin(phi)+pleat*Math.sin(phi);
      positions.push(x,y-.045*x,z);
      color.copy(light).lerp(shade,.18+.22*(.5+.5*Math.cos(a*28+phi*.5)));colors.push(color.r,color.g,color.b);
      if(i<segments&&j<cols){const b=i*(cols+1)+j,d=b+cols+1;indices.push(b,d,b+1,d,d+1,b+1);}
    }
  }
  const geometry=own(resources,new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const material=own(resources,new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false,side:THREE.DoubleSide}));
  const mesh=new THREE.Mesh(geometry,material);mesh.name='continuous-rounded-three-dimensional-headband';return mesh;
}

export function createVolumetricHairScaffold({resources,turnaroundTexture}={}){
  const root=new THREE.Group();root.name='continuous-scalp-and-rear-hair';
  const scalp=createScalp(resources,turnaroundTexture),posterior=createPosterior(resources,turnaroundTexture),headband=createHeadband(resources);root.add(scalp,posterior.mesh,headband);
  function deform(sway,pitch){
    const p=posterior.geometry.attributes.position;
    for(let i=0;i<p.count;i++){
      const k=i*3,w=posterior.weights[i];p.array[k]=posterior.rest[k]+sway*w;p.array[k+1]=posterior.rest[k+1]-Math.abs(sway)*w*.08;p.array[k+2]=posterior.rest[k+2]+pitch*w;
    }
    p.needsUpdate=true;posterior.geometry.computeVertexNormals();posterior.geometry.computeBoundingSphere();
  }
  return{root,deform,metadata:{scalp:SCALP_SHAPE,frontOpeningY:.34,sideOpeningY:-.40,backOpeningY:-.48,posterior:'closed curved elliptical volume joining the scalp at the equator',headband:'rounded XY arch with front/back depth around z=0',rearTexture:turnaroundTexture?.isTexture?'turnaround-auxiliary-v2.png: blue rear-head pixels only, y100–370; no clothing bow':null,limitations:['Rear painting is inferred auxiliary art.','Lower rear flow stretches the safe blue region; it is not an authored final back view.']}};
}
