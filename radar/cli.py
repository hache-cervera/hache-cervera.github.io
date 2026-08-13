"""Punto de entrada de Radar.

  python -m radar.cli buscar          busca, evalua y guarda
  python -m radar.cli buscar --seco   igual pero sin guardar ni subir nada
  python -m radar.cli panel           abre el panel local para revisar
  python -m radar.cli sheet           sube a Google Sheets lo pendiente
  python -m radar.cli estado          resumen de lo que hay en la base
"""

import argparse
import sys
import time

from . import judge as judge_mod
from . import prefilter as prefilter_mod
from . import sources, store

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except AttributeError:
    pass

VERDICT_LABEL = {"apply": "APLICAR", "review": "revisar", "reject": "descartar"}


def _log(msg):
    print(f"{time.strftime('%H:%M:%S')}  {msg}", flush=True)


def cmd_buscar(args):
    _log("Recolectando ofertas de todas las fuentes...")
    jobs, problems, stats = sources.collect(
        only=set(args.fuente) if args.fuente else None,
        with_detail=not args.rapido)

    _log(f"{len(jobs)} ofertas en bruto: " +
         ", ".join(f"{k}={v}" for k, v in sorted(stats.items()) if v))
    for p in problems[:12]:
        _log(f"  incidencia: {p[:150]}")

    passed, rejected = prefilter_mod.prefilter(jobs)
    _log(f"Prefiltro: pasan {len(passed)}, descartadas {len(rejected)} "
         f"(no remotas, freelance u otra profesión)")

    conn = store.connect()
    known = store.known_fingerprints(conn)
    fresh = [j for j in passed if j.fingerprint not in known]
    _log(f"{len(fresh)} son nuevas ({len(passed) - len(fresh)} ya evaluadas antes)")

    if not fresh:
        _log("Nada nuevo que evaluar.")
        conn.close()
        return

    # El detalle se descarga aqui, ya filtrado, para no gastar peticiones en
    # ofertas descartadas y para que el juez lea el texto completo.
    if not args.rapido:
        _log("Descargando la descripción completa de cada oferta...")
        done, det_problems = sources.enrich(fresh)
        _log(f"  {done} descripciones descargadas")
        for p in det_problems[:5]:
            _log(f"  incidencia: {p[:130]}")

        # Con el texto completo puede aparecer que no era remota o era freelance.
        fresh, late = prefilter_mod.prefilter(fresh)
        if late:
            _log(f"  {len(late)} descartadas al leer el detalle "
                 f"(ej. {late[0][1]})")

    use_llm = judge_mod.has_api_key() and not args.sin_ia
    _log(f"Evaluando con {'IA' if use_llm else 'reglas (sin ANTHROPIC_API_KEY)'}...")

    counts = {"apply": 0, "review": 0, "reject": 0}
    for i, job in enumerate(fresh, 1):
        verdict = judge_mod.judge(job, use_llm=use_llm)
        counts[verdict.verdict] = counts.get(verdict.verdict, 0) + 1
        marker = {"apply": "++", "review": "..", "reject": "  "}[verdict.verdict]
        _log(f"  {marker} [{verdict.score:3}] {job.title[:52]} @ "
             f"{(job.company or '?')[:26]} — {VERDICT_LABEL[verdict.verdict]}")
        if verdict.verdict != "reject" and verdict.concerns:
            _log(f"        comprobar: {verdict.concerns[0][:110]}")
        if not args.seco:
            store.upsert(conn, job, verdict)
        if use_llm and i < len(fresh):
            time.sleep(0.4)   # cortesia con la API

    if args.seco:
        _log(f"MODO SECO: {counts} — no se ha guardado nada.")
        conn.close()
        return

    conn.commit()
    _log(f"Guardadas. Aplicar: {counts['apply']}, revisar: {counts['review']}, "
         f"descartadas: {counts['reject']}")

    if not args.sin_sheet:
        pending = store.query(conn, verdicts=("apply", "review"),
                              unsynced_only=True)
        if pending:
            try:
                from . import sheet
                synced = sheet.push(pending)
                store.mark_synced(conn, synced)
                _log(f"Subidas {len(synced)} ofertas a Google Sheets.")
            except Exception as e:
                _log(f"No se pudo subir al Sheet ({e}). "
                     f"Están guardadas en local; usa 'sheet' para reintentar.")

    conn.close()
    _log("Listo. Revísalas con:  python -m radar.cli panel")


def cmd_panel(args):
    from . import dashboard
    dashboard.serve(port=args.puerto, open_browser=not args.sin_navegador)


def cmd_sheet(args):
    from . import sheet
    conn = store.connect()
    pending = store.query(conn, verdicts=("apply", "review"), unsynced_only=True)
    if not pending:
        _log("No hay nada pendiente de subir.")
        return
    synced = sheet.push(pending)
    store.mark_synced(conn, synced)
    conn.close()
    _log(f"Subidas {len(synced)} ofertas.")


def cmd_estado(args):
    conn = store.connect()
    data = store.stats(conn)
    if not data:
        _log("La base está vacía. Ejecuta primero:  python -m radar.cli buscar")
        return
    print("\nResumen de Radar")
    print("-" * 34)
    for key in ("apply", "review", "reject"):
        if key in data:
            print(f"  {VERDICT_LABEL[key]:<12} {data[key]:>4}")
    print()
    for key, value in sorted(data.items()):
        if key.startswith("estado:"):
            print(f"  {key[7:]:<12} {value:>4}")
    conn.close()


def main():
    parser = argparse.ArgumentParser(
        prog="radar", description="Radar de empleo: busca, evalúa y organiza ofertas.")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("buscar", help="Busca ofertas nuevas y las evalúa")
    p.add_argument("--seco", action="store_true",
                   help="No guarda ni sube nada; solo muestra")
    p.add_argument("--sin-ia", action="store_true",
                   help="Fuerza la evaluación por reglas")
    p.add_argument("--sin-sheet", action="store_true",
                   help="No sube a Google Sheets")
    p.add_argument("--rapido", action="store_true",
                   help="No abre el detalle de cada oferta (más rápido, peor juicio)")
    p.add_argument("--fuente", nargs="*",
                   help="Limita a ciertas fuentes (ej: linkedin infojobs)")
    p.set_defaults(func=cmd_buscar)

    p = sub.add_parser("panel", help="Abre el panel local de revisión")
    p.add_argument("--puerto", type=int, default=8765)
    p.add_argument("--sin-navegador", action="store_true")
    p.set_defaults(func=cmd_panel)

    p = sub.add_parser("sheet", help="Sube al Sheet lo que quede pendiente")
    p.set_defaults(func=cmd_sheet)

    p = sub.add_parser("estado", help="Resumen de la base de datos")
    p.set_defaults(func=cmd_estado)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
