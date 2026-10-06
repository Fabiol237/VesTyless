'use client';

/**
 * VesTyle V1 — ThemeContext
 * Gestion globale du thème clair/sombre avec application sur <html> et <body>
 * afin que les variables CSS et classes couvrent toutes les pages automatiquement.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
});

/** Applique ou retire la classe 'theme-light' / 'theme-dark' sur <html> et <body> */
function applyThemeClass(t: Theme) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (t === 'light') {
    html.classList.add('theme-light');
    html.classList.remove('theme-dark');
    html.setAttribute('data-theme', 'light');
    if (document.body) {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
      document.body.setAttribute('data-theme', 'light');
    }
  } else {
    html.classList.remove('theme-light');
    html.classList.add('theme-dark');
    html.setAttribute('data-theme', 'dark');
    if (document.body) {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      document.body.setAttribute('data-theme', 'dark');
    }
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Lire le thème persisté
    const stored = localStorage.getItem('vestyle-theme') as Theme | null;
    const initial: Theme = (stored === 'light' || stored === 'dark') ? stored : 'dark';
    setThemeState(initial);
    applyThemeClass(initial);
    setMounted(true);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('vestyle-theme', t);
    applyThemeClass(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
