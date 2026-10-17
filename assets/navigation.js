/* Native details provide the no-JavaScript menu. Enhance dismissal and focus only. */
(() => {
  'use strict';
  const header = document.querySelector('.mpkm-site-header');
  if (!header) return;
  const disclosures = [...header.querySelectorAll('[data-nav-disclosure]')];
  const mobile = header.querySelector('.mpkm-mobile-menu');
  const close = (details, restoreFocus = false) => {
    details.removeAttribute('open');
    details.querySelectorAll('[data-nav-disclosure][open]').forEach(child => child.removeAttribute('open'));
    if (restoreFocus) details.querySelector(':scope > summary').focus();
  };
  header.addEventListener('click', event => {
    const summary = event.target.closest('summary');
    if (summary && disclosures.includes(summary.parentElement) && !summary.parentElement.open) {
      disclosures.filter(other => other.open && other !== summary.parentElement && !other.contains(summary))
        .forEach(other => close(other));
    }
    if (event.target.closest('a')) disclosures.filter(details => details.open).forEach(details => close(details));
  });
  header.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const open = event.target.closest('[data-nav-disclosure][open]');
    if (open) {
      event.preventDefault();
      event.stopPropagation();
      close(open, true);
    }
  });
  document.addEventListener('click', event => {
    disclosures.filter(details => details.open && !details.contains(event.target)).forEach(details => close(details));
  });
  header.addEventListener('focusout', event => {
    // relatedTarget is available before activeElement updates during keyboard focus transfer.
    disclosures.filter(details => details.open && !details.contains(event.relatedTarget))
      .forEach(details => close(details));
  });
  window.matchMedia('(max-width: 1000px)').addEventListener('change', () => {
    disclosures.filter(details => details.open).forEach(details => close(details));
    if (header.contains(document.activeElement)) {
      (window.matchMedia('(max-width: 1000px)').matches ? mobile.querySelector(':scope > summary') : header.querySelector('.mpkm-brand')).focus();
    }
  });
})();
