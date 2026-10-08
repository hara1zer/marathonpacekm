import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const read = path => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');
const source = read('assets/site-telemetry.js');
assert.match(source, /G-04CFG6TG7N/, 'reuse the existing GA4 ID');
assert.doesNotMatch(source, /pagead2\.googlesyndication|adsbygoogle\.js/, 'unapproved ads must not load');
assert.match(source, /location\.origin \+ location\.pathname/, 'share inputs must not become page URLs');

function fixture(initial = null, embed = false, storageFailure = false) {
  const events = new Map(), scripts = [], bodyNodes = [], footerNodes = [];
  let reloads = 0, saved = initial;
  const build = tag => {
    const handlers = new Map(), children = [];
    const element = {
      tagName: tag, style: {}, children, handlers,
      appendChild(child) { children.push(child); return child; },
      append(...nodes) {children.push(...nodes);},
      setAttribute(key,value){this[key]=value;},
      addEventListener(type,fn){handlers.set(type,fn);},
      remove(){this.removed=true;},
      querySelector(query){return query==='button' ? this.children.flatMap(x=>x.children||[]).find(x=>x.tagName==='button') : null;},
      focus(){},
      click(){handlers.get('click')?.({preventDefault(){}});}
    };
    return element;
  };
  const head={appendChild(el){if(el.tagName==='script')scripts.push(el);return el;}};
  const footer={appendChild(el){footerNodes.push(el);}};
  const document={
    readyState:'loading', referrer:'https://search.example/query?runner=private',
    scripts,head,body:{appendChild(el){bodyNodes.push(el);}},
    createElement:build,
    querySelector(selector){
      if(selector==='footer')return footer;
      if(selector==='.mpkm-privacy-manage')return footerNodes[0];
      if(selector==='meta[name="google-adsense-account"]')return {content:'ca-pub-example'};
      return null;
    },
    addEventListener(type,fn){events.set(type,fn);}
  };
  const store = {
    getItem(){if(storageFailure)throw Error('blocked'); return saved;},
    setItem(_,next){if(storageFailure)throw Error('blocked');saved=next;}
  };
  const location={origin:'https://marathonpacekm.com',pathname:'/printable-pace-band/',href:'https://marathonpacekm.com/printable-pace-band/?runner=private',search:'?runner=private',reload(){reloads++;}};
  const window={dataLayer:[],location,localStorage:store,addEventListener:(name,fn)=>events.set(name,fn),setTimeout:fn=>fn(),requestIdleCallback:fn=>fn()};
  window.self=window;window.top=embed?{}:window;
  const context={document,window,location,URL,Map,Set,Date};
  runInNewContext(source,context);
  function ready(){events.get('DOMContentLoaded')?.();}
  function banner(){return bodyNodes.find(n=>n.className==='mpkm-privacy-banner'&&!n.removed);}
  function choose(index){const b=banner();assert.ok(b,'privacy banner should appear');const actions=b.children.find(x=>x.className==='mpkm-privacy-actions');assert.ok(actions);actions.children[index].click();}
  function managed(){footerNodes.find(x=>x.className==='mpkm-privacy-manage')?.click();}
  const layers=()=>window.dataLayer.map(item=>Array.from(item));
  return {document,window,location,events,scripts,bodyNodes,footerNodes,ready,banner,choose,managed,layers,get saved(){return saved;},get reloads(){return reloads;}};
}

