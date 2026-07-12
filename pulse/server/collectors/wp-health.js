import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { db, dataDir } from '../db/index.js';
import { notify } from '../alerts/index.js';

const WORDFENCE_FEED = 'https://www.wordfence.com/api/intelligence/v2/vulnerabilities/scanner';
const ABANDONED_YEARS = 2;

// Recoge la instantánea de salud de un sitio WordPress vía el plugin Pulse Connector.
export async function runWpHealth(projectId) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  if (!project?.wp_endpoint || !project?.wp_token) return null;

  const url = new URL('/wp-json/pulse/v1/health', project.wp_endpoint).href;
  const res = await fetch(url, {
    headers: { 'X-Pulse-Token': project.wp_token },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Conector WP respondió HTTP ${res.status}`);
  const data = await res.json();

  const vulns = await loadWordfenceFeed();
  for (const plugin of data.plugins) {
    plugin.abandoned = await isAbandoned(plugin.slug);
    plugin.vulns = findVulns(vulns, plugin.slug, plugin.version);
    for (const vuln of plugin.vulns) {
      if (vuln.critical) {
        notify(projectId, 'critical', 'vuln',
          `${project.name}: vulnerabilidad crítica en el plugin "${plugin.name}" ${plugin.version} — ${vuln.title}. Actualiza ya.`);
      }
    }
  }

  db.prepare(`INSERT INTO wp_snapshots (project_id, wp_version, php_version, mysql_version, theme, plugins, errors, health)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(projectId, data.wp_version, data.php_version, data.mysql_version, data.theme,
      JSON.stringify(data.plugins), JSON.stringify(data.errors), JSON.stringify(data.health));

  const fatalSources = Object.entries(data.errors || {}).filter(([, e]) => e.fatal > 0);
  for (const [source, e] of fatalSources) {
    notify(projectId, 'warning', 'scan', `${project.name}: ${e.fatal} errores fatales de PHP causados por "${source}"`);
  }
  return data;
}

// Feed de vulnerabilidades de Wordfence Intelligence (edición comunitaria, gratuita), cacheado 24 h.
async function loadWordfenceFeed() {
  const cacheDir = join(dataDir, 'cache');
  mkdirSync(cacheDir, { recursive: true });
  const cacheFile = join(cacheDir, 'wordfence-scanner.json');
  if (existsSync(cacheFile) && Date.now() - statSync(cacheFile).mtimeMs < 24 * 3600 * 1000) {
    return JSON.parse(readFileSync(cacheFile, 'utf8'));
  }
  try {
    const res = await fetch(WORDFENCE_FEED, { signal: AbortSignal.timeout(120000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const feed = await res.json();
    writeFileSync(cacheFile, JSON.stringify(feed));
    return feed;
  } catch (err) {
    console.error('Wordfence feed:', err.message);
    return existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : {};
  }
}

function findVulns(feed, slug, version) {
  const found = [];
  for (const vuln of Object.values(feed)) {
    for (const software of vuln.software || []) {
      if (software.type !== 'plugin' || software.slug !== slug) continue;
      const affected = Object.values(software.affected_versions || {}).some((range) => inRange(version, range));
      if (affected) {
        found.push({
          title: vuln.title,
          severity: vuln.cvss?.rating || 'unknown',
          critical: ['critical', 'high'].includes((vuln.cvss?.rating || '').toLowerCase()),
          cve: vuln.cve || null,
        });
      }
    }
  }
  return found;
}

function inRange(version, range) {
  const from = range.from_version === '*' ? null : range.from_version;
  const to = range.to_version === '*' ? null : range.to_version;
  if (from) {
    const cmp = compareVersions(version, from);
    if (cmp < 0 || (cmp === 0 && !range.from_inclusive)) return false;
  }
  if (to) {
    const cmp = compareVersions(version, to);
    if (cmp > 0 || (cmp === 0 && !range.to_inclusive)) return false;
  }
  return true;
}

function compareVersions(a, b) {
  const pa = String(a).split(/[.-]/).map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split(/[.-]/).map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  }
  return 0;
}

// Un plugin está abandonado si wordpress.org no registra updates en 2+ años.
async function isAbandoned(slug) {
  try {
    const res = await fetch(`https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=${encodeURIComponent(slug)}&request[fields][last_updated]=1`,
      { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null; // plugin de pago o privado: no se puede saber
    const info = await res.json();
    if (!info?.last_updated) return null;
    return (Date.now() - new Date(info.last_updated)) > ABANDONED_YEARS * 365 * 86400000;
  } catch { return null; }
}
