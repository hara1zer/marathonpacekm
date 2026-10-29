# Running Lab implementation notes

## Architecture and original-content audit

The production site is committed HTML, CSS and browser JavaScript. Directory
`index.html` files are routes; Cloudflare Pages serves them directly. There is no
application package manifest, production compilation step or standalone lint
command. Python helpers are authoring tools, and Node/Python QA scripts exercise
the committed output. Shared navigation, breadcrumbs and footers come from
`site_navigation.py`; the existing shared styles and consent loader remain in use.

The founding collection reuses four original articles rather than publishing
second versions under the Lab URL:

| Existing URL | Classification | Available evidence | Reading boundary |
| --- | --- | --- | --- |
| `/blog/sydney-marathon-2026-personal-review/` | Personal race analysis | Published weekly totals, selected watch laps, rehearsal-lap ranges and the author's recollections | Eight selected race kilometres; no km 26 or full race trace; no causal diagnosis |
| `/blog/run-melbourne-half-marathon-2025-vs-2026/` | Recorded race comparison | Transcribed activity summaries, full-kilometre paces, heart rate and larger-block arithmetic | Different GPS distance coverage and unmatched course positions; no missing distance reconstruction or inferred cause |
| `/blog/rebuilding-after-sydney-marathon/` | Training intentions | The author's proposed sequence and practical checks | A plan described as intentions, not evidence of completed training or outcomes |
| `/blog/marathon-fueling-experiments/` | Personal fueling experiment | Personally documented gel experiences and a transparent worked schedule | No controlled product ranking; the example is mathematical, not a measured intake log |

The general `/blog/` hub and educational prediction, pacing, long-run and fueling
guides keep their existing purposes. Running Lab adds a curated index and original
evidence navigation, not competing keyword versions of those articles. The Sydney
explorer stays inside its source article, avoiding a second race-review canonical.
Existing figures and public JSON data are reused; no private training export is
added.

The audit also found existing educational pages that cite or reuse these accounts:
`choose-marathon-goal-time`, `how-to-know-if-youre-overpacing`, `marathon-splits`,
`negative-split-pacing`, `when-to-adjust-marathon-pace-mid-race`,
`why-do-i-slow-down-after-30k`, `sydney-marathon-pacing-strategy-2026`,
`marathon-pacing-heart-rate-rpe-hr-drift`, `should-i-slow-down-if-heart-rate-is-high`,
`half-marathon-to-marathon-pace`, `race-time-predictor-marathon`,
`half-marathon-pacing-strategy`, `run-walk-marathon-pacing`,
`tempo-vs-threshold-vs-marathon-pace`,
`long-run-structure-fast-finish-vs-blocks-vs-progression`,
`longest-run-before-marathon`, `marathon-pace-readiness-test`,
`how-long-to-train-for-a-marathon`, `marathon-fueling-by-finish-time-gel-schedule`,
`carb-loading-calculator` and `hills-pacing-give-away-seconds-avoid-quad-destruction`
(all under `/blog/`). These remain guides with contextual firsthand examples,
not additional independent experiments. The four founding accounts remain the
source destinations, preventing duplicate study pages and competing narratives.

`running-lab-studies.json` is the collection registry. `build-running-lab.py`
renders the hub and marker-delimited metadata, related-study/tool lists and index
cards. Add a genuinely published article and its registry entry, then regenerate
the committed output. There is no runtime CMS, remote registry request or required
Cloudflare build dependency. Existing source articles keep their first-person
body text, publication dates, URLs, canonical identities and historical anchors.

## Data feature and limits

The Sydney selected-split explorer reads
`assets/original/sydney-2026-chart-data.json`. Its recorded kilometres are exactly
25, 27, 28, 29, 30, 31, 32 and 33. It provides native keyboard-selectable laps,
pace/heart-rate details, a hypothetical target pace and a per-lap comparison.
Dots are separate observations; the target is a separately labelled scenario.

Local sums include only consecutive available one-kilometre laps and restart
after a gap. For a 5:40/km target, kilometres 27–33 total 43:23 from the rounded
recorded paces versus 39:40 at target, a 3:43 local difference. This is neither
elapsed time from the start nor an official checkpoint or alternate finish.
Invalid targets clear scenario values while retaining the recorded observation.
If JavaScript or the data request fails, the original static figure, table and
download remain available.

## Validation commands

Run from the repository root with the development-only Playwright and axe-core
dependencies documented in `README.md`. In the prepared cloud environment:

```bash
source /workspace/marathonpacekm-qa-deps/venv/bin/activate
export PLAYWRIGHT_MODULE=/workspace/marathonpacekm-qa-deps/node_modules/playwright
export AXE_MODULE=/workspace/marathonpacekm-qa-deps/node_modules/axe-core
export CHROMIUM_PATH=/usr/bin/chromium
export PYTHONDONTWRITEBYTECODE=1
export QA_OUTPUT="$(mktemp -d /tmp/marathonpacekm-lab-qa.XXXXXX)"
python .github/quality/build-running-lab.py --check
node .github/quality/running-lab-explorer-regressions.mjs
node .github/quality/running-lab-browser.mjs
```

Run the existing navigation/content, calculator, SEO/consent, article and print
suites as listed in the workflows. Browser checks require the supported execution
permission for local sockets and Chromium. The new Lab suite checks delivered
HTML without JavaScript, original canonical/publication identities, registry and
card correspondence, internal destinations, both sitemaps, page-wide canonical
uniqueness, exact source arithmetic, invalid-state clearing, native keyboard
navigation, network/malformed-data fallbacks, responsive layouts at 320/390/1280
pixels and WCAG checks on the new hub and added article regions. Screenshots and
structured results are written outside the published checkout.

Passing local static/browser tests does not verify Cloudflare's deployed header
engine, native mobile print dialogs, actual analytics delivery or AdSense approval.
Cloud Node/system Chromium versions differ from the CI-pinned Node/bundled browser;
the existing CI workflows remain the separate check of that configuration.

Current-instance validation on 29 October 2026 passed:

- Registry generation `--check`, all existing static calculation, content,
  navigation, privacy, readiness and Melbourne regression commands.
- New original-data regressions and all seven Running Lab browser groups.
- Existing calculator (19), SEO/consent (7), navigation (5), handoff (6),
  practical-guide (7) and researched-guide (8) browser groups.
- Full scan: 248 page/viewport combinations, no reported issues.
- Pace-band browser and 32 PDF verifications; handoff and four PDF
  verifications; article suites also checked two practical and five researched PDFs.
- All 123 existing route titles, H1s and canonicals retained; original public
  source data unchanged. All public pages remain reachable within two links.

The unchanged original checkout reproduced three handoff-runner failures caused
by an undismissed consent banner and smooth-scroll click races. The test harness
now waits for page load, clicks the actual visible Decline button and requests the
supported reduced-motion preference. All original assertions remain in place;
the final combined run passed all six groups and four PDF checks.

## Next three original investigations

1. **Repeatable weeks and next-day recovery:** prospectively record weekly running,
   interruptions, intended versus actual long-run effort and next-day response.
   Publish completed observations separately from the present rebuild intentions.
2. **Fueling planned versus consumed:** log each planned and actual serving,
   carbohydrate amount, time, fluid and reported tolerance over repeated rehearsals.
   Change one practical variable at a time; retain failures and missing entries.
3. **A prediction registered before the next race:** record the chosen model,
   shorter-race input, training assumptions and target beforehand, then compare
   official elapsed performance with the separate watch record and documented
   conditions. Do not fill missing checkpoints or infer a cause from one race.
