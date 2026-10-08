import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const read = path => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');
const script = read('assets/site-telemetry.js');
assert.match(script, /G-04CFG6TG7N/, 'expected GA4 measurement ID');
assert.equal((script.match(/window\.gtag\('config', measurement\)/g) || []).length, 1, 'configure GA4 only once');
assert.match(script, /page_location: location\.origin \+ location\.pathname/, 'events must use path-only page location');

const products = [
  ['4svnr4M', 'maurten-gel-100'],
  ['3OU2oux', 'gu-energy-gel'],
  ['46UdGVL', 'sis-beta-fuel-gel'],
  ['4bB2pvY', 'tailwind-endurance-fuel']
];

for (const [path, placement] of [
  ['marathon-fueling-calculator/index.html', 'fueling-calculator'],
  ['blog/marathon-fueling-by-finish-time-gel-schedule/index.html', 'fueling-guide']
]) {
  const html = read(path);
  assert.equal((html.match(/site-telemetry\.js\?v=20261008/g) || []).length, 1, path + ' should use updated cache key');
  for (const [shortcode, product] of products) {
    const links = html.match(new RegExp('<a[^>]*href="https://amzn\\.to/' + shortcode + '"[^>]*>', 'g')) || [];
    assert.equal(links.length, 1, path + ': product link not unique ' + product);
    assert.ok(links[0].includes('data-affiliate-product="' + product + '"'));
    assert.ok(links[0].includes('data-affiliate-placement="' + placement + '"'));
    assert.match(links[0], /rel="[^"]*\bsponsored\b[^"]*"/);
  }
}
assert.match(read('index.html'), /site-telemetry\.js\?v=20261008/);

function makeContext(embedded = false) {
  const listeners = new Map();
  const window = {
    dataLayer: [],
    addEventListener() {},
    setTimeout() {},
    requestIdleCallback() {},
    location: {origin: 'https://marathonpacekm.com', pathname: '/marathon-fueling-calculator/'}
  };
  window.self = window;
  window.top = embedded ? {} : window;
  const document = {
    readyState: 'loading',
    referrer: 'https://search.example/results?q=secret',
    scripts: [],
    querySelector() {return null;},
    addEventListener(type, handler) {listeners.set(type, handler);}
  };
  const location = {origin: window.location.origin, pathname: window.location.pathname, search: '?runner=private-person&goal=4h'};
  const context = {window, document, location, URL, Date, Set, Map};
  runInNewContext(script, context);
  return {window, listeners, context};
}

const h = makeContext();
const sent = () => h.window.dataLayer.map(record => Array.from(record));
assert.equal(sent().filter(x => x[0] === 'config').length, 1);
assert.deepEqual(sent().filter(x => x[0] === 'set')[0][1].page_location, 'https://marathonpacekm.com/marathon-fueling-calculator/');
assert.equal(h.listeners.has('click'), true);
assert.equal(h.listeners.has('mpk:action'), true);

const link = (product = 'maurten-gel-100', href = 'https://amzn.to/4svnr4M', rel = 'sponsored noopener noreferrer') => ({
  dataset: {affiliateProduct: product, affiliatePlacement: 'fueling-calculator'},
  href,
  rel
});
function click(anchor, isPrevented = false) {
  h.listeners.get('click')({
    defaultPrevented: isPrevented,
    target: {closest: name => name === 'a[data-affiliate-product]' ? anchor : null}
  });
}
click(link());
let events = sent().filter(x => x[0] === 'event' && x[1] === 'affiliate_click');
assert.equal(events.length, 1);
assert.equal(events[0][2].affiliate_product, 'maurten-gel-100');
assert.equal(events[0][2].affiliate_placement, 'fueling-calculator');
assert.equal(events[0][2].affiliate_platform, 'amazon');
assert.equal(events[0][2].page_location, 'https://marathonpacekm.com/marathon-fueling-calculator/');
assert.doesNotMatch(JSON.stringify(events), /private-person|secret|goal=|amzn.to/);

click(link('unknown-product'));
click(link('gu-energy-gel', 'https://other.example/test'));
click(link('gu-energy-gel', 'https://amzn.to/3OU2oux', 'noopener'));
click(link(), true);
assert.equal(sent().filter(x => x[0] === 'event' && x[1] === 'affiliate_click').length, 1, 'ignore unrelated links');

h.listeners.get('mpk:action')({detail: {action: 'calculate', goal: 'private-person', runner: 'secret'}});
const internal = sent().filter(x => x[0] === 'event' && x[1] === 'pace_calculator_calculate');
assert.equal(internal.length, 1);
assert.deepEqual(Object.keys(internal[0][2]).sort(), ['page_location']);
h.listeners.get('mpk:action')({detail: {action: 'unknown_action', name: 'secret'}});
assert.equal(sent().filter(x => x[0] === 'event').length, 2, 'unknown actions are ignored');

runInNewContext(script, h.context);
assert.equal(sent().filter(x => x[0] === 'config').length, 1, 'avoid duplicate GA4 initialization');
const embedded = makeContext(true);
assert.equal(embedded.window.dataLayer.length, 0, 'embedded calculator does not emit host analytics');

console.log('GA4 and affiliate attribution checks passed (markup, events, private URL data and initialization).');
