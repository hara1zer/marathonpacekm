"""Rebuild original half-marathon figures from the published transcription."""
from pathlib import Path
from html import escape
import json

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'assets'/'original'
D=json.loads((OUT/'half-marathon-2025-2026-data.json').read_text())
INK='#152d27'; MUTED='#496258'; GREEN='#174f40'; AMBER='#965000'; GRID='#d5e1d9'
def text(x,y,s,size=16,color=INK,anchor='start',bold=False):
 return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" text-anchor="{anchor}"'+(' font-weight="bold"' if bold else '')+'>'+escape(str(s))+'</text>'
def line(x1,y1,x2,y2,color=GRID,width=1):return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"/>'
def dot(x,y,color):return f'<circle cx="{x}" cy="{y}" r="4.5" fill="{color}"/>'
def pace(v):
 v=round(v,1);return f'{int(v//60)}:{v%60:04.1f}'
def svg(name,h,title,desc,parts):
 s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 {h}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><rect width="720" height="{h}" rx="12" fill="#f6f8f3"/><g font-family="Arial, Helvetica, sans-serif">'+''.join(parts)+'</g></svg>\n'
 (OUT/name).write_text(s)

parts=[text(28,38,'Two half marathons: recorded kilometre pace',24,bold=True),text(28,67,'2025: late fade',16,AMBER,bold=True),text(295,67,'2026: stronger finish',16,GREEN,bold=True)]
left,right,top,bottom=76,680,110,400
def x(k):return left+(k-1)*(right-left)/20
def y(s):return top+(s-285)*(bottom-top)/135
for sec in [300,330,360,390,420]:
 yy=y(sec);parts += [line(left,yy,right,yy),text(left-12,yy+5,f'{sec//60}:{sec%60:02}',14,MUTED,'end')]
for k in [1,5,10,15,20,21]:parts += [text(x(k),429,k,14,MUTED,'middle')]
parts += [text(378,455,'Recorded kilometre (not exactly matched course locations)',14,MUTED,'middle')]
for year,color,dash in [('2025',AMBER,' stroke-dasharray="7 5"'),('2026',GREEN,'')]:
 vals=D[year]['pace_seconds_per_km'];pts=' '.join(f'{x(i+1):.2f},{y(v):.2f}' for i,v in enumerate(vals))
 parts.append(f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="2.4"{dash}/>')
 parts += [dot(x(i+1),y(v),color) for i,v in enumerate(vals)]
parts += [text(28,495,'Each point is one complete recorded kilometre. Faster pace is higher.',14,MUTED),text(28,521,'The 2025 activity notes GPS distance loss; partial laps are excluded.',14,MUTED),text(28,553,'2026 km 20: 4:53/km · km 21: 4:51/km',18,GREEN,bold=True)]
svg('half-marathon-kilometre-paces.svg',580,'Run Melbourne half marathons: recorded kilometre paces in 2025 and 2026','Full-kilometre paces from the two supplied activity split tables. In 2025 the first five kilometres average 5:33.4 per km and kilometres 16–20 average 6:24.2. In 2026 the corresponding averages are 5:15.4 and 5:08.6, followed by kilometre 21 at 4:51. The 2025 recording lost distance; these are not exactly matched course locations.',parts)

parts=[text(28,38,'How the first 20 recorded kilometres changed',23,bold=True),text(28,66,'Five-kilometre averages from the displayed full-kilometre splits',14,MUTED),text(28,95,'2025',16,AMBER,bold=True),text(140,95,'2026',16,GREEN,bold=True)]
for i,label in enumerate(['km 1–5','km 6–10','km 11–15','km 16–20']):
 yy=142+i*91;parts.append(text(28,yy+18,label,16,bold=True))
 for year,color,offset in [('2025',AMBER,0),('2026',GREEN,33)]:
  avg=sum(D[year]['pace_seconds_per_km'][i*5:i*5+5])/5
  xx=240+(avg-300)*3.3
  parts += [line(210,yy+offset,636,yy+offset),dot(xx,yy+offset,color),text(655,yy+offset+5,pace(avg),16,color,'end',True)]
for sec in [300,330,360,390]:
 xx=240+(sec-300)*3.3
 parts += [line(xx,476,xx,482),text(xx,502,f'{sec//60}:{sec%60:02}',14,MUTED,'middle')]
parts += [text(655,502,'min/km',14,MUTED,'end')]
parts += [text(28,540,'2025: +50.8 sec/km from the first block to the fourth',16,AMBER,bold=True),text(28,568,'2026: −6.8 sec/km from the first block to the fourth',16,GREEN,bold=True),text(28,604,'These are recorded-lap comparisons, not exact race-half splits.',14,MUTED)]
svg('half-marathon-five-kilometre-blocks.svg',632,'Five-kilometre pace averages for the 2025 and 2026 half-marathon records','2025 averages in seconds per kilometre: 333.4, 353.0, 375.8, 384.2. 2026: 315.4, 316.2, 316.6, 308.6. Each is an arithmetic mean of five displayed full-kilometre paces. GPS distance loss limits exact between-year alignment.',parts)
print('Built two original half-marathon figures from public source data.')
