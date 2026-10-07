import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../../printable-pace-band/index.html', import.meta.url), 'utf8');
const script = html.split('<script>').at(-1).split('</script>')[0];

function load(search = '') {
  const elements = new Map();
  function element(id, value = '') {
    const listeners = {};
    const el = {
      id, hidden: false, disabled: false, checked: false,
      textContent: '', innerHTML: '', dataset: {}, attributes: {},
      style: { setProperty() {} },
      addEventListener(type, fn) { (listeners[type] ??= []).push(fn); },
      fire(type = 'input') { for (const fn of listeners[type] ?? []) fn({preventDefault() {}, button: 0}); },
      setAttribute(key, val) { this.attributes[key] = val; },
      removeAttribute(key) { delete this.attributes[key]; },
      getAttribute(key) { return this.attributes[key] ?? null; },
      checkValidity() {
        const n = Number(this.value);
        const max = ['m', 's', 'paceS'].includes(id) ? 59 :
          id === 'h' ? 24 : id === 'paceM' ? 199 :
          id === 'startCushion' ? 120 : id === 'negativeMargin' ? 10 : Infinity;
        return this.value !== '' && Number.isFinite(n) && n >= 0 && n <= max &&
          (id === 'negativeMargin' ? n * 2 === Math.round(n * 2) : true);
      }
    };
    let currentValue = String(value);
    Object.defineProperty(el, 'value', {
      get() { return currentValue; },
      set(next) { currentValue = String(next); }
    });
    let isChecked = false;
    Object.defineProperty(el, 'checked', {
      get() { return isChecked; },
      set(value) {
        isChecked = Boolean(value);
        if (isChecked && ['marathon','half'].includes(id)) {
          for (const [otherId, other] of elements) {
            if (otherId !== id && ['marathon','half'].includes(otherId)) other.checked = false;
          }
        }
      }
    });
    elements.set(id, el);
    return el;
  }
  for (const [id, value] of Object.entries({
    h: '4', m: '0', s: '0', paceM: '5', paceS: '41', unit: 'km',
    strategy: 'even', startCushion: '15', negativeMargin: '2',
    runnerName: '', raceName: '', paper: 'a4', wristSize: '170'
  })) element(id, value);
  const ids = ['goalError','paceError','strategyError','paceLabel','strategyHelp','controlledSettings',
    'negativeSettings','evenSettings','evenFiveK','controlledFiveK','controlledRecovery',
    'summaryCards','wristPreview','phonePreview','splitTableWrap','splitSummary',
    'embedCode','status','outputDescription','printBand1','printBand2','printBand3',
    'downloadBtn','downloadBtnInline','printBtn','printBtnInline','copyBtn','copyEmbedBtn',
    'printA4Btn','outputs','paperPageStyle','bandDimension','bandHeading','bandSummary'];
  ids.forEach(id => element(id));
  const races = [element('marathon'), element('half')];
  races[0].value = 'marathon'; races[0].checked = true;
  races[1].value = 'half';
  const presets = [10800,12600,14400,16200,18000,19800].map((n,i) => {
    const e = element('preset'+i);
    e.dataset.goalSeconds = String(n);
    return e;
  });
  const other = {
    '#outputs > h2': element('outputTitle'),
    '.print-title': element('printTitle'),
    '.print-instructions': element('printInstructions')
  };
  const doc = {
    getElementById(id) { return elements.get(id); },
    querySelectorAll(selector) {
      return selector === '.goal-preset' ? presets : selector === 'input[name="distance"]' ? races : [];
    },
    querySelector(selector) {
      if (selector === 'input[name="distance"]:checked') return races.find(e => e.checked);
      if (selector === 'input[name="distance"][value="half"]') return races[1];
      return other[selector];
    },
    documentElement: {style: {setProperty(name, value) { this[name] = value; }}},
    body: {dataset: {}}
  };
  const context = {
    document: doc,
    window: {
      location: {href: 'https://marathonpacekm.com/printable-pace-band/' + search, search, origin:'https://marathonpacekm.com', pathname:'/printable-pace-band/'},
      gtag(...args) { context.events.push(args); },
      setTimeout() { return 1; }, clearTimeout() {}, print() { context.prints++; },
      isSecureContext: false
    },
    URL, URLSearchParams, Blob, Image: class {},
    navigator: {}, console, prints: 0, events: []
  };
  context.window.self = context.window; context.window.top = context.window;
  vm.runInNewContext(script, context);
  return {
    get: id => elements.get(id),
    race: (value) => {
      races.forEach(e => e.checked = e.value === value);
      races.find(e => e.value === value).fire('change');
    },
    set(id, value, event = 'input') { elements.get(id).value = String(value); elements.get(id).fire(event); },
    ctx: context,
    presets
  };
}

