/* Independent arithmetic expectations and boundaries, with no DOM dependency. */
'use strict';
const assert=require('node:assert/strict');
const math=require('../../assets/pace-math.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
assert.equal(math.parseFinish('2:00:00'),7200);
assert.equal(math.parseFinish('23:59:59'),86399);
for(const s of ['', '2:00', '2:60:00', '24:00:00', '-1:00:00', '0:00:00', 'Infinity']) assert.equal(math.parseFinish(s),null,s);
assert.equal(math.parsePace('5:30.5'),330.5);
for(const s of ['', '0:00','5:60','5.5','-5:00','5:30.55','Infinity']) assert.equal(math.parsePace(s),null,s);
assert.equal(math.pace(359.96,1),'6:00.0');
assert.equal(math.clock(7199.6),'2:00:00');
const half=math.halfSplits(7200);
assert.deepEqual(half.map(x=>math.clock(x.seconds)),['0:28:26','0:56:53','1:25:19','1:53:45','2:00:00']);
assert.equal(math.pace(7200/math.HALF,1),'5:41.3');
assert.equal(math.pace(7200/math.HALF*math.MILE,1),'9:09.2');
assert.deepEqual(math.trackTimes(300).map(x=>x.seconds),[60,120,240,300,480]);
near(110/.4,275);assert.equal(math.pace(275),'4:35');assert.equal(math.pace(275*math.MILE,1),'7:22.6');
assert.notEqual(math.trackTimes(300).at(-1).seconds,300*math.MILE);
const plan=math.taperSchedule(40,50,[0,3,0,2,0,1]);
assert.deepEqual(plan,{total:20,days:[0,10,0,6.7,0,3.3]});
for(const weights of [[1,1,1,1,1,1],[0,0,0,0,0,1],[1,2,3,4,5,6]]){
 const p=math.taperSchedule(37.7,47,weights);
 near(p.days.reduce((a,b)=>a+b,0),p.total);
}
assert.throws(()=>math.taperSchedule(40,50,[0,0,0,0,0,0]),RangeError);
assert.throws(()=>math.taperSchedule(40,50,[1,1,-1,1,1,1]),RangeError);
assert.throws(()=>math.halfSplits(Infinity),RangeError);
assert.throws(()=>math.trackTimes(0),RangeError);
assert.throws(()=>math.pace(NaN),RangeError);
console.log('Pace references: half checkpoints, both units, track arithmetic, rounding, day allocations and invalid boundaries passed.');
