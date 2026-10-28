'use strict';
const $=id=>document.getElementById(id),SVG='http://www.w3.org/2000/svg';
const parts=new Map(),enabled=new Map();
const state={ready:false,mouth:0,blinkUntil:0,nextBlink:0,previewUntil:0,hidden:false,audioActive:false,audioContext:null,analyser:null,gain:null,samples:null,blobUrl:null,lastLabel:0,peak:0};
let frame=0;
function partLayer(asset,canvas){
  const node=document.createElement('div');node.className='part';node.dataset.id=asset.id;
  const [x,y,w,h]=asset.target;Object.assign(node.style,{left:100*x/canvas.width+'%',top:100*y/canvas.height+'%',width:100*w/canvas.width+'%',height:100*h/canvas.height+'%'});
  const [left,top,right,bottom]=asset.visible_bbox,svg=document.createElementNS(SVG,'svg');svg.setAttribute('viewBox',[left-2,top-2,right-left+4,bottom-top+4].join(' '));svg.setAttribute('preserveAspectRatio','none');
  const image=document.createElementNS(SVG,'image');image.setAttribute('href','assets/'+asset.file);image.setAttribute('width',asset.width);image.setAttribute('height',asset.height);svg.append(image);node.append(svg);return node;
}
function setMouth(value){state.mouth=Math.max(0,Math.min(1,Number(value)||0));}
function reset(){state.previewUntil=0;state.audioActive=false;$('audio').pause();setMouth(0);$('mouth').value=0;$('mode').textContent='当前：手动控制，无音频播放。';}
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
  const closed=$('holdClosed').checked||now<state.blinkUntil;
  for(const id of ['eyes-open','eyes-closed'])parts.get(id).style.opacity=enabled.get(id)&&((id==='eyes-closed')===closed)?'1':'0';
  if(state.audioActive&&state.analyser){state.analyser.getFloatTimeDomainData(state.samples);let sum=0;for(const n of state.samples)sum+=n*n;const target=Math.max(0,Math.min(1,(Math.sqrt(sum/state.samples.length)-.008)*9));setMouth(state.mouth*.55+target*.45);state.peak=Math.max(state.peak,state.mouth);}
  else if(state.previewUntil>now)setMouth(.1+.8*Math.abs(Math.sin(now*.010)*Math.sin(now*.0037)));
  else if(state.previewUntil){state.previewUntil=0;setMouth(0);$('mode').textContent='预览结束，已闭嘴。';}
  const open=state.mouth>.07;parts.get('mouth-open').style.opacity=enabled.get('mouth-open')&&open?'1':'0';parts.get('mouth-open').style.transform='scaleY('+(.25+.75*state.mouth)+')';parts.get('mouth-closed').style.opacity=enabled.get('mouth-closed')&&!open?'1':'0';
  if(now-state.lastLabel>100){$('mouthValue').textContent=state.mouth.toFixed(2);$('audioPeak').textContent=state.peak.toFixed(2);$('status').textContent='五官小样已载入 · '+(closed?'闭眼':'睁眼')+' · 嘴部 '+state.mouth.toFixed(2);state.lastLabel=now;}
  frame=requestAnimationFrame(tick);
}
async function init(){
  const response=await fetch('layers.json');if(!response.ok)throw new Error('无法读取分层配置');const data=await response.json();
  await Promise.all(data.assets.map(asset=>new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=()=>reject(new Error('素材载入失败：'+asset.id));image.src='assets/'+asset.file;})));
  const labels={'base':'底图（尚含头发身体）','eyes-open':'睁眼部件','eyes-closed':'闭眼部件','brows':'眉毛部件','mouth-closed':'闭嘴部件','mouth-open':'开嘴部件'};
  for(const asset of data.assets){
    let node;if(asset.id==='base'){node=document.createElement('img');node.className='base';node.src='assets/'+asset.file;node.alt='五官移除后的绘制底图';}else node=partLayer(asset,data.canvas);
    parts.set(asset.id,node);enabled.set(asset.id,true);$('character').append(node);
    const row=document.createElement('div');row.className='layer';const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=true;input.setAttribute('aria-label','显示'+labels[asset.id]);input.addEventListener('change',()=>{enabled.set(asset.id,input.checked);if(!['eyes-open','eyes-closed','mouth-open','mouth-closed'].includes(asset.id))node.style.visibility=input.checked?'visible':'hidden';});label.append(input,document.createTextNode(labels[asset.id]));const link=document.createElement('a');link.href='assets/'+asset.file;link.target='_blank';link.textContent='原图 ↗';row.append(label,link);$('layerList').append(row);
  }
  state.ready=true;state.nextBlink=performance.now()+2200;$('character').classList.add('ready');for(const id of ['blinkNow','previewMouth','reset','testAudio'])$(id).disabled=false;frame=requestAnimationFrame(tick);
}
$('blinkNow').addEventListener('click',()=>state.blinkUntil=performance.now()+220);
$('mouth').addEventListener('input',event=>{const value=Number(event.target.value);reset();$('mouth').value=value;setMouth(value/100);$('mode').textContent='当前：手动控制。';});
$('previewMouth').addEventListener('click',()=>{reset();state.previewUntil=performance.now()+6000;$('mode').textContent='当前：六秒开合预览（无语音）。';});
$('reset').addEventListener('click',reset);
$('muteOutput').addEventListener('change',()=>{if(state.gain)state.gain.gain.value=$('muteOutput').checked?0:1;});
$('audioFile').addEventListener('change',event=>{const file=event.target.files[0];if(!file)return;reset();if(state.blobUrl)URL.revokeObjectURL(state.blobUrl);state.blobUrl=URL.createObjectURL(file);$('audio').src=state.blobUrl;$('audio').hidden=false;$('audioName').textContent=file.name+' · 本地播放，无上传';});
$('testAudio').addEventListener('click',async()=>{try{reset();$('audio').src='test-pulses.wav';$('audio').hidden=false;$('audioName').textContent='三秒合成测试音 · 非人声';await ensureAudio();await $('audio').play();}catch(error){$('mode').textContent=error.message;}});
$('audio').addEventListener('play',async()=>{try{await ensureAudio();state.previewUntil=0;state.audioActive=true;state.peak=0;$('mode').textContent='当前：音频幅度驱动嘴部。';}catch(error){$('audio').pause();$('mode').textContent=error.message;}});
for(const event of ['pause','ended','error'])$('audio').addEventListener(event,()=>{state.audioActive=false;setMouth(0);$('mouth').value=0;$('mode').textContent='音频已停止，嘴部已复位。';});
document.querySelectorAll('[data-bg]').forEach(button=>button.addEventListener('click',()=>{$('stage').classList.toggle('light',button.dataset.bg==='light');document.querySelectorAll('[data-bg]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));}));
document.addEventListener('visibilitychange',()=>{state.hidden=document.hidden;if(state.hidden){reset();cancelAnimationFrame(frame);if(state.audioContext)state.audioContext.suspend();}else if(state.ready){state.nextBlink=performance.now()+2000;frame=requestAnimationFrame(tick);}});
window.addEventListener('pagehide',()=>{reset();cancelAnimationFrame(frame);if(state.blobUrl)URL.revokeObjectURL(state.blobUrl);if(state.audioContext)state.audioContext.close();});
init().catch(error=>{$('status').textContent=error.message;});
