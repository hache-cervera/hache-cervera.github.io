"""Prefiltro barato antes del juicio con IA.

Su unico trabajo es tirar lo que es indiscutiblemente inutil, para no gastar
tokens en ello. Es deliberadamente PERMISIVO: ante la duda, la oferta pasa y
que decida el juez. Solo dos motivos descartan aqui:

  1. No es remota.
  2. Es freelance / por proyecto / practicas / media jornada.

Ademas descarta lo que ni siquiera es de la profesion (contabilidad,
enfermeria, comercial...), porque los buscadores de InfoJobs y Tecnoempleo
devuelven resultados muy laxos.
"""

import re

from . import profile
from .models import Job
from .sources.common import days_old

# --- Remoto -----------------------------------------------------------------

NOT_REMOTE = [
    "presencial", "on-site", "onsite", "on site", "in-office", "in office",
    "hibrido", "híbrido", "hybrid", "semipresencial",
    "oficina obligatoria", "acudir a la oficina", "relocation required",
    "must relocate", "mudanza obligatoria",
]
REMOTE_OK = [
    "remoto", "remote", "teletrabajo", "100% remoto", "fully remote",
    "work from home", "desde casa", "anywhere", "distributed", "remote-first",
]

# --- Tipo de contrato -------------------------------------------------------

NOT_EMPLOYMENT = [
    "freelance", "freelancer", "autonomo", "autónomo", "por proyecto",
    "project-based", "per project", "contractor", "self-employed",
    "media jornada", "part-time", "part time", "parttime",
    "prácticas", "practicas", "internship", "intern ", "becario", "beca",
    "voluntario", "volunteer", "obra y servicio", "temporal", "temporary",
]
FULL_TIME = [
    "jornada completa", "full-time", "full time", "fulltime", "indefinido",
    "permanent", "contrato indefinido", "employee",
]

# --- Profesion --------------------------------------------------------------

# Si el titulo contiene algo de esto, la oferta es de otro oficio.
OTHER_PROFESSION = [
    "contable", "contabilidad", "fiscal", "laboral", "n[oó]minas",
    "enfermer", "m[eé]dic", "sanitari", "farmac", "veterinari",
    "abogad", "jurídic", "juridic", "notari",
    "camarer", "cociner", "chef", "hostelería", "hosteleria", "limpieza",
    "conductor", "chofer", "repartidor", "almac[eé]n", "mozo",
    "recepci[oó]n", "administrativ", "secretari", "teleoperador",
    "call center", "atenci[oó]n al cliente", "customer support",
    "comercial", "ventas", "sales ", "business development",
    "recursos humanos", "rrhh", "selecci[oó]n de personal", "recruiter",
    "electricista", "fontaner", "soldador", "mec[aá]nic", "obra",
    "profesor", "docente", "educador", "monitor",
    "seguridad privada", "vigilante", "socorrista",
    "trader", "financ", "banca", "seguros",
    "enginyer", "ingenier[oa] (?:civil|industrial|agr)",
    "devops", "sre", "data engineer", "data scientist", "machine learning",
    "android", "ios developer", "mobile developer", "qa engineer",
    "cloud architect", "cyber", "ciberseguridad", "sistemas",
]
_OTHER_RE = re.compile("|".join(OTHER_PROFESSION), re.IGNORECASE)

# Terminos que por si solos confirman que la oferta es del oficio.
OWN_STRONG = [
    "wordpress", "elementor", "woocommerce", "webflow", "wix", "prestashop",
    "seo", "sem\\b", "posicionamiento web", "linkbuilding",
    "dise[ñn]ador", "dise[ñn]adora", "dise[ñn]o web", "dise[ñn]o gr[aá]fic",
    "web design", "web designer", "graphic design", "designer",
    "maquetad", "webmaster", "ux/ui", "ui/ux", "figma",
    "motion graphic", "director[ea] de arte", "art director",
]
_OWN_STRONG_RE = re.compile("|".join(OWN_STRONG), re.IGNORECASE)

