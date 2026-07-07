# Hache Cervera — My website portfolio

My personal site. One page, a 3D chip travelling through it, and the stuff I do: design, code, motion and SEO.

The chip is procedural WebGL, not a video — around 7,000 triangles rendered live, with six nodes that light up as you scroll.

## Stack

- [React](https://react.dev) + [Vite](https://vitejs.dev).
- [Tailwind CSS](https://tailwindcss.com) for layout and tokens.
- [GSAP + ScrollTrigger](https://gsap.com) for scroll choreography (pins, scrubs, reveals).
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
├── App.jsx               # sections + smooth scroll + chip choreography
├── three/ChipScene.js    # the chip: geometry, lights, render loop
├── data/content.js       # all the copy: skills, experience, client logos
└── components/           # one file per section
```

Deploys itself to GitHub Pages on every push to `main`. The previous version of this site lives in the `old-site` branch.

## About the process

Designed and built by me, pair-programming with Claude. No secret about it: the point is knowing how to work with these tools — directing them, questioning them, and understanding every line that ships — not pretending they don't exist. Same rule as the AI node on the site: a tool, not a crutch.
