"""Build the complete Melbourne directory; each guide has individually written copy.

No production build step. This helper uses only the Python standard library.
The owner approved completing all 18 venue guides on 13 October 2026.
"""
from pathlib import Path
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / '.github/quality/melbourne-running'
DOMAIN = 'https://marathonpacekm.com'
DATE = '2026-10-13'
DISPLAY_DATE = '13 October 2026'
HUB = '/melbourne-running/'
VENUES = json.loads((CONTENT / 'venues.json').read_text())

from site_navigation import render_header, render_footer, apply_navigation, VERSION

PAGES = [
    {
        'slug': HUB,
        'title': 'Running Tracks and Paths in Melbourne | MarathonPaceKM',
        'description': 'Compare 12 Melbourne running tracks and 6 paths by region, access and marathon training use. Includes 400 m lap times and Tan distance options.',
        'h1': 'Running Tracks and Paths in Melbourne',
        'lede': 'Choose a measured track for repetitions or a path for time on feet. Compare the access rules and training trade-offs before you travel.',
        'eyebrow': 'Melbourne running venues',
        'internal': [(HUB + 'sprint-athletics-centre/', 'Sprint Athletics Centre guide'), (HUB + 'the-tan/', 'The Tan route guide'), ('/marathon-pace-calculator/', 'Marathon pace calculator')],
        'photos': ['An original wide photograph of The Tan, showing the shared running path.', 'An original athletics-track photograph with the lane markings visible.', 'A Bay Trail or Merri Creek photograph to show the difference from track training.'],
        'faqs': [
            ('Where can I run on a free public track in Melbourne?', 'Sprint Athletics Centre publishes free dawn-to-dusk entry outside exclusive bookings. Other venues have different club exclusions or public-session bookings; compare the access notes and follow the operator link before travelling.'),
            ('Which Melbourne route suits a marathon long run?', 'Repeated Albert Park or Tan circuits keep you returning to the same starting area. Main Yarra, Merri Creek and Bay Trail sections allow out-and-back planning. Choose the surface, interruptions and distance that fit your existing session.'),
            ('Are all athletics-track laps exactly 400 m?', 'The standard 400 m circuit describes lane one at its measurement line. Outer lanes are longer. Use the correct marked start for your chosen lane and repetition; do not apply lane-one lap times to an outer-lane full circuit.')
        ]
    },
    {
        'slug': HUB + 'sprint-athletics-centre/',
        'title': 'Sprint Athletics Centre Running Track, Craigieburn',
        'description': 'Plan a Sprint Athletics Centre session: 400 m lap times, free public access, booking exclusions, parking and practical tips for marathon training.',
        'h1': 'Sprint Athletics Centre Running Track, Craigieburn',
        'lede': 'Free public entry from dawn to dusk, with exclusive booking exclusions. Plan around the centre’s track access and neighbouring Anzac Park facilities.',
        'eyebrow': 'North Melbourne · running track',
        'body_file': 'sprint-athletics-centre.body.html',
        'facts': [('Length', '400 m lane-one circuit'), ('Surface', 'Synthetic'), ('Lanes', '8 circular; 10 on the front straight'), ('Public access', 'Daily dawn–dusk, outside exclusive bookings'), ('Fees', 'Casual entry free; group hire separate'), ('Lighting', 'Listed by Aths.au; public access ends at dusk')],
        'fact_source': [('Operator access and track details', 'https://humeleisure.vic.gov.au/sprint-athletics-centre'), ('Lighting listing', 'https://aths.au/track/sprint-athletics-centre/')],
        'internal': [('/marathon-pace-calculator/', 'Calculate marathon pace'), ('/blog/marathon-pace-workouts/', 'Compare marathon-pace session formats'), (HUB, 'Compare Melbourne running venues')],
        'sources': [('Hume Leisure: dimensions, access, fees, restrictions, toilets and parking', 'https://humeleisure.vic.gov.au/sprint-athletics-centre'), ('Hume City Council: Craigieburn Anzac Park and transport access', 'https://www.hume.vic.gov.au/Things-to-do/Community-Facilities/Facilities-and-spaces-for-hire/Craigieburn-Anzac-Park'), ('Aths.au: independent track and lighting listing; operator hours take precedence', 'https://aths.au/track/sprint-athletics-centre/')],
        'photos': ['Gate and access notice, with the date of the photograph recorded.', 'Lane-one start/finish markings and a view of the synthetic surface.', 'Entrance from the car park and the signed route to Anzac Park toilets.'],
        'faqs': [
            ('Is Sprint Athletics Centre free for public running?', 'Hume Leisure lists casual entry as free. Exclusive club, school or private bookings can require public runners to leave. Hiring the track and pavilion is a separate paid booking.'),
            ('Can I train at Sprint Athletics Centre after dark?', 'The operator publishes public access between dawn and dusk. A directory lists track lighting, but that does not extend casual access beyond the operator’s hours.'),
            ('What is one lap at 5:00 per kilometre?', 'A 400 m repetition at 5:00/km takes 2:00. This assumes the lane-one measurement line or the appropriate marked start for a 400 m repetition in another lane.'),
            ('Can I use the jumps or throwing equipment?', 'Public access covers the running track. Hume requires prior council approval for use of the other athletics equipment.')
        ],
        'place': {
            '@type': 'SportsActivityLocation', '@id': 'https://humeleisure.vic.gov.au/sprint-athletics-centre#venue',
            'name': 'Sprint Athletics Centre', 'url': 'https://humeleisure.vic.gov.au/sprint-athletics-centre',
            'address': {'@type': 'PostalAddress', 'streetAddress': 'Corner Aitken Boulevard and Marathon Boulevard', 'addressLocality': 'Craigieburn', 'addressRegion': 'VIC', 'postalCode': '3064', 'addressCountry': 'AU'},
            'description': 'Synthetic athletics track with free public entry between dawn and dusk outside exclusive bookings.',
            'additionalProperty': [
                {'@type': 'PropertyValue', 'name': 'Lane-one circuit length', 'value': 400, 'unitCode': 'MTR'},
                {'@type': 'PropertyValue', 'name': 'Circular lanes', 'value': 8}
            ]
        }
    },
    {
        'slug': HUB + 'the-tan/',
        'title': 'The Tan Running Route Guide | Melbourne',
        'description': 'Plan a run on The Tan: the 3.827 km loop, 10 km to 30 km distance options, Anderson Street hill, toilets, lighting and marathon training tips.',
        'h1': 'The Tan Running Route Guide',
        'lede': 'Plan distance from the official 3.827 km circuit, with Anderson Street’s climb, Saturday club sessions and precinct facilities in mind.',
        'eyebrow': 'Inner Melbourne · running path',
        'body_file': 'the-tan.body.html',
        'facts': [('Distance', '3.827 km official event lap'), ('Surface', 'Fine gravel; sealed Anderson Street section'), ('Terrain', 'Anderson Street climb: about 30 m over 300 m'), ('Fountains', 'Council documents nearby Alexandra Gardens fountains'), ('Start / finish', 'Pillars of Wisdom for the official clockwise lap'), ('Lighting', 'Organiser reports 5 am–midnight')],
        'fact_source': [('Course distance and direction', 'https://runthetan.net/the-course/'), ('Council terrain guide', 'https://whatson.melbourne.vic.gov.au/article/the-best-outdoor-exercise-parks-in-melbourne'), ('Organiser lighting information', 'https://runthetan.net/about-us/'), ('Nearby amenities', 'https://participate.melbourne.vic.gov.au/stolen-generations-marker/proposed-locations')],
        'internal': [('/blog/long-run-structure-fast-finish-vs-blocks-vs-progression/', 'Choose a long-run structure'), ('/adjust-marathon-pace/hills/', 'Pace hills by effort'), ('/marathon-pace-calculator/', 'Calculate pace and elapsed time')],
        'sources': [('Run the Tan: official lap distance, clockwise course and nearby toilets', 'https://runthetan.net/the-course/'), ('Run the Tan: surface, distance markers, lighting and established running groups', 'https://runthetan.net/about-us/'), ('City of Melbourne: surface and Anderson Street hill', 'https://whatson.melbourne.vic.gov.au/article/things-to-do-at-royal-botanic-gardens-melbourne'), ('City of Melbourne: current Saturday run-club listing', 'https://whatson.melbourne.vic.gov.au/things-to-do/run-the-tan-run-club'), ('City of Melbourne: nearby Alexandra Gardens amenities and transport', 'https://participate.melbourne.vic.gov.au/stolen-generations-marker/proposed-locations')],
        'photos': ['Pillars of Wisdom and the official start/finish markings.', 'Anderson Street hill, showing its sealed footpath and gradient.', 'Gravel surface and one distance marker, plus any current works signage.', 'Signed public-toilet access and a working drinking fountain; record visit date separately.'],
        'faqs': [
            ('How long is one lap of The Tan?', 'Run the Tan publishes an official lap distance of 3.827 km. Its event course starts and finishes at the Pillars of Wisdom and runs clockwise, keeping the gardens on the right.'),
            ('How many Tan laps make 30 km?', 'Seven official laps total 26.789 km, leaving a calculated 3.211 km for a 30 km session. Eight laps total 30.616 km and return you to your start. GPS readings can differ from the published lap arithmetic.'),
            ('Is The Tan suitable for marathon-pace training?', 'It can suit effort-based blocks, but the Anderson Street climb and shared path make constant pace less useful. Ease the pace on the climb, give other users room and compare your effort across repeat laps.'),
            ('Is The Tan lit after dark?', 'Run the Tan reports lighting from 5 am to midnight. Lighting does not establish personal safety or guarantee that nearby toilets or garden gates are open. Check conditions and take a light if visibility requires it.')
        ],
        'place': {
            '@type': 'Place', '@id': DOMAIN + HUB + 'the-tan/#route', 'name': 'The Tan running circuit',
            'description': 'Running circuit around Melbourne’s Royal Botanic Gardens and Kings Domain; the official Run the Tan event lap is 3.827 km.',
            'sameAs': 'https://runthetan.net/the-course/',
            'additionalProperty': [{'@type': 'PropertyValue', 'name': 'Official event lap distance', 'value': 3.827, 'unitCode': 'KMT'}]
        }
    }
]


