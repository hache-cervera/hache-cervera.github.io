import { db } from '../db/index.js';

// Guarda la alerta y, si hay bot de Telegram configurado, la envía también.
export function notify(projectId, severity, type, message) {
  db.prepare('INSERT INTO alerts (project_id, severity, type, message) VALUES (?, ?, ?, ?)')
    .run(projectId, severity, type, message);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const icon = severity === 'critical' ? '🔴' : severity === 'warning' ? '🟠' : 'ℹ️';
  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: `${icon} ${message}` }),
    signal: AbortSignal.timeout(10000),
  }).catch((err) => console.error('Telegram:', err.message));
}
