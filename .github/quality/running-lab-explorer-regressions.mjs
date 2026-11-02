// Original-data invariants and scenario arithmetic, independent of browser rendering.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {observations, targetSeconds, compareLap} = require('../../assets/running-lab-explorer.js');
const data = JSON.parse(fs.readFileSync(new URL('../../assets/original/sydney-2026-chart-data.json', import.meta.url), 'utf8'));
const rows = observations(data);
assert.deepEqual(rows.map(row => row.km), [25, 27, 28, 29, 30, 31, 32, 33]);
assert.deepEqual(rows.map(row => row.pace), [332, 351, 355, 362, 353, 380, 392, 410]);
assert.deepEqual(rows.map(row => row.heartRate), [160, 162, 164, 164, 162, 161, 162, 160]);
assert.equal(rows.some(row => row.km === 26), false, 'missing kilometre is never invented');
const source = fs.readFileSync(new URL('../../blog/sydney-marathon-2026-personal-review/index.html', import.meta.url), 'utf8');
for (const row of rows) {
  const pace = `${Math.floor(row.pace / 60)}:${String(row.pace % 60).padStart(2, '0')}`;
  assert.ok(source.includes(`<th scope="row">${row.km}</th><td>${pace}/km</td><td>${row.heartRate} bpm</td>`), `published table matches recorded kilometre ${row.km}`);
}
assert.equal(targetSeconds('5', '40'), 340);
assert.equal(targetSeconds('1', '0'), 60);
assert.equal(targetSeconds('59', '59'), 3599);
for (const input of [['', '30'], ['5', ''], ['5', '60'], ['5.5', '0'], ['5', '-1'], ['0', '59'], ['60', '0'], ['x', '0'], ['5', '0.5']]) {
  assert.equal(targetSeconds(...input), null, `reject invalid target ${input}`);
}
assert.equal(compareLap(rows, 0, 340).lapDifference, -8);
assert.equal(compareLap(rows, 0, 332).lapDifference, 0);
assert.deepEqual(compareLap(rows, 1, 340), {
  lap: {km:27, pace:351, heartRate:162}, lapDifference:11,
  startKm:27, endKm:27, count:1, recordedSeconds:351, targetSeconds:340, blockDifference:11
});
const last = compareLap(rows, 7, 340);
assert.equal(last.startKm, 27, 'block restarts after missing km26');
assert.equal(last.count, 7);
assert.equal(last.recordedSeconds, 2603);
assert.equal(last.targetSeconds, 2380);
assert.equal(last.blockDifference, 223);
assert.equal(compareLap(rows, 4, 340).blockDifference, 61);
assert.throws(() => observations({...data, race_km:data.race_km.map((km,i)=>i === 1 ? 25 : km)}));
assert.throws(() => observations({race_km:[], race_pace_seconds_per_km:[], race_heart_rate_bpm:[]}));
const gapped = rows.filter(row => row.km !== 29);
assert.equal(compareLap(gapped, gapped.length - 1, 340).startKm, 30);
assert.equal(compareLap(gapped, gapped.length - 1, 340).count, 4, 'a second gap starts another local block');
assert.throws(() => observations({...data, race_pace_seconds_per_km:data.race_pace_seconds_per_km.slice(1)}));
assert.throws(() => observations({...data, race_heart_rate_bpm:data.race_heart_rate_bpm.map((hr,i)=>i ? hr : null)}));
assert.throws(() => compareLap(rows, -1, 340));
assert.throws(() => compareLap(rows, 0, 0));
console.log('Running Lab: 8 source-verified watch laps, missing-data boundaries, target validation and local-block scenario arithmetic passed.');
