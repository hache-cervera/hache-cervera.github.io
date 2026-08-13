"""Recolectores del mercado español: LinkedIn, InfoJobs y Tecnoempleo.

Son la fuente principal de Radar: la mayoria de ofertas que encajan con el
perfil de Hache estan aqui, no en los agregadores internacionales de trabajo
remoto (que son mayoritariamente estadounidenses).

Ninguno necesita clave ni cuenta: LinkedIn expone un endpoint publico de
invitado, e InfoJobs y Tecnoempleo se leen de su HTML de busqueda.
"""

import re

from ..models import Job
from .common import (clean_text, fetch, qs, relative_date_es, unescape)

# ---------------------------------------------------------------- LinkedIn

LI_SEARCH = "https://es.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
LI_DETAIL = "https://es.linkedin.com/jobs-guest/jobs/api/jobPosting/{job_id}"

# f_WT=2 es el filtro de "remoto" de LinkedIn. f_TPR=r2592000 son 30 dias.
LI_REMOTE = "2"


def _li_card(card):
    def grab(pattern, flags=re.S):
        m = re.search(pattern, card, flags)
        return unescape(m.group(1).strip()) if m else ""

    url = grab(r'href="(https://[^"]*?/jobs/view/[^"?]+)')
    title = grab(r'base-search-card__title">\s*(.*?)\s*</h3>')
    company = grab(
        r'base-search-card__subtitle"[^>]*>\s*(?:<a[^>]*>)?\s*(.*?)\s*(?:</a>)?\s*</h4>')
    location = grab(r'job-search-card__location">\s*(.*?)\s*</span>')
    date = grab(r'datetime="([^"]+)"')
    job_id = ""
    m = re.search(r"/jobs/view/[^/\"?]*?-(\d{6,})", url) or \
        re.search(r'data-entity-urn="urn:li:jobPosting:(\d+)"', card)
    if m:
        job_id = m.group(1)
    return title, company, location, url, date, job_id


def fetch_linkedin(queries, location="Spain", pages=3, with_detail=True,
                   detail_cap=40):
    """Busca en LinkedIn con el filtro nativo de remoto."""
    jobs, problems = [], []
    seen_ids = set()

    for query in queries:
        for page in range(pages):
            url = f"{LI_SEARCH}?" + qs(keywords=query, location=location,
                                       f_WT=LI_REMOTE, f_TPR="r2592000",
                                       start=page * 10)
            try:
                html = fetch(url)
            except Exception as e:
                problems.append(f"linkedin '{query}' p{page}: {e}")
                break
            cards = re.findall(r"<li>(.*?)</li>", html, re.S)
            if not cards:
                break
            for card in cards:
                title, company, location_txt, job_url, date, job_id = _li_card(card)
                if not title or not job_url:
                    continue
                key = job_id or job_url
                if key in seen_ids:
                    continue
                seen_ids.add(key)
                jobs.append(Job(
                    source="linkedin",
                    source_id=job_id or job_url,
                    title=title,
                    company=company,
                    url=job_url,
                    location=location_txt,
                    date=date,
                    remote_flag=True,   # filtrado por LinkedIn como remoto
                ))

    if with_detail:
        for job in jobs[:detail_cap]:
            try:
                enrich_linkedin(job)
            except Exception as e:
                problems.append(f"linkedin detalle {job.source_id}: {e}")

    return jobs, problems


def enrich_linkedin(job):
    """Descarga la descripcion completa de una oferta de LinkedIn."""
    if not str(job.source_id).isdigit():
        return
    html = fetch(LI_DETAIL.format(job_id=job.source_id))
    body = re.search(
        r'(?is)<div[^>]*(?:description__text|show-more-less-html__markup)[^>]*>(.*?)</div>\s*</div>',
        html)
    text = clean_text(body.group(1) if body else html)
    if len(text) > len(job.description):
        job.description = text[:12000]
    crit = re.findall(
        r'(?is)description__job-criteria-subheader">\s*(.*?)\s*</h3>.*?'
        r'description__job-criteria-text[^>]*>\s*(.*?)\s*</span>', html)
    for label, value in crit:
        label_l, value = label.lower(), unescape(value)
        if "nivel" in label_l or "seniority" in label_l:
            job.seniority = value
        elif "empleo" in label_l or "employment" in label_l:
            job.employment_type = value


# ---------------------------------------------------------------- InfoJobs

IJ_SEARCH = "https://www.infojobs.net/jobsearch/search-results/list.xhtml"


