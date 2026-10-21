"""Check navigation coverage, schema parity, links, depth and SEO preservation."""
from pathlib import Path
from collections import deque, Counter
from urllib.parse import urljoin, urlsplit, unquote
import gzip
import json
from lxml import html
from site_navigation import ROOT, sync_all

assert not sync_all(check=True), 'Run sync-navigation.py and commit its generated HTML'
baseline = json.loads((ROOT/'.github/quality/navigation-baseline.json').read_text())
before = {item['url']: item for item in baseline['inventory']}
docs = {}
for path in ROOT.rglob('*.html'):
    if any(part.startswith('.') for part in path.relative_to(ROOT).parts): continue
    route = '/' + path.relative_to(ROOT).as_posix().removesuffix('index.html')
    docs[route] = html.fromstring(path.read_text())
assert docs.keys() == before.keys(), 'Public URLs added or removed'
redirects = {p[0]:p[1] for line in (ROOT/'_redirects').read_text().splitlines()
             if len(p:=line.split()) == 3 and not line.startswith('#')}
graph = {}
headers = []
for route, doc in docs.items():
    prior = before[route]
    for key, xpath in [('title','string(//title)'), ('h1','string(//h1)'),
        ('canonical','//link[@rel="canonical"]/@href'), ('description','//meta[@name="description"]/@content'),
        ('robots','//meta[@name="robots"]/@content')]:
        assert doc.xpath(xpath) == prior[key], (route, key, 'SEO metadata changed')
    ids = doc.xpath('//@id')
    assert len(ids) == len(set(ids)), (route, 'duplicate IDs')
    assert len(doc.xpath('//header[@class="mpkm-site-header"]')) == 1, route
    assert len(doc.xpath('//nav[@aria-label="Main navigation"]')) == 1, route
    assert len(doc.xpath('//details[@class="mpkm-mobile-menu"]')) == 1, route
    assert len(doc.xpath('//footer')) == 1, route
    header = doc.xpath('//header[@class="mpkm-site-header"]')[0]
    modes = [header.xpath('.//nav[@class="mpkm-main-nav"]')[0], header.xpath('.//nav[@id="mpkm-mobile-links"]')[0]]
    destinations = [[a.get('href') for a in mode.xpath('.//a')] for mode in modes]
    assert destinations[0] == destinations[1], (route, 'desktop/mobile destination mismatch')
    headers.append(destinations[0])
    assert len(modes[0].xpath('./ul/li')) == 5, route
    for disclosure in header.xpath('.//details'):
        controls = disclosure.xpath('./summary/@aria-controls')
        assert len(controls) == 1 and doc.xpath('//*[@id=$id]', id=controls[0]), route
    for a in doc.xpath('//a[@aria-current="page"]'):
        assert a.get('href') == route, (route, 'false current page')
    skips = doc.xpath('//a[contains(@class,"skip")]')
    assert skips[0].get('class')=='skip-link', route
    assert len(skips)==1 and doc.xpath('//*[@id=$id]',id=skips[0].get('href').lstrip('#')), route
    crumbs = doc.xpath('//nav[@class="mpkm-breadcrumbs"]')
    assert len(crumbs) == (0 if route == '/' else 1), route
    if route not in ('/', '/404.html'):
        schemas=[]
        def find(obj):
            if isinstance(obj,dict):
                if obj.get('@type')=='BreadcrumbList': schemas.append(obj)
                for value in obj.values(): find(value)
            elif isinstance(obj,list):
                for value in obj: find(value)
        for script in doc.xpath('//script[@type="application/ld+json"]'):
            find(json.loads(script.text))
        assert len(schemas)==1, (route, 'missing or duplicate breadcrumb schema')
        visible=crumbs[0].xpath('./ol/li')
        schema=schemas[0]['itemListElement']
        assert len(visible)==len(schema), route
        for item, structured in zip(visible,schema):
            assert item.text_content()==structured['name'], route
            target=item.xpath('./a/@href')
            assert structured['item']=='https://marathonpacekm.com'+(target[0] if target else route), route
    graph[route]=[]
    for a in doc.xpath('//a[@href]'):
        url=urlsplit(urljoin('https://marathonpacekm.com'+route,a.get('href')))
        if url.netloc!='marathonpacekm.com' or url.scheme!='https': continue
        dest=unquote(url.path)
        if dest in redirects:
            assert not a.xpath('ancestor::header[@class="mpkm-site-header"]|ancestor::footer'), (route,'redirect in global navigation')
            url=urlsplit(urljoin('https://marathonpacekm.com',redirects[dest]));dest=unquote(url.path)
        assert dest in docs or (ROOT/dest.lstrip('/')).is_file(), (route,a.get('href'),'broken link')
        if dest in docs:
            graph[route].append(dest)
            if url.fragment: assert docs[dest].xpath('//*[@id=$id or @name=$id]',id=unquote(url.fragment)),(route,a.get('href'),'broken anchor')
assert all(header==headers[0] for header in headers), 'Different navigation destinations across templates'
# Shortest crawlable link depth from the homepage.
depth={'/':0};queue=deque(['/'])
while queue:
    source=queue.popleft()
    for dest in graph[source]:
        if dest not in depth: depth[dest]=depth[source]+1;queue.append(dest)
assert set(docs)-set(depth)=={'/404.html'}, 'Published orphan page'
assert max(depth.values())<=2, 'A published page needs more than two links from home'
sitemap_paths={urlsplit(urljoin('https://marathonpacekm.com/sitemap/',href)).path for href in docs['/sitemap/'].xpath('//main//a/@href')}
assert set(docs)-sitemap_paths=={'/404.html'}, 'HTML sitemap omits a published page'
home=docs['/']
for route in ['/marathon-pace-calculator/','/marathon-time-predictor/','/marathon-fueling-calculator/',
              '/race-conditions-pace-adjuster/','/sub-threshold-pace-calculator/']:
    assert home.xpath('//*[@id="start-here"]//a[@href=$route]',route=route),route
assert 'remain specific to 42.195 km. The pace-band generator supports marathon and half-marathon distances.' in home.text_content()
report={'html_pages':len(docs),'published_pages':len(docs)-1,'broken_links':0,'published_orphans':0,
        'depth_before':dict(Counter(baseline['depths'].values())),'depth_after':dict(Counter(depth.values())),
        'navigation_js_gzip_bytes':len(gzip.compress((ROOT/'assets/navigation.js').read_bytes()))}
print(json.dumps(report,indent=2))
