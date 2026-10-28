import assert from 'node:assert/strict';
import * as THREE from '../rig3d-prototype/vendor/three.module.js';
import {createPaintedSecondaryMotion} from './secondary-motion.js';

function fixture(impossible=false) {
  const root=new THREE.Group(),bones={};
  const add=(name,position,parent=root)=>{const bone=new THREE.Bone();bone.name=name;bone.position.set(...position);parent.add(bone);bones[name]=bone;return bone;};
  const hips=add('hips',[0,.20,0]),spine=add('spine',[0,.28,0],hips);add('chest',[0,.18,0],spine);
  add('skirtLeft',[-.23,-.06,0],hips);add('skirtRight',[.23,-.06,0],hips);
  add('skirtFront',[0,-.08,.17],hips);add('skirtBack',[0,-.08,-.15],hips);
  for(const[side,sign]of[['left',-1],['right',1]]) {
    const upper=add(`${side}UpperLeg`,[sign*.245,-.667,.015],hips),lower=add(`${side}LowerLeg`,[0,-.235,.025],upper);
    add(`${side}Foot`,[0,-.235,.065],lower);
  }
  const base=add('tailBase',[.37,-.56,-.26],hips),mid=add('tailMid',[.42,-.02,-.025],base);
  add('tailTip',[.43,.075,0],mid);
  if(impossible) {
    for(const key of['tailBase','tailMid','tailTip'])bones[key].userData.secondaryLimit=.001;
    bones.tailTip.userData.secondaryAxis=[-1.20,.40,.28];
  }
  root.updateMatrixWorld(true);
  const initialPositions=new Map(Object.values(bones).map(b=>[b,b.position.clone()]));
  const primary=(time=0,moving=false)=>{
    for(const bone of Object.values(bones))bone.quaternion.identity();
    if(moving){bones.leftUpperLeg.rotation.x=Math.sin(time*2)*.10;bones.rightUpperLeg.rotation.x=-Math.sin(time*2)*.10;bones.tailBase.rotation.y=Math.sin(time)*.025;}
    root.updateMatrixWorld(true);
  };
  const physics=createPaintedSecondaryMotion({root,bones});
  return {root,bones,physics,primary,initialPositions};
}
function check(f) {
  const s=f.physics.snapshot();assert(s.finite);assert(s.maxLengthError<1e-9,`fixed world bone lengths: ${s.maxLengthError}`);
  for(const p of s.particles){assert(p.deflection<=p.angleLimit+1e-6,`angle cap ${p.name}`);assert(p.current.every(Number.isFinite));}
  for(const[bone,position]of f.initialPositions)assert(bone.position.equals(position),'secondary solver never moves a bone anchor');
  return s;
}
const rig=fixture();
for(let i=0;i<600;i++){rig.primary();rig.physics.update(1/60,i/60,{});check(rig);}
const settled=check(rig);
const speed=Math.max(...settled.particles.map(p=>new THREE.Vector3(...p.current).distanceTo(new THREE.Vector3(...p.previous))/(1/120)));
assert(speed<1e-5,`static springs converge: ${speed}`);
assert(settled.maxPenetration<2e-5,`normal leg/hip contact is resolved: ${settled.maxPenetration}`);
const before=settled.particles.find(p=>p.name==='tailBase').current;
rig.root.position.z+=.025;rig.primary();rig.physics.update(1/60,11,{});
const after=check(rig).particles.find(p=>p.name==='tailBase').current;
assert(after[2]-before[2]<.022,'world-space particle lags behind a moving root');
const frozen=rig.physics.snapshot().particles;
for(let i=0;i<100;i++){rig.primary();rig.physics.update(0,999+i,{});}
assert.deepEqual(rig.physics.snapshot().particles,frozen,'dt0 does not drift, consume time or change particles');
rig.primary();rig.physics.update(0,1000,{secondaryStrength:.2});check(rig);
rig.primary();rig.physics.update(0,1000,{secondaryStrength:0});
assert(rig.physics.snapshot().particles.every(p=>p.deflection<1e-7),'strength0 restores the primary pose');
for(let i=0;i<240;i++) {
  const time=i/60;rig.root.position.x=Math.sin(time)*.025;rig.root.rotation.y=Math.sin(time*.6)*.08;rig.primary(time,true);
  rig.physics.update(1/60,time,{secondaryStrength:1});check(rig);
}
const animated=check(rig);
assert(animated.maxPenetration<2e-5,`small body motion respects capsule contacts: ${animated.maxPenetration}`);
rig.root.position.x+=2;rig.primary();rig.physics.update(0,20,{});
const teleported=check(rig);assert.equal(teleported.lastResetReason,'teleport-or-scale');
assert(teleported.particles.every(p=>p.current.every((v,i)=>v===p.previous[i])),'teleport clears inherited velocity');
rig.physics.reset();const reset=check(rig);assert.equal(reset.accumulator,0);assert(reset.particles.every(p=>p.deflection<1e-7));
rig.root.scale.set(1,1.1,1);rig.primary();rig.physics.update(1/60,21,{});assert.equal(check(rig).suspended,true);
const impossible=fixture(true);
for(let i=0;i<60;i++){impossible.primary();impossible.physics.update(1/60,i/60,{});check(impossible);}
const limited=impossible.physics.snapshot();assert(limited.limitations.length>0,'infeasible collisions are reported instead of stretching');
const fixed=fixture();fixed.primary();fixed.physics.update(1/60,0,{});assert.equal(fixed.physics.snapshot().substeps,2,'120Hz fixed steps');
console.log(JSON.stringify({passed:true,fixedStep:1/120,bones:settled.particles.length,colliders:settled.colliders.length,staticMaxSpeed:speed,
  maxLengthError:animated.maxLengthError,animatedMaxPenetration:animated.maxPenetration,pausedFrames:100,infeasibleContactsReported:limited.limitations.length,
  scope:'Bone-tip sphere/capsule collision checks; no claim of full mesh cloth collision'},null,2));
