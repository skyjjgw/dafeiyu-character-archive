import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
import {DIGITS} from '../finger-rig.mjs';

const TAU=Math.PI*2, PPU=260;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
const sourcePoint=(x,y,z,side)=>[( (side==='left'?x:1156-x)-580)/PPU,.20+(835-y)/PPU,z];

// Actual safe source-hand pixels, combined with the old body's #ccd0c6 tint.
// The blue pixels between digits are deliberately not used as skin albedo.
const tint=new THREE.Color('#ccd0c6');
const sampled=(r,g,b)=>new THREE.Color().setRGB(r/255,g/255,b/255,THREE.SRGBColorSpace).multiply(tint);
const PALETTE={base:sampled(253,234,220),highlight:sampled(253,248,246),crease:sampled(250,200,179),shadow:sampled(227,186,176)};
const ROOT_RADII=[2.75,2.65,2.80,2.65,2.30];
const Z_RADII=[2.15,2.10,2.15,2.05,1.85];
const MCP_RADII=[2.40,1.65,1.70,1.65,1.50];
const MCP_Z_RADII=[1.90,1.45,1.45,1.40,1.30];
// Local hand repair: original star-fan tips were not an approved anatomy.
// Preserve wrist/cuff coordinates, use a rounder palm and a relaxed short fan.
export const RETOPO_DIGITS=Object.freeze([
  {name:'thumb',base:[398,882],tip:[407,889],fractions:[0,.42,.72],maxFlex:[28,50,45]},
  {name:'index',base:[395,886.5],tip:[398,902],fractions:[0,.42,.72],maxFlex:[60,80,55]},
  {name:'middle',base:[389,888],tip:[389.3,905.5],fractions:[0,.42,.72],maxFlex:[65,85,60]},
  {name:'ring',base:[383,887],tip:[380.4,903.5],fractions:[0,.42,.72],maxFlex:[65,85,60]},
  {name:'little',base:[378,884.5],tip:[373.7,898],fractions:[0,.42,.72],maxFlex:[60,80,55]},
]);
// Additional rings around all three bending sites, not a triangulated lens.
const LEVELS=[0,.025,.055,.09,.14,.22,.30,.35,.38,.40,.42,.44,.47,.50,.57,.63,.67,.69,.71,.72,.74,.77,.81,.86,.90,.935,.96,.98,1];

function segmentDistance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],q=clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1));return Math.hypot(p[0]-a[0]-dx*q,p[1]-a[1]-dy*q);}
function distanceToPolygon(p,poly){let d=Infinity;for(let i=0;i<poly.length;i++)d=Math.min(d,segmentDistance(p,poly[i],poly[(i+1)%poly.length]));return d;}

/**
 * One continuous watertight five-digit hand in the selected body's bind units.
 * Local proportions repair replaces the old star-fan endpoints. The wrist and
 * cuff stay in the source bind frame. UV is diagnostic: material is skin COLOR.
 */
