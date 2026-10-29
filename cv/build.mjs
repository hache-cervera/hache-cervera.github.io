// Builds the CV in English and Spanish: cv/<lang>.html, then a two-page A4 PDF of each with Chrome.
// Page 1 is for deciding in a few seconds (pitch, key facts, proof, latest role); page 2 holds the detail.
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
      'I have worked on 15+ websites across WordPress, Shopify, Wix and PrestaShop: hosting, DNS, Cloudflare, SSL, backups, migrations, performance and multilingual sites. I troubleshoot layer by layer, from DNS to database, and look after security headers and cache strategy. Also SEO, GEO and AEO. I started in marketing and design and moved to the technical side; I run my own home server and publish open research on websites.',
    labels: { contact: 'Contact', linkedin: 'LinkedIn', place: 'Place', languages: 'Languages', skills: 'Skills', certs: 'Certifications', education: 'Education', projects: 'Projects & research', experience: 'Experience', side: 'Resume' },
    place: 'Valencia, Spain',
    languages: 'Spanish (native) · Valencian (native) · English: Cambridge B2 on paper; fluent in practice: a year living in Prague speaking English every day, and work with English-speaking clients',
    site: 'hache-cervera.github.io',
    siteUrl: 'https://hache-cervera.github.io/',
    p1: {
      note: 'Dear recruiter: you probably have plenty more CVs to get through, so I have tried to make mine easy to read.',
      pitch: 'I keep websites running, from the server to the search results: hosting, DNS, security and performance.',
      facts: [['15+', 'websites worked on'], ['4', 'different CMS platforms'], ['Remote', 'or hybrid in Valencia; I can travel about once a month'], ['ES · VA · EN', 'English fluent in practice']],
      best: [
        ['Infrastructure & hosting', 'DNS, Cloudflare, SSL, backups and migrations, on cPanel and Plesk. I run my own Linux server with Docker and Nginx.'],
        ['Security', 'Security headers, TLS certificates and Cloudflare WAF rules.'],
        ['Performance & technical SEO', 'Core Web Vitals, crawl audits with Screaming Frog and Ahrefs, and structured data.'],
        ['R&D and tools', 'Internal tools that take repetitive work off the team, yogurTLS on npm, and my own research with public data.'],
      ],
      lastLabel: 'Latest role',
      highlights: [
        '15+ websites across four different CMS platforms, WordPress and e-commerce.',
        'Multilingual sites with WPML and hreflang: Spanish, Valencian, English and more.',
        'Process optimization and internal tools for the team.',
      ],
      stackLabel: 'Main stack',
      stack: 'WordPress · WooCommerce · WPML · Shopify · PrestaShop · cPanel · Plesk · Cloudflare · Linux · Docker · Nginx · GA4 · GTM · Search Console · Screaming Frog',
      next: 'If this already fits, all the detail is on the next page.',
      pageOf: 'Page 1 of 2',
      closing: 'In years of experience I am not senior yet. I make up for it by learning: part of what is on this CV I taught myself, and I use it every day.',
    },
    skills: [
      ['Infra & hosting', ['Hosting management', 'cPanel', 'Plesk', 'DNS', 'Cloudflare', 'SSL certificates', 'Backups', 'Site migrations', 'Web security', 'Technical troubleshooting', 'Linux (Ubuntu Server)', 'Docker', 'Nginx']],
      ['Web', ['WordPress', 'Elementor Pro', 'Astra Pro', 'WPML', 'WooCommerce', 'Shopify', 'Wix', 'PrestaShop']],
      ['Code', ['HTML', 'CSS', 'PHP (child themes, hooks)', 'Python (basic scripting)', 'Git']],
      ['Security & performance', ['Security headers', 'TLS / HTTPS', 'Cloudflare WAF rules', 'Cache strategy', 'Core Web Vitals', 'PageSpeed / Lighthouse', 'CSS & asset optimization']],
      ['Analytics & SEO', ['SE Ranking', 'GA4', 'GTM', 'GSC', 'Screaming Frog', 'Ahrefs', 'Semrush', 'Web accessibility']],
      ['PM & AI', ['ClickUp', 'Asana', 'Figma', 'AI automation (Claude, ChatGPT)', 'Process optimization', 'Internal tools', 'Async workflows']],
    ],
    certs: [['2026', 'Ahrefs Certification'], ['2025', 'Google Analytics (GA4)'], ['2019', 'Cambridge B2 First (FCE)']],
    education: [
      ["Master's in Digital Marketing & Big Data", 'Universidad Europea de Valencia'],
      ['Bachelor of Arts, Graphic Design', 'Teesside University / Prague College'],
      ['BTEC Level 5 HND, Art & Design', 'Pearson BTEC / ESAT, Valencia'],
    ],
    projects: [
      ['yogurTLS', 'https://www.npmjs.com/package/yogurtls', 'TLS certificate checker that runs on the server itself: it tells you whether auto-renewal is set up and whether a renewed certificate was never loaded, which online checkers cannot see. Open source.'],
      ['Research, 2026', 'https://hache-cervera.github.io/research/', 'My own studies with public data on website speed, accessibility, security and AI search, with open data.'],
      ['Homelab', 'https://hache-cervera.github.io/work/homelab/', 'A niche WordPress site on my own Linux server with Docker and Nginx, behind Cloudflare.'],
    ],
    jobs: [
      {
        dates: 'Nov 2024 – Sep 2026', title: 'Web Platform & WordPress Specialist', org: 'Neurona Digital SL, Valencia',
        bullets: [
          '15+ websites across four different CMS platforms (WordPress, Shopify, Wix and PrestaShop): hosting, DNS, Cloudflare, SSL, backups, migrations and daily troubleshooting.',
          'Multilingual multi-site operations with WPML and hreflang in Spanish, Valencian, English and more.',
          'Technical audits with Screaming Frog and Ahrefs: crawl health, Core Web Vitals, redirects and canonicals.',
          'Security headers (CSP, HSTS and others) and cache strategy; issues isolated layer by layer, from DNS to database.',
          'GA4 and GTM set up from scratch with conversion goals; Search Console monitoring and structured data validation.',
          'Process optimization and internal tools that take repetitive work off the team.',
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
      'He trabajado más de 15 webs en WordPress, Shopify, Wix y PrestaShop: hosting, DNS, Cloudflare, SSL, backups, migraciones, rendimiento y webs multiidioma. Resuelvo incidencias capa a capa, del DNS a la base de datos, y me ocupo de las cabeceras de seguridad y la estrategia de caché. También SEO, GEO y AEO. Empecé en marketing y diseño y me pasé al lado técnico; tengo mi propio servidor en casa y publico investigaciones abiertas sobre webs.',
    labels: { contact: 'Contacto', linkedin: 'LinkedIn', place: 'Ubicación', languages: 'Idiomas', skills: 'Habilidades', certs: 'Certificaciones', education: 'Formación', projects: 'Proyectos e I+D', experience: 'Experiencia', side: 'Currículum' },
    place: 'Valencia, España',
    languages: 'Castellano (nativo) · Valenciano (nativo) · Inglés: B2 de Cambridge en papel; en la práctica, fluido: un año viviendo en Praga hablando inglés a diario, y trabajo con clientes en inglés',
    site: 'hache-cervera.github.io/es',
    siteUrl: 'https://hache-cervera.github.io/es/',
    p1: {
      note: 'Querido recruiter: seguramente tengas muchos más CV por revisar, así que he intentado ponerte fácil la lectura del mío.',
      pitch: 'Me encargo de que las webs funcionen, del servidor al buscador: hosting, DNS, seguridad y rendimiento.',
      facts: [['15+', 'webs trabajadas'], ['4', 'CMS distintos'], ['Remoto', 'o híbrido en Valencia; me desplazo una vez al mes si hace falta'], ['ES · VA · EN', 'inglés fluido en la práctica']],
      best: [
        ['Infraestructura y hosting', 'DNS, Cloudflare, SSL, backups y migraciones, con cPanel y Plesk. Tengo mi propio servidor Linux con Docker y Nginx.'],
        ['Seguridad', 'Cabeceras de seguridad, certificados TLS y reglas WAF en Cloudflare.'],
        ['Rendimiento y SEO técnico', 'Core Web Vitals, auditorías de rastreo con Screaming Frog y Ahrefs, y datos estructurados.'],
        ['I+D y herramientas', 'Herramientas internas que le quitan trabajo repetitivo al equipo, yogurTLS en npm e investigaciones propias con datos públicos.'],
      ],
      lastLabel: 'Último puesto',
      highlights: [
        'Más de 15 webs trabajadas en cuatro CMS distintos, WordPress y e-commerce.',
        'Webs multiidioma con WPML y hreflang: castellano, valenciano, inglés y más.',
        'Optimización de procesos y herramientas internas para el equipo.',
      ],
      stackLabel: 'Stack principal',
      stack: 'WordPress · WooCommerce · WPML · Shopify · PrestaShop · cPanel · Plesk · Cloudflare · Linux · Docker · Nginx · GA4 · GTM · Search Console · Screaming Frog',
      next: 'Si esto ya te encaja, todo el detalle está en la siguiente página.',
      pageOf: 'Página 1 de 2',
      closing: 'En años de experiencia todavía no soy senior. Lo compenso aprendiendo: parte de lo que aparece en este CV lo aprendí por mi cuenta, y lo uso a diario.',
    },
    skills: [
      ['Infraestructura y hosting', ['Gestión de hosting', 'cPanel', 'Plesk', 'DNS', 'Cloudflare', 'Certificados SSL', 'Backups', 'Migraciones', 'Seguridad web', 'Resolución de incidencias', 'Linux (Ubuntu Server)', 'Docker', 'Nginx']],
      ['Web', ['WordPress', 'Elementor Pro', 'Astra Pro', 'WPML', 'WooCommerce', 'Shopify', 'Wix', 'PrestaShop']],
      ['Código', ['HTML', 'CSS', 'PHP (child themes, hooks)', 'Python (scripting básico)', 'Git']],
      ['Seguridad y rendimiento', ['Cabeceras de seguridad', 'TLS / HTTPS', 'Reglas WAF de Cloudflare', 'Estrategia de caché', 'Core Web Vitals', 'PageSpeed / Lighthouse', 'Optimización de CSS y recursos']],
      ['Analítica y SEO', ['SE Ranking', 'GA4', 'GTM', 'GSC', 'Screaming Frog', 'Ahrefs', 'Semrush', 'Accesibilidad web']],
      ['Gestión e IA', ['ClickUp', 'Asana', 'Figma', 'Automatización con IA (Claude, ChatGPT)', 'Optimización de procesos', 'Herramientas internas', 'Trabajo asíncrono']],
    ],
    certs: [['2026', 'Certificación Ahrefs'], ['2025', 'Google Analytics (GA4)'], ['2019', 'Cambridge B2 First (FCE)']],
    education: [
      ['Máster en Marketing Digital y Big Data', 'Universidad Europea de Valencia'],
      ['Grado en Diseño Gráfico (BA)', 'Teesside University / Prague College'],
      ['HND de nivel 5 en Arte y Diseño (BTEC)', 'Pearson BTEC / ESAT, Valencia'],
    ],
    projects: [
      ['yogurTLS', 'https://www.npmjs.com/package/yogurtls', 'Comprobador de certificados TLS que se ejecuta dentro del servidor: dice si la renovación automática está configurada y si un certificado renovado se quedó sin cargar, algo que los comprobadores online no ven. Código abierto, en npm.'],
      ['Investigaciones, 2026', 'https://hache-cervera.github.io/research/es/', 'Estudios propios con datos públicos sobre velocidad, accesibilidad, seguridad y búsqueda con IA en webs. Método y datos abiertos.'],
      ['Homelab', 'https://hache-cervera.github.io/work/es/homelab/', 'Una web de nicho en WordPress, en mi propio servidor Linux con Docker y Nginx, tras Cloudflare.'],
    ],
    jobs: [
      {
        dates: 'Nov 2024 – Sep 2026', title: 'Especialista en Plataforma Web y WordPress', org: 'Neurona Digital SL, Valencia',
        bullets: [
          'Más de 15 webs trabajadas en cuatro CMS distintos (WordPress, Shopify, Wix y PrestaShop): hosting, DNS, Cloudflare, SSL, backups, migraciones y resolución técnica diaria.',
          'Webs multiidioma y multisite con WPML y hreflang en castellano, valenciano, inglés y otros idiomas.',
          'Auditorías técnicas con Screaming Frog y Ahrefs: rastreo, Core Web Vitals, redirecciones y canonicals.',
          'Cabeceras de seguridad (CSP, HSTS y otras) y estrategia de caché; incidencias resueltas capa a capa, del DNS a la base de datos.',
          'GA4 y GTM montados desde cero con objetivos de conversión; seguimiento en Search Console y validación de datos estructurados.',
          'Optimización de procesos y herramientas internas para quitarle trabajo repetitivo al equipo.',
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
  const p1 = t.p1;
  const sep = "<i>·</i>";
  const contactLine = `<a href="mailto:hi.hache.cervera@gmail.com">hi.hache.cervera@gmail.com</a>${sep}<a href="https://www.linkedin.com/in/hache-cervera">linkedin.com/in/hache-cervera</a><br><a href="${t.siteUrl}">${esc(t.site)}</a>${sep}${esc(t.place)}`;
  const [job] = t.jobs;
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
body { font: 400 7pt/1.45 Inter, Arial, sans-serif; color: var(--ink); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
a { color: inherit; text-decoration: none; }
.page { width: 210mm; height: 297mm; position: relative; overflow: hidden; break-after: page; }
.page:last-child { break-after: auto; }
.wrap { position: absolute; inset: 20pt 24pt 22pt 24pt; display: flex; flex-direction: column; }
.side { position: absolute; left: 7pt; bottom: 26pt; transform: rotate(-90deg); transform-origin: left bottom; font: 600 5.5pt/1 Sora, Arial, sans-serif; letter-spacing: 0.3em; text-transform: uppercase; color: #b8b8b8; }
.pn { position: absolute; right: 24pt; bottom: 11pt; font: 700 7pt/1 Sora, Arial, sans-serif; color: #8a8a8a; letter-spacing: 0.06em; }

/* ---------- page 1: decide in a few seconds ---------- */
.p1 .wrap { inset: 22pt 36pt 30pt 36pt; }
header { display: flex; align-items: flex-end; gap: 20pt; }
.photo { width: 120pt; height: 140pt; border-radius: 10pt; overflow: hidden; flex: none; background: #ddd; }
/* the source photo is a half-length shot: scale it up and frame head and shoulders */
.photo img { width: 178%; height: auto; margin: -6pt 0 0 -50pt; display: block; filter: grayscale(1); }
.id { padding-bottom: 4pt; }
h1 { font: 700 30pt/1 Sora, Arial, sans-serif; letter-spacing: -0.02em; }
h1 span { color: var(--accent); }
.role { margin-top: 10pt; font: 600 8pt/1.3 Sora, Arial, sans-serif; letter-spacing: 0.06em; text-transform: uppercase; color: #3a3a3a; }
.focus { margin-top: 3pt; font-size: 8pt; color: var(--muted); }
.cline { margin-top: 9pt; font-size: 7.6pt; line-height: 1.75; color: #333; }
.cline i { font-style: normal; color: #bbb; margin: 0 5pt; }
.cline span { white-space: nowrap; }
.cline a { color: var(--ink); border-bottom: 1px solid #d8d8d8; }
.note { margin-top: 24pt; padding: 3pt 0 3pt 12pt; border-left: 4px solid var(--accent); font-size: 9.6pt; line-height: 1.5; color: #333; max-width: none; }
.note b { font: 700 9.8pt/1.5 Sora, Arial, sans-serif; color: var(--ink); }
.nw { white-space: nowrap; }
.pitch { margin-top: 16pt; font: 600 13.5pt/1.4 Sora, Arial, sans-serif; letter-spacing: -0.01em; max-width: 470pt; }
.facts { margin-top: 24pt; display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1.5px solid var(--ink); border-bottom: 1px solid var(--line); }
.facts div { padding: 11pt 10pt 12pt 0; }
.facts div + div { padding-left: 12pt; border-left: 1px solid var(--line); }
.facts b { display: block; font: 800 19pt/1 Sora, Arial, sans-serif; color: var(--accent); letter-spacing: -0.01em; }
.facts span { display: block; margin-top: 5pt; font-size: 7.6pt; color: #444; line-height: 1.35; }
.k { margin-top: 24pt; font: 700 7pt/1 Sora, Arial, sans-serif; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.best { margin-top: 28pt; display: grid; grid-template-columns: 1fr 1fr; gap: 14pt 28pt; }
.best h3 { font: 700 9.4pt/1.25 Sora, Arial, sans-serif; display: flex; gap: 6pt; align-items: baseline; }
.best h3::before { content: ''; width: 6pt; height: 6pt; border-radius: 1.5pt; background: var(--accent); flex: none; transform: translateY(-1pt); }
.best p { margin-top: 5pt; font-size: 8.6pt; line-height: 1.5; color: #333; }
.last { margin-top: 10pt; display: grid; grid-template-columns: 150pt 1fr; gap: 26pt; padding-top: 12pt; border-top: 1px solid var(--line); }
.last .dates { font: 700 6.6pt/1.2 Sora, Arial, sans-serif; letter-spacing: 0.07em; text-transform: uppercase; color: var(--accent); }
.last b { display: block; margin-top: 4pt; font: 700 9.6pt/1.3 Sora, Arial, sans-serif; }
.last small { display: block; margin-top: 2pt; font-size: 7.8pt; color: var(--muted); }
.last ul { padding-left: 10pt; }
.last li { font-size: 8.6pt; line-height: 1.5; color: #333; }
.last li + li { margin-top: 4pt; }
.last li::marker { color: var(--accent); }
.stack { margin-top: 10pt; font-size: 8.6pt; line-height: 1.6; color: #333; padding-top: 0; }
.next { margin-top: auto; display: flex; justify-content: space-between; align-items: center; gap: 18pt; background: var(--card); color: #fff; border-radius: 12pt; padding: 18pt 20pt 18pt 22pt; }
.next .po { display: inline-block; font: 700 8pt/1 Sora, Arial, sans-serif; letter-spacing: 0.1em; text-transform: uppercase; color: #fff; background: var(--accent); border-radius: 4pt; padding: 4pt 7pt; }
.next p { margin-top: 7pt; font: 600 13pt/1.3 Sora, Arial, sans-serif; }
.next .arrow { width: 38pt; height: 38pt; border-radius: 50%; background: var(--accent); display: grid; place-items: center; flex: none; }
.next .arrow svg { width: 18pt; height: 18pt; fill: none; stroke: #fff; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }

/* ---------- page 2: the detail ---------- */
.mini { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 8pt; border-bottom: 1px solid var(--line); }
.mini b { font: 700 11pt/1 Sora, Arial, sans-serif; }
.mini b span { color: var(--accent); }
.mini small { font-size: 6.8pt; color: var(--muted); }
.card { margin-top: 10pt; background: var(--card); color: #ececec; border-radius: 12pt; padding: 12pt 15pt 12pt 16pt; display: grid; grid-template-columns: 1fr 210pt; gap: 20pt; }
.q { font: 600 9pt/1.35 Sora, Arial, sans-serif; color: #fff; }
.q::before { content: '\\201C'; display: block; font: 800 20pt/0.8 Sora, Arial, sans-serif; color: var(--accent); margin-bottom: 4pt; }
.sum { margin-top: 7pt; font-size: 7.1pt; line-height: 1.5; color: #d2d2d2; }
.contact dl { display: grid; grid-template-columns: 52pt 1fr; row-gap: 6pt; align-items: baseline; }
dt { font: 600 5.8pt/1.2 Sora, Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: #9a9a9a; }
dd { font-size: 7.1pt; color: #f1f1f1; }
.site { margin-top: 11pt; display: block; text-align: center; background: var(--accent); color: #fff; border-radius: 6pt; padding: 7pt 0; font: 700 7.4pt/1 Sora, Arial, sans-serif; letter-spacing: 0.01em; }
main { margin-top: 12pt; flex: 1; display: grid; grid-template-columns: 1fr 172pt; gap: 0 20pt; }
main > section + section { border-left: 1px solid var(--line); padding-left: 20pt; }
h2 { display: flex; align-items: center; gap: 6pt; font: 700 8.4pt/1 Sora, Arial, sans-serif; letter-spacing: 0.02em; text-transform: uppercase; margin-bottom: 9pt; }
h2:not(:first-child) { margin-top: 14pt; }
.badge { width: 13pt; height: 13pt; border-radius: 3pt; background: var(--accent); display: grid; place-items: center; flex: none; }
.badge svg { width: 8.5pt; height: 8.5pt; fill: none; stroke: #fff; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
h3.g { font: 700 6.3pt/1.2 Sora, Arial, sans-serif; letter-spacing: 0.07em; text-transform: uppercase; color: var(--accent); margin: 8pt 0 4pt; }
h2 + h3.g { margin-top: 0; }
.tags { display: flex; flex-wrap: wrap; gap: 3pt; }
.tags span { border: 1px solid #d4d4d4; border-radius: 99pt; padding: 1.4pt 5pt; font-size: 6.4pt; line-height: 1.25; }
.item + .item { margin-top: 8pt; }
.year { font: 700 8.2pt/1.2 Sora, Arial, sans-serif; color: var(--accent); }
.item b { display: block; font: 600 7.4pt/1.3 Sora, Arial, sans-serif; }
.item small { display: block; font-size: 6.9pt; color: var(--muted); margin-top: 1pt; }
.item p { font-size: 7.1pt; color: #444; margin-top: 2pt; line-height: 1.45; }
.job + .job { margin-top: 11pt; }
.dates { font: 700 6.4pt/1.2 Sora, Arial, sans-serif; letter-spacing: 0.07em; text-transform: uppercase; color: var(--accent); }
.job b { display: block; margin-top: 3pt; font: 700 8.6pt/1.25 Sora, Arial, sans-serif; }
.job small { display: block; font-size: 7.1pt; color: var(--muted); margin-top: 1pt; }
.job ul { margin-top: 6pt; padding-left: 9pt; }
.job li { font-size: 7.3pt; line-height: 1.5; margin-top: 4pt; color: #2a2a2a; }
.job li::marker { color: var(--accent); }
.line { font-size: 7.2pt; line-height: 1.4; }
.line + .line { margin-top: 5pt; }
.line b { font: 600 7.4pt/1.3 Sora, Arial, sans-serif; }
.line small { color: var(--muted); font-size: 7pt; }
.line b + small::before { content: '· '; color: #bbb; }
.line .year { font-size: 7.6pt; margin-right: 3pt; }
.closing { margin-top: 14pt; padding: 11pt 13pt; border-radius: 8pt; background: #f4f4f2; border-left: 3px solid var(--accent); font: 600 8pt/1.5 Sora, Arial, sans-serif; color: #222; }
.two { margin-top: 18pt; display: grid; grid-template-columns: 1fr 1fr; gap: 0 18pt; }
</style>
</head>
<body>

<div class="page p1">
<div class="wrap">
  <header>
    <div class="photo"><img src="${photo}" alt="Ada (hache) Cervera"></div>
    <div class="id">
      <h1>Ada <span>(hache)</span><br>Cervera</h1>
      <p class="role">${esc(t.role)}</p>
      <p class="focus">${esc(t.focus)}</p>
      <p class="cline">${contactLine}</p>
    </div>
  </header>
  <p class="note">${(([h, ...r]) => `<b>${esc(h)}:</b>${esc(r.join(":"))}`)(p1.note.split(":"))}</p>
  <p class="pitch">${esc(p1.pitch).replace("e-commerce", "<span class=\"nw\">e-commerce</span>")}</p>
  <div class="facts">${p1.facts.map(([n, l]) => `<div><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join('')}</div>
  <div class="best">${p1.best.map(([h, p]) => `<div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>
  <p class="k">${esc(p1.lastLabel)}</p>
  <div class="last">
    <div><span class="dates">${esc(job.dates)}</span><b>${esc(job.title)}</b><small>${esc(job.org)}</small></div>
    <ul>${p1.highlights.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
  </div>
  <p class="k">${esc(p1.stackLabel)}</p>
  <p class="stack">${esc(p1.stack)}</p>
  <div class="next"><div><span class="po">${esc(p1.pageOf)}</span><p>${esc(p1.next)}</p></div><span class="arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 4v16M5 13l7 7 7-7"/></svg></span></div>
</div>
<p class="side">${t.labels.side}</p>
<p class="pn">1 / 2</p>
</div>

<div class="page p2">
<div class="wrap">
  <div class="mini"><b>Ada <span>(hache)</span> Cervera</b><small>${esc(t.role)}</small></div>
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
      ${head('experience', t.labels.experience)}
      ${t.jobs.map(j => `<div class="job"><span class="dates">${esc(j.dates)}</span><b>${esc(j.title)}</b><small>${esc(j.org)}</small><ul>${j.bullets.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}
      ${head('projects', t.labels.projects)}
      ${t.projects.map(([n, u, d]) => `<div class="item"><b><a href="${u}">${esc(n)}</a></b><p>${esc(d)}</p></div>`).join('')}
      ${head('education', t.labels.education)}
      ${t.education.map(([n, s]) => `<p class="line"><b>${esc(n)}</b> <small>${esc(s)}</small></p>`).join('')}
      <p class="closing">${esc(p1.closing)}</p>
    </section>
    <section>
      ${head('skills', t.labels.skills)}
      ${t.skills.map(([g, items]) => `<h3 class="g">${esc(g)}</h3><div class="tags">${items.map(i => `<span>${esc(i)}</span>`).join('')}</div>`).join('\n      ')}
      ${head('certs', t.labels.certs)}
      ${t.certs.map(([y, n]) => `<p class="line"><span class="year">${y}</span> <small>${esc(n)}</small></p>`).join('')}
    </section>
  </main>
</div>
<p class="side">${t.labels.side}</p>
<p class="pn">2 / 2</p>
</div>

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
  // each page clips at the bottom: find the lowest element inside each .wrap and compare it with the bottom of .wrap
  const space = await p.evaluate(() => [...document.querySelectorAll('.wrap')].map(w => {
    const bottom = w.getBoundingClientRect().bottom;
    const lowest = Math.max(...[...w.querySelectorAll('*')].map(e => e.getBoundingClientRect().bottom));
    return Math.round(bottom - lowest);
  }));
  if (space.some(s => s < 0)) throw new Error(`${lang}: content runs past the page by ${space} px`);
  console.log(lang, 'space left per page (px):', space.join(', '));
  await p.pdf({ path: join(out, C[lang].file), format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
  console.log('wrote', C[lang].file);
}
await browser.close();
