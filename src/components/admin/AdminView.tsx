import React, { useState } from 'react';
import {
  AIModelConfig,
  AIPromptsConfig,
  Section,
  StudentSubmission,
  SystemStats,
} from '../../types';
import {
  DEFAULT_AI_MODEL_CONFIG,
  DEFAULT_DIAGNOSIS_PROMPT,
  DEFAULT_PACING_PROMPT,
  Storage,
} from '../../utils/storage';
import { testAiModelConnection } from '../../utils/aiClient';
import { Logo } from '../Logo';
import {
  Cpu,
  FileCode,
  Activity,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';

interface AdminViewProps {
  aiConfig: AIModelConfig;
  aiPrompts: AIPromptsConfig;
  systemStats: SystemStats;
  sectionsCount: number;
  submissionsCount: number;
  onConfigUpdated: (config: AIModelConfig) => void;
  onPromptsUpdated: (prompts: AIPromptsConfig) => void;
  onDemoReset: () => void;
  onSwitchRole: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  aiConfig,
  aiPrompts,
  systemStats,
  sectionsCount,
  submissionsCount,
  onConfigUpdated,
  onPromptsUpdated,
  onDemoReset,
  onSwitchRole,
}) => {
  const [activeTab, setActiveTab] = useState<'model' | 'prompts' | 'status' | 'reset'>('model');

  // Admin name (optional)
  const [adminName, setAdminName] = useState(
    Storage.getAdminProfile()?.fullName || ''
  );

  // AI Model Form State
  const [provider, setProvider] = useState<AIModelConfig['provider']>(aiConfig.provider || 'gemini');
  const [modelId, setModelId] = useState(aiConfig.modelId || 'gemini-2.5-flash');
  const [apiKey, setApiKey] = useState(aiConfig.apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [baseUrl, setBaseUrl] = useState(aiConfig.baseUrl || '');
  const [temperature, setTemperature] = useState(aiConfig.temperature ?? 0.1);
  const [maxTokens, setMaxTokens] = useState(aiConfig.maxTokens ?? 2048);
  const [timeoutMs, setTimeoutMs] = useState(aiConfig.timeout ?? 25000);
  const [assignedDiagnosis, setAssignedDiagnosis] = useState(aiConfig.assignedDiagnosis || 'primary');
  const [assignedPacing, setAssignedPacing] = useState(aiConfig.assignedPacing || 'primary');

  // Testing status
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    latencyMs?: number;
  } | null>(null);

  // Prompts editing state
  const [diagnosisPromptText, setDiagnosisPromptText] = useState(aiPrompts.diagnosisPrompt);
  const [pacingPromptText, setPacingPromptText] = useState(aiPrompts.pacingPrompt);
  const [promptsSavedFeedback, setPromptsSavedFeedback] = useState(false);

  // Reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Save Model Settings
  const handleSaveModelSettings = (newStatus?: 'connected' | 'not_configured' | 'error') => {
    const updated: AIModelConfig = {
      provider,
      modelId: modelId.trim() || (provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'),
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      temperature: Number(temperature),
      maxTokens: Number(maxTokens),
      timeout: Number(timeoutMs),
      status: newStatus || aiConfig.status,
      assignedDiagnosis,
      assignedPacing,
      lastTested: new Date().toISOString(),
    };

    Storage.saveAIModelConfig(updated);
    if (adminName.trim()) {
      Storage.saveAdminProfile({
        userId: 'admin_root',
        fullName: adminName.trim(),
        updatedAt: new Date().toISOString(),
      });
    }
    onConfigUpdated(updated);
  };

  // Run Test Connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const testPayload: AIModelConfig = {
      provider,
      modelId: modelId.trim() || (provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'),
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      temperature: Number(temperature),
      maxTokens: Number(maxTokens),
      timeout: Number(timeoutMs),
      status: 'not_configured',
      assignedDiagnosis,
      assignedPacing,
    };

    const result = await testAiModelConnection(testPayload);
    setIsTesting(false);
    setTestResult(result);

    if (result.success) {
      handleSaveModelSettings('connected');
    } else {
      handleSaveModelSettings('error');
    }
  };

  // Save Prompts
  const handleSavePrompts = () => {
    const updated: AIPromptsConfig = {
      ...aiPrompts,
      diagnosisPrompt: diagnosisPromptText,
      pacingPrompt: pacingPromptText,
    };
    Storage.saveAIPrompts(updated);
    onPromptsUpdated(updated);
    setPromptsSavedFeedback(true);
    setTimeout(() => setPromptsSavedFeedback(false), 2500);
  };

  const handleResetPrompts = () => {
    setDiagnosisPromptText(DEFAULT_DIAGNOSIS_PROMPT);
    setPacingPromptText(DEFAULT_PACING_PROMPT);
    const updated: AIPromptsConfig = {
      diagnosisPrompt: DEFAULT_DIAGNOSIS_PROMPT,
      diagnosisVersion: '1.2.0',
      pacingPrompt: DEFAULT_PACING_PROMPT,
      pacingVersion: '1.1.0',
    };
    Storage.saveAIPrompts(updated);
    onPromptsUpdated(updated);
  };

  // Status Badge
  const getStatusBadge = () => {
    if (aiConfig.status === 'connected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Connected
        </span>
      );
    }
    if (aiConfig.status === 'error') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-bold">
          <AlertCircle className="w-3.5 h-3.5" /> Error
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold">
        <Clock className="w-3.5 h-3.5" /> Not Configured
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Header */}
      <header className="border-b border-[#242430] bg-[#0c0c10] px-6 py-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size="sm" />
            <nav className="hidden md:flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveTab('model')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'model'
                    ? 'bg-[#1e1e2c] text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-[#9d62ff]" />
                AI Model Settings
              </button>
              <button
                onClick={() => setActiveTab('prompts')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'prompts'
                    ? 'bg-[#1e1e2c] text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-[#456dff]" />
                AI Prompts
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'status'
                    ? 'bg-[#1e1e2c] text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-[#ff8d23]" />
                System Status
              </button>
              <button
                onClick={() => setActiveTab('reset')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'reset'
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
                    : 'text-rose-400/80 hover:text-rose-300'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Demo Data
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161622] border border-[#2d2d3e]">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-xs font-semibold text-white">{adminName || 'System Administrator'}</span>
              <span className="text-[10px] text-amber-300 uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15">
                Admin
              </span>
            </div>
            <button
              onClick={onSwitchRole}
              className="btn-ghost px-3 py-1.5 rounded-xl text-xs font-semibold text-[#caa3ff] hover:text-white cursor-pointer"
            >
              Switch Role
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8">
        {/* LEAST PRIVILEGE BANNER */}
        <div className="mb-6 p-3.5 rounded-xl bg-[#14141e] border border-[#272738] text-xs text-[#94a3b8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#9d62ff] shrink-0" />
            <span>
              <strong>Least Privilege Notice:</strong> Administrators manage AI model connectivity, inference parameters, and system status. Administrators never see individual student answers, scores, categories, or diagnoses.
            </span>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {activeTab === 'model' && (
          /* ========================================================= */
          /* SCREEN A: AI MODEL SETTINGS                               */
          /* ========================================================= */
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Connect the AI model
              </h1>
              <p className="text-xs text-[#94a3b8] mt-1">
                Configure the primary generative AI provider and model endpoints that power real-time cognitive diagnostics and cohort pacing.
              </p>
            </div>

            <div className="brilliant-card rounded-2xl p-7 border border-[#2e2e3e] shadow-[0_4px_0_0_#874de5] space-y-6">
              {/* Optional Admin Name */}
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                  Administrator Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Eleanor Vance"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-sm focus:outline-none focus:border-[#9d62ff]"
                />
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-bold text-[#cbd5e1] uppercase tracking-wider mb-2">
                  Provider *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['gemini', 'openrouter', 'custom'] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => {
                        setProvider(prov);
                        if (prov === 'gemini') {
                          setModelId('gemini-2.5-flash');
                        } else if (prov === 'openrouter') {
                          setModelId('google/gemini-2.5-flash');
                          setBaseUrl('https://openrouter.ai/api/v1');
                        } else {
                          setModelId('gpt-4o-mini');
                          setBaseUrl('https://api.openai.com/v1');
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                        provider === prov
                          ? 'bg-[#9d62ff]/20 border-[#9d62ff] text-white shadow-[0_2px_0_0_#874de5]'
                          : 'bg-[#121217] border-[#292938] text-[#94a3b8] hover:border-[#38384d]'
                      }`}
                    >
                      {prov === 'gemini' ? 'Gemini' : prov === 'openrouter' ? 'OpenRouter' : 'Custom (OpenAI)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model ID */}
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                  Model ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter the exact model ID from your provider"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white font-mono text-sm focus:outline-none focus:border-[#9d62ff]"
                />
                <p className="text-[11px] text-[#64748b] mt-1">
                  Placeholder: "Enter the exact model ID from your provider" (e.g. <code>gemini-2.5-flash</code>, <code>gemini-3.8-flash</code>)
                </p>
              </div>

              {/* API Key */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider">
                    API Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-[11px] text-[#94a3b8] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showApiKey ? 'Hide' : 'Reveal'}
                  </button>
                </div>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder={provider === 'gemini' ? 'Optional if server GEMINI_API_KEY environment variable is active' : 'Paste your API key here'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white font-mono text-sm focus:outline-none focus:border-[#9d62ff]"
                />
                <div className="mt-2 p-2.5 rounded-lg bg-[#141420] border border-[#2b2b3e] text-[11px] text-[#94a3b8]">
                  <strong className="text-amber-400 block mb-0.5">Notice:</strong>
                  The API key is stored in the browser for the demo only. Production systems maintain keys server-side.
                </div>
              </div>

              {/* Base URL (Shown for OpenRouter / Custom) */}
              {(provider === 'openrouter' || provider === 'custom') && (
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                    Base URL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://api.openai.com/v1"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white font-mono text-sm focus:outline-none focus:border-[#9d62ff]"
                  />
                </div>
              )}

              {/* Temperature, Max Tokens, Timeout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Temperature</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-xs focus:outline-none focus:border-[#9d62ff]"
                  />
                  <span className="text-[10px] text-[#64748b]">Default: low (0.1)</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Max Output Tokens</label>
                  <input
                    type="number"
                    step="128"
                    min="256"
                    max="8192"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-xs focus:outline-none focus:border-[#9d62ff]"
                  />
                  <span className="text-[10px] text-[#64748b]">Default: 2048</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">Request Timeout (ms)</label>
                  <input
                    type="number"
                    step="1000"
                    min="5000"
                    max="60000"
                    value={timeoutMs}
                    onChange={(e) => setTimeoutMs(parseInt(e.target.value) || 25000)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white text-xs focus:outline-none focus:border-[#9d62ff]"
                  />
                  <span className="text-[10px] text-[#64748b]">Default: 25000ms</span>
                </div>
              </div>

              {/* Test Connection Button & Result */}
              <div className="pt-4 border-t border-[#232332] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isTesting}
                    onClick={handleTestConnection}
                    className="btn-purple px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isTesting ? 'Verifying AI API Handshake...' : 'Test connection'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveModelSettings()}
                    className="btn-ghost px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <div>
                      <div>{testResult.message || testResult.error}</div>
                      {testResult.latencyMs && (
                        <div className="text-[10px] opacity-75">
                          Latency: {testResult.latencyMs}ms
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prompts' && (
          /* ========================================================= */
          /* SCREEN B: AI PROMPTS & SCHEMAS                            */
          /* ========================================================= */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-[#456dff]" />
                  AI System Prompts & Output Schemas
                </h2>
                <p className="text-xs text-[#94a3b8] mt-1">
                  View and customize instructions. JSON output schemas are enforced by system contracts and are read-only.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetPrompts}
                  className="btn-ghost px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to default
                </button>
                <button
                  type="button"
                  onClick={handleSavePrompts}
                  className="btn-purple px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Prompts
                </button>
              </div>
            </div>

            {promptsSavedFeedback && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Prompts saved successfully.</span>
              </div>
            )}

            {/* Prompt 1: Student Diagnosis */}
            <div className="brilliant-card rounded-2xl p-6 border border-[#2e2e3e] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">1. Per-Student Diagnosis Prompt</h3>
                  <span className="text-[11px] text-[#94a3b8]">Version {aiPrompts.diagnosisVersion}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#9d62ff]/15 text-[#caa3ff] border border-[#9d62ff]/30">
                  Strict JSON Required
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  System Instruction Field (Editable)
                </label>
                <textarea
                  rows={6}
                  value={diagnosisPromptText}
                  onChange={(e) => setDiagnosisPromptText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white font-mono text-xs focus:outline-none focus:border-[#9d62ff] leading-relaxed"
                />
              </div>

              {/* Read-Only Schema */}
              <div className="p-4 rounded-xl bg-[#0d0d12] border border-[#232330]">
                <span className="text-[11px] uppercase font-bold text-[#64748b] block mb-2">
                  Enforced Output Schema (Read-Only)
                </span>
                <pre className="text-[11px] font-mono text-[#cbd5e1] overflow-x-auto whitespace-pre">
{`{
  "overall_summary": string (exactly 2 descriptive sentences, no numbers),
  "clusters": {
    "total": { "status": "mastered" | "shaky" | "absent", "cause": "careless_slip" | "misconception" | "never_learned" | "mixed", "reason": string },
    "verbal": { ... },
    "verbal_comprehension": { ... },
    "verbal_reasoning": { ... },
    "nonverbal": { ... },
    "figural_reasoning": { ... },
    "quantitative_reasoning": { ... }
  }
}`}
                </pre>
              </div>
            </div>

            {/* Prompt 2: Cohort Pacing Recommender */}
            <div className="brilliant-card rounded-2xl p-6 border border-[#2e2e3e] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">2. Cohort Pacing Recommender Prompt</h3>
                  <span className="text-[11px] text-[#94a3b8]">Version {aiPrompts.pacingVersion}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#9d62ff]/15 text-[#caa3ff] border border-[#9d62ff]/30">
                  Strict JSON Required
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  System Instruction Field (Editable)
                </label>
                <textarea
                  rows={6}
                  value={pacingPromptText}
                  onChange={(e) => setPacingPromptText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0e13] border border-[#30303e] text-white font-mono text-xs focus:outline-none focus:border-[#9d62ff] leading-relaxed"
                />
              </div>

              {/* Read-Only Schema */}
              <div className="p-4 rounded-xl bg-[#0d0d12] border border-[#232330]">
                <span className="text-[11px] uppercase font-bold text-[#64748b] block mb-2">
                  Enforced Output Schema (Read-Only)
                </span>
                <pre className="text-[11px] font-mono text-[#cbd5e1] overflow-x-auto whitespace-pre">
{`{
  "recommendations": [
    {
      "id": string (e.g. "REC-01"),
      "concept": string (computing topic name),
      "evidence": string (aggregated cohort counts),
      "suggested_action": string (instructional pacing modification),
      "rationale": string (cognitive baseline reasoning transfer hypothesis)
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          /* ========================================================= */
          /* SCREEN C: SIMPLE SYSTEM STATUS PANEL                      */
          /* ========================================================= */
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#ff8d23]" />
                System Status
              </h2>
              <p className="text-xs text-[#94a3b8] mt-1">
                Real-time metrics for AI model calls, success rate, and average latency.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="brilliant-card rounded-2xl p-6 border border-[#2b2b3a] space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748b]">AI Call Count</span>
                <div className="text-3xl font-extrabold text-white">{systemStats.aiCallsCount}</div>
                <div className="text-xs text-[#94a3b8]">Total diagnostic & pacing requests</div>
              </div>

              <div className="brilliant-card rounded-2xl p-6 border border-[#2b2b3a] space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748b]">Success Rate</span>
                <div className="text-3xl font-extrabold text-emerald-400">
                  {systemStats.aiCallsCount > 0
                    ? `${Math.round((systemStats.aiSuccessCount / systemStats.aiCallsCount) * 100)}%`
                    : '100%'}
                </div>
                <div className="text-xs text-[#94a3b8]">{systemStats.aiSuccessCount} succeeded / {systemStats.aiFailureCount} failed</div>
              </div>

              <div className="brilliant-card rounded-2xl p-6 border border-[#2b2b3a] space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748b]">Average Latency</span>
                <div className="text-3xl font-extrabold text-[#456dff]">
                  {systemStats.aiCallsCount > 0
                    ? `${Math.round(systemStats.totalLatencyMs / systemStats.aiCallsCount)}ms`
                    : '—'}
                </div>
                <div className="text-xs text-[#94a3b8]">Live AI response time</div>
              </div>
            </div>

            {/* Infrastructure Volume Overview */}
            <div className="brilliant-card rounded-2xl p-6 border border-[#2b2b3a] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#caa3ff]">
                Operational Volume Counts
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-[#121219] border border-[#232332]">
                  <span className="text-[10px] uppercase text-[#64748b] font-bold block">Sections Active</span>
                  <span className="text-lg font-bold text-white">{sectionsCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#121219] border border-[#232332]">
                  <span className="text-[10px] uppercase text-[#64748b] font-bold block">Student Submissions</span>
                  <span className="text-lg font-bold text-white">{submissionsCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reset' && (
          /* ========================================================= */
          /* SCREEN D: RESET DEMO DATA                                 */
          /* ========================================================= */
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                Reset Demo Data
              </h2>
              <p className="text-xs text-[#94a3b8] mt-1">
                Clears all demo records while keeping the System Administrator profile and AI model settings intact.
              </p>
            </div>

            <div className="brilliant-card rounded-2xl p-7 border border-rose-900/40 shadow-[0_4px_0_0_#991b1b] space-y-5">
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 text-xs text-rose-300 space-y-2">
                <strong className="text-sm font-bold block text-white">Reset Specifications:</strong>
                <ul className="list-disc list-inside space-y-1 text-[#e2e8f0]">
                  <li>Clears all student profiles, test submissions, and diagnoses.</li>
                  <li>Clears instructor sections, pacing recommendations, and decision logs.</li>
                  <li>
                    <strong className="text-emerald-400">Preserves:</strong> Your configured AI Model Settings, API keys, and custom prompts.
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-[0_4px_0_0_#991b1b]"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset Demo Data
                </button>
              </div>
            </div>

            {/* Confirmation Modal */}
            {showResetConfirm && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="brilliant-card w-full max-w-md rounded-2xl p-6 border border-rose-900 shadow-2xl">
                  <h3 className="text-base font-bold text-white mb-2">Confirm Demo Data Reset</h3>
                  <p className="text-xs text-[#94a3b8] mb-6">
                    Clear all demo students, submissions, and sections? AI model settings will remain saved.
                  </p>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 py-2 rounded-xl text-xs text-[#94a3b8] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetConfirm(false);
                        onDemoReset();
                      }}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                    >
                      Yes, Reset Demo Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
