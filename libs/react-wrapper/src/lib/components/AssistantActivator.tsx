import React from 'react';
import { useAssistant } from '../hooks/useAssistant';

interface AssistantActivatorProps {
  label?: string; // Optional label for the activator button
  onActivate?: () => void; // Callback for when activation is triggered
}

export const AssistantActivator: React.FC<AssistantActivatorProps> = ({
  label = 'Activate Assistant',
  onActivate,
}) => {
  const assistant = useAssistant();

  const handleActivation = () => {
    if (onActivate) {
      onActivate();
    }
    assistant.reactivate(); // Reactivate the assistant manually
  };

  return (
    <button onClick={handleActivation} className="assistant-activator">
      {label}
    </button>
  );
};
