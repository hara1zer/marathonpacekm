# Browser regressions

## Running Lab — 29 October 2026

The collection lists each account once. `assets/running-lab-hub.js` progressively
enhances those delivered HTML cards with accessible topic filters; without
JavaScript all four remain visible. Article metadata has one author/date line
and a registry-owned short orientation block.

`running_lab_analysis.py` generates source-derived analysis beside the original
accounts: all 41 available full Run Melbourne laps, and prediction assumptions
beside all 12 published Sydney training weeks. `running-lab-analysis.js` supplies
the optional replay and sensitivity controls. It never changes source data,
reconstructs a partial lap or official result, or applies an unvalidated training
score to the forecast. The embedded model rounds once to whole seconds; the
standalone predictor's deliberate 30-second rounding remains separate.

Run `node .github/quality/running-lab-analysis-regressions.mjs` for independently
checked source sums, prediction inversion, training-window selection and input
boundaries. `running-lab-browser.mjs` also exercises topic filters, all 41 laps,
invalid-state clearing, source-request failures, static fallbacks, one byline per
article, compact summaries, responsive layout and scoped WCAG checks.

`/running-lab/` is an editorial collection of four existing firsthand articles,
not a second set of article URLs. Their original canonical URLs, publication
dates, recorded data and first-person accounts remain authoritative. Rebuilding
is classified as intentions; fueling recollections are not a controlled product
comparison.

`.github/quality/running-lab-studies.json` is the published-study registry. It
supplies the hub, homepage/blog collection cards, article metadata and related
studies/tools, and Lab sitemap listings. Add a real article at its final URL,
then add its verified metadata, evidence boundaries and relationships here. Run:

```sh
python3 .github/quality/build-running-lab.py
python3 .github/quality/sync-navigation.py
python3 .github/quality/build-running-lab.py --check
```

Commit the generated static HTML and sitemap changes. `site_navigation.py`
reads the same registry for active navigation and breadcrumbs. No CMS, client
fetch for discovery, or Cloudflare build command is required. When intentionally
adding a public route, append its reviewed SEO contract to
`navigation-baseline.json`; preserve every pre-existing contract.

Sydney's embedded selected-split explorer loads the existing public
`assets/original/sydney-2026-chart-data.json`. It has eight recorded laps and no
kilometre 26. Target paces are hypothetical; local sums restart at a missing lap
and never represent elapsed time from the race start. The original chart/table
and source download work without the interactive enhancement. Changing its
JavaScript/CSS requires bumping the versioned references because assets are
immutable in production.

With the existing external Playwright/axe/Chromium environment, run:

```sh
node .github/quality/running-lab-explorer-regressions.mjs
node .github/quality/running-lab-browser.mjs
```

The first verifies source-table transcription and contiguous-block arithmetic.
The browser suite checks discovery, original identity, metadata, both sitemaps,
keyboard input, invalid-state clearing, failed data loads, no-JavaScript
fallbacks, responsive layout and scoped WCAG checks. The Pages QA workflow runs
both alongside the existing calculator, consent, print and navigation suites.
This static site has no package-manifest lint or production build command;
source generation checks and the existing regression suites are its validation.

## Practical guides — 25 October 2026

The five articles in `.github/quality/practical-guides/*.body.html` are individually
written sources. `python3 .github/quality/build-practical-guides.py` supplies the
common navigation, metadata and treadmill conversion table. Commit both the
source and generated public HTML. Keep these pages in the reading layout even
though three contain small optional forms. Their separate, versioned CSS and
JavaScript do not change existing calculators or the shared stylesheet bundle.

`node .github/quality/practical-guides-browser.mjs` checks all four speed/pace
units, invalid-state clearing, leap-year/DST date calculations, two/three-week
taper accounting in both units, correspondence with the existing run-walk
calculator, no-JavaScript fallbacks, four viewport widths, Article/Breadcrumb
identity, axe accessibility and actual chart/session PDFs. The Pages QA workflow
runs it with the existing suites. `QA_OUTPUT`, `PLAYWRIGHT_MODULE`,
`CHROMIUM_PATH`, `CHROMIUM_ARGS` and `AXE_MODULE` work as documented below.

`build-guide-social-cards.py` uses development-only Pillow and DejaVu Sans to
create the five committed social images. They are original typographic cards,
not field-test photographs. There is no production image-generation dependency.
The navigation baseline deliberately adds only these five new URL/metadata
contracts; every previous entry is retained unchanged.

