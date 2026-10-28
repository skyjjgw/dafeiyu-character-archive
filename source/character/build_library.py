"""Create an offline reference browser and an honest production coverage report."""
from pathlib import Path
import csv, hashlib, json, sys
from collect_materials import ROOT, write_json

sys.stdout.reconfigure(encoding='utf-8')
def read(name,default):
    p=ROOT/name
    return json.loads(p.read_text(encoding='utf-8')) if p.exists() else default

images=read('metadata/image-manifest.json',[])+read('metadata/primary-additions.json',[])
reviews={x['id']:x for x in read('metadata/primary-visual-review.json',[])+read('metadata/additional-visual-review.json',[])}
for x in images:
    if x['id'] in reviews:x.update(reviews[x['id']])
    if x.get('reference_group')=='社区补充三视图':x['license_status']='社区补充，具体绘制者及授权待核实；角色上游有非商用声明'
    if x['id']=='daozizhentian-07':x.update(form='Q版',visual_review='已目视核对：与用户参考图1匹配的蓝发鲸鱼女仆正侧背；三视图轮廓完整',purposes=['造型与角度','头发服装与尾巴'],relevance='matching')
    if x['id'].startswith('live2d-'):x.update(form='Q版',visual_review='已目视核对上游图标与截图：蓝发鲸耳女仆同角色；画法与参考图2不同',relevance='variant')
strict_reviews={x['id']:x for x in read('metadata/consistency-review.json',[])}
for x in images:
    if x.get('relevance')=='exclude':x.update(reference_use='excluded',reference_use_label='其他角色 · 排除')
    elif x.get('relevance')=='variant':x.update(reference_use='variant',reference_use_label='其他版本 · 不作主造型')
    elif x.get('visual_review') in [None,'pending']:x.update(reference_use='pending',reference_use_label='待核对 · 未纳入主造型')
    else:
        x.update(reference_use='detail',reference_use_label='局部参考 · 非同稿证明')
        if x.get('relevance')=='matching':x['relevance']='detail_reference'
    if x['id'] in strict_reviews:x.update(strict_reviews[x['id']])
    if x['id']=='user-1':x.update(reference_use_label='早期用户截图 · 辅助对照',consistency_notes='早期抱锅奔跑截图保留作辅助对照；当前主参考为用户确认的冬冰四条视频人物版本。此单帧的遮挡不再作为当前人物细节缺失的结论。')
    if x['id']=='user-2':x.update(reference_use_label='早期用户截图 · HUD氛围辅助',consistency_notes='保留人物在HUD中的表情和呈现氛围参考；当前主造型以用户确认的冬冰视频版为准。')
videos=read('metadata/video-manifest.json',[])
for x in read('metadata/video-additions.json',[]):
    if not any(v['id']==x['id'] for v in videos):videos.append(x)
release=read('metadata/live2d-original-release.json',{})
if release and not any(v['id']=='BV16yYi69EQT' for v in videos):
    videos.append(dict(id='BV16yYi69EQT',type='video',title=release['title'],source_url=release['url'],author='氵六青；模型协作者 UID 2505395（茶坤菜的/旧名茶坤不接了）',author_url=release['uploader_url'],duration_seconds=106,purposes=['现成Live2D演示','眼口与表情'],reference_group='模型原发布',verification='原发布视频页及公开索引已核实；未逐帧播放',license_status='具体模型与角色权利分别核对，见来源记录',local_path='',download_status='link_only'))
for x in videos:
    x.setdefault('reference_group','补充视频')
    x.setdefault('visual_review','未逐帧播放')
    x.setdefault('form','视频表现待核对')
