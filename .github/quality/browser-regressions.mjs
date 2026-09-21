import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium:pw}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(new URL('../../',import.meta.url).pathname);
const output=process.env.QA_OUTPUT || '/tmp/marathonpacekm-qa';fs.mkdirSync(output,{recursive:true});
const redirects=fs.readFileSync(root+'/_redirects','utf8').split('\n').filter(x=>x.trim()&&!x.startsWith('#')).map(x=>x.trim().split(/\s+/));
const server=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');const pathname=decodeURIComponent(u.pathname);
  const redirect=redirects.find(x=>x[0]===pathname);
  if(redirect){res.writeHead(Number(redirect[2]),{location:redirect[1]});return res.end();}
  let target=path.join(root,pathname);if(!target.startsWith(root)) {res.writeHead(403);return res.end();}
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory()) target=path.join(target,'index.html');
  let status=200;if(!fs.existsSync(target)){status=404;target=root+'/404.html';}
  const ext=path.extname(target);const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml','.txt':'text/plain','.ico':'image/x-icon'}[ext]||'application/octet-stream';
  res.setHeader('Content-Type',mime+'; charset=utf-8');
  if(!pathname.startsWith('/printable-pace-band/'))res.setHeader('X-Frame-Options','DENY');
  res.writeHead(status);fs.createReadStream(target).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await pw.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || undefined,args:process.env.CHROMIUM_ARGS ? JSON.parse(process.env.CHROMIUM_ARGS) : []});