for extra in json.loads((CONTENT / 'additional-pages.json').read_text()):
    venue = next(v for v in VENUES if v['id'] == extra['id'])
    venue['guide'] = HUB + venue['id'] + '/'
    sources = venue['sources'] + extra.get('extra_sources', [])
    page = dict(extra, slug=venue['guide'], body_file=venue['id'] + '.body.html',
                eyebrow=venue['location'], sources=sources, fact_source=sources[:2])
    place = {'@type': 'SportsActivityLocation' if venue['kind'] == 'track' else 'Place',
             '@id': DOMAIN + venue['guide'] + '#venue', 'name': venue['name'],
             'sameAs': [url for label, url in venue['sources']]}
    if extra.get('address'):
        place['address'] = {'@type': 'PostalAddress', 'streetAddress': extra['address'],
                            'addressLocality': extra['suburb'], 'addressRegion': 'VIC', 'addressCountry': 'AU'}
    if extra.get('length'):
        place['additionalProperty'] = [{'@type': 'PropertyValue', 'name': 'Lane-one circuit length',
                                         'value': extra['length'], 'unitCode': 'MTR'}]
    if extra.get('lanes'):
        place.setdefault('additionalProperty', []).append({'@type': 'PropertyValue', 'name': 'Circular lanes', 'value': extra['lanes']})
    page['place'] = place
    PAGES.append(page)


