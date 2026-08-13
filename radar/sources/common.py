"""Utilidades compartidas por todos los recolectores."""

import gzip
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
HEADERS = {
    "User-Agent": UA,
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}
TIMEOUT = 25
RETRIES = 3

_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")
_SCRIPT_RE = re.compile(r"(?is)<(script|style|noscript|svg)[^>]*>.*?</\1>")

_ENTITIES = {
    "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'",
    "&nbsp;": " ", "&aacute;": "á", "&eacute;": "é", "&iacute;": "í",
    "&oacute;": "ó", "&uacute;": "ú", "&ntilde;": "ñ", "&Ntilde;": "Ñ",
    "&uuml;": "ü", "&laquo;": "«", "&raquo;": "»", "&hellip;": "…",
    "&mdash;": "—", "&ndash;": "–", "&#8217;": "'", "&#8216;": "'",
    "&#8230;": "…", "&#8211;": "–",
}


def unescape(text):
    if not text:
        return ""
    for k, v in _ENTITIES.items():
        text = text.replace(k, v)
    text = re.sub(r"&#(\d+);", lambda m: chr(int(m.group(1))), text)
    return text


def clean_text(html):
    """HTML -> texto plano legible."""
    if not html:
        return ""
    text = _SCRIPT_RE.sub(" ", str(html))
    text = _TAG_RE.sub(" ", text)
    return _WS_RE.sub(" ", unescape(text)).strip()


def fetch(url, retries=RETRIES, as_json=False):
    """GET con reintentos y backoff. Devuelve texto (o dict si as_json)."""
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                data = resp.read()
                if resp.headers.get("Content-Encoding") == "gzip":
                    data = gzip.decompress(data)
                text = data.decode("utf-8", errors="replace")
                return json.loads(text) if as_json else text
        except urllib.error.HTTPError as e:
            last = e
            if e.code in (404, 410):
                break          # no existe: no insistir
            if e.code == 429:
                time.sleep(3 * (attempt + 1))
            else:
                time.sleep(1.5 * (attempt + 1))
        except Exception as e:
            last = e
            time.sleep(1.5 * (attempt + 1))
    raise last if last else RuntimeError(f"fallo al descargar {url}")


def qs(**params):
    return urllib.parse.urlencode({k: v for k, v in params.items()
                                   if v not in (None, "")})


def days_old(date_str):
    if not date_str:
        return 9999
    try:
        d = datetime.strptime(str(date_str)[:10], "%Y-%m-%d")
    except ValueError:
        return 9999
    return (datetime.now(timezone.utc) - d.replace(tzinfo=timezone.utc)).days


def epoch_to_date(epoch):
    try:
        return datetime.fromtimestamp(int(epoch), tz=timezone.utc).strftime("%Y-%m-%d")
    except (TypeError, ValueError, OSError):
        return ""


def rss_date(value):
    if not value:
        return ""
    for fmt in ("%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z",
                "%a, %d %b %Y %H:%M:%S"):
        try:
            return datetime.strptime(value.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return ""


def relative_date_es(text):
    """'Hace 3 días', 'hace 2 semanas' -> fecha ISO aproximada."""
    if not text:
        return ""
    t = text.lower()
    now = datetime.now(timezone.utc)
    m = re.search(r"(\d+)\s*(minuto|hora|d[ií]a|semana|mes)", t)
    if not m:
        if "hoy" in t or "ahora" in t:
            return now.strftime("%Y-%m-%d")
        return ""
    n, unit = int(m.group(1)), m.group(2)
    days = {"minuto": 0, "hora": 0, "d": n, "semana": n * 7, "mes": n * 30}
    delta = days["d"] if unit.startswith("d") else days.get(unit, 0)
    from datetime import timedelta
    return (now - timedelta(days=delta)).strftime("%Y-%m-%d")
