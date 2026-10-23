# AdSense readiness: current-main audit checkpoint (23 October 2026)

This document records verified findings from the connected GitHub repository, without overwriting any existing implementation. It is a **checkpoint, not a completed sitewide AdSense audit**.

## Confirmed existing work to preserve
- Shared navigation is generated through `site_navigation.py`; do not hand-edit headers or footers on individual pages.
- Navigation QA covers 116 HTML documents (115 published pages and 404), and the previous audit inventories 39 blog posts, 20 goal guides and 18 Melbourne venue guides.
- The quality README documents browser, SEO, calculator, consent, Melbourne and navigation regression suites.
- Recent PRs addressed navigation (#21), wrist-band reading direction and print pagination (#22), preset-page consolidation (#20), and local Melbourne content (#18–19). Verify merge status and the current main SHA before modifying these areas.

## Verified remaining functional issue
`race-conditions-pace-adjuster/index.html` currently links the CTA labelled **Build checkpoint splits + pace band** to `/marathon-pace-calculator/` without query parameters. The adjusted target is therefore not explicitly transferred by the link. A correct fix requires verifying the calculator's accepted URL state and the adjuster's computed target before changing the CTA, then testing reload and browser history.

## Highest-priority follow-up checks
1. **Calculator handoffs:** verify selected race distance, target seconds, units and strategy through share, embed, PDF, reload and print paths. Unsupported distances must not silently become a marathon.
2. **Content differentiation:** manually review the 20 goal-time guides for distinct decision-useful guidance, not only different split numbers. Review template duplication against remaining landing pages.
3. **Trust and editorial evidence:** check first-hand experience claims, source attribution, author and contact information, methodology and date accuracy. Do not invent personal testing or route verification.
4. **Indexing and site architecture:** reconcile canonical URLs, redirects, sitemap and robots directives with published pages; avoid reintroducing consolidated thin landing pages.
5. **Measurement and monetisation:** verify consent behaviour and expired affiliate links, and do not treat passing technical checks as a guarantee of AdSense approval.

## Safety rules
- Base every change on current `main`; preserve existing merged navigation, pace-band, print and venue work.
- No mass-generated filler, invented firsthand experience, or speculative AdSense promises.
- Run the documented regression suites and inspect resulting diffs before proposing functional changes.
- Keep production unchanged until the PR is reviewed and merged.
