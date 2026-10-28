import * as THREE from '../../../rig3d-prototype/vendor/three.module.js';
import {createPaintedFace} from './face.js';
import {createPaintedHair} from './hair.js';
import {createPaintedBody} from './body-full.js';
import {createPerformanceController} from './performance.js';
import {createPaintedSecondaryMotion} from './secondary-motion.js';

const rad=THREE.MathUtils.degToRad;
const finite=(n,fallback=0)=>Number.isFinite(Number(n))?Number(n):fallback;
const clamp=THREE.MathUtils.clamp;
export function createStudyCharacter(texture,{garmentTexture,turnaroundTexture}={}) {
  if(!texture?.isTexture)throw new TypeError('Original reference texture is required');
  const resources=new Set(),root=new THREE.Group();root.name='dafeiyu-animation-look-study';
  const head=new THREE.Bone();head.name='head-control';head.position.y=1.1;head.rotation.order='YXZ';root.add(head);
  const bust=createPaintedBody({parent:root,resources,garmentTexture});
  root.updateMatrixWorld(true);bust.bones.chest.attach(head);
  const face=createPaintedFace({head,resources,texture,sourceWidth:1920,sourceHeight:1080});
  const hair=createPaintedHair({head,resources,texture,garmentTexture,turnaroundTexture,sourceWidth:1920,sourceHeight:1080});
  const performance=createPerformanceController();
  const secondary=createPaintedSecondaryMotion({root,bones:bust.bones});
  const desiredHead=new THREE.Quaternion(),parentRotation=new THREE.Quaternion(),rootRotation=new THREE.Quaternion();
  const headEuler=new THREE.Euler(0,0,0,'YXZ'),worldEuler=new THREE.Euler(0,0,0,'YXZ');
  let disposed=false,initialized=false,yaw=0,pitch=0,yawVelocity=0,pitchVelocity=0;
  function update(delta,time,input={}) {
    if(disposed)return;
    const dt=clamp(finite(delta),0,.05),t=finite(time),idle=input.mode==='idle';
    const directed=performance.update(dt,t,input);
    const targetYaw=clamp(finite(input.yaw)+directed.headYawOffset,-rad(25),rad(25));
    const targetPitch=clamp(finite(input.pitch)+directed.headPitchOffset,-rad(8),rad(8));
    if(dt===0||!initialized){yaw=targetYaw;pitch=targetPitch;yawVelocity=pitchVelocity=0;}
    else {
      const substeps=Math.ceil(dt*120),h=dt/substeps;
      for(let i=0;i<substeps;i++) {
        yawVelocity=clamp(yawVelocity+clamp((targetYaw-yaw)*140-yawVelocity*24,-14,14)*h,-2,2);
        pitchVelocity=clamp(pitchVelocity+clamp((targetPitch-pitch)*140-pitchVelocity*24,-10,10)*h,-1.1,1.1);
        yaw+=yawVelocity*h;pitch+=pitchVelocity*h;
      }
    }
    initialized=true;
    const {blink,talking:talk}=directed;
    const state={...directed,yaw,pitch,blink,talk,talking:talk};
    bust.update(dt,t,state);root.updateMatrixWorld(true);
    root.getWorldQuaternion(rootRotation);head.parent.getWorldQuaternion(parentRotation);
    desiredHead.setFromEuler(headEuler.set(pitch,yaw,directed.headRoll));desiredHead.premultiply(rootRotation);
    head.quaternion.copy(parentRotation.invert().multiply(desiredHead));
    face.update(dt,t,state);root.updateMatrixWorld(true);secondary.update(dt,t,state);hair.update(dt,t,state);
    head.getWorldQuaternion(desiredHead);worldEuler.setFromQuaternion(rootRotation.invert().multiply(desiredHead),'YXZ');
    root.userData.secondaryMotion=secondary.snapshot();
    root.userData.appliedPose={yaw:worldEuler.y,pitch:worldEuler.x,blink,talking:talk,gazeX:state.gazeX,gazeY:state.gazeY,mood:state.mood,mode:input.mode,wave:state.wave,walk:state.walk,happy:state.happy,sad:state.sad};
    metadata.bounds=input.framing==='full'?{min:[-1.18,-1.12,-.65],max:[1.57,2.25,.70]}:{min:[-1.14,.24,-.65],max:[1.14,2.25,.65]};
  }
  function dispose() {
    if(disposed)return;disposed=true;face.dispose();root.removeFromParent();
    for(const resource of resources)resource.dispose();resources.clear();
  }
  const metadata={version:2,scope:'Front painted character and continuous animation study; not a finished avatar',fullBody:true,
    bounds:{min:[-1.14,.24,-.65],max:[1.14,2.25,.65]},
    source:'references/video-covers/BV1g2JX6HEHX.jpg',
    geometry:'Curved face with real eye/mouth holes and closed thick hair panels',
    limitations:['Supported head yaw ±25°, pitch ±8°','Cropped crown and hidden head surfaces are inferred','Body is a front painted skeletal study; ground contacts and full interaction remain unfinished'],
    face:face.metadata,hair:hair.metadata,bust:bust.metadata,secondary:secondary.metadata};
  update(0,0,{mode:'manual',mood:'neutral'});
  return{root,head,bones:bust.bones,update,dispose,metadata,getGrounding:()=>bust.root.userData.grounding,getSecondaryState:()=>secondary.snapshot()};
}
