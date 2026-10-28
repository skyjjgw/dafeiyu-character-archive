import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter} from './runtime-source/character.js';
import {installSelectedHeadbandCandidate} from './headband-depth.mjs';
const $=id=>document.getElementById(id);
try{
 const prefix='../../appearance-baseline-20261027/assets/';
 const textures=await Promise.all(['BV1g2JX6HEHX.jpg','neutral-front.png','turnaround-auxiliary-v2.png'].map(p=>new THREE.TextureLoader().loadAsync(prefix+p)));
 for(const texture of textures){texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;}
 const rig=createStudyCharacter(textures[0],{garmentTexture:textures[1],turnaroundTexture:textures[2]});
 const pose={mode:'manual',framing:'full',action:'idle',mood:'neutral',yaw:0,pitch:0,talk:0,talking:0,blink:0,gazeX:0,gazeY:0};
 rig.update(0,0,pose);rig.root.updateMatrixWorld(true);
 const scene=new THREE.Scene();scene.add(rig.root);
 const key=new THREE.DirectionalLight(0xfff7ec,2);key.position.set(-3,6,5);scene.add(key);
 const fill=new THREE.DirectionalLight(0xd7e9ff,.7);fill.position.set(4,3,-2);scene.add(fill);scene.add(new THREE.AmbientLight(0xffffff,.65));
 const width=640,height=704,aspect=width/height,halfY=Math.max(3.42/2,2.82/(2*aspect))*1.035;
 const camera=new THREE.OrthographicCamera(-halfY*aspect,halfY*aspect,halfY,-halfY,.01,30);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
 renderer.setPixelRatio(1);renderer.setSize(width,height,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.setClearColor(0,0);
 renderer.domElement.setAttribute('aria-label','头饰局部结构实际网格渲染');$('stage').append(renderer.domElement);
 let installed=null,angle=0,mode='candidate',strength=.55;
 function modeSet(next){
  if(installed){installed.dispose();installed=null;}
  mode=next;
  if(mode==='candidate')installed=installSelectedHeadbandCandidate(rig.root,THREE,{strength});
 }
 function draw(){
  const a=angle*Math.PI/180;camera.position.set(.195+6*Math.sin(a),.565,6*Math.cos(a));camera.lookAt(.195,.565,0);
  renderer.render(scene,camera);
  $('save').href=renderer.domElement.toDataURL('image/png');
  $('parameters').textContent=JSON.stringify({mode,angle,strength,cameraPosition:camera.position.toArray(),pose,metadata:installed?.metadata()??null},null,2);
 }
 $('source').onclick=()=>{modeSet('source');draw();};$('candidate').onclick=()=>{modeSet('candidate');draw();};
 $('view').onchange=()=>{angle=Number($('view').value);draw();};
 $('strength').oninput=()=>{strength=Number($('strength').value);if(installed)installed.setStrength(strength);draw();};
 $('measure').onclick=()=>{
  const oldAngle=angle,oldMode=mode;angle=0;
  modeSet('source');draw();const source=new Uint8Array(width*height*4);const gl=renderer.getContext();gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,source);$('sourceImage').src=$('save').href;
  modeSet('candidate');draw();const candidate=new Uint8Array(source.length);gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,candidate);$('candidateImage').src=$('save').href;
  let sum=0,max=0,over1=0,alpha=0;
  for(let i=0;i<source.length;i+=4){let different=false;for(let k=0;k<3;k++){const d=Math.abs(source[i+k]-candidate[i+k]);sum+=d*d;max=Math.max(max,d);different ||= d>1;}if(different)over1++;if((source[i+3]>16)!==(candidate[i+3]>16))alpha++;}
  $('comparison').textContent=JSON.stringify({scope:'Actual same-renderer front pixel comparison; not all-angle/physical or visual acceptance',width,height,strength,rgbRMSE:Math.sqrt(sum/(width*height*3)),maxRGBDifference:max,pixelsRGBDifferenceOver1:over1,alphaSilhouetteDifference:alpha,visualPass:false},null,2);
  angle=oldAngle;modeSet(oldMode);draw();
 };
 modeSet('candidate');draw();$('status').textContent='局部候选已加载。正面需对照，侧面仍包含未修的原头发和身体。';document.body.dataset.ready='true';
 window.addEventListener('pagehide',()=>{installed?.dispose();rig.dispose();for(const texture of textures)texture.dispose();renderer.dispose();renderer.forceContextLoss();},{once:true});
}catch(error){$('status').textContent='加载失败：'+error.message;document.body.dataset.ready='failed';}
