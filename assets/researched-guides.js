/* Optional article worksheets. No tracking, persistence or external requests. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const MILE = 1.609344;
  const clock = seconds => {
    const n = Math.round(seconds);
    return n >= 3600 ? `${Math.floor(n / 3600)}:${String(Math.floor(n % 3600 / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}` : `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;
  };
  const pace = seconds => {
    const tenths = Math.round(seconds * 10);
    return `${Math.floor(tenths / 600)}:${(tenths % 600 / 10).toFixed(1).padStart(4, '0')}`;
  };
  const number = (id, min, max, label, integer = false) => {
    const raw = $(id).value.trim(); const n = Number(raw);
    if (!raw || !Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) throw Error(`${label}: enter ${integer ? 'a whole number' : 'a number'} from ${min} to ${max}.`);
    return n;
  };
  const duration = (id, format, min, max, label) => {
    const raw = $(id).value.trim();
    const m = raw.match(format === 'hms' ? /^(\d{1,2}):([0-5]\d):([0-5]\d)$/ : /^(\d{1,3}):([0-5]\d)$/);
    if (!m) throw Error(`${label}: use ${format === 'hms' ? 'h:mm:ss' : 'm:ss'}, with seconds below 60.`);
    const n = format === 'hms' ? +m[1] * 3600 + +m[2] * 60 + +m[3] : +m[1] * 60 + +m[2];
    if (n < min || n > max) throw Error(`${label}: enter a time from ${clock(min)} to ${clock(max)}.`);
    return n;
  };
  function attach(formId, prefix, render) {
    const form = $(formId); if (!form) return;
    const update = () => {
      try {
        render(); $(prefix + '-error').hidden = true; $(prefix + '-error').textContent = '';
        $(prefix + '-result').hidden = false; return true;
      } catch (error) {
        $(prefix + '-result').hidden = true;
        $(prefix + '-error').textContent = error.message; $(prefix + '-error').hidden = false;
        return false;
      }
    };
    form.addEventListener('submit', e => { e.preventDefault(); update(); });
    form.addEventListener('input', update); form.addEventListener('change', update);
    form.hidden = false; update(); return update;
  }
  attach('pacer-form', 'pc', () => {
    const t = duration('pc-target', 'hms', 7200, 36000, 'Group target');
    const gap = number('pc-gap', 0, 3600, 'Time gap');
    const d = number('pc-distance', .1, 42.195, 'Catch-up distance');
    const p = t / 42.195, required = p - gap / d;
    if (required <= 0) throw Error('That gap cannot be recovered over this distance in the constant-speed model. Allow more distance or follow your own plan.');
    $('pc-group').textContent = pace(p) + ' /km';
    $('pc-required').textContent = pace(required) + ' /km';
    $('pc-cost').textContent = `This requires ${(gap / d).toFixed(1)} seconds/km faster than the group for ${d} km (${pace(required * MILE)} /mile). The model calculates a speed, not whether a chase is appropriate or sustainable.`;
  });
  attach('half-form', 'hp', () => {
    const t = duration('hp-target', 'hms', 1800, 18000, 'Finish target');
    const offset = number('hp-offset', 0, 30, 'Opening offset');
    const distance = 21.0975, p = t / distance, opening = p + offset;
    const later = (t - opening * 5) / (distance - 5);
    if (later <= 0) throw Error('The opening uses the whole target. Reduce the opening offset.');
    $('hp-average').textContent = pace(p) + ' /km';
    $('hp-opening').textContent = pace(opening) + ' /km';
    $('hp-later').textContent = pace(later) + ' /km';
    $('hp-delay').textContent = clock(offset * 5);
    const rows = document.createDocumentFragment();
    for (const d of [5, 10, 15, 20, distance]) {
      const tr = document.createElement('tr');
      const th = document.createElement('th'); th.scope = 'row'; th.textContent = d === distance ? 'Finish (21.0975 km)' : d + ' km'; tr.append(th);
      for (const v of [p * d, opening * Math.min(d, 5) + later * Math.max(0, d - 5)]) {
        const td = document.createElement('td'); td.textContent = clock(v); tr.append(td);
      }
      rows.append(tr);
    }
    $('hp-rows').replaceChildren(rows);
    $('hp-mile').textContent = `In mile units: average ${pace(p * MILE)}, opening ${pace(opening * MILE)}, then ${pace(later * MILE)} per mile. The opening block remains 5 km (about 3.11 miles).`;
  });
  attach('yasso-form', 'ya', () => {
    const equal = $('ya-mode').value === 'equal'; $('ya-recovery').disabled = equal;
    const reps = number('ya-reps', 1, 10, 'Repetitions', true);
    const rep = duration('ya-time', 'ms', 30, 900, '800 m time');
    const recovery = equal ? rep : duration('ya-recovery', 'ms', 0, 1800, 'Recovery time');
    const warm = number('ya-warm', 0, 120, 'Warm-up minutes') * 60;
    const cool = number('ya-cool', 0, 120, 'Cooldown minutes') * 60;
    const gaps = reps - 1, work = reps * rep, rest = gaps * recovery;
    $('ya-pace').textContent = pace(rep / .8) + ' /km';
    $('ya-distance').textContent = (reps * .8).toFixed(1) + ' km';
    $('ya-gaps').textContent = `${gaps} × ${clock(recovery)}`;
    $('ya-total').textContent = clock(work + rest + warm + cool);
    $('ya-breakdown').textContent = `${clock(work)} in repetitions + ${clock(rest)} between them = ${clock(work + rest)} main set. Warm-up ${clock(warm)}; cooldown ${clock(cool)}. Rep pace ${pace(rep / .8 * MILE)} /mile.`;
    $('ya-label').textContent = reps === 10 && equal ? `Traditional digit label: ${Math.floor(rep / 60)} h ${String(rep % 60).padStart(2, '0')} min marathon. This is a rule of thumb, not a forecast or recommended goal.` : 'This is a shorter set or a different recovery protocol. No ten-repetition, equal-recovery marathon comparison is assigned.';
  });

  const carb = $('carb-form');
  if (carb) {
    let sequence = 0, state = null, update;
    const addFood = (focus = false) => {
      const i = ++sequence; const field = document.createElement('fieldset'); field.className = 'meal-entry'; field.dataset.food = i;
      const legend = document.createElement('legend'); legend.textContent = 'Food ' + i; field.append(legend);
      const inputs = document.createElement('div'); inputs.className = 'guide-fields';
      for (const [key, label, type, value, hint] of [
        ['name','Food or drink','text','','e.g. product name or recipe'],
        ['serving','Serving definition','text','','e.g. one stated 60 g portion'],
        ['carbs','Carbohydrate per serving (g)','number','','from the matching label or recipe'],
        ['planned','Planned servings','number','1','fractions are accepted'],
        ['recorded','Recorded servings','number','','leave blank until recorded; zero means none']
      ]) {
        const id = `cb-${i}-${key}`, labelNode = document.createElement('label'); labelNode.htmlFor = id; labelNode.textContent = label;
        const input = document.createElement('input'); input.id = id; input.dataset.field = key; input.type = type; input.value = value;
        if (type === 'number') { input.min = '0'; input.max = '1000'; input.step = 'any'; } else { input.maxLength = 160; }
        const help = document.createElement('span'); help.id = id + '-help'; help.className = 'guide-help'; help.textContent = hint; input.setAttribute('aria-describedby', help.id);
        labelNode.append(input, help); inputs.append(labelNode);
      }
      field.append(inputs);
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove food ' + i;
      remove.addEventListener('click', () => { field.remove(); $('cb-add').disabled = false; update(); $('cb-add').focus(); });
      field.append(remove); $('cb-foods').append(field);
      if (focus) field.querySelector('input').focus();
      $('cb-add').disabled = $('cb-foods').children.length >= 30;
    };
    addFood();
    update = attach('carb-form', 'cb', () => {
      state = null;
      const mass = number('cb-mass', 1, 1000, 'Body mass');
      const kg = $('cb-unit').value === 'lb' ? mass * .45359237 : mass;
      const rate = number('cb-rate', 1, 12, 'Chosen g/kg/day target');
      const rows = [];
      for (const field of $('cb-foods').children) {
        const value = key => field.querySelector(`[data-field="${key}"]`).value.trim();
        if (!value('name') && !value('serving') && !value('carbs') && !value('recorded') && value('planned') === '1') continue;
        const label = field.querySelector('legend').textContent;
        if (!value('name') || !value('serving')) throw Error(`${label}: name the food and define its serving, or remove the unused row.`);
        const get = key => number(field.querySelector(`[data-field="${key}"]`).id, 0, 1000, `${label}, ${key}`);
        const grams = get('carbs'), planned = get('planned'), recorded = value('recorded') === '' ? null : get('recorded');
        rows.push({name:value('name'),serving:value('serving'),grams,planned,recorded,plannedGrams:grams * planned,recordedGrams:recorded === null ? null : grams * recorded});
      }
      const target = kg * rate, planned = rows.reduce((s,r) => s + r.plannedGrams,0);
      const recorded = rows.reduce((s,r) => s + (r.recordedGrams ?? 0),0), known = rows.filter(r => r.recorded !== null).length;
      $('cb-target').textContent = target.toFixed(1) + ' g/day';
      $('cb-planned').textContent = planned.toFixed(1) + ' g';
      $('cb-recorded').textContent = known ? recorded.toFixed(1) + ' g' : 'Not recorded';
      $('cb-gap').textContent = Math.max(0,target - planned).toFixed(1) + ' g';
      $('cb-status').textContent = `Mass used: ${kg.toFixed(2)} kg. ${known} of ${rows.length} food entries have a recorded serving count. ` + (planned > target ? `The planned total is ${(planned - target).toFixed(1)} g above the entered target. ` : '') + 'Only entered foods are counted; the totals do not assess the suitability or completeness of the diet.';
      state = {kg,rate,target,planned,recorded,known,rows};
    });
    $('cb-add').addEventListener('click', () => { if ($('cb-foods').children.length < 30) { addFood(true); update(); } });
    $('cb-download').addEventListener('click', () => {
      if (!update() || !state) return;
      const csvCell = x => {
        let s = String(x ?? ''); if (/^[\s]*[=+\-@]/.test(s)) s = "'" + s;
        return '"' + s.replaceAll('"','""') + '"';
      };
      const rows = [['One-day carbohydrate food record'],['Mass kg',state.kg],['Entered target g/kg/day',state.rate],['Daily target g',state.target],[],['Food','Serving definition','Carbohydrate g/serving','Planned servings','Recorded servings (blank = unknown)','Planned carbohydrate g','Recorded carbohydrate g']];
      for (const r of state.rows) rows.push([r.name,r.serving,r.grams,r.planned,r.recorded,r.plannedGrams,r.recordedGrams]);
      rows.push([],['Planned total g',state.planned],['Recorded subtotal g',state.known ? state.recorded : 'Not recorded'],['Entries with recorded servings',state.known],['Total food entries',state.rows.length],['Note','One day only. Blank recorded values are unknown. This record is not a dietary assessment.']);
      const blob = new Blob(['\uFEFF' + rows.map(r => r.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
      const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = 'carb-loading-food-record.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url),1500);
    });
  }
  attach('long-form', 'lr', () => {
    const miles = $('lr-unit').value === 'mi', unit = miles ? 'miles' : 'km';
    const d = number('lr-distance', .1, 60, 'Candidate distance');
    const p = duration('lr-pace', 'ms', 120, 1800, 'Average pace');
    const stops = number('lr-stops', 0, 180, 'Stopped minutes') * 60;
    const week = number('lr-week', .1, 500, 'Weekly distance');
    const recent = number('lr-recent', .1, 60, 'Recent longest distance');
    if (week < d) throw Error('The week must include the long run. Enter a weekly distance at least as large as the candidate run.');
    const change = (d / recent - 1) * 100;
    $('lr-moving').textContent = clock(d * p); $('lr-elapsed').textContent = clock(d * p + stops);
    $('lr-share').textContent = (d / week * 100).toFixed(1) + '%';
    $('lr-change').textContent = (change > 0 ? '+' : '') + change.toFixed(1) + '%';
    $('lr-rest').textContent = `${(week - d).toFixed(1)} ${unit} remain for the rest of that week. These distance proportions are descriptions, not clearance to run or thresholds for an ideal plan.`;
    $('lr-equivalent').textContent = `Three hours at the entered moving pace covers ${(10800 / p).toFixed(2)} ${unit}, excluding stops. Candidate distance in the other unit: ${(miles ? d * MILE : d / MILE).toFixed(2)} ${miles ? 'km' : 'miles'}. Terrain, fatigue and pace changes are not modelled.`;
  });
  for (const button of document.querySelectorAll('[data-research-print]')) button.addEventListener('click', () => {
    document.body.classList.add('print-reference'); window.print();
  });
  window.addEventListener('afterprint', () => document.body.classList.remove('print-reference'));
})();
