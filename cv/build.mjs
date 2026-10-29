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
      'End-to-end ownership of 15+ live web properties across WordPress, Shopify, Wix and PrestaShop: hosting, DNS, Cloudflare, SSL, backups, migrations, performance audits and multilingual sites (WPML, hreflang). I troubleshoot layer by layer, from DNS and CDN to reverse proxy, application and database, and I look after security headers and cache strategy. Hands-on with SEO, GEO and AEO: structured data and access for AI crawlers. I started in marketing and design and moved to the technical side; I run my own home server and publish open research on how websites behave.',
    labels: { contact: 'Contact', linkedin: 'LinkedIn', place: 'Place', languages: 'Languages', skills: 'Skills', certs: 'Certifications', education: 'Education', projects: 'Projects & research', experience: 'Experience', side: 'Resume' },
    place: 'Valencia, Spain',
    languages: 'Spanish (native) · Valencian (native) · English: Cambridge B2 on paper; fluent in practice: a year living in Prague speaking English every day, and work with English-speaking clients',
    site: 'hache-cervera.github.io',
    siteUrl: 'https://hache-cervera.github.io/',
    p1: {
      pitch: 'I keep websites running, from the server to the search results: hosting, DNS, security and performance for 15+ live sites on WordPress, Shopify, Wix and PrestaShop.',
      facts: [['15+', 'live web properties, end to end'], ['4', 'CMS platforms in production'], ['Remote', 'async and written-first'], ['ES · VA · EN', 'English fluent in practice']],
      bestLabel: 'What I do best',
      best: [
        ['Infrastructure & hosting', 'DNS, Cloudflare, SSL, backups and migrations across 15+ sites. I also run my own Linux server with Docker and Nginx.'],
        ['Security', 'Security headers, TLS and WAF rules. I built yogurTLS, an open-source TLS certificate checker published on npm.'],
        ['Performance & technical SEO', 'Core Web Vitals, crawl audits with Screaming Frog and Ahrefs, structured data and access for AI crawlers.'],
        ['Public research', 'Studies with the method and data anyone can repeat: AI search on the IBEX 35, speed and accessibility of 50 city council websites.'],
      ],
      lastLabel: 'Latest role',
      highlights: [
        'End-to-end ownership of 15+ live web properties on four CMS platforms.',
        'Multilingual sites with WPML and hreflang in Spanish, Valencian and English.',
        'Security headers, cache strategy and performance audits as continuous work.',
      ],
      stackLabel: 'Main stack',
      stack: 'WordPress · WooCommerce · WPML · Shopify · PrestaShop · Cloudflare · Linux · Docker · Nginx · GA4 · GTM · Screaming Frog',
      next: 'If this already fits, all the detail is on the next page.',
    },
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
    languages: 'Castellano (nativo) · Valenciano (nativo) · Inglés: B2 de Cambridge en papel; en la práctica, fluido: un año viviendo en Praga hablando inglés a diario, y trabajo con clientes en inglés',
    site: 'hache-cervera.github.io/es',
    siteUrl: 'https://hache-cervera.github.io/es/',
    p1: {
      pitch: 'Me encargo de que las webs funcionen, del servidor al buscador: hosting, DNS, seguridad y rendimiento de más de 15 webs en producción en WordPress, Shopify, Wix y PrestaShop.',
      facts: [['15+', 'webs en producción, de principio a fin'], ['4', 'CMS en producción'], ['Remoto', 'asíncrono y por escrito'], ['ES · VA · EN', 'inglés fluido en la práctica']],
      bestLabel: 'Lo que hago mejor',
      best: [
        ['Infraestructura y hosting', 'DNS, Cloudflare, SSL, backups y migraciones en más de 15 webs. Además tengo mi propio servidor Linux con Docker y Nginx.'],
        ['Seguridad', 'Cabeceras de seguridad, TLS y reglas WAF. He creado yogurTLS, un comprobador de certificados TLS de código abierto publicado en npm.'],
        ['Rendimiento y SEO técnico', 'Core Web Vitals, auditorías de rastreo con Screaming Frog y Ahrefs, datos estructurados y acceso para bots de IA.'],
        ['Investigación pública', 'Estudios con el método y los datos para que cualquiera los repita: la búsqueda con IA en el IBEX 35, velocidad y accesibilidad de las webs de 50 ayuntamientos.'],
      ],
      lastLabel: 'Último puesto',
      highlights: [
        'Responsable de principio a fin de más de 15 webs en producción, en cuatro CMS.',
        'Webs multiidioma con WPML y hreflang en castellano, valenciano e inglés.',
        'Cabeceras de seguridad, estrategia de caché y auditorías de rendimiento como trabajo continuo.',
      ],
      stackLabel: 'Stack principal',
      stack: 'WordPress · WooCommerce · WPML · Shopify · PrestaShop · Cloudflare · Linux · Docker · Nginx · GA4 · GTM · Screaming Frog',
      next: 'Si esto ya te encaja, todo el detalle está en la siguiente página.',
    },
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
.pn { position: absolute; right: 24pt; bottom: 12pt; font: 600 6pt/1 Sora, Arial, sans-serif; color: #b0b0b0; letter-spacing: 0.06em; }

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
.pitch { margin-top: 34pt; font: 600 13.5pt/1.4 Sora, Arial, sans-serif; letter-spacing: -0.01em; max-width: 470pt; }
.facts { margin-top: 28pt; display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1.5px solid var(--ink); border-bottom: 1px solid var(--line); }
.facts div { padding: 11pt 10pt 12pt 0; }
.facts div + div { padding-left: 12pt; border-left: 1px solid var(--line); }
.facts b { display: block; font: 800 19pt/1 Sora, Arial, sans-serif; color: var(--accent); letter-spacing: -0.01em; }
.facts span { display: block; margin-top: 5pt; font-size: 7.6pt; color: #444; line-height: 1.35; }
.k { margin-top: 34pt; font: 700 7pt/1 Sora, Arial, sans-serif; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.best { margin-top: 12pt; display: grid; grid-template-columns: 1fr 1fr; gap: 18pt 28pt; }
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
.next { margin-top: auto; display: flex; justify-content: space-between; align-items: center; gap: 16pt; background: var(--card); color: #fff; border-radius: 10pt; padding: 13pt 16pt; }
.next p { font: 600 9.6pt/1.35 Sora, Arial, sans-serif; }
.next p::after { content: ''; display: inline-block; width: 18pt; height: 1.5pt; background: var(--accent); vertical-align: middle; margin-left: 9pt; }
.next a { font: 700 7.6pt/1 Sora, Arial, sans-serif; background: var(--accent); border-radius: 6pt; padding: 7pt 11pt; white-space: nowrap; }

/* ---------- page 2: the detail ---------- */
.mini { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 8pt; border-bottom: 1px solid var(--line); }
.mini b { font: 700 11pt/1 Sora, Arial, sans-serif; }
.mini b span { color: var(--accent); }
.mini small { font-size: 6.8pt; color: var(--muted); }
.card { margin-top: 12pt; background: var(--card); color: #ececec; border-radius: 12pt; padding: 14pt 15pt 14pt 16pt; display: grid; grid-template-columns: 1fr 210pt; gap: 20pt; }
.q { font: 600 9pt/1.35 Sora, Arial, sans-serif; color: #fff; }
.q::before { content: '\\201C'; display: block; font: 800 20pt/0.8 Sora, Arial, sans-serif; color: var(--accent); margin-bottom: 4pt; }
.sum { margin-top: 7pt; font-size: 7.1pt; line-height: 1.5; color: #d2d2d2; }
.contact dl { display: grid; grid-template-columns: 52pt 1fr; row-gap: 6pt; align-items: baseline; }
dt { font: 600 5.8pt/1.2 Sora, Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: #9a9a9a; }
dd { font-size: 7.1pt; color: #f1f1f1; }
.site { margin-top: 11pt; display: block; text-align: center; background: var(--accent); color: #fff; border-radius: 6pt; padding: 7pt 0; font: 700 7.4pt/1 Sora, Arial, sans-serif; letter-spacing: 0.01em; }
main { margin-top: 16pt; flex: 1; display: grid; grid-template-columns: 1fr 172pt; gap: 0 20pt; }
main > section + section { border-left: 1px solid var(--line); padding-left: 20pt; }
h2 { display: flex; align-items: center; gap: 6pt; font: 700 8.4pt/1 Sora, Arial, sans-serif; letter-spacing: 0.02em; text-transform: uppercase; margin-bottom: 9pt; }
h2:not(:first-child) { margin-top: 18pt; }
.badge { width: 13pt; height: 13pt; border-radius: 3pt; background: var(--accent); display: grid; place-items: center; flex: none; }
.badge svg { width: 8.5pt; height: 8.5pt; fill: none; stroke: #fff; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
h3.g { font: 700 6.3pt/1.2 Sora, Arial, sans-serif; letter-spacing: 0.07em; text-transform: uppercase; color: var(--accent); margin: 9pt 0 4pt; }
h2 + h3.g { margin-top: 0; }
.tags { display: flex; flex-wrap: wrap; gap: 3pt; }
.tags span { border: 1px solid #d4d4d4; border-radius: 99pt; padding: 1.6pt 5.5pt; font-size: 6.6pt; line-height: 1.25; }
.item + .item { margin-top: 8pt; }
.year { font: 700 8.2pt/1.2 Sora, Arial, sans-serif; color: var(--accent); }
.item b { display: block; font: 600 7.4pt/1.3 Sora, Arial, sans-serif; }
.item small { display: block; font-size: 6.9pt; color: var(--muted); margin-top: 1pt; }
.item p { font-size: 7.1pt; color: #444; margin-top: 2pt; line-height: 1.45; }
.job + .job { margin-top: 14pt; }
.dates { font: 700 6.4pt/1.2 Sora, Arial, sans-serif; letter-spacing: 0.07em; text-transform: uppercase; color: var(--accent); }
.job b { display: block; margin-top: 3pt; font: 700 8.6pt/1.25 Sora, Arial, sans-serif; }
.job small { display: block; font-size: 7.1pt; color: var(--muted); margin-top: 1pt; }
.job ul { margin-top: 6pt; padding-left: 9pt; }
.job li { font-size: 7.3pt; line-height: 1.5; margin-top: 4pt; color: #2a2a2a; }
.job li::marker { color: var(--accent); }
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
  <p class="pitch">${esc(p1.pitch)}</p>
  <div class="facts">${p1.facts.map(([n, l]) => `<div><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join('')}</div>
  <p class="k">${esc(p1.bestLabel)}</p>
  <div class="best">${p1.best.map(([h, p]) => `<div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>
  <p class="k">${esc(p1.lastLabel)}</p>
  <div class="last">
    <div><span class="dates">${esc(job.dates)}</span><b>${esc(job.title)}</b><small>${esc(job.org)}</small></div>
    <ul>${p1.highlights.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
  </div>
  <p class="k">${esc(p1.stackLabel)}</p>
  <p class="stack">${esc(p1.stack)}</p>
  <div class="next"><p>${esc(p1.next)}</p><a href="${t.siteUrl}">${esc(t.site)}</a></div>
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
      <div class="two">
        <div>${head('education', t.labels.education)}
        ${t.education.map(([n, s]) => `<div class="item"><b>${esc(n)}</b><small>${esc(s)}</small></div>`).join('')}</div>
        <div>${head('certs', t.labels.certs)}
        ${t.certs.map(([y, n]) => `<div class="item"><span class="year">${y}</span><small>${esc(n)}</small></div>`).join('')}</div>
      </div>
    </section>
    <section>
      ${head('skills', t.labels.skills)}
      ${t.skills.map(([g, items]) => `<h3 class="g">${esc(g)}</h3><div class="tags">${items.map(i => `<span>${esc(i)}</span>`).join('')}</div>`).join('\n      ')}
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
