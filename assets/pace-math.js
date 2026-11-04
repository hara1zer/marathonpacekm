/* Arithmetic only: unit conversions, even splits and user-chosen distance budgets. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MPKMPaceMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const MILE = 1.609344, HALF = 21.0975;
  const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;
  function parsePace(raw) {
    const m = /^(\d{1,2}):([0-5]\d(?:\.\d)?)$/.exec(String(raw).trim());
    if (!m) return null;
    const value = Number(m[1]) * 60 + Number(m[2]);
    return positive(value) ? value : null;
  }
  function parseFinish(raw) {
    const m = /^(\d{1,2}):([0-5]\d):([0-5]\d)$/.exec(String(raw).trim());
    if (!m) return null;
    const value = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
    return value > 0 && value < 86400 ? value : null;
  }
  function clock(value) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError('Invalid elapsed time');
    const s = Math.round(value);
    return `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  function pace(value, decimals = 0) {
    if (!positive(value)) throw new RangeError('Invalid pace');
    const scale = decimals === 1 ? 10 : 1;
    const n = Math.round(value * scale);
    const mins = Math.floor(n / (60 * scale));
    const secs = Math.floor(n / scale) % 60;
    return `${mins}:${String(secs).padStart(2, '0')}${scale === 10 ? '.' + n % 10 : ''}`;
  }
  function halfSplits(total) {
    if (!positive(total) || total >= 86400) throw new RangeError('Invalid finish time');
    return [5, 10, 15, 20, HALF].map(km => ({km, seconds: total * km / HALF}));
  }
  function trackTimes(secondsPerKm) {
    if (!positive(secondsPerKm)) throw new RangeError('Invalid pace');
    return [200, 400, 800, 1000, 1600].map(metres => ({metres, seconds: secondsPerKm * metres / 1000}));
  }
  function taperSchedule(baseline, percentage, weights) {
    if (!positive(baseline) || !positive(percentage) || percentage > 100 ||
        !Array.isArray(weights) || weights.length !== 6 || weights.some(v => !Number.isFinite(v) || v < 0)) {
      throw new RangeError('Check the baseline, percentage and six day weights');
    }
    const sum = weights.reduce((a, b) => a + b, 0);
    if (!positive(sum)) throw new RangeError('At least one day must have a positive weight');
    // Allocate tenth-unit budgets by largest remainder so displayed daily values add up.
    const tenths = Math.round(baseline * percentage / 10);
    const raw = weights.map(w => tenths * w / sum);
    const days = raw.map(Math.floor);
    const order = raw.map((v, i) => ({i, remainder:v - days[i]})).filter(x => weights[x.i] > 0)
      .sort((a, b) => b.remainder - a.remainder || a.i - b.i);
    for (let n = tenths - days.reduce((a, b) => a + b, 0), i = 0; i < n; i++) days[order[i].i]++;
    return {total:tenths / 10, days:days.map(d => d / 10)};
  }
  return Object.freeze({MILE, HALF, parsePace, parseFinish, clock, pace, halfSplits, trackTimes, taperSchedule});
});
