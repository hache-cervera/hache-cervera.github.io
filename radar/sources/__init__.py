"""Registro de fuentes y recoleccion conjunta.

Cada fuente se ejecuta de forma aislada: si una falla o cambia su HTML, se
anota la incidencia y las demas siguen. Nunca debe caerse la busqueda entera
por un portal roto.
"""

from .. import profile
from . import international as intl
from . import spain


def enrich(jobs, cap=120, on_progress=None):
    """Descarga la descripcion completa de las ofertas indicadas.

    Se llama DESPUES del prefiltro: no tiene sentido gastar una peticion por
    cada oferta que luego se va a descartar por no ser remota o ser de otra
    profesion. Ademas asi el juez recibe el texto completo de todo lo que de
    verdad importa, en vez de solo de las primeras que llegaron.
    """
    enrichers = {
        "linkedin": spain.enrich_linkedin,
        "infojobs": spain.enrich_infojobs,
        "tecnoempleo": spain.enrich_tecnoempleo,
    }
    problems = []
    done = 0
    for job in jobs[:cap]:
        fn = enrichers.get(job.source)
        # Las fuentes internacionales ya traen la descripcion en el listado.
        if not fn or len(job.description or "") > 600:
            continue
        try:
            fn(job)
            done += 1
            if on_progress:
                on_progress(done)
        except Exception as e:
            problems.append(f"detalle {job.source}/{job.source_id}: {e}")
    return done, problems


def collect(only=None, with_detail=False):
    """Recolecta de todas las fuentes. Devuelve (ofertas, incidencias).

    `only` limita a un subconjunto de fuentes por nombre, util para probar.
    """
    tasks = [
        # Las españolas primero: son las que mas encajan con el perfil.
        ("linkedin", lambda: spain.fetch_linkedin(
            profile.QUERIES_ES, pages=3, with_detail=with_detail)),
        ("infojobs", lambda: spain.fetch_infojobs(
            profile.QUERIES_ES, pages=2, with_detail=with_detail)),
        ("tecnoempleo", lambda: spain.fetch_tecnoempleo(
            profile.QUERIES_ES, pages=2, with_detail=with_detail)),
        # Internacionales.
        ("remoteok", intl.fetch_remoteok),
        ("remotive", lambda: intl.fetch_remotive(profile.QUERIES_INTL)),
        ("jobicy", lambda: intl.fetch_jobicy(
            ["wordpress", "seo", "design", "marketing"])),
        ("himalayas", intl.fetch_himalayas),
        ("arbeitnow", intl.fetch_arbeitnow),
        ("weworkremotely", intl.fetch_weworkremotely),
        ("wordpressjobs", lambda: intl.fetch_wordpress_jobs(
            with_detail=with_detail)),
    ]

    all_jobs, problems, stats = [], [], {}
    for name, fn in tasks:
        if only and name not in only:
            continue
        try:
            jobs, probs = fn()
        except Exception as e:
            problems.append(f"{name}: fallo completo: {e}")
            stats[name] = 0
            continue
        all_jobs += jobs
        problems += probs or []
        stats[name] = len(jobs)

    return all_jobs, problems, stats
