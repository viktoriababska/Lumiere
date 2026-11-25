/* LAB 10 — typing/erasing without libraries; accessible static equivalent. */
(() => {
  'use strict';
  const wrapper = document.querySelector('[data-typewriter]');
  const target = wrapper?.querySelector('[data-typewriter-text]');
  if (!target) return;

  const phrases = [
    'Кожна подія заслуговує на особливий образ',
    'Знайдіть сукню для свого моменту',
    'Ваш стиль. Ваш вибір. Ваш Lumiere.'
  ];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fullText = phrases[0];
  let timeoutId;
  let phraseIndex = 0;
  let index = 0;
  let deleting = false;

  const stop = () => { clearTimeout(timeoutId); };
  const schedule = (delay) => { timeoutId = window.setTimeout(tick, delay); };
  const tick = () => {
    if (document.hidden || reduceMotion.matches) return;
    const phrase = phrases[phraseIndex];
    if (!deleting) {
      index = Math.min(phrase.length, index + 1);
      target.textContent = phrase.slice(0, index);
      if (index === phrase.length) { deleting = true; schedule(1900); }
      else schedule(65);
    } else {
      index = Math.max(0, index - 1);
      target.textContent = phrase.slice(0, index);
      if (index === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; schedule(420); }
      else schedule(30);
    }
  };
  const start = () => {
    stop();
    if (reduceMotion.matches || document.hidden) {
      target.textContent = fullText;
      return;
    }
    phraseIndex = 0; index = 0; deleting = false;
    target.textContent = '';
    schedule(500);
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', start);
  start();
})();
