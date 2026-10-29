/* One crawlable collection, progressively enhanced with topic filters. */
(() => {
  const root = document.querySelector('[data-lab-collection]');
  if (!root) return;
  const filters = root.querySelector('[data-lab-filters]');
  const cards = [...root.querySelectorAll('[data-study-id]')];
  const buttons = [...filters.querySelectorAll('button')];
  function select(topic) {
    let count = 0;
    for (const card of cards) {
      const matches = topic === 'all' || card.dataset.topics.split(' ').includes(topic);
      card.hidden = !matches;
      if (matches) count++;
    }
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.labTopic === topic));
    root.querySelector('[data-lab-filter-status]').textContent = `${count} of ${cards.length} investigations shown.`;
  }
  for (const button of buttons) button.addEventListener('click', () => select(button.dataset.labTopic));
  filters.hidden = false;
  const initial = location.hash.slice(1);
  select(buttons.some(button => button.dataset.labTopic === initial) ? initial : 'all');
})();
