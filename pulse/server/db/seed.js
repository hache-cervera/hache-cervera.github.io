import { db, migrate } from './index.js';

// Datos de ejemplo para probar la interfaz sin configurar nada.
migrate();

const exists = db.prepare('SELECT id FROM projects WHERE url = ?').get('https://hache-cervera.github.io');
if (exists) {
  console.log('El proyecto de ejemplo ya existe (id', exists.id, ')');
  process.exit(0);
}

const info = db.prepare(`INSERT INTO projects (name, url, brand_terms, competitors)
  VALUES (?, ?, ?, ?)`).run(
  'Hache Cervera (demo)',
  'https://hache-cervera.github.io',
  JSON.stringify(['Hache Cervera', 'Hache']),
  JSON.stringify([{ name: 'Estudio Rival', url: 'https://example.com' }]),
);
const id = info.lastInsertRowid;

db.prepare('INSERT INTO ai_prompts (project_id, kind, text) VALUES (?, ?, ?)')
  .run(id, 'recommendation', '¿Quién es un buen diseñador web y de motion en España?');
db.prepare('INSERT INTO ai_prompts (project_id, kind, text) VALUES (?, ?, ?)')
  .run(id, 'perception', '¿Qué sabes sobre Hache Cervera, el diseñador?');

console.log('Proyecto de ejemplo creado (id', id, '). Arranca el server y pulsa «Escanear».');
