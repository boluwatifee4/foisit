import { Injectable, Inject } from '@angular/core';
import {
  CommandHandler,
  FallbackHandler,
  VoiceProcessor,
  StateManager,
  AssistantConfig,
  TextToSpeech,
} from '@foisit/core';

@Injectable({
  providedIn: 'root',
})
export class AssistantService {
  private commandHandler: CommandHandler;
  private fallbackHandler: FallbackHandler;
  private voiceProcessor: VoiceProcessor;
  private textToSpeech: TextToSpeech;
  private stateManager: StateManager;

  constructor(@Inject('ASSISTANT_CONFIG') private config: AssistantConfig) {
    // Initialize core components
    this.commandHandler = new CommandHandler();
    this.fallbackHandler = new FallbackHandler();
    this.voiceProcessor = new VoiceProcessor();
    this.textToSpeech = new TextToSpeech();
    this.stateManager = new StateManager();

    // Setup commands from config
    this.config.commands.forEach((cmd) => this.commandHandler.addCommand(cmd.command, cmd.action));

    // Setup fallback response
    if (this.config.fallbackResponse) {
      this.fallbackHandler.setFallbackMessage(this.config.fallbackResponse);
    }
  }

  startListening(): void {
    this.stateManager.setState('listening');
    this.voiceProcessor.startListening((transcript: string) => {
      const commandExecuted = this.commandHandler.executeCommand(transcript);

      if (!commandExecuted) {
        this.fallbackHandler.handleFallback(transcript);
      }

      this.stateManager.setState('idle');
    });
  }

  stopListening(): void {
    this.voiceProcessor.stopListening();
    this.stateManager.setState('idle');
  }

  addCommand(command: string, action: () => void): void {
    this.commandHandler.addCommand(command, action);
  }

  removeCommand(command: string): void {
    this.commandHandler.removeCommand(command);
  }

  getState(): string {
    return this.stateManager.getState();
  }

  speak(text: string): void {
    this.textToSpeech.speak(text);
  }
}
