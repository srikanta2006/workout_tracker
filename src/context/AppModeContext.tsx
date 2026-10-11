import { createContext, useContext, useEffect, useCallback, useMemo, type ReactNode } from 'react';

export type AppMode = 'work' | 'eat';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isWorkMode: boolean;
  isEatMode: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export function AppModeProvider({ children }: { children: ReactNode }) {
  const mode: AppMode = 'work';
  const isWorkMode = true;
  const isEatMode = false;

  const setMode = useCallback((_newMode: AppMode) => {
    // Disabled for launch
  }, []);

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
