"""Evaluacion de ofertas: lee cada anuncio y lo clasifica.

Dos motores:
  - `llm`: manda la oferta a la API de Anthropic con el perfil y la rubrica.
    Es el bueno: entiende el texto, distingue "imprescindible" de "se
    valorara", y explica su decision.
  - `rules`: respaldo por palabras clave cuando no hay clave API. Es tosco
    a proposito y tiende a "review" en vez de descartar, para no perder
    ofertas buenas por no saber leerlas.

El resultado siempre es un Verdict con veredicto, nota, motivo, dudas y
puntos a destacar al aplicar.
"""

import json
import os
import re
import urllib.request

from . import profile
from .models import Verdict

API_URL = "https://api.anthropic.com/v1/messages"
MODEL = os.environ.get("RADAR_MODEL", "claude-sonnet-5")
MAX_DESC_CHARS = 9000


def has_api_key():
    return bool(os.environ.get("ANTHROPIC_API_KEY"))


# ----------------------------------------------------------------- IA

SYSTEM = f"""Eres el filtro de un sistema de busqueda de empleo. Evaluas ofertas
para una candidata concreta y devuelves un veredicto en JSON.

PERFIL DE LA CANDIDATA:
{profile.PROFILE}

COMO DECIDIR:
{profile.RUBRIC}

Responde SIEMPRE con un unico objeto JSON valido, sin texto alrededor y sin
bloques de codigo, con exactamente estas claves:
{{
  "verdict": "apply" | "review" | "reject",
  "score": entero de 0 a 100 (encaje global con el perfil),
  "reason": "una o dos frases en español explicando la decision",
  "concerns": ["lo que no encaja o no queda claro, en español"],
  "highlights": ["que deberia destacar ella al aplicar, en español"]
}}
Si el veredicto es "review", `concerns` debe explicar exactamente que hay que
comprobar. Se breve y concreto."""


def _prompt(job):
    desc = (job.description or "")[:MAX_DESC_CHARS]
    if not desc.strip():
        desc = "(sin descripcion disponible; juzga con lo demas y ante la duda usa review)"
    return f"""Evalua esta oferta:

PUESTO: {job.title}
EMPRESA: {job.company or "(no indicada)"}
UBICACION / ALCANCE: {job.location or "(no indicada)"}
TIPO DE CONTRATO: {job.employment_type or "(no indicado)"}
NIVEL: {job.seniority or "(no indicado)"}
SALARIO: {job.salary or "(no indicado)"}
FUENTE: {job.source}

DESCRIPCION:
{desc}"""


