import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const axe=require(process.env.AXE_MODULE||'axe-core');
const root=path.resolve(new URL('../../',import.meta.url).pathname);
const output=process.env.QA_OUTPUT||'/tmp/marathonpacekm-qa';fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  let file=path.join(root,decodeURIComponent(pathname));
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);return res.end();}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:JSON.parse(process.env.CHROMIUM_ARGS||'[]')});
const results=[],errors=[];
async function test(name,fn){try{await fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.stack});}}
async function context(options={}){
  const c=await browser.newContext({viewport:{width:1280,height:900},...options});
  await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  const p=await c.newPage();p.setDefaultTimeout(4000);p.on('pageerror',e=>errors.push(e.message));
  // Keep analytics consent out of navigation screenshots; do not opt into collection.
  await c.addInitScript(()=>localStorage.setItem('mpkm-consent-v1',JSON.stringify({analytics:false})));
  return {c,p};
}
async function decline(p){ const button=p.getByRole('button',{name:'Decline',exact:true});if(await button.count()&&await button.isVisible())await button.click(); }
try{
await test('Every disclosure: pointer, keyboard, Escape focus, outside click, focus exit',async()=>{
  const {p}=await context();await p.goto(base+'/blog/');
  await decline(p);
  for(const name of ['Calculators','Training','Guides']){
    const summary=p.locator('.mpkm-main-nav summary[aria-label="'+name+' links"]');
    const details=summary.locator('..');
    await summary.click();assert.notEqual(await details.getAttribute('open'),null);
    assert.equal(await details.locator('ul a').first().isVisible(),true);
    const panel=await details.locator('ul').boundingBox();assert.ok(panel.x>=0&&panel.x+panel.width<=1280);
    await summary.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.closest('.mpkm-nav-panel')!==null),true);
    await p.keyboard.press('Escape');assert.equal(await details.getAttribute('open'),null);assert.ok(await summary.evaluate(el=>el===document.activeElement));
    await summary.press('Space');assert.notEqual(await details.getAttribute('open'),null);
    await p.locator('h1').click({position:{x:10,y:10}});assert.equal(await details.getAttribute('open'),null);
    await summary.press('Enter');await p.locator('.mpkm-main-nav > ul > li:last-child a').focus();assert.equal(await details.getAttribute('open'),null);
  }
  const calculators=p.locator('.mpkm-main-nav summary[aria-label="Calculators links"]');
  const training=p.locator('.mpkm-main-nav summary[aria-label="Training links"]');
  await calculators.click();await training.click();assert.equal(await p.locator('.mpkm-main-nav details[open]').count(),1);
  await p.screenshot({path:output+'/navigation-desktop.png',fullPage:false});
});
await test('Representative templates, all category panels, 320–1440 px and navigation accessibility',async()=>{
  const {p}=await context();
  for(const width of [320,390,760,820,1000,1024,1280,1440]){
    await p.setViewportSize({width,height:900});
    for(const route of ['/','/marathon-fueling-calculator/','/blog/','/blog/sydney-marathon-2026-personal-review/','/4-00-marathon-pace-km/','/melbourne-running/','/melbourne-running/the-tan/']){
      await p.goto(base+route);await decline(p);
      const mobile=width<=1000,outer=p.locator('.mpkm-mobile-menu');
      const nav=p.locator(mobile?'#mpkm-mobile-links':'.mpkm-main-nav');
      if(mobile)await outer.locator(':scope > summary').click();
      for(const name of ['Calculators','Training','Guides']){
        const summary=nav.locator('summary[aria-label="'+name+' links"]');await summary.click();
        const panel=nav.locator('#mpkm-'+(mobile?'mobile':'desktop')+'-'+name.toLowerCase());
        assert.ok(await panel.locator('a').last().isVisible(),width+' '+route+' '+name);
        const bounds=await panel.boundingBox();assert.ok(bounds.x>=-1&&bounds.x+bounds.width<=width+1,JSON.stringify({width,route,name,bounds}));
        const targets=await nav.locator('a,summary').evaluateAll(els=>els.filter(el=>el.getBoundingClientRect().height>0).map(el=>({text:el.textContent,w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})));
        assert.ok(targets.every(t=>t.h>=44&&t.w>=44),JSON.stringify(targets));
        await summary.click();
      }
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),width+' '+route+' overflow');
      const height=await p.locator('.mpkm-site-header').evaluate(el=>el.getBoundingClientRect().height);assert.ok(height<=(mobile?90:100),JSON.stringify({route,width,height}));
      if(width===390&&route==='/'){
        await nav.locator('summary[aria-label="Calculators links"]').click();
        await p.screenshot({path:output+'/navigation-mobile.png',fullPage:false});
      }
      if([390,1280].includes(width)){
        await p.addScriptTag({content:axe.source});
        const violations=await p.evaluate(async()=>{
          const include=['.mpkm-site-header','.mpkm-footer'];if(document.querySelector('.mpkm-breadcrumbs'))include.push('.mpkm-breadcrumbs');
          return (await window.axe.run({include},{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));
        });assert.deepEqual(violations,[],route+' '+width);
      }
    }
  }
});
await test('Touch menu, nested Escape, actual destination and active states',async()=>{
  const {p}=await context({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await p.goto(base+'/');
  await decline(p);
  const outer=p.locator('.mpkm-mobile-menu'),toggle=outer.locator(':scope > summary');
  await toggle.tap();const calc=outer.locator('summary[aria-label="Calculators links"]');await calc.tap();
  await p.keyboard.press('Escape');assert.notEqual(await outer.getAttribute('open'),null);assert.equal(await calc.locator('..').getAttribute('open'),null);
  await p.keyboard.press('Escape');assert.equal(await outer.getAttribute('open'),null);assert.ok(await toggle.evaluate(el=>el===document.activeElement));
  await toggle.tap();await calc.tap();await Promise.all([p.waitForURL('**/marathon-fueling-calculator/'),outer.getByRole('link',{name:'Fueling calculator',exact:true}).tap()]);
  assert.ok(p.url().endsWith('/marathon-fueling-calculator/'));assert.equal(await p.locator('.mpkm-main-nav .is-section > a').innerText(),'Calculators');
  await p.goto(base+'/melbourne-running/the-tan/');assert.equal(await p.locator('.mpkm-main-nav .is-section > a').innerText(),'Training');
  assert.match(await p.locator('.mpkm-breadcrumbs').innerText(),/Training.*Melbourne running.*The Tan/s);
});
await test('No JavaScript: native desktop/mobile disclosures and crawlable links',async()=>{
  const {p}=await context({javaScriptEnabled:false});await p.goto(base+'/');
  await p.locator('.mpkm-main-nav summary[aria-label="Calculators links"]').click();
  assert.ok(await p.locator('#mpkm-desktop-calculators a').last().isVisible());
  await p.setViewportSize({width:320,height:800});await p.locator('.mpkm-mobile-menu > summary').click();
  await p.locator('#mpkm-mobile-links summary[aria-label="Training links"]').click();
  await p.locator('#mpkm-mobile-training a[href="/melbourne-running/"]').click();
  assert.ok(p.url().endsWith('/melbourne-running/'));assert.equal(await p.locator('.venue-card').count(),18);
});
await test('Viewport switch closes hidden menus and preserves usable focus',async()=>{
  const {p}=await context({viewport:{width:390,height:800}});await p.goto(base+'/blog/');
  await p.locator('.mpkm-mobile-menu > summary').click();await p.locator('#mpkm-mobile-links summary[aria-label="Training links"]').click();
  await p.setViewportSize({width:1280,height:900});await p.waitForFunction(()=>document.querySelectorAll('.mpkm-site-header details[open]').length===0);
  assert.ok(await p.locator('.mpkm-brand').evaluate(el=>el===document.activeElement));
});
assert.deepEqual(errors,[],'Console script errors');
}finally{
  fs.writeFileSync(output+'/navigation-results.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify({browser:browser.version(),results},null,2));
  await browser.close();server.close();
}
if(results.some(r=>!r.pass))process.exitCode=1;
