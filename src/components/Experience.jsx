import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { EXPERIENCE } from '../data/content';
import Words from './Words';

export default function Experience() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-heading]',
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '[data-heading]', start: 'top 85%' } }
      );
      gsap.utils.toArray('[data-entry]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }
        );
      });
      gsap.fromTo(
        '[data-spine]',
        { scaleY: 0 },
        {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: rootRef.current, start: 'top 70%', end: 'bottom 60%', scrub: 0.5 },
        }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" ref={rootRef} className="relative px-6 py-32 md:px-12 md:py-48">
      <div className="relative z-20 mx-auto w-full max-w-6xl">
        <div data-heading>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-accent">/ 04 · Experience</p>
          <h2 className="mt-6 font-display text-[clamp(1.9rem,3.5vw,2.8rem)] font-bold tracking-tightest">
            <Words>Where I've been building</Words>
          </h2>
        </div>

        <div className="relative mt-16 md:mt-20">
          {/* timeline spine */}
          <span
            data-spine
            className="absolute left-0 top-0 h-full w-px origin-top bg-accent md:left-[220px]"
            aria-hidden="true"
          />

          <ol className="flex flex-col gap-16 md:gap-20">
            {EXPERIENCE.map((job) => (
              <li key={job.company} data-entry className="relative grid gap-4 pl-8 md:grid-cols-[220px_1fr] md:gap-0 md:pl-0">
                <span
                  className="absolute left-[-5px] top-2 h-[11px] w-[11px] rounded-full bg-accent md:left-[215px]"
                  aria-hidden="true"
                />
                <div className="md:pr-12">
                  <p className="font-display text-sm font-semibold text-accent">{job.dates}</p>
                  <p className="mt-1 text-sm text-muted">{job.place}</p>
                </div>
                <div className="md:pl-12">
                  <h3 className="font-display text-2xl font-bold tracking-tightest">
                    <Words>{job.role}</Words>
                  </h3>
                  <p className="mt-1 font-display font-semibold text-muted">{job.company}</p>
                  <ul className="mt-5 flex max-w-2xl flex-col gap-2.5">
                    {job.points.map((p, i) => (
                      <li key={i} className="relative pl-5 text-sm leading-relaxed text-muted">
                        <span className="absolute left-0 top-[7px] h-1.5 w-1.5 rounded-full bg-accent/60" aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