def pace_table(page):
    caption = 'Calculated times for a measured 400 m repetition'
    note = 'Use the lane-one measurement line or the appropriate marked start for the repetition. Full outer-lane circuits are longer.'
    if page.get('id') == 'newport-park':
        caption = 'Measured 400 m repetition reference — not an outer-lane full-lap target'
        note = 'Follow Newport’s middle/outer-lane rule. These are measured repetition times, not casual outer-lane lap times.'
    rows = ''
    def clock(seconds):
        return f'{int(seconds)//60}:{int(seconds)%60:02}'
    for seconds in [240, 270, 300, 330, 360]:
        rows += f'<tr><th scope="row">{clock(seconds)}/km</th><td>{clock(seconds * .4)}</td><td>{clock(seconds * .8)}</td><td>{clock(seconds)}</td></tr>'
    return f'<h2>400 m pace reference</h2><p>Time = pace in seconds per kilometre × 400 / 1,000. {note}</p><div class="table-scroll"><table><caption>{caption}</caption><thead><tr><th scope="col">Pace per km</th><th scope="col">400 m</th><th scope="col">800 m</th><th scope="col">1,000 m</th></tr></thead><tbody>{rows}</tbody></table></div>'


OUTBACK_TABLE = '<div class="table-scroll"><table><caption>Calculated out-and-back distances; actual route and turnaround chosen separately</caption><thead><tr><th scope="col">Target</th><th scope="col">Outward leg</th><th scope="col">Return leg</th></tr></thead><tbody>' + ''.join(f'<tr><th scope="row">{target} km</th><td>{out} km</td><td>{out} km</td></tr>' for target, out in [('10', '5'), ('21.1', '10.55'), ('30', '15')]) + '</tbody></table></div>'