// Initial no-choice: no tags, zero events and a first-visit choice.
const first=fixture();
assert.equal(first.window.gtag,undefined);
assert.equal(first.scripts.length,0);
first.ready();
assert.ok(first.banner());
assert.equal(first.footerNodes.length,1);
first.events.get('mpk:action')({detail:{action:'calculate',private:'no'}});
assert.equal(first.window.gtag,undefined);
first.choose(0);
assert.equal(first.saved,'allow');
assert.equal(first.layers().filter(x=>x[0]==='config').length,1);
assert.equal(first.layers().find(x=>x[0]==='set')[1].page_location,'https://marathonpacekm.com/printable-pace-band/');
assert.equal(first.layers().find(x=>x[0]==='set')[1].page_referrer,'https://search.example/query');
first.events.get('load')?.();
assert.deepEqual(first.scripts.map(x=>x.src),['https://www.googletagmanager.com/gtag/js?id=G-04CFG6TG7N']);
first.events.get('mpk:action')({detail:{action:'calculate',private:'private-runner',raceTime:'3:30'}});
let event=first.layers().find(x=>x[0]==='event'&&x[1]==='pace_calculator_calculate');
assert.ok(event);
assert.deepEqual(Object.keys(event[2]),['page_location']);
assert.doesNotMatch(JSON.stringify(first.layers()),/private-runner|raceTime=|runner=private/);
first.events.get('mpk:action')({detail:{action:'bad',private:'no'}});
assert.equal(first.layers().filter(x=>x[0]==='event').length,1,'reject unknown actions');

// Band events share the consent gate and reject every non-enumerated value.
assert.equal(first.window.mpkmTrackBand('pace_band_print_intent', {race_distance:'half_marathon',output_type:'wrist',runner:'private-runner',page_location:'?private'}),true);
const bandEvent=first.layers().at(-1);
assert.deepEqual(Object.keys(bandEvent[2]),['page_location','race_distance','output_type']);
assert.equal(bandEvent[2].page_location,'https://marathonpacekm.com/printable-pace-band/');
assert.equal(first.window.mpkmTrackBand('unknown',{}),false);

// Review and decline: revoke and refresh so the Google tag stops running.
first.managed();first.choose(1);
assert.equal(first.saved,'decline');
assert.equal(first.reloads,1);
assert.equal(first.layers().at(-1)[0],'consent');
assert.equal(first.layers().at(-1)[2].analytics_storage,'denied');
assert.equal(first.window['ga-disable-G-04CFG6TG7N'],true);
assert.equal(first.window.mpkmTrackBand('pace_band_print_intent',{output_type:'wrist'}),false);

// A saved denial must suppress all downloads even after load.
const denied=fixture('decline');
denied.ready();denied.events.get('load')?.();
assert.equal(denied.banner(),undefined);
assert.equal(denied.scripts.length,0);
assert.equal(denied.window.gtag,undefined);
denied.managed();denied.choose(0);
assert.equal(denied.saved,'allow');
assert.equal(denied.layers().filter(x=>x[0]==='config').length,1);

// Persisted permission initialises once; cached/script re-entry does not duplicate tags.
const allowed=fixture('allow');
allowed.ready();allowed.events.get('load')?.();
runInNewContext(source,{document:allowed.document,window:allowed.window,location:allowed.location,URL,Map,Set,Date});
assert.equal(allowed.layers().filter(x=>x[0]==='config').length,1);
assert.equal(allowed.scripts.length,1);

// Embed pages and unavailable storage shouldn't accidentally opt in.
const embedded=fixture(null,true);
embedded.ready();
assert.equal(embedded.scripts.length,0);
assert.equal(embedded.footerNodes.length,0);
const blocked=fixture(null,false,true);
blocked.ready();blocked.choose(1);
assert.equal(blocked.window.gtag,undefined);

console.log('Consent-first GA4: default-off, accept, decline, revocation, embedding and path-only events passed.');

// Withdrawing before load must also cancel the pending tag download.
const pending=fixture('allow');pending.ready();pending.managed();pending.choose(1);pending.events.get('load')?.();assert.equal(pending.scripts.length,0);
const otherTab=fixture('allow');otherTab.ready();otherTab.events.get('storage')({key:'mpkm_analytics_choice_v1',newValue:'decline'});assert.equal(otherTab.saved,'decline');assert.equal(otherTab.window.mpkmTrackBand('pace_band_print_intent'),false);
assert.equal(first.layers().find(x=>x[0]==='consent'&&x[1]==='default')[2].analytics_storage,'denied');
assert.equal(first.layers().find(x=>x[0]==='config')[2].allow_google_signals,false);
