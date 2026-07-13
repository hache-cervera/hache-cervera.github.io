import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import Words from './Words';
import { useLang } from '../i18n';

function Stat({ value, suffix, label }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-display text-5xl font-extrabold leading-none">
        <span data-count={value}>0</span>
        <span className="text-accent">{suffix}</span>
      </span>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}

export default function About() {
  const rootRef = useRef(null);
  const { t } = useLang();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-rise]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 44, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        );
      });

      gsap.utils.toArray('[data-count]').forEach((el) => {
        gsap.fromTo(
          el,
          { innerText: 0 },
          {
            innerText: Number(el.dataset.count),
            duration: 1.6,
            ease: 'power2.out',
            snap: { innerText: 1 },
            scrollTrigger: { trigger: el, start: 'top 88%' },
          }
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={rootRef} className="relative px-6 py-32 md:px-12 md:py-48">
      <div className="relative z-20 mx-auto grid w-full max-w-6xl gap-14 md:grid-cols-[1.1fr_1fr] md:gap-24">
        <div data-rise>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-accent">{t.about.label}</p>
          <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.12] tracking-tightest">
            <span className="block"><Words>{t.about.h2a}</Words></span>
            <span className="block"><Words>{t.about.h2b}</Words></span>
            <span className="block"><Words>{t.about.h2c}</Words></span>
          </h2>
        </div>

        <div className="flex flex-col gap-6 self-center">
          <p data-rise className="max-w-md text-lg leading-relaxed">
            <Words>{t.about.p1}</Words>
          </p>
          <p data-rise className="text-muted">{t.about.p2}</p>

          <div data-rise className="mt-4 flex flex-wrap gap-12 rounded bg-panel p-8 text-white">
            <Stat value={10} suffix="+" label={t.about.stat1} />
            <Stat value={300} suffix="+" label={t.about.stat2} />
          </div>
          <p data-rise className="text-sm text-muted">
            {t.about.p3}
          </p>
        </div>
      </div>
    </section>
  );
}
