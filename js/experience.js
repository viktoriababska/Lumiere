/* Progressive enhancement across every page. Never replaces the existing app.js handlers. */
(() => {
  'use strict';
  function init() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Highlight the current page and the visible Contacts section on the homepage.
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const links = [...document.querySelectorAll('.main-nav .nav-link')];
    const updateNav = (contactsVisible = false) => {
      links.forEach(link => {
        const url = new URL(link.href, window.location.href);
        const target = url.pathname.split('/').pop() || 'index.html';
        const isContact = url.hash === '#feedback';
        const active = isContact
          ? (path === 'index.html' && contactsVisible)
          : (target === path && !(path === 'index.html' && contactsVisible));
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', isContact ? 'location' : 'page');
        else link.removeAttribute('aria-current');
      });
    };
    updateNav(path === 'index.html' && location.hash === '#feedback');
    // Keep the mobile menu's ARIA state and icon synchronized after link clicks.
    links.forEach(link => link.addEventListener('click', () => {
      const toggle = document.querySelector('.mobile-menu-toggle');
      if (!toggle) return;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Відкрити меню');
      toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    }));
    const feedback = document.getElementById('feedback');
    if (feedback && 'IntersectionObserver' in window) {
      const navObserver = new IntersectionObserver(entries => {
        updateNav(entries.some(entry => entry.isIntersecting));
      }, { rootMargin: '-30% 0px -50% 0px', threshold: 0 });
      navObserver.observe(feedback);
    }

    // Do not pre-hide elements in CSS; content stays visible if JS/IntersectionObserver fails.
    const revealTargets = document.querySelectorAll(
      '.section-title-center, .catalog-header, .feature-card, .review-card, ' +
      '.lookbook-heading, .outfit-intro, .outfit-form, .feedback-intro, ' +
      '.feedback-panel, .about-cta, .story-section, .materials-section, .media-card, ' +
      '.about-faq-intro, .about-faq-questions, .about-confidence-points article, .care-points article, .value-card, ' +
      '.about-confidence-intro h2, .about-confidence-intro > p, ' +
      '.story-grid h2, .story-grid p, .care-grid h2, .care-grid p'
    );
    if (!reduceMotion && 'IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: .09, rootMargin: '0px 0px -25px 0px' });
      revealTargets.forEach((element, i) => {
        element.classList.add('will-reveal');
        element.style.setProperty('--reveal-delay', `${Math.min(i % 4, 3) * 75}ms`);
        revealObserver.observe(element);
      });
    }

    // HOME: a graceful character-by-character editorial title. The accessible H1
    // retains its complete aria-label; motion is omitted on reduced-motion devices.
    const hero=document.querySelector('.hero-script');
    if(hero && !reduceMotion){
      let delay=0;
      hero.querySelectorAll('.hero-line > span').forEach(line=>{
        const phrase=line.textContent;
        line.textContent='';line.setAttribute('aria-hidden','true');
        for(const [index,word] of phrase.split(' ').entries()){
          if(index)line.append(document.createTextNode(' '));
          const box=document.createElement('span');box.className='hero-word';
          for(const char of word){
            const letter=document.createElement('span');letter.className='hero-char';
            letter.textContent=char;letter.style.setProperty('--char-delay',`${Math.min(delay*34,1450)}ms`);
            box.append(letter);delay++;
          }
          line.append(box);
        }
      });
      hero.classList.add('is-letter-animated');
    }

    // ABOUT: line-by-line, character-by-character entrance, matching the homepage.
    // The heading retains its exact text for screen readers via aria-label.
    const aboutTitle = document.querySelector('.about-hero-copy h1');
    if (aboutTitle && !reduceMotion) {
      const lines = aboutTitle.innerHTML.split(/<br\s*\/?\s*>/i).map(line => {
        const temp = document.createElement('span'); temp.innerHTML = line;
        return temp.textContent.trim();
      }).filter(Boolean);
      if (lines.length) {
        aboutTitle.setAttribute('aria-label', lines.join(' '));
        aboutTitle.replaceChildren();
        let charIndex = 0;
        lines.forEach(text => {
          const row = document.createElement('span'); row.className = 'about-title-line';
          row.setAttribute('aria-hidden', 'true');
          text.split(' ').forEach((word, wordIndex) => {
            if (wordIndex) row.append(document.createTextNode(' '));
            const group = document.createElement('span'); group.className = 'about-title-word';
            for (const symbol of word) {
              const letter = document.createElement('span');letter.className = 'about-title-letter';
              letter.textContent = symbol;
              letter.style.setProperty('--letter-delay', `${Math.min(charIndex * 38, 1150)}ms`);
              group.append(letter); charIndex++;
            }
            row.append(group);
          });
          aboutTitle.append(row);
        });
        aboutTitle.classList.add('is-type-animated');
      }
    }

    // HOME: editorial feature tiles, no redundant controls or floating detail panel.
    document.querySelectorAll('.feature-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--pointer-x', `${(event.clientX - bounds.left) / bounds.width * 100}%`);
        card.style.setProperty('--pointer-y', `${(event.clientY - bounds.top) / bounds.height * 100}%`);
      }, {passive:true});
    });

    // HOME: a genuine horizontal 9-review carousel with animated track,
    // responsive grouping, accessible controls, touch swipe and unobtrusive autoplay until the visitor interacts.
    const reviewGrid = document.getElementById('reviews-grid');
    const reviewCards = reviewGrid ? [...reviewGrid.querySelectorAll('.review-card')] : [];
    const progress = document.querySelector('.review-progress');
    if (reviewGrid && reviewCards.length && progress) {
      const viewport = document.createElement('div');
      viewport.className = 'reviews-viewport';
      viewport.setAttribute('aria-label', 'Карусель відгуків Lumiere');
      reviewGrid.parentNode.insertBefore(viewport, reviewGrid);
      viewport.appendChild(reviewGrid);
      reviewGrid.classList.remove('is-enhanced');
      reviewGrid.classList.add('is-smooth-carousel');
      let reviewPage = 0, perPage = 0, pages = [], timer = null, userStopped = false;
      let inViewport = false;
      const visibleCount = () => window.innerWidth <= 760 ? 1 : window.innerWidth <= 1020 ? 2 : 3;
      const pause = () => { if (timer !== null) clearInterval(timer); timer = null; };
      const allowed = () => !userStopped && inViewport && !reduceMotion && !document.hidden &&
        !viewport.matches(':hover') && !viewport.matches(':focus-within') &&
        !document.querySelector('.review-toolbar .review-dot:focus, .review-toolbar .review-arrow:focus') &&
        !document.querySelector('.review-toolbar .review-dot:focus-visible, .review-toolbar .review-arrow:focus-visible');
      const play = () => {
        if (timer === null && allowed()) {
          timer = window.setInterval(() => {
            if (!allowed()) { pause(); return; }
            showPage(reviewPage + 1);
          }, 8000);
        }
      };
      // Any manual navigation permanently ends autoplay for this visit.
      const stopForUser = () => { userStopped = true; pause(); };
      function updateControls() {
        progress.replaceChildren();
        pages.forEach((_,i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'review-dot' + (i === reviewPage ? ' is-active' : '');
          dot.setAttribute('aria-label', `Сторінка відгуків ${i + 1} із ${pages.length}`);
          dot.setAttribute('aria-pressed', String(i === reviewPage));
          dot.innerHTML = '<span aria-hidden="true"></span>';
          dot.addEventListener('click', () => { stopForUser(); showPage(i); });
          progress.append(dot);
        });
        const counter = document.getElementById('review-counter');
        const start = reviewPage * perPage, end = Math.min(start + perPage, reviewCards.length);
        if (counter) counter.textContent = `${String(start + 1).padStart(2,'0')}–${String(end).padStart(2,'0')} / ${String(reviewCards.length).padStart(2,'0')}`;
      }
      function showPage(value) {
        reviewPage = ((value % pages.length) + pages.length) % pages.length;
        reviewGrid.style.transform = `translate3d(-${reviewPage * 100}%,0,0)`;
        pages.forEach((page, i) => {
          page.setAttribute('aria-hidden', String(i !== reviewPage));
          page.inert = i !== reviewPage;
        });
        updateControls();
      }
      function buildPages(keepIndex = 0) {
        const count = visibleCount();
        perPage = count;
        const fragment = document.createDocumentFragment();
        pages = [];
        for (let i = 0; i < reviewCards.length; i += count) {
          const page = document.createElement('div');
          page.className = 'review-page';
          for (let j = i; j < Math.min(i + count, reviewCards.length); j++) {
            reviewCards[j].classList.remove('is-review-current','is-review-visible','will-reveal');
            reviewCards[j].style.removeProperty('--reveal-delay');
            page.appendChild(reviewCards[j]);
          }
          pages.push(page);
          fragment.appendChild(page);
        }
        reviewGrid.style.transition = 'none';
        reviewGrid.replaceChildren(fragment);
        showPage(Math.min(Math.floor(keepIndex / count), pages.length - 1));
        // Re-enable only after the browser has painted the regrouped pages.
        requestAnimationFrame(() => requestAnimationFrame(() => reviewGrid.style.removeProperty('transition')));
      }
      buildPages();
      document.querySelector('.review-prev')?.addEventListener('click', () => { stopForUser(); showPage(reviewPage - 1); });
      document.querySelector('.review-next')?.addEventListener('click', () => { stopForUser(); showPage(reviewPage + 1); });
      viewport.addEventListener('mouseenter', pause);
      viewport.addEventListener('mouseleave', play);
      viewport.addEventListener('focusin', pause);
      viewport.addEventListener('focusout', e => { if (!viewport.contains(e.relatedTarget)) play(); });
      const toolbar = document.querySelector('.review-toolbar');
      toolbar?.addEventListener('focusin', pause);
      toolbar?.addEventListener('focusout', e => { if (!toolbar.contains(e.relatedTarget)) play(); });
      document.addEventListener('visibilitychange', () => document.hidden ? pause() : play());
      let initialX = null;
      viewport.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') initialX = e.clientX; }, { passive: true });
      viewport.addEventListener('pointerup', e => {
        if (initialX === null) return;
        const delta = e.clientX - initialX;
        initialX = null;
        if (Math.abs(delta) > 40) { stopForUser(); showPage(reviewPage + (delta < 0 ? 1 : -1)); }
      }, { passive: true });
      let lastCount = perPage;
      window.addEventListener('resize', () => {
        const updatedCount = visibleCount();
        if (updatedCount !== lastCount) {
          const firstVisibleIndex = reviewPage * lastCount;
          lastCount = updatedCount;
          buildPages(firstVisibleIndex);
        }
      }, { passive: true });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
          inViewport = Boolean(entries[0]?.isIntersecting);
          inViewport ? play() : pause();
        }, { threshold: .18 }).observe(viewport);
      }
    }

    // ABOUT: exclusive and native accessible accordion; gently closes previous question.
    const faqs=[...document.querySelectorAll('.about-faq-item')];
    faqs.forEach(item=>item.addEventListener('toggle',()=>{
      if(!item.open)return;
      faqs.forEach(other=>{if(other!==item && other.open)other.open=false;});
    }));

    // A subtle press response is applied only to existing interactive controls.
    document.addEventListener('pointerdown', event => {
      const control = event.target.closest('button, .btn, .interactive-icon');
      if (!control || control.disabled || reduceMotion) return;
      control.classList.add('lumiere-pressed');
      const release = () => control.classList.remove('lumiere-pressed');
      control.addEventListener('pointerup', release, { once: true });
      control.addEventListener('pointercancel', release, { once: true });
      window.setTimeout(release, 450);
    }, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
