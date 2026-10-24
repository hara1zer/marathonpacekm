import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium:pw}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(new URL('../../',import.meta.url).pathname);
const output=process.env.QA_OUTPUT || '/tmp/marathonpacekm-quality-qa';fs.mkdirSync(output,{recursive:true});
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
await context.addInitScript(() => { window.print = () => { window.printRequested = true; }; });
try {
await test('Half marathon exact seconds survive calculator, share, embed, reload, PDF and print', async () => {
 await go('/marathon-pace-calculator/?distance=half&h=2&m=0&s=17&unit=mi&strategy=negative&negative=2&reading=across&layout=a4&paper=letter&wrist=200');
 assert.equal(await page.locator('#dist').inputValue(),'21.0975');
 assert.match(await text('checkpointTable'),/2:00:17/);
 assert.match(await text('results'),/1:01:09/);
 const share=await page.locator('#shareUrl').inputValue();
 const q=new URL(share).searchParams;
 for(const [key,value] of Object.entries({distance:'half',h:'2',m:'0',s:'17',unit:'mi',strategy:'negative',negative:'2',reading:'across',layout:'a4',paper:'letter',wrist:'200'}))assert.equal(q.get(key),value,key);
 assert.ok((await page.locator('#embedSnippet').inputValue()).includes('distance=half'));
 assert.ok((await page.locator('#embedSnippet').inputValue()).includes('title='));
 await page.reload();assert.equal(await page.locator('#s').inputValue(),'17');
 await page.evaluate(()=>{window.copied='';navigator.clipboard.writeText=async value=>{window.copied=value;};});
 await page.click('#copyShareBtn');assert.equal(await page.evaluate(()=>window.copied),share);
 const popupEvent=context.waitForEvent('page');await page.click('#pdfBtn');const popup=await popupEvent;await popup.waitForLoadState();await popup.waitForFunction(()=>window.printRequested);
 assert.match(await popup.locator('#checkpointPrint').innerText(),/Half marathon.*2:00:17/is);
 assert.equal(await popup.locator('input[name=distance]:checked').inputValue(),'half');
 await popup.pdf({path:output+'/handoff-half-checkpoints.pdf',preferCSSPageSize:true});
 await go('/marathon-pace-calculator/?distance=half&h=2&m=0&s=0');
 assert.match(await text('results'),/5:41/);assert.match(await text('checkpointTable'),/0:28:26/);
 await page.click('#selectedBandLink');assert.equal(await page.locator('input[name=distance]:checked').inputValue(),'half');assert.match(await text('wristPreview'),/2:00:00/);
 await page.reload();assert.match(await text('wristPreview'),/2:00:00/);
 await page.click('#printBtn');await page.waitForFunction(()=>window.printRequested);await page.pdf({path:output+'/handoff-half-wrist.pdf',preferCSSPageSize:true});
 await page.locator('details').filter({has:page.locator('#printA4Btn')}).locator('summary').click();
 await page.click('#printA4Btn');assert.ok((await page.locator('#embedCode').inputValue()).includes('layout=a4'));
 await page.click('#printBtn');assert.ok((await page.locator('#embedCode').inputValue()).includes('layout=wrist'));
 const embedPage=await context.newPage();await embedPage.goto(base+'/');
 await embedPage.evaluate(share=>{const f=document.createElement('iframe');f.src=share;f.id='test-embed';document.body.append(f);},share);
 await embedPage.frameLocator('#test-embed').locator('#wristPreview').waitFor();
 assert.match(await embedPage.frameLocator('#test-embed').locator('#wristPreview').innerText(),/2:00:17/);
});
await test('All supported strategies agree with generator checkpoints and preserve strict sub-four seconds',async()=>{
 for(const distance of ['marathon','half'])for(const strategy of ['even','controlled','negative']){
  const query=`distance=${distance}&h=3&m=59&s=59&strategy=${strategy}&cushion=30&negative=2&reading=across`;
  await go('/marathon-pace-calculator/?'+query);
  const five=await page.locator('#checkpointTable tr').filter({hasText:'5 km'}).first().locator('td').innerText();
  const share=await page.locator('#shareUrl').inputValue();await page.goto(share);
  assert.ok((await text('wristPreview')).includes(five.replace(/^0:/,'')),distance+' '+strategy+' '+five);
  assert.match(await text('wristPreview'),/3:59:59/);
  await page.locator('details').filter({has:page.locator('#copyBtn')}).locator('summary').click();await page.click('#copyBtn');
  assert.equal(await page.locator('#readingDirection').inputValue(),'across');
 }
});
await test('Unsupported short distances and invalid targets cannot silently export a marathon',async()=>{
 for(const distance of ['5','10']){
  await go('/marathon-pace-calculator/?distance='+distance+'&h=0&m=25&s=7');
  assert.match(await text('checkpointTable'),/0:25:07/);
  for(const id of ['pdfBtn','copyShareBtn','copyShareBtn2','openShareBtn'])assert.ok(await page.locator('#'+id).isDisabled());
  assert.equal(await page.locator('#shareUrl').inputValue(),'');assert.equal(await page.locator('#selectedBandLink').getAttribute('href'),null);
  await page.click('#printThisBtn');assert.ok(await page.evaluate(()=>window.printRequested));await page.pdf({path:output+'/quick-print-'+distance+'km.pdf',format:'A4'});
 }
 for(const query of ['h=0&m=0&s=0','h=25&m=0&s=0','h=4&m=60&s=0','h=4&m=0&s=-1','h=4&m=1.5&s=0','h=&m=0&s=0','distance=unknown&h=4&m=0&s=0','h=4&m=0&s=0&strategy=controlled&cushion=0.5']){
  await go('/marathon-pace-calculator/?'+query);assert.ok(await page.locator('#pdfBtn').isDisabled(),query);assert.equal(await page.locator('#shareUrl').inputValue(),'');
 }
 await go('/marathon-pace-calculator/');await page.fill('#m','');assert.ok(await page.locator('#pdfBtn').isDisabled());
 await page.fill('#m','12');assert.ok(await page.locator('#pdfBtn').isEnabled());await page.click('#resetBtn');assert.equal(new URL(page.url()).searchParams.get('h'),'4');
});
await test('Both conditions CTAs carry the computed target and never retain an invalid stale result',async()=>{
 await go('/race-conditions-pace-adjuster/?h=3&m=59&s=59&tempC=30&dewC=20&rhPct=60&wind=10&hills=flat&accl=no&risk=safe&unit=mi&reading=across&layout=a4');
 const expected=Math.round(14399*(1+((30-15)*0.25+(20-12)*0.35)*1.10/100));
 const links=await page.locator('[data-adjusted-plan]').evaluateAll(els=>els.map(el=>el.href));assert.equal(links.length,2);assert.equal(links[0],links[1]);
 const q=new URL(links[0]).searchParams;assert.equal(Number(q.get('h'))*3600+Number(q.get('m'))*60+Number(q.get('s')),expected);
 await page.locator('[data-adjusted-plan]').last().click();
 assert.equal(await page.locator('#unit').inputValue(),'mi');assert.equal(await page.locator('#reading').inputValue(),'across');assert.equal(await page.locator('#pdfLayout').inputValue(),'a4');
 const formatted=`${Math.floor(expected/3600)}:${String(Math.floor(expected/60)%60).padStart(2,'0')}:${String(expected%60).padStart(2,'0')}`;
 assert.match(await text('checkpointTable'),new RegExp(formatted));await page.click('#selectedBandLink');assert.match(await text('wristPreview'),new RegExp(formatted));
 await go('/race-conditions-pace-adjuster/');await page.fill('#h','');assert.equal(await page.locator('[data-adjusted-plan][href]').count(),0);
 await page.click('#resetBtn');assert.equal(await page.locator('[data-adjusted-plan][href]').count(),2);
 const target=await page.locator('[data-adjusted-plan]').first().getAttribute('href');await page.reload();assert.equal(await page.locator('[data-adjusted-plan]').first().getAttribute('href'),target);
 for(const key of ['hills','accl','risk']){
  await go('/race-conditions-pace-adjuster/?'+key+'=unknown');assert.equal(await page.locator('[data-adjusted-plan][href]').count(),0,key+' invalid choice');
 }
 await go('/race-conditions-pace-adjuster/?h=24&m=59&s=59&tempC=30');assert.equal(await page.locator('[data-adjusted-plan][href]').count(),0,'out-of-range scenario has no broken handoff');
});
await test('Consolidated guides redirect directly, preserve fragments and keep canonical targets',async()=>{
 const pairs=[['/even-vs-negative-splits/','/blog/negative-split-pacing/','arithmetic'],['/adjust-marathon-pace/wind/','/blog/wind-pacing-headwind-tailwind/','checkpoints'],['/adjust-marathon-pace/hills/','/blog/hills-pacing-give-away-seconds-avoid-quad-destruction/','uphill']];
 for(const [from,to,fragment] of pairs){
  for(const route of [from,from.slice(0,-1),from+'index.html']){const r=await context.request.get(base+route,{maxRedirects:0});assert.equal(r.status(),301);assert.equal(r.headers().location,to);}
  await go(from+'#'+fragment);assert.equal(new URL(page.url()).pathname,to);assert.equal(await page.locator('#'+fragment).count(),1);assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://marathonpacekm.com'+to);
 }
});
await test('Changed tools and consolidated guides fit phones and pass WCAG A/AA checks',async()=>{
 const axePath=require.resolve(process.env.AXE_MODULE || 'axe-core');
 for(const route of ['/marathon-pace-calculator/?distance=half&h=2&m=0&s=17','/race-conditions-pace-adjuster/','/blog/negative-split-pacing/','/blog/wind-pacing-headwind-tailwind/','/blog/hills-pacing-give-away-seconds-avoid-quad-destruction/']){
  for(const width of [320,390,1280]){
   await page.setViewportSize({width,height:900});await go(route);
   if(await page.getByRole('button',{name:'Decline',exact:true}).isVisible())await page.getByRole('button',{name:'Decline',exact:true}).click();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),route+' '+width);
   if(width===390||width===1280)await page.screenshot({path:output+'/quality-'+route.split('?')[0].replaceAll('/','_')+'-'+width+'.png',fullPage:true});
  }
  await page.addScriptTag({path:axePath});
  const violations=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})));
  assert.deepEqual(violations,[],route+' accessibility');
 }
});
assert.deepEqual(errors,[],'No uncaught browser errors');
} finally {
 fs.writeFileSync(output+'/handoff-quality-results.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));await browser.close();await new Promise(resolve=>server.close(resolve));
}
if(results.some(r=>!r.pass))process.exitCode=1;
