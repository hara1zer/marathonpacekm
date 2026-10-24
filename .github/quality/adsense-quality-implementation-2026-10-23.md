# AdSense quality implementation — 23–24 October 2026

## Outcome and scope

PR #23 now implements functional and editorial improvements. It originally contained only a 25-line checkpoint, with no production changes or browser validation. This work extends its existing branch, without rewriting commits. It does not merge, deploy to production, activate ads or request an AdSense review.

Baseline main: `f963b1365f56e85aa928a9904598bcb0017c7397`. Original PR head: `c058f298601a769e039fb112b552248dde6599d8`. PRs #16–22 were all merged. Their retained work includes consent-gated measurement, goal-page examples and validation, all Melbourne venue guides, eight retired pace-band presets, shared navigation, half-marathon generation, reading directions and print pagination. Main had no subsequent commit at the start of this review.

The live HTTP crawl covered 115 published pages plus the expected 404. All 115 returned 200, and their main text matched the checkout. The [complete inventory](adsense-page-inventory-2026-10-23.md) records each page's purpose and decision. This includes structural/content screening of every page and deeper review of the 20 goal guides, overlapping articles, calculator methods and trust pages. It is not independent replication of every referenced study or an in-person venue survey.

## Ranked original findings

| Priority | Verified evidence | Resolution / user value |
|---|---|---|
| 1 | The standalone calculator's `buildPaceBandURL()` omitted distance, forced even pacing and generated links after invalid input. Its destination state was not read from the URL. A two-hour half marathon could become a two-hour full marathon. | One validated calculator state now drives checkpoints, URL restoration, sharing, iframe embedding and PDF/print handoff. Explicitly block unsupported short-race band exports. |
| 1 | Both conditions CTAs used bare `/marathon-pace-calculator/`, losing the computed target. | Carry the displayed central result, rounded once to the nearest second. Update both links when inputs change; remove them when inputs are invalid. Preserve applicable incoming band settings. |
| 2 | `/even-vs-negative-splits/` repeated the same four-hour half-split table and strong-finish example as the negative-split blog article. The wind and hill modules duplicated the corresponding blog articles' task and advice. | Merge three pairs into three stronger guides, add checked decision examples, keep relevant primary sources, update internal links and remove the retired sitemap entries. Nine direct 301s cover slash, non-slash and `index.html` forms. Retain content fragments on the destinations. |
| 2 | Eighteen goal guides repeated the same two resource paragraphs; fourteen repeated the same gel-count FAQ. Several checkpoint boxes contained repeated motivational instructions. | Retain all 20 URLs and their distinct worked decisions. Shorten shared resource introductions, remove the repeated gel FAQs from visible content and schema, and trim coaching slogans. Preserve exact defaults, all historical goal-page anchors, numerical examples and all runtime calculator scripts. |
| 2 | The after-30K page's old short answer asserted causes and a “most effective fix”, contradicting its later observation-based review. Hill guidance described downhill running as recovery without extra cost and made unwarranted late-performance claims. | Replace the causal summary with the review task. Rewrite the merged hill guide around route profiles, transitions, arithmetic and evidence limits. Remove the unsupported “#1 multiplier” ranking from the slowdown module. |
| 3 | The methods page described strategy formulas only with the full-marathon distance, although the generator supports halves. The conditions result cards failed automated contrast checks, and several visible labels were unassociated. | Generalise the formulas to race distance D, add checked half-marathon examples, describe the model as scenarios rather than a safety assessment, associate labels and repair result contrast. |
| 3 | Two of 168 external destinations returned 404: an ACSM worksheet in the retired hill module and a relocated Merri-bek agenda PDF in the Merri Creek guide. | The rewrite removes the obsolete worksheet. Replace the council URL in the live guide and its editable sources with the official relocated PDF (HTTP 200); retain the historical source date. |

These are verified defects and editorial weaknesses. Their contribution to Google's particular rejection is a hypothesis: Google did not identify specific URLs or disclose its assessment. A passing technical audit, a particular word count, fewer URLs, or “human-looking” prose cannot establish AdSense eligibility. No AI-detection score is used.

## Affected reader journeys and content

