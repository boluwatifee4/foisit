import { inject } from 'vue';
import { AssistantService } from '../services/AssistantService';

export const useAssistant = (): AssistantService => {
  const assistant = inject<AssistantService>('assistantService');
  if (!assistant) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return assistant;
};
