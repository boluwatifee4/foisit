import { AssistantCommand } from './assistant-command.interface';

export interface AssistantConfig {
  activationCommand?: string;
  fallbackResponse?: string;
  commands: AssistantCommand[];
  introMessage?: string;
  enableSmartIntent?: boolean;
  /** Override where intent resolution requests are sent (defaults to hosted proxy). */
  intentEndpoint?: string;
  inputPlaceholder?: string;
  enableGestureActivation?: boolean;
  floatingButton?: {
    visible?: boolean;
    tooltip?: string;
    customHtml?: string;
    position?: { bottom: string; right: string };
  };
}
