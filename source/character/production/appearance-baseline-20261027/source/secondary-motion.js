import * as THREE from '../rig3d-prototype/vendor/three.module.js';

/**
 * Call after the body's primary animation has restored/written its local
 * quaternions. Only the seven secondary rotations are modified. Particles are
 * retained in world space, so moving the body produces lag without a sine
 * oscillator. Bone positions/scales and the anchored tail root never change.
 *
 * Colliders constrain the seven simulated bone tips, not every cloth or tail
 * triangle. Incompatible contacts remain visible in snapshot().limitations;
 * neither bone stretching nor unbounded joint rotations conceal them.
 */
export function createPaintedSecondaryMotion({root,bones}={}) {
  if(!root?.isObject3D||!bones||typeof bones!=='object')throw new TypeError('Secondary motion requires root and the painted body bones');
  const STEP=1/120,MAX_STEPS=6,MAX_FRAME=STEP*MAX_STEPS,EPS=1e-10;
  const TELEPORT=.65,LONG_GAP=.25,TELEPORT_ANGLE=Math.PI*.6;
  const clamp=THREE.MathUtils.clamp;
  const finiteVector=v=>Number.isFinite(v.x)&&Number.isFinite(v.y)&&Number.isFinite(v.z);
  const finiteQuat=q=>finiteVector(q)&&Number.isFinite(q.w);
  const v=value=>value?.isVector3?value.clone():Array.isArray(value)?new THREE.Vector3(...value):null;
  const required=['tailBase','tailMid','tailTip','skirtLeft','skirtRight','skirtFront','skirtBack'];
  for(const key of required)if(!bones[key]?.isBone)throw new TypeError(`Missing secondary bone: ${key}`);
  if(bones.tailMid.parent!==bones.tailBase||bones.tailTip.parent!==bones.tailMid)throw new Error('tailBase → tailMid → tailTip must be an actual bone chain');
  root.updateWorldMatrix(true,true);
  const up=new THREE.Vector3(0,1,0),right=new THREE.Vector3(1,0,0);
  const anchor=new THREE.Vector3(),targetTip=new THREE.Vector3(),restDirection=new THREE.Vector3();
  const predicted=new THREE.Vector3(),velocity=new THREE.Vector3(),acceleration=new THREE.Vector3();
  const direction=new THREE.Vector3(),toward=new THREE.Vector3(),tangent=new THREE.Vector3(),closest=new THREE.Vector3();
  const lineAxis=new THREE.Vector3(),offset=new THREE.Vector3(),localDirection=new THREE.Vector3(),restLocalDirection=new THREE.Vector3();
  const inverseParent=new THREE.Matrix4(),rotation=new THREE.Quaternion(),limited=new THREE.Quaternion();
  const rootPosition=new THREE.Vector3(),rootQuaternion=new THREE.Quaternion(),rootScale=new THREE.Vector3();
  const lastRootPosition=new THREE.Vector3(),lastRootQuaternion=new THREE.Quaternion(),lastRootScale=new THREE.Vector3();
  const scaleScratch=new THREE.Vector3(),actualTip=new THREE.Vector3();
  const defaults={
    tailBase:{kind:'tail',axis:bones.tailMid.position,stiffness:195,damping:11,angle:.22,radius:.035,gravity:.055},
    tailMid:{kind:'tail',axis:bones.tailTip.position,stiffness:165,damping:10,angle:.34,radius:.045,gravity:.065},
    tailTip:{kind:'tail',axis:bones.tailTip.position.clone().normalize().multiplyScalar(.20),stiffness:145,damping:10,angle:.40,radius:.055,gravity:.07},
    skirtLeft:{kind:'skirt',axis:new THREE.Vector3(-.12,-.58,0),stiffness:265,damping:14,angle:.24,radius:.020,gravity:.13},
    skirtRight:{kind:'skirt',axis:new THREE.Vector3(.12,-.58,0),stiffness:265,damping:14,angle:.24,radius:.020,gravity:.13},
    skirtFront:{kind:'skirt',axis:new THREE.Vector3(0,-.58,.12),stiffness:285,damping:15,angle:.22,radius:.020,gravity:.13},
    skirtBack:{kind:'skirt',axis:new THREE.Vector3(0,-.58,-.12),stiffness:285,damping:15,angle:.22,radius:.020,gravity:.13},
  };
  const joints=required.map(key=>{
    const bone=bones[key],settings=defaults[key],axis=v(bone.userData.secondaryAxis)||settings.axis.clone();
    if(!finiteVector(axis)||axis.lengthSq()<EPS)throw new Error(`Zero or invalid secondary axis: ${key}`);
    const limit=Number(bone.userData.secondaryLimit),radius=Number(bone.userData.secondaryRadius);
    return {key,bone,axis,kind:settings.kind,stiffness:settings.stiffness,damping:settings.damping,
      angle:Number.isFinite(limit)?clamp(limit,.001,.8):settings.angle,radius:Number.isFinite(radius)?clamp(radius,0,.2):settings.radius,gravity:settings.gravity,
      target:bone.quaternion.clone(),applied:bone.quaternion.clone(),delta:new THREE.Quaternion(),
      current:new THREE.Vector3(),previous:new THREE.Vector3(),initialPosition:bone.position.clone(),initialScale:bone.scale.clone(),
      length:0,actualLength:0,deflection:0,penetration:0};
  });
  const colliders=[];
  const pelvis=bones.hips||bones.pelvis,chest=bones.chest||bones.spine;
  if(pelvis)colliders.push({name:'hips',type:'sphere',bone:pelvis,offset:new THREE.Vector3(0,-.08,0),radius:.255});
  if(pelvis&&chest)colliders.push({name:'body',type:'capsule',startBone:pelvis,endBone:chest,startOffset:new THREE.Vector3(0,.06,0),endOffset:new THREE.Vector3(),radius:.19});
  for(const side of['left','right']) {
    const upper=bones[`${side}UpperLeg`],lower=bones[`${side}LowerLeg`],foot=bones[`${side}Foot`];
    if(upper&&lower)colliders.push({name:`${side} thigh`,type:'capsule',startBone:upper,endBone:lower,startOffset:new THREE.Vector3(),endOffset:new THREE.Vector3(),radius:.095});
    if(lower&&foot)colliders.push({name:`${side} shin`,type:'capsule',startBone:lower,endBone:foot,startOffset:new THREE.Vector3(),endOffset:new THREE.Vector3(),radius:.078});
  }
  let initialized=false,accumulator=0,lastStrength=1,resetCount=0,lastResetReason='initial';
  let substeps=0,totalSteps=0,droppedSeconds=0,suspended=false;
  let worldColliders=[],limitations=[];
  const metadata={
    type:'painted-tail-and-skirt-secondary-motion',method:'fixed-step damped world-space Verlet with a moving animated spring target',
    fixedStep:STEP,maxSubsteps:MAX_STEPS,maxFrameSeconds:MAX_FRAME,gravity:[0,-9.81,0],controlledBones:required,
    input:'secondaryStrength [0,1], default 1; body animation runs first; dt 0 freezes dynamics',
    overrides:'bone.userData.secondaryAxis (local tip vector), secondaryLimit (radians), secondaryRadius',
    resetConditions:{rootTeleportDistance:TELEPORT,rootTeleportAngle:TELEPORT_ANGLE,longFrameSeconds:LONG_GAP},
    scope:'Seven bone-tip particles and sphere/capsule tip collisions; not full mesh cloth, rigid bodies or self collision',
    limitations:['Fixed lengths and angle limits take precedence over impossible collider contacts.','Nonuniform ancestor scale suspends physics.','Tail roots are anchored by the primary skeleton; no root translation is introduced.'],
  };
  function readRoot() {root.matrixWorld.decompose(rootPosition,rootQuaternion,rootScale);}
  function rememberRoot() {lastRootPosition.copy(rootPosition);lastRootQuaternion.copy(rootQuaternion);lastRootScale.copy(rootScale);}
  function captureTargets() {
    let changed=false;
    for(const j of joints) {
      if(!finiteQuat(j.bone.quaternion))throw new Error(`Invalid target quaternion: ${j.key}`);
      // Also tolerate a caller inspecting/updating physics repeatedly without
      // rewriting an unchanged primary pose: never feed our own result back
      // into the next animated target and accumulate rotations.
      if(!initialized||j.bone.quaternion.angleTo(j.applied)>1e-7) {
        changed=changed||j.target.angleTo(j.bone.quaternion)>1e-7;
        j.target.copy(j.bone.quaternion).normalize();
      }
      j.bone.quaternion.copy(j.target);
    }
    root.updateWorldMatrix(true,true);return changed;
  }
  function animatedTip(j,out) {
    return out.copy(j.axis).multiply(j.bone.scale).applyQuaternion(j.target).add(j.bone.position).applyMatrix4(j.bone.parent.matrixWorld);
  }
  function seed(reason,restore=true) {
    if(restore)for(const j of joints){j.bone.quaternion.copy(j.target);j.delta.identity();j.applied.copy(j.target);}
    root.updateWorldMatrix(true,true);
    for(const j of joints){j.current.copy(j.axis).applyMatrix4(j.bone.matrixWorld);j.previous.copy(j.current);}
    accumulator=0;readRoot();rememberRoot();initialized=true;lastResetReason=reason;
    if(reason!=='initial')resetCount++;
  }
  function captureColliders() {
    return colliders.map(c=>{
      const source=c.bone||c.startBone;source.getWorldScale(scaleScratch);
      const radius=c.radius*Math.max(Math.abs(scaleScratch.x),Math.abs(scaleScratch.y),Math.abs(scaleScratch.z));
      if(c.type==='sphere')return {name:c.name,type:c.type,center:c.bone.localToWorld(c.offset.clone()),radius};
      return {name:c.name,type:c.type,start:c.startBone.localToWorld(c.startOffset.clone()),end:c.endBone.localToWorld(c.endOffset.clone()),radius};
    });
  }
  function closestPoint(c,p,out) {
    if(c.type==='sphere')return out.copy(c.center);
    lineAxis.copy(c.end).sub(c.start);
    const t=lineAxis.lengthSq()<EPS?0:clamp(offset.copy(p).sub(c.start).dot(lineAxis)/lineAxis.lengthSq(),0,1);
    return out.copy(c.start).addScaledVector(lineAxis,t);
  }
  function constrain(point,length,maxAngle) {
    direction.copy(point).sub(anchor);
    if(!finiteVector(direction)||direction.lengthSq()<EPS)direction.copy(restDirection);else direction.normalize();
    const angle=Math.acos(clamp(direction.dot(restDirection),-1,1));
    if(angle>maxAngle){rotation.setFromUnitVectors(restDirection,direction);limited.identity().slerp(rotation,maxAngle/angle);direction.copy(restDirection).applyQuaternion(limited).normalize();}
    point.copy(anchor).addScaledVector(direction,length);
  }
  function projectCollider(point,length,c,radius) {
    closestPoint(c,point,closest);const combined=c.radius+radius;
    if(point.distanceToSquared(closest)>=combined*combined-1e-12)return;
    toward.copy(closest).sub(anchor);const distance=toward.length();
    if(distance<EPS)return;
    toward.divideScalar(distance);
    const cosine=(distance*distance+length*length-combined*combined)/(2*distance*length);
    if(cosine<-1||cosine>=1)return;
    direction.copy(point).sub(anchor).normalize();
    tangent.copy(direction).addScaledVector(toward,-direction.dot(toward));
    if(tangent.lengthSq()<EPS)tangent.copy(restDirection).addScaledVector(toward,-restDirection.dot(toward));
    if(tangent.lengthSq()<EPS)tangent.crossVectors(toward,Math.abs(toward.y)<.9?up:right);
    tangent.normalize();
    point.copy(anchor).addScaledVector(toward,length*cosine).addScaledVector(tangent,length*Math.sqrt(Math.max(0,1-cosine*cosine)));
  }
  function orient(j,point) {
    inverseParent.copy(j.bone.parent.matrixWorld).invert();
    localDirection.copy(point).applyMatrix4(inverseParent).sub(j.bone.position).normalize();
    restLocalDirection.copy(j.axis).multiply(j.bone.scale).applyQuaternion(j.target).normalize();
    rotation.setFromUnitVectors(restLocalDirection,localDirection);
    j.bone.quaternion.copy(rotation).multiply(j.target).normalize();j.applied.copy(j.bone.quaternion);
    j.delta.copy(rotation);j.bone.updateMatrixWorld(true);
    j.current.copy(j.axis).applyMatrix4(j.bone.matrixWorld);
  }
  function simulate(strength) {
    for(const j of joints) {
      j.bone.getWorldPosition(anchor);animatedTip(j,targetTip);
      restDirection.copy(targetTip).sub(anchor);const length=restDirection.length();
      if(!Number.isFinite(length)||length<EPS)throw new Error(`Invalid animated segment: ${j.key}`);
      restDirection.divideScalar(length);
      velocity.copy(j.current).sub(j.previous).multiplyScalar(Math.exp(-j.damping*STEP));
      velocity.clampLength(0,Math.min(length*.22,.045));
      acceleration.copy(targetTip).sub(j.current).multiplyScalar(j.stiffness);
      acceleration.y-=9.81*j.gravity*strength;
      predicted.copy(j.current).add(velocity).addScaledVector(acceleration,STEP*STEP);
      j.bone.getWorldScale(scaleScratch);
      const radius=j.radius*Math.abs(scaleScratch.x),angle=j.angle*strength;
      for(let i=0;i<10;i++) {
        constrain(predicted,length,angle);
        for(const c of worldColliders)projectCollider(predicted,length,c,radius);
      }
      constrain(predicted,length,angle);j.previous.copy(j.current);orient(j,predicted);
    }
  }
  function measure(strength) {
    limitations=[];
    for(const j of joints) {
      j.bone.getWorldPosition(anchor);animatedTip(j,targetTip);actualTip.copy(j.axis).applyMatrix4(j.bone.matrixWorld);
      j.length=anchor.distanceTo(targetTip);j.actualLength=anchor.distanceTo(actualTip);
      j.deflection=j.target.angleTo(j.bone.quaternion);j.penetration=0;
      j.bone.getWorldScale(scaleScratch);const radius=j.radius*Math.abs(scaleScratch.x);
      if(strength>0&&!suspended)for(const c of worldColliders) {
        closestPoint(c,actualTip,closest);const depth=Math.max(0,c.radius+radius-actualTip.distanceTo(closest));
        j.penetration=Math.max(j.penetration,depth);
        if(depth>1e-5)limitations.push({bone:j.key,collider:c.name,penetration:depth,reason:'contact unresolved within fixed-length and joint-angle limits'});
      }
    }
  }
  function reset() {captureTargets();seed('explicit-reset');worldColliders=captureColliders();measure(lastStrength);}
  function update(dt,time,state={}) {
    const targetChanged=captureTargets();readRoot();
    let strength=Number(state.secondaryStrength);strength=Number.isFinite(strength)?clamp(strength,0,1):1;
    const rawDelta=state.paused?0:Number(dt),delta=Number.isFinite(rawDelta)?Math.max(0,rawDelta):0;
    const moved=initialized&&(rootPosition.distanceTo(lastRootPosition)>1e-8||rootQuaternion.angleTo(lastRootQuaternion)>1e-7||rootScale.distanceTo(lastRootScale)>1e-8);
    let pausedSync=moved||targetChanged;
    substeps=0;suspended=false;
    for(const j of joints) {
      j.bone.parent.getWorldScale(scaleScratch);
      const largest=Math.max(Math.abs(scaleScratch.x),Math.abs(scaleScratch.y),Math.abs(scaleScratch.z));
      if(!finiteVector(scaleScratch)||largest<EPS||Math.max(Math.abs(Math.abs(scaleScratch.x)-Math.abs(scaleScratch.y)),Math.abs(Math.abs(scaleScratch.x)-Math.abs(scaleScratch.z)))>largest*1e-5)suspended=true;
    }
    if(!initialized){seed('initial');pausedSync=false;}
    else if(rootPosition.distanceTo(lastRootPosition)>TELEPORT||rootQuaternion.angleTo(lastRootQuaternion)>TELEPORT_ANGLE||rootScale.distanceTo(lastRootScale)>1e-5){seed('teleport-or-scale');pausedSync=false;}
    else if(delta>LONG_GAP){seed('long-frame');pausedSync=false;}
    if(strength===0||suspended) {
      seed(strength===0?'disabled':'nonuniform-scale');
      lastStrength=strength;worldColliders=captureColliders();measure(strength);return;
    }
    if(lastStrength===0)seed('enabled');
    if(strength<lastStrength&&lastStrength>0){for(const j of joints)j.delta.slerp(new THREE.Quaternion(),1-strength/lastStrength);pausedSync=true;}
    if(delta===0) {
      for(const j of joints){j.bone.quaternion.copy(j.delta).multiply(j.target).normalize();j.applied.copy(j.bone.quaternion);j.bone.updateMatrixWorld(true);}
      if(pausedSync)seed('paused-pose-edit',false);
      worldColliders=captureColliders();measure(strength);rememberRoot();lastStrength=strength;return;
    }
    worldColliders=captureColliders();
    accumulator+=Math.min(delta,MAX_FRAME);droppedSeconds+=Math.max(0,delta-MAX_FRAME);
    while(accumulator+1e-12>=STEP&&substeps<MAX_STEPS){simulate(strength);accumulator=Math.max(0,accumulator-STEP);substeps++;totalSteps++;}
    // A frame shorter than STEP still needs its saved offset reapplied after
    // primary animation, but consumes no time and performs no partial step.
    if(substeps===0)for(const j of joints){j.bone.quaternion.copy(j.delta).multiply(j.target).normalize();j.applied.copy(j.bone.quaternion);j.bone.updateMatrixWorld(true);}
    root.updateWorldMatrix(true,true);measure(strength);readRoot();rememberRoot();lastStrength=strength;
  }
  function snapshot() {
    return {type:metadata.type,fixedStep:STEP,substeps,totalSteps,simulatedSeconds:totalSteps*STEP,accumulator,droppedSeconds,
      strength:lastStrength,suspended,resetCount,lastResetReason,
      finite:joints.every(j=>finiteVector(j.current)&&finiteVector(j.previous)&&finiteQuat(j.bone.quaternion)),
      maxLengthError:Math.max(...joints.map(j=>Math.abs(j.actualLength-j.length))),
      maxPenetration:Math.max(...joints.map(j=>j.penetration)),maxDeflection:Math.max(...joints.map(j=>j.deflection)),
      limitations:limitations.map(item=>({...item})),
      particles:joints.map(j=>({name:j.key,kind:j.kind,current:j.current.toArray(),previous:j.previous.toArray(),target: j.target.toArray(),applied:j.applied.toArray(),localAnchor:j.bone.position.toArray(),localAxis:j.axis.toArray(),length:j.length,actualLength:j.actualLength,deflection:j.deflection,angleLimit:j.angle*lastStrength,radius:j.radius,penetration:j.penetration})),
      colliders:worldColliders.map(c=>({...c,center:c.center?.toArray(),start:c.start?.toArray(),end:c.end?.toArray()})),
    };
  }
  captureTargets();seed('initial');worldColliders=captureColliders();measure(1);
  return {update,reset,metadata,snapshot};
}
