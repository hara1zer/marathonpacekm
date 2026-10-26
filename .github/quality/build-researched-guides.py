"""Build five researched articles and original, reproducible arithmetic tables."""
from pathlib import Path
from html import escape
import runpy
import sys

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
build = runpy.run_path(str(HERE/'build-practical-guides.py'))['build']

def clock(seconds):
    s = int(seconds + .5)
    return f'{s//3600}:{s%3600//60:02}:{s%60:02}' if s >= 3600 else f'{s//60}:{s%60:02}'

def table(caption, headings, rows, label):
    return '<div class="table-scroll table-wide" tabindex="0" role="region" aria-label="'+escape(label)+'"><table><caption>'+escape(caption)+'</caption><thead><tr>'+''.join('<th scope="col">'+escape(x)+'</th>' for x in headings)+'</tr></thead><tbody>'+''.join('<tr><th scope="row">'+escape(row[0])+'</th>'+''.join('<td>'+escape(x)+'</td>' for x in row[1:])+'</tr>' for row in rows)+'</tbody></table></div>'

def half_table():
    rows=[]
    for minutes in [90,105,120,135,150]:
        t=minutes*60;p=t/21.0975
        rows.append([clock(t),clock(p)+'/km',clock(p*1.609344)+'/mile']+[clock(p*d) for d in [5,10,15,20]])
    return table('Even-pace half-marathon checkpoints. Each time is calculated from the unrounded pace.', ['Finish','Pace /km','Pace /mile','5 km','10 km','15 km','20 km'], rows, 'Half-marathon even-pace checkpoint table')

def long_table():
    rows=[]
    for d in [24,28,30,32]:
        rows.append([f'{d} km / {d/1.609344:.2f} miles']+[clock(d*p) for p in [300,360,420,480]])
    return table('Moving time at a constant easy pace. Stops add to elapsed time.', ['Distance','5:00/km','6:00/km','7:00/km','8:00/km'],rows,'Long-run distance and duration comparison')

def yasso_table():
    rows=[]
    for s in [180,210,240,270,300]:
        rows.append([clock(s),clock(s/.8)+'/km',clock(s/.8*1.609344)+'/mile',clock(s*19),clock(s*19+1500)])
    return table('Ten 800 m repetitions, nine equal-time recoveries; optional final recovery excluded.', ['800 m time','Rep pace /km','Rep pace /mile','Main set','With 15 + 10 min easy'],rows,'Yasso workout duration table')

GUIDES = [
 dict(slug='marathon-pacers', title='Marathon Pacers: Choosing a Pace Group & Timing It Right',
      h1='Marathon pacers: should you follow a pace group?',eyebrow='Running with a pace group',
      description='Choose a marathon pace group, check chip-time assumptions and aid-station plans, and calculate what catching a pacer would cost. Includes a printable checklist.'),
 dict(slug='half-marathon-pacing-strategy',title='Half-Marathon Pacing Strategy: Splits & Race-Plan Calculator',
      h1='Half-marathon pacing: build your plan from start to finish',eyebrow='Plan the 21.1 km',
      description='Build a half-marathon pacing plan with 5K checkpoints, an editable controlled-start calculator and lessons from recorded Run Melbourne splits.', tables={'HALF_TABLE':half_table()}),
 dict(slug='yasso-800s',title='Yasso 800s Calculator: Session Time & Prediction Limits',
      h1='Yasso 800s: calculate the workout and question the prediction',eyebrow='Track-session arithmetic',
      description='Calculate Yasso 800 rep pace, recovery time and the full session. See why ten fast intervals cannot establish your marathon pace, with worked examples.',tables={'YASSO_TABLE':yasso_table()}),
 dict(slug='carb-loading-calculator',title='Carb-Loading Calculator & Editable Meal-Planning Worksheet',
      h1='Carb-loading calculator: turn a daily target into a food plan',eyebrow='Before the starting line',
      description='Calculate a daily carb-loading target from kg or lb, build a food-label worksheet, and compare planned with recorded carbohydrate. Sources and serving examples included.'),
 dict(slug='longest-run-before-marathon',title='Longest Run Before a Marathon: 20 Miles or Three Hours?',
      h1='20 miles or three hours? Choosing your longest marathon run',eyebrow='Distance, duration and the rest of the week',
      description='Compare 24–32 km long runs by time on feet, share of weekly mileage and recent distance. Use the worksheet and research to choose a manageable rehearsal.',tables={'LONG_TABLE':long_table()}),
]
for guide in GUIDES:
    guide.update(collection='researched-guides',extra_css=['/assets/researched-guides.css?v=20261025a'],tool_script='/assets/researched-guides.js?v=20261025a')

if __name__ == '__main__':
    for guide in GUIDES: build(guide)
