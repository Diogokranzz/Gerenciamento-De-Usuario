import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  animations: boolean;
  toggleAnimations: () => void;
  compactMode: boolean;
  toggleCompactMode: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  updateThemeSetting: (setting: string, value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [animations, setAnimations] = useState<boolean>(true);
  const [compactMode, setCompactMode] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  useEffect(() => {
    // Carregar configurações salvas do localStorage (se disponíveis)
    const savedSettings = localStorage.getItem('themeSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDarkMode(settings.darkMode || false);
      setAnimations(settings.animations || true);
      setCompactMode(settings.compactMode || false);
      setHighContrast(settings.highContrast || false);
    }
  }, []);

  useEffect(() => {
    // Aplicar classes ao documento baseado nas configurações
    const documentElement = document.documentElement;
    
    if (darkMode) {
      documentElement.classList.add('dark');
      documentElement.style.setProperty('--theme-appearance', 'dark');
    } else {
      documentElement.classList.remove('dark');
      documentElement.style.setProperty('--theme-appearance', 'light');
    }
    
    if (compactMode) {
      documentElement.classList.add('compact-mode');
    } else {
      documentElement.classList.remove('compact-mode');
    }
    
    if (highContrast) {
      documentElement.classList.add('high-contrast');
    } else {
      documentElement.classList.remove('high-contrast');
    }
    
    if (!animations) {
      documentElement.classList.add('no-animations');
    } else {
      documentElement.classList.remove('no-animations');
    }

    // Salvar configurações no localStorage
    localStorage.setItem('themeSettings', JSON.stringify({
      darkMode,
      animations,
      compactMode,
      highContrast,
    }));
  }, [darkMode, animations, compactMode, highContrast]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const toggleAnimations = () => setAnimations(prev => !prev);
  const toggleCompactMode = () => setCompactMode(prev => !prev);
  const toggleHighContrast = () => setHighContrast(prev => !prev);

  const updateThemeSetting = (setting: string, value: boolean) => {
    switch (setting) {
      case 'darkMode':
        setDarkMode(value);
        break;
      case 'animations':
        setAnimations(value);
        break;
      case 'compactMode':
        setCompactMode(value);
        break;
      case 'highContrast':
        setHighContrast(value);
        break;
      default:
        break;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        animations,
        toggleAnimations,
        compactMode,
        toggleCompactMode,
        highContrast,
        toggleHighContrast,
        updateThemeSetting,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}