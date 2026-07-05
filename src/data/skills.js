// Five disciplines — one per network node on the chip.
// `bg` tints the pinned Skills section as each discipline lands.
export const DISCIPLINES = [
  {
    id: 'dev',
    label: 'Web & Development',
    node: 'Node 01 — Code',
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
    node: 'Node 02 — Systems',
    bg: '#fff7f3',
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
    node: 'Node 03 — Design',
    bg: '#ffefe7',
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
    node: 'Node 04 — Motion',
    bg: '#ffe6da',
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
    node: 'Node 05 — Search',
    bg: '#ffddcd',
    tools: [
      { mark: 'Sr', name: 'Semrush' },
      { mark: 'Ah', name: 'Ahrefs' },
      { mark: 'Yo', name: 'Yoast' },
      { mark: 'Rm', name: 'Rank Math' },
      { mark: 'Gsc', name: 'Search Console' },
      { mark: 'Ga4', name: 'GA4' },
    ],
  },
];

export const WORKS = [
  {
    index: '01',
    name: 'Cofidis',
    tags: 'WordPress · Technical SEO · Performance',
    copy: 'End-to-end WordPress builds, Core Web Vitals and technical SEO for a European consumer-finance brand.',
    theme: 'dark',
  },
  {
    index: '02',
    name: 'Benimar',
    tags: 'WordPress · WPML · Motion & AV',
    copy: 'Multi-market WordPress platform with WPML, plus audiovisual asset production for a motorhome manufacturer.',
    theme: 'accent',
  },
];
