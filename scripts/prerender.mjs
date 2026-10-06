// Puts the build-time HTML of the home (src/static/render.jsx) inside #root in dist/index.html.
// Runs after `vite build` and the SSR build of render.jsx (see package.json).
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const { render } = await import(pathToFileURL('dist-ssr/render.js').href);
const file = 'dist/index.html';
const html = readFileSync(file, 'utf8');
if (!html.includes('<div id="root"></div>')) throw new Error('empty #root not found in dist/index.html');
writeFileSync(file, html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`));
rmSync('dist-ssr', { recursive: true, force: true });
console.log('prerendered home into dist/index.html');
