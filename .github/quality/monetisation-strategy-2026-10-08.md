# MarathonPaceKM: independent business and PR #16 audit

Assessment date: 8 October 2026. Founder capacity: 10 hours/week. USD throughout. This is a bounded business experiment, not a prediction of income or approval.

## Decision

Continue for a measured 90-day experiment. The site has real search demand and a useful printable/phone tool, but has not demonstrated paid demand or a defensible audience. The best primary monetisation hypothesis is **a one-time race-day planning pack**, sold alongside the free calculators and free existing exports. Validate demand before building checkout or a large new tool. Complement with selected nutrition affiliates after engagement supports an application; consider restrained display advertising later. Do not make AdSense approval the development objective.

A pack must solve an additional problem: coordinating A/B/C finish targets, realistic aid-station stops, a rehearsed nutrition schedule and a race-week checklist in one practical output. A prettier version of the currently free band is insufficient. Avoid personalised medical advice, guaranteed predictions, accounts and subscriptions. Start with a manually prepared prototype and runner feedback; only automate repeatedly requested parts. No payment system, commercial tracking, paid product, affiliate application or ads activation is implemented by this PR.

**PR #16 verdict: revise substantially and simplify.** Keep the shared analytics choice and removal of automatic ads as a useful independent operational correction. Retain the two arithmetically sound worked examples, improve the 3:30 tool handoff, and stop presenting longer content as evidence of AdSense readiness. Remove dormant Amazon event code and the duplicate CI workflow. Preserve ranking URLs, titles, canonicals and calculation algorithms.

## Evidence inspected and access boundaries

At inspection, main was `ad13b0be6a234c4f8e74e6575669b3dde0c1cafa`; PR #16 was open, unmerged, head `b864cc2b318509d88e1e6c0b376de2ec67c32d75`. The initial complete diff comprised 111 files and one commit; discussion/review retrieval returned no comments. Initial GitHub browser, consent/readiness and Cloudflare checks were successful. Repository source, test suites, workflows, `_headers`, `_redirects`, robots and sitemap were inspected. No repository AGENTS.md was found. Revision commits are attached to this same PR, with no force push, merge or production release.

| Surface | Directly verified | Boundary |
| --- | --- | --- |
| Production | Homepage calculator, 3:30 handoff and band splits; default 4h; Google scripts and separate Cloudflare beacon present | Production still runs the old automatic loader until an authorised release |
| Initial PR preview | Consent choice, half-marathon 2h/miles, Letter selection, production canonical | A preview does not prove production has changed |
| Revised source/local Chromium | Consent scenarios, calculator accuracy, all-page scan, actual PDF and phone output | Google tag mocked for telemetry assertions; no proof of GA ingestion |
| Search Console | Connected verified domain property; current page/query/country/device data | Clicks are not sessions, conversions, users or revenue |
| GA4 | Connector reports missing Analytics OAuth scope; no linked property returned | Sessions, engagement, repeat use, revenue, consent rate, Enhanced Measurement settings and DebugView unavailable |
| AdSense/Amazon | Publisher meta and ads.txt in code; no expired Amazon links | AdSense dashboard, selected verification method, rejection detail and historic retailer order reports not accessible; closure/rejection history is founder-provided |
| Performance | Chromium scan and functional browser checks | CrUX connector not configured; no field CWV result or measured ranking benefit |

Cloudflare Pages performs a static branch preview through the repository integration. There is no new production build dependency. Production's independently injected Cloudflare Web Analytics is outside the GA4 preference; its settings need a separate review. The revised notice does not promise that Decline disables every hosting measurement.

## Demand and product assessment

Latest settled GSC window: **8 September–5 October 2026**, 447 clicks, 86,802 impressions, 0.515% CTR, average position 7.65. Previous comparable window: 285 clicks, 72,055 impressions, position 10.66. Clicks increased 56.8%, impressions 20.5%; this is a short comparison, not a growth forecast. Mobile supplies 300/447 clicks (67%). US/UK/Canada/Australia supply 246/447 (55%); that geography cannot be assumed for all sessions.

