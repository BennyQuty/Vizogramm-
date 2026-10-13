import React from 'react';
import { tokens, CompetencyLevel } from '../../theme/tokens';

export interface HeatmapCellProps {
  level: CompetencyLevel;
  label?: string;
  subLabel?: string;
  tooltipText?: string;
  onClick?: () => void;
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HeatmapCell({
  level,
  label,
  subLabel,
  tooltipText,
  onClick,
  isSelected = false,
  size = 'md',
  className = '',
}: HeatmapCellProps) {
  const conf = tokens.colors.competency[level];

  const sizeStyles = {
    sm: 'h-8 px-2 text-[11px]',
    md: 'h-10 px-3 text-xs',
    lg: 'h-12 px-4 text-sm',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltipText || `${conf.level} (Level ${level})`}
      aria-label={`${label || ''} Competency: ${conf.level}`}
      className={`relative inline-flex items-center justify-between rounded-md border font-medium transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
        sizeStyles[size]
      } ${
        isSelected
          ? 'ring-2 ring-purple-400 shadow-md scale-[1.02]'
          : 'hover:brightness-110 active:scale-[0.98]'
      } ${className}`}
      style={{
        backgroundColor: conf.bg,
        borderColor: `${conf.color}60`,
        color: conf.light,
      }}
    >
      <div className="flex items-center gap-1.5 truncate">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: conf.color }}
          aria-hidden="true"
        />
        {label && <span className="truncate text-left">{label}</span>}
      </div>
      <div className="flex items-center gap-1 ml-2 shrink-0">
        <span className="font-mono text-[10px] font-semibold opacity-85">
          {conf.short}
        </span>
        {subLabel && (
          <span className="text-[10px] text-[#94A3B8] font-mono tabular-nums">
            {subLabel}
          </span>
        )}
      </div>
    </button>
  );
}

export function DiagnosticDistributionBar({
  counts,
  total,
}: {
  counts: Record<CompetencyLevel, number>;
  total: number;
}) {
  const levels: CompetencyLevel[] = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex h-3 w-full rounded-md overflow-hidden bg-[#191E2E] border border-[#2B344D]">
        {levels.map((lvl) => {
          const count = counts[lvl] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          if (pct === 0) return null;
          const conf = tokens.colors.competency[lvl];
          return (
            <div
              key={lvl}
              title={`${conf.level}: ${count} students (${Math.round(pct)}%)`}
              style={{
                width: `${pct}%`,
                backgroundColor: conf.color,
              }}
              className="h-full transition-all duration-300 first:rounded-l-sm last:rounded-r-sm hover:opacity-90"
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[11px] text-[#94A3B8] px-0.5">
        <div className="flex items-center gap-1 text-emerald-400 font-mono">
          <span>● L5: {counts[5] || 0}</span>
        </div>
        <div className="flex items-center gap-1 text-sky-400 font-mono">
          <span>● L4: {counts[4] || 0}</span>
        </div>
        <div className="flex items-center gap-1 text-purple-400 font-mono">
          <span>● L3: {counts[3] || 0}</span>
        </div>
        <div className="flex items-center gap-1 text-orange-400 font-mono">
          <span>● L2: {counts[2] || 0}</span>
        </div>
        <div className="flex items-center gap-1 text-rose-400 font-mono">
          <span>● L1: {counts[1] || 0}</span>
        </div>
      </div>
    </div>
  );
}
