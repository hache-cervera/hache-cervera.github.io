import { parse } from 'node-html-parser';
import { db } from '../db/index.js';
import { timedFetch, followRedirects, sslDaysRemaining } from '../lib/http.js';
import { notify } from '../alerts/index.js';

const MAX_PAGES = Number(process.env.PULSE_MAX_PAGES || 60);
const MAX_EXTERNAL_CHECKS = 30;

// Escaneo completo de salud: crawler interno + seguridad externa.
export async function runSiteScan(projectId) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  if (!project) throw new Error(`Proyecto ${projectId} no existe`);

  const base = new URL(project.url);
  const scanId = db.prepare('INSERT INTO scans (project_id) VALUES (?)').run(projectId).lastInsertRowid;
  const issues = [];
  const addIssue = (severity, category, message, url = null, detail = null) =>
    issues.push({ severity, category, message, url, detail });

  const pages = new Map(); // url -> { status, title, meta, canonical, h1s, imgsSinAlt }
  const queue = [base.href];
  const seen = new Set(queue);
  const externalLinks = new Set();
  let isWordPress = false;

  while (queue.length && pages.size < MAX_PAGES) {
    const url = queue.shift();
    const { chain, finalUrl, status, res, loop, error } = await followRedirects(url);

    if (loop) addIssue('critical', 'redirecciones', 'Bucle de redirecciones', url, JSON.stringify(chain));
    else if (chain.length > 1) addIssue('warning', 'redirecciones', `Cadena de ${chain.length} redirecciones`, url, JSON.stringify(chain));

    if (error) { addIssue('critical', 'enlaces', `Página inaccesible: ${error}`, url); continue; }
    if (status >= 400) { addIssue(status === 404 ? 'warning' : 'critical', 'enlaces', `Enlace interno roto (HTTP ${status})`, url); continue; }
    if (!res || !(res.headers.get('content-type') || '').includes('text/html')) continue;

    const html = await res.text();
    const doc = parse(html);
    if (/wp-content|wp-includes/.test(html)) isWordPress = true;

    const title = doc.querySelector('title')?.text.trim() || '';
    const meta = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
    const h1s = doc.querySelectorAll('h1').length;
    const imgsSinAlt = doc.querySelectorAll('img').filter((i) => !(i.getAttribute('alt') || '').trim()).length;
    pages.set(finalUrl, { title, meta, h1s, imgsSinAlt });

    if (!title) addIssue('warning', 'seo', 'Página sin <title>', finalUrl);
    if (!meta) addIssue('notice', 'seo', 'Página sin meta description', finalUrl);
    if (h1s === 0) addIssue('notice', 'seo', 'Página sin H1', finalUrl);
    if (h1s > 1) addIssue('notice', 'seo', `Página con ${h1s} H1`, finalUrl);
    if (imgsSinAlt > 0) addIssue('notice', 'seo', `${imgsSinAlt} imágenes sin atributo alt`, finalUrl);

    for (const a of doc.querySelectorAll('a[href]')) {
      let href;
      try { href = new URL(a.getAttribute('href'), finalUrl); } catch { continue; }
      href.hash = '';
      if (!/^https?:$/.test(href.protocol)) continue;
      if (href.origin === base.origin) {
        if (!seen.has(href.href)) { seen.add(href.href); queue.push(href.href); }
      } else {
        externalLinks.add(href.href);
      }
    }
  }

  // Títulos y metas duplicados
  for (const field of ['title', 'meta']) {
    const byValue = new Map();
    for (const [url, page] of pages) {
      if (!page[field]) continue;
      if (!byValue.has(page[field])) byValue.set(page[field], []);
      byValue.get(page[field]).push(url);
    }
    for (const [value, urls] of byValue) {
      if (urls.length > 1) {
        addIssue('warning', 'seo', `${field === 'title' ? 'Título' : 'Meta description'} duplicado en ${urls.length} páginas`, urls[0], JSON.stringify({ value, urls }));
      }
    }
  }

  // Muestra de enlaces externos rotos
  for (const url of [...externalLinks].slice(0, MAX_EXTERNAL_CHECKS)) {
    try {
      const { res } = await timedFetch(url, { method: 'HEAD', timeout: 8000 });
      if (res.status === 405 || res.status === 403) continue; // muchos sitios bloquean HEAD
      if (res.status >= 400) addIssue('warning', 'enlaces', `Enlace externo roto (HTTP ${res.status})`, url);
    } catch { addIssue('notice', 'enlaces', 'Enlace externo inaccesible', url); }
  }

  // robots.txt y sitemap
  let robotsTxt = '';
  try {
    const { res } = await timedFetch(new URL('/robots.txt', base).href);
    if (res.status === 200) robotsTxt = await res.text();
    else addIssue('notice', 'seo', 'No hay robots.txt', new URL('/robots.txt', base).href);
  } catch { /* sin robots */ }
  const sitemapUrl = robotsTxt.match(/^sitemap:\s*(\S+)/im)?.[1] || new URL('/sitemap.xml', base).href;
  try {
    const { res } = await timedFetch(sitemapUrl);
    if (res.status !== 200) addIssue('warning', 'seo', `Sitemap no accesible (HTTP ${res.status})`, sitemapUrl);
  } catch { addIssue('warning', 'seo', 'Sitemap inaccesible', sitemapUrl); }

  // Seguridad: SSL, HTTP→HTTPS y cabeceras
  const security = { sslDays: null, headers: {} };
  if (base.protocol === 'https:') {
    security.sslDays = await sslDaysRemaining(base.hostname);
    if (security.sslDays !== null && security.sslDays < 14) {
      addIssue('critical', 'seguridad', `El certificado SSL caduca en ${security.sslDays} días`, base.href);
      notify(projectId, 'critical', 'ssl_expiry', `${project.name}: el certificado SSL caduca en ${security.sslDays} días`);
    }
    try {
      const { chain: httpChain, finalUrl: httpFinal } = await followRedirects(`http://${base.hostname}/`);
      if (!httpFinal.startsWith('https://')) addIssue('critical', 'seguridad', 'HTTP no redirige a HTTPS', `http://${base.hostname}/`, JSON.stringify(httpChain));
    } catch { /* puerto 80 cerrado: OK */ }
  } else {
    addIssue('critical', 'seguridad', 'El sitio no usa HTTPS', base.href);
  }
  try {
    const { res } = await timedFetch(base.href);
    const expected = {
      'strict-transport-security': ['warning', 'Falta la cabecera HSTS (Strict-Transport-Security)'],
      'x-content-type-options': ['notice', 'Falta la cabecera X-Content-Type-Options'],
      'content-security-policy': ['notice', 'Falta la cabecera Content-Security-Policy'],
      'referrer-policy': ['notice', 'Falta la cabecera Referrer-Policy'],
    };
    for (const [header, [severity, message]] of Object.entries(expected)) {
      const value = res.headers.get(header);
      security.headers[header] = value || null;
      if (!value) addIssue(severity, 'seguridad', message, base.href);
    }
  } catch { /* ya reportado por el crawl */ }

  // Comprobaciones específicas de WordPress (desde fuera, sin conector)
  if (isWordPress) {
    const wpChecks = [
      ['/readme.html', 'warning', 'readme.html de WordPress accesible (revela la versión)'],
      ['/xmlrpc.php', 'warning', 'xmlrpc.php habilitado (vector de fuerza bruta/DDoS)'],
      ['/wp-json/wp/v2/users', 'warning', 'Enumeración pública de usuarios por la API REST'],
    ];
    for (const [path, severity, message] of wpChecks) {
      try {
        const { res } = await timedFetch(new URL(path, base).href);
        const ok = path === '/xmlrpc.php' ? res.status === 405 || res.status === 200 : res.status === 200;
        if (ok) addIssue(severity, 'wordpress', message, new URL(path, base).href);
      } catch { /* inaccesible: bien */ }
    }
    try {
      const { res } = await timedFetch(new URL('/wp-content/uploads/', base).href);
      if (res.status === 200 && /index of/i.test(await res.text())) {
        addIssue('warning', 'wordpress', 'Listado de directorios activo en /wp-content/uploads/', new URL('/wp-content/uploads/', base).href);
      }
    } catch { /* ok */ }
  }

  const score = computeScore(issues);
  const summary = {
    isWordPress,
    security,
    externalLinksChecked: Math.min(externalLinks.size, MAX_EXTERNAL_CHECKS),
    counts: countBy(issues, 'severity'),
    categories: countBy(issues, 'category'),
  };

  const insertIssue = db.prepare('INSERT INTO scan_issues (scan_id, severity, category, url, message, detail) VALUES (?, ?, ?, ?, ?, ?)');
  db.transaction(() => {
    for (const i of issues) insertIssue.run(scanId, i.severity, i.category, i.url, i.message, i.detail);
    db.prepare("UPDATE scans SET finished_at = datetime('now'), pages_crawled = ?, score = ?, summary = ? WHERE id = ?")
      .run(pages.size, score, JSON.stringify(summary), scanId);
  })();

  const criticals = issues.filter((i) => i.severity === 'critical');
  if (criticals.length) {
    notify(projectId, 'critical', 'scan', `${project.name}: escaneo con ${criticals.length} problemas críticos (puntuación ${score}/100)`);
  }
  return { scanId, score, pages: pages.size, issues: issues.length };
}

