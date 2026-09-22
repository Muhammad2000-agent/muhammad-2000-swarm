import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'cyber-emerald' | 'deep-cosmos' | 'titanium-cyan' | 'amber-gold';
export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  nameUrdu: string;
  primaryColor: string;
  accentColor: string;
  bgClass: string;
  cardBgClass: string;
  borderClass: string;
  badgeClass: string;
  activeTabClass: string;
  buttonGradient: string;
  glowColor: string;
  ringClass: string;
}

export const THEMES: Record<AppTheme, ThemeConfig> = {
  'cyber-emerald': {
    id: 'cyber-emerald',
    name: 'Cyber Emerald',
    nameUrdu: 'سائبر ایمرلڈ (سبز)',
    primaryColor: '#10b981',
    accentColor: '#34d399',
    bgClass: 'bg-[#030712]',
    cardBgClass: 'bg-slate-900/80',
    borderClass: 'border-emerald-500/30',
    badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    activeTabClass: 'bg-emerald-600 text-white shadow-emerald-600/30 shadow-md',
    buttonGradient: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/25',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    ringClass: 'focus:ring-emerald-500 focus:border-emerald-500',
  },
  'deep-cosmos': {
    id: 'deep-cosmos',
    name: 'Deep Cosmos',
    nameUrdu: 'ڈیپ کوسموس (بنفشی)',
    primaryColor: '#8b5cf6',
    accentColor: '#a855f7',
    bgClass: 'bg-[#09090b]',
    cardBgClass: 'bg-slate-900/80',
    borderClass: 'border-indigo-500/30',
    badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    activeTabClass: 'bg-indigo-600 text-white shadow-indigo-600/30 shadow-md',
    buttonGradient: 'from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/25',
    glowColor: 'rgba(139, 92, 246, 0.25)',
    ringClass: 'focus:ring-indigo-500 focus:border-indigo-500',
  },
  'titanium-cyan': {
    id: 'titanium-cyan',
    name: 'Titanium Cyan',
    nameUrdu: 'ٹائٹینیم سائین (نیلا)',
    primaryColor: '#06b6d4',
    accentColor: '#38bdf8',
    bgClass: 'bg-[#080d1a]',
    cardBgClass: 'bg-slate-900/80',
    borderClass: 'border-cyan-500/30',
    badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    activeTabClass: 'bg-cyan-600 text-white shadow-cyan-600/30 shadow-md',
    buttonGradient: 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/25',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    ringClass: 'focus:ring-cyan-500 focus:border-cyan-500',
  },
  'amber-gold': {
    id: 'amber-gold',
    name: 'Amber Nexus',
    nameUrdu: 'امبر گولڈ (سنہرا)',
    primaryColor: '#f59e0b',
    accentColor: '#fbbf24',
    bgClass: 'bg-[#0c0a09]',
    cardBgClass: 'bg-stone-900/80',
    borderClass: 'border-amber-500/30',
    badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    activeTabClass: 'bg-amber-600 text-white shadow-amber-600/30 shadow-md',
    buttonGradient: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/25',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    ringClass: 'focus:ring-amber-500 focus:border-amber-500',
  },
};

const THEME_STORAGE_KEY = 'muhammad_ai_theme_v2';
const MODE_STORAGE_KEY = 'muhammad_ai_mode_v2';

export interface ThemeContextType {
  currentTheme: AppTheme;
  themeConfig: ThemeConfig;
  setTheme: (theme: AppTheme) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'cyber-emerald',
  themeConfig: THEMES['cyber-emerald'],
  setTheme: () => {},
  mode: 'dark',
  setMode: () => {},
  toggleMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    if (typeof window === 'undefined') return 'cyber-emerald';
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme;
      if (saved && THEMES[saved]) return saved;
    } catch {
      // Ignore
    }
    return 'cyber-emerald';
  });

  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const saved = localStorage.getItem(MODE_STORAGE_KEY) as ThemeMode;
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // Ignore
    }
    return 'dark';
  });

  const handleSetTheme = (theme: AppTheme) => {
    setCurrentTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore
    }
  };

  const handleSetMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(MODE_STORAGE_KEY, newMode);
    } catch {
      // Ignore
    }
  };

  const handleToggleMode = () => {
    setModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(MODE_STORAGE_KEY, next);
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const baseConfig = THEMES[currentTheme] || THEMES['cyber-emerald'];
  const themeConfig: ThemeConfig = mode === 'light'
    ? {
        ...baseConfig,
        bgClass: 'bg-slate-50',
        cardBgClass: 'bg-white',
      }
    : baseConfig;

  useEffect(() => {
    // Update data-theme and data-mode on root for CSS targeting
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-mode', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme, mode]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeConfig,
        setTheme: handleSetTheme,
        mode,
        setMode: handleSetMode,
        toggleMode: handleToggleMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
