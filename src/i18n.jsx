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
      cta: 'My stack',
      portfolio: 'Portfolio',
      scroll: 'Scroll',
      menu: 'Jump straight to',
      cats: { infra: 'Infrastructure', seo: 'SEO / GEO / AEO', web: 'Websites', design: 'Design', video: 'Video' },
    },
    about: {
      label: '/ 01 · About',
      h2a: "I'm Hache.",
      h2b: 'I started in design.',
      h2c: 'I stayed for the stack.',
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
      note: 'Not a tool list. Everything here is in production on sites I maintain.',
    },
    works: { label: '/ 03 · Works', h2: 'I produced for brands such as' },
    experience: { label: '/ 04 · Experience', h2: "Where I've been building" },
    reveal: {
      h2: 'Everything connects.',
      pathTail: 'One loop, end to end.',
      caption1: 'Live render: this chip runs in your browser.',
      caption2: 'No video, just code.',
    },
    contact: {
      label: '/ 05 · Contact',
      h2: "Let's talk.",
      p: 'No forms. Just write to me.',
      cv: 'Download CV (PDF)',
    },
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
      cta: 'Mi stack',
      portfolio: 'Portfolio',
      scroll: 'Scroll',
      menu: 'Ir directamente a',
      cats: { infra: 'Infraestructura', seo: 'SEO / GEO / AEO', web: 'Webs', design: 'Diseño', video: 'Vídeo' },
    },
    about: {
      label: '/ 01 · Sobre mí',
      h2a: 'Soy Hache.',
      h2b: 'Empecé en diseño.',
      h2c: 'Me quedé por el stack.',
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
      note: 'No es una lista de herramientas. Todo esto está en producción en webs que mantengo.',
    },
    works: { label: '/ 03 · Trabajos', h2: 'He producido para marcas como' },
    experience: { label: '/ 04 · Experiencia', h2: 'Dónde he estado construyendo' },
    reveal: {
      h2: 'Todo conecta.',
      pathTail: 'Un solo ciclo, de principio a fin.',
      caption1: 'Render en vivo: este chip se ejecuta en tu navegador.',
      caption2: 'Sin vídeo, solo código.',
    },
    contact: {
      label: '/ 05 · Contacto',
      h2: 'Hablamos.',
      p: 'Sin formularios. Escríbeme y ya.',
      cv: 'Descargar CV (PDF)',
    },
    path: ['Infraestructura', 'CMS', 'Búsqueda', 'Operativa'],
    footer: { copy: '© 2026 Ada (hache) Cervera. Hecho a mano en Valencia.' },
  },
};

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: translations.en });

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('lang');
      return saved === 'es' ? 'es' : 'en';
    } catch {
      return 'en';
    }
  });

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
