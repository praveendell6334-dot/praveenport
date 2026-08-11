'use strict';

const initNavToggle = () => {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLAnchorElement) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
};

const initScrollSpy = () => {
  const links = Array.from(document.querySelectorAll('.nav-menu a'));
  const sections = links
    .map((link) => {
      const id = link.getAttribute('href')?.slice(1);
      return id ? document.getElementById(id) : null;
    })
    .filter((el) => el !== null);

  if (sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const link = links.find((l) => l.getAttribute('href') === `#${id}`);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((l) => l.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
};

const initRevealOnScroll = () => {
  const items = document.querySelectorAll('[data-animate]');
  if (items.length === 0) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => observer.observe(item));
};

const initBackToTop = () => {
  const button = document.getElementById('backToTop');
  if (!button) return;

  const toggleVisibility = () => {
    button.classList.toggle('visible', window.scrollY > 480);
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

const initFooterYear = () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
};

const initHeaderShrink = () => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastState = false;
  const onScroll = () => {
    const shouldShrink = window.scrollY > 20;
    if (shouldShrink !== lastState) {
      header.style.boxShadow = shouldShrink
        ? '0 10px 30px -20px rgba(57,255,106,0.4)'
        : 'none';
      lastState = shouldShrink;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};

document.addEventListener('DOMContentLoaded', () => {
  try {
    initNavToggle();
    initScrollSpy();
    initRevealOnScroll();
    initBackToTop();
    initFooterYear();
    initHeaderShrink();
  } catch (error) {
    console.error('Portfolio init failed:', error);
  }
});
