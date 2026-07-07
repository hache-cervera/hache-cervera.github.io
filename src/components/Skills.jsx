import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { useScene } from '../sceneContext';
import { DISCIPLINES } from '../data/skills';

function ToolBadge({ mark, name }) {
  return (
    <motion.li
      data-hover
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      className="flex items-center gap-3 rounded border border-ink py-2 pl-2 pr-4 font-display text-sm md:text-base"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-ink text-xs font-bold text-white">
        {mark}
      </span>
      {name}
    </motion.li>
  );
}

/**
 * Pinned discipline morph: scrolling through this section spins the chip
 * (scroll-scrubbed), lights one node per discipline and crossfades the
 * category panels while the background tint follows along.
 */
export default function Skills() {
  const rootRef = useRef(null);
  const scene = useScene();

  useLayoutEffect(() => {
    if (!scene) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const section = rootRef.current;
      const blocks = gsap.utils.toArray('[data-discipline]');
      const bgColors = DISCIPLINES.map((d) => d.bg);
      const lerpBg = gsap.utils.pipe(
        gsap.utils.clamp(0, 1),
        gsap.utils.interpolate(bgColors)
      );

      gsap.set(blocks, { autoAlpha: 0, y: 40 });
      gsap.set(blocks[0], { autoAlpha: 1, y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => '+=' + window.innerHeight * 4.8,
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            // chip: 3 turns across the section, one node lights per sixth
            scene.state.ryExtra = self.progress * Math.PI * 6;
            scene.state.activation = self.progress * 6;
            section.style.backgroundColor = lerpBg(self.progress);
            const fill = section.querySelector('[data-progress]');
            if (fill) fill.style.width = `${self.progress * 100}%`;
            const idx = section.querySelector('[data-index]');
            if (idx) idx.textContent = String(Math.min(5, Math.floor(self.progress * 6)) + 1).padStart(2, '0');
          },
        },
      });

      blocks.forEach((block, i) => {
        if (i > 0) tl.to(block, { autoAlpha: 1, y: 0, duration: 0.22 }, i);
        if (i < blocks.length - 1) tl.to(block, { autoAlpha: 0, y: -40, duration: 0.22 }, i + 0.78);
      });
      tl.to({}, { duration: 0.2 }, blocks.length - 0.2); // pad so the last discipline holds

      return () => {
        section.style.backgroundColor = '';
      };
    }, rootRef);

    return () => ctx.revert();
  }, [scene]);

  return (
    <section id="skills" ref={rootRef} className="relative h-screen overflow-hidden">
      <div className="relative z-20 mx-auto flex h-full w-full max-w-6xl flex-col justify-center px-6 md:px-12">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-accent">/ 02 · Stack</p>

        <div className="relative mt-6 h-[440px] md:h-[400px] md:max-w-[58%]">
          {DISCIPLINES.map((d) => (
            <div key={d.id} data-discipline className="absolute inset-0">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted">{d.node}</p>
              <h3 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] font-bold tracking-tightest">
                {d.label}
              </h3>
              {d.note && <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">{d.note}</p>}
              <ul className="mt-8 flex flex-wrap gap-3">
                {d.tools.map((t) => (
                  <ToolBadge key={t.name} {...t} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4" aria-hidden="true">
        <span data-index className="font-display text-xs text-muted">01</span>
        <span className="relative h-px w-40 bg-line">
          <span data-progress className="absolute left-0 top-0 h-full bg-accent" style={{ width: '0%' }} />
        </span>
        <span className="font-display text-xs text-muted">06</span>
      </div>
    </section>
  );
}
