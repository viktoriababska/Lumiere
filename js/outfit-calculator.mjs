/* Lab 11 · deterministic, independently testable business rules (no DOM dependency). */
const ACCESSORIES = Object.freeze({ none: 0, earrings: 900, clutch: 1500 });
const DELIVERIES = Object.freeze({ pickup: 0, post: 150, courier: 250 });

export function estimateOutfit({ dressPrice, accessory = 'none', delivery = 'pickup', wrapping = false }) {
  // Strict input validation: empty, decimals, scientific notation and negatives are rejected.
  const raw = String(dressPrice ?? '');
  if (!/^\d+$/.test(raw)) throw new RangeError('Вкажіть ціну сукні цілим числом без пробілів.');
  const amount = Number(raw);
  if (!Number.isSafeInteger(amount) || amount < 1000 || amount > 50000 || amount % 100 !== 0) {
    throw new RangeError('Ціна має бути від 1 000 до 50 000 ₴ і кратною 100.');
  }
  if (!Object.hasOwn(ACCESSORIES, accessory)) throw new RangeError('Оберіть доступний аксесуар.');
  if (!Object.hasOwn(DELIVERIES, delivery)) throw new RangeError('Оберіть доступний спосіб доставки.');
  if (typeof wrapping !== 'boolean') throw new TypeError('Некоректне значення пакування.');

  const extras = ACCESSORIES[accessory] + DELIVERIES[delivery] + (wrapping ? 200 : 0);
  const total = amount + extras;
  if (!Number.isSafeInteger(total) || !Number.isFinite(total)) throw new RangeError('Не вдалося розрахувати суму.');
  return Object.freeze({ dress: amount, extras, total });
}
