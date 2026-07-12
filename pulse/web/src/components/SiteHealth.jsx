import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Card, Button, Score, Badge, Empty } from './ui.jsx';

export default function SiteHealth({ project }) {
  const [scans, setScans] = useState([]);
  const [detail, setDetail] = useState(null);
  const [wp, setWp] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const list = await api.scans(project.id);
    setScans(list);
    if (list[0]) setDetail(await api.scan(list[0].id));
    setWp(await api.wp(project.id).catch(() => null));
  };
  useEffect(() => { load(); }, [project.id]);

  const scan = async () => {
    setBusy(true);
    try { await api.runScan(project.id); await load(); }
    catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  const scanWp = async () => {
    setBusy(true);
    try { setWp(await api.runWp(project.id)); }
    catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  const scan0 = detail?.scan;
  const issues = detail?.issues || [];
  const byCat = issues.reduce((a, i) => ((a[i.category] = (a[i.category] || 0) + 1), a), {});

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Salud del sitio" className="lg:col-span-1"
        action={<Button onClick={scan} disabled={busy}>{busy ? 'Analizando…' : 'Escanear'}</Button>}>
        {scan0 ? (
          <div className="space-y-4">
            <Score value={scan0.score} label={`${scan0.pages_crawled} páginas`} />
            <ul className="text-sm space-y-1">
              {Object.entries(byCat).map(([cat, n]) => (
                <li key={cat} className="flex justify-between">
                  <span className="capitalize text-muted">{cat}</span><span className="tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
            {scan0.summary?.security && (
              <p className="text-xs text-muted">
                SSL: {scan0.summary.security.sslDays != null ? `${scan0.summary.security.sslDays} días` : 'n/d'}
                {scan0.summary.isWordPress && ' · WordPress detectado'}
              </p>
            )}
          </div>
        ) : <Empty>Aún no hay escaneos. Pulsa «Escanear».</Empty>}
      </Card>

      <Card title="Problemas detectados" className="lg:col-span-2">
        {issues.length ? (
          <ul className="divide-y divide-border max-h-[28rem] overflow-y-auto -mx-2">
            {issues.map((i) => (
              <li key={i.id} className="px-2 py-3 flex gap-3 items-start">
                <Badge severity={i.severity}>{i.severity}</Badge>
                <div className="min-w-0">
                  <p className="text-sm">{i.message}</p>
                  {i.url && <p className="text-xs text-muted truncate">{i.url}</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : <Empty>Sin problemas registrados.</Empty>}
      </Card>

      <Card title="WordPress" className="lg:col-span-3"
        action={project.wp_endpoint
          ? <Button variant="ghost" onClick={scanWp} disabled={busy}>Actualizar</Button>
          : <span className="text-xs text-muted">Sin conector configurado</span>}>
        {wp ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="text-sm space-y-1">
              <Row k="WordPress" v={wp.wp_version} />
              <Row k="PHP" v={wp.php_version} />
              <Row k="MySQL" v={wp.mysql_version} />
              <Row k="Tema" v={wp.theme} />
              {wp.health?.core_update && <Row k="Actualización core" v={wp.health.core_update} warn />}
              <Row k="Tamaño BD" v={wp.health?.db_size_mb ? `${wp.health.db_size_mb} MB` : '—'} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Plugins ({wp.plugins?.length || 0})</h4>
              <ul className="text-sm space-y-1 max-h-56 overflow-y-auto">
                {(wp.plugins || []).map((p) => (
                  <li key={p.slug} className="flex items-center gap-2">
                    <span className="flex-1 truncate">{p.name} <span className="text-muted">{p.version}</span></span>
                    {p.update_available && <Badge severity="warning">↑ {p.update_available}</Badge>}
                    {p.abandoned && <Badge severity="warning">abandonado</Badge>}
                    {(p.vulns || []).length > 0 && <Badge severity="critical">{p.vulns.length} vuln</Badge>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : <Empty>Instala el plugin Pulse Connector en el sitio y guarda su URL y token en el proyecto.</Empty>}
      </Card>
    </div>
  );
}

function Row({ k, v, warn }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{k}</span>
      <span className={`font-mono ${warn ? 'text-warn' : ''}`}>{v || '—'}</span>
    </div>
  );
}
