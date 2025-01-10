import {
  CommandHandler,
  FallbackHandler,
  VoiceProcessor,
  StateManager,
  AssistantConfig,
  TextToSpeech,
} from '@foisit/core';

export class AssistantService {
  private commandHandler: CommandHandler;
  private fallbackHandler: FallbackHandler;
  private voiceProcessor: VoiceProcessor;
  private textToSpeech: TextToSpeech;
  private stateManager: StateManager;
  private idleTimeoutId: any;
  private isActivated = false;

  constructor(private config: AssistantConfig) {
    this.commandHandler = new CommandHandler();
    this.fallbackHandler = new FallbackHandler();
    this.voiceProcessor = new VoiceProcessor();
    this.textToSpeech = new TextToSpeech();
    this.stateManager = new StateManager();

    // Setup commands from config
    this.config.commands.forEach((cmd) =>
      this.commandHandler.addCommand(cmd.command, cmd.action)
    );

    // Setup fallback response
    if (this.config.fallbackResponse) {
      this.fallbackHandler.setFallbackMessage(this.config.fallbackResponse);
    }

    // Setup reactivation listeners
    this.setupReactivationListeners();
  }

  /** Start listening for activation commands */
  startListening(): void {
    console.log('Assistant is now listening for activation...');
    this.stateManager.setState('listening');
    this.voiceProcessor.startListening((transcript: string) => {
      const normalizedTranscript = transcript.toLowerCase();

      if (!this.isActivated && normalizedTranscript === this.config.activationCommand.toLowerCase()) {
        console.log('Activation command matched.');
        this.isActivated = true;
        this.textToSpeech.speak(this.config.introMessage || 'How can I assist you?');
      } else if (!this.isActivated) {
        console.log('Activation command not recognized.');
      }
      if (this.isActivated) {
        this.listenForCommands(normalizedTranscript);
      }
    });

    this.startIdleTimeout();
  }

  /** Listen for commands after activation */
  private listenForCommands(normalizedTranscript: string): void {
    console.log('Processing command:', normalizedTranscript);
    const commandExecuted = this.commandHandler.executeCommand(normalizedTranscript);

    if (!commandExecuted) {
      console.log('Command not recognized. Triggering fallback...');
      this.handleFallback(normalizedTranscript);
    } else {
      console.log(`Command "${normalizedTranscript}" executed successfully.`);
    }
  }

  /** Stop listening and go idle */
  stopListening(): void {
    console.log('Assistant is now idle.');
    this.isActivated = false;
    this.voiceProcessor.stopListening();
    this.stateManager.setState('idle');
  }

  /** Reactivate the assistant manually */
  reactivate(): void {
    console.log('Assistant reactivated.');
    this.clearIdleTimeout(); // Clear any existing idle timeout
    this.startListening(); // Restart listening for activation or commands
  }

  /** Handle fallback responses */
  private handleFallback(input: string): void {
    this.fallbackHandler.handleFallback(input);
  }

  /** Setup reactivation listeners */
  private setupReactivationListeners(): void {
    const reactivationHandler = () => {
      if (this.stateManager.getState() === 'idle') {
        this.reactivate();
      }
    };

    document.addEventListener('dblclick', reactivationHandler);

    let lastTap = 0;
    document.addEventListener('touchend', (event) => {
      const currentTime = new Date().getTime();
      const tapInterval = currentTime - lastTap;
      if (tapInterval < 300 && tapInterval > 0) {
        reactivationHandler();
      }
      lastTap = currentTime;
    });
  }

  /** Start the idle timeout */
  private startIdleTimeout(): void {
    this.clearIdleTimeout();
    this.idleTimeoutId = setTimeout(() => {
      this.stopListening();
    }, 2 * 60 * 1000); // 2 minutes
  }

  /** Clear the idle timeout */
  private clearIdleTimeout(): void {
    if (this.idleTimeoutId) {
      clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = null;
    }
  }

  /** Add commands dynamically */
  addCommand(command: string, action: () => void): void {
    this.commandHandler.addCommand(command, action);
  }

  /** Remove commands dynamically */
  removeCommand(command: string): void {
    this.commandHandler.removeCommand(command);
  }
}
