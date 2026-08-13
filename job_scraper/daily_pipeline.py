#!/usr/bin/env python3
"""
Daily job scraper pipeline: search portals -> smart fit filter -> detail
verification -> dedupe -> write to Google Sheet -> email summary.

Scoring is rule-based but tuned to approximate Claude's evaluation criteria:
- Deal-breakers (senior, hybrid, language reqs) are hard rejects
- Experience-years detection via regex (>4 years = reject)
- Remote verification (positive + negative signals)
- Weighted keyword matching by category (core role vs supporting skill),
  matched on word boundaries to avoid substring false positives
- Language requirement detection is contextual (only rejects when the
  language appears near requirement wording, not as a company nationality)
- Rows are marked "auto-nueva" and get an "AUTO - revisar" note so they
  are visibly distinct from Claude-vetted rows.

Usage:
  python daily_pipeline.py [--send-email] [--fit-threshold 55] [--dry-run]

Environment variables (required):
  GOOGLE_APPLICATION_CREDENTIALS  Path to the Sheets service-account JSON
  GOOGLE_SHEETS_ID                Target spreadsheet ID
Environment variables (only if --send-email):
  GMAIL_RECIPIENT                 Where to send the summary
  (needs job_scraper/oauth-client.json + job_scraper/token.json - see
   gmail_auth_setup.py)
"""

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except AttributeError:
    pass

BASE_DIR = Path(__file__).parent.parent
JOB_SCRAPER_DIR = Path(__file__).parent
SEEN_JOBS_PATH = JOB_SCRAPER_DIR / "seen_jobs.json"
TRACKER_PATH = BASE_DIR / "job_search_tracker.csv"
LOG_PATH = JOB_SCRAPER_DIR / "pipeline_log.txt"
SHEET_TAB = "Hoja 1"

# --- Search plan: (portal_key, cli_relpath, args) ---------------------------
SEARCHES = [
    ("linkedin-search", ".agents/skills/linkedin-search/cli/src/cli.ts",
     ["search", "-q", "wordpress developer", "-l", "Spain", "--remote", "remote", "--jobage", "14", "--limit", "15", "--format", "json"]),
    ("linkedin-search", ".agents/skills/linkedin-search/cli/src/cli.ts",
     ["search", "-q", "SEO specialist", "-l", "Spain", "--remote", "remote", "--jobage", "14", "--limit", "15", "--format", "json"]),
    ("linkedin-search", ".agents/skills/linkedin-search/cli/src/cli.ts",
     ["search", "-q", "digital designer", "-l", "Spain", "--remote", "remote", "--jobage", "14", "--limit", "15", "--format", "json"]),
    ("tecnoempleo-search", ".agents/skills/tecnoempleo-search/cli/src/cli.ts",
     ["search", "-q", "wordpress", "--remote", "full", "--limit", "20", "--format", "json"]),
    ("tecnoempleo-search", ".agents/skills/tecnoempleo-search/cli/src/cli.ts",
     ["search", "-q", "SEO", "--remote", "full", "--limit", "20", "--format", "json"]),
    ("infojobs-search", ".agents/skills/infojobs-search/cli/src/cli.ts",
     ["search", "-q", "wordpress", "--remote", "--sort", "date", "--limit", "20", "--format", "json"]),
    ("infojobs-search", ".agents/skills/infojobs-search/cli/src/cli.ts",
     ["search", "-q", "SEO especialista", "--remote", "--sort", "date", "--limit", "20", "--format", "json"]),
    ("infojobs-search", ".agents/skills/infojobs-search/cli/src/cli.ts",
     ["search", "-q", "diseñador digital", "--remote", "--sort", "date", "--limit", "20", "--format", "json"]),
    ("freehire-search", ".agents/skills/freehire-search/cli/src/cli.ts",
     ["search", "-q", "wordpress", "--region", "eu,none", "--jobage", "14", "--limit", "20", "--format", "json"]),
    ("freehire-search", ".agents/skills/freehire-search/cli/src/cli.ts",
     ["search", "-q", "SEO", "--region", "eu,none", "--jobage", "14", "--limit", "20", "--format", "json"]),
]

