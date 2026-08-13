"""Estructuras de datos compartidas por todo Radar."""

import hashlib
import re
from dataclasses import dataclass, field, asdict
from typing import Optional


def _norm(text):
    return re.sub(r"[^a-z0-9]", "", (text or "").lower())


@dataclass
class Job:
    """Una oferta, normalizada sea cual sea su origen."""

    source: str
    source_id: str
    title: str
    company: str = ""
    url: str = ""
    location: str = ""
    description: str = ""
    date: str = ""
    employment_type: str = ""
    seniority: str = ""
    salary: str = ""
    remote_flag: Optional[bool] = None  # lo que declara la fuente, si lo dice
    raw_tags: str = ""

    @property
    def fingerprint(self):
        """Identidad estable de la oferta entre fuentes distintas.

        La misma oferta aparece con frecuencia en varios portales, asi que
        la clave es empresa+puesto, no el id de la fuente.
        """
        base = f"{_norm(self.company)}|{_norm(self.title)}"
        if not _norm(self.company):
            # Sin empresa, la URL es lo unico fiable para distinguirla.
            base = f"url|{_norm(self.url)}"
        return hashlib.sha1(base.encode()).hexdigest()[:16]

    @property
    def text(self):
        """Todo el texto util de la oferta, para filtros y para el juicio."""
        return " ".join(filter(None, [
            self.title, self.company, self.location,
            self.employment_type, self.seniority, self.raw_tags,
            self.description,
        ]))

    def to_dict(self):
        d = asdict(self)
        d["fingerprint"] = self.fingerprint
        return d


@dataclass
class Verdict:
    """Resultado de evaluar una oferta contra el perfil."""

    verdict: str            # "apply" | "review" | "reject"
    score: int = 0          # 0-100
    reason: str = ""        # por que, en una o dos frases
    concerns: list = field(default_factory=list)   # lo que no encaja del todo
    highlights: list = field(default_factory=list)  # que destacar al aplicar
    judged_by: str = "rules"  # "llm" o "rules"

    VALID = ("apply", "review", "reject")

    def __post_init__(self):
        if self.verdict not in self.VALID:
            self.verdict = "review"
        self.score = max(0, min(100, int(self.score or 0)))
