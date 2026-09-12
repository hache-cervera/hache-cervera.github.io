// Six disciplines, one per network node on the chip.
// `bg` tints the pinned Skills section as each discipline lands (light theme);
// `bgDark` is the same journey remapped for dark mode.
// Translatable fields hold { en, es } pairs; resolve them with getDisciplines(lang).
const L = (en, es) => ({ en, es });

const DISCIPLINES_RAW = [
  {
    id: 'dev',
    label: L('Web & Development', 'Web y Desarrollo'),
    node: L('Node 01 / Code', 'Nodo 01 / Código'),
    bg: '#ffffff',
    bgDark: '#0d0d0d',
    tools: [
      { mark: 'Wp', name: L('WordPress', 'WordPress') },
      { mark: 'El', name: L('Elementor', 'Elementor') },
      { mark: 'Dv', name: L('Divi', 'Divi') },
      { mark: 'Wb', name: L('WP Bakery', 'WP Bakery') },
      { mark: 'Ml', name: L('WPML', 'WPML') },
      { mark: 'Wc', name: L('WooCommerce', 'WooCommerce') },
      { mark: 'H5', name: L('HTML', 'HTML') },
      { mark: 'C3', name: L('CSS', 'CSS') },
      { mark: 'Js', name: L('JavaScript', 'JavaScript') },
    ],
  },
  {
    id: 'infra',
    label: L('Technical & Infrastructure', 'Técnico e Infraestructura'),
    node: L('Node 02 / Systems', 'Nodo 02 / Sistemas'),
    bg: '#fff8f5',
    bgDark: '#151009',
    tools: [
      { mark: 'Sm', name: L('Site Migrations', 'Migraciones') },
      { mark: 'St', name: L('Staging Environments', 'Entornos de staging') },
      { mark: 'Dns', name: L('DNS & Hosting', 'DNS y Hosting') },
      { mark: 'Ssl', name: L('SSL Setup', 'Configuración SSL') },
      { mark: 'Pf', name: L('Performance', 'Rendimiento') },
      { mark: 'Cwv', name: L('Core Web Vitals', 'Core Web Vitals') },
      { mark: 'Sc', name: L('Schema Markup', 'Marcado Schema') },
      { mark: 'Xml', name: L('Sitemaps', 'Sitemaps') },
      { mark: 'Hl', name: L('Hreflang', 'Hreflang') },
    ],
  },
  {
    id: 'design',
    label: L('Design & Branding', 'Diseño y Branding'),
    node: L('Node 03 / Design', 'Nodo 03 / Diseño'),
    bg: '#fff1eb',
    bgDark: '#1a110b',
    tools: [
      { mark: 'Ps', name: L('Photoshop', 'Photoshop') },
      { mark: 'Ai', name: L('Illustrator', 'Illustrator') },
      { mark: 'Id', name: L('InDesign', 'InDesign') },
      { mark: 'Fi', name: L('Figma', 'Figma') },
      { mark: 'Xd', name: L('Adobe XD', 'Adobe XD') },
    ],
  },
  {
    id: 'motion',
    label: L('Motion & AV', 'Motion y Audiovisual'),
    node: L('Node 04 / Motion', 'Nodo 04 / Motion'),
    bg: '#ffe9df',
    bgDark: '#20130b',
    tools: [
      { mark: 'Ae', name: L('After Effects', 'After Effects') },
      { mark: 'Pr', name: L('Premiere Pro', 'Premiere Pro') },
      { mark: 'Dr', name: L('DaVinci Resolve', 'DaVinci Resolve') },
      { mark: 'Bl', name: L('Blender', 'Blender') },
      { mark: 'Lp', name: L('Logic Pro X', 'Logic Pro X') },
    ],
  },
  {
    id: 'seo',
    label: L('SEO & Analytics', 'SEO y Analítica'),
    node: L('Node 05 / Search', 'Nodo 05 / Búsqueda'),
    bg: '#ffe1d3',
    bgDark: '#26140a',
    tools: [
      { mark: 'Sr', name: L('Semrush', 'Semrush') },
      { mark: 'Ah', name: L('Ahrefs', 'Ahrefs') },
      { mark: 'Yo', name: L('Yoast', 'Yoast') },
      { mark: 'Rm', name: L('Rank Math', 'Rank Math') },
      { mark: 'Gsc', name: L('Search Console', 'Search Console') },
      { mark: 'Ga4', name: L('GA4', 'GA4') },
      { mark: 'Gtm', name: L('Google Tag Manager', 'Google Tag Manager') },
    ],
  },
  {
    id: 'ai',
    label: L('AI & Automation', 'IA y Automatización'),
    node: L('Node 06 / Judgment', 'Nodo 06 / Criterio'),
    bg: '#ffd9c8',
    bgDark: '#2c1509',
    note: L(
      'AI as a tool, not a crutch: integrated where the project needs it, understanding what it generates. No blind copy-paste.',
      'La IA como herramienta, no como muleta: integrada donde el proyecto lo necesita, entendiendo lo que genera. Nada de copiar y pegar a ciegas.'
    ),
    tools: [
      { mark: 'Ad', name: L('AI-assisted Dev', 'Desarrollo asistido por IA') },
      { mark: 'Pd', name: L('Prompt Design', 'Diseño de prompts') },
      { mark: 'Cg', name: L('Content Generation', 'Generación de contenido') },
      { mark: 'Wa', name: L('Workflow Automation', 'Automatización de flujos') },
      { mark: 'Geo', name: L('AI Search Visibility', 'Aparición en buscadores de IA') },
    ],
  },
];

