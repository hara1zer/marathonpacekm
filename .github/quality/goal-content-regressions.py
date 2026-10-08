"""Development-only content/compatibility checks; no percentage-uniqueness target."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote
from fractions import Fraction as F
import re, json, hashlib

ROOT = Path(__file__).resolve().parents[2]
BASE = json.loads((ROOT / '.github/quality/goal-page-baseline.json').read_text())
class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.links=[]; self.text=[]; self.hidden=0
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if tag in ['script','style']: self.hidden+=1
    def handle_endtag(self, tag):
        if tag in ['script','style']: self.hidden-=1
    def handle_data(self, data):
        if not self.hidden: self.text.append(data)
def parse(source):
    doc=Document(); doc.feed(source); return doc
def digest(source): return hashlib.sha256(source.encode()).hexdigest()
docs={p.relative_to(ROOT).as_posix():parse(p.read_text()) for p in ROOT.rglob('*.html') if '.git' not in p.parts}
assert len(BASE)==20
for slug, before in BASE.items():
    source=(ROOT/slug/'index.html').read_text(); doc=docs[slug+'/index.html']
    for key, original in before['seo'].items(): assert original in source, (slug, key, 'SEO contract changed')
    assert len(doc.ids)==len(set(doc.ids)), (slug, 'duplicate IDs')
    assert set(before['ids'])<=set(doc.ids), (slug, 'historical anchors removed')
    controls=re.findall(r'<(?:input|select|option|button)\b[^>]*>',source)
    assert digest('\n'.join(controls))==before['controls'], (slug, 'input/default/control contract changed')
    scripts=re.findall(r'<script\b(?![^>]*application/ld\+json)[^>]*>.*?</script>',source,re.S)
    if before['addedBandScript']:
        assert scripts.pop()=='<script defer src="/assets/goal-band-links.js?v=20261004"></script>', (slug, 'only existing goal-aware adapter may be added')
    assert len(scripts)==len(before['scripts']), (slug, 'script list changed')
    for i, script in enumerate(scripts):
        if i in before['validationScripts']:
            assert 'Number.isInteger(value)' in script and 'field.value.trim()' in script and 'clampInt' not in script, (slug, 'validation guard missing')
            remaining=re.sub(r'        const fields = \[elH, elM, elS\];.*?(?=        const distKm)','',script,flags=re.S,count=1)
            assert digest(re.sub(r'\s+',' ',remaining))==before['validationRestHashes'][str(i)], (slug, 'valid-input algorithm changed')
        else: assert digest(script)==before['scripts'][i], (slug, 'unrelated calculator/tracking script changed', i)
    def check_schema(node):
        if isinstance(node,dict):
            if node.get('@type')=='FAQPage':
                text=' '.join(doc.text)
                for item in node['mainEntity']:
                    assert item['name'] in text, (slug, 'schema question absent from visible FAQ',item['name'])
            for v in node.values(): check_schema(v)
        elif isinstance(node,list):
            for v in node: check_schema(v)
    for block in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',source,re.S):check_schema(json.loads(block))

redirects={}
for line in (ROOT/'_redirects').read_text().splitlines():
    parts=line.split()
    if len(parts)==3 and '*' not in parts[0]: redirects[parts[0]]=parts[1]
for source,doc in docs.items():
    for link in doc.links:
        url=urlsplit(urljoin('https://marathonpacekm.com/'+source,link))
        if url.scheme!='https' or url.netloc!='marathonpacekm.com':continue
        target=unquote(url.path); target=redirects.get(target,target).lstrip('/')
        if not target or target.endswith('/'):target+='index.html'
        assert (ROOT/target).exists(), (source,link,'broken internal destination')
        if url.fragment and target in docs: assert unquote(url.fragment) in docs[target].ids, (source,link,'broken anchor')

# Independently compute worked examples with rational inputs, rounding only final displays.
DIST=F('42.195')
def nearest(value): return (value.numerator*2+value.denominator)//(2*value.denominator)
def clock(sec):
    sec=nearest(sec); return f'{sec//3600}:{sec//60%60:02}:{sec%60:02}'
def pace(sec):
    tenths=nearest(sec*10); return f'{tenths//600}:{tenths%600/10:04.1f}/km'
def expect(slug, value): assert value in ' '.join(docs[slug+'-marathon-pace-km/index.html'].text), (slug, value,'calculation absent or incorrect')
expect('3-30',clock(DIST*300));expect('3-30',pace(F(3000)/F('10.1')))
for goal in [12600,12900]: expect('3-30',pace(F(goal-9048)/(DIST-30)))
expect('3-30',pace(F(12540)/DIST))
runpace=F(540)/(DIST/27-F('0.1'))
expect('4-30',pace(runpace))
# Moving time 267:20 contains 26 walks, then a 7:20 run.
expect('4-30',pace(F(14480)/(DIST-F('2.6'))))
expect('4-30',clock(F(16200)+F('0.45')*runpace))
for elapsed,goal in [(3300,13800),(3360,13800),(3360,14100)]:expect('3-50',pace(F(goal-elapsed)/(DIST-10)))
for moving in [14399,14340,14280]:expect('sub-4',pace(F(moving)/DIST));expect('sub-4',clock(F(moving+60)))
expect('sub-4',pace(F(14340-3450)/(DIST-10)))
expect('4-00',pace(F(14340)/DIST))
# All other retained decision calculations, including the full final run/walk phase.
expect('3-00',pace(F(10770)/DIST));expect('3-05',pace(F(11100)/DIST))
expect('3-10',pace(F(10020)/(DIST-5)));expect('3-15',pace(F(5790)/(DIST/2)))
expect('3-25',pace(F(3420)/(DIST-30)))
expect('3-45',clock(DIST*F(13500)/DIST-40*F(13500)/DIST))
expect('3-55',pace(F(14100)/DIST));expect('4-05',pace(F(15300)/DIST))
cycle=F(480,350)+F(120,600)
cycles=int(DIST//cycle);remainder=DIST-cycles*cycle
assert cycles==26 and remainder<F(480,350)
expect('4-15',clock(F(cycles*600)+remainder*350));expect('4-15',pace(F(600)/cycle))
expect('4-35',pace(F(4500)/(DIST-30)));expect('4-40',pace(F(16620)/DIST))
expect('4-50',pace(F(17400)/F('42.6')));expect('4-55',pace(F(18000)/DIST))
expect('5-05',str(nearest(F(18300,3600)*60))+' g')
print(f'Goal content: 20 SEO/control/anchor contracts, worked calculations, FAQ schema and {len(docs)}-page internal links passed.')
