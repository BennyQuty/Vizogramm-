import React, { useState } from 'react';
import { useAIConfig, PROVIDER_CONFIGS, AIProvider } from '../../context/AIConfigContext';
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
  Globe,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';

// ── Provider Visual Tokens ─────────────────────────────────────────

const PROVIDER_STYLES: Record<
  AIProvider,
  {
    badgeClass: string;
    selectedBg: string;
    selectedBorder: string;
    selectedShadow: string;
    dotBg: string;
    dotBorder: string;
    accentText: string;
    tagBg: string;
    tagBorder: string;
    tagText: string;
    glowClass: string;
  }
> = {
  gemini: {
    badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    selectedBg: 'bg-sky-950/30',
    selectedBorder: 'border-sky-500',
    selectedShadow: 'shadow-sky-900/20',
    dotBg: 'bg-sky-500',
    dotBorder: 'border-sky-400',
    accentText: 'text-sky-400',
    tagBg: 'bg-sky-500/10',
    tagBorder: 'border-sky-500/20',
    tagText: 'text-sky-300',
    glowClass: 'shadow-sky-500/10',
  },
  openai: {
    badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    selectedBg: 'bg-emerald-950/30',
    selectedBorder: 'border-emerald-500',
    selectedShadow: 'shadow-emerald-900/20',
    dotBg: 'bg-emerald-500',
    dotBorder: 'border-emerald-400',
    accentText: 'text-emerald-400',
    tagBg: 'bg-emerald-500/10',
    tagBorder: 'border-emerald-500/20',
    tagText: 'text-emerald-300',
    glowClass: 'shadow-emerald-500/10',
  },
  anthropic: {
    badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    selectedBg: 'bg-amber-950/30',
    selectedBorder: 'border-amber-500',
    selectedShadow: 'shadow-amber-900/20',
    dotBg: 'bg-amber-500',
    dotBorder: 'border-amber-400',
    accentText: 'text-amber-400',
    tagBg: 'bg-amber-500/10',
    tagBorder: 'border-amber-500/20',
    tagText: 'text-amber-300',
    glowClass: 'shadow-amber-500/10',
  },
  custom: {
    badgeClass: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
    selectedBg: 'bg-violet-950/30',
    selectedBorder: 'border-violet-500',
    selectedShadow: 'shadow-violet-900/20',
    dotBg: 'bg-violet-500',
    dotBorder: 'border-violet-400',
    accentText: 'text-violet-400',
    tagBg: 'bg-violet-500/10',
    tagBorder: 'border-violet-500/20',
    tagText: 'text-violet-300',
    glowClass: 'shadow-violet-500/10',
  },
};

// ── Main Component ─────────────────────────────────────────────────

