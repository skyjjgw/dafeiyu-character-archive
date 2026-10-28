import * as THREE from '../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter}from '../animation-look-study/character.js';
import {addSourceFingerRig,DIGITS}from './finger-rig.mjs';

const status=document.getElementById('status');
try{
  const loader=new THREE.TextureLoader(),prefix='../appearance-baseline-20261027/assets/';
  const textures=await Promise.all(['BV1g2JX6HEHX.jpg','neutral-front.png','turnaround-auxiliary-v2.png'].map(file=>loader.loadAsync(prefix+file)));
  for(const t of textures){t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;}
  const model=createStudyCharacter(textures[0],{garmentTexture:textures[1],turnaroundTexture:textures[2]});
  model.update(0,0,{mode:'manual',mood:'neutral',framing:'full'});
  const fingers=addSourceFingerRig(model),scene=new THREE.Scene();scene.add(model.root);
  const camera=new THREE.OrthographicCamera(-.24*4/3,.24*4/3,.24,-.24,.01,20);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(640,480,false);renderer.setPixelRatio(1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.setClearColor(0,0);document.getElementById('stage').append(renderer.domElement);
  const digitInputs={};
  for(const [index,digit]of DIGITS.entries()){
    const label=document.createElement('label');label.textContent=['拇指','食指','中指','无名指','小指'][index];
    const input=document.createElement('input');input.type='range';input.min=0;input.max=1;input.step=.01;input.value=0;input.id=digit.name;label.append(input);document.getElementById('digits').append(label);digitInputs[digit.name]=input;
  }
  const targets={};
  for(const side of ['left','right']){
    const mesh=fingers.hands[side];model.root.updateMatrixWorld(true);mesh.skeleton.update();const box=new THREE.Box3();
    for(let i=0;i<mesh.geometry.attributes.position.count;i++)box.expandByPoint(mesh.applyBoneTransform(i,new THREE.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,i)).applyMatrix4(mesh.matrixWorld));
    targets[side]=box.getCenter(new THREE.Vector3());
  }
  function draw(){
    const side=document.getElementById('side').value;
    model.root.traverse(object=>{if(object.isMesh)object.visible=object===fingers.hands[side];});
    const grip=Number(document.getElementById('grip').value),values={grip,opposition:Number(document.getElementById('opposition').value)};
    for(const[name,input]of Object.entries(digitInputs))values[name]=Math.min(1,grip+Number(input.value));
    fingers.setPose(side,values);
    const angle=THREE.MathUtils.degToRad(Number(document.getElementById('view').value)),target=targets[side];camera.position.copy(target).add(new THREE.Vector3(2*Math.sin(angle),0,2*Math.cos(angle)));camera.lookAt(target);
    renderer.render(scene,camera);status.textContent='原网格上的指骨变形；仍需检查关节处形态、皮肤褶皱与真实接触。';
    const link=document.getElementById('export');link.href=renderer.domElement.toDataURL('image/png');link.hidden=false;
    document.body.dataset.pose=JSON.stringify({side,values,cameraDegrees:Number(document.getElementById('view').value)});
  }
  document.querySelectorAll('input,select').forEach(input=>input.addEventListener('input',draw));draw();
  window.addEventListener('pagehide',()=>{fingers.dispose();model.dispose();textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();},{once:true});
}catch(error){status.textContent='手部研究加载失败：'+error.message;}
