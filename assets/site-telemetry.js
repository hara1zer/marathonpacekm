/* Keep optional third-party downloads behind the first useful page render. */
(() => {
  'use strict';
  if (window.__mpkmTelemetry || window.self !== window.top) return;
  window.__mpkmTelemetry = true;

  const publisher = document.querySelector('meta[name="google-adsense-account"]')?.content;
  const measurement = 'G-04CFG6TG7N';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  let referrer;
  try {
    const url = new URL(document.referrer);
    referrer = url.origin + url.pathname;
  } catch (_) { /* An empty referrer is normal for direct visits. */ }
  // Shared plans may contain names in the URL; retain the existing path-only policy.
  window.gtag('set', {page_location: location.origin + location.pathname, page_referrer: referrer});
  window.gtag('config', measurement);

  function loadScript(source, ads = false) {
    if (Array.from(document.scripts).some(script => script.src === source)) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = source;
    if (ads) script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }
  function whenIdle(callback) {
    if ('requestIdleCallback' in window) window.requestIdleCallback(callback, {timeout: 1500});
    else window.setTimeout(callback, 100);
  }
  function afterLoad() {
    whenIdle(() => loadScript('https://www.googletagmanager.com/gtag/js?id=' + measurement));
    if (publisher) {
      window.setTimeout(() => whenIdle(() => loadScript(
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(publisher), true
      )), 2500);
    }
  }
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad, {once: true});
})();