Use `practical-guides/editorial-notes-2026-10-25.md` for sources, coverage and the
distinction between research, original arithmetic and illustrative schedules.

## Melbourne running pilot

The Melbourne section at `/melbourne-running/` contains 18 full venue guides and a region-filtered hub. Sources live in `melbourne-running/venues.json`, page metadata in `additional-pages.json`, and individually written bodies alongside them. Run `python3 .github/quality/build-melbourne-running-pilot.py` to rebuild the pages, then `python3 .github/quality/export-melbourne-drafts.py` for the Markdown copies. Keep venue-specific access, facilities and route details central; do not add generic training padding or restore unsupported facts. Source dates and historical qualifications remain visible.

Run `node .github/quality/melbourne-running-regressions.mjs` to check static card coverage, filter combinations, fragment navigation, metadata/schema correspondence and lap arithmetic. The existing all-page browser scan also covers these public pages in CI. Original-photo and first-hand-visit prompts live in HTML comments and the separate Markdown review copies; they must not become invented photos or personal claims. The pilot adds no ad-serving code or affiliate destination.

The site remains static HTML/CSS/JavaScript with no production build step.
These developer-only scripts need Node 20+ and Playwright installed in your local development environment. Install its Chromium browser (`npx playwright install chromium`), then run from the repository root:

```
node .github/quality/browser-regressions.mjs
node .github/quality/seo-regressions.mjs
node .github/quality/browser-scan.mjs
```

Optional environment variables: `PLAYWRIGHT_MODULE` (absolute module path), `CHROMIUM_PATH`, `CHROMIUM_ARGS` (JSON array), and `QA_OUTPUT` (outside the published directory; defaults to `/tmp/marathonpacekm-qa`). Do not publish dependencies or test output. The scripts start a local server, block third-party requests and emulate explicit redirects and the iframe-header exception. They do not test Cloudflare's deployed header engine or actual ad serving/consent.

The regression script checks normal/invalid calculator inputs, precise time totals, km/mile band segments, prediction scenarios, zero-mileage weeks, fueling schedules, CSV/PNG downloads and both print layouts. It also checks the personal articles' title/schema identity, discovery links, modified dates and worked gel example against the calculator. The scan visits every HTML page at 1280 and 390 px, recording script errors, missing resources and horizontal overflow; `--focused` includes the two new personal articles and selected priority pages. Nonzero exit means a failed check.

## Shared navigation and branding

The single navigation definition, header/footer renderers, active sections and breadcrumb hierarchy live in `site_navigation.py`. Edit `GROUPS` there, then run `python3 .github/quality/sync-navigation.py` and commit all regenerated HTML. The homepage, tools, articles, goal guides, Melbourne pages and 404 use the same destinations. Both desktop and mobile lists are generated from that one definition; links exist in delivered HTML with no client-side fetching or Cloudflare build step.

Menus use native `details` and `summary`, with separate directly accessible category links. `assets/navigation.js` adds Escape, outside-click, keyboard focus dismissal and viewport reset. The native menus and links still work without it. Mobile uses expandable category sections at widths up to 1000 px; the desktop pace-band CTA becomes a highlighted mobile-menu entry to keep the small header compact.

`assets/navigation.css` is the only navigation style source. It is included in the committed `site.css` bundle. Bump `VERSION` in `site_navigation.py` whenever changing shared CSS or navigation JavaScript, rebuild with `python3 .github/quality/build-shared-css.py`, then sync navigation to update **every** cache-busted reference. Assets are immutable for a year.

`sync-branding.py`, `apply-layout-polish.py` and the Melbourne page generator reuse these definitions. New pages receive the common header/footer, a skip link and visible breadcrumbs with matching `BreadcrumbList` schema. Do not paste another menu into a template. Calculator, telemetry and print scripts must remain independent of navigation.

Run `python3 .github/quality/navigation-regressions.py` (development-only `lxml`) for full page coverage, link/fragment checks, sitemap depth, identical desktop/mobile destinations, exact active states, schema parity and the retained metadata baseline. Run `node .github/quality/navigation-browser.mjs` with Playwright and `axe-core` for mouse, keyboard, touch, Escape/focus, no-JavaScript behavior, eight widths and scoped WCAG checks. `AXE_MODULE` can point to an external `axe-core` installation. The existing Pages QA workflow runs both alongside the existing calculator, print, consent and all-page checks.

See `navigation-audit-2026-10-17.md` for the decisions, limitations and verified findings, and `navigation-baseline.json` for the complete 116-route inventory (115 published pages plus 404). A metadata baseline must only change when a separately reviewed content/URL change justifies it.

