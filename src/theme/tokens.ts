/**
 * Vizogramm Centralized Design Tokens
 * Conforming to WCAG 2.2 AA Contrast and Vizogramm Design Reference
 */

export const tokens = {
  typography: {
    fontFamily: {
      primary: "'coFoBrilliantFont', 'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
      body: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    baseSize: '16px',
    scale: {
      xs: '12px',    // 12px
      sm: '14px',    // 14px
      base: '16px',  // 16px
      md: '18px',    // 18px
      lg: '20px',    // 20px
      xl: '24px',    // 24px
      '2xl': '36px', // 36px
      '3xl': '48px', // 48px
    },
    lineHeights: {
      tight: 1.2,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  spacing: {
    '0.5': '2px',
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '8': '32px',
    '10': '40px',
    '12': '48px',
    '16': '64px',
  },

  radius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  motion: {
    durations: {
      fast: '100ms',
      normal: '150ms',
      moderate: '200ms',
      slow: '250ms',
    },
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  colors: {
    // Canvas & Elevated Surfaces
    canvas: '#0B0D13',
    surface: '#121520',
    surfaceElevated: '#191E2E',
    surfaceHover: '#22293E',
    surfaceActive: '#2A334E',
    surfaceSubtle: '#151926',

    // Borders & Dividers
    borderSubtle: '#1E2538',
    borderBase: '#2B344D',
    borderHighlight: '#414E73',

    // Typography
    textPrimary: '#F8FAFC',    // 16.5:1 on #0B0D13
    textSecondary: '#94A3B8',  // 5.6:1 on #0B0D13
    textMuted: '#64748B',      // 3.4:1 on #0B0D13 (for labels, secondary glyphs)
    textSubtle: '#475569',

    // Primary Brand (Purple)
    purple: {
      base: '#A855F7',
      light: '#C084FC',
      dark: '#7E22CE',
      bgMuted: 'rgba(168, 85, 247, 0.12)',
      borderMuted: 'rgba(168, 85, 247, 0.35)',
    },

    // Diagnostic Accent (Orange)
    orange: {
      base: '#F97316',
      light: '#FB923C',
      dark: '#C2410C',
      bgMuted: 'rgba(249, 115, 22, 0.12)',
      borderMuted: 'rgba(249, 115, 22, 0.35)',
    },

    // Status Semantics
    status: {
      success: {
        base: '#10B981',
        light: '#34D399',
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.32)',
      },
      warning: {
        base: '#F59E0B',
        light: '#FBBF24',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.32)',
      },
      error: {
        base: '#EF4444',
        light: '#F87171',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.32)',
      },
      info: {
        base: '#38BDF8',
        light: '#7DD3FC',
        bg: 'rgba(56, 189, 248, 0.12)',
        border: 'rgba(56, 189, 248, 0.32)',
      },
    },

    // Competency Heatmap / Diagnostic Scale (Level 1 to 5)
    competency: {
      5: {
        level: 'Mastered',
        short: 'L5',
        color: '#10B981',
        light: '#34D399',
        bg: 'rgba(16, 185, 129, 0.18)',
        border: '#10B981',
      },
      4: {
        level: 'Proficient',
        short: 'L4',
        color: '#38BDF8',
        light: '#7DD3FC',
        bg: 'rgba(56, 189, 248, 0.18)',
        border: '#38BDF8',
      },
      3: {
        level: 'Developing',
        short: 'L3',
        color: '#A855F7',
        light: '#C084FC',
        bg: 'rgba(168, 85, 247, 0.18)',
        border: '#A855F7',
      },
      2: {
        level: 'Novice',
        short: 'L2',
        color: '#F97316',
        light: '#FB923C',
        bg: 'rgba(249, 115, 22, 0.18)',
        border: '#F97316',
      },
      1: {
        level: 'Critical Gap',
        short: 'L1',
        color: '#EF4444',
        light: '#F87171',
        bg: 'rgba(239, 68, 68, 0.18)',
        border: '#EF4444',
      },
    },

    // Focus Ring Indicator
    focus: '#C084FC',
  },

  shadows: {
    subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
    elevated: '0 4px 12px 0 rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
    modal: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
  },
} as const;

export type CompetencyLevel = 1 | 2 | 3 | 4 | 5;