function rows(app) {
  const body = app.get('splitTableWrap').innerHTML;
  return [...body.matchAll(/<tr><td>([^<]+)<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><\/tr>/g)]
    .map(([,label,segment,elapsed]) => ({label,segment,elapsed}));
}
function seconds(time) { return time.split(':').reduce((sum,part) => sum * 60 + Number(part), 0); }
function schedule(app, goal) {
  const r = rows(app);
  assert.equal(r.at(-1).elapsed, goal);
  let prior = 0;
  for (const row of r) {
    const elapsed = seconds(row.elapsed);
    assert.equal(seconds(row.segment), elapsed - prior, row.label);
    assert.ok(elapsed > prior, row.label);
    prior = elapsed;
  }
  return r;
}

let app = load();
assert.equal(app.get('strategy').value, 'even');
app.set('h', '3'); app.set('m', '30');
let r = schedule(app, '3:30:00');
assert.equal(r.find(x => x.label === '40').elapsed, '3:19:05');
assert.equal(r.at(-1).segment, '0:58');
app.set('h', '4'); app.set('m', '0'); app.set('unit', 'mi', 'change');
r = schedule(app, '4:00:00');
assert.equal(r.find(x => x.label === '26').elapsed, '3:58:00');
assert.equal(r.at(-1).segment, '2:00');

app.race('half'); app.set('h', '2'); app.set('m', '0'); app.set('unit', 'km', 'change');
r = schedule(app, '2:00:00');
assert.equal(r.find(x => x.label === '5').elapsed, '28:26');
assert.equal(r.find(x => x.label === '10').elapsed, '56:53');
assert.equal(r.find(x => x.label === '20').elapsed, '1:53:45');
assert.equal(r.find(x => x.label === '21').elapsed, '1:59:27');
assert.equal(r.at(-1).segment, '0:33');
assert.match(app.get('wristPreview').innerHTML, /Half marathon/);
assert.match(app.get('bandSummary').textContent, /Six readable/);
assert.match(app.get('phonePreview').innerHTML, /FINISH/);
assert.match(app.get('embedCode').value, /distance=half/);
app.set('strategy', 'negative');
schedule(app, '2:00:00');
app.set('strategy', 'controlled');
schedule(app, '2:00:00');
app.set('strategy', 'even');
app.set('unit', 'mi', 'change');
r = schedule(app, '2:00:00');
assert.equal(r.find(x => x.label === '13').elapsed, '1:59:00');
assert.equal(r.at(-1).elapsed, '2:00:00');
app.set('unit', 'km', 'change');

app.set('paceS', '60');
assert.equal(app.get('outputs').hidden, true);
assert.equal(app.get('printBtn').disabled, true);
assert.match(app.get('paceError').textContent, /0–59/);
assert.equal(app.get('h').value, '2');
app.set('paceS', '41');
assert.equal(app.get('outputs').hidden, false);
app.set('s', '60');
assert.equal(app.get('outputs').hidden, true);
app.set('s', '0');
app.set('strategy', 'negative');
app.set('negativeMargin', '1.3');
assert.equal(app.get('outputs').hidden, true);
assert.match(app.get('strategyError').textContent, /steps of 0.5/);
app.set('negativeMargin', '2');
assert.equal(app.get('outputs').hidden, false);
app.set('h', '0'); app.set('m', '1');
assert.equal(app.get('outputs').hidden, true);
app.set('h', '2'); app.set('m', '0');
assert.equal(app.get('outputs').hidden, false);
app.set('paper', 'letter', 'change');
assert.match(app.get('paperPageStyle').textContent, /letter landscape/);
app.set('wristSize', '150', 'change');
assert.match(app.get('bandDimension').textContent, /174 × 38 mm/);
assert.equal(app.ctx.document.documentElement.style['--band-length'], '174mm');
assert.match(app.get('embedCode').value, /paper=letter/);
assert.match(app.get('embedCode').value, /wrist=150/);

