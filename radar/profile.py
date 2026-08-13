"""El perfil de Hache y las reglas del sistema.

Este es el unico archivo que hay que tocar para cambiar criterios. Todo lo
demas (fuentes, filtros, juicio) lee de aqui.

Filosofia del filtrado, decidida con Hache:
  - Solo DOS reglas duras descartan sin apelacion: no remoto, y freelance.
  - Todo lo demas (senioridad, anios, PHP/JS, idiomas) NO descarta por si
    solo: baja la nota o marca la oferta para revision humana.
  - Ante la duda, "review": es preferible que Hache mire una oferta de mas
    a que el sistema tire una buena en silencio.
"""

# --- Reglas duras (las unicas que descartan automaticamente) ---------------

REQUIRE_REMOTE = True
REQUIRE_NOT_FREELANCE = True

# --- Perfil para el juicio con IA ------------------------------------------

PROFILE = """
Hache es diseñadora web y especialista SEO, con base en España. Busca un
empleo POR CUENTA AJENA a jornada completa y 100% en remoto.

LO QUE SABE HACER DE VERDAD (puede acreditarlo):
- WordPress a nivel avanzado: Elementor, WooCommerce, WPML, temas comerciales
  (Astra y similares), plugins, migraciones, hosting, DNS, SSL, rendimiento.
- SEO técnico y de contenidos: auditorías, arquitectura web, indexación,
  Core Web Vitals, keyword research, Search Console, GA4, GTM, SEMrush,
  Ahrefs, Screaming Frog, Yoast, Rank Math. También GEO/AEO (optimización
  para buscadores con IA).
- Diseño: Figma, Adobe (Photoshop, Illustrator, After Effects), identidad de
  marca, diseño web, motion gráfico, materiales digitales.
- HTML y CSS a nivel de maquetación y personalización.

LO QUE NO SABE Y NO PUEDE ATRIBUIRSE (importante, sé honesto aquí):
- JavaScript más allá de lo básico. Nada de React, Vue, Angular, Svelte,
  TypeScript ni Node.
- PHP a nivel de desarrollo (no programa plugins ni temas desde cero).
- Backend en general: Python, Java, .NET, bases de datos, APIs.
- Desarrollo de bloques de Gutenberg / FSE a nivel de programación.
- Certificaciones de cloud (AWS y similares).

EXPERIENCIA: en torno a 3-4 años. Los puestos que exigen mucha más
experiencia de la que tiene no encajan, pero ojo: el título es mala señal
por sí solo. Un "Senior" que pide 3 años SÍ puede encajar, y un puesto sin
título llamativo que exige 8 años NO. Mira siempre los requisitos reales,
no la etiqueta del puesto.

IDIOMAS: español nativo e inglés. Cualquier otro idioma EXIGIDO (francés,
alemán, italiano, neerlandés...) la descarta. Que la empresa sea de ese
país, o que el idioma sea "un plus", no es motivo de descarte.

INNEGOCIABLE: 100% remoto (nada de híbrido, presencial ni mudanza) y
contrato por cuenta ajena (nada de freelance, autónomo, obra y servicio,
prácticas ni media jornada).
"""

# --- Como debe decidir el juez ---------------------------------------------

RUBRIC = """
Clasifica cada oferta en uno de tres veredictos:

"apply" — Encaja bien. Es remota, por cuenta ajena, y los requisitos están
  dentro de lo que Hache sabe hacer. Puede aplicar con honestidad.

"review" — Cumple lo innegociable (remoto + no freelance) pero hay algo que
  no puedes confirmar o que está en el límite. Ejemplos típicos:
    · Pide PHP/JavaScript pero no queda claro a qué nivel.
    · El título dice "Senior" pero los requisitos parecen asumibles.
    · Pide algo más de experiencia de la que tiene, pero no mucha más.
    · No se ve claro el alcance geográfico del remoto.
    · La descripción es demasiado escueta para juzgar.
  Ante CUALQUIER duda razonable, usa "review". Es preferible que Hache
  revise una oferta de más a que descartemos una buena en silencio.

"reject" — Solo cuando estés seguro. Motivos válidos:
    · No es remota, o exige presencia/mudanza.
    · Es freelance, autónomo, por proyecto, prácticas o media jornada.
    · Exige de forma clara y dura competencias que Hache no tiene
      (ej. "experto en React", "desarrollo de plugins a medida en PHP",
      "arquitectura backend"). Si aparece como "deseable" o "se valorará",
      NO es motivo de rechazo.
    · Exige un idioma adicional al español/inglés.
    · Exige claramente bastante más experiencia de la que tiene (7+ años).
    · El puesto es de otra profesión (comercial, contabilidad, soporte...).

Reglas de oro:
  - Lee los REQUISITOS, no el título.
  - Distingue exigencia ("imprescindible", "required") de deseo
    ("valorable", "nice to have", "plus"). Lo deseable nunca descarta.
  - Si dudas entre dos veredictos, elige siempre el menos restrictivo.
"""

# --- Busquedas -------------------------------------------------------------

# Consultas para las fuentes españolas (LinkedIn, InfoJobs, Tecnoempleo).
QUERIES_ES = [
    "wordpress",
    "seo",
    "diseñador web",
    "diseñador grafico",
    "maquetador web",
    "especialista seo",
    "elementor",
    "woocommerce",
    "marketing digital",
]

# Consultas para las fuentes internacionales.
QUERIES_INTL = [
    "wordpress",
    "seo",
    "web design",
    "graphic design",
    "webflow",
]

# Antiguedad maxima de una oferta, en dias.
MAX_AGE_DAYS = 30
