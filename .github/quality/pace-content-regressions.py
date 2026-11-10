"""Check source-derived references, metadata, assets and consolidation boundaries."""
from pathlib import Path
from fractions import Fraction as F
from urllib.parse import urlsplit
import json
from lxml import html

ROOT=Path(__file__).resolve().parents[2]
NEW=['/half-marathon-pace-chart/','/blog/400m-pace-chart/','/blog/half-marathon-taper/','/blog/easy-run-pace/']
def doc(route):return html.fromstring((ROOT/route.lstrip('/')/'index.html').read_text())
def round_second(v):return (v.numerator*2+v.denominator)//(2*v.denominator)
def clock(v):
 n=round_second(v);return f'{n//3600}:{n//60%60:02}:{n%60:02}'
def pace(v):
 n=round_second(v);return f'{n//60}:{n%60:02}'
def seconds(text):
 values=list(map(int,text.split(':')))
 return sum(n*60**i for i,n in enumerate(reversed(values)))
for route in NEW:
 d=doc(route)
 assert len(d.xpath('//h1'))==1,route
 assert d.xpath('//link[@rel="canonical"]/@href')==['https://marathonpacekm.com'+route]
 articles=[]
 def collect(n):
  if isinstance(n,dict):
   if n.get('@type')=='Article':articles.append(n)
   for v in n.values():collect(v)
  elif isinstance(n,list):
   for v in n:collect(v)
 for script in d.xpath('//script[@type="application/ld+json"]/text()'):collect(json.loads(script))
 assert len(articles)==1
 a=articles[0]
 assert a['headline']==d.xpath('string(//h1)')
 assert a['description']==d.xpath('//meta[@name="description"]/@content')[0]
 assert a['datePublished']=='2026-11-04'
 assert a['dateModified']=='2026-11-10'
 assert d.xpath('//meta[@property="article:modified_time"]/@content')==[a['dateModified']]
 assert d.xpath('//meta[@property="article:published_time"]/@content')==['2026-11-04']
 assert len(d.xpath('//p[@class="byline"]'))==1
 assert '{{' not in d.xpath('string(//main)')
 for url in d.xpath('//meta[@property="og:image"]/@content'):
  assert (ROOT/urlsplit(url).path.lstrip('/')).is_file(),url
 for value in d.xpath('//script[@src]/@src|//link[@rel="stylesheet"]/@href'):
  assert (ROOT/urlsplit(value).path.lstrip('/')).is_file(),value

half=doc(NEW[0]);rows=half.xpath('//*[@id="chart"]//tbody/tr')
assert len(rows)==28
for row,minute in zip(rows,range(75,211,5)):
 cells=[x.text_content() for x in row]
 total=F(minute*60);p=total/F('21.0975')
 assert cells==[clock(total),pace(p),pace(p*F('1.609344'))]+[clock(total*d/F('21.0975')) for d in [5,10,15,20]],cells
track=doc(NEW[1]);rows=track.xpath('//*[@id="chart"]//tbody/tr')
assert len(rows)==21
for row,p in zip(rows,range(180,481,15)):
 cells=[x.text_content() for x in row]
 assert cells==[pace(F(p)),pace(F(p)*F('1.609344'))]+[pace(F(p*m,1000)) for m in [200,400,800,1000,1600]],cells
assert '39:30' in track.text_content() and '19:30' in track.text_content()
guide=doc('/blog/run-walk-marathon-pacing/')
assert len(guide.xpath('//*[@id="run-walk-form"]'))==1
assert guide.xpath('//*[@id="h"]/@value')==['5']
assert guide.xpath('//*[@id="run-walk-form"]/@hidden')==['']
for route in ['/blog/run-walk-marathon-pacing/','/5-00-marathon-pace-km/']:
 assert doc(route).xpath('//script[@src="/assets/run-walk.js?v=20261104a"]')
assert '6:46.2 / km' in guide.text_content()
hard=doc('/blog/why-marathon-pace-feels-harder-some-days/')
assert 'one session is noise, three sessions is a trend' not in hard.text_content().lower()
late=doc('/blog/why-do-i-slow-down-after-30k/')
for change in [10,20,30]:assert pace(F('12.195')*change) in late.text_content()
for p in ROOT.rglob('*.html'):
 if any(x.startswith('.') for x in p.relative_to(ROOT).parts):continue
 s=p.read_text()
 assert '/assets/site-telemetry.js?v=20261008-audit' not in s,p
 assert '/assets/run-walk.js?v=20261004' not in s,p
assert (ROOT/'assets/original/pace-band-field-test-record.csv').read_text().count('\n')==2
print('Pace content: four route/schema contracts, all 28 half-chart rows, 21 track rows, shared run-walk integration, asset versions and consolidation arithmetic passed.')
