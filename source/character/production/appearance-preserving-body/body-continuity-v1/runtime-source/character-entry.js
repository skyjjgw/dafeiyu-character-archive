import * as THREE from '@dafeiyu-three';
import {createStudyCharacter} from '@dafeiyu-character';
import {referenceImage,garmentImage,turnaroundImage} from '@dafeiyu-character-assets';

// Built into a classic IIFE. This module has no bridge, parent DOM or network
// access. It is dormant until the HUD explicitly mounts the experiment.
export const preview=__DAFEIYU_CHARACTER_LOCAL_PREVIEW__;
let current=null;
let latest={connected:false,running:false,approvals:0,error:false};

function feedback(input){
  const connected=input.connected===true,running=input.running===true;
  const count=Array.isArray(input.approvals)?input.approvals.length:Number(input.approvals);
  const approvals=Number.isFinite(count)?Math.max(0,Math.floor(count)):0;
  const error=Boolean(input.error);
  const phase=error?'error':!connected?'disconnected':approvals?'approval':running?'processing':'idle';
  const labels={error:'连接或任务遇到问题',disconnected:'尚未连接 DSH',approval:'等你确认',processing:'正在认真处理',idle:'本鲸在这里'};
  return{connected,running,approvals,error,phase,label:labels[phase],talking:0};
}

/** Read-only visual projection of DSH state. No text-to-mouth animation. */
export function setState(input={}){
  latest=feedback(input);
  if(current){current.feedback=latest;current.container.dataset.characterPhase=latest.phase;current.dirty=true;current.resume();}
  return{phase:latest.phase,label:latest.label,talking:0};
}

function decodeTexture(url,signal){
  return new Promise((resolve,reject)=>{
    const image=new Image();image.decoding='async';
    const cleanup=()=>{image.onload=null;image.onerror=null;signal.removeEventListener('abort',abort);};
    const abort=()=>{cleanup();reject(new DOMException('Character mount cancelled','AbortError'));};
    image.onload=()=>{
      cleanup();if(signal.aborted)return reject(new DOMException('Character mount cancelled','AbortError'));
      const texture=new THREE.Texture(image);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;resolve(texture);
    };
    image.onerror=()=>{cleanup();reject(new Error('人物本地资源无法读取'));};
    signal.addEventListener('abort',abort,{once:true});
    if(signal.aborted)return abort();
    image.src=url;
  });
}

function pose(state){
  const processing=state.phase==='processing',approval=state.phase==='approval',error=state.phase==='error';
  return{mode:'idle',framing:'full',action:'idle',mood:'neutral',talking:0,talk:0,
    yaw:processing?-.045:0,pitch:approval?.025:error?-.018:0,
    gazeX:processing?.10:0,gazeY:approval?.10:error?-.10:processing?-.06:0,
    happy:0,sad:error?.22:0};
}

