import { useLang } from '../i18n';
import CatMark from './CatMark';

const profiles = [
  ['GitHub', 'https://github.com/hache-cervera'],
  ['npm', 'https://www.npmjs.com/~hache-cervera'],
  ['LinkedIn', 'https://www.linkedin.com/in/hache-cervera'],
];

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="relative">
      <div className="absolute inset-0 z-0 bg-panel" aria-hidden="true" />
      <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 md:items-center border-t border-white/10 px-6 py-8 text-sm text-white/60 md:flex-row md:flex-wrap md:px-12">
        <p className="flex items-center gap-3">
          <CatMark className="h-auto w-5 flex-none text-white/90" />
          {t.footer.copy}
        </p>
        <p className="font-display">
          {t.path[0]} <span className="text-accent">→</span> {t.path[1]} <span className="text-accent">→</span> {t.path[2]}{' '}
          <span className="text-accent">→</span> {t.path[3]}
        </p>
        <p className="flex gap-5">
          {profiles.map(([name, href]) => (
            <a key={name} href={href} className="underline underline-offset-4 transition-colors hover:text-white">
              {name}
            </a>
          ))}
        </p>
      </div>
    </footer>
  );
}
