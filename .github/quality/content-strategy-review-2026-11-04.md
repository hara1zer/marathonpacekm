# November content strategy: implementation and review

This change implements the recommendations in
[`content-strategy-2026-11-04.md`](content-strategy-2026-11-04.md), a copy of
MarathonPaceKM_Blog_Strategy_2026-11-04.md supplied in the conversation. The user
requested all drafts and related improvements in one pull request for approval;
the proposed fortnightly publication sequence is therefore a review plan rather
than a reason to leave drafts unfinished.

## Check back against the ten recommendations

| Recommendation | Result in this change | Boundary |
| --- | --- | --- |
| Embed the run-walk calculator | The existing shared component is available directly in the existing guide, with target-time inputs and static examples. | Full marathon distance remains 42.195 km; the five-hour page retains its controls and defaults. |
| Full half-marathon chart | `/half-marathon-pace-chart/` has 28 static rows, custom finish/pace inputs, both units, 5 km checkpoints, printing and an exact-distance band handoff. | The existing strategy guide retains its five-row illustration and execution advice. |
| Track pace chart | `/blog/400m-pace-chart/` converts both pace units and 400 m lap times, includes 200–1,600 m times, a printable chart and whole-session accounting. | Conversion is separate from workout prescription and race prediction. |
| Direct km/mile conversion | The existing mile-chart URL has a direct converter, static conversion table and worked method. | Existing finish-time controls and canonical URL remain available. |
| Surface the treadmill page | Calculator navigation, the homepage and the reorganised guide collection expose the existing converter. Reciprocal links distinguish treadmill speed, pace units and track distance. | The recently published article is retained rather than duplicated. |
| Half-marathon taper | `/blog/half-marathon-taper/` includes an editable final-six-day budget with chosen day shares, mile/km units and separate race-day distances. | The default percentages/day weights are labelled illustrations; no optimal individual taper or successful personal trial is claimed. |
| Answer gel-count intent | The existing full schedule guide now starts with packet-count arithmetic, drink contributions and the difference between carried and consumed fuel. Its title and description reflect that task. | The six complete schedules remain; no second gel-count article is created. |
| Promote carb loading | The existing worksheet is in calculator navigation and the main reference collection, with links from race-week planning. | Its daily target stays distinct from hourly race fuel. |
| Easy-run pace | `/blog/easy-run-pace/` addresses today's effort decision, with examples, conversation/heart-rate context and a printable record. | The existing Zone 2 page retains its separate longer-term progress task. |
| Pace-band field evidence | The existing usage guide now includes print scaling, calibration, sizing, fastening and a downloadable blank rehearsal record. An internal test protocol is included below. | An actual outdoor test and photographs require real observations. No results or product durability claims have been invented. |

The drafts link to original Running Lab accounts where relevant. The four Lab
articles, study registry, published race transcriptions and calculation datasets
retain their identities and evidence boundaries.

## Additional consolidation and existing-page review

| Retired page | Retained destination | Useful material preserved |
| --- | --- | --- |
| `/adjust-marathon-pace/fatigue-drift/` | `/blog/why-marathon-pace-feels-harder-some-days/` | Recovery/load observations, decision context and every historical section ID. The contradictory fixed three-session FAQ rule is removed. |
| `/adjust-marathon-pace/late-race-slowdown/` | `/blog/why-do-i-slow-down-after-30k/` | Checked 10/20/30-second slowdown examples over the final 12.195 km, source interpretation and every historical section ID. |

Each retired route has slash, non-slash and `index.html` direct 301s. Internal
links and both sitemaps point to the retained destinations. Existing October
consolidations remain in place. No redirect chain is introduced.

Reciprocal links were added to the half-marathon strategy, full-marathon taper,
Yasso workout, carb-loading worksheet, Zone 2 progress, long-run structure,
monthly planner, predictor, split explanations, half-to-full conversion, workout comparison, Melbourne directory and two track venue guides.
Generator-owned venue edits also live in the venue authoring sources. The guide
hub has one purposeful collection of charts/converters rather than repeating
the same listings in the two earlier article batches.

