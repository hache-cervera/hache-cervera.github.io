#!/usr/bin/env python3
"""
Buscador diario de ofertas: 7 APIs/feeds publicos -> scoring -> Google Sheet.

Este es el punto de entrada nuevo y recomendado. A diferencia de
daily_pipeline.py, NO depende de:
  - conectores MCP (que se desconectan constantemente)
  - los CLI de bun (que solo existen en el PC de Hache)
Solo necesita Python y conexion a internet. Las credenciales de Google
unicamente hacen falta para escribir en la hoja (no para buscar).

Uso:
  python find_jobs.py --dry-run          # buscar y puntuar, sin escribir
  python find_jobs.py                    # buscar y escribir a la hoja
  python find_jobs.py --fit-threshold 50 # bajar el liston
  python find_jobs.py --send-email       # ademas, resumen por correo

Variables de entorno (solo para escribir/enviar):
  GOOGLE_APPLICATION_CREDENTIALS  JSON de la cuenta de servicio
  GOOGLE_SHEETS_ID                ID de la hoja destino
  GMAIL_RECIPIENT                 Destinatario del resumen (con --send-email)
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except AttributeError:
    pass

JOB_SCRAPER_DIR = Path(__file__).parent
sys.path.insert(0, str(JOB_SCRAPER_DIR))

import job_sources
from daily_pipeline import score_job

SEEN_JOBS_PATH = JOB_SCRAPER_DIR / "seen_jobs.json"
LOG_PATH = JOB_SCRAPER_DIR / "pipeline_log.txt"
SHEET_TAB = "Hoja 1"


def log(msg):
    line = f"[{datetime.now().isoformat(timespec='seconds')}] {msg}"
    print(line)
    try:
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError:
        pass


def load_seen():
    if SEEN_JOBS_PATH.exists():
        with open(SEEN_JOBS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"seen": {}}


def save_seen(data):
    with open(SEEN_JOBS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true",
                        help="No escribe en la hoja ni en seen_jobs.json")
    parser.add_argument("--fit-threshold", type=int, default=55)
    parser.add_argument("--max-age-days", type=int, default=21)
    parser.add_argument("--send-email", action="store_true")
    args = parser.parse_args()

    sheet_id = os.environ.get("GOOGLE_SHEETS_ID")
    if not sheet_id and not args.dry_run:
        log("ERROR: GOOGLE_SHEETS_ID no esta definido")
        sys.exit(1)

    log("=== Busqueda diaria (fuentes publicas) ===")
    jobs, problems = job_sources.fetch_all(max_age_days=args.max_age_days)
    for p in problems:
        log(f"  INCIDENCIA: {p}")

    by_source = {}
    for j in jobs:
        by_source[j["source"]] = by_source.get(j["source"], 0) + 1
    log(f"{len(jobs)} candidatas tras filtro de oficio/geo/antiguedad: {by_source}")

    seen_data = load_seen()
    seen = seen_data["seen"]

    kept, dropped, already = [], 0, 0
    for job in jobs:
        key = f"{job['source']}:{job['id']}"
        alt_key = f"{(job.get('company') or '').strip().lower()}|{job['title'].strip().lower()}"
        if key in seen or any(
                k.endswith(alt_key) or seen[k].get("url") == job["url"] for k in seen):
            already += 1
            continue

        score, reasons = score_job(
            job["title"], job["company"], job["location"], job["description"],
            trusted_board=job.get("trusted_board", False))

        fit = "high" if score >= 70 else "medium" if score >= args.fit_threshold else "low"
        status = "auto-nueva" if score >= args.fit_threshold else "descartada"

        seen[key] = {
            "title": job["title"],
            "company": job["company"],
            "url": job["url"],
            "location": job["location"],
            "first_seen": datetime.now().strftime("%Y-%m-%d"),
            "fit": fit,
            "score": score,
            "status": status,
            "portal": job["source"],
            "score_reasons": reasons[:5],
        }

        if score >= args.fit_threshold:
            kept.append({**job, "score": score, "reasons": reasons})
            log(f"  SIRVE [{score}] {job['title']} @ {job['company'] or '?'} ({job['source']})")
            for r in reasons[:3]:
                log(f"          {r}")
        else:
            dropped += 1
            # Mostrar el motivo decisivo: el veto, no el primer punto positivo.
            vetoes = [r for r in reasons if r.startswith("-")]
            why = vetoes[0] if vetoes else (
                f"puntuacion insuficiente ({score})" if reasons else "sin senal")
            log(f"  NO    [{score}] {job['title']} @ {job['company'] or '?'} — {why}")

    log(f"Resumen: {len(kept)} validas, {dropped} descartadas, {already} ya vistas")

    if args.dry_run:
        log("DRY RUN: no se escribe nada.")
        return

    save_seen(seen_data)

    if not kept:
        log("Ninguna oferta nueva supera el umbral. Fin.")
        return

    from sheet_writer import append_job_rows

    today = datetime.now().strftime("%Y-%m-%d")
    rows = [{
        "date": today,
        "title": j["title"],
        "company": j["company"] or "(sin empresa)",
        "location": j["location"] or "Remoto",
        "score": j["score"],
        "url": j["url"],
        "portal": j["source"],
        "status": "auto-nueva",
        "notes": (j.get("salary") or "") + (" | " if j.get("salary") else "")
                 + "; ".join(j["reasons"][:2]),
    } for j in kept]

    append_job_rows(sheet_id, rows, tab=SHEET_TAB)
    log(f"Escritas {len(rows)} filas en la hoja.")

    if args.send_email:
        try:
            from daily_pipeline import send_email_summary
            send_email_summary([{**j, "final_score": j["score"]} for j in kept])
        except Exception as e:
            log(f"  Correo no enviado: {e}")

    log("=== Fin ===")


if __name__ == "__main__":
    main()
