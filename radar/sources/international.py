"""Recolectores internacionales: APIs y feeds publicos de trabajo remoto.

Complementan a las fuentes españolas. Todas son HTTP directo sin clave ni
autenticacion, para que nada dependa de servicios que se desconecten.
"""

import re
import xml.etree.ElementTree as ET

from ..models import Job
from .common import (clean_text, epoch_to_date, fetch, qs, rss_date, unescape)


def _xml(url):
    return ET.fromstring(fetch(url).encode("utf-8", errors="replace"))


def _field(item, name):
    el = item.find(name)
    return (el.text or "").strip() if el is not None and el.text else ""


def fetch_remoteok():
    jobs, problems = [], []
    try:
        data = fetch("https://remoteok.com/api", as_json=True)
    except Exception as e:
        return jobs, [f"remoteok: {e}"]
    for job in data:
        if not isinstance(job, dict) or not job.get("id"):
            continue
        salary = ""
        if job.get("salary_min"):
            salary = f"{job['salary_min']}-{job.get('salary_max')} USD"
        jobs.append(Job(
            source="remoteok",
            source_id=str(job["id"]),
            title=job.get("position") or "",
            company=job.get("company") or "",
            url=job.get("url") or job.get("apply_url") or "",
            location=job.get("location") or "",
            description=clean_text(job.get("description")),
            date=epoch_to_date(job.get("epoch")) or str(job.get("date") or "")[:10],
            raw_tags=" ".join(job.get("tags") or []),
            employment_type=" ".join(job.get("tags") or []),
            salary=salary,
            remote_flag=True,
        ))
    return jobs, problems


def fetch_remotive(queries):
    jobs, problems = [], []
    for query in queries:
        try:
            data = fetch("https://remotive.com/api/remote-jobs?" +
                         qs(search=query, limit=50), as_json=True)
        except Exception as e:
            problems.append(f"remotive '{query}': {e}")
            continue
        for job in data.get("jobs", []):
            jobs.append(Job(
                source="remotive",
                source_id=str(job.get("id")),
                title=job.get("title") or "",
                company=job.get("company_name") or "",
                url=job.get("url") or "",
                location=job.get("candidate_required_location") or "",
                description=clean_text(job.get("description")),
                date=str(job.get("publication_date") or "")[:10],
                employment_type=job.get("job_type") or "",
                salary=job.get("salary") or "",
                raw_tags=" ".join(job.get("tags") or []),
                remote_flag=True,
            ))
    return jobs, problems


def fetch_jobicy(tags, geo="europe"):
    jobs, problems = [], []
    for tag in tags:
        try:
            data = fetch("https://jobicy.com/api/v2/remote-jobs?" +
                         qs(count=50, geo=geo, tag=tag), as_json=True)
        except Exception as e:
            problems.append(f"jobicy '{tag}': {e}")
            continue
        for job in data.get("jobs", []):
            jtype = job.get("jobType")
            salary = ""
            if job.get("annualSalaryMin"):
                salary = (f"{job['annualSalaryMin']}-{job.get('annualSalaryMax')} "
                          f"{job.get('salaryCurrency', '')}").strip()
            jobs.append(Job(
                source="jobicy",
                source_id=str(job.get("id")),
                title=job.get("jobTitle") or "",
                company=job.get("companyName") or "",
                url=job.get("url") or "",
                location=job.get("jobGeo") or "",
                description=clean_text(job.get("jobDescription") or job.get("jobExcerpt")),
                date=str(job.get("pubDate") or "")[:10],
                employment_type=", ".join(jtype) if isinstance(jtype, list) else (jtype or ""),
                seniority=str(job.get("jobLevel") or ""),
                salary=salary,
                raw_tags=" ".join(job.get("jobIndustry") or []),
                remote_flag=True,
            ))
    return jobs, problems


def fetch_himalayas(pages=20):
    """Sin busqueda por texto y tope de 20 por pagina: paginamos por offset."""
    jobs, problems = [], []
    for page in range(pages):
        try:
            data = fetch(f"https://himalayas.app/jobs/api?limit=20&offset={page * 20}",
                         as_json=True)
        except Exception as e:
            if page == 0:
                problems.append(f"himalayas: {e}")
            break
        batch = data.get("jobs", [])
        if not batch:
            break
        for job in batch:
            restrictions = job.get("locationRestrictions") or []
            sen = job.get("seniority") or []
            salary = ""
            if job.get("minSalary"):
                salary = (f"{job['minSalary']}-{job.get('maxSalary')} "
                          f"{job.get('currency', '')}").strip()
            jobs.append(Job(
                source="himalayas",
                source_id=str(job.get("guid") or job.get("applicationLink") or job.get("title")),
                title=job.get("title") or "",
                company=job.get("companyName") or "",
                url=job.get("applicationLink") or job.get("guid") or "",
                location=", ".join(restrictions) if restrictions else "Worldwide",
                description=clean_text(job.get("description") or job.get("excerpt")),
                date=epoch_to_date(job.get("pubDate")),
                employment_type=job.get("employmentType") or "",
                seniority=", ".join(sen) if isinstance(sen, list) else str(sen),
                salary=salary,
                raw_tags=" ".join(job.get("categories") or []),
                remote_flag=True,
            ))
    return jobs, problems


