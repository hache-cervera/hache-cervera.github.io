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
      p1b: 'WordPress end to end: custom child themes, WooCommerce, WPML, cPanel, Plesk, SSH, DNS, SSL and migrations. I want the whole stack, not only the CMS.',
      p1c: 'SEO sits on top of that. Technical audits with Screaming Frog, Semrush and Ahrefs, hreflang, schema markup, internal linking, GA4 and GTM from scratch, across 15+ multilingual sites. Since 2025 also AEO and GEO in production: structured data, crawler access for LLMs and citation tracking in generative search. Few people are measuring it yet. I started because I wanted to know whether it works.',
      p2: 'Valencia-based, working remote and async.',
      stat1: 'Live web properties',
      stat2: 'CMS platforms in production',
      p3: 'Multilingual multi-site work with WPML and hreflang across Spanish, Valencian and English. Clients have included Cofidis, Benimar and APM Terminals.',
      p4: 'For the same reason I run my own server at home. devilfruittcg.com is a niche One Piece TCG WordPress site on a Linux box with Docker and Nginx, in my living room. My lab. When the site behaves, the machine goes to LoRA models and ESP32 boards. I like understanding the layer underneath the thing that is supposed to just work.',
      certsLabel: 'Certifications',
      certs: [
        { year: '2026', name: 'Ahrefs Certification' },
        { year: '2025', name: 'Google Analytics (GA4)' },
        { year: '2019', name: 'Cambridge B2 First (FCE)' },
      ],
      langsLabel: 'Languages',
      langs: [
        { name: 'Spanish', level: 'Native' },
        { name: 'Valencian', level: 'Native' },
        { name: 'English', level: 'Professional working level' },
      ],
      langsNote: 'B2 Cambridge on paper, plus a year living and working in English in Prague.',
    },
    skills: { label: '/ 02 · Stack' },
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
    path: ['Design', 'Code', 'Motion', 'SEO'],
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
      p1b: 'WordPress de principio a fin: child themes propios, WooCommerce, WPML, cPanel, Plesk, SSH, DNS, SSL y migraciones. Quiero el stack completo, no solo el CMS.',
      p1c: 'El SEO va encima de eso. Auditorías técnicas con Screaming Frog, Semrush y Ahrefs, hreflang, schema markup, enlazado interno, GA4 y GTM desde cero, en más de quince sitios multiidioma. Desde 2025 también AEO y GEO en producción: datos estructurados, acceso para crawlers de LLMs y seguimiento de citaciones en búsqueda generativa. Todavía lo mide poca gente. Empecé porque quería saber si funciona.',
      p2: 'Desde Valencia, en remoto y en asíncrono.',
      stat1: 'Webs en producción',
      stat2: 'CMS en producción',
      p3: 'Trabajo multisite y multiidioma con WPML y hreflang en castellano, valenciano e inglés. Entre los clientes, Cofidis, Benimar y APM Terminals.',
      p4: 'Por la misma razón tengo mi propio servidor en casa. devilfruittcg.com es un WordPress de nicho sobre One Piece TCG en una máquina Linux con Docker y Nginx, en mi salón. Mi laboratorio. Cuando la web se porta bien, la máquina se va a modelos LoRA y placas ESP32. Me gusta entender la capa de debajo de la cosa que se supone que funciona.',
      certsLabel: 'Certificaciones',
      certs: [
        { year: '2026', name: 'Ahrefs Certification' },
        { year: '2025', name: 'Google Analytics (GA4)' },
        { year: '2019', name: 'Cambridge B2 First (FCE)' },
      ],
      langsLabel: 'Idiomas',
      langs: [
        { name: 'Castellano', level: 'Nativo' },
        { name: 'Valenciano', level: 'Nativo' },
        { name: 'Inglés', level: 'Nivel profesional' },
      ],
      langsNote: 'B2 Cambridge sobre el papel, más un año viviendo y trabajando en inglés en Praga.',
    },
    skills: { label: '/ 02 · Stack' },
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
    path: ['Diseño', 'Código', 'Motion', 'SEO'],
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
