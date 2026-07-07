// Six disciplines, one per network node on the chip.
// `bg` tints the pinned Skills section as each discipline lands.
export const DISCIPLINES = [
  {
    id: 'dev',
    label: 'Web & Development',
    node: 'Node 01 / Code',
    bg: '#ffffff',
    tools: [
      { mark: 'Wp', name: 'WordPress' },
      { mark: 'El', name: 'Elementor' },
      { mark: 'Dv', name: 'Divi' },
      { mark: 'Wb', name: 'WP Bakery' },
      { mark: 'Ml', name: 'WPML' },
      { mark: 'Wc', name: 'WooCommerce' },
      { mark: 'H5', name: 'HTML' },
      { mark: 'C3', name: 'CSS' },
      { mark: 'Js', name: 'JavaScript' },
    ],
  },
  {
    id: 'infra',
    label: 'Technical & Infrastructure',
    node: 'Node 02 / Systems',
    bg: '#fff8f5',
    tools: [
      { mark: 'Sm', name: 'Site Migrations' },
      { mark: 'St', name: 'Staging Environments' },
      { mark: 'Dns', name: 'DNS & Hosting' },
      { mark: 'Ssl', name: 'SSL Setup' },
      { mark: 'Pf', name: 'Performance' },
      { mark: 'Cwv', name: 'Core Web Vitals' },
      { mark: 'Sc', name: 'Schema Markup' },
      { mark: 'Xml', name: 'Sitemaps' },
      { mark: 'Hl', name: 'Hreflang' },
      { mark: 'Gtm', name: 'GTM' },
    ],
  },
  {
    id: 'design',
    label: 'Design & Branding',
    node: 'Node 03 / Design',
    bg: '#fff1eb',
    tools: [
      { mark: 'Ps', name: 'Photoshop' },
      { mark: 'Ai', name: 'Illustrator' },
      { mark: 'Id', name: 'InDesign' },
      { mark: 'Fi', name: 'Figma' },
      { mark: 'Xd', name: 'Adobe XD' },
    ],
  },
  {
    id: 'motion',
    label: 'Motion & AV',
    node: 'Node 04 / Motion',
    bg: '#ffe9df',
    tools: [
      { mark: 'Ae', name: 'After Effects' },
      { mark: 'Pr', name: 'Premiere Pro' },
      { mark: 'Dr', name: 'DaVinci Resolve' },
      { mark: 'Bl', name: 'Blender' },
      { mark: 'Lp', name: 'Logic Pro X' },
    ],
  },
  {
    id: 'seo',
    label: 'SEO & Analytics',
    node: 'Node 05 / Search',
    bg: '#ffe1d3',
    tools: [
      { mark: 'Sr', name: 'Semrush' },
      { mark: 'Ah', name: 'Ahrefs' },
      { mark: 'Yo', name: 'Yoast' },
      { mark: 'Rm', name: 'Rank Math' },
      { mark: 'Gsc', name: 'Search Console' },
      { mark: 'Ga4', name: 'GA4' },
    ],
  },
  {
    id: 'ai',
    label: 'AI & Automation',
    node: 'Node 06 / Judgment',
    bg: '#ffd9c8',
    note: 'AI as a tool, not a crutch: integrated where the project needs it, understanding what it generates. No blind copy-paste.',
    tools: [
      { mark: 'Ad', name: 'AI-assisted Dev' },
      { mark: 'Pd', name: 'Prompt Design' },
      { mark: 'Cg', name: 'Content Generation' },
      { mark: 'Wa', name: 'Workflow Automation' },
    ],
  },
];

export const LOGOS = [
  { src: 'logos/cofidis.png', alt: 'Cofidis' },
  { src: 'logos/benimar.png', alt: 'Benimar' },
  { src: 'logos/apm-terminals.png', alt: 'APM Terminals' },
];

export const EXPERIENCE = [
  {
    role: 'Creative & Digital Specialist',
    company: 'Neurona Digital SL',
    place: 'Valencia',
    dates: 'Nov 2024 – Present',
    points: [
      '+10 WordPress sites built and maintained in under a year: design, migrations, hosting, DNS, SSL and technical troubleshooting.',
      'Graphic, motion and audiovisual production for brands including Cofidis and Benimar: +300 pieces for organic content and paid social.',
      'Technical audits, web performance optimisation and on-page SEO.',
      'Multiple clients and projects in parallel, agency pace.',
    ],
  },
  {
    role: 'Media & Content Specialist',
    company: 'Jump Yard',
    place: 'Valencia',
    dates: 'Jan – Jun 2025',
    points: [
      'Video creation and editing for organic content and paid ad campaigns.',
      'Media management, content strategy and sponsorship coordination.',
    ],
  },
];
