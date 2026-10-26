"""One source for committed, crawlable navigation. No production build/runtime dependency."""
from pathlib import Path
from html import escape, unescape
from urllib.parse import urlsplit
import json
import re

ROOT = Path(__file__).resolve().parents[2]
VERSION = '20261017-nav'
DOMAIN = 'https://marathonpacekm.com'
GROUPS = [
    ('calculators', 'Calculators', '/#start-here', [
        ('/marathon-pace-calculator/', 'Pace calculator'),
        ('/marathon-time-predictor/', 'Marathon time predictor'),
        ('/marathon-fueling-calculator/', 'Fueling calculator'),
        ('/race-conditions-pace-adjuster/', 'Race conditions pace adjuster'),
        ('/sub-threshold-pace-calculator/', 'Sub-threshold pace calculator'),
    ]),
    ('training', 'Training', '/blog/#training', [
        ('/monthly-training-plan/', 'Monthly training plan'),
        ('/blog/#training', 'Marathon training resources'),
        ('/blog/marathon-pace-workouts/', 'Marathon pace workouts'),
        ('/norwegian-singles/', 'Norwegian Singles training'),
        ('/melbourne-running/', 'Melbourne tracks and paths'),
    ]),
    ('guides', 'Guides', '/blog/', [
        ('/blog/', 'All pacing and training guides'),
        ('/marathon-pacing-strategy/', 'Marathon pacing strategy'),
        ('/#pace-chart', 'Marathon goal-time guides'),
        ('/adjust-marathon-pace/', 'Adjusting pace for conditions'),
        ('/blog/#race-guides', 'Race-specific guides'),
        ('/blog/#personal-experience', 'My races and lessons'),
    ]),
]
INFO = [('/about/', 'About Davin'), ('/methodology/', 'Calculator methods'),
        ('/editorial-policy/', 'Editorial policy'), ('/contact/', 'Contact & corrections'),
        ('/privacy/', 'Privacy'), ('/disclaimer/', 'Disclaimer'), ('/sitemap/', 'All pages')]
TRAINING_ARTICLES = {'marathon-pace-workouts', 'tempo-vs-threshold-vs-marathon-pace',
    'long-run-structure-fast-finish-vs-blocks-vs-progression', 'marathon-pace-readiness-test',
    'how-to-know-if-zone-2-is-working', 'how-to-salvage-a-marathon-training-plan',
    'signal-vs-noise-marathon-training-pace', 'treadmill-pace-chart',
    'how-long-to-train-for-a-marathon', 'marathon-taper',
    'strength-training-for-marathon-runners', 'yasso-800s', 'longest-run-before-marathon'}
BRAND = '<a class="mpkm-brand" href="/" aria-label="Marathon Pace KM home"><span class="mpkm-brand-mark" aria-hidden="true"><svg width="25" height="25" viewBox="0 0 25 25" fill="none"><path d="M5 18V9a6 6 0 0 1 12 0v9M9 18V9a2 2 0 0 1 4 0v9M3 18h18M20 5v9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></span><span>Marathon Pace KM<small>A plan for every kilometre</small></span></a>'

def route_for(path):
    return '/' + path.relative_to(ROOT).as_posix().removesuffix('index.html')

def section_for(route):
    if route in ('/', '/marathon-pace-chart-min-per-mile/') or re.fullmatch(r'/(?:\d-\d\d|sub-4)-marathon-pace-km/', route):
        return 'chart'
    if route == '/printable-pace-band/':
        return 'band'
    if route in dict(GROUPS[0][3]):
        return 'calculators'
    if (route.startswith('/melbourne-running/') or 'norwegian-' in route
            or route == '/monthly-training-plan/' or route.split('/')[-2] in TRAINING_ARTICLES):
        return 'training'
    return 'guides' if route.startswith(('/blog/', '/adjust-marathon-pace/')) or route in (
        '/marathon-pacing-strategy/', '/how-to-use-marathon-pace-chart/', '/even-vs-negative-splits/') else ''

def link(url, label, route, css=''):
    current = url == route  # Section anchors are not the current page.
    attrs = (f' class="{css}"' if css else '') + (' aria-current="page"' if current else '')
    return f'<a href="{escape(url, quote=True)}"{attrs}>{escape(label)}</a>'

