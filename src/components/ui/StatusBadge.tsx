import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Clock,
  Sparkles,
  BookmarkCheck,
} from 'lucide-react';
import { tokens, CompetencyLevel } from '../../theme/tokens';

export type StatusVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'purple'
  | 'orange';

export interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({
  label,
  variant = 'neutral',
  icon,
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  const variantStyles: Record<StatusVariant, { bg: string; text: string; border: string; defaultIcon: React.ReactNode }> = {
    success: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-300',
      border: 'border-emerald-500/30',
      defaultIcon: <CheckCircle2 className="w-3 h-3 text-emerald-400" aria-hidden="true" />,
    },
    warning: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-300',
      border: 'border-amber-500/30',
      defaultIcon: <AlertTriangle className="w-3 h-3 text-amber-400" aria-hidden="true" />,
    },
    error: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-300',
      border: 'border-rose-500/30',
      defaultIcon: <AlertOctagon className="w-3 h-3 text-rose-400" aria-hidden="true" />,
    },
    info: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-300',
      border: 'border-sky-500/30',
      defaultIcon: <Info className="w-3 h-3 text-sky-400" aria-hidden="true" />,
    },
    neutral: {
      bg: 'bg-[#191E2E]',
      text: 'text-[#94A3B8]',
      border: 'border-[#2B344D]',
      defaultIcon: <Clock className="w-3 h-3 text-[#94A3B8]" aria-hidden="true" />,
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-300',
      border: 'border-purple-500/30',
      defaultIcon: <Sparkles className="w-3 h-3 text-purple-400" aria-hidden="true" />,
    },
    orange: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-300',
      border: 'border-orange-500/30',
      defaultIcon: <BookmarkCheck className="w-3 h-3 text-orange-400" aria-hidden="true" />,
    },
  };

  const style = variantStyles[variant];
  const sizeStyles = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${style.bg} ${style.text} ${style.border} ${sizeStyles} select-none ${className}`}
    >
      <span className="shrink-0">{icon || style.defaultIcon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}

export interface CompetencyBadgeProps {
  level: CompetencyLevel;
  showLevelTag?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function CompetencyBadge({
  level,
  showLevelTag = true,
  size = 'md',
  className = '',
}: CompetencyBadgeProps) {
  const conf = tokens.colors.competency[level];
  const sizeStyles = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border select-none ${sizeStyles} ${className}`}
      style={{
        backgroundColor: conf.bg,
        color: conf.light,
        borderColor: `${conf.color}50`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: conf.color }}
        aria-hidden="true"
      />
      {showLevelTag && (
        <span className="font-mono text-[10px] opacity-75 font-semibold">
          {conf.short}
        </span>
      )}
      <span className="whitespace-nowrap">{conf.level}</span>
    </span>
  );
}
