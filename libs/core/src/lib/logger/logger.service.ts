export class LoggerService {
  log(commandName: string): void {
    console.log(`[LOG] Command executed: "${commandName}" at ${new Date().toISOString()}`);
  }
}
