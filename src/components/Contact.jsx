import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

function BigLink({ href, children, external }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener' } : {})}
      className="group relative inline-flex items-center gap-3 pb-1 font-display text-[clamp(1.4rem,3.5vw,2.8rem)] font-bold text-white"
    >
      {children}
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true"
        className="text-white/60 transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-100" />
    </a>
  );
}

export default function Contact() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-rise]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 44, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" ref={rootRef} className="relative overflow-hidden px-6 py-32 text-center md:px-12 md:py-48">
      {/* dark backdrop under the chip canvas */}
      <div className="absolute inset-0 z-0 bg-ink" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[110px]" />
      </div>

      <div className="relative z-20 mx-auto flex w-full max-w-4xl flex-col items-center gap-4">
        <p data-rise className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-accent">
          / 04 — Contact
        </p>
        <h2 data-rise className="font-display text-[clamp(2.4rem,5vw,4rem)] font-bold tracking-tightest text-white">
          Let's talk.
        </h2>
        <p data-rise className="text-white/50">No forms. Just write to me.</p>

        <div data-rise className="mt-10 flex flex-col items-center gap-6">
          <BigLink href="mailto:hi.hache.cervera@gmail.com">hi.hache.cervera@gmail.com</BigLink>
          <BigLink href="https://linkedin.com/in/hache-cervera" external>LinkedIn</BigLink>
        </div>
      </div>
    </section>
  );
}
