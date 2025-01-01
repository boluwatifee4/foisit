import { AssistantCommand } from "./assistant-command.interface";

export interface AssistantConfig {
  activationCommand: string;   // The phrase to activate the assistant
  fallbackResponse?: string;   // Default response for unrecognized inputs
  commands: AssistantCommand[]; // List of predefined commands
}
