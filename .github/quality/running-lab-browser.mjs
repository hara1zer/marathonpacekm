// Running Lab integration contracts: real source data, static discovery and accessible controls.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const axe = require(process.env.AXE_MODULE || 'axe-core');
const root = path.resolve(new URL('../../', import.meta.url).pathname);
const output = process.env.QA_OUTPUT || fs.mkdtempSync('/tmp/marathonpacekm-lab-qa-');
fs.mkdirSync(output, {recursive:true});
const registry = JSON.parse(fs.readFileSync(path.join(root, '.github/quality/running-lab-studies.json'), 'utf8'));
const source = JSON.parse(fs.readFileSync(path.join(root, 'assets/original/sydney-2026-chart-data.json'), 'utf8'));
const domain = 'https://marathonpacekm.com';
const hubTitle = 'The Running Lab | Real Race Data, Training Experiments & Pacing Analysis';
const sydney = '/blog/sydney-marathon-2026-personal-review/';
const original = new Map([
  [sydney, {title:'My Sydney Marathon: Lessons From a Sub-Four Attempt', published:'2026-09-21'}],
  ['/blog/run-melbourne-half-marathon-2025-vs-2026/', {title:'My Run Melbourne Half Marathons: 2025 vs 2026', published:'2026-10-01'}],
  ['/blog/rebuilding-after-sydney-marathon/', {title:'My Post-Sydney Rebuild: A Stronger Marathon Finish', published:'2026-10-02'}],
  ['/blog/marathon-fueling-experiments/', {title:'My Marathon Fueling Experiments: Homemade and Commercial Gels', published:'2026-10-02'}],
]);

const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end(); }
  let file = path.resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.setHeader('Content-Type', ({'.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png'})[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH || undefined, args:JSON.parse(process.env.CHROMIUM_ARGS || '[]')});
const results = [], errors = [], contexts = [];
async function test(name, run) {
  try { await run(); results.push({name, pass:true}); }
  catch (error) { results.push({name, pass:false, error:error.stack}); }
}
async function page(options = {}) {
  const context = await browser.newContext({viewport:{width:1280, height:900}, ...options});
  contexts.push(context);
  await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  await context.addInitScript(() => localStorage.setItem('mpkm_analytics_choice_v1', 'decline'));
  const p = await context.newPage();
  p.setDefaultTimeout(5000);
  p.on('pageerror', error => errors.push(error.message));
  return {context, p};
}
async function schema(p) {
  return p.locator('script[type="application/ld+json"]').evaluateAll(scripts => {
    const nodes = [];
    function visit(value) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') { nodes.push(value); Object.values(value).forEach(visit); }
    }
    scripts.forEach(script => visit(JSON.parse(script.textContent)));
    return nodes;
  });
}
async function internalLinks(p, selector) {
  const links = await p.locator(selector).evaluateAll(elements => elements.map(element => element.getAttribute('href')));
  assert.ok(links.length > 0, selector + ' has useful links');
  for (const href of links) {
    const url = new URL(href, domain + new URL(p.url()).pathname);
    if (url.origin !== domain) continue;
    let file = path.join(root, decodeURIComponent(url.pathname));
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    assert.ok(fs.existsSync(file), 'published internal link: ' + href);
    if (url.hash && path.extname(file) === '.html') {
      const id = decodeURIComponent(url.hash.slice(1));
      const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      assert.match(fs.readFileSync(file, 'utf8'), new RegExp('\\b(?:id|name)=["\\\']' + escaped + '["\\\']'), 'existing anchor: ' + href);
    }
  }
}
function publicFiles(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    if (entry.name.startsWith('.')) return [];
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? publicFiles(file) : entry.isFile() && entry.name.endsWith('.html') ? [file] : [];
  });
}

