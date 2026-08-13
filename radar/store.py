"""Persistencia en SQLite.

Guarda cada oferta vista con su veredicto y el estado que le da Hache. Sirve
para tres cosas: no repetir ofertas ya evaluadas (y no volver a pagar tokens
por ellas), recordar a que ha aplicado, y alimentar el panel.
"""

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "radar.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
    fingerprint     TEXT PRIMARY KEY,
    source          TEXT,
    source_id       TEXT,
    title           TEXT,
    company         TEXT,
    url             TEXT,
    location        TEXT,
    description     TEXT,
    date            TEXT,
    employment_type TEXT,
    seniority       TEXT,
    salary          TEXT,
    verdict         TEXT,
    score           INTEGER,
    reason          TEXT,
    concerns        TEXT,
    highlights      TEXT,
    judged_by       TEXT,
    status          TEXT DEFAULT 'nueva',
    notes           TEXT DEFAULT '',
    first_seen      TEXT,
    last_seen       TEXT,
    synced_to_sheet INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_verdict ON jobs(verdict);
CREATE INDEX IF NOT EXISTS idx_status  ON jobs(status);
"""

# Estados que puede fijar Hache desde el panel.
STATUSES = ("nueva", "aplicada", "descartada", "guardada", "entrevista")


def _now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def connect(db_path=None):
    conn = sqlite3.connect(str(db_path or DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def known_fingerprints(conn):
    return {r["fingerprint"] for r in conn.execute("SELECT fingerprint FROM jobs")}


def upsert(conn, job, verdict=None):
    """Inserta la oferta o refresca `last_seen` si ya se conocia.

    Nunca pisa el estado ni las notas que haya puesto Hache.
    """
    now = _now()
    existing = conn.execute(
        "SELECT fingerprint FROM jobs WHERE fingerprint = ?",
        (job.fingerprint,)).fetchone()

    if existing:
        conn.execute("UPDATE jobs SET last_seen = ? WHERE fingerprint = ?",
                     (now, job.fingerprint))
        return False

    conn.execute("""
        INSERT INTO jobs (
            fingerprint, source, source_id, title, company, url, location,
            description, date, employment_type, seniority, salary,
            verdict, score, reason, concerns, highlights, judged_by,
            status, first_seen, last_seen
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    """, (
        job.fingerprint, job.source, job.source_id, job.title, job.company,
        job.url, job.location, (job.description or "")[:20000], job.date,
        job.employment_type, job.seniority, job.salary,
        verdict.verdict if verdict else "review",
        verdict.score if verdict else 0,
        verdict.reason if verdict else "",
        json.dumps(verdict.concerns if verdict else [], ensure_ascii=False),
        json.dumps(verdict.highlights if verdict else [], ensure_ascii=False),
        verdict.judged_by if verdict else "",
        "nueva", now, now,
    ))
    return True


def set_status(conn, fingerprint, status, notes=None):
    if status not in STATUSES:
        raise ValueError(f"estado no valido: {status}")
    if notes is None:
        conn.execute("UPDATE jobs SET status = ? WHERE fingerprint = ?",
                     (status, fingerprint))
    else:
        conn.execute("UPDATE jobs SET status = ?, notes = ? WHERE fingerprint = ?",
                     (status, notes, fingerprint))
    conn.commit()


def mark_synced(conn, fingerprints):
    conn.executemany("UPDATE jobs SET synced_to_sheet = 1 WHERE fingerprint = ?",
                     [(f,) for f in fingerprints])
    conn.commit()


def query(conn, verdicts=None, statuses=None, unsynced_only=False, limit=500):
    sql = "SELECT * FROM jobs WHERE 1=1"
    params = []
    if verdicts:
        sql += f" AND verdict IN ({','.join('?' * len(verdicts))})"
        params += list(verdicts)
    if statuses:
        sql += f" AND status IN ({','.join('?' * len(statuses))})"
        params += list(statuses)
    if unsynced_only:
        sql += " AND synced_to_sheet = 0"
    sql += " ORDER BY CASE verdict WHEN 'apply' THEN 0 WHEN 'review' THEN 1"
    sql += " ELSE 2 END, score DESC, first_seen DESC LIMIT ?"
    params.append(limit)
    return [dict(r) for r in conn.execute(sql, params)]


def stats(conn):
    out = {}
    for row in conn.execute(
            "SELECT verdict, COUNT(*) n FROM jobs GROUP BY verdict"):
        out[row["verdict"]] = row["n"]
    for row in conn.execute(
            "SELECT status, COUNT(*) n FROM jobs GROUP BY status"):
        out[f"estado:{row['status']}"] = row["n"]
    return out
