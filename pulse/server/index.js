import 'dotenv/config';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import cron from 'node-cron';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

import { db, migrate } from './db/index.js';
import { runSiteScan, runUptimeCheck } from './collectors/site-health.js';
import { runWpHealth } from './collectors/wp-health.js';
import { runAiReadiness, computeAiReadiness } from './collectors/ai-readiness.js';
import { runAiProbe } from './collectors/ai-probe.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
migrate();

const app = Fastify({ logger: true });
const parseJson = (row, ...fields) => {
  for (const f of fields) if (row?.[f]) try { row[f] = JSON.parse(row[f]); } catch { /* deja el texto */ }
  return row;
};

// --- Proyectos ---
app.get('/api/projects', async () => db.prepare('SELECT * FROM projects ORDER BY id').all()
  .map((p) => parseJson(p, 'brand_terms', 'competitors')));

app.post('/api/projects', async (req, reply) => {
  const { name, url, brand_terms = [], competitors = [], wp_endpoint = null, wp_token = null } = req.body || {};
  if (!name || !url) return reply.code(400).send({ error: 'name y url son obligatorios' });
  const info = db.prepare(`INSERT INTO projects (name, url, brand_terms, competitors, wp_endpoint, wp_token)
    VALUES (?, ?, ?, ?, ?, ?)`).run(name, url, JSON.stringify(brand_terms), JSON.stringify(competitors), wp_endpoint, wp_token);
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
});

app.delete('/api/projects/:id', async (req) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  return { ok: true };
});

// --- Salud del sitio ---
app.get('/api/projects/:id/scans', async (req) => db.prepare(
  'SELECT id, started_at, finished_at, pages_crawled, score FROM scans WHERE project_id = ? ORDER BY id DESC LIMIT 20').all(req.params.id));

app.get('/api/scans/:id', async (req) => {
  const scan = parseJson(db.prepare('SELECT * FROM scans WHERE id = ?').get(req.params.id), 'summary');
  const issues = db.prepare('SELECT * FROM scan_issues WHERE scan_id = ? ORDER BY CASE severity WHEN \'critical\' THEN 0 WHEN \'warning\' THEN 1 ELSE 2 END').all(req.params.id);
  return { scan, issues };
});

app.post('/api/projects/:id/scan', async (req) => runSiteScan(Number(req.params.id)));

app.get('/api/projects/:id/uptime', async (req) => db.prepare(
  'SELECT ts, up, status_code, response_ms FROM uptime_checks WHERE project_id = ? ORDER BY id DESC LIMIT 100').all(req.params.id));

app.get('/api/projects/:id/wp', async (req) => {
  const snap = db.prepare('SELECT * FROM wp_snapshots WHERE project_id = ? ORDER BY id DESC LIMIT 1').get(req.params.id);
  return snap ? parseJson(snap, 'plugins', 'errors', 'health') : null;
});
app.post('/api/projects/:id/wp', async (req) => runWpHealth(Number(req.params.id)));

// --- Módulo IA ---
app.get('/api/projects/:id/ai-readiness', async (req) => {
  const row = db.prepare('SELECT * FROM ai_readiness WHERE project_id = ? ORDER BY id DESC LIMIT 1').get(req.params.id);
  return row ? parseJson(row, 'checks') : null;
});
app.post('/api/projects/:id/ai-readiness', async (req) => runAiReadiness(Number(req.params.id)));

// Comparativa de preparación para la IA: tu sitio frente a tus competidores.
app.post('/api/projects/:id/ai-benchmark', async (req) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return { error: 'proyecto no encontrado' };
  const competitors = JSON.parse(project.competitors || '[]').filter((c) => c.url);
  const targets = [{ name: project.name, url: project.url, isProject: true }, ...competitors];
  const results = await Promise.all(targets.map(async (t) => {
    try {
      const { score } = await computeAiReadiness(t.url);
      return { name: t.name, url: t.url, isProject: !!t.isProject, score };
    } catch {
      return { name: t.name, url: t.url, isProject: !!t.isProject, score: null };
    }
  }));
  return results.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
});

app.get('/api/projects/:id/ai-prompts', async (req) => db.prepare('SELECT * FROM ai_prompts WHERE project_id = ?').all(req.params.id));
app.post('/api/projects/:id/ai-prompts', async (req) => {
  const { kind, text } = req.body || {};
  const info = db.prepare('INSERT INTO ai_prompts (project_id, kind, text) VALUES (?, ?, ?)').run(req.params.id, kind, text);
  return db.prepare('SELECT * FROM ai_prompts WHERE id = ?').get(info.lastInsertRowid);
});

app.get('/api/projects/:id/ai-results', async (req) => db.prepare(
  'SELECT * FROM ai_results WHERE project_id = ? ORDER BY id DESC LIMIT 100').all(req.params.id)
  .map((r) => parseJson(r, 'competitors_mentioned', 'hallucinations', 'analysis')));
app.post('/api/projects/:id/ai-probe', async (req) => runAiProbe(Number(req.params.id)));

// --- Alertas ---
app.get('/api/alerts', async () => db.prepare(
  'SELECT a.*, p.name AS project FROM alerts a JOIN projects p ON p.id = a.project_id ORDER BY a.id DESC LIMIT 100').all());

// --- Frontend compilado (si existe) ---
const dist = join(__dirname, '..', 'web', 'dist');
if (existsSync(dist)) app.register(fastifyStatic, { root: dist });

// --- Tareas programadas ---
function scheduleJobs() {
  cron.schedule('*/5 * * * *', () => runAllProjects(runUptimeCheck, 'uptime'));
  cron.schedule('0 3 * * *', () => runAllProjects((id) => runSiteScan(id), 'scan diario'));
  cron.schedule('0 4 * * 1', () => runAllProjects((id) => runAiReadiness(id).catch(() => {}), 'ai-readiness semanal'));
}
function runAllProjects(fn, label) {
  for (const { id } of db.prepare('SELECT id FROM projects').all()) {
    Promise.resolve(fn(id)).catch((err) => app.log.error(`${label} proyecto ${id}: ${err.message}`));
  }
}

const port = Number(process.env.PORT || 4321);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  scheduleJobs();
  app.log.info(`Pulse escuchando en http://localhost:${port}`);
}).catch((err) => { app.log.error(err); process.exit(1); });
