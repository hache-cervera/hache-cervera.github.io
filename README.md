# Hache Cervera: portfolio and research

My personal site. Who I am, what I've built and the studies I publish under `/research/`, each one with its method and data so anyone can repeat it.

The 3D chip on the home page is drawn live in WebGL: around 7,000 triangles and six nodes that light up as you scroll.

## Stack

- [React](https://react.dev) and [Vite](https://vitejs.dev).
- [Tailwind CSS](https://tailwindcss.com) for layout and tokens.
- [GSAP and ScrollTrigger](https://gsap.com) for the scroll choreography (pins, scrubs, reveals).
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling.
- [Three.js](https://threejs.org) (r128) for the chip scene.
- [Framer Motion](https://www.framer.com/motion) for micro-interactions.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Where things live

```
src/
├── App.jsx               # sections, smooth scroll and chip choreography
├── i18n.jsx              # home copy, one object per language
├── three/ChipScene.js    # the chip: geometry, lights, render loop
├── data/content.js       # skills, experience and client logos, per language
├── static/render.jsx     # build-time HTML of the home (prerendered into dist/)
└── components/           # one file per section
public/
├── work/                 # case studies, hand-written static HTML (English, es/ Spanish)
├── research/             # studies with method and downloadable data
└── stats.js              # visit counts with GoatCounter, no cookies
scripts/prerender.mjs     # runs after the build: prerendered home in both languages
```

Every push to `main` builds the site and deploys it to GitHub Pages.

## How it's made

I designed and built it pair-programming with Claude. I decide what gets built, question what the tool suggests and read every line that ships. The research scripts are made the same way; choosing what to measure and checking the odd cases by hand stays with me.
