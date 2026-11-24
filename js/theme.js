/* Lumiere: persistent, accessible theme selection. No changes to business logic. */
(() => {
  const key = 'lumiere-theme';
  const doc = document.documentElement;
  const buttons = document.querySelectorAll('[data-theme-toggle]');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    const dark = theme === 'dark';
    doc.dataset.theme = dark ? 'dark' : 'light';
    doc.classList.toggle('dark', dark);
    doc.style.colorScheme = dark ? 'dark' : 'light';
    if (themeMeta) themeMeta.content = dark ? '#17181c' : '#fafafa';
    buttons.forEach(btn => {
      btn.setAttribute('aria-checked', String(dark));
      btn.setAttribute('aria-label', dark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему');
      btn.title = dark ? 'Світла тема' : 'Темна тема';
    });
    document.dispatchEvent(new CustomEvent('lumiere:themechange', {detail: {theme: dark ? 'dark' : 'light'}}));
  }
  function setTheme(theme) {
    applyTheme(theme);
    try { localStorage.setItem(key, theme); } catch(e) { /* browsing without storage */ }
  }
  applyTheme(doc.dataset.theme);
  buttons.forEach(btn => btn.addEventListener('click', () => {
    setTheme(doc.dataset.theme === 'dark' ? 'light' : 'dark');
  }));
  // Keep multiple open tabs consistent, without disrupting the current page.
  window.addEventListener('storage', ev => {
    if (ev.key === key && (ev.newValue === 'dark' || ev.newValue === 'light')) {
      applyTheme(ev.newValue);
    }
  });
})();
