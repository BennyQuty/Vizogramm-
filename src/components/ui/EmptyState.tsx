import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-xl border border-dashed border-[#2B344D] bg-[#121520]/60 ${className}`}
    >
      <div className="p-3 bg-[#191E2E] border border-[#2B344D] rounded-xl text-[#A855F7] mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-[#F8FAFC] tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#94A3B8] max-w-sm leading-relaxed mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
