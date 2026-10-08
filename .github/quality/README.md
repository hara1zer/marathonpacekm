# Browser regressions

The site remains static HTML/CSS/JavaScript with no production build step.
These developer-only scripts need Node 20+ and Playwright installed in your local development environment. Install its Chromium browser (`npx playwright install chromium`), then run from the repository root:

```
node .github/quality/browser-regressions.mjs
node .github/quality/seo-regressions.mjs
node .github/quality/browser-scan.mjs
```

Optional environment variables: `PLAYWRIGHT_MODULE` (absolute module path), `CHROMIUM_PATH`, `CHROMIUM_ARGS` (JSON array), and `QA_OUTPUT` (outside the published directory; defaults to `/tmp/marathonpacekm-qa`). Do not publish dependencies or test output. The scripts start a local server, block third-party requests and emulate explicit redirects and the iframe-header exception. They do not test Cloudflare's deployed header engine or actual ad serving/consent.

The regression script checks normal/invalid calculator inputs, precise time totals, km/mile band segments, prediction scenarios, zero-mileage weeks, fueling schedules, CSV/PNG downloads and both print layouts. It also checks the personal articles' title/schema identity, discovery links, modified dates and worked gel example against the calculator. The scan visits every HTML page at 1280 and 390 px, recording script errors, missing resources and horizontal overflow; `--focused` includes the two new personal articles and selected priority pages. Nonzero exit means a failed check.

## Shared branding

The site-wide palette and legacy-page styling live in `assets/theme.css`. Homepage-style pages retain their existing layout; other pages use the same logo and a common static masthead. Run `python3 .github/quality/sync-branding.py` after adding a page to attach the shared CSS, logo/navigation and current favicon references. The script is idempotent and uses only the Python standard library. Update the version in that script and asset references when changing cached branding assets. Screen styles are scoped away from print layouts.

## Shared page layout

`assets/layout.css` supplies narrower reading columns, the native mobile menu, common footers and story cards. After syncing branding or adding a page, run `python3 .github/quality/apply-layout-polish.py` (requires Python's `lxml` package). It classifies pages as reading, index or tool layouts and preserves existing footer year IDs and scripts. Calculators keep their wide layout. Bump the stylesheet version in the helper and page references when changing this cached asset.

Only short, regular comparison tables on reading pages receive the `mpkm-summary-table` class and phone layouts with column labels. Detailed splits retain horizontal scrolling. The browser scan checks layout loading, one menu/footer per page, compact phone headers and reading-column widths. Regression checks cover keyboard menu operation, preserved table values, story discovery and calculator widths.

## Original article figures and checkpoint cards

Run `python3 .github/quality/build-content-assets.py` to regenerate the three Sydney figures, eight checkpoint cards and public chart-data JSON in `assets/original/`. The script uses only the Python standard library and data already published in the personal review. It does not reconstruct missing race kilometres or long-run laps. Checkpoint calculations retain full precision over 42.195 km before rounding displayed elapsed times.

Article tables and figures use `assets/content.css`. Wide tables have a phone-width swipe cue and keyboard focus; keep their captions, column headers and scroll region when editing. Neither the static checkpoint cards nor the printable pace-band tool includes a gel schedule: link the separate fueling calculator when both references are needed.

## Shared CSS bundle and SEO checks

Pages load the committed `assets/site.css` bundle. After editing `theme.css`, `content.css`, `layout.css` or `performance.css`, run `python3 .github/quality/build-shared-css.py` and commit the regenerated bundle. The source stylesheets remain the authoring files; Cloudflare needs no build dependency. Legacy pages may also load their existing `assets/style.css` base styles.

`seo-regressions.mjs` checks the five-hour run/walk calculator, partial final intervals, stopped-time arithmetic, invalid values, 3:25 KM/mile exports, matching pace-band links and static splits without JavaScript. It mocks the Google tag to test first-visit denial, saved choices, opt-in, consent-gated band/calculator events, withdrawal, a 320 px banner, hidden print controls and tag-free embedding. Advertising must never load. These checks do not measure deployed Core Web Vitals or real ad behavior.

Run `python3 .github/quality/build-half-marathon-assets.py` to regenerate the two Run Melbourne comparison figures from `assets/original/half-marathon-2025-2026-data.json`. Full recorded kilometre laps are compared descriptively; partial laps and missing GPS distance are not reconstructed.

## Consent and measurement

Run `node .github/quality/affiliate-analytics-regressions.mjs` and `node .github/quality/site-readiness-regressions.mjs`. The existing measurement workflow runs these once, plus expired-affiliate checks; the redundant AdSense workflow was removed. The browser/print workflow now also runs calculator, SEO/consent and all-page mobile scans.

The global analytics opt-in is a simple operational choice, not a claim that every country requires it. Do not add geo-detection or paid CMP dependencies solely to improve GA4 coverage. A certified publisher CMP is a separate future advertising task. Changing `site-telemetry.js` requires updating its query version in **all 105 HTML files** because `/assets/*` is immutable for a year. Changing cache headers alone does not evict already cached URLs.

Site-authored events are gated and filtered, but GA4 Enhanced Measurement is account-controlled: disable browser-history page views, site search (the pace band uses `s` for seconds), form interactions, outbound clicks and automatic downloads until their parameters are audited. The connector presently cannot inspect or change these settings. Confirm actual receipt in GA4 and disclose automatic provider behavior before calling the entire setup path-only.

## Goal-page content and compatibility

Run `python3 .github/quality/goal-content-regressions.py`. Its 20-page inventory records the reviewed main-branch titles, descriptions, H1s, canonicals, input defaults and historical anchors. It checks every public HTML page's internal links, visible FAQ questions against schema, and worked arithmetic with rational inputs before final rounding. The explicitly reviewed exceptions are ten validation-only inline calculator changes and thirteen references to the existing goal-band adapter. Update a contract deliberately when a justified product change requires it; do not automatically regenerate it to silence a failure.

The browser suite now clicks all 20 calculators, checks their supported KM/mile outputs and checkpoints, edits each target, follows its goal-aware band parameters and rejects invalid/missing/fractional minutes, out-of-range hours and negative seconds. Five priority decisions also receive 320 px layout checks and screenshots. A display-only editorial test previously missed the 4:15 calculator being hidden by its locked distance selector; retain the interaction coverage.

No maintained goal-content generator was found. Do not regenerate numbered guides by replacing time strings in generic prose. Shared mathematics, controls and short tool instructions are legitimate; a new editorial section needs its own runner question, checked inputs/outputs and a clear next action. Consolidate duplicate checkpoint tables and coaching filler before adding text. See `goal-page-quality-audit-2026-10-08.md` for the complete inventory and resubmission gates.
