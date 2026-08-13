# Radar de empleo

Busca ofertas en 10 fuentes (españolas e internacionales), las lee una a una,
las clasifica contra tu perfil y te las deja ordenadas para revisar.

No depende de conectores, ni de MCP, ni de nada que se pueda desconectar:
solo Python y conexión a internet.

---

## Puesta en marcha (una sola vez)

### 1. Instalar lo necesario

Solo hace falta para subir al Google Sheet. Si te vale con el panel local,
puedes saltarte esto:

```
pip install google-auth google-api-python-client
```

### 2. Poner la clave de la API

Es lo que permite que **la IA lea cada oferta** en vez de contar palabras
clave. Sin ella el programa funciona igual, pero clasifica mucho peor.

Sácala en <https://console.anthropic.com> → API Keys. Después, en PowerShell:

```powershell
setx ANTHROPIC_API_KEY "sk-ant-tu-clave-aqui"
```

Cierra y vuelve a abrir PowerShell para que la coja.

> No hace falta que la escribas en el chat ni la guardes en el repositorio:
> con la variable de entorno el programa la encuentra solo.

### 3. Comprobar que va

```
python -m radar.cli buscar --seco
```

`--seco` busca y clasifica pero no guarda nada. Sirve para ver qué encuentra.

---

## Uso diario

```
python -m radar.cli buscar      # busca, clasifica, guarda y sube al Sheet
python -m radar.cli panel       # abre el panel para revisar
```

El panel se abre en el navegador. Cada oferta trae su veredicto, el motivo, y
botones para marcarla como aplicada, guardada o descartada.

### Otros comandos

```
python -m radar.cli estado                     resumen de lo que hay
python -m radar.cli sheet                      reintenta subir al Sheet
python -m radar.cli buscar --sin-ia            clasifica sin IA (reglas)
python -m radar.cli buscar --rapido            no abre el detalle (más rápido)
python -m radar.cli buscar --fuente linkedin   solo una fuente
```

---

## Los tres veredictos

| | Qué significa |
|---|---|
| **APLICAR** | Encaja. Es remota, por cuenta ajena, y los requisitos están dentro de lo que sabes hacer. |
| **REVISAR** | Cumple lo innegociable pero hay algo que comprobar: pide PHP y no se ve a qué nivel, el título dice "Senior" pero los requisitos parecen asumibles, la descripción es escueta... **Estas las decides tú.** |
| **DESCARTADA** | Motivo claro: no es remota, es freelance, exige competencias que no tienes, pide otro idioma, o es de otra profesión. Se guardan para que puedas auditar que no se cuela nada bueno. |

Solo dos cosas descartan automáticamente: **que no sea remota** y **que sea
freelance**. Todo lo demás, ante la duda, va a *revisar* — es preferible que
mires una oferta de más a que el sistema tire una buena en silencio.

---

## Fuentes

**España** — LinkedIn (con el filtro nativo de remoto), InfoJobs
(teletrabajo), Tecnoempleo (100% remoto).

**Internacional** — RemoteOK, Remotive, Jobicy, Himalayas, Arbeitnow,
WeWorkRemotely, tablón oficial de empleo de WordPress.

Si una fuente cambia su web y deja de funcionar, se anota la incidencia y las
demás siguen: nunca se cae la búsqueda entera por un portal roto.

---

## Automatizar en Windows

`run_radar.ps1` hace la búsqueda diaria. Para programarlo:

1. Abre el **Programador de tareas**
2. *Crear tarea básica* → diaria, a la hora que quieras
3. Acción: *Iniciar un programa*
   - Programa: `powershell.exe`
   - Argumentos: `-ExecutionPolicy Bypass -File "RUTA\radar\run_radar.ps1"`

Después, cuando quieras revisar, abre el panel con `python -m radar.cli panel`.

---

## Ajustar los criterios

Todo lo que define qué encaja y qué no está en **`profile.py`**: tu perfil,
lo que sabes hacer, lo que no, y la rúbrica con la que se decide. Es el único
archivo que hay que tocar para cambiar criterios — el resto del programa lee
de ahí.

Si ves que descarta cosas que te interesan, o que deja pasar ruido, dime qué
caso concreto y lo afinamos ahí.

---

## Dónde queda todo

| | |
|---|---|
| `radar.db` | Base de datos local (ofertas, veredictos, tu estado). No se sube al repositorio. |
| Google Sheet | Copia de lo que merece la pena mirar, accesible desde el móvil. |
| Panel local | `http://127.0.0.1:8765` mientras lo tengas abierto. |
