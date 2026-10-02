# Personal running articles — 2 October 2026

Baseline: main commit `19364d1004b69ea00141b594a6307f75f6acb775`, including editorial PRs #9 and #10.

## Editorial scope

- Added two distinct firsthand pieces: the intended post-Sydney rebuild and the homemade/commercial gel experiments.
- Expanded the existing Sydney review with intentions versus outcomes and a separate interpretation section, rather than creating a competing Sydney recap.
- Linked the new material from the homepage, author page, guides, half-marathon comparison and fueling pages. Updated both sitemaps and the blog ItemList.
- Added author links, visible dates, Article/Breadcrumb metadata, table captions, phone swipe cues and keyboard-focusable scroll regions.

## Evidence and limits

- The supplied personal review is dated 5 September 2026. Its older training cut-off is not substituted for the later complete export: 1 June–23 August remains 60.7 km/week and 4.4 runs/week, with an 83.9 km peak.
- August trial and September race recollections support the descriptions of dry mouth, the difficult 9 August run, approximate symptoms and intended gel frequency. They are not controlled product tests.
- The five-day schedule and progression from routine to shorter races, a half and marathon-specific training remain intentions. No successful rebuild, completed benchmark, booked race date or medical clearance is invented.
- Exact commercial variants, the homemade recipe and complete Sydney intake remain unknown. No carb dose is assigned to Winners or PURE without an exact label.
- The four-hour example is hypothetical: 11 × 25 g = 275 g, averaging 68.75 g/h; missing one leaves 250 g, averaging 62.5 g/h. The live calculator produces the matching 11-gel schedule and rounded 68.8 g/h output.
- Halson's training-load review and Burke et al.'s distance-running nutrition review provide limited research context. Neither is presented as a diagnosis of this race or validation of the proposed personal plan.
- Preserved the existing watch-split qualifications, original charts, weekly table, deep links and calculator behaviour. Did not reintroduce elapsed-versus-race-time comparisons or publish the supplied PDF.

## Checks

- Static validation: 104 HTML pages; no broken local resources, missing fragments, duplicate IDs or invalid JSON-LD. All 102 baseline pages and their anchors preserved; no runtime script changes.
- Blog discovery: all 39 card titles and descriptions match their destination articles. The ItemList has 39 unique entries.
- Sitemap: 103 unique URLs, matching the 103 indexable pages; the 404 page remains excluded.
- Full browser scan: 208 desktop/phone renders at 1280 and 390 px; no page errors, missing local resources or page-level horizontal overflow.
- Focused final scan: 24 renders; no detected issues. Inspected both new articles' desktop/phone openings and table sections; phone tables intentionally scroll, with captions readable before swiping.
- Functional regressions: all 15 groups passed, including the new article identity/discovery checks and fueling example.
- `git diff --check` passed.

The scripts block third-party requests. These checks do not establish live ad-serving, consent behaviour or AdSense approval. The first-person drafts still need the author's final voice/fact review before merging; production is not changed by this branch.
