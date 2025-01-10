import { useEffect, useState } from 'react';
import { StateManager } from '@foisit/core';

export const useAssistantState = (stateManager: StateManager) => {
  const [state, setState] = useState(stateManager.getState());

  useEffect(() => {
    const callback = (newState: "idle" | "listening" | "processing") => {
      setState(newState);
    };

    stateManager.subscribe(callback);

    return () => {
      // Unsubscribe on unmount
      stateManager.subscribe(() => {
        //
      });
    };
  }, [stateManager]);

  return state;
};
