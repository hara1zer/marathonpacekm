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


  // Only predefined affiliate products are recorded; never transmit links,
  // URL parameters, search terms, user inputs, or the clicked element's text.
  const products = new Set([
    'maurten-gel-100', 'gu-energy-gel', 'sis-beta-fuel-gel', 'tailwind-endurance-fuel'
  ]);
  const placements = new Set(['fueling-calculator', 'fueling-guide']);
  document.addEventListener('click', event => {
    if (event.defaultPrevented) return;
    const link = event.target?.closest?.('a[data-affiliate-product]');
    if (!link) return;
    const product = link.dataset.affiliateProduct;
    const placement = link.dataset.affiliatePlacement;
    if (!products.has(product) || !placements.has(placement)) return;
    if (!(link.rel || '').split(/\s+/).includes('sponsored')) return;
    try {
      if (new URL(link.href).hostname.toLowerCase() !== 'amzn.to') return;
    } catch (_) { return; }
    window.gtag('event', 'affiliate_click', {
      affiliate_platform: 'amazon',
      affiliate_product: product,
      affiliate_placement: placement,
      page_location: location.origin + location.pathname
    });
  });

  // The homepage emits private local application events. Forward only
  // recognised action names; discard all free-form or user-supplied detail.
  const safeActions = new Map([
    ['calculate', 'pace_calculator_calculate'],
    ['share_plan', 'pace_plan_share'],
    ['copy_checkpoints', 'pace_checkpoints_copy'],
    ['download_splits', 'pace_splits_download'],
    ['open_pace_band', 'pace_band_open'],
    ['open_goal_guide', 'pace_goal_guide_open']
  ]);
  document.addEventListener('mpk:action', event => {
    const name = safeActions.get(event.detail?.action);
    if (!name) return;
    window.gtag('event', name, {page_location: location.origin + location.pathname});
  });

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
