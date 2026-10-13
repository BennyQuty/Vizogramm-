export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  variant?: 'purple' | 'orange' | 'emerald' | 'dynamic';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
  variant = 'purple',
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getDynamicColor = (pct: number) => {
    if (pct >= 85) return 'bg-[#10B981]';
    if (pct >= 70) return 'bg-[#38BDF8]';
    if (pct >= 55) return 'bg-[#A855F7]';
    if (pct >= 40) return 'bg-[#F97316]';
    return 'bg-[#EF4444]';
  };

  const colorStyles = {
    purple: 'bg-[#A855F7]',
    orange: 'bg-[#F97316]',
    emerald: 'bg-[#10B981]',
    dynamic: getDynamicColor(percentage),
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs text-[#94A3B8]">
          {label && <span className="font-medium text-[#F8FAFC]">{label}</span>}
          {showPercent && (
            <span className="font-mono tabular-nums text-xs ml-auto">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
        className={`w-full bg-[#191E2E] border border-[#2B344D] rounded-full overflow-hidden ${heightStyles[size]}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${colorStyles[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-[#191E2E] rounded-md ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[#121520] border border-[#2B344D] rounded-xl p-5 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-3 w-3/4" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export function SkeletonTableRows({ rows = 4 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="border-b border-[#1E2538]">
          <td className="p-4">
            <Skeleton className="h-4 w-32" />
          </td>
          <td className="p-4">
            <Skeleton className="h-4 w-24" />
          </td>
          <td className="p-4">
            <Skeleton className="h-4 w-16" />
          </td>
          <td className="p-4 text-right">
            <Skeleton className="h-7 w-20 ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}
