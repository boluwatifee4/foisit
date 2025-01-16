import { useContext } from 'react';
import { AssistantService } from '../services/AssistantService';
import { AssistantContext } from '../components/AssistantProvider';

export const useAssistant = (): AssistantService => {
  const assistant = useContext(AssistantContext);
  console.log('assistant', assistant);
  if (!assistant) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return assistant;
};
