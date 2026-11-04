// GastosGo pastel palette — Filipino fintech, Monzo-inspired
// All values match the CSS variables in global.css; use these tokens in JS contexts only.
// Component files must NOT use hardcoded hex values — use Tailwind classes or these tokens.

export const colors = {
  light: {
    primary: '#F4A261',    // warm sunset orange "Handa"
    secondary: '#A8DADC',  // sea glass teal
    accent: '#E9C46A',     // golden yellow "Kayamanan"
    background: '#FFF8F0', // warm cream
    surface: '#FFECD2',    // soft peach card
    foreground: '#2D3047', // deep navy text
    destructive: '#E76F51',// coral red
    muted: '#81B29A',      // sage green
    mutedForeground: '#6B7280',
    border: '#E5D5C0',
    success: '#81B29A',
    warning: '#E9C46A',
    error: '#E76F51',
  },
  dark: {
    primary: '#F4A261',
    secondary: '#A8DADC',
    accent: '#E9C46A',
    background: '#1A1A2E',  // deep navy
    surface: '#16213E',     // dark surface
    foreground: '#E8E8E8',  // light text
    destructive: '#E76F51',
    muted: '#81B29A',
    mutedForeground: '#9CA3AF',
    border: '#2D3A5A',
    success: '#81B29A',
    warning: '#E9C46A',
    error: '#E76F51',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// Category colors — matches default seed categories
export const categoryColors = [
  '#F4A261', // orange
  '#A8DADC', // teal
  '#E9C46A', // yellow
  '#81B29A', // sage
  '#E76F51', // coral
  '#264653', // dark teal
  '#457B9D', // blue
  '#A8DADC', // sea glass
] as const;