export function getDisciplines(lang) {
  return DISCIPLINES_RAW.map((d) => ({
    ...d,
    label: d.label[lang],
    node: d.node[lang],
    note: d.note ? d.note[lang] : undefined,
    tools: d.tools.map((t) => ({ mark: t.mark, name: t.name[lang] })),
  }));
}

// Kept for anything that only needs language-independent fields (bg tints).
export const DISCIPLINES = getDisciplines('en');

export const LOGOS = [
  { src: 'logos/cofidis.png', alt: 'Cofidis' },
  { src: 'logos/benimar.png', alt: 'Benimar' },
  { src: 'logos/apm-terminals.png', alt: 'APM Terminals' },
];

const EXPERIENCE_RAW = [
  {
    role: L('Web Platform & WordPress Specialist', 'Especialista en Plataforma Web y WordPress'),
    company: 'Neurona Digital SL',
    place: 'Valencia',
    dates: L('Nov 2024 – Sep 2026', 'Nov 2024 – Sep 2026'),
    points: [
      L(
        'End-to-end ownership of 15+ live web properties: hosting, DNS, Cloudflare, SSL, backups, migrations and daily technical troubleshooting across WordPress, Shopify, Wix and PrestaShop.',
        'Responsabilidad completa sobre 15+ webs en producción: hosting, DNS, Cloudflare, SSL, backups, migraciones y resolución técnica diaria en WordPress, Shopify, Wix y PrestaShop.'
      ),
      L(
        'Multilingual multi-site operations with WPML, including hreflang across Spanish, Valencian and English, on shared templates.',
        'Operativa multisite y multiidioma con WPML, incluyendo hreflang en castellano, valenciano e inglés, sobre plantillas compartidas.'
      ),
      L(
        'Technical performance audits with Screaming Frog and Ahrefs: crawl health, Core Web Vitals, redirect chains and canonical issues, tracked as continuous work rather than one-off reports.',
        'Auditorías técnicas de rendimiento con Screaming Frog y Ahrefs: salud de rastreo, Core Web Vitals, cadenas de redirecciones y canonicals, como trabajo continuo y no como informe puntual.'
      ),
      L(
        'GA4 and GTM set up from scratch with conversion goals, GSC monitoring and structured data validation. Figma to Elementor Pro implementation with no handoff in between.',
        'GA4 y GTM montados desde cero con objetivos de conversión, seguimiento en GSC y validación de datos estructurados. Implementación de Figma a Elementor Pro sin traspaso intermedio.'
      ),
      L(
        'Graphic, motion and audiovisual production for brands including Cofidis and Benimar: 300+ pieces for organic content and paid social.',
        'Producción gráfica, motion y audiovisual para marcas como Cofidis y Benimar: 300+ piezas para contenido orgánico y paid social.'
      ),
    ],
  },
  {
    role: L('Marketing Strategy & Sponsorships', 'Estrategia de Marketing y Patrocinios'),
    company: 'Jump Yard',
    place: 'Valencia',
    dates: L('Jan – Jun 2025', 'Ene – Jun 2025'),
    points: [
      L(
        "Coordinated the brand's Valencia opening day: €7,000 in revenue, 56% above the previous store record of €4,500 in Bilbao.",
        'Coordinación del día de apertura de la marca en Valencia: 7.000 € de facturación, un 56% por encima del récord anterior de 4.500 € en Bilbao.'
      ),
      L(
        'Grew Instagram following by 30k+ around the launch, plus sponsorships and collaborations with major brands.',
        'Crecimiento de 30k+ seguidores en Instagram alrededor del lanzamiento, además de patrocinios y colaboraciones con marcas grandes.'
      ),
      L(
        'Video creation and editing for organic content and paid ad campaigns.',
        'Creación y edición de vídeo para contenido orgánico y campañas de pago.'
      ),
    ],
  },
];

export function getExperience(lang) {
  return EXPERIENCE_RAW.map((j) => ({
    ...j,
    role: j.role[lang],
    dates: j.dates[lang],
    points: j.points.map((p) => p[lang]),
  }));
}

export const EXPERIENCE = getExperience('en');
