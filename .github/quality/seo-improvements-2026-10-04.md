# SEO and mobile-render improvements — 4 October 2026

The five-hour page is an existing search opportunity. It now leads with precise KM/mile paces, checkpoints and a matching printable band. Its run/walk calculator includes standing still and a partial final interval, starting with running. Worked examples distinguish the overall average from required running pace. A new 3:25 page fills the missing goal-time route, with full static splits, exports, matching KM/mile bands and worked rounding/checkpoint examples.

The homepage, nearby goal pages and three relevant guides link to these tools. The 3:05 calculator hands off its current marathon target to the printable generator. Both sitemaps include 3:25. Existing ranking routes remain intact. Fifty-nine overlong search titles were shortened; article headings, social titles and original race data remain descriptive.

All pages use a committed shared CSS bundle and one deferred local telemetry loader. GA4 waits for page load and idle time; AdSense waits an additional 2.5 seconds. The existing account IDs and path-only analytics policy are preserved. A static AdSense account meta tag retains verification, as documented at https://support.google.com/adsense/answer/12169212. Embedded pace bands omit analytics and advertising. Four manually duplicated Cloudflare beacons were removed; production already injects its beacon. Legacy related-link HEAD requests were replaced by validated static links.

Homepage, 3:15, 3:30 and the new goal layouts render calculator controls immediately. A noscript stylesheet hides interactive controls while keeping complete reference splits available.

## Validation

- All 17 existing functional groups passed: calculators, exports, print/PNG tools, personal articles, phone menus and reading tables.
- All seven SEO regression groups passed: interval arithmetic and conservation, partial final walking, invalid inputs, 3:25 exports and handoffs, 3:05 handoff, static no-JavaScript output and telemetry timing/iframe exclusion.
- All 105 HTML pages passed desktop (1280px) and phone (390px) scans: 210 visits, no script errors, missing resources or horizontal overflow; one footer/menu and expected reading widths.
- All internal routes/fragments and sitemap entries resolved locally; canonicals were unique, schema JSON parsed, and all 69 JavaScript units compiled. No HTML page directly loads an external script.
- Representative desktop/phone layouts and the run/walk form/output were inspected visually. `git diff --check` passed.
- In a local 390px render probe holding the calculator script for 800ms and blocking third parties, homepage CLS fell from 0.1772 to 0. This isolates the hidden-form reveal; it is not a production PageSpeed or field result.

## Deployment follow-up

Merge the combined presentation/SEO pull request to publish through the existing Cloudflare Pages pipeline. Re-run mobile PageSpeed after deployment and check live ads, GA4, platform beacon injection and Search Console indexing. No measured production LCP improvement is claimed. The delay intentionally changes when advertising begins; these local tests mock third parties and cannot validate actual AdSense placement, consent or revenue.
