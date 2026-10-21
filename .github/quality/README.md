# Browser regressions

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
