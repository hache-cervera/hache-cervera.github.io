import tls from 'node:tls';

const UA = 'Mozilla/5.0 (compatible; PulseBot/0.1; +https://github.com/hache-cervera)';

export async function timedFetch(url, opts = {}) {
  const started = Date.now();
  const res = await fetch(url, {
    redirect: 'manual',
    signal: AbortSignal.timeout(opts.timeout ?? 15000),
    headers: { 'user-agent': UA, accept: 'text/html,*/*', ...opts.headers },
    method: opts.method ?? 'GET',
  });
  return { res, ms: Date.now() - started };
}

// Sigue redirecciones manualmente registrando cada salto.
export async function followRedirects(url, maxHops = 8) {
  const chain = [];
  let current = url;
  for (let i = 0; i <= maxHops; i++) {
    let res, ms;
    try {
      ({ res, ms } = await timedFetch(current));
    } catch (err) {
      return { chain, finalUrl: current, status: 0, error: err.message, ms: 0 };
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const next = new URL(res.headers.get('location'), current).href;
      chain.push({ from: current, to: next, status: res.status });
      if (chain.some((h, idx) => idx < chain.length - 1 && h.from === next)) {
        return { chain, finalUrl: next, status: res.status, loop: true, ms };
      }
      current = next;
      continue;
    }
    return { chain, finalUrl: current, status: res.status, res, ms };
  }
  return { chain, finalUrl: current, status: 0, tooManyHops: true, ms: 0 };
}

// Días hasta la caducidad del certificado TLS (null si no aplica).
export function sslDaysRemaining(hostname, port = 443) {
  return new Promise((resolve) => {
    const socket = tls.connect({ host: hostname, port, servername: hostname, timeout: 10000 }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      if (!cert || !cert.valid_to) return resolve(null);
      resolve(Math.floor((new Date(cert.valid_to) - Date.now()) / 86400000));
    });
    socket.on('error', () => resolve(null));
    socket.on('timeout', () => { socket.destroy(); resolve(null); });
  });
}
