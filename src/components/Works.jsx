import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { LOGOS } from '../data/skills';
import Words from './Words';

/**
 * Clean logo wall: no cards, no copy. Logos sit greyscale and come to full
 * color when hovered. White logo backgrounds blend away via multiply.
 */
export default function Works() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-heading]',
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '[data-heading]', start: 'top 85%' } }
      );
      gsap.fromTo(
        '[data-logo]',
        { y: 36, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: '[data-logos]', start: 'top 85%' },
        }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="works" ref={rootRef} className="relative px-6 py-32 md:px-12 md:py-44">
      <div className="relative z-20 mx-auto w-full max-w-6xl">
        <div data-heading>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-accent">/ 03 · Works</p>
          <h2 className="mt-6 font-display text-[clamp(1.9rem,3.5vw,2.8rem)] font-bold tracking-tightest">
            <Words>I produced for brands such as</Words>
          </h2>
        </div>

        <div
          data-logos
          className="mt-16 flex flex-wrap items-center justify-center gap-x-20 gap-y-14 md:mt-24 md:gap-x-28"
        >
          {LOGOS.map((logo) => (
            <motion.img
              key={logo.alt}
              data-logo
              src={logo.src}
              alt={logo.alt}
              whileHover={{ scale: 1.06, y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="h-12 w-auto object-contain mix-blend-multiply grayscale opacity-60 transition-[filter,opacity] duration-500 hover:grayscale-0 hover:opacity-100 md:h-16"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
