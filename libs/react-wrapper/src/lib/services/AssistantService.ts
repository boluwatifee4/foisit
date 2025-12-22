import {
  CommandHandler,
  FallbackHandler,
  VoiceProcessor,
  StateManager,
  AssistantConfig,
  TextToSpeech,
  GestureHandler,
  OverlayManager,
  AssistantCommand,
} from '@foisit/core';

export class AssistantService {
  private commandHandler: CommandHandler;
  private fallbackHandler: FallbackHandler;
  private voiceProcessor: VoiceProcessor;
  private textToSpeech: TextToSpeech;
  private stateManager: StateManager;
  private isActivated = false;
  private lastProcessedInput = '';
  private processingLock = false;
  private gestureHandler: GestureHandler;
  private overlayManager: OverlayManager;
  private defaultIntroMessage = 'How can I help you?';

  constructor(private config: AssistantConfig) {
    // Pass enableSmartIntent (default true) and potential apiKey (if we add it to config later)
    this.commandHandler = new CommandHandler(
      this.config.enableSmartIntent !== false
    );
    this.fallbackHandler = new FallbackHandler();
    this.voiceProcessor = new VoiceProcessor();
    this.textToSpeech = new TextToSpeech();
    this.stateManager = new StateManager();
    this.gestureHandler = new GestureHandler();
    this.overlayManager = new OverlayManager();

    // Add configured commands
    this.config.commands.forEach((cmd) => this.commandHandler.addCommand(cmd));

    // Set fallback response
    if (this.config.fallbackResponse) {
      this.fallbackHandler.setFallbackMessage(this.config.fallbackResponse);
    }

    // Start listening initially
    // this.startListening();

    // Setup double-tap/double-click listener
    this.gestureHandler.setupDoubleTapListener(() =>
      this.toggleAssistantState()
    );
  }

  /** Start listening for activation and commands */
  startListening(): void {
    console.log('AssistantService: Starting listening...');
    // this.stateManager.setState('listening'); // DISABLED - no gradient animation
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
        return;
      }

      const isFallbackOrIntroMessage =
        normalizedTranscript === this.config.fallbackResponse?.toLowerCase() ||
        normalizedTranscript === this.config.introMessage?.toLowerCase() ||
        normalizedTranscript === this.defaultIntroMessage.toLowerCase();

      if (!isFallbackOrIntroMessage) {
        await this.handleCommand(normalizedTranscript);
      } else {
        console.log('AssistantService: Ignoring fallback or intro message.');
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
    // this.stateManager.setState('idle'); // DISABLED - no gradient animation
  }

  /** Process activation command */
  private async processActivation(transcript: string): Promise<void> {
    const activationCmd = this.config.activationCommand?.toLowerCase();

    // If no activation command is set, we can't activate via voice
    if (!activationCmd) return;

    if (transcript === activationCmd) {
      console.log('AssistantService: Activation matched.');
      this.isActivated = true;
      this.textToSpeech.speak(
        this.config.introMessage || this.defaultIntroMessage
      );
      // this.stateManager.setState('listening'); // DISABLED - no gradient animation
    } else {
      console.log('AssistantService: Activation command not recognized.');
    }
  }

  /** Handle recognized commands */
  private async handleCommand(transcript: string): Promise<void> {
    this.overlayManager.showLoading();
    const response = await this.commandHandler.executeCommand(transcript);
    this.overlayManager.hideLoading();

    // Add AI/System response bubble
    if (response.message) {
      this.overlayManager.addMessage(response.message, 'system');
    }

    if (response.type === 'ambiguous' && response.options) {
      this.overlayManager.addOptions(response.options);
    } else if (response.type === 'error') {
      this.fallbackHandler.handleFallback(transcript);
    }
  }

  /** Add a command dynamically (supports string or rich object) */
  addCommand(
    commandOrObj: string | AssistantCommand,
    action?: () => void
  ): void {
    if (typeof commandOrObj === 'string') {
      console.log(`AssistantService: Adding command "${commandOrObj}".`);
    } else {
      console.log(
        `AssistantService: Adding rich command "${commandOrObj.command}".`
      );
    }
    this.commandHandler.addCommand(commandOrObj, action);
  }

  /** Remove a command dynamically */
  removeCommand(command: string): void {
    console.log(`AssistantService: Removing command "${command}".`);
    this.commandHandler.removeCommand(command);
  }

  /** Get all registered commands */
  getCommands(): string[] {
    return this.commandHandler.getCommands();
  }

  private toggleAssistantState(): void {
    console.log('AssistantService: Toggling overlay...');
    this.overlayManager.toggle(
      async (text) => {
        await this.handleCommand(text);
        // Don't close overlay - let user close it manually or on success
      },
      () => console.log('AssistantService: Overlay closed.')
    );
  }
}
