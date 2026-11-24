/* Lab 11 · scoped Vanilla JS widget: input/change/reset, accessible errors, fail-safe UI. */
import { estimateOutfit } from './outfit-calculator.mjs';

const form = document.getElementById('outfit-form');
if (form) {
  const field = form.elements.namedItem('dressPrice');
  const accessory = form.elements.namedItem('accessory');
  const delivery = form.elements.namedItem('delivery');
  const wrapping = form.elements.namedItem('wrapping');
  const total = document.getElementById('outfit-total');
  const breakdown = document.getElementById('outfit-breakdown');
  const error = document.getElementById('outfit-error');
  const format = amount => new Intl.NumberFormat('uk-UA').format(amount) + ' ₴';
  const render = () => {
    if (!field || !accessory || !delivery || !wrapping || !total || !breakdown || !error) return;
    try {
      const result = estimateOutfit({
        dressPrice: field.value,
        accessory: accessory.value,
        delivery: delivery.value,
        wrapping: wrapping.checked
      });
      field.setAttribute('aria-invalid', 'false');
      field.classList.remove('has-error');
      error.textContent = '';
      total.textContent = format(result.total);
      breakdown.textContent = `Сукня: ${format(result.dress)} · Додаткові опції: ${format(result.extras)}`;
    } catch (issue) {
      // Never display NaN/Infinity or exception internals to the customer.
      field.setAttribute('aria-invalid', 'true');
      field.classList.add('has-error');
      error.textContent = issue instanceof RangeError || issue instanceof TypeError
        ? issue.message : 'Перевірте введені дані.';
      total.textContent = '—';
      breakdown.textContent = 'Виправте значення, щоб побачити розрахунок.';
    }
  };
  field.addEventListener('input', render);
  accessory.addEventListener('change', render);
  delivery.addEventListener('change', render);
  wrapping.addEventListener('change', render);
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('reset', () => requestAnimationFrame(render));
  render();
}
