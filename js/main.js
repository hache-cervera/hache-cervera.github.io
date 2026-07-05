gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/* ---------- Lenis smooth scroll ---------- */
const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { duration: 1.2 });
  });
});

/* ---------- Hero line reveal on load ---------- */
window.addEventListener('DOMContentLoaded', () => {
  gsap.fromTo('[data-reveal]',
    { y: 32, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.2 }
  );
});

/* ---------- Scroll-triggered fade-up ---------- */
gsap.utils.toArray('.reveal-up').forEach((el) => {
  gsap.fromTo(el,
    { y: 40, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    }
  );
});

/* ---------- Skills fullscreen slider ---------- */
(() => {
  const section = document.querySelector('.skills-slider');
  const track = document.querySelector('.skills-track');
  const slides = gsap.utils.toArray('.skill-slide');
  const fill = document.querySelector('.skills-progress-fill');
  if (!section || !slides.length) return;

  const peek = window.innerWidth <= 900 ? 72 : 96;
  document.documentElement.style.setProperty('--peek', peek + 'px');

  const bgFrom = { r: 255, g: 255, b: 255 };
  const bgTo = { r: 255, g: 232, b: 225 };

  const layout = () => {
    const step = window.innerHeight - peek;
    slides.forEach((slide, i) => gsap.set(slide, { y: i * step }));
    return step;
  };

  let step = layout();

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => '+=' + (step * (slides.length - 1) + peek),
    pin: true,
    scrub: 0.6,
    onUpdate: (self) => {
      const progress = self.progress;
      gsap.set(track, { y: -progress * step * (slides.length - 1) });

      const r = Math.round(bgFrom.r + (bgTo.r - bgFrom.r) * progress);
      const g = Math.round(bgFrom.g + (bgTo.g - bgFrom.g) * progress);
      const b = Math.round(bgFrom.b + (bgTo.b - bgFrom.b) * progress);
      section.style.background = `rgb(${r}, ${g}, ${b})`;

      if (fill) fill.style.width = (progress * 100) + '%';
    }
  });

  let lastWidth = window.innerWidth;
  let resizeTimer;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      step = layout();
      ScrollTrigger.refresh();
    }, 200);
  });
})();

/* ---------- Portfolio card mouse tilt ---------- */
document.querySelectorAll('[data-tilt]').forEach((card) => {
  const media = card.querySelector('.portfolio-media');
  if (!media) return;

  const quickX = gsap.quickTo(media, 'rotationY', { duration: 0.5, ease: 'power3.out' });
  const quickY = gsap.quickTo(media, 'rotationX', { duration: 0.5, ease: 'power3.out' });

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    quickX(x * 10);
    quickY(-y * 10);
  });

  card.addEventListener('mouseleave', () => {
    quickX(0);
    quickY(0);
  });
});

/* ---------- Back to top ---------- */
(() => {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
  });

  btn.addEventListener('click', () => {
    lenis.scrollTo(0, { duration: 1.2 });
  });
})();

/* ---------- Statement word reveal ---------- */
(() => {
  const section = document.querySelector('.statement');
  const text = document.querySelector('.statement-text');
  if (!section || !text) return;

  const words = text.textContent.trim().split(/\s+/)
    .map((w) => `<span class="word">${w}</span>`)
    .join(' ');
  text.innerHTML = words;
  const wordEls = text.querySelectorAll('.word');

  gsap.to(wordEls, {
    color: '#0a0a0a',
    stagger: 0.5,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => '+=' + (wordEls.length * 40 + window.innerHeight),
      scrub: 0.5,
      pin: true
    }
  });
})();

/* ---------- Custom cursor (fine pointers only) ---------- */
(() => {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const cursor = document.querySelector('.cursor');
  if (!cursor) return;
  document.body.classList.add('has-custom-cursor');

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  gsap.set(cursor, { x: pos.x, y: pos.y });
  const quickX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
  const quickY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });

  window.addEventListener('mousemove', (e) => {
    quickX(e.clientX);
    quickY(e.clientY);
  });

  document.querySelectorAll('a, button, [data-tilt]').forEach((el) => {
    el.addEventListener('mouseenter', () => gsap.to(cursor, { width: 56, height: 56, duration: 0.3, ease: 'power3.out' }));
    el.addEventListener('mouseleave', () => gsap.to(cursor, { width: 24, height: 24, duration: 0.3, ease: 'power3.out' }));
  });
})();

/* ---------- Hero mouse-reactive glow ---------- */
(() => {
  const hero = document.querySelector('.hero');
  const glow = document.querySelector('.hero-glow');
  if (!hero || !glow) return;

  const quickX = gsap.quickTo(hero, '--glow-x', { duration: 0.6, ease: 'power3.out' });
  const quickY = gsap.quickTo(hero, '--glow-y', { duration: 0.6, ease: 'power3.out' });

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    quickX(((e.clientX - rect.left) / rect.width) * 100 + '%');
    quickY(((e.clientY - rect.top) / rect.height) * 100 + '%');
  });
})();

/* ---------- Magnetic buttons ---------- */
document.querySelectorAll('[data-magnetic]').forEach((el) => {
  const quickX = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
  const quickY = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    quickX((e.clientX - rect.left - rect.width / 2) * 0.3);
    quickY((e.clientY - rect.top - rect.height / 2) * 0.3);
  });

  el.addEventListener('mouseleave', () => {
    quickX(0);
    quickY(0);
  });
});
