'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'crewzen' | 'prozen' | 'accesszen' | 'connectzen';

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode, shouldNavigate?: boolean) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, _setMode] = useState<Mode>('crewzen');
  const router = useRouter();

  const setMode = (newMode: Mode, shouldNavigate: boolean = false) => {
    _setMode(newMode);
    if (shouldNavigate) {
      if (newMode === 'crewzen') {
        router.push('/');
      } else if (newMode === 'prozen') {
        router.push('/prozen');
      } else if (newMode === 'accesszen') {
        router.push('/accesszen');
      } else if (newMode === 'connectzen') {
        router.push('/connectzen');
      }
    }
  };

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