## Shared page layout

`assets/layout.css` supplies narrower reading columns, the common footer surface and story cards. `navigation.css` owns the navigation and footer link layout. After syncing branding or adding a page, run `python3 .github/quality/apply-layout-polish.py` (requires Python's `lxml` package). It classifies pages as reading, index or tool layouts and preserves existing footer year IDs and scripts. Calculators keep their wide layout. Bump the stylesheet version in the helper and page references when changing this cached asset.

Only short, regular comparison tables on reading pages receive the `mpkm-summary-table` class and phone layouts with column labels. Detailed splits retain horizontal scrolling. The browser scan checks layout loading, one menu/footer per page, compact phone headers and reading-column widths. Regression checks cover keyboard menu operation, preserved table values, story discovery and calculator widths.

## Original article figures and checkpoint cards

Run `python3 .github/quality/build-content-assets.py` to regenerate the three Sydney figures, eight checkpoint cards and public chart-data JSON in `assets/original/`. The script uses only the Python standard library and data already published in the personal review. It does not reconstruct missing race kilometres or long-run laps. Checkpoint calculations retain full precision over 42.195 km before rounding displayed elapsed times.

Article tables and figures use `assets/content.css`. Wide tables have a phone-width swipe cue and keyboard focus; keep their captions, column headers and scroll region when editing. Neither the static checkpoint cards nor the printable pace-band tool includes a gel schedule: link the separate fueling calculator when both references are needed.

## Shared CSS bundle and SEO checks

Pages load the committed `assets/site.css` bundle. After editing `theme.css`, `content.css`, `layout.css`, `performance.css` or `navigation.css`, run `python3 .github/quality/build-shared-css.py` and commit the regenerated bundle. The source stylesheets remain the authoring files; Cloudflare needs no build dependency. Legacy pages may also load their existing `assets/style.css` base styles.

`seo-regressions.mjs` checks the five-hour run/walk calculator, partial final intervals, stopped-time arithmetic, invalid values, 3:25 KM/mile exports, matching pace-band links and static splits without JavaScript. It mocks the Google tag to test first-visit denial, saved choices, opt-in, consent-gated band/calculator events, withdrawal, a 320 px banner, hidden print controls and tag-free embedding. Advertising must never load. These checks do not measure deployed Core Web Vitals or real ad behavior.

Run `python3 .github/quality/build-half-marathon-assets.py` to regenerate the two Run Melbourne comparison figures from `assets/original/half-marathon-2025-2026-data.json`. Full recorded kilometre laps are compared descriptively; partial laps and missing GPS distance are not reconstructed.

## Consent and measurement

Run `node .github/quality/affiliate-analytics-regressions.mjs` and `node .github/quality/site-readiness-regressions.mjs`. The existing measurement workflow runs these once, plus expired-affiliate checks; the redundant AdSense workflow was removed. The browser/print workflow now also runs calculator, SEO/consent and all-page mobile scans.

The global analytics opt-in is a simple operational choice, not a claim that every country requires it. Do not add geo-detection or paid CMP dependencies solely to improve GA4 coverage. A certified publisher CMP is a separate future advertising task. Changing `site-telemetry.js` requires updating its query version in **every public HTML file** because `/assets/*` is immutable for a year. Changing cache headers alone does not evict already cached URLs.

Site-authored events are gated and filtered, but GA4 Enhanced Measurement is account-controlled: disable browser-history page views, site search (the pace band uses `s` for seconds), form interactions, outbound clicks and automatic downloads until their parameters are audited. The connector presently cannot inspect or change these settings. Confirm actual receipt in GA4 and disclose automatic provider behavior before calling the entire setup path-only.

## Goal-page content and compatibility

Run `python3 .github/quality/goal-content-regressions.py`. Its 20-page inventory records the reviewed main-branch titles, descriptions, H1s, canonicals, input defaults and historical anchors. It checks every public HTML page's internal links, visible FAQ questions against schema, and worked arithmetic with rational inputs before final rounding. The explicitly reviewed exceptions are ten validation-only inline calculator changes and thirteen references to the existing goal-band adapter. Update a contract deliberately when a justified product change requires it; do not automatically regenerate it to silence a failure.

The browser suite now clicks all 20 calculators, checks their supported KM/mile outputs and checkpoints, edits each target, follows its goal-aware band parameters and rejects invalid/missing/fractional minutes, out-of-range hours and negative seconds. Five priority decisions also receive 320 px layout checks and screenshots. A display-only editorial test previously missed the 4:15 calculator being hidden by its locked distance selector; retain the interaction coverage.

No maintained goal-content generator was found. Do not regenerate numbered guides by replacing time strings in generic prose. Shared mathematics, controls and short tool instructions are legitimate; a new editorial section needs its own runner question, checked inputs/outputs and a clear next action. Consolidate duplicate checkpoint tables and coaching filler before adding text. See `goal-page-quality-audit-2026-10-08.md` for the complete inventory and resubmission gates.

## Pace-band preset consolidation — October 2026

The eight `/pace-band/<goal>/` landing pages were retired in favour of explicit 301 redirects to `/printable-pace-band/` with the same target selected. Keep all slash/non-slash/index.html forms and the observed colon-form 3:15 alias. Do not recreate those landing pages when adding a guide or rebuilding assets. The SVG checkpoint cards remain under `assets/original/` and are linked from the eight matching goal guides. The main generator remains the canonical for its query-string configurations.

The existing readiness and browser regressions check these redirects and exact goals, including 3:59:59 for sub-four. The browser suite also checks that retained card links are visible on their goal pages. Run the existing suites documented above before release. See `site-content-audit-2026-10-16.md` for the sitewide screening, consolidation candidates and complete page inventory, Private Search Console evidence is retained separately; do not commit raw account exports. Earlier audit documents describe their historical commits and do not override this consolidation.

## Pace-band reading direction and print layout

The generator's `reading=along|across` parameter selects the wrist-band reading direction. `along` is the default for old links and unrecognised values. `across` rotates each checkpoint group and the goal header 90 degrees within the existing grid; keep the 38 mm strip width, 24 mm overlap, 8 pt checkpoint labels and 10 pt times. Preview and all three printed copies use the same markup. Share links, embeds and goal shortcuts retain the selected direction. The phone card and checkpoint sheet retain their own layouts.

Keep the print sheet in normal block flow, with 6 mm gaps and break avoidance on each complete band. A flex print container split the third copy across pages in mobile print previews. The selected A4 or Letter landscape paper, 100% scale and 50 mm calibration rule still apply.

The existing pace-band browser/PDF commands now cover 32 actual PDFs: both reading directions, marathon/half marathon, kilometres/miles, A4/Letter and 15/20 cm wrist sizes. They also check all four wrist sizes with long goals/names, exact four-hour checkpoints, static fallback, share-link restoration and unchanged phone-card output. PDF checks verify text rotation, fonts, single-page output and physical dimensions. Chromium automation does not reproduce the native iOS print dialog; retain a manual AirPrint preview check when changing pagination.


## AdSense quality implementation — 23 October 2026

PR #23 extends current main without rewriting merged history. Three overlapping guide URLs now redirect to the fuller articles; the navigation baseline deliberately removes only those three entries. All retained SEO metadata and all 20 goal-page calculator/control contracts remain protected.

Run `python3 .github/quality/content-consolidation-regressions.py` and `node .github/quality/handoff-quality-browser.mjs` in addition to the existing suites. The new browser suite checks exact targets, distance, units, strategies, layout, reading direction, invalid/stale state, reload, clipboard, real iframe loading, both conditions CTAs, actual PDF output, consolidated fragments and whole-page WCAG A/AA checks on the changed tools and guides. Test dependencies and screenshots stay outside the published directory. Run `python3 .github/quality/handoff-quality-pdf.py "$QA_OUTPUT"` after the new browser suite to verify its four additional PDFs. The CI workflow includes these checks.

`assets/pace-calculator.js` owns the standalone calculator's validated state and URL serialization. Band exports are explicitly disabled for 5 km and 10 km; their tables and quick-print remain available. Keep the generator and standalone strategy calculations in agreement; the browser suite compares both distances and all three strategy outputs. Bump the asset's query version when it changes after deployment.

See `adsense-quality-implementation-2026-10-23.md` and `adsense-page-inventory-2026-10-23.md` for evidence, coverage, remaining editorial work and resubmission gates. Earlier audit/checkpoint documents describe historical commits.
# Researched article series, October 2026

The five bodies under `researched-guides/` are built by
`python .github/quality/build-researched-guides.py`; social cards use
`python .github/quality/build-researched-social-cards.py`. Run
`node .github/quality/researched-guides-browser.mjs` with the same Playwright/axe
environment as the existing article suites. Research, overlap decisions,
source limitations and reproduction notes are recorded in
`researched-guides/editorial-notes-2026-10-25.md`.
