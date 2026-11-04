"""Refresh the two consolidated guides while retaining their existing identity.

Individually written main bodies are source-controlled beside the new guides.
Existing publication dates are retained; an unknown date is not invented.
"""
from pathlib import Path
import re
import json
from lxml import html
from site_navigation import apply_navigation

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SLUGS = ['why-marathon-pace-feels-harder-some-days','why-do-i-slow-down-after-30k']

def build(slug):
    route = '/blog/'+slug+'/'
    page = ROOT/route.lstrip('/')/'index.html'
    source = page.read_text()
    body = (HERE/'pace-guides'/f'{slug}.body.html').read_text()
    source, count = re.subn(r'(<main\b[^>]*>).*?(</main>)', lambda m:m[1]+'\n'+body+'\n'+m[2],source,count=1,flags=re.S)
    assert count == 1
    doc = html.fragment_fromstring(body, create_parent='div')
    title = doc.xpath('string(.//h1)')
    citations = list(dict.fromkeys(doc.xpath('.//a[starts-with(@href,"https://")]/@href')))
    faq = []
    for heading in doc.xpath('.//*[@id="faq"]//h3'):
        answer = heading.getnext()
        if answer is not None and answer.tag == 'p':
            faq.append({'@type':'Question','name':heading.text_content(),'acceptedAnswer':{'@type':'Answer','text':answer.text_content()}})
    def update(node):
        if isinstance(node,list): return [update(n) for n in node]
        if not isinstance(node,dict): return node
        node = {k:update(v) for k,v in node.items()}
        if node.get('@type') == 'Article':
            node.update(headline=title,dateModified='2026-11-04',citation=citations,wordCount=len(doc.text_content().split()))
        if node.get('@type') == 'FAQPage': node['mainEntity'] = faq
        return node
    def schema(m):
        return m[1]+json.dumps(update(json.loads(m[2])),ensure_ascii=False,indent=2).replace('</','<\\/')+m[3]
    source = re.sub(r'(<script\b[^>]*type="application/ld\+json"[^>]*>)(.*?)(</script>)',schema,source,flags=re.S)
    source = re.sub(r'(<meta\s+property="article:modified_time"\s+content=")[^"]*',r'\g<1>2026-11-04',source)
    page.write_text(apply_navigation(source,route))
    print(route)

if __name__ == '__main__':
    for slug in SLUGS: build(slug)
