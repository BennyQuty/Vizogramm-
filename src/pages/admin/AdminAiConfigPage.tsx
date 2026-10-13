import React, { useState } from 'react';
import { useAIConfig, AVAILABLE_MODELS } from '../../context/AIConfigContext';
import { useNotification } from '../../context/NotificationContext';
import { useRouter } from '../../context/RouterContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Sliders,
  Sparkles,
  Lock,
  Cpu,
  Trash2,
  Check,
  Info,
  ExternalLink,
  Code2,
  Terminal,
} from 'lucide-react';

export function AdminAiConfigPage() {
  const {
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
  } = useAIConfig();

  const { notify } = useNotification();
  const { navigate } = useRouter();

  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  // Sync if apiKey changes externally
  React.useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    if (!inputKey.trim()) {
      notify({
        type: 'warning',
        title: 'Empty API Key',
        message: 'Please paste a valid Google Gemini API key before saving.',
      });
      return;
    }

    saveApiKey(inputKey);
    notify({
      type: 'success',
      title: 'API Key Saved',
      message: 'AI key securely persisted in client configuration.',
    });
  };

  const handleClear = () => {
    clearApiKey();
    setInputKey('');
    setTestSuccessMessage(null);
    notify({
      type: 'info',
      title: 'API Key Purged',
      message: 'Client-side API credentials cleared. Vizogramm will use deterministic rule engine.',
    });
  };

  const handleTestConnection = async () => {
    const keyToTest = inputKey.trim() || apiKey;

    if (!keyToTest) {
      notify({
        type: 'warning',
        title: 'Missing Key',
        message: 'Paste your API key in the box before testing.',
      });
      return;
    }

    setIsTesting(true);
    setTestSuccessMessage(null);

    const result = await testConnection(keyToTest);
    setIsTesting(false);

    if (result.success) {
      // Auto save on successful test
      saveApiKey(keyToTest);
      setTestSuccessMessage(
        `Connected to Google Gemini (${result.latencyMs}ms roundtrip latency). Structured diagnostic pipeline validated.`
      );
      notify({
        type: 'success',
        title: 'AI Engine Connection Verified',
        message: `Latency: ${result.latencyMs}ms. Gemini API is active and ready for student diagnostics.`,
      });
    } else {
      notify({
        type: 'error',
        title: 'Connection Test Failed',
        message: result.error || 'Could not authenticate with Gemini endpoint.',
      });
    }
  };

  const maskedKeyPreview = apiKey
    ? `${apiKey.substring(0, 6)}••••••••••••••••••••${apiKey.substring(apiKey.length - 4)}`
    : 'No API Key Configured';

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Diagnostic Engine Configuration"
        description="System Administrator panel to configure API credentials, LLM model selection, reasoning parameters, and diagnostic telemetry for Vizogramm."
        breadcrumbs={[
          { label: 'System Administrator' },
          { label: 'AI Configuration' },
        ]}
        badge={
          <StatusBadge
            label={
              connectionStatus === 'connected'
                ? `Gemini Connected (${connectionLatencyMs ?? 0}ms)`
                : apiKey
                ? 'Key Saved · Untested'
                : 'Using Local Rule Engine'
            }
            variant={
              connectionStatus === 'connected'
                ? 'success'
                : connectionStatus === 'error'
                ? 'error'
                : apiKey
                ? 'purple'
                : 'warning'
            }
            icon={
              connectionStatus === 'connected' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : connectionStatus === 'error' ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Cpu className="w-3.5 h-3.5" />
              )
            }
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
            >
              Get Gemini API Key
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Zap className="w-3.5 h-3.5" />}
              isLoading={isTesting}
              onClick={handleTestConnection}
            >
              Test AI Connection
            </Button>
          </div>
        }
      />

      {/* Top Status & Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Engine */}
        <Card className="bg-[#101524] border-[#25304E] p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Active Engine Mode</span>
            <Server className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2 mt-1">
            <span>{apiKey ? 'Multimodal LLM + Rules' : 'Deterministic Rule Engine'}</span>
          </div>
          <span className="text-[11px] text-[#64748B] block">
            {apiKey ? 'Gemini API active with local fallback' : 'Deterministic offline scoring only'}
          </span>
        </Card>

        {/* Selected Model */}
        <Card className="bg-[#101524] border-[#25304E] p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Diagnostic Model</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold font-mono text-purple-300 mt-1">
            {model}
          </div>
          <span className="text-[11px] text-[#64748B] block">
            Target provider: Google AI Studio
          </span>
        </Card>

        {/* Verification Status */}
        <Card className="bg-[#101524] border-[#25304E] p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Connection Health</span>
            {connectionStatus === 'connected' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="text-lg font-bold text-white mt-1">
            {connectionStatus === 'connected'
              ? `Operational (${connectionLatencyMs}ms)`
              : connectionStatus === 'error'
              ? 'Authentication Error'
              : 'Untested / Ready'}
          </div>
          <span className="text-[11px] text-[#64748B] block font-mono">
            {lastTestedAt ? `Last ping: ${lastTestedAt}` : 'No test performed yet'}
          </span>
        </Card>
      </div>

      {/* Main Configuration Card: Paste API Key */}
      <Card className="bg-[#101524] border-[#25304E] p-6 space-y-6">
        <div className="space-y-1 border-b border-[#1E2740] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-sky-400" />
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                Google Gemini API Key Vault
              </h2>
            </div>
            <span className="text-xs text-[#94A3B8] font-mono">
              WCAG & Client-Secured
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Paste your Google Gemini API key below. This key powers real-time student cognitive diagnostic analysis,
            distinguishing careless syntax slips from fundamental mental model misconceptions.
          </p>
        </div>

        {/* API Key Input Container */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Gemini API Key:</span>
            </label>
            {apiKey && (
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Currently Active: {maskedKeyPreview}</span>
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Paste your Gemini API key (e.g. AIzaSyB...)"
              className="w-full bg-[#080B13] border border-[#2B3552] focus:border-sky-400 focus:ring-1 focus:ring-sky-400 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder:text-[#475569] transition-all pr-24"
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E2740] transition-colors cursor-pointer"
                title={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>

              {inputKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Clear key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Key Validation Hint */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>API key starts with <code className="text-sky-300">AIzaSy...</code> and remains saved in your client environment.</span>
            </span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1"
            >
              <span>Get key from Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Action Button Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Check className="w-4 h-4" />}
              onClick={handleSave}
              className="text-xs"
            >
              Save API Key
            </Button>

            <Button
              variant="secondary"
              size="md"
              leftIcon={<Zap className="w-4 h-4 text-sky-400" />}
              isLoading={isTesting}
              onClick={handleTestConnection}
              className="text-xs"
            >
              Test Connection with Google Gemini
            </Button>

            {apiKey && (
              <Button
                variant="outline"
                size="md"
                leftIcon={<Trash2 className="w-4 h-4 text-rose-400" />}
                onClick={handleClear}
                className="text-xs text-rose-300 hover:text-rose-200 border-rose-500/30 hover:bg-rose-500/10"
              >
                Purge Key
              </Button>
            )}
          </div>
        </div>

        {/* Live Feedback Messages */}
        {testSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-emerald-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Diagnostic Pipeline Link Operational</span>
            </div>
            <p className="leading-relaxed">{testSuccessMessage}</p>
            {sampleDiagnosticOutput && (
              <div className="mt-2 p-2.5 rounded bg-black/40 border border-emerald-500/20 font-mono text-[11px] text-emerald-100">
                AI Echo: "{sampleDiagnosticOutput}"
              </div>
            )}
          </div>
        )}

        {lastErrorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 text-rose-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Connection Test Error</span>
            </div>
            <p className="leading-relaxed">{lastErrorMessage}</p>
          </div>
        )}
      </Card>

      {/* Model & Reasoning Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Selection */}
        <Card className="lg:col-span-2 bg-[#101524] border-[#25304E] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E2740] pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Diagnostic Model Selection</h3>
            </div>
            <span className="text-[11px] text-[#94A3B8]">Multimodal Reasoning</span>
          </div>

          <div className="space-y-3">
            {AVAILABLE_MODELS.map((m) => {
              const isSelected = model === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    updateModel(m.id);
                    notify({
                      type: 'info',
                      title: 'Model Updated',
                      message: `Selected ${m.name} for diagnostic synthesis.`,
                    });
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500 shadow-md shadow-purple-900/20 text-white'
                      : 'bg-[#0E121E] border-[#20283E] hover:border-[#334060] text-[#CBD5E1]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white font-mono">{m.name}</span>
                      <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-mono">
                        {m.id}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{m.description}</p>
                    <span className="text-[11px] text-sky-400 font-medium block pt-1">
                      {m.recommendedFor}
                    </span>
                  </div>

                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-purple-400 bg-purple-500 text-white'
                        : 'border-[#334060] bg-[#121626]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Parameters & Fallbacks */}
        <Card className="bg-[#101524] border-[#25304E] p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#1E2740] pb-3">
            <Sliders className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-bold text-white">Inference Controls</h3>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Diagnostic Temperature:</span>
              <span className="font-mono text-purple-300 font-bold">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => updateTemperature(parseFloat(e.target.value))}
              className="w-full accent-purple-500 bg-[#1E2740] h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Low values (0.1–0.2) ensure deterministic, mathematically rigorous scoring of code trace misconceptions.
            </p>
          </div>

          {/* Fallback rule engine toggle */}
          <div className="pt-3 border-t border-[#1E2740] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Deterministic Fallback</span>
              <button
                type="button"
                onClick={() => setFallbackToRuleEngine(!fallbackToRuleEngine)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  fallbackToRuleEngine ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    fallbackToRuleEngine ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              If enabled, Vizogramm automatically utilizes the local diagnostic engine whenever the external API is offline or quota-limited.
            </p>
          </div>

          {/* Human Authority Reminder */}
          <div className="p-3 rounded-lg bg-[#141A2B] border border-[#232D48] text-[11px] text-[#94A3B8] space-y-1">
            <span className="font-semibold text-white block">Human Authority Architecture:</span>
            <p>
              AI outputs never dictate grades. Instructors retain final authority to approve, modify, or reject every syllabus pacing recommendation.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
