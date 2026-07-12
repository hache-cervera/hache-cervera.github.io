import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Card, Button, Score, Badge, Empty } from './ui.jsx';

export default function AiModule({ project }) {
  const [readiness, setReadiness] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState('');
  const [newPrompt, setNewPrompt] = useState({ kind: 'recommendation', text: '' });

  const load = async () => {
    setReadiness(await api.aiReadiness(project.id).catch(() => null));
    setPrompts(await api.aiPrompts(project.id).catch(() => []));
    setResults(await api.aiResults(project.id).catch(() => []));
  };
  useEffect(() => { load(); }, [project.id]);

  const run = async (key, fn) => {
    setBusy(key);
    try { await fn(); await load(); }
    catch (e) { alert(e.message); } finally { setBusy(''); }
  };

  const addPrompt = async (e) => {
    e.preventDefault();
    if (!newPrompt.text.trim()) return;
    await api.addAiPrompt(project.id, newPrompt);
    setNewPrompt({ ...newPrompt, text: '' });
    load();
  };

  // Share de recomendación: % de respuestas que mencionan la marca vs competidores.
  const share = shareOfVoice(results);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Preparación para la IA" className="lg:col-span-1"
        action={<Button onClick={() => run('r', () => api.runAiReadiness(project.id))} disabled={busy === 'r'}>
          {busy === 'r' ? 'Midiendo…' : 'Medir'}</Button>}>
        {readiness ? (
          <div className="space-y-4">
            <Score value={readiness.score} label="AI-ready" />
            <ul className="text-sm space-y-1">
              {readiness.checks.map((c) => (
                <li key={c.id} className="flex items-start gap-2">
                  <span className={c.ok ? 'text-ok' : 'text-danger'}>{c.ok ? '✓' : '✕'}</span>
                  <span className={c.ok ? 'text-muted' : ''}>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : <Empty>Mide si un asistente IA puede leer y usar el sitio.</Empty>}
      </Card>

      <Card title="Share de recomendación" className="lg:col-span-2"
        action={<Button onClick={() => run('p', () => api.runAiProbe(project.id))} disabled={busy === 'p' || !prompts.length}>
          {busy === 'p' ? 'Sondeando…' : 'Sondear modelos'}</Button>}>
        {share.total ? (
          <div className="space-y-4">
            <div className="flex gap-8">
              <Score value={share.brandPct} label="menciona la marca" />
              <div className="flex-1">
                <p className="text-sm text-muted mb-2">Basado en {share.total} respuestas de {share.providers.join(', ')}</p>
                {share.competitors.length > 0 && (
                  <ul className="text-sm space-y-1">
                    {share.competitors.map(([name, pct]) => (
                      <li key={name} className="flex justify-between">
                        <span>{name}</span><span className="tabular-nums text-muted">{pct}%</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {share.hallucinations.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="text-sm font-medium text-warn mb-1">Posibles alucinaciones detectadas</p>
                <ul className="text-xs text-muted space-y-1">
                  {share.hallucinations.slice(0, 5).map((h, i) => <li key={i}>· {h}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : <Empty>Añade preguntas abajo y pulsa «Sondear modelos» (requiere una clave de IA en .env).</Empty>}
      </Card>

      <Card title="Preguntas del sondeo" className="lg:col-span-3">
        <form onSubmit={addPrompt} className="flex flex-col sm:flex-row gap-3 mb-4">
          <select value={newPrompt.kind} onChange={(e) => setNewPrompt({ ...newPrompt, kind: e.target.value })}
            className="h-9 px-3 rounded-md bg-surface-2 border border-border text-sm">
            <option value="recommendation">Recomendación</option>
            <option value="perception">Percepción</option>
          </select>
          <input value={newPrompt.text} onChange={(e) => setNewPrompt({ ...newPrompt, text: e.target.value })}
            placeholder="p. ej. ¿Cuál es la mejor agencia de diseño en Valencia?"
            className="flex-1 h-9 px-3 rounded-md bg-surface-2 border border-border text-sm" />
          <Button type="submit">Añadir</Button>
        </form>
        {prompts.length ? (
          <ul className="text-sm divide-y divide-border">
            {prompts.map((p) => (
              <li key={p.id} className="py-2 flex gap-3">
                <Badge severity="info">{p.kind === 'recommendation' ? 'recom.' : 'percep.'}</Badge>
                <span>{p.text}</span>
              </li>
            ))}
          </ul>
        ) : <Empty>Sin preguntas todavía.</Empty>}
      </Card>
    </div>
  );
}

function shareOfVoice(results) {
  if (!results.length) return { total: 0 };
  const total = results.length;
  const brand = results.filter((r) => r.brand_mentioned).length;
  const providers = [...new Set(results.map((r) => r.provider))];
  const compCounts = {};
  const hallucinations = [];
  for (const r of results) {
    for (const c of r.competitors_mentioned || []) compCounts[c] = (compCounts[c] || 0) + 1;
    for (const h of r.hallucinations || []) hallucinations.push(h);
  }
  const competitors = Object.entries(compCounts)
    .map(([n, c]) => [n, Math.round((c / total) * 100)])
    .sort((a, b) => b[1] - a[1]);
  return { total, brandPct: Math.round((brand / total) * 100), providers, competitors, hallucinations };
}
