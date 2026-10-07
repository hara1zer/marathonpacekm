# Pace-band release verification and event definitions

Run from the repository root:

```
node .github/quality/pace-band-regressions.mjs
```

This executes the actual inline calculator code in a small DOM harness. It checks cumulative rounding, final partial splits, exact goals, both distances and units, invalid-input recovery, legacy fractional pacing schedules against independent formulas, re-sharing, radio exclusivity and event payloads. It does not validate browser layout or PDF geometry.

## Events

Events reuse `window.gtag` from `assets/site-telemetry.js`; there is no new analytics service. Embedded tools do not send these events. Automatic initial rendering and loading a shared link do not count as manual plan completion.

- `pace_band_plan_ready`: first valid manual control change or preset selection in the current page session; once per page load. It measures editing completion, not printing or unique runners.
- `pace_band_print_intent`: a valid wrist-band or checkpoint-sheet print action, before opening the print dialog. Cancellation is indistinguishable from printing. Never label this confirmed printing.
- `pace_band_phone_generation`: valid PNG generation requested.
- `pace_band_download_intent`: generated phone image handed to the browser download action. Does not confirm a saved file.
- `pace_band_share_copied`: clipboard operation resolved successfully.
- `pace_band_validation_error`: invalid field on blur, deduplicated by field/category for the page session. Never emitted on every keystroke.

Parameters contain only race-distance category, output type, fixed input identifier and error category as applicable. Page location is origin + pathname. No goal values, names, race names, free text or shared query strings are sent by these events. Existing site analytics/consent behaviour remains in force.

## Browser/print acceptance matrix

Use marathon 3:30/km, marathon 4:00/miles and half marathon 2:00/km. For each, cover A4 and Letter, then 15 cm and 20 cm wrists. Check desktop, 390 px and 320 px widths.

- Race radios are exclusive; shared half-marathon URLs select half marathon immediately.
- Goal editing stays primary. Pace conversion is optional and clearly explains rounded pace; units preserve goal.
- Invalid fields show accessible errors and disable export; fixing input restores output.
- Primary print and secondary phone download remain reachable. Optional sharing/checkpoint controls work with a keyboard.
- No horizontal page overflow; only the labelled band preview may scroll.
- Browser print / saved PDF: one landscape page, three bands, no blank page, no navigation or advertising.
- A4 media box 297 × 210 mm; Letter 279.4 × 215.9 mm; 10 mm page margins.
- Scale line 50 mm. Bands 174 × 38 mm or 224 × 38 mm for the smallest/largest sizes; separate 24 mm overlap.
- All checkpoint text stays within each band, including halfway/finish. Times remain 10 pt and distance labels 8 pt; smaller wrists do not reduce font size.

## Executed software acceptance (2026-10-07)

The scoped `Pace band QA` GitHub Actions workflow runs the calculation harness, `.github/quality/pace-band-browser.mjs` in real headless Chromium, and `.github/quality/pace-band-pdf.py` against the generated PDFs. Test dependencies are installed only on the CI runner; the website has no new dependency. Artifacts retain screenshots, PDFs, the generated PNG phone card and JSON results for seven days.

- Chromium: all three representative plans at 1280, 390 and 320 px, with both wrist extremes; no unintended page overflow or overflowing checkpoint labels/times. Legacy links and clipboard re-sharing, immediate half-marathon restoration, invalid input/recovery, keyboard Tab interaction, phone PNG download and analytics assertions passed.
- Generated 12 actual PDFs: three plans × two papers × two wrist extremes. All are one landscape page with three bands; PDF media boxes, text margins, finish/halfway presence, 10 pt finish times, 8 pt finish labels and the actual 50 mm calibration path passed. Print-media DOM measurements separately confirm 174/224 × 38 mm bands and all checkpoint font sizes. Representative A4/Letter PDF renderings and mobile screenshots were visually inspected.
- The supported long-goal case (half marathon 24:59:59 in miles) remains valid when switching units; a pace conversion beyond the supported goal range exposes an accessible error.

The print-button test observes print intent; PDF output is generated separately by Chromium's real print renderer. These checks do not exercise an OS print dialog, printer driver, physical output, Safari or Firefox. They do not establish physical fit or waterproofness. The 10 mm CSS page margin is a minimum content boundary; narrower bands are centred and therefore have larger actual side whitespace.

Local Chromium installation failed because its download was invalid; CI successfully installed Chromium and performed the browser/PDF checks instead. The initial PDF assertion incorrectly expected a stroked line: Chromium emits the calibration border as a thin filled rectangle. The checker now verifies its actual width in either representation.

## Physical acceptance before claiming tested fit

Print at 100% / Actual size on both paper formats, with browser headers/footers off. Measure the scale line and strip, cut and tape small and large bands, confirm the overlap covers no times, allow comfortable wrist movement and read checkpoints at a glance. Clear tape may improve protection but is not a waterproofness guarantee. Physical print and wear testing cannot be completed remotely.
