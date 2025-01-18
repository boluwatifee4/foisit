import {
  CommandHandler,
  FallbackHandler,
  VoiceProcessor,
  StateManager,
  AssistantConfig,
  TextToSpeech,
  GestureHandler,
} from '@foisit/core';

export class AssistantService {
  private commandHandler: CommandHandler;
  private fallbackHandler: FallbackHandler;
  private voiceProcessor: VoiceProcessor;
  private textToSpeech: TextToSpeech;
  private stateManager: StateManager;
  private gestureHandler: GestureHandler;
  private isActivated = false;
  private lastProcessedInput = '';
  private processingLock = false;

  constructor(private config: AssistantConfig) {
    this.commandHandler = new CommandHandler();
    this.fallbackHandler = new FallbackHandler();
    this.voiceProcessor = new VoiceProcessor();
    this.textToSpeech = new TextToSpeech();
    this.stateManager = new StateManager();
    this.gestureHandler = new GestureHandler();

    // Add configured commands
    this.config.commands.forEach((cmd) => this.commandHandler.addCommand(cmd.command, cmd.action));

    // Set fallback response
    if (this.config.fallbackResponse) {
      this.fallbackHandler.setFallbackMessage(this.config.fallbackResponse);
    }

    // Start listening initially
    this.startListening();

    // Setup double-tap/double-click listener
    this.gestureHandler.setupDoubleTapListener(() => this.toggleAssistantState());
  }

  /** Start listening for activation and commands */
  startListening(): void {
    console.log('AssistantService: Starting listening...');
    this.stateManager.setState('listening');
    this.voiceProcessor.startListening(async (transcript: string) => {
      if (this.processingLock) return;

      const normalizedTranscript = transcript.toLowerCase().trim();

      // Skip repeated or irrelevant inputs
      if (
        !normalizedTranscript ||
        normalizedTranscript.length < 3 ||
        normalizedTranscript === this.lastProcessedInput
      ) {
        console.log('AssistantService: Ignoring irrelevant input.');
        return;
      }

      this.lastProcessedInput = normalizedTranscript;

      if (!this.isActivated) {
        await this.processActivation(normalizedTranscript);
      } else {
        await this.handleCommand(normalizedTranscript);
      }

      // Throttle input processing to prevent rapid feedback
      this.processingLock = true;
      setTimeout(() => (this.processingLock = false), 1000);
    });
  }

  /** Stop listening */
  stopListening(): void {
    console.log('AssistantService: Stopping listening...');
    this.voiceProcessor.stopListening();
    this.isActivated = false;
    this.stateManager.setState('idle');
  }

  /** Process activation command */
  private async processActivation(transcript: string): Promise<void> {
    if (transcript === this.config.activationCommand.toLowerCase()) {
      console.log('AssistantService: Activation matched.');
      this.isActivated = true;
      this.textToSpeech.speak(this.config.introMessage || 'How can I assist you?');
      this.stateManager.setState('listening');
    } else {
      console.log('AssistantService: Activation command not recognized.');
    }
  }

  /** Handle recognized commands */
  private async handleCommand(transcript: string): Promise<void> {
    const commandExecuted = await this.commandHandler.executeCommand(transcript);
    if (!commandExecuted) {
      console.log('AssistantService: Command not recognized.');
      this.fallbackHandler.handleFallback(transcript);
    }
  }

  /** Add a command dynamically */
  addCommand(command: string, action: () => void): void {
    console.log(`AssistantService: Adding command "${command}".`);
    this.commandHandler.addCommand(command, action);
  }

  /** Remove a command dynamically */
  removeCommand(command: string): void {
    console.log(`AssistantService: Removing command "${command}".`);
    this.commandHandler.removeCommand(command);
  }

  private toggleAssistantState(): void {
    if (this.isActivated) {
      console.log('AssistantService: Stopping assistant on double-tap/click...');
      this.stopListening();
    } else {
      console.log('AssistantService: Reactivating assistant on double-tap/click...');
      this.startListening();
    }
  }
}
