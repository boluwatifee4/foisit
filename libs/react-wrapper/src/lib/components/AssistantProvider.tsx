import React, { createContext, useContext, useEffect, useRef } from 'react';
import { AssistantConfig } from '@foisit/core';
import { AssistantService } from '../services/AssistantService';

export const AssistantContext = createContext<AssistantService | null>(null);

export const AssistantProvider: React.FC<{ config: AssistantConfig; children: React.ReactNode }> = ({ config, children }) => {
  const assistantServiceRef = useRef<AssistantService | null>(null);

  useEffect(() => {
    assistantServiceRef.current = new AssistantService(config);
    assistantServiceRef.current.startListening();

    return () => {
      assistantServiceRef.current?.stopListening();
    };
  }, [config]);

  return (
    <AssistantContext.Provider value={assistantServiceRef.current}>
      {children}
    </AssistantContext.Provider>
  );
};

// export const useAssistant = (): AssistantService => {
//   const context = useContext(AssistantContext);
//   if (!context) {
//     throw new Error('useAssistant must be used within an AssistantProvider');
//   }
//   return context;
// };
