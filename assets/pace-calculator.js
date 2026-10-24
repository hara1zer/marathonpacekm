/* Standalone calculator: one validated state for results, reload and all exports. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fields = ['h', 'm', 's', 'dist', 'pdfLayout', 'unit', 'strategy', 'cushion', 'negative', 'reading', 'paper', 'wrist'];
  const defaults = {h:'4', m:'0', s:'0', dist:'42.195', pdfLayout:'wrist', unit:'km', strategy:'even', cushion:'15', negative:'2', reading:'along', paper:'a4', wrist:'170'};
  const distances = {marathon:'42.195', half:'21.0975', '42.195':'42.195', '21.0975':'21.0975', '5':'5', '10':'10'};
  const bandButtons = ['pdfBtn', 'copyShareBtn', 'copyShareBtn2', 'openShareBtn'];
  let state = null;
  const clock = value => {
    const sec = Math.round(value);
    return `${Math.floor(sec/3600)}:${String(Math.floor(sec/60)%60).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
  };
  const pace = value => `${Math.floor(Math.round(value)/60)}:${String(Math.round(value)%60).padStart(2,'0')}`;
  function applyQuery() {
    const query = new URLSearchParams(location.search);
    for (const id of fields) {
      const key = id === 'pdfLayout' ? 'layout' : id;
      $(id).value = defaults[id];
      if (id !== 'dist' && query.has(key)) $(id).value = query.get(key);
    }
    const distance = query.get('distance') || query.get('dist');
    if (distance) $('dist').value = distances[distance] || '';
    if (!query.has('strategy') && query.get('style') === 'even') $('strategy').value = 'even';
    if (!query.has('strategy') && query.get('style') === 'neg') {
      $('strategy').value = 'negative';
      if (query.has('offset')) $('negative').value = Math.min(10, Math.round(Number(query.get('offset'))*42.195/60*10)/10);
    }
  }
  function params() {
    const q = new URLSearchParams();
    for (const id of fields) {
      const key = id === 'pdfLayout' ? 'layout' : id === 'dist' ? 'distance' : id;
      q.set(key, id === 'dist' ? (state.distance === 42.195 ? 'marathon' : state.distance === 21.0975 ? 'half' : $('dist').value) : $(id).value);
    }
    return q;
  }
  function elapsed(d) {
    if (d >= state.distance) return state.total;
    const even = state.total * d / state.distance;
    if (!state.band || $('strategy').value === 'even') return even;
    if ($('strategy').value === 'negative') return even + (2*Number($('negative').value)*60/state.distance)*(d-d*d/state.distance);
    const cushion = Number($('cushion').value);
    return even + (d <= 5 ? (2*cushion/5)*(d-d*d/10) : cushion-cushion*(d-5)/(state.distance-5));
  }
  function table(rows) {
    return '<table class="splits-table"><caption>Cumulative elapsed times, including stops</caption><thead><tr><th scope="col">Checkpoint</th><th scope="col">Time</th></tr></thead><tbody>' + rows.map(([label,km]) => `<tr><th scope="row">${label}</th><td>${clock(elapsed(km))}</td></tr>`).join('') + '</tbody></table>';
  }
  function exportsUI(message = '') {
    const enabled = Boolean(state && state.band);
    bandButtons.forEach(id => $(id).disabled = !enabled);
    $('printThisBtn').disabled = !state;
    $('shareUrl').value = enabled ? new URL('/printable-pace-band/?'+params(), location.origin).href : '';
    $('embedSnippet').value = enabled ? `<iframe src="${$('shareUrl').value.replaceAll('&','&amp;')}" title="Marathon and half-marathon pace band" width="100%" height="1000" loading="lazy"></iframe>` : '';
    const link = $('selectedBandLink');
    if (enabled) { link.href = $('shareUrl').value; link.removeAttribute('aria-disabled'); link.removeAttribute('tabindex'); }
    else { link.removeAttribute('href'); link.setAttribute('aria-disabled','true'); link.setAttribute('tabindex','-1'); }
    $('exportStatus').textContent = message || (enabled ? 'Your distance, exact time, pacing strategy and print settings are included in every pace-band export.' : 'Pace-band exports support marathon and half marathon. For 5 km or 10 km, use the splits below and Quick print.');
    $('shareMsg').textContent = ''; $('calcShareMsg').textContent = '';
  }
  function compute() {
    state = null;
    const controls = fields.map($);
    const valid = controls.every(el => el.value.trim() !== '' && el.checkValidity()) && ['h','m','s'].every(id => Number.isInteger(Number($(id).value)));
    const total = Number($('h').value)*3600 + Number($('m').value)*60 + Number($('s').value);
    const distance = Number($('dist').value);
    const band = [42.195,21.0975].includes(distance);
    const strategy = $('strategy').value;
    // Keep the later pace positive for the generator's planning shapes.
    const laterPace = total/distance - (strategy === 'controlled' ? Number($('cushion').value)/(distance-5) : strategy === 'negative' ? 2*Number($('negative').value)*60/distance : 0);
    if (!valid || total <= 0 || ![42.195,21.0975,5,10].includes(distance) || (band && laterPace <= 0)) {
      $('results').innerHTML = '<p role="alert">Enter valid whole hours (0–24), minutes and seconds (0–59), a supported distance and valid pacing settings. The later pace must remain positive.</p>';
      for (const id of ['checkpointTable','printBand','fullSplitsTable']) $(id).innerHTML = '';
      exportsUI('Enter valid inputs before sharing or printing.');
      return false;
    }
    state = {total,distance,band};
    $('cushionSettings').hidden = strategy !== 'controlled';
    $('negativeSettings').hidden = strategy !== 'negative';
    $('results').innerHTML = `<div class="kpi"><div class="fact"><div class="tiny muted2">Pace per km</div><strong>${pace(total/distance)}</strong></div><div class="fact"><div class="tiny muted2">Pace per mile</div><strong>${pace(total/distance*1.609344)}</strong></div><div class="fact"><div class="tiny muted2">Finish time</div><strong>${clock(total)}</strong></div><div class="fact"><div class="tiny muted2">Halfway time</div><strong>${clock(elapsed(distance/2))}</strong></div></div><p>${$('dist').selectedOptions[0].textContent} · ${band ? $('strategy').selectedOptions[0].textContent : 'Even pace'} · Pace labels round to a second; checkpoints use the exact target.</p>`;
    const unit = $('unit').value;
    let checkpoints = unit === 'mi' ? [5,10,15,20,25].map(d => [d+' mi',d*1.609344]) : [5,10,15,20,30,40].map(d => [d+' km',d]);
    if (distance === 42.195) checkpoints = checkpoints.filter(([,d])=>unit === 'mi' || ![15,20].includes(d)).concat([['Half (21.0975 km)',distance/2]]);
    if (distance <= 10) checkpoints = [1,2,3,4,5,6,7,8,9].map(d=>[d+' '+unit,d*(unit==='mi'?1.609344:1)]);
    checkpoints = checkpoints.filter(([,d])=>d<distance).sort((a,b)=>a[1]-b[1]).concat([['Finish',distance]]);
    $('checkpointTable').innerHTML = table(checkpoints);
    $('printBand').innerHTML = '<h3>Checkpoint reference: '+clock(total)+'</h3>'+table(checkpoints);
    const step = unit === 'mi' ? 1.609344 : 1;
    const full = Array.from({length:Math.ceil(distance/step)-1},(_,i)=>[(i+1)+' '+unit,(i+1)*step]).concat([['Finish ('+distance+' km)',distance]]);
    $('fullSplitsTable').innerHTML = table(full);
    exportsUI();
    const url = new URL(location.href); url.search = params().toString();
    history.replaceState(null,'',url);
    return true;
  }
  async function copy(id) {
    if (!compute() || !state.band) return;
    try { await navigator.clipboard.writeText($('shareUrl').value); $(id).textContent = 'Copied share link.'; }
    catch { $(id).textContent = 'Select and copy the share link below.'; }
  }
  $('calcBtn').addEventListener('click',compute);
  fields.forEach(id => $(id).addEventListener('input',compute));
  $('resetBtn').addEventListener('click',()=>{fields.forEach(id=>$(id).value=defaults[id]);compute();});
  $('copyShareBtn').addEventListener('click',()=>copy('calcShareMsg'));
  $('copyShareBtn2').addEventListener('click',()=>copy('shareMsg'));
  $('openShareBtn').addEventListener('click',()=>{if(compute() && state.band) window.open($('shareUrl').value,'_blank','noopener');});
  $('pdfBtn').addEventListener('click',()=>{if(compute() && state.band) window.open($('shareUrl').value+'&autoPrint=1','_blank','noopener');});
  $('printThisBtn').addEventListener('click',()=>{if(compute()) window.print();});
  window.addEventListener('popstate',()=>{applyQuery();compute();});
  applyQuery(); compute();
})();
