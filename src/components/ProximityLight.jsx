import { useEffect } from 'react';
import gsap from 'gsap';
import { useScene } from '../sceneContext';

/**
 * Every frame, project the chip's position to screen space and tint any .pw
 * word whose center falls inside the chip's radius. Keeps dark text readable
 * while the chip travels over it, and doubles as a scroll-reactive detail.
 */
export default function ProximityLight() {
  const scene = useScene();

  useEffect(() => {
    if (!scene) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const words = Array.from(document.querySelectorAll('.pw'));
    if (!words.length) return;

    const tick = () => {
      const { x, y, r } = scene.getScreenInfo();
      const reach = r + 30;
      // skip everything when the chip is off-screen
      if (y < -reach || y > window.innerHeight + reach) return;

      for (const el of words) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < y - reach || rect.top > y + reach) {
          el.classList.remove('is-lit');
          continue;
        }
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const inside = Math.hypot(cx - x, cy - y) < reach;
        el.classList.toggle('is-lit', inside);
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [scene]);

  return null;
}
