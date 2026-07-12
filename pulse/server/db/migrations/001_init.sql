CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,                -- URL base del sitio, p. ej. https://cliente.com
  brand_terms TEXT NOT NULL DEFAULT '[]',   -- JSON: nombres por los que se conoce la marca
  competitors TEXT NOT NULL DEFAULT '[]',   -- JSON: [{name, url}]
  wp_endpoint TEXT,                 -- URL del conector WordPress (si es un sitio WP)
  wp_token TEXT,                    -- token compartido con el conector
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Comprobaciones de disponibilidad (cada pocos minutos)
CREATE TABLE uptime_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  up INTEGER NOT NULL,              -- 1/0
  status_code INTEGER,
  response_ms INTEGER
);
CREATE INDEX idx_uptime_project_ts ON uptime_checks(project_id, ts);

-- Escaneos completos de salud del sitio (crawler + seguridad)
CREATE TABLE scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT,
  pages_crawled INTEGER NOT NULL DEFAULT 0,
  score INTEGER,                    -- 0-100
  summary TEXT                      -- JSON: contadores por categoría, ssl, cabeceras, wp...
);

CREATE TABLE scan_issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scan_id INTEGER NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('critical','warning','notice')),
  category TEXT NOT NULL,           -- seguridad | enlaces | redirecciones | seo | wordpress | rendimiento
  url TEXT,
  message TEXT NOT NULL,
  detail TEXT
);
CREATE INDEX idx_issues_scan ON scan_issues(scan_id);

-- Instantáneas del conector WordPress
CREATE TABLE wp_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  wp_version TEXT,
  php_version TEXT,
  mysql_version TEXT,
  theme TEXT,
  plugins TEXT,                     -- JSON: [{slug, name, version, active, update_available, abandoned, vulns:[...]}]
  errors TEXT,                      -- JSON: errores PHP agrupados por plugin causante
  health TEXT                       -- JSON: cron, db_size_mb, updates core...
);

-- Módulo IA: preparación del sitio para la era IA (sin claves)
CREATE TABLE ai_readiness (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  score INTEGER NOT NULL,
  checks TEXT NOT NULL              -- JSON: detalle de cada comprobación
);

-- Módulo IA: preguntas configuradas por proyecto
CREATE TABLE ai_prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('perception','recommendation')),
  text TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

-- Módulo IA: respuestas de los modelos y su análisis
CREATE TABLE ai_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  prompt_id INTEGER NOT NULL REFERENCES ai_prompts(id) ON DELETE CASCADE,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  provider TEXT NOT NULL,           -- openai | anthropic | perplexity
  model TEXT NOT NULL,
  brand_mentioned INTEGER NOT NULL DEFAULT 0,
  competitors_mentioned TEXT NOT NULL DEFAULT '[]',  -- JSON de nombres
  sentiment TEXT,                   -- positivo | neutro | negativo
  hallucinations TEXT,              -- JSON: afirmaciones dudosas detectadas
  answer TEXT NOT NULL,
  analysis TEXT                     -- JSON del análisis completo
);
CREATE INDEX idx_ai_results_project_ts ON ai_results(project_id, ts);

CREATE TABLE alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  severity TEXT NOT NULL CHECK (severity IN ('critical','warning','info')),
  type TEXT NOT NULL,               -- site_down | ssl_expiry | vuln | scan | ai
  message TEXT NOT NULL,
  seen INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_alerts_project ON alerts(project_id, seen);
