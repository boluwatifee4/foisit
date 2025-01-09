export class CommandHandler {
  private commands = new Map<string, () => void>();

  /** Add a new command */
  addCommand(command: string, action: () => void): void {
    if (this.commands.has(command)) {
      throw new Error(`Command "${command}" already exists.`);
    }
    console.log(`Adding command: ${command}`);
    this.commands.set(command, action);
  }

  /** Remove an existing command */
  removeCommand(command: string): void {
    if (!this.commands.has(command)) {
      throw new Error(`Command "${command}" does not exist.`);
    }
    console.log(`Removing command: ${command}`);
    this.commands.delete(command);
  }

  /** Execute a command by matching input */
  executeCommand(input: string): boolean {
    console.log(`Attempting to execute command: ${input}`);
    const action = this.commands.get(input);
    if (action) {
      action();
      console.log(`Command "${input}" executed successfully.`);
      return true;
    }
    console.log(`Command "${input}" not recognized.`);
    return false;
  }

  /** List all registered commands */
  listCommands(): string[] {
    return Array.from(this.commands.keys());
  }
}
