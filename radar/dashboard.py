"""Panel local para revisar ofertas.

Levanta un servidor minimo (libreria estandar, sin dependencias) que muestra
las ofertas agrupadas por veredicto y permite marcarlas como aplicada,
guardada o descartada. Los cambios van directos a SQLite.

  python -m radar.cli panel
"""

import json
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

from . import store

ORANGE = "#FF3C00"

PAGE = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Radar de empleo</title>
<style>
  :root {
    --bg:#0f1115; --card:#171a21; --line:#262b36; --text:#e8eaed;
    --muted:#9aa3b2; --orange:#FF3C00; --green:#2ea043; --amber:#d29922;
    --red:#8b949e;
  }
  @media (prefers-color-scheme: light) {
    :root { --bg:#f6f7f9; --card:#fff; --line:#e3e6ea; --text:#1a1d21;
            --muted:#5b6472; }
  }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--text);
         font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
  header { padding:22px 28px; border-bottom:1px solid var(--line);
           display:flex; align-items:baseline; gap:18px; flex-wrap:wrap; }
  h1 { margin:0; font-size:20px; letter-spacing:-.02em; }
  h1 span { color:var(--orange); }
  .counts { color:var(--muted); font-size:13px; }
  main { padding:22px 28px; max-width:1080px; margin:0 auto; }
  .tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
  .tab { padding:7px 14px; border:1px solid var(--line); border-radius:999px;
         background:transparent; color:var(--muted); cursor:pointer; font-size:13px; }
  .tab.on { background:var(--orange); border-color:var(--orange); color:#fff; }
  .job { background:var(--card); border:1px solid var(--line);
         border-left:3px solid var(--line); border-radius:10px;
         padding:16px 18px; margin-bottom:12px; }
  .job.apply  { border-left-color:var(--green); }
  .job.review { border-left-color:var(--amber); }
  .job.reject { border-left-color:var(--red); opacity:.72; }
  .job h2 { margin:0 0 4px; font-size:16px; }
  .job h2 a { color:var(--text); text-decoration:none; }
  .job h2 a:hover { color:var(--orange); }
  .meta { color:var(--muted); font-size:13px; margin-bottom:10px; }
  .badge { display:inline-block; padding:2px 8px; border-radius:5px;
           font-size:11px; font-weight:600; text-transform:uppercase;
           letter-spacing:.04em; margin-right:8px; }
  .b-apply  { background:rgba(46,160,67,.16); color:var(--green); }
  .b-review { background:rgba(210,153,34,.16); color:var(--amber); }
  .b-reject { background:rgba(139,148,158,.16); color:var(--muted); }
  .reason { margin:8px 0; }
  ul { margin:6px 0; padding-left:20px; }
  li { margin:2px 0; }
  .concerns { color:var(--amber); font-size:13.5px; }
  .highlights { color:var(--muted); font-size:13.5px; }
  .actions { margin-top:12px; display:flex; gap:8px; flex-wrap:wrap; }
  button.act { padding:6px 12px; border:1px solid var(--line);
               background:transparent; color:var(--text); border-radius:7px;
               cursor:pointer; font-size:13px; }
  button.act:hover { border-color:var(--orange); color:var(--orange); }
  .status { font-size:12px; color:var(--muted); margin-left:auto;
            align-self:center; }
  .empty { color:var(--muted); padding:40px; text-align:center; }
</style>
</head>
<body>
<header>
  <h1>Radar<span>.</span> de empleo</h1>
  <div class="counts" id="counts"></div>
</header>
<main>
  <div class="tabs" id="tabs"></div>
  <div id="list"></div>
</main>
<script>
let JOBS = [];
let filter = 'apply';

function esc(s){ return (s||'').replace(/[&<>"]/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function render(){
  const tabs = [
    ['apply','Aplicar'], ['review','Revisar'], ['reject','Descartadas'],
    ['aplicada','Ya aplicadas'], ['guardada','Guardadas']
  ];
  const counts = {};
  JOBS.forEach(j => {
    counts[j.verdict] = (counts[j.verdict]||0)+1;
    counts[j.status] = (counts[j.status]||0)+1;
  });
  document.getElementById('tabs').innerHTML = tabs.map(([k,label]) =>
    `<button class="tab ${k===filter?'on':''}" onclick="setFilter('${k}')">
       ${label} (${counts[k]||0})</button>`).join('');
  document.getElementById('counts').textContent =
    `${JOBS.length} ofertas en total · ${counts['apply']||0} listas para aplicar · ${counts['review']||0} por revisar`;

  const shown = JOBS.filter(j =>
    ['aplicada','guardada','descartada'].includes(filter)
      ? j.status === filter
      : (j.verdict === filter && j.status === 'nueva'));

  document.getElementById('list').innerHTML = shown.length ? shown.map(j => `
    <div class="job ${esc(j.verdict)}">
      <h2><a href="${esc(j.url)}" target="_blank" rel="noopener">${esc(j.title)}</a></h2>
      <div class="meta">
        <span class="badge b-${esc(j.verdict)}">${esc(j.verdict)} · ${j.score}</span>
        ${esc(j.company||'(sin empresa)')} · ${esc(j.location||'remoto')}
        · ${esc(j.source)} ${j.date ? '· '+esc(j.date) : ''}
        ${j.salary ? '· '+esc(j.salary) : ''}
      </div>
      <div class="reason">${esc(j.reason)}</div>
      ${j.concerns && j.concerns.length ? `<div class="concerns"><strong>Comprobar:</strong>
        <ul>${j.concerns.map(c=>`<li>${esc(c)}</li>`).join('')}</ul></div>` : ''}
      ${j.highlights && j.highlights.length ? `<div class="highlights"><strong>Destacar al aplicar:</strong>
        <ul>${j.highlights.map(h=>`<li>${esc(h)}</li>`).join('')}</ul></div>` : ''}
      <div class="actions">
        <button class="act" onclick="mark('${j.fingerprint}','aplicada')">He aplicado</button>
        <button class="act" onclick="mark('${j.fingerprint}','guardada')">Guardar</button>
        <button class="act" onclick="mark('${j.fingerprint}','descartada')">Descartar</button>
        <button class="act" onclick="mark('${j.fingerprint}','nueva')">Volver a nueva</button>
        <span class="status">${esc(j.status)}</span>
      </div>
    </div>`).join('') : '<div class="empty">Nada por aquí.</div>';
}

function setFilter(f){ filter = f; render(); }

async function mark(fp, status){
  await fetch('/api/status', {
    method:'POST', headers:{'content-type':'application/json'},
    body: JSON.stringify({fingerprint:fp, status:status})
  });
  const j = JOBS.find(x=>x.fingerprint===fp);
  if (j) j.status = status;
  render();
}

fetch('/api/jobs').then(r=>r.json()).then(d=>{ JOBS=d; render(); });
</script>
</body>
</html>"""


class Handler(BaseHTTPRequestHandler):
    db_path = None

    def log_message(self, *args):
        pass  # sin ruido en consola

    def _send(self, code, body, ctype="application/json; charset=utf-8"):
        payload = body.encode("utf-8") if isinstance(body, str) else body
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/":
            return self._send(200, PAGE, "text/html; charset=utf-8")
        if path == "/api/jobs":
            conn = store.connect(self.db_path)
            rows = store.query(conn, limit=800)
            for r in rows:
                r["concerns"] = json.loads(r.get("concerns") or "[]")
                r["highlights"] = json.loads(r.get("highlights") or "[]")
                r.pop("description", None)  # aligerar la respuesta
            conn.close()
            return self._send(200, json.dumps(rows, ensure_ascii=False))
        self._send(404, json.dumps({"error": "no encontrado"}))

    def do_POST(self):
        if urlparse(self.path).path != "/api/status":
            return self._send(404, json.dumps({"error": "no encontrado"}))
        length = int(self.headers.get("Content-Length") or 0)
        try:
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            conn = store.connect(self.db_path)
            store.set_status(conn, data["fingerprint"], data["status"])
            conn.close()
            self._send(200, json.dumps({"ok": True}))
        except Exception as e:
            self._send(400, json.dumps({"error": str(e)}))


def serve(port=8765, db_path=None, open_browser=True):
    Handler.db_path = db_path
    server = HTTPServer(("127.0.0.1", port), Handler)
    url = f"http://127.0.0.1:{port}/"
    print(f"Panel de Radar en {url}")
    print("Deja esta ventana abierta mientras lo uses. Ctrl+C para cerrar.")
    if open_browser:
        try:
            webbrowser.open(url)
        except Exception:
            pass
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nPanel cerrado.")
        server.server_close()