export function createRetopologizedHand({side='left',radialSegments=32}={}){
  if(!['left','right'].includes(side))throw new TypeError('side must be left or right');
  if(radialSegments<16||radialSegments%4)throw new RangeError('radialSegments must be a multiple of 4, >=16');
  const N=radialSegments,half=N/2,centerZ=.1775;
  const digits=RETOPO_DIGITS.map((d,id)=>{const dx=d.tip[0]-d.base[0],dy=d.tip[1]-d.base[1],length=Math.hypot(dx,dy);return {...d,id,axis:[dx/length,dy/length],cross:[-dy/length,dx/length],length,radius:MCP_RADII[id],zRadius:MCP_Z_RADII[id],bodyRadius:ROOT_RADII[id],bodyZRadius:Z_RADII[id]};});
  const positions=[],uv=[],params=[],sourcePixels=[],triangles=[],regions=[];
  const vertices=[];
  function add(px,py,z,digit=-1,t=0,influence=0,region='palm'){
    const id=positions.length/3;
    positions.push(...sourcePoint(px,py,z,side));uv.push((side==='left'?px:1156-px)/1144,1-py/1375);
    params.push(digit,t,influence);sourcePixels.push(px,py);vertices.push({px,py,z,digit,t,region});return id;
  }
  // Boundary visits the wrist and each MCP root in the original open fan.
  // A root's front/back semicircles are also the palm's exact boundary vertices.
  const corners=[[397,869]],rootEdges=new Map();
  for(const d of digits){
    const start=[d.base[0]-d.cross[0]*d.radius,d.base[1]-d.cross[1]*d.radius];
    const end=[d.base[0]+d.cross[0]*d.radius,d.base[1]+d.cross[1]*d.radius];
    corners.push(start,end);rootEdges.set(`${corners.length-2}:${corners.length-1}`,d);
  }
  corners.push([382,876]);
  const polygon=corners.map(p=>new THREE.Vector2(...p));
  const baseTriangles=THREE.ShapeUtils.triangulateShape(polygon,[]);
  if(baseTriangles.length!==corners.length-2)throw Error('Original hand root contour could not be triangulated');

  const rootRings=digits.map(d=>{
    const ring=[];
    for(let j=0;j<N;j++){
      const theta=Math.PI-TAU*j/N,c=Math.cos(theta),s=Math.sin(theta);
      ring.push(add(d.base[0]+d.cross[0]*d.radius*c,d.base[1]+d.cross[1]*d.radius*c,centerZ+d.zRadius/PPU*s,d.id,0,0,'MCP root'));
    }
    return ring;
  });
  const wristA=corners[0],wristB=corners.at(-1),wristLength=Math.hypot(wristB[0]-wristA[0],wristB[1]-wristA[1]);
  const wrist={base:[(wristA[0]+wristB[0])/2,(wristA[1]+wristB[1])/2],cross:[(wristB[0]-wristA[0])/wristLength,(wristB[1]-wristA[1])/wristLength],radius:wristLength/2,zRadius:4.8};
  wrist.axis=[wrist.cross[1],-wrist.cross[0]];
  const wristRing=[];
  for(let j=0;j<N;j++){
    const theta=Math.PI-TAU*j/N,c=Math.cos(theta),s=Math.sin(theta);
    wristRing.push(add(wrist.base[0]+wrist.cross[0]*wrist.radius*c,wrist.base[1]+wrist.cross[1]*wrist.radius*c,centerZ+wrist.zRadius/PPU*s,-1,0,0,'rounded wrist cap'));
  }
  const cornerIds=[[],[]],edgeIds=[new Map(),new Map()];
  for(let i=0;i<corners.length;i++){
    const root= i>=1&&i<=10 ? Math.floor((i-1)/2):null;
    let id;
    if(root!==null)id=rootRings[root][i%2===1?0:half];
    else id=wristRing[i===0?0:half];
    cornerIds[0].push(id);cornerIds[1].push(id);
  }
  function palmHeight(x,y){
    const edge=distanceToPolygon([x,y],corners),base=.0105*Math.sqrt(Math.sin(clamp(edge/9)*Math.PI/2));
    // Smooth boundary interpolation replaces a nearest-root switch. The old
    // switch changed height discontinuously between roots and made wrist saws.
    let height=0,total=0;
    for(let i=0;i<corners.length;i++){
      const j=(i+1)%corners.length,d=(i===corners.length-1?wrist:rootEdges.get(`${i}:${j}`));
      const distance=segmentDistance([x,y],corners[i],corners[j]),weight=1/(distance*distance+1e-8);
      let value=0;
      if(d){const across=((x-d.base[0])*d.cross[0]+(y-d.base[1])*d.cross[1])/d.radius;value=d.zRadius/PPU*Math.sqrt(Math.max(0,1-across*across));}
      height+=weight*value;total+=weight;
    }
    return base+(height/total)*Math.exp(-edge/4.6);
  }
  function palmVertex(x,y,back){return add(x,y,centerZ+(back?-1:1)*palmHeight(x,y),-1,0,0,back?'palm back':'palm front');}
  // Conforming edge lists preserve every root ring vertex. A plain earcut
  // would discard these projected-collinear points and leave hidden T-joints.
  function edgeSequence(a,b,back){
    const low=Math.min(a,b),high=Math.max(a,b),key=`${low}:${high}`;
    if(!edgeIds[back].has(key)){
      let sequence;
      if(low===0&&high===corners.length-1){
        sequence=Array.from({length:half+1},(_,j)=>wristRing[back?(N-j)%N:j]);
      }else if(rootEdges.has(key)){
        const d=rootEdges.get(key),ring=rootRings[d.id];
        sequence=Array.from({length:half+1},(_,j)=>ring[back?(N-j)%N:j]);
      }else{
        const boundary=(high===low+1||low===0&&high===corners.length-1);
        const aXY=corners[low],bXY=corners[high],steps=Math.max(3,Math.ceil(Math.hypot(aXY[0]-bXY[0],aXY[1]-bXY[1])/1.8));
        sequence=[cornerIds[back][low]];
        for(let j=1;j<steps;j++){
          const k=j/steps;
          let x=mix(aXY[0],bXY[0],k),y=mix(aXY[1],bXY[1],k);
          // Shared exact zero-thickness rim is the ordinary manifold seam
          // of this rounded surface, not an extruded vertical side wall.
          if(boundary){
            const frontKey=`${key}:${j}`;
            if(!edgeIds[0].has(frontKey))edgeIds[0].set(frontKey,add(x,y,centerZ,-1,0,0,'palm rim'));
            sequence.push(edgeIds[0].get(frontKey));
          }else sequence.push(palmVertex(x,y,back));
        }
        sequence.push(cornerIds[back][high]);
      }
      edgeIds[back].set(key,sequence);
    }
    const seq=edgeIds[back].get(key);
    return a===low?seq:[...seq].reverse();
  }
  function face(a,b,c,region){triangles.push(a,b,c);regions.push(region);}
  for(const back of [0,1])for(const tri of baseTriangles){
    const centre=tri.reduce((v,i)=>[v[0]+corners[i][0]/3,v[1]+corners[i][1]/3],[0,0]);
    const centroid=palmVertex(...centre,back);
    for(let e=0;e<3;e++){
      const edge=edgeSequence(tri[e],tri[(e+1)%3],back);
      for(let j=0;j<edge.length-1;j++){
        const a=vertices[edge[j]],b=vertices[edge[j+1]],c=vertices[centroid];
        const mid=palmVertex((a.px+b.px+c.px)/3,(a.py+b.py+c.py)/3,back);
        face(centroid,edge[j],mid,'palm');face(edge[j],edge[j+1],mid,'palm');face(edge[j+1],centroid,mid,'palm');
      }
    }
  }
  const wristCentre=add(...wrist.base,centerZ,-1,0,0,'wrist closed end');
  for(let j=0;j<N;j++)face(wristRing[j],wristRing[(j+1)%N],wristCentre,'wrist cap');

  for(const d of digits){
    let previous=rootRings[d.id];
    for(const t of LEVELS.slice(1)){
      const tipRoundStart=.88;
      const round=t<=tipRoundStart?1:Math.sqrt(Math.max(0,1-Math.pow((t-tipRoundStart)/(1-tipRoundStart),2)));
      if(t===1){
        const tip=add(...d.tip,centerZ,d.id,1,1,'rounded fingertip');
        for(let j=0;j<N;j++)face(previous[j],previous[(j+1)%N],tip,'finger tip');
        break;
      }
      const taper=mix(1,.69,t),jointBulge=1+.085*Math.exp(-Math.pow((t-.42)/.065,2))+.055*Math.exp(-Math.pow((t-.72)/.050,2));
      // Source MCP centres are close together; their attachment sockets must
      // fit between neighbouring digits. Grow into source phalanx width only
      // after the fan has physically separated, rather than intersecting roots.
      const grow=smooth(t/.22);
      const r=mix(d.radius,d.bodyRadius*taper,grow)*round*jointBulge,zr=mix(d.zRadius,d.bodyZRadius*taper,grow)*round*jointBulge;
      const influence=smooth(t/.13);
      const ring=[];
      for(let j=0;j<N;j++){
        const theta=Math.PI-TAU*j/N,c=Math.cos(theta),s=Math.sin(theta);
        ring.push(add(d.base[0]+d.axis[0]*d.length*t+d.cross[0]*r*c,d.base[1]+d.axis[1]*d.length*t+d.cross[1]*r*c,centerZ+zr/PPU*s,d.id,t,influence,t<.14?'MCP transition':Math.abs(t-.42)<.065?'PIP loops':Math.abs(t-.72)<.055?'DIP loops':'phalanx'));
      }
      for(let j=0;j<N;j++){const k=(j+1)%N;face(previous[j],previous[k],ring[j],'finger');face(previous[k],ring[k],ring[j],'finger');}
      previous=ring;
    }
  }

  // Orient every neighboring face consistently from topology, then choose
  // outward orientation by signed volume. This handles mirrored right hands.
  const oriented=orientClosedMesh(positions,triangles);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geometry.setAttribute('fingerParam',new THREE.Float32BufferAttribute(params,3));
  geometry.setAttribute('sourcePixel',new THREE.Float32BufferAttribute(sourcePixels,2));
  geometry.setIndex(oriented.indices);geometry.computeVertexNormals();
  const normal=geometry.attributes.normal,colors=[];
  for(let i=0;i<vertices.length;i++){
    const p=vertices[i],n=new THREE.Vector3().fromBufferAttribute(normal,i),front=(p.z-centerZ)/.0245;
    const shade=clamp(.15+.20*(-n.y)+.11*(-n.x)*(side==='left'?1:-1));
    const c=PALETTE.base.clone().lerp(PALETTE.shadow,shade*.34);
    c.lerp(PALETTE.highlight,clamp(front)*.13);
    // A small original-palm crease and understated phalange folds, encoded
    // in continuous surface color, not projected blue/cuff pixels or cards.
    if(p.region==='palm front'){
      const crease=Math.exp(-Math.pow((p.py-(881+.23*(p.px-389)))/.66,2)-Math.pow((p.px-389)/7.2,2));
      c.lerp(PALETTE.crease,crease*.26);
    }else if(p.digit>=0&&front>.03){
      const crease=.12*Math.exp(-Math.pow((p.t-.42)/.013,2))+.08*Math.exp(-Math.pow((p.t-.72)/.011,2));
      c.lerp(PALETTE.crease,crease);
    }
    colors.push(c.r,c.g,c.b);
  }
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.computeBoundingBox();geometry.computeBoundingSphere();
  geometry.userData={selectedAppearanceRetopology:true,side,sourcePixelCoordinates:'Canonical left pixels; right UV mirrored around x578',fingerParam:'digitId, normalized base-to-tip t, wrist-to-digit influence; palm digit=-1 influence=0',closedVolume:true};
  const material=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.FrontSide,toneMapped:false});
  material.name='selected hand source-fitted safe skin, no blue UV sampling';
  const metadata={schema:'dafeiyu.selected-hand-retopology.v2',side,scope:'Local hand topology candidate, not grasp/collision certification and not installed into selected original page',vertices:positions.length/3,triangles:oriented.indices.length/3,radialSegments:N,longitudinalLevels:LEVELS,sourceDigits:DIGITS,revisedDigits:RETOPO_DIGITS,rootRadiiSourcePixels:ROOT_RADII,zRadiiSourcePixels:Z_RADII,centerZ,coordinateFrame:'Original study bind: Y up +Z front, px→(px-580)/260; right source mirror1156-px',palette:{sourceTint:'#ccd0c6',safeSourceRgb:{base:[253,234,220],highlight:[253,248,246],crease:[250,200,179],shadow:[227,186,176]},linear:Object.fromEntries(Object.entries(PALETTE).map(([name,c])=>[name,c.toArray()]))},materialRule:'Use returned unlit COLOR material; UV is diagnostic only and must not be passed to the old whole-hand image material',neutralChanges:'Wrist/cuff unchanged. Locally broader palm, shorter relaxed digit fan replacing defective old star endpoints, rounded tips and real MCP rings. Only new finger-bone binds are retargeted, 22 body bones untouched. No edits to other body geometry.',topology:oriented.report};
  return {geometry,material,metadata};
}

