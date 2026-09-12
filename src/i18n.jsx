import { createContext, useContext, useEffect, useState } from 'react';

/* All home copy lives here, one object per language. English is the default. */
export const translations = {
  en: {
    hero: {
      kicker: '/ Ada (hache) Cervera, Web Platform & WordPress Specialist',
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
      cats: { seo: 'SEO / GEO / AEO', web: 'Websites', design: 'Design', video: 'Video' },
    },
    about: {
      label: '/ 01 · About',
      h2a: "I'm Hache.",
      h2b: 'Web operations,',
      h2c: 'WordPress and infrastructure.',
      p1: 'I own web properties end to end: hosting, DNS, Cloudflare, SSL, backups, migrations, performance and technical SEO. I also design and build them, so nothing gets lost in the handoff.',
      p2: 'Valencia-based, working remote and async.',
      stat1: 'Live web properties',
      stat2: 'CMS platforms in production',
      p3: 'Multilingual multi-site work with WPML and hreflang across Spanish, Valencian and English. Clients have included Cofidis, Benimar and APM Terminals.',
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
    },
    path: ['Design', 'Code', 'Motion', 'SEO'],
    footer: { copy: '© 2026 Ada (hache) Cervera. Built by hand in Valencia.' },
  },
  es: {
    hero: {
      kicker: '/ Ada (hache) Cervera, Especialista en Plataforma Web y WordPress',
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
      cats: { seo: 'SEO / GEO / AEO', web: 'Webs', design: 'Diseño', video: 'Vídeo' },
    },
    about: {
      label: '/ 01 · Sobre mí',
      h2a: 'Soy Hache.',
      h2b: 'Operaciones web,',
      h2c: 'WordPress e infraestructura.',
      p1: 'Me encargo de webs de principio a fin: hosting, DNS, Cloudflare, SSL, backups, migraciones, rendimiento y SEO técnico. También las diseño y las construyo, así que no se pierde nada por el camino.',
      p2: 'Desde Valencia, en remoto y en asíncrono.',
      stat1: 'Webs en producción',
      stat2: 'CMS en producción',
      p3: 'Trabajo multisite y multiidioma con WPML y hreflang en castellano, valenciano e inglés. Entre los clientes, Cofidis, Benimar y APM Terminals.',
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
