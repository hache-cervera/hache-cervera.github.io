import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useScene } from '../sceneContext';
import Words from './Words';

/**
 * Mid-scroll reveal: a framed dark panel grows to full-bleed while the chip
 * (rendered live on the global canvas floating above the panel) scales up and
 * fires its activation pulse. Headline halves sit above and below the frame
 * and drift apart so they never collide with the "footage".
 */
export default function Reveal() {
  const rootRef = useRef(null);
  const scene = useScene();

  useLayoutEffect(() => {
    if (!scene) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: () => '+=' + window.innerHeight * 1.8,
          pin: true,
          scrub: 0.6,
        },
      });

      tl.fromTo(
        '[data-panel]',
        { clipPath: 'inset(24% 14% 24% 14% round 20px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.55, ease: 'none' },
        0
      )
        .to('[data-head-top]', { y: -110, opacity: 0, duration: 0.4, ease: 'none' }, 0.18)
        .to('[data-head-bottom]', { y: 110, opacity: 0, duration: 0.4, ease: 'none' }, 0.18)
        .to(scene.state, { scale: '+=0.6', duration: 1, ease: 'none' }, 0)
        .to(scene.state, { pulse: 1, duration: 0.45, ease: 'none' }, 0.5)
        .fromTo('[data-caption]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.25 }, 0.62);
    }, rootRef);

    return () => ctx.revert();
  }, [scene]);

  return (
    <section id="reveal" ref={rootRef} className="relative h-screen overflow-hidden">
      {/* dark panel that grows to full-bleed (z-0: the chip canvas floats above it) */}
      <div
        data-panel
        className="absolute inset-0 z-0 bg-ink"
        style={{ clipPath: 'inset(24% 14% 24% 14% round 20px)' }}
      >
        <div className="circuit-grid absolute inset-0" aria-hidden="true" />
        <div
          className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[100px]"
          aria-hidden="true"
        />
      </div>

      <div className="pointer-events-none relative z-20 flex h-full flex-col items-center justify-between px-6 py-16 md:px-12">
        <h2 data-head-top className="text-center font-display text-[clamp(1.8rem,4.5vw,3.6rem)] font-bold tracking-tightest">
          <Words>Everything connects.</Words>
        </h2>
        <p data-head-bottom className="text-center font-display text-lg font-semibold text-muted md:text-2xl">
          Design <span className="text-accent">→</span> Code <span className="text-accent">→</span> Motion{' '}
          <span className="text-accent">→</span> SEO. One loop, end to end.
        </p>
      </div>

      <p
        data-caption
        className="absolute bottom-10 left-6 z-20 max-w-xs font-display text-sm text-white/70 md:left-12"
      >
        Live render: this chip runs in your browser.{' '}
        <span className="text-accent">No video, just code.</span>
      </p>
    </section>
  );
}
