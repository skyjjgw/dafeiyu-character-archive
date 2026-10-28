import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/package/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from './vendor/package/examples/jsm/exporters/GLTFExporter.js';
import { createCharacter } from './character.js?v=3';

const $=id=>document.getElementById(id),stage=$('viewport');
const state={action:'idle',paused:matchMedia('(prefers-reduced-motion: reduce)').matches,talking:false,mood:'neutral'};
const labels={idle:'自然待机',wave:'抬手招呼',walk:'走动演示',turn:'转身观察'};
let renderer,rig,controls,frame,last=0,elapsed=0,skeleton,disposed=false;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,1,.1,80),target=new THREE.Vector3(0,1.65,0);
const cameraGoal=new THREE.Vector3(4,2.8,7.5);
camera.position.copy(cameraGoal);camera.lookAt(target);

function markAction(action){state.action=action;rig.setAction(action);document.querySelectorAll('[data-action]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.action===action)));updateStatus();}
function updateStatus(){ $('status').textContent=(state.paused?'已暂停 · ':'连续动作 · ')+labels[state.action];$('pause').textContent=state.paused?'继续动作':'暂停动作'; }
function resize(){const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
function loop(now){if(disposed)return;frame=requestAnimationFrame(loop);const delta=Math.min(last?(now-last)/1000:0,.05);last=now;if(!state.paused&&!document.hidden){const dt=delta*Number($('speed').value)/100;elapsed+=dt;rig.update(dt,elapsed,state);}controls.autoRotate=$('autoCamera').checked&&!state.paused;controls.update();renderer.render(scene,camera);}
async function exportModel(){
  const button=$('exportModel'),wasPaused=state.paused,saved=[],converted=new Map();button.disabled=true;state.paused=true;
  function convert(m){if(converted.has(m))return converted.get(m);const n=new THREE.MeshStandardMaterial({color:m.color||0xffffff,roughness:1,metalness:0,side:m.side,transparent:m.transparent,opacity:m.opacity,map:m.map||null});converted.set(m,n);return n;}
  try{rig.root.traverse(o=>{if(o.isMesh){saved.push([o,o.material]);o.material=Array.isArray(o.material)?o.material.map(convert):convert(o.material);}});rig.root.updateMatrixWorld(true);const result=await new GLTFExporter().parseAsync(rig.root,{binary:true,onlyVisible:true});const url=URL.createObjectURL(new Blob([result],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download='dafeiyu-rig3d-motion-study.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);$('modelInfo').textContent='已保存模型与骨骼；GLB 使用基础材质，Toon 和动作控制保存在本地工程中。';}
  catch(error){$('modelInfo').textContent='导出未完成：'+error.message;}
  finally{for(const [mesh,material]of saved)mesh.material=material;for(const material of converted.values())material.dispose();state.paused=wasPaused;button.disabled=false;updateStatus();}
}

try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.append(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xf5f7ff,0x738397,1.7));
  const key=new THREE.DirectionalLight(0xfff5e8,2.4);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-4;key.shadow.camera.right=4;key.shadow.camera.top=5;key.shadow.camera.bottom=-3;key.shadow.normalBias=.035;key.shadow.bias=-.0002;scene.add(key);const fill=new THREE.DirectionalLight(0xd6e8ff,.8);fill.position.set(4,4,-3);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({color:0x28435b,opacity:.17}));floor.rotation.x=-Math.PI/2;floor.position.y=-.018;floor.receiveShadow=true;scene.add(floor);
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.55,.045,96),new THREE.MeshToonMaterial({color:0xbacbda}));disc.position.y=-.044;disc.receiveShadow=true;scene.add(disc);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.52,.009,8,128),new THREE.MeshBasicMaterial({color:0xf1f5f9,transparent:true,opacity:.7}));ring.rotation.x=Math.PI/2;ring.position.y=-.017;scene.add(ring);
  rig=createCharacter();scene.add(rig.root);rig.root.updateMatrixWorld(true);
  skeleton=new THREE.SkeletonHelper(rig.root);skeleton.visible=false;skeleton.material.depthTest=false;skeleton.renderOrder=100;scene.add(skeleton);
  controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;controls.minDistance=4.3;controls.maxDistance=12;controls.maxPolarAngle=Math.PI*.57;controls.minPolarAngle=.25;controls.autoRotateSpeed=.7;
  let bones=0,skins=0;rig.root.traverse(o=>{if(o.isBone)bones++;if(o.isSkinnedMesh)skins++;});$('modelInfo').textContent=`${bones} 个骨骼 · ${skins} 个蒙皮网格 · 程序化动作验证模型`;
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>markAction(b.dataset.action)));
  $('pause').addEventListener('click',()=>{state.paused=!state.paused;updateStatus();});$('pause').disabled=false;
  $('speed').addEventListener('input',()=>{$('speedValue').textContent=(Number($('speed').value)/100).toFixed(1)+'×';});
  $('talking').addEventListener('change',()=>{state.talking=$('talking').checked;});$('skeleton').addEventListener('change',()=>{skeleton.visible=$('skeleton').checked;});
  const viewpoints={front:[0,2.55,8.5],threequarter:[4,2.8,7.5],side:[8.5,2.55,0],back:[0,2.55,-8.5]};
  document.querySelectorAll('[data-camera]').forEach(b=>b.addEventListener('click',()=>{camera.position.fromArray(viewpoints[b.dataset.camera]);controls.target.copy(target);controls.update();document.querySelectorAll('[data-camera]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
  $('exportModel').disabled=false;$('exportModel').addEventListener('click',exportModel);
  new ResizeObserver(resize).observe(stage);resize();updateStatus();$('loading').hidden=true;frame=requestAnimationFrame(loop);
}catch(error){$('loading').textContent='3D 舞台载入失败：'+error.message;$('status').textContent='请刷新页面重试';console.error(error);}
window.addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(frame);controls?.dispose();renderer?.dispose();rig?.dispose?.();});
