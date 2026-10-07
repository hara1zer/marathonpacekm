"""Verify actual Chromium PDFs and render evidence; developer-only PyMuPDF."""
import json, sys
from pathlib import Path
import fitz
root=Path(sys.argv[1]); manifest=json.loads((root/'manifest.json').read_text()); results=[]
for case in manifest:
 doc=fitz.open(root/case['file'])
 assert len(doc)==1, (case['file'], 'page count', len(doc))
 page=doc[0]; w,h=(297,210) if case['paper']=='a4' else (279.4,215.9)
 assert abs(page.rect.width*25.4/72-w)<0.5 and abs(page.rect.height*25.4/72-h)<0.5
 text=page.get_text(); assert text.count('FINISH')==3, (case['file'], text)
 assert text.count('HALF')>=3 and text.count(case['goal'])>=6
 assert 'Predictor' not in text and 'Privacy' not in text and 'Create your printable' not in text
 spans=[s for b in page.get_text('dict')['blocks'] if 'lines' in b for l in b['lines'] for s in l['spans']]
 times=[s for s in spans if s['text']==case['goal'] and abs(s['size']-10)<0.15]
 labels=[s for s in spans if s['text']=='FINISH']
 assert len(times)>=3 and len(labels)==3
 assert all(abs(s['size']-8)<0.15 for s in labels)
 for s in spans:
  x0,y0,x1,y1=s['bbox']; assert x0>=27 and y0>=27 and x1<=page.rect.width-27 and y1<=page.rect.height-27, (case['file'],s)
 # Calibration rule appears as a 50mm horizontal path in the real PDF.
 lines=[item for d in page.get_drawings() for item in d['items'] if item[0]=='l']
 assert any(abs(abs(item[2].x-item[1].x)*25.4/72-50)<0.25 and abs(item[2].y-item[1].y)<0.2 for item in lines), (case['file'],'calibration rule missing')
 page.get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save(root/(case['file']+'.png'))
 results.append({'file':case['file'],'pages':1,'width_mm':w,'height_mm':h,'verified':True})
(root/'pdf-results.json').write_text(json.dumps(results,indent=2))
print(f'{len(results)} actual PDFs passed page count, paper dimensions, margins, copy count, fonts and calibration checks')
