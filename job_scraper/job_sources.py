#!/usr/bin/env python3
"""
Fuentes de ofertas remotas via APIs publicas gratuitas (sin auth, sin MCP).

Motivo: los conectores MCP (JobDataLake, Indeed, Composio) se desconectan
constantemente, lo que rompe cualquier automatizacion construida encima.
Estas cinco APIs son HTTP directo con la libreria estandar: no necesitan
API key, ni conector, ni que ningun servicio externo este "conectado".

Cada fetcher devuelve la misma estructura normalizada:
    {source, id, title, company, url, location, description, date,
     seniority, salary, employment_type}

Dos filtros hacen que los resultados sean utiles:
  - `geo_allows_spain()`: la mayoria de ofertas "remotas" de estos
    agregadores son remotas *solo dentro de EEUU*. Sin esto, el 80% de
    los resultados son inaplicables desde Espana.
  - `employment_is_full_time()`: solo empleo por cuenta ajena a jornada
    completa. Estos tablones mezclan mucho encargo freelance y trabajo
    por proyecto, que no es lo que se busca.
"""

import json
import re
import urllib.parse
import urllib.request
from datetime import datetime, timezone

USER_AGENT = "Mozilla/5.0 (compatible; job-scraper/1.0)"
TIMEOUT = 25

# --- Geo: quien puede trabajar desde Espana --------------------------------

GEO_OK = [
    "worldwide", "anywhere", "global", "remote", "europe", "european",
    "emea", "eu", "spain", "espana", "españa", "cet", "cest", "gmt",
    "west europe", "western europe", "south europe", "southern europe",
    "eu-only", "europe only", "emea only",
]
# Si la restriccion menciona SOLO estos sitios, no sirve desde Espana.
GEO_BLOCK = [
    "usa", "u.s.", "united states", "us only", "us-only", "america only",
    "canada", "latam", "latin america", "brazil", "argentina", "mexico",
    "colombia", "apac", "asia", "india", "philippines", "pakistan",
    "indonesia", "vietnam", "australia", "new zealand", "japan", "china",
    "singapore", "africa", "nigeria", "kenya", "egypt", "south africa",
    "uk only", "united kingdom only", "germany only", "france only",
    "poland", "romania", "ukraine", "turkey", "israel",
]


def geo_allows_spain(location_text):
    """True si una persona en Espana puede optar a la oferta.

    Devuelve True cuando no hay dato (desconocido) — el scoring aplica
    despues una penalizacion suave y la verificacion final la hace el
    detalle de la oferta.
    """
    if not location_text:
        return True  # desconocido: no descartar aqui
    t = str(location_text).lower().strip()
    if not t:
        return True
    if any(ok in t for ok in GEO_OK):
        return True
    # Si solo aparecen zonas bloqueadas y ninguna permitida, descartar.
    if any(b in t for b in GEO_BLOCK):
        return False
    return True


# --- Relevancia: la oferta es del oficio de Hache? --------------------------

# Terminos que por si solos identifican el puesto en el TITULO.
TITLE_CORE = [
    "wordpress", "elementor", "woocommerce", "webflow", "wix", "squarespace",
    "seo", "sem", "posicionamiento",
    "web designer", "web design", "diseñador web", "diseñadora web",
    "graphic designer", "graphic design", "diseñador grafico",
    "visual designer", "ui designer", "digital designer",
    "motion designer", "brand designer", "webmaster",
    "content designer", "cms", "front end designer",
]
# Roles genericos: solo valen si ademas hay tecnologia afin en el texto.
TITLE_GENERIC = [
    "designer", "diseñador", "diseñadora", "design",
    "marketing", "content", "contenido", "creative", "digital",
]
# Tecnologias que confirman que un rol generico encaja con el perfil.
SUPPORTING_TECH = [
    "wordpress", "elementor", "woocommerce", "webflow", "shopify",
    "seo", "figma", "adobe", "photoshop", "illustrator", "after effects",
    "google analytics", "ga4", "search console", "semrush", "ahrefs",
    "screaming frog", "yoast", "rank math", "html", "css", "cms",
    "landing page", "ux", "ui",
]


def _wb(term, text):
    """Coincidencia con limites de palabra (evita 'seo' dentro de 'museo')."""
    return re.search(
        r"(?<![a-z0-9áéíóúñ])" + re.escape(term) + r"(?![a-z0-9áéíóúñ])",
        text, re.IGNORECASE) is not None