// Comprobación rápida de disponibilidad (para el cron de cada pocos minutos).
export async function runUptimeCheck(projectId) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  if (!project) return;
  let up = 0, statusCode = null, ms = null;
  try {
    const result = await followRedirects(project.url, 5);
    statusCode = result.status;
    ms = result.ms;
    up = result.status >= 200 && result.status < 400 ? 1 : 0;
  } catch { up = 0; }

  const previous = db.prepare('SELECT up FROM uptime_checks WHERE project_id = ? ORDER BY id DESC LIMIT 1').get(projectId);
  db.prepare('INSERT INTO uptime_checks (project_id, up, status_code, response_ms) VALUES (?, ?, ?, ?)')
    .run(projectId, up, statusCode, ms);

  if (!up && (!previous || previous.up)) {
    notify(projectId, 'critical', 'site_down', `${project.name}: el sitio no responde (HTTP ${statusCode ?? 'sin respuesta'})`);
  } else if (up && previous && !previous.up) {
    notify(projectId, 'info', 'site_down', `${project.name}: el sitio vuelve a estar disponible`);
  }
  return { up, statusCode, ms };
}

function computeScore(issues) {
  const weights = { critical: 15, warning: 4, notice: 1 };
  const penalty = issues.reduce((sum, i) => sum + weights[i.severity], 0);
  return Math.max(0, 100 - penalty);
}

function countBy(items, key) {
  return items.reduce((acc, item) => ((acc[item[key]] = (acc[item[key]] || 0) + 1), acc), {});
}
