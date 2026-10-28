'use strict';
const $=id=>document.getElementById(id),SVG='http://www.w3.org/2000/svg';
const parts=new Map(),enabled=new Map();
const state={ready:false,mouth:0,blinkUntil:0,nextBlink:0,previewUntil:0,hidden:false,audioActive:false,audioContext:null,analyser:null,gain:null,samples:null,blobUrl:null,lastLabel:0,peak:0};
let frame=0,maskSequence=0;
function svgNode(tag,attrs={}){const node=document.createElementNS(SVG,tag);for(const [name,value] of Object.entries(attrs))node.setAttribute(name,value);return node;}
function patchLayer(asset,canvas){
  const group=document.createElement('div');group.className='patch-group';group.dataset.id=asset.id;
  for(const [x,y,w,h] of asset.regions){
    const node=document.createElement('div');node.className='part';Object.assign(node.style,{left:100*x/canvas.width+'%',top:100*y/canvas.height+'%',width:100*w/canvas.width+'%',height:100*h/canvas.height+'%'});
    const svg=svgNode('svg',{viewBox:[x,y,w,h].join(' '),preserveAspectRatio:'xMidYMid meet'}),defs=svgNode('defs'),maskId='edge-'+(++maskSequence),filterId=maskId+'-blur';
    const filter=svgNode('filter',{id:filterId,x,y,width:w,height:h,filterUnits:'userSpaceOnUse'});filter.append(svgNode('feGaussianBlur',{stdDeviation:1}));
    const mask=svgNode('mask',{id:maskId,x,y,width:w,height:h,maskUnits:'userSpaceOnUse',maskContentUnits:'userSpaceOnUse'});mask.append(svgNode('rect',{x:x+2,y:y+2,width:w-4,height:h-4,rx:4,fill:'white',filter:'url(#'+filterId+')'}));defs.append(filter,mask);
    const image=svgNode('image',{href:asset.file,width:asset.width,height:asset.height,transform:'translate('+asset.translate.join(' ')+')',mask:'url(#'+maskId+')'});svg.append(defs,image);node.append(svg);group.append(node);
  }
  return group;
}
function canonicalLayer(data){
  const {width,height}=data.canvas,svg=svgNode('svg',{viewBox:[0,0,width,height].join(' ')});svg.classList.add('base');
  const defs=svgNode('defs'),maskId='canonical-tail-mask',clipId='replacement-tail-clip';
  const mask=svgNode('mask',{id:maskId,maskUnits:'userSpaceOnUse',x:0,y:0,width,height});mask.append(svgNode('rect',{x:0,y:0,width,height,fill:'white'}));
  const points=data.tail.replacement_polygon.map(point=>point.join(',')).join(' '),cut=svgNode('polygon',{points,fill:'black'});mask.append(cut);
  const clip=svgNode('clipPath',{id:clipId,clipPathUnits:'userSpaceOnUse'});clip.append(svgNode('polygon',{points}));defs.append(mask,clip);
  const original=svgNode('image',{href:data.canonical,width,height,mask:'url(#'+maskId+')','data-canonical':'true'});
  const tailTransform=data.tail.matrix?'matrix('+data.tail.matrix.join(' ')+')':'translate('+data.tail.translate.join(' ')+')';
  const tail=svgNode('image',{href:data.tail.file,width:data.tail.width,height:data.tail.height,transform:tailTransform,'clip-path':'url(#'+clipId+')'});
  // The clip stays in canonical coordinates; the source uses display-only registration.
  tail.removeAttribute('clip-path');const tailGroup=svgNode('g',{'clip-path':'url(#'+clipId+')'});tailGroup.append(tail);
  parts.set('tail-cut',cut);parts.set('tail-image',tailGroup);svg.append(defs,original,tailGroup);return svg;
}
function setMouth(value){state.mouth=Math.max(0,Math.min(1,Number(value)||0));}
function reset(){state.previewUntil=0;state.audioActive=false;$('audio').pause();setMouth(0);$('mouth').value=0;$('mode').textContent='当前：原画闭嘴，无音频播放。';}
function ensureAudio(){
  if(!state.audioContext){
    const AudioApi=window.AudioContext||window.webkitAudioContext;if(!AudioApi)throw new Error('当前浏览器不支持音频分析');
    state.audioContext=new AudioApi();state.analyser=state.audioContext.createAnalyser();state.analyser.fftSize=1024;state.samples=new Float32Array(1024);state.gain=state.audioContext.createGain();state.gain.gain.value=$('muteOutput').checked?0:1;
    const source=state.audioContext.createMediaElementSource($('audio'));source.connect(state.analyser);state.analyser.connect(state.gain);state.gain.connect(state.audioContext.destination);
  }
  return state.audioContext.resume();
}
function tick(now){
  if(!state.ready||state.hidden)return;
  if($('autoBlink').checked&&now>=state.nextBlink){state.blinkUntil=now+160;state.nextBlink=now+3000+Math.random()*2200;}
  const reference=$('referenceOnly').checked,closed=!reference&&enabled.get('blink')&&($('holdClosed').checked||now<state.blinkUntil);
  const tailActive=!reference&&$('correctTail').checked;
  if(state.tailActive!==tailActive){parts.get('tail-cut').setAttribute('fill',tailActive?'black':'white');parts.get('tail-image').style.visibility=tailActive?'visible':'hidden';state.tailActive=tailActive;}
  parts.get('blink').style.opacity=closed?'1':'0';
  if(state.audioActive&&state.analyser){state.analyser.getFloatTimeDomainData(state.samples);let sum=0;for(const n of state.samples)sum+=n*n;const target=Math.max(0,Math.min(1,(Math.sqrt(sum/state.samples.length)-.008)*9));setMouth(state.mouth*.55+target*.45);state.peak=Math.max(state.peak,state.mouth);}
  else if(state.previewUntil>now)setMouth(.1+.8*Math.abs(Math.sin(now*.010)*Math.sin(now*.0037)));
  else if(state.previewUntil){state.previewUntil=0;setMouth(0);$('mode').textContent='预览结束，已闭嘴。';}
  const mouthId=state.mouth<.10?'closed':state.mouth<.58?'mouth-half':'mouth-open';
  for(const id of ['mouth-half','mouth-open'])parts.get(id).style.opacity=!reference&&enabled.get(id)&&mouthId===id?'1':'0';
  if(now-state.lastLabel>100){$('mouthValue').textContent=state.mouth.toFixed(2);$('audioPeak').textContent=state.peak.toFixed(2);$('status').textContent=reference?'原画对照 · 原眼、原眉、原嘴':('原画五官 · '+(closed?'闭眼':'睁眼')+' · '+(mouthId==='closed'?'闭嘴':mouthId==='mouth-half'?'半开嘴':'开嘴'));state.lastLabel=now;}
  frame=requestAnimationFrame(tick);
}
async function init(){
  const response=await fetch('layers.json',{cache:'no-store'});if(!response.ok)throw new Error('无法读取校准配置');const data=await response.json();if(data.schema_version!==2)throw new Error('请刷新校准素材');
  if(!data.tail)throw new Error('请刷新尾巴校准配置');
  await Promise.all([data.canonical,data.tail.file,...data.patches.map(x=>x.file)].map(file=>new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=()=>reject(new Error('素材载入失败'));image.src=file;})));
  $('character').append(canonicalLayer(data));
  const labels={'blink':'闭眼差分','mouth-half':'半开嘴差分','mouth-open':'开嘴差分'};
  for(const asset of data.patches){
    const node=patchLayer(asset,data.canvas);parts.set(asset.id,node);enabled.set(asset.id,true);$('character').append(node);
    const row=document.createElement('div');row.className='layer';const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=true;input.setAttribute('aria-label','显示'+labels[asset.id]);input.addEventListener('change',()=>enabled.set(asset.id,input.checked));label.append(input,document.createTextNode(labels[asset.id]));const link=document.createElement('a');link.href=asset.file;link.target='_blank';link.textContent='差分图 ↗';row.append(label,link);$('layerList').append(row);
  }
  state.ready=true;state.nextBlink=performance.now()+3500;$('character').classList.add('ready');for(const id of ['blinkNow','previewMouth','reset','testAudio'])$(id).disabled=false;frame=requestAnimationFrame(tick);
}
$('blinkNow').addEventListener('click',()=>state.blinkUntil=performance.now()+220);
$('mouth').addEventListener('input',event=>{const value=Number(event.target.value);reset();$('mouth').value=value;setMouth(value/100);$('mode').textContent='当前：手动控制。';});
$('previewMouth').addEventListener('click',()=>{reset();state.previewUntil=performance.now()+6000;$('mode').textContent='当前：六秒开合预览（无语音）。';});
$('reset').addEventListener('click',reset);
$('muteOutput').addEventListener('change',()=>{if(state.gain)state.gain.gain.value=$('muteOutput').checked?0:1;});
$('audioFile').addEventListener('change',event=>{const file=event.target.files[0];if(!file)return;reset();if(state.blobUrl)URL.revokeObjectURL(state.blobUrl);state.blobUrl=URL.createObjectURL(file);$('audio').src=state.blobUrl;$('audio').hidden=false;$('audioName').textContent=file.name+' · 本地播放，无上传';});
$('testAudio').addEventListener('click',async()=>{try{reset();$('audio').src='test-pulses.wav';$('audio').hidden=false;$('audioName').textContent='三秒合成测试音 · 非人声';await ensureAudio();await $('audio').play();}catch(error){$('mode').textContent=error.message;}});
$('audio').addEventListener('play',async()=>{try{await ensureAudio();state.previewUntil=0;state.audioActive=true;state.peak=0;$('mode').textContent='当前：音频幅度驱动嘴部。';}catch(error){$('audio').pause();$('mode').textContent=error.message;}});
for(const event of ['pause','ended','error'])$('audio').addEventListener(event,()=>{state.audioActive=false;setMouth(0);$('mouth').value=0;$('mode').textContent='音频已停止，已恢复原画闭嘴。';});
document.querySelectorAll('[data-bg]').forEach(button=>button.addEventListener('click',()=>{$('stage').classList.toggle('light',button.dataset.bg==='light');document.querySelectorAll('[data-bg]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));}));
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{$('stage').classList.toggle('face-view',button.dataset.view==='face');$('stage').classList.toggle('tail-view',button.dataset.view==='tail');document.querySelectorAll('[data-view]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));}));
document.addEventListener('visibilitychange',()=>{state.hidden=document.hidden;if(state.hidden){reset();cancelAnimationFrame(frame);if(state.audioContext)state.audioContext.suspend();}else if(state.ready){state.nextBlink=performance.now()+2000;frame=requestAnimationFrame(tick);}});
window.addEventListener('pagehide',()=>{reset();cancelAnimationFrame(frame);if(state.blobUrl)URL.revokeObjectURL(state.blobUrl);if(state.audioContext)state.audioContext.close();});
init().catch(error=>{$('status').textContent=error.message;});
