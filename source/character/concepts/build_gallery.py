"""Build the local concept gallery without altering the illustrations."""
from pathlib import Path
from PIL import Image
import hashlib, html, json

ROOT = Path(__file__).resolve().parent
def esc(value):
    return html.escape(str(value), quote=True)

for version in ('v1', 'v2'):
    path = ROOT / version / 'generation-manifest.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    for item in data['variants']:
        file = path.parent / item['file']
        with Image.open(file) as image:
            item['width'], item['height'] = image.size
        item['bytes'] = file.stat().st_size
        item['sha256'] = hashlib.sha256(file.read_bytes()).hexdigest()
    if version == 'v1':
        data['selection_status'] = '未定稿的早期探索；后续用户明确选择冬冰视频版，当前画法偏柔光厚涂且身体偏长'
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def concepts(version):
    manifest = json.loads((ROOT / version / 'generation-manifest.json').read_text(encoding='utf-8'))
    cards = []
    for item in manifest['variants']:
        source = f"{version}/{item['file']}"
        text = ('用于核对完整轮廓、服装和鲸尾。' if item['id'] == 'D' else
                '用于核对眼睛、眉毛和说话表情。近景上缘裁到呆毛，正式立绘需要留足边界。' if item['id'] == 'E' else
                '早期探索，未作为当前目标。')
        cards.append(f'<article><a href="{esc(source)}" target="_blank"><img src="{esc(source)}" alt="{esc(item["title"])}"></a><div class="body"><h3>{esc(item["id"])} · {esc(item["title"])}</h3><p>{esc(text)}</p><small>{item["width"]} × {item["height"]} · 静态生成预览</small></div></article>')
    return ''.join(cards)

videos = [
    ('BV1Tonb6JExo', '可是它长得本来就像饭盆嘛！', '冬装变体；参考表情与动画画法'),
    ('BV1t6nu6bEsf', '压力一只大肥鱼？', '默认女仆服、身体比例与强表情'),
    ('BV1g2JX6HEHX', '再给我一个好吗', '宽圆脸、睁眼眼型与请求表情'),
    ('BV1C2pg6cEZW', '你尾巴里有没有藏吃的', '说话表情、头发与尾巴'),
]
refs = ''.join(f'<article><a href="https://www.bilibili.com/video/{bv}/" target="_blank" rel="noopener noreferrer"><img src="../references/video-covers/{bv}.jpg" alt="{esc(title)}的视频封面"></a><div class="body"><h3>{esc(title)}</h3><p>{esc(note)}</p><a href="https://www.bilibili.com/video/{bv}/" target="_blank" rel="noopener noreferrer">冬冰 · 原站观看 ↗</a></div></article>' for bv, title, note in videos)

page = '''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>大肥鱼 · 动画Q版预览</title><style>
:root{color-scheme:dark;font-family:"Microsoft YaHei UI",sans-serif;background:#101b22;color:#dce8ec}*{box-sizing:border-box}body{margin:0}header,main{max-width:1420px;margin:auto;padding:30px 5vw}header{padding-top:45px;border-bottom:1px solid #344b57}.eyebrow{font-size:11px;letter-spacing:2px;color:#8ed9df}h1{font-size:29px;margin:14px 0}h2{font-size:21px;margin:14px 0 10px}h3{font-size:16px;font-weight:500;margin:0 0 8px}p{line-height:1.85;color:#b2c8d2;font-size:14px}a{color:#9de2e8;text-decoration:none}a:hover{text-decoration:underline}nav{display:flex;gap:22px;flex-wrap:wrap;font-size:13px;margin-top:20px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin:20px 0 36px}.refs{grid-template-columns:repeat(4,minmax(0,1fr))}article{border:1px solid #38515e;border-radius:6px;overflow:hidden;background:#192a34}article img{display:block;width:100%;height:auto}.refs img{aspect-ratio:16/9;object-fit:contain;background:#101920}.body{padding:18px}small{font-size:11px;color:#8faebb}.notice{padding:15px 20px;background:#19303b;border-left:3px solid #82cbd2;line-height:1.8;font-size:13px;color:#c0d7df}details{border-top:1px solid #38515e;padding-top:24px;margin-top:35px}summary{cursor:pointer;font-size:16px;color:#a8cbd7}.archive{grid-template-columns:repeat(3,minmax(0,1fr))}.archive img{max-height:420px;object-fit:contain;background:#111d25}footer{font-size:12px;color:#8fa9b6;line-height:1.9;margin:20px 0}@media(max-width:850px){.refs{grid-template-columns:repeat(2,minmax(0,1fr))}.archive{grid-template-columns:1fr}}@media(max-width:600px){.grid{grid-template-columns:1fr}header,main{padding:24px}h1{font-size:25px}}
</style></head><body><header><div class="eyebrow">DAFEIYU / ANIME CHARACTER PREVIEW · V2</div><h1>大肥鱼 · 动画Q版预览</h1><p>当前主参考：冬冰这四条视频中的人物。方向是短小身体、宽圆脸、大蓝眼、成组蓝色发束，以及清楚的线稿和赛璐璐阴影。下方两张的首版外观方向已接受，现已进入正面立绘与表情制作准备。</p><nav><a href="../production/v1/">前往首版制作准备 ↗</a><a href="../">返回人物素材库</a><a href="#references">对照原视频</a><a href="v2/generation-manifest.json">本轮完整提示词与文件记录 ↗</a></nav></header><main><h2>本轮两张预览</h2><div class="notice">首版外观方向已接受，正在准备分层原画。原视频是目标参考；生成图仍需逐项对照，不能视为原作者模型。</div><div class="grid">__V2__</div><section id="references"><h2>用户已确定的主参考</h2><p>作者 <a href="https://space.bilibili.com/44748304/" target="_blank" rel="noopener noreferrer">冬冰 ↗</a>。已抽看部分播放片段并查看三条公开播放器缩略图，未完成整片逐帧审查。</p><div class="grid refs">__REFS__</div><p><a href="../references/dongbing-confirmed/storyboards/keyframes/extraction-manifest.json">12张播放器缩略图：提取坐标与来源记录 ↗</a> · 单格480×270，非高清帧，未标注未经证明的时间。</p></section><details><summary>查看早期A/B/C探索稿（未选定）</summary><p>此前偏柔光厚涂、身体偏长；保留作比较，不作为当前人物定稿。</p><div class="grid archive">__V1__</div><a href="v1/generation-manifest.json">早期提示词与文件记录 ↗</a></details><footer>两轮预览均使用内置图像生成工具。所有生成图片、完整提示词、参考路径、尺寸与SHA-256已保存在对应版本目录。已生成正面透明立绘和六表情参考，详见首版制作准备页；下一步制作统一分层原画。</footer></main></body></html>'''
(ROOT / 'index.html').write_text(page.replace('__V2__', concepts('v2')).replace('__V1__', concepts('v1')).replace('__REFS__', refs), encoding='utf-8')
print(json.dumps({'gallery': str(ROOT / 'index.html'), 'v2_images': 2, 'archived_images': 3}, ensure_ascii=False))
