#!/usr/bin/env python3
"""
Shared helper for writing job rows to the Google Sheet correctly.

Fixes two recurring bugs from the old =HYPERLINK() + USER_ENTERED approach:
  - Dates written as strings were parsed by Sheets as date serials and
    displayed as raw numbers (e.g. "46244") whenever the column had no
    explicit date format. This writer applies a dd/mm/yyyy number format
    to column A the first time it touches a sheet tab.
  - URLs embedded in an =HYPERLINK("...") formula break whenever the URL
    contains characters the formula parser chokes on. This writer instead
    writes a plain "Ver oferta" cell and attaches a native cell-level
    hyperlink (CellFormat.textFormat.link), which needs no escaping at all.

Column layout (A-I): Fecha | Puesto | Empresa | Ubicacion | Fit | URL |
Portal | Estado | Notas
"""

from googleapiclient.discovery import build

ORANGE_LIGHT = {"red": 1.0, "green": 0.3529, "blue": 0.1412}  # #FF5A24

_FORMATTED_SHEETS = set()


def _get_sheet_id_by_title(sheets, spreadsheet_id, tab):
    meta = sheets.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    for s in meta.get("sheets", []):
        props = s.get("properties", {})
        if props.get("title") == tab:
            return props.get("sheetId")
    return 0  # fall back to first sheet


def _ensure_date_column_format(sheets, spreadsheet_id, sheet_id):
    key = (spreadsheet_id, sheet_id)
    if key in _FORMATTED_SHEETS:
        return
    sheets.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={"requests": [{
            "repeatCell": {
                "range": {
                    "sheetId": sheet_id,
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
        }]}
    ).execute()
    _FORMATTED_SHEETS.add(key)


def append_job_rows(spreadsheet_id, rows, tab="Hoja 1", credentials=None):
    """Append job rows to the sheet with correct date formatting and
    native (non-formula) hyperlinks.

    rows: list of dicts with keys date, title, company, location, score,
          url, portal, status, notes.
    """
    if not rows:
        return

    if credentials is None:
        from google.auth import default
        credentials, _ = default(scopes=['https://www.googleapis.com/auth/spreadsheets'])

    sheets = build('sheets', 'v4', credentials=credentials)
    sheet_id = _get_sheet_id_by_title(sheets, spreadsheet_id, tab)
    _ensure_date_column_format(sheets, spreadsheet_id, sheet_id)

    values = [[
        r["date"], r["title"], r["company"], r["location"], r["score"],
        "Ver oferta" if r.get("url") else "", r["portal"], r["status"], r["notes"],
    ] for r in rows]

    append_result = sheets.spreadsheets().values().append(
        spreadsheetId=spreadsheet_id,
        range=f"{tab}!A2",
        valueInputOption="USER_ENTERED",
        insertDataOption="INSERT_ROWS",
        body={"values": values}
    ).execute()

    updated_range = append_result["updates"]["updatedRange"]
    start_row = _first_row_from_range(updated_range)

    link_requests = []
    for i, r in enumerate(rows):
        if not r.get("url"):
            continue
        row_index = start_row + i
        link_requests.append({
            "updateCells": {
                "range": {
                    "sheetId": sheet_id,
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
                                "link": {"uri": r["url"]},
                            }
                        },
                    }]
                }],
                "fields": "userEnteredValue,userEnteredFormat.textFormat",
            }
        })

    if link_requests:
        sheets.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body={"requests": link_requests}
        ).execute()


def _first_row_from_range(a1_range):
    """'Hoja 1'!A5:I10 -> 4 (0-indexed row of the first data row)."""
    cell_part = a1_range.split("!")[-1].split(":")[0]
    digits = "".join(ch for ch in cell_part if ch.isdigit())
    return int(digits) - 1
