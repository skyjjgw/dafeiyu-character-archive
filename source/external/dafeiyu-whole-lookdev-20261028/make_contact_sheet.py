from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
P=Path('D:/CodexTaskData/dafeiyu-whole-lookdev-20261028/v1')
W,H=512,563
sheet=Image.new('RGB',(W*3,H*2+94),(31,36,46));d=ImageDraw.Draw(sheet)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',15)
for row,mode in enumerate(['flat','cel']):
 for col,angle in enumerate([0,45,90]):
  im=Image.open(P/f'{mode}-{angle:03}.png').convert('RGB')
  x=col*W;y=36+row*(H+28)
  sheet.paste(im,(x,y));d.text((x+12,y-23),f'{mode.upper()} / {angle:03} deg',font=font,fill=(230,235,244))
d.text((12,H*2+67),'SAME editable geometry / fixed light & framing / source face UV preserved / candidate, finalAccepted=false',font=small,fill=(225,229,238))
sheet.save(P/'comparison-flat-cel.png')