function orientClosedMesh(position,input){
  const indices=[...input],edges=new Map(),adj=Array.from({length:indices.length/3},()=>[]);
  for(let f=0;f<indices.length/3;f++)for(let e=0;e<3;e++){
    const a=indices[f*3+e],b=indices[f*3+(e+1)%3],key=`${Math.min(a,b)}:${Math.max(a,b)}`;
    if(!edges.has(key))edges.set(key,[]);edges.get(key).push({f,sign:a<b?1:-1});
  }
  let boundary=0,nonmanifold=0;
  for(const rows of edges.values()){
    if(rows.length===1)boundary++;else if(rows.length!==2)nonmanifold++;
    if(rows.length===2){const[a,b]=rows;adj[a.f].push([b.f,a.sign===b.sign]);adj[b.f].push([a.f,a.sign===b.sign]);}
  }
  const seen=new Int8Array(adj.length).fill(-1);let components=0,contradictions=0;
  for(let start=0;start<adj.length;start++)if(seen[start]===-1){components++;seen[start]=0;const stack=[start];while(stack.length){const f=stack.pop();for(const[n,opposite]of adj[f]){const expected=seen[f]^(opposite?1:0);if(seen[n]===-1){seen[n]=expected;stack.push(n);}else if(seen[n]!==expected)contradictions++;}}}
  for(let f=0;f<seen.length;f++)if(seen[f]){const p=indices[f*3+1];indices[f*3+1]=indices[f*3+2];indices[f*3+2]=p;}
  let volume=0;const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  for(let i=0;i<indices.length;i+=3){a.fromArray(position,indices[i]*3);b.fromArray(position,indices[i+1]*3);c.fromArray(position,indices[i+2]*3);volume+=a.dot(b.cross(c))/6;}
  if(volume<0){for(let i=0;i<indices.length;i+=3){const q=indices[i+1];indices[i+1]=indices[i+2];indices[i+2]=q;}volume=-volume;}
  return {indices,report:{components,boundaryEdges:boundary,nonmanifoldEdges:nonmanifold,orientationContradictions:contradictions,signedVolume:volume,notSelfIntersectionProof:true}};
}

