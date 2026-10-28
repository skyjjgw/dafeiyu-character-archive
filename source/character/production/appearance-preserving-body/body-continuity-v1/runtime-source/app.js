import * as THREE from '../../../rig3d-prototype/vendor/three.module.js';
import { OrbitControls } from '../../../rig3d-prototype/vendor/package/examples/jsm/controls/OrbitControls.js';
import {createContactStage} from './stage.js';

const $ = id => document.getElementById(id);
const stage = $('viewport');
const referenceUrl = new URL('../../references/video-covers/BV1g2JX6HEHX.jpg', import.meta.url);
const garmentUrl = new URL('../v1/neutral-front.png', import.meta.url);
const turnaroundUrl=new URL('./turnaround-auxiliary-v2.png',import.meta.url);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const radians = THREE.MathUtils.degToRad;
const degrees = THREE.MathUtils.radToDeg;
const defaults = Object.freeze({ yaw:0, pitch:0, gazeX:0, gazeY:0, talking:0, blink:0, mood:'neutral', action:'idle',framing:'portrait',cameraView:'front',mode:'idle', paused:reducedMotion.matches });
const state = {...defaults};
let renderer, controls, rig, contactStage,texture, garmentTexture,turnaroundTexture, wireMaterial, camera, frame;
let disposed = false, lost = false, dirty = true, ready = false, last = 0, elapsed = 0;
let reportSince = 0, reportFrames = 0, pendingDownload = false;
let drag = null, lastDelivered = null;
let recording = null;
const downloads = new Set();
const listeners = [];
const scene = new THREE.Scene();
const target = new THREE.Vector3();
const cameraDirection = new THREE.Vector3(0, .015, 1).normalize();
const moodNames = {neutral:'平静', happy:'开心', sad:'委屈'};

