# PR #16: independent AdSense and high-impression-page audit

**Audited:** 8 October 2026. **Repo:** `hara1zer/marathonpacekm`, `main` at `ad13b0be6a234c4f8e74e6575669b3dde0c1cafa`.

## Evidence and limits
Google Search Console's latest settled 28-day window ends **5 October 2026**: **447 clicks**, **86,802 impressions**, **0.515% CTR**, **average position 7.65**. Clicks and impressions are search data, not evidence that AdSense will approve a site. Historical low-value-content rejections were reported by the publisher; Google did not identify a specific offending URL.

| Page | Search impressions | Search clicks | CTR | Existing strengths |
| --- | ---: | ---: | ---: | --- |
| /3-30-marathon-pace-km/ | 10,389 | 21 | 0.20% | Exact checkpoints, shareable splits, printable bands, worked 5:00/km trap |
| /4-30-marathon-pace-km/ | 7,350 | 9 | 0.12% | Run/walk explanation, station budget, step-by-step pacing scenarios |
| /3-50-marathon-pace-km/ | 6,985 | 36 | 0.52% | Calculator, key splits, wind-adjusted race example |
| / | 9,564 | 38 | 0.40% | Complete pace chart, calculation modes and pace-band handoff |
| /printable-pace-band/ | 1,132 | 78 | 6.89% | Distinct, customisable print/phone-card utility |

The observed CTR may reflect positions, rich results, search wording, competing interfaces, or users getting the answer directly on Google. It cannot be fixed by changing titles alone. Current important titles, headings, canonical URLs and calculator behavior have therefore been deliberately preserved.

## Content duplication — actual audit
Compared five indexed marathon-time guides (`3:30`, `4:30`, `3:50`, `4:40`, `3:45`) by extracting **long paragraphs of 100+ characters**, stripping HTML and normalising numbers and punctuation before exact comparisons. `3:30` and `4:30` had **18 matching normalized paragraphs** out of 25 and 28 respectively; `3:50` and `4:40` had **14 matching normalized paragraphs** out of 20 and 21 respectively. These are directional counts of templated text, **not** a plagiarism score or an AdSense rejection probability. Some shared material is legitimately mathematical and can support different queries; generic, repeated advice remains the biggest quality concern.

**Decision:** do not create more target-time pages or mass-noindex well-performing content in this PR. Prioritize evidence-based, time-specific decisions where a page adds something more than the substituted goal time. This PR adds (a) a `3:30` scenario that quantifies catching up after 30 km, and (b) a `4:30` scenario showing how walk-speed drift changes the distance covered by a 9:1 run/walk pattern. Both are expressly hypothetical arithmetic, not coaching promises. Existing first-person race accounts, original visualizations and tools stay unchanged.

## Technical and privacy audit
Prior `assets/site-telemetry.js` automatically loaded GA4 and AdSense JavaScript after first render **without a consent decision**. The page-level GA4 ID is `G-04CFG6TG7N`. The new opt-in mechanism:
- Defaults to no GA4 requests before affirmative choice; persists allow/decline locally and offers a footer control to change it.
- Preserves path-only tracking and avoids transmitting personal values from share links.
- Preserves consent-aware tool action events and dormant allowlisted affiliate-click code; no Amazon shopping links are restored.
- Stops loading the unapproved AdSense script. Publisher verification metadata and `ads.txt` remain intact.
- Busts the long-lived cache for the shared telemetry file **on every one of the 105 HTML pages**, not only the homepage.
- Adds explicit 301s for historical colon-form 3:10 and 3:15 aliases seen in Search Console, pointing to the established canonical hyphen URLs.

**Do not treat the analytics choice as AdSense advertising consent or a certified CMP.** Before ad activation, set up the proper certified CMP/TCF flow and review regional consent behaviour and Google policies. The implementation itself does not establish legal compliance in every jurisdiction. Cloudflare Web Analytics, if injected independently, also needs a separate privacy/configuration check.

## Verification / open deployment gates
- Automated consent tests, all-HTML inventory and metadata checks, affiliate cleanup checks, pace-band regression suite and Cloudflare Pages preview must pass before merge.
- Manual preview: phone and desktop opt-in controls, changing consent in footer, no external GA4/ads requests on Decline, sanitized GA4 page URLs after Allow, working calculators and printed bands.
- In AdSense, verify meta-tag ownership and application status; no guarantee of approval or need to activate advertising code during this PR.
- Check GA4 DebugView/Realtime after permission (connector currently lacks Google Analytics scope).
- Obtain real-world reader feedback and original hands-on evidence on priority goal pages before requesting another AdSense review.
- Avoid claiming that original analysis of repetitive pages has been completed sitewide; only the five-page sample above was measured.

**Out of scope:** merging, production deployment, replacing all templated paragraphs, adding paywalls or affiliating, automatic AdSense monetisation, changing indexation of existing target-time pages or modifying race calculation algorithms.
