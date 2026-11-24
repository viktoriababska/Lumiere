/** LAB 11 · Live selection of real catalog dresses, all matching models visible on navigation. */
import { suggestStyles, catalog } from './style-matcher.mjs';
const form = document.getElementById('outfit-form');
if (form) {
  const get = id => document.getElementById(id);
  const format = n => new Intl.NumberFormat('uk-UA').format(n) + ' ₴';
  let matches = [];
  let position = 0;
  const nav = get('finder-navigation');
  const previous = get('finder-prev');
  const next = get('finder-next');
  const visual = get('finder-image').parentElement;
  const link = get('finder-link');
  let suggestionReason = '';
  let isRelaxed = false;

  function renderCurrent() {
    const item = matches[position];
    const count = matches.length;
    nav.hidden = count <= 1;
    get('finder-position').textContent = count ? `${position + 1} / ${count}` : '0 / 0';
    if (!item) {
      visual.hidden = true;
      get('finder-result').classList.add('is-empty');
      get('finder-name').textContent = 'Спробуймо інший варіант';
      get('finder-price').textContent = '';
      const chosenLength = get('outfit-length').value;
      const lengthList = catalog.filter(item => chosenLength === 'any' || item.length === chosenLength);
      const minPrice = Math.min(...lengthList.map(dress => dress.price));
      const lengthName = chosenLength === 'mini' ? 'міні' : chosenLength === 'maxi' ? 'максі' : 'суконь';
      get('finder-reason').textContent = Number.isFinite(minPrice)
        ? `Для ${chosenLength === 'any' ? 'всіх ' : ''}${lengthName} у каталозі ціни починаються від ${format(minPrice)}. Можна збільшити бюджет або змінити фасон.`
        : 'У каталозі поки немає суконь цієї довжини. Спробуйте інший варіант.';
      link.href = 'catalog.html';
      link.textContent = 'Переглянути весь каталог ↗';
      link.hidden = false;
      return;
    }
    visual.hidden = false;
    get('finder-result').classList.remove('is-empty');
    const image = get('finder-image');
    image.src = item.image;
    image.alt = item.name;
    get('finder-name').textContent = item.name;
    get('finder-price').textContent = format(item.price);
    get('finder-reason').textContent = isRelaxed
      ? `${suggestionReason} ${count > 1 ? `Варіант ${position + 1} із ${count}.` : ''}`.trim()
      : (count > 1 ? `Варіант ${position + 1} із ${count} — гортайте стрілками.` : 'Ця сукня відповідає вашим побажанням і бюджету.');
    link.href = 'catalog.html?q=' + encodeURIComponent(item.name);
    link.textContent = 'Переглянути цю сукню ↗';
    link.hidden = false;
  }

  function render() {
    const budget = get('outfit-budget');
    try {
      const result = suggestStyles({
        occasion: get('outfit-occasion').value,
        length: get('outfit-length').value,
        silhouette: get('outfit-silhouette').value,
        budget: budget.value
      });
      matches = result.matches;
      isRelaxed = result.relaxed;
      suggestionReason = result.relaxedBy === 'occasion' ? 'Немає точного збігу за нагодою, але ці сукні підходять за довжиною, фасоном і ціною.'
        : result.relaxedBy === 'silhouette' ? 'Показуємо близькі фасони у вашій довжині та бюджеті.'
        : '';
      position = 0;
      budget.setAttribute('aria-invalid', 'false');
      budget.classList.remove('has-error');
      get('outfit-error').textContent = '';
      get('finder-result').classList.remove('finder-invalid');
      get('finder-match-count').textContent = !matches.length ? 'Немає збігів за обраною довжиною та бюджетом' : isRelaxed ? `Схожих варіантів: ${matches.length}` : matches.length === 1 ? 'Знайдена 1 модель' : `Знайдено моделей: ${matches.length}`;
      renderCurrent();
    } catch (err) {
      matches = [];
      position = 0;
      budget.setAttribute('aria-invalid', 'true');
      budget.classList.add('has-error');
      get('outfit-error').textContent = err instanceof RangeError ? err.message : 'Перевірте введені дані.';
      get('finder-match-count').textContent = 'Уточніть бюджет';
      get('finder-name').textContent = 'Не вдалося виконати підбір';
      get('finder-reason').textContent = 'Після виправлення даних результат з’явиться автоматично.';
      get('finder-price').textContent = '';
      visual.hidden = true;
      link.hidden = true;
      nav.hidden = true;
      get('finder-result').classList.add('finder-invalid', 'is-empty');
    }
  }
  function move(delta) {
    if (!matches.length) return;
    position = (position + delta + matches.length) % matches.length;
    renderCurrent();
    const result = get('finder-result');
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      result.classList.remove('finder-swap');
      void result.offsetWidth;
      result.classList.add('finder-swap');
    }
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', e => e.preventDefault());
  form.addEventListener('reset', () => requestAnimationFrame(render));
  render();
}
