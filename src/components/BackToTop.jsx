import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toTop = () => {
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.3 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="btt"
          onClick={toTop}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 16, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.85 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 12V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