app = load('?h=4&m=0&s=0&unit=km&strategy=controlled&cushion=15');
assert.equal(app.get('strategy').value, 'controlled');
schedule(app, '4:00:00');
assert.match(app.get('wristPreview').innerHTML, /28:41/);
app.set('strategy', 'negative');
app.set('negativeMargin', '2');
schedule(app, '4:00:00');
assert.match(app.get('wristPreview').innerHTML, /HALF.*2:01:00/);
console.log('Pace-band calculation, validation and share-link regressions passed');

// Historical conversions must retain their fractional values and original schedule.
for (const [query, strategy, adjustment] of [
  ['?h=4&m=0&s=0&strategy=controlled&start=5', 'controlled', 12.5],
  ['?h=4&m=0&s=0&style=neg&offset=1', 'negative', 0.7]
]) {
  const legacy = load(query);
  assert.equal(legacy.get('printBtn').disabled, false);
  const oldRows = schedule(legacy, '4:00:00');
  for (let i=0; i<oldRows.length; i++) {
    const d = Math.min(i+1, 42.195);
    const extra = strategy === 'negative'
      ? (2*adjustment*60/42.195)*(d-d*d/42.195)
      : d <= 5 ? (2*adjustment/5)*(d-d*d/10) : adjustment*(42.195-d)/(42.195-5);
    assert.equal(seconds(oldRows[i].elapsed), Math.round(14400*d/42.195+extra));
  }
  const iframe = legacy.get('embedCode').value.replaceAll('&amp;', '&');
  const shared = new URL(iframe.match(/src="([^"]+)"/)[1]);
  const restored = load(shared.search);
  assert.deepEqual(rows(restored), oldRows);
  assert.equal(restored.get('printBtn').disabled, false);
}
app = load('?distance=half&h=2&m=0&s=0&unit=mi&strategy=negative&negative=0.7&paper=letter&wrist=150');
assert.equal(app.get('half').checked, true);
assert.equal(app.get('marathon').checked, false);
assert.equal(app.get('unit').value, 'mi');
assert.equal(app.get('paper').value, 'letter');
assert.equal(app.get('wristSize').value, '150');
schedule(app, '2:00:00');
assert.equal(app.get('printBtn').disabled, false);
assert.match(app.get('wristPreview').innerHTML, /Half marathon/);
app.set('negativeMargin', '0.7'); // newly entered invalid increment gets accurate feedback
assert.equal(app.get('printBtn').disabled, true);
assert.match(app.get('strategyError').textContent, /steps of 0.5/);

app = load('?name=PrivateName&race=PrivateRace');
assert.equal(app.ctx.events.length, 0);
app.set('h', '3', 'input');
app.get('h').fire('change');
app.set('m', '30', 'change');
assert.equal(app.ctx.events.filter(e=>e[1] === 'pace_band_plan_ready').length, 1);
app.set('s', '60'); app.get('s').fire('blur'); app.get('s').fire('blur');
assert.equal(app.ctx.events.filter(e=>e[1] === 'pace_band_validation_error').length, 1);
app.set('s','0'); app.get('printBtn').fire('click');
assert.equal(app.ctx.events.filter(e=>e[1] === 'pace_band_print_intent').length, 1);
assert.ok(!JSON.stringify(app.ctx.events).match(/PrivateName|PrivateRace|\?name|confirmed_print/));
app.set('m',''); assert.equal(app.get('outputs').hidden,true);
app.set('m','30'); assert.equal(app.get('outputs').hidden,false);
app.set('unit','mi','change'); schedule(app,'3:30:00');
console.log('Legacy schedules, half-marathon restoration, radio semantics and privacy-safe events passed');

app = load('?distance=half&h=24&m=59&s=59&unit=mi');
assert.equal(app.get('printBtn').disabled, false);
schedule(app,'24:59:59');
app.set('unit','km','change'); schedule(app,'24:59:59');
app = load(); app.set('paceM','199'); app.set('paceS','59');
assert.equal(app.get('printBtn').disabled,true);
assert.equal(app.get('paceM').getAttribute('aria-invalid'),'true');
console.log('Long-goal unit conversion and conversion-limit accessibility passed');
