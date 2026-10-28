"""Collect public character references; does not install or execute upstream code."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from urllib.parse import urlparse
import csv, hashlib, html, io, json, re, shutil, sys
import requests
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parent
for folder in ['references/user', 'references/core', 'references/selected', 'references/video-covers', 'metadata', 'model-candidate/model', 'model-candidate/notices']:
    (ROOT / folder).mkdir(parents=True, exist_ok=True)
HEADERS = {'User-Agent': 'DafeiyuReferenceResearch/1.0', 'Accept': '*/*'}
SITE = 'https://xn--pssy23gqgbz2d718b.com'
BASE = 'https://raw.githubusercontent.com/lmy414/bluedafeiyu/main/data/'

def get(url):
    for attempt in range(3):
        try:
            r = requests.get(url, headers=HEADERS, timeout=25)
            r.raise_for_status()
            return r.content
        except requests.RequestException:
            if attempt==2:raise

def get_json(url):
    return json.loads(get(url).decode('utf-8-sig'))

def write_json(name, value):
    (ROOT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')

def fetch_image(item):
    target = ROOT / item['local_path']
    try:
        data = target.read_bytes() if target.exists() else get(item['image_url'])
        im = Image.open(io.BytesIO(data))
        im.verify()
        size = Image.open(io.BytesIO(data)).size
        target.write_bytes(data)
        item.update(download_status='saved', actual_width=size[0], actual_height=size[1], bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
        if item.get('expected_sha256'):
            item['upstream_hash_matches'] = item['expected_sha256'] == item['sha256']
    except Exception as e:
        item.update(download_status='failed', error=str(e)[:200])
    return item

def purpose(text):
    labels = []
    if any(k in text for k in ['三视', '设定', '转面', '背影', '侧脸', '全身', '立绘']): labels.append('造型与角度')
    if any(k in text for k in ['眼', '表情', '哭', '笑', '生气', '害羞', '委屈', '惊', '脸红', '鼓腮', 'huh', '哈气']): labels.append('眼口与表情')
    if any(k in text for k in ['尾', '头饰', '围裙', '发型', '长发', '蝴蝶结', '鲸鳍']): labels.append('头发服装与尾巴')
    if any(k in text for k in ['跑', '走', '跳', '转', '招手', '挥手', '唱歌', '说话', '吃饭', '开饭', '锅', '比心']): labels.append('动作与互动')
    if any(k in text for k in ['思考', '发呆', '托腮', '困', '睡', '工作', '上班']): labels.append('待机与状态')
    return labels or ['整体形象']

def image_record(x):
    origin=x.get('origin') or {}; license=x.get('license') or {}
    text=' '.join([x.get('name',''),x.get('description',''),' '.join(x.get('tags',[]))])
    return dict(id=x['slug'], type='image', title=x['name'], source_url=SITE+'/works/'+x['slug']+'.html',
        image_url=x['path'], author=origin.get('author') or '原作者未标注', original_source_url=origin.get('sourceUrl'),
        reference_group='社区补充', form='Q版' if any(k in text for k in ['Q版','Q 版','小短','大头']) else '比例待目视确认',
        purposes=purpose(text), selection_basis='根据标题、标签和站点描述初筛；目视复核单独记录',
        visual_review='pending', license_status='原作者及衍生许可待逐项核实',
        site_license_claim=license.get('type') or 'unknown', license_note=(license.get('note') or '')[:240],
        local_path='references/selected/'+x['slug']+Path(urlparse(x['path']).path).suffix,
        expected_sha256=x.get('sha256') or None)

def main():
    works=get_json(BASE+'works.json'); videos_data=get_json(BASE+'video-archive.json')
    cat=get_json('https://raw.githubusercontent.com/shuaizenge/ai-girls/main/catalog.json')
    authors={str(c['uid']):c['name'] for c in videos_data['creators']}
    records=[]
    for idx,path in enumerate([
        'C:/Users/skyjj/AppData/Local/Temp/codex-clipboard-cbbed0c4-454d-405c-8cef-e33499e958e0.jpg',
        'C:/Users/skyjj/AppData/Local/Temp/codex-clipboard-ea26b19a-8d7a-4e21-a43e-d8b2ec4f5b57.jpg'
    ],1):
        src=Path(path); dst=ROOT/'references/user'/('reference-'+str(idx)+'.jpg'); shutil.copy2(src,dst)
        im=Image.open(dst)
        records.append(dict(id='user-'+str(idx),type='image',title=['用户参考：Q版抱锅奔跑','用户参考：半身哭泣 HUD'][idx-1],source_url='',image_url='',
            author='用户提供，原作者待定位',reference_group='用户基准',form=['Q版','正常比例近景'][idx-1],purposes=purpose(['抱锅奔跑','哭泣眼口表情'][idx-1]),
            visual_review='已核对用户附件',license_status='用户提供参考，未据此推定对外分发授权',local_path=dst.relative_to(ROOT).as_posix(),download_status='saved',actual_width=im.width,actual_height=im.height,bytes=dst.stat().st_size,sha256=hashlib.sha256(dst.read_bytes()).hexdigest()))
    for a in cat['assets']:
        if a.get('character_id')!='deepseek' or a.get('asset_type')=='voice_reference' or not a.get('path','').lower().endswith(('.png','.jpg','.jpeg','.webp')): continue
        s=cat['sources'][a['source_id']]
        records.append(dict(id=a['id'],type='image',title=a['title'],source_url=s['page_url'],image_url='https://raw.githubusercontent.com/shuaizenge/ai-girls/main/'+a['path'],
            original_image_url=a.get('download_url'),author=' / '.join(a.get('creators',[])),reference_group='原作者设计' if s.get('kind')!='community_reference_collection' else '社区补充三视图',
            form='Q版' if a.get('form')=='chibi' else '正常比例',purposes=['造型与角度','头发服装与尾巴'],visual_review='pending',
            license_status='CC BY-NC-SA 4.0；具体文件及作者链见上游记录' if a.get('license',{}).get('identifier')=='CC-BY-NC-SA-4.0' else '社区补充，绘制者/许可待核实',
            local_path='references/core/'+Path(a['path']).name,expected_sha256=a.get('sha256'),upstream_note=a.get('note','')))
    # Preserve the original character's source images as a separately labelled lineage reference.
    for i,key in enumerate(['3c682551e90b44b1a02c01ed337b22884456176','d46536f7163fd739bb6e105c3d964b834456176'],1):
        records.append(dict(id='mingyue-source-'+str(i),type='image',title='溟月：原始鲸鱼娘形象 '+str(i),source_url='https://www.bilibili.com/opus/1231977657712771073',
            image_url='https://i0.hdslb.com/bfs/new_dyn/'+key+'.png',author='上善无形',reference_group='角色源流',form='原始造型，与女仆版分开',purposes=['头发服装与尾巴'],visual_review='pending',
            license_status='原作者动态声明 CC BY-NC-SA 4.0',local_path='references/core/mingyue-source-'+str(i)+'.png'))

    fish=[x for x in works if x.get('characterIds',[x.get('characterId')])==['deepseek']]
    explicit='deepseek202609200011 deepseek202609200013 deepseek202609200015 deepseek202609210001 deepseek202609230018 deepseek202609230021 deepseek202609230022 deepseek202609230032 deepseek202609230033 deepseek202609230034 deepseek202609230037 deepseek202609230043 deepseek202609230051 deepseek202609230068 deepseek202609230076 deepseek202609230078 deepseek202609270004 deepseek202609280003 deepseek202609290024 deepseek202609290025 deepseek202609300004 deepseek202609300011 deepseek202610010010 deepseek202610070010 deepseek202610080006 deepseek202610090014 deepseek202610170002 deepseek202610210007 deepseek202610210024 deepseek202610210030 deepseek202610220016 deepseek202610230005 deepseek202610230015 deepseek202610230019 deepseek202610240010 deepseek202610240011 deepseek202610250002 deepseek202610250003 deepseek202610250004'.split()
    chosen={x['slug']:x for x in fish if x['slug'] in explicit}
    exclude=['泳装','僵尸','丧尸','内衣','婚纱','圣诞','兔女郎','侦探','魔女','球衣','机能','触手','血腥','比基尼','性感','情趣','束缚','猎奇','无头','死亡','紫砂','自杀','亲吻','色情','乳','裸','丝袜','胸部','双人','claude','克劳德','鞭','枪','坦克','子弹','怪兽','骑士','战术','修女','生鱼片']
    candidates=[]
    for x in fish:
        text=x.get('name','')+' '+x.get('description','')+' '+' '.join(x.get('tags',[]))
        if any(t in text for t in exclude) or not x.get('path','').lower().endswith(('.png','.jpg','.jpeg','.webp','.gif')): continue
        if not any(t in text for t in ['女仆','蕾丝头','围裙']):continue
        score=sum(3 for t in ['表情','闭眼','睁眼','张嘴','全身','侧脸','眨眼','惊讶','微笑','害羞','思考','困惑','待机','发呆','鲸鳍','鲸尾','尾巴','三视','正面','背面','立绘','招手'] if t in text)
        candidates.append((score,x))
    for score,x in sorted(candidates,key=lambda z:(-z[0],z[1]['slug'])):
        if len(chosen)>=80: break
        chosen.setdefault(x['slug'],x)
    records.extend(image_record(x) for x in chosen.values())
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures=[pool.submit(fetch_image,x) for x in records if x.get('download_status')!='saved']
        for i,f in enumerate(as_completed(futures),1):
            f.result()
            if i%20==0:print('image download progress',i,'/',len(futures),flush=True)
    # Byte-level deduplication; keep source records but identify repeated content.
    hashes={}
    for x in records:
        if x.get('sha256') in hashes:x['duplicate_of']=hashes[x['sha256']]
        elif x.get('sha256'):hashes[x['sha256']]=x['id']

    videos=[]
    for x in videos_data['videos']:
        if 'deepseek' not in x.get('characterIds',[]):continue
        text=x.get('title','')+' '+x.get('description','')[:200]
        if any(k in text for k in ['CP，','封我号','她们是女同事','抽卡模拟器','以封号','肥鱼崩敌庙']): continue
        videos.append(dict(id=x['bvid'],type='video',title=x['title'],source_url=x['url'],author=authors.get(str(x['uid']),str(x['uid'])),
            author_url='https://space.bilibili.com/'+str(x['uid']),duration_seconds=x.get('duration'),published_at=x.get('publishedAt'),
            image_url=x.get('cover'),local_path='references/video-covers/'+x['bvid']+'.jpg',reference_group='视频参考',purposes=purpose(text),
            verification='聚合索引元数据已获取；尚未逐条播放',visual_review='pending',license_status='观看/制作参考；各视频权利与音乐单独核实；未下载整片',download_status='pending'))
    with ThreadPoolExecutor(max_workers=5) as pool:
        for f in as_completed([pool.submit(fetch_image,x) for x in videos]):f.result()
    for bvid,title,author,purposes in [
        ('BV1CbuB6gE2X','假如蓝色大肥鱼也有寿命论…','拉普拉斯sama',['哭泣表情','参考图2原片候选']),
        ('BV1xCai6aE9g','【4K】如果聊天窗口就是她的整个世界 —— world.execute(me)','西西弗斯的风车',['HUD呈现参考']),
    ]:
        if not any(x['id']==bvid for x in videos): videos.append(dict(id=bvid,type='video',title=title,source_url='https://www.bilibili.com/video/'+bvid+'/',author=author,purposes=purposes,reference_group='视频候选',verification='公开搜索索引/页面核实；与用户截图对应关系未确认',visual_review='pending',license_status='参考链接，未下载整片',local_path='',download_status='link_only'))
    write_json('metadata/image-manifest.json',records)
    write_json('metadata/video-manifest.json',videos)
    # More sources remain searchable without downloading the whole collection.
    write_json('metadata/expansion-index.json',[dict(id=x['slug'],title=x['name'],source_url=SITE+'/works/'+x['slug']+'.html',image_url=x['path'],purposes=purpose(x.get('name','')+' '+x.get('description',''))) for x in fish])
    write_json('metadata/sources.json',dict(collected_on='2026-10-25',source_catalogs=[BASE+'works.json',BASE+'video-archive.json','https://raw.githubusercontent.com/shuaizenge/ai-girls/main/catalog.json'],scope='公开参考素材索引；不将聚合站声明提升为原作者授权；不下载语音、不克隆声音、不修改原软件',upstream_live2d='https://github.com/Andersen216/dsh-whale-girl-live2d'))
    for name,data in [('image-manifest',records),('video-manifest',videos)]:
        with (ROOT/'metadata'/f'{name}.csv').open('w',encoding='utf-8-sig',newline='') as f:
            w=csv.DictWriter(f,fieldnames=['id','title','author','source_url','reference_group','purposes','visual_review','license_status','local_path','download_status'])
            w.writeheader()
            for x in data:w.writerow({k:' / '.join(x.get(k,[])) if isinstance(x.get(k),list) else x.get(k,'') for k in w.fieldnames})
    summary=dict(image_records=len(records),downloaded_images=sum(x.get('download_status')=='saved' for x in records),unique_image_hashes=len(hashes),videos=len(videos),saved_video_covers=sum(x.get('download_status')=='saved' for x in videos),expansion_image_records=len(fish),image_failures=[dict(id=x['id'],error=x.get('error')) for x in records if x.get('download_status')=='failed'])
    write_json('metadata/collection-summary.json',summary)
    print(json.dumps(summary,ensure_ascii=False),flush=True)

if __name__=='__main__':main()
