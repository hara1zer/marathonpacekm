(() => {
  'use strict';
  const config = JSON.parse(document.getElementById('goal-config').textContent);
  const DISTANCE = 42.195;
  const MILE = 1.609344;
  const points = [[5, '5 km'], [10, '10 km'], [21.0975, 'Halfway'], [30, '30 km'], [40, '40 km'], [DISTANCE, 'Finish']];
  const $ = id => document.getElementById(id);
  const fields = ['h', 'm', 's'].map($);
  const links = Array.from(document.querySelectorAll('[data-current-band]'));
  const actions = ['share-btn', 'copy-btn', 'download-btn'].map($);
  let total = config.seconds;
  let valid = true;
  const pad = n => String(n).padStart(2, '0');
  const clock = seconds => {
    const s = Math.round(seconds);
    return `${Math.floor(s / 3600)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  };
  const pace = seconds => {
    const n = Math.round(seconds * 10);
    return `${Math.floor(n / 600)}:${pad(Math.floor(n / 10) % 60)}.${n % 10}`;
  };
  function rowsFor(unit) {
    const step = unit === 'mi' ? MILE : unit === '5km' ? 5 : 1;
    const rows = [];
    let previous = 0;
    for (let n = 1; n * step < DISTANCE - 1e-8; n++) {
      const distance = n * step;
      const elapsed = Math.round(total * distance / DISTANCE);
      rows.push([`${unit === 'mi' ? n : distance} ${unit === 'mi' ? 'mi' : 'km'}`, distance, elapsed, elapsed - previous]);
      previous = elapsed;
    }
    rows.push(['Finish (42.195 km)', DISTANCE, total, total - previous]);
    return rows;
  }
  function replaceRows(target, values) {
    const fragment = document.createDocumentFragment();
    for (const valuesRow of values) {
      const row = document.createElement('tr');
      valuesRow.forEach((value, i) => {
        const cell = document.createElement(i ? 'td' : 'th');
        if (!i) cell.scope = 'row';
        cell.textContent = value;
        row.appendChild(cell);
      });
      fragment.appendChild(row);
    }
    $(target).replaceChildren(fragment);
  }
  function updateFullSplits() {
    const unit = $('split-unit').value;
    const rows = rowsFor(unit);
    replaceRows('splits-body', rows.map(r => [r[0], clock(r[2]), clock(r[3])]));
    $('full-splits-label').textContent = `Every ${unit === 'mi' ? 'mile' : unit === '5km' ? '5 kilometres' : 'kilometre'} · ${clock(total)} marathon`;
    $('splits-caption').textContent = `Cumulative and segment times for a ${clock(total)} marathon`;
  }
  function inputValue() {
    for (const field of fields) {
      if (field.value.trim() === '' || !field.validity.valid || !Number.isInteger(Number(field.value))) {
        return {field, error: `Enter ${field.dataset.label} as a whole number from ${field.min} to ${field.max}.`};
      }
    }
    const seconds = Number($('h').value) * 3600 + Number($('m').value) * 60 + Number($('s').value);
    if (!(seconds > 0 && seconds < 86400)) return {field: $('h'), error: 'Enter a finish time greater than zero and less than 24 hours.'};
    return {seconds};
  }
  function event(name, detail = {}) {
    // Optional local analytics hook. No tracker, account or network request is added.
    document.dispatchEvent(new CustomEvent('mpk:action', {detail: {action: name, page: config.path, ...detail}}));
  }
  function render(explicit = false) {
    const input = inputValue();
    valid = !input.error;
    actions.forEach(button => button.disabled = !valid);
    $('manual-copy').hidden = true;
    $('action-status').textContent = '';
    fields.forEach(field => field.removeAttribute('aria-invalid'));
    if (!valid) {
      document.querySelector('.band-preview').hidden = true;
      $('stale-note').hidden = false;
      $('split-tables').hidden = true;
      $('result-km').textContent = '—';
      $('result-mi').textContent = '—';
      $('result-time').textContent = 'Check your finish time';
      $('band-target').textContent = 'Enter a valid finish time';
      links.forEach(link => { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); link.setAttribute('tabindex', '-1'); });
      $('input-error').textContent = explicit ? input.error : 'Complete the hours, minutes and seconds to update your plan.';
      $('input-error').hidden = false;
      if (explicit) { input.field.setAttribute('aria-invalid', 'true'); input.field.focus(); }
      return false;
    }
    total = input.seconds;
    document.querySelector('.band-preview').hidden = false;
    $('stale-note').hidden = true;
    $('split-tables').hidden = false;
    $('input-error').hidden = true;
    $('input-error').textContent = '';
    $('result-km').textContent = pace(total / DISTANCE);
    $('result-mi').textContent = pace(total * MILE / DISTANCE);
    $('result-time').textContent = clock(total);
    $('band-target').textContent = clock(total);
    const params = new URLSearchParams({h: String(Math.floor(total / 3600)), m: String(Math.floor(total / 60) % 60), s: String(total % 60), unit: 'km', strategy: 'even'});
    links.forEach(link => {
      params.set('unit', link.dataset.bandUnit || 'km');
      link.setAttribute('href', '/printable-pace-band/?' + params.toString());
      link.removeAttribute('aria-disabled'); link.removeAttribute('tabindex');
    });
    replaceRows('key-splits-body', points.map(([km, label]) => [km === DISTANCE ? 'Finish · 42.195 km' : km === DISTANCE / 2 ? 'Half · 21.0975 km' : label, clock(total * km / DISTANCE)]));
    replaceRows('mile-checkpoints-body', [5, 10, 15, 20, 25].map(miles => [`${miles} miles`, clock(total * miles * MILE / DISTANCE)]).concat([['Finish · 26.219 miles', clock(total)]]));
    document.querySelectorAll('#mile-checkpoints-body td').forEach(cell => cell.dataset.label = 'Elapsed time');
    $('key-caption').textContent = `Even-pace checkpoints for a ${clock(total)} marathon`;
    document.querySelectorAll('[data-band-km]').forEach(el => el.textContent = clock(total * Number(el.dataset.bandKm) / DISTANCE));
    updateFullSplits();
    if (explicit) {
      $('result-announcement').textContent = `${clock(total)} marathon. ${pace(total / DISTANCE)} per kilometre, ${pace(total * MILE / DISTANCE)} per mile. Checkpoints and pace-band link updated.`;
      event('calculate', {seconds: total});
    }
    return true;
  }
  function setTime(seconds) {
    $('h').value = Math.floor(seconds / 3600);
    $('m').value = Math.floor(seconds / 60) % 60;
    $('s').value = seconds % 60;
  }
  function restore() {
    const params = new URLSearchParams(location.hash.slice(1));
    if (!params.has('time')) return;
    const value = params.get('time');
    if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) >= 86400) {
      $('action-status').textContent = `This saved target is invalid. Showing the ${clock(config.seconds)} page default.`;
      setTime(config.seconds); render();
      $('action-status').textContent = `This saved target is invalid. Showing the ${clock(config.seconds)} page default.`;
      return;
    }
    setTime(Number(value)); render();
  }
  function openAnchor() {
    if (['#pace-chart', '#chartTable', '#full-splits'].includes(location.hash)) $('full-splits').open = true;
  }
  async function copy(value, success) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      $('action-status').textContent = success;
    } catch (_) {
      $('copy-text').value = value; $('manual-copy').hidden = false;
      $('copy-text').focus(); $('copy-text').select();
      $('action-status').textContent = 'Select and copy the text below.';
    }
  }
  $('goal-form').addEventListener('submit', e => { e.preventDefault(); render(true); });
  fields.forEach(field => field.addEventListener('input', () => render()));
  $('resetBtn').addEventListener('click', () => {
    setTime(config.seconds); $('split-unit').value = 'km'; $('full-splits').open = false; render(true);
  });
  $('split-unit').addEventListener('change', () => { if (valid) updateFullSplits(); });
  links.forEach(link => link.addEventListener('click', e => {
    if (!render(true)) { e.preventDefault(); return; }
    event('open_pace_band', {seconds: total});
  }));
  $('share-btn').addEventListener('click', async () => {
    if (!render()) return;
    await copy('https://marathonpacekm.com' + config.path + '#time=' + total, 'Plan link copied.');
    event('share_plan');
  });
  $('copy-btn').addEventListener('click', async () => {
    if (!render()) return;
    const lines = [`${clock(total)} marathon`, `${pace(total / DISTANCE)} / km · ${pace(total * MILE / DISTANCE)} / mile`, 'Cumulative elapsed times, including stops:', ...points.map(([km, label]) => `${label}: ${clock(total * km / DISTANCE)}`), 'https://marathonpacekm.com' + config.path];
    await copy(lines.join('\n'), 'Checkpoints copied.'); event('copy_checkpoints');
  });
  $('download-btn').addEventListener('click', () => {
    if (!render()) return;
    const rows = [['Checkpoint', 'Distance (km)', 'Elapsed (h:mm:ss)', 'Segment (h:mm:ss)'], ...rowsFor($('split-unit').value).map(r => [r[0], Number(r[1].toFixed(6)), clock(r[2]), clock(r[3])])];
    const csv = rows.map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a'); link.href = url;
    link.download = `marathon-splits-${clock(total).replace(/:/g, '-')}-${$('split-unit').value}.csv`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    $('action-status').textContent = 'CSV download started.'; event('download_splits');
  });
  document.querySelectorAll('a[href="#pace-chart"]').forEach(a => a.addEventListener('click', () => $('full-splits').open = true));
  window.addEventListener('hashchange', () => { restore(); openAnchor(); });
  document.querySelectorAll('[data-js]').forEach(el => el.hidden = false);
  render(); restore(); openAnchor();
})();
