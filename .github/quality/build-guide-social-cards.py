"""Create original, typographic 1200x630 social cards; no stock photos or claims of testing."""
from pathlib import Path
import textwrap
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
CARDS = [
    ('treadmill-pace-chart', 'INDOOR RUNNING', 'Treadmill pace chart', '10 km/h = 6:00/km', 'km/h  /  mph  /  min/km  /  min/mile'),
    ('how-long-to-train-for-a-marathon', 'PLANNING THE BUILD', 'How long to train for a marathon?', '12, 16 or 20 weeks?', 'Start dates, entry workloads and time budgets'),
    ('run-walk-marathon-pacing', 'RACE EXECUTION', 'Run-walk marathon pacing', 'Intervals + walking pace + stops', 'Worked examples with partial final intervals'),
    ('marathon-taper', 'THE FINAL WEEKS', 'Marathon taper', 'Training mileage. Race distance.', 'A worksheet that keeps the two totals clear'),
    ('strength-training-for-marathon-runners', 'RUNNING AND THE GYM', 'Strength for marathon runners', 'Two short gym sessions', 'Exercises, substitutions and a place in your week'),
]
for slug, label, title, detail, foot in CARDS:
    im = Image.new('RGB', (1200,630), '#f6f8f3'); d = ImageDraw.Draw(im)
    d.rectangle((0,0,18,630), fill='#174f40')
    d.text((72,48), 'MARATHON PACE KM', font=ImageFont.truetype(BOLD,25), fill='#174f40')
    d.text((72,116), label, font=ImageFont.truetype(FONT,20), fill='#496258')
    lines = textwrap.wrap(title,width=27)
    for i,line in enumerate(lines):
        d.text((68,165+i*77), line, font=ImageFont.truetype(BOLD,62), fill='#152d27')
    d.rounded_rectangle((72,410,1128,487), radius=12, fill='#edf3e7')
    d.text((94,427), detail, font=ImageFont.truetype(BOLD,29), fill='#174f40')
    d.text((72,533), foot, font=ImageFont.truetype(FONT,25), fill='#496258')
    d.text((72,580), 'marathonpacekm.com', font=ImageFont.truetype(FONT,18), fill='#496258')
    im.save(ROOT/'assets/og'/f'{slug}.png', optimize=True)
    print(slug)