function phalanxWeights(t){
  // Same joint convention as the root's optional source finger rig.
  // The previous narrow transition was shorter than this finger's diameter;
  // it folded inner knuckle loops through each other. Blend over soft tissue.
  const pip=smooth((t-.25)/.34),dip=smooth((t-.56)/.38);
  return[1-pip,pip*(1-dip),pip*dip];
}

/** Optional adapter; requires the root-owned addSourceFingerRig already active. */
export function installRetopologizedHands(fingers){
  const previous=[],assets=[],restores=[];
  for(const side of ['left','right']){
    const hand=fingers.digitMap[side],mesh=fingers.hands[side],made=createRetopologizedHand({side});
    // New local anatomy needs its own actual bind axes; using the old fan's
    // pivots would shear a short relaxed digit around a different long finger.
    const wristBind=fingers.skeleton.boneInverses[hand.wristIndex].clone().invert();
    for(const spec of RETOPO_DIGITS){
      const d=hand.digits[spec.name];
      restores.push({d,spec:d.spec,restQuaternions:d.restQuaternions,bindMatrices:d.bindMatrices,lengths:d.lengths,
        joints:d.joints.map(b=>({b,position:b.position.clone(),quaternion:b.quaternion.clone(),scale:b.scale.clone()})),
        inverses:d.indices.map(i=>fingers.skeleton.boneInverses[i].clone())});
      const base=new THREE.Vector3(...sourcePoint(...spec.base,.1775,side)).applyMatrix4(mesh.bindMatrix);
      const tip=new THREE.Vector3(...sourcePoint(...spec.tip,.1775,side)).applyMatrix4(mesh.bindMatrix);
      const y=tip.clone().sub(base).normalize(),z=new THREE.Vector3(0,0,1).transformDirection(mesh.bindMatrix),x=y.clone().cross(z).normalize();z.copy(x).cross(y).normalize();
      let parentBind=wristBind;
      d.spec=spec;d.restQuaternions=[];d.bindMatrices=[];d.lengths=[];
      for(let k=0;k<3;k++){
        const world=new THREE.Matrix4().makeBasis(x,y,z).setPosition(base.clone().lerp(tip,spec.fractions[k]));
        const local=parentBind.clone().invert().multiply(world),joint=d.joints[k];
        local.decompose(joint.position,joint.quaternion,joint.scale);joint.updateMatrix();
        d.restQuaternions.push(joint.quaternion.clone());d.bindMatrices.push(world.clone());
        d.lengths.push(base.distanceTo(tip)*((spec.fractions[k+1]??1)-spec.fractions[k]));
        fingers.skeleton.boneInverses[d.indices[k]].copy(world).invert();parentBind=world;
      }
    }
    const p=made.geometry.attributes.fingerParam,index=new Uint16Array(p.count*4),weight=new Float32Array(p.count*4);
    for(let v=0;v<p.count;v++){
      const id=Math.round(p.getX(v)),t=p.getY(v),strength=p.getZ(v),pairs=[[hand.wristIndex,1-strength]];
      if(id>=0){const d=hand.digits[DIGITS[id].name];phalanxWeights(t).forEach((w,k)=>pairs.push([d.indices[k],w*strength]));}
      const used=pairs.filter(([,w])=>w>1e-9).sort((a,b)=>b[1]-a[1]).slice(0,4),total=used.reduce((s,[,w])=>s+w,0);
      for(let j=0;j<4;j++){index[v*4+j]=used[j]?.[0]??hand.wristIndex;weight[v*4+j]=(used[j]?.[1]??0)/total;}
    }
    made.geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(index,4));made.geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weight,4));
    previous.push({mesh,geometry:mesh.geometry,material:mesh.material});mesh.geometry=made.geometry;mesh.material=made.material;assets.push(made);
  }
  fingers.root.updateMatrixWorld(true);fingers.skeleton.update();
  return {assets,metadata:()=>assets.map(a=>a.metadata),dispose(){for(const p of previous){p.mesh.geometry=p.geometry;p.mesh.material=p.material;}for(const a of assets){a.geometry.dispose();a.material.dispose();}
    for(const r of restores){Object.assign(r.d,{spec:r.spec,restQuaternions:r.restQuaternions,bindMatrices:r.bindMatrices,lengths:r.lengths});for(const j of r.joints){j.b.position.copy(j.position);j.b.quaternion.copy(j.quaternion);j.b.scale.copy(j.scale);j.b.updateMatrix();}r.d.indices.forEach((id,k)=>fingers.skeleton.boneInverses[id].copy(r.inverses[k]));}
    fingers.root.updateMatrixWorld(true);fingers.skeleton.update();}};
}
