/* Time-based run/walk intervals, including a partial final interval and stops. */
(() => {
  'use strict';
  const form = document.getElementById('run-walk-form');
  if (!form) return;
  const $ = id => document.getElementById(id);
  const goalFields = ['h', 'm', 's'].map($);
  const fields = ['rw-run', 'rw-walk', 'rw-walk-min', 'rw-walk-sec', 'rw-stops'].map($);
  const clock = seconds => {
    const value = Math.round(seconds);
    return `${Math.floor(value / 3600)}:${String(Math.floor(value / 60) % 60).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  };
  const pace = seconds => {
    const tenths = Math.round(seconds * 10);
    return `${Math.floor(tenths / 600)}:${String(Math.floor(tenths / 10) % 60).padStart(2, '0')}.${tenths % 10}`;
  };
  function invalid(message, explicit, field) {
    $('rw-error').textContent = message;
    $('rw-error').hidden = false;
    $('rw-output').hidden = true;
    if (explicit && field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
  }
  function update(explicit = false) {
    fields.forEach(field => field.removeAttribute('aria-invalid'));
    const badGoal = goalFields.find(field => field.value.trim() === '' || !field.validity.valid);
    const target = Number($('h').value) * 3600 + Number($('m').value) * 60 + Number($('s').value);
    if (badGoal || !(target > 0 && target < 86400)) {
      $('rw-target').textContent = 'Enter a valid finish time above';
      invalid('Complete the finish target in the splits calculator above.', explicit, badGoal);
      return;
    }
    $('rw-target').textContent = clock(target);
    const badField = fields.find(field => field.value.trim() === '' || !field.validity.valid);
    if (badField) { invalid('Enter a value within the range shown for each interval, walking pace and stop allowance.', explicit, badField); return; }
    const run = Number($('rw-run').value) * 60;
    const walk = Number($('rw-walk').value) * 60;
    const stopped = Number($('rw-stops').value) * 60;
    const walkingPace = Number($('rw-walk-min').value) * 60 + Number($('rw-walk-sec').value);
    const moving = target - stopped;
    if (!(moving > 0 && walkingPace > 0)) {
      invalid('Stops must leave time to move, and walking pace must be greater than zero.', explicit, moving <= 0 ? $('rw-stops') : $('rw-walk-min'));
      return;
    }
    const cycles = Math.floor(moving / (run + walk));
    const partial = moving - cycles * (run + walk);
    const walkingTime = cycles * walk + Math.max(0, partial - run);
    const runningTime = moving - walkingTime;
    const walkingDistance = walkingTime / walkingPace;
    const runningDistance = 42.195 - walkingDistance;
    if (!(runningDistance > 0 && runningTime > 0)) {
      invalid('These intervals and walking pace leave no positive running distance. Change the settings or finish target.', explicit, $('rw-walk-min'));
      return;
    }
    const runningPace = runningTime / runningDistance;
    $('rw-error').hidden = true;
    $('rw-output').hidden = false;
    $('rw-running-pace').textContent = pace(runningPace) + ' / km';
    $('rw-running-mile').textContent = pace(runningPace * 1.609344) + ' / mile';
    $('rw-running-time').textContent = clock(runningTime);
    $('rw-walking-time').textContent = clock(walkingTime);
    $('rw-running-distance').textContent = runningDistance.toFixed(3) + ' km';
    $('rw-walking-distance').textContent = walkingDistance.toFixed(3) + ' km';
    $('rw-moving-time').textContent = clock(moving);
    $('rw-stop-time').textContent = clock(stopped);
    $('rw-cycle-note').textContent = `${cycles} complete cycles${partial > 0 ? ' plus a partial final interval' : ''}, starting with a run. Stops pause the interval timer.`;
    $('rw-pace-note').textContent = runningPace >= walkingPace && walkingTime > 0 ?
      'At these settings the walking pace is faster than the required running pace. Check that the walking pace is realistic for your plan.' :
      'This is the running-interval pace needed by the arithmetic. It is faster than the overall race average when slower walking or stops are included.';
  }
  form.addEventListener('submit', event => { event.preventDefault(); update(true); });
  form.addEventListener('input', () => update());
  document.getElementById('goal-form').addEventListener('input', () => update());
  document.addEventListener('mpk:action', event => { if (event.detail?.action === 'calculate') update(); });
  window.addEventListener('hashchange', () => queueMicrotask(() => update()));
  update();
})();
