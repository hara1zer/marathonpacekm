"""Check text scope and page bounds in the four actual reference PDFs."""
from pathlib import Path
import sys
import fitz

out=Path(sys.argv[1])
cases={
 'half-chart':(['3:30:00','21.0975'],['How do I use these checkpoints during the race?']),
 'track-chart':(['1,600 m','8:00'],['How do recoveries change the full workout?']),
 'half-taper':(['20.0 km','21.0975 km'],['How do I use these checkpoints during the race?']),
 'easy-record':(['Date / route / surface','Conversation and perceived effort'],['What should my easy-run pace be?']),
}
for name,(required,absent) in cases.items():
 doc=fitz.open(out/f'reference-{name}.pdf')
 assert 1<=len(doc)<=2,(name,len(doc))
 text=' '.join(' '.join(page.get_text().split()) for page in doc)
 for token in required:assert token in text,(name,token)
 for token in absent:assert token not in text,(name,token,'outside selected print scope')
 for page in doc:
  for block in page.get_text('dict')['blocks']:
   for line in block.get('lines',[]):
    for span in line['spans']:
     x0,y0,x1,y1=span['bbox']
     assert x0>=-1 and x1<=page.rect.width+1,(name,span['text'],'horizontal clipping')
 print(name,len(doc),'page(s), text and bounds passed')
