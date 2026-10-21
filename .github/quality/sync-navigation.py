"""Generate shared static headers, footers and breadcrumbs before committing."""
import sys
from site_navigation import sync_all

changed = sync_all(check='--check' in sys.argv)
print(('Stale' if '--check' in sys.argv else 'Updated') + f' navigation: {len(changed)} pages')
if '--check' in sys.argv and changed:
    print('\n'.join(changed))
    raise SystemExit(1)
