# Working notes for Claude

Companion to `README.md`, which covers the stack and the layout. This file covers
how to work in the repo without breaking things that have been broken before.

## Build and deploy

```bash
npm install
npm run build    # client build + SSR build + scripts/prerender.mjs
npm run preview  # serve dist/ to check the real output
```

`npm run build` is three steps, not one: the client bundle, an SSR bundle into
`dist-ssr/`, then `scripts/prerender.mjs`, which writes the prerendered HTML.
Changing home copy means rebuilding, or the prerendered markup goes stale.

Pushing `main` deploys to GitHub Pages. Deploys take roughly a minute; poll the
live URL rather than assuming.

## Everything ships twice

The site is bilingual and the two halves live in different places:

- **Home** is a React SPA. All of its copy is in `src/i18n.jsx`, one object per
  language. Never hardcode a string in a component.
- **`/work` and the case pages** are hand-written static HTML under `public/`,
  served verbatim. English at `public/work/<name>/`, Spanish at
  `public/work/es/<name>/`. Each is a full standalone file with its own inline
  `<style>`.

A change to a case page is two files. A change to home copy is two keys.

Relative paths differ by depth: an English case page reaches images at
`../img/`, the Spanish one at `../../img/`.

## Case pages

New case pages are built by copying an existing one (`devilfruittcg`, `decopam`,
`homelab`, `parts-catalogue`) and replacing the body. That keeps the inline CSS,
the theme toggle, the language switch, the lightbox and the analytics identical
across pages. Remember to change the `track()` page label, which is easy to
leave pointing at the page you copied.

**The gallery gotcha.** The template styles images as `.card figure img`. A bare
`<figure>` gets no sizing rules at all, so images render at natural width and the
grid resolves to pixel columns far wider than the container. Sections carry
`overflow: hidden`, so `document.scrollWidth` still matches the viewport while
the content is quietly clipped. Always use the full pattern:

```html
<div class="card">
  <figure><img src="…" width="…" height="…" loading="lazy" data-zoom /></figure>
  <div class="body"><h3>…</h3><p>…</p></div>
</div>
```

Add `class="card wide"` for a shot that should span the grid. `data-zoom` is
what wires an image into the lightbox.

Every image needs explicit `width` and `height`. Lazy loading without intrinsic
dimensions reserves no space and causes layout shift.

## Tokens and a Tailwind trap

Colours are CSS variables (`--c-bg`, `--c-ink`, `--c-muted`, `--c-line`) remapped
under `[data-theme='dark']`, exposed to Tailwind as `page`, `ink`, `muted`,
`line`. One accent, `#ff3c00`. Sharp corners, no shadows.

The variables hold full hex values, so **Tailwind's alpha modifier does not work
on them**: `bg-page/80` compiles to nothing and the element ends up transparent.
That is what made the floating controls invisible over the dark contact and
footer sections. Use the `.ctl-surface` class in `src/index.css`, which does the
same job with `color-mix`.

Anything that sits over the WebGL chip needs an opaque background or the chip
renders through the text.

## Writing

- No em-dashes. No emojis in the interface; inline stroke SVG icons instead.
- Say what something is, not what it is like. No agency-brochure register.
- Numbers beat adjectives. If a figure exists in the source material, use it.
- Claims stay checkable. When something has not been measured yet, say so on the
  page rather than implying a result.
- Spanish and English are both written, not translated word for word.

## What does not get published

- **Client work**: a note above the `/work` filters explains that NDAs, client
  intranets and staging keep part of it off the page. Do not name themes,
  plugins or tooling for client sites unless Hache says to.
- **The homelab**: the case page describes the architecture and the incidents,
  never the coordinates. LAN and Tailscale addresses, tunnel and disk
  identifiers, OAuth client ids, private subdomains and phone numbers all stay
  out. Scan any new vault material before using it.

## Checking the work

Chromium is at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` with
`playwright-core`. Check at 1440 and 390 wide, in both themes.

`document.scrollWidth === innerWidth` is not an overflow test here, because
sections clip. Walk the DOM and compare each element against its parent instead.
The `.glow` and `.deco` spans overflow on purpose; everything else should not.

## Visit counts and email references

`public/stats.js` loads GoatCounter (`hache.goatcounter.com`, no cookies) on every
page: the home via `index.html`, each static page next to `consent.js`, and
`404.html`. New static pages need the same `<script src="/stats.js" defer>` line.

Application emails link to `/ref-NNNN/` or `/es/ref-NNNN/`. The build
(`scripts/prerender.mjs`) writes a noindex copy of the home for every reference in
`scripts/alias-codes.json`; canonical stays on the home. Numbers are random on
purpose, so a recipient cannot infer how many applications went out. Which company
got which reference is kept outside the repo. On these pages `stats.js` also sends
a `leido <path>` event after 10 visible seconds or a scroll, to tell people apart
from mail scanners. Adding references: append to the JSON, never renumber.

`count.js` takes the path from `<link rel="canonical">` when it is on the same host,
and reference pages point their canonical at the home, so `stats.js` overrides the
path on them. Without it every reference visit counts as `/` (this shipped once,
in October 2026). Localhost cannot show the bug, because the canonical host differs.
`npm run check:stats` loads every page of `dist/` under the real origin, with the
GoatCounter endpoint blocked, and fails if a reference page would count under any
other path. The deploy workflow runs it after the build.
