import { db } from '../db/index.js';
import { notify } from '../alerts/index.js';

// Modelo juez: barato y suficiente para clasificar/extraer sobre texto.
const JUDGE_MODEL = 'claude-haiku-4-5';

// Proveedores a los que se les pregunta sobre la marca. Solo se usa el que tenga clave en .env.
const PROVIDERS = {
  openai: {
    key: () => process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    ask: askOpenAI,
  },
  anthropic: {
    key: () => process.env.ANTHROPIC_API_KEY,
    model: 'claude-haiku-4-5',
    ask: askAnthropic,
  },
  perplexity: {
    key: () => process.env.PERPLEXITY_API_KEY,
    model: 'sonar',
    ask: askPerplexity,
  },
};

// Sondea todos los modelos disponibles con las preguntas del proyecto y analiza cada respuesta.
export async function runAiProbe(projectId) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  if (!project) throw new Error(`Proyecto ${projectId} no existe`);

  const judgeKey = process.env.ANTHROPIC_API_KEY;
  if (!judgeKey) throw new Error('Falta ANTHROPIC_API_KEY para el análisis del módulo IA');

  const brands = JSON.parse(project.brand_terms || '[]');
  const competitors = JSON.parse(project.competitors || '[]').map((c) => c.name);
  const prompts = db.prepare('SELECT * FROM ai_prompts WHERE project_id = ? AND active = 1').all(projectId);

  const available = Object.entries(PROVIDERS).filter(([, p]) => p.key());
  if (!available.length) throw new Error('No hay ninguna clave de proveedor IA configurada en .env');

  const insert = db.prepare(`INSERT INTO ai_results
    (project_id, prompt_id, provider, model, brand_mentioned, competitors_mentioned, sentiment, hallucinations, answer, analysis)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  let saved = 0;
  for (const prompt of prompts) {
    for (const [providerName, provider] of available) {
      let answer;
      try {
        answer = await provider.ask(prompt.text, provider.key(), provider.model);
      } catch (err) {
        console.error(`Sondeo ${providerName}:`, err.message);
        continue;
      }
      const analysis = await analyzeAnswer({ answer, brands, competitors, kind: prompt.kind, judgeKey });
      insert.run(projectId, prompt.id, providerName, provider.model,
        analysis.brand_mentioned ? 1 : 0, JSON.stringify(analysis.competitors_mentioned || []),
        analysis.sentiment, JSON.stringify(analysis.hallucinations || []), answer, JSON.stringify(analysis));
      saved++;

      if ((analysis.hallucinations || []).length) {
        notify(projectId, 'warning', 'ai',
          `${project.name}: ${providerName} da información posiblemente falsa sobre la marca — ${analysis.hallucinations.join('; ')}`);
      }
    }
  }
  return { saved, prompts: prompts.length, providers: available.map(([n]) => n) };
}

// --- Análisis de la respuesta con Claude (salida JSON estructurada, vía fetch, sin SDK) ---

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    brand_mentioned: { type: 'boolean', description: '¿La respuesta menciona a la marca del cliente?' },
    competitors_mentioned: {
      type: 'array', items: { type: 'string' },
      description: 'Competidores de la lista dada que aparecen en la respuesta',
    },
    sentiment: {
      type: 'string', enum: ['positivo', 'neutro', 'negativo', 'no_aplica'],
      description: 'Tono hacia la marca del cliente',
    },
    hallucinations: {
      type: 'array', items: { type: 'string' },
      description: 'Afirmaciones concretas sobre la marca que parecen inventadas o dudosas (horarios, precios, servicios). Vacío si no hay.',
    },
  },
  required: ['brand_mentioned', 'competitors_mentioned', 'sentiment', 'hallucinations'],
  additionalProperties: false,
};

async function analyzeAnswer({ answer, brands, competitors, kind, judgeKey }) {
  const prompt = `Eres un analista de reputación de marca. Analiza esta respuesta de un asistente de IA.

Marca del cliente (cualquiera de estos nombres cuenta): ${JSON.stringify(brands)}
Competidores a vigilar: ${JSON.stringify(competitors)}
Tipo de pregunta: ${kind === 'recommendation' ? 'recomendación (¿a quién recomienda?)' : 'percepción (¿qué dice de la marca?)'}

Respuesta a analizar:
"""
${answer}
"""

Devuelve el análisis en el formato JSON indicado. Marca como alucinación solo afirmaciones factuales específicas sobre la marca del cliente que suenen inventadas.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': judgeKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: JUDGE_MODEL,
      max_tokens: 1024,
      output_config: { format: { type: 'json_schema', schema: ANALYSIS_SCHEMA } },
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`Claude (juez) respondió HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (data.stop_reason === 'refusal') return emptyAnalysis();
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  try { return JSON.parse(text); } catch { return emptyAnalysis(); }
}

function emptyAnalysis() {
  return { brand_mentioned: false, competitors_mentioned: [], sentiment: 'no_aplica', hallucinations: [] };
}

// --- Sondeos a cada proveedor (todos vía fetch, sin SDK) ---

async function askAnthropic(question, key, model) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 1024, messages: [{ role: 'user', content: question }] }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
}

async function askOpenAI(question, key, model) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: question }] }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function askPerplexity(question, key, model) {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: question }] }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
