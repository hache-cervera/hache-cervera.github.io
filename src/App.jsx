import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import ChipScene from './three/ChipScene';
import { SceneContext, useScene } from './sceneContext';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Works from './components/Works';
import Experience from './components/Experience';
import Reveal from './components/Reveal';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import ProximityLight from './components/ProximityLight';

gsap.registerPlugin(ScrollTrigger);

/**
 * Cross-section choreography: the chip travels, rotates and scales as the
 * page scrolls. Each pose tween is scrubbed against the next section's
 * approach; the pinned interiors of Skills and Reveal own their own scrubs.
 */
function Director() {
  const scene = useScene();

  useLayoutEffect(() => {
    if (!scene) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Object.assign(scene.state, { x: 0, y: 0, scale: 0.9, activation: 5, spin: 0.05 });
      return;
    }

    const mm = gsap.matchMedia();
    mm.add(
      { isDesktop: '(min-width: 900px)', isMobile: '(max-width: 899px)' },
      (ctx) => {
        const { isDesktop } = ctx.conditions;

        const pose = (vals, trigger) =>
          gsap.to(scene.state, {
            ...vals,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger, start: 'top bottom', end: 'top top', scrub: 0.6 },
          });

        gsap.set(
          scene.state,
          isDesktop
            ? { x: 2.3, y: -0.1, rx: 0.5, ry: -0.55, scale: 1.05, activation: 0.4 }
            : { x: 0, y: 1.6, rx: 0.55, ry: -0.4, scale: 0.6, activation: 0.4 }
        );

        pose(isDesktop ? { x: -2.7, y: 0.2, rx: 0.7, ry: 2.4, scale: 0.8 } : { y: 2.1, scale: 0.42 }, '#about');
        pose(isDesktop ? { x: 1.9, y: 0, rx: 0.5, ry: 4.2, scale: 1.12 } : { x: 0, y: 1.35, ry: 4.2, scale: 0.58 }, '#skills');
        pose(isDesktop ? { x: 0, y: 2.7, rx: 0.4, scale: 0.45 } : { y: 2.6, scale: 0.38 }, '#works');
        pose(isDesktop ? { x: -3.1, y: -0.4, rx: 0.55, scale: 0.6 } : { y: 2.4, scale: 0.4 }, '#experience');
        pose({ x: 0, y: 0, rx: 0.85, scale: isDesktop ? 1.45 : 0.95 }, '#reveal');
        pose({ x: 0, y: -0.15, rx: 0.5, scale: 0.7, spin: 0.22 }, '#contact');
      }
    );

    return () => mm.revert();
  }, [scene]);

  return null;
}

export default function App() {
  const canvasRef = useRef(null);
  const [scene, setScene] = useState(null);

  useLayoutEffect(() => {
    const chipScene = new ChipScene(canvasRef.current);
    setScene(chipScene);
    window.__chip = chipScene; // debug handle (pause/resume, state inspection)

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onMove = (e) =>
      chipScene.setMouse(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    const onResize = () => chipScene.resize();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', onResize);

    // anchor links ride the smooth scroll
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.3 });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      gsap.ticker.remove(tick);
      lenis.destroy();
      chipScene.dispose();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <SceneContext.Provider value={scene}>
      {/* The chip floats above section backgrounds (z-0) and below content (z-20) */}
      <canvas ref={canvasRef} className="fixed inset-0 z-10 h-full w-full pointer-events-none" />
      <div className="grain" aria-hidden="true" />
      {scene && (
        <main className="relative">
          <Hero />
          <About />
          <Skills />
          <Works />
          <Experience />
          <Reveal />
          <Contact />
          <Footer />
          <Director />
          <ProximityLight />
          <BackToTop />
        </main>
      )}
    </SceneContext.Provider>
  );
}
