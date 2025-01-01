export interface AssistantCommand {
  command: string;        // Command trigger phrase
  description?: string;   // Optional description
  action: () => void;     // Action to execute
}
