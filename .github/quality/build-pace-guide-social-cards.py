"""Original typographic cards for the four November references; no field-test imagery."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import textwrap

ROOT=Path(__file__).resolve().parents[2]
REG='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
CARDS=[
 ('half-marathon-pace-chart','YOUR HALF-MARATHON CHECKPOINTS','Half-marathon pace chart','21.0975 km · KM and mile splits','Full reference chart and a custom split calculator'),
 ('400m-pace-chart','MEASURED TRACK SESSIONS','400 m pace chart','5:00/km = 2:00 per 400 m','200, 400, 800, 1,000 and 1,600 m'),
 ('half-marathon-taper','BEFORE THE START','Half-marathon taper','Training budget + race distance','An editable final-six-day distance worksheet'),
 ('easy-run-pace','TODAY’S RUNNING DECISION','Choose your easy effort','Conversation · effort · context','A practical guide and a short training record'),
]
for slug,label,title,detail,foot in CARDS:
 im=Image.new('RGB',(1200,630),'#f6f8f3');d=ImageDraw.Draw(im)
 d.rectangle((0,0,18,630),fill='#174f40')
 d.text((72,48),'MARATHON PACE KM',font=ImageFont.truetype(BOLD,25),fill='#174f40')
 d.text((72,116),label,font=ImageFont.truetype(REG,20),fill='#496258')
 for i,line in enumerate(textwrap.wrap(title,width=26)):
  d.text((68,165+i*77),line,font=ImageFont.truetype(BOLD,62),fill='#152d27')
 d.rounded_rectangle((72,410,1128,487),radius=12,fill='#edf3e7')
 d.text((94,427),detail,font=ImageFont.truetype(BOLD,29),fill='#174f40')
 d.text((72,533),foot,font=ImageFont.truetype(REG,25),fill='#496258')
 d.text((72,580),'marathonpacekm.com',font=ImageFont.truetype(REG,18),fill='#496258')
 im.save(ROOT/'assets/og'/f'{slug}.png',optimize=True)
 print(slug)
