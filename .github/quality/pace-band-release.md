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

Do not mark PDF geometry or mobile checks passed merely because the CSS specifies these values. This environment's cloud browser has not exposed native print-preview/PDF export or viewport resizing; those checks require a browser with those capabilities.

## Physical acceptance before claiming tested fit

Print at 100% / Actual size on both paper formats, with browser headers/footers off. Measure the scale line and strip, cut and tape small and large bands, confirm the overlap covers no times, allow comfortable wrist movement and read checkpoints at a glance. Clear tape may improve protection but is not a waterproofness guarantee. Physical print and wear testing cannot be completed remotely.
