import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export type AppMode = 'work' | 'eat';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isWorkMode: boolean;
  isEatMode: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export function AppModeProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [mode, setModeState] = useState<AppMode>(() => {
    const saved = localStorage.getItem('maxout_app_mode');
    return (saved === 'work' || saved === 'eat') ? saved : 'work';
  });

  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem('maxout_app_mode', newMode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isWorkMode = mode === 'work';
  const isEatMode = mode === 'eat';

  // Sync mode with URL path
  useEffect(() => {
    const dietPaths = ['/diet', '/meals', '/water', '/diet-stats', '/weight'];
    const isDietPath = dietPaths.some(path => location.pathname === path || location.pathname.startsWith(path + '/'));
    
    if (isDietPath && mode !== 'eat') {
      setModeState('eat');
      localStorage.setItem('maxout_app_mode', 'eat');
    } else if (!isDietPath && mode !== 'work' && location.pathname !== '/login') {
      // Logic for work mode routes (Dashboard, Stats, etc.)
      const workPaths = ['/', '/stats', '/routines', '/session', '/settings', '/achievements', '/workout'];
      const isWorkPath = workPaths.some(path => location.pathname === path || location.pathname.startsWith(path + '/'));
      
      if (isWorkPath) {
        setModeState('work');
        localStorage.setItem('maxout_app_mode', 'work');
      }
    }
  }, [location.pathname, mode]);

  // Apply root class for CSS theming
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode, isWorkMode, isEatMode }), [mode, setMode, isWorkMode, isEatMode]);

  return (
    <AppModeContext.Provider value={value}>
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
