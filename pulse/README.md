# Pulse

Plataforma **auto-alojable** de medición y analítica digital. Un solo servicio Node + SQLite: sin depender de terceros, **0 €/mes** en local. Todo el código y los datos viven en tu máquina (o en un VPS de ~5 €/mes cuando quieras).

Pensada como un "todo en 1" para agencias y freelances de marketing. Arranca con dos módulos prioritarios:

## Módulos

### 🩺 Salud del sitio
- **Crawler externo** (cualquier web): uptime, enlaces rotos, cadenas de redirecciones, títulos/metas duplicados o vacíos, imágenes sin alt, robots.txt y sitemap.
- **Seguridad**: caducidad del certificado SSL, HTTP→HTTPS, cabeceras (HSTS, CSP…), ficheros de WordPress expuestos (xmlrpc, readme, enumeración de usuarios).
- **Conector WordPress** (`wp-connector/pulse-connector.php`): versiones de WP/PHP/MySQL, plugins con updates pendientes, plugins abandonados (API de wordpress.org), errores PHP agrupados por plugin causante y vulnerabilidades conocidas (feed gratuito de Wordfence Intelligence CE).

### 🤖 Módulo IA
- **Preparación para la IA** (sin claves): llms.txt, acceso de bots IA (GPTBot, ClaudeBot…), datos estructurados, extractabilidad sin JS, formularios usables por agentes.
- **Share de recomendación y percepción de marca**: lanza tus preguntas a varios modelos (OpenAI, Anthropic, Perplexity) y mide si te mencionan a ti o a la competencia, con qué sentimiento y detectando **alucinaciones** sobre tu marca. El análisis usa Claude Haiku (barato).

## Arrancar

```bash
cp .env.example .env      # rellena solo lo que uses; todo es opcional salvo el puerto
npm install
npm run seed              # crea un proyecto de ejemplo
npm run dev               # server (4321) + dashboard (5173)
```

O con Docker: `docker compose up --build` y abre `http://localhost:4321`.

## Costes

Local con los dos módulos: **0 €/mes**. Las APIs usadas (wordpress.org, Wordfence CE, Google Safe Browsing, Telegram) son gratuitas. El sondeo a modelos de IA cuesta unos **3–8 €/mes** según cuántas preguntas y modelos configures. En producción para clientes: un VPS de ~5 €/mes con el mismo contenedor.

## Estructura

```
server/
├── index.js              # Fastify: API REST + estáticos + cron
├── db/                   # SQLite (better-sqlite3) + migraciones + seed
├── collectors/           # site-health, wp-health, ai-readiness, ai-probe
├── alerts/               # alertas (guardadas + Telegram opcional)
└── lib/                  # utilidades HTTP/TLS
wp-connector/             # plugin PHP para instalar en sitios WordPress
web/                      # dashboard React + Vite + Tailwind
```

## Alertas

Si defines `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` en `.env`, recibes avisos de caídas del sitio, SSL a punto de caducar, vulnerabilidades críticas y posibles alucinaciones de IA sobre tu marca.
