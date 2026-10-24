// Exercise the published HTML and tools, including unit errors and print output.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(new URL('../../',import.meta.url).pathname);
const output=process.env.QA_OUTPUT || '/tmp/marathonpacekm-qa';fs.mkdirSync(output,{recursive:true});
const routes=['treadmill-pace-chart','how-long-to-train-for-a-marathon','run-walk-marathon-pacing','marathon-taper','strength-training-for-marathon-runners'].map(s=>'/blog/'+s+'/');
const server=http.createServer((req,res)=>{
  let target=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!target.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!fs.existsSync(target)){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'})[path.extname(target)]||'application/octet-stream');
  fs.createReadStream(target).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || undefined,args:process.env.CHROMIUM_ARGS?JSON.parse(process.env.CHROMIUM_ARGS):[]});
const context=await browser.newContext({viewport:{width:1280,height:900},timezoneId:'America/New_York'});
await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const go=slug=>page.goto(base+'/blog/'+slug+'/',{waitUntil:'load'});
const text=id=>page.locator('#'+id).innerText();
const results=[];
async function test(name,fn){try{await fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}}
try {
await test('All four treadmill units, full-duration distance, precision and invalid-state clearing',async()=>{
  await go('treadmill-pace-chart');
  assert.equal(await text('tm-km'),'6:00 /km');assert.match(await text('tm-distance'),/5.00 km/);
  await page.selectOption('#tm-unit','mph');await page.fill('#tm-value','8');
  assert.equal(await text('tm-mile'),'7:30 /mile');assert.equal(await text('tm-km'),'4:40 /km');
  await page.selectOption('#tm-unit','min-km');await page.fill('#tm-value','5:30');
  assert.equal(await text('tm-kph'),'10.91 km/h');
  await page.selectOption('#tm-unit','min-mile');await page.fill('#tm-value','10:00');
  assert.equal(await text('tm-mph'),'6.00 mph');
  for(const bad of ['0:00','5:99','-6:00','6.5','']) {
    await page.fill('#tm-value',bad);assert.equal(await page.locator('#tm-result').isVisible(),false);
    assert.equal(await page.locator('#tm-error').isVisible(),true);
  }
  await page.selectOption('#tm-unit','kph');
  for(const bad of ['0','-2','Infinity','41']){await page.fill('#tm-value',bad);assert.equal(await page.locator('#tm-result').isVisible(),false);}
  await page.fill('#tm-value','10');await page.fill('#tm-duration','0');assert.equal(await page.locator('#tm-result').isVisible(),false);
  await page.fill('#tm-duration','30');assert.equal(await page.locator('#tm-result').isVisible(),true);
});
await test('Calendar comparison is exact across DST and leap years; invalid date hides stale output',async()=>{
  await go('how-long-to-train-for-a-marathon');
  assert.equal(await text('plan-20'),'29 November 2026');
  await page.fill('#plan-race-date','2028-03-12');
  for(const [w,expected] of [[12,'19 December 2027'],[16,'21 November 2027'],[20,'24 October 2027']])assert.equal(await text('plan-'+w),expected);
  await page.fill('#plan-race-date','');assert.equal(await page.locator('#plan-result').isVisible(),false);
  await page.fill('#plan-race-date','2027-04-18');assert.equal(await text('plan-12'),'24 January 2027');
});
await test('Taper budgets, separate race distance, two-week mode and invalid state',async()=>{
  await go('marathon-taper');
  assert.equal(await text('taper-distance-3'),'48.0 km');assert.equal(await text('taper-distance-1'),'24.0 km');
  assert.match(await text('taper-race-total'),/66.2 km including race day/);
  await page.selectOption('#taper-weeks','2');assert.equal(await page.locator('#taper-row-3').isVisible(),false);
  assert.equal(await page.locator('#taper-pct-3').isDisabled(),true);
  await page.selectOption('#taper-unit','miles');await page.fill('#taper-baseline','40');
  assert.equal(await text('taper-distance-1'),'16.0 miles');assert.match(await text('taper-race-total'),/42.2 miles including race day/);
  await page.fill('#taper-pct-1','90');assert.match(await text('taper-warning'),/rises within the taper/);
  await page.fill('#taper-pct-1','101');assert.equal(await page.locator('#taper-result').isVisible(),false);
  await page.fill('#taper-pct-1','40');await page.fill('#taper-baseline','');assert.equal(await page.locator('#taper-result').isVisible(),false);
});
await test('Run-walk examples reproduce the existing calculator and partial final interval',async()=>{
  await page.goto(base+'/5-00-marathon-pace-km/',{waitUntil:'load'});
  assert.equal(await text('rw-running-pace'),'6:46.2 / km');assert.match(await text('rw-cycle-note'),/partial final interval/);
  await page.fill('#rw-stops','0');assert.equal(await text('rw-running-pace'),'6:53.3 / km');
  await page.fill('#rw-stops','5');await page.fill('#rw-run','4');assert.equal(await text('rw-running-pace'),'6:30.1 / km');
});
await test('Five pages have coherent Article/Breadcrumb metadata, local assets and accessible layouts at four widths',async()=>{
  for(const route of routes){
    const response=await page.goto(base+route,{waitUntil:'load'});assert.equal(response.status(),200);
    const decline=page.getByRole('button',{name:'Decline',exact:true});
    if(await decline.isVisible())await decline.click();
    const meta=await page.evaluate(()=>{
      const graph=[...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(s=>{
        const data=JSON.parse(s.textContent);return data['@graph']||[data];
      });
      return {h1:document.querySelector('h1').textContent,article:graph.find(x=>x['@type']==='Article'),crumb:graph.filter(x=>x['@type']==='BreadcrumbList').length,
        canonical:document.querySelector('link[rel="canonical"]').href,headings:document.querySelectorAll('h1').length,
        badImages:[...document.images].filter(x=>!x.complete||!x.naturalWidth).length};
    });
    assert.equal(meta.h1,meta.article.headline);assert.equal(meta.headings,1);assert.equal(meta.crumb,1);
    assert.equal(meta.article.mainEntityOfPage['@id'],meta.canonical);assert.equal(meta.article.author.name,'Davin Pinto');
    assert.equal(meta.article.datePublished,'2026-10-25');assert.equal(meta.badImages,0);
    const image=await context.request.get(base+new URL(meta.article.image.url).pathname);assert.equal(image.status(),200);
    if(process.env.AXE_MODULE){
      const axePath=require.resolve(process.env.AXE_MODULE+'/axe.min.js');await page.addScriptTag({path:axePath});
      const violations=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.length})));
      assert.deepEqual(violations,[],route+' accessibility');
    }
    for(const width of [320,390,768,1280]){
      await page.setViewportSize({width,height:900});
      const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
      assert.ok(size.scroll<=size.client+2,route+' overflow at '+width);
      if(width===390)await page.screenshot({path:output+'/'+route.split('/')[2]+'-390.png',fullPage:true});
    }
  }
});
await test('Printable chart and both strength sessions generate actual PDFs',async()=>{
  for(const [slug,name] of [['treadmill-pace-chart','treadmill-reference'],['strength-training-for-marathon-runners','strength-sessions']]){
    await go(slug);await page.evaluate(()=>{window.print=()=>{};});
    await page.locator('[data-print-target]').click();assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('print-reference')),true);
    await page.pdf({path:output+'/'+name+'.pdf',format:'A4',margin:{top:'12mm',bottom:'12mm',left:'12mm',right:'12mm'},printBackground:true});
    await page.evaluate(()=>dispatchEvent(new Event('afterprint')));
    assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('print-reference')),false);
  }
});
await test('Static references remain usable with JavaScript disabled',async()=>{
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  await nojs.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  const p=await nojs.newPage();
  for(const route of routes){
    await p.goto(base+route);assert.equal(await p.locator('h1').count(),1);
    assert.ok((await p.locator('main').innerText()).length>5000);
    if(await p.locator('form').count()){assert.equal(await p.locator('form').isVisible(),false);assert.equal(await p.locator('noscript').isVisible(),true);}
  }
});
assert.deepEqual(errors,[],'No page errors');
} finally {
  fs.writeFileSync(output+'/practical-guides-results.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));await browser.close();server.close();
}
if(results.some(x=>!x.pass))process.exitCode=1;
