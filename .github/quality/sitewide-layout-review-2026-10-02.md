# Sitewide presentation review — 2 October 2026

## Changes

- Shared screen-only layout across 104 HTML pages: 61 reading pages, 41 tool pages and two indexes.
- Reading columns capped at 820 px, smaller headings and consistent spacing; calculators retain wide controls and results.
- Native mobile menu with keyboard operation and a common footer linking author, methods, editorial policy, corrections and site information.
- Forty short comparisons stack into labelled rows on phones. Detailed race splits and long tables retain scrolling.
- Four personal stories receive equal cards on the guides index and appear before general guides on the homepage.

## Validation

- All 104 pages rendered at 1280 and 390 px (208 renders): no script errors, missing local resources, page-level horizontal overflow or layout assertions failing.
- All 17 browser regression groups passed, including calculator totals, exports, planner dates, A4/wrist print generation, keyboard menu operation at 320/390/760 px, comparison labels/values and story discovery.
- Static checks passed for local links/fragments, duplicate IDs, single H1 and JSON-LD. Existing page IDs, canonicals, robots directives, AdSense identity and runtime scripts were preserved.
- The layout helper is idempotent. `git diff --check` passed.
- Inspected representative desktop and phone screenshots of the homepage, guides, personal article, training guide, fueling comparison and calculator.

The browser checks use a local static server, block third-party requests and emulate configured redirects/header exceptions. They do not verify Cloudflare's deployed header engine, live ads/consent or Google approval. This is a presentation update; no new articles, race data or training claims were added.