confirmed_video_specs=[
    ('BV1Tonb6JExo','饭盆 · 整体形象与互动'),
    ('BV1t6nu6bEsf','压力 · 眉眼与表情演出'),
    ('BV1g2JX6HEHX','再给 · 请求与日常互动'),
    ('BV1C2pg6cEZW','尾巴 · 身体与尾部表现'),
]
confirmed_references=[]
for ref_id,focus in confirmed_video_specs:
    item=next((x for x in videos if x['id']==ref_id),None)
    if item is None:raise ValueError('用户确认的冬冰主参考不在原视频库中：'+ref_id)
    item.update(author='冬冰',author_url='https://space.bilibili.com/44748304/',primary_reference=True,form='Q版 · 用户确认人物版本',visual_review='用户已确认目标人物版本；核对范围为部分播放片段及公开缩略图，未完整逐帧审片',verification='用户指定为主参考；保留原视频与封面来源，不将公开缩略图当作完整动作证据')
    reference=dict(item,focus=focus)
    base=Path('references/dongbing-confirmed/storyboards')
    for key,suffix in [('storyboard_path','-storyboard.jpg'),('storyboard_index','-index.json')]:
        relative=base/(ref_id+suffix)
        if (ROOT/relative).is_file():reference[key]=relative.as_posix()
    confirmed_references.append(reference)

direction=read('metadata/character-direction.json',{})
priority={id:i for i,id in enumerate(direction.get('priority_reference_ids',[]))}
def is_q(x):return 'Q版' in x.get('form','')
images.sort(key=lambda x:(priority.get(x['id'],999),0 if is_q(x) else 1,0 if x.get('visual_review') not in [None,'pending'] else 1))
manifest=dict(images=images,videos=videos)
write_json('metadata/library-manifest.json',manifest)
summary=dict(image_records=len(images),saved_images=sum(x.get('download_status')=='saved' for x in images),relevant_saved_images=sum(x.get('download_status')=='saved' and x.get('relevance')!='exclude' for x in images),unique_image_hashes=len({x['sha256'] for x in images if x.get('sha256')}),videos=len(videos),video_files_downloaded=0,saved_video_covers=sum(x.get('download_status')=='saved' for x in videos),visually_reviewed_images=sum(x.get('visual_review') not in [None,'pending'] for x in images),excluded_images=sum(x.get('relevance')=='exclude' for x in images),expansion_index=len(read('metadata/expansion-index.json',[])),model=read('model-candidate/source.json',{}))
write_json('metadata/collection-summary.json',summary)
summary['q_image_records']=sum(is_q(x) and x.get('relevance')!='exclude' for x in images)
summary['baseline_records']=sum(x.get('reference_use')=='baseline' for x in images)
summary['comparison_records']=sum(x.get('reference_use')=='comparison' for x in images)
summary['primary_video_references']=len(confirmed_references)
write_json('metadata/collection-summary.json',summary)
with (ROOT/'素材总清单.csv').open('w',encoding='utf-8-sig',newline='') as f:
    keys=['id','type','title','author','source_url','form','purposes','visual_review','license_status','local_path']
    w=csv.DictWriter(f,fieldnames=keys);w.writeheader()
    for x in images+videos:w.writerow({k:' / '.join(x.get(k,[])) if isinstance(x.get(k),list) else x.get(k,'') for k in keys})

