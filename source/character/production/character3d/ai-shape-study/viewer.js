import * as THREE from 'three';
import { OrbitControls } from '../../rig3d-prototype/vendor/package/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';

const $ = id => document.getElementById(id);
const base = new URL('.', import.meta.url);
const assetBase = new URL('../', import.meta.url);
const referenceBase = new URL('../../../', import.meta.url);
const references = {
  proposal: { label: '生成输入 · 三分之四提案', title: '三分之四输入提案', src: 'input-threequarter-proposal.png', caption: '用于此次单图形状试验，侧背仍是生成假设，不是原作者设定。' },
  canonical: { label: '已选二维正面', title: '已选二维正面', src: '../../v1/neutral-front.png', caption: '身份与外观的二维基准。与三维网格逐项对照，不以生成结果反向覆盖基准。' },
};
let renderer, controls, current, currentUrl, models = [], loadAbort, listAbort;
let disposed = false, generation = 0, listGeneration = 0, frame = 0, last = 0, view = 'threequarter';
let fitDistance = 7, displayRadius = 2;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0xdce4e8);
const camera = new THREE.PerspectiveCamera(32, 1, .01, 200);
const target = new THREE.Vector3(0, 1.6, 0);
const grayMaterial = new THREE.MeshStandardMaterial({ color: 0xb9cbd5, roughness: .83, metalness: .02, side: THREE.DoubleSide,flatShading:true });
const wireMaterial = new THREE.MeshBasicMaterial({ color: 0x234c68, wireframe: true, side: THREE.DoubleSide });
const meshRoot = new THREE.Group(); scene.add(meshRoot);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ color: 0x455f70, opacity: .18, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
let grid = new THREE.GridHelper(12, 24, 0x95acba, 0xc1ced6); grid.position.y = .001;
grid.material.transparent = true; grid.material.opacity = .44; scene.add(grid);
const key = new THREE.DirectionalLight(0xfffaf4, 2.6); key.position.set(-4, 8, 6); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.normalBias = .035; key.shadow.bias = -.00015; scene.add(key);
scene.add(new THREE.HemisphereLight(0xf7fcff, 0x8d9ca4, 2.0));
const fill = new THREE.DirectionalLight(0xe5f1ff, 1.0); fill.position.set(5, 4, -5); scene.add(fill);

