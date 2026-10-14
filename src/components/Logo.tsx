import React from 'react';
import vizogrammLogo from '@/asset/vizogramm-logo.png';
import vizogrammTypography from '@/asset/vizogramm-typography.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const iconSize = size === 'sm' ? 32 : size === 'lg' ? 56 : 40;
  const typographyHeight = size === 'sm' ? 16 : size === 'lg' ? 28 : 20;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Vizogramm Logo */}
      <img
        src={vizogrammLogo}
        alt="Vizogramm Logo"
        style={{ width: iconSize, height: iconSize }}
        className="object-contain"
        draggable={false}
      />

      {showText && (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <img
              src={vizogrammTypography}
              alt="Vizogramm"
              style={{ height: typographyHeight }}
              className="object-contain"
              draggable={false}
            />
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#9d62ff]/20 text-[#caa3ff] border border-[#9d62ff]/30">
              EDU
            </span>
          </div>
          <span className="text-[11px] text-[#94a3b8] tracking-tight font-medium">
            Computing Readiness Diagnostic
          </span>
        </div>
      )}
    </div>
  );
};