| Landing page | Clicks | Impressions | Implication |
| --- | ---: | ---: | --- |
| Printable pace band | 78 | 1,132 | Strongest demonstrated tool/search fit; 6.89% CTR |
| Half-marathon to marathon guide | 40 | 2,803 | Useful route into predictor and race planning |
| Homepage | 38 | 9,564 | Broad quick-answer calculator intent |
| 3:50 goal | 36 | 6,985 | Preserve successful URL and tool journey |
| Sub-4 goal | 26 | 3,961 | Preserve; improve relevant handoffs selectively |
| 3:30 goal | 21 | 10,389 | Lots of exposure, little click-through |
| 4:30 goal | 9 | 7,350 | Same opportunity and quick-answer limitation |
| Marathon predictor | 12 | 1,077 | Existing product opportunity before new topic clusters |
| Fuel calculator | 5 | 268 | Commercially relevant but currently tiny acquisition |
| Finish-time fueling guide | 1 | 368 | Affiliate readiness is unproven |
| GPS-watch mistakes guide | 1 | 46 | Not a proven watch-shopping audience |

Page-filtered query data included 358 rows. On the 3:30 page, “3:30 marathon pace” had 2,055 impressions, zero clicks, average position 8.56. The analogous 4:30 query had 645 impressions, zero clicks, position 8.24. Query totals omit anonymised queries and need not equal page totals. Low CTR can reflect position, competitors and a numeric answer available without clicking; an AI-overview cause was not verified. Do not forecast proportional traffic gains from title changes or from total impressions.

Strengths: immediate browser-side calculation; both metric and imperial outputs; marathon and half-marathon bands; calibrated wrist printing with A4/Letter options; checkpoint and phone-card outputs; preserved query links; no account required. First-person race/training accounts and transparent methods add evidence beyond arithmetic. Personal experience should be labelled as such, with limits and primary research for broad training claims.

Weaknesses: standard pace arithmetic is a commodity; much goal-page advice is templated; search sessions often end after a single answer; repeat demand is seasonal and race-specific. Many broad training clusters dilute a solo founder's focus. Existing historical sharing is useful but does not establish repeat-user retention. Avoid a costly course database, coaching service or newsletter treadmill without demand.

