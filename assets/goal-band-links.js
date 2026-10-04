(() => {
  'use strict';
  const links = Array.from(document.querySelectorAll('[data-goal-band]'));
  if (!links.length) return;
  const fields = ['h', 'm', 's'].map(id => document.getElementById(id));
  function update() {
    const values = fields.map(field => Number(field.value));
    const distance = document.getElementById('dist');
    const valid = fields.every(field => field.value.trim() !== '' && field.validity.valid) &&
      values.every(Number.isInteger) && values[0] >= 0 && values[0] < 24 &&
      values[1] >= 0 && values[1] < 60 && values[2] >= 0 && values[2] < 60 &&
      values[0] * 3600 + values[1] * 60 + values[2] > 0 && (!distance || Number(distance.value) === 42.195);
    for (const link of links) {
      if (valid) {
        link.href = '/printable-pace-band/?' + new URLSearchParams({h: values[0], m: values[1], s: values[2], unit: 'km', strategy: 'even'});
        link.removeAttribute('aria-disabled'); link.removeAttribute('tabindex');
      } else {
        link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); link.setAttribute('tabindex', '-1');
      }
    }
  }
  document.addEventListener('input', update);
  document.addEventListener('change', update);
  for (const id of ['calcBtn', 'resetBtn']) document.getElementById(id)?.addEventListener('click', () => queueMicrotask(update));
  links.forEach(link => link.addEventListener('click', event => { update(); if (!link.hasAttribute('href')) event.preventDefault(); }));
  update();
})();
