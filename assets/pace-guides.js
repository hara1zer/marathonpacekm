/* Progressive enhancement of delivered pace charts and the final-week worksheet. */
(() => {
  'use strict';
  const math = window.MPKMPaceMath;
  if (!math) return;
  const $ = id => document.getElementById(id);
  const action = name => document.dispatchEvent(new CustomEvent('mpk:action', {detail:{action:name}}));
  function rows(target, values) {
    target.replaceChildren(...values.map(([label, value]) => {
      const tr = document.createElement('tr'), th = document.createElement('th'), td = document.createElement('td');
      th.scope = 'row'; th.textContent = label; td.textContent = value;
      tr.append(th, td); return tr;
    }));
  }
  function state(prefix, message) {
    $(prefix + '-error').textContent = message || '';
    $(prefix + '-error').hidden = !message;
    $(prefix + '-result').hidden = Boolean(message);
  }
  function enhance(id, update) {
    const form = $(id);
    if (!form) return;
    const run = () => {
      form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
      return update(form);
    };
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (run()) action('calculate');
      else {
        const bad = Array.from(form.querySelectorAll('input,select')).find(el => !el.validity.valid || !el.value.trim()) || form.querySelector('input');
        bad?.setAttribute('aria-invalid','true'); bad?.focus();
      }
    });
    form.addEventListener('input', run);
    form.addEventListener('change', run);
    form.hidden = false;
    run();
  }
  let halfTotal = 7200;
  if ($('half-chart-form')) {
    const query = new URLSearchParams(location.search);
    if (math.parseFinish(query.get('time')) != null) $('hc-value').value = query.get('time');
    const band = $('hc-band');
    $('hc-mode').addEventListener('input', () => {
      const finish = $('hc-mode').value === 'finish';
      $('hc-value-label').textContent = finish ? 'Finish time (h:mm:ss)' : 'Pace (m:ss)';
      $('hc-value').value = finish ? math.clock(halfTotal) : math.pace(halfTotal / math.HALF * ($('hc-unit').value === 'mile' ? math.MILE : 1), 1);
    });
    enhance('half-chart-form', () => {
      const isFinish = $('hc-mode').value === 'finish';
      const raw = isFinish ? math.parseFinish($('hc-value').value) : math.parsePace($('hc-value').value);
      const total = raw == null ? null : isFinish ? raw : raw * math.HALF / ($('hc-unit').value === 'mile' ? math.MILE : 1);
      if (!(total > 0 && Math.round(total) > 0 && Math.round(total) < 86400)) {
        state('hc', 'Enter h:mm:ss for a positive finish under 24 hours, or a positive m:ss pace with seconds below 60.');
        band.removeAttribute('href'); band.setAttribute('aria-disabled','true'); return false;
      }
      state('hc'); halfTotal = total;
      $('hc-summary').textContent = `${math.clock(total)} finish · ${math.pace(total / math.HALF,1)}/km · ${math.pace(total / math.HALF * math.MILE,1)}/mile`;
      rows($('hc-splits'), math.halfSplits(total).map(({km,seconds}) => [km === math.HALF ? 'Finish · 21.0975 km' : km + ' km', math.clock(seconds)]));
      const t = Math.round(total), unit = $('hc-unit').value === 'mile' ? 'mi' : 'km';
      band.href = '/printable-pace-band/?' + new URLSearchParams({distance:'half', h:String(Math.floor(t / 3600)), m:String(Math.floor(t / 60) % 60), s:String(t % 60), unit, strategy:'even'}) + '#generator';
      band.removeAttribute('aria-disabled'); return true;
    });
    band.addEventListener('click', event => {
      if (!band.hasAttribute('href')) { event.preventDefault(); return; }
      action('open_pace_band');
    });
  }
  let trackPace = 300;
  if ($('track-pace-form')) {
    $('track-mode').addEventListener('input', () => {
      const mode = $('track-mode').value;
      $('track-value-label').textContent = mode === 'lap' ? '400 m time (m:ss)' : 'Pace (m:ss)';
      $('track-value').value = math.pace(trackPace * (mode === 'lap' ? .4 : mode === 'mile' ? math.MILE : 1),1);
    });
    enhance('track-pace-form', () => {
      const input = math.parsePace($('track-value').value), mode = $('track-mode').value;
      if (input == null) { state('track','Enter a positive minutes:seconds value, with seconds below 60.'); return false; }
      trackPace = input / (mode === 'lap' ? .4 : mode === 'mile' ? math.MILE : 1);
      state('track');
      $('track-summary').textContent = `${math.pace(trackPace,1)}/km · ${math.pace(trackPace * math.MILE,1)}/mile · ${math.pace(trackPace * .4,1)} per 400 m`;
      rows($('track-times'), math.trackTimes(trackPace).map(({metres,seconds}) => [metres.toLocaleString('en-AU') + ' m', math.pace(seconds,1)]));
      return true;
    });
  }
  enhance('half-taper-form', form => {
    const invalid = Array.from(form.querySelectorAll('input')).some(el => !el.value.trim() || !el.validity.valid);
    if (invalid) { state('ht','Complete the baseline, percentage, warm-up and day shares within their displayed ranges.'); return false; }
    const baseline = Number($('ht-baseline').value), pct = Number($('ht-percentage').value);
    const weights = [6,5,4,3,2,1].map(n => Number($('ht-day-' + n).value));
    let plan;
    try { plan = math.taperSchedule(baseline, pct, weights); }
    catch (_) { state('ht','Give at least one training day a positive share. Zero leaves a day unallocated.'); return false; }
    const unit = $('ht-unit').value, race = math.HALF / (unit === 'miles' ? math.MILE : 1), warmup = Number($('ht-warmup').value);
    state('ht');
    $('ht-summary').textContent = `${plan.total.toFixed(1)} ${unit} training before the race, from a ${baseline.toFixed(1)} ${unit} baseline at ${pct}%.`;
    rows($('ht-days'), plan.days.map((value, i) => ['Day −' + (6-i), value.toFixed(1) + ' ' + unit]));
    $('ht-total').textContent = `Race-window total: ${plan.total.toFixed(1)} ${unit} training + ${warmup.toFixed(1)} ${unit} race-day warm-up/cool-down + ${race.toFixed(4)} ${unit} race = ${(plan.total + warmup + race).toFixed(1)} ${unit}.`;
    return true;
  });
  enhance('pace-conversion-form', () => {
    const value = math.parsePace($('pc-value').value), from = $('pc-unit').value;
    if (value == null) { state('pc','Enter a positive minutes:seconds pace, with seconds below 60.'); return false; }
    state('pc');
    const km = value / (from === 'mile' ? math.MILE : 1);
    $('pc-summary').textContent = `${math.pace(km,1)} /km = ${math.pace(km * math.MILE,1)} /mile`;
    return true;
  });
  document.querySelectorAll('[data-pace-print]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const target = document.querySelector(button.dataset.pacePrint);
      if (!target || target.querySelector('[role="alert"]:not([hidden])')) return;
      document.querySelectorAll('.print-target').forEach(el => el.classList.remove('print-target'));
      target.classList.add('print-target'); document.body.classList.add('print-reference');
      action('print_reference'); window.print();
    });
  });
  window.addEventListener('afterprint', () => document.body.classList.remove('print-reference'));
})();