# --- Scoring keywords -------------------------------------------------------

CORE_ROLE_KEYWORDS = [
    "wordpress", "elementor", "woocommerce", "wpml", "astra",
    "seo", "technical seo", "posicionamiento web",
    "web designer", "diseñador web", "diseñadora web",
]
STRONG_SKILL_KEYWORDS = [
    "ga4", "google analytics", "semrush", "ahrefs", "screaming frog",
    "search console", "figma", "adobe", "web performance",
    "hosting", "dns", "ssl", "migración", "wpengine",
    "on-page", "rank math", "yoast", "gtm",
]
SUPPORTING_KEYWORDS = [
    "diseñador", "diseñadora", "diseño", "geo", "aeo",
    "html", "css", "content", "contenido",
    "marca", "brand", "motion", "video",
]
# Core keyword matches in description are capped like the other categories
# to avoid a single skill mentioned many times inflating the score.
CORE_DESC_MATCH_CAP = 32  # 4 matches x 8 pts

# Deal-breaker patterns
SENIORITY_TITLE_REJECT = [
    "senior", "sr.", "lead", "head of", "director", "principal",
    "jefe de", "responsable de equipo", "manager", "architect",
    "team lead", "tech lead",
]
NON_REMOTE_REJECT = [
    "hybrid", "híbrido", "hibrido", "onsite", "on-site", "on site",
    "presencial", "oficina obligatoria", "commutable", "relocation",
    "relocat", "in-office", "in office",
]

# Languages that would disqualify (Spanish/English are always fine and
# not included). Matched with word boundaries.
LANGUAGE_TERMS = [
    "french", "français", "francés", "german", "deutsch", "alemán",
    "dutch", "nederlands", "holandés", "italian", "italiano",
    "portuguese", "portugués", "mandarin", "chinese", "japanese",
    "korean", "arabic", "russian",
]
# Only treat a language mention as a requirement if it appears near one
# of these requirement-context words within REQ_CONTEXT_WINDOW chars.
REQ_CONTEXT_WORDS = [
    "required", "requirement", "requisito", "imprescindible", "must",
    "fluent", "fluente", "fluido", "native", "nativo", "nativa",
    "proficien", "speaking", "hablar", "idioma", "language skills",
    "knowledge of", "conocimiento de", "nice to have", "plus",
    "valorable", "deseable", "a favor", "b1", "b2", "c1", "c2",
]
REQ_CONTEXT_WINDOW = 60

# --- Skills fuera del perfil real de Hache ---------------------------------
# CLAUDE.md es explicito: nunca atribuirle JavaScript mas alla de lo basico,
# frameworks JS, PHP a nivel desarrollador, backend/Python, Gutenberg FSE a
# nivel desarrollador ni certificaciones AWS. Si la oferta EXIGE esto, no
# puede aplicar de forma honesta, por muy "WordPress" que suene el titulo.
BEYOND_PROFILE_HARD = [
    "react", "reactjs", "react.js", "vue", "vuejs", "vue.js", "angular",
    "svelte", "next.js", "nextjs", "nuxt", "typescript",
    "node.js", "nodejs", "express.js",
    "laravel", "symfony", "codeigniter", "django", "flask", "rails",
    "python", "java", "c#", ".net", "golang", "rust", "kotlin", "swift",
    "custom plugin development", "plugin development",
    "custom theme development", "theme development",
    "headless wordpress", "gutenberg block development", "react-based blocks",
    "rest api development", "graphql", "docker", "kubernetes",
    "aws certified", "terraform", "ci/cd pipelines",
]
# Terminos que solo cuentan si aparecen como exigencia dura.
BEYOND_PROFILE_SOFT = [
    "php", "mysql", "sql", "javascript", "api development", "backend",
    "back-end", "full stack", "fullstack",
]
# Contexto que convierte una mencion en requisito real.
REQUIREMENT_CONTEXT = [
    "required", "requirement", "must have", "must be", "strong knowledge",
    "strong understanding", "proficiency", "proficient", "expertise",
    "experience with", "experience in", "solid knowledge", "advanced",
    "imprescindible", "requisito", "se requiere", "dominio", "necesario",
    "obligatorio", "indispensable",
]
# Contexto que la degrada a "deseable" (no bloquea).
NICE_TO_HAVE_CONTEXT = [
    "nice to have", "plus", "bonus", "desirable", "preferred", "valorable",
    "deseable", "se valorara", "opcional", "a plus", "would be great",
]
BEYOND_CONTEXT_WINDOW = 90


