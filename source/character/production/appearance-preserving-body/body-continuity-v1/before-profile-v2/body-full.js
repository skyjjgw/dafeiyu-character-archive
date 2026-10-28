import * as THREE from '../rig3d-prototype/vendor/three.module.js';

export function solveBodyTwoBoneIK({hip,target,upperLength,lowerLength,pole=new THREE.Vector3(0,0,1)}) {
  const direction=target.clone().sub(hip),requestedDistance=direction.length();
  if(requestedDistance<1e-10)direction.set(0,-1,0);else direction.multiplyScalar(1/requestedDistance);
  const minDistance=Math.abs(upperLength-lowerLength)+1e-7,maxDistance=upperLength+lowerLength-1e-7;
  const distance=THREE.MathUtils.clamp(requestedDistance,minDistance,maxDistance);
  const ankle=hip.clone().addScaledVector(direction,distance);
  const along=(upperLength**2+distance**2-lowerLength**2)/(2*distance);
  const outward=Math.sqrt(Math.max(0,upperLength**2-along**2));
  const kneePole=pole.clone().normalize().addScaledVector(direction,-pole.clone().normalize().dot(direction));
  if(kneePole.lengthSq()<1e-10){
    kneePole.set(Math.abs(direction.x)<.8?1:0,Math.abs(direction.x)<.8?0:1,0);
    kneePole.addScaledVector(direction,-kneePole.dot(direction));
  }
  kneePole.normalize();
  const knee=hip.clone().addScaledVector(direction,along).addScaledVector(kneePole,outward);
  return {hip:hip.clone(),knee,ankle,kneePole,requestedDistance,distance,clamped:Math.abs(distance-requestedDistance)>1e-7};
}