# Terminos genericos: NO bastan solos. "Marketing Manager" o "Head of
# Ecommerce" son de gestion, no del oficio de Hache; solo valen si ademas
# aparece algo de web/SEO/diseño.
OWN_WEAK = [
    "marketing digital", "digital marketing", "content", "contenido",
    "creativ", "brand", "marca", "digital", "ecommerce", "e-commerce",
    "web", "ux", "ui", "cms", "front",
]
_OWN_WEAK_RE = re.compile("|".join(OWN_WEAK), re.IGNORECASE)


def _has(terms, text):
    return any(t in text for t in terms)


def is_remote(job: Job):
    """(es_remota, motivo). Permisivo: solo descarta si lo dice claramente."""
    if job.remote_flag is True:
        # La fuente ya filtro por remoto, pero el texto puede desmentirlo.
        text = f"{job.title} {job.location} {job.employment_type}".lower()
        if _has(["híbrido", "hibrido", "hybrid", "semipresencial"], text):
            return False, "el anuncio dice híbrido"
        return True, ""

    text = f"{job.title} {job.location} {job.employment_type} {job.description[:2500]}".lower()
    if _has(REMOTE_OK, text):
        if _has(["híbrido", "hibrido", "hybrid", "semipresencial"], text[:600]):
            return False, "híbrido"
        return True, ""
    if _has(NOT_REMOTE, text):
        return False, "presencial o híbrido"
    if job.remote_flag is False:
        return False, "la fuente la marca como no remota"
    # Sin señal alguna: dejar pasar y que lo determine el juez.
    return True, ""


def is_employment(job: Job):
    """(es_por_cuenta_ajena, motivo)."""
    declared = (job.employment_type or "").lower()
    title = (job.title or "").lower()

    if declared and _has(FULL_TIME, declared) and not _has(NOT_EMPLOYMENT, declared):
        return True, ""
    if _has(NOT_EMPLOYMENT, declared):
        return False, f"tipo de contrato: {job.employment_type}"
    if _has(NOT_EMPLOYMENT, title):
        return False, "el título indica freelance/parcial"

    body = (job.description or "")[:2500].lower()
    if re.search(r"\b(freelance|freelancer|aut[oó]nomo)\b", body):
        return False, "el anuncio menciona freelance/autónomo"
    return True, ""


def is_own_profession(job: Job):
    """(es_del_oficio, motivo).

    Una señal fuerte en el titulo basta. Las genericas ("marketing",
    "digital", "ecommerce") necesitan ademas algo de web/SEO/diseño, porque
    si no entra cualquier puesto de gestion de marketing.
    """
    title = job.title or ""
    body = (job.description or "")[:2000]

    if _OWN_STRONG_RE.search(title):
        return True, ""
    if _OTHER_RE.search(title):
        return False, "es de otra profesión"
    if _OWN_WEAK_RE.search(title):
        # Generico: exigir refuerzo en el titulo o en el cuerpo.
        if _OWN_STRONG_RE.search(body) or _OWN_STRONG_RE.search(title):
            return True, ""
        return False, "marketing/gestión genérico, sin web ni SEO ni diseño"
    if _OWN_STRONG_RE.search(body):
        return True, ""
    return False, "no parece del oficio"


def prefilter(jobs, max_age_days=None):
    """Devuelve (pasan, descartadas) donde descartadas son (job, motivo)."""
    max_age_days = max_age_days or profile.MAX_AGE_DAYS
    passed, rejected, seen = [], [], set()

    for job in jobs:
        if not job.title or not job.url:
            continue

        fp = job.fingerprint
        if fp in seen:
            continue
        seen.add(fp)

        if job.date and days_old(job.date) > max_age_days:
            rejected.append((job, f"antigua ({job.date})"))
            continue

        ok, why = is_own_profession(job)
        if not ok:
            rejected.append((job, why))
            continue

        if profile.REQUIRE_REMOTE:
            ok, why = is_remote(job)
            if not ok:
                rejected.append((job, why))
                continue

        if profile.REQUIRE_NOT_FREELANCE:
            ok, why = is_employment(job)
            if not ok:
                rejected.append((job, why))
                continue

        passed.append(job)

    return passed, rejected
