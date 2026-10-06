// Build-time render of the home content as plain HTML (English at /, Spanish at /es/).
// scripts/prerender.mjs puts it inside #root, so crawlers, link previews and
// visitors without JavaScript get the real text. React replaces it on mount.
import { renderToStaticMarkup } from 'react-dom/server';
import { translations } from '../i18n';
import { getExperience, getDisciplines } from '../data/content';

function StaticHome({ lang }) {
  const t = translations[lang];
  const experience = getExperience(lang);
  const disciplines = getDisciplines(lang);
  return (
    <main className="relative">
      <section id="hero" className="relative flex min-h-screen flex-col justify-center px-6 py-24 md:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-accent-ink">{t.hero.kicker}</p>
          <h1 className="mt-6 font-display text-[clamp(2rem,4.6vw,4.3rem)] font-bold leading-[1.08] tracking-tightest">
            <span className="block">{t.hero.h1a}</span>
            <span className="block">{t.hero.h1b}</span>
            <span className="block pb-2 text-accent-ink">{t.hero.h1c}</span>
          </h1>
          <p className="mt-10 max-w-md text-lg leading-relaxed text-muted">
            {t.hero.sub1} {t.hero.sub2} {t.hero.sub3}
          </p>
          <p className="mt-6 max-w-md text-sm font-semibold text-ink">
            {t.hero.status} <a href={t.cvHref}>{t.hero.cv}</a>
          </p>
          <p className="mt-10 flex flex-wrap gap-4 font-display font-semibold">
            <a href={lang === 'es' ? 'work/es/' : 'work/'}>{t.hero.portfolio}</a>
            <a href={lang === 'es' ? 'research/es/' : 'research/'}>{t.hero.research}</a>
          </p>
        </div>
      </section>

      <section id="about" className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-bold">
            {t.about.h2a} {t.about.h2b} {t.about.h2c}
          </h2>
          <dl className="mt-8 grid gap-3">
            {t.about.facts.map((f) => (
              <div key={f.k}>
                <dt className="font-semibold">{f.k}</dt>
                <dd className="text-muted">{f.v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 max-w-2xl text-muted">{t.about.p1}</p>
          {t.about.layers.map((l) => (
            <div key={l.n} className="mt-6">
              <h3 className="font-display text-xl font-bold">{l.name}</h3>
              <p className="text-muted">{l.line}</p>
              <p className="text-sm text-muted">{l.tools.join(', ')}</p>
            </div>
          ))}
          <p className="mt-6 max-w-2xl text-muted">{t.about.geoNote}</p>
          <p className="mt-6 max-w-2xl text-muted">{t.about.p4}</p>
          <p className="mt-6 max-w-2xl text-muted">{t.about.p3}</p>
        </div>
      </section>

      <section id="skills" className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-bold">{t.skills.label}</h2>
          {disciplines.map((d) => (
            <div key={d.id} className="mt-6">
              <h3 className="font-display text-xl font-bold">{d.label}</h3>
              <p className="text-sm text-muted">{d.tools.map((x) => x.name).join(', ')}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="research" className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-bold">{t.research.h2}</h2>
          {t.research.items.map((it) => (
            <article key={it.href} className="mt-6">
              <h3 className="font-display text-xl font-bold">
                <a href={it.href}>{it.title}</a>
              </h3>
              <p className="text-muted">
                {it.stat} {it.statLabel}. {it.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="experience" className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-bold">{t.experience.h2}</h2>
          {experience.map((job) => (
            <article key={job.company} className="mt-8">
              <h3 className="font-display text-xl font-bold">
                {job.role}, {job.company}
              </h3>
              <p className="text-sm text-muted">
                {job.dates} · {job.place}
              </p>
              <ul className="mt-3 list-disc pl-5 text-muted">
                {job.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              {job.proof.length > 0 && (
                <p className="mt-3 text-sm">
                  {t.experience.proof}{' '}
                  {job.proof.map((p, i) => (
                    <span key={p.href}>
                      {i > 0 && ', '}
                      <a href={p.href}>{p.label}</a>
                    </span>
                  ))}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-bold">{t.contact.h2}</h2>
          <p className="mt-4">
            <a href="mailto:hi.hache.cervera@gmail.com">hi.hache.cervera@gmail.com</a> ·{' '}
            <a href="https://www.linkedin.com/in/hache-cervera">LinkedIn</a> ·{' '}
            <a href={t.cvHref}>{t.contact.cv}</a>
          </p>
        </div>
      </section>
    </main>
  );
}

export function render(lang = 'en') {
  return renderToStaticMarkup(<StaticHome lang={lang} />);
}
