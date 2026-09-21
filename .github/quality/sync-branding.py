"""Apply shared branding to static pages, including newly added routes. Idempotent."""
from pathlib import Path
import re
R=Path(__file__).resolve().parents[2]
header='''<header class="mpkm-site-header"><div class="mpkm-header-inner">
<a class="mpkm-brand" href="/"><span class="mpkm-brand-mark" aria-hidden="true"><svg width="25" height="25" viewBox="0 0 25 25" fill="none"><path d="M5 18V9a6 6 0 0 1 12 0v9M9 18V9a2 2 0 0 1 4 0v9M3 18h18M20 5v9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></span><span>Marathon Pace KM<small>A plan for every kilometre</small></span></a>
<nav class="mpkm-main-nav" aria-label="Main navigation"><a href="/">Pace chart</a><a href="/marathon-time-predictor/">Predictor</a><a href="/monthly-training-plan/">Training plan</a><a href="/blog/">Guides</a><a class="mpkm-nav-cta" href="/printable-pace-band/">Pace band ↗</a></nav>
</div></header>'''
for p in R.rglob('*.html'):
 if any(part.startswith('.') for part in p.relative_to(R).parts):continue
 s=p.read_text();modern='class="brand-mark"' in s
 # Shared CSS follows page styles; its namespaced selectors also cover body-end styles.
 if '/assets/theme.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/assets/theme.css?v=20260922">\n</head>')
 if not modern and 'class="mpkm-site-header"' not in s:
  def body(m):
   tag=m[0]
   if re.search(r'\bclass=',tag):tag=re.sub(r'class="([^"]*)"',r'class="\1 mpkm-legacy"',tag,1)
   else:tag=tag[:-1]+' class="mpkm-legacy">'
   return tag+'\n'+header
  s=re.sub(r'<body\b[^>]*>',body,s,count=1,flags=re.I)
  # Keep old page navigation but remove duplicate plain-text brand names.
  s=re.sub(r'(<a\b[^>]*class=")((?:logo|site-title|brand))(")',r'\1\2 mpkm-old-brand\3',s)
 if 'name="theme-color"' in s:s=re.sub(r'(<meta\b[^>]*name="theme-color"[^>]*content=")[^"]*',r'\g<1>#174f40',s)
 else:s=s.replace('</head>','<meta name="theme-color" content="#174f40">\n</head>')
 if '/favicon.svg' not in s:s=s.replace('</head>','<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n</head>')
 for icon in ['favicon.svg','favicon.ico','apple-touch-icon.png']:
  s=s.replace('href="/'+icon+'"','href="/'+icon+'?v=20260922"')
 if s!=p.read_text():p.write_text(s)
print('Applied shared branding to',len(list(R.rglob('*.html'))),'pages')
