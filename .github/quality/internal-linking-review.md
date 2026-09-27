# Internal linking review — 22 September 2026

Branch: `improve-internal-linking`.
Baseline: `main` at `4b4bc52e595e5f8a865c213916cf265f46202145`, which includes merged PRs #1–4.
The implementation commit is the head of this branch. Work from that commit when resuming; do not reapply the changes below.

## Assessment

The existing link graph was largely sound. A source audit of all 101 HTML pages found no missing internal destinations, broken section anchors, redirected internal anchors or empty internal link labels. The 404 page is intentionally excluded from reachability requirements.

The useful opportunity was reader discovery:

- Seven of the 36 blog articles were missing from the blog index.
- The weight-loss/training article was reachable only through the HTML sitemap.
- The 4:15 guide had only the homepage and sitemap linking to it.
- The easy-running, disrupted-training and four race-specific guides depended heavily on the blog index.
- Printable goal presets and the Norwegian Singles FAQ had few routes in from relevant content.
- Several pages still displayed instructions to the site editor instead of a useful next step for readers.

## Implemented

- Make all 36 articles discoverable from the blog, organised by topic with nine working jump links. Remove the duplicate legacy navigation there, retain the shared masthead and all existing destination connections, and put the topic links before the featured story.
- Add contextual training links beside the planner's preview and within workout, long-run, fueling and personal-review content.
- Connect the 4:15 page from 4:00, 4:30 and goal-selection guidance; add reciprocal comparisons and missing nearby goal links elsewhere.
- Link eight printable presets from their corresponding goal guides. Link the generator's printing instructions to guidance on bands, splits and fueling.
- Link the prediction results area to the appropriate 5K, 10K and half-marathon explanations.
- Connect the conditions calculator and related advice to the four existing 2026 course guides.
- Connect the Norwegian Singles FAQ from the plan and workout pages.
- Replace editor-facing copy in the blog, goal-selection, disrupted-training and weight-loss pages with reader-facing links. Remove the weight-loss page's pre-existing FAQ structured data, which did not match its visible questions; retain its Article data.

The changes affect 28 public HTML files and add **62 distinct source-page → destination-page connections**. No existing source/destination connection is lost; repeated anchors to the same destination were simplified in a few places.

## Measured result

| Metric | Before | After |
| --- | ---: | ---: |
| HTML pages audited, including 404 | 101 | 101 |
| Internal anchors, including same-page links and repeated navigation | 4,418 | 4,483 |
| Distinct cross-page connections | 2,182 | 2,244 |
| Blog articles linked from the blog index | 29 / 36 | 36 / 36 |
| Normal pages unreachable without using the HTML sitemap | 1 | 0 |
| Maximum homepage link depth, excluding traversal through the sitemap | 3 | 3 |
| Missing destinations / fragments / redirected anchors / empty labels | 0 | 0 |

Unique referring pages **excluding the HTML sitemap**, not raw link counts:

| Destination | Before | After |
| --- | ---: | ---: |
| Weight loss while marathon training | 0 | 2 |
| 4:15 marathon pace | 1 | 4 |
| How to know if Zone 2 is working | 1 | 5 |
| How to salvage a marathon training plan | 1 | 5 |
| Norwegian Singles FAQ | 1 | 3 |
| Each of the four 2026 race-specific guides | 1 | 3 |
| Each of the eight goal pace-band presets | 1 | 2 |

Method: enumerate tracked public HTML files; parse anchor hrefs against each page URL; resolve same-origin paths, query strings, fragments and explicit redirects; compare destinations with tracked pages/files and target element IDs; deduplicate edges by source/destination; breadth-first traversal from `/`, both with and without traversing `/sitemap/`. Counts describe repository source, not Search Console index coverage or Googlebot activity.

## Validation

- Source audit of 4,483 internal anchors: no missing destinations, missing fragments, redirected anchors or empty anchor labels. All 36 articles linked from `/blog/`; all 100 normal pages reachable without the sitemap.
- Every changed page retains its canonical, robots directives, executable inline JavaScript and external script references. The only structured-data change is the explicitly removed mismatched FAQ block above; remaining JSON-LD parses successfully.
- Existing `browser-regressions.mjs`: all **12** checks passed, including input validation, calculations, race predictions, training-plan generation, CSV/calendar/PNG downloads and wrist/A4 printing.
- Existing `browser-scan.mjs`: all 101 pages at **1280 px and 390 px** (202 checks) passed with no script errors, missing local resources, missing shared branding or horizontal overflow.
- After final navigation placement refinements, five affected pages were checked again at both widths (10 checks). All nine blog topic links were clicked; blog-to-article and planner-to-disrupted-training navigation passed at both widths.
- Screenshots of the blog, planner guidance, prediction results and conditions links were visually inspected.
- `git diff --check` passed.

The browser was Chromium 153.0.8010.0. This execution environment required a single-process browser: a temporary copy of the scan retained contexts until browser shutdown and used the same repository root and assertions. Repository test scripts were not changed. Third-party requests were blocked, as in the existing test harness. Dependencies, screenshots, raw audit output and temporary scripts are outside the published repository.

## URLs, deployment and remaining checks

No page URLs, redirects, canonicals, robots rules, sitemap entries or search-indexability directives changed. No new public pages were created. Calculator code, ad integration and hosting configuration are unchanged.

This branch is for a pull request; production merge remains the owner's final step under the established project instructions. The repository is static HTML/CSS/JavaScript with no production build step and no in-repository Actions deployment workflow. Do not substitute local test results for confirmation of a Cloudflare production release.

Direct production HTTP validation from the execution environment returned HTTP 403. Public web retrieval returned some older cached content and could not retrieve the 4:15 page. This is a validation limitation, not proof that those live URLs are broken. Local runtime navigation and source validation passed.

After merging and confirming the Cloudflare deployment:

1. Check `/blog/`, its topic links, the 4:00 → 4:15 comparison, the planner's review links and conditions-to-course links on the live site.
2. Confirm the changed destinations return normally on the custom domain, particularly `/4-15-marathon-pace-km/`.
3. If desired, inspect the blog and previously sitemap-only article in Search Console. There are no new URLs to add to the sitemap solely for this change; follow actual recrawl/indexing results rather than assuming an instant ranking or audit-score improvement.

Rollback: revert the implementation commit. No URL migration or data migration is needed.
