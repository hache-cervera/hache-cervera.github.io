async function req(path, opts = {}) {
  const res = await fetch(`/api${path}`, {
    ...opts,
    // Solo declaramos content-type JSON cuando de verdad enviamos cuerpo:
    // si no, Fastify rechaza la petición (FST_ERR_CTP_EMPTY_JSON_BODY).
    headers: opts.body ? { 'content-type': 'application/json' } : {},
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
  return res.json();
}

export const api = {
  projects: () => req('/projects'),
  createProject: (data) => req('/projects', { method: 'POST', body: data }),
  deleteProject: (id) => req(`/projects/${id}`, { method: 'DELETE' }),

  scans: (id) => req(`/projects/${id}/scans`),
  scan: (id) => req(`/scans/${id}`),
  runScan: (id) => req(`/projects/${id}/scan`, { method: 'POST' }),
  uptime: (id) => req(`/projects/${id}/uptime`),

  wp: (id) => req(`/projects/${id}/wp`),
  runWp: (id) => req(`/projects/${id}/wp`, { method: 'POST' }),

  aiReadiness: (id) => req(`/projects/${id}/ai-readiness`),
  runAiReadiness: (id) => req(`/projects/${id}/ai-readiness`, { method: 'POST' }),
  aiPrompts: (id) => req(`/projects/${id}/ai-prompts`),
  addAiPrompt: (id, data) => req(`/projects/${id}/ai-prompts`, { method: 'POST', body: data }),
  aiResults: (id) => req(`/projects/${id}/ai-results`),
  runAiProbe: (id) => req(`/projects/${id}/ai-probe`, { method: 'POST' }),
  aiBenchmark: (id) => req(`/projects/${id}/ai-benchmark`, { method: 'POST' }),

  alerts: () => req('/alerts'),
};
