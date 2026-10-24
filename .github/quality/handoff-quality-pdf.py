"""Verify the new handoff and short-race quick-print output actually contains the plan."""
import sys
from pathlib import Path
import fitz

root = Path(sys.argv[1])
for filename, expected in {
    'handoff-half-checkpoints.pdf': ['Half marathon checkpoints: 2:00:17', 'Negative split', '21.0975 km'],
    'handoff-half-wrist.pdf': ['Half marathon pace bands', '2:00:00'],
    'quick-print-5km.pdf': ['5 km', '0:25:07', 'Finish'],
    'quick-print-10km.pdf': ['10 km', '0:25:07', 'Finish'],
}.items():
    with fitz.open(root/filename) as doc:
        assert len(doc) == 1, (filename, 'unexpected pagination', len(doc))
        text = ' '.join(page.get_text() for page in doc)
        text = ' '.join(text.split())
        for value in expected:
            assert value in text, (filename, 'missing plan content', value)
        if filename.startswith('quick-print'):
            assert '42.195' not in text and '4:00:00' not in text, (filename, 'marathon default substituted')
print('Four handoff/quick-print PDFs passed exact targets, selected distance, content and single-page checks.')
