"""Save attributed public originals and a pinned Live2D candidate, without running it."""
from pathlib import Path, PurePosixPath
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import quote
import hashlib, json, sys
from collect_materials import ROOT, get, get_json, write_json, fetch_image

sys.stdout.reconfigure(encoding='utf-8')
COMMIT='f977bef508690e75ba6535cd8f4ce18e7f6ba9b0'
RAW='https://raw.githubusercontent.com/Andersen216/dsh-whale-girl-live2d/'+COMMIT+'/'

def main():
    items=[]
    keys=['7506466b25f560ffd107fbf7f64cf35423315338','58e8798f704380c4371c7639d99b67ab23315338','ed415c94e256e7ee5b7df62379aed93a23315338','f9e9ffc61cb19d147b5910975dbf501323315338','e980223675851d8b7fc4981e3c59aa0623315338','bedcc322e419d6b4529496352a3154b223315338','1010e6f70a0e8edeb37afe3888fbc82a23315338','add692136243c7104f491170beb83b0a23315338','830910338bd5f81475214364d0adb54e23315338','6e2c5077da40f03f0de32a3dc1d6f97123315338','379e479badf3ba07c17dc79f98881a0523315338','6bdbaa4965ded4808c1fcb7eeedd5c5e23315338']
    for n,key in enumerate(keys,1):
        items.append(dict(id='daozizhentian-'+str(n).zfill(2),type='image',title='这个刀子真甜原帖第 '+str(n)+' 张',source_url='https://www.bilibili.com/opus/1234477753856688168',image_url='https://i0.hdslb.com/bfs/new_dyn/'+key+'.png',author='这个刀子真甜；角色上游：上善无形 / ZipZipPipe',reference_group='Q版作者原帖',form='待目视确认',purposes=['造型与角度','眼口与表情'],visual_review='pending',license_status='作者原帖参考；具体文件许可待核实，保留角色上游非商用声明',local_path='references/core/daozizhentian-'+str(n).zfill(2)+'.png'))
    for path,title in [('assets/model/icon.png','现成 Live2D 候选：模型图标'),('docs/screenshots/01-待机.jpg','现成 Live2D 候选：上游待机截图')]:
        items.append(dict(id='live2d-'+Path(path).stem,type='image',title=title,source_url='https://github.com/Andersen216/dsh-whale-girl-live2d/tree/'+COMMIT,image_url=RAW+quote(path),author='上善无形 / ZipZipPipe / 氵六青；原发布视频另列茶坤不接了为模型协作者',reference_group='Live2D候选预览',form='待目视确认',purposes=['造型与角度','眼口与表情'],visual_review='pending',license_status='模型与角色非商业许可；见 model-candidate/notices',local_path='references/core/live2d-'+Path(path).name))
    with ThreadPoolExecutor(max_workers=5) as pool:
        for f in as_completed([pool.submit(fetch_image,x) for x in items]):f.result()
    write_json('metadata/primary-additions.json',items)

    model=get_json(RAW+'assets/model/c_0120.model3.json')
    manifest=get_json(RAW+'assets/model/manifest.json')
    refs=model['FileReferences']
    files={'c_0120.model3.json','manifest.json',refs['Moc'],*refs.get('Textures',[])}
    for key in ['Physics','Pose','UserData','DisplayInfo']:
        if refs.get(key):files.add(refs[key])
    for x in refs.get('Expressions',[]):files.add(x['File'])
    for x in manifest.get('expressions',{}).values():files.add(x['file'])
    for motions in refs.get('Motions',{}).values():
        for x in motions:
            files.add(x['File'])
            if x.get('Sound'):files.add(x['Sound'])
    saved=[]
    model_dir=(ROOT/'model-candidate/model').resolve()
    def save(relative):
        parts=PurePosixPath(relative)
        if parts.is_absolute() or '..' in parts.parts or ':' in relative or '\\' in relative:raise ValueError('Invalid asset path: '+relative)
        target=model_dir.joinpath(*parts.parts)
        target.parent.mkdir(parents=True,exist_ok=True)
        content=target.read_bytes() if target.exists() else get(RAW+'assets/model/'+quote(relative))
        target.write_bytes(content)
        return dict(path=target.relative_to(ROOT).as_posix(),upstream_path='assets/model/'+relative,bytes=len(content),sha256=hashlib.sha256(content).hexdigest())
    with ThreadPoolExecutor(max_workers=5) as pool:
        for f in as_completed([pool.submit(save,p) for p in sorted(files)]):saved.append(f.result())
    for name in ['PROVENANCE.md','AUTHORS.md','LICENSE','README.md']:
        target=ROOT/'model-candidate/notices'/name
        if not target.exists():target.write_bytes(get(RAW+name))
    original_release=dict(title='大肥鱼！丨免费Live2d模型',url='https://www.bilibili.com/video/BV16yYi69EQT/',uploader='氵六青',uploader_url='https://space.bilibili.com/11272072',credits_note='原发布页列出模型协作者UID2505395，当前名称茶坤菜的，旧索引名茶坤不接了；下游项目的署名说明不替代原发布页，后续继续保留并核对两者贡献')
    write_json('model-candidate/source.json',dict(repository='https://github.com/Andersen216/dsh-whale-girl-live2d',commit=COMMIT,original_release=original_release,files=sorted(saved,key=lambda x:x['path']),runtime_expression_count=len(manifest.get('expressions',{})),runtime_motion_count=sum(len(x) for x in refs.get('Motions',{}).values()),texture_count=len(refs.get('Textures',[])),has_editable_psd=False,has_cmo3_project=False,status='下载并核对模型清单；尚未在大肥鱼软件接入或运行；Q版外形已通过上游截图目视核对，属于同角色风格不同的候选',license='模型不是 MIT；保留原始说明，角色 CC BY-NC-SA 4.0；Live2D SDK 许可另行适用'))
    write_json('metadata/live2d-original-release.json',original_release)
    print(json.dumps(dict(primary_images_saved=sum(x.get('download_status')=='saved' for x in items),primary_image_failures=[x['id'] for x in items if x.get('download_status')=='failed'],model_files=len(saved),expressions=len(manifest.get('expressions',{})),motions=sum(len(x) for x in refs.get('Motions',{}).values()),textures=len(refs.get('Textures',[]))),ensure_ascii=False),flush=True)

if __name__=='__main__':main()
