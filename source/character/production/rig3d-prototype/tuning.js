import GUI from './vendor/lil-gui-0.21.0.esm.js';

export const defaultTuning={bodyScale:.74,headScale:1.08,headWidth:1,eyeWidth:1,eyeHeight:1,eyeSpacing:1,irisScale:1,shadingToony:.82,shadingShift:.06,outlineWidth:.0045,hairSway:1,tailSway:1,dressColor:'#293b60',tailColor:'#304c7b',tailLightColor:'#5e78a5',exposure:1.15};
const ranges={bodyScale:[.68,1],headScale:[.9,1.12],headWidth:[.9,1.12],eyeWidth:[.9,1.12],eyeHeight:[.8,1.08],eyeSpacing:[.9,1.1],irisScale:[.85,1.1],shadingToony:[.5,1],shadingShift:[-.2,.25],outlineWidth:[0,.01],hairSway:[0,1.8],tailSway:[0,1.8],exposure:[.8,1.4]};
const storageKey='dafeiyu-rig3d-refinement-tuning-v2';
function cleanTuning(input){
  const result={...defaultTuning};
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('请选择造型参数 JSON');
  for(const key of Object.keys(defaultTuning)){
    if(!(key in input))continue;const value=input[key];
    if(ranges[key]){if(typeof value!=='number'||!Number.isFinite(value))throw new Error('参数无效：'+key);result[key]=Math.max(ranges[key][0],Math.min(ranges[key][1],value));}
    else{if(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))throw new Error('颜色参数无效');result[key]=value;}
  }
  return result;
}
export function readTuning(){try{const s=localStorage.getItem(storageKey);return s?cleanTuning(JSON.parse(s)):{...defaultTuning};}catch{return{...defaultTuning};}}

export function createTuningEditor({container,initial,onApply,status}){
  const values={...initial},gui=new GUI({container,autoPlace:false,title:'造型与材质'});
  const apply=()=>{try{const cleaned=cleanTuning(values);Object.assign(values,cleaned);onApply({...cleaned});localStorage.setItem(storageKey,JSON.stringify(cleaned));status.textContent='已应用，参数保存在本机。';}catch(error){status.textContent=error.message;}};
  const add=(folder,key,label,step=.01)=>folder.add(values,key,...ranges[key],step).name(label).onFinishChange(apply);
  const body=gui.addFolder('头身与脸部');
  add(body,'bodyScale','身体长度');add(body,'headScale','头部大小');add(body,'headWidth','头部宽度');
  const eyes=gui.addFolder('眼睛与神态');
  add(eyes,'eyeWidth','眼睛宽度');add(eyes,'eyeHeight','眼睛开度');add(eyes,'eyeSpacing','眼距');add(eyes,'irisScale','虹膜大小');
  const shading=gui.addFolder('MToon 材质');
  add(shading,'shadingToony','阴影硬度');add(shading,'shadingShift','阴影位置');add(shading,'outlineWidth','描边粗细',.0005);add(shading,'exposure','舞台亮度');
  for(const [key,label]of [['dressColor','衣服颜色'],['tailColor','尾巴背面'],['tailLightColor','尾巴腹面']])shading.addColor(values,key).name(label).onFinishChange(apply);
  const motion=gui.addFolder('发束与尾巴');add(motion,'hairSway','头发摆幅',.05);add(motion,'tailSway','尾巴摆幅',.05);
  const operations={
    save(){const payload={schema:'dafeiyu.rig3d.tuning.v1',tuning:cleanTuning(values)};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='dafeiyu-character-tuning.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='造型参数已导出为 JSON。';},
    reset(){Object.assign(values,defaultTuning);gui.controllersRecursive().forEach(c=>c.updateDisplay());apply();}
  };
  gui.add(operations,'save').name('导出造型参数 JSON');gui.add(operations,'reset').name('恢复本轮默认');
  eyes.close();shading.close();motion.close();
  return{gui,values,apply,async importFile(file){try{if(!file||file.size>32768)throw new Error('请选择小于32KB的造型参数JSON');const json=JSON.parse(await file.text()),data=cleanTuning(json.tuning??json);Object.assign(values,data);gui.controllersRecursive().forEach(c=>c.updateDisplay());apply();}catch(error){status.textContent='导入未完成：'+error.message;}},dispose(){gui.destroy();}};
}
