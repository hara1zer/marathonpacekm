/* Progressive enhancements: the article, tables and examples work without JS. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const MILE = 1.609344;
  const pace = seconds => {
    const s = Math.round(seconds);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };
  const parsePace = value => {
    const m = /^(\d{1,2}):([0-5]\d)$/.exec(value.trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
  };
  const number = id => $(id)?.value.trim() === '' ? NaN : Number($(id)?.value);
  const validFields = form => [...form.querySelectorAll('input,select')].filter(el => !el.disabled).every(el => el.validity.valid && el.value.trim() !== '');
  function state(prefix, message = '') {
    $(prefix + '-error').textContent = message;
    $(prefix + '-error').hidden = !message;
    $(prefix + '-result').hidden = !!message;
  }
  function enhance(id, update) {
    const form = $(id);
    if (!form) return;
    form.hidden = false;
    form.addEventListener('submit', e => { e.preventDefault(); update(form); });
    form.addEventListener('input', () => update(form));
    form.addEventListener('change', () => update(form));
    update(form);
  }
  enhance('treadmill-form', form => {
    const raw = $('tm-value').value.trim(), unit = $('tm-unit').value;
    const isPace = unit === 'min-km' || unit === 'min-mile';
    $('tm-format').textContent = isPace ? 'Use minutes:seconds, for example 6:00.' : 'Use a speed, for example 10 or 10.5.';
    const value = isPace ? parsePace(raw) : /^\d+(?:\.\d+)?$/.test(raw) ? Number(raw) : NaN;
    const kph = unit === 'kph' ? value : unit === 'mph' ? value * MILE : unit === 'min-km' ? 3600 / value : 3600 * MILE / value;
    if (!validFields(form) || !Number.isFinite(kph) || !(kph >= 1 && kph <= 40)) {
      state('tm', isPace ? 'Enter a pace as m:ss with seconds from 00 to 59, equivalent to 1–40 km/h.' : 'Enter a speed equivalent to 1–40 km/h.'); return;
    }
    state('tm');
    $('tm-kph').textContent = kph.toFixed(2) + ' km/h';
    $('tm-mph').textContent = (kph / MILE).toFixed(2) + ' mph';
    $('tm-km').textContent = pace(3600 / kph) + ' /km';
    $('tm-mile').textContent = pace(3600 * MILE / kph) + ' /mile';
    const duration = number('tm-duration');
    $('tm-distance').textContent = `${duration} minutes at this speed covers ${(kph * duration / 60).toFixed(2)} km (${(kph * duration / 60 / MILE).toFixed(2)} miles), excluding acceleration and pauses.`;
  });
  const dateLabel = date => new Intl.DateTimeFormat('en-AU', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(date);
  enhance('start-date-form', form => {
    const raw = $('plan-race-date').value;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(raw + 'T12:00:00Z') : new Date(NaN);
    if (!validFields(form) || !Number.isFinite(+date) || date.toISOString().slice(0,10) !== raw) {
      state('plan', 'Choose a valid race date.'); return;
    }
    state('plan');
    for (const weeks of [12,16,20]) {
      const start = new Date(date); start.setUTCDate(start.getUTCDate() - weeks * 7);
      $('plan-' + weeks).textContent = dateLabel(start);
    }
    $('plan-date-note').textContent = `Dates are exactly 12, 16 and 20 weeks before ${dateLabel(date)}. Align the first training week with your chosen plan; race-week conventions can differ.`;
  });
  enhance('taper-form', form => {
    const baseline = number('taper-baseline');
    const percentages = [number('taper-pct-3'),number('taper-pct-2'),number('taper-pct-1')];
    const weeks = Number($('taper-weeks').value), unit = $('taper-unit').value;
    $('taper-pct-3').disabled = weeks === 2;
    const active = weeks === 2 ? percentages.slice(1) : percentages;
    if (!validFields(form) || !(baseline > 0) || active.some(v => !(v > 0 && v <= 100))) {
      state('taper', 'Enter a positive training baseline and percentages from 1 to 100.'); return;
    }
    state('taper');
    const tr3 = $('taper-row-3'); tr3.hidden = weeks === 2;
    for (let i=0;i<3;i++) {
      const dist = baseline * percentages[i] / 100;
      $('taper-distance-' + (3-i)).textContent = dist.toFixed(1) + ' ' + unit;
    }
    const preRace = baseline * percentages[2] / 100;
    const race = unit === 'km' ? 42.195 : 42.195 / MILE;
    $('taper-race-total').textContent = `Race week: ${preRace.toFixed(1)} ${unit} before the race + ${race.toFixed(3)} ${unit} in the marathon = ${(preRace + race).toFixed(1)} ${unit} including race day. Warm-ups and cool-downs belong in the pre-race total.`;
    $('taper-warning').textContent = active.some((p,i) => i>0 && p>active[i-1]) ? 'Your weekly distance rises within the taper. Check that this is intentional; the progressive examples below decrease each week.' : 'These are distance budgets. Choose individual sessions with your existing programme; percentages do not assess fatigue or injury.';
  });
  document.querySelectorAll('[data-print-target]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      document.querySelectorAll('.print-target').forEach(el => el.classList.remove('print-target'));
      document.querySelectorAll(button.dataset.printTarget).forEach(el => el.classList.add('print-target'));
      document.body.classList.add('print-reference');
      window.print();
    });
  });
  window.addEventListener('afterprint', () => document.body.classList.remove('print-reference'));
})();
