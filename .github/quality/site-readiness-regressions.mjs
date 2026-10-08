import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const read=path=>readFileSync(join(root,path),'utf8');
function htmlFiles(dir){
  return readdirSync(dir,{withFileTypes:true}).flatMap(ent=>{
    const path=join(dir,ent.name);
    if(ent.name.startsWith('.'))return [];
    return ent.isDirectory()?htmlFiles(path):(ent.isFile()&&ent.name.endsWith('.html')?[path]:[]);
  });
}
const files=htmlFiles(root);
const sitemapUrls=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
assert.equal(sitemapUrls.length,new Set(sitemapUrls).size,'sitemap URLs must be unique');
for(const url of sitemapUrls){
  assert.ok(url.startsWith('https://marathonpacekm.com/'),'production sitemap domain');
  const page=read(new URL(url).pathname.replace(/^\//,'')+'index.html');
  const canonical=[...page.matchAll(/<link\b[^>]*>/gi)].map(x=>x[0]).find(tag=>/\brel="canonical"/i.test(tag));
  assert.equal(canonical?.match(/\bhref="([^"]+)"/i)?.[1],url,'sitemap and canonical agree: '+url);
  assert.doesNotMatch(page,/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i,'sitemap page must remain indexable');
}
assert.ok(files.length>=105,'Scan all publicly served HTML, including nested pages');
for(const file of files){
  const source=readFileSync(file,'utf8');
  const path=file.slice(root.length+1).replaceAll('\\','/');
  assert.equal((source.match(/\/assets\/site-telemetry\.js\?v=20261008-audit/g)||[]).length,1,'one cache-busted consent loader: '+path);
  assert.doesNotMatch(source, /<script[^>]+(?:pagead2\.googlesyndication\.com|googletagmanager\.com\/gtag\/js)/i,'no hardcoded advertising or analytics code: '+path);
  assert.doesNotMatch(source, /As an Amazon Associate I earn|https:\/\/amzn\.to\//i,'no expired affiliate links: '+path);
}
for(const [path,title,example] of [
 ['3-30-marathon-pace-km/index.html','3:30 Marathon Pace: KM &amp; Mile Splits + Free Pace Band','4:51.3/km'],
 ['4-30-marathon-pace-km/index.html','4:30 Marathon Pace (6:24/km) | Splits &amp; Free Pace Band','450 metres']
]){
  const source=read(path);
  assert.ok(source.includes('<title>'+title+'</title>'),'preserved high-impression SEO title: '+path);
  assert.ok(source.includes(example),'distinct new worked explanation: '+path);
  assert.match(source, /<meta name="robots" content="index, follow/i,'page remains indexable');
  assert.ok(source.includes('<link rel="canonical" href="https://marathonpacekm.com/'+path.replace(/index\.html$/,'')+'">'),'preserved canonical: '+path);
  assert.match(source, /<meta name="google-adsense-account"/,'publisher verification stays');
}
assert.ok(read('3-30-marathon-pace-km/index.html').includes('id="goal-config">{"seconds":12600'));
assert.ok(read('4-30-marathon-pace-km/index.html').includes('id="goal-config">{"seconds":16200'));
const finishKm=42.195;
const delayedAt30=Math.round(12600*30/finishKm)+90;
assert.ok(Math.abs((12600-delayedAt30)/(finishKm-30)-291.3)<0.1,'3:30 late-race example is correctly calculated');
assert.ok(Math.abs((1000/10-1000/12)*27-450)<0.01,'4:30 walk-pacing example is correctly calculated');
const script=read('assets/site-telemetry.js');
assert.doesNotMatch(script,/pagead2\.googlesyndication|adsbygoogle\.js/i,'ads must be disabled pending approval');
assert.match(script, /analytics_storage: 'granted'/,'analytics consent must be explicit');
assert.match(script, /analytics_storage: 'denied'/,'withdrawal must be supported');
assert.ok(read('privacy/index.html').includes('The analytics choice above is <strong>not advertising consent</strong>'));
assert.equal((read('robots.txt').match(/Sitemap:/g)||[]).length,1,'sitemap remains published');
for (const rule of ['3:10-marathon-pace-km/ /3-10-marathon-pace-km/ 301','3:15-marathon-pace-km/ /3-15-marathon-pace-km/ 301']) assert.ok(read('_redirects').includes(rule),'historical search alias redirect exists: '+rule);
assert.match(read('ads.txt'),/^google.com,\s*pub-5455873308344668,/);
console.log('Site readiness: '+files.length+' HTML references, stable URLs/titles, new math, privacy and publisher metadata passed.');
