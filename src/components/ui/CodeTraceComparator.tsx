import React from 'react';
import { AlertTriangle, CheckCircle2, Code2, Sparkles, ArrowRight } from 'lucide-react';

export interface CodeComparisonProps {
  category: 'Careless Slip' | 'Repeated Misconception' | 'Unattempted / Possible Guess';
  flawedSnippet: string;
  canonicalSnippet: string;
  explanation: string;
  confidence?: 'High' | 'Moderate' | 'Low' | 'Insufficient Evidence';
  suggestedFollowUp?: string;
  title?: string;
}

export function CodeTraceComparator({
  category,
  flawedSnippet,
  canonicalSnippet,
  explanation,
  confidence = 'High',
  suggestedFollowUp,
  title = 'Cognitive Execution Comparison',
}: CodeComparisonProps) {
  const isMisconception = category === 'Repeated Misconception';
  const isSlip = category === 'Careless Slip';

  const formatCodeLines = (code: string) => {
    return code.split('\n').map((line, idx) => ({
      num: idx + 1,
      text: line,
    }));
  };

  const flawedLines = formatCodeLines(flawedSnippet);
  const canonicalLines = formatCodeLines(canonicalSnippet);

  return (
    <div className="rounded-xl border border-[#2B344D] bg-[#0E121D] overflow-hidden shadow-lg transition-all">
      {/* Top Header */}
      <div className="px-4 py-3 bg-[#131826] border-b border-[#20283E] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-white tracking-wide">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              isMisconception
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : isSlip
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-slate-500/10 text-slate-300 border-slate-500/30'
            }`}
          >
            {isMisconception ? (
              <AlertTriangle className="w-3 h-3 text-rose-400" />
            ) : (
              <Sparkles className="w-3 h-3 text-amber-400" />
            )}
            <span>{category}</span>
          </span>

          <span className="text-[10px] text-[#64748B] font-mono border border-[#1E2538] px-2 py-0.5 rounded bg-[#0A0D14]">
            Confidence: <strong className="text-[#94A3B8]">{confidence}</strong>
          </span>
        </div>
      </div>

      {/* Dual Pane Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#20283E]">
        {/* Left Pane: Flawed Mental Model */}
        <div className="p-3.5 space-y-2 bg-[#0B0E17]/60">
          <div className="flex items-center justify-between text-[11px] font-medium text-rose-300 pb-1 border-b border-rose-500/10">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Observed Mental Model (Student Trace)
            </span>
            <span className="text-[10px] text-rose-400/80 font-mono">Flawed logic</span>
          </div>

          <div className="font-mono text-xs rounded-lg bg-[#07090F] border border-[#1A2133] p-2.5 overflow-x-auto">
            {flawedLines.map((l) => (
              <div key={l.num} className="flex leading-relaxed hover:bg-rose-500/5 px-1 rounded">
                <span className="text-[#475569] select-none w-6 text-right pr-3 font-mono text-[11px]">
                  {l.num}
                </span>
                <span className="text-rose-200/90 whitespace-pre">{l.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Canonical Execution */}
        <div className="p-3.5 space-y-2 bg-[#0B0E17]/60">
          <div className="flex items-center justify-between text-[11px] font-medium text-emerald-300 pb-1 border-b border-emerald-500/10">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Canonical Compiler Execution (Correct)
            </span>
            <span className="text-[10px] text-emerald-400/80 font-mono">Standard model</span>
          </div>

          <div className="font-mono text-xs rounded-lg bg-[#07090F] border border-[#1A2133] p-2.5 overflow-x-auto">
            {canonicalLines.map((l) => (
              <div key={l.num} className="flex leading-relaxed hover:bg-emerald-500/5 px-1 rounded">
                <span className="text-[#475569] select-none w-6 text-right pr-3 font-mono text-[11px]">
                  {l.num}
                </span>
                <span className="text-emerald-200/90 whitespace-pre">{l.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation Footer */}
      <div className="p-3.5 bg-[#101422] border-t border-[#20283E] space-y-2 text-xs">
        <div className="flex items-start gap-2 text-[#94A3B8]">
          <span className="font-semibold text-white shrink-0">Diagnostic Why:</span>
          <p className="leading-relaxed text-[#CBD5E1]">{explanation}</p>
        </div>

        {suggestedFollowUp && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#1C2337] text-[11px] text-sky-300">
            <ArrowRight className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>
              <strong>Actionable Next Step:</strong> {suggestedFollowUp}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
