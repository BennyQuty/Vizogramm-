import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

// Helper to handle fallback across modern Gemini models when spikes in demand or 503 occur
async function callGeminiWithFallback(
  client: GoogleGenAI,
  model: string,
  contents: any,
  config: any,
  timeoutMs: number
) {
  const modelsToTry = [model];
  if (!modelsToTry.includes('gemini-2.5-flash')) modelsToTry.push('gemini-2.5-flash');
  if (!modelsToTry.includes('gemini-3.1-flash-lite')) modelsToTry.push('gemini-3.1-flash-lite');

  let lastErr: any = null;
  for (const m of modelsToTry) {
    try {
      const callPromise = client.models.generateContent({
        model: m,
        contents,
        config,
      });
      const timerPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
      );
      const res: any = await Promise.race([callPromise, timerPromise]);
      return { response: res, usedModel: m };
    } catch (err: any) {
      lastErr = err;
      const isDemandSpike =
        err?.message?.includes('503') ||
        err?.message?.includes('429') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('demand');
      if (isDemandSpike) {
        console.warn(`[Gemini API] Model ${m} is temporarily busy. Trying fallback ${modelsToTry[modelsToTry.indexOf(m) + 1] || 'none'}...`);
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// 1. Test AI Model Connection
app.post('/api/ai/test', async (req, res) => {
  const startTime = Date.now();
  const { provider, modelId, apiKey, baseUrl, temperature, maxTokens, timeout } = req.body;

  try {
    if (!provider) {
      return res.status(400).json({ success: false, error: 'Provider is required' });
    }

    if (provider === 'gemini') {
      const activeKey = apiKey || process.env.GEMINI_API_KEY;
      if (!activeKey) {
        return res.status(400).json({
          success: false,
          error: 'Gemini API key is missing. Enter a key or verify environment setup.',
          latencyMs: Date.now() - startTime,
        });
      }

      const client = new GoogleGenAI({
        apiKey: activeKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const chosenModel = modelId?.trim() || 'gemini-3.8-flash';
      const timeoutMs = Number(timeout) || 15000;

      const { response, usedModel } = await callGeminiWithFallback(
        client,
        chosenModel,
        'Respond with exactly: {"status":"connected","provider":"gemini"}',
        {
          temperature: typeof temperature === 'number' ? temperature : 0.1,
          responseMimeType: 'application/json',
        },
        timeoutMs
      );

      const latencyMs = Date.now() - startTime;
      const text = response?.text || '';

      return res.json({
        success: true,
        latencyMs,
        model: usedModel,
        provider: 'gemini',
        message: `Connected successfully to Gemini model (${usedModel})!`,
        responseSnippet: text.slice(0, 100),
      });
    }

    // OpenRouter or OpenAI-compatible custom endpoint
    if (provider === 'openrouter' || provider === 'custom') {
      const endpoint =
        provider === 'openrouter'
          ? (baseUrl || 'https://openrouter.ai/api/v1') + '/chat/completions'
          : (baseUrl?.replace(/\/+$/, '') || 'https://api.openai.com/v1') + '/chat/completions';

      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: `${provider === 'openrouter' ? 'OpenRouter' : 'Custom'} API key is required.`,
          latencyMs: Date.now() - startTime,
        });
      }

      const controller = new AbortController();
      const timeoutMs = Number(timeout) || 15000;
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const fetchRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          ...(provider === 'openrouter' ? { 'HTTP-Referer': 'https://vizogramm.edu', 'X-Title': 'Vizogramm' } : {}),
        },
        body: JSON.stringify({
          model: modelId || (provider === 'openrouter' ? 'google/gemini-2.5-flash' : 'gpt-4o-mini'),
          messages: [{ role: 'user', content: 'Respond with JSON: {"status":"connected"}' }],
          temperature: typeof temperature === 'number' ? temperature : 0.1,
          max_tokens: maxTokens || 64,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);
      const latencyMs = Date.now() - startTime;

      if (!fetchRes.ok) {
        const errorText = await fetchRes.text();
        return res.status(fetchRes.status).json({
          success: false,
          error: `HTTP ${fetchRes.status}: ${errorText.slice(0, 200)}`,
          latencyMs,
        });
      }

      const data = await fetchRes.json();
      return res.json({
        success: true,
        latencyMs,
        provider,
        message: `Connected successfully to ${provider} endpoint!`,
        responseSnippet: JSON.stringify(data).slice(0, 100),
      });
    }

    return res.status(400).json({ success: false, error: `Unsupported provider: ${provider}` });
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return res.status(500).json({
      success: false,
      error: err.message || 'Connection test failed',
      latencyMs,
    });
  }
});

// Helper to call AI with prompt & JSON schema expectation
async function executeAiGeneration({
  provider,
  modelId,
  apiKey,
  baseUrl,
  systemInstruction,
  prompt,
  temperature = 0.2,
  maxTokens = 2048,
  timeout = 25000,
}: {
  provider: string;
  modelId?: string;
  apiKey?: string;
  baseUrl?: string;
  systemInstruction?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}) {
  const startTime = Date.now();

  if (provider === 'gemini') {
    const activeKey = apiKey || process.env.GEMINI_API_KEY;
    if (!activeKey) {
      throw new Error('Gemini API key is not configured. Please configure in AI Model Settings.');
    }
    const client = new GoogleGenAI({
      apiKey: activeKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const chosenModel = modelId?.trim() || 'gemini-3.8-flash';
    const controllerTimeout = Number(timeout) || 25000;

    const { response, usedModel } = await callGeminiWithFallback(
      client,
      chosenModel,
      prompt,
      {
        systemInstruction: systemInstruction || undefined,
        temperature: Number(temperature) || 0.2,
        maxOutputTokens: Number(maxTokens) || 2048,
        responseMimeType: 'application/json',
      },
      controllerTimeout
    );

    const latencyMs = Date.now() - startTime;
    const text = response?.text || '';

    return { rawText: text, latencyMs, model: usedModel, provider: 'gemini' };
  }

  // OpenRouter / Custom
  if (provider === 'openrouter' || provider === 'custom') {
    const endpoint =
      provider === 'openrouter'
        ? (baseUrl || 'https://openrouter.ai/api/v1') + '/chat/completions'
        : (baseUrl?.replace(/\/+$/, '') || 'https://api.openai.com/v1') + '/chat/completions';

    if (!apiKey) {
      throw new Error(`${provider} API key is required.`);
    }

    const controller = new AbortController();
    const timeoutMs = Number(timeout) || 25000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const fetchRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...(provider === 'openrouter' ? { 'HTTP-Referer': 'https://vizogramm.edu', 'X-Title': 'Vizogramm' } : {}),
      },
      body: JSON.stringify({
        model: modelId || (provider === 'openrouter' ? 'google/gemini-2.5-flash' : 'gpt-4o-mini'),
        messages,
        temperature: Number(temperature) || 0.2,
        max_tokens: Number(maxTokens) || 2048,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    const latencyMs = Date.now() - startTime;

    if (!fetchRes.ok) {
      const errText = await fetchRes.text();
      throw new Error(`AI Provider error HTTP ${fetchRes.status}: ${errText.slice(0, 300)}`);
    }

    const data = await fetchRes.json();
    const text = data.choices?.[0]?.message?.content || '';
    return { rawText: text, latencyMs, model: modelId, provider };
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

// 2. Per-Student Diagnosis Endpoint
app.post('/api/ai/diagnose', async (req, res) => {
  const { config, prompt, systemInstruction } = req.body;

  if (!config || !config.provider) {
    return res.status(400).json({
      success: false,
      error: 'No AI model configured. Contact the System Administrator.',
    });
  }

  try {
    const result = await executeAiGeneration({
      provider: config.provider,
      modelId: config.modelId,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      systemInstruction,
      prompt,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      timeout: config.timeout,
    });

    // Parse and validate JSON
    let parsed: any;
    try {
      // Clean potential markdown code fences if any
      const cleaned = result.rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr: any) {
      return res.status(502).json({
        success: false,
        error: `Invalid JSON returned by AI model: ${parseErr.message}`,
        rawText: result.rawText,
        latencyMs: result.latencyMs,
      });
    }

    return res.json({
      success: true,
      data: parsed,
      latencyMs: result.latencyMs,
      model: result.model,
      provider: result.provider,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Diagnosis generation failed',
    });
  }
});

// 3. Cohort Pacing Recommender Endpoint
app.post('/api/ai/recommend', async (req, res) => {
  const { config, prompt, systemInstruction } = req.body;

  if (!config || !config.provider) {
    return res.status(400).json({
      success: false,
      error: 'No AI model configured. Contact the System Administrator.',
    });
  }

  try {
    const result = await executeAiGeneration({
      provider: config.provider,
      modelId: config.modelId,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      systemInstruction,
      prompt,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      timeout: config.timeout,
    });

    let parsed: any;
    try {
      const cleaned = result.rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr: any) {
      return res.status(502).json({
        success: false,
        error: `Invalid JSON returned by AI model: ${parseErr.message}`,
        rawText: result.rawText,
        latencyMs: result.latencyMs,
      });
    }

    return res.json({
      success: true,
      data: parsed,
      latencyMs: result.latencyMs,
      model: result.model,
      provider: result.provider,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Pacing recommendation generation failed',
    });
  }
});

// 4. Course Recommender Endpoint
app.post('/api/ai/course-recommend', async (req, res) => {
  const { config, prompt, systemInstruction } = req.body;

  if (!config || !config.provider) {
    return res.status(400).json({
      success: false,
      error: 'No AI model configured. Contact the System Administrator.',
    });
  }

  try {
    const result = await executeAiGeneration({
      provider: config.provider,
      modelId: config.modelId,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      systemInstruction,
      prompt,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      timeout: config.timeout,
    });

    let parsed: any;
    try {
      const cleaned = result.rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr: any) {
      return res.status(502).json({
        success: false,
        error: `Invalid JSON returned by AI model: ${parseErr.message}`,
        rawText: result.rawText,
        latencyMs: result.latencyMs,
      });
    }

    // Validate that required keys exist
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.recommended_courses)) {
      return res.status(502).json({
        success: false,
        error: 'AI response missing "recommended_courses" array',
        rawText: result.rawText,
        latencyMs: result.latencyMs,
      });
    }

    return res.json({
      success: true,
      data: parsed,
      latencyMs: result.latencyMs,
      model: result.model,
      provider: result.provider,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Course recommendation generation failed',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasServerGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Vizogramm] Server running at http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Vizogramm] Failed to start server:', err);
  process.exit(1);
});
