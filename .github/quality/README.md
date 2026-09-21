# Browser regressions

The site remains static HTML/CSS/JavaScript with no production build step.
These developer-only scripts need Node 20+ and Playwright installed in your local development environment. Install its Chromium browser (`npx playwright install chromium`), then run from the repository root:

```
node .github/quality/browser-regressions.mjs
node .github/quality/browser-scan.mjs
```

Optional environment variables: `PLAYWRIGHT_MODULE` (absolute module path), `CHROMIUM_PATH`, `CHROMIUM_ARGS` (JSON array), and `QA_OUTPUT` (outside the published directory; defaults to `/tmp/marathonpacekm-qa`). Do not publish dependencies or test output. The scripts start a local server, block third-party requests and emulate explicit redirects and the iframe-header exception. They do not test Cloudflare's deployed header engine or actual ad serving/consent.

The regression script checks normal/invalid calculator inputs, precise time totals, km/mile band segments, prediction scenarios, zero-mileage weeks, fueling schedules, CSV/PNG downloads and both print layouts. The scan visits every HTML page at 1280 and 390 px, recording script errors, missing resources and horizontal overflow. Nonzero exit means a failed check.