try {
  await test('Registry retains four original study URLs and honest classifications', async () => {
    assert.equal(registry.studies.length, 4);
    assert.deepEqual(new Set(registry.studies.map(study => study.url)), new Set(original.keys()));
    assert.equal(new Set(registry.studies.map(study => study.id)).size, 4);
    assert.equal(registry.categories.length, 4);
    const ids = new Set(registry.studies.map(study => study.id));
    for (const study of registry.studies) {
      for (const field of ['title', 'description', 'content_type', 'question', 'published', 'modified']) assert.ok(study[field], study.id + ' ' + field);
      assert.equal(study.published, original.get(study.url).published);
      assert.ok(study.modified >= study.published);
      assert.ok(study.available_data.length > 0 && study.related_tools.length > 0);
      assert.ok(study.related_studies.every(id => ids.has(id) && id !== study.id));
      assert.ok(study.categories.every(id => registry.categories.some(category => category.id === id)));
    }
    const rebuild = registry.studies.find(study => study.url.includes('rebuilding'));
    assert.match(rebuild.content_type, /intention/i);
    assert.deepEqual(source.race_km, [25,27,28,29,30,31,32,33]);
    assert.deepEqual(source.race_pace_seconds_per_km, [332,351,355,362,353,380,392,410]);
    assert.deepEqual(source.race_heart_rate_bpm, [160,162,164,164,162,161,162,160]);
  });

  await test('Hub has crawlable featured studies, published categories, tools and supported schema', async () => {
    const {p} = await page({javaScriptEnabled:false});
    await p.goto(base + '/running-lab/');
    assert.equal(await p.title(), hubTitle);
    assert.equal(await p.locator('link[rel="canonical"]').getAttribute('href'), domain + '/running-lab/');
    assert.match(await p.locator('main').innerText(), /Real running data\. Real race experiences\. Practical lessons you can test yourself\./);
    const featured = registry.studies;
    assert.equal(await p.locator('#featured-investigations .lab-study-card').count(), featured.length);
    for (const study of featured) {
      const card = p.locator('#featured-investigations [data-study-id="' + study.id + '"]');
      assert.match(await card.innerText(), new RegExp(study.content_type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      assert.equal(await card.locator('h3 a').getAttribute('href'), study.url);
      assert.ok((await card.locator('.lab-card-insight').innerText()).length > 30);
      assert.ok((await card.locator('.lab-card-evidence').innerText()).length > 30);
    }
    for (const category of registry.categories) {
      assert.equal(await p.locator('#' + category.id).count(), 1, 'historical topic fragment remains');
      const cards = p.locator('.lab-study-card[data-topics~="' + category.id + '"]');
      assert.equal(await cards.count(), registry.studies.filter(study => study.categories.includes(category.id)).length);
    }
    assert.equal(await p.locator('.lab-category').count(), 0, 'topics do not duplicate the article listings');
    assert.equal(await p.locator('.lab-study-card').count(), 4);
    assert.equal(await p.locator('[data-lab-filters]').isVisible(), false, 'all four readable cards work without scripts');
    for (const route of ['/marathon-time-predictor/', '/marathon-pace-calculator/', '/marathon-fueling-calculator/', '/race-conditions-pace-adjuster/', '/monthly-training-plan/']) assert.equal(await p.locator('#lab-tools a[href="' + route + '"]').count(), 1);
    assert.equal(await p.locator('#how-the-lab-works ol > li').count(), 5);
    const schemas = await schema(p);
    assert.equal(schemas.filter(node => node['@type'] === 'CollectionPage').length, 1);
    assert.equal(schemas.filter(node => node['@type'] === 'BreadcrumbList').length, 1);
    const collection = schemas.find(node => node['@type'] === 'ItemList');
    assert.ok(collection);
    const urls = collection.itemListElement.map(item => item.url || item.item?.url || item.item?.['@id'] || item.item);
    assert.deepEqual(new Set(urls), new Set(registry.studies.map(study => domain + study.url)));
    await internalLinks(p, 'main a[href]');
  });

  await test('Founding studies keep original identity and source content while exposing Lab context', async () => {
    const {p} = await page();
    for (const study of registry.studies) {
      await p.goto(base + study.url);
      assert.equal(await p.title(), original.get(study.url).title);
      assert.equal(await p.locator('link[rel="canonical"]').getAttribute('href'), domain + study.url);
      const article = (await schema(p)).find(node => node['@type'] === 'Article');
      assert.equal(article.datePublished, original.get(study.url).published);
      assert.equal(article.dateModified, study.modified);
      assert.equal(article.author.name, 'Davin Pinto');
      const notes = p.locator('#lab-study-notes');
      assert.equal(await notes.count(), 1);
      assert.ok((await notes.innerText()).length > 200);
      assert.ok((await notes.innerText()).split(/\s+/).length <= 85, 'opening evidence summary stays concise');
      assert.equal(await p.locator('.byline').count(), 1, 'one author/date line per article');
      assert.equal(await p.locator('.byline time').count(), 2, 'publication and revision are each shown once in the byline');
      assert.equal(await p.locator('.lab-study-dates').count(), 0, 'no second dates block');
      assert.match(await p.locator('.lab-study-meta').innerText(), new RegExp(study.content_type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      for (const related of study.related_studies) {
        const target = registry.studies.find(item => item.id === related);
        assert.equal(await p.locator('.lab-related a[href="' + target.url + '"]').count(), 1);
      }
      assert.equal(await p.locator('#sources').count(), 1);
      assert.ok(await p.locator('main a[href="/running-lab/"]').count());
      assert.match(await p.locator('.mpkm-breadcrumbs').innerText(), /Running Lab/);
      await internalLinks(p, '#lab-study-notes a[href]');
      await internalLinks(p, '.lab-related a[href]');
    }
    await p.goto(base + sydney);
    const rows = await p.locator('table').filter({has:p.locator('caption', {hasText:'Selected recorded kilometre splits at Sydney'})}).locator('tbody tr').allTextContents();
    assert.equal(rows.length, 8);
    assert.match(rows[0], /25.*5:32.*160/);
    assert.match(rows.at(-1), /33.*6:50.*160/);
    await p.goto(base + '/blog/marathon-fueling-experiments/');
    assert.match(await p.locator('#arithmetic').innerText(), /68\.75 g\/h/);
    assert.match(await p.locator('#arithmetic').innerText(), /62\.5 g\/h/);
  });

  await test('Lab hub and study additions fit phones/desktops and pass scoped WCAG checks', async () => {
    const {p} = await page();
    for (const width of [320,390,1280]) {
      await p.setViewportSize({width,height:900});
      for (const route of ['/running-lab/', ...original.keys()]) {
        await p.goto(base + route);
        assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), route + ' at ' + width + 'px overflows');
        if (route === sydney) await p.locator('[data-lab-controls]').waitFor({state:'visible'});
        if ([390,1280].includes(width)) {
          await p.addScriptTag({content:axe.source});
          const violations = await p.evaluate(async isHub => {
            const include = isHub ? ['html'] : ['#lab-study-notes', ...[...document.querySelectorAll('[data-lab-explorer], .lab-analysis, .lab-study-meta, .lab-related')].map(element => element.id ? '#' + element.id : '.' + element.classList[0])];
            return (await window.axe.run({include}, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(violation => ({id:violation.id, impact:violation.impact, targets:violation.nodes.map(node => node.target)}));
          }, route === '/running-lab/');
          assert.deepEqual(violations, [], route + ' at ' + width);
        }
        if (route === '/running-lab/' || route === sydney) await p.screenshot({path:path.join(output, (route === sydney ? 'lab-sydney' : 'lab-hub') + '-' + width + '.png'), fullPage:true});
      }
    }
  });

  await test('Topic filters show one collection and restore all studies with keyboard controls', async () => {
    const {p} = await page();
    await p.goto(base + '/running-lab/');
    await p.locator('[data-lab-filters]').waitFor({state:'visible'});
    for (const category of registry.categories) {
      await p.locator('[data-lab-topic="' + category.id + '"]').click();
      const expected = registry.studies.filter(study => study.categories.includes(category.id));
      assert.equal(await p.locator('.lab-study-card:visible').count(), expected.length);
      assert.equal(await p.locator('[aria-pressed="true"]').count(), 1);
      assert.match(await p.locator('[data-lab-filter-status]').innerText(), new RegExp('^' + expected.length + ' of 4'));
    }
    await p.locator('[data-lab-topic="all"]').focus();
    await p.locator('[data-lab-topic="all"]').press('Enter');
    assert.equal(await p.locator('.lab-study-card:visible').count(), 4);
  });

  await test('Race Replay exposes all 41 source laps and excludes rounded partial laps', async () => {
    const {p} = await page();
    const data = JSON.parse(fs.readFileSync(path.join(root, 'assets/original/half-marathon-2025-2026-data.json')));
    await p.goto(base + '/blog/run-melbourne-half-marathon-2025-vs-2026/');
    const replay = p.locator('[data-race-replay]');
    await p.waitForFunction(() => document.querySelector('[data-race-replay]')?.dataset.ready === 'true');
    for (const year of ['2025','2026']) {
      await p.locator('#replay-year').selectOption(year);
      const laps = data[year].pace_seconds_per_km;
      assert.equal(await p.locator('#replay-lap option').count(), laps.length);
      for (let i = 0; i < laps.length; i++) {
        await p.locator('#replay-lap').selectOption(String(i + 1));
        const pace = `${Math.floor(laps[i]/60)}:${String(laps[i]%60).padStart(2,'0')}`;
        assert.ok((await p.locator('[data-replay-observed]').innerText()).includes(pace + '/km'));
        assert.equal(await replay.locator('circle').count(), laps.length);
      }
    }
    assert.match(await p.locator('[data-replay-results]').innerText(), /1:49:35/);
    assert.equal(await p.locator('[data-replay-next]').isDisabled(), true);
    await p.locator('[data-replay-previous]').click();
    assert.match(await p.locator('[data-replay-results]').innerText(), /1:44:44/);
    await p.locator('#replay-seconds').fill('60');
    assert.equal(await p.locator('[data-replay-results]').innerText(), '');
    assert.equal(await replay.locator('svg').count(), 0);
    assert.match(await p.locator('[data-replay-observed]').innerText(), /2026.*20/);
    await p.locator('#replay-seconds').fill('40');
    assert.match(await p.locator('[data-replay-results]').innerText(), /1:44:44/);
  });

  await test('Prediction Lab separates model sensitivity from the recorded training window', async () => {
    const {p} = await page();
    await p.goto(base + sydney);
    await p.waitForFunction(() => document.querySelector('[data-prediction-lab]')?.dataset.ready === 'true');
    const results = p.locator('[data-prediction-results]');
    assert.match(await results.innerText(), /3:51:19/);
    await p.locator('#prediction-window').selectOption('3');
    assert.match(await results.innerText(), /83\.9 km\/week/);
    assert.match(await results.innerText(), /3:51:19/, 'training-window selection never pretends to calibrate the model');
    await p.locator('#prediction-exponent').fill('1.10');
    assert.match(await results.innerText(), /3:57:50/);
    assert.match(await results.innerText(), /2:10 under/);
    assert.match(await results.innerText(), /1:51:58/);
    for (const [selector, invalid, valid] of [['#prediction-minutes','60','50'],['#prediction-seconds','','57'],['#prediction-exponent','1.31','1.10']]) {
      await p.locator(selector).fill(invalid);
      assert.equal(await results.innerText(), '', 'invalid input clears stale scenarios');
      assert.equal(await p.locator(selector).getAttribute('aria-invalid'), 'true');
      await p.locator(selector).fill(valid);
      assert.match(await results.innerText(), /3:57:50/);
    }
  });

  await test('New investigations retain real analysis without JavaScript or a successful data fetch', async () => {
    const routes = [[sydney, 'prediction-lab', 'sydney-2026-chart-data.json'], ['/blog/run-melbourne-half-marathon-2025-vs-2026/', 'race-replay', 'half-marathon-2025-2026-data.json']];
    for (const [route, id, file] of routes) {
      const plain = await page({javaScriptEnabled:false});
      await plain.p.goto(base + route);
      assert.equal(await plain.p.locator('#' + id + ' [data-analysis-controls]').isVisible(), false);
      assert.ok(await plain.p.locator('#' + id + ' table tbody tr').count() >= 2);
      for (const kind of ['network','malformed']) {
        const {p,context} = await page();
        await context.route('**/assets/original/' + file, request => kind === 'network' ? request.abort() : request.fulfill({status:200,contentType:'application/json',body:'{}'}));
        await p.goto(base + route);
        await p.waitForFunction(id => document.getElementById(id)?.dataset.ready === 'error', id);
        assert.equal(await p.locator('#' + id + ' [data-analysis-controls]').isVisible(), false);
        assert.ok(await p.locator('#' + id + ' table tbody tr').count() >= 2);
      }
    }
  });

  await test('Selected-split explorer preserves all eight observations and local-only arithmetic', async () => {
    const {p} = await page();
    await p.goto(base + sydney);
    const explorer = p.locator('[data-lab-explorer]');
    await p.waitForFunction(() => document.querySelector('[data-lab-explorer]')?.dataset.ready === 'true');
    const select = p.locator('#lab-recorded-km');
    assert.deepEqual(await select.locator('option').evaluateAll(options => options.map(option => Number(option.value))), source.race_km);
    assert.equal(await explorer.locator('[data-lab-chart] circle').count(), 8);
    assert.equal(await explorer.locator('[data-lab-chart] polyline, [data-lab-chart] path').count(), 0, 'recorded points are never joined across missing data');
    assert.equal(await explorer.locator('[data-lab-previous]').isDisabled(), true);
    assert.match(await explorer.locator('.lab-observed').innerText(), /Kilometre 25.*5:32\/km.*160 bpm/s);
    assert.match(await explorer.locator('.lab-scenario').innerText(), /0:08 faster/);
    await select.focus();
    await select.press('ArrowDown');
    assert.equal(await select.inputValue(), '27', 'native keyboard selection skips unavailable kilometre 26');
    assert.match(await explorer.locator('.lab-block-label').innerText(), /Recorded kilometre 27 only/);
    await explorer.locator('[data-lab-previous]').click();
    assert.equal(await select.inputValue(), '25');
    await explorer.locator('[data-lab-next]').click();
    assert.equal(await select.inputValue(), '27');
    await select.selectOption('33');
    assert.equal(await explorer.locator('[data-lab-next]').isDisabled(), true);
    assert.match(await explorer.locator('.lab-observed').innerText(), /Kilometre 33.*6:50\/km.*160 bpm/s);
    const comparison = await explorer.locator('.lab-scenario').innerText();
    assert.match(comparison, /This lap: 1:10 slower than target/);
    assert.match(comparison, /Recorded kilometres 27–33 \(7 complete watch laps\)/);
    assert.match(comparison, /43:23/);
    assert.match(comparison, /39:40/);
    assert.match(comparison, /Local block difference: 3:43 slower than target/);
    assert.match(comparison, /not cumulative time from the race start/);
    await p.locator('#lab-target-minutes').fill('6');
    await p.locator('#lab-target-seconds').fill('50');
    assert.match(await explorer.locator('.lab-scenario').innerText(), /This lap: matches the target/);
    for (const [minutes, seconds] of [['', '50'], ['1.5', '50'], ['0', '50'], ['5', '60'], ['5', '-1']]) {
      await p.locator('#lab-target-minutes').fill(minutes);
      await p.locator('#lab-target-seconds').fill(seconds);
      assert.equal(await explorer.locator('.lab-scenario').count(), 0, minutes + ':' + seconds + ' must clear stale calculations');
      assert.equal(await explorer.locator('.lab-chart-target').count(), 0, 'invalid target must clear scenario line');
      assert.match(await p.locator('#lab-target-error').innerText(), /Enter whole minutes/);
      assert.match(await explorer.locator('.lab-observed').innerText(), /6:50\/km.*160 bpm/s);
    }
    await p.locator('#lab-target-minutes').fill('5');
    await p.locator('#lab-target-seconds').fill('40');
    assert.equal(await explorer.locator('.lab-scenario').count(), 1);
    assert.equal(await p.locator('#lab-target-error').innerText(), '');
  });

  await test('No-JavaScript and failed data requests retain recorded tables without fake results', async () => {
    const plain = await page({javaScriptEnabled:false});
    await plain.p.goto(base + sydney);
    assert.equal(await plain.p.locator('[data-lab-controls]').isVisible(), false);
    assert.equal(await plain.p.locator('[data-lab-results]').innerText(), '');
    const table = plain.p.locator('table').filter({has:plain.p.locator('caption', {hasText:'Selected recorded kilometre splits at Sydney'})});
    assert.equal(await table.locator('tbody tr').count(), 8);
    assert.ok(await plain.p.locator('a[href="/assets/original/sydney-2026-chart-data.json"]').count());
    for (const kind of ['network', 'invalid']) {
      const {p, context} = await page();
      await context.route('**/assets/original/sydney-2026-chart-data.json', route => kind === 'network' ? route.abort() : route.fulfill({status:200, contentType:'application/json', body:JSON.stringify({race_km:[25],race_pace_seconds_per_km:[],race_heart_rate_bpm:[160]})}));
      await p.goto(base + sydney);
      await p.waitForFunction(() => document.querySelector('[data-lab-explorer]')?.dataset.ready === 'error');
      assert.equal(await p.locator('[data-lab-controls]').isVisible(), false);
      assert.equal(await p.locator('.lab-scenario').count(), 0);
      assert.match(await p.locator('[data-lab-load-status]').innerText(), /interactive comparison is unavailable/i);
      const recorded = p.locator('table').filter({has:p.locator('caption', {hasText:'Selected recorded kilometre splits at Sydney'})});
      assert.equal(await recorded.locator('tbody tr').count(), 8, kind + ' failure leaves real data readable');
    }
  });

  await test('Published canonical inventory and both sitemaps retain the four studies and new hub', async () => {
    const canonicals = new Map();
    for (const file of publicFiles(root)) {
      const html = fs.readFileSync(file, 'utf8');
      const canonical = [...html.matchAll(/<link\b[^>]*>/gi)].find(match => /\brel=["']canonical["']/i.test(match[0]));
      if (!canonical) continue;
      const url = canonical[0].match(/\bhref=["']([^"']+)["']/i)?.[1];
      assert.ok(url);
      assert.ok(!canonicals.has(url), 'duplicate canonical pages: ' + file + ' and ' + canonicals.get(url));
      canonicals.set(url, file);
    }
    const xml = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
    const human = fs.readFileSync(path.join(root, 'sitemap/index.html'), 'utf8');
    for (const route of ['/running-lab/', ...original.keys()]) {
      assert.ok(canonicals.has(domain + route));
      assert.ok(xml.includes('<loc>' + domain + route + '</loc>'), 'XML discovery: ' + route);
      assert.ok(human.includes('href="' + route + '"'), 'HTML discovery: ' + route);
    }
    assert.equal(publicFiles(path.join(root, 'running-lab')).length, 1, 'one new hub, no duplicate study articles');
  });
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
if (errors.length) results.push({name:'No uncaught browser errors', pass:false, errors});
fs.writeFileSync(path.join(output, 'running-lab-results.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify({browserTests:results.length, results}, null, 2));
if (results.some(result => !result.pass)) process.exitCode = 1;
