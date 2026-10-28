import * as THREE from '../rig3d-prototype/vendor/three.module.js';

// These points follow the existing open-hand contour in neutral-front.png.
// This module adds joints/weights to that same closed hand. It does not paint,
// replace or move the selected appearance's neutral geometry or UVs.
export const DIGITS=Object.freeze([
  {name:'thumb',base:[397.5,880],tip:[415.7,884.8],fractions:[0,.42,.72],maxFlex:[35,65,70]},
  {name:'index',base:[393.3,884.4],tip:[414,896.2],fractions:[0,.42,.72],maxFlex:[70,95,65]},
  {name:'middle',base:[389,885.5],tip:[397.4,906.8],fractions:[0,.42,.72],maxFlex:[75,100,70]},
  {name:'ring',base:[385.3,884.4],tip:[377.7,906],fractions:[0,.42,.72],maxFlex:[75,100,70]},
  {name:'little',base:[382.7,881.4],tip:[365.8,895],fractions:[0,.42,.72],maxFlex:[70,95,65]},
]);
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
function sourceY(py){return py<=1003?.20+(835-py)/260:.20+(835-1003)/260+(1003-py)/260*1.18;}
function bindPoint(mesh,side,px,py){
  const actualX=side==='left'?px:1156-px;
  return new THREE.Vector3((actualX-580)/260,sourceY(py),(.22+.135)/2).applyMatrix4(mesh.bindMatrix);
}
function phalanxWeights(t){
  if(t<.36)return[1,0,0];
  if(t<.49){const a=smooth((t-.36)/.13);return[1-a,a,0];}
  if(t<.66)return[0,1,0];
  if(t<.80){const a=smooth((t-.66)/.14);return[0,1-a,a];}
  return[0,0,1];
}
function digitField(px,py){
  let best=null;
  for(const digit of DIGITS){
    const dx=digit.tip[0]-digit.base[0],dy=digit.tip[1]-digit.base[1],length=Math.hypot(dx,dy);
    const t=((px-digit.base[0])*dx+(py-digit.base[1])*dy)/(length*length);
    if(t<0||t>1.25)continue;
    const distance=Math.abs((px-digit.base[0])*dy-(py-digit.base[1])*dx)/length;
    const radius=.18*length+1.15;
    const strength=smooth((t-.025)/.29)*Math.exp(-Math.pow(distance/radius,4));
    if(!best||strength>best.strength)best={digit,t,strength};
  }
  return best;
}