sources=[dict(title='冬冰：'+x['title'],url=x['source_url'],note='用户已确认的主参考；'+x['focus']+'。抽看部分播放片段及公开缩略图，未完整逐帧审片') for x in confirmed_references]+[
dict(title='冬冰：主参考视频作者主页',url='https://space.bilibili.com/44748304/',note='四条主参考的发布作者；后续同版本资料优先回到作者原帖核对'),
dict(title='上善无形：鲸鱼娘原始造型与 CC BY-NC-SA 4.0 声明',url='https://www.bilibili.com/opus/1231977657712771073',note='角色原型；与女仆二设分开'),
dict(title='ZipZipPipe：女仆二设《AI娘化》',url='https://www.pixiv.net/artworks/148186519',note='正常比例立绘与服装；公开作品说明要求署名、非商用'),
dict(title='ZipZipPipe：短裙女仆等更新',url='https://www.bilibili.com/opus/1236803362705375305',note='女仆版本变体'),
dict(title='这个刀子真甜：12张原帖图，含Q版三视图',url='https://www.bilibili.com/opus/1234477753856688168',note='原帖作者与图片URL由平台公开元数据核对'),
dict(title='氵六青：免费Live2D模型原发布',url='https://www.bilibili.com/video/BV16yYi69EQT/',note='团队含模型协作者 UID2505395；不是参考图2原模型的证明'),
dict(title='Live2D候选固定版本及来源记录',url='https://github.com/Andersen216/dsh-whale-girl-live2d/tree/f977bef508690e75ba6535cd8f4ce18e7f6ba9b0',note='运行模型已保存；不执行其插件代码，未接入当前软件'),
dict(title='精选图与视频索引来源',url='https://xn--pssy23gqgbz2d718b.com/',note='收录站；未知作者或许可不据此推定可商用'),
dict(title='设定集补充来源',url='https://aigengtu.com/refs',note='社区补充三视图，绘制者待核实'),
]
write_json('metadata/important-sources.json',sources)
payload=json.dumps(dict(**manifest,summary={k:v for k,v in summary.items() if k!='model'},sources=sources,primary_references=confirmed_references),ensure_ascii=False).replace('</',r'<\/')
template='''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>大肥鱼 · 人物素材参考库</title><style>
:root{color-scheme:dark;font-family:"Microsoft YaHei UI",sans-serif;background:#111a20;color:#dce6eb}*{box-sizing:border-box}body{margin:0}header{padding:38px max(24px,5vw) 28px;background:linear-gradient(125deg,#172a37,#10232c);border-bottom:1px solid #344653}h1{font-size:29px;letter-spacing:2px;margin:6px 0 14px}h2{font-size:18px;margin:0 0 15px}.eyebrow{color:#7fcbdc;font-size:11px;letter-spacing:2px}.lead{max-width:1000px;font-size:14px;line-height:1.9;color:#b4c8d3}.counts{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}.counts span{background:#17262e;border:1px solid #35505b;padding:12px 16px;font-size:13px}.counts b{color:#9cdcea;font-size:20px;margin-right:6px}main{padding:24px max(24px,5vw) 60px}.notes{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:24px}.note{border:1px solid #324650;background:#15232c;padding:18px;font-size:13px;line-height:1.9}.note strong{color:#b5e7ed}.note a,a{color:#9edce8;text-decoration:none}a:hover{text-decoration:underline}.tools{position:sticky;top:0;z-index:2;padding:14px 0;background:#111a20f5;display:flex;flex-wrap:wrap;gap:9px;align-items:center}button,input,select{font:inherit;color:#d8e5e8;background:#1c2c36;border:1px solid #425c69;padding:9px 12px;border-radius:4px}button{cursor:pointer}.active{background:#386375;border-color:#80c0d5}input{flex:1;min-width:210px}#visible{font-size:12px;color:#a7b9c2}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-top:14px}.card{background:#18252e;border:1px solid #34454f;border-radius:5px;overflow:hidden;display:flex;flex-direction:column}.photo{height:220px;background-color:#1d303a;background-image:linear-gradient(45deg,#243942 25%,transparent 25%),linear-gradient(-45deg,#243942 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#243942 75%),linear-gradient(-45deg,transparent 75%,#243942 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0;display:flex;align-items:center;justify-content:center}.photo img{width:100%;height:100%;object-fit:contain}.no-cover{color:#8babbc;font-size:13px}.body{padding:15px;flex:1;display:flex;flex-direction:column}.badge{font-size:10px;color:#9dd9e6;margin-bottom:8px}h3{font-size:14px;line-height:1.6;margin:0 0 9px;font-weight:500}.by{font-size:11px;color:#9bb0bb;line-height:1.7}.tags{display:flex;flex-wrap:wrap;gap:5px;margin:9px 0}.tags span{font-size:10px;background:#253946;padding:3px 6px}.review{font-size:10px;line-height:1.7;color:#9fb5c2;margin-bottom:9px}.links{display:flex;gap:14px;margin-top:auto;padding-top:10px;font-size:12px}.sources{margin-top:35px;border-top:1px solid #344c59;padding-top:25px}.sources ul{padding-left:20px}.sources li{margin-bottom:11px;font-size:12px;line-height:1.8}.sources small{color:#a7bac4}.empty{padding:50px;text-align:center;color:#9bafbd}.pagination{display:flex;align-items:center;justify-content:center;gap:15px;padding:26px}footer{font-size:11px;color:#91a6b2;line-height:1.9}#modal{width:min(1300px,94vw);height:94vh;padding:0;border:1px solid #577886;background:#0f181f;color:#dce6eb}#modal::backdrop{background:#000c}.modalbar{display:flex;justify-content:space-between;align-items:center;padding:12px;gap:15px}.modalimg{height:calc(100% - 68px);width:100%;object-fit:contain}#modalTitle{font-size:12px}@media(max-width:700px){.notes{grid-template-columns:1fr}.photo{height:230px}header{padding-top:24px}h1{font-size:24px}}
</style><style>
.primary{border:1px solid #487286;background:linear-gradient(135deg,#1c3442,#15252f);padding:22px;margin-bottom:24px}.primary h2{font-size:22px;margin-bottom:9px}.primary-intro{color:#b4cbd6;font-size:13px;line-height:1.9;margin:0 0 18px}.primary-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px}.primary-card{background:#14232d;border:1px solid #426273;display:flex;flex-direction:column;overflow:hidden;border-radius:5px}.primary-cover{display:block;aspect-ratio:16/9;background:#0d1d26;overflow:hidden}.primary-cover img{display:block;width:100%;height:100%;object-fit:cover}.primary-body{padding:14px;display:flex;flex:1;flex-direction:column}.primary-body h3{min-height:44px;font-size:14px}.primary-focus{color:#abdce7;font-size:11px;margin:0 0 9px}.primary-author{font-size:12px;margin-bottom:10px}.primary-links{display:flex;flex-wrap:wrap;gap:9px 13px;font-size:12px;margin-top:auto;padding-top:10px;border-top:1px solid #2f4b5b}.library-intro{color:#9fb8c6;font-size:12px;line-height:1.8;margin:0 0 10px}@media(max-width:1100px){.primary-cards{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.primary{padding:15px}.primary-cards{grid-template-columns:1fr}.primary-body h3{min-height:0}}
</style></head><body><header><div class="eyebrow">DAFEIYU / CONFIRMED CHARACTER REFERENCES · 2026.10.25</div><h1>大肥鱼 · 人物素材参考库</h1><p class="lead">主参考已更新为你确认的冬冰四条视频人物版本：饭盆、压力、再给、尾巴。首页先看这四条的封面与原视频；早期用户截图和其他设计稿保留为辅助对照，后续人物制作围绕冬冰视频版统一。</p><div class="counts" id="counts"></div></header><main>
<section class="primary" aria-labelledby="primary-title"><div class="eyebrow">USER CONFIRMED / DONGBING</div><h2 id="primary-title">用户已确认 · 冬冰视频版</h2><p class="primary-intro">作者：<a href="https://space.bilibili.com/44748304/" target="_blank" rel="noopener noreferrer">冬冰 ↗</a>。这四条视频中的人物是当前主参考。核对范围为抽看部分播放片段及公开缩略图，未完整逐帧审片；已保存的三份公开分镜总览与索引可从对应卡片打开。</p><div class="primary-cards" id="primaryRefs"></div></section>
<div class="notes"><div class="note"><strong>人物探索稿与版本说明</strong><br>v1生成稿偏厚涂、身形偏长，保留作探索；后续稿围绕冬冰视频人物版统一。生成图仍是概念探索，尚未成为Live2D分层或绑定工程。<br><a href="concepts/index.html">打开人物探索稿画廊 ↗</a></div><div class="note"><strong>现成模型只作技术试跑</strong><br>已保存Q版Live2D候选，含44个表情文件、8个动作。它与当前主参考存在画风与细节差异，尚未在软件接入，也未作为外观定稿。<br><a href="model-candidate/source.json">模型文件与固定版本记录 ↗</a></div></div>
<h2>辅助图片与视频参考</h2><p class="library-intro">下方保留原有图片、视频、来源和筛选。默认显示早期用户截图与两张接近设计稿，均用于辅助对照；同角色或同为Q版不等于同一套资产。</p>
<div class="tools"><button data-type="image" class="active">图片</button><button data-type="video">视频</button><input id="search" placeholder="搜索标题、作者、用途、表情…" aria-label="搜索素材"><select id="style" aria-label="筛选素材范围"><option value="main" selected>辅助造型对照</option><option value="q">所有Q版（含变体）</option><option value="detail">局部参考</option><option value="technical">技术试跑</option><option value="variant">其他版本</option><option value="pending">待核对素材</option><option value="all">全部素材</option><option value="normal">正常比例参考</option></select><select id="group" aria-label="筛选来源"><option value="">全部来源</option></select><select id="purpose" aria-label="筛选用途"><option value="">全部用途</option></select><select id="review" aria-label="筛选复核状态"><option value="">全部复核状态</option><option value="checked">已目视核对</option><option value="pending">待目视/逐帧核对</option><option value="excluded">不作为制作基准</option></select><span id="visible"></span></div>
<div class="grid" id="grid"></div><div class="pagination"><button id="prev">上一页</button><span id="page"></span><button id="next">下一页</button></div>
<section class="sources"><h2>关键来源与制作说明</h2><ul id="sources"></ul><p><a href="concepts/index.html">人物探索稿画廊 ↗</a>　<a href="制作覆盖与下一步.md">制作覆盖与下一步 ↗</a>　<a href="素材总清单.csv">完整CSV清单 ↗</a>　<a href="metadata/library-manifest.json">完整JSON清单 ↗</a></p></section><footer>本库为本地制作参考。聚合站的收录、投稿人声明或代码MIT许可不等于原角色美术许可。冬冰四条视频版为用户确认的主参考；早期两张截图精确原片的追溯不影响当前选择。已查看的播放片段和公开缩略图不代表完整逐帧审片。<br>本地预览无需登录，无广告，无外部脚本；点击来源链接才会打开对应网站。</footer></main>
<dialog id="modal"><div class="modalbar"><span id="modalTitle"></span><button id="close">关闭 ✕</button></div><img class="modalimg" id="modalImage" alt="素材大图"></dialog>
<script>const DATA=__DATA__;let type='image',page=0;const size=24,$=id=>document.getElementById(id);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const saved=DATA.summary.relevant_saved_images; $('counts').innerHTML=`<span><b>${DATA.summary.primary_video_references}</b>冬冰主参考视频</span><span><b>${DATA.summary.image_records}</b>底层图片记录</span><span><b>${DATA.summary.videos}</b>视频来源</span><span><b>1</b>模型仅作技术试跑</span>`;
for(const x of DATA.primary_references)$('primaryRefs').insertAdjacentHTML('beforeend',`<article class="primary-card"><a class="primary-cover" href="${esc(x.source_url)}" target="_blank" rel="noopener noreferrer"><img src="${esc(x.local_path)}" alt="冬冰 · ${esc(x.title)} 视频封面"></a><div class="primary-body"><p class="primary-focus">${esc(x.focus)}</p><h3><a href="${esc(x.source_url)}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a></h3><div class="primary-author"><a href="${esc(x.author_url)}" target="_blank" rel="noopener noreferrer">${esc(x.author)} ↗</a> · ${x.duration_seconds}s</div><div class="primary-links"><a href="${esc(x.source_url)}" target="_blank" rel="noopener noreferrer">原视频 ↗</a>${x.storyboard_path?`<a href="${esc(x.storyboard_path)}" target="_blank" rel="noopener noreferrer">公开分镜总览 ↗</a>`:''}${x.storyboard_index?`<a href="${esc(x.storyboard_index)}" target="_blank" rel="noopener noreferrer">缩略图索引 ↗</a>`:''}</div></div></article>`);
for(const s of DATA.sources)$('sources').insertAdjacentHTML('beforeend',`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a><br><small>${esc(s.note)}</small></li>`);
for(const v of [...new Set([...DATA.images,...DATA.videos].map(x=>x.reference_group))].filter(Boolean))$('group').insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`);
for(const v of [...new Set([...DATA.images,...DATA.videos].flatMap(x=>x.purposes||[]))].filter(Boolean))$('purpose').insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`);
function checked(x){return x.visual_review&&x.visual_review!=='pending'&&!x.visual_review.includes('未逐帧');}
function matchesStyle(x,style){if(type!=='image'||style==='all')return true;if(style==='main')return ['baseline','comparison'].includes(x.reference_use);if(['detail','technical','variant','pending'].includes(style))return x.reference_use===style;let f=x.form||'';if(style==='q')return f.includes('Q版');if(style==='normal')return f.includes('正常比例');return true;}
function render(){let q=$('search').value.trim().toLowerCase(),group=$('group').value,purpose=$('purpose').value,review=$('review').value,style=$('style').value;$('style').disabled=type!=='image';let items=(type==='image'?DATA.images:DATA.videos).filter(x=>matchesStyle(x,style)&&(!q||JSON.stringify([x.title,x.author,x.id,x.purposes,x.form,x.visual_review]).toLowerCase().includes(q))&&(!group||x.reference_group===group)&&(!purpose||(x.purposes||[]).includes(purpose))&&(review==='excluded'?x.relevance==='exclude':x.relevance!=='exclude')&&(!review||review==='excluded'||(review==='checked'?checked(x):!checked(x))));let pages=Math.max(1,Math.ceil(items.length/size));page=Math.min(page,pages-1);$('visible').textContent=`${items.length} 项`;$('page').textContent=`${page+1} / ${pages}`;$('prev').disabled=page===0;$('next').disabled=page===pages-1;
$('grid').innerHTML=items.slice(page*size,(page+1)*size).map(x=>`<article class="card"><div class="photo">${x.download_status==='saved'&&x.local_path?`<img src="${esc(x.local_path)}" alt="${esc(x.title)}" loading="lazy" data-zoom="${esc(x.id)}">`:'<span class="no-cover">点击原站查看视频</span>'}</div><div class="body"><div class="badge">${esc(x.reference_use_label||x.reference_group)} · ${esc(x.form||'视频参考')}</div><h3>${esc(x.title)}</h3><div class="by">${esc(x.author)}${x.actual_width?`<br>${x.actual_width} × ${x.actual_height}`:''}${x.duration_seconds?` · ${x.duration_seconds}s`:''}</div><div class="tags">${(x.purposes||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="review">${esc(x.visual_review==='pending'?'根据元数据初筛，待目视核对':x.visual_review||x.verification)}${x.consistency_notes?`<br>${esc(x.consistency_notes)}`:''}<br>${esc(x.license_status)}</div><div class="links">${x.source_url?`<a href="${esc(x.source_url)}" target="_blank" rel="noopener noreferrer">${type==='video'?'原站观看':'来源原帖'} ↗</a>`:''}${x.local_path&&x.download_status==='saved'?`<a href="${esc(x.local_path)}" target="_blank" rel="noopener noreferrer">打开图片 ↗</a>`:''}</div></div></article>`).join('')||'<div class="empty">暂无匹配素材</div>';
document.querySelectorAll('[data-zoom]').forEach(el=>el.onclick=()=>{let x=items.find(y=>y.id===el.dataset.zoom);$('modalTitle').textContent=x.title;$('modalImage').src=x.local_path;$('modal').showModal();});}
document.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{type=b.dataset.type;page=0;document.querySelectorAll('[data-type]').forEach(z=>z.classList.toggle('active',z===b));render()});['search','style','group','purpose','review'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',()=>{page=0;render()}));$('prev').onclick=()=>{page--;render();scrollTo({top:300,behavior:'smooth'})};$('next').onclick=()=>{page++;render();scrollTo({top:300,behavior:'smooth'})};$('close').onclick=()=>$('modal').close();render();</script></body></html>'''
(ROOT/'index.html').write_text(template.replace('__DATA__',payload),encoding='utf-8')

