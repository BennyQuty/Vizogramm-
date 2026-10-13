import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'custom';

export interface AIModelOption {
  id: string;
  name: string;
  description: string;
  recommendedFor: string;
}

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  description: string;
  icon: string; // emoji for simplicity
  color: string; // tailwind-style color key
  accentHex: string;
  keyLabel: string;
  keyPlaceholder: string;
  keyHint: string;
  keyPrefix: string;
  getKeyLink: string;
  getKeyLinkLabel: string;
  models: AIModelOption[];
  defaultModel: string;
  testEndpoint: (model: string, key: string) => { url: string; options: RequestInit };
}

// ── Provider Catalogs ──────────────────────────────────────────────

export const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google DeepMind multimodal LLM family — fast, capable, and deeply integrated with Vizogramm diagnostics.',
    icon: '✦',
    color: 'sky',
    accentHex: '#38BDF8',
    keyLabel: 'Gemini API Key',
    keyPlaceholder: 'Paste your Gemini API key (e.g. AIzaSyB...)',
    keyHint: 'API key starts with AIzaSy... and is obtained from Google AI Studio.',
    keyPrefix: 'AIzaSy',
    getKeyLink: 'https://aistudio.google.com/app/apikey',
    getKeyLinkLabel: 'Get key from Google AI Studio',
    defaultModel: 'gemini-2.5-flash',
    models: [
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Ultra-fast low-latency multimodal reasoning model optimized for high-throughput post-assessment diagnostics.',
        recommendedFor: 'Recommended for real-time exam telemetry',
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Balanced speed and code-understanding performance with high instruction fidelity.',
        recommendedFor: 'Standard cohort analysis',
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Deep reasoning model for edge-case CS misconceptions, complex recursive traces, and syllabus-level pacing synthesis.',
        recommendedFor: 'Complex algorithmic pattern analysis',
      },
    ],
    testEndpoint: (model, key) => ({
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Act as Vizogramm CS Diagnostic Engine. In 20 words or fewer, confirm API connection status.' }] }],
          generationConfig: { maxOutputTokens: 50, temperature: 0.1 },
        }),
      },
    }),
  },

  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI GPT models — industry-standard language understanding with strong code analysis capabilities.',
    icon: '◈',
    color: 'emerald',
    accentHex: '#10B981',
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'Paste your OpenAI API key (e.g. sk-proj-...)',
    keyHint: 'API key starts with sk-proj-... or sk-... and is obtained from the OpenAI Dashboard.',
    keyPrefix: 'sk-',
    getKeyLink: 'https://platform.openai.com/api-keys',
    getKeyLinkLabel: 'Get key from OpenAI Platform',
    defaultModel: 'gpt-4o',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Flagship multimodal reasoning model with excellent code comprehension and diagnostic accuracy.',
        recommendedFor: 'Best accuracy for misconception classification',
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Cost-efficient variant with strong code analysis at faster inference speeds.',
        recommendedFor: 'High-throughput cohort diagnostics',
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Extended context reasoning model for complex multi-step code trace analysis.',
        recommendedFor: 'Large assessment batch processing',
      },
      {
        id: 'o3-mini',
        name: 'o3-mini',
        description: 'Reasoning-specialized model with chain-of-thought for deep algorithmic pattern analysis.',
        recommendedFor: 'Advanced recursive trace reasoning',
      },
    ],
    testEndpoint: (model, key) => ({
      url: 'https://api.openai.com/v1/chat/completions',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Act as Vizogramm CS Diagnostic Engine. In 20 words or fewer, confirm API connection status.' }],
          max_tokens: 50,
          temperature: 0.1,
        }),
      },
    }),
  },

  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Anthropic Claude models — safety-focused reasoning with exceptional code analysis and pedagogical nuance.',
    icon: '◉',
    color: 'amber',
    accentHex: '#F59E0B',
    keyLabel: 'Anthropic API Key',
    keyPlaceholder: 'Paste your Anthropic API key (e.g. sk-ant-...)',
    keyHint: 'API key starts with sk-ant-... and is obtained from the Anthropic Console.',
    keyPrefix: 'sk-ant-',
    getKeyLink: 'https://console.anthropic.com/settings/keys',
    getKeyLinkLabel: 'Get key from Anthropic Console',
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        description: 'Latest Anthropic model with excellent code understanding, safety guarantees, and pedagogical reasoning.',
        recommendedFor: 'Recommended for nuanced misconception analysis',
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'Balanced intelligence and speed with strong code analysis and structured output generation.',
        recommendedFor: 'Standard diagnostic pipeline',
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        description: 'Ultra-fast inference optimized for high-volume assessment processing with reliable accuracy.',
        recommendedFor: 'High-throughput batch diagnostics',
      },
    ],
    testEndpoint: (model, key) => ({
      url: 'https://api.anthropic.com/v1/messages',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 50,
          messages: [{ role: 'user', content: 'Act as Vizogramm CS Diagnostic Engine. In 20 words or fewer, confirm API connection status.' }],
        }),
      },
    }),
  },

  custom: {
    id: 'custom',
    name: 'Custom Endpoint',
    description: 'Connect to any OpenAI-compatible API endpoint — self-hosted models, local inference, or third-party providers.',
    icon: '⚙',
    color: 'violet',
    accentHex: '#8B5CF6',
    keyLabel: 'API Key / Bearer Token',
    keyPlaceholder: 'Paste your API key or bearer token',
    keyHint: 'Enter the authentication token required by your custom endpoint. Format depends on provider.',
    keyPrefix: '',
    getKeyLink: '',
    getKeyLinkLabel: '',
    defaultModel: 'custom-model',
    models: [
      {
        id: 'custom-model',
        name: 'Custom Model',
        description: 'Model ID will be sent to your custom endpoint. Enter your model identifier in the field below.',
        recommendedFor: 'Configure via custom endpoint URL',
      },
    ],
    testEndpoint: (model, key) => ({
      url: '', // Will be set via customEndpointUrl state
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Act as Vizogramm CS Diagnostic Engine. In 20 words or fewer, confirm API connection status.' }],
          max_tokens: 50,
          temperature: 0.1,
        }),
      },
    }),
  },
};

