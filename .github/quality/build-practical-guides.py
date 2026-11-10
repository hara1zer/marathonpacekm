"""Build the five individually written guides. No production build dependency.

Bodies live in practical-guides/*.body.html; this script supplies shared chrome,
Article/Breadcrumb metadata and reproducible reference tables. It does not alter
existing articles, their metadata or their historical dates.
"""
from pathlib import Path
from html import escape
from lxml import html
import json
import re
from datetime import date
from site_navigation import apply_navigation

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
DOMAIN = 'https://marathonpacekm.com'
DATE = '2026-10-25'
GUIDES = [
    dict(slug='treadmill-pace-chart', modified='2026-11-10', title='Treadmill Pace Chart: km/h, mph, min/km & min/mile',
         h1='Treadmill pace chart: km/h, mph, min/km and min/mile',
         description='Convert treadmill speed to pace in km/h, mph, min/km and min/mile. Use the interactive converter, printable chart and a checked whole-workout example.'),
    dict(slug='how-long-to-train-for-a-marathon', modified='2026-11-10', title='How Long to Train for a Marathon? 12, 16 or 20 Weeks',
         h1='How long does it take to train for a marathon?',
         description='Compare 12-, 16- and 20-week marathon blocks, calculate start dates, check the opening workload and budget training time around the running you already do.'),
    dict(slug='run-walk-marathon-pacing', modified='2026-11-10', title='Run-Walk Pace Calculator: Marathon Intervals & Stops',
         h1='Run-walk pace calculator and marathon pacing guide',
         description='Calculate the running pace for your marathon run-walk intervals, walking pace and stops. Compare ratios and partial final intervals with worked examples.', extra_css=['/assets/pace-guides.css?v=20261104a'],
         extra_scripts=['/assets/run-walk.js?v=20261104a']),
    dict(slug='marathon-taper', modified='2026-11-10', title='Marathon Taper: 2- and 3-Week Mileage Worksheet',
         h1='Marathon taper: compare two- and three-week mileage',
         description='Compare two- and three-week marathon tapers with editable mileage percentages, a checked daily example and race distance shown separately from training.'),
    dict(slug='strength-training-for-marathon-runners', modified='2026-11-10', title='Strength Training for Marathon Runners: Two 30-Min Sessions',
         h1='Strength training for marathon runners: two short gym sessions',
         description='Two printable 30-minute strength sessions for marathon runners, with exercise alternatives, sets, reps, progression and placement around your running week.'),
]

def pace(value):
    s = int(value + .5)
    return f'{s//60}:{s%60:02}'

def treadmill_table():
    rows = []
    for v in [6,7,8,8.5,9,9.5,10,10.5,11,11.5,12,12.5,13,13.5,14,15,16,17,18,19,20]:
        rows.append(f'<tr><th scope="row">{v:g}</th><td>{v/1.609344:.2f}</td><td>{pace(3600/v)}</td><td>{pace(3600*1.609344/v)}</td></tr>')
    return '<div class="table-scroll table-wide" tabindex="0" role="region" aria-label="Treadmill speed and pace in metric and mile units"><table><caption>Treadmill belt-speed conversions; pace rounded to the nearest second</caption><thead><tr><th scope="col">km/h</th><th scope="col">mph</th><th scope="col">min/km</th><th scope="col">min/mile</th></tr></thead><tbody>' + ''.join(rows) + '</tbody></table></div>'

