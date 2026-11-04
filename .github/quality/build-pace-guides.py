"""Build the November pacing references from individually written bodies.

Shares the site's delivered HTML shell. All reference tables are generated with
exact rational inputs, with rounding only at display. No production dependency.
"""
from pathlib import Path
from fractions import Fraction as F
import runpy
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
build = runpy.run_path(str(HERE/'build-practical-guides.py'))['build']
table = runpy.run_path(str(HERE/'build-researched-guides.py'))['table']
HALF, MILE = F('21.0975'), F('1.609344')

def clock(value):
    n = (value.numerator * 2 + value.denominator) // (2 * value.denominator)
    return f'{n//3600}:{n//60%60:02}:{n%60:02}'

def pace(value):
    h, m, s = clock(value).split(':')
    return f'{int(h)*60+int(m)}:{s}'

def half_table():
    rows = []
    for minutes in range(75, 211, 5):
        total = F(minutes*60)
        p = total/HALF
        rows.append([clock(total), pace(p), pace(p*MILE)] + [clock(total*d/HALF) for d in [5,10,15,20]])
    return table('Half-marathon even-pace reference: 21.0975 km, calculated before rounding.',
        ['Finish','min/km','min/mile','5 km','10 km','15 km','20 km'], rows, 'Half-marathon finish times and cumulative checkpoints').replace('<table>', '<table class="pace-chart-table">')

def track_table():
    rows = []
    for p in range(180, 481, 15):
        rows.append([pace(F(p)),pace(F(p)*MILE)] + [pace(F(p*m,1000)) for m in [200,400,800,1000,1600]])
    return table('Even-speed repetition times; recoveries and acceleration are excluded.',
        ['min/km','min/mile','200 m','400 m','800 m','1,000 m','1,600 m'], rows, 'Running pace to track repetition time chart').replace('<table>', '<table class="pace-chart-table">')

GUIDES = [
    dict(slug='half-marathon-pace-chart', route='/half-marathon-pace-chart/',
        title='Half Marathon Pace Chart: KM, Miles & Custom Splits',
        h1='Half-marathon pace chart: kilometre and mile splits', eyebrow='21.0975 km · your checkpoints',
        description='Find half-marathon pace in km and miles, compare 1:15–3:30 finish times, calculate custom 5 km checkpoints and print a chart or personalised pace band.',
        tables={'HALF_FULL_TABLE':half_table()}),
    dict(slug='400m-pace-chart', title='400m Pace Chart & Track Split Calculator: 200–1600m',
        h1='400 m pace chart and track split calculator', eyebrow='From running pace to track time',
        description='Convert min/km, min/mile or a 400 m lap into 200, 400, 800, 1000 and 1600 m times. Print the track pace chart and count the full session.',
        tables={'TRACK_TABLE':track_table()}),
    dict(slug='half-marathon-taper', title='Half Marathon Taper: Editable Final-Week Planner',
        h1='Half-marathon taper: plan the final training days', eyebrow='A race-week distance budget',
        description='Plan the final six days before a half marathon with an editable mileage worksheet. Keep training, warm-up distance and the 21.0975 km race separate.'),
    dict(slug='easy-run-pace', title='Easy Run Pace: How to Choose Your Effort Today',
        h1='Easy-run pace: choosing today’s effort', eyebrow='Keep the easy run useful',
        description='Choose easy-run pace using conversation, effort, conditions and your usual heart-rate pattern. Compare easy and long runs with practical decision examples.'),
]
for guide in GUIDES:
    guide.update(collection='pace-guides', published='2026-11-04',
        extra_css=['/assets/pace-guides.css?v=20261104a'],
        tool_script='/assets/pace-math.js?v=20261104a',
        extra_scripts=['/assets/pace-guides.js?v=20261104a'])

if __name__ == '__main__':
    for guide in GUIDES:
        build(guide)
