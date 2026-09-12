import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import Words from './Words';
import { useLang } from '../i18n';

/* Inline stroke icons, 16px grid, currentColor. No emoji anywhere on the site. */
const ICONS = {
  role: 'M3 6h10v7H3zM6 6V4h4v2',
  based: 'M8 14s4.5-4 4.5-7A4.5 4.5 0 0 0 3.5 7c0 3 4.5 7 4.5 7zM8 7.8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  works: 'M4.2 4.2a5.4 5.4 0 0 0 0 7.6M11.8 4.2a5.4 5.4 0 0 1 0 7.6M6 6a2.8 2.8 0 0 0 0 4M10 6a2.8 2.8 0 0 1 0 4M8 8.2v.01',
  owns: 'M8 2.6 14 6l-6 3.4L2 6zM2 9.6l6 3.4 6-3.4',
  languages: 'M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM2.8 8h10.4M8 2.5c1.4 1.5 2.2 3.4 2.2 5.5S9.4 12 8 13.5C6.6 12 5.8 10.1 5.8 8S6.6 4 8 2.5z',
  certified: 'M8 2.5 9.7 6l3.8.5-2.8 2.6.7 3.8L8 11.1l-3.4 1.8.7-3.8L2.5 6.5 6.3 6z',
  server: 'M2.5 3.5h11v3.2h-11zM2.5 9.3h11v3.2h-11zM4.6 5.1v.01M4.6 10.9v.01',
  lora: 'M3 5h10M3 8h10M3 11h10M6 3.6v2.8M10.5 6.6v2.8M5 9.6v2.8',
  esp32: 'M5 5h6v6H5zM6.5 2.5v2.5M9.5 2.5v2.5M6.5 11v2.5M9.5 11v2.5M2.5 6.5H5M2.5 9.5H5M11 6.5h2.5M11 9.5h2.5',
};

function Icon({ name, className = '' }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
      className={className}
    >
      <path d={ICONS[name]} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FACT_ICONS = ['role', 'based', 'works', 'owns', 'languages', 'certified'];

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

      /* Reversed so the infrastructure layer lands first and the rest stack
         on top of it, which is the point the block is making. */
      const layers = gsap.utils.toArray('[data-layer]').reverse();
      if (layers.length) {
        gsap.fromTo(
          layers,
          { y: 26, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.13,
            scrollTrigger: { trigger: layers[0], start: 'top 90%' },
          }
        );
      }

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
      <div className="relative z-20 mx-auto grid w-full max-w-6xl items-start gap-14 md:grid-cols-[1.1fr_1fr] md:gap-24">
        {/* Sticky on desktop: a recruiter reading for twenty seconds gets the
            headline and the hard facts without scrolling past the story. */}
        <div className="md:sticky md:top-24">
          <div data-rise>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-accent">{t.about.label}</p>
            <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.12] tracking-tightest">
              <span className="block"><Words>{t.about.h2a}</Words></span>
              <span className="block"><Words>{t.about.h2b}</Words></span>
              <span className="block"><Words>{t.about.h2c}</Words></span>
            </h2>
          </div>

          <div data-rise className="mt-10 max-w-md">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              {t.about.factsLabel}
            </p>
            <dl className="mt-4 divide-y divide-line border border-line bg-page">
              {t.about.facts.map((f, i) => (
                <div key={f.k} className="px-5 py-3 sm:grid sm:grid-cols-[128px_1fr] sm:gap-4">
                  <dt className="flex items-center gap-2 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-muted sm:pt-0.5">
                    <Icon name={FACT_ICONS[i]} className="shrink-0 text-accent" />
                    {f.k}
                  </dt>
                  <dd className="mt-1 text-sm leading-snug sm:mt-0">{f.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted">{t.about.langsNote}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div data-rise className="flex flex-wrap gap-12 rounded bg-panel p-8 text-white">
            <Stat value={15} suffix="+" label={t.about.stat1} />
            <Stat value={4} suffix="" label={t.about.stat2} />
          </div>

          <p data-rise className="max-w-md text-lg leading-relaxed">
            <Words>{t.about.p1}</Words>
          </p>

          {/* The stack the way she describes it: search on top, the machine
              underneath. Revealed bottom up so the layers build, not fall. */}
          <div className="mt-2">
            <p data-rise className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              {t.about.layersLabel}
            </p>
            <ol className="mt-4 divide-y divide-line border border-line bg-page">
              {t.about.layers.map((l) => (
                <li key={l.n} data-layer className="group relative p-5">
                  <span className="absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100" />
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-xs font-bold text-accent">{l.n}</span>
                    <span className="font-display text-base font-bold transition-colors duration-300 group-hover:text-accent">
                      {l.name}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{l.line}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {l.tools.map((tool) => (
                      <li
                        key={tool}
                        className="border border-line px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.06em] text-muted"
                      >
                        {tool}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>

          <p data-rise className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted">
            {t.about.geoNote}
          </p>

          <div data-rise className="border border-line bg-page p-5">
            <p className="flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              <Icon name="server" />
              {t.about.labLabel}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.about.p4}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {[
                ['server', t.about.labKit[0]],
                ['lora', t.about.labKit[1]],
                ['esp32', t.about.labKit[2]],
              ].map(([icon, label]) => (
                <li
                  key={label}
                  className="flex items-center gap-2 border border-line px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.06em] text-muted"
                >
                  <Icon name={icon} className="shrink-0 text-accent" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <p data-rise className="border-t border-line pt-6 text-sm text-muted">
            {t.about.p3}
          </p>
        </div>
      </div>
    </section>
  );
}
