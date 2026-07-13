import { createContext, useContext, useEffect, useState } from 'react';

/* All home copy lives here, one object per language. English is the default. */
export const translations = {
  en: {
    hero: {
      kicker: '/ Hache Cervera, Creative Technologist',
      h1a: "I don't make pretty things.",
      h1b: 'I make things that work,',
      h1c: 'and happen to be pretty.',
      sub1: 'Creative who builds.',
      sub2: 'I design. I develop. I optimise.',
      sub3: 'From identity to live projects, end to end.',
      cta: 'My stack',
      scroll: 'Scroll',
    },
    about: {
      label: '/ 01 · About',
      h2a: "I'm Hache.",
      h2b: 'Developer, builder,',
      h2c: 'creative technologist.',
      p1: 'I work at the intersection of design and technology: crafting brands, building websites, and making things that look good and actually work.',
      p2: 'Valencia-based. Building things worth building.',
      stat1: 'Websites delivered',
      stat2: 'Digital assets produced',
      p3: 'Wide range of clients and industries, incl. Cofidis, Benimar and APM Terminals.',
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
    footer: { copy: '© 2026 Hache Cervera. Built by hand in Valencia.' },
  },
  es: {
    hero: {
      kicker: '/ Hache Cervera, Tecnóloga Creativa',
      h1a: 'No hago cosas bonitas.',
      h1b: 'Hago cosas que funcionan,',
      h1c: 'y de paso son bonitas.',
      sub1: 'Creativa que construye.',
      sub2: 'Diseño. Desarrollo. Optimizo.',
      sub3: 'De la identidad al proyecto en producción, de principio a fin.',
      cta: 'Mi stack',
      scroll: 'Scroll',
    },
    about: {
      label: '/ 01 · Sobre mí',
      h2a: 'Soy Hache.',
      h2b: 'Desarrolladora, creadora,',
      h2c: 'tecnóloga creativa.',
      p1: 'Trabajo en la intersección entre diseño y tecnología: creando marcas, construyendo webs y haciendo cosas que se ven bien y además funcionan.',
      p2: 'Desde Valencia. Construyendo cosas que merecen la pena.',
      stat1: 'Webs entregadas',
      stat2: 'Piezas digitales producidas',
      p3: 'Clientes e industrias de todo tipo, incluyendo Cofidis, Benimar y APM Terminals.',
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
    footer: { copy: '© 2026 Hache Cervera. Hecho a mano en Valencia.' },
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