def fetch_infojobs(queries, pages=2, with_detail=True, detail_cap=25):
    """InfoJobs con el filtro de teletrabajo activado."""
    jobs, problems = [], []
    seen = set()

    for query in queries:
        for page in range(1, pages + 1):
            url = f"{IJ_SEARCH}?" + qs(keyword=query, teleworking="teleworking",
                                       segmentId="", page=page, sortBy="PUBLICATION_DATE")
            try:
                html = fetch(url)
            except Exception as e:
                problems.append(f"infojobs '{query}' p{page}: {e}")
                break

            # La tarjeta trae el titulo en aria-label y la empresa en el <h3>
            # inmediatamente posterior. Las URLs son relativas al protocolo.
            for m in re.finditer(
                    r'href="(?P<url>//www\.infojobs\.net/[^"]*?/of-i(?P<id>[a-z0-9]+))[^"]*"'
                    r'[^>]*aria-label="(?P<title>[^"]{5,160})"',
                    html):
                job_id = m.group("id")
                if job_id in seen:
                    continue
                seen.add(job_id)
                title = unescape(m.group("title")).strip()
                if not title:
                    continue
                window = html[m.end(): m.end() + 900]
                comp = re.search(
                    r'(?is)description-subtitle-link[^"]*"[^>]*>\s*([^<]{2,80})\s*</a>',
                    window)
                jobs.append(Job(
                    source="infojobs",
                    source_id=job_id,
                    title=title,
                    company=unescape(comp.group(1)).strip() if comp else "",
                    url="https:" + m.group("url"),
                    location="España",
                    remote_flag=True,   # filtrado por InfoJobs como teletrabajo
                ))

    if with_detail:
        for job in jobs[:detail_cap]:
            try:
                enrich_infojobs(job)
            except Exception as e:
                problems.append(f"infojobs detalle {job.source_id}: {e}")

    return jobs, problems


def enrich_infojobs(job):
    html = fetch(job.url)
    text = clean_text(html)
    idx = text.find("Descripción")
    if idx != -1:
        text = text[idx:]
    job.description = text[:12000]
    if not job.company:
        m = re.search(r'(?is)<h[23][^>]*>\s*([^<]{2,80})\s*</h[23]>', html)
        if m:
            job.company = unescape(m.group(1)).strip()
    m = re.search(r"(?i)(jornada\s+\w+|contrato\s+\w+)", text)
    if m:
        job.employment_type = m.group(1)


# ------------------------------------------------------------- Tecnoempleo

TE_SEARCH = "https://www.tecnoempleo.com/ofertas-trabajo/"


def fetch_tecnoempleo(queries, pages=2, with_detail=True, detail_cap=25):
    """Tecnoempleo filtrando por teletrabajo total (te=...&tt=1)."""
    jobs, problems = [], []
    seen = set()

    for query in queries:
        for page in range(1, pages + 1):
            url = f"{TE_SEARCH}?" + qs(te=query, tt="1", pagina=page)
            try:
                html = fetch(url)
            except Exception as e:
                problems.append(f"tecnoempleo '{query}' p{page}: {e}")
                break

            for m in re.finditer(
                    r'href="(?P<url>https://www\.tecnoempleo\.com/[^"]*?/(?P<id>rf-[a-z0-9]+))"[^>]*>\s*(?P<title>[^<]{5,140})</a>',
                    html):
                job_id = m.group("id")
                if job_id in seen:
                    continue
                seen.add(job_id)
                window = html[m.end(): m.end() + 2200]
                comp = re.search(
                    r'(?is)href="https://www\.tecnoempleo\.com/[^"]*?/re-\d+"[^>]*>\s*([^<]{2,80})\s*</a>',
                    window)
                loc = re.search(r"(?i)(100%\s*remoto|teletrabajo[^<|]{0,30})", window)
                date = re.search(r"(\d{2})/(\d{2})/(\d{4})", window)
                # El listado ya trae un extracto util para el prefiltro.
                excerpt = re.search(
                    r'(?is)hidden-md-down[^>]*>\s*(?:<br\s*/?>)?\s*(.{40,900}?)</span>',
                    window)
                jobs.append(Job(
                    source="tecnoempleo",
                    source_id=job_id,
                    title=unescape(m.group("title")).strip(),
                    company=unescape(comp.group(1)).strip() if comp else "",
                    url=m.group("url"),
                    location=unescape(loc.group(1)).strip() if loc else "España",
                    date=(f"{date.group(3)}-{date.group(2)}-{date.group(1)}"
                          if date else ""),
                    description=clean_text(excerpt.group(1)) if excerpt else "",
                    remote_flag=True,
                ))

    if with_detail:
        for job in jobs[:detail_cap]:
            try:
                enrich_tecnoempleo(job)
            except Exception as e:
                problems.append(f"tecnoempleo detalle {job.source_id}: {e}")

    return jobs, problems


def enrich_tecnoempleo(job):
    html = fetch(job.url)
    text = clean_text(html)
    idx = text.find("Descripción")
    if idx != -1:
        text = text[idx:]
    job.description = text[:12000]
    m = re.search(r"(?i)(teletrabajo[^.|]{0,40})", text)
    if m:
        job.location = m.group(1).strip()
    m = re.search(r"(?i)(jornada\s+\w+)", text)
    if m:
        job.employment_type = m.group(1)
