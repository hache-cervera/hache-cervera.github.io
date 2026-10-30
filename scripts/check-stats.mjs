// Checks, in a real browser, the path GoatCounter would record for each page of dist/.
// Every /ref-NNNN/ and /es/ref-NNNN/ page must count under its own path, because that is
// what the tracking sheet looks for. Run after `npm run build`: `npm run check:stats`.
//
// Pages load under the real origin (https://hache-cervera.github.io) but are served from dist/.
// That matters: count.js only follows <link rel="canonical"> when it is on the same host as the
// page, so on localhost the canonical is ignored and the bug this guards against cannot show.
// Requests to the GoatCounter endpoint are aborted, so nothing reaches the stats.
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const origin = 'https://hache-cervera.github.io';
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const refs = JSON.parse(await readFile(new URL('./alias-codes.json', import.meta.url), 'utf8'));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json' };

// Each case: page to load, path GoatCounter must record (null: any path that is not a reference).
const cases = [
  ...refs.flatMap(r => [[`/${r}/`, `/${r}`], [`/es/${r}/`, `/es/${r}`]]),
  ['/', null], ['/es/', null], ['/research/', null], ['/work/', null],
];

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' });
const context = await browser.newContext();
let sent = 0;
await context.route('https://hache.goatcounter.com/**', route => { sent++; return route.abort(); });
await context.route(origin + '/**', async route => {
  let p = decodeURIComponent(new URL(route.request().url()).pathname);
  if (p.endsWith('/')) p += 'index.html';
  try {
    const body = await readFile(join(dist, p));
    await route.fulfill({ status: 200, contentType: types[extname(p)] || 'application/octet-stream', body });
  } catch {
    await route.fulfill({ status: 404, body: '' });
  }
});

const failures = [];
const queue = [...cases];
await Promise.all(Array.from({ length: 6 }, async () => {
  const page = await context.newPage();
  for (let c; (c = queue.shift());) {
    const [url, want] = c;
    let got = '(count.js did not load)';
    // count.js comes from gc.zgo.at, so a slow network can miss one load: try twice.
    for (let attempt = 0; attempt < 2 && got.startsWith('('); attempt++) {
      await page.goto(origin + url);
      got = await page.waitForFunction(() => window.goatcounter && window.goatcounter.get_data && window.goatcounter.get_data().p, null, { timeout: 15000 })
        .then(h => h.jsonValue()).catch(() => got);
    }
    const ok = want ? got === want : !/ref-\d{4}/.test(got);
    if (!ok) failures.push(`${url} counts as ${got}${want ? `, expected ${want}` : ''}`);
  }
  await page.close();
}));
await browser.close();

if (failures.length) {
  console.error(`check-stats: ${failures.length} of ${cases.length} pages count under the wrong path:\n  ` + failures.join('\n  '));
  process.exit(1);
}
console.log(`check-stats: ${cases.length} pages, all count under the right path (${refs.length * 2} reference pages; ${sent} hits blocked, none sent).`);
