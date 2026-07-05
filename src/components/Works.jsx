import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { WORKS } from '../data/skills';

/** Project card with 3D mouse tilt (Framer Motion springs). */
function TiltCard({ index, name, tags, copy, theme }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 180, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 180, damping: 20 });

  const cover =
    theme === 'accent'
      ? 'bg-gradient-to-br from-accent to-[#b52a00]'
      : 'bg-gradient-to-br from-ink to-[#2b2b2b]';

  return (
    <motion.article
      data-hover
      data-card
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => { mx.set(0.5); my.set(0.5); }}
      className="group flex flex-col overflow-hidden rounded border border-line bg-white transition-colors duration-300 hover:border-ink"
    >
      <div className={`relative flex h-72 items-end overflow-hidden p-6 md:h-80 ${cover}`}>
        <div className="circuit-grid absolute inset-0" aria-hidden="true" />
        <div
          className="absolute right-[-40px] top-[-40px] h-56 w-56 rounded-full bg-white/10 blur-3xl transition-transform duration-500 group-hover:scale-125"
          aria-hidden="true"
        />
        <span className="relative font-display text-6xl font-extrabold text-white/25 transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-110">
          {index}
        </span>
        <span className="absolute bottom-6 right-6 translate-y-3 rounded bg-white/15 px-4 py-2 font-display text-sm font-semibold text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {tags}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-6">
        <h3 className="font-display text-2xl font-bold">{name}</h3>
        <p className="text-sm leading-relaxed text-muted">{copy}</p>
      </div>
    </motion.article>
  );
}

export default function Works() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-heading]',
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '[data-heading]', start: 'top 85%' } }
      );
      gsap.utils.toArray('[data-card]').forEach((el, i) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0 0 100% 0)', y: 26 },
          {
            clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1, delay: i * 0.08, ease: 'power4.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          }
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="works" ref={rootRef} className="relative px-6 py-32 md:px-12 md:py-48">
      <div className="relative z-20 mx-auto w-full max-w-6xl">
        <div data-heading>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-accent">/ 03 — Works</p>
          <h2 className="mt-6 font-display text-[clamp(1.9rem,3.5vw,2.8rem)] font-bold tracking-tightest">
            I produced for brands such as
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {WORKS.map((w) => (
            <TiltCard key={w.name} {...w} />
          ))}
        </div>
      </div>
    </section>
  );
}
