"""Export one Markdown review copy per pilot page, including editorial prompts."""
from pathlib import Path
import sys
sys.dont_write_bytecode = True
from importlib.util import spec_from_file_location, module_from_spec
import json
import re
from lxml import html

ROOT = Path(__file__).resolve().parents[2]
spec = spec_from_file_location('melbourne_pilot', ROOT / '.github/quality/build-melbourne-running-pilot.py')
pilot = module_from_spec(spec)
spec.loader.exec_module(pilot)


def inline(node):
    if not isinstance(node.tag, str):
        return ''
    result = node.text or ''
    for child in node:
        text = inline(child)
        if child.tag == 'a':
            url = child.get('href')
            if url.startswith('/'):
                url = pilot.DOMAIN + url
            elif url.startswith('#'):
                url = pilot.DOMAIN + current_slug + url
            text = f'[{text}]({url})'
        elif child.tag in ['strong', 'b']:
            text = '**' + text + '**'
        elif child.tag in ['em', 'i']:
            text = '*' + text + '*'
        result += text + (child.tail or '')
    return re.sub(r'\s+', ' ', result).strip()


def block(node):
    if not isinstance(node.tag, str) or node.tag in ['script', 'form', 'noscript']:
        return ''
    if node.get('class') == 'venue-jump' or node.get('id') in ['venue-count', 'venue-empty']:
        return ''
    tag = node.tag
    if re.fullmatch(r'h[1-6]', tag):
        return '#' * int(tag[1]) + ' ' + inline(node) + '\n\n'
    if tag == 'p':
        return inline(node) + '\n\n'
    if tag in ['ul', 'ol']:
        return '\n'.join(('- ' if tag == 'ul' else f'{i + 1}. ') + inline(child) for i, child in enumerate(node) if child.tag == 'li') + '\n\n'
    if tag == 'table':
        rows = [[inline(cell).replace('|', '\\|') for cell in row] for row in node.xpath('.//tr')]
        caption = ''.join(node.xpath('./caption/text()'))
        lines = ['| ' + ' | '.join(row) + ' |' for row in rows]
        lines.insert(1, '| ' + ' | '.join(['---'] * len(rows[0])) + ' |')
        return (caption + '\n\n' if caption else '') + '\n'.join(lines) + '\n\n'
    if tag == 'dl':
        lines = ['| Fact | Detail |', '| --- | --- |']
        for item in node:
            dt, dd = item.find('dt'), item.find('dd')
            if dt is not None and dd is not None:
                lines.append(f'| {inline(dt)} | {inline(dd)} |')
        return '\n'.join(lines) + '\n\n'
    prefix = inline(node).split(inline(node[0]))[0] + '\n\n' if tag == 'article' and node.get('data-venue') is not None and len(node) else ''
    if node.get('class') == 'venue-location':
        return '*' + inline(node) + '*\n\n'
    return prefix + ''.join(block(child) for child in node)


for page in pilot.PAGES:
    current_slug = page['slug']
    path = ROOT / page['slug'].strip('/') / 'index.html'
    document = html.fromstring(path.read_text())
    article = document.xpath('//main/article')[0]
    text = block(article)
    seo = f'''Title tag: {page['title']}
Meta description: {page['description']}
URL slug: {page['slug']}
Last checked: {pilot.DISPLAY_DATE} (online sources)

'''
    editor = '## Editorial photo and visit prompts\n\n'
    editor += '\n'.join('- [Your own photo] ' + photo for photo in page['photos'])
    editor += '\n\n[Personal visit note: add a dated observation after visiting. No visit is claimed in the present copy.]\n\n'
    if page['slug'] == pilot.HUB:
        editor += 'The website implements region and venue-type filters and links to all 18 complete venue guides.\n\n'
    editor += '## Suggested internal links\n\n' + '\n'.join(f'- [{name}]({pilot.DOMAIN + slug})' for slug, name in page['internal']) + '\n\n'
    editor += '## JSON-LD\n\n```json\n' + json.dumps(pilot.schema(page), ensure_ascii=False, indent=2) + '\n```\n'
    filename = 'hub.md' if page['slug'] == pilot.HUB else page['slug'].strip('/').split('/')[-1] + '.md'
    dest = ROOT / '.github/quality/melbourne-running' / filename
    dest.write_text(seo + text + editor)
    print(dest.relative_to(ROOT))
