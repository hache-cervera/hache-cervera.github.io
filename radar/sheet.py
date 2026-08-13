"""Sincronizacion con Google Sheets.

Escribe las ofertas nuevas con hipervinculo nativo (nada de =HYPERLINK(),
que se rompe con la configuracion regional española de la hoja) y formato de
fecha real (si no, Sheets guarda un numero de serie tipo 46244).

Solo sube lo que merece la pena mirar: veredictos "apply" y "review".
"""

import os
from datetime import datetime

TAB = "Hoja 1"
HEADERS = ["Fecha", "Puesto", "Empresa", "Ubicacion", "Nota", "URL",
           "Fuente", "Veredicto", "Detalle"]

VERDICT_ES = {"apply": "APLICAR", "review": "REVISAR", "reject": "descartada"}
ORANGE_LIGHT = {"red": 1.0, "green": 0.3529, "blue": 0.1412}
GREEN_BG = {"red": 0.85, "green": 0.95, "blue": 0.85}
AMBER_BG = {"red": 1.0, "green": 0.96, "blue": 0.80}


def _service():
    from google.auth import default
    from googleapiclient.discovery import build
    creds, _ = default(scopes=["https://www.googleapis.com/auth/spreadsheets"])
    return build("sheets", "v4", credentials=creds)


def _gid(svc, sheet_id, tab=TAB):
    meta = svc.spreadsheets().get(spreadsheetId=sheet_id).execute()
    for s in meta.get("sheets", []):
        props = s.get("properties", {})
        if props.get("title") == tab:
            return props.get("sheetId")
    return 0


def _first_row(a1_range):
    cell = a1_range.split("!")[-1].split(":")[0]
    return int("".join(c for c in cell if c.isdigit())) - 1


def push(rows, sheet_id=None, tab=TAB):
    """Sube filas nuevas. `rows` son dicts de store.query().

    Devuelve la lista de fingerprints subidos.
    """
    sheet_id = sheet_id or os.environ.get("GOOGLE_SHEETS_ID")
    if not sheet_id:
        raise RuntimeError("falta GOOGLE_SHEETS_ID")
    if not rows:
        return []

    svc = _service()
    gid = _gid(svc, sheet_id, tab)
    today = datetime.now().strftime("%Y-%m-%d")

    values = []
    for r in rows:
        detalle = r.get("reason") or ""
        concerns = r.get("concerns")
        if isinstance(concerns, str):
            import json
            concerns = json.loads(concerns or "[]")
        if concerns:
            detalle += " | COMPROBAR: " + "; ".join(concerns[:3])
        values.append([
            r.get("date") or today,
            r.get("title", ""),
            r.get("company") or "(sin empresa)",
            r.get("location") or "Remoto",
            r.get("score", 0),
            "Ver oferta" if r.get("url") else "",
            r.get("source", ""),
            VERDICT_ES.get(r.get("verdict"), r.get("verdict", "")),
            detalle[:480],
        ])

    result = svc.spreadsheets().values().append(
        spreadsheetId=sheet_id, range=f"{tab}!A2",
        valueInputOption="USER_ENTERED", insertDataOption="INSERT_ROWS",
        body={"values": values}).execute()

    start = _first_row(result["updates"]["updatedRange"])

    requests = [{
        "repeatCell": {
            "range": {"sheetId": gid, "startRowIndex": 1,
                      "startColumnIndex": 0, "endColumnIndex": 1},
            "cell": {"userEnteredFormat": {
                "numberFormat": {"type": "DATE", "pattern": "dd/mm/yyyy"}}},
            "fields": "userEnteredFormat.numberFormat",
        }
    }]
    for i, r in enumerate(rows):
        if not r.get("url"):
            continue
        row_idx = start + i
        requests.append({
            "updateCells": {
                "range": {"sheetId": gid, "startRowIndex": row_idx,
                          "endRowIndex": row_idx + 1,
                          "startColumnIndex": 5, "endColumnIndex": 6},
                "rows": [{"values": [{
                    "userEnteredValue": {"stringValue": "Ver oferta"},
                    "userEnteredFormat": {"textFormat": {
                        "foregroundColor": ORANGE_LIGHT, "underline": True,
                        "link": {"uri": r["url"]}}},
                }]}],
                "fields": "userEnteredValue,userEnteredFormat.textFormat",
            }
        })
        bg = GREEN_BG if r.get("verdict") == "apply" else AMBER_BG
        requests.append({
            "repeatCell": {
                "range": {"sheetId": gid, "startRowIndex": row_idx,
                          "endRowIndex": row_idx + 1,
                          "startColumnIndex": 0, "endColumnIndex": 9},
                "cell": {"userEnteredFormat": {"backgroundColor": bg}},
                "fields": "userEnteredFormat.backgroundColor",
            }
        })

    svc.spreadsheets().batchUpdate(
        spreadsheetId=sheet_id, body={"requests": requests}).execute()

    return [r["fingerprint"] for r in rows]


def ensure_headers(sheet_id=None, tab=TAB):
    sheet_id = sheet_id or os.environ.get("GOOGLE_SHEETS_ID")
    svc = _service()
    svc.spreadsheets().values().update(
        spreadsheetId=sheet_id, range=f"{tab}!A1:I1",
        valueInputOption="RAW", body={"values": [HEADERS]}).execute()