export function addSourceFingerRig({root,bones}){
  root.updateMatrixWorld(true);
  const handMeshes={};const skinned=[];
  root.traverse(object=>{
    if(object.isSkinnedMesh)skinned.push(object);
    for(const side of ['left','right'])if(object.name===`${side} traced open hand and fingers`)handMeshes[side]=object;
  });
  if(!handMeshes.left||!handMeshes.right)throw new Error('Selected source hands are required');
  const oldSkeleton=handMeshes.left.skeleton;
  if(handMeshes.right.skeleton!==oldSkeleton)throw new Error('Source body must have its shared skeleton');
  const allBones=[...oldSkeleton.bones],allInverses=oldSkeleton.boneInverses.map(m=>m.clone());
  const handRest=new Map(),digitMap={},newRoots=[],oldGeometry=new Map();
  for(const side of ['left','right']){
    const mesh=handMeshes[side],wrist=bones[`${side}Hand`],wristIndex=allBones.indexOf(wrist);
    if(wristIndex<0)throw new Error('Missing real wrist bone');
    const wristBindWorld=oldSkeleton.boneInverses[wristIndex].clone().invert();
    const handRecord={mesh,wrist,wristIndex,digits:{}};digitMap[side]=handRecord;
    for(const digit of DIGITS){
      const base=bindPoint(mesh,side,...digit.base),tip=bindPoint(mesh,side,...digit.tip);
      const axisY=tip.clone().sub(base).normalize();
      const axisZ=new THREE.Vector3(0,0,1).transformDirection(mesh.bindMatrix);
      const axisX=axisY.clone().cross(axisZ).normalize();axisZ.copy(axisX).cross(axisY).normalize();
      const joints=[],indices=[],restQuaternions=[],bindMatrices=[],lengths=[];
      let parent=wrist,parentBind=wristBindWorld;
      for(let i=0;i<3;i++){
        const world=new THREE.Matrix4().makeBasis(axisX,axisY,axisZ).setPosition(base.clone().lerp(tip,digit.fractions[i]));
        const local=parentBind.clone().invert().multiply(world);
        const joint=new THREE.Bone();joint.name=`${side} ${digit.name} joint ${i+1}`;
        local.decompose(joint.position,joint.quaternion,joint.scale);joint.updateMatrix();parent.add(joint);
        if(i===0)newRoots.push(joint);
        joint.userData.selectedAppearanceFinger={side,digit:digit.name,phalanx:i+1};
        joints.push(joint);indices.push(allBones.length);restQuaternions.push(joint.quaternion.clone());bindMatrices.push(world.clone());
        allBones.push(joint);allInverses.push(world.clone().invert());
        lengths.push(base.distanceTo(tip)*((digit.fractions[i+1]??1)-digit.fractions[i]));
        parent=joint;parentBind=world;
      }
      handRecord.digits[digit.name]={spec:digit,joints,indices,restQuaternions,bindMatrices,lengths};
    }
    const original=mesh.geometry;oldGeometry.set(mesh,original);
    const geometry=original.clone(),position=geometry.getAttribute('position');
    const indices=new Uint16Array(position.count*4),weights=new Float32Array(position.count*4);
    for(let i=0;i<position.count;i++){
      const actualPx=position.getX(i)*260+580,px=side==='left'?actualPx:1156-actualPx;
      const py=835-(position.getY(i)-.20)*260;
      const field=digitField(px,py),strength=field?clamp(field.strength):0;
      let influences=[[wristIndex,1-strength]];
      if(field&&strength>1e-7){
        const handDigit=handRecord.digits[field.digit.name],blend=phalanxWeights(field.t);
        influences.push(...blend.map((w,k)=>[handDigit.indices[k],w*strength]));
      }
      influences=influences.filter(([,w])=>w>1e-8).sort((a,b)=>b[1]-a[1]).slice(0,4);
      const total=influences.reduce((sum,[,w])=>sum+w,0);
      for(let k=0;k<4;k++){indices[i*4+k]=influences[k]?.[0]??wristIndex;weights[i*4+k]=(influences[k]?.[1]??0)/total;}
    }
    geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));
    geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));mesh.geometry=geometry;
    handRest.set(side,Float32Array.from(position.array));
  }
  const skeleton=new THREE.Skeleton(allBones,allInverses);
  for(const mesh of skinned)if(mesh.skeleton===oldSkeleton)mesh.skeleton=skeleton;
  root.updateMatrixWorld(true);skeleton.update();
  function setPose(side,values={}){
    const hand=digitMap[side];if(!hand)throw new Error('Unknown hand');
    for(const digit of Object.values(hand.digits)){
      const curl=clamp(Number(values[digit.spec.name]??values.grip??0));
      for(let i=0;i<3;i++){
        const q=digit.restQuaternions[i].clone();
        if(i===0&&digit.spec.name==='thumb'){
          const op=clamp(Number(values.opposition??0)),sign=side==='left'?-1:1;
          q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),sign*.55*op));
          q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),sign*.55*op));
        }
        q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),THREE.MathUtils.degToRad(digit.spec.maxFlex[i])*curl));
        digit.joints[i].quaternion.copy(q);
      }
    }
    root.updateMatrixWorld(true);skeleton.update();
  }
  function metadata(){
    return {schema:'dafeiyu.source-finger-rig.v1',sourceBodyBones:oldSkeleton.bones.length,bodyBones:skeleton.bones.length,addedBones:skeleton.bones.length-oldSkeleton.bones.length,
      scope:'Original closed five-digit geometry and source UV/materials are retained. Additional joints/weights only. This does not certify anatomical final quality, contact, self-collision or force-closure grasping.',
      coordinates:'Original study bind units, Y up, +Z front. Not a calibrated physical metre scale.',hands:Object.fromEntries(Object.entries(digitMap).map(([side,hand])=>[side,{wrist:hand.wrist.name,
        digits:Object.fromEntries(Object.entries(hand.digits).map(([name,d])=>[name,{bones:d.joints.map(b=>b.name),indices:d.indices,bindMatrices:d.bindMatrices.map(m=>m.toArray()),lengths:d.lengths,maxFlexDegrees:d.spec.maxFlex,restLocalQuaternions:d.restQuaternions.map(q=>q.toArray())}]))}]))};
  }
  function dispose(){
    for(const mesh of skinned)if(mesh.skeleton===skeleton)mesh.skeleton=oldSkeleton;
    for(const [mesh,geometry]of oldGeometry){mesh.geometry.dispose();mesh.geometry=geometry;}
    for(const bone of newRoots)bone.removeFromParent();skeleton.dispose();root.updateMatrixWorld(true);
  }
  return{root,skeleton,oldSkeleton,hands:handMeshes,digitMap,setPose,metadata,dispose};
}
