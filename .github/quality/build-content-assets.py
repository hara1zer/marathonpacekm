"""Rebuild original SVG figures and checkpoint cards using only published data.

Run from any directory with Python 3. No production build step is required.
"""
from pathlib import Path
from html import escape
import json

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / 'assets' / 'original'
ASSETS.mkdir(parents=True, exist_ok=True)
DATA = {
    'source': '/blog/sydney-marathon-2026-personal-review/',
    'weekly_km': [64.5, 40.8, 64.8, 72.4, 75.3, 80.8, 27.3, 44.2, 83.9, 74.2, 54.3, 46.4],
    'week_start_2026': ['1 Jun', '8 Jun', '15 Jun', '22 Jun', '29 Jun', '6 Jul', '13 Jul', '20 Jul', '27 Jul', '3 Aug', '10 Aug', '17 Aug'],
    'runs': [5, 4, 5, 5, 5, 5, 2, 3, 5, 4, 5, 5],
    'race_km': [25, 27, 28, 29, 30, 31, 32, 33],
    'race_pace_seconds_per_km': [332, 351, 355, 362, 353, 380, 392, 410],
    'race_heart_rate_bpm': [160, 162, 164, 164, 162, 161, 162, 160],
    'long_run_early_lap_range_seconds_per_km': [316, 331],
    'long_run_final_full_laps_seconds_per_km': [388, 407],
    'limits': 'Rounded figures already published in the personal review. No kilometre 26 observation, full long-run lap series or official timing comparison is reconstructed.'
}
(ASSETS / 'sydney-2026-chart-data.json').write_text(json.dumps(DATA, indent=2)+'\n')

GREEN='#174f40'; INK='#152d27'; SOFT='#edf3e7'; MUTED='#496258'; GRID='#d5e1d9'
def text(x,y,value,size=16,fill=INK,anchor='start',weight='normal'):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}">{escape(str(value))}</text>'
def line(x1,y1,x2,y2,color=GRID,width=1,dash=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>'
def rect(x,y,w,h,color,rx=0):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{color}"/>'
def circle(x,y,r=5,color=GREEN):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}"/>'
def svg(name,w,h,title,desc,parts):
    markup=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>'+rect(0,0,w,h,'#f6f8f3',12)+'<g font-family="Arial, Helvetica, sans-serif">'+''.join(parts)+'</g></svg>\n'
    (ASSETS/name).write_text(markup)
def fmtpace(sec):
    sec=int(sec+.5); return f'{sec//60}:{sec%60:02}'
def clock(sec):
    sec=int(sec+.5); return f'{sec//3600}:{sec//60%60:02}:{sec%60:02}'

p=[text(28,38,'My final 12 full training weeks',23,weight='bold'),text(28,64,'Week starting in 2026 · distance in km · runs shown at right',14,fill=MUTED)]
for tick in range(0,91,30):
    x=120+tick*4.8
    p+=[line(x,92,x,572),text(x,594,tick,14,fill=MUTED,anchor='middle')]
for i,(week,km,runs) in enumerate(zip(DATA['week_start_2026'],DATA['weekly_km'],DATA['runs'])):
    y=100+i*39
    p+=[text(102,y+19,week,16,anchor='end'),rect(120,y,round(km*4.8,2),27,GREEN,3),text(130+km*4.8,y+19,f'{km:.1f}',15),text(610,y+19,f'{runs} runs',14,fill=MUTED,anchor='end')]
p+=[text(28,632,'Peak: 83.9 km · Full-log average: 60.7 km/week',16,weight='bold'),text(28,656,'Bars use published rounded totals; average uses the original full log.',13,fill=MUTED)]
svg('sydney-training-weeks.svg',640,682,'Sydney 2026: twelve complete training weeks','All twelve published weekly totals, from 64.5 km on 1 June to 46.4 km on 17 August. Peak 83.9 km. Full-log average 60.7 km. The original review retains the data table.',p)

p=[text(28,38,'Selected Sydney race kilometres',23,weight='bold'),text(28,64,'Recorded watch splits · slower pace is higher on the first panel',14,fill=MUTED)]
xs=[85+(k-25)*62 for k in DATA['race_km']]
for sec in [330,360,390,420]:
    y=275-(sec-330)*1.6
    p+=[line(70,y,600,y),text(60,y+5,fmtpace(sec),14,fill=MUTED,anchor='end')]
p.append(text(28,94,'Pace (min/km)',16,weight='bold'))
for x,k,sec in zip(xs,DATA['race_km'],DATA['race_pace_seconds_per_km']):
    y=275-(sec-330)*1.6
    p+=[circle(x,y),text(x,y-12,fmtpace(sec),14,anchor='middle'),text(x,303,k,14,anchor='middle')]
