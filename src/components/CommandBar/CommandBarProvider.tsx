import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface CommandBarContextType {
  isOpen: boolean;
  open: (prefill?: string) => void;
  close: () => void;
  toggle: () => void;
  sessionId: string | null;
  prefill: string;
}

const CommandBarContext = createContext<CommandBarContextType | undefined>(undefined);

export const CommandBarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [prefill, setPrefill] = useState('');

  useEffect(() => {
    const createSession = async () => {
      try {
        const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiBase}/api/claude/session/new`);
        const data = await response.json();
        setSessionId(data.session_id);
      } catch {
        setSessionId(Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9));
      }
    };
    createSession();
  }, []);

  const open = useCallback((prefillText?: string) => {
    setPrefill(prefillText || '');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setPrefill('');
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <CommandBarContext.Provider value={{ isOpen, open, close, toggle, sessionId, prefill }}>
      {children}
    </CommandBarContext.Provider>
  );
};

export const useCommandBar = (): CommandBarContextType => {
  const context = useContext(CommandBarContext);
  if (context === undefined) {
    throw new Error('useCommandBar must be used within a CommandBarProvider');
  }
  return context;
};
