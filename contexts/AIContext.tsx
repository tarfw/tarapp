import React, { createContext, useContext, useState, ReactNode } from 'react';

type AIContextType = {
  selectedAgent: string;
  setSelectedAgent: (agent: string) => void;
};

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [selectedAgent, setSelectedAgent] = useState('Space');

  return (
    <AIContext.Provider value={{ selectedAgent, setSelectedAgent }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}