- `/marathon-pace-calculator/`: exact targets and selected distance survive reload; cumulative checkpoints support full/half marathons and 5 km/10 km; KM/mile and supported strategy outputs agree with the generator. The 5 km/10 km tools offer splits and clean quick-print output, with disabled band/share/embed/PDF actions rather than a marathon substitution. Settings expose the preserved units, strategy, paper, wrist size, layout and reading direction.
- `/race-conditions-pace-adjuster/`: both “Build checkpoint splits + pace band” links carry the actual central scenario. Input changes invalidate stale links; reload retains the chosen conditions. The default scenario's 4:01:59 is carried as 4:01:59, not rebuilt from rounded pace.
- `/printable-pace-band/`: keep the existing race/strategy/print engine; add print-layout state to share links. Existing reading-direction defaults are preserved.
- `/blog/negative-split-pacing/`: combine the comparison guide with the fuller explanation. A 2:02/1:58 four-hour example exposes both half paces and links to the corresponding generator configurations.
- `/blog/wind-pacing-headwind-tailwind/`: retain the relative-air-speed example and add a route worksheet and remaining-pace choice at 30 km.
- `/blog/hills-pacing-give-away-seconds-avoid-quad-destruction/`: one guide now distinguishes equal ascent from different gradients, gives practical transitions and compares a four-hour catch-up requirement with a revised target. Examples are hypothetical calculations, not invented experience.
- All 20 goal guides were reviewed. Eighteen receive concise editorial trimming; the 3:25 and five-hour pages retain their existing distinctive rounding/export and interactive run/walk work. No goal-page algorithm, input default or canonical is changed.
- `/methodology/`, `/editorial-policy/`, the after-30K and slowdown guides, discovery links and both sitemaps reflect the changes. All 18 Melbourne venue guides remain; only consolidated links and the repaired Merri Creek source change.

No new public landing pages are added. Published page count changes from 115 to 112. The detailed inventory explains why the remaining goal, prediction, Norwegian training, local and short trust pages are retained; they are not removed just because they share a template or are short.

## Validation

Local test environment: Node 24, Playwright, Chromium 153.0.8010.0, axe-core, Python/lxml and PyMuPDF. Browser dependencies and output are outside the published site. The standard browser download failed in this environment; an npm-distributed Chromium binary supplied a working browser. Tests use normal multi-process browser isolation, without disabling web security.

| Check | Result |
|---|---|
| `pace-band-regressions.mjs` | Passed calculation, validation, legacy/new state and distance restoration. |
| `pace-band-browser.mjs` + `pace-band-pdf.py` | Passed actual browser interactions and 32 PDFs: full/half, KM/mile, two directions, A4/Letter, 15/20 cm wrists; physical dimensions, text rotation, margins, fonts and complete copies verified. |
| `browser-regressions.mjs` | Passed 19 groups including all 20 goal calculators, invalid fields, conditions, planner, prediction, fuel schedules, exports, navigation and original-story contracts. |
| `seo-regressions.mjs` | Passed seven groups including run/walk arithmetic, exact exports, no-JavaScript references and real consent controls. |
| `goal-content-regressions.py` | Passed all 20 goal metadata/control/script/anchor contracts, rational-arithmetic examples and internal links. |
| `navigation-regressions.py` | Passed 113 HTML documents including 404; no broken internal links or published orphans. Every published page is within two links of home. |
| `navigation-browser.mjs` | Passed five groups: keyboard, touch, Escape/focus, viewport changes, no-JavaScript menus and scoped accessibility at 320–1440 px. |
| `browser-scan.mjs` | Passed 226 rendered views (113 documents at desktop and phone widths), no missing local resources, overflow or uncaught page errors. |
| Measurement/readiness/expired-affiliate/Melbourne suites | Passed default-off analytics, opt-in/decline/withdrawal, embedding, privacy-safe events, no advertising activation, 18 venue guides and filter/metadata contracts. |
| New `content-consolidation-regressions.py` | Passed direct redirects, historical fragments, exact sitemap coverage, visible FAQ/schema consistency and independent scenario arithmetic. |
| New `handoff-quality-browser.mjs` | Passed six groups: exact half targets and sub-four seconds, all strategies and both distances, clipboard, actual iframe rendering, reload, PDF/print, short-race/invalid-state protection, both conditions CTAs, direct redirects/fragments, phone layouts and whole-page WCAG A/AA scans of the five changed tools/guides. |

Rendered screenshots of the revised calculator, conditions results, guides and existing band outputs were inspected. This caught a crowded result-label layout, which was corrected. The handoff suite also creates two half-marathon PDFs and 5 km/10 km quick-print PDFs. `handoff-quality-pdf.py` verifies their actual text, distance, exact targets and single-page output. CI includes the new suites and uploads browser evidence with the existing artifact job.

Limits:

