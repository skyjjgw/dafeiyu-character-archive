import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter} from '../../animation-look-study/character.js';
import {addSourceFingerRig,DIGITS} from '../finger-rig.mjs';
import {installRetopologizedHands} from './hand.mjs';

const query=new URLSearchParams(location.search),status=document.querySelector('#status');
const loader=new THREE.TextureLoader(),prefix='../../appearance-baseline-20261027/assets/';
try{
  const textures=await Promise.all(['BV1g2JX6HEHX.jpg','neutral-front.png','turnaround-auxiliary-v2.png'].map(p=>loader.loadAsync(prefix+p)));
  textures.forEach(t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;});
  const model=createStudyCharacter(textures[0],{garmentTexture:textures[1],turnaroundTexture:textures[2]});
  model.update(0,0,{mode:'manual',mood:'neutral',framing:'full'});
  const fingers=addSourceFingerRig(model),replacement=installRetopologizedHands(fingers);
  const scene=new THREE.Scene();scene.add(model.root);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setSize(704,704);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.setClearColor(0,0);document.querySelector('#stage').append(renderer.domElement);
  const camera=new THREE.OrthographicCamera(-.15,.15,.15,-.15,.01,30);
  const view=document.querySelector('#view'),side=document.querySelector('#side'),grip=document.querySelector('#grip'),opposition=document.querySelector('#opposition'),framing=document.querySelector('#framing');
  for(const [field,name]of [[view,'view'],[side,'side'],[grip,'grip'],[opposition,'opposition'],[framing,'framing']])if(query.has(name))field.value=query.get(name);
  const individual={};
  for(const [id,d]of DIGITS.entries()){
    const label=document.createElement('label');label.textContent=['拇指','食指','中指','无名指','小指'][id];
    const input=document.createElement('input');input.type='range';input.min=0;input.max=1;input.step=.01;input.value=query.get(d.name)||0;label.append(input);document.querySelector('#digits').append(label);individual[d.name]=input;
  }
  const centres={};
  for(const s of ['left','right']){
    const mesh=fingers.hands[s],box=new THREE.Box3();model.root.updateMatrixWorld(true);mesh.skeleton.update();
    for(let i=0;i<mesh.geometry.attributes.position.count;i++)box.expandByPoint(mesh.applyBoneTransform(i,new THREE.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,i)).applyMatrix4(mesh.matrixWorld));
    centres[s]=box.getCenter(new THREE.Vector3());
  }
  function draw(){
    const values={grip:Number(grip.value),opposition:Number(opposition.value)};
    for(const [name,input]of Object.entries(individual))values[name]=Math.min(1,Number(input.value)+values.grip);
    fingers.setPose(side.value,values);
    const full=framing.value==='full';
    model.root.traverse(o=>{if(o.isMesh)o.visible=full||o===fingers.hands[side.value];});
    const target=full?new THREE.Vector3(.195,.565,0):centres[side.value],half=full?1.77:.15;
    camera.left=-half;camera.right=half;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();
    const a=THREE.MathUtils.degToRad(Number(view.value));camera.position.copy(target).add(new THREE.Vector3(6*Math.sin(a),0,6*Math.cos(a)));camera.lookAt(target);
    renderer.render(scene,camera);
    document.body.dataset.pose=JSON.stringify({side:side.value,values,viewDegrees:Number(view.value),framing:framing.value});
    window.handRetopologyReview={rendered:true,pose:JSON.parse(document.body.dataset.pose),metadata:replacement.metadata()};
    status.textContent='局部真结构候选：共享圆掌、5 指体与关节环线。无原图蓝色采样；未验证抓握/自碰撞。';
    const save=document.querySelector('#save');save.href=renderer.domElement.toDataURL('image/png');save.download=`retopo-${side.value}-${grip.value}-${view.value}-${framing.value}.png`;
  }
  document.querySelectorAll('input,select').forEach(e=>e.addEventListener('input',draw));draw();
  if(query.has('capture'))document.body.classList.add('capture');
  window.addEventListener('pagehide',()=>{replacement.dispose();fingers.dispose();model.dispose();textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();},{once:true});
}catch(error){status.textContent='候选加载失败：'+error.stack;console.error(error);}
