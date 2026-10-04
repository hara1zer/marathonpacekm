import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(new URL('../../', import.meta.url).pathname);
const output = process.env.QA_OUTPUT || '/tmp/marathonpacekm-seo-qa';
fs.mkdirSync(output, {recursive: true});
const server = http.createServer((req, res) => {
  let file = path.join(root, new URL(req.url, 'http://localhost').pathname);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.setHeader('Content-Type', {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml'}[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({headless: true, executablePath: process.env.CHROMIUM_PATH || undefined, args: JSON.parse(process.env.CHROMIUM_ARGS || '[]')});
const context = await browser.newContext({acceptDownloads: true});
await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
const page = await context.newPage();
page.setDefaultTimeout(5000);
const results = [], errors = [];
page.on('pageerror', e => errors.push(e.message));
const go = route => page.goto(base + route, {waitUntil: 'load'});
const text = id => page.locator('#' + id).textContent();
const values = obj => page.evaluate(obj => {
  for (const [id, value] of Object.entries(obj)) {
    const el = document.getElementById(id); el.value = value;
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.dispatchEvent(new Event('change', {bubbles: true}));
  }
}, obj);
const seconds = clock => clock.split(':').reduce((sum, part) => sum * 60 + Number(part), 0);
async function test(name, fn) {
  try { await fn(); results.push({name, pass: true}); }
  catch (error) { results.push({name, pass: false, error: error.message}); }
}
try {
  await test('Five-hour default: accurate mile pace, halfway and run/walk distance', async () => {
    await go('/5-00-marathon-pace-km/');
    assert.equal(await text('result-km'), '7:06.6'); assert.equal(await text('result-mi'), '11:26.5');
    assert.match(await text('key-splits-body'), /2:30:00/);
    assert.equal(await text('rw-running-pace'), '6:46.2 / km');
    assert.equal(await text('rw-running-time'), '4:26:00'); assert.equal(await text('rw-walking-time'), '0:29:00');
    assert.equal(parseFloat(await text('rw-running-distance')) + parseFloat(await text('rw-walking-distance')), 42.195);
  });
  await test('Run/walk examples and a partial final walk preserve time and distance', async () => {
    await values({'rw-stops': 0}); assert.equal(await text('rw-running-pace'), '6:53.3 / km');
    await values({'rw-run': 4}); assert.equal(await text('rw-running-pace'), '6:37.8 / km');
    await values({'rw-run': 9, h: 4, m: 59, s: 30});
    assert.equal(await text('rw-walking-time'), '0:29:30'); assert.equal(await text('rw-running-time'), '4:30:00');
    assert.equal(seconds(await text('rw-running-time')) + seconds(await text('rw-walking-time')), 17970);
    assert.equal(parseFloat(await text('rw-running-distance')) + parseFloat(await text('rw-walking-distance')), 42.195);
    assert.equal(await text('rw-running-pace'), '6:52.8 / km');
    await page.click('#resetBtn'); assert.equal(await text('rw-target'), '5:00:00');
    await page.evaluate(() => location.hash = 'time=18300');
    await page.waitForFunction(() => document.getElementById('rw-target').textContent === '5:05:00');
  });
  await test('Invalid run/walk input hides stale output', async () => {
    await values({'rw-walk-min': 0, 'rw-walk-sec': 0});
    assert.ok(await page.locator('#rw-output').isHidden()); assert.ok(await page.locator('#rw-error').isVisible());
    await values({'rw-walk-min': 10, h: 1, m: 0, s: 0, 'rw-stops': 60});
    assert.ok(await page.locator('#rw-output').isHidden());
    await values({h: ''}); assert.equal(await page.locator('[data-current-band]').first().getAttribute('href'), null);
  });
  await test('3:25 splits, mile checkpoints and exported segments use one target', async () => {
    await go('/3-25-marathon-pace-km/');
    assert.equal(await text('result-km'), '4:51.5'); assert.equal(await text('result-mi'), '7:49.1');
    assert.match(await text('key-splits-body'), /1:42:30/);
    assert.equal(await page.locator('#splits-body tr').count(), 43);
    await page.click('#full-splits > summary'); await page.selectOption('#split-unit', 'mi');
    assert.equal(await page.locator('#splits-body tr').count(), 27);
    const segments = await page.locator('#splits-body tr td:last-child').allTextContents();
    assert.equal(segments.reduce((sum, clock) => sum + seconds(clock), 0), 12300);
    const downloadEvent = page.waitForEvent('download'); await page.click('#download-btn');
    const download = await downloadEvent; const stream = await download.createReadStream(); let csv = '';
    for await (const chunk of stream) csv += chunk;
    assert.match(csv, /3:25:00/); assert.equal(csv.trim().split('\n').length, 28);
    const old = await text('mile-checkpoints-body'); await values({m: 26});
    assert.notEqual(await text('mile-checkpoints-body'), old); assert.match(await text('mile-checkpoints-body'), /3:26:00/);
    const mileLink = page.locator('[data-current-band][data-band-unit="mi"]');
    const url = new URL(await mileLink.getAttribute('href'), base);
    assert.equal(url.searchParams.get('unit'), 'mi'); assert.equal(url.searchParams.get('m'), '26');
    await mileLink.click(); assert.equal(new URL(page.url()).searchParams.get('unit'), 'mi');
    assert.match(await page.locator('body').innerText(), /3:26:00/);
  });
  await test('3:05 handoff follows edits and disables non-marathon distances', async () => {
    await go('/3-05-marathon-pace-km/'); await values({m: 10});
    const link = page.locator('[data-goal-band]');
    assert.equal(new URL(await link.getAttribute('href'), base).searchParams.get('m'), '10');
    await page.selectOption('#dist', '5'); assert.equal(await link.getAttribute('href'), null);
    await page.click('#resetBtn'); assert.equal(new URL(await link.getAttribute('href'), base).searchParams.get('m'), '5');
  });
  await test('Both new layouts retain complete static splits with JavaScript disabled', async () => {
    const nojs = await browser.newContext({javaScriptEnabled: false});
    const p = await nojs.newPage();
    for (const route of ['/5-00-marathon-pace-km/', '/3-25-marathon-pace-km/']) {
      await p.goto(base + route); assert.ok(await p.locator('#goal-form').isHidden());
      assert.ok(await p.locator('#download-btn').isHidden());
      assert.equal(await p.locator('#splits-body tr').count(), 43);
      assert.match(await p.locator('#splits-body').textContent(), route.includes('5-00') ? /5:00:00/ : /3:25:00/);
    }
    assert.equal(await p.locator('#result-km').textContent(), '4:51.5');
    await p.close();
  });
  await test('Third-party scripts wait for load; advertising waits an additional 2.5 seconds', async () => {
    const c = await browser.newContext();
    await c.addInitScript(() => window.addEventListener('load', () => window.__qaLoad = performance.now()));
    const requests = [];
    await c.route('**/*', async route => {
      const url = route.request().url();
      if (new URL(url).hostname === '127.0.0.1') return route.continue();
      requests.push({url, timing: await route.request().frame().evaluate(() => ({load: window.__qaLoad, now: performance.now()}))});
      return route.fulfill({status: 200, contentType: 'text/javascript', body: '/* mocked third party */'});
    });
    const p = await c.newPage(); await p.goto(base + '/');
    await p.waitForFunction(() => [...document.scripts].some(s => s.src.includes('adsbygoogle.js')), {timeout: 7000});
    const ga = requests.find(r => r.url.includes('gtag/js'));
    const ads = requests.find(r => r.url.includes('adsbygoogle.js'));
    assert.ok(ga && ads); assert.ok(ga.timing.now >= ga.timing.load);
    assert.ok(ads.timing.now - ads.timing.load >= 2450);
    assert.equal(await p.locator('meta[name="google-adsense-account"]').getAttribute('content'), 'ca-pub-5455873308344668');
    requests.length = 0;
    await p.setContent(`<iframe src="${base}/printable-pace-band/"></iframe>`);
    await p.locator('iframe').contentFrame().locator('body').waitFor();
    await p.waitForTimeout(3000); assert.equal(requests.length, 0);
    await p.close();
  });
  assert.deepEqual(errors, []);
} finally {
  fs.writeFileSync(output + '/seo-results.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close(); server.close();
}
if (results.some(r => !r.pass)) process.exitCode = 1;