def build(guide):
    slug = guide['slug']
    route = guide.get('route', '/blog/' + slug + '/')
    published = guide.get('published', DATE)
    modified = guide.get('modified', published)
    published_date = date.fromisoformat(published)
    published_label = f'{published_date.day} {published_date:%B %Y}'
    update_label = ''
    if modified != published:
        updated = date.fromisoformat(modified)
        update_label = f' · Updated <time datetime="{modified}">{updated.day} {updated:%B %Y}</time>'
    body = (HERE/guide.get('collection', 'practical-guides')/f'{slug}.body.html').read_text().replace('{{TREADMILL_TABLE}}', treadmill_table())
    for token, value in guide.get('tables', {}).items():
        body = body.replace('{{' + token + '}}', value)
    body = body.replace('<form ', '<form hidden ')
    doc = html.fragment_fromstring(body, create_parent='div')
    for script in doc.xpath('.//script|.//style'): script.drop_tree()
    words = len(re.findall(r"\b[\w’'-]+\b", doc.text_content()))
    sources = list(dict.fromkeys(doc.xpath('.//a[starts-with(@href,"https://")]/@href')))
    og = DOMAIN + '/assets/og/' + slug + '.png'
    article = {'@type':'Article', '@id':DOMAIN+route+'#article', 'headline':guide['h1'],
        'description':guide['description'], 'image':{'@type':'ImageObject','url':og,'width':1200,'height':630},
        'author':{'@type':'Person','name':'Davin Pinto','url':DOMAIN+'/about/#author'},
        'publisher':{'@type':'Organization','name':'Marathon Pace KM','url':DOMAIN+'/'},
        'mainEntityOfPage':{'@type':'WebPage','@id':DOMAIN+route},
        'datePublished':published, 'dateModified':modified, 'inLanguage':'en-AU', 'wordCount':words, 'citation':sources}
    data = {'@context':'https://schema.org','@graph':[article]}
    extra_css = ''.join(f'<link rel="stylesheet" href="{escape(url, quote=True)}">\n' for url in guide.get('extra_css', []))
    tool_script = guide.get('tool_script', '/assets/practical-guides.js?v=20261104a')
    extra_scripts = ''.join(f'<script defer src="{escape(url, quote=True)}"></script>\n' for url in guide.get('extra_scripts', []))
    source = f'''<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(guide['title'])}</title>
<meta name="description" content="{escape(guide['description'], quote=True)}">
<meta name="author" content="Davin Pinto">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="{DOMAIN+route}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Marathon Pace KM">
<meta property="og:title" content="{escape(guide['title'], quote=True)}">
<meta property="og:description" content="{escape(guide['description'], quote=True)}">
<meta property="og:url" content="{DOMAIN+route}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{escape(guide['h1'], quote=True)} — Marathon Pace KM reference guide">
<meta property="og:locale" content="en_AU">
<meta property="article:published_time" content="{published}">
<meta property="article:modified_time" content="{modified}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{escape(guide['title'], quote=True)}">
<meta name="twitter:description" content="{escape(guide['description'], quote=True)}">
<meta name="twitter:image" content="{og}">
<meta name="theme-color" content="#174f40">
<link rel="icon" href="/favicon.svg?v=20260922" type="image/svg+xml">
<link rel="stylesheet" href="/assets/site.css?v=20261017-nav">
<link rel="stylesheet" href="/assets/practical-guides.css?v=20261025a">
{extra_css}<meta name="google-adsense-account" content="ca-pub-5455873308344668">
<script type="application/ld+json">{json.dumps(data, ensure_ascii=False, indent=2)}</script>
<script defer src="/assets/site-telemetry.js?v=20261104-reference"></script>
<script defer src="{escape(tool_script, quote=True)}"></script>
{extra_scripts}
</head>
<body class="mpkm-legacy mpkm-reading practical-guide">
<main id="content" class="content-wrap"><article>
<header class="post-header"><h1>{escape(guide['h1'])}</h1></header>
<p class="byline">By <a href="/about/#author" rel="author">Davin Pinto</a> · Published <time datetime="{published}">{published_label}</time>{update_label}</p>
{body}
<aside class="guide-footer"><p><a href="/about/#author">About the author</a> · <a href="/editorial-policy/">How we use research and software</a> · <a href="/contact/">Report a correction</a></p></aside>
</article></main>
</body></html>
'''
    source = apply_navigation(source, route)
    folder = ROOT/route.strip('/')
    folder.mkdir(parents=True, exist_ok=True)
    (folder/'index.html').write_text(source)
    print(f'{route}: {words} words; {len(sources)} primary sources')

if __name__ == '__main__':
    for guide in GUIDES: build(guide)