Compared with [Omni's marathon calculator](https://www.omnicalculator.com/sports/marathon-pace), MarathonPaceKM's strongest proposition is the direct transition from a goal to a practical wearable/phone race aid. This is a workflow advantage, not unique mathematical IP. [FindMyMarathon](https://www.findmymarathon.com/paceband.php) already offers course-specific bands, live phone tools and race information; [PaceBand.org](https://www.paceband.org/en) is a competing free generator. Course awareness and physical bands are not empty markets. FindMyMarathon's advertised physical-band prices around $10–14 are evidence that a competing physical product is priced, not proof that runners will pay $12 for a generic PDF.

## Independent template audit and SEO decision

On main, extracted `<main>` paragraphs with lxml, collapsed whitespace, retained paragraphs of at least 100 characters, lowercased, replaced numeric tokens (including times/decimals) with `#`, removed punctuation, and counted a paragraph as shared when its exact normalised text appeared on any other numbered goal page. All 19 numbered goal pages were included. This measures template reuse, not plagiarism, Google's internal judgement or an AdSense rejection probability; numeric mathematical overlap is often legitimate. Short headings, tables and interactive value are excluded.

| Goal | Long paragraphs | Shared | Share |
| --- | ---: | ---: | ---: |
| 3:00 | 14 | 10 | 71% |
| 3:05 | 21 | 18 | 86% |
| 3:10 | 20 | 19 | 95% |
| 3:15 | 26 | 21 | 81% |
| 3:25 | 20 | 10 | 50% |
| 3:30 | 24 | 19 | 79% |
| 3:45 | 16 | 10 | 63% |
| 3:50 | 19 | 15 | 79% |
| 3:55 | 31 | 24 | 77% |
| 4:00 | 35 | 23 | 66% |
| 4:05 | 19 | 18 | 95% |
| 4:15 | 13 | 6 | 46% |
| 4:30 | 27 | 19 | 70% |
| 4:35 | 20 | 19 | 95% |
| 4:40 | 20 | 19 | 95% |
| 4:50 | 20 | 18 | 90% |
| 4:55 | 19 | 18 | 95% |
| 5:00 | 25 | 10 | 40% |
| 5:05 | 20 | 18 | 90% |

Median normalised reuse is 79.2%, range 40–95%. The earlier five-page assistant report is superseded. Do not delete/noindex/consolidate ranking goal URLs from this metric alone. Keep useful target splits; shorten generic repeated advice gradually, replace it with an actual goal-specific decision and link to one authoritative shared guide. Prioritise 3:30, 4:30, 3:50 and sub-4 using their real traffic. Add a practical prefilled tool handoff rather than paragraphs for length. No new goal-time pages now.

The two initial PR examples are accurate and help interpret a race decision: making back 90 seconds after 30km for 3:30 requires about 4:51.3/km; slower walking in a 4:30 9:1 plan loses roughly 450m over 27 walking minutes. They are illustrative calculations, not runner case studies or an assurance of a safe strategy. The revision labels them accordingly and routes 3:30 readers to mid-race adjustment guidance and their prefilled band, instead of suggesting the pre-race prediction tool mid-race.

Sitemap has 104 unique production URLs with matching canonical files; all 105 HTML files remain served, including 404. Existing canonicals and important titles are retained. Initial PR's two colon-alias 301s match Search Console observations and canonical hyphen URLs. No broad redirect campaign is justified. Mobile horizontal-overflow and JavaScript scans passed locally; accessibility checks include label/error and preference focus/target sizing, not a full assistive-technology certification. No real-world performance score is asserted.

## Monetisation comparison

No sessions or conversion benchmark has been measured for this site. Revenue ranges below are **planning assumptions**, not network promises, industry averages or expected current income. They deliberately use all site sessions as the denominator, including non-commercial or unmonetised sessions. Founder labour, fixed expenses and income taxes are additional deductions.

| Model | Fit and economics | Work / dependencies | Decision |
| --- | --- | --- | --- |
| One-time $12 planning pack | Stronger intent fit than shopping; at $10 net contribution and 0.1%/0.3%/0.7% sitewide purchase conversion: $10/$30/$70 per 1,000 sessions | 6–8h validation; 12–20h small prototype after demand; 1–2h/month support initially; payment/provider, refunds and sales-tax handling | Primary experiment; paid value must exceed free exports |
| AdSense | Low effort per sale but needs scale; assume $3/$6/$12 all-session RPM under restrained placement | 4–8h setup after approval/consent; 1h/month monitoring; Google eligibility and ad market; CMP review | Complement later, not current priority; exclude controls/print views |
| Journey/premium display | Potentially useful ad management; no verified quote or site-specific RPM | Eligibility, Google standing, GA traffic evidence, reader-experience trade-offs; review contract and fees | Compare only when eligible and economics justify it |
| Nutrition affiliates | Best contextual fit around a gel schedule; future $0.20/$1.80/$14 per 1,000 sessions in explicit scenarios below | 4–8h partner/page setup, 1–2h/month stock/link/disclosure checks; terms/shipping/cookie attribution | First affiliate category, after intent evidence and approval |
| Watch/shoe/accessory affiliates | Higher baskets but weak current purchasing intent; same click × conversion × commission formula, no justified site-specific rate | Hands-on evidence and retailer/region upkeep; broad reviews very competitive | Defer shoe/watch comparison publishing; mention gear only when useful |
| Sponsorship/direct ads | Could monetise a specialised race-planning audience; no credible CPM quote obtained | 4–8h per sales cycle plus invoicing/delivery; bespoke founder selling | Defer until demonstrable engaged niche reach and an inbound opportunity |
| Freemium/subscription | Free arithmetic and episodic race use make recurring payment weak; subscription would need repeat planning value | 30h+ speculative account/billing/entitlement work and support | Defer; one-time pack is simpler |
| Email | A short opt-in race-week sequence may aid product purchase and repeat use; not a separate revenue assumption | 6–10h setup, privacy/unsubscribe/deliverability and 1–2h/month; cost budget $0–20/month initially | Only after a useful pack; no weekly publishing obligation |
| Club/race bulk licensing | Clubs might buy a customised pack without huge search traffic; unverified demand | 4–8h prototype/conversations; budget 1–2h per buyer, no large course-data platform | Small discovery test later; do not build before a buyer |

[Journey's current published minimum](https://www.mediavine.com/application-requirements/) is 1,000 Tier-1-country sessions per 30 days, plus quality/traffic requirements; full Mediavine now specifies at least $5,000 annual ad revenue. Old 50,000-session and 10,000-session advice is outdated. Its [August 2026 update](https://www.mediavine.com/blog/two-years-of-journey-by-mediavine/) says GA is used for evaluation and the prior 30-day Grow script requirement is gone. GSC clicks cannot establish either eligibility or revenue. Network qualification alone is not a reason to alter the free user experience.

[Lemon Squeezy's published base fee](https://www.lemonsqueezy.com/pricing) is 5% + $0.50, with additional fees possible. A $12 product leaves $10.90 before extra fees/refunds; the model rounds down to $10 contribution. Merchant-of-record handling reduces sales-tax administration, but eligibility and actual fees must be checked; no account was opened. [Gumroad's direct-sale help page](https://gumroad.com/help/article/66-gumroads-fees) specifies 10% + $0.50 plus card processing, making it less attractive for this example. Do not confuse base fees with total deductions.

### Scenarios and scale

Affiliate assumptions, all site sessions: conservative 1% outbound × 1% merchant purchase × $2 commission; base 3% × 2% × $3; optimistic 7% × 4% × $5. These are future audience-mix assumptions; today's fueling traffic does not support the base or optimistic case. A $60 nutrition basket at an assumed negotiated 5% rate yields $3, but that rate has not been verified for a particular partner.

| Per month at 10,000 total sessions | Conservative | Base | Optimistic |
| --- | ---: | ---: | ---: |
| Pack conversion / orders | 0.1% / 10 | 0.3% / 30 | 0.7% / 70 |
| Pack contribution | $100 | $300 | $700 |
| Display assumption / revenue | $3 RPM / $30 | $6 / $60 | $12 / $120 |
| Affiliate contribution | $2 | $18 | $140 |
| Combined before fixed costs and labour | $132 | $378 | $960 |

Stacking channels may reduce conversion and is not a forecast. At these same assumptions, combined contribution at 1,000 sessions is $13/$38/$96; at 50,000 it is $660/$1,890/$4,800. Allow $20–50/month cash overhead once selling, plus support/refunds already partly reserved in the product contribution; income tax and founder hours are not included. Present-day monthly sessions are unknown: **do not apply these scenarios to 447 GSC clicks**.

With pack contribution $10, $2,000–5,000 requires 200–500 sales/month before fixed costs. At base 0.3% conversion that means about 67,000–167,000 sessions; at 0.1%, 200,000–500,000; at 0.7%, 29,000–71,000. At $6 display RPM alone it requires about 333,000–833,000 sessions. Base affiliates alone ($1.80/1,000) require approximately 1.1–2.8 million sessions. The blended base assumption needs roughly 53,000–132,000 sessions before costs. There is no evidence this scale is attainable within 12 months. A focused product has better theoretical contribution per visit, while **willingness to pay remains the largest unresolved risk**.

### Amazon and direct partners

Founder reports September closures for failing three qualifying purchases in 180 days; PR #15 removed expired links and the revision preserves that removal. [Amazon's official help](https://affiliate-program.amazon.com/help/node/topic/G7MJTPEP9NC3YKMG) permits reapplication but requires a new application/account review; personal orders are not a way to meet qualification. Its [US rate schedule](https://affiliate-program.amazon.com/help/node/topic/GRXPHT8U84RAYDXZ) lists grocery/health categories at 1%, sports at 3%, watches/shoes at 4%; classification and regional programmes matter. At a $60 basket those examples pay $0.60/$1.80/$2.40. Do not assume all running nutrition earns the sports rate.

Prefer checking nutrition specialists first: [The Feed's programme listing](https://www.flexoffers.com/affiliate-programs/the-feed-affiliate-program/) and [Tailwind's own affiliate agreement page](https://tailwindnutrition.com/pages/affiliate-program-agreement) confirm leads, but public negotiated rates and US/UK/CA/AU eligibility/shipping were not established. These are prospects, not approved partners. [Running Warehouse](https://www.runningwarehouse.com/programs/) currently pauses new applications and states retailer exclusivity, so it is not a ready alternative. Garmin's regional affiliate pages are leads; applicable country acceptance and commission were not confirmed. No specific SiS programme terms were verified.

The fueling calculator, finish-time gel guide and first-person fueling experiments have the closest relevant purchase context, although a calculator visitor need not intend to buy. Existing watch/GPS advice is instructional rather than a proven commercial landing page. Do not add a “best shoes” cluster simply for commissions.

**Proposed Amazon trigger, not an Amazon requirement:** demonstrate at least 100 genuine relevant merchant-outbound actions/month for three consecutive months, with useful original nutrition content and supported countries. At 2% assumed conversion that is about 12 orders/180 days; at 0.5% it is only three expected, still risky. Clicks do not guarantee qualifying orders. Reapply only after founder approval and after comparing direct terms; never restore old IDs. Because no live programme exists, use feedback/product demand rather than adding speculative merchant tracking now.

## PR #16 audit and completed revision

| Initial substantive change | Independent verdict / revision |
| --- | --- |
| GA4 global opt-in | Keep as a simple conservative operational choice, not a universal worldwide legal rule or an AdSense prerequisite. Choice works without a commercial CMP while only optional GA is considered; legal adequacy is not proven |
| AdSense loader removal | Keep while ads are unapproved/deferred. Verification meta/ads.txt remain; inspect actual account method before another review |
| 105 HTML references | Keep one version bump: `/assets/*` was already immutable for a year, so the old URL could serve cached automatic code. Altering today's cache header cannot purge already-cached responses. No generator/build system is justified solely for 105 references |
| Worked examples | Keep real decision arithmetic, clearer illustrative labels and useful prefilled 3:30 band link. Not approval evidence |
| Privacy/editorial notices | Keep accurate description; narrow query-sanitisation claims to site-authored data and explain account-side automatic events |
| Alias redirects | Keep two evidence-backed 301s and established destination URLs |
| VM/static tests | Extend for actual edge cases and sitemap/canonical agreement; keep stable calculation/UI coverage |
| New parallel readiness workflow | Remove duplicate workflow and integrate readiness into existing measurement workflow; extend existing browser CI to navigation, SEO/consent and all-page scans |

Specific engineering fixes: the band now goes through a single consent gate, not raw `gtag`; six event names and categorical parameters are allowlisted, rejecting form values. Consent default/update precede configuration; ad consent stays denied; Google Signals and ad-personalisation signals are disabled. Pending idle/load callbacks recheck choice, preventing a late tag download after withdrawal. Withdrawal sets the Google disable flag, updates consent and reloads, including cross-tab storage changes. Unknown/blank referrers become an empty string rather than an omitted override. Repeated setup/config is guarded. Banner fits 320px, gives equally styled 44px actions, restores footer focus and disappears from printed material. Removed inactive Amazon-specific telemetry. No form/math/export/SEO URL change.

The all-page script version is now `20261008-audit`. One shared file is still the maintainable architecture; deploy-time immutable caching remains intentional. Future version changes must update all references and the static assertion together. This is preferable to relying on a changed cache header to clear old files or introducing a site compiler for this patch.

### Google requirements and remaining account checks

[Google basic Consent Mode](https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic) blocks tags until permission; advanced mode can send cookieless pings before consent. The PR deliberately uses basic behaviour; Google does not require global GA opt-in solely because the site has an AdSense account. Relevant privacy laws and Google service policies are separate. The [ICO's current statistical exception guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/) describes a narrow UK exception with conditions including purpose, information and opt-out; it is not automatic approval for unrestricted GA4 or a worldwide exemption. A geo-specific implementation adds maintenance and uncertainty at this scale. Keep the simple choice now and use GSC for acquisition; opt-in GA samples are biased and should never be treated as total traffic.

Google's [publisher verification instructions](https://support.google.com/adsense/answer/7584263?hl=en) offer script, ads.txt and meta methods. Removing automatic ad JS is therefore not intrinsically fatal to ownership, but the actual dashboard/application must be checked. [Its certified-CMP rules](https://support.google.com/adsense/answer/13554116?hl=en) require a Google-certified TCF CMP for personalised EEA/UK/Swiss ads; some non-personalised/limited modes may be eligible without one where supported. A GA allow button is not advertising permission. Before conventional ads, choose an appropriate certified CMP, integrate/reconcile both consent interfaces and assess regional rules. Google's own certified message option is a candidate, not an installed system; certification itself does not prove legal compliance. Do not flip ads on inside this loader.

**Account-side prerequisite:** inspect GA4 [Enhanced Measurement](https://support.google.com/analytics/answer/9216061?hl=en). Automatic history pageviews, site search, outbound clicks, forms and file-download events can collect URLs or form destinations outside this script's allowlist. Site-search's default `s` parameter conflicts with the band's seconds query parameter. Disable/audit these options until they are proven appropriate; use the existing sanitised custom tool actions instead. Do not assume `page_location` override alone sanitises every automatic event. No Analytics scope was available, so this setting has not been changed or verified. Check actual network payloads and DebugView after consent before claiming end-to-end query privacy. This is an operator handoff item, not something a mocked test can establish.

[Google's site-quality guidance](https://support.google.com/adsense/answer/81904?hl=en) asks for original relevant content and usable navigation. It does not specify a minimum word count or an approval probability. The existing functioning tools already provide original value; templated generic advice may weaken perceived quality but was not confirmed as the rejection cause. Two extra paragraphs and a consent banner cannot establish that previous low-value-content rejections are resolved. Further review work should follow runner feedback, not more prose solely for a reviewer.

## Validation record and boundaries

Local suites passed: consent/analytics VM including withdrawal and cross-tab changes; 105-page readiness and expired-affiliate checks; band calculation/state regressions; 17 browser UI regressions; seven SEO/consent browser regressions; 210 desktop/mobile page observations with no reported JavaScript/overflow issues; band browser cases covering 1280/390/320px and marathon/half/km/miles; 12 actual A4/Letter PDFs with PyMuPDF checks; phone-card generation/download; legacy sharing links and checkpoint printing. Visual review of representative half-marathon Letter PDF confirmed layout, calibration and no privacy overlay. See QA README for commands. Browser tests exercise both default denial and affirmative choice, repeated configuration/events, referrer/query filtering and absence of advertising requests. They mock Google delivery, not actual received GA events.

The existing broad UI suite had stale expectations for a collapsed checkpoint control, its print-mode name and the current inline error location. These tests were corrected to exercise the real existing interface, not to change functioning production UI. Existing automatic-AdSense assertions were replaced with consent assertions. Test dependency/runtime failures were corrected separately from product defects. No exact physical printer result or Safari/iOS printing was verified; the calibration line still requires real-printer checking. Lighthouse/CrUX field performance, screen-reader testing, GA account settings and ingestion, AdSense dashboard and regional legal assessment remain outstanding. Final GitHub checks and revised Cloudflare preview are recorded in the PR/final delivery after push; local passes alone are not a CI claim.

## Ranked commercial roadmap

All impact estimates are directional hypotheses unless linked to current data. Hour estimates are founder work, not promises. Scope respects roughly 40h/month; do not start every row simultaneously. Running costs are incremental budgets, not vendor quotes.

| Rank / period | Initiative | Hours / ongoing cash | Impact and confidence | Dependency and success measure |
| --- | --- | --- | --- | --- |
| 1 / next 2 weeks | Finish PR review, GA scope/settings/DebugView and production/preview distinction | 2–4h; $0 | Reliable consent and interpretable data, no direct revenue; high technical confidence | Founder-authorised merge/release later; one accepted config, correct events, no name/query leakage, no ads before approval |
| 2 / next 2 weeks | Prototype one integrated race-day pack; test with 5–8 runners already preparing for a race | 6–8h; $0 | Determines whether the primary model deserves more work; medium need, low paid-demand confidence | No checkout/account needed; at least three concrete requests to buy at a stated $9–15 price, objections recorded. Verbal interest is weak evidence, not conversion |
| 3 / weeks 2–6 | Improve band discovery/handoffs on top four goal pages and conversion guide; one clear next action | 6–10h; $0 | More tool use from demonstrated visitors; medium confidence, no claimed ranking uplift | Use existing free outputs; compare eligible-page tool opens/completions over 28-day windows and collect failure feedback |
| 4 / months 1–3 | Replace repetitive non-essential sections on 3:30/4:30 first; add a sourced, practical visual decision/example | 6–10h; $0 | Better intent satisfaction and possible search CTR gain; medium UX, low SEO confidence | Preserve title/canonical first; compare same-query position/CTR, tool engagement and GSC clicks. Do not attribute seasonality to the change |
| 5 / months 1–3 | Sell a small one-time pack only if discovery succeeds; merchant-of-record checkout and useful sample | 12–20h + 1–2h/month; transaction fees, budget $0–20/month extras | First direct revenue; low confidence before payment evidence | Founder approves provider/terms; 10 genuine purchases, refunds below 10%, support below 10min/order; no free-export paywall |
| 6 / months 1–3 | Improve existing fueling tool-guide loop with practical quantities and first-person rehearsal evidence | 8–12h + 1h/month; $0–20 | Stronger commercial intent and product value; medium UX, low traffic certainty | Evidence checked, avoid medical promises; qualified tool use and voluntary partner-request feedback, not article count |
| 7 / months 3–6 | One approved nutrition partner; useful disclosed links only | 4–8h + 1–2h/month; $0 fixed | Likely small early income; low conversion confidence | Verify commission/countries/terms; engagement milestone above, founder application approval; measure retailer-confirmed orders and earnings per 1,000 relevant visits |
| 8 / months 3–6 | Optional short race-week email sequence | 6–10h + 1–2h/month; $0–20/month budget | Product-assisted return use; low confidence | Pack/customer evidence first; unsubscribe-aware opt-in, no forced download signup; sales per subscriber cohort, complaints/support |
| 9 / months 3–6 | Compare restrained AdSense/Journey experiment | 4–8h + 1h/month; CMP budget assessed then | Secondary income; revenue uncertainty high | Actual GA Tier-1 eligibility plus approval/CMP. Prefer at least 10k total sessions/month to justify experiment effort; this is a business threshold, not Google's rule. Stop if band success/mobile usability suffers or revenue fails to repay effort |
| 10 / months 6–12 | Automate proven pack customisation; small club licensing test; extend only winning planning topics | 12–24h then 2–4h/month; budget total tools $20–50/month | Better margin and a second distribution route; low–medium confidence after sales | 25+ sales/month, repeated requests and a willing club buyer. Track contribution per founder hour, repeat races, organic non-brand clicks and support load |

At 10h/week, reserve 2h for evidence/support and at most 8h for one active initiative. Do not spend 100+ hours on a course-specific pace engine before a customer buys a simpler pack. Prefer upgrading demonstrated band/prediction/fueling journeys to launching more general training articles. A very small original experiment with transparent limitations is more useful than unsupported coaching breadth.

### Stop / continue / pivot

These are management thresholds chosen for this project, not externally validated industry cutoffs. Review after 90 days and at six months using season-matched data where possible.

- **Continue:** users repeatedly complete/use race outputs, organic clicks grow across comparable windows, at least 10 real pack purchases or a credible club buyer emerge, and maintenance stays below 2h/week. Increase effort only toward demonstrated needs.
- **Pivot the product:** tool use grows but fewer than 0.2% of at least 1,000 qualified offer views buy, or prototype interviews favour free outputs. Change the added problem/value once; do not spend months reskinning bands. At zero sales in 1,000 independent qualified views, an approximate 95% upper bound is 0.3%, illustrating why zero does not prove absolute no demand. Consent-limited views are a biased sample.
- **Maintenance mode:** after two focused experiments and six months, no paid-demand signal, no meaningful season-adjusted organic growth, or support exceeds 3h/week for negligible contribution. Keep core tools accurate, links and security checked; stop broad content production and AdSense retry cycles. Do not sacrifice a useful free site to salvage ad yield.
- **Scale toward $2k–5k:** requires validated contribution per visitor, tens of thousands of qualified sessions or an effective club distribution channel, and manageable refunds/support. Treat this as conditional long-term potential rather than a 12-month earnings target already supported by data.

**Single next action after PR #16:** put a concrete integrated race-day planning-pack prototype in front of 5–8 race-bound runners and test the incremental value and stated price. Resolve the GA account handoff as a release prerequisite, but let paid-demand evidence determine the next product investment.
