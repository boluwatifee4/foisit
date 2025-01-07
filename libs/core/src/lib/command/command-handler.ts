export class CommandHandler {
  private commands = new Map<string, () => void>();

  addCommand(command: string, action: () => void): void {
    if (this.commands.has(command)) {
      throw new Error(`Command "${command}" already exists.`);
    }
    this.commands.set(command, action);
  }

  removeCommand(command: string): void {
    if (!this.commands.has(command)) {
      throw new Error(`Command "${command}" does not exist.`);
    }
    this.commands.delete(command);
  }

  executeCommand(input: string): boolean {
    const action = this.commands.get(input);
    if (action) {
      action();
      return true;
    }
    return false;
  }

  listCommands(): string[] {
    // todos: return this.commands.keys();

    return Array.from(this.commands.keys());
  }
}
