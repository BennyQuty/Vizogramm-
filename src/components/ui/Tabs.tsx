import React, { useRef } from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md',
}: TabsProps<T>) {
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let targetIndex = -1;
    if (e.key === 'ArrowRight') {
      targetIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      targetIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      targetIndex = 0;
    } else if (e.key === 'End') {
      targetIndex = tabs.length - 1;
    }

    if (targetIndex !== -1) {
      e.preventDefault();
      onChange(tabs[targetIndex].id);
      const buttons = tabListRef.current?.querySelectorAll('button');
      buttons?.[targetIndex]?.focus();
    }
  };

  const sizeStyles = {
    sm: 'p-1 gap-1 text-xs',
    md: 'p-1.5 gap-1.5 text-sm',
  };

  const btnPadding = {
    sm: 'px-2.5 py-1',
    md: 'px-3.5 py-1.5',
  };

  return (
    <div
      ref={tabListRef}
      role="tablist"
      className={`inline-flex items-center bg-[#121520] border border-[#2B344D] rounded-lg select-none ${sizeStyles[size]} ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`inline-flex items-center gap-2 rounded-md font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
              btnPadding[size]
            } ${
              isActive
                ? 'bg-[#1E2538] text-[#F8FAFC] shadow-sm border border-[#3A4565]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#161B29] border border-transparent'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono tabular-nums ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-[#2B344D] text-[#94A3B8]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
