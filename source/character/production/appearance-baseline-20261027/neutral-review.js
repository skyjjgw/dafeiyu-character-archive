import * as THREE from '../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter} from '../animation-look-study/character.js';

const status=document.getElementById('status');
try{
  const paths=['assets/BV1g2JX6HEHX.jpg','assets/neutral-front.png','assets/turnaround-auxiliary-v2.png'];
  const loader=new THREE.TextureLoader();
  const [reference,garment,turnaround]=await Promise.all(paths.map(path=>loader.loadAsync(path)));
  const noMips=new URLSearchParams(location.search).get('filter')==='no-mips';
  for(const texture of [reference,garment,turnaround]){
    texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=noMips?1:4;
    if(noMips){texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;}
  }
  const width=640,height=704,aspect=width/height;
  const halfY=Math.max(3.42/2,2.82/(2*aspect))*1.035;
  const scene=new THREE.Scene();
  const key=new THREE.DirectionalLight(0xfff7ec,2);key.position.set(-3,6,5);scene.add(key);
  const fill=new THREE.DirectionalLight(0xd7e9ff,.7);fill.position.set(4,3,-2);scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff,.65));
  const camera=new THREE.OrthographicCamera(-halfY*aspect,halfY*aspect,halfY,-halfY,.01,30);
  const view=new URLSearchParams(location.search).get('view')||'front';
  const viewAngles={front:0,left45:-Math.PI/4,right45:Math.PI/4,left90:-Math.PI/2,right90:Math.PI/2,back:Math.PI};
  const angle=viewAngles[view]??0;
  camera.position.set(.195+6*Math.sin(angle),.565,6*Math.cos(angle));camera.lookAt(.195,.565,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
  renderer.setPixelRatio(1);renderer.setSize(width,height,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.setClearColor(0,0);
  renderer.domElement.setAttribute('aria-label','原页面人物的同机位中性帧');document.getElementById('stage').append(renderer.domElement);
  const rig=createStudyCharacter(reference,{garmentTexture:garment,turnaroundTexture:turnaround});scene.add(rig.root);
  const pose={mode:'manual',framing:'full',action:'idle',mood:'neutral',yaw:0,pitch:0,talk:0,talking:0,blink:0,gazeX:0,gazeY:0};
  rig.update(0,0,pose);rig.root.updateMatrixWorld(true);renderer.render(scene,camera);
  const parameters={schema:'dafeiyu.selected-look-neutral.v1',width,height,halfY,view,cameraYaw:angle,cameraPosition:camera.position.toArray(),cameraTarget:[.195,.565,0],time:0,delta:0,pose,appliedPose:rig.root.userData.appliedPose,colorSpace:renderer.outputColorSpace,toneMapping:'NoToneMapping',textureFiltering:{diagnostic:noMips,mipmaps:!noMips,anisotropy:noMips?1:4,minFilter:noMips?'LinearFilter':'LinearMipmapLinearFilter'},lights:{key:{color:'#fff7ec',intensity:2,position:[-3,6,5]},fill:{color:'#d7e9ff',intensity:.7,position:[4,3,-2]},ambient:{color:'#ffffff',intensity:.65}},scope:'Same original source geometry/UV/materials and entry lights. Camera inspection is not a 90-degree neck movement; frozen neutral state only, not an animation or physics validation.'};
  document.getElementById('parameters').textContent=JSON.stringify(parameters,null,2);
  const link=document.getElementById('export');link.href=renderer.domElement.toDataURL('image/png');link.hidden=false;
  link.download=noMips?'selected-neutral-no-mips.png':view==='front'?'selected-look-neutral.png':`selected-view-${view}.png`;
  status.textContent=noMips?'无 mipmap 过滤诊断图：仅供查色差，不替换原页面外观。':'已加载原始人物。图像可保存，用于与引擎实际画面对照。';document.body.dataset.ready='true';
  window.addEventListener('pagehide',()=>{rig.dispose();for(const texture of [reference,garment,turnaround])texture.dispose();renderer.dispose();renderer.forceContextLoss();},{once:true});
}catch(error){status.textContent='对照图加载失败：'+error.message;document.body.dataset.ready='failed';}
