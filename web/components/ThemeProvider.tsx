'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ThemeContextValue = { theme: Theme; setTheme: (t: Theme) => void; resolved: 'light' | 'dark' };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme | null) ?? 'system';
    setThemeState(stored);
  }, []);

  useEffect(() => {
    const apply = () => {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const next: 'light' | 'dark' =
        theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme;
      document.documentElement.classList.toggle('dark', next === 'dark');
      setResolved(next);
    };

    apply();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (theme === 'system') mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);

  const setTheme = (t: Theme) => {
    localStorage.setItem('theme', t);
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