function on(element, event, listener, options) {
  element.addEventListener(event, listener, options);
  listeners.push(() => element.removeEventListener(event, listener, options));
}
function message(title, detail, error = false) {
  $('stageMessage').hidden = false;
  $('stageMessage').classList.toggle('error', error);
  $('stageMessageTitle').textContent = title;
  $('stageMessageDetail').textContent = detail;
  $('retry').hidden = !error;
}
function showControls() {
  $('yaw').value = String(degrees(state.yaw));
  $('pitch').value = String(degrees(state.pitch));
  for (const id of ['gazeX','gazeY','talking','blink','mood']) $(id).value = String(state[id]);
  $('yawValue').value = `${degrees(state.yaw).toFixed(1).replace('.0','')}°`;
  $('pitchValue').value = `${degrees(state.pitch).toFixed(1).replace('.0','')}°`;
  for (const id of ['gazeX','gazeY']) $(`${id}Value`).value = state[id].toFixed(2);
  for (const id of ['talking','blink']) $(`${id}Value`).value = `${Math.round(state[id]*100)}%`;
  document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode)));
  document.querySelectorAll('[data-framing]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.framing===state.framing)));
  $('action').value=state.action;
  document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===state.cameraView)));
  $('renderMode').textContent=$('wireframe').checked?'网格检查':state.cameraView==='front'?'原画材质':state.cameraView==='side'?'侧面结构检查 · 未定稿':'背面结构检查 · 未定稿';
  $('pause').textContent = state.paused ? '继续动作' : '暂停动作';
  $('playStatus').textContent = `${state.paused?'已暂停':'实时运行'} · ${state.mode==='idle'?'自然待机':'手动校准'} · ${moodNames[state.mood]}`;
  $('poseInfo').textContent = `输入：转头 ${degrees(state.yaw).toFixed(1)}° · 抬头 ${degrees(state.pitch).toFixed(1)}°`;
}
function change(values, manual = false) {
  Object.assign(state, values);
  if (manual) state.mode = 'manual';
  showControls();
  dirty = true;
}
function fitCamera() {
  if (!rig || !camera || !controls) return;
  rig.root.updateMatrixWorld(true);
  const actualBox = new THREE.Box3().setFromObject(rig.root);
  if (actualBox.isEmpty() || ![...actualBox.min.toArray(),...actualBox.max.toArray()].every(Number.isFinite)) throw new Error('人物包围盒无效');
  // The study may include unfinished geometry outside its intended portrait.
  // Validate that geometry above, but frame the explicitly approved crop.
  let box = actualBox;
  const bounds = rig.metadata?.bounds;
  if (Array.isArray(bounds?.min) && Array.isArray(bounds?.max)
      && bounds.min.length === 3 && bounds.max.length === 3
      && [...bounds.min,...bounds.max].every(Number.isFinite)
      && bounds.min.every((value,index) => value < bounds.max[index])) {
    box = new THREE.Box3(new THREE.Vector3().fromArray(bounds.min),new THREE.Vector3().fromArray(bounds.max));
    box.applyMatrix4(rig.root.matrixWorld);
  }
  const size = box.getSize(new THREE.Vector3());
  box.getCenter(target);
  const vfov = radians(camera.fov), hfov = 2*Math.atan(Math.tan(vfov/2)*camera.aspect);
  const distance = Math.max(size.y/(2*Math.tan(vfov/2)),size.x/(2*Math.tan(hfov/2)))*1.045 + size.z*.5;
  camera.position.copy(target).addScaledVector(cameraDirection,distance);
  camera.near = Math.max(.01, distance/100);
  camera.far = Math.max(30,distance*10);
  camera.updateProjectionMatrix();
  controls.target.copy(target);
  controls.minDistance = distance*.64;
  controls.maxDistance = distance*1.8;
  controls.update();
  dirty = true;
}
function resize() {
  if (!renderer || disposed || lost) return;
  const {width,height} = stage.getBoundingClientRect();
  if (!width || !height) return;
  renderer.setSize(width,height,false);
  camera.aspect = width/height;
  camera.updateProjectionMatrix();
  if (ready) fitCamera();
  dirty = true;
}
function controlState() {
  const effective = {...state};
  if ($('talkPreview').checked) effective.talking = .28 + .54*Math.abs(Math.sin(elapsed*6.3)*Math.sin(elapsed*3.7));
  // Pausing freezes elapsed time. Explicit control edits still re-evaluate this
  // frozen pose, so a paused character remains inspectable with the sliders.
  effective.paused = false;
  return effective;
}
function deliverPose(delta) {
  if (!rig) return;
  lastDelivered = controlState();
  rig.update(delta, elapsed, lastDelivered);
  rig.root.updateMatrixWorld(true);
  contactStage?.update(rig,lastDelivered);
}
function frameLoop(now) {
  if (disposed) return;
  frame = requestAnimationFrame(frameLoop);
  const delta = Math.min(last?(now-last)/1000:0,.05);
  last = now;
  if (!ready || lost || document.hidden) return;
  const advancing = !state.paused;
  if (advancing) elapsed += delta;
  if (advancing || dirty) deliverPose(advancing?delta:0);
  controls.update();
  if (advancing || dirty) {
    scene.overrideMaterial = $('wireframe').checked ? wireMaterial : null;
    renderer.render(scene,camera);
    reportFrames++;
    dirty = false;
  }
  if (!reportSince) reportSince = now;
  if (now-reportSince >= 1200) {
    const fps = Math.round(reportFrames*1000/(now-reportSince));
    $('performanceInfo').textContent = `${advancing?'运行':'暂停'} · ${fps} 帧/秒 · ${renderer.info.render.calls} 次绘制 · ${Math.round(renderer.info.render.triangles/1000)}k 三角形`;
    const pose = rig.root.userData.appliedPose;
    if (pose && Number.isFinite(pose.yaw) && Number.isFinite(pose.pitch)) $('poseInfo').textContent = `实际姿态：转头 ${degrees(pose.yaw).toFixed(1)}° · 抬头 ${degrees(pose.pitch).toFixed(1)}°`;
    reportSince=now;reportFrames=0;
  }
}
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  downloads.add(url);
  const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();
  setTimeout(()=>{URL.revokeObjectURL(url);downloads.delete(url);},30000);
}
function serializeState() {
  return {
    schema:'dafeiyu.animation-look-study.controls.v1',
    createdAt:new Date().toISOString(),
    sourceTexture:referenceUrl.pathname,
    garmentTexture:garmentUrl.pathname,
    turnaroundTexture:turnaroundUrl.pathname,
    state:{...state},
    degrees:{yaw:degrees(state.yaw),pitch:degrees(state.pitch)},
    delivered:lastDelivered?{...lastDelivered}:null,
    appliedPose:rig.root.userData.appliedPose?{...rig.root.userData.appliedPose}:null,
    timelineSeconds:elapsed,
    mouthPreview:$('talkPreview').checked,
    wireframe:$('wireframe').checked,
    geometry:rig.metadata||null,
    grounding:rig.getGrounding?.()||null,
    secondaryMotion:rig.getSecondaryState?.()||null,
    scope:'Front-painted skeletal study with limited head turn; side/back and final likeness are unfinished.'
  };
}
async function saveImage() {
  if (!ready || lost || pendingDownload) return;
  pendingDownload=true;$('saveImage').disabled=true;
  try {
    scene.overrideMaterial=$('wireframe').checked?wireMaterial:null;
    renderer.render(scene,camera);
    const blob=await new Promise((resolve,reject)=>renderer.domElement.toBlob(value=>value?resolve(value):reject(new Error('无法读取当前画面')),'image/png'));
    download(blob,'dafeiyu-animation-look-current.png');
    $('exportStatus').textContent='已保存实时画面 PNG。控制角度与表情可另存为 JSON。';
  } catch(error) { $('exportStatus').textContent='画面保存未完成：'+error.message; }
  finally { pendingDownload=false;if(!disposed&&!lost)$('saveImage').disabled=false; }
}
function recordCurrent() {
  if(!ready||lost||recording)return;
  const canvas=renderer.domElement;
  if(typeof MediaRecorder==='undefined'||typeof canvas.captureStream!=='function'){
    $('exportStatus').textContent='当前浏览器无法录制画布，可保存 PNG 和控制状态。';return;
  }
  const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(type=>MediaRecorder.isTypeSupported(type));
  if(!mime){$('exportStatus').textContent='当前浏览器没有可用的 WebM 编码器。';return;}
  const stream=canvas.captureStream(30),chunks=[];
  let recorder;
  try{recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5000000});}
  catch(error){for(const track of stream.getTracks())track.stop();$('exportStatus').textContent='录制未开始：'+error.message;return;}
  const active={recorder,stream,timer:0};recording=active;$('recordVideo').disabled=true;
  recorder.addEventListener('dataavailable',event=>{if(event.data.size)chunks.push(event.data);});
  recorder.addEventListener('stop',()=>{
    clearTimeout(active.timer);for(const track of stream.getTracks())track.stop();
    recording=null;if(disposed)return;
    $('recordVideo').disabled=false;
    if(!chunks.length){$('exportStatus').textContent='录制没有产生画面。';return;}
    const blob=new Blob(chunks,{type:mime});download(blob,'dafeiyu-realtime-study.webm');
    const url=URL.createObjectURL(blob);downloads.add(url);$('recordingPreview').src=url;$('recordingPreview').hidden=false;
    $('exportStatus').textContent='实际画布录像已生成（无声音），下方可回放，已请求下载。它记录当前试作，不代表参考质量验收。';
  });
  recorder.addEventListener('error',()=>{$('exportStatus').textContent='录像未完整结束。';if(recorder.state!=='inactive')recorder.stop();});
  recorder.start(250);active.timer=setTimeout(()=>{if(recorder.state!=='inactive')recorder.stop();},8000);
  $('exportStatus').textContent='正在录制 8 秒实际画面，可实时改变动作和表情；录像无声音。';
}
function registerUi() {
  for (const [id,fromInput] of [['yaw',radians],['pitch',radians],['gazeX',Number],['gazeY',Number],['talking',Number],['blink',Number]]) on($(id),'input',()=>change({[id]:fromInput(Number($(id).value))},true));
  on($('mood'),'change',()=>change({mood:$('mood').value}));
  on($('action'),'change',()=>change({action:$('action').value,mode:'idle'}));
  document.querySelectorAll('[data-framing]').forEach(button=>on(button,'click',()=>{
    change({framing:button.dataset.framing});deliverPose(0);fitCamera();
  }));
  document.querySelectorAll('[data-view]').forEach(button=>on(button,'click',()=>{
    const view=button.dataset.view;
    cameraDirection.set(...(view==='side'?[1,.015,0]:view==='back'?[0,.015,-1]:[0,.015,1])).normalize();
    change({cameraView:view,framing:'full',yaw:0,pitch:0},true);deliverPose(0);fitCamera();
  }));
  document.querySelectorAll('[data-mode]').forEach(button=>on(button,'click',()=>change({mode:button.dataset.mode})));
  document.querySelectorAll('[data-yaw]').forEach(button=>on(button,'click',()=>change({yaw:radians(Number(button.dataset.yaw)),pitch:0},true)));
  on($('pause'),'click',()=>change({paused:!state.paused}));
  on($('reset'),'click',()=>{
    elapsed=0;$('talkPreview').checked=false;
    cameraDirection.set(0,.015,1).normalize();
    change({...defaults,paused:state.paused});
    deliverPose(0);fitCamera();
  });
  on($('talkPreview'),'change',()=>{dirty=true;});
  on($('wireframe'),'change',()=>{showControls();dirty=true;});
  on($('saveImage'),'click',saveImage);
  on($('recordVideo'),'click',recordCurrent);
  on($('saveState'),'click',()=>{if(!ready)return;download(new Blob([JSON.stringify(serializeState(),null,2)+'\n'],{type:'application/json'}),'dafeiyu-animation-look-controls.json');$('exportStatus').textContent='已保存控制状态 JSON。';});
  on($('retry'),'click',()=>location.reload());
  on(document,'visibilitychange',()=>{last=0;reportSince=0;reportFrames=0;dirty=true;if(document.hidden&&recording?.recorder.state!=='inactive')recording?.recorder.stop();});
  on(renderer.domElement,'pointerdown',event=>{
    if(event.button!==0||!ready)return;
    drag={pointerId:event.pointerId,x:event.clientX,y:event.clientY};
    renderer.domElement.setPointerCapture(event.pointerId);
  });
  on(renderer.domElement,'pointermove',event=>{
    if(!drag||event.pointerId!==drag.pointerId)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    drag.x=event.clientX;drag.y=event.clientY;
    change({yaw:THREE.MathUtils.clamp(state.yaw+radians(dx*.09),radians(-25),radians(25)),pitch:THREE.MathUtils.clamp(state.pitch+radians(dy*.06),radians(-8),radians(8))},true);
  });
  const release=event=>{if(drag&&event.pointerId===drag.pointerId){if(renderer.domElement.hasPointerCapture(event.pointerId))renderer.domElement.releasePointerCapture(event.pointerId);drag=null;}};
  on(renderer.domElement,'pointerup',release);on(renderer.domElement,'pointercancel',release);
  on(renderer.domElement,'webglcontextlost',event=>{event.preventDefault();lost=true;$('saveImage').disabled=true;message('画面上下文已中断','请重新载入此页以恢复人物校准。',true);$('playStatus').textContent='画面已中断';});
  on(renderer.domElement,'webglcontextrestored',()=>{lost=true;message('需要重新载入人物','图形上下文已恢复，请重新载入此页。',true);});
  if (typeof reducedMotion.addEventListener==='function') on(reducedMotion,'change',event=>{if(event.matches)change({paused:true});});
}
async function bootstrap() {
  try {
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.NoToneMapping;
    renderer.setClearColor(0x000000,0);
    stage.append(renderer.domElement);
    // Long lens preserves the painted proportions while retaining parallax.
    camera=new THREE.PerspectiveCamera(16,1,.01,40);
    controls=new OrbitControls(camera,renderer.domElement);
    controls.enableRotate=false;controls.enablePan=false;controls.enableDamping=false;
    on(controls,'change',()=>{dirty=true;});
    scene.add(new THREE.HemisphereLight(0xffffff,0x71879a,1.5));
    const key=new THREE.DirectionalLight(0xfff7ec,2);key.position.set(-3,6,5);scene.add(key);
    const fill=new THREE.DirectionalLight(0xd7e9ff,.7);fill.position.set(4,3,-2);scene.add(fill);
    wireMaterial=new THREE.MeshBasicMaterial({color:0x4f7891,wireframe:true,side:THREE.DoubleSide,toneMapped:false});
    registerUi();showControls();resize();
    const observer=new ResizeObserver(resize);observer.observe(stage);listeners.push(()=>observer.disconnect());
    frame=requestAnimationFrame(frameLoop);
    const loaded=await Promise.allSettled([
      import('./character.js?v=look-1'),
      new THREE.TextureLoader().loadAsync(referenceUrl.href),
      new THREE.TextureLoader().loadAsync(garmentUrl.href),
      new THREE.TextureLoader().loadAsync(turnaroundUrl.href)
    ]);
    texture=loaded[1].status==='fulfilled'?loaded[1].value:null;
    garmentTexture=loaded[2].status==='fulfilled'?loaded[2].value:null;
    turnaroundTexture=loaded[3].status==='fulfilled'?loaded[3].value:null;
    const failed=loaded.find(result=>result.status==='rejected');
    if(disposed||failed){texture?.dispose();garmentTexture?.dispose();turnaroundTexture?.dispose();texture=null;garmentTexture=null;turnaroundTexture=null;if(failed&&!disposed)throw failed.reason;return;}
    for(const imageTexture of [texture,garmentTexture,turnaroundTexture]){
      imageTexture.colorSpace=THREE.SRGBColorSpace;
      imageTexture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
    }
    rig=loaded[0].value.createStudyCharacter(texture,{garmentTexture,turnaroundTexture});
    if(!rig?.root?.isObject3D||typeof rig.update!=='function')throw new Error('人物模块接口尚未就绪');
    scene.add(rig.root);contactStage=createContactStage();scene.add(contactStage.root);deliverPose(0);
    let meshes=0,vertices=0;const uniqueGeometry=new Set();
    rig.root.traverse(object=>{if(object.isMesh){meshes++;if(object.geometry&&!uniqueGeometry.has(object.geometry)){uniqueGeometry.add(object.geometry);vertices+=object.geometry.attributes.position?.count||0;}}});
    $('geometryInfo').textContent=`${meshes} 个真实网格 · ${vertices.toLocaleString()} 个顶点 · 小幅转头范围 ±25°`;
    fitCamera();ready=true;$('stageMessage').hidden=true;
    for(const id of ['reset','pause','saveImage','saveState','recordVideo'])$(id).disabled=false;
    showControls();dirty=true;
  } catch(error) {
    if(disposed)return;
    console.error('Animation look study failed:',error);
    message('人物尚未载入',error.message||String(error),true);
    $('playStatus').textContent='载入未完成';
  }
}
function dispose() {
  if(disposed)return;disposed=true;
  if(recording){clearTimeout(recording.timer);if(recording.recorder.state!=='inactive')recording.recorder.stop();for(const track of recording.stream.getTracks())track.stop();}
  cancelAnimationFrame(frame);
  for(const remove of listeners.splice(0))remove();
  controls?.dispose();rig?.dispose?.();contactStage?.dispose();texture?.dispose();garmentTexture?.dispose();turnaroundTexture?.dispose();wireMaterial?.dispose();renderer?.dispose();
  for(const url of downloads)URL.revokeObjectURL(url);downloads.clear();
}
window.addEventListener('pagehide',dispose,{once:true});
bootstrap();
