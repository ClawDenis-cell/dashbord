import { create } from 'zustand';

export type ThemeName = 'dark' | 'light' | 'midnight' | 'sunset' | 'forest' | 'ocean';

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  border: string;
  glass: string;
  glassBorder: string;
}

export const THEMES: Record<ThemeName, ThemeColors> = {
  dark: {
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    bgTertiary: '#334155',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
    border: '#334155',
    glass: 'rgba(30, 41, 59, 0.7)',
    glassBorder: 'rgba(148, 163, 184, 0.1)',
  },
  light: {
    bgPrimary: '#f8fafc',
    bgSecondary: '#ffffff',
    bgTertiary: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    accent: '#7c3aed',
    accentHover: '#6d28d9',
    border: '#e2e8f0',
    glass: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(0, 0, 0, 0.05)',
  },
  midnight: {
    bgPrimary: '#0a0e27',
    bgSecondary: '#131842',
    bgTertiary: '#1e2458',
    textPrimary: '#e2e8f0',
    textSecondary: '#7c83a8',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    border: '#1e2458',
    glass: 'rgba(19, 24, 66, 0.7)',
    glassBorder: 'rgba(99, 102, 241, 0.1)',
  },
  sunset: {
    bgPrimary: '#1a0f0a',
    bgSecondary: '#2d1810',
    bgTertiary: '#44261a',
    textPrimary: '#fde8d8',
    textSecondary: '#c4917a',
    accent: '#f97316',
    accentHover: '#ea580c',
    border: '#44261a',
    glass: 'rgba(45, 24, 16, 0.7)',
    glassBorder: 'rgba(249, 115, 22, 0.1)',
  },
  forest: {
    bgPrimary: '#0a1a0f',
    bgSecondary: '#122118',
    bgTertiary: '#1d3326',
    textPrimary: '#d8f0e0',
    textSecondary: '#7aab8c',
    accent: '#22c55e',
    accentHover: '#16a34a',
    border: '#1d3326',
    glass: 'rgba(18, 33, 24, 0.7)',
    glassBorder: 'rgba(34, 197, 94, 0.1)',
  },
  ocean: {
    bgPrimary: '#0a1520',
    bgSecondary: '#0f2133',
    bgTertiary: '#163049',
    textPrimary: '#d8eef8',
    textSecondary: '#6ba3c7',
    accent: '#06b6d4',
    accentHover: '#0891b2',
    border: '#163049',
    glass: 'rgba(15, 33, 51, 0.7)',
    glassBorder: 'rgba(6, 182, 212, 0.1)',
  },
};

function applyTheme(theme: ThemeName) {
  const colors = THEMES[theme];
  const root = document.documentElement;
  root.style.setProperty('--color-bg-primary', colors.bgPrimary);
  root.style.setProperty('--color-bg-secondary', colors.bgSecondary);
  root.style.setProperty('--color-bg-tertiary', colors.bgTertiary);
  root.style.setProperty('--color-text-primary', colors.textPrimary);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-hover', colors.accentHover);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-glass', colors.glass);
  root.style.setProperty('--color-glass-border', colors.glassBorder);

  // Remove all theme classes, add current
  root.classList.remove('light', 'dark', 'midnight', 'sunset', 'forest', 'ocean');
  root.classList.add(theme);
}

interface ThemeState {
  theme: ThemeName;
  isDark: boolean;
  setTheme: (theme: ThemeName) => void;
  toggle: () => void;
}

const getStoredTheme = (): ThemeName => {
  const stored = localStorage.getItem('theme');
  if (stored && stored in THEMES) return stored as ThemeName;
  return 'dark';
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = getStoredTheme();
  // Apply on init
  setTimeout(() => applyTheme(initial), 0);

  return {
    theme: initial,
    isDark: initial !== 'light',

    setTheme: (theme: ThemeName) => {
      localStorage.setItem('theme', theme);
      applyTheme(theme);
      set({ theme, isDark: theme !== 'light' });
    },

    toggle: () => {
      const current = get().theme;
      const next = current === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      applyTheme(next);
      set({ theme: next, isDark: next !== 'light' });
    },
  };
});
