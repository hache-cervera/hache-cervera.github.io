import { useLang } from '../i18n';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="relative">
      <div className="absolute inset-0 z-0 bg-panel" aria-hidden="true" />
      <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/10 px-6 py-8 text-sm text-white/40 md:flex-row md:px-12">
        <p>{t.footer.copy}</p>
        <p className="font-display">
          {t.path[0]} <span className="text-accent">→</span> {t.path[1]} <span className="text-accent">→</span> {t.path[2]}{' '}
          <span className="text-accent">→</span> {t.path[3]}
        </p>
      </div>
    </footer>
  );
}