def _call_api(prompt, api_key, timeout=90):
    body = json.dumps({
        "model": MODEL,
        "max_tokens": 900,
        "system": SYSTEM,
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")
    req = urllib.request.Request(API_URL, data=body, headers={
        "content-type": "application/json",
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
    })
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    parts = [b.get("text", "") for b in data.get("content", [])
             if b.get("type") == "text"]
    return "".join(parts).strip()


def _parse_json(text):
    """Extrae el objeto JSON aunque venga envuelto en prosa o ```."""
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.M).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    m = re.search(r"\{.*\}", text, re.S)
    if m:
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            pass
    return None


def judge_with_llm(job, api_key=None):
    api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("falta ANTHROPIC_API_KEY")
    raw = _call_api(_prompt(job), api_key)
    data = _parse_json(raw)
    if not data:
        # Si el modelo no devuelve JSON, no inventamos: a revision.
        return Verdict(verdict="review", score=50, judged_by="llm",
                       reason="El evaluador no devolvio un veredicto legible.",
                       concerns=["Revisar la oferta a mano."])
    return Verdict(
        verdict=str(data.get("verdict", "review")).lower().strip(),
        score=data.get("score", 0),
        reason=str(data.get("reason", "")).strip(),
        concerns=[str(c) for c in (data.get("concerns") or [])][:6],
        highlights=[str(h) for h in (data.get("highlights") or [])][:6],
        judged_by="llm",
    )


# -------------------------------------------------------------- Reglas

CORE = ["wordpress", "elementor", "woocommerce", "seo", "posicionamiento",
        "diseño web", "web design", "webflow", "figma", "wpml"]
GOOD = ["ga4", "google analytics", "search console", "semrush", "ahrefs",
        "screaming frog", "yoast", "rank math", "gtm", "adobe", "photoshop",
        "illustrator", "after effects", "html", "css", "ux", "ui", "cms",
        "landing", "branding", "motion", "contenido", "content"]
HEAVY_DEV = ["react", "vue", "angular", "typescript", "node.js", "laravel",
             "symfony", "django", "python", "java", "backend", "full stack",
             "fullstack", "kubernetes", "docker", "graphql"]
LANGS = ["french", "français", "francés", "german", "deutsch", "alemán",
         "italian", "italiano", "dutch", "holandés", "portugu"]
REQUIRED_CTX = ["imprescindible", "required", "requisito", "must have",
                "obligatorio", "se requiere", "necesario", "indispensable",
                "strong knowledge", "expert", "avanzado", "dominio"]
NICE_CTX = ["valorable", "deseable", "se valorará", "se valorara", "plus",
            "nice to have", "bonus", "preferred", "opcional", "básico",
            "basico", "nociones"]


def _near(term, text, ctx_terms, window=110):
    for m in re.finditer(re.escape(term), text):
        chunk = text[max(0, m.start() - window): m.end() + window]
        if any(c in chunk for c in ctx_terms):
            return True
    return False


def judge_with_rules(job):
    """Respaldo sin IA. Prefiere 'review' antes que descartar."""
    text = job.text.lower()
    title = (job.title or "").lower()
    score, concerns, highlights = 40, [], []

    hits = [k for k in CORE if k in title]
    if hits:
        score += 30
        highlights.append(f"El puesto es de lo tuyo: {', '.join(hits[:3])}")
    else:
        core_body = [k for k in CORE if k in text]
        if core_body:
            score += 12
            highlights.append(f"Menciona {', '.join(core_body[:3])}")

    good = [k for k in GOOD if k in text]
    if good:
        score += min(len(good) * 4, 20)
        highlights.append(f"Herramientas que manejas: {', '.join(good[:4])}")

    # Anios de EXPERIENCIA (no "80 años de trayectoria de la empresa" ni
    # "fundada hace 30 años"): exige que "experiencia"/"experience" este
    # cerca, y descarta cifras absurdas que delatan un falso positivo.
    years = 0
    EXP_WORDS = ("experiencia", "experience", "exp.", "trabajando", "working")
    for m in re.finditer(r"(\d{1,2})\s*\+?\s*(?:años|year|anos)", text):
        n = int(m.group(1))
        if n > 15:
            continue
        window = text[max(0, m.start() - 40): m.end() + 40]
        if any(w in window for w in EXP_WORDS):
            years = max(years, n)
    if years >= 7:
        score -= 35
        concerns.append(f"Pide {years} años de experiencia")
    elif years >= 5:
        score -= 12
        concerns.append(f"Pide {years} años; tú tienes unos 3-4")

    # Senioridad en el titulo: sospecha, no veto
    if re.search(r"\b(senior|sr\.?|lead|principal|head of|director|manager)\b", title):
        score -= 15
        concerns.append("El título suena a puesto sénior: mirar requisitos reales")

    # Tecnologia pesada
    for t in HEAVY_DEV:
        if t in text:
            if _near(t, text, NICE_CTX):
                continue
            if _near(t, text, REQUIRED_CTX):
                score -= 30
                concerns.append(f"Parece exigir {t}")
            else:
                score -= 8
                concerns.append(f"Menciona {t}; comprobar a qué nivel")
            break

    # Idiomas
    for lang in LANGS:
        if lang in text and _near(lang, text, REQUIRED_CTX):
            score -= 40
            concerns.append(f"Podría exigir {lang}")
            break

    if not job.description or len(job.description) < 300:
        concerns.append("Descripción muy escueta: conviene abrir la oferta")

    score = max(0, min(100, score))
    if concerns:
        verdict = "review" if score >= 35 else "reject"
    else:
        verdict = "apply" if score >= 70 else "review"

    reason = ("Encaja con tu perfil." if verdict == "apply"
              else "Hay que comprobar algo antes de aplicar."
              if verdict == "review" else "No parece encajar.")
    return Verdict(verdict=verdict, score=score, reason=reason,
                   concerns=concerns[:6], highlights=highlights[:6],
                   judged_by="rules")


def judge(job, api_key=None, use_llm=None):
    """Evalua una oferta con el mejor motor disponible."""
    if use_llm is None:
        use_llm = has_api_key() or bool(api_key)
    if use_llm:
        try:
            return judge_with_llm(job, api_key)
        except Exception as e:
            v = judge_with_rules(job)
            v.concerns.append(f"(IA no disponible: {e}; evaluado por reglas)")
            return v
    return judge_with_rules(job)