- Local servers emulate explicit Cloudflare redirects and iframe headers; production edge behavior for these new changes must be checked after an approved merge. No production deployment is performed here.
- Live content and HTTP status were checked directly; direct Chromium navigation to production returned `ERR_EMPTY_RESPONSE` in this environment. Actual rendered tests used the checked-out site and real Chromium. No production Lighthouse/Core Web Vitals or native Safari/AirPrint result is claimed.
- External-link checking is a reachability screen: 96 returned 200, 40 returned 203, four returned 202, two returned 404, and 26 were blocked, errored or timed out. A 202/203 or bot challenge is not confirmation of source content; a 403/timeout is not proof of a dead link. Selected primary sources used in the edited guides were separately checked. Not every study or current venue rule was independently reverified.
- Local consent tests mock Google delivery. GA4 Enhanced Measurement settings, actual event receipt and the AdSense account's review/CMP settings were not inspected. Source code has no active AdSense serving script; the analytics opt-in is not a certified publisher CMP.
- Automated accessibility tests and keyboard checks do not replace a full screen-reader audit. No physical print-and-wear or venue visit is claimed.

## Remaining work, ranked

| Impact | Effort | Next action |
|---|---|---|
| High | Owner: one short field session; implementation: medium | Document a genuine pace-band print/use test: printer/browser, measured scale, wrist fit, legibility, sweat/tape experience and original photos. Add real observations to the existing tool guide, not another thin landing page. |
| High | Medium | Review demanding examples in the long-run and marathon-pace-workout guides, and the planner's heuristic schedules, for suitability and source support. Obtain qualified review where stronger training claims are intended. Do not invent reviewer credentials. |
| Medium–high | Medium | Reassess remaining overlap in late-race review/measurement and the Norwegian overview/FAQ/context cluster. Use actual reader tasks and current Search Console evidence before another URL consolidation. No new ranking/traffic claim is made in this audit. |
| Medium | Owner: small; implementation: small | Supply a public private-contact method if desired. The existing GitHub-only contact process is real, but requires an account and is unsuitable for sending personal details. Do not invent an email address. |
| Medium | Ongoing | Recheck venue access and future event editions with operators; add genuine visit notes/photos where available. Keep historical evidence dates and archive labels accurate. |
| Required before ads | Account configuration | Inspect GA4 automatic-event settings and actual data receipt. Before personalized ads in the EEA/UK/Switzerland, configure a Google-certified TCF CMP and update disclosures. Current analytics controls do not satisfy that separate advertising setup. |

## Resubmission checklist

1. Review this PR, its final diff and required CI results. Merge/deploy only with owner approval.
2. On the deployed site, check all nine new redirect forms, final canonicals, the 112-URL sitemap and representative calculator-to-band flows, including exact half-marathon seconds.
3. Perform an iPhone/Safari and native print preview check. Confirm no band is split across sheets and measure the 50 mm scale on a real print.
4. Add the genuine field-test evidence when supplied; resolve any material remaining editorial/source problems. Keep original personal data and clear limits visible.
5. Confirm robots/crawl access, the updated sitemap and relevant URL inspection status. This is verification of deployed changes, not a prescribed waiting period or an instruction to index every query configuration.
6. Verify the AdSense account's outstanding issues and consent requirements. Confirm privacy/contact disclosures match the implemented services. Do not activate ads using only the analytics banner.
7. Request another review only after owner approval, describing the substantive changes if the account provides space. There is no guaranteed approval percentage, page count or delay that ensures acceptance.

The site is materially better prepared: readers can complete the intended planning journeys, three redundant guides are consolidated, and specific contradictory/unsupported content is corrected. The remaining originality opportunity is genuine field evidence; more generic text and cosmetic SEO would not address that gap.

## Primary references checked

- Google: [make pages ready for AdSense](https://support.google.com/adsense/answer/7299563?hl=en), [Publisher Policies](https://support.google.com/adsense/answer/10502938?hl=en), [certified CMP requirements](https://support.google.com/adsense/answer/13554116?hl=en).
- [Minetti et al. (2002): energy cost across slopes](https://pubmed.ncbi.nlm.nih.gov/12183501/).
- [Bontemps et al. (2020): downhill running review](https://pubmed.ncbi.nlm.nih.gov/33037592/), linked full text retained in the article.
- [Pugh (1971): wind resistance](https://pmc.ncbi.nlm.nih.gov/articles/PMC1331759/).
- [Smyth (2018): fast starters and slow finishers](https://journals.sagepub.com/doi/10.3233/JSA-170205), [Smyth (2021): late-race collapse](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0251513).
- [Merri-bek official agenda directory](https://www.merri-bek.vic.gov.au/my-council/council-and-committee-meetings/council-meetings/council-meeting-minutes/) provides the relocated 8 February 2023 agenda used by the Merri Creek guide.