// Backwards compat
export const AVAILABLE_MODELS = PROVIDER_CONFIGS.gemini.models;

// ── Helper to extract AI response text per provider ────────────────

function extractResponseText(provider: AIProvider, data: any): string {
  switch (provider) {
    case 'gemini':
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    case 'openai':
      return data?.choices?.[0]?.message?.content || '';
    case 'anthropic':
      return data?.content?.[0]?.text || '';
    case 'custom':
      // Try OpenAI format first, then raw
      return data?.choices?.[0]?.message?.content || data?.content?.[0]?.text || JSON.stringify(data).substring(0, 200);
    default:
      return '';
  }
}

// ── Context Types ──────────────────────────────────────────────────

interface TestResult {
  success: boolean;
  latencyMs?: number;
  sampleResponse?: string;
  error?: string;
}

interface AIConfigContextType {
  apiKey: string;
  provider: AIProvider;
  model: string;
  temperature: number;
  fallbackToRuleEngine: boolean;
  customEndpointUrl: string;
  customModelId: string;
  connectionStatus: 'untested' | 'testing' | 'connected' | 'error';
  connectionLatencyMs: number | null;
  lastTestedAt: string | null;
  lastErrorMessage: string | null;
  sampleDiagnosticOutput: string | null;
  providerConfig: ProviderConfig;

  saveApiKey: (key: string) => void;
  clearApiKey: () => void;
  updateModel: (model: string) => void;
  updateProvider: (provider: AIProvider) => void;
  updateTemperature: (temp: number) => void;
  setFallbackToRuleEngine: (fallback: boolean) => void;
  setCustomEndpointUrl: (url: string) => void;
  setCustomModelId: (id: string) => void;
  testConnection: (customKey?: string) => Promise<TestResult>;
}

const STORAGE_KEYS = {
  API_KEY: 'vizogramm_ai_api_key',
  PROVIDER: 'vizogramm_ai_provider',
  MODEL: 'vizogramm_ai_model',
  TEMP: 'vizogramm_ai_temp',
  FALLBACK: 'vizogramm_ai_fallback',
  STATUS: 'vizogramm_ai_status',
  LAST_TESTED: 'vizogramm_ai_last_tested',
  CUSTOM_ENDPOINT: 'vizogramm_ai_custom_endpoint',
  CUSTOM_MODEL: 'vizogramm_ai_custom_model',
};

const AIConfigContext = createContext<AIConfigContextType | undefined>(undefined);

