// Builds the CV in English and Spanish: cv/<lang>.html, then a one-page A4 PDF of each with Chrome.
// Run: node cv/build.mjs   (needs playwright-core and a local Chrome)
// Output goes to public/cv/, the files the site links to.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'public', 'cv');

const C = {
  en: {
    file: 'Ada-Cervera-WebPlatform-CV-ENG.pdf',
    pdfTitle: 'Ada (hache) Cervera, CV',
    role: 'Web Platform, Infrastructure & Security Specialist',
    focus: 'WordPress · E-commerce · Performance · Technical SEO',
    quote: "I like solving problems, whether that's a client's web ecosystem or a bouldering wall.",
    summary:
      'End-to-end ownership of 15+ live web properties across WordPress, Shopify, Wix and PrestaShop: hosting, DNS, Cloudflare, SSL, backups, migrations, performance audits and multilingual sites (WPML, hreflang). I troubleshoot layer by layer, from DNS and CDN to reverse proxy, application and database, and I look after security headers and cache strategy. Hands-on with SEO, GEO and AEO: structured data and access for AI crawlers. I started in marketing and design and moved to the technical side; I run my own home server and publish open research on how websites behave.',
    labels: { contact: 'Contact', linkedin: 'LinkedIn', place: 'Place', languages: 'Languages', skills: 'Skills', certs: 'Certifications', education: 'Education', projects: 'Projects & research', experience: 'Experience', side: 'Resume' },
    place: 'Valencia, Spain',
    languages: 'Spanish (native) · Valencian (native) · English: Cambridge B2 on paper; fluent in practice: a year living and working in Prague, and English-speaking clients',
    site: 'hache-cervera.github.io',
    siteUrl: 'https://hache-cervera.github.io/',
    skills: [
      ['Infra & hosting', ['Hosting management', 'DNS', 'Cloudflare', 'SSL certificates', 'Backups', 'Site migrations', 'Web security', 'Technical troubleshooting', 'Linux (Ubuntu Server)', 'Docker', 'Nginx']],
      ['Web', ['WordPress', 'Elementor Pro', 'Astra Pro', 'WPML', 'WooCommerce', 'Shopify', 'Wix', 'PrestaShop']],
      ['Code', ['HTML', 'CSS', 'PHP (child themes, hooks)', 'Python (basic scripting)', 'Git']],
      ['Security & performance', ['Security headers', 'TLS / HTTPS', 'Cloudflare WAF rules', 'Cache strategy', 'Core Web Vitals', 'PageSpeed / Lighthouse', 'CSS & asset optimization']],
      ['Analytics & SEO', ['SE Ranking', 'GA4', 'GTM', 'GSC', 'Screaming Frog', 'Ahrefs', 'Semrush', 'Web accessibility']],
      ['PM & AI', ['ClickUp', 'Asana', 'Figma', 'AI automation (Claude, ChatGPT)', 'Async workflows']],
    ],
    certs: [['2026', 'Ahrefs Certification'], ['2025', 'Google Analytics (GA4)'], ['2019', 'Cambridge B2 First (FCE)']],
    education: [
      ["Master's in Digital Marketing & Big Data", 'Universidad Europea de Valencia'],
      ['Bachelor of Arts, Graphic Design', 'Teesside University / Prague College'],
      ['BTEC Level 5 HND, Art & Design', 'Pearson BTEC / ESAT, Valencia'],
    ],
    projects: [
      ['yogurTLS', 'https://www.npmjs.com/package/yogurtls', 'Open-source TLS certificate checker, published on npm.'],
      ['Research, 2026', 'https://hache-cervera.github.io/research/', 'IBEX 35 and AI search (robots.txt, firewalls, llms.txt of 35 companies), speed and accessibility of 50 city council websites, TLS certificates. Method and data public.'],
      ['Homelab', 'https://hache-cervera.github.io/work/homelab/', 'A niche WordPress site on my own Linux server with Docker and Nginx, behind Cloudflare.'],
    ],
    jobs: [
      {
        dates: 'Nov 2024 – Sep 2026', title: 'Web Platform & WordPress Specialist', org: 'Neurona Digital SL, Valencia',
        bullets: [
          'End-to-end ownership of 15+ live web properties: hosting, DNS, Cloudflare, SSL, backups, migrations and daily troubleshooting across WordPress, Shopify, Wix and PrestaShop.',
          'Multilingual multi-site operations with WPML and hreflang across Spanish, Valencian and English, on shared templates.',
          'Technical performance audits with Screaming Frog and Ahrefs: crawl health, Core Web Vitals, redirect chains and canonicals, as continuous work rather than one-off reports.',
          'Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy) and cache strategy; issues isolated layer by layer, from DNS to database.',
          'GA4 and GTM set up from scratch with conversion goals; GSC monitoring and structured data validation; Figma to Elementor Pro with no handoff in between.',
        ],
      },
      {
        dates: 'Jun 2024 – Jun 2025', title: 'Marketing Strategy & Sponsorships', org: 'Jump Yard Valencia',
        bullets: [
          "Coordinated the brand's Valencia opening day: €7,000 in revenue, 56% above the previous store record (€4,500 in Bilbao).",
          'Grew Instagram following by 30k+ around the launch, plus sponsorships and collaborations with major brands (confidential).',
        ],
      },
    ],
  },
  es: {
    file: 'Ada-Cervera-WebPlatform-CV-ESP.pdf',
    pdfTitle: 'Ada (hache) Cervera, currículum',
    role: 'Especialista en Plataforma Web, Infraestructura y Seguridad',
    focus: 'WordPress · E-commerce · Rendimiento · SEO técnico',
    quote: 'Me gusta resolver problemas, ya sea en el ecosistema web de un cliente o en la pared de un rocódromo.',
    summary:
      'Me encargo de principio a fin de más de 15 webs en producción en WordPress, Shopify, Wix y PrestaShop: hosting, DNS, Cloudflare, SSL, backups, migraciones, auditorías de rendimiento y webs multiidioma (WPML, hreflang). Resuelvo incidencias capa a capa, del DNS y la CDN al proxy inverso, la aplicación y la base de datos, y me ocupo de las cabeceras de seguridad y la estrategia de caché. También trabajo SEO, GEO y AEO: datos estructurados y acceso de los rastreadores de IA. Empecé en marketing y diseño y me pasé al lado técnico; tengo mi propio servidor en casa y publico investigaciones abiertas sobre webs.',
    labels: { contact: 'Contacto', linkedin: 'LinkedIn', place: 'Ubicación', languages: 'Idiomas', skills: 'Habilidades', certs: 'Certificaciones', education: 'Formación', projects: 'Proyectos e I+D', experience: 'Experiencia', side: 'Currículum' },
    place: 'Valencia, España',
    languages: 'Castellano (nativo) · Valenciano (nativo) · Inglés: B2 de Cambridge en papel; en la práctica, fluido: un año viviendo y trabajando en Praga, y clientes en inglés',
    site: 'hache-cervera.github.io/es',
    siteUrl: 'https://hache-cervera.github.io/es/',
    skills: [
      ['Infraestructura y hosting', ['Gestión de hosting', 'DNS', 'Cloudflare', 'Certificados SSL', 'Backups', 'Migraciones', 'Seguridad web', 'Resolución de incidencias', 'Linux (Ubuntu Server)', 'Docker', 'Nginx']],
      ['Web', ['WordPress', 'Elementor Pro', 'Astra Pro', 'WPML', 'WooCommerce', 'Shopify', 'Wix', 'PrestaShop']],
      ['Código', ['HTML', 'CSS', 'PHP (child themes, hooks)', 'Python (scripting básico)', 'Git']],
      ['Seguridad y rendimiento', ['Cabeceras de seguridad', 'TLS / HTTPS', 'Reglas WAF de Cloudflare', 'Estrategia de caché', 'Core Web Vitals', 'PageSpeed / Lighthouse', 'Optimización de CSS y recursos']],
      ['Analítica y SEO', ['SE Ranking', 'GA4', 'GTM', 'GSC', 'Screaming Frog', 'Ahrefs', 'Semrush', 'Accesibilidad web']],
      ['Gestión e IA', ['ClickUp', 'Asana', 'Figma', 'Automatización con IA (Claude, ChatGPT)', 'Trabajo asíncrono']],
    ],
    certs: [['2026', 'Certificación Ahrefs'], ['2025', 'Google Analytics (GA4)'], ['2019', 'Cambridge B2 First (FCE)']],
    education: [
      ['Máster en Marketing Digital y Big Data', 'Universidad Europea de Valencia'],
      ['Grado en Diseño Gráfico (BA)', 'Teesside University / Prague College'],
      ['HND de nivel 5 en Arte y Diseño (BTEC)', 'Pearson BTEC / ESAT, Valencia'],
    ],
    projects: [
      ['yogurTLS', 'https://www.npmjs.com/package/yogurtls', 'Comprobador de certificados TLS de código abierto, publicado en npm.'],
      ['Investigaciones, 2026', 'https://hache-cervera.github.io/research/es/', 'El IBEX 35 y la búsqueda con IA (robots.txt, cortafuegos y llms.txt de 35 empresas), velocidad y accesibilidad de las webs de 50 ayuntamientos, certificados TLS. Método y datos públicos.'],
      ['Homelab', 'https://hache-cervera.github.io/work/es/homelab/', 'Una web de nicho en WordPress, en mi propio servidor Linux con Docker y Nginx, tras Cloudflare.'],
    ],
    jobs: [
      {
        dates: 'Nov 2024 – Sep 2026', title: 'Especialista en Plataforma Web y WordPress', org: 'Neurona Digital SL, Valencia',
        bullets: [
          'Responsable de principio a fin de más de 15 webs en producción: hosting, DNS, Cloudflare, SSL, backups, migraciones y resolución técnica diaria en WordPress, Shopify, Wix y PrestaShop.',
          'Webs multiidioma y multisite con WPML y hreflang en castellano, valenciano e inglés, sobre plantillas compartidas.',
          'Auditorías técnicas de rendimiento con Screaming Frog y Ahrefs: salud de rastreo, Core Web Vitals, cadenas de redirecciones y canonicals, como trabajo continuo y no como informe puntual.',
          'Cabeceras de seguridad (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy) y estrategia de caché; incidencias localizadas capa a capa, del DNS a la base de datos.',
          'GA4 y GTM montados desde cero con objetivos de conversión; seguimiento en GSC y validación de datos estructurados; de Figma a Elementor Pro sin traspaso intermedio.',
        ],
      },
      {
        dates: 'Jun 2024 – Jun 2025', title: 'Estrategia de Marketing y Patrocinios', org: 'Jump Yard Valencia',
        bullets: [
          'Coordinación del día de apertura en Valencia: 7.000 € de facturación, un 56 % por encima del récord anterior de la marca (4.500 € en Bilbao).',
          'Más de 30.000 seguidores nuevos en Instagram en torno al lanzamiento, además de patrocinios y colaboraciones con grandes marcas (confidenciales).',
        ],
      },
    ],
  },
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const font = f => 'data:font/woff2;base64,' + readFileSync(join(here, '..', 'public', 'fonts', f)).toString('base64');
const photo = 'data:image/jpeg;base64,' + readFileSync(join(here, 'photo.jpg')).toString('base64');

// Small stroke icons for the section badges (no emoji: ATS parsers turn them into junk)
const icon = {
  skills: '<path d="M4 7h16M4 12h10M4 17h13"/>',
  certs: '<circle cx="12" cy="9" r="5"/><path d="M9 13.5 7.5 21 12 18.5 16.5 21 15 13.5"/>',
  education: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  projects: '<path d="M8 6 3 12l5 6M16 6l5 6-5 6"/>',
  experience: '<rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M9 7V4h6v3"/>',
};
const head = (k, label) => `<h2><span class="badge"><svg viewBox="0 0 24 24" aria-hidden="true">${icon[k]}</svg></span>${esc(label)}</h2>`;

function page(lang) {
  const t = C[lang];
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${esc(t.pdfTitle)}</title>
<style>
@font-face { font-family: Sora; font-weight: 600 800; src: url(${font('sora-latin.woff2')}) format('woff2'); }
@font-face { font-family: Inter; font-weight: 400 500; src: url(${font('inter-latin.woff2')}) format('woff2'); }
@page { size: A4; margin: 0; }
:root { --ink: #161616; --muted: #6b6b6b; --line: #e3e3e3; --accent: #e05200; --card: #1c1c1c; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 210mm; height: 297mm; }
body { font: 400 7pt/1.45 Inter, Arial, sans-serif; color: var(--ink); position: relative; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
a { color: inherit; text-decoration: none; }
.wrap { position: absolute; inset: 20pt 24pt 22pt 24pt; display: flex; flex-direction: column; }
header { display: flex; align-items: flex-end; gap: 18pt; height: 140pt; }
.photo { width: 120pt; height: 140pt; border-radius: 10pt; overflow: hidden; flex: none; background: #ddd; }
/* the source photo is a half-length shot: scale it up and frame head and shoulders */
.photo img { width: 178%; height: auto; margin: -6pt 0 0 -50pt; display: block; filter: grayscale(1); }
.id { padding-bottom: 6pt; }
h1 { font: 700 28pt/1 Sora, Arial, sans-serif; letter-spacing: -0.02em; }
h1 span { color: var(--accent); }
.role { margin-top: 9pt; font: 600 7.6pt/1.3 Sora, Arial, sans-serif; letter-spacing: 0.06em; text-transform: uppercase; color: #3a3a3a; }
.focus { margin-top: 3pt; font-size: 7.4pt; color: var(--muted); }
.card { margin-top: 13pt; background: var(--card); color: #ececec; border-radius: 12pt; padding: 15pt 15pt 15pt 16pt; display: grid; grid-template-columns: 1fr 210pt; gap: 20pt; }
.q { font: 600 9pt/1.35 Sora, Arial, sans-serif; color: #fff; }
.q::before { content: '\\201C'; display: block; font: 800 20pt/0.8 Sora, Arial, sans-serif; color: var(--accent); margin-bottom: 4pt; }
.sum { margin-top: 7pt; font-size: 7.1pt; line-height: 1.5; color: #d2d2d2; }
.contact dl { display: grid; grid-template-columns: 52pt 1fr; row-gap: 6pt; align-items: baseline; }
dt { font: 600 5.8pt/1.2 Sora, Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: #9a9a9a; }
dd { font-size: 7.1pt; color: #f1f1f1; }
.site { margin-top: 11pt; display: block; text-align: center; background: var(--accent); color: #fff; border-radius: 6pt; padding: 7pt 0; font: 700 7.4pt/1 Sora, Arial, sans-serif; letter-spacing: 0.01em; }
main { margin-top: 14pt; flex: 1; display: grid; grid-template-columns: 150pt 162pt 1fr; gap: 0 18pt; }
main > section + section { border-left: 1px solid var(--line); padding-left: 18pt; }
h2 { display: flex; align-items: center; gap: 6pt; font: 700 8.2pt/1 Sora, Arial, sans-serif; letter-spacing: 0.02em; text-transform: uppercase; margin-bottom: 8pt; }
h2:not(:first-child) { margin-top: 15pt; }
.badge { width: 13pt; height: 13pt; border-radius: 3pt; background: var(--accent); display: grid; place-items: center; flex: none; }
.badge svg { width: 8.5pt; height: 8.5pt; fill: none; stroke: #fff; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
h3 { font: 700 6.2pt/1.2 Sora, Arial, sans-serif; letter-spacing: 0.07em; text-transform: uppercase; color: var(--accent); margin: 8pt 0 4pt; }
h2 + h3 { margin-top: 0; }
.tags { display: flex; flex-wrap: wrap; gap: 3pt; }
.tags span { border: 1px solid #d4d4d4; border-radius: 99pt; padding: 1.5pt 5pt; font-size: 6.4pt; line-height: 1.25; }
.item + .item { margin-top: 7pt; }
.year { font: 700 8.2pt/1.2 Sora, Arial, sans-serif; color: var(--accent); }
.item b { display: block; font: 600 7.1pt/1.3 Sora, Arial, sans-serif; }
.item small { display: block; font-size: 6.7pt; color: var(--muted); margin-top: 1pt; }
.item p { font-size: 6.7pt; color: #444; margin-top: 1.5pt; line-height: 1.4; }
.job + .job { margin-top: 12pt; }
.dates { font: 700 6.2pt/1.2 Sora, Arial, sans-serif; letter-spacing: 0.07em; text-transform: uppercase; color: var(--accent); }
.job b { display: block; margin-top: 3pt; font: 700 8.2pt/1.25 Sora, Arial, sans-serif; }
.job small { display: block; font-size: 6.9pt; color: var(--muted); margin-top: 1pt; }
.job ul { margin-top: 6pt; padding-left: 9pt; }
.job li { font-size: 6.9pt; line-height: 1.45; margin-top: 3.5pt; color: #2a2a2a; }
.job li::marker { color: var(--accent); }
.side { position: absolute; left: 7pt; bottom: 26pt; transform: rotate(-90deg); transform-origin: left bottom; font: 600 5.5pt/1 Sora, Arial, sans-serif; letter-spacing: 0.3em; text-transform: uppercase; color: #b8b8b8; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="photo"><img src="${photo}" alt="Ada (hache) Cervera"></div>
    <div class="id">
      <h1>Ada <span>(hache)</span><br>Cervera</h1>
      <p class="role">${esc(t.role)}</p>
      <p class="focus">${esc(t.focus)}</p>
    </div>
  </header>
  <div class="card">
    <div>
      <p class="q">${esc(t.quote)}</p>
      <p class="sum">${esc(t.summary)}</p>
    </div>
    <div class="contact">
      <dl>
        <dt>${t.labels.contact}</dt><dd><a href="mailto:hi.hache.cervera@gmail.com">hi.hache.cervera@gmail.com</a></dd>
        <dt>${t.labels.linkedin}</dt><dd><a href="https://www.linkedin.com/in/hache-cervera">linkedin.com/in/hache-cervera</a></dd>
        <dt>${t.labels.place}</dt><dd>${esc(t.place)}</dd>
        <dt>${t.labels.languages}</dt><dd>${esc(t.languages)}</dd>
      </dl>
      <a class="site" href="${t.siteUrl}">${esc(t.site)}</a>
    </div>
  </div>
  <main>
    <section>
      ${head('skills', t.labels.skills)}
      ${t.skills.map(([g, items]) => `<h3>${esc(g)}</h3><div class="tags">${items.map(i => `<span>${esc(i)}</span>`).join('')}</div>`).join('\n      ')}
    </section>
    <section>
      ${head('certs', t.labels.certs)}
      ${t.certs.map(([y, n]) => `<div class="item"><span class="year">${y}</span><small>${esc(n)}</small></div>`).join('')}
      ${head('education', t.labels.education)}
      ${t.education.map(([n, s]) => `<div class="item"><b>${esc(n)}</b><small>${esc(s)}</small></div>`).join('')}
      ${head('projects', t.labels.projects)}
      ${t.projects.map(([n, u, d]) => `<div class="item"><b><a href="${u}">${esc(n)}</a></b><p>${esc(d)}</p></div>`).join('')}
    </section>
    <section>
      ${head('experience', t.labels.experience)}
      ${t.jobs.map(j => `<div class="job"><span class="dates">${esc(j.dates)}</span><b>${esc(j.title)}</b><small>${esc(j.org)}</small><ul>${j.bullets.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}
    </section>
  </main>
</div>
<p class="side">${t.labels.side}</p>
</body>
</html>`;
}

const browser = await chromium.launch({ channel: 'chrome' });
for (const lang of Object.keys(C)) {
  const html = page(lang);
  writeFileSync(join(here, `${lang}.html`), html);
  const p = await browser.newPage();
  await p.setContent(html, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  // the page clips at the bottom, so check the last element of each column against the bottom of .wrap
  const overflow = await p.evaluate(() => {
    const bottom = document.querySelector('.wrap').getBoundingClientRect().bottom;
    return [...document.querySelectorAll('main > section')].map(s => Math.round(s.lastElementChild.getBoundingClientRect().bottom - bottom));
  });
  if (overflow.some(o => o > 0)) throw new Error(`${lang}: column runs past the page by ${overflow} px`);
  console.log(lang, 'space left per column (px):', overflow.map(o => -o).join(', '));
  await p.pdf({ path: join(out, C[lang].file), format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
  console.log('wrote', C[lang].file);
}
await browser.close();
