// Puts the build-time HTML of the home (src/static/render.jsx) inside #root:
// English in dist/index.html, Spanish in dist/es/index.html (same app, Spanish head and content).
// Runs after `vite build` and the SSR build of render.jsx (see package.json).
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const { render } = await import(pathToFileURL('dist-ssr/render.js').href);
const file = 'dist/index.html';
const html = readFileSync(file, 'utf8');
if (!html.includes('<div id="root"></div>')) throw new Error('empty #root not found in dist/index.html');

const SITE = 'https://hache-cervera.github.io';
const alternates =
  `<link rel="alternate" hreflang="en" href="${SITE}/" />\n    ` +
  `<link rel="alternate" hreflang="es" href="${SITE}/es/" />\n    ` +
  `<link rel="alternate" hreflang="x-default" href="${SITE}/" />\n    `;
const withAlternates = html.replace('<link rel="canonical"', alternates + '<link rel="canonical"');

writeFileSync(file, withAlternates.replace('<div id="root"></div>', `<div id="root">${render('en')}</div>`));

const ES = {
  title: 'Ada (hache) Cervera | Especialista en Plataforma Web, Operativa y WordPress',
  desc: 'Ada (hache) Cervera, especialista en plataforma web, operativa y WordPress en Valencia, en remoto. Más de 15 webs en producción de principio a fin: hosting, DNS, Cloudflare, SSL, backups, migraciones, Core Web Vitals y SEO técnico en WordPress, Shopify, Wix y PrestaShop.',
  og: 'Más de 15 webs en producción de principio a fin: hosting, DNS, migraciones, rendimiento y SEO técnico. Abierta a puestos en remoto.',
};
let es = withAlternates
  .replace('<html lang="en">', '<html lang="es">')
  // relative URLs (assets, work/, research/, cv/) resolve from the site root, not from /es/
  .replace('<head>', '<head>\n    <base href="/" />')
  .replace(/<title>[^<]*<\/title>/, `<title>${ES.title.replace('&', '&amp;')}</title>`)
  .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${ES.desc}$2`)
  .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${ES.title}$2`)
  .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${ES.og}$2`)
  .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${SITE}/es/$2`)
  .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${SITE}/es/$2`)
  .replace('<div id="root"></div>', `<div id="root">${render('es')}</div>`);
mkdirSync('dist/es', { recursive: true });
writeFileSync('dist/es/index.html', es);

rmSync('dist-ssr', { recursive: true, force: true });
console.log('prerendered home into dist/index.html and dist/es/index.html');
