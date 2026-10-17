# Navigation audit and implementation — 17 October 2026

Audited against `main` at `04695c3ac6636011d13654038bdf80cced18f9ef`. The working tree was clean and there were no open pull requests when work started. The previous pace-band consolidation and the completed Melbourne guides are retained.

## Verified findings

The repository contains **116 public HTML documents: 115 published pages and the 404 page**. This includes 39 blog articles, 20 goal-time guides and 18 Melbourne venue guides. `navigation-baseline.json` records every route, title, H1, canonical, description, robots directive and original crawl depth. The inventory comes from the HTML files and their links, not just the XML sitemap.

Live pages checked: homepage, `/blog/`, `/printable-pace-band/`, `/melbourne-running/` and `/sub-threshold-pace-calculator/`. The homepage was also inspected in the live browser. Local browser checks render the actual modified HTML, CSS and scripts, rather than a mockup.

* There were **four distinct header destination sets**: the homepage (one page); the common internal header (91); Melbourne templates (19); and a shorter internal header (five). The homepage used in-page Tools/Guides links while internal pages used Predictor/Training plan/Guides links.
* Desktop headers had no category dropdowns. Several calculators were absent from the global header, including fueling on the common desktop header, conditions adjustment, the dedicated pace calculator and sub-threshold pace calculation.
* Most mobile menus were the same six flat links. Only the 19 Melbourne pages included the Melbourne directory. That directory was already linked from the homepage, blog hub and HTML sitemap; it was **not an orphan**.
* Breadcrumb markup existed on 66 pages, in multiple `nav`, paragraph and `div` forms. Some remaining pages had breadcrumb schema without a visible trail. Many internal templates also retained redundant navigation strips hidden with CSS.
* The footer provided site information links but no tool, training or Melbourne entry points. The HTML sitemap already covered published pages; it did not need replacement.
* Navigation definitions were repeated in HTML and in three different authoring helpers. Those helpers could restore inconsistent menus after a future regeneration.
* The homepage FAQ incorrectly described the pace-band generator as marathon-only. The current generator supports marathon and half marathon; the pace charts themselves remain marathon-specific.
* **No broken internal destinations or fragments were found before editing. All 115 published pages were already reachable within two HTML links from home.** There is no evidence of a major crawl-depth problem or of navigation-caused ranking loss. The useful improvements concern consistency, intent and discoverability.

## Architecture implemented

Five top-level destinations remain manageable. Each category name is a normal link to its existing hub; the adjacent native disclosure control opens its submenu. No new category URL, thin hub or redirect is introduced.

| Header item | Direct destination | Submenu |
| --- | --- | --- |
| Pace chart | `/` | None; goal-time choices stay in the chart |
| Calculators | `/#start-here` | Pace calculator; marathon time predictor; fueling calculator; race conditions pace adjuster; sub-threshold pace calculator |
| Training | `/blog/#training` | Monthly training plan; marathon training resources; marathon pace workouts; Norwegian Singles; Melbourne tracks and paths |
| Guides | `/blog/` | All guides; marathon pacing strategy; goal-time guides (`/#pace-chart`); pace adjustments; Australian race guides; personal races and lessons |
| Pace band | `/printable-pace-band/` | Highlighted desktop CTA; highlighted entry in the mobile menu |

Mobile at widths up to 1000 px uses a compact brand/Menu header and the **same destinations** in three expandable categories. The pace-band link stays inside the mobile menu to leave room for the brand and a full-size Menu touch target at 320 px. Menus scroll within shorter viewports. This is ordinary website navigation, not an ARIA application menubar or a modal, so it does not trap focus or replace normal Tab navigation.

Melbourne running belongs with **Training: where to run a session**, rather than requiring a sixth global category. It remains accessible from the Guides hub and footer too. There is no measured usage evidence warranting its own top-level item. Individual marathon times remain on the existing chart and goal pages rather than filling every submenu.

The footer has three short groups: **Plan your run** (chart, calculator hub, pace band), **Explore** (training, guides, Melbourne) and **Site information** (the seven existing trust/legal/sitemap links). It supports broad discovery without repeating every submenu or article.

Breadcrumb examples:

* Home → Calculators → tool or pace band.
* Home → Pace chart → goal-time guide.
* Home → Guides → article.
* Home → Guides → Pace adjustments → condition guide.
* Home → Training → Norwegian Singles → related method guide.
* Home → Training → Melbourne running → venue.

The parent entries point to real existing pages or their populated sections. Visible labels and `BreadcrumbList` names/destinations are checked together. Exact current links use `aria-current="page"`; a separate section highlight indicates the relevant header category on child pages.

## Changes and priorities

