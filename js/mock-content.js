/* Self-study requirement: async/await + fetch of local mock JSON.
   The HTML contains useful fallback content for offline/file access. */
(() => {
  const host = document.querySelector('[data-remote-stats]');
  if (!host) return;
  async function loadHighlights() {
    try {
      const response = await fetch('data.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.brandHighlights)) return;
      data.brandHighlights.forEach(item => {
        if (!Number.isInteger(item.id) || item.id < 1 || item.id > 3) return;
        if (typeof item.value !== 'string' || typeof item.label !== 'string') return;
        const value = host.querySelector(`[data-stat-value="${item.id}"]`);
        const label = host.querySelector(`[data-stat-label="${item.id}"]`);
        if (value) value.textContent = item.value.slice(0, 24);
        if (label) label.textContent = item.label.slice(0, 80);
      });
    } catch (error) {
      // Deliberately preserve safe HTML fallback; no blank screen if fetch fails.
      console.info('Lumiere: локальні дані недоступні, збережено резервний вміст.');
    }
  }
  loadHighlights();
})();
