"""Sync shared branding and static navigation after adding a page. Idempotent."""
from pathlib import Path
import re
from site_navigation import sync_all, VERSION

ROOT = Path(__file__).resolve().parents[2]
for path in ROOT.rglob('*.html'):
    if any(part.startswith('.') for part in path.relative_to(ROOT).parts): continue
    source = path.read_text()
    if '/assets/site.css' not in source:
        source = source.replace('</head>', f'<link rel="stylesheet" href="/assets/site.css?v={VERSION}">\n</head>', 1)
    if 'name="theme-color"' not in source:
        source = source.replace('</head>', '<meta name="theme-color" content="#174f40">\n</head>', 1)
    if '/favicon.svg' not in source:
        source = source.replace('</head>', '<link rel="icon" href="/favicon.svg?v=20260922" type="image/svg+xml">\n</head>', 1)
    if not re.search(r'<body[^>]*class="[^\"]*mpkm-', source):
        source = re.sub(r'<body\b([^>]*)>', lambda m: '<body' + (re.sub(r'class="([^\"]*)"', r'class="\1 mpkm-legacy"', m[1]) if 'class=' in m[1] else m[1]+' class="mpkm-legacy"') + '>', source, count=1)
    if source != path.read_text(): path.write_text(source)
print('Updated navigation:', len(sync_all()), 'pages')
