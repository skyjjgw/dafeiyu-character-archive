import * as THREE from 'three';
import {GLTFLoader} from '../character3d/ai-shape-study/vendor/loaders/GLTFLoader.js';
import {OrbitControls} from '../rig3d-prototype/vendor/package/examples/jsm/controls/OrbitControls.js';

const stage=document.querySelector('#stage'),status=document.querySelector('#status');
const error=document.querySelector('#error');
function fail(err){error.hidden=false;error.textContent=`静态审查加载失败：${err?.message||String(err)}`;status.textContent='加载失败；未显示替代人物。';}
try{
 const params=new URLSearchParams(location.search);
 // Same-origin reviewed export directory only; no remote assets or guessed replacement models.
 const version=params.get('version')||'master-v2';
 if(!/^[a-zA-Z0-9_-]+$/.test(version))throw new Error('无效的导出目录');
 const base=`review-work/${version}/`;
 document.querySelector('#manifestLink').href=base+'manifest.json';
 const manifest=await fetch(base+'manifest.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`来源记录 HTTP ${r.status}`);return r.json();});
 if(manifest.finalAccepted!==false)throw new Error('来源记录必须明确未最终验收');
 const renderer=new THREE.WebGLRenderer({canvas:document.querySelector('#canvas'),antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x777b83);
 const target=new THREE.Vector3(.063081,-.002912,.005865);
 const camera=new THREE.OrthographicCamera(-.6,.6,.6,-.6,.01,100);camera.up.set(0,1,0);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);controls.enableDamping=true;controls.enablePan=false;controls.minZoom=.35;controls.maxZoom=5;controls.autoRotate=false;
 const key=new THREE.DirectionalLight(0xffffff,.9);key.position.set(4,6,3);scene.add(key,new THREE.AmbientLight(0xffffff,.35));
 const gltf=await new GLTFLoader().loadAsync(base+'actual.glb');
 if(gltf.animations.length)throw new Error('静态审查 GLB 意外含有动作');
 const model=gltf.scene;scene.add(model);
 const originals=new Map();let meshCount=0,triangles=0;
 model.traverse(o=>{if(o.isMesh){meshCount++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;originals.set(o,o.material);}});
 if(!meshCount)throw new Error('GLB 没有真实网格');
 const clay=new THREE.MeshLambertMaterial({color:0xaaaaaa,side:THREE.DoubleSide});
 function mode(name){for(const [o,m] of originals)o.material=name==='clay'?clay:m;document.querySelector('#color').setAttribute('aria-pressed',name==='color');document.querySelector('#clay').setAttribute('aria-pressed',name==='clay');}
 function view(angle){const a=angle*Math.PI/180;camera.position.copy(target).add(new THREE.Vector3(4*Math.cos(a),0,-4*Math.sin(a)));camera.lookAt(target);controls.target.copy(target);controls.update();document.querySelectorAll('[data-angle]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.angle)===angle));}
 document.querySelectorAll('[data-angle]').forEach(b=>b.addEventListener('click',()=>view(Number(b.dataset.angle))));
 document.querySelector('#color').addEventListener('click',()=>mode('color'));document.querySelector('#clay').addEventListener('click',()=>mode('clay'));
 function resize(){const w=stage.clientWidth,h=stage.clientHeight,half=1.20927095413208/2;camera.left=-half*w/h;camera.right=half*w/h;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
 new ResizeObserver(resize).observe(stage);resize();view(0);
 status.textContent=`整体造型建模中，未完成\n${version} · ${meshCount} 个网格 · ${Math.round(triangles).toLocaleString()} 个三角形\n来源：${manifest.source_blend.split(/[\\/]/).pop()} · ${manifest.glb_sha256.slice(0,16)}…\n彩色为原底色流的静态兼容导出；灰模仅替换材质。`;
 renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
}catch(err){fail(err);console.error(err);}