The Melbourne Marathon 2026 guide now explicitly identifies its passed edition
as an archive. Its URL, course/station data and worked calculations are retained;
future editions are directed to the organiser's current information.

All 20 goal-page canonical, title, default-value and control contracts were
checked. No faulty canonical/default was found that explained the vendor's
unexpected query-to-URL readings. Those readings do not justify redirecting
useful goal pages or inventing evidence of keyword cannibalisation.

Five existing metadata contracts were deliberately updated:

- Run-walk guide: calculator intent now matches an embedded tool.
- Mile chart: direct pace conversion is now available.
- Fueling guide: explicit gel-count answer with complete schedules retained.
- Pace-band guide: description reflects usable printing and rehearsal help.
- Melbourne 2026: edition-specific archive framing.

All other pre-existing navigation SEO contracts are preserved. The baseline
removes only the two retired routes and adds the four new routes. Goal-script
contracts allow only the updated shared telemetry asset reference and the
five-hour page's updated shared run-walk reference; calculator controls and
inline algorithms remain protected.

## Calculation and evidence review

- The static half-marathon and track tables are built with rational inputs and
  checked independently row by row. The browser tools retain precision until
  display. 1,600 m is kept distinct from 1,609.344 m.
- The taper worksheet allocates tenths by largest remainder so displayed days
  sum to the displayed budget. The race and race-day warm-up/cool-down remain
  separate. It does not infer a safe training load.
- New research context was checked against Persinger et al. (2004), Reed and
  Pipe (2014), Wang et al. (2023), Halson (2014), Smyth (2021) and World Athletics'
  technical-document index. Sources and population/method limits are visible.
- No new personal training dataset, clinical review, measured threshold or
  completed physical trial is asserted.

## Measurement

Explicit successful form submissions reuse the existing filtered `calculate`
event; reference printing adds one allowlisted `print_reference` action. The
same consent gate applies to both. Page-authored events pass no target times,
food entries, symptoms, names or other form values. No advertising or new
third-party service is enabled. Versioned script references are updated in all
public HTML and the active generators for immutable-cache compatibility.

Ubersuggest's cached volumes/positions are opportunity signals. Actual ranking
and click changes can only be evaluated after approval, merge and indexing.
Search Console query/page matching and existing analytics receipt remain
production follow-up work; this PR does not claim a ranking uplift.

## Verification

The local source checks cover:

- Four new route/Article contracts and correct image/asset references.
- All 28 half-chart rows, 21 track rows, conversion precision and valid/invalid
  arithmetic boundaries.
- All 20 goal-page SEO, input/default, historical-anchor and script contracts.
- 125 published routes, zero broken internal links/orphans, and at most two
  links from the homepage.
- The two new and three existing consolidation pairs, direct redirects,
  retained fragments, FAQ visibility and matching sitemaps.
- The unchanged Running Lab records, independent sums and prediction limits.
- Default-off analytics, consent, withdrawal, embedding, filtered path-only
  events, publisher metadata and inactive-affiliate checks.

Cloud-browser checks exercised custom half splits and invalid clearing,
backwards track conversion, mile/km taper totals and zero-share rejection, and
confirmed the embedded run-walk component loaded with the checked default.
The cloud-browser connection then failed; the remaining integrations and print
outputs are covered by the PR workflow rather than claimed as local browser
passes.
The PR workflow adds integration checks for all new controls, phone/tablet
widths, scoped accessibility, JavaScript-free content, consent and four actual
reference PDFs. Its reports and screenshots are retained as workflow artifacts,
outside the public website.

## Physical pace-band test protocol ready for a real rehearsal

1. Generate a supported target, print the chosen A4/Letter layout at 100%, and
   record the actual 50 mm calibration measurement.
2. Record printer, paper, cover, fastening and wrist setting; photograph the
   uncut sheet and the fitted band.
3. During an appropriate normal run, note readability and fit. Record actual
   conditions and exposure rather than inventing a wet-weather comparison.
4. Afterwards, photograph and record movement, damage, ink and fastening.
   Keep unknown observations unknown.
5. Add a dated first-person account only when those observations exist. A
   single trial supports observations about that setup, not a universal claim.
