import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'custom';

export interface AIModelOption {
  id: string;
  name: string;
  description: string;
  recommendedFor: string;
}

export const AVAILABLE_MODELS: AIModelOption[] = [
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
];

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
  connectionStatus: 'untested' | 'testing' | 'connected' | 'error';
  connectionLatencyMs: number | null;
  lastTestedAt: string | null;
  lastErrorMessage: string | null;
  sampleDiagnosticOutput: string | null;

  saveApiKey: (key: string) => void;
  clearApiKey: () => void;
  updateModel: (model: string) => void;
  updateProvider: (provider: AIProvider) => void;
  updateTemperature: (temp: number) => void;
  setFallbackToRuleEngine: (fallback: boolean) => void;
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
};

const AIConfigContext = createContext<AIConfigContextType | undefined>(undefined);

export function AIConfigProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || (import.meta.env?.VITE_GEMINI_API_KEY ?? '');
  });

  const [provider, setProvider] = useState<AIProvider>(() => {
    return (localStorage.getItem(STORAGE_KEYS.PROVIDER) as AIProvider) || 'gemini';
  });

  const [model, setModel] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.MODEL) || 'gemini-2.5-flash';
  });

  const [temperature, setTemperature] = useState<number>(() => {
    const val = localStorage.getItem(STORAGE_KEYS.TEMP);
    return val ? parseFloat(val) : 0.2;
  });

  const [fallbackToRuleEngine, setFallback] = useState<boolean>(() => {
    const val = localStorage.getItem(STORAGE_KEYS.FALLBACK);
    return val ? val === 'true' : true;
  });

  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'testing' | 'connected' | 'error'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATUS);
    return (saved as any) || (apiKey ? 'untested' : 'untested');
  });

  const [connectionLatencyMs, setConnectionLatencyMs] = useState<number | null>(null);
  const [lastTestedAt, setLastTestedAt] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.LAST_TESTED);
  });
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);
  const [sampleDiagnosticOutput, setSampleDiagnosticOutput] = useState<string | null>(null);

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
  };

  const updateTemperature = (temp: number) => {
    setTemperature(temp);
    localStorage.setItem(STORAGE_KEYS.TEMP, temp.toString());
  };

  const setFallbackToRuleEngine = (fallback: boolean) => {
    setFallback(fallback);
    localStorage.setItem(STORAGE_KEYS.FALLBACK, fallback.toString());
  };

  const testConnection = async (customKey?: string): Promise<TestResult> => {
    const keyToUse = (customKey !== undefined ? customKey : apiKey).trim();

    if (!keyToUse) {
      const err = 'No API key provided. Please paste your Google Gemini API key.';
      setConnectionStatus('error');
      setLastErrorMessage(err);
      return { success: false, error: err };
    }

    setConnectionStatus('testing');
    setLastErrorMessage(null);

    const startTime = performance.now();

    try {
      // Test against Gemini API v1beta endpoint
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToUse}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: 'Act as Vizogramm CS Diagnostic Engine. In 20 words or fewer, confirm API connection status.',
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 50,
              temperature: 0.1,
            },
          }),
        }
      );

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData?.error?.message ||
          `HTTP ${response.status}: Failed to authenticate with Gemini API. Please verify key validity.`;

        setConnectionStatus('error');
        setLastErrorMessage(message);
        localStorage.setItem(STORAGE_KEYS.STATUS, 'error');
        return { success: false, latencyMs: latency, error: message };
      }

      const data = await response.json();
      const outputText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Connection validated. Vizogramm AI diagnostic link operational.';

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
      const msg = err.message || 'Network error communicating with Google Generative Language API.';

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
        connectionStatus,
        connectionLatencyMs,
        lastTestedAt,
        lastErrorMessage,
        sampleDiagnosticOutput,
        saveApiKey,
        clearApiKey,
        updateModel,
        updateProvider,
        updateTemperature,
        setFallbackToRuleEngine,
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