export async function mount({container}={}){
  if(!container||container.nodeType!==1)throw new TypeError('人物画布需要一个容器');
  dispose();
  const abort=new AbortController();
  const instance={container,feedback:latest,renderer:null,rig:null,textures:[],frame:0,last:0,elapsed:0,disposed:false,ready:false,dirty:true,intersecting:true,contextLost:false,width:0,height:0,listeners:[]};
  current=instance;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,30);
  camera.position.set(.195,.565,6);camera.lookAt(.195,.565,0);
  const key=new THREE.DirectionalLight(0xfff7ec,2);key.position.set(-3,6,5);scene.add(key);
  const fill=new THREE.DirectionalLight(0xd7e9ff,.7);fill.position.set(4,3,-2);scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff,.65));

  function on(target,name,listener){target.addEventListener(name,listener);instance.listeners.push(()=>target.removeEventListener(name,listener));}
  function visible(){return!document.hidden&&instance.intersecting&&instance.width>0&&instance.height>0&&!container.hidden&&container.isConnected;}
  function stop(){if(instance.frame)cancelAnimationFrame(instance.frame);instance.frame=0;instance.last=0;}
  function draw(dt){
    if(!instance.ready||instance.disposed||instance.contextLost)return;
    instance.rig.update(dt,instance.elapsed,pose(instance.feedback));
    instance.rig.root.updateMatrixWorld(true);
    instance.renderer.render(scene,camera);instance.dirty=false;
  }
  function frame(now){
    instance.frame=0;
    if(instance.disposed||!instance.ready||!visible()||instance.contextLost){instance.last=0;return;}
    const dt=instance.last?Math.min((now-instance.last)/1000,.05):0;instance.last=now;
    if(!reduced.matches)instance.elapsed+=dt;
    if(!reduced.matches||instance.dirty)draw(reduced.matches?0:dt);
    if(!reduced.matches)instance.frame=requestAnimationFrame(frame);
  }
  instance.resume=()=>{
    if(instance.disposed||!instance.ready||instance.contextLost||!visible()){stop();return;}
    if(!instance.frame)instance.frame=requestAnimationFrame(frame);
  };
  function resize(){
    if(instance.disposed||!instance.renderer)return;
    const box=container.getBoundingClientRect();instance.width=Math.round(box.width);instance.height=Math.round(box.height);
    if(!instance.width||!instance.height){stop();return;}
    instance.renderer.setSize(instance.width,instance.height,false);
    const aspect=instance.width/instance.height,halfY=Math.max(3.42/2,2.82/(2*aspect))*1.035;
    camera.top=halfY;camera.bottom=-halfY;camera.left=-halfY*aspect;camera.right=halfY*aspect;camera.updateProjectionMatrix();
    instance.dirty=true;instance.resume();
  }
  instance.dispose=()=>{
    if(instance.disposed)return;instance.disposed=true;abort.abort();stop();
    instance.resizeObserver?.disconnect();instance.intersectionObserver?.disconnect();
    for(const off of instance.listeners)off();instance.listeners.length=0;
    instance.rig?.dispose();for(const texture of instance.textures)texture.dispose();instance.textures.length=0;
    if(instance.renderer){instance.renderer.renderLists.dispose();instance.renderer.dispose();instance.renderer.forceContextLoss();instance.renderer.domElement.remove();}
    delete container.dataset.characterPhase;
    scene.clear();if(current===instance)current=null;
  };

  try{
    instance.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
    instance.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
    instance.renderer.outputColorSpace=THREE.SRGBColorSpace;instance.renderer.toneMapping=THREE.NoToneMapping;
    instance.renderer.setClearColor(0x000000,0);
    const canvas=instance.renderer.domElement;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','大肥鱼人物试作');canvas.style.cssText='display:block;width:100%;height:100%';container.append(canvas);
    on(canvas,'webglcontextlost',event=>{event.preventDefault();instance.contextLost=true;stop();container.dataset.characterPhase='unavailable';container.dispatchEvent(new CustomEvent('dafeiyu-character-unavailable'));});
    on(document,'visibilitychange',()=>document.hidden?stop():instance.resume());
    on(window,'pagehide',()=>instance.dispose());
    on(reduced,'change',()=>{instance.dirty=true;instance.resume();});
    instance.resizeObserver=new ResizeObserver(resize);instance.resizeObserver.observe(container);
    instance.intersectionObserver=new IntersectionObserver(entries=>{instance.intersecting=entries.some(entry=>entry.isIntersecting);instance.resume();});instance.intersectionObserver.observe(container);
    resize();
    const loads=await Promise.allSettled([decodeTexture(referenceImage,abort.signal),decodeTexture(garmentImage,abort.signal),decodeTexture(turnaroundImage,abort.signal)]);
    for(const result of loads)if(result.status==='fulfilled')instance.textures.push(result.value);
    if(instance.disposed){for(const texture of instance.textures)texture.dispose();instance.textures.length=0;return false;}
    const failure=loads.find(result=>result.status==='rejected');if(failure)throw failure.reason;
    const[texture,garmentTexture,turnaroundTexture]=instance.textures;
    for(const imageTexture of instance.textures)imageTexture.anisotropy=Math.min(instance.renderer.capabilities.getMaxAnisotropy(),4);
    instance.rig=createStudyCharacter(texture,{garmentTexture,turnaroundTexture});scene.add(instance.rig.root);
    instance.ready=true;container.dataset.characterPhase=instance.feedback.phase;resize();instance.resume();return true;
  }catch(error){
    const cancelled=instance.disposed||abort.signal.aborted;instance.dispose();
    if(cancelled)return false;
    throw error;
  }
}

export function dispose(){current?.dispose();}