// Source regions are traced separately. No head, hair, or whole-character
// billboard is present here. Hidden garment surfaces are authored volumes.
export function createPaintedBody({parent,resources,garmentTexture}) {
  if(!parent?.isObject3D)throw new TypeError('A parent Object3D is required');
  if(!resources?.add)throw new TypeError('A shared resource set is required');
  const root=new THREE.Group();root.name='painted-full-body-study';parent.add(root);
  const own=value=>{resources.add(value);return value;};
  const clamp=THREE.MathUtils.clamp;
  const mix=THREE.MathUtils.lerp;
  const smooth=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
  const W=1144,H=1375;
  const sx=px=>(px-580)/260;
  const sy=py=>py<=1003 ? .20+(835-py)/260 : .20+(835-1003)/260+(1003-py)/260*1.18;
  const sourceX=x=>580+x*260;
  const sourceY=y=>y>=sy(1003)?835-(y-.20)*260:1003-(y-sy(1003))*260/1.18;
  const plain=color=>own(new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,toneMapped:false}));
  const navy=plain('#27334d'),sideNavy=plain('#1e2a42'),cream=plain('#e1dcd6');
  const skin=plain('#efc8af'),shoeBack=plain('#1c2846');
  const tailBack=plain('#283450'),tailEdge=plain('#26314d');
  const painted=own(new THREE.MeshBasicMaterial({map:garmentTexture||null,color:garmentTexture?0xffffff:0x34415b,
    vertexColors:true,alphaTest:0,side:THREE.DoubleSide,toneMapped:false}));
  // Bring the brighter auxiliary garment into the primary video's lighting.
  // Its sampled hand/thigh RGB ≈253/233/219; the primary cheek ≈201/185/170.
  const clothTint=new THREE.Color('#e2ded7'),skinTint=new THREE.Color('#ccd0c6'),vertexTint=new THREE.Color();
  // The auxiliary concept has a much brighter tail than the video. Tint this
  // region only; the face and white garment trim keep their original palette.
  const tailPaint=own(new THREE.MeshBasicMaterial({map:garmentTexture||null,color:garmentTexture?'#8187a6':'#354364',
    alphaTest:0,side:THREE.DoubleSide,toneMapped:false}));
  const tailBelly=plain('#4a6381');

  const boneList=[],boneIds=new Map(),bones={};
  function bone(key,name,position,parentBone=root) {
    const item=new THREE.Bone();item.name=name;item.position.set(...position);parentBone.add(item);
    bones[key]=item;boneIds.set(item,boneList.length);boneList.push(item);return item;
  }
  const hips=bone('hips','pelvis / garment anchor',[0,.20,0]);
  const spine=bone('spine','bodice spine',[0,.28,0],hips);
  bone('chest','collar / chest',[0,.18,0],spine);
  bone('skirtLeft','left skirt cloth',[-.23,-.06,0],hips);
  bone('skirtRight','right skirt cloth',[.23,-.06,0],hips);
  bone('skirtFront','front apron cloth',[0,-.08,.17],hips);
  bone('skirtBack','back skirt cloth',[0,-.08,-.15],hips);
  for(const [side,sign] of [['left',-1],['right',1]]) {
    const upper=bone(`${side}UpperArm`,`${side} upper sleeve`,[sign*.355,.025,.035],spine);
    const fore=bone(`${side}ForeArm`,`${side} elbow / sleeve`,[sign*.17,-.265,.015],upper);
    bone(`${side}Hand`,`${side} wrist / fingers`,[sign*.13,-.185,.07],fore);
    const leg=bone(`${side}UpperLeg`,`${side} hip / thigh`,[sign*.245,-.667,.015],hips);
    const knee=bone(`${side}LowerLeg`,`${side} knee / sock`,[0,-.235,.025],leg);
    bone(`${side}Foot`,`${side} ankle / shoe`,[0,-.235,.065],knee);
  }
  const tailBase=bone('tailBase','whale tail base',[.37,-.56,-.26],hips);
  const tailMid=bone('tailMid','whale tail middle',[.42,-.02,-.025],tailBase);
  bone('tailTip','whale tail flukes',[.43,.075,0],tailMid);
  root.updateMatrixWorld(true);
  const skeleton=own(new THREE.Skeleton(boneList));skeleton.calculateInverses();
  const jointBase={};for(const [key,item]of Object.entries(bones))jointBase[key]=item.position.clone();
  const b=key=>boneIds.get(bones[key]);
  function normalizeWeights(pairs) {
    const merged=new Map();for(const[index,weight]of pairs)if(weight>1e-5)merged.set(index,(merged.get(index)||0)+weight);
    const ordered=[...merged].sort((a,c)=>c[1]-a[1]).slice(0,4);
    const sum=ordered.reduce((acc,item)=>acc+item[1],0)||1;
    return ordered.map(([index,weight])=>[index,weight/sum]);
  }
  function torsoWeights(x,y) {
    const upper=smooth(.22,.64,y),chest=smooth(.50,.73,y)*.36;
    return [[b('hips'),1-upper],[b('spine'),upper*(1-chest)],[b('chest'),upper*chest]];
  }
  function skirtWeights(x,y,px,py,back=false) {
    const hem=smooth(820,1000,py)*.72;
    const across=clamp(Math.abs(x)/.77,0,1),left=x<0;
    return [[b('hips'),1-hem],[b(left?'skirtLeft':'skirtRight'),hem*(.48+.28*across)],
      [b(back?'skirtBack':'skirtFront'),hem*(.52-.28*across)]];
  }
  function armWeights(side,py,px) {
    const elbow=smooth(784,849,py),wrist=smooth(855,885,py);
    const canonicalX=side==='left'?px:1156-px;
    const shoulder=(1-smooth(756,791,py))*smooth(465,500,canonicalX)*.78;
    return [[b('spine'),shoulder],[b(`${side}UpperArm`),(1-elbow)*(1-shoulder)],
      [b(`${side}ForeArm`),elbow*(1-wrist)*(1-shoulder)],[b(`${side}Hand`),elbow*wrist*(1-shoulder)]];
  }
  function legWeights(side,py) {
    const knee=smooth(1018,1063,py),ankle=smooth(1070,1096,py);
    return [[b(`${side}UpperLeg`),1-knee],[b(`${side}LowerLeg`),knee*(1-ankle)],[b(`${side}Foot`),knee*ankle]];
  }
  function tailWeights(x) {
    const mid=smooth(.40,.94,x),tip=smooth(.95,1.40,x);
    return [[b('tailBase'),1-mid],[b('tailMid'),mid*(1-tip)],[b('tailTip'),mid*tip]];
  }
  function makeWriter() {
    const position=[],uv=[],skinIndex=[],skinWeight=[];
    return {position,uv,skinIndex,skinWeight,
      vertex(px,py,z,weightFn,back=false){
        const x=sx(px),y=sy(py),index=position.length/3;
        position.push(x,y,z);uv.push(px/W,1-py/H);
        const pairs=normalizeWeights(weightFn(x,y,px,py,back));
        for(let i=0;i<4;i++){skinIndex.push(pairs[i]?.[0]??b('hips'));skinWeight.push(pairs[i]?.[1]??0);}
        return index;
      }
    };
  }
  const meshes=[];
  function commit(name,data,front,back,sides,materials) {
    const g=own(new THREE.BufferGeometry());
    g.setAttribute('position',new THREE.Float32BufferAttribute(data.position,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(data.uv,2));
    g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(data.skinIndex,4));
    g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(data.skinWeight,4));
    const colors=[];
    for(let i=0;i<data.position.length/3;i++){
      const py=(1-data.uv[i*2+1])*H;
      const skinAmount=name.includes('hand and fingers')?1:name.includes('thigh, sock')?1-smooth(1040,1054,py):0;
      vertexTint.copy(clothTint).lerp(skinTint,skinAmount);colors.push(vertexTint.r,vertexTint.g,vertexTint.b);
    }
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    g.setIndex([...front,...back,...sides]);
    g.addGroup(0,front.length,0);g.addGroup(front.length,back.length,1);g.addGroup(front.length+back.length,sides.length,2);
    g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
    const mesh=new THREE.SkinnedMesh(g,materials);mesh.name=name;mesh.frustumCulled=false;root.add(mesh);
    mesh.bind(skeleton);mesh.userData.closedVolume=true;mesh.userData.sourceRegion=name;meshes.push(mesh);return mesh;
  }
  function interpolateRows(anchors,step=5) {
    const out=[];
    for(let i=0;i<anchors.length-1;i++) {
      const a=anchors[i],c=anchors[i+1],n=Math.max(1,Math.ceil((c[0]-a[0])/step));
      for(let j=0;j<n;j++){const t=j/n;out.push([mix(a[0],c[0],t),mix(a[1],c[1],t),mix(a[2],c[2],t)]);}
    }
    out.push(anchors.at(-1));return out;
  }
  // Each fin and palm tapers to a 4 mm rim. No equal-depth extrusion wall.
  function biconvexVolume({name,points,weights,frontZ=.20,backZ=.0,materials=[painted,navy,sideNavy],detail=2}) {
    const data=makeWriter(),front=[],back=[],sides=[];
    const contour=points.map(([x,y])=>new THREE.Vector2(x,y));
    const reverseRim=THREE.ShapeUtils.area(contour)>0;
    const tris=THREE.ShapeUtils.triangulateShape(contour,[]);
    const zFor=(p,isBack)=>{
      const edgeDistance=distanceToContour(p.x,p.y,points),half=(frontZ-backZ)*.5;
      const thickness=.002+(half-.002)*Math.sin(Math.min(1,edgeDistance/23)*Math.PI*.5);
      return (frontZ+backZ)*.5+(isBack?-thickness:thickness);
    };
    function triangle(a,c,d,level,isBack){
      if(level){const ac=a.clone().lerp(c,.5),cd=c.clone().lerp(d,.5),da=d.clone().lerp(a,.5);
        triangle(a,ac,da,level-1,isBack);triangle(ac,c,cd,level-1,isBack);triangle(da,cd,d,level-1,isBack);triangle(ac,cd,da,level-1,isBack);return;}
      const indices=[a,c,d].map(p=>data.vertex(p.x,p.y,zFor(p,isBack),weights,isBack));
      (isBack?back:front).push(...(isBack?indices:indices.reverse()));
    }
    for(const tri of tris)for(const isBack of[false,true])triangle(...tri.map(i=>contour[i]),detail,isBack);
    for(let i=0;i<contour.length;i++){
      const start=contour[i],end=contour[(i+1)%contour.length],segments=2**detail;
      for(let j=0;j<segments;j++){
        const a=start.clone().lerp(end,j/segments),c=start.clone().lerp(end,(j+1)/segments);
        const af=data.vertex(a.x,a.y,zFor(a,false),weights),cf=data.vertex(c.x,c.y,zFor(c,false),weights);
        const ab=data.vertex(a.x,a.y,zFor(a,true),weights,true),cb=data.vertex(c.x,c.y,zFor(c,true),weights,true);
        sides.push(...(reverseRim?[af,cf,ab,cf,cb,ab]:[af,ab,cf,cf,ab,cb]));
      }
    }
    const mesh=commit(name,data,front,back,sides,materials);
    mesh.userData.volumeStudy={kind:'biconvex-lens',inferredSides:true,edgeThickness:.004,maximumThickness:frontZ-backZ,
      frontFitContour:points,frontVertexCount:front.length};
    return mesh;
  }

  function pointInContour(x,y,points){
    let inside=false;
    for(let i=0,j=points.length-1;i<points.length;j=i++){
      const a=points[i],c=points[j];
      if((a[1]>y)!==(c[1]>y)&&x<(c[0]-a[0])*(y-a[1])/(c[1]-a[1])+a[0])inside=!inside;
    }
    return inside;
  }
  function distanceToContour(x,y,points){
    let minimum=Infinity;
    for(let i=0;i<points.length;i++){
      const a=points[i],c=points[(i+1)%points.length],dx=c[0]-a[0],dy=c[1]-a[1];
      const t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1),0,1);
      minimum=Math.min(minimum,Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t));
    }
    return minimum;
  }
  function fitPoint(x,y,points){
    if(pointInContour(x,y,points)||distanceToContour(x,y,points)<1e-6)return[x,y];
    let best=null,minimum=Infinity;
    for(let i=0;i<points.length;i++){
      const a=points[i],c=points[(i+1)%points.length],dx=c[0]-a[0],dy=c[1]-a[1];
      const t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1),0,1),px=a[0]+dx*t,py=a[1]+dy*t;
      const distance=Math.hypot(px-x,py-y);if(distance<minimum){minimum=distance;best=[px,py];}
    }
    return best;
  }
  function bottomAtX(x,points){
    let bottom=-Infinity;
    for(let i=0;i<points.length;i++){
      const a=points[i],c=points[(i+1)%points.length];
      if(x>=Math.min(a[0],c[0])-1e-7&&x<=Math.max(a[0],c[0])+1e-7){
        if(Math.abs(c[0]-a[0])<1e-9){bottom=Math.max(bottom,a[1],c[1]);continue;}
        bottom=Math.max(bottom,mix(a[1],c[1],(x-a[0])/(c[0]-a[0])));
      }
    }
    return bottom;
  }
  // A shared indexed ring goes through front, side and back continuously.
  // Source UV is restricted to its forward hemisphere. No alpha cutout is
  // responsible for closing the volume or supplying its side silhouette.
  function closedSections({name,levels,segments=48,sample,weights,materials=[painted,navy,sideNavy],region,contour=null,axis='Y'}){
    const data=makeWriter(),groups=[[],[],[]],rings=[];
    for(let row=0;row<levels.length;row++){
      const ring=[];
      for(let col=0;col<segments;col++){
        const theta=col/segments*Math.PI*2,p=sample(levels[row],theta,row),px=sourceX(p.x),py=sourceY(p.y);
        ring.push(data.vertex(px,py,p.z,weights,Math.cos(theta)<0));
      }
      rings.push(ring);
    }
    for(let row=0;row<rings.length-1;row++)for(let col=0;col<segments;col++){
      const next=(col+1)%segments,a=rings[row][col],c=rings[row+1][col],theta=(col+.5)/segments*Math.PI*2;
      const material=region?region((levels[row]+levels[row+1])*.5,theta):Math.cos(theta)>=0?0:1;
      groups[material].push(a,c,rings[row][next],rings[row][next],c,rings[row+1][next]);
    }
    for(const row of[0,rings.length-1]){
      const center=new THREE.Vector3();for(const index of rings[row])center.add(new THREE.Vector3().fromArray(data.position,index*3));center.multiplyScalar(1/segments);
      const index=data.vertex(sourceX(center.x),sourceY(center.y),center.z,weights,row===0);
      for(let col=0;col<segments;col++){
        const a=rings[row][col],c=rings[row][(col+1)%segments];groups[1].push(...(row===0?[index,a,c]:[index,c,a]));
      }
    }
    const mesh=commit(name,data,...groups,materials);
    mesh.userData.volumeStudy={kind:'360-sections',axis,sections:rings.length,angularSegments:segments,inferredSides:true,
      frontFitContour:contour,sectionRings:rings,frontMaterialIndex:0};
    return mesh;
  }

  function verticalSections({name,anchors,weights,frontDepth=.27,backDepth=.17,materials=[painted,navy,sideNavy],region}){
    const rows=interpolateRows(anchors),contour=[...anchors.map(([py,l])=>[l,py]),...anchors.toReversed().map(([py,l,r])=>[r,py])];
    return closedSections({name,levels:rows.map((row,index)=>index),weights,materials,contour,region,
      sample:(index,theta)=>{
        const[py,left,right]=rows[index],px=(left+right)*.5+(right-left)*.5*Math.sin(theta),cos=Math.cos(theta);
        return new THREE.Vector3(sx(px),sy(py),-.015+cos*(cos>=0?frontDepth:backDepth));
      }});
  }
  const torsoAnchors=[[692,554,609],[700,519,642],[713,506,654],[735,504,657],[765,507,655],[795,507,654],[811,504,655],[830,508,652]];
  verticalSections({name:'traced collar, bib, bow and continuous bodice',anchors:torsoAnchors,weights:torsoWeights});
  const skirtContour=[[508,819],[496,836],[480,857],[461,879],[438,899],[410,917],[392,927],[380,935],[377,941],
      [382,950],[392,955],[393,961],[397,968],[405,974],[416,978],[420,982],[429,989],[438,995],
      [450,999],[466,1000],[480,997],[483,1005],[494,1012],[510,1015],[526,1016],[539,1012],[544,1005],
      [549,1010],[557,1016],[566,1020],[583,1021],[595,1017],[603,1010],[607,1006],[614,1012],
      [629,1016],[645,1013],[656,1007],[666,999],[679,999],[696,995],[711,990],[717,982],[735,979],
      [742,969],[748,960],[756,954],[761,947],[767,940],[764,933],[756,925],[747,918],[727,899],
      [701,879],[681,857],[664,836],[652,819]];
  closedSections({name:'continuous flared skirt, painted front apron and encircling ivory hem',levels:Array.from({length:29},(_,i)=>i/28),
    segments:96,weights:skirtWeights,materials:[painted,navy,cream],contour:skirtContour,
    region:(t,theta)=>Math.cos(theta)>=0?0:t>.87?2:1,
    sample:(t,theta)=>{
      const sin=Math.sin(theta),cos=Math.cos(theta),hemX=572+195*sin,hemY=bottomAtX(hemX,skirtContour);
      let px=mix(580+72*sin,hemX,t),py=mix(819,hemY,t);
      if(cos<0)py-=5*t;
      if(cos>=-1e-8)[px,py]=fitPoint(px,py,skirtContour);
      const folds=.005*Math.cos(theta*18)*t*t;
      return new THREE.Vector3(sx(px),sy(py),-.015+cos*(mix(.235,cos>=0?.36:.30,t)+folds));
    }});

  const leftSleeve=[[748,451,481],[758,440,493],[775,426,498],[793,433,487],[812,415,474],[832,400,458],[848,397,443],[860,392,428],[873,384,409]];
  const leftHand=[[397,869],[411,878],[417,883],[416,887],[406,886],[416,894],[415,898],[411,900],[399,895],
    [401,905],[397,909],[392,905],[386,896],[382,905],[377,908],[374,904],[379,892],[368,898],[363,896],[364,892],[378,883],[382,876]];
  const leftShoe=[[486,1075],[511,1068],[537,1073],[547,1085],[552,1101],[552,1116],[546,1128],[533,1135],
    [507,1137],[490,1132],[480,1123],[477,1108],[479,1091]];
  const shoes={};
  for(const [side,sign]of[['left',-1],['right',1]]) {
    const mirror=px=>side==='left'?px:1156-px;
    const sleeve=leftSleeve.map(([py,left,right])=>side==='left'?[py,left,right]:[py,mirror(right),mirror(left)]);
    const sleeveContour=[...sleeve.map(([py,l])=>[l,py]),...sleeve.toReversed().map(([py,l,r])=>[r,py])];
    const centerPoints=[[479,753],[467,761],[462,775],[457,793],[443,815],[425,838],[408,859],[400,870]].map(([px,py])=>new THREE.Vector3(sx(mirror(px)),sy(py),.04));
    const sleeveCurve=new THREE.CatmullRomCurve3(centerPoints,false,'centripetal');
    closedSections({name:`${side} traced puff sleeve and cuff`,levels:Array.from({length:30},(_,i)=>i/29),segments:40,axis:'shoulder-elbow-wrist',
      weights:(x,y,px,py)=>armWeights(side,py,px),materials:[painted,navy,cream],contour:sleeveContour,
      region:(t,theta)=>Math.cos(theta)>=0?0:t>.85?2:1,
      sample:(t,theta)=>{
        const center=sleeveCurve.getPoint(t),tangent=sleeveCurve.getTangent(t),normal=new THREE.Vector3(-tangent.y,tangent.x,0).normalize();
        const radius=.034+.105*Math.pow(Math.sin(Math.PI*t),.7),sin=Math.sin(theta),cos=Math.cos(theta);
        let point=center.clone().addScaledVector(normal,radius*sin);
        let px=sourceX(point.x),py=sourceY(point.y);[px,py]=fitPoint(px,py,sleeveContour);point.x=sx(px);point.y=sy(py);
        point.z=center.z+cos*(.055+.10*Math.pow(Math.sin(Math.PI*t),.7));return point;
      }});
    biconvexVolume({name:`${side} traced open hand and fingers`,points:leftHand.map(([px,py])=>[mirror(px),py]),
      weights:()=>[[b(`${side}Hand`),1]],frontZ:.22,backZ:.135,materials:[painted,skin,skin]});
    const legRows=[[1001,486,548],[1015,479,546],[1034,479,545],[1050,482,543],[1070,484,543],[1085,482,545],[1095,484,544]];
    const leg=legRows.map(([py,left,right])=>side==='left'?[py,left,right]:[py,mirror(right),mirror(left)]);
    const sampledLegRows=interpolateRows(leg);
    verticalSections({name:`${side} traced thigh, sock and ankle`,anchors:leg,weights:(x,y,px,py)=>legWeights(side,py),
      frontDepth:.15,backDepth:.11,materials:[painted,skin,cream],region:(row,theta)=>Math.cos(theta)>=0?0:sampledLegRows[Math.round(row)][0]>1043?2:1});
    // Original front shoe pixels, closed inferred rear; no projection snapping.
    // Calibrated to the baseline export's actual shoe projection. Keep both
    // its ankle opening and sole at their original world Y positions.
    const shoeRows=[[1075.938,505.0,523.0],[1082.5,492.3,535.7],
      [1089.1,485.2,542.8],[1095.6,481.4,546.6],[1102.2,478.1,549.9],
      [1108.8,477.1,551.7],[1115.3,478.2,552.0],[1121.9,479.5,549.7],
      [1128.4,484.7,546.1],[1135.0,495.7,535.4]];
    const rows=shoeRows.map(([py,l,r])=>side==='left'?[py,l,r]:[py,mirror(r),mirror(l)]);
    shoes[side]=verticalSections({name:`${side} traced mary jane shoe`,anchors:rows,
      weights:()=>[[b(`${side}Foot`),1]],frontDepth:.22,backDepth:.15,
      materials:[painted,shoeBack,sideNavy]});
  }
  const stemCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(.31,-.20,-.31),new THREE.Vector3(.45,-.34,-.32),
    new THREE.Vector3(.60,-.45,-.33),new THREE.Vector3(.75,-.49,-.34),new THREE.Vector3(.88,-.47,-.34)],false,'centripetal');
  closedSections({name:'continuous rounded whale tail stem',levels:Array.from({length:25},(_,i)=>i/24),segments:32,axis:'tail centerline',
    weights:tailWeights,materials:[tailBack,tailBack,tailBelly],region:(t,theta)=>Math.sin(theta)<0?2:1,
    sample:(t,theta)=>{
      const center=stemCurve.getPoint(t),tangent=stemCurve.getTangent(t),normal=new THREE.Vector3(-tangent.y,tangent.x,0).normalize();
      return center.addScaledVector(normal,(.105-.02*t)*Math.sin(theta)).addScaledVector(new THREE.Vector3(0,0,1),(.095-.025*t)*Math.cos(theta));
    }});
  biconvexVolume({name:'indigo whale left biconvex fluke',weights:tailWeights,frontZ:-.285,backZ:-.385,detail:3,
    materials:[tailPaint,tailBack,tailEdge],points:[[712,941],[733,933],[753,949],[773,973],[792,985],[811,990],[816,1018],[808,1039],
      [785,1052],[761,1058],[737,1053],[716,1040],[700,1021],[690,1002],[695,978]]});
  biconvexVolume({name:'indigo whale right biconvex fluke',weights:tailWeights,frontZ:-.285,backZ:-.385,detail:3,
    materials:[tailPaint,tailBack,tailEdge],points:[[811,990],
      [813,980],[815,970],[819,960],[824,950],[832,940],[843,930],[859,920],[889,910],[920,905],
      [933,900],[947,890],[958,883],[964,891],[967,906],[967,925],[965,946],[960,966],[954,985],
      [944,1005],[930,1022],[911,1038],[888,1050],[862,1057],[842,1057],[822,1049],[808,1039],[816,1018]]});

  // Contact references come from the actual shoe's bind-space vertices, then
  // are transformed into its foot bone frame. No guessed ankle-to-floor gap.
  const groundY=-1.055,legData={};
  root.updateMatrixWorld(true);
  for(const side of ['left','right']) {
    const foot=bones[`${side}Foot`],shoe=shoes[side];
    const inverse=foot.matrixWorld.clone().invert(),points=[];
    const position=shoe.geometry.attributes.position;
    let minimum=Infinity;
    for(let i=0;i<position.count;i++) {
      const p=new THREE.Vector3().fromBufferAttribute(position,i).applyMatrix4(shoe.bindMatrix).applyMatrix4(inverse);
      points.push(p);minimum=Math.min(minimum,p.y);
    }
    const sole=new THREE.Vector3();let count=0;
    for(const p of points)if(p.y<=minimum+1e-7){sole.add(p);count++;}
    sole.multiplyScalar(1/count);
    const bindSole=sole.clone().applyMatrix4(foot.matrixWorld);
    const upperVector=jointBase[`${side}LowerLeg`].clone(),lowerVector=jointBase[`${side}Foot`].clone();
    legData[side]={sole,bindSole,minimum,upperVector,lowerVector,upperLength:upperVector.length(),lowerLength:lowerVector.length()};
    shoe.userData.soleLocal=sole.toArray();shoe.userData.soleLocalMinimumY=minimum;
  }
  function solveGroundedLegs(time,walk) {
    root.updateMatrix();
    const rootInverse=root.matrix.clone().invert(),levelRotation=root.quaternion.clone().invert();
    const pole=new THREE.Vector3(0,0,1).applyQuaternion(levelRotation);
    const report={enabled:true,groundY,pelvisOffset:-.012,feet:{}};
    // A small real pelvis bend supplies reach slack; neither leg segment is
    // scaled or translated. The collar remains inside the existing overlap.
    hips.position.y=jointBase.hips.y+report.pelvisOffset;
    for(const [side,offset]of [['left',0],['right',Math.PI]]) {
      const data=legData[side],upper=bones[`${side}UpperLeg`],lower=bones[`${side}LowerLeg`],foot=bones[`${side}Foot`];
      const phase=time*5.4+offset,swing=Math.max(0,Math.sin(phase));
      const lift=Math.pow(swing,1.6)*.115*walk,stride=swing*swing*.055*walk;
      const targetSole=data.bindSole.clone();targetSole.y=groundY+lift;targetSole.z+=stride;
      const hip=hips.position.clone().add(upper.position);
      const target=targetSole.clone().applyMatrix4(rootInverse).sub(data.sole.clone().applyQuaternion(levelRotation));
      const solved=solveBodyTwoBoneIK({hip,target,upperLength:data.upperLength,lowerLength:data.lowerLength,pole});
      const {knee,ankle:actualTarget,kneePole,requestedDistance,distance,clamped}=solved;
      const upperRotation=new THREE.Quaternion().setFromUnitVectors(data.upperVector.clone().normalize(),knee.clone().sub(hip).normalize());
      const lowerRotation=new THREE.Quaternion().setFromUnitVectors(data.lowerVector.clone().normalize(),actualTarget.clone().sub(knee).normalize());
      upper.quaternion.copy(upperRotation);
      lower.quaternion.copy(upperRotation).invert().multiply(lowerRotation);
      foot.quaternion.copy(lowerRotation).invert().multiply(levelRotation);
      report.feet[side]={support:lift<1e-7,swingWeight:swing*walk,lift,requestedDistance,reachableDistance:distance,clamped,
        lengths:[data.upperLength,data.lowerLength],requestedSole:targetSole.toArray(),clampedAnkle:actualTarget.toArray(),
        kneePoleForward:kneePole.dot(pole),soleLocal:data.sole.toArray()};
    }
    root.updateMatrixWorld(true);
    const parentInverse=parent.matrixWorld.clone().invert();
    for(const side of ['left','right']) {
      const foot=bones[`${side}Foot`],data=legData[side],entry=report.feet[side];
      const sole=data.sole.clone().applyMatrix4(foot.matrixWorld).applyMatrix4(parentInverse);
      const up=new THREE.Vector3(0,1,0).transformDirection(foot.matrixWorld).transformDirection(parentInverse);
      entry.actualSole=sole.toArray();entry.soleClearance=sole.y-groundY;entry.footLevelError=up.distanceTo(new THREE.Vector3(0,1,0));
    }
    root.userData.grounding=report;
  }

  function solveWaveArm(time,amount) {
    if(amount<=1e-8){root.userData.waveArm={enabled:false,weight:0};return;}
    // Solve in the shoulder parent's frame. The shoulder, elbow and wrist
    // attachment offsets remain exactly at bind length throughout the action.
    const upper=bones.leftUpperArm,fore=bones.leftForeArm,hand=bones.leftHand;
    const shoulder=upper.position.clone();
    const baseUpper=upper.quaternion.clone(),baseFore=baseUpper.clone().multiply(fore.quaternion);
    const baseHand=baseFore.clone().multiply(hand.quaternion);
    const bindElbow=fore.position.clone().applyQuaternion(baseUpper).add(shoulder);
    const bindWrist=hand.position.clone().applyQuaternion(baseFore).add(bindElbow);
    const spineToRoot=root.matrixWorld.clone().invert().multiply(spine.matrixWorld);
    const rootToSpine=spineToRoot.clone().invert();
    const preparation=new THREE.Vector3(-.69,.26,.17).applyMatrix4(rootToSpine);
    const raised=new THREE.Vector3(-.78,.78,.22).applyMatrix4(rootToSpine);
    const progress=smooth(0,.84,amount),wristAmount=smooth(.84,1,amount);
    const target=amount<.30
      ?bindWrist.clone().lerp(preparation,smooth(0,.30,amount))
      :preparation.clone().lerp(raised,smooth(.30,.84,amount));
    const bindDirection=bindWrist.clone().sub(shoulder).normalize();
    const bindPole=bindElbow.clone().sub(shoulder);
    bindPole.addScaledVector(bindDirection,-bindPole.dot(bindDirection));
    if(bindPole.lengthSq()<1e-10)bindPole.set(-.2,-.2,-1);bindPole.normalize();
    const desiredPole=new THREE.Vector3(-.7,-.5,.5).transformDirection(rootToSpine);
    const poleRotation=new THREE.Quaternion().setFromUnitVectors(bindPole,desiredPole);
    const pole=bindPole.clone().applyQuaternion(new THREE.Quaternion().slerp(poleRotation,progress));
    const upperVector=jointBase.leftForeArm,lowerVector=jointBase.leftHand;
    const solved=solveBodyTwoBoneIK({hip:shoulder,target,upperLength:upperVector.length(),lowerLength:lowerVector.length(),pole});
    const upperRotation=new THREE.Quaternion().setFromUnitVectors(upperVector.clone().normalize(),solved.knee.clone().sub(shoulder).normalize());
    const foreRotation=new THREE.Quaternion().setFromUnitVectors(lowerVector.clone().normalize(),solved.ankle.clone().sub(solved.knee).normalize());
    upper.quaternion.copy(upperRotation);fore.quaternion.copy(upperRotation).invert().multiply(foreRotation);
    const spineRotation=new THREE.Quaternion().setFromRotationMatrix(spineToRoot);
    const raisedHand=new THREE.Quaternion().setFromEuler(new THREE.Euler(-.08,.10,-2.05+wristAmount*Math.sin(time*5.8-.7)*.18,'YXZ'));
    raisedHand.premultiply(spineRotation.invert());
    hand.quaternion.copy(foreRotation).invert().multiply(baseHand.slerp(raisedHand,progress));
    root.updateMatrixWorld(true);
    const actualWrist=hand.getWorldPosition(new THREE.Vector3()).applyMatrix4(root.matrixWorld.clone().invert());
    const requestedWrist=target.clone().applyMatrix4(spineToRoot);
    root.userData.waveArm={enabled:true,weight:amount,stage:amount<.30?'prepare':amount<.84?'raise':'wrist',
      requestedWrist:requestedWrist.toArray(),actualWrist:actualWrist.toArray(),clamped:solved.clamped,
      requestedDistance:solved.requestedDistance,reachableDistance:solved.distance,
      lengths:[upperVector.length(),lowerVector.length()],targetError:actualWrist.distanceTo(requestedWrist)};
  }

  let initialized=false,waveAmount=0,walkAmount=0;
  function update(dt,time,state={}) {
    const t=Number.isFinite(time)?time:0,delta=clamp(Number(dt)||0,0,.05);
    const response=initialized&&delta>0?1-Math.exp(-delta*9):1;
    const waveTarget=Number.isFinite(state.wave)?clamp(state.wave,0,1):state.action==='wave'?1:0;
    const walkTarget=Number.isFinite(state.walk)?clamp(state.walk,0,1):state.action==='walk'?1:0;
    // A director-supplied weight already contains its transition envelope.
    waveAmount=Number.isFinite(state.wave)?waveTarget:mix(waveAmount,waveTarget,response);
    walkAmount=Number.isFinite(state.walk)?walkTarget:mix(walkAmount,walkTarget,response);
    initialized=true;
    const idle=state.mode==='idle',breath=idle?Math.sin(t*1.7):0;
    root.rotation.y=-clamp(Number(state.yaw)||0,-.44,.44)*.10;
    const grounded=state.grounded!==false;
    root.position.y=grounded?0:breath*.003;
    for(const[key,item]of Object.entries(bones)){item.rotation.set(0,0,0);item.position.copy(jointBase[key]);item.scale.set(1,1,1);}
    bones.spine.rotation.z=breath*.003;
    bones.chest.rotation.x=breath*.006;
    bones.spine.scale.set(1,1,1);
    const cycle=t*5.4;
    for(const[side,sign]of[['left',-1],['right',1]]) {
      const phase=cycle+(side==='left'?0:Math.PI),step=Math.sin(phase);
      const upper=bones[`${side}UpperArm`],fore=bones[`${side}ForeArm`],hand=bones[`${side}Hand`];
      upper.rotation.x=-step*.13*walkAmount;
      upper.rotation.z=sign*(.012+breath*.007)*(1-walkAmount);
      fore.rotation.z=sign*.015;
      const leg=bones[`${side}UpperLeg`],knee=bones[`${side}LowerLeg`],foot=bones[`${side}Foot`];
      leg.rotation.x=step*.32*walkAmount;
      knee.rotation.x=Math.max(0,-step)*.40*walkAmount;
      foot.rotation.x=-leg.rotation.x*.34-knee.rotation.x*.55;
      foot.rotation.z=sign*.015;
    }
    const sway=idle?Math.sin(t*1.35)*.018:0;
    bones.skirtLeft.rotation.z=-sway-Math.sin(cycle)*.025*walkAmount;
    bones.skirtRight.rotation.z=sway+Math.sin(cycle)*.025*walkAmount;
    bones.skirtFront.rotation.x=breath*.009+Math.sin(cycle*2)*.022*walkAmount;
    bones.skirtBack.rotation.x=-breath*.007-Math.sin(cycle*2+.5)*.019*walkAmount;
    bones.tailBase.rotation.y=(idle?Math.sin(t*1.35)*.055:0)+Math.sin(cycle)*.035*walkAmount;
    bones.tailBase.rotation.z=(idle?Math.sin(t*1.10)*.017:0);
    bones.tailMid.rotation.y=idle?Math.sin(t*1.35-.50)*.085:0;
    bones.tailTip.rotation.z=idle?Math.sin(t*1.35-1)*.025:0;
    if(grounded)solveGroundedLegs(t,walkAmount);
    else{root.userData.grounding={enabled:false,groundY};root.updateMatrixWorld(true);}
    solveWaveArm(t,waveAmount);
  }
  const metadata={version:2,scope:'Full-body continuous cross-section volume and skeletal study; side/back designs are inferred',
    source:'production/v1/neutral-front.png',sourceSize:[W,H],garmentIsAuxiliary:true,
    geometry:'Shared indexed 360-degree bodice/skirt, limb-axis sleeves, rounded flat-sole shoes, tubular tail stem and thin-edge biconvex flukes; all parts are SkinnedMesh',
    frontProjection:'Preserve front XY within fitted source contours; original UV is used only on forward surfaces. Side/back materials are explicitly inferred.',
    inferredSurfaces:['Back and side bodice fabric','Circumferential skirt lining and white rear hem','Back of puff sleeves and cuff rings','Shoe heels, soles and side leather','Whale tail stem and rear fin colors'],
    boneCount:boneList.length,meshCount:meshes.length,sourceMapping:{x:'(px-580)/260',y:'.20+(835-py)/260; lower legs stretched by 1.18'},
    landmarks:{collar:.70,waist:.20,hem:-.49,feet:-1.055},
    actionInputs:['wave and walk continuous weights [0,1]','action idle/wave/walk fallback','yaw radians, mode idle/manual'],
    grounding:{default:true,groundY,method:'Constant-length two-bone IK with bind-vertex-derived sole reference; level feet and forward knee pole',pelvisOffset:-.012,diagnostics:'root.userData.grounding'},
    wave:{method:'Fixed shoulder attachment and constant-length two-bone arm IK; prepare, raise, then wrist rotation',raisedWrist:[-.78,.78,.22],diagnostics:'root.userData.waveArm'},
    limitations:['Front auxiliary garment is painted; side and back are authored solid colors','Walk is an in-place step with local foot IK; collisions and travel controller remain separate','Shoulder and cloth weights are a visual study, not a validated physical simulation','Tail palette is muted separately from the brighter auxiliary drawing'],
    jointKeys:Object.keys(bones)};
  update(0,0,{mode:'manual',action:'idle'});
  return{root,bones,update,metadata};
}
