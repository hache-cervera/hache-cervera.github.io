import { useEffect, useState } from 'react';
import { api } from './lib/api.js';
import { Button } from './components/ui.jsx';
import SiteHealth from './components/SiteHealth.jsx';
import AiModule from './components/AiModule.jsx';

const TABS = [
  { id: 'site', label: 'Salud del sitio' },
  { id: 'ai', label: 'Módulo IA' },
];

export default function App() {
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState(null);
  const [tab, setTab] = useState('site');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const list = await api.projects();
    setProjects(list);
    setActive((a) => a ?? list[0] ?? null);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="px-6 py-5 border-b border-border">
          <h1 className="text-[1.75rem] font-bold tracking-tight">Pulse</h1>
          <p className="text-xs text-muted mt-0.5">medición y analítica digital</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {projects.map((p) => (
            <button key={p.id} onClick={() => setActive(p)}
              className={`w-full text-left px-6 py-3 text-sm transition-colors ${active?.id === p.id ? 'bg-surface-2 border-l-2 border-primary' : 'hover:bg-surface-2 border-l-2 border-transparent'}`}>
              <span className="block font-medium truncate">{p.name}</span>
              <span className="block text-xs text-muted truncate">{p.url}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full" onClick={() => setAdding(true)}>+ Proyecto</Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {active ? (
          <>
            <header className="px-8 py-6 border-b border-border flex items-end justify-between">
              <div>
                <h2 className="text-[2.25rem] font-bold tracking-tight leading-tight">{active.name}</h2>
                <a href={active.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">{active.url}</a>
              </div>
              <div className="flex gap-2">
                {TABS.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${tab === t.id ? 'bg-primary text-white' : 'text-muted hover:bg-surface-2'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </header>
            <div className="p-8">
              {tab === 'site' ? <SiteHealth project={active} /> : <AiModule project={active} />}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-muted">
            Crea tu primer proyecto para empezar.
          </div>
        )}
      </main>

      {adding && <AddProject onClose={() => setAdding(false)} onCreated={(p) => { setAdding(false); setActive(p); load(); }} />}
    </div>
  );
}

function AddProject({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', url: '', brand_terms: '', competitors: '', wp_endpoint: '', wp_token: '' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const p = await api.createProject({
        name: form.name,
        url: form.url,
        brand_terms: form.brand_terms.split(',').map((s) => s.trim()).filter(Boolean),
        competitors: form.competitors.split(',').map((s) => s.trim()).filter(Boolean).map((name) => ({ name })),
        wp_endpoint: form.wp_endpoint || null,
        wp_token: form.wp_token || null,
      });
      onCreated(p);
    } catch (e) { setErr(e.message); }
  };

  const field = (k, label, ph) => (
    <label className="block">
      <span className="text-sm text-muted">{label}</span>
      <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={ph}
        className="mt-1 w-full h-9 px-3 rounded-md bg-surface-2 border border-border text-sm" />
    </label>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="bg-surface border border-border rounded-card w-full max-w-md p-6 space-y-4">
        <h3 className="text-[1.375rem] font-semibold">Nuevo proyecto</h3>
        {field('name', 'Nombre', 'Cliente S.L.')}
        {field('url', 'URL', 'https://cliente.com')}
        {field('brand_terms', 'Términos de marca (coma)', 'Cliente, Cliente SL')}
        {field('competitors', 'Competidores (coma)', 'Rival A, Rival B')}
        {field('wp_endpoint', 'URL del sitio WordPress (opcional)', 'https://cliente.com')}
        {field('wp_token', 'Token del conector WP (opcional)', '')}
        {err && <p className="text-danger text-sm">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Crear</Button>
        </div>
      </form>
    </div>
  );
}
