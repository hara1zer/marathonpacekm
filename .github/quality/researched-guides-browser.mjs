// Verify the actual articles, worksheet arithmetic, exports, mobile and print.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(new URL('../../',import.meta.url).pathname);
const output=process.env.QA_OUTPUT || '/tmp/marathonpacekm-research-qa';fs.mkdirSync(output,{recursive:true});
const slugs=['marathon-pacers','half-marathon-pacing-strategy','yasso-800s','carb-loading-calculator','longest-run-before-marathon'];
const server=http.createServer((req,res)=>{
  let file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:JSON.parse(process.env.CHROMIUM_ARGS||'[]')});
const context=await browser.newContext({acceptDownloads:true,viewport:{width:1280,height:900}});
await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
const page=await context.newPage();page.setDefaultTimeout(5000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const go=slug=>page.goto(base+'/blog/'+slug+'/',{waitUntil:'load'});
const text=id=>page.locator('#'+id).innerText();const results=[];
async function test(name,fn){try{await fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.stack});}}
try {
await test('Pacer catch-up arithmetic uses a same-marker time gap and rejects impossible or invalid inputs',async()=>{
  await go(slugs[0]);assert.equal(await text('pc-group'),'5:41.3 /km');assert.equal(await text('pc-required'),'5:26.3 /km');
  await page.fill('#pc-distance','5');assert.equal(await text('pc-required'),'5:35.3 /km');
  await page.fill('#pc-gap','0');assert.equal(await text('pc-required'),await text('pc-group'));
  await page.fill('#pc-gap','3600');await page.fill('#pc-distance','1');assert.equal(await page.locator('#pc-result').isVisible(),false);
  await page.fill('#pc-gap','30');
  for(const bad of ['','4:60:00','4:00','0:00:00']){await page.fill('#pc-target',bad);assert.equal(await page.locator('#pc-result').isVisible(),false);}
  await page.fill('#pc-target','4:00:00');assert.equal(await page.locator('#pc-result').isVisible(),true);
});
await test('Half plan reproduces the worked checkpoints, preserves the target and handles zero offset',async()=>{
  await go(slugs[1]);assert.equal(await text('hp-average'),'5:41.3 /km');assert.equal(await text('hp-opening'),'5:46.3 /km');assert.equal(await text('hp-later'),'5:39.7 /km');
  assert.deepEqual(await page.locator('#hp-rows td:last-child').allTextContents(),['28:51','57:10','1:25:29','1:53:47','2:00:00']);
  await page.fill('#hp-offset','0');
  for(const row of await page.locator('#hp-rows tr').all()){const cells=await row.locator('td').allTextContents();assert.equal(cells[0],cells[1]);}
  await page.fill('#hp-target','1:45:00');assert.equal(await text('hp-average'),'4:58.6 /km');
  await page.fill('#hp-offset','-1');assert.equal(await page.locator('#hp-result').isVisible(),false);
  await page.fill('#hp-offset','5');await page.fill('#hp-target','');assert.equal(await page.locator('#hp-result').isVisible(),false);
});
await test('800 m session includes exactly n-1 recoveries and no invented easy-running distance',async()=>{
  await go(slugs[2]);assert.equal(await text('ya-pace'),'4:22.5 /km');assert.equal(await text('ya-total'),'1:31:30');assert.equal(await text('ya-gaps'),'9 × 3:30');assert.equal(await text('ya-distance'),'8.0 km');
  assert.match(await text('ya-label'),/not a forecast/);
  await page.fill('#ya-reps','6');assert.equal(await text('ya-total'),'1:03:30');assert.match(await text('ya-label'),/No ten-repetition/);
  await page.fill('#ya-reps','1');assert.equal(await text('ya-gaps'),'0 × 3:30');assert.equal(await text('ya-total'),'28:30');
  await page.fill('#ya-reps','10');await page.selectOption('#ya-mode','custom');await page.fill('#ya-recovery','2:48');assert.equal(await text('ya-total'),'1:25:12');
  await page.fill('#ya-reps','3.5');assert.equal(await page.locator('#ya-result').isVisible(),false);
  await page.fill('#ya-reps','10');await page.fill('#ya-time','3:99');assert.equal(await page.locator('#ya-result').isVisible(),false);
});
await test('Carb worksheet distinguishes unknown from zero, validates servings and exports formula-safe CSV',async()=>{
  await go(slugs[3]);assert.equal(await text('cb-target'),'700.0 g/day');assert.equal(await text('cb-planned'),'0.0 g');assert.equal(await text('cb-recorded'),'Not recorded');
  await page.fill('#cb-1-name','=HYPERLINK("example")');await page.fill('#cb-1-serving','One stated portion, "large"');await page.fill('#cb-1-carbs','30');await page.fill('#cb-1-planned','2');
  assert.equal(await text('cb-planned'),'60.0 g');assert.equal(await text('cb-recorded'),'Not recorded');
  await page.fill('#cb-1-recorded','1.5');assert.equal(await text('cb-recorded'),'45.0 g');assert.match(await text('cb-status'),/1 of 1/);
  await page.fill('#cb-1-recorded','0');assert.equal(await text('cb-recorded'),'0.0 g');
  await page.fill('#cb-1-recorded','');assert.equal(await text('cb-recorded'),'Not recorded');
  await page.selectOption('#cb-unit','lb');await page.fill('#cb-mass','154.3235835');assert.equal(await text('cb-target'),'700.0 g/day');
  const event=page.waitForEvent('download');await page.click('#cb-download');const download=await event;
  const stream=await download.createReadStream();let csv='';for await(const chunk of stream)csv+=chunk;
  assert.match(csv,/"'=HYPERLINK\(""example""\)"/);assert.match(csv,/One stated portion, ""large""/);
  assert.match(csv,/"30","2","","60",""/);assert.match(csv,/"Recorded subtotal g","Not recorded"/);
  fs.writeFileSync(output+'/carb-export-example.csv',csv);
  await page.fill('#cb-rate','13');assert.equal(await page.locator('#cb-result').isVisible(),false);
  await page.fill('#cb-rate','10');await page.fill('#cb-1-carbs','');assert.equal(await page.locator('#cb-result').isVisible(),false);
  await page.getByRole('button',{name:'Remove food 1',exact:true}).click();assert.equal(await text('cb-planned'),'0.0 g');
  await page.click('#cb-add');assert.equal(await page.locator('.meal-entry').count(),1);
});
await test('Long-run worksheet handles elapsed time, included weekly total and both unit systems',async()=>{
  await go(slugs[4]);assert.equal(await text('lr-moving'),'3:15:00');assert.equal(await text('lr-elapsed'),'3:25:00');assert.equal(await text('lr-share'),'50.0%');assert.equal(await text('lr-change'),'+7.1%');
  await page.fill('#lr-week','20');assert.equal(await page.locator('#lr-result').isVisible(),false);
  await page.selectOption('#lr-unit','mi');await page.fill('#lr-distance','20');await page.fill('#lr-pace','10:00');await page.fill('#lr-week','40');await page.fill('#lr-recent','18');
  assert.equal(await text('lr-moving'),'3:20:00');assert.equal(await text('lr-elapsed'),'3:30:00');assert.equal(await text('lr-share'),'50.0%');assert.equal(await text('lr-change'),'+11.1%');assert.match(await text('lr-equivalent'),/32.19 km/);
  await page.fill('#lr-stops','');assert.equal(await page.locator('#lr-result').isVisible(),false);
  await page.fill('#lr-stops','0');await page.fill('#lr-recent','0');assert.equal(await page.locator('#lr-result').isVisible(),false);
});
await test('Five articles have valid metadata, source links, original social cards and accessible layouts',async()=>{
  for(const slug of slugs){
    assert.equal((await go(slug)).status(),200);
    const decline=page.getByRole('button',{name:'Decline',exact:true});if(await decline.isVisible())await decline.click();
    const meta=await page.evaluate(()=>{
      const graph=[...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(s=>{const j=JSON.parse(s.textContent);return j['@graph']||[j];});
      return {h1:document.querySelector('h1').textContent,count:document.querySelectorAll('h1').length,article:graph.find(x=>x['@type']==='Article'),crumbs:graph.filter(x=>x['@type']==='BreadcrumbList').length,canonical:document.querySelector('link[rel="canonical"]').href,unfilled:document.querySelector('main').textContent.includes('{{')};
    });
    assert.equal(meta.count,1);assert.equal(meta.crumbs,1);assert.equal(meta.article.headline,meta.h1);assert.equal(meta.article.mainEntityOfPage['@id'],meta.canonical);assert.equal(meta.article.author.name,'Davin Pinto');assert.equal(meta.article.datePublished,'2026-10-25');assert.equal(meta.unfilled,false);assert.ok(meta.article.wordCount>1300);assert.ok(meta.article.citation.length>=1);
    const response=await context.request.get(base+new URL(meta.article.image.url).pathname);assert.equal(response.status(),200);assert.equal((await response.body()).readUInt32BE(16),1200);
    if(process.env.AXE_MODULE){await page.addScriptTag({path:require.resolve(process.env.AXE_MODULE+'/axe.min.js')});const violations=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(x=>({id:x.id,nodes:x.nodes.length})));assert.deepEqual(violations,[],slug+' accessibility');}
    for(const width of [320,390,768,1280]){
      await page.setViewportSize({width,height:900});const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(size.scroll<=size.client+2,slug+' overflow at '+width);
      if(width===390||width===1280)await page.screenshot({path:output+'/'+slug+'-'+width+'.png',fullPage:true});
    }
  }
});
await test('Five reference sheets print through the actual browser PDF pipeline',async()=>{
  for(const slug of slugs){await go(slug);await page.evaluate(()=>{window.print=()=>{};});await page.locator('[data-research-print]').click();assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('print-reference')),true);await page.pdf({path:output+'/'+slug+'-reference.pdf',format:'A4',margin:{top:'12mm',bottom:'12mm',left:'12mm',right:'12mm'},printBackground:true});await page.evaluate(()=>dispatchEvent(new Event('afterprint')));assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('print-reference')),false);}
});
await test('No-JavaScript reading retains all five articles and static worked examples',async()=>{
  const c=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());const p=await c.newPage();
  for(const slug of slugs){await p.goto(base+'/blog/'+slug+'/');assert.ok((await p.locator('main').innerText()).length>6000);assert.equal(await p.locator('form').isVisible(),false);assert.equal(await p.locator('noscript').isVisible(),true);assert.equal(await p.locator('#sources').isVisible(),true);}
});
assert.deepEqual(errors,[],'No page errors');
}finally{fs.writeFileSync(output+'/researched-guides-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();server.close();}
if(results.some(x=>!x.pass))process.exitCode=1;
