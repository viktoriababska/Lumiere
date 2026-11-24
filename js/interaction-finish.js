/* LUMIERE / tasteful micro-interactions — no fake controls or disruption of existing logic. */
(() => {
  'use strict';
  const ready = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    if (finePointer && !reduceMotion) {
      // Low-cost native CSS custom properties: no layout reflows or scroll handlers.
      document.querySelectorAll('.review-card').forEach(card => {
        card.addEventListener('pointermove', event => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--glow-x', `${Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100))}%`);
          card.style.setProperty('--glow-y', `${Math.max(0,Math.min(100,(event.clientY-rect.top)/rect.height*100))}%`);
        },{passive:true});
        card.addEventListener('pointerleave', () => {
          card.style.removeProperty('--glow-x');card.style.removeProperty('--glow-y');
        },{passive:true});
      });
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();
})();
