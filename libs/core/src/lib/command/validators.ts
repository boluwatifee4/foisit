import { AssistantCommand } from '../interfaces/assistant-command.interface';

export function validateCommand(command: AssistantCommand): boolean {
  if (!command.command || typeof command.action !== 'function') {
    console.error('Invalid command');
    return false;
  }
  return true;
}
