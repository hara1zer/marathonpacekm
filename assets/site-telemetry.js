/* Consent-first, filtered site-authored measurement. Does not request AdSense ads.
 * Keep the publisher meta tag/ads.txt for account ownership verification.
 * Personalised EEA/UK/Swiss ads require Google's certified TCF CMP; review other ad modes too.
 */
(() => {
  'use strict';
  if (window.__mpkmTelemetry || window.self !== window.top) return;
  window.__mpkmTelemetry = true;

  const measurement = 'G-04CFG6TG7N';
  const key = 'mpkm_analytics_choice_v1';
  const page = location.origin + location.pathname; // never send personal share-link parameters
  let choice = null;
  let tagStarted = false;
  let banner;

  try {
    const stored = window.localStorage.getItem(key);
    if (stored === 'allow' || stored === 'decline') choice = stored;
  } catch (_) { /* Storage may be disabled; ask again on a future visit. */ }

  function tag(source) {
    if (Array.from(document.scripts).some(el => el.src === source)) return;
    const element = document.createElement('script');
    element.async = true;
    element.src = source;
    document.head.appendChild(element);
  }

  function startAnalytics() {
    if (choice !== 'allow' || tagStarted) return;
    tagStarted = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    // Basic consent mode: initialise the tag only *after* an affirmative choice.
    // Ads remain disabled; this preference controls GA4 analytics only.
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', {analytics_storage: 'granted'});
    let referrer = '';
    try {
      const url = new URL(document.referrer);
      referrer = url.origin + url.pathname;
    } catch (_) { /* Missing or invalid referrers are expected. */ }
    window.gtag('js', new Date());
    window.gtag('set', {page_location: page, page_referrer: referrer});
    window.gtag('config', measurement, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    function downloadTag() {
      const load = () => {
        if (choice === 'allow') tag('https://www.googletagmanager.com/gtag/js?id=' + measurement);
      };
      if ('requestIdleCallback' in window) window.requestIdleCallback(load, {timeout: 1500});
      else window.setTimeout(load, 100);
    }
    if (document.readyState === 'complete') downloadTag();
    else window.addEventListener('load', downloadTag, {once: true});
  }

  function track(name, params = {}) {
    if (choice !== 'allow' || typeof window.gtag !== 'function') return false;
    window.gtag('event', name, {page_location: page, ...params});
    return true;
  }

  // Every band event uses the same consent gate; never accept arbitrary form values.
  const bandEvents = new Set([
    'pace_band_plan_ready', 'pace_band_validation_error', 'pace_band_phone_generation',
    'pace_band_download_intent', 'pace_band_print_intent', 'pace_band_share_copied'
  ]);
  const bandParameters = {
    race_distance: new Set(['marathon', 'half_marathon']),
    output_type: new Set(['preview', 'phone_png', 'wrist', 'checkpoints', 'share_link']),
    field: new Set(['h', 'm', 's', 'paceM', 'paceS', 'startCushion', 'negativeMargin']),
    error_category: new Set(['strategy', 'time_or_pace'])
  };
  window.mpkmTrackBand = (name, params = {}) => {
    if (!bandEvents.has(name)) return false;
    const safe = {};
    for (const [key, values] of Object.entries(bandParameters)) {
      if (values.has(params[key])) safe[key] = params[key];
    }
    return track(name, safe);
  };

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
    if (name) track(name); // never forward arbitrary event details or form values
  });

  const style = document.createElement('style');
  style.textContent = [
    '.mpkm-privacy-banner{position:fixed;z-index:9998;left:12px;bottom:12px;width:min(450px,calc(100vw - 24px));',
    'box-sizing:border-box;max-height:calc(100dvh - 24px);overflow:auto;',
    'padding:16px 18px;border-radius:14px;background:#fff;color:#152d27;',
    'box-shadow:0 8px 30px rgba(0,0,0,.22);border:1px solid #c3d2c8;font:15px/1.5 system-ui,sans-serif}',
    '.mpkm-privacy-banner p{margin:6px 0 12px}',
    '.mpkm-privacy-banner a{color:#174f40;text-decoration:underline}',
    '.mpkm-privacy-actions{display:flex;gap:10px;flex-wrap:wrap}',
    '.mpkm-privacy-actions button{min-height:44px;border-radius:9px;padding:9px 12px;',
    'font:600 14px system-ui,sans-serif;cursor:pointer;border:1px solid #174f40;background:#fff;color:#174f40}',
    '.mpkm-privacy-actions button,.mpkm-legacy .mpkm-privacy-actions button{background:#fff!important;color:#174f40!important}',
    '.mpkm-privacy-banner button:focus-visible,.mpkm-privacy-manage:focus-visible{outline:3px solid #ad7300;outline-offset:3px}',
    '.mpkm-privacy-manage{margin:8px 0;display:inline-block;border:1px solid currentColor;',
    'border-radius:6px;padding:6px 10px;background:transparent;color:inherit;font:inherit;cursor:pointer}',
    '@media print{.mpkm-privacy-banner,.mpkm-privacy-manage{display:none!important}}'
  ].join('');
  document.head.appendChild(style);

  function choose(next) {
    const prior = choice;
    choice = next;
    try { window.localStorage.setItem(key, next); } catch (_) {}
    if (banner) { banner.remove(); banner = null; }
    if (next === 'allow') {
      startAnalytics();
    } else if (prior === 'allow' && tagStarted) {
      window['ga-disable-' + measurement] = true;
      // Stop subsequent events and revoke consent for an already loaded tag.
      window.gtag?.('consent', 'update', {
        analytics_storage: 'denied', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied'
      });
      // Reset the tag on the next navigation; it will not load with denied choice.
      window.location.reload();
    }
    document.querySelector('.mpkm-privacy-manage')?.focus();
  }

  // A withdrawal in another tab must stop this tab's events as well.
  window.addEventListener('storage', event => {
    if (event.key === key && event.newValue !== choice) {
      choose(event.newValue === 'allow' ? 'allow' : 'decline');
    }
  });

  function showChoices() {
    if (banner) { banner.querySelector('button')?.focus(); return; }
    banner = document.createElement('section');
    banner.className = 'mpkm-privacy-banner';
    banner.setAttribute('aria-label', 'Optional analytics preference');
    const heading = document.createElement('strong');
    heading.textContent = 'Optional site analytics';
    const description = document.createElement('p');
    description.textContent = 'May we use Google Analytics cookies to understand visits and improve these free running tools? It is optional; no advertising is activated by this choice. ';
    const more = document.createElement('a');
    more.href = '/privacy/';
    more.textContent = 'Privacy details';
    description.appendChild(more);
    const actions = document.createElement('div');
    actions.className = 'mpkm-privacy-actions';
    for (const [label, next] of [['Allow analytics', 'allow'], ['Decline', 'decline']]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', () => choose(next));
      actions.appendChild(button);
    }
    banner.append(heading, description, actions);
    document.body.appendChild(banner);
  }

  function setUpChoices() {
    const footer = document.querySelector('footer');
    if (footer) {
      const manage = document.createElement('button');
      manage.type = 'button';
      manage.className = 'mpkm-privacy-manage';
      manage.textContent = 'Analytics privacy choices';
      manage.addEventListener('click', showChoices);
      footer.appendChild(manage);
    }
    if (choice === null) showChoices();
  }

  if (choice === 'allow') startAnalytics();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setUpChoices, {once: true});
  else setUpChoices();
})();
