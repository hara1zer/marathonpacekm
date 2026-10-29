/* Original recorded-lap replay and explicit prediction assumptions. */
(function () {
  'use strict';
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  function whole(value, min, max) {
    if (String(value).trim() === '') return null;
    const number = Number(value);
    return Number.isInteger(number) && number >= min && number <= max ? number : null;
  }
  function readClock(hours, minutes, seconds) {
    const values = [whole(hours, 0, 23), whole(minutes, 0, 59), whole(seconds, 0, 59)];
    if (values.includes(null)) return null;
    const time = values[0] * 3600 + values[1] * 60 + values[2];
    return time > 0 ? time : null;
  }
  function clock(seconds, hours = true) {
    const value = Math.round(Math.abs(seconds));
    const h = Math.floor(value / 3600), m = Math.floor(value / 60) % 60, s = String(value % 60).padStart(2, '0');
    return hours ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${Math.floor(value / 60)}:${s}`;
  }
  function raceRows(data, year) {
    const race = data[year];
    if (!race) throw new Error('Choose an available recorded race.');
    const paces = race.pace_seconds_per_km, heartRates = race.lap_average_hr_bpm, elevation = race.lap_elevation_change_m;
    if (![paces, heartRates, elevation].every(Array.isArray) || !paces.length ||
        heartRates.length !== paces.length || elevation.length !== paces.length) throw new Error('Incomplete recorded laps.');
    return paces.map((pace, index) => {
      if (!finite(pace) || pace <= 0 || !finite(heartRates[index]) || heartRates[index] <= 0 || !finite(elevation[index])) throw new Error('Invalid recorded lap.');
      return {km:index + 1, pace, heartRate:heartRates[index], elevation:elevation[index]};
    });
  }
  function replayAt(rows, index, target) {
    if (!Number.isInteger(index) || index < 0 || index >= rows.length || !finite(target) || target <= 0) throw new Error('Invalid replay selection.');
    const recorded = rows.slice(0, index + 1).reduce((sum, row) => sum + row.pace, 0);
    return {lap:rows[index], count:index + 1, recorded, scenario:target * (index + 1), difference:recorded - target * (index + 1)};
  }
  function forecast(halfSeconds, exponent, goalSeconds = 14400) {
    if (!finite(halfSeconds) || halfSeconds <= 0 || !finite(exponent) || exponent < 1 || exponent > 1.3 || !finite(goalSeconds) || goalSeconds <= 0) return null;
    const factor = 2 ** exponent;
    return {projected:halfSeconds * factor, requiredHalf:goalSeconds / factor, margin:goalSeconds - halfSeconds * factor};
  }
  function trainingWindows(data) {
    const weeks = data.weekly_km, runs = data.runs, dates = data.week_start_2026;
    if (![weeks, runs, dates].every(Array.isArray) || weeks.length !== 12 || runs.length !== 12 || dates.length !== 12 ||
        weeks.some(km => !finite(km) || km < 0) || runs.some(n => !Number.isInteger(n) || n < 0)) throw new Error('Incomplete training record.');
    const sum = values => values.reduce((total, value) => total + value, 0);
    const window = (label, start, count) => ({label, start, count, first:dates[start], last:dates[start + count - 1],
      km:sum(weeks.slice(start, start + count)), weeklyKm:sum(weeks.slice(start, start + count)) / count,
      weeklyRuns:sum(runs.slice(start, start + count)) / count});
    let best = 0;
    for (let i = 1; i <= weeks.length - 4; i++) if (sum(weeks.slice(i, i + 4)) > sum(weeks.slice(best, best + 4))) best = i;
    return [window('All 12 complete weeks', 0, 12), window('Highest consecutive four weeks', best, 4),
      window('Final four complete weeks', 8, 4), window('Highest single week', weeks.indexOf(Math.max(...weeks)), 1)];
  }
  const api = {readClock, clock, raceRows, replayAt, forecast, trainingWindows};
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;

  const summary = (root, text, error = false) => {
    root.querySelector('[data-analysis-status]').textContent = text;
    root.dataset.ready = error ? 'error' : 'true';
  };
  async function fetchData(root) {
    const response = await fetch(root.dataset.source, {credentials:'same-origin'});
    if (!response.ok) throw new Error('Published source unavailable.');
    return response.json();
  }
  function replayChart(rows, index, target) {
    const lower = Math.floor((Math.min(target, ...rows.map(row => row.pace)) - 10) / 30) * 30;
    const upper = Math.ceil((Math.max(target, ...rows.map(row => row.pace)) + 10) / 30) * 30;
    const x = i => 50 + i / Math.max(1, rows.length - 1) * 590;
    const y = pace => 30 + (pace - lower) / (upper - lower) * 175;
    let svg = `<svg viewBox="0 0 680 250" role="img" aria-label="Recorded watch lap paces, selected kilometre ${index + 1}; dashed line is the hypothetical target"><text x="12" y="16">Pace (min/km); slower pace lower</text>`;
    for (const tick of [lower, (lower + upper) / 2, upper]) svg += `<line x1="50" x2="640" y1="${y(tick)}" y2="${y(tick)}" class="analysis-grid"/><text x="43" y="${y(tick) + 4}" text-anchor="end">${clock(tick, false)}</text>`;
    svg += `<line x1="50" x2="640" y1="${y(target)}" y2="${y(target)}" class="analysis-target"/>`;
    rows.forEach((row, i) => {
      svg += `<circle cx="${x(i)}" cy="${y(row.pace)}" r="${i === index ? 6 : 3}" class="${i === index ? 'analysis-selected' : 'analysis-point'}"><title>Recorded km ${row.km}: ${clock(row.pace, false)}/km, ${row.heartRate} bpm</title></circle>`;
      if (i === 0 || row.km % 5 === 0 || i === rows.length - 1) svg += `<text x="${x(i)}" y="231" text-anchor="middle">${row.km}</text>`;
    });
    return svg + '</svg>';
  }
  async function replay(root) {
    const $ = selector => root.querySelector(selector);
    try {
      const data = await fetchData(root);
      ['2025', '2026'].forEach(year => raceRows(data, year));
      const year = $('#replay-year'), lap = $('#replay-lap'), minutes = $('#replay-minutes'), seconds = $('#replay-seconds');
      function populate() {
        const rows = raceRows(data, year.value);
        lap.replaceChildren(...rows.map(row => new Option(`Recorded kilometre ${row.km}`, String(row.km))));
        render();
      }
      function render() {
        const rows = raceRows(data, year.value), index = Number(lap.value) - 1, row = rows[index];
        const m = whole(minutes.value, 1, 59), s = whole(seconds.value, 0, 59);
        minutes.setAttribute('aria-invalid', String(m === null)); seconds.setAttribute('aria-invalid', String(s === null));
        $('[data-replay-previous]').disabled = index === 0; $('[data-replay-next]').disabled = index === rows.length - 1;
        $('[data-replay-observed]').textContent = `${year.value} · recorded kilometre ${row.km}: ${clock(row.pace, false)}/km, ${row.heartRate} bpm, lap elevation change ${row.elevation > 0 ? '+' : ''}${row.elevation} m.`;
        if (m === null || s === null) {
          $('[data-analysis-error]').textContent = 'Enter whole minutes from 1 to 59 and seconds from 0 to 59.';
          $('[data-replay-results]').textContent = ''; $('[data-analysis-chart]').replaceChildren(); return;
        }
        $('[data-analysis-error]').textContent = '';
        const result = replayAt(rows, index, m * 60 + s);
        $('[data-replay-results]').innerHTML = `<dl class="analysis-metrics"><div><dt>Sum of ${result.count} full recorded laps</dt><dd>${clock(result.recorded)}</dd></div><div><dt>Same distance at chosen pace</dt><dd>${clock(result.scenario)}</dd></div><div><dt>Difference over those laps</dt><dd>${clock(result.difference, false)} ${result.difference === 0 ? '(equal)' : result.difference > 0 ? 'slower' : 'faster'}</dd></div></dl>`;
        $('[data-analysis-chart]').innerHTML = replayChart(rows, index, m * 60 + s);
      }
      year.addEventListener('change', populate);
      [lap, minutes, seconds].forEach(input => input.addEventListener('input', render));
      lap.addEventListener('change', render);
      $('[data-replay-previous]').addEventListener('click', () => {lap.selectedIndex--; render();});
      $('[data-replay-next]').addEventListener('click', () => {lap.selectedIndex++; render();});
      populate(); $('[data-analysis-controls]').hidden = false;
      summary(root, 'All 41 published full laps are available: 20 from 2025 and 21 from 2026.');
    } catch {
      $('[data-analysis-controls]').hidden = true;
      summary(root, 'Replay unavailable. The recorded tables and comparison below remain readable.', true);
    }
  }
  async function prediction(root) {
    const $ = selector => root.querySelector(selector);
    try {
      const data = await fetchData(root), windows = trainingWindows(data);
      function render() {
        const fields = ['#prediction-hours', '#prediction-minutes', '#prediction-seconds'].map(selector => $(selector));
        const seconds = readClock(...fields.map(input => input.value));
        fields.forEach((field, i) => field.setAttribute('aria-invalid', String(whole(field.value, 0, i === 0 ? 23 : 59) === null || seconds === null)));
        const exponentInput = $('#prediction-exponent'), exponent = Number(exponentInput.value);
        const exponentValid = exponentInput.value.trim() !== '' && finite(exponent) && exponent >= 1 && exponent <= 1.3;
        exponentInput.setAttribute('aria-invalid', String(!exponentValid));
        const result = seconds !== null && exponentValid ? forecast(seconds, exponent) : null;
        if (!result) {
          $('[data-analysis-error]').textContent = 'Enter a positive half-marathon time using whole hours (0–23), minutes and seconds (0–59), and an exponent from 1.00 to 1.30.';
          $('[data-prediction-results]').textContent = ''; return;
        }
        $('[data-analysis-error]').textContent = '';
        const window = windows[Number($('#prediction-window').value)];
        const displayedMargin = Math.round(result.margin);
        $('[data-prediction-results]').innerHTML = `<dl class="analysis-metrics"><div><dt>Mathematical marathon scenario</dt><dd>${clock(result.projected)}</dd></div><div><dt>Half time for exactly 4:00:00 at this exponent</dt><dd>${clock(result.requiredHalf)}</dd></div><div><dt>Compared with four hours</dt><dd>${clock(displayedMargin, false)} ${displayedMargin === 0 ? '(equal to displayed precision)' : displayedMargin > 0 ? 'under' : 'over'}</dd></div></dl><p class="analysis-window-result"><strong>Recorded training window:</strong> ${window.label} (${window.first}–${window.last} 2026), ${window.weeklyKm.toFixed(1)} km/week and ${window.weeklyRuns.toFixed(1)} runs/week. Changing this window changes the description of this build; it does not change the prediction or supply an endurance adjustment.</p>`;
      }
      root.querySelectorAll('input, select').forEach(input => {input.addEventListener('input', render); input.addEventListener('change', render);});
      render(); $('[data-analysis-controls]').hidden = false;
      summary(root, 'The 12 published training weeks are loaded. Try a time or assumption; the original record below stays fixed.');
    } catch {
      $('[data-analysis-controls]').hidden = true;
      summary(root, 'Interactive analysis unavailable. The worked predictions and complete training-window table below remain readable.', true);
    }
  }
  document.querySelectorAll('[data-race-replay]').forEach(replay);
  document.querySelectorAll('[data-prediction-lab]').forEach(prediction);
})();