def detect_beyond_profile(text):
    """Devuelve el primer skill exigido que queda fuera del perfil real.

    Distingue exigencia ("strong knowledge of PHP") de deseable ("PHP is a
    plus"), para no descartar ofertas de diseno que mencionan tecnologia
    de pasada.
    """
    text_l = (text or "").lower()
    if not text_l:
        return None

    def _demanded(term):
        pat = _kw_pattern(term)
        for m in pat.finditer(text_l):
            start = max(0, m.start() - BEYOND_CONTEXT_WINDOW)
            end = min(len(text_l), m.end() + BEYOND_CONTEXT_WINDOW)
            window = text_l[start:end]
            if any(kw_in(n, window) for n in NICE_TO_HAVE_CONTEXT):
                continue  # es un "se valorara", no bloquea
            if any(kw_in(c, window) for c in REQUIREMENT_CONTEXT):
                return True
        return False

    for term in BEYOND_PROFILE_HARD:
        if _demanded(term):
            return term
    for term in BEYOND_PROFILE_SOFT:
        if _demanded(term):
            return term
    return None


EXPERIENCE_YEARS_PATTERN = re.compile(
    r'(?:'
    r'(\d+)\+?\s*(?:years?|años?|yrs?)\s*(?:of\s+)?(?:experience|experiencia|exp\.?)'
    r'|'
    r'(?:experience|experiencia)\s*(?:of\s+)?(\d+)\+?\s*(?:years?|años?|yrs?)'
    r'|'
    r'(?:mínimo|minimum|at least|al menos)\s*(\d+)\s*(?:years?|años?)'
    r')',
    re.IGNORECASE,
)

REMOTE_POSITIVE = [
    "100% remoto", "100% remote", "fully remote", "full remote",
    "remote from spain", "remote from eu", "remote-first",
    "trabajo remoto", "teletrabajo", "work from home",
    "remote (worldwide)", "remote (global)", "remote (eu)",
    "remote (europe)", "anywhere",
]

WATCHLIST_COMPANIES = [
    "leadtech", "experience it", "wpmu dev", "wpmudev",
    "cloudlinux", "automattic", "iubenda",
]


def _kw_pattern(kw):
    """Build a word-boundary-safe regex for a keyword/phrase."""
    escaped = re.escape(kw)
    # Use lookaround word boundaries so multi-word phrases and terms with
    # punctuation (e.g. "on-page", "sr.") still match correctly.
    return re.compile(r'(?<![a-z0-9áéíóúñ])' + escaped + r'(?![a-z0-9áéíóúñ])', re.IGNORECASE)


_KW_PATTERN_CACHE = {}


def kw_in(kw, text):
    pat = _KW_PATTERN_CACHE.get(kw)
    if pat is None:
        pat = _kw_pattern(kw)
        _KW_PATTERN_CACHE[kw] = pat
    return pat.search(text) is not None


