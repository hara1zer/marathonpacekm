// Development-only: actual Chromium layout, interaction and PDF verification.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(new URL('../../',import.meta.url).pathname);
const output=process.env.QA_OUTPUT || '/tmp/pace-band-qa';
fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 let file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
 const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'};
 res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
await context.addInitScript(()=>{
 window.qaEvents=[];window.gtag=(...args)=>window.qaEvents.push(args);
 window.print=()=>{window.qaPrintRequested=true;};
});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const report=[];const manifest=[];
const go=q=>page.goto(base+'/printable-pace-band/?'+q,{waitUntil:'load'});
const events=()=>page.evaluate(()=>window.qaEvents.filter(e=>e[0]==='event'));
const plans=[['marathon-km','h=3&m=30&s=0&unit=km&strategy=even','3:30:00'],['marathon-mi','h=4&m=0&s=0&unit=mi&strategy=even','4:00:00'],['half-km','distance=half&h=2&m=0&s=0&unit=km&strategy=even','2:00:00']];
try {
 for(const [name,query,goal] of plans){
  for(const width of [1280,390,320]){
   await page.setViewportSize({width,height:900});await go(query);
   assert.equal((await events()).length,0,'initial rendering must not count as editing');
   assert.equal(await page.locator('input[name=distance]:checked').count(),1);
   for(const wrist of ['150','200']){
    await page.selectOption('#wristSize',wrist);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name} ${width}px page overflow`);
    const overflowing=await page.locator('#wristPreview .band-time, #wristPreview .band-distance').evaluateAll(els=>els.filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent));
    assert.deepEqual(overflowing,[],`${name} ${width}px checkpoint overflow`);
   }
   assert.match(await page.locator('#wristPreview').innerText(),new RegExp(goal));
   assert.equal(await page.locator('.pace-conversion').getAttribute('open'),null);
   await page.locator('#printBtn').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(output,`${name}-${width}.png`)});
   report.push(`${name} ${width}px, both wrist sizes: passed`);
  }
  await page.setViewportSize({width:1280,height:900});
  for(const paper of ['a4','letter']) for(const wrist of ['150','200']){
   await go(query);await page.selectOption('#paper',paper);await page.selectOption('#wristSize',wrist);
   await page.click('#printBtn');await page.waitForFunction(()=>window.qaPrintRequested);
   await page.emulateMedia({media:'print'});
   const geometry=await page.evaluate(()=>{
    const rect=el=>{const r=el.getBoundingClientRect();return {width:r.width*25.4/96,height:r.height*25.4/96};};
    return {bands:[...document.querySelectorAll('#printSheet .pace-band')].map(rect),scale:rect(document.querySelector('.print-scale-line')),times:[...document.querySelectorAll('#printSheet .band-time')].map(el=>parseFloat(getComputedStyle(el).fontSize)*72/96),labels:[...document.querySelectorAll('#printSheet .band-distance')].map(el=>parseFloat(getComputedStyle(el).fontSize)*72/96)};
   });
   assert.equal(geometry.bands.length,3);
   for(const r of geometry.bands){assert.ok(Math.abs(r.width-(Number(wrist)+24))<0.1);assert.ok(Math.abs(r.height-38)<0.1);}
   assert.ok(Math.abs(geometry.scale.width-50)<0.1);
   assert.ok(geometry.times.every(v=>Math.abs(v-10)<0.01));assert.ok(geometry.labels.every(v=>Math.abs(v-8)<0.01));
   const file=`${name}-${paper}-${wrist}.pdf`;
   await page.pdf({path:path.join(output,file),preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
   manifest.push({file,paper,wrist:Number(wrist),goal});
   await page.emulateMedia({media:'screen'});
  }
 }
 for(const query of ['h=4&m=0&s=0&strategy=controlled&start=5','h=4&m=0&s=0&style=neg&offset=1']){
  await go(query);assert.equal(await page.locator('#printBtn').isEnabled(),true);
  const before=await page.locator('#wristPreview').innerText();
  await page.getByText('Share, checkpoint sheet and optional details',{exact:true}).click();
  await page.click('#copyBtn');await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('copied'));
  const url=await page.evaluate(()=>navigator.clipboard.readText());await page.goto(url);
  assert.equal(await page.locator('#wristPreview').innerText(),before);
 }
 await go('distance=half&h=2&m=0&s=0&unit=mi&strategy=negative&negative=0.7&paper=letter&wrist=150');
 assert.equal(await page.locator('input[name=distance]:checked').inputValue(),'half');
 assert.equal(await page.locator('#paper').inputValue(),'letter');
 assert.equal(await page.locator('#wristSize').inputValue(),'150');
 assert.equal(await page.locator('#printBtn').isEnabled(),true);
 await go('h=3&m=30&s=0&name=PrivateName&race=PrivateRace');
 await page.selectOption('#unit','mi');assert.equal(await page.locator('#h').inputValue(),'3');assert.equal(await page.locator('#m').inputValue(),'30');
 await page.fill('#s','60');await page.locator('#s').press('Tab');assert.equal(await page.locator('#printBtn').isEnabled(),false);
 await page.fill('#s','0');assert.equal(await page.locator('#printBtn').isEnabled(),true);
 await page.getByText('Calculate a goal from pace (optional)',{exact:true}).click();
 await page.fill('#paceS','60');assert.equal(await page.locator('#outputs').isVisible(),false);
 await page.fill('#paceS','30');assert.equal(await page.locator('#outputs').isVisible(),true);
 await page.selectOption('#strategy','negative');await page.fill('#negativeMargin','1.3');assert.equal(await page.locator('#printBtn').isEnabled(),false);
 await page.fill('#negativeMargin','2');assert.equal(await page.locator('#printBtn').isEnabled(),true);
 const download=page.waitForEvent('download');await page.click('#downloadBtn');const image=await download;
 assert.match(image.suggestedFilename(),/\.png$/);await image.saveAs(path.join(output,'phone-card.png'));
 const tracked=await events();assert.equal(tracked.filter(e=>e[1]==='pace_band_plan_ready').length,1);
 assert.ok(!JSON.stringify(tracked).match(/PrivateName|PrivateRace|\?h=|3:30|confirmed_print/));
 assert.ok(tracked.some(e=>e[1]==='pace_band_download_intent'));
 // Long goals and maximum-length optional names, including a narrow-screen check.
 await go('distance=half&h=24&m=59&s=59&unit=mi&name='+('W'.repeat(40))+'&race='+('W'.repeat(50)));
 assert.equal(await page.locator('#printBtn').isEnabled(),true,'supported long goal');
 await page.setViewportSize({width:320,height:900});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 assert.deepEqual(errors,[]);
 report.push('Legacy/new sharing, invalid/recovery, keyboard, PNG and analytics checks: passed');
 fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2));
 console.log(report.join('\n'));
} finally {
 fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify({report,errors},null,2));
 await browser.close();await new Promise(resolve=>server.close(resolve));
}
