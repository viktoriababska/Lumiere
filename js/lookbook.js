/* Lab 10 · Vanilla JS plugin initialization. The page remains usable if a CDN is unavailable. */
(() => {
  'use strict';
  const ready = () => {
    const section = document.querySelector('.lookbook-section');
    if (!section) return;
    const slider = section.querySelector('.lumiere-swiper');
    const prev = section.querySelector('.lookbook-prev');
    const next = section.querySelector('.lookbook-next');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof window.Swiper === 'function') {
      new window.Swiper(slider, {
        loop: true,
        speed: reduceMotion ? 0 : 650,
        spaceBetween: 20,
        slidesPerView: 1,
        watchOverflow: true,
        autoplay: reduceMotion ? false : {
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        },
        navigation: { prevEl: prev, nextEl: next },
        pagination: {
          el: section.querySelector('.lumiere-pagination'),
          clickable: true
        },
        breakpoints: {
          320: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }
      });
    } else {
      // Progressive enhancement: native horizontal gallery still works offline.
      const wrapper = slider.querySelector('.swiper-wrapper');
      const move = direction => wrapper.scrollBy({
        left: direction * Math.max(240, wrapper.clientWidth * .8),
        behavior: reduceMotion ? 'instant' : 'smooth'
      });
      prev?.addEventListener('click', () => move(-1));
      next?.addEventListener('click', () => move(1));
      const slides = [...wrapper.querySelectorAll('.swiper-slide')];
      const pagination = section.querySelector('.lumiere-pagination');
      const dots = slides.map((slide, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'lumiere-fallback-dot';
        dot.setAttribute('aria-label', `Показати образ ${index + 1} із ${slides.length}`);
        dot.addEventListener('click', () => {
          wrapper.scrollTo({ left: slide.offsetLeft - slides[0].offsetLeft, behavior: reduceMotion ? 'instant' : 'smooth' });
        });
        pagination?.append(dot);
        return dot;
      });
      const sync = () => {
        if (!dots.length) return;
        const base = slides[0].offsetLeft;
        let active = 0;
        let closest = Infinity;
        slides.forEach((slide, index) => {
          const distance = Math.abs(slide.offsetLeft - base - wrapper.scrollLeft);
          if (distance < closest) { closest = distance; active = index; }
        });
        dots.forEach((dot, index) => {
          const chosen = index === active;
          dot.classList.toggle('is-active', chosen);
          dot.setAttribute('aria-current', chosen ? 'true' : 'false');
        });
      };
      wrapper.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      sync();
      section.classList.add('lookbook-fallback');
    }

    if (window.Fancybox && typeof window.Fancybox.bind === 'function') {
      window.Fancybox.bind('[data-fancybox="lumiere-gallery"]', {
        Carousel: { transition: 'fade' },
        Images: { Panzoom: { maxScale: 3 } }
      });
    } else {
      // Gallery links lead directly to a larger image if CDN is temporarily unavailable.
      section.querySelectorAll('[data-fancybox]').forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
  else ready();
})();