def menu_items(route, mode):
    active = section_for(route)
    items = ['<li>' + link('/', 'Pace chart', route, 'mpkm-nav-link' + (' is-section' if active == 'chart' else '')) + '</li>']
    for key, label, parent, children in GROUPS:
        panel = f'mpkm-{mode}-{key}'
        items.append('<li class="mpkm-nav-group' + (' is-section' if active == key else '') + '">' +
            link(parent, label, route, 'mpkm-nav-parent') +
            f'<details class="mpkm-nav-disclosure" data-nav-disclosure><summary aria-label="{label} links" aria-controls="{panel}"><span class="mpkm-nav-chevron" aria-hidden="true"></span></summary>' +
            f'<ul class="mpkm-nav-panel" id="{panel}">' + ''.join('<li>' + link(url, text, route) + '</li>' for url, text in children) + '</ul></details></li>')
    items.append('<li>' + link('/printable-pace-band/', 'Pace band', route, 'mpkm-nav-cta') + '</li>')
    return '<ul class="mpkm-nav-list">' + ''.join(items) + '</ul>'

def render_header(route):
    return ('<header class="mpkm-site-header"><div class="mpkm-header-inner">' + BRAND +
        '<nav class="mpkm-main-nav" aria-label="Main navigation">' + menu_items(route, 'desktop') + '</nav>' +
        '<details class="mpkm-mobile-menu" data-nav-disclosure><summary aria-label="Site menu" aria-controls="mpkm-mobile-links">Menu <span aria-hidden="true">☰</span></summary>' +
        '<nav id="mpkm-mobile-links" aria-label="Mobile site navigation">' + menu_items(route, 'mobile') + '</nav></details></div></header>')

def render_footer(route, original=''):
    # Preserve year IDs and scripts used by existing inline page code.
    ids = re.findall(r'\bid="([^"]+)"', original)
    year = ''.join(f'<span id="{escape(i, quote=True)}">2026</span>' for i in ids) or '2026'
    scripts = ''.join(re.findall(r'<script\b[^>]*>.*?</script>', original, re.S))
    columns = [('Plan your run', [('/', 'Pace chart'), ('/#start-here', 'All calculators'),
        ('/printable-pace-band/', 'Marathon & half-marathon pace band')]),
        ('Explore', [('/blog/#training', 'Training resources'), ('/blog/', 'Pacing and race guides'),
                     ('/melbourne-running/', 'Melbourne tracks and paths')]), ('Site information', INFO)]
    return ('<footer class="mpkm-footer"><div class="mpkm-footer-inner"><div class="mpkm-footer-title">Marathon Pace KM</div><div class="mpkm-footer-grid">' +
        ''.join(f'<nav aria-label="{title}"><p class="mpkm-footer-heading">{title}</p><ul>' +
            ''.join('<li>' + link(url, text, route) + '</li>' for url, text in links) + '</ul></nav>' for title, links in columns) +
        f'</div><p>© {year} Marathon Pace KM · Practical running tools and personal race lessons.</p></div></footer>' + scripts)

def crumb_items(route, title):
    crumbs = [('/', 'Home')]
    if route.startswith('/melbourne-running/'):
        crumbs += [('/blog/#training', 'Training')]
        if route != '/melbourne-running/': crumbs += [('/melbourne-running/', 'Melbourne running')]
    elif route.startswith('/adjust-marathon-pace/'):
        crumbs += [('/blog/', 'Guides')]
        if route != '/adjust-marathon-pace/': crumbs += [('/adjust-marathon-pace/', 'Pace adjustments')]
    elif route.startswith('/blog/'):
        if route != '/blog/': crumbs += [('/blog/', 'Guides')]
    elif section_for(route) == 'calculators' or route == '/printable-pace-band/':
        crumbs += [('/#start-here', 'Calculators')]
    elif section_for(route) == 'training':
        crumbs += [('/blog/#training', 'Training')]
        if route != '/norwegian-singles/' and 'norwegian-' in route: crumbs += [('/norwegian-singles/', 'Norwegian Singles')]
    elif section_for(route) == 'chart':
        crumbs += [('/#pace-chart', 'Pace chart')]
    elif section_for(route) == 'guides':
        crumbs += [('/blog/', 'Guides')]
    crumbs.append((route, title))
    return crumbs

def render_breadcrumbs(crumbs):
    return '<nav class="mpkm-breadcrumbs" aria-label="Breadcrumb"><ol>' + ''.join(
        '<li>' + (f'<span aria-current="page">{escape(label)}</span>' if i == len(crumbs)-1 else
                  f'<a href="{escape(url, quote=True)}">{escape(label)}</a>') + '</li>' for i, (url, label) in enumerate(crumbs)) + '</ol></nav>'

