/* Browser-independent checks for the new directory's filter and content contracts. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = file => readFileSync(join(root, file), 'utf8');
const data = JSON.parse(read('.github/quality/melbourne-running/venues.json'));
const hub = read('melbourne-running/index.html');
assert.equal(data.length, 18);
assert.equal(new Set(data.map(v => v.id)).size, 18);
assert.equal(data.filter(v => v.kind === 'track').length, 12);
assert.equal(data.filter(v => v.kind === 'path').length, 6);

function element(extra = {}) {
  return {hidden: false, listeners: {}, addEventListener(name, fn) { this.listeners[name] = fn; }, ...extra};
}
const cards = [...hub.matchAll(/<article class="venue-card" id="([^"]+)" data-venue data-kind="([^"]+)" data-regions="([^"]+)"/g)]
  .map(([, id, kind, regions]) => element({id, dataset: {kind, regions}, scrolled: false, scrollIntoView() { this.scrolled = true; }}));
assert.equal(cards.length, 18, 'all cards exist statically, without a script');
for (const venue of data) {
  const card = cards.find(c => c.id === venue.id);
  assert.deepEqual(card.dataset, {kind: venue.kind, regions: venue.regions.join(' ')});
  assert.ok(hub.includes(venue.name.replaceAll('&', '&amp;')));
  const destination = venue.guide || '#' + venue.id;
  assert.ok(hub.includes(`href="${destination}"`), 'each venue has a working destination');
}
const elements = {
  'venue-filters': element({hidden: true}),
  'venue-region': element({value: 'all'}),
  'venue-kind': element({value: 'all'}),
  'venue-count': element({textContent: ''}),
  'venue-empty': element({hidden: true})
};
const groups = ['track', 'path'].map(kind => element({contains: card => card.dataset.kind === kind}));
const links = [];
const win = element({location: {hash: ''}});
const doc = {
  getElementById: id => elements[id],
  querySelectorAll: selector => selector === '[data-venue]' ? cards : selector === '[data-venue-group]' ? groups : links
};
const source = read('assets/melbourne-running.js');
vm.runInNewContext(source, {document: doc, window: win});
assert.equal(elements['venue-filters'].hidden, false);
assert.equal(elements['venue-count'].textContent, '18 venues · 12 tracks · 6 paths');
const filter = (region, kind) => {
  elements['venue-region'].value = region;
  elements['venue-kind'].value = kind;
  elements['venue-filters'].listeners.change();
};
const visible = () => cards.filter(c => !c.hidden).map(c => c.id);
filter('north', 'track');
assert.deepEqual(visible(), ['george-knott-reserve', 'sprint-athletics-centre', 'edwardes-lake-park', 'willinda-park']);
assert.equal(elements['venue-count'].textContent, '4 venues · 4 tracks · 0 paths');
assert.equal(groups[1].hidden, true, 'empty path heading disappears');
filter('east', 'path');
assert.deepEqual(visible(), ['main-yarra-trail']);
assert.equal(elements['venue-count'].textContent, '1 venue · 0 tracks · 1 path');
filter('inner', 'path');
assert.equal(visible().length, 6, 'multi-region paths remain discoverable');
filter('west', 'all');
assert.deepEqual(visible(), ['moonee-valley-athletics-centre', 'newport-park', 'fortitude-drive-reserve', 'capital-city-trail']);
filter('south-east', 'track');
assert.deepEqual(visible(), ['duncan-mackinnon-reserve', 'knox-park-athletics-centre']);
win.location.hash = '#willinda-park';
win.listeners.hashchange();
assert.equal(visible().length, 18, 'fragment links reveal a filtered-out venue');
assert.equal(cards.find(c => c.id === 'willinda-park').scrolled, true);
filter('west', 'track');
elements['venue-filters'].listeners.reset({preventDefault() {}});
assert.equal(visible().length, 18);
win.location.hash = '#%E0%A4%A';
assert.doesNotThrow(() => win.listeners.hashchange(), 'malformed fragment must not break filtering');
vm.runInNewContext(source, {document: {getElementById: () => null}}, {timeout: 1000});

assert.ok(data.every(v => v.guide === '/melbourne-running/' + v.id + '/'), 'every venue has a full guide');
const pages = ['melbourne-running/index.html', ...data.map(v => v.guide.slice(1) + 'index.html')];
const titles = [];
for (const file of pages) {
  const html = read(file);
  const title = html.match(/<title>([^<]+)<\/title>/)[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)[1];
  assert.ok(title.length < 60);
  assert.ok(description.length < 155);
  titles.push(title);
  assert.match(html, /<html lang="en-AU">/);
  assert.doesNotMatch(html, /UNVERIFIED|TODO|placeholder|perfect for runners of all levels/i);
  assert.equal((html.match(/<h1>/g) || []).length, 1);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const faq = schema['@graph'].find(n => n['@type'] === 'FAQPage');
  assert.ok(faq.mainEntity.length >= 3 && faq.mainEntity.length <= 4);
  const unescape = s => s.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&quot;', '"');
  for (const item of faq.mainEntity) {
    assert.ok(unescape(html).includes(item.name), 'schema question matches public text');
    assert.ok(unescape(html).includes(item.acceptedAnswer.text), 'schema answer matches public text');
  }
  assert.match(html, /Online sources checked 13 October 2026/);
  assert.match(html, /href="\/contact\/">Report a change/);
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
  assert.ok(read('sitemap.xml').includes('<loc>' + canonical + '</loc>'));
}
assert.equal(new Set(titles).size, 19);
const track = read('melbourne-running/sprint-athletics-centre/index.html');
const time = s => s.split(':').reduce((n, v) => n * 60 + Number(v), 0);
const trackRows = [...track.matchAll(/<tr><th scope="row">(\d+:\d+)\/km<\/th><td>([^<]+)<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><\/tr>/g)];
assert.equal(trackRows.length, 5);
for (const [, pace, lap, twoLaps, kilometre] of trackRows) {
  assert.equal(time(lap), time(pace) * 400 / 1000);
  assert.equal(time(twoLaps), time(pace) * 800 / 1000);
  assert.equal(time(kilometre), time(pace));
}
const tan = read('melbourne-running/the-tan/index.html');
for (const [laps, targetMetres] of [[2, 10000], [5, 21100], [7, 30000]]) {
  const full = laps * 3827;
  assert.ok(tan.includes(`${laps} = ${(full / 1000).toFixed(3)} km`));
  assert.ok(tan.includes(`${((targetMetres - full) / 1000).toFixed(3)} km`));
}
assert.ok(tan.includes('arithmetic remainders, not surveyed extensions'));
assert.doesNotMatch(track, /"openingHours"|"aggregateRating"|"geo"/);
for (const discovery of ['index.html', 'blog/index.html']) {
  const html = read(discovery);
  assert.ok(html.includes('href="/melbourne-running/"'));
}
for (const file of pages) assert.ok(read('sitemap/index.html').includes('href="/' + file.replace(/index.html$/, '') + '"'));
for (const venue of data) {
  const page = read(venue.guide.slice(1) + 'index.html');
  assert.ok(hub.includes('href="' + venue.guide + '"'));
  const graph = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  assert.ok(graph.some(n => n['@type'] === (venue.kind === 'track' ? 'SportsActivityLocation' : 'Place')));
  if (venue.id === 'fortitude-drive-reserve') {
    assert.doesNotMatch(page, /<caption>Calculated times|"name": "Lane-one circuit length"/);
  } else if (venue.kind === 'track') {
    const rows = [...page.matchAll(/<tr><th scope="row">(\d+:\d+)\/km<\/th><td>([^<]+)<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><\/tr>/g)];
    assert.equal(rows.length, 5, venue.id);
    for (const [, pace, lap, two, km] of rows) {
      assert.equal(time(lap), time(pace) * .4, venue.id);
      assert.equal(time(two), time(pace) * .8, venue.id);
      assert.equal(time(km), time(pace), venue.id);
    }
  }
  if (['main-yarra-trail','capital-city-trail','bay-trail','merri-creek-trail'].includes(venue.id)) {
    for (const [target, half] of [[10,5],[21.1,10.55],[30,15]]) {
      assert.ok(page.includes(`<tr><th scope="row">${target} km</th><td>${half} km</td><td>${half} km</td></tr>`));
      assert.equal(half * 2, target);
    }
  }
}
const newport = read('melbourne-running/newport-park/index.html');
assert.ok(newport.includes('not an outer-lane full-lap target'));
const albert = read('melbourne-running/albert-park-lake/index.html');
for (const [laps,total] of [[2,9.4],[4,18.8],[6,28.2]]) assert.ok(albert.includes(`${laps} ≈ ${total} km`));
console.log('Melbourne: 18 complete venue guides, filters, historic fragments, 19 SEO/FAQ/location contracts and all supported pace/distance tables passed.');
