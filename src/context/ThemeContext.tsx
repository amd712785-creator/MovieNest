import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppPreferences, getStoredPreferences } from '../services/preferences';

interface ThemeContextType {
  prefs: AppPreferences;
  updateTheme: (newPrefs: Partial<AppPreferences>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<AppPreferences>(getStoredPreferences());

  useEffect(() => {
    const applyTheme = () => {
      const root = window.document.documentElement;
      let mode = prefs.themeMode;
      
      if (mode === 'system') {
        mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      root.classList.remove('dark', 'light');
      root.classList.add(mode);
      root.setAttribute('data-theme', mode);
      root.setAttribute('data-accent', prefs.themeColor);
    };

    applyTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
        if (prefs.themeMode === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    
    return () => mediaQuery.removeEventListener('change', listener);
  }, [prefs.themeMode, prefs.themeColor]);

  const updateTheme = (newPrefs: Partial<AppPreferences>) => {
    import('../services/preferences').then(({ saveLocalPreferences }) => {
      const updated = saveLocalPreferences(newPrefs);
      setPrefs(updated);
    });
  };

  return (
    <ThemeContext.Provider value={{ prefs, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
