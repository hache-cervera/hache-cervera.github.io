import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Words from './Words';

/** Floating network dots that repel from the cursor. */
function NodeField() {
  const fieldRef = useRef(null);

  useLayoutEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const field = fieldRef.current;
    const dots = [...field.children].map((el) => ({ el, x: 0, y: 0, tx: 0, ty: 0 }));
    const mouse = { x: -9999, y: -9999 };

    const onMove = (e) => {
      const r = field.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    window.addEventListener('mousemove', onMove);

    let raf;
    const loop = () => {
      for (const d of dots) {
        const r = d.el;
        const hx = r.offsetLeft, hy = r.offsetTop;
        const dx = hx + d.x - mouse.x;
        const dy = hy + d.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 150 && dist > 0) {
          const f = (150 - dist) / 150;
          d.tx = (dx / dist) * f * 46;
          d.ty = (dy / dist) * f * 46;
        } else {
          d.tx = 0; d.ty = 0;
        }
        d.x += (d.tx - d.x) * 0.09;
        d.y += (d.ty - d.y) * 0.09;
        r.style.transform = `translate(${d.x}px, ${d.y}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  const spots = [
    { l: '8%', t: '18%', s: 8 }, { l: '20%', t: '72%', s: 6 }, { l: '38%', t: '10%', s: 5 },
    { l: '55%', t: '85%', s: 7 }, { l: '72%', t: '14%', s: 6 }, { l: '86%', t: '62%', s: 9 },
    { l: '64%', t: '42%', s: 5 }, { l: '12%', t: '46%', s: 5 },
  ];
  return (
    <div ref={fieldRef} className="pointer-events-none absolute inset-0 z-0 hidden md:block" aria-hidden="true">
      {spots.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-accent/70 shadow-[0_0_12px_rgba(255,60,0,0.65)]"
          style={{ left: p.l, top: p.t, width: p.s, height: p.s }}
        />
      ))}
    </div>
  );
}

/** Magnetic CTA built on Framer Motion springs. */
function MagneticLink({ href, children }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 200, damping: 16 });
  const y = useSpring(my, { stiffness: 200, damping: 16 });

  return (
    <motion.a
      href={href}
      style={{ x, y }}
      whileTap={{ scale: 0.96 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left - r.width / 2) * 0.35);
        my.set((e.clientY - r.top - r.height / 2) * 0.35);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      className="group inline-flex items-center gap-2 rounded bg-ink px-8 py-4 font-display font-semibold text-white transition-colors duration-300 hover:bg-accent"
    >
      {children}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-y-0.5">
        <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.a>
  );
}

export default function Hero() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-line]',
        { yPercent: 110, opacity: 0, filter: 'blur(6px)' },
        { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out', stagger: 0.11, delay: 0.25 }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="hero" ref={rootRef} className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 py-24 md:px-12">
      <NodeField />

      <div className="relative z-20 mx-auto w-full max-w-6xl">
        <p className="overflow-hidden font-display text-sm font-semibold uppercase tracking-[0.08em] text-accent">
          <span data-line className="inline-block">/ Hache Cervera, Creative Technologist</span>
        </p>

        <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,6.5vw,5.4rem)] font-bold leading-[1.05] tracking-tightest">
          <span className="block overflow-hidden"><span data-line className="block"><Words>I don't make pretty things.</Words></span></span>
          <span className="block overflow-hidden"><span data-line className="block"><Words>I make things that work</Words></span></span>
          <span className="block overflow-hidden">
            <span data-line className="shimmer-text block pb-2">and happen to be pretty.</span>
          </span>
        </h1>

        <p className="mt-10 max-w-md text-lg leading-relaxed text-muted">
          <span className="block overflow-hidden"><span data-line className="block">Creative who builds.</span></span>
          <span className="block overflow-hidden"><span data-line className="block">I design. I develop. I optimise.</span></span>
          <span className="block overflow-hidden"><span data-line className="block">From identity to live projects, end to end.</span></span>
        </p>

        <div className="mt-12 overflow-hidden">
          <span data-line className="inline-block">
            <MagneticLink href="#skills">My stack</MagneticLink>
          </span>
        </div>
      </div>

      <div className="absolute bottom-8 left-6 z-20 flex flex-col items-center gap-2 md:left-12" aria-hidden="true">
        <span className="relative block h-10 w-px overflow-hidden bg-line">
          <span className="absolute left-0 top-0 h-full w-full animate-[cue_1.8s_ease-in-out_infinite] bg-accent" />
        </span>
        <p className="text-[11px] uppercase tracking-[0.12em] text-muted [writing-mode:vertical-rl]">Scroll</p>
      </div>
      <style>{'@keyframes cue { 0% { transform: translateY(-100%); } 60%,100% { transform: translateY(100%); } }'}</style>
    </section>
  );
}
