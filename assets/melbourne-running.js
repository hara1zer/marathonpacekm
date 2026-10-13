/* Progressive enhancement: every venue and its links are present in the HTML. */
(() => {
  'use strict';
  const form = document.getElementById('venue-filters');
  if (!form) return;
  const region = document.getElementById('venue-region');
  const kind = document.getElementById('venue-kind');
  const count = document.getElementById('venue-count');
  const empty = document.getElementById('venue-empty');
  const cards = [...document.querySelectorAll('[data-venue]')];
  const groups = [...document.querySelectorAll('[data-venue-group]')];

  function update() {
    let tracks = 0, paths = 0;
    for (const card of cards) {
      const matchesRegion = region.value === 'all' || card.dataset.regions.split(' ').includes(region.value);
      const matchesKind = kind.value === 'all' || card.dataset.kind === kind.value;
      card.hidden = !(matchesRegion && matchesKind);
      if (!card.hidden) card.dataset.kind === 'track' ? tracks++ : paths++;
    }
    for (const group of groups) {
      group.hidden = !cards.some(card => group.contains(card) && !card.hidden);
    }
    const total = tracks + paths;
    count.textContent = `${total} ${total === 1 ? 'venue' : 'venues'} · ${tracks} ${tracks === 1 ? 'track' : 'tracks'} · ${paths} ${paths === 1 ? 'path' : 'paths'}`;
    empty.hidden = total !== 0;
  }

  function revealLinkedVenue() {
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    const card = cards.find(item => item.id === id);
    if (card?.hidden) {
      region.value = 'all'; kind.value = 'all'; update();
      card.scrollIntoView({block: 'start'});
    }
  }

  form.addEventListener('change', update);
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('reset', event => {
    event.preventDefault(); region.value = 'all'; kind.value = 'all'; update();
  });
  window.addEventListener('hashchange', revealLinkedVenue);
  // A same-fragment directory link must also reveal a previously filtered card.
  document.querySelectorAll('.venue-jump a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const card = cards.find(item => '#' + item.id === link.getAttribute('href'));
      if (card?.hidden) { region.value = 'all'; kind.value = 'all'; update(); }
    });
  });
  form.hidden = false;
  update();
  revealLinkedVenue();
})();
