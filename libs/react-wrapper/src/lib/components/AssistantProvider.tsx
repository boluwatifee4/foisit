import React, { createContext, useEffect, useState } from 'react';
import { AssistantConfig } from '@foisit/core';
import { AssistantService } from '../services/AssistantService';

export const AssistantContext = createContext<AssistantService | null>(null);

// Global singleton for AssistantService
let globalAssistantService: AssistantService | null = null;

export const AssistantProvider: React.FC<{
  config: AssistantConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const [assistantService, setAssistantService] =
    useState<AssistantService | null>(null);
  const [isReady, setIsReady] = useState(false); // Track loading state

  useEffect(() => {
    if (!globalAssistantService) {
      console.log('Initializing global AssistantService...');
      globalAssistantService = new AssistantService(config);
    } else {
      console.warn(
        'Multiple AssistantProvider instances detected. Reusing global AssistantService.'
      );
    }

    // Set state and start listening
    const instance = globalAssistantService;
    setAssistantService(instance);
    // Voice is currently disabled (text-only mode)
    // instance.startListening();

    // Set ready state
    setIsReady(true);

    return () => {
      console.log('Cleaning up AssistantService...');
      instance.destroy?.(); // Calls destroy() in AssistantService which calls overlayManager.destroy()
      globalAssistantService = null; // Cleanup the global reference
    };
  }, [config]);

  // Render a fallback until the provider is ready
  if (!isReady || !assistantService) {
    return <div>Loading Assistant...</div>;
  }

  return (
    <AssistantContext.Provider value={assistantService}>
      {children}
    </AssistantContext.Provider>
  );
};
