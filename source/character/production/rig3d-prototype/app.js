import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/package/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from './vendor/package/examples/jsm/exporters/GLTFExporter.js';
import { createCharacter } from './character.js?v=refine5';
import { createCharacter as createInitialCharacter } from './character-v1.js';
import { readTuning, createTuningEditor } from './tuning.js';
import { createSecondaryPhysics } from './physics.js';
import { createLocomotion } from './locomotion.js';

const $=id=>document.getElementById(id),stage=$('viewport');
const state={action:'idle',paused:matchMedia('(prefers-reduced-motion: reduce)').matches,talking:false,mood:'neutral'};
const labels={idle:'自然待机',wave:'抬手招呼',walk:'走动演示',turn:'转身观察'};
let renderer,rig,controls,frame,last=0,elapsed=0,skeleton,disposed=false,modelKind='refined',tuning=readTuning(),tuningEditor;
let outlineMaterials=[],secondary,motor,modelGeneration=0,lastPhysicsStatus=0;
let measuredFrames=0,performanceStart=0;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,1,.1,80),target=new THREE.Vector3(0,1.65,0);
const cameraGoal=new THREE.Vector3(3.3,2.45,6.5);
const followedPosition=new THREE.Vector3(),currentPosition=new THREE.Vector3(),followDelta=new THREE.Vector3();
camera.position.copy(cameraGoal);camera.lookAt(target);