def replace_breadcrumb_schema(source, crumbs):
    schema = {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i+1, 'name': label, 'item': DOMAIN+url} for i,(url,label) in enumerate(crumbs)]}
    replaced = False
    def visit(obj):
        nonlocal replaced
        if isinstance(obj, dict):
            if obj.get('@type') == 'BreadcrumbList':
                replaced = True
                return dict(obj, **schema)
            return {k: visit(v) for k,v in obj.items()}
        return [visit(v) for v in obj] if isinstance(obj, list) else obj
    def script(m):
        original = json.loads(m[2])
        updated = visit(original)
        if original == updated: return m[0]
        return m[1] + json.dumps(updated, ensure_ascii=False, indent=2).replace('</', '<\\/') + m[3]
    source = re.sub(r'(<script\b[^>]*type="application/ld\+json"[^>]*>)(.*?)(</script>)', script, source, flags=re.S)
    if not replaced and crumbs:
        source = source.replace('</head>', '<script type="application/ld+json">' +
            json.dumps(dict(schema, **{'@context': 'https://schema.org'}), ensure_ascii=False).replace('</','<\\/') + '</script>\n</head>', 1)
    return source

def apply_navigation(source, route):
    header = render_header(route)
    source, count = re.subn(r'<header\b[^>]*class="(?:mpkm-site-header|site-header)"[^>]*>.*?</header>', lambda m: header, source, count=1, flags=re.S)
    if not count:
        source = re.sub(r'(<body\b[^>]*>)', lambda m: m[1]+'\n'+header, source, count=1)
    # These template navigation strips were hidden by CSS; remove the obsolete HTML.
    source = re.sub(r'<nav\b(?![^>]*class=)[^>]*aria-label="Main navigation"[^>]*>.*?</nav>', '', source, flags=re.S)
    source = re.sub(r'<nav\b[^>]*aria-label="More site information"[^>]*>.*?</nav>', '', source, flags=re.S)
    source = re.sub(r'\s*<(nav|p|div)\b[^>]*class="[^\"]*\b(?:crumbs|breadcrumb|breadcrumbs|venue-crumbs|mpkm-breadcrumbs)\b[^\"]*"[^>]*>.*?</\1>\s*', '\n', source, flags=re.S)
    if re.search(r'<footer\b', source):
        source = re.sub(r'<footer\b[^>]*>.*?</footer>', lambda m: render_footer(route, m[0]), source, count=1, flags=re.S)
    else:
        source = source.replace('</body>', render_footer(route)+'\n</body>', 1)
    # Place the skip link before the common masthead, preserving its target and text.
    skip = re.search(r'<a\b[^>]*class="skip-link"[^>]*>.*?</a>', source, re.S)
    if skip:
        skip_html = skip[0]; source = re.sub(r'<a\b[^>]*class="skip(?:-link)?"[^>]*>.*?</a>', '', source, flags=re.S)
    else:
        main = re.search(r'<main\b[^>]*>', source)
        if not main:
            # The training planner uses a div as its content wrapper.
            source = source.replace('<div class="wrap">', '<div class="wrap" role="main" id="content">', 1)
            main = re.search(r'<div\b[^>]*role="main"[^>]*>', source)
        target = re.search(r'\bid="([^"]+)"', main[0])
        if target: target = target[1]
        else:
            target = 'content'; source = source.replace(main[0], main[0][:-1]+' id="content">', 1)
        skip_html = f'<a class="skip-link" href="#{target}">Skip to content</a>'
    source = re.sub(r'(<body\b[^>]*>)\s*', lambda m: m[1]+'\n'+skip_html+'\n', source, count=1)
    if route != '/':
        h1 = re.search(r'<h1\b[^>]*>(.*?)</h1>', source, re.S)
        title = ' '.join(unescape(re.sub(r'<[^>]+>', '', h1[1])).split())
        crumbs = crumb_items(route, title)
        source = source.replace(header, header+'\n'+render_breadcrumbs(crumbs), 1)
        if route != '/404.html': source = replace_breadcrumb_schema(source, crumbs)
    source = re.sub(r'(/assets/site\.css)(?:\?[^"\s>]*)?', r'\1?v='+VERSION, source)
    if '/assets/navigation.js' not in source:
        source = source.replace('</head>', f'<script defer src="/assets/navigation.js?v={VERSION}"></script>\n</head>', 1)
    else:
        source = re.sub(r'(/assets/navigation\.js)(?:\?[^"\s>]*)?', r'\1?v='+VERSION, source)
    return source

def sync_all(check=False):
    changed = []
    for path in sorted(ROOT.rglob('*.html')):
        if any(part.startswith('.') for part in path.relative_to(ROOT).parts): continue
        source = path.read_text()
        updated = apply_navigation(source, route_for(path))
        if updated != source:
            changed.append(path.relative_to(ROOT).as_posix())
            if not check: path.write_text(updated)
    return changed
