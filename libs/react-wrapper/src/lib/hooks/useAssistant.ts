import { useContext } from 'react';
import { AssistantService } from '../services/AssistantService';
import { AssistantContext } from '../components/AssistantProvider';

export const useAssistant = (): AssistantService => {
  const assistant = useContext(AssistantContext);
  if (!assistant) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return assistant;
};