def log(msg):
    line = f"[{datetime.now().isoformat(timespec='seconds')}] {msg}"
    print(line)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def run_cli(cli_relpath, args):
    cmd = ["bun", "run", str(BASE_DIR / cli_relpath)] + args
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=60, cwd=str(BASE_DIR),
            encoding="utf-8", errors="replace",
        )
    except Exception as e:
        log(f"  ERROR running {cli_relpath}: {e}")
        return None
    if result.returncode != 0:
        log(f"  FAILED {cli_relpath} {args[:4]}...: {(result.stderr or '').strip()[:200]}")
        return None
    if not result.stdout:
        log(f"  EMPTY output from {cli_relpath} {args[:4]}...")
        return None
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        log(f"  BAD JSON from {cli_relpath}: {result.stdout[:200]}")
        return None


def detect_required_years(text):
    matches = EXPERIENCE_YEARS_PATTERN.findall(text)
    years = []
    for groups in matches:
        for g in groups:
            if g:
                years.append(int(g))
    return max(years) if years else 0


def check_language_requirement(text):
    """Return the first disqualifying language term found in a requirement
    context, or None. Avoids false positives like 'iubenda is an Italian
    company' by requiring requirement-context wording nearby."""
    text_l = text.lower()
    for term in LANGUAGE_TERMS:
        pat = _kw_pattern(term)
        for m in pat.finditer(text_l):
            start = max(0, m.start() - REQ_CONTEXT_WINDOW)
            end = min(len(text_l), m.end() + REQ_CONTEXT_WINDOW)
            window = text_l[start:end]
            if any(kw_in(ctx, window) for ctx in REQ_CONTEXT_WORDS):
                return term
    return None


def score_job(title, company, location, description, trusted_board=False):
    title_l = (title or "").lower()
    company_l = (company or "").lower()
    location_l = (location or "").lower()
    all_text = f"{title_l} {location_l} {(description or '').lower()}"
    reasons = []

    score = 0

    # --- Core role keyword in title: strong positive ---
    for kw in CORE_ROLE_KEYWORDS:
        if kw_in(kw, title_l):
            score += 25
            reasons.append(f"+25 core '{kw}' in title")
            break  # only count once for title match

    # --- Core role keyword in description (not in title), capped ---
    desc_bonus = 0
    desc_hits = []
    for kw in CORE_ROLE_KEYWORDS:
        if not kw_in(kw, title_l) and kw_in(kw, all_text):
            desc_bonus += 8
            desc_hits.append(kw)
    if desc_bonus:
        capped = min(desc_bonus, CORE_DESC_MATCH_CAP)
        score += capped
        reasons.append(f"+{capped} core in desc ({len(desc_hits)} matches)")

    # --- Strong skill keywords ---
    strong_hits = 0
    for kw in STRONG_SKILL_KEYWORDS:
        if kw_in(kw, all_text):
            strong_hits += 1
    if strong_hits:
        bonus = min(strong_hits * 6, 30)
        score += bonus
        reasons.append(f"+{bonus} strong skills ({strong_hits} matches)")

    # --- Supporting keywords ---
    support_hits = 0
    for kw in SUPPORTING_KEYWORDS:
        if kw_in(kw, all_text):
            support_hits += 1
    if support_hits:
        bonus = min(support_hits * 3, 15)
        score += bonus
        reasons.append(f"+{bonus} supporting ({support_hits} matches)")

    # --- Remote positive signals ---
    for kw in REMOTE_POSITIVE:
        if kw_in(kw, all_text):
            score += 10
            reasons.append(f"+10 remote signal '{kw}'")
            break

    # --- Watchlist company ---
    for wl in WATCHLIST_COMPANIES:
        if kw_in(wl, company_l):
            score += 15
            reasons.append(f"+15 watchlist company")
            break

    # --- DEAL-BREAKERS (hard rejects) ---

    # Seniority in title
    for kw in SENIORITY_TITLE_REJECT:
        if kw_in(kw, title_l):
            score -= 100
            reasons.append(f"-100 seniority '{kw}' in title")
            break

    # Non-remote signals
    for kw in NON_REMOTE_REJECT:
        if kw_in(kw, all_text):
            score -= 100
            reasons.append(f"-100 non-remote '{kw}'")
            break

    # Language requirements (contextual, avoids "Italian company" false hits)
    lang_hit = check_language_requirement(all_text)
    if lang_hit:
        score -= 100
        reasons.append(f"-100 language req '{lang_hit}'")

    # Experience years >4
    req_years = detect_required_years(all_text)
    if req_years > 4:
        score -= 100
        reasons.append(f"-100 requires {req_years}+ years")

    # Skills exigidos que Hache no puede reclamar honestamente
    beyond = detect_beyond_profile(all_text)
    if beyond:
        score -= 100
        reasons.append(f"-100 exige '{beyond}' (fuera del perfil)")

    # Anonymous company (no identifiable name). Trusted job boards (e.g. the
    # official WordPress jobs board) don't expose a company field in their
    # feed, which isn't the same thing as an anonymous posting.
    if not trusted_board and (
            not company
            or company.lower() in ["", "unknown", "confidential", "confidencial",
                                   "empresa confidencial"]):
        score -= 30
        reasons.append(f"-30 anonymous company")

    final = max(0, min(100, score))
    return final, reasons


