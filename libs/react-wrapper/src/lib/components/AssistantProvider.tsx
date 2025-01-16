import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AssistantConfig } from '@foisit/core';
import { AssistantService } from '../services/AssistantService';

export const AssistantContext = createContext<AssistantService | null>(null);

export const AssistantProvider: React.FC<{ config: AssistantConfig; children: React.ReactNode }> = ({ config, children }) => {
  const assistantServiceRef = useRef<AssistantService | null>(null);
  const [isReady, setIsReady] = useState(false); // Track loading state

  useEffect(() => {
    // Initialize AssistantService
    assistantServiceRef.current = new AssistantService(config);
    assistantServiceRef.current.startListening();

    // Set ready state
    setIsReady(true);

    return () => {
      // Cleanup on unmount
      assistantServiceRef.current?.stopListening();
    };
  }, [config]);

  // Render a fallback until the provider is ready
  if (!isReady) {
    return <div>Loading Assistant...</div>;
  }

  return (
    <AssistantContext.Provider value={assistantServiceRef.current}>
      {children}
    </AssistantContext.Provider>
  );
};