export function AIConfigProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<AIProvider>(() => {
    return (localStorage.getItem(STORAGE_KEYS.PROVIDER) as AIProvider) || 'gemini';
  });

  const providerConfig = PROVIDER_CONFIGS[provider];

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || (import.meta.env?.VITE_GEMINI_API_KEY ?? '');
  });

  const [model, setModel] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.MODEL) || providerConfig.defaultModel;
  });

  const [temperature, setTemperature] = useState<number>(() => {
    const val = localStorage.getItem(STORAGE_KEYS.TEMP);
    return val ? parseFloat(val) : 0.2;
  });

  const [fallbackToRuleEngine, setFallback] = useState<boolean>(() => {
    const val = localStorage.getItem(STORAGE_KEYS.FALLBACK);
    return val ? val === 'true' : true;
  });

  const [customEndpointUrl, setCustomEndpointUrlState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_ENDPOINT) || '';
  });

  const [customModelId, setCustomModelIdState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_MODEL) || '';
  });

  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'testing' | 'connected' | 'error'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATUS);
    return (saved as any) || 'untested';
  });

  const [connectionLatencyMs, setConnectionLatencyMs] = useState<number | null>(null);
  const [lastTestedAt, setLastTestedAt] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.LAST_TESTED);
  });
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);
  const [sampleDiagnosticOutput, setSampleDiagnosticOutput] = useState<string | null>(null);

  // ── Setters ────────────────────────────────────────────────────

  const saveApiKey = (newKey: string) => {
    const trimmed = newKey.trim();
    setApiKey(trimmed);
    localStorage.setItem(STORAGE_KEYS.API_KEY, trimmed);
    setConnectionStatus('untested');
    setLastErrorMessage(null);
  };

  const clearApiKey = () => {
    setApiKey('');
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    setConnectionStatus('untested');
    setConnectionLatencyMs(null);
    setLastErrorMessage(null);
    setSampleDiagnosticOutput(null);
  };

  const updateModel = (newModel: string) => {
    setModel(newModel);
    localStorage.setItem(STORAGE_KEYS.MODEL, newModel);
  };

  const updateProvider = (newProvider: AIProvider) => {
    setProvider(newProvider);
    localStorage.setItem(STORAGE_KEYS.PROVIDER, newProvider);
    // Reset model to the new provider's default
    const newConfig = PROVIDER_CONFIGS[newProvider];
    setModel(newConfig.defaultModel);
    localStorage.setItem(STORAGE_KEYS.MODEL, newConfig.defaultModel);
    // Reset connection state
    setConnectionStatus('untested');
    setConnectionLatencyMs(null);
    setLastErrorMessage(null);
    setSampleDiagnosticOutput(null);
  };

  const updateTemperature = (temp: number) => {
    setTemperature(temp);
    localStorage.setItem(STORAGE_KEYS.TEMP, temp.toString());
  };

  const setFallbackToRuleEngine = (fallback: boolean) => {
    setFallback(fallback);
    localStorage.setItem(STORAGE_KEYS.FALLBACK, fallback.toString());
  };

  const setCustomEndpointUrl = (url: string) => {
    setCustomEndpointUrlState(url);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ENDPOINT, url);
  };

  const setCustomModelId = (id: string) => {
    setCustomModelIdState(id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_MODEL, id);
  };

  // ── Test Connection ────────────────────────────────────────────

  const testConnection = async (customKey?: string): Promise<TestResult> => {
    const keyToUse = (customKey !== undefined ? customKey : apiKey).trim();

    if (!keyToUse) {
      const err = `No API key provided. Please paste your ${providerConfig.keyLabel}.`;
      setConnectionStatus('error');
      setLastErrorMessage(err);
      return { success: false, error: err };
    }

    const modelToUse = provider === 'custom' && customModelId ? customModelId : model;

    setConnectionStatus('testing');
    setLastErrorMessage(null);

    const startTime = performance.now();

    try {
      let url: string;
      let options: RequestInit;

      if (provider === 'custom') {
        if (!customEndpointUrl) {
          const err = 'No custom endpoint URL provided. Please enter your API endpoint.';
          setConnectionStatus('error');
          setLastErrorMessage(err);
          return { success: false, error: err };
        }
        url = customEndpointUrl;
        const cfg = providerConfig.testEndpoint(modelToUse, keyToUse);
        options = cfg.options;
      } else {
        const cfg = providerConfig.testEndpoint(modelToUse, keyToUse);
        url = cfg.url;
        options = cfg.options;
      }

      const response = await fetch(url, options);

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData?.error?.message ||
          `HTTP ${response.status}: Failed to authenticate with ${providerConfig.name} API. Please verify key validity.`;

        setConnectionStatus('error');
        setLastErrorMessage(message);
        localStorage.setItem(STORAGE_KEYS.STATUS, 'error');
        return { success: false, latencyMs: latency, error: message };
      }

      const data = await response.json();
      const outputText =
        extractResponseText(provider, data) ||
        `Connection validated. ${providerConfig.name} diagnostic link operational.`;

      const timestamp = new Date().toLocaleString();

      setConnectionStatus('connected');
      setConnectionLatencyMs(latency);
      setLastTestedAt(timestamp);
      setSampleDiagnosticOutput(outputText.trim());
      setLastErrorMessage(null);

      localStorage.setItem(STORAGE_KEYS.STATUS, 'connected');
      localStorage.setItem(STORAGE_KEYS.LAST_TESTED, timestamp);

      return {
        success: true,
        latencyMs: latency,
        sampleResponse: outputText.trim(),
      };
    } catch (err: any) {
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      const msg = err.message || `Network error communicating with ${providerConfig.name} API.`;

      setConnectionStatus('error');
      setLastErrorMessage(msg);
      localStorage.setItem(STORAGE_KEYS.STATUS, 'error');

      return {
        success: false,
        latencyMs: latency,
        error: msg,
      };
    }
  };

  return (
    <AIConfigContext.Provider
      value={{
        apiKey,
        provider,
        model,
        temperature,
        fallbackToRuleEngine,
        customEndpointUrl,
        customModelId,
        connectionStatus,
        connectionLatencyMs,
        lastTestedAt,
        lastErrorMessage,
        sampleDiagnosticOutput,
        providerConfig,
        saveApiKey,
        clearApiKey,
        updateModel,
        updateProvider,
        updateTemperature,
        setFallbackToRuleEngine,
        setCustomEndpointUrl,
        setCustomModelId,
        testConnection,
      }}
    >
      {children}
    </AIConfigContext.Provider>
  );
}

export function useAIConfig() {
  const context = useContext(AIConfigContext);
  if (!context) {
    throw new Error('useAIConfig must be used within an AIConfigProvider');
  }
  return context;
}