def link(url, text):
    return f'<a href="{escape(url, quote=True)}">{escape(text)}</a>'


def facts_html(page):
    if not page.get('facts'):
        return ''
    items = ''.join(f'<div><dt>{escape(k)}</dt><dd>{escape(v)}</dd></div>' for k, v in page['facts'])
    sources = ' · '.join(link(url, label) for label, url in page['fact_source'])
    return f'<section class="venue-facts" aria-labelledby="quick-facts"><h2 id="quick-facts">Quick facts</h2><dl>{items}</dl><p class="venue-fact-source">Sources: {sources}.</p></section>'


def faq_html(page):
    items = ''.join(f'<h3>{escape(q)}</h3><p>{escape(a)}</p>' for q, a in page['faqs'])
    return f'<section class="venue-faq" aria-labelledby="faqs"><h2 id="faqs">Frequently asked questions</h2>{items}</section>'


def card_html(venue):
    destination = venue.get('guide', '#' + venue['id'])
    sources = ' · '.join(link(url, label) for label, url in venue['sources'])
    guide = link(venue['guide'], 'Read the training guide →') if venue.get('guide') else ''
    return f'''<article class="venue-card" id="{venue['id']}" data-venue data-kind="{venue['kind']}" data-regions="{' '.join(venue['regions'])}">
<div class="venue-location">{escape(venue['location'])}</div><h3>{link(destination, venue['name'])}</h3>
<p class="venue-spec">{escape(venue['spec'])}</p><p>{escape(venue['summary'])}</p>
{f'<p class="venue-links">{guide}</p>' if guide else ''}<p class="venue-sources">Sources: {sources}.</p></article>'''