function localUrl(src, { reference = false } = {}) {
  if (typeof src !== 'string' || !src || /^(?:[a-z][a-z\d+.-]*:|\/|\\)/i.test(src) || src.includes('\\')) throw new Error('只接受本地相对资源路径');
  const url = new URL(src, base), prefix = reference ? referenceBase.pathname : assetBase.pathname;
  const decoded = decodeURIComponent(url.pathname);
  if (url.origin !== base.origin || !decoded.startsWith(decodeURIComponent(prefix)) || url.search || url.hash) throw new Error('资源必须位于本项目内，且不能带查询参数');
  if (!(reference ? /\.(?:png|jpe?g|webp)$/i : /\.glb$/i).test(decoded)) throw new Error(reference ? '参考图格式应为 PNG/JPEG/WebP' : '模型必须是 GLB 文件');
  return url;
}
function message(title, detail, error = false) {
  $('stageMessage').hidden = false; $('stageMessage').classList.toggle('error', error);
  $('stageMessageTitle').textContent = title; $('stageMessageDetail').textContent = detail;
}
function captureResources(root) {
  const geometries = new Set(), materials = new Set(), textures = new Set(), skeletons = new Set(), originals = new Map();
  root.traverse(object => {
    if (!object.isMesh) return;
    if (object.geometry) geometries.add(object.geometry);
    if (object.skeleton) skeletons.add(object.skeleton);
    originals.set(object, object.material);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (!material) continue;
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  return { root, originals, dispose() {
    root.removeFromParent();
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const texture of textures) { texture.dispose(); if (typeof texture.source?.data?.close === 'function') texture.source.data.close(); }
    for (const skeleton of skeletons) skeleton.dispose();
    originals.clear();
  } };
}
function clearModel() {
  current?.dispose(); current = null; currentUrl = null;
  $('modelFile').hidden = true;
  for (const id of ['meshCount', 'vertexCount', 'triangleCount', 'boneCount', 'clipCount', 'originalSize']) $(id).textContent = '—';
}
function applyMaterial() {
  if (!current) return;
  for (const [object, original] of current.originals) {
    object.material = $('wireframe').checked ? wireMaterial : $('grayMode').checked ? grayMaterial : original;
  }
}
function setView(name = view) {
  view = name;
  const directions = { front: [0, .12, 1], side: [-1, .12, 0], back: [0, .12, -1], threequarter: [.66, .25, 1] };
  const direction = new THREE.Vector3(...directions[view]).normalize();
  camera.position.copy(target).addScaledVector(direction, fitDistance);
  controls.target.copy(target); controls.update();
  document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
}
function fitModel() {
  const { width, height } = $('viewport').getBoundingClientRect();
  const aspect = Math.max(.2, width / Math.max(1, height));
  const vfov = THREE.MathUtils.degToRad(camera.fov), hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
  fitDistance = displayRadius / Math.sin(Math.min(vfov, hfov) / 2) * 1.09;
  controls.minDistance = Math.max(.3, displayRadius * .24); controls.maxDistance = fitDistance * 4;
  camera.near = Math.max(.005, displayRadius / 200); camera.far = Math.max(100, fitDistance * 20); camera.updateProjectionMatrix();
  setView();
}
function resize() {
  if (!renderer || disposed) return;
  const { width, height } = $('viewport').getBoundingClientRect();
  if (width <= 0 || height <= 0) return;
  renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
}
async function readGlb(url, signal) {
  const response = await fetch(url, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error(`GLB 读取失败：HTTP ${response.status}`);
  const total = Number(response.headers.get('content-length')) || 0;
  if (!response.body) return response.arrayBuffer();
  const reader = response.body.getReader(), chunks = []; let received = 0;
  for (;;) {
    const { value, done } = await reader.read(); if (done) break;
    received += value.byteLength; chunks.push(value);
    $('loadText').textContent = `正在读取 GLB · ${(received / 2**20).toFixed(1)} MB${total ? ' / ' + (total / 2**20).toFixed(1) + ' MB' : ''}`;
    if (total) { $('loadBar').max = total; $('loadBar').value = received; } else $('loadBar').removeAttribute('value');
  }
  const data = new Uint8Array(received); let offset = 0;
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
  return data.buffer;
}
async function loadModel(item) {
  const request = ++generation; loadAbort?.abort(); loadAbort = new AbortController();
  clearModel(); $('modelTitle').textContent = item.label; $('modelNotes').textContent = item.notes || '单图生成的静态形状；检查各角度轮廓、体积与遮挡是否合理。';
  $('loadProgress').hidden = false; $('loadText').textContent = '正在读取 GLB…'; $('loadBar').removeAttribute('value');
  message('读取三维网格', '正在加载真实 GLB 资产');
  let bundle;
  try {
    const url = localUrl(item.src), data = await readGlb(url, loadAbort.signal);
    if (disposed || request !== generation) return;
    $('loadText').textContent = '正在解析网格与材质…';
    const manager = new THREE.LoadingManager();
    manager.setURLModifier(resource => {
      if (/^(?:data:|blob:)/.test(resource)) return resource;
      const parsed = new URL(resource, url);
      if (parsed.origin !== base.origin || !decodeURIComponent(parsed.pathname).startsWith(decodeURIComponent(assetBase.pathname))) throw new Error('GLB 引用了项目外资源，已停止加载');
      return parsed.href;
    });
    const gltf = await new GLTFLoader(manager).parseAsync(data, new URL('.', url).href);
    bundle = captureResources(gltf.scene);
    if (disposed || request !== generation) { bundle.dispose(); return; }
    let meshCount = 0, vertices = 0, triangles = 0, bones = 0;
    const positionAttributes = new Set();
    gltf.scene.traverse(object => {
      if (object.isBone) bones++;
      if (!object.isMesh) return;
      meshCount++; const geometry = object.geometry, position = geometry?.attributes?.position;
      if(position&&!geometry.attributes.normal)geometry.computeVertexNormals();
      if (position) {
        // glTF material primitives can reuse one position accessor. Count it
        // once; counting every primitive inflated the baseline to 6.5M entries.
        if (!positionAttributes.has(position)) { vertices += position.count; positionAttributes.add(position); }
        triangles += (geometry.index?.count ?? position.count) / 3;
      }
      object.castShadow = true; object.receiveShadow = false;
      object.frustumCulled = false;
    });
    if (!meshCount || !vertices) throw new Error('GLB 中没有可显示的网格');
    const oriented = new THREE.Group(); oriented.add(gltf.scene);
    if (Array.isArray(item.rotationDegrees) && item.rotationDegrees.length === 3 && item.rotationDegrees.every(Number.isFinite)) oriented.rotation.set(...item.rotationDegrees.map(THREE.MathUtils.degToRad));
    oriented.updateMatrixWorld(true);
    const original = new THREE.Box3().setFromObject(oriented, true), size = original.getSize(new THREE.Vector3());
    if (!size.toArray().every(Number.isFinite) || size.y < 1e-7) throw new Error('GLB 包围盒无效，不能自动适配');
    const center = original.getCenter(new THREE.Vector3()), normalize = 3.2 / size.y;
    oriented.position.set(-center.x * normalize, -original.min.y * normalize, -center.z * normalize); oriented.scale.setScalar(normalize);
    meshRoot.add(oriented); oriented.updateMatrixWorld(true);
    const shown = new THREE.Box3().setFromObject(oriented, true); shown.getCenter(target);
    displayRadius = shown.getBoundingSphere(new THREE.Sphere()).radius;
    // Own the outer alignment group too; the mesh resources remain the originals.
    const disposeInner = bundle.dispose; bundle.dispose = () => { disposeInner(); oriented.removeFromParent(); };
    current = bundle; currentUrl = url;
    for (const [id, number] of [['meshCount', meshCount], ['vertexCount', vertices], ['triangleCount', Math.round(triangles)], ['boneCount', bones], ['clipCount', gltf.animations.length]]) $(id).textContent = number.toLocaleString('zh-CN');
    $('originalSize').textContent = size.toArray().map(value => value.toFixed(2)).join(' × ');
    $('modelFile').href = url.href; $('modelFile').download = url.pathname.split('/').pop(); $('modelFile').hidden = false;
    $('assetScope').textContent = bones ? '此资产检测到骨骼，仅作已绑定基线对照；本页不播放动作。' : '此资产没有检测到骨骼，是未绑定的静态形状。';
    $('displayStatus').textContent = '显示高度归一化 · 原始文件不变';
    const span = Math.max(3, displayRadius * 1.2); key.shadow.camera.left = -span; key.shadow.camera.right = span; key.shadow.camera.top = span; key.shadow.camera.bottom = -span; key.shadow.camera.updateProjectionMatrix(); key.target.position.copy(target); scene.add(key.target);
    applyMaterial(); fitModel(); $('stageMessage').hidden = true;
    if (item.reference) setReference(item.reference);
  } catch (error) {
    if (bundle && bundle !== current) bundle.dispose();
    if (error.name === 'AbortError' || disposed || request !== generation) return;
    clearModel(); message('模型载入失败', error.message, true); $('displayStatus').textContent = '读取失败 · 未显示替代图片';
  } finally {
    if (request === generation) $('loadProgress').hidden = true;
  }
}
async function loadList() {
  const request = ++listGeneration, previous = $('modelSelect').value;
  listAbort?.abort(); listAbort = new AbortController(); $('refreshList').disabled = true;
  $('listStatus').textContent = '正在读取 models.json…';
  try {
    const response = await fetch(new URL('models.json', base), { cache: 'no-store', signal: listAbort.signal });
    if (!response.ok) throw new Error(`模型清单读取失败：HTTP ${response.status}`);
    const value = await response.json(), list = Array.isArray(value) ? value : value.models;
    if (!Array.isArray(list)) throw new Error('models.json 需要 models 数组');
    const next = list.map((item, i) => {
      if (!item || typeof item !== 'object') throw new Error(`第 ${i + 1} 项模型格式无效`);
      localUrl(item.src);
      return { ...item, id: String(item.id ?? i), label: String(item.label ?? item.name ?? item.title ?? `形状 ${i + 1}`) };
    });
    if (request !== listGeneration || disposed) return;
    if (new Set(next.map(item => item.id)).size !== next.length) throw new Error('模型 id 必须各不相同');
    models = next; $('modelSelect').replaceChildren();
    for (const item of models) { const option = document.createElement('option'); option.value = item.id; option.textContent = item.label; $('modelSelect').append(option); }
    $('modelSelect').disabled = models.length === 0;
    $('listStatus').textContent = models.length ? `${models.length} 份本地 GLB · 切换后重新适配视野` : '尚未加入生成结果。清单保持为空。';
    if (models.length) {
      const item = models.find(entry => entry.id === previous) || models[0]; $('modelSelect').value = item.id; await loadModel(item);
    } else {
      ++generation; loadAbort?.abort(); clearModel(); $('loadProgress').hidden = true;
      const option = document.createElement('option'); option.textContent = '暂无形状结果'; $('modelSelect').append(option);
      $('modelTitle').textContent = '尚未载入'; $('modelNotes').textContent = '生成并核对完成后，将本地产物加入 models.json。';
      message('等待形状结果', '当前列表为空。不会用参考 PNG 冒充三维模型。');
    }
  } catch (error) {
    if (error.name === 'AbortError' || disposed || request !== listGeneration) return;
    $('listStatus').textContent = error.message; message('模型清单读取失败', error.message, true);
  } finally { if (request === listGeneration) $('refreshList').disabled = false; }
}
function setReference(name) {
  let reference = references[name];
  if (!reference) {
    try { reference = { label: '当前模型输入参考', title: '当前模型输入参考', src: localUrl(name, { reference: true }).href, caption: '此二维输入只作对照，不作为侧背结构真值。', resolved: true }; }
    catch { return; }
    references.model = reference;
    if (!$('referenceSelect').querySelector('option[value="model"]')) { const option = document.createElement('option'); option.value = 'model'; option.textContent = reference.label; $('referenceSelect').append(option); }
    name = 'model';
  }
  const url = reference.resolved ? new URL(reference.src) : localUrl(reference.src, { reference: true });
  $('referenceSelect').value = name; $('referenceError').hidden = true; $('referenceImage').hidden = false;
  $('referenceImage').src = url.href; $('referenceImage').alt = reference.title;
  $('referenceTitle').textContent = reference.title; $('referenceCaption').textContent = reference.caption; $('referenceFile').href = url.href;
}
let observer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  $('viewport').prepend(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = .075;
  controls.enablePan = true; controls.maxPolarAngle = Math.PI * .56; controls.minPolarAngle = .1; controls.autoRotateSpeed = .75;
  controls.addEventListener('start', () => { document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', 'false')); });
  observer = new ResizeObserver(resize); observer.observe($('viewport')); resize(); setView();
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
  $('frameModel').addEventListener('click', fitModel);
  $('grayMode').addEventListener('change', applyMaterial); $('wireframe').addEventListener('change', applyMaterial);
  $('showGrid').addEventListener('change', () => { grid.visible = $('showGrid').checked; });
  $('modelSelect').addEventListener('change', () => { const item = models.find(entry => entry.id === $('modelSelect').value); if (item) loadModel(item); });
  $('refreshList').addEventListener('click', loadList);
  $('referenceSelect').addEventListener('change', () => setReference($('referenceSelect').value));
  $('referenceImage').addEventListener('error', () => { $('referenceImage').hidden = true; $('referenceError').hidden = false; });
  setReference('proposal'); loadList();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  function render(now) {
    if (disposed) return; frame = requestAnimationFrame(render);
    const delta = last ? Math.min(.05, (now - last) / 1000) : 0; last = now;
    controls.autoRotate = Boolean(current) && $('autoRotate').checked && !document.hidden && !reducedMotion.matches;
    controls.update(delta); renderer.render(scene, camera);
  }
  frame = requestAnimationFrame(render);
} catch (error) { message('三维预览未能启动', error.message, true); $('listStatus').textContent = 'WebGL 初始化失败'; }
window.addEventListener('pagehide', () => {
  disposed = true; ++generation; ++listGeneration; loadAbort?.abort(); listAbort?.abort();
  cancelAnimationFrame(frame); observer?.disconnect(); controls?.dispose(); clearModel();
  grayMaterial.dispose(); wireMaterial.dispose(); floor.geometry.dispose(); floor.material.dispose();
  grid.geometry.dispose(); grid.material.dispose(); key.shadow.map?.dispose(); renderer?.dispose();
});