report=f'''# 大肥鱼人物素材：制作覆盖与下一步

日期：2026-10-25。用户选择二次元2D、主要Q版，并已明确确认冬冰四条视频中的人物是目标。当前主参考为冬冰视频版；早期抱锅奔跑截图、半身流泪HUD截图与其他设计稿保留为辅助对照。

## 本地交付

- 已保存图片 {summary['saved_images']} 张，其中 {summary['excluded_images']} 张目视确认属于其他角色，标为排除并在浏览器默认隐藏；其余 {summary['relevant_saved_images']} 张为相关参考（含根据元数据初筛、待目视复核的图片）。含用户基准、原作者资料、社区图和Live2D候选预览；按 SHA-256 记录。
- 视频来源 {summary['videos']} 条，已保存 {summary['saved_video_covers']} 张视频封面。四条主参考核对过部分播放片段及公开缩略图，未完整逐帧审片；其余视频未逐条播放。视频以原站链接/元数据交付，整片下载数量为0。不把封面计入图片素材数量。
- 扩展图片索引 {summary['expansion_index']} 条，未整库下载。可用于后续补充特定表情、动作，不能把全部索引说成逐项精选或已核实。
- 原始采集脚本、CSV/JSON清单、本地HTML浏览器与模型来源记录均保留在本目录。
- 首页顶部突出展示用户确认的四条冬冰主参考：封面、作者主页、原视频，以及已保存的三份公开分镜总览和索引。底层图片默认仍显示早期用户截图与2张接近设计稿，定位为辅助对照。全部 {summary['q_image_records']} 条Q版记录与原有来源、用途、复核状态筛选均保留，含变体与待复核条目。
- 人物探索稿入口：[concepts/index.html](concepts/index.html)。v1偏厚涂、身形偏长，只作探索；后续稿以冬冰视频人物版统一，仍需用户确认与Live2D制作。

## 用户确认的主参考：冬冰视频版

作者：[冬冰](https://space.bilibili.com/44748304/)。下列四条视频人物版本已由用户确认，不再将早期抱锅帧视为唯一外观基准。

| 视频 | 用途 | 本地公开缩略图资料 |
|---|---|---|
| [可是它长得本来就像饭盆嘛！【AI全民制作人】](https://www.bilibili.com/video/BV1Tonb6JExo/) | 饭盆、整体形象与互动 | [封面](references/video-covers/BV1Tonb6JExo.jpg) |
| [压力一只大肥鱼？](https://www.bilibili.com/video/BV1t6nu6bEsf/) | 眉眼与表情演出 | [公开分镜总览](references/dongbing-confirmed/storyboards/BV1t6nu6bEsf-storyboard.jpg) / [索引](references/dongbing-confirmed/storyboards/BV1t6nu6bEsf-index.json) |
| [再给我一个好吗](https://www.bilibili.com/video/BV1g2JX6HEHX/) | 请求与日常互动 | [公开分镜总览](references/dongbing-confirmed/storyboards/BV1g2JX6HEHX-storyboard.jpg) / [索引](references/dongbing-confirmed/storyboards/BV1g2JX6HEHX-index.json) |
| [你尾巴里有没有藏吃的](https://www.bilibili.com/video/BV1C2pg6cEZW/) | 身体与尾部表现 | [公开分镜总览](references/dongbing-confirmed/storyboards/BV1C2pg6cEZW-storyboard.jpg) / [索引](references/dongbing-confirmed/storyboards/BV1C2pg6cEZW-index.json) |

核对范围为抽看部分播放片段与公开缩略图，未完整逐帧审片。公开分镜是播放器缩略图总览，不等于连续帧动画或完整动作轨迹；时间索引保留平台原值，单格与时间点的对应仍以索引说明为准。

## 保留的辅助资料

1. 早期用户抱锅帧与半身流泪HUD截图：前者辅助对照Q版特征，后者辅助表情与面板呈现氛围；二者不再覆盖冬冰视频版的当前选择。
2. 这个刀子真甜12图动态第4张正面与第7张正侧背：接近设计稿，辅助理解发饰、服装与转面；尚未确证为冬冰视频所用资产，不直接视为同稿差分。第7张原图5504×3072。
3. ZipZipPipe 正常比例女仆立绘及变体：作为服装和细节补充，保留上游来源；不会据此把人物主比例改为正常比例。
4. 原角色溟月：上善无形原动态中的鲸鱼娘，作为角色来源记录，不混作最终女仆服装。
5. 氵六青发布的Q版Live2D候选：保存绑定后运行包及来源说明，上游截图已目视核对。同一角色风格，但与当前主参考存在画风和细节差异，只作技术试跑。

## 覆盖与实际缺口

| 制作项 | 当前情况 | 还要做什么 |
|---|---|---|
| 发型、鲸鳍耳、发带、鲸尾、服装 | 四条冬冰视频为主参考，原设计立绘和Q版三视图作辅助 | 围绕已选人物版本统一比例、线条、上色与服装；不能把不同版本直接拼合 |
| 眼睛、眉毛、嘴、表情 | 主参考的已抽看片段及公开缩略图可用于表情研究，另有模型表情文件 | 按同版本整理稳定的眼口、眉形和表情差分，再映射控制参数；不再因早期截图闭眼而断言缺少睁眼参考 |
| 待机、头部转动、身体和尾巴 | 有已选视频、三份公开分镜资料及8个候选模型动作 | 尚未完整逐帧标注；动作文件需实际播放检查，缩略图不能直接充当完整动作证据 |
| 眨眼 | 模型入口有 EyeBlink 参数组 | 在渲染器中播放验收 |
| 说话口型 | 模型中有嘴部相关参数线索 | model3 的 LipSync 组当前为空；不能说已有语音驱动，需要映射和TTS同步 |
| 可编辑立绘/分层 | 下载的图为扁平图 | 未找到PSD/PSB原稿，不能当已拆层素材 |
| Cubism编辑工程 | 未找到cmo3 | 深度改造仍要工程原稿或重新分层/绑定 |
| 软件接入 | 当前大肥鱼HUD中还没有人物渲染层 | 本轮素材库不改DSH插件、不自动安装候选插件 |

## 推荐的下一步

当前已明确主参考为冬冰视频版。先围绕四条选定视频整理人物的头身比例、发型与鲸鳍、白色女仆头饰、服装、鲸尾，以及常见眼口表情；已保存公开缩略图与索引可辅助定位。对视频中未清晰呈现的部位，在统一设定稿中补齐，并标明推定设计。

人物探索稿通过 [concepts/index.html](concepts/index.html) 集中查看。v1偏厚涂、身形偏长，保留作探索对照；后续稿围绕冬冰视频版的比例、线条与表现统一。概念图确认后，再制作可编辑分层立绘、补画遮挡区域、进行绑定与参数映射，不能将扁平生成图直接当作已完成的Live2D模型。

现成Q版模型先作为运行验证候选，验收透明背景、外形、眨眼、嘴部参数、表情、待机与遮挡后，再决定如何接入大肥鱼面板。该模型仍未接入当前软件，也没有因为主参考更新而自动成为外观定稿。

先把模型的表情/动作映射到人物状态，再接语音嘴型；DSH继续承载能力执行，人物的用途仍是可持续扩展的全能虚拟人物。

## 来源和使用范围

角色源流：上善无形 OC溟月 → ZipZipPipe 女仆二设 → 多位社区作者。上善原帖及ZipZipPipe作品说明可核到署名、非商用、相同方式共享要求。模型发布者氵六青的原视频列出模型协作者UID2505395（茶坤菜的，旧索引名茶坤不接了），同样保留署名线索。

现成模型按固定提交保存：f977bef508690e75ba6535cd8f4ce18e7f6ba9b0。上游插件代码MIT不覆盖模型、美术或Live2D Core；本库只取模型与说明文件，没有安装或执行插件。原样来源说明见 model-candidate/notices。本地参考采集不等于已经取得商业App发布许可，未知作者/许可的图继续标待核实。

早期用户两张附件各自的精确原视频仍未确认；这项追溯不再阻挡已明确的冬冰视频版制作方向。寿命论/流泪HUD链接仍只是候选，不把剧情标题相似视作匹配证据。

Agent Reach 技能：E:/CodexData/Users/skyjj/.codex/skills/agent-reach/SKILL.md。本机doctor确认公开B站检索/网页阅读途径；旧技能文档中的search-bilibili命令与实际版本不一致，使用公开网页与平台元数据继续核对。B站部分直连/yt-dlp请求返回412，未绕过登录或访问控制。
'''
(ROOT/'制作覆盖与下一步.md').write_text(report,encoding='utf-8')
print(json.dumps({k:v for k,v in summary.items() if k!='model'},ensure_ascii=False))
