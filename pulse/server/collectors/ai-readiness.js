import { parse } from 'node-html-parser';
import { db } from '../db/index.js';
import { timedFetch } from '../lib/http.js';

const AI_BOTS = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot', 'anthropic-ai', 'OAI-SearchBot'];

// ¿Está el sitio preparado para la era IA? Comprobaciones sin ninguna clave de API.
export async function runAiReadiness(projectId) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  if (!project) throw new Error(`Proyecto ${projectId} no existe`);
  const base = new URL(project.url);
  const checks = [];
  const add = (id, label, ok, weight, detail = null) => checks.push({ id, label, ok, weight, detail });

  // llms.txt: el "robots.txt para LLMs"
  try {
    const { res } = await timedFetch(new URL('/llms.txt', base).href);
    add('llms_txt', 'Existe llms.txt', res.status === 200, 10);
  } catch { add('llms_txt', 'Existe llms.txt', false, 10); }

  // robots.txt: ¿qué bots de IA tienen permitido leer el sitio?
  let robotsTxt = '';
  try {
    const { res } = await timedFetch(new URL('/robots.txt', base).href);
    if (res.status === 200) robotsTxt = await res.text();
  } catch { /* sin robots */ }
  const botAccess = {};
  for (const bot of AI_BOTS) botAccess[bot] = robotsAllows(robotsTxt, bot);
  const allowedBots = Object.values(botAccess).filter(Boolean).length;
  add('ai_bots', `Bots de IA con acceso permitido (${allowedBots}/${AI_BOTS.length})`,
    allowedBots >= AI_BOTS.length - 1, 15, botAccess);

  // Página principal: datos estructurados, metadatos y extractabilidad
  let doc = null, html = '';
  try {
    const { res } = await timedFetch(base.href);
    html = await res.text();
    doc = parse(html);
  } catch { /* inaccesible */ }

  if (doc) {
    const jsonLdTypes = [];
    for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const parsed = JSON.parse(script.text);
        for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
          const types = [].concat(node['@type'] || [], (node['@graph'] || []).map((g) => g['@type']));
          jsonLdTypes.push(...types.flat().filter(Boolean));
        }
      } catch { /* JSON-LD inválido */ }
    }
    add('structured_data', 'Datos estructurados JSON-LD presentes', jsonLdTypes.length > 0, 20, { types: [...new Set(jsonLdTypes)] });

    const title = doc.querySelector('title')?.text.trim();
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content');
    const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
    add('metadata', 'Título, descripción y Open Graph completos', Boolean(title && description && ogTitle), 10);

    const text = doc.text.replace(/\s+/g, ' ').trim();
    const ratio = html.length ? text.length / html.length : 0;
    add('extractable', 'Contenido extraíble sin ejecutar JavaScript', text.length > 500 && ratio > 0.05, 15,
      { textLength: text.length, ratio: Number(ratio.toFixed(3)) });

    const hasContact = /tel:|mailto:/.test(html) || jsonLdTypes.some((t) => ['LocalBusiness', 'Organization'].includes(t));
    add('contact', 'Datos de contacto detectables por un agente', hasContact, 10);

    const forms = doc.querySelectorAll('form');
    const labelled = forms.filter((f) => f.querySelectorAll('label').length > 0 ||
      f.querySelectorAll('[aria-label]').length > 0).length;
    add('forms', 'Formularios usables por un agente (con etiquetas)', forms.length === 0 || labelled === forms.length, 10,
      { forms: forms.length, labelled });

    const headings = doc.querySelectorAll('h1, h2, h3').length;
    add('headings', 'Estructura de encabezados clara', headings >= 3, 10, { headings });
  } else {
    add('reachable', 'Página principal accesible', false, 90);
  }

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.reduce((sum, c) => sum + (c.ok ? c.weight : 0), 0);
  const score = Math.round((earned / totalWeight) * 100);

  db.prepare('INSERT INTO ai_readiness (project_id, score, checks) VALUES (?, ?, ?)')
    .run(projectId, score, JSON.stringify(checks));
  return { score, checks };
}

// Interpretación mínima de robots.txt: ¿puede este user-agent leer "/"?
function robotsAllows(robotsTxt, bot) {
  if (!robotsTxt) return true; // sin robots.txt, todo permitido
  const groups = [];
  let current = null;
  for (const raw of robotsTxt.split('\n')) {
    const line = raw.replace(/#.*/, '').trim();
    const [key, ...rest] = line.split(':');
    const value = rest.join(':').trim();
    if (!value && key !== 'disallow') continue;
    const k = key.toLowerCase().trim();
    if (k === 'user-agent') {
      if (!current || current.rules.length) { current = { agents: [], rules: [] }; groups.push(current); }
      current.agents.push(value.toLowerCase());
    } else if ((k === 'disallow' || k === 'allow') && current) {
      current.rules.push({ allow: k === 'allow', path: value });
    }
  }
  const botGroup = groups.find((g) => g.agents.includes(bot.toLowerCase()));
  const group = botGroup || groups.find((g) => g.agents.includes('*'));
  if (!group) return true;
  const blocked = group.rules.some((r) => !r.allow && (r.path === '/' || r.path === ''));
  const allowedRoot = group.rules.some((r) => r.allow && r.path === '/');
  return !blocked || allowedRoot;
}
