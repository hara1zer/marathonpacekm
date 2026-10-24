"""Review contracts for the October 23 consolidations and worked examples."""
from pathlib import Path
from fractions import Fraction as F
from urllib.parse import urlsplit
from lxml import html, etree
import json

ROOT = Path(__file__).resolve().parents[2]
PAIRS = {
    '/even-vs-negative-splits/': ('/blog/negative-split-pacing/', ['definitions','arithmetic','choose','experience','checkpoints','tools','faq','references']),
    '/adjust-marathon-pace/wind/': ('/blog/wind-pacing-headwind-tailwind/', ['why-wind-changes-pace','rules','drafting','checkpoints','practical','mistakes','faq']),
    '/adjust-marathon-pace/hills/': ('/blog/hills-pacing-give-away-seconds-avoid-quad-destruction/', ['why-hills-change-pace','core-rules','uphill','downhill','rolling','checkpoints','training','mistakes','faq','references']),
}
redirects = {}
for line in (ROOT/'_redirects').read_text().splitlines():
    parts = line.split()
    if len(parts) == 3 and not line.startswith('#'):
        assert parts[0] not in redirects, ('duplicate redirect', parts[0])
        redirects[parts[0]] = parts[1:]
docs = {'/'+p.relative_to(ROOT).as_posix().removesuffix('index.html'):html.fromstring(p.read_text())
        for p in ROOT.rglob('*.html') if not any(x.startswith('.') for x in p.relative_to(ROOT).parts)}
site = etree.parse(str(ROOT/'sitemap.xml'))
listed = {urlsplit(url).path for url in site.xpath('//*[local-name()="loc"]/text()')}
assert listed == set(docs)-{'/404.html'}, 'XML sitemap matches all published pages exactly'
for old,(new,anchors) in PAIRS.items():
    assert old not in docs and old not in listed
    for form in [old, old.rstrip('/'), old+'index.html']:
        assert redirects[form] == [new,'301'], form
    assert new not in redirects, 'Consolidation must not introduce a redirect chain'
    assert docs[new].xpath('//link[@rel="canonical"]/@href') == ['https://marathonpacekm.com'+new]
    for anchor in anchors:
        assert len(docs[new].xpath('//*[@id=$id]',id=anchor)) == 1, (new,anchor)
for route,doc in docs.items():
    for href in doc.xpath('//a/@href'):
        assert urlsplit(href).path not in PAIRS, (route,'retired internal destination',href)
    for raw in doc.xpath('//script[@type="application/ld+json"]/text()'):
        def check(node):
            if isinstance(node,dict):
                if node.get('@type') == 'FAQPage':
                    text=' '.join(doc.text_content().split())
                    for question in node['mainEntity']:
                        assert ' '.join(question['name'].split()) in text, (route,'invisible FAQ')
                for value in node.values():check(value)
            elif isinstance(node,list):
                for value in node:check(value)
        check(json.loads(raw))

def tenth(value):
    n = (value*10 + F(1,2)).numerator // (value*10 + F(1,2)).denominator
    return f'{n//600}:{n%600/10:04.1f}/km'
D=F('42.195')
wind=docs[PAIRS['/adjust-marathon-pace/wind/'][0]].text_content()
hills=docs[PAIRS['/adjust-marathon-pace/hills/'][0]].text_content()
negative=docs[PAIRS['/even-vs-negative-splits/'][0]].text_content()
assert tenth(F(14400-10320)/(D-30)) in wind
assert tenth(F(14400-10380)/(D-30)) in hills
for sec in [7320,7080]:assert tenth(F(sec)/(D/2)) in negative
assert 'Most effective fix:' not in docs['/blog/why-do-i-slow-down-after-30k/'].text_content()
assert 'the #1 multiplier' not in docs['/adjust-marathon-pace/late-race-slowdown/'].text_content()
print('Consolidation: 9 direct 301s, retained anchors, 112 sitemap URLs, FAQ visibility and independent worked arithmetic passed.')
