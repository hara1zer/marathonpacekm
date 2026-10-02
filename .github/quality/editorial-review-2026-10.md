# October 2026 editorial review

Prepared against upstream `42d0116b28bfc2797eb7b615fc933af842dfda99` after PR #8. This round covers the requested editorial sweep, original half-marathon comparison, integration into existing guides and stronger discovery. The physical tool demonstration / field-testing article remains deferred.

## Original material

- Added `/blog/run-melbourne-half-marathon-2025-vs-2026/`, using Davin's supplied activity screenshots and his account of struggling late in 2025 and finishing strongly in 2026.
- Published a transcription with 20 complete 2025 laps and 21 complete 2026 laps, a complete comparison table and two reproducible SVG charts.
- Five-kilometre averages were calculated from displayed complete lap paces. Partial laps, missing GPS distance and exact race-half times were not reconstructed.
- The 2025 first and fourth comparable blocks average 5:33.4/km and 6:24.2/km; the 2026 equivalents are 5:15.4/km and 5:08.6/km. The final five full 2026 laps average 5:03/km; the final two are 4:53 and 4:51.
- Did not infer causal changes in training, nutrition, equipment or weather, and did not publish unrelated third-party details from screenshot UI.
- Connected the story from the homepage, blog, author page, Sydney review and relevant pacing / prediction guides. The blog now shows original race accounts before its category list.

## Editorial corrections

- Replaced the unvalidated marathon-readiness score and late-slowdown risk score with evidence-review questions and explicit arithmetic scenarios.
- Removed mileage bands purporting to assign a finish-time prediction, weight-to-pace promises, universal low-energy-availability cutoffs and fixed return-to-training timetables.
- Reconciled even / negative split guidance. Worked examples account for the later pace needed to retain the requested finish time.
- Distinguished perceived effort, heart-rate trends, sensor uncertainty and symptoms. Removed universal heart-rate caps and guaranteed race-rescue adjustments.
- Corrected the impossible dew-point example; removed universal weather penalties from advice and clarified the separate heuristic conditions tool.
- Qualified large workout examples, corrected a broken-block progression, removed a generic double-session prescription and avoided treating workouts as injury clearance.
- Clarified VDOT equivalence versus this site's power-law calculators. Disclosed actual article-calculator exponents, weights and range construction.
- Corrected the 5K calculator's reversed displayed range. Predictor runtime edits otherwise concern output labels and explanations; formulae and input IDs are retained.
- Corrected tangent advice and removed unsupported product-testing implications while retaining affiliate disclosure.
- Removed leftover publishing instructions, stale summaries and duplicate legacy mastheads. Updated relevant headings, descriptions, dates, table-of-contents labels and visible FAQ markup. Removed references to nonexistent social-image assets and corrected missing publisher-logo references.
- Preserved all 101 existing HTML routes, canonical URLs, indexability, controls and anchors. Added one article, bringing the HTML total to 102. Updated both sitemaps.

## Sources and boundaries

The review used primary research and official guidance, including:

- Smyth (2018), *Fast starters and slow finishers*, and Smyth (2021), *How recreational marathon runners hit the wall*: observational pacing context, not individual causal guarantees.
- Blythe and Király (2016), *Prediction and Quantification of Individual Athletic Performance of Runners*: model context, not validation of this site's chosen exponents or weights.
- Coyle and González-Alonso (2001), cardiovascular drift; Halson (2014), monitoring training load; Hunter and Muniz-Pumares (2025), endurance-running durability.
- Burke and colleagues (2019), distance-running nutrition; Mountjoy and colleagues (2023), IOC REDs consensus.
- Healthdirect heatstroke and heart-palpitations guidance; Cleveland Clinic stress-fracture guidance.
- US National Weather Service dew-point definitions; Pugh (1971), wind resistance; Minetti and colleagues (2002), uphill/downhill running cost.
- Official V.O2 equivalent-performance explanation; GPS.gov positioning accuracy; World Athletics / AIMS course-measurement guidance.

These are educational articles and a recreational runner's account, not clinician-reviewed individual prescriptions. No article count, word count or change in this PR guarantees AdSense approval. Relevant publisher guidance: https://support.google.com/adsense/answer/10015918?hl=en .

## Validation

- 13 browser regression groups passed, covering calculators, article predictions, exports and print layouts.
- 102 HTML pages checked at 1280 px and 390 px (204 checks): no script errors, missing local browser resources, document overflow or missing branding/styles.
- Static local links and fragments, unique IDs, single article headings, JSON parsing, preserved controls, canonical URLs, robots settings and existing anchors checked.
- Race-table values and derived averages independently checked against the transcription. Chart generation is deterministic.
- Representative desktop/mobile screenshots reviewed, including the article, both figures, blog, predictor and navigation.
- `git diff --check` passed.

Browser tests block third-party requests. They do not validate live ad serving, account-side consent configuration, Cloudflare's production header engine or Google's approval decision. The existing training-planner layout has no `<main>` element; it is an unchanged baseline exception in the structural check. Merge and production deployment remain separate from this review-ready PR.
