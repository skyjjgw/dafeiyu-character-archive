import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
import {createStudyCharacter as createOriginal} from './baseline-source/character.js';
import {createStudyCharacter as createCandidate} from './runtime-source/character.js';
const $=id=>document.getElementById(id),width=640,height=704;
try {
 const prefix='../../appearance-baseline-20261027/assets/';
 const textures=await Promise.all(['BV1g2JX6HEHX.jpg','neutral-front.png','turnaround-auxiliary-v2.png'].map(n=>new THREE.TextureLoader().loadAsync(prefix+n)));
 for(const t of textures){t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;}
 const opts={garmentTexture:textures[1],turnaroundTexture:textures[2]};
 const rigs={source:createOriginal(textures[0],opts),candidate:createCandidate(textures[0],opts)};
 const scene=new THREE.Scene(),originalVisible=new Map();
 for(const rig of Object.values(rigs)){rig.update(0,0,{mode:'manual',framing:'full',action:'idle',mood:'neutral',yaw:0,pitch:0,talk:0,talking:0,blink:0,gazeX:0,gazeY:0});rig.root.updateMatrixWorld(true);rig.root.traverse(o=>{if(o.isMesh)originalVisible.set(o,o.visible)});scene.add(rig.root);}
 const key=new THREE.DirectionalLight(0xfff7ec,2);key.position.set(-3,6,5);scene.add(key);const fill=new THREE.DirectionalLight(0xd7e9ff,.7);fill.position.set(4,3,-2);scene.add(fill);scene.add(new THREE.AmbientLight(0xffffff,.65));
 const aspect=width/height,halfY=Math.max(3.42/2,2.82/(2*aspect))*1.035,camera=new THREE.OrthographicCamera(-halfY*aspect,halfY*aspect,halfY,-halfY,.01,30),renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'low-power'});renderer.setPixelRatio(1);renderer.setSize(width,height,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.setClearColor(0,0);$('stage').append(renderer.domElement);
 // One shared world-space union frames both versions identically at every
 // angle. It is computed before visibility toggles; geometry is never changed.
 const shoeBounds=new THREE.Box3();for(const rig of Object.values(rigs))rig.root.traverse(o=>{if(o.isMesh&&o.name.includes('traced mary jane shoe'))shoeBounds.union(new THREE.Box3().setFromObject(o));});
 const shoeCenter=shoeBounds.getCenter(new THREE.Vector3()),shoeSize=shoeBounds.getSize(new THREE.Vector3());
 const shoeHalfY=Math.max(shoeSize.y*.5,Math.hypot(shoeSize.x,shoeSize.z)*.5/aspect)*1.12;
 let mode='candidate',angle=0;
 function draw(){for(const [name,rig] of Object.entries(rigs)){rig.root.visible=name===mode;rig.root.traverse(o=>{if(o.isMesh)o.visible=originalVisible.get(o)&&(!$('isolate').checked||o.name.includes('traced mary jane shoe'));});}const a=angle*Math.PI/180,close=$('isolate').checked,center=close?shoeCenter:new THREE.Vector3(.195,.565,0),h=close?shoeHalfY:halfY;camera.left=-h*aspect;camera.right=h*aspect;camera.top=h;camera.bottom=-h;camera.updateProjectionMatrix();camera.position.set(center.x+6*Math.sin(a),center.y,center.z+6*Math.cos(a));camera.lookAt(center);renderer.render(scene,camera);$('save').href=renderer.domElement.toDataURL('image/png');$('parameters').textContent=JSON.stringify({mode,angle,shoeOnly:$('isolate').checked,finalAccepted:false,staticOnly:true},null,2);}
 $('source').onclick=()=>{mode='source';draw()};$('candidate').onclick=()=>{mode='candidate';draw()};$('view').onchange=()=>{angle=Number($('view').value);draw()};$('isolate').onchange=draw;
 function grab(){draw();const data=new Uint8Array(width*height*4);renderer.getContext().readPixels(0,0,width,height,renderer.getContext().RGBA,renderer.getContext().UNSIGNED_BYTE,data);return {data,url:renderer.domElement.toDataURL('image/png')};}
 function bbox(data){let l=width,r=-1,t=height,b=-1,count=0;for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>16){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,height-1-y);b=Math.max(b,height-1-y);count++;}return count?{left:l,top:t,right:r,bottom:b,width:r-l+1,height:b-t+1,pixels:count}:null;}
 $('measure').onclick=()=>{const prior={mode,angle,isolate:$('isolate').checked};angle=0;$('isolate').checked=false;mode='source';const a=grab();mode='candidate';const b=grab();$('sourceImage').src=a.url;$('candidateImage').src=b.url;let sum=0,changed=0,silhouette=0;for(let i=0;i<a.data.length;i+=4){let hit=false;for(let c=0;c<3;c++){let d=a.data[i+c]-b.data[i+c];sum+=d*d;hit||=Math.abs(d)>1;}if(hit)changed++;if((a.data[i+3]>16)!==(b.data[i+3]>16))silhouette++;}$('isolate').checked=true;mode='source';const sb=bbox(grab().data);mode='candidate';const cb=bbox(grab().data);$('comparison').textContent=JSON.stringify({scope:'same-renderer front full figure RGB comparison; bbox shoes isolated',rgbRMSE:Math.sqrt(sum/(width*height*3)),pixelsRGBDifferenceOver1:changed,alphaSilhouetteDifference:silhouette,sourceShoeBbox:sb,candidateShoeBbox:cb,visualPass:false,finalAccepted:false},null,2);({mode,angle}=prior);$('isolate').checked=prior.isolate;draw();};
 draw();$('status').textContent='已加载；候选未验收。原版与候选使用相同相机、材质及纹理。';document.body.dataset.ready='true';
}catch(e){$('status').textContent='加载失败：'+e.message;document.body.dataset.ready='failed';console.error(e);}