def matches_role(title, description="", tags=""):
    """True si la oferta es plausiblemente del oficio de Hache.

    Exige senal en el TITULO. Un termino nucleo basta; un rol generico
    necesita ademas una tecnologia afin en la descripcion. Esto evita el
    ruido de ofertas donde 'design' o 'seo' aparece de pasada en el texto.
    """
    title_l = (title or "").lower()
    if not title_l:
        return False
    if any(_wb(k, title_l) for k in TITLE_CORE):
        return True
    if any(_wb(k, title_l) for k in TITLE_GENERIC):
        body = f"{description or ''} {tags or ''}".lower()
        return any(_wb(t, body) for t in SUPPORTING_TECH)
    return False


# --- Tipo de contrato: solo jornada completa en empresa ---------------------

# Hache busca empleo por cuenta ajena a jornada completa. Nada de freelance,
# encargos por proyecto, ni media jornada.
NOT_EMPLOYMENT_TYPES = [
    "freelance", "freelancer", "contract", "contractor", "contracting",
    "temporary", "temp", "part-time", "part time", "parttime",
    "internship", "intern", "volunteer", "commission", "gig",
    "self-employed", "autonomo", "autónomo", "por proyecto",
    "media jornada", "practicas", "prácticas", "becario", "beca",
]
FULL_TIME_TYPES = [
    "full-time", "full time", "fulltime", "permanent", "indefinido",
    "jornada completa", "employee", "cdi",
]
# Senales en el texto de que es un encargo puntual, no un puesto.
PROJECT_SIGNALS = [
    "this project", "the project", "per project", "project-based",
    "one-off", "one time", "fixed price", "fixed-price", "budget for this",
    "milestone", "deliverable", "scope of work", "quote", "bid",
    "presupuesto", "encargo", "por horas", "hourly rate", "per hour",
    "i'm launching", "i am launching", "i need", "my website", "my site",
    "looking for someone to build", "need someone to build",
]


def employment_is_full_time(declared_type, title="", description=""):
    """True si la oferta es empleo a jornada completa (no freelance/gig).

    `declared_type` viene del campo de la fuente cuando existe; si no,
    se deduce del titulo y del texto. Ante la duda con encargos puntuales
    (tipico del tablon de WordPress), se descarta.
    """
    declared = (declared_type or "").lower()
    title_l = (title or "").lower()

    # El campo declarado por la fuente manda cuando existe.
    if declared:
        if any(t in declared for t in NOT_EMPLOYMENT_TYPES):
            return False
        if any(t in declared for t in FULL_TIME_TYPES):
            return True

    # El titulo suele delatar el freelance aunque el campo diga otra cosa.
    if any(_wb(t, title_l) for t in NOT_EMPLOYMENT_TYPES):
        return False

    # Sin tipo declarado, buscar senales de encargo puntual en el texto.
    if not declared:
        body = (description or "")[:2500].lower()
        hits = sum(1 for s in PROJECT_SIGNALS if s in body)
        if hits >= 2:
            return False
        if any(_wb(t, body) for t in ("freelance", "freelancer", "autonomo")):
            return False

    return True


# --- utilidades -------------------------------------------------------------

_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")


def strip_html(html):
    if not html:
        return ""
    text = _TAG_RE.sub(" ", str(html))
    for a, b in (("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"),
                 ("&quot;", '"'), ("&#39;", "'"), ("&nbsp;", " ")):
        text = text.replace(a, b)
    return _WS_RE.sub(" ", text).strip()


def _get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return json.loads(resp.read().decode("utf-8", errors="replace"))


def _epoch_to_date(epoch):
    try:
        return datetime.fromtimestamp(int(epoch), tz=timezone.utc).strftime("%Y-%m-%d")
    except (TypeError, ValueError, OSError):
        return ""


def _iso_to_date(value):
    if not value:
        return ""
    return str(value)[:10]


