import { useLang } from '../i18n';
import Words from './Words';

/* Original studies, each with its own static page under /research.
   The headline number is the one the study is about, so a recruiter
   sees the finding before deciding to click. */
export default function Research() {
  const { t } = useLang();

  return (
    <section id="research" className="relative px-6 py-32 md:px-12 md:py-44">
      <div className="relative z-20 mx-auto w-full max-w-6xl">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-accent-ink">{t.research.label}</p>
        <h2 className="mt-6 font-display text-[clamp(1.9rem,3.5vw,2.8rem)] font-bold tracking-tightest">
          <Words>{t.research.h2}</Words>
        </h2>
        <p className="mt-4 max-w-xl text-muted">{t.research.intro}</p>

        <ul className="mt-14 grid gap-6">
          {t.research.items.map((it) => (
            <li key={it.href}>
              <a
                href={it.href}
                className="group grid gap-6 border border-line p-6 transition-colors duration-300 hover:border-ink md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-10"
              >
                <div>
                  <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted-strong">{it.kicker}</p>
                  <h3 className="mt-3 font-display text-2xl font-bold tracking-tightest md:text-3xl">{it.title}</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-strong">{it.text}</p>
                  <span className="mt-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4 group-hover:text-accent-ink">
                    {it.cta}
                  </span>
                </div>
                <p className="md:text-right">
                  <span className="block font-display text-6xl font-extrabold leading-none text-accent-ink md:text-7xl">{it.stat}</span>
                  <span className="mt-2 block max-w-[14rem] text-sm text-muted-strong md:ml-auto">{it.statLabel}</span>
                </p>
              </a>
            </li>
          ))}
        </ul>
        <a href={t.research.allHref} className="mt-8 inline-flex font-display text-sm font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-accent-ink">
          {t.research.all}
        </a>
      </div>
    </section>
  );
}
