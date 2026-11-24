/* Lumiere video banner — uses supplied MP4 files with the audio track removed.
   Autoplay is muted, playsinline and optional: photo background remains if blocked.
   Only the selected theme's video plays and downloads, to save resources. */
(() => {
  'use strict';
  const hero = document.querySelector('.hero-section .hero-media');
  if (!hero) return;

  const media = {
    light: hero.querySelector('video[data-hero-video="light"]'),
    dark: hero.querySelector('video[data-hero-video="dark"]')
  };
  if (!media.light || !media.dark) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true;
  let revision = 0;
  const isAllowed = () => !reducedMotion.matches && !document.hidden && visible;
  const chosenTheme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

  // Media query, page visibility and intersection all suspend background playback.
  const pauseAll = () => Object.values(media).forEach(video => video.pause());
  async function syncVideo() {
    const myRevision = ++revision;
    const selected = media[chosenTheme()];

    if (!isAllowed()) {
      pauseAll();
      Object.entries(media).forEach(([theme, video]) => {
        if (reducedMotion.matches || theme !== chosenTheme()) {
          video.classList.remove('is-active');
        }
      });
      return;
    }

    if (!selected.getAttribute('src')) {
      selected.src = selected.dataset.src;
      selected.load();
    }
    selected.muted = true;
    selected.defaultMuted = true;

    try {
      await selected.play();
    } catch (error) {
      // Autoplay restrictions, missing local file or codec: keep the still poster.
      if (myRevision === revision) {
        Object.values(media).forEach(video => {
          video.classList.remove('is-active');
          video.pause();
        });
      }
      return;
    }

    if (myRevision !== revision) {
      // IntersectionObserver and initial setup may start the SAME clip twice.
      // A stale promise must never pause the clip the newer call still needs.
      if (!isAllowed() || selected !== media[chosenTheme()]) selected.pause();
      return;
    }
    if (!isAllowed() || selected !== media[chosenTheme()]) {
      selected.pause();
      return;
    }

    selected.classList.add('is-active');
    Object.values(media).forEach(video => {
      if (video === selected) return;
      video.classList.remove('is-active');
      // Pause after crossfade, so the outgoing video does not continue offscreen.
      if (getComputedStyle(video).opacity === '0') {
        video.pause();
      } else {
        const stop = event => {
          if (event.propertyName === 'opacity' && !video.classList.contains('is-active')) {
            video.pause();
            video.removeEventListener('transitionend', stop);
          }
        };
        video.addEventListener('transitionend', stop);
      }
    });
  }

  document.addEventListener('lumiere:themechange', syncVideo);
  document.addEventListener('visibilitychange', syncVideo);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', syncVideo);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      syncVideo();
    }, { threshold: 0.04 });
    observer.observe(hero.closest('.hero-section'));
  }
  syncVideo();
})();