def _days_old(date_str):
    if not date_str:
        return 999
    try:
        d = datetime.strptime(date_str[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        return 999
    return (datetime.now(timezone.utc) - d).days


# --- Fetchers ---------------------------------------------------------------

def fetch_remoteok(keywords):
    """RemoteOK: un solo feed con todas las ofertas; filtramos en cliente."""
    out = []
    try:
        data = _get_json("https://remoteok.com/api")
    except Exception as e:
        return out, f"remoteok error: {e}"
    for job in data:
        if not isinstance(job, dict) or not job.get("id"):
            continue
        title = job.get("position") or ""
        tags = " ".join(job.get("tags") or [])
        desc = strip_html(job.get("description"))
        if not matches_role(title, desc, tags):
            continue
        salary = ""
        if job.get("salary_min"):
            salary = f"{job.get('salary_min')}-{job.get('salary_max')} USD"
        out.append({
            "source": "remoteok",
            "id": str(job.get("id")),
            "title": title,
            "company": job.get("company") or "",
            "url": job.get("url") or job.get("apply_url") or "",
            "location": job.get("location") or "",
            "description": desc,
            "date": _epoch_to_date(job.get("epoch")) or _iso_to_date(job.get("date")),
            "seniority": "",
            "salary": salary,
            "employment_type": tags,
        })
    return out, None


def fetch_remotive(query):
    """Remotive: soporta busqueda por texto."""
    out = []
    url = "https://remotive.com/api/remote-jobs?" + urllib.parse.urlencode(
        {"search": query, "limit": 50})
    try:
        data = _get_json(url)
    except Exception as e:
        return out, f"remotive error: {e}"
    for job in data.get("jobs", []):
        desc = strip_html(job.get("description"))
        if not matches_role(job.get("title"), desc, " ".join(job.get("tags") or [])):
            continue
        out.append({
            "source": "remotive",
            "id": str(job.get("id")),
            "title": job.get("title") or "",
            "company": job.get("company_name") or "",
            "url": job.get("url") or "",
            "location": job.get("candidate_required_location") or "",
            "description": desc,
            "date": _iso_to_date(job.get("publication_date")),
            "seniority": "",
            "salary": job.get("salary") or "",
            "employment_type": job.get("job_type") or "",
        })
    return out, None


def fetch_jobicy(query, geo="europe"):
    """Jobicy: filtra por geo nativamente (europe)."""
    out = []
    params = {"count": 50, "geo": geo}
    if query:
        params["tag"] = query
    url = "https://jobicy.com/api/v2/remote-jobs?" + urllib.parse.urlencode(params)
    try:
        data = _get_json(url)
    except Exception as e:
        return out, f"jobicy error: {e}"
    for job in data.get("jobs", []):
        jdesc = strip_html(job.get("jobDescription") or job.get("jobExcerpt"))
        jind = " ".join(job.get("jobIndustry") or [])
        if not matches_role(job.get("jobTitle"), jdesc, jind):
            continue
        levels = job.get("jobLevel")
        seniority = ", ".join(levels) if isinstance(levels, list) else (levels or "")
        salary = ""
        if job.get("annualSalaryMin"):
            salary = f"{job.get('annualSalaryMin')}-{job.get('annualSalaryMax')} {job.get('salaryCurrency','')}".strip()
        out.append({
            "source": "jobicy",
            "id": str(job.get("id")),
            "title": job.get("jobTitle") or "",
            "company": job.get("companyName") or "",
            "url": job.get("url") or "",
            "location": job.get("jobGeo") or "",
            "description": jdesc,
            "date": _iso_to_date(job.get("pubDate")),
            "seniority": seniority,
            "salary": salary,
            "employment_type": ", ".join(job.get("jobType") or []) if isinstance(job.get("jobType"), list) else (job.get("jobType") or ""),
        })
    return out, None


def fetch_himalayas(keywords, pages=25):
    """Himalayas: sin busqueda por texto y tope de 20 por pagina, asi que
    paginamos por offset sobre las ofertas mas recientes."""
    out = []
    jobs_raw = []
    for page in range(pages):
        try:
            data = _get_json(
                f"https://himalayas.app/jobs/api?limit=20&offset={page * 20}")
        except Exception as e:
            if page == 0:
                return out, f"himalayas error: {e}"
            break
        batch = data.get("jobs", [])
        if not batch:
            break
        jobs_raw += batch
    for job in jobs_raw:
        title = job.get("title") or ""
        desc = strip_html(job.get("description") or job.get("excerpt"))
        cats = " ".join(job.get("categories") or [])
        if not matches_role(title, desc, cats):
            continue
        restrictions = job.get("locationRestrictions") or []
        location = ", ".join(restrictions) if restrictions else "Worldwide"
        sen = job.get("seniority") or []
        salary = ""
        if job.get("minSalary"):
            salary = f"{job.get('minSalary')}-{job.get('maxSalary')} {job.get('currency','')}".strip()
        out.append({
            "source": "himalayas",
            "id": str(job.get("guid") or job.get("applicationLink") or title),
            "title": title,
            "company": job.get("companyName") or "",
            "url": job.get("applicationLink") or job.get("guid") or "",
            "location": location,
            "description": desc,
            "date": _epoch_to_date(job.get("pubDate")),
            "seniority": ", ".join(sen) if isinstance(sen, list) else str(sen),
            "salary": salary,
            "employment_type": job.get("employmentType") or "",
        })
    return out, None


def fetch_arbeitnow(keywords):
    """Arbeitnow: bolsa europea (mucha oferta en Alemania/UE)."""
    out = []
    try:
        data = _get_json("https://www.arbeitnow.com/api/job-board-api")
    except Exception as e:
        return out, f"arbeitnow error: {e}"
    for job in data.get("data", []):
        if not job.get("remote"):
            continue
        title = job.get("title") or ""
        tags = " ".join(job.get("tags") or [])
        desc = strip_html(job.get("description"))
        if not matches_role(title, desc, tags):
            continue
        out.append({
            "source": "arbeitnow",
            "id": str(job.get("slug")),
            "title": title,
            "company": job.get("company_name") or "",
            "url": f"https://www.arbeitnow.com/jobs/companies/{job.get('slug')}",
            "location": job.get("location") or "",
            "description": desc,
            "date": _epoch_to_date(job.get("created_at")),
            "seniority": "",
            "salary": "",
            "employment_type": ", ".join(job.get("job_types") or []),
        })
    return out, None


def _get_xml(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        raw = resp.read()
    import xml.etree.ElementTree as ET
    return ET.fromstring(raw)


def _rss_date(value):
    """'Wed, 12 Aug 2026 23:41:10 +0000' -> '2026-08-12'."""
    if not value:
        return ""
    for fmt in ("%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z"):
        try:
            return datetime.strptime(value.strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return ""


WWR_CATEGORIES = [
    "remote-design-jobs",
    "remote-programming-jobs",
]


def fetch_weworkremotely():
    """WeWorkRemotely: RSS con region/country/skills estructurados.

    El campo `country`, cuando existe, manda sobre `region`: muchas ofertas
    dicen "Anywhere in the World" pero luego restringen a EEUU/Canada.
    """
    out = []
    problems = []
    for cat in WWR_CATEGORIES:
        url = f"https://weworkremotely.com/categories/{cat}.rss"
        try:
            root = _get_xml(url)
        except Exception as e:
            problems.append(f"weworkremotely {cat} error: {e}")
            continue
        for item in root.findall(".//item"):
            def field(name):
                el = item.find(name)
                return (el.text or "").strip() if el is not None and el.text else ""

            raw_title = field("title")
            company, _, title = raw_title.partition(":")
            title = title.strip() or raw_title
            company = company.strip() if title != raw_title else ""

            region = field("region")
            country = re.sub(r"[^\w\s,.&-]", "", field("country")).strip()
            location = country or region or ""

            desc = strip_html(field("description"))
            skills = field("skills")
            if not matches_role(title, desc, f"{skills} {field('category')}"):
                continue

            out.append({
                "source": "weworkremotely",
                "id": field("guid") or field("link"),
                "title": title,
                "company": company,
                "url": field("link"),
                "location": location,
                "description": desc,
                "date": _rss_date(field("pubDate")),
                "seniority": "",
                "salary": "",
                "employment_type": field("type"),
            })
    return out, problems


_SCRIPT_RE = re.compile(r"(?is)<(script|style|nav|header|footer)[^>]*>.*?</\1>")
_ABOUT_RE = re.compile(
    r"\bAbout\s+([A-Z][\w&.\-]*(?:\s+[A-Z][\w&.\-]*){0,3})\b")
# Palabras que indican que ya empezo la frase, no el nombre de la empresa.
_COMPANY_STOP = {
    "is", "was", "are", "we", "our", "has", "have", "provides", "helps",
    "builds", "creates", "the", "a", "an", "and", "in", "at", "for",
}


def _clean_company(raw):
    """'Fixel Fixel is a digital studio' -> 'Fixel'."""
    if not raw:
        return ""
    words = []
    for w in raw.split():
        if w.lower() in _COMPANY_STOP:
            break
        if words and w.lower() == words[-1].lower():
            continue  # el nombre se repite al empezar la frase
        words.append(w)
        if len(words) >= 3:
            break
    return " ".join(words).strip(" .,-&")


def _page_text(url):
    """Descarga una pagina y devuelve su texto plano (sin scripts/nav)."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        html = resp.read().decode("utf-8", errors="replace")
    html = _SCRIPT_RE.sub(" ", html)
    return strip_html(html)


def fetch_wordpress_jobs(fetch_details=True):
    """jobs.wordpress.net: tablon oficial de empleo de WordPress.

    El RSS viene truncado ("[...]") y sin empresa ni ubicacion, asi que
    sin abrir cada oferta no se puede evaluar remoto/senioridad/anos. Son
    pocas (menos de 10 por feed), de modo que las descargamos enteras.
    """
    out = []
    problems = []
    try:
        root = _get_xml("https://jobs.wordpress.net/feed/")
    except Exception as e:
        return out, [f"wordpressjobs error: {e}"]

    for item in root.findall(".//item"):
        def field(name):
            el = item.find(name)
            return (el.text or "").strip() if el is not None and el.text else ""

        title = field("title")
        link = field("link")
        desc = strip_html(field("description"))
        company = ""

        if fetch_details and link:
            try:
                full = _page_text(link)
                # Recorta la cabecera del sitio para quedarnos con la oferta.
                marker = f"Jobs / {title}"
                idx = full.find(marker)
                if idx != -1:
                    full = full[idx + len(marker):]
                if len(full) > len(desc):
                    desc = full[:6000]
                m = _ABOUT_RE.search(desc[:1200])
                if m:
                    company = _clean_company(m.group(1))
            except Exception as e:
                problems.append(f"wordpressjobs detalle {link}: {e}")

        out.append({
            "source": "wordpressjobs",
            "id": field("guid") or link,
            "title": title,
            "company": company,
            "url": link,
            "location": "",
            "description": desc,
            "date": _rss_date(field("pubDate")),
            "seniority": "",
            "salary": "",
            "employment_type": "",
            # Tablon oficial: aunque no logremos extraer la empresa, la
            # oferta no es "anonima" en el sentido que penaliza el scoring.
            "trusted_board": True,
        })
    return out, problems


# --- Agregador --------------------------------------------------------------

# Palabras que deben aparecer para que la oferta sea siquiera candidata.
DEFAULT_KEYWORDS = [
    "wordpress", "elementor", "woocommerce", "webflow", "shopify",
    "seo", "search engine optimization", "posicionamiento",
    "web design", "web designer", "diseño web", "graphic design",
    "ui design", "visual design", "motion design", "figma",
    "content marketing", "digital marketing",
]

REMOTIVE_QUERIES = ["wordpress", "seo", "web design", "graphic design"]
JOBICY_TAGS = ["wordpress", "seo", "design", "marketing"]


def fetch_all(keywords=None, max_age_days=21, require_spain_eligible=True,
              full_time_only=True):
    """Consulta las cinco fuentes y devuelve (ofertas, incidencias).

    Deduplica por (empresa, titulo) normalizados, ya que la misma oferta
    aparece a menudo en varios agregadores.
    """
    keywords = [k.lower() for k in (keywords or DEFAULT_KEYWORDS)]
    all_jobs = []
    problems = []

    jobs, err = fetch_remoteok(keywords)
    all_jobs += jobs
    if err:
        problems.append(err)

    for q in REMOTIVE_QUERIES:
        jobs, err = fetch_remotive(q)
        all_jobs += jobs
        if err:
            problems.append(err)

    for tag in JOBICY_TAGS:
        jobs, err = fetch_jobicy(tag)
        all_jobs += jobs
        if err:
            problems.append(err)

    jobs, err = fetch_himalayas(keywords)
    all_jobs += jobs
    if err:
        problems.append(err)

    jobs, err = fetch_arbeitnow(keywords)
    all_jobs += jobs
    if err:
        problems.append(err)

    jobs, errs = fetch_weworkremotely()
    all_jobs += jobs
    problems += errs or []

    jobs, errs = fetch_wordpress_jobs()
    all_jobs += jobs
    problems += errs or []

    seen = set()
    result = []
    for job in all_jobs:
        if not job.get("title") or not job.get("url"):
            continue
        if _days_old(job.get("date")) > max_age_days:
            continue
        if require_spain_eligible and not geo_allows_spain(job.get("location")):
            continue
        if full_time_only and not employment_is_full_time(
                job.get("employment_type"), job.get("title"),
                job.get("description")):
            continue
        key = (
            re.sub(r"[^a-z0-9]", "", (job.get("company") or "").lower()),
            re.sub(r"[^a-z0-9]", "", (job.get("title") or "").lower()),
        )
        if key in seen:
            continue
        seen.add(key)
        result.append(job)

    return result, problems


if __name__ == "__main__":
    import sys
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except AttributeError:
        pass
    jobs, problems = fetch_all()
    by_source = {}
    for j in jobs:
        by_source[j["source"]] = by_source.get(j["source"], 0) + 1
    print(f"{len(jobs)} ofertas candidatas tras filtro geo/antiguedad")
    print("Por fuente:", by_source)
    for p in problems:
        print("INCIDENCIA:", p)
    for j in jobs[:15]:
        print(f"  [{j['source']}] {j['title']} @ {j['company']} — {j['location']}")
