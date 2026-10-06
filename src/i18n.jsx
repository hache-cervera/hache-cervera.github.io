import { createContext, useContext, useEffect, useState } from 'react';

/* All home copy lives here, one object per language. English is the default. */
export const translations = {
  en: {
    hero: {
      kicker: '/ Ada (hache) Cervera, Web Platform, Operations & WordPress Specialist',
      h1a: "I don't make pretty things.",
      h1b: 'I make things that work,',
      h1c: 'and happen to be pretty.',
      sub1: '15+ live web properties, end to end.',
      sub2: 'Hosting, DNS, migrations, performance.',
      sub3: 'Technical SEO. Remote and async.',
      status: 'Open to remote roles: Webmaster, WordPress Specialist, Web Operations, CMS Specialist, web performance and accessibility.',
      cv: 'CV (PDF)',
      cta: 'My stack',
      portfolio: 'Portfolio',
      research: 'Research',
      scroll: 'Scroll',
      menu: 'Jump straight to',
      cats: { infra: 'Infrastructure', seo: 'SEO / GEO / AEO', web: 'Websites', design: 'Design', video: 'Video' },
    },
    about: {
      label: '/ 01 · About',
      h2a: "I'm Hache.",
      h2b: 'I keep websites running,',
      h2c: 'from the server to the search results.',
      p1: 'Graphic design and marketing came first. Then I got hooked on how sites work underneath: hosting, DNS, server config, migrations. I liked that more than the pixels, so I kept going down instead of back up.',
      layersLabel: 'Three layers, bottom up',
      layers: [
        {
          n: '03',
          name: 'Search',
          line: 'Technical audits, hreflang, schema and internal linking across 15+ multilingual sites.',
          tools: ['Screaming Frog', 'Ahrefs', 'Semrush', 'GA4', 'GTM', 'Search Console'],
        },
        {
          n: '02',
          name: 'CMS',
          line: 'WordPress end to end, written rather than dragged. Four platforms in production.',
          tools: ['Custom child themes', 'WooCommerce', 'WPML', 'Elementor Pro', 'Shopify', 'PrestaShop'],
        },
        {
          n: '01',
          name: 'Infrastructure',
          line: 'The machine underneath. This is the layer most people skip, and the one I went looking for.',
          tools: ['Hosting', 'cPanel', 'Plesk', 'SSH', 'DNS', 'Cloudflare', 'SSL', 'Backups'],
        },
      ],
      geoNote: 'Since 2025 also AEO and GEO in production: structured data, crawler access for LLMs and citation tracking in generative search. Few people are measuring it yet. I started because I wanted to know whether it works.',
      labLabel: 'The lab',
      labKit: ['Linux · Docker · Nginx', 'LoRA models', 'ESP32 boards'],
      p2: 'Valencia-based, working remote and async.',
      stat1: 'Live web properties',
      stat2: 'CMS platforms in production',
      p3: 'Multilingual multi-site work with WPML and hreflang across Spanish, Valencian and English. Clients have included Cofidis, Benimar and APM Terminals.',
      p4: 'For the same reason I run my own server at home. devilfruittcg.com is a niche One Piece TCG WordPress site on a Linux box with Docker and Nginx, in my living room. My lab. When the site behaves, the machine goes to LoRA models and ESP32 boards. I like understanding the layer underneath the thing that is supposed to just work.',
      factsLabel: 'At a glance',
      facts: [
        { k: 'Role', v: 'Web Platform, Operations & WordPress Specialist' },
        { k: 'Based', v: 'Valencia, Spain' },
        { k: 'Works', v: 'Remote, async, written-first' },
        { k: 'Owns', v: 'Hosting, DNS, CMS, performance, technical SEO' },
        { k: 'Languages', v: 'Spanish and Valencian native, English professional' },
        { k: 'Certified', v: 'Ahrefs 2026, GA4 2025, Cambridge B2 2019' },
      ],
      langsNote: 'English: B2 Cambridge on paper, plus a year living and working in English in Prague.',
    },
    skills: {
      label: '/ 02 · Stack',
      note: 'Everything here runs in production on sites I maintain.',
    },
    works: { label: '/ 03 · Works', h2: 'I produced for brands such as' },
    research: {
      label: '/ 04 · Research',
      h2: 'Research I ran myself',
      intro: 'Studies with public data, the method on the page and the data downloadable.',
      all: 'All research',
      allHref: 'research/',
      items: [
        {
          kicker: 'October 2026 · AI search',
          title: 'Is the IBEX 35 ready for AI search?',
          stat: '0/35',
          statLabel: 'block AI search bots in robots.txt',
          text: 'robots.txt, firewall rules and llms.txt of Spain’s 35 largest listed companies, tested with a placebo bot as the control group.',
          href: 'research/ibex-35-ai/',
          cta: 'Read the research',
        },
        {
          kicker: 'October 2026 · Public websites',
          title: 'How slow and how accessible are city council websites?',
          stat: '42/49',
          statLabel: 'home pages with WCAG errors on desktop',
          text: 'Speed and accessibility of the city council websites of Spain’s 50 provincial capitals: median 17 seconds to show on a phone, and WCAG errors almost everywhere.',
          href: 'research/city-councils/',
          cta: 'Read the research',
        },
      ],
    },
    experience: { label: '/ 05 · Experience', h2: "Where I've been building", proof: 'Check it:' },
    reveal: {
      h2: 'Everything connects.',
      pathTail: 'One loop, end to end.',
      caption1: 'Live render: this chip runs in your browser.',
      caption2: 'No video, just code.',
    },
    contact: {
      label: '/ 06 · Contact',
      h2: "Let's talk.",
      p: 'No forms. Just write to me.',
      cv: 'Download CV (PDF)',
    },
    cvHref: 'cv/Ada-Cervera-WebPlatform-CV-ENG.pdf',
    path: ['Infrastructure', 'CMS', 'Search', 'Operations'],
    footer: { copy: '© 2026 Ada (hache) Cervera. Built by hand in Valencia.' },
  },
  es: {
    hero: {
      kicker: '/ Ada (hache) Cervera, Especialista en Plataforma Web, Operativa y WordPress',
      h1a: 'No hago cosas bonitas.',
      h1b: 'Hago cosas que funcionan,',
      h1c: 'y de paso son bonitas.',
      sub1: '15+ webs en producción, de principio a fin.',
      sub2: 'Hosting, DNS, migraciones, rendimiento.',
      sub3: 'SEO técnico. En remoto y en asíncrono.',
      status: 'Abierta a puestos en remoto: Webmaster, WordPress Specialist, Web Operations, CMS Specialist, rendimiento y accesibilidad web.',
      cv: 'CV (PDF)',
      cta: 'Mi stack',
      portfolio: 'Portfolio',
      research: 'Investigación',
      scroll: 'Scroll',
      menu: 'Ir directamente a',
      cats: { infra: 'Infraestructura', seo: 'SEO / GEO / AEO', web: 'Webs', design: 'Diseño', video: 'Vídeo' },
    },
    about: {
      label: '/ 01 · Sobre mí',
      h2a: 'Soy Hache.',
      h2b: 'Me encargo de que las webs funcionen,',
      h2c: 'del servidor al buscador.',
      p1: 'Primero fueron el diseño gráfico y el marketing. Luego me enganché a entender cómo funcionan las webs por dentro: hosting, DNS, configuración de servidor, migraciones. Me gustó más que los píxeles, así que seguí bajando capas en vez de volver a subir.',
      layersLabel: 'Tres capas, de abajo arriba',
      layers: [
        {
          n: '03',
          name: 'Búsqueda',
          line: 'Auditorías técnicas, hreflang, schema y enlazado interno en más de quince sitios multiidioma.',
          tools: ['Screaming Frog', 'Ahrefs', 'Semrush', 'GA4', 'GTM', 'Search Console'],
        },
        {
          n: '02',
          name: 'CMS',
          line: 'WordPress de principio a fin, escrito y no arrastrado. Cuatro plataformas en producción.',
          tools: ['Child themes propios', 'WooCommerce', 'WPML', 'Elementor Pro', 'Shopify', 'PrestaShop'],
        },
        {
          n: '01',
          name: 'Infraestructura',
          line: 'La máquina de debajo. Es la capa que casi todo el mundo se salta, y la que yo fui a buscar.',
          tools: ['Hosting', 'cPanel', 'Plesk', 'SSH', 'DNS', 'Cloudflare', 'SSL', 'Backups'],
        },
      ],
      geoNote: 'Desde 2025 también AEO y GEO en producción: datos estructurados, acceso para crawlers de LLMs y seguimiento de citaciones en búsqueda generativa. Todavía lo mide poca gente. Empecé porque quería saber si funciona.',
      labLabel: 'El laboratorio',
      labKit: ['Linux · Docker · Nginx', 'Modelos LoRA', 'Placas ESP32'],
      p2: 'Desde Valencia, en remoto y en asíncrono.',
      stat1: 'Webs en producción',
      stat2: 'CMS en producción',
      p3: 'Trabajo multisite y multiidioma con WPML y hreflang en castellano, valenciano e inglés. Entre los clientes, Cofidis, Benimar y APM Terminals.',
      p4: 'Por la misma razón tengo mi propio servidor en casa. devilfruittcg.com es un WordPress de nicho sobre One Piece TCG en una máquina Linux con Docker y Nginx, en mi salón. Mi laboratorio. Cuando la web se porta bien, la máquina se va a modelos LoRA y placas ESP32. Me gusta entender la capa de debajo de la cosa que se supone que funciona.',
      factsLabel: 'De un vistazo',
      facts: [
        { k: 'Puesto', v: 'Especialista en Plataforma Web, Operativa y WordPress' },
        { k: 'Ubicación', v: 'Valencia, España' },
        { k: 'Modo', v: 'En remoto, asíncrono, por escrito' },
        { k: 'Responsable de', v: 'Hosting, DNS, CMS, rendimiento y SEO técnico' },
        { k: 'Idiomas', v: 'Castellano y valenciano nativos, inglés profesional' },
        { k: 'Certificaciones', v: 'Ahrefs 2026, GA4 2025, Cambridge B2 2019' },
      ],
      langsNote: 'Inglés: B2 Cambridge sobre el papel, más un año viviendo y trabajando en inglés en Praga.',
    },
    skills: {
      label: '/ 02 · Stack',
      note: 'Todo esto está en producción en webs que mantengo.',
    },
    works: { label: '/ 03 · Trabajos', h2: 'He producido para marcas como' },
    research: {
      label: '/ 04 · Investigación',
      h2: 'Investigaciones propias',
      intro: 'Estudios con datos públicos, el método explicado y los datos para descargar.',
      all: 'Todas las investigaciones',
      allHref: 'research/es/',
      items: [
        {
          kicker: 'Octubre 2026 · Búsqueda con IA',
          title: '¿Está el IBEX 35 preparado para la búsqueda con IA?',
          stat: '0/35',
          statLabel: 'cierran su robots.txt a los bots de búsqueda con IA',
          text: 'robots.txt, reglas de cortafuegos y llms.txt de las 35 empresas del IBEX, con un bot placebo como grupo de control.',
          href: 'research/es/ibex-35-ia/',
          cta: 'Leer la investigación',
        },
        {
          kicker: 'Octubre 2026 · Webs públicas',
          title: '¿Cómo de lentas y accesibles son las webs de los ayuntamientos?',
          stat: '42/49',
          statLabel: 'portadas con errores WCAG en escritorio',
          text: 'Velocidad y accesibilidad de las webs de los ayuntamientos de las 50 capitales de provincia: 17 segundos de mediana para verse en el móvil y errores WCAG casi en todas.',
          href: 'research/es/ayuntamientos/',
          cta: 'Leer la investigación',
        },
      ],
    },
    experience: { label: '/ 05 · Experiencia', h2: 'Dónde he estado construyendo', proof: 'Compruébalo:' },
    reveal: {
      h2: 'Todo conecta.',
      pathTail: 'Un solo ciclo, de principio a fin.',
      caption1: 'Render en vivo: este chip se ejecuta en tu navegador.',
      caption2: 'Sin vídeo, solo código.',
    },
    contact: {
      label: '/ 06 · Contacto',
      h2: 'Hablamos.',
      p: 'Sin formularios. Escríbeme y ya.',
      cv: 'Descargar CV (PDF)',
    },
    cvHref: 'cv/Ada-Cervera-WebPlatform-CV-ESP.pdf',
    path: ['Infraestructura', 'CMS', 'Búsqueda', 'Operativa'],
    footer: { copy: '© 2026 Ada (hache) Cervera. Hecho a mano en Valencia.' },
  },
};

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: translations.en });

export function LangProvider({ children }) {
  // The URL decides the language: / is English, /es/ is Spanish (both prerendered).
  // A visitor who chose Spanish before and lands on / is sent to /es/.
  const [lang, setLang] = useState(() => (window.location.pathname.startsWith('/es') ? 'es' : 'en'));

  useEffect(() => {
    try {
      if (window.location.pathname === '/' && localStorage.getItem('lang') === 'es') window.location.replace('/es/');
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('lang', lang);
    } catch {
      /* private mode */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