import assert from 'node:assert/strict';
const context=await browser.newContext({viewport:{width:1280,height:900},timezoneId:'Australia/Melbourne',acceptDownloads:true});
await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
const page=await context.newPage();page.setDefaultTimeout(5000);const results=[];const errors=[];page.on('pageerror',e=>errors.push(e.message));
const go=route=>page.goto(base+route,{waitUntil:'domcontentloaded'});
const text=id=>page.locator('#'+id).innerText();
const values=async obj=>page.evaluate(obj=>{for(const [id,v] of Object.entries(obj)){let el=document.getElementById(id);el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}},obj);
async function test(name,fn){try{await fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}}
try{
await test('Homepage full marathon, mile conversion and invalid input',async()=>{
 await go('/');assert.match(await text('result-km'),/5:41/);assert.match(await text('result-mi'),/9:09/);
 await page.locator('details').filter({has:page.locator('#split-unit')}).locator('summary').click();await page.selectOption('#split-unit','mi');assert.match(await text('splits-body'),/4:00:00/);
 await values({m:60});await page.click('#calcBtn');assert.ok(await page.locator('#input-error').isVisible());
 await page.click('#resetBtn');await page.selectOption('#dist','5');await page.click('#calcBtn');
 const rows=await page.locator('#splits-body tr').count();assert.equal(rows,5);
});
await test('Homepage CSV export',async()=>{await go('/');const d=page.waitForEvent('download');await page.click('#download-btn');const download=await d;assert.match(download.suggestedFilename(),/\.csv$/);const stream=await download.createReadStream();let csv='';for await(const b of stream)csv+=b;assert.match(csv,/4:00:00/);});
await test('Fueling actual scheduled intake and drinks-only case',async()=>{
 await go('/marathon-fueling-calculator/');assert.equal((await text('outPlannedGels')).trim(),'9');assert.match(await text('actualIntake'),/56.3/);
 await page.check('#useDrink');await values({drinkCarbs:80,drinkServings:1});await page.click('#calculateBtn');assert.equal((await text('outPlannedGels')).trim(),'0');
 await values({gelCarbs:''});await page.click('#calculateBtn');assert.ok(await page.locator('#fuelError').isVisible());assert.ok(await page.locator('#copyPlanBtn').isDisabled());
});
await test('Predictor Riegel scenarios and invalid seconds',async()=>{
 await go('/marathon-time-predictor/');await values({rh:1,rm:50,rs:57});await page.click('#calcBtn');let out=await text('results');
 for(const time of ['3:51:30','3:54:30','3:58:00'])assert.ok(out.includes(time),out);
 await values({wk:100,lr:35});await page.click('#calcBtn');for(const time of ['3:51:30','3:54:30','3:58:00'])assert.ok((await text('results')).includes(time));
 await values({rs:60});await page.click('#calcBtn');assert.match(await text('results'),/valid|whole|59/i);
});
await test('Planner includes zero weeks and rejects absent baseline/injury',async()=>{
 await go('/monthly-training-plan/');await page.click('#btnLoadDemo');await values({w1:60,w2:0,w3:60,w4:0});await page.click('#btnGenerate');
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('mpkm_marathonplanner_v1')));assert.equal(state.avg4,30,JSON.stringify(state));
 assert.ok((await page.locator('#tableBody tr').count())>0);
 await values({w1:0,w3:0});await page.click('#btnGenerate');assert.match(await text('previewSubtitle'),/zero weeks/);
 await values({w1:60,injuryStatus:'red'});await page.click('#btnGenerate');assert.match(await text('previewSubtitle'),/individual assessment/);
});
await test('Condition adjuster normal/hot and invalid fields',async()=>{
 await go('/race-conditions-pace-adjuster/');await page.click('#calcBtn');const normal=await text('results');assert.match(normal,/4:/);
 await values({tempC:32});await page.click('#calcBtn');assert.notEqual(await text('results'),normal);
 await values({m:60});await page.click('#calcBtn');assert.match(await text('results'),/valid values/);
});
await test('Pace band strategies preserve finish and A4 print/PNG work',async()=>{
 await go('/printable-pace-band/?h=4&m=0&s=0&strategy=even');
 for(const strategy of ['even','controlled','negative']){await page.selectOption('#strategy',strategy);assert.match(await page.locator('#outputs').innerText(),/4:00:00|4:00/);}
 await page.evaluate(()=>{window.print=()=>window.printed=true;});await page.click('#printA4Btn');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>document.body.dataset.printLayout),'a4');assert.ok(await page.evaluate(()=>window.printed));assert.match(await text('checkpointPrint'),/4:00:00/);
 await page.pdf({path:output+'/checkpoint-a4.pdf',format:'A4'});
 await page.click('#printBtn');assert.equal(await page.evaluate(()=>document.body.dataset.printLayout),'wrist');await page.pdf({path:output+'/wrist-band.pdf',format:'A4'});
 const d=page.waitForEvent('download');await page.click('#downloadBtn');assert.match((await d).suggestedFilename(),/\.png$/);
});
await test('Pace-band cumulative segments, units and invalid input',async()=>{
 await go('/printable-pace-band/?h=3&m=59&s=59&strategy=even');
 for(const unit of ['km','mi'])for(const strategy of ['even','controlled','negative']){
  await page.selectOption('#unit',unit);await page.selectOption('#strategy',strategy);
  const rows=await page.locator('#splitTableWrap tbody tr').allTextContents();assert.ok(rows.length>25);
  const cells=await page.locator('#splitTableWrap tbody tr').evaluateAll(rows=>rows.map(r=>[...r.cells].map(c=>c.textContent.trim())));
  const seconds=s=>s.split(':').reduce((a,b)=>a*60+Number(b),0);
  assert.equal(seconds(cells.at(-1).at(-1)),14399);
  assert.equal(cells.reduce((a,r)=>a+seconds(r[1]),0),14399);
 }
 await values({m:60});assert.ok(await page.locator('#outputs').isHidden());assert.match(await text('status'),/valid/);
});
await test('Shared calculator exact 5 km and invalid minutes',async()=>{
 await go('/3-00-marathon-pace-km/');await values({dist:5,h:0,m:25,s:0});await page.click('#calcBtn');
 assert.match(await text('results'),/25:00/);assert.equal(await page.locator('#results table').last().locator('tbody tr').count(),5);
 await values({m:60});await page.click('#calcBtn');assert.match(await text('results'),/whole hours/);
});
await test('Standalone calculator halfway for shorter races',async()=>{
 await go('/marathon-pace-calculator/');await values({dist:5,h:0,m:25,s:0});await page.click('#calcBtn');assert.match(await text('results'),/12:30/);
 await values({m:60});await page.click('#calcBtn');assert.match(await text('results'),/valid whole/);
});
await test('Priority goal pages render exact finish checkpoints',async()=>{
 for(const [route,time] of [['3-00','3:00:00'],['3-15','3:15:00'],['3-30','3:30:00'],['3-45','3:45:00'],['4-00','4:00:00'],['4-15','4:15:00'],['4-30','4:30:00'],['5-00','5:00:00'],['3-55','3:55:00'],['sub-4','3:59:59']]){
  await go('/'+route+'-marathon-pace-km/');assert.ok((await page.locator('#worked-plan').innerText()).includes(time));
 }
});
await test('Planner calendar export preserves local dates',async()=>{
 await go('/monthly-training-plan/');await page.click('#btnLoadDemo');await page.click('#btnGenerate');
 const d=page.waitForEvent('download');await page.click('#btnIcs');const download=await d;assert.match(download.suggestedFilename(),/\.ics$/);
 const stream=await download.createReadStream();let ics='';for await(const b of stream)ics+=b;assert.match(ics,/BEGIN:VCALENDAR/);assert.match(ics,/DTSTART;VALUE=DATE:\d{8}/);
});
assert.equal(errors.length,0,errors.join('\n'));
}finally{fs.writeFileSync(output+'/functional-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();server.close();}

if(results.some(r=>!r.pass))process.exitCode=1;