export function AdminAiConfigPage() {
  const {
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
  } = useAIConfig();

  const { notify } = useNotification();
  const { navigate } = useRouter();

  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  const style = PROVIDER_STYLES[provider];

  // Sync if apiKey changes externally
  React.useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  // Reset test state on provider change
  React.useEffect(() => {
    setTestSuccessMessage(null);
  }, [provider]);

  const handleSave = () => {
    if (!inputKey.trim()) {
      notify({
        type: 'warning',
        title: 'Empty API Key',
        message: `Please paste a valid ${providerConfig.keyLabel} before saving.`,
      });
      return;
    }

    saveApiKey(inputKey);
    notify({
      type: 'success',
      title: 'API Key Saved',
      message: `${providerConfig.name} key securely persisted in client configuration.`,
    });
  };

  const handleClear = () => {
    clearApiKey();
    setInputKey('');
    setTestSuccessMessage(null);
    notify({
      type: 'info',
      title: 'API Key Purged',
      message: `Client-side ${providerConfig.name} credentials cleared. Vizogramm will use deterministic rule engine.`,
    });
  };

  const handleTestConnection = async () => {
    const keyToTest = inputKey.trim() || apiKey;

    if (!keyToTest) {
      notify({
        type: 'warning',
        title: 'Missing Key',
        message: `Paste your ${providerConfig.keyLabel} in the box before testing.`,
      });
      return;
    }

    setIsTesting(true);
    setTestSuccessMessage(null);

    const result = await testConnection(keyToTest);
    setIsTesting(false);

    if (result.success) {
      saveApiKey(keyToTest);
      setTestSuccessMessage(
        `Connected to ${providerConfig.name} (${result.latencyMs}ms roundtrip latency). Structured diagnostic pipeline validated.`
      );
      notify({
        type: 'success',
        title: `${providerConfig.name} Connection Verified`,
        message: `Latency: ${result.latencyMs}ms. ${providerConfig.name} API is active and ready for student diagnostics.`,
      });
    } else {
      notify({
        type: 'error',
        title: 'Connection Test Failed',
        message: result.error || `Could not authenticate with ${providerConfig.name} endpoint.`,
      });
    }
  };

  const maskedKeyPreview = apiKey
    ? `${apiKey.substring(0, 6)}••••••••••••••••••••${apiKey.substring(apiKey.length - 4)}`
    : 'No API Key Configured';

  const allProviders = Object.values(PROVIDER_CONFIGS);

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
                ? `${providerConfig.name} Connected (${connectionLatencyMs ?? 0}ms)`
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
            {providerConfig.getKeyLink && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                onClick={() => window.open(providerConfig.getKeyLink, '_blank')}
              >
                {providerConfig.getKeyLinkLabel}
              </Button>
            )}
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

      {/* ── Provider Selector Strip ───────────────────────────────── */}
      <Card className="bg-[#101524] border-[#25304E] p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#1E2740] pb-3">
          <Layers className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white">AI Provider Selection</h3>
          <span className="ml-auto text-[11px] text-[#94A3B8]">Choose your LLM backend</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allProviders.map((p) => {
            const isSelected = provider === p.id;
            const pStyle = PROVIDER_STYLES[p.id];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  updateProvider(p.id);
                  setInputKey(''); // Clear input on provider switch
                  notify({
                    type: 'info',
                    title: 'Provider Changed',
                    message: `Switched to ${p.name}. Configure your API key below.`,
                  });
                }}
                className={`relative text-left p-4 rounded-xl border transition-all cursor-pointer group overflow-hidden ${
                  isSelected
                    ? `${pStyle.selectedBg} ${pStyle.selectedBorder} shadow-md ${pStyle.selectedShadow} text-white`
                    : 'bg-[#0E121E] border-[#20283E] hover:border-[#334060] text-[#CBD5E1]'
                }`}
              >
                {/* Active indicator bar */}
                {isSelected && (
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: p.accentHex }}
                  />
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.icon}</span>
                      <span className="font-bold text-sm text-white">{p.name}</span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed line-clamp-2">
                      {p.description}
                    </p>
                  </div>

                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isSelected
                        ? `${pStyle.dotBorder} ${pStyle.dotBg} text-white`
                        : 'border-[#334060] bg-[#121626]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </span>
                </div>

                {/* Model count badge */}
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isSelected ? `${pStyle.tagBg} ${pStyle.tagBorder} ${pStyle.tagText}` : 'bg-[#1A2035] border-[#232D48] text-[#64748B]'
                  }`}>
                    {p.models.length} model{p.models.length > 1 ? 's' : ''} available
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ── Top Status & Telemetry Strip ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Engine */}
        <Card className="bg-[#101524] border-[#25304E] p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Active Engine Mode</span>
            <Server className="w-4 h-4" style={{ color: providerConfig.accentHex }} />
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2 mt-1">
            <span>{apiKey ? `${providerConfig.name} + Rules` : 'Deterministic Rule Engine'}</span>
          </div>
          <span className="text-[11px] text-[#64748B] block">
            {apiKey ? `${providerConfig.name} API active with local fallback` : 'Deterministic offline scoring only'}
          </span>
        </Card>

        {/* Selected Model */}
        <Card className="bg-[#101524] border-[#25304E] p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Diagnostic Model</span>
            <Cpu className="w-4 h-4" style={{ color: providerConfig.accentHex }} />
          </div>
          <div className="text-lg font-bold font-mono mt-1" style={{ color: providerConfig.accentHex }}>
            {provider === 'custom' && customModelId ? customModelId : model}
          </div>
          <span className="text-[11px] text-[#64748B] block">
            Target provider: {providerConfig.name}
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

      {/* ── API Key Configuration ─────────────────────────────────── */}
      <Card className="bg-[#101524] border-[#25304E] p-6 space-y-6">
        <div className="space-y-1 border-b border-[#1E2740] pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5" style={{ color: providerConfig.accentHex }} />
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                {providerConfig.keyLabel} Vault
              </h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${style.tagBg} ${style.tagBorder} ${style.tagText}`}>
                {providerConfig.name}
              </span>
            </div>
            <span className="text-xs text-[#94A3B8] font-mono">
              WCAG & Client-Secured
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Paste your {providerConfig.keyLabel} below. This key powers real-time student cognitive diagnostic analysis,
            distinguishing careless syntax slips from fundamental mental model misconceptions.
          </p>
        </div>

        {/* Custom Endpoint URL (only for custom provider) */}
        {provider === 'custom' && (
          <div className="space-y-3 p-4 rounded-xl bg-[#0C0F1A] border border-violet-500/20">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-400" />
              <label className="text-xs font-semibold text-white">Custom Endpoint URL</label>
            </div>
            <input
              type="url"
              value={customEndpointUrl}
              onChange={(e) => setCustomEndpointUrl(e.target.value)}
              placeholder="https://your-api-server.com/v1/chat/completions"
              className="w-full bg-[#080B13] border border-[#2B3552] focus:border-violet-400 focus:ring-1 focus:ring-violet-400 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder:text-[#475569] transition-all"
            />

            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              <label className="text-xs font-semibold text-white">Custom Model ID</label>
            </div>
            <input
              type="text"
              value={customModelId}
              onChange={(e) => setCustomModelId(e.target.value)}
              placeholder="e.g. llama-3.1-70b, mistral-large, etc."
              className="w-full bg-[#080B13] border border-[#2B3552] focus:border-violet-400 focus:ring-1 focus:ring-violet-400 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder:text-[#475569] transition-all"
            />

            <p className="text-[11px] text-[#64748B] leading-relaxed">
              <Info className="w-3 h-3 text-violet-400 inline mr-1" />
              Enter an OpenAI-compatible endpoint. The model ID will be sent in the <code className="text-violet-300">model</code> field of the request body.
            </p>
          </div>
        )}

        {/* API Key Input Container */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" style={{ color: providerConfig.accentHex }} />
              <span>{providerConfig.keyLabel}:</span>
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
              placeholder={providerConfig.keyPlaceholder}
              className="w-full bg-[#080B13] border border-[#2B3552] focus:ring-1 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono text-white placeholder:text-[#475569] transition-all pr-24"
              style={{
                borderColor: inputKey ? providerConfig.accentHex + '40' : undefined,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = providerConfig.accentHex;
                e.target.style.boxShadow = `0 0 0 1px ${providerConfig.accentHex}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = inputKey ? providerConfig.accentHex + '40' : '#2B3552';
                e.target.style.boxShadow = 'none';
              }}
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
              <Info className="w-3.5 h-3.5 shrink-0" style={{ color: providerConfig.accentHex }} />
              <span>{providerConfig.keyHint}</span>
            </span>
            {providerConfig.getKeyLink && (
              <a
                href={providerConfig.getKeyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1"
                style={{ color: providerConfig.accentHex }}
              >
                <span>{providerConfig.getKeyLinkLabel}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
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
              leftIcon={<Zap className="w-4 h-4" style={{ color: providerConfig.accentHex }} />}
              isLoading={isTesting}
              onClick={handleTestConnection}
              className="text-xs"
            >
              Test Connection with {providerConfig.name}
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
              <span>{providerConfig.name} Diagnostic Pipeline Link Operational</span>
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
              <span>{providerConfig.name} Connection Test Error</span>
            </div>
            <p className="leading-relaxed">{lastErrorMessage}</p>
          </div>
        )}
      </Card>

      {/* ── Model & Reasoning Configuration ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Selection */}
        <Card className="lg:col-span-2 bg-[#101524] border-[#25304E] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#1E2740] pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5" style={{ color: providerConfig.accentHex }} />
              <h3 className="text-sm font-bold text-white">{providerConfig.name} Model Selection</h3>
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${style.tagBg} ${style.tagBorder} ${style.tagText}`}>
              {providerConfig.models.length} model{providerConfig.models.length > 1 ? 's' : ''}
            </span>
          </div>

          {provider !== 'custom' ? (
            <div className="space-y-3">
              {providerConfig.models.map((m) => {
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
                        ? `${style.selectedBg} ${style.selectedBorder} shadow-md ${style.selectedShadow} text-white`
                        : 'bg-[#0E121E] border-[#20283E] hover:border-[#334060] text-[#CBD5E1]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">{m.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                          isSelected
                            ? `${style.tagBg} ${style.tagBorder} ${style.tagText}`
                            : 'bg-[#1A2035] border-[#232D48] text-[#64748B]'
                        }`}>
                          {m.id}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">{m.description}</p>
                      <span className="text-[11px] font-medium block pt-1" style={{ color: providerConfig.accentHex }}>
                        {m.recommendedFor}
                      </span>
                    </div>

                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? `${style.dotBorder} ${style.dotBg} text-white`
                          : 'border-[#334060] bg-[#121626]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-[#0C0F1A] border border-violet-500/20 space-y-4">
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Custom provider models are configured via the endpoint URL and model ID above.
                The model ID you specify will be sent in the API request body.
              </p>
              {customModelId && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-950/30 border border-violet-500/30">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-mono text-violet-300">{customModelId}</span>
                  <span className="ml-auto text-[10px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                    Active
                  </span>
                </div>
              )}
              {!customModelId && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#141A2B] border border-[#232D48]">
                  <Info className="w-4 h-4 text-[#64748B]" />
                  <span className="text-xs text-[#64748B]">No custom model ID configured yet. Enter one in the section above.</span>
                </div>
              )}
            </div>
          )}
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
              <span className="font-mono font-bold" style={{ color: providerConfig.accentHex }}>{temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => updateTemperature(parseFloat(e.target.value))}
              className="w-full bg-[#1E2740] h-2 rounded-lg cursor-pointer"
              style={{ accentColor: providerConfig.accentHex }}
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
              If enabled, Vizogramm automatically utilizes the local diagnostic engine whenever the {providerConfig.name} API is offline or quota-limited.
            </p>
          </div>

          {/* Human Authority Reminder */}
          <div className="p-3 rounded-lg bg-[#141A2B] border border-[#232D48] text-[11px] text-[#94A3B8] space-y-1">
            <span className="font-semibold text-white block">Human Authority Architecture:</span>
            <p>
              AI outputs never dictate grades. Instructors retain final authority to approve, modify, or reject every syllabus pacing recommendation.
            </p>
          </div>

          {/* Active Configuration Summary */}
          <div className="pt-3 border-t border-[#1E2740] space-y-2">
            <span className="text-xs font-semibold text-white block">Active Configuration</span>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">Provider</span>
                <span className={`font-mono ${style.accentText}`}>{providerConfig.name}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">Model</span>
                <span className={`font-mono ${style.accentText}`}>{provider === 'custom' && customModelId ? customModelId : model}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">Temperature</span>
                <span className={`font-mono ${style.accentText}`}>{temperature}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">Key Status</span>
                <span className={`font-mono ${apiKey ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {apiKey ? 'Configured' : 'Not Set'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
