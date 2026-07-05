import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

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
          <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-accent">/ 01 — About</p>
          <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.12] tracking-tightest">
            I'm Hache.<br />
            Developer, builder,<br />
            creative technologist.
          </h2>
        </div>

        <div className="flex flex-col gap-6 self-center">
          <p data-rise className="max-w-md text-lg leading-relaxed">
            I work at the intersection of design and technology — crafting brands, building
            websites, and making things that look good and actually work.
          </p>
          <p data-rise className="text-muted">Valencia-based. Building things worth building.</p>

          <div data-rise className="mt-4 flex flex-wrap gap-12 rounded bg-ink p-8 text-white">
            <Stat value={10} suffix="+" label="Websites delivered" />
            <Stat value={300} suffix="+" label="Digital assets produced" />
          </div>
          <p data-rise className="text-sm text-muted">
            Wide range of clients and industries — incl. Cofidis &amp; Benimar.
          </p>
        </div>
      </div>
    </section>
  );
}
