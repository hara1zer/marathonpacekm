// Integration coverage for the November references. Dependencies stay outside the site.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(new URL('../../',import.meta.url).pathname);
const output=process.env.QA_OUTPUT||'/tmp/marathonpacekm-qa';fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
  let file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.csv':'text/csv'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:process.env.CHROMIUM_ARGS?JSON.parse(process.env.CHROMIUM_ARGS):[]});
const context=await browser.newContext({viewport:{width:1280,height:900}});
await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
const page=await context.newPage(),errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
const go=route=>page.goto(base+route,{waitUntil:'load'});
const text=id=>page.locator('#'+id).innerText();
async function test(name,fn){try{await fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}}
const half='/half-marathon-pace-chart/',track='/blog/400m-pace-chart/',taper='/blog/half-marathon-taper/',easy='/blog/easy-run-pace/';
try {
await test('Half-marathon inputs, exact distance, mile band handoff and invalid clearing',async()=>{
  await go(half);assert.match(await text('hc-summary'),/2:00:00 finish.*5:41.3\/km/);
  await page.fill('#hc-value','1:50:00');await page.selectOption('#hc-unit','mile');
  let url=new URL(await page.locator('#hc-band').getAttribute('href'),base);
  assert.equal(url.searchParams.get('distance'),'half');assert.equal(url.searchParams.get('unit'),'mi');assert.equal(url.searchParams.get('m'),'50');
  await page.fill('#hc-value','1:99:00');assert.equal(await page.locator('#hc-result').isVisible(),false);assert.equal(await page.locator('#hc-band').getAttribute('href'),null);
  await page.selectOption('#hc-mode','pace');await page.fill('#hc-value','6:00');
  assert.match(await text('hc-summary'),/^1:18:39 finish/);
  await page.selectOption('#hc-mode','finish');await page.fill('#hc-value','2:00:00');
  await page.locator('#hc-band').click();
  await page.waitForURL('**/printable-pace-band/**');
  assert.equal(await page.locator('input[name="distance"][value="half"]').isChecked(),true);
});
await test('Track conversion works in both pace units and backwards from a lap',async()=>{
  await go(track);await page.selectOption('#track-mode','lap');await page.fill('#track-value','1:50');
  assert.match(await text('track-summary'),/4:35.0\/km.*7:22.6\/mile/);
  assert.match(await text('track-times'),/1,600 m\s+7:20.0/);
  await page.selectOption('#track-mode','mile');await page.fill('#track-value','8:00');assert.match(await text('track-summary'),/1:59.3 per 400 m/);
  await page.fill('#track-value','5:99');assert.equal(await page.locator('#track-result').isVisible(),false);
});
await test('Taper day totals add up; miles, race-day distance and zero shares remain distinct',async()=>{
  await go(taper);assert.match(await text('ht-summary'),/^20.0 km/);assert.match(await text('ht-days'),/6.7 km/);assert.match(await text('ht-total'),/41.1 km/);
  await page.selectOption('#ht-unit','miles');await page.fill('#ht-warmup','1');assert.match(await text('ht-total'),/13.1094 miles race = 34.1 miles/);
  for(const id of ['ht-day-5','ht-day-3','ht-day-1'])await page.fill('#'+id,'0');
  assert.equal(await page.locator('#ht-result').isVisible(),false);
  await page.fill('#ht-day-5','1');assert.equal(await page.locator('#ht-result').isVisible(),true);
  await page.fill('#ht-baseline','');assert.equal(await page.locator('#ht-result').isVisible(),false);
});
await test('The embedded run-walk guide uses the same component and arithmetic as the goal page',async()=>{
  for(const route of ['/blog/run-walk-marathon-pacing/','/5-00-marathon-pace-km/']){
    await go(route);assert.equal(await text('rw-running-pace'),'6:46.2 / km');
    await page.fill('#rw-stops','0');await page.locator('#run-walk-form button[type="submit"]').click();
    assert.equal(await text('rw-running-pace'),'6:53.3 / km');
    await page.fill('#rw-run','');assert.equal(await page.locator('#rw-output').isVisible(),false);
  }
});
await test('Existing mile reference converts direct pace and clears invalid output',async()=>{
  await go('/marathon-pace-chart-min-per-mile/');assert.equal(await text('pc-summary'),'5:00.0 /km = 8:02.8 /mile');
  await page.selectOption('#pc-unit','mile');await page.fill('#pc-value','8:00');assert.equal(await text('pc-summary'),'4:58.3 /km = 8:00.0 /mile');
  await page.fill('#pc-value','');assert.equal(await page.locator('#pc-result').isVisible(),false);
});
await test('Reference events retain consent gating and send no entered values',async()=>{
  await go(half);await page.evaluate(()=>{window.print=()=>{};});
  await page.locator('#half-chart-form button[type="submit"]').click();
  assert.equal(await page.evaluate(()=>(window.dataLayer||[]).filter(x=>x[0]==='event').length),0);
  await page.getByRole('button',{name:'Allow analytics',exact:true}).click();
  await page.locator('#half-chart-form button[type="submit"]').click();
  await page.locator('[data-pace-print="#chart"]').click();
  const events=await page.evaluate(()=>(window.dataLayer||[]).filter(x=>x[0]==='event').map(x=>[x[1],x[2]]));
  assert.ok(events.some(x=>x[0]==='pace_calculator_calculate'));
  assert.ok(events.some(x=>x[0]==='pace_reference_print'));
  for(const [,params] of events){assert.deepEqual(Object.keys(params),['page_location']);assert.equal(params.page_location,base+half);}
});
await test('New references work at phone/tablet widths and retain accessible controls',async()=>{
  const axe=fs.readFileSync(path.join(process.env.AXE_MODULE||require.resolve('axe-core/package.json').replace(/package.json$/,''),'axe.min.js'),'utf8');
  for(const route of [half,track,taper,easy]){
    for(const width of [320,390,768,1280]){
      await page.setViewportSize({width,height:900});await go(route);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),true,route+' '+width);
    }
    await page.addScriptTag({content:axe});
    const violations=await page.evaluate(async()=> (await axe.run(document.querySelector('main'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.map(v=>v.id));
    assert.deepEqual(violations,[],route);
  }
});
await test('Static fallbacks retain charts and hide unavailable forms',async()=>{
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  await nojs.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  const p=await nojs.newPage();
  for(const [route,count] of [[half,28],[track,21]]){
    await p.goto(base+route);assert.equal(await p.locator('#chart tbody tr').count(),count);assert.equal(await p.locator('form').isVisible(),false);
  }
  await nojs.close();
});
await test('Actual PDFs retain the selected chart or record without clipping',async()=>{
  await page.setViewportSize({width:1280,height:900});
  for(const [route,target,name] of [[half,'#chart','half-chart'],[track,'#chart','track-chart'],[taper,'#planner','half-taper'],[easy,'#record','easy-record']]){
    await go(route);await page.evaluate(()=>{window.print=()=>{};});
    await page.locator('[data-pace-print="'+target+'"]').click();
    assert.equal(await page.locator(target).evaluate(e=>e.classList.contains('print-target')),true);
    await page.pdf({path:path.join(output,'reference-'+name+'.pdf'),format:'A4',printBackground:true,margin:{top:'10mm',bottom:'10mm',left:'10mm',right:'10mm'}});
    await page.screenshot({path:path.join(output,'reference-'+name+'.png'),fullPage:false});
  }
});
assert.deepEqual(errors,[],'Browser JavaScript errors');
} finally {
  fs.writeFileSync(path.join(output,'pace-guides-results.json'),JSON.stringify({results,errors},null,2));
  await browser.close();await new Promise(r=>server.close(r));
}
console.log(JSON.stringify(results,null,2));
if(results.some(x=>!x.pass))process.exitCode=1;