| Problem | Implemented solution | Benefit | Priority |
| --- | --- | --- | --- |
| Four header variants and mobile omissions | One source generates the same category destinations into every page | Predictable journeys from any landing page | P1 |
| Repeated authoring definitions | `site_navigation.py` plus `sync-navigation.py`; existing generators reuse them | Future edits and new pages remain consistent | P1 |
| Dropdown interaction and keyboard access | Native `details`/`summary`, separate hub links, 44 px targets, visible focus, Escape/focus/outside-click dismissal | Mouse, touch and keyboard access; usable native fallback | P1 |
| Uneven breadcrumb visibility/schema | Shared static trails and matching schema on all applicable internal pages | Clear location and parent paths | P1 |
| Less visible calculators and guide categories | All five calculators in the existing homepage tool section; guide topic links moved above stories | Faster discovery without new hub pages | P2 |
| Site-information-only footer | Three compact purpose-based groups | Useful onward paths at the end of an article/tool | P2 |
| Inaccurate pace-band/conditions descriptions | Both pace-band distances stated; conditions link points directly to the calculator it describes | Labels match the destination's supported features | P2 |
| Difficult HTML sitemap scanning | Existing groups gain jump links and clearer pace-band wording | Easier manual browsing; full coverage retained | P2 |

## Implementation and maintenance

* Authoring source: `.github/quality/site_navigation.py` (groups, active sections, header, footer, breadcrumbs and schema), with `sync-navigation.py` as its CLI.
* Runtime: `assets/navigation.js`, **754 bytes gzipped**, only enhances dismissal/focus. `assets/navigation.css` is included in the existing committed `assets/site.css` bundle. The shared bundle grows by **614 bytes gzipped**; HTML grows by about **656 bytes gzipped per page on average**. These are local gzip comparisons, not measured network transfer sizes or Core Web Vitals.
* Updated shared authoring helpers: `sync-branding.py`, `apply-layout-polish.py`, `build-melbourne-running-pilot.py` and `build-shared-css.py`. Obsolete masthead/mobile rules and hidden navigation strips removed where safe.
* Generated headers/footers/breadcrumbs and cache-busted references updated in all 116 HTML files. Only homepage, guide-hub and HTML-sitemap body copy/links receive focused discoverability edits.
* All pre-existing calculator, print, goal-band adapter and telemetry script bodies are preserved. No production dependency, package manifest, Cloudflare Function, Worker or production build is added.
* The existing immutable cache policy requires the new shared CSS/navigation version in every page. Change `VERSION`, rebuild the bundle and sync the HTML when changing those assets.

## Validation completed locally

* Static inventory, identical destination sets across templates and desktop/mobile, duplicate IDs, skip targets, parent links, exact active states, HTML sitemap coverage, internal destinations/fragments and breadcrumb/schema parity: pass.
* All original titles, descriptions, H1s, canonicals and robots values: retained. Existing redirects, XML sitemap, headers and production routes: unchanged. Navigation generation and branding sync: idempotent.
* Published link depth: **53 pages one link from home, 61 two links, plus home**, compared with 48 and 66 before. No published orphans; only the deliberate 404 is outside the link graph.
* Full browser scan: **232 rendered checks**, all 116 pages at 1280 and 390 px; no missing local resources, script errors or horizontal overflow.
* Navigation suite: all dropdowns, mouse, Enter/Space/Tab, Escape with focus restoration, focus exit, outside click, one category open at a time, touch navigation and active sections, viewport switching and no-JavaScript menus: pass.
* Representative homepage, calculator, blog hub, personal article, goal guide, Melbourne hub and venue: checked at **320, 390, 760, 820, 1000, 1024, 1280 and 1440 px**. Targets, panel bounds and header height pass. Desktop and phone screenshots visually inspected.
* Scoped axe checks of the header, breadcrumbs and footer at 390 and 1280 px: no WCAG A/AA violations reported. This is not a manual VoiceOver/NVDA certification or a full-site accessibility claim.
* Existing calculator/goal interactions, validation, downloads, planner dates, personal-article schema, print/PNG behavior and layout suites: pass.
* Pace-band state/maths/share regressions, browser suite and **12 actual PDFs** (paper size, calibration, margins, fonts and copies): pass.
* Existing SEO/consent, Melbourne directory, affiliate/analytics, inactive-affiliate and site-readiness suites: pass.
* `git diff --check`, JavaScript syntax and changed Python module compilation: pass.

The repository QA workflow now includes the static navigation and browser/axe suites. GitHub CI and branch-preview status are reported on the pull request; they are separate from the local results above.

## SEO and release limits

The expected benefit is clearer context and easier access to useful tools and guides. Dropdowns and more internal links **do not guarantee rankings**. Existing depth was already shallow, and no analytics or ranking dataset was used to claim a particular menu item was most popular. The choice is based on visitor tasks and current content coverage.

Cloudflare's connected configuration was verified: the repository is `hara1zer/marathonpacekm`, production branch is `main`, the build command/output directory are empty, automatic Git deployment is enabled, and all branches receive previews. The implementation retains that static deployment arrangement. Production publication is a separate merge/release decision; preview deployment is not evidence that the custom domain has changed.

References for implementation patterns: [W3C disclosure navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) and [Cloudflare Pages GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/).
