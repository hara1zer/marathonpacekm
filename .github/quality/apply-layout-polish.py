"""Apply shared layout classes and navigation without rewriting runtime scripts.

Run from the repository root. Uses lxml for table inspection, like the editorial
checks. The native details menu works without JavaScript. This is idempotent.
"""
from pathlib import Path
from lxml import html
import html as escaping
import re

ROOT = Path(__file__).resolve().parents[2]
VERSION = '20261002'
from site_navigation import sync_all

def summary_table(match):
    source = match[0]
    table = html.fromstring(source)
    heads = table.xpath('./thead/tr/th')
    rows = table.xpath('./tbody/tr')
    if not (2 <= len(heads) <= 3 and 1 <= len(rows) <= 5):
        return source
    if table.xpath('.//*[@colspan or @rowspan]|.//input|.//button'):
        return source
    if any(len(row.xpath('./th|./td')) != len(heads) for row in rows):
        return source
    labels = [' '.join(head.text_content().split()) for head in heads]
    if 'mpkm-summary-table' in (table.get('class') or ''):
        return source
    source = re.sub(r'<table\b([^>]*)>', lambda m: (
        '<table' + re.sub(r'class="([^"]*)"', r'class="\1 mpkm-summary-table"', m[1]) + ' role="table">'
        if 'class="' in m[1] else '<table' + m[1] + ' class="mpkm-summary-table" role="table">'), source, count=1)
    def row_labels(m):
        index = 0
        def cell(c):
            nonlocal index
            label = escaping.escape(labels[index % len(labels)], quote=True)
            index += 1
            role = 'rowheader' if c[1] == 'th' else 'cell'
            return '<' + c[1] + c[2] + f' data-label="{label}" role="{role}">'
        return re.sub(r'<(th|td)\b([^>]*)>', cell, m[0])
    source = re.sub(r'<tbody\b[^>]*>.*?</tbody>', row_labels, source, count=1, flags=re.S)
    source = re.sub(r'<tr(\s[^>]*)?>', lambda m: '<tr' + (m[1] or '') + ' role="row">', source)
    source = re.sub(r'<(thead|tbody)>', r'<\1 role="rowgroup">', source)
    source = re.sub(r'(<thead\b[^>]*>.*?</thead>)', lambda m: m[0].replace('scope="col"', 'scope="col" role="columnheader"'), source, flags=re.S)
    return source

counts = {'reading': 0, 'tool': 0, 'index': 0, 'stacked_tables': 0}
STORIES = [
    ('run-melbourne-half-marathon-2025-vs-2026', 'Race comparison', 'Two half marathons. A stronger finish.'),
    ('sydney-marathon-2026-personal-review', 'Race review', 'What Sydney taught me about sub-four'),
    ('rebuilding-after-sydney-marathon', 'Training intentions', 'Preparing for a stronger next marathon'),
    ('marathon-fueling-experiments', 'Fueling experience', 'My homemade and commercial gel experiments'),
]

def story_cards(home=False):
    cards = []
    for slug, kind, short_title in STORIES:
        doc = html.fromstring((ROOT / 'blog' / slug / 'index.html').read_text())
        title = short_title if home else doc.xpath('//h1')[0].text_content()
        description = doc.xpath('//meta[@name="description"]/@content')[0]
        route = '/blog/' + slug + '/'
        cards.append('<article class="mpkm-story-card"><span class="mpkm-story-kind">' + kind +
                     '</span><h3><a href="' + route + '">' + escaping.escape(title) + '</a></h3><p>' +
                     escaping.escape(description) + '</p>' +
                     ('<a class="mpkm-story-link" href="' + route + '">Read the story <span aria-hidden="true">→</span></a>' if home else '') + '</article>')
    return '<div class="mpkm-story-grid">' + ''.join(cards) + '</div>'

for path in sorted(ROOT.rglob('*.html')):
    if any(part.startswith('.') for part in path.relative_to(ROOT).parts):
        continue
    source = path.read_text()
    rel = str(path.relative_to(ROOT))
    is_tool = bool(re.search(r'<(?:input|select|textarea|iframe)\b', source)) or rel == 'monthly-training-plan/index.html'
    kind = 'index' if rel in ('blog/index.html', 'sitemap/index.html') else ('tool' if is_tool else 'reading')
    counts[kind] += 1
    def body(m):
        tag = re.sub(r'\smpkm-(?:reading|tool|index)\b', '', m[0])
        if 'class="' in tag:
            return re.sub(r'class="([^"]*)"', lambda c: 'class="' + c[1] + ' mpkm-' + kind + '"', tag, count=1)
        return tag[:-1] + f' class="mpkm-{kind}">'
    source = re.sub(r'<body\b[^>]*>', body, source, count=1)
    if rel == 'blog/index.html' and 'mpkm-story-grid' not in source:
        hub = '<section class="mpkm-story-hub" id="personal-experience"><p class="eyebrow">From my own running</p><h2>My races and lessons</h2>' + story_cards() + '</section>'
        source, hits = re.subn(r'<section\b[^>]*id="personal-experience"[^>]*>.*?</section>', hub, source, count=1, flags=re.S)
        if hits != 1:
            raise ValueError('Cannot locate personal stories hub')
    if rel == 'index.html' and 'mpkm-story-grid' not in source:
        source, hits = re.subn(r'<section\b[^>]*id="runner-story"[^>]*>.*?</section>', '', source, count=1, flags=re.S)
        if hits != 1:
            raise ValueError('Cannot locate homepage stories')
        source = re.sub(r'<section class="section"><h2>What I want to change next</h2>.*?</section>', '', source, count=1, flags=re.S)
        hub = '<section class="section" id="runner-story"><span class="eyebrow">From my own running</span><h2 style="margin-top:8px">Lessons from my races and training</h2><p style="margin-top:12px">Recorded race data, personal experience and what I want to improve next.</p>' + story_cards(home=True) + '</section>\n'
        source, hits = re.subn(r'(<section\b[^>]*id="guides"[^>]*>)', lambda m: hub + m[1], source, count=1)
        if hits != 1:
            raise ValueError('Cannot locate homepage guides')
    if '/assets/layout.css' not in source and '/assets/site.css' not in source:
        source = source.replace('</head>', f'<link rel="stylesheet" href="/assets/layout.css?v={VERSION}">\n</head>', 1)
    if kind == 'reading':
        before = source.count('mpkm-summary-table')
        source = re.sub(r'<table\b[^>]*>.*?</table>', summary_table, source, flags=re.S)
        counts['stacked_tables'] += source.count('mpkm-summary-table') - before
        source = re.sub(r'(<div\b[^>]*class=")([^"]*)("[^>]*>\s*<table\b[^>]*mpkm-summary-table)',
                        lambda m: m[1] + m[2] + (' mpkm-summary-scroll' if 'mpkm-summary-scroll' not in m[2] else '') + m[3], source)
        source = re.sub(r'(<p class=")table-hint("[^>]*>.*?</p>\s*<div\b[^>]*mpkm-summary-scroll)',
                        r'\1table-hint mpkm-stack-hint\2', source, flags=re.S)
    if source != path.read_text():
        path.write_text(source)
print(counts)

sync_all()