function markAction(action){if(action===state.action){if(action!=='turn'||!rig.root.userData.actionCompleted)return;motor?.update(0,{...state,action:'idle',paused:false});}state.action=action;rig.setAction(action);document.querySelectorAll('[data-action]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.action===action)));updateStatus();}
function updateStatus(){ $('status').textContent=(state.paused?'已暂停 · ':'连续动作 · ')+labels[state.action];$('pause').textContent=state.paused?'继续动作':'暂停动作'; }
function resize(){const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
function loadModel(kind){
  const generation=++modelGeneration;
  camera.position.sub(followedPosition);controls?.target.sub(followedPosition);followedPosition.set(0,0,0);
  motor?.dispose();motor=null;
  secondary?.dispose();secondary=null;
  if(skeleton){scene.remove(skeleton);skeleton.geometry.dispose();skeleton.material.dispose();}
  for(const material of outlineMaterials)material.dispose();outlineMaterials=[];
  rig?.dispose?.();modelKind=kind;rig=kind==='initial'?createInitialCharacter():createCharacter(tuning);scene.add(rig.root);rig.root.updateMatrixWorld(true);rig.setAction(state.action);
  if(kind==='refined')secondary=createSecondaryPhysics({root:rig.root,skeleton:rig.skeleton,body:rig.body});
  $('physicsStatus').textContent=kind==='refined'?'正在准备地面与足部约束…':'初版动作对照';
  if(kind==='refined')createLocomotion(rig).then(next=>{if(disposed||generation!==modelGeneration){next.dispose();return;}motor=next;secondary.reset();$('physicsStatus').textContent='地面接触 · 双足 IK · 尾发惯性与碰撞';}).catch(error=>{if(generation===modelGeneration){$('physicsStatus').textContent='地面控制未就绪：'+error.message;console.error(error);}});
  if(kind==='refined'&&tuning.outlineWidth>0){
    outlineMaterials=rig.body.material.map(m=>{const n=m.clone();n.isOutline=true;n.side=THREE.BackSide;n.outlineWidthMode='worldCoordinates';n.outlineWidthFactor=tuning.outlineWidth;n.outlineColorFactor.set(0x1c2945);n.outlineLightingMixFactor=0;n.update(0);return n;});
    const pass=new THREE.SkinnedMesh(rig.body.geometry,outlineMaterials);pass.name='MToon outline render pass';pass.userData.renderOnly=true;pass.bind(rig.skeleton,rig.body.bindMatrix);pass.frustumCulled=false;pass.renderOrder=-1;rig.root.add(pass);
  }
  skeleton=new THREE.SkeletonHelper(rig.root);skeleton.visible=$('skeleton').checked;skeleton.material.depthTest=false;skeleton.renderOrder=100;scene.add(skeleton);
  let bones=0,skins=0;rig.root.traverse(o=>{if(o.isBone)bones++;if(o.isSkinnedMesh&&!o.userData.renderOnly)skins++;});$('modelInfo').textContent=`${kind==='initial'?'初版动作模型':'第一轮造型精修 / MToon'} · ${bones} 骨骼 · ${skins} 个主体蒙皮网格`;
  document.querySelectorAll('[data-model]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.model===kind)));
  target.y=kind==='refined'?1.48:1.65;
  if(controls){const isFace=document.querySelector('[data-camera="face"]')?.getAttribute('aria-pressed')==='true',nextY=isFace?(rig.root.userData.proportions?.headHeight??2.39)+.015:target.y;camera.position.y+=nextY-controls.target.y;controls.target.y=nextY;controls.update();}
}
function loop(now){
  if(disposed)return;
  frame=requestAnimationFrame(loop);
  const delta=Math.min(last?(now-last)/1000:0,.05);last=now;
  if(!state.paused&&!document.hidden){
    const dt=delta*Number($('speed').value)/100;elapsed+=dt;
    rig.update(dt,elapsed,state);
    motor?.update(dt,state);
    secondary?.update(dt,{hairSway:tuning.hairSway,tailSway:tuning.tailSway});
    for(const material of outlineMaterials)material.update(dt);
  }
  rig.root.getWorldPosition(currentPosition);currentPosition.y=0;
  followDelta.copy(currentPosition).sub(followedPosition);
  camera.position.add(followDelta);controls.target.add(followDelta);followedPosition.copy(currentPosition);
  if(motor&&now-lastPhysicsStatus>600){
    lastPhysicsStatus=now;
    const valid=motor.debugInfo.finite&&secondary?.debugInfo.finite;
    $('physicsStatus').textContent=valid?'地面接触 · 双足 IK · 尾发惯性与碰撞':'动力学状态异常，请重新居中';
  }
  controls.autoRotate=$('autoCamera').checked&&!state.paused;
  controls.update();renderer.render(scene,camera);
  if(!performanceStart)performanceStart=now;
  measuredFrames++;
  if(now-performanceStart>=1500){
    $('performanceStatus').textContent=`当前 ${Math.round(measuredFrames*1000/(now-performanceStart))} FPS · ${renderer.info.render.calls} 次绘制 · ${Math.round(renderer.info.render.triangles/1000)}k 三角形`;
    performanceStart=now;measuredFrames=0;
  }
}
async function exportModel(){
  const button=$('exportModel'),wasPaused=state.paused,saved=[],hidden=[],converted=new Map();button.disabled=true;state.paused=true;
  function convert(m){if(converted.has(m))return converted.get(m);const n=new THREE.MeshStandardMaterial({color:m.color||0xffffff,vertexColors:Boolean(m.vertexColors),roughness:1,metalness:0,side:m.side,transparent:m.transparent,opacity:m.opacity,map:m.map||null});converted.set(m,n);return n;}
  try{rig.root.traverse(o=>{if(o.userData.renderOnly){hidden.push([o,o.visible]);o.visible=false;}else if(o.isMesh){saved.push([o,o.material]);o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);}});rig.root.updateMatrixWorld(true);const result=await new GLTFExporter().parseAsync(rig.root,{binary:true,onlyVisible:true});const url=URL.createObjectURL(new Blob([result],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download='dafeiyu-rig3d-refined.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);$('modelInfo').textContent='已保存模型、顶点色与骨骼；MToon 和动作控制保存在本地工程中。';}
  catch(error){$('modelInfo').textContent='导出未完成：'+error.message;}
  finally{for(const [mesh,material]of saved)mesh.material=material;for(const [object,visible]of hidden)object.visible=visible;for(const material of converted.values())material.dispose();state.paused=wasPaused;button.disabled=false;updateStatus();}
}

try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=tuning.exposure;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.append(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xf5f7ff,0x738397,1.7));
  const key=new THREE.DirectionalLight(0xfff5e8,2.4);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=5;key.shadow.camera.bottom=-3;key.shadow.normalBias=.035;key.shadow.bias=-.0002;scene.add(key);const fill=new THREE.DirectionalLight(0xd6e8ff,.8);fill.position.set(4,4,-3);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({color:0x28435b,opacity:.17}));floor.rotation.x=-Math.PI/2;floor.position.y=.0003;floor.receiveShadow=true;scene.add(floor);
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.55,.045,96),new THREE.MeshToonMaterial({color:0xbacbda}));disc.position.y=-.0225;disc.receiveShadow=true;scene.add(disc);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.52,.009,8,128),new THREE.MeshBasicMaterial({color:0xf1f5f9,transparent:true,opacity:.7}));ring.rotation.x=Math.PI/2;ring.position.y=.001;scene.add(ring);
  loadModel('refined');
  controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;controls.minDistance=4.3;controls.maxDistance=12;controls.maxPolarAngle=Math.PI*.57;controls.minPolarAngle=.25;controls.autoRotateSpeed=.7;
  document.querySelectorAll('[data-model]').forEach(b=>b.addEventListener('click',()=>loadModel(b.dataset.model)));
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>markAction(b.dataset.action)));
  $('pause').addEventListener('click',()=>{state.paused=!state.paused;updateStatus();});$('pause').disabled=false;
  $('resetPosition').addEventListener('click',()=>{markAction('idle');if(rig.resetPose){secondary?.reset();rig.resetPose(state);motor?.reset();secondary?.reset();}else loadModel('initial');});
  $('speed').addEventListener('input',()=>{$('speedValue').textContent=(Number($('speed').value)/100).toFixed(1)+'×';});
  $('talking').addEventListener('change',()=>{state.talking=$('talking').checked;});$('mood').addEventListener('change',()=>{state.mood=$('mood').value;});$('skeleton').addEventListener('change',()=>{skeleton.visible=$('skeleton').checked;});
  const viewpoints={front:[0,2.25,6.8],threequarter:[3.3,2.45,6.5],side:[6.8,2.25,0],back:[0,2.25,-6.8],face:[0,2.46,3.15]};
  document.querySelectorAll('[data-camera]').forEach(b=>b.addEventListener('click',()=>{const face=b.dataset.camera==='face',headY=rig.root.userData.proportions?.headHeight??2.39;camera.position.fromArray(viewpoints[b.dataset.camera]).add(followedPosition);if(face)camera.position.y=headY+.06;controls.target.set(followedPosition.x,face?headY+.015:modelKind==='refined'?1.48:1.65,followedPosition.z+(face?.05:0));controls.minDistance=face?2.2:4.3;controls.update();document.querySelectorAll('[data-camera]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
  $('exportModel').disabled=false;$('exportModel').addEventListener('click',exportModel);
  tuningEditor=createTuningEditor({container:$('tuningGui'),initial:tuning,status:$('tuningStatus'),onApply:next=>{tuning=next;renderer.toneMappingExposure=next.exposure;loadModel('refined');}});
  $('importTuning').addEventListener('change',e=>tuningEditor.importFile(e.target.files[0]));
  new ResizeObserver(resize).observe(stage);resize();updateStatus();$('loading').hidden=true;frame=requestAnimationFrame(loop);
}catch(error){$('loading').textContent='3D 舞台载入失败：'+error.message;$('status').textContent='请刷新页面重试';console.error(error);}
window.addEventListener('pagehide',()=>{disposed=true;++modelGeneration;cancelAnimationFrame(frame);controls?.dispose();motor?.dispose();secondary?.dispose();renderer?.dispose();rig?.dispose?.();tuningEditor?.dispose();for(const material of outlineMaterials)material.dispose();});
