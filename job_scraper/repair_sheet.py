#!/usr/bin/env python3
"""
One-time repair for rows already written to the Sheet with the old, buggy
writer: fixes the date-as-serial-number issue, replaces broken
=HYPERLINK() formulas with native cell hyperlinks, and backfills empty
Portal/Estado columns by inferring the portal from the URL domain.

Run this ONCE after pulling the fixed daily_pipeline.py/sync_to_sheet.py,
to clean up rows written before the fix. New rows going forward are
already written correctly by sheet_writer.py.

Usage:
  python repair_sheet.py [--dry-run]

Environment variables (required):
  GOOGLE_APPLICATION_CREDENTIALS  Path to the Sheets service-account JSON
  GOOGLE_SHEETS_ID                Target spreadsheet ID
"""

import os
import re
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except AttributeError:
    pass

SHEET_TAB = "Hoja 1"
ORANGE_LIGHT = {"red": 1.0, "green": 0.3529, "blue": 0.1412}

PORTAL_DOMAINS = [
    ("linkedin.com", "linkedin"),
    ("tecnoempleo.com", "tecnoempleo"),
    ("infojobs.net", "infojobs"),
    ("infojobs.com", "infojobs"),
    ("freehire", "freehire"),
]

HYPERLINK_RE = re.compile(r'=HYPERLINK\("([^"]*)"\s*,\s*"([^"]*)"\)', re.IGNORECASE)


def infer_portal(url):
    url_l = (url or "").lower()
    for domain, portal in PORTAL_DOMAINS:
        if domain in url_l:
            return portal
    return ""


def main():
    dry_run = "--dry-run" in sys.argv

    sheet_id_env = os.environ.get("GOOGLE_SHEETS_ID")
    if not sheet_id_env:
        print("ERROR: GOOGLE_SHEETS_ID not set")
        sys.exit(1)

    from google.auth import default
    from googleapiclient.discovery import build

    creds, _ = default(scopes=['https://www.googleapis.com/auth/spreadsheets'])
    sheets = build('sheets', 'v4', credentials=creds)

    meta = sheets.spreadsheets().get(spreadsheetId=sheet_id_env).execute()
    sheet_gid = 0
    for s in meta.get("sheets", []):
        props = s.get("properties", {})
        if props.get("title") == SHEET_TAB:
            sheet_gid = props.get("sheetId")
            break

    # Read both the formula view (to recover URLs from broken HYPERLINK
    # formulas) and the formatted-display view (for dates/portal/status).
    formulas = sheets.spreadsheets().values().get(
        spreadsheetId=sheet_id_env, range=f"{SHEET_TAB}!A2:I",
        valueRenderOption="FORMULA",
    ).execute().get("values", [])

    if not formulas:
        print("No data rows found.")
        return

    requests = []
    link_fix_count = 0
    column_fix_count = 0

    for i, row in enumerate(formulas):
        row = row + [""] * (9 - len(row))  # pad to 9 columns
        row_index = i + 1  # 0-indexed, header is row 0

        # --- Fix broken/URL formula in column F (index 5) ---
        url_cell = row[5]
        url = None
        if isinstance(url_cell, str) and url_cell.startswith("=HYPERLINK"):
            m = HYPERLINK_RE.match(url_cell)
            if m:
                url = m.group(1)
        elif isinstance(url_cell, str) and url_cell.startswith("http"):
            url = url_cell

        if url:
            link_fix_count += 1
            requests.append({
                "updateCells": {
                    "range": {
                        "sheetId": sheet_gid,
                        "startRowIndex": row_index,
                        "endRowIndex": row_index + 1,
                        "startColumnIndex": 5,
                        "endColumnIndex": 6,
                    },
                    "rows": [{
                        "values": [{
                            "userEnteredValue": {"stringValue": "Ver oferta"},
                            "userEnteredFormat": {
                                "textFormat": {
                                    "foregroundColor": ORANGE_LIGHT,
                                    "underline": True,
                                    "link": {"uri": url},
                                }
                            },
                        }]
                    }],
                    "fields": "userEnteredValue,userEnteredFormat.textFormat",
                }
            })

            # --- Backfill Portal (col G, idx 6) / Estado (col H, idx 7) ---
            portal_cell = (row[6] or "").strip()
            status_cell = (row[7] or "").strip()
            if not portal_cell or not status_cell:
                inferred_portal = portal_cell or infer_portal(url)
                inferred_status = status_cell or "auto-nueva"
                column_fix_count += 1
                requests.append({
                    "updateCells": {
                        "range": {
                            "sheetId": sheet_gid,
                            "startRowIndex": row_index,
                            "endRowIndex": row_index + 1,
                            "startColumnIndex": 6,
                            "endColumnIndex": 8,
                        },
                        "rows": [{
                            "values": [
                                {"userEnteredValue": {"stringValue": inferred_portal}},
                                {"userEnteredValue": {"stringValue": inferred_status}},
                            ]
                        }],
                        "fields": "userEnteredValue",
                    }
                })

    # --- Apply date number format to column A for the whole data range ---
    requests.append({
        "repeatCell": {
            "range": {
                "sheetId": sheet_gid,
                "startRowIndex": 1,
                "startColumnIndex": 0,
                "endColumnIndex": 1,
            },
            "cell": {
                "userEnteredFormat": {
                    "numberFormat": {"type": "DATE", "pattern": "dd/mm/yyyy"}
                }
            },
            "fields": "userEnteredFormat.numberFormat",
        }
    })

    print(f"Rows scanned: {len(formulas)}")
    print(f"Broken URL formulas to fix: {link_fix_count}")
    print(f"Rows with Portal/Estado to backfill: {column_fix_count}")
    print("Date format will be (re)applied to column A.")

    if dry_run:
        print("\nDRY RUN: no changes written.")
        return

    if requests:
        sheets.spreadsheets().batchUpdate(
            spreadsheetId=sheet_id_env,
            body={"requests": requests}
        ).execute()
        print(f"\nApplied {len(requests)} fix(es) to the Sheet.")
    print(f"Sheet: https://docs.google.com/spreadsheets/d/{sheet_id_env}/edit")


if __name__ == "__main__":
    main()