def directory_html():
    jump = ''.join(f'<li>{link(v.get("guide", "#" + v["id"]), v["name"])}</li>' for v in VENUES)
    groups = []
    for kind, name in [('track', '12 running tracks'), ('path', '6 established running paths')]:
        cards = '\n'.join(card_html(v) for v in VENUES if v['kind'] == kind)
        groups.append(f'<section class="venue-directory" data-venue-group aria-labelledby="{kind}s"><h2 id="{kind}s">{name}</h2><div class="venue-grid">{cards}</div></section>')
    return '''<ul class="venue-overview"><li>12 tracks</li><li>6 paths</li><li>Metric distances</li></ul>
<section aria-labelledby="choose-session"><h2 id="choose-session">Start with the session you need</h2>
<p>Choose around the venue’s actual arrangements. <a href="/melbourne-running/lakeside-stadium/">Lakeside</a> uses booked public sessions; <a href="/melbourne-running/sprint-athletics-centre/">Sprint</a> publishes dawn-to-dusk entry; <a href="/melbourne-running/newport-park/">Newport</a> directs casual runners to middle and outer lanes. For a path run, compare <a href="/melbourne-running/albert-park-lake/">Albert Park’s approximate lake lap</a> with <a href="/melbourne-running/the-tan/">The Tan’s official 3.827 km circuit and Anderson Street climb</a>.</p>
<p>These tracks give coverage across inner, northern, eastern, south-eastern and western Melbourne. Published public-access information informed the selection; the notes retain booking exclusions and dates where the evidence is older. The paths have documented running events, club use or recommendations in official and local running guides. This is a training shortlist rather than a numerical popularity ranking.</p></section>
<form class="venue-filters" id="venue-filters" hidden aria-label="Filter Melbourne running venues">
<div><label for="venue-region">Region</label><select id="venue-region" name="region"><option value="all">All Melbourne</option><option value="inner">Inner Melbourne</option><option value="north">North / north-east</option><option value="east">East</option><option value="south-east">South-east</option><option value="west">West / north-west</option></select></div>
<div><label for="venue-kind">Venue type</label><select id="venue-kind" name="kind"><option value="all">Tracks and paths</option><option value="track">Running tracks</option><option value="path">Running paths</option></select></div><button type="reset" class="secondary">Show all venues</button></form>
<p class="venue-count" id="venue-count" role="status" aria-live="polite" aria-atomic="true">18 venues · 12 tracks · 6 paths</p>
<p id="venue-empty" hidden>No venues match these filters. Choose another region or show all venues.</p>
<noscript><p>All venues are listed below. Use the venue index to jump to a summary.</p></noscript>
<details class="venue-jump"><summary>Venue index: jump to a track or path</summary><ul>''' + jump + '</ul></details>' + '\n'.join(groups) + '''
<aside class="venue-note"><p><strong>Plan access before pace.</strong> A 400 m track or a lit path does not guarantee that it is available for your session. Follow current booking notices and signs. Track distances refer to lane one; outer circuits are longer.</p></aside>'''


def schema(page):
    url = DOMAIN + page['slug']
    crumbs = [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': DOMAIN + '/'}]
    crumbs.append({'@type': 'ListItem', 'position': 2, 'name': 'Melbourne running', 'item': DOMAIN + HUB})
    if page['slug'] != HUB:
        crumbs.append({'@type': 'ListItem', 'position': 3, 'name': page['h1'], 'item': url})
    webpage = {'@type': 'CollectionPage' if page['slug'] == HUB else 'WebPage', '@id': url + '#webpage', 'url': url, 'name': page['h1'], 'description': page['description'], 'inLanguage': 'en-AU', 'dateModified': DATE, 'publisher': {'@id': DOMAIN + '/#publisher'}}
    graph = [
        {'@type': 'Organization', '@id': DOMAIN + '/#publisher', 'name': 'MarathonPaceKM', 'url': DOMAIN + '/'},
        {'@type': 'BreadcrumbList', '@id': url + '#breadcrumbs', 'itemListElement': crumbs},
        webpage,
        {'@type': 'FAQPage', '@id': url + '#faq', 'isPartOf': {'@id': url + '#webpage'}, 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in page['faqs']]}
    ]
    if page['slug'] == HUB:
        itemlist = {'@type': 'ItemList', '@id': url + '#venues', 'numberOfItems': len(VENUES), 'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': v['name'], 'url': DOMAIN + v.get('guide', HUB + '#' + v['id'])} for i, v in enumerate(VENUES)]}
        graph.append(itemlist)
        webpage['mainEntity'] = {'@id': itemlist['@id']}
    else:
        graph.append(page['place'])
        webpage['about'] = {'@id': page['place']['@id']}
        webpage['citation'] = [url for label, url in page['sources']]
    return {'@context': 'https://schema.org', '@graph': graph}


