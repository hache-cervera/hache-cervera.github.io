import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/** Custom animated cursor: solid dot + trailing ring that grows on hoverables. */
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.body.classList.add('custom-cursor');

    const dot = dotRef.current;
    const ring = ringRef.current;
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight / 2 });

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

    const onMove = (e) => {
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    };
    window.addEventListener('mousemove', onMove);

    const grow = () => gsap.to(ring, { scale: 2.1, duration: 0.3, ease: 'power3.out' });
    const shrink = () => gsap.to(ring, { scale: 1, duration: 0.3, ease: 'power3.out' });
    const onOver = (e) => { if (e.target.closest('a, button, [data-hover]')) grow(); };
    const onOut = (e) => { if (e.target.closest('a, button, [data-hover]')) shrink(); };
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);

    return () => {
      document.body.classList.remove('custom-cursor');
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-50 hidden h-2 w-2 rounded-full bg-accent md:block"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-50 hidden h-8 w-8 rounded-full border border-ink/60 mix-blend-difference md:block"
      />
    </>
  );
}
