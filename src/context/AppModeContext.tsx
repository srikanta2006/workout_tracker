import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AppMode = 'work' | 'eat';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isWorkMode: boolean;
  isEatMode: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(() => {
    const saved = localStorage.getItem('maxout_app_mode');
    return (saved === 'work' || saved === 'eat') ? saved : 'work';
  });

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem('maxout_app_mode', newMode);
    
    // Smooth transition effect: scroll to top when switching modes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isWorkMode = mode === 'work';
  const isEatMode = mode === 'eat';

  // Apply a root class for CSS theming if needed
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
  }, [mode]);

  return (
    <AppModeContext.Provider value={{ mode, setMode, isWorkMode, isEatMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
}