p.append(text(28,344,'Average heart rate (bpm)',16,weight='bold'))
for hr in [158,160,162,164,166]:
    y=485-(hr-158)*13
    p+=[line(70,y,600,y),text(60,y+5,hr,14,fill=MUTED,anchor='end')]
for x,k,hr in zip(xs,DATA['race_km'],DATA['race_heart_rate_bpm']):
    y=485-(hr-158)*13
    p+=[circle(x,y),text(x,y-12,hr,14,anchor='middle'),text(x,513,k,14,anchor='middle')]
p+=[text(320,543,'Recorded kilometre',15,fill=MUTED,anchor='middle'),text(28,577,'No point for km 26; no values inferred between observations.',13,fill=MUTED),text(28,601,'Walking began around 31–32 km in my recollection.',14,fill=MUTED)]
svg('sydney-selected-race-splits.svg',640,628,'Sydney 2026: selected pace and heart-rate splits','Pace slows from 5:32 at kilometre 25 to 6:50 at kilometre 33 while recorded heart rate stays between 160 and 164 bpm. Kilometre 26 is not available. Separate panels show the two units; points are not interpolated.',p)

p=[text(28,38,'The finish of my 32 km rehearsal',23,weight='bold'),text(28,64,'9 August 2026 · average pace within recorded 2 km laps',14,fill=MUTED)]
for sec in [300,330,360,390,420]:
    x=230+(sec-300)*2.9
    p+=[line(x,100,x,270),text(x,297,fmtpace(sec),14,fill=MUTED,anchor='middle')]
for y,label in [(128,'First 10 km: lap range'),(192,'Penultimate full lap'),(250,'Final full lap')]:
    p.append(text(215,y+5,label,14,anchor='end'))
a,b=DATA['long_run_early_lap_range_seconds_per_km']
x1=230+(a-300)*2.9; x2=230+(b-300)*2.9
p+=[line(x1,128,x2,128,GREEN,12),text((x1+x2)/2,108,'5:16–5:31/km',14,anchor='middle',weight='bold')]
for y,sec in zip([192,250],DATA['long_run_final_full_laps_seconds_per_km']):
    x=230+(sec-300)*2.9
    p+=[circle(x,y,6),text(x,y-15,fmtpace(sec)+'/km',14,anchor='middle',weight='bold')]
p+=[text(28,340,'Early range and final two full laps only; not the complete lap trace.',13,fill=MUTED),text(28,366,'Completing the distance and finishing in control are different checks.',14,weight='bold')]
svg('sydney-long-run-lap-comparison.svg',640,393,'32 km rehearsal: early lap range and final two full laps','First ten kilometres had recorded two-kilometre laps at 5:16–5:31 per km. The final two full laps averaged 6:28 and 6:47 per km. The missing intervening laps are not reconstructed.',p)

for minutes in [180,195,210,225,240,270,300,239]:
    target=14399 if minutes==239 else minutes*60
    label='3:59:59' if minutes==239 else f'{minutes//60}:{minutes%60:02}'
    slug='sub-4' if minutes==239 else label.replace(':','-')
    p=[rect(0,0,480,122,GREEN),text(26,42,'MARATHON PACE KM',16,fill='#dbf397',weight='bold'),text(26,83,label+'  ·  even checkpoints',27,fill='white',weight='bold'),text(26,110,fmtpace(target/42.195)+'/km rounded label · elapsed time includes pauses',13,fill='white')]
    for i,(distance,name) in enumerate([(5,'5 km'),(10,'10 km'),(21.0975,'Halfway'),(30,'30 km'),(40,'40 km'),(42.195,'Finish')]):
        y=154+i*58
        p+=[rect(20,y-18,440,44,SOFT if i%2==0 else '#f6f8f3',6),text(34,y+11,name,20),text(443,y+11,clock(target*distance/42.195),23,anchor='end',weight='bold')]
    p+=[text(26,525,'42.195 km · exact average before checkpoint rounding',13,fill=MUTED),text(26,550,'Reference card; use the generator for a fitted wrist band.',13,fill=MUTED)]
    svg(f'checkpoint-{slug}.svg',480,574,f'{label} marathon checkpoint card',f'Even elapsed checkpoints for a {label} marathon over 42.195 km, with full precision before rounding. Includes pauses. Not a fitted wrist band.',p)
print('Built 3 original figures, 8 checkpoint cards and public source data.')
