"""Original typographic social cards, matching the site's practical-guide series."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import textwrap

ROOT = Path(__file__).resolve().parents[2]
FONTS = Path('/usr/share/fonts/truetype/dejavu')
def font(size, bold=False):
    return ImageFont.truetype(str(FONTS/('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')),size)
CARDS = [
 ('marathon-pacers','PACE GROUPS','Should you follow a marathon pacer?','Check the clock. Keep your own plan.','Timing examples + catch-up pace worksheet'),
 ('half-marathon-pacing-strategy','PLAN THE 21.1 KM','Half-marathon pacing','A plan for 5K, 10K, 15K and the finish','Checkpoint tables + an editable opening pace'),
 ('yasso-800s','TRACK-SESSION ARITHMETIC','Yasso 800s','10 x 3:30 + 9 recoveries = 1:06:30','Calculate the session. Question the prediction.'),
 ('carb-loading-calculator','BEFORE THE STARTING LINE','Carb-loading food worksheet','Your target. Your food labels. Your record.','Daily target + planned and recorded servings'),
 ('longest-run-before-marathon','DISTANCE AND DURATION','20 miles or three hours?','32 km at 7:00/km = 3:44 moving','Compare time, recent runs and the whole week'),
]
for slug,label,title,detail,foot in CARDS:
    im=Image.new('RGB',(1200,630),'#f6f8f3');d=ImageDraw.Draw(im)
    d.rectangle((0,0,18,630),fill='#174f40')
    d.text((72,48),'MARATHON PACE KM',font=font(25,True),fill='#174f40')
    d.text((72,116),label,font=font(20),fill='#496258')
    for i,line in enumerate(textwrap.wrap(title,width=27)):
        d.text((68,165+i*77),line,font=font(62,True),fill='#152d27')
    d.rounded_rectangle((72,410,1128,487),radius=12,fill='#edf3e7')
    size=29
    while d.textlength(detail,font=font(size,True))>1008: size-=1
    d.text((94,427),detail,font=font(size,True),fill='#174f40')
    d.text((72,533),foot,font=font(25),fill='#496258')
    d.text((72,580),'marathonpacekm.com',font=font(18),fill='#496258')
    im.save(ROOT/'assets/og'/f'{slug}.png',optimize=True)
    print(slug)