def render(page):
    url = DOMAIN + page['slug']
    title, description = escape(page['title'], quote=True), escape(page['description'], quote=True)
    assert len(page['title']) < 60 and len(page['description']) < 155
    body = directory_html() if page['slug'] == HUB else (CONTENT / page['body_file']).read_text()
    if '{{PACE_TABLE}}' in body:
        assert page.get('length') == 400, 'A lap table requires supported measured length'
        body = body.replace('{{PACE_TABLE}}', pace_table(page))
    body = body.replace('{{OUTBACK_TABLE}}', OUTBACK_TABLE)
    assert '{{' not in body, 'Unexpanded content token'
    breadcrumbs = link('/', 'Home') + '<span aria-hidden="true">/</span>'
    breadcrumbs += '<span aria-current="page">Melbourne running</span>' if page['slug'] == HUB else link(HUB, 'Melbourne running') + '<span aria-hidden="true">/</span><span aria-current="page">' + escape(page['h1']) + '</span>'
    related = '<section class="venue-related" aria-labelledby="related"><h2 id="related">Plan the next part of your session</h2><ul>' + ''.join(f'<li>{link(slug, name)}</li>' for slug, name in page['internal']) + '</ul></section>'
    sources = ''
    if page.get('sources'):
        sources = '<section class="venue-sources" aria-labelledby="sources"><h2 id="sources">Sources and checking method</h2><p>Operator and council information takes priority. These are online source checks; no personal visit is claimed.</p><ul>' + ''.join(f'<li>{link(url, label)}</li>' for label, url in page['sources']) + '</ul></section>'
    photos = '\n'.join('<!-- OWNER PHOTO: ' + escape(photo) + ' -->' for photo in page['photos'])
    photos += '\n<!-- OWNER VISIT NOTE: Add a dated, first-hand observation after visiting. Do not imply a visit before it occurs. -->'
    pageclass = 'mpkm-index' if page['slug'] == HUB else 'mpkm-reading'
    html = f'''<!doctype html>
<html lang="en-AU"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title><meta name="description" content="{description}">
<meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="{url}">
<meta property="og:type" content="{'website' if page['slug'] == HUB else 'article'}"><meta property="og:title" content="{title}"><meta property="og:description" content="{description}"><meta property="og:url" content="{url}"><meta property="og:locale" content="en_AU"><meta property="og:site_name" content="MarathonPaceKM">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{description}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=20260922"><meta name="theme-color" content="#174f40">
<link rel="stylesheet" href="/assets/style.css"><link rel="stylesheet" href="/assets/site.css?v={VERSION}"><link rel="stylesheet" href="/assets/melbourne-running.css?v=20261013">
<meta name="google-adsense-account" content="ca-pub-5455873308344668"><script defer src="/assets/site-telemetry.js?v=20261008-audit"></script>
{f'<script defer src="/assets/melbourne-running.js?v=20261013"></script>' if page['slug'] == HUB else ''}
<script type="application/ld+json">{json.dumps(schema(page), ensure_ascii=False, indent=2).replace('</', '<\\/')}</script>
</head><body class="mpkm-legacy {pageclass} mpkm-venues">
<a class="skip-link" href="#content">Skip to content</a>{render_header(page['slug'])}
<main class="wrap" id="content" tabindex="-1"><nav class="venue-crumbs" aria-label="Breadcrumb">{breadcrumbs}</nav>
<article><header class="venue-hero"><p class="eyebrow">{escape(page['eyebrow'])}</p><h1>{escape(page['h1'])}</h1><p class="lede">{escape(page['lede'])}</p><p class="byline">Online sources checked {DISPLAY_DATE} · {link('/editorial-policy/', 'Editorial policy')}</p></header>
{photos}{facts_html(page)}<div class="venue-body">{body}{related}{faq_html(page)}
<p class="venue-check"><strong>Last checked: <time datetime="{DATE}">{DISPLAY_DATE}</time></strong> (online sources). {link('/contact/', 'Report a change')} with the venue name, changed detail and date.</p>{sources}</div></article>
</main>{render_footer(page['slug'])}</body></html>
'''
    dest = ROOT / page['slug'].strip('/') / 'index.html'
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(apply_navigation(html, page['slug']))
    print(f'Wrote {dest.relative_to(ROOT)}; title {len(page["title"])} chars; description {len(page["description"])} chars.')


if __name__ == '__main__':
    assert len(VENUES) == 18
    assert sum(v['kind'] == 'track' for v in VENUES) == 12
    assert sum(v['kind'] == 'path' for v in VENUES) == 6
    assert len(PAGES) == 19
    for page in PAGES:
        render(page)
