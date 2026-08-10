#!/usr/bin/env python3
"""
Sync eligible jobs from seen_jobs.json to Google Sheet.

Reads seen_jobs.json and writes any jobs with fit "high" or "medium" and
status "new" or "auto-nueva" that haven't been synced yet.
Use this to push already-evaluated jobs (e.g. from a Claude chat session)
to the Sheet without re-scraping.

Usage:
  python sync_to_sheet.py [--dry-run]

Environment variables (required):
  GOOGLE_APPLICATION_CREDENTIALS  Path to the Sheets service-account JSON
  GOOGLE_SHEETS_ID                Target spreadsheet ID
"""

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
SEEN_JOBS_PATH = JOB_SCRAPER_DIR / "seen_jobs.json"
SHEET_TAB = "Hoja 1"

SYNCABLE_STATUSES = {"new", "auto-nueva"}
SYNCABLE_FITS = {"high", "medium"}

FIT_TO_SCORE = {"high": 80, "medium": 60}


def main():
    dry_run = "--dry-run" in sys.argv

    sheet_id = os.environ.get("GOOGLE_SHEETS_ID")
    if not sheet_id and not dry_run:
        print("ERROR: GOOGLE_SHEETS_ID not set")
        sys.exit(1)

    if not SEEN_JOBS_PATH.exists():
        print(f"ERROR: {SEEN_JOBS_PATH} not found")
        sys.exit(1)

    with open(SEEN_JOBS_PATH, "r", encoding="utf-8") as f:
        seen_data = json.load(f)

    seen = seen_data.get("seen", {})
    to_sync = []

    for key, job in seen.items():
        status = job.get("status", "")
        fit = job.get("fit", "")
        if status in SYNCABLE_STATUSES and fit in SYNCABLE_FITS:
            to_sync.append((key, job))

    if not to_sync:
        print("No eligible jobs to sync (need status new/auto-nueva + fit high/medium).")
        return

    print(f"Found {len(to_sync)} job(s) to sync:\n")
    for key, job in to_sync:
        print(f"  [{job.get('fit', '?')}] {job.get('title', '?')} @ {job.get('company', '?')}")

    if dry_run:
        print("\nDRY RUN: not writing to Sheet.")
        return

    from sheet_writer import append_job_rows

    today = datetime.now().strftime("%Y-%m-%d")
    rows = []
    synced_keys = []

    for key, job in to_sync:
        status_label = job.get("status", "auto-nueva")
        fit = job.get("fit", "medium")
        score = job.get("score", FIT_TO_SCORE.get(fit, ""))
        rows.append({
            "date": job.get("first_seen", today),
            "title": job.get("title", ""),
            "company": job.get("company", ""),
            "location": job.get("location") or "Remoto",
            "score": score,
            "url": job.get("url", ""),
            "portal": job.get("portal", "").replace("-search", ""),
            "status": status_label,
            "notes": "Synced from seen_jobs.json" if status_label == "new" else "AUTO - revisar",
        })
        synced_keys.append(key)

    append_job_rows(sheet_id, rows, tab=SHEET_TAB)

    for key in synced_keys:
        seen[key]["status"] = "synced"

    with open(SEEN_JOBS_PATH, "w", encoding="utf-8") as f:
        json.dump(seen_data, f, indent=2, ensure_ascii=False)

    print(f"\nWrote {len(rows)} row(s) to Sheet and marked as synced.")
    print(f"Sheet: https://docs.google.com/spreadsheets/d/{sheet_id}/edit")


if __name__ == "__main__":
    main()
