# Historical handoff — superseded by Amazon affiliate cleanup (8 October 2026)

**PR #16 revision:** dormant Amazon event handling has now been removed. See [the current measurement and business audit](monetisation-strategy-2026-10-08.md) and [QA instructions](README.md). The implementation details below are historical, not launch instructions.

**Amazon Associates closed the store IDs in September 2026. The affiliate shortlinks described below were removed from every public page in PR #15; this older handoff is retained only as a record of the PR #14 implementation. The existing GA4 tag and event listener remain installed, but no current public Amazon links produce affiliate events. Do not follow the old verification steps about clicking the removed shopping links. New affiliate links must only be added after an account is approved, with updated disclosures and tests.**

---

# GA4 affiliate analytics handoff (8 October 2026)

## Current setup
- Measurement ID: \`G-04CFG6TG7N\`, already set in \`assets/site-telemetry.js\`.
- This PR does **not** add a second GA4 script or a second \`gtag('config')\`.
- The shared telemetry loader currently sends \`page_location\` as origin plus pathname, with no query string or fragment; it also strips the referrer's query.
- \`affiliate_click\` is recorded for the four existing Amazon shortlinks on the fueling calculator and fueling guide only.
- The home pace calculator dispatches existing local \`mpk:action\` events. Six predefined actions are mapped to GA4 event names without passing any action arguments.
- The printable pace-band's own \`pace_band_*\` events continue unchanged and are not duplicated.
- Neither a payment nor a purchase is inferred from clicks. Revenue and orders must be read from Amazon Associates reports.

## Privacy and consent
Only constant product identifiers, merchant and placement labels, and path-only page locations are sent as custom event parameters. Do not pass full URLs, race names, form entries, runner names or personal information.
**Consent must be assessed separately before production launch.** The existing site telemetry loads Google Analytics and AdSense scripts; this PR does not implement a consent platform or establish compliance in every visitor region. Ensure necessary regional consent notices and consent settings are in place, especially for EEA/UK traffic and AdSense. Check browser extensions or Cloudflare for duplicate injected tags before merging.

## Before merging
1. Check \`Affiliate analytics QA\` passes, plus any existing PR checks.
2. Open preview on both fueling pages; check all four Amazon links are clickable and point to the existing verified destinations.
3. Inspect devtools Network or Tag Assistant for only one GA4 configuration and \`affiliate_click\` event on a user click. Don't use real purchases to test.
4. Confirm that shared or saved URLs containing a query/fragment don't reach GA4 event data. Verify page_view reports against an actual installed tag.
5. Confirm privacy notice accurately describes live telemetry and that the selected consent experience meets requirements. Do not merge until consent requirements are addressed.

## After deployment
- GA4 -> Reports / Realtime or DebugView: look for \`affiliate_click\` (may take time for normal reports).
- GA4 -> Admin -> Custom definitions: create event-scoped dimensions for \`affiliate_product\`, \`affiliate_placement\`, and \`affiliate_platform\`, if product/placement reporting is needed.
- Use GA4 \`affiliate_click\` to understand outbound intent, and Amazon Associates tracking reports to assess eventual purchases.
- The existing GA4 enhanced measurement outbound \`click\` event may also fire; do not add it to \`affiliate_click\` totals.
- Page and tool traffic must grow; these low-volume pages do not yet establish a conversion rate.
