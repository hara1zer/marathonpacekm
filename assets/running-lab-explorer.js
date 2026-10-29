/* Selected recorded laps only. Scenario comparisons never reconstruct a race trace. */
(function (scope) {
  'use strict';

  function observations(data) {
    const arrays = [data.race_km, data.race_pace_seconds_per_km, data.race_heart_rate_bpm];
    if (!arrays.every(Array.isArray) || !arrays[0].length || !arrays.every(a => a.length === arrays[0].length)) {
      throw new Error('The recorded lap arrays are incomplete.');
    }
    return arrays[0].map((km, index) => {
      const pace = arrays[1][index], heartRate = arrays[2][index];
      if (!Number.isInteger(km) || km < 1 || (index && km <= arrays[0][index - 1]) ||
          !Number.isFinite(pace) || pace <= 0 || !Number.isFinite(heartRate) || heartRate <= 0) {
        throw new Error('The recorded lap values are invalid.');
      }
      return {km, pace, heartRate};
    });
  }

  function targetSeconds(minutes, seconds) {
    if (String(minutes).trim() === '' || String(seconds).trim() === '') return null;
    const m = Number(minutes), s = Number(seconds);
    return Number.isInteger(m) && m >= 1 && m <= 59 && Number.isInteger(s) && s >= 0 && s <= 59
      ? m * 60 + s : null;
  }

  function compareLap(rows, index, target) {
    if (!Number.isInteger(index) || index < 0 || index >= rows.length || !Number.isFinite(target) || target <= 0) {
      throw new Error('A recorded lap and positive target are required.');
    }
    let start = index;
    while (start > 0 && rows[start - 1].km + 1 === rows[start].km) start--;
    const block = rows.slice(start, index + 1);
    const recordedSeconds = block.reduce((total, row) => total + row.pace, 0);
    return {
      lap: rows[index], lapDifference: rows[index].pace - target,
      startKm: rows[start].km, endKm: rows[index].km, count: block.length,
      recordedSeconds, targetSeconds: target * block.length,
      blockDifference: recordedSeconds - target * block.length
    };
  }

  function clock(seconds) {
    const value = Math.round(Math.abs(seconds));
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  }

  function difference(seconds) {
    if (seconds === 0) return 'matches the target';
    return `${clock(seconds)} ${seconds > 0 ? 'slower' : 'faster'} than target`;
  }

  const api = {observations, targetSeconds, compareLap};
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;

  function chartMarkup(rows, selectedIndex, target) {
    const minKm = rows[0].km, maxKm = rows.at(-1).km;
    const lower = Math.floor((Math.min(...rows.map(row => row.pace), ...(target ? [target] : [])) - 10) / 30) * 30;
    const upper = Math.ceil((Math.max(...rows.map(row => row.pace), ...(target ? [target] : [])) + 10) / 30) * 30;
    const x = km => 62 + (km - minKm) / Math.max(1, maxKm - minKm) * 502;
    const y = pace => 45 + (pace - lower) / (upper - lower) * 174;
    const ticks = [lower, (lower + upper) / 2, upper];
    const title = 'Selected Sydney kilometre paces and a hypothetical target';
    const description = `Eight recorded watch laps, with no observation at kilometre 26. Dots are not joined. Selected kilometre ${rows[selectedIndex].km}.${target ? ` Dashed target line: ${clock(target)} per km, a mathematical scenario.` : ' Target comparison unavailable until a valid pace is entered.'}`;
    let svg = `<svg viewBox="0 0 620 275" role="img" aria-labelledby="lab-chart-title lab-chart-description"><title id="lab-chart-title">${title}</title><desc id="lab-chart-description">${description}</desc>`;
    svg += '<text x="12" y="20" class="lab-chart-axis">Pace (min/km) · slower pace lower</text>';
    for (const tick of ticks) {
      svg += `<line x1="62" x2="574" y1="${y(tick)}" y2="${y(tick)}" class="lab-chart-grid"/><text x="52" y="${y(tick) + 4}" text-anchor="end" class="lab-chart-axis">${clock(tick)}</text>`;
    }
    if (target) svg += `<line x1="62" x2="574" y1="${y(target)}" y2="${y(target)}" class="lab-chart-target"/>`;
    for (let km = minKm; km <= maxKm; km++) {
      svg += `<text x="${x(km)}" y="245" text-anchor="middle" class="lab-chart-axis">${km}</text>`;
      if (!rows.some(row => row.km === km)) svg += `<text x="${x(km)}" y="263" text-anchor="middle" class="lab-chart-missing">missing</text>`;
    }
    rows.forEach((row, index) => {
      svg += `<circle cx="${x(row.km)}" cy="${y(row.pace)}" r="${index === selectedIndex ? 7 : 4}" class="${index === selectedIndex ? 'lab-chart-selected' : 'lab-chart-point'}"><title>Kilometre ${row.km}: ${clock(row.pace)} per km, ${row.heartRate} bpm</title></circle>`;
    });
    return svg + '</svg><p class="lab-chart-key"><span>● Recorded watch lap</span><span>– – Hypothetical target (when valid)</span><span>No lines connect missing observations. Scroll the chart horizontally on small screens.</span></p>';
  }

  async function initialize(root) {
    const $ = name => root.querySelector(`[data-lab-${name}]`);
    const controls = $('controls'), status = $('load-status');
    try {
      const response = await fetch(root.dataset.source, {credentials: 'same-origin'});
      if (!response.ok) throw new Error('The published data could not be loaded.');
      const rows = observations(await response.json());
      $('chart').setAttribute('tabindex', '0');
      $('chart').setAttribute('role', 'region');
      $('chart').setAttribute('aria-label', 'Selected watch lap chart; scroll horizontally to inspect all kilometres');
      const select = $('km'), minutes = $('minutes'), seconds = $('seconds');
      rows.forEach(row => select.add(new Option(`Kilometre ${row.km}`, String(row.km))));
      let index = 0;
      function render() {
        index = rows.findIndex(row => String(row.km) === select.value);
        $('previous').disabled = index === 0;
        $('next').disabled = index === rows.length - 1;
        const target = targetSeconds(minutes.value, seconds.value);
        const invalid = target === null;
        const minuteInvalid = minutes.value.trim() === '' || !minutes.checkValidity() || !Number.isInteger(Number(minutes.value));
        const secondInvalid = seconds.value.trim() === '' || !seconds.checkValidity() || !Number.isInteger(Number(seconds.value));
        minutes.setAttribute('aria-invalid', String(minuteInvalid));
        seconds.setAttribute('aria-invalid', String(secondInvalid));
        $('error').textContent = invalid ? 'Enter whole minutes from 1 to 59 and seconds from 0 to 59. Target comparisons are unavailable until both values are valid.' : '';
        $('chart').innerHTML = chartMarkup(rows, index, target);
        const row = rows[index];
        const observed = `<div class="lab-observed"><p class="lab-result-kind">Recorded observation</p><h4>Kilometre ${row.km}</h4><dl><div><dt>Watch pace</dt><dd>${clock(row.pace)}/km</dd></div><div><dt>Average heart rate</dt><dd>${row.heartRate} bpm</dd></div></dl></div>`;
        if (invalid) {
          $('results').innerHTML = observed + '<p class="lab-scenario-unavailable">Enter a valid target to show mathematical comparisons. Recorded observations remain unchanged.</p>';
          return;
        }
        const result = compareLap(rows, index, target);
        const blockLabel = result.count === 1 ? `Recorded kilometre ${row.km} only` : `Recorded kilometres ${result.startKm}–${result.endKm} (${result.count} complete watch laps)`;
        $('results').innerHTML = observed + `<div class="lab-scenario"><p class="lab-result-kind">Mathematical scenario · ${clock(target)}/km</p><h4>This lap: ${difference(result.lapDifference)}</h4><p class="lab-block-label">${blockLabel}</p><dl><div><dt>Sum from rounded lap paces</dt><dd>${clock(result.recordedSeconds)}</dd></div><div><dt>Same laps at target pace</dt><dd>${clock(result.targetSeconds)}</dd></div></dl><p><strong>Local block difference: ${difference(result.blockDifference)}.</strong></p><p class="lab-block-limit">This local sum starts again after a missing observation. It is not cumulative time from the race start, an official checkpoint, or an estimate of a different finish.</p></div>`;
      }
      $('form').addEventListener('submit', event => event.preventDefault());
      [select, minutes, seconds].forEach(input => input.addEventListener('input', render));
      select.addEventListener('change', render);
      $('previous').addEventListener('click', () => {select.selectedIndex = Math.max(0, index - 1); render();});
      $('next').addEventListener('click', () => {select.selectedIndex = Math.min(rows.length - 1, index + 1); render();});
      render();
      controls.hidden = false;
      status.textContent = 'Eight published observations loaded. Choose a recorded kilometre or change the hypothetical target.';
      root.dataset.ready = 'true';
    } catch {
      controls.hidden = true;
      status.textContent = 'The interactive comparison is unavailable. Use the recorded chart and table above, or download the published JSON below. No missing values have been reconstructed.';
      root.dataset.ready = 'error';
    }
  }

  document.querySelectorAll('[data-lab-explorer]').forEach(initialize);
})(typeof globalThis === 'undefined' ? this : globalThis);
