// VIMAIZ Design System
// Tokens de design pour une cohérence visuelle complète

export const colors = {
  // Couleurs principales
  primary: {
    50: '#f0f2ff',
    100: '#e0e5ff',
    200: '#c7d0ff',
    300: '#a5b0ff',
    400: '#8087ff',
    500: '#5f5fff',
    600: '#111a5b', // Couleur principale VIMAIZ
    700: '#0d1447',
    800: '#0a0f33',
    900: '#060a1f',
  },
  
  // Couleurs secondaires (cyan/turquoise)
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  
  // États
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Neutres
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
} as const;

export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  '5xl': ['3rem', { lineHeight: '1' }],           // 48px
  '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
} as const;

export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const;

export const transition = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Variantes de composants
export const buttonVariants = {
  primary: {
    bg: colors.primary[600],
    hoverBg: colors.primary[700],
    text: 'white',
    border: 'transparent',
  },
  secondary: {
    bg: colors.secondary[500],
    hoverBg: colors.secondary[600],
    text: 'white',
    border: 'transparent',
  },
  outline: {
    bg: 'transparent',
    hoverBg: colors.neutral[50],
    text: colors.primary[600],
    border: colors.primary[600],
  },
  ghost: {
    bg: 'transparent',
    hoverBg: colors.neutral[100],
    text: colors.neutral[700],
    border: 'transparent',
  },
  danger: {
    bg: colors.danger[600],
    hoverBg: colors.danger[700],
    text: 'white',
    border: 'transparent',
  },
} as const;

export const badgeVariants = {
  default: {
    bg: colors.neutral[100],
    text: colors.neutral[800],
  },
  primary: {
    bg: colors.primary[100],
    text: colors.primary[800],
  },
  success: {
    bg: colors.success[100],
    text: colors.success[800],
  },
  warning: {
    bg: colors.warning[100],
    text: colors.warning[800],
  },
  danger: {
    bg: colors.danger[100],
    text: colors.danger[800],
  },
} as const;

// Statuts de réservation
export const bookingStatusColors = {
  pending: {
    bg: colors.warning[100],
    text: colors.warning[800],
    border: colors.warning[300],
  },
  confirmed: {
    bg: colors.secondary[100],
    text: colors.secondary[800],
    border: colors.secondary[300],
  },
  in_progress: {
    bg: colors.primary[100],
    text: colors.primary[800],
    border: colors.primary[300],
  },
  completed: {
    bg: colors.success[100],
    text: colors.success[800],
    border: colors.success[300],
  },
  cancelled: {
    bg: colors.neutral[100],
    text: colors.neutral[800],
    border: colors.neutral[300],
  },
} as const;

export type BookingStatus = keyof typeof bookingStatusColors;

// Helper functions
export const getStatusColor = (status: BookingStatus) => {
  return bookingStatusColors[status] || bookingStatusColors.pending;
};

export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};
