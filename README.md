# Hache Cervera — Portfolio

One-page portfolio of Hache (Ada Cervera), creative technologist and web developer in Valencia, Spain.

The visual anchor is a procedural microchip rendered live with WebGL — no images, no video. Six network nodes light up as you scroll, one per discipline: code, systems, design, motion, search and AI.

## Stack

- [React](https://react.dev) + [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com) for layout and tokens
- [GSAP + ScrollTrigger](https://gsap.com) for scroll choreography (pins, scrubs, reveals)
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- [Three.js](https://threejs.org) (r128) for the chip scene
- [Framer Motion](https://www.framer.com/motion) for micro-interactions

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Structure

```
src/
├── App.jsx               # section layout + Lenis + chip choreography
├── three/ChipScene.js    # the procedural chip (scene, nodes, render loop)
├── data/content.js       # all copy: skills, experience, client logos
└── components/           # one file per section + shared pieces
```

The build uses relative paths (`base: './'`), so `dist/` deploys to GitHub Pages as-is.