def fetch_arbeitnow():
    jobs, problems = [], []
    try:
        data = fetch("https://www.arbeitnow.com/api/job-board-api", as_json=True)
    except Exception as e:
        return jobs, [f"arbeitnow: {e}"]
    for job in data.get("data", []):
        jobs.append(Job(
            source="arbeitnow",
            source_id=str(job.get("slug")),
            title=job.get("title") or "",
            company=job.get("company_name") or "",
            url=f"https://www.arbeitnow.com/jobs/companies/{job.get('slug')}",
            location=job.get("location") or "",
            description=clean_text(job.get("description")),
            date=epoch_to_date(job.get("created_at")),
            employment_type=", ".join(job.get("job_types") or []),
            raw_tags=" ".join(job.get("tags") or []),
            remote_flag=bool(job.get("remote")),
        ))
    return jobs, problems


WWR_CATEGORIES = ["remote-design-jobs", "remote-programming-jobs"]


def fetch_weworkremotely():
    """El campo `country` manda sobre `region`: muchas ofertas dicen
    "Anywhere in the World" y luego restringen a EEUU/Canada."""
    jobs, problems = [], []
    for cat in WWR_CATEGORIES:
        try:
            root = _xml(f"https://weworkremotely.com/categories/{cat}.rss")
        except Exception as e:
            problems.append(f"weworkremotely {cat}: {e}")
            continue
        for item in root.findall(".//item"):
            raw_title = _field(item, "title")
            company, _, title = raw_title.partition(":")
            title = title.strip() or raw_title
            company = company.strip() if title != raw_title else ""
            country = re.sub(r"[^\w\s,.&-]", "", _field(item, "country")).strip()
            jobs.append(Job(
                source="weworkremotely",
                source_id=_field(item, "guid") or _field(item, "link"),
                title=unescape(title),
                company=unescape(company),
                url=_field(item, "link"),
                location=country or _field(item, "region"),
                description=clean_text(_field(item, "description")),
                date=rss_date(_field(item, "pubDate")),
                employment_type=_field(item, "type"),
                raw_tags=f"{_field(item, 'skills')} {_field(item, 'category')}",
                remote_flag=True,
            ))
    return jobs, problems


_ABOUT_RE = re.compile(r"\bAbout\s+([A-Z][\w&.\-]*(?:\s+[A-Z][\w&.\-]*){0,3})\b")
_STOP = {"is", "was", "are", "we", "our", "has", "have", "provides", "helps",
         "builds", "creates", "the", "a", "an", "and", "in", "at", "for"}


def _company_from_about(text):
    m = _ABOUT_RE.search(text[:1200])
    if not m:
        return ""
    words = []
    for w in m.group(1).split():
        if w.lower() in _STOP:
            break
        if words and w.lower() == words[-1].lower():
            continue
        words.append(w)
        if len(words) >= 3:
            break
    return " ".join(words).strip(" .,-&")


def fetch_wordpress_jobs(with_detail=True):
    """Tablon oficial de WordPress. El RSS viene truncado y sin empresa ni
    ubicacion, asi que hace falta abrir cada oferta para poder juzgarla."""
    jobs, problems = [], []
    try:
        root = _xml("https://jobs.wordpress.net/feed/")
    except Exception as e:
        return jobs, [f"wordpressjobs: {e}"]

    for item in root.findall(".//item"):
        title = _field(item, "title")
        link = _field(item, "link")
        desc = clean_text(_field(item, "description"))
        company = ""
        if with_detail and link:
            try:
                full = clean_text(fetch(link))
                marker = f"Jobs / {title}"
                idx = full.find(marker)
                if idx != -1:
                    full = full[idx + len(marker):]
                if len(full) > len(desc):
                    desc = full[:8000]
                company = _company_from_about(desc)
            except Exception as e:
                problems.append(f"wordpressjobs {link}: {e}")
        jobs.append(Job(
            source="wordpressjobs",
            source_id=_field(item, "guid") or link,
            title=title,
            company=company,
            url=link,
            description=desc,
            date=rss_date(_field(item, "pubDate")),
        ))
    return jobs, problems