def load_seen_jobs():
    if SEEN_JOBS_PATH.exists():
        with open(SEEN_JOBS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"seen": {}}


def save_seen_jobs(data):
    with open(SEEN_JOBS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def load_tracker_keys():
    keys = set()
    if TRACKER_PATH.exists():
        with open(TRACKER_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()[1:]
            for line in lines:
                parts = line.strip().split(",")
                if len(parts) >= 3:
                    keys.add(f"{parts[1].strip().lower()}|{parts[2].strip().lower()}")
    return keys


def fetch_detail(portal, cli_relpath, job_id, url):
    """Fetch full job detail. Tecnoempleo and InfoJobs CLIs require the
    full URL (not the bare rf-/of-i ID) to build the detail request."""
    if portal == "freehire-search":
        return None
    if portal in ("tecnoempleo-search", "infojobs-search"):
        target = url or job_id
    else:
        target = job_id
    result = run_cli(cli_relpath, ["detail", target, "--format", "json"])
    if not result:
        return None
    return json.dumps(result)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--send-email", action="store_true")
    parser.add_argument("--fit-threshold", type=int, default=55)
    parser.add_argument("--dry-run", action="store_true", help="Don't write to Sheet/seen_jobs, just print")
    args = parser.parse_args()

    sheet_id = os.environ.get("GOOGLE_SHEETS_ID")
    if not sheet_id and not args.dry_run:
        log("ERROR: GOOGLE_SHEETS_ID not set")
        sys.exit(1)

    seen_data = load_seen_jobs()
    seen = seen_data["seen"]
    tracker_keys = load_tracker_keys()

    log("=== Daily pipeline run start ===")
    candidates = []

    for portal, cli_relpath, cli_args in SEARCHES:
        log(f"Searching {portal}: {' '.join(cli_args[:4])}...")
        data = run_cli(cli_relpath, cli_args)
        if not data or "results" not in data:
            continue
        for job in data["results"]:
            job_id = job.get("id")
            title = job.get("title") or ""
            company = job.get("company") or ""
            url = job.get("url") or ""
            location = job.get("location") or ""
            description = job.get("description") or ""
            date = job.get("date") or ""

            if not job_id or not url or title.lower() == "unknown":
                continue

            dedupe_key = f"{portal}:{job_id}"
            tracker_key = f"{company.strip().lower()}|{title.strip().lower()}"
            if dedupe_key in seen or tracker_key in tracker_keys:
                continue

            prelim_score, _ = score_job(title, company, location, description)
            if prelim_score < 25:
                continue

            candidates.append({
                "portal": portal,
                "cli_relpath": cli_relpath,
                "job_id": job_id,
                "dedupe_key": dedupe_key,
                "title": title,
                "company": company,
                "url": url,
                "location": location,
                "description": description,
                "date": date,
                "prelim_score": prelim_score,
            })

    log(f"Shortlisted {len(candidates)} candidates for detail verification.")

    final_rows = []
    for c in candidates[:25]:
        detail_text = fetch_detail(c["portal"], c["cli_relpath"], c["job_id"], c["url"]) or c["description"]
        final_score, reasons = score_job(c["title"], c["company"], c["location"], detail_text)

        fit_label = "high" if final_score >= 70 else "medium" if final_score >= args.fit_threshold else "low"
        status = "auto-nueva" if final_score >= args.fit_threshold else "skipped"

        seen[c["dedupe_key"]] = {
            "title": c["title"],
            "company": c["company"],
            "url": c["url"],
            "location": c["location"],
            "first_seen": datetime.now().strftime("%Y-%m-%d"),
            "fit": fit_label,
            "score": final_score,
            "status": status,
            "portal": c["portal"],
            "score_reasons": reasons[:5],
        }

        if final_score >= args.fit_threshold:
            final_rows.append({**c, "final_score": final_score, "reasons": reasons})
            log(f"  KEEP  [{final_score}] {c['title']} @ {c['company']}")
            for r in reasons[:3]:
                log(f"         {r}")
        else:
            log(f"  DROP  [{final_score}] {c['title']} @ {c['company']}")

    if args.dry_run:
        log(f"DRY RUN: would add {len(final_rows)} rows, not writing.")
        return

    save_seen_jobs(seen_data)

    if not final_rows:
        log("No new jobs above threshold. Done.")
        return

    from sheet_writer import append_job_rows

    today = datetime.now().strftime("%Y-%m-%d")
    row_data = [{
        "date": today,
        "title": r["title"],
        "company": r["company"],
        "location": r["location"] or "Remoto",
        "score": r["final_score"],
        "url": r["url"],
        "portal": r["portal"].replace("-search", ""),
        "status": "auto-nueva",
        "notes": "AUTO - revisar (confirmar remoto/senioridad antes de aplicar)",
    } for r in final_rows]

    append_job_rows(sheet_id, row_data, tab=SHEET_TAB)
    log(f"Wrote {len(row_data)} rows to Sheet.")

    if args.send_email:
        send_email_summary(final_rows)

    log("=== Daily pipeline run end ===")


def send_email_summary(rows):
    import base64
    from email.mime.text import MIMEText
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build

    token_path = JOB_SCRAPER_DIR / "token.json"
    if not token_path.exists():
        log("  Email skipped: token.json not found. Run gmail_auth_setup.py first.")
        return

    creds = Credentials.from_authorized_user_file(str(token_path), ["https://www.googleapis.com/auth/gmail.send"])
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open(token_path, "w") as f:
            f.write(creds.to_json())

    recipient = os.environ.get("GMAIL_RECIPIENT")
    if not recipient:
        log("  Email skipped: GMAIL_RECIPIENT not set.")
        return

    rows_sorted = sorted(rows, key=lambda r: -r["final_score"])
    body_lines = [f"{len(rows)} ofertas nuevas encontradas hoy (revisar antes de aplicar):", ""]
    for r in rows_sorted:
        body_lines.append(f"[{r['final_score']}] {r['title']} @ {r['company']} — {r['url']}")
    body_lines.append("")
    body_lines.append("Sheet: https://docs.google.com/spreadsheets/d/" + os.environ.get("GOOGLE_SHEETS_ID", "") + "/edit")

    gmail = build('gmail', 'v1', credentials=creds)
    message = MIMEText("\n".join(body_lines))
    message['to'] = recipient
    message['from'] = 'me'
    message['subject'] = f"{len(rows)} ofertas nuevas — Job Tracker (auto)"
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    gmail.users().messages().send(userId='me', body={'raw': raw}).execute()
    log(f"  Email sent to {recipient}.")


if __name__ == "__main__":
    main()
