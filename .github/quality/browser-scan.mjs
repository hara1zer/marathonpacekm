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
const files=fs.readdirSync(root,{recursive:true}).filter(p=>p.endsWith('.html')&&!p.split(path.sep).some(p=>p.startsWith('.')));
const data={pages:files.map(p=>({route:'/'+p.replace(/index\.html$/,'')}))};
const results=[];
try{
  for(const width of [1280,390]){
    const context=await browser.newContext({viewport:{width,height:900},timezoneId:'Australia/Melbourne',acceptDownloads:true});
    await context.route('**/*',route=>{
      const u=new URL(route.request().url());
      return u.hostname==='127.0.0.1' ? route.continue() : route.abort();
    });
    for(const item of data.pages){
      if(process.argv.includes('--focused')&&!['/','/3-00-marathon-pace-km/','/3-30-marathon-pace-km/','/4-15-marathon-pace-km/','/marathon-fueling-calculator/','/marathon-time-predictor/','/monthly-training-plan/','/printable-pace-band/','/blog/sydney-marathon-2026-personal-review/','/blog/rebuilding-after-sydney-marathon/','/blog/marathon-fueling-experiments/','/privacy/'].includes(item.route))continue;
      const page=await context.newPage();const errors=[];const missing=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))missing.push(r.url().replace(base,''));});
      try{
        await page.goto(base+item.route,{waitUntil:'load',timeout:15000});
        const details=await page.evaluate(()=>{
          const width=document.documentElement.clientWidth;
          return {
            overflow:document.documentElement.scrollWidth>width+2,
            branded:!!document.querySelector('.brand-mark svg,.mpkm-brand-mark svg'),
            themeLoaded:!![...document.styleSheets].find(s=>s.href?.includes('/assets/theme.css')),
            layoutLoaded:!![...document.styleSheets].find(s=>s.href?.includes('/assets/layout.css')),
            footerCount:document.querySelectorAll('.mpkm-footer').length,
            mobileMenuCount:document.querySelectorAll('.mpkm-mobile-menu').length,
            headerHeight:document.querySelector('.mpkm-site-header,.site-header')?.getBoundingClientRect().height,
            readingWidth:document.body.classList.contains('mpkm-reading')?document.querySelector('main')?.getBoundingClientRect().width:null,
            readingH1Size:document.body.classList.contains('mpkm-reading')?parseFloat(getComputedStyle(document.querySelector('h1')).fontSize):null,
            blueSurfaces:[...document.querySelectorAll('section,button,.card,.callout,header')].filter(el=>{
              const c=getComputedStyle(el).backgroundColor.match(/[\d.]+/g)?.map(Number)||[];
              return el.getBoundingClientRect().width>20&&c.length>=3&&c[2]>c[0]+20&&c[2]>c[1]+15;
            }).map(el=>({tag:el.tagName,cls:el.className,color:getComputedStyle(el).backgroundColor})),
            wide:[...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.right>width+3&&getComputedStyle(el).position!=='absolute'&&!el.closest('.table-scroll,.split-table-wrap,textarea,svg')}).slice(0,6).map(el=>({tag:el.tagName,id:el.id,cls:el.className,width:el.getBoundingClientRect().width})),
            inputs:[...document.querySelectorAll('input,select,button,textarea')].map(el=>({id:el.id,type:el.type,value:el.value,text:(el.textContent||'').trim().slice(0,80)})),
            h1:document.querySelector('h1')?.textContent
          };
        });
        results.push({route:item.route,width,errors,missing,...details});
        if(['/','/blog/','/blog/run-melbourne-half-marathon-2025-vs-2026/','/blog/tempo-vs-threshold-vs-marathon-pace/','/norwegian-singles/','/3-00-marathon-pace-km/','/4-15-marathon-pace-km/','/marathon-fueling-calculator/','/blog/sydney-marathon-2026-personal-review/','/blog/rebuilding-after-sydney-marathon/','/blog/marathon-fueling-experiments/','/privacy/'].includes(item.route)){
          await page.screenshot({path:output+'/'+(item.route.replaceAll('/','_')||'home')+'-'+width+'.png',fullPage:true});
          await page.screenshot({path:output+'/'+(item.route.replaceAll('/','_')||'home')+'-'+width+'-opening.png',fullPage:false});
        }
        if(['/blog/rebuilding-after-sydney-marathon/','/blog/marathon-fueling-experiments/'].includes(item.route)){
          const name=item.route.replaceAll('/','_')+'-'+width;
          await page.screenshot({path:output+'/'+name+'-opening.png',fullPage:false});
          const section=item.route.includes('rebuilding-')?'#phases':'#arithmetic';
          await page.locator(section).screenshot({path:output+'/'+name+'-table.png'});
        }
      }catch(e){results.push({route:item.route,width,errors:[e.message]});}
      await page.close();
    }
    await context.close();
  }
  fs.writeFileSync(output+'/browser-diagnostics.json',JSON.stringify(results,null,2));
  const hasIssue=x=>x.errors?.length||x.missing?.length||x.overflow||!x.branded||!x.themeLoaded||!x.layoutLoaded||x.footerCount!==1||x.mobileMenuCount!==1||(x.width===390&&x.headerHeight>90)||(x.readingWidth>821)||(x.readingH1Size>42);
  console.log(JSON.stringify({browser:browser.version(),checked:results.length,issues:results.filter(hasIssue).map(({route,width,errors,missing,overflow,wide,layoutLoaded,footerCount,mobileMenuCount,headerHeight,readingWidth,readingH1Size})=>({route,width,errors,missing,overflow,wide,layoutLoaded,footerCount,mobileMenuCount,headerHeight,readingWidth,readingH1Size}))},null,2));
  if(results.some(hasIssue))process.exitCode=1;
}finally{await browser.close();server.close();}
