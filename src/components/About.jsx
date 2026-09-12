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

          {/* The stack the way she describes it: search on top, the machine
              underneath. Revealed bottom up so the layers build, not fall. */}
          <div className="mt-2">
            <p data-rise className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              {t.about.layersLabel}
            </p>
            <ol className="mt-4 divide-y divide-line border border-line">
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

          <div data-rise className="mt-4 flex flex-wrap gap-12 rounded bg-panel p-8 text-white">
            <Stat value={15} suffix="+" label={t.about.stat1} />
            <Stat value={4} suffix="" label={t.about.stat2} />
          </div>
          <p data-rise className="text-sm text-muted">
            {t.about.p3}
          </p>

          <div data-rise className="border border-line p-5">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              {t.about.labLabel}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.about.p4}</p>
          </div>

          {/* Certifications and languages: cheap, verifiable signal that the CV
              carries and the site was missing. */}
          <div data-rise className="mt-2 grid gap-8 border-t border-line pt-6 sm:grid-cols-2">
            <div>
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                {t.about.certsLabel}
              </p>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                {t.about.certs.map((c) => (
                  <li key={c.name} className="flex gap-3">
                    <span className="font-display font-semibold text-accent">{c.year}</span>
                    <span>{c.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                {t.about.langsLabel}
              </p>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                {t.about.langs.map((l) => (
                  <li key={l.name} className="flex flex-wrap gap-x-2">
                    <span className="font-display font-semibold">{l.name}</span>
                    <span className="text-muted">{l.level}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-muted">{t.about.langsNote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
