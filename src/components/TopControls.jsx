import { useEffect, useState } from 'react';
import { useLang } from '../i18n';

/* Floating controls, top right: a plain EN/ES switch and the eclipse theme
   button (an orange sun that slides into a crescent moon). The theme choice
   shares its localStorage key with /work so both pages stay in sync. */
export default function TopControls() {
  const { lang, setLang } = useLang();
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
  }, [theme]);

  const langChip = (code) =>
    `flex h-10 w-10 items-center justify-center border border-line bg-page/80 font-display text-xs font-semibold uppercase tracking-[0.04em] backdrop-blur transition-colors duration-200 ${
      lang === code ? 'text-ink border-b-2 !border-b-accent' : 'text-muted hover:text-ink hover:border-ink'
    }`;

  return (
    <div className="absolute right-4 top-4 z-40 flex gap-2 md:fixed md:right-6 md:top-6">
      <div className="flex">
        <button type="button" onClick={() => setLang('en')} aria-pressed={lang === 'en'} className={langChip('en')}>
          EN
        </button>
        <button type="button" onClick={() => setLang('es')} aria-pressed={lang === 'es'} className={`-ml-px ${langChip('es')}`}>
          ES
        </button>
      </div>

      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="tbtn bg-page/80 backdrop-blur"
      >
        <span className="sky" aria-hidden="true">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
            <span key={r} className="ray" style={{ '--r': `${r}deg` }} />
          ))}
          <span className="core" />
          <span className="veil" />
        </span>
      </button>
    </div>
  );
}